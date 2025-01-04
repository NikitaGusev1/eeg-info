import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Decimation,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import autocolors from "chartjs-plugin-autocolors";
import { Button, styled as muiStyled } from "@mui/material";
import styled from "styled-components";
import { ChartContext } from "../../contexts/ChartContext";
import api from "../../api/api";
import InfoIcon from "@mui/icons-material/Info";
import { InfoModal } from "../modals/InfoModal";

interface Props {
  edf: any;
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Decimation,
  Title,
  Tooltip,
  Legend,
  zoomPlugin,
  autocolors
);

export const Chart = ({ edf }: Props) => {
  const { selectedSignals } = useContext(ChartContext);
  const chartRef = useRef(null);

  const numberOfSamples = edf?.getSignalNumberOfSamplesPerRecord(0); // those will be the same for every signal
  const recordDuration = edf?.getRecordDuration();
  const durationOneSample = recordDuration / numberOfSamples;

  const numberOfRecords = edf?.getNumberOfRecords();
  const microVoltUnit = edf?.getSignalPhysicalUnit(0); // same for all signals
  const samplingFrequency = edf?.getSignalSamplingFrequency(0); // same for all signals
  const [highlightedPoints, setHighlightedPoints] = useState(new Set());
  console.log(highlightedPoints);

  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [currentData, setCurrentData] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, [edf, selectedSignals]);

  const getSignalLength = useCallback(() => {
    if (!selectedSignals.length) return 0;
    const signalIndex = selectedSignals[0];
    const signalData = edf.getPhysicalSignalConcatRecords(signalIndex, 0);
    return Array.from(signalData).length;
  }, [selectedSignals]);

  const createDataset = useCallback(
    (signals: any[], start: number, end: number) => {
      return signals.map((signalIndex: any, idx: string | number) => {
        const signalArray = signalArrays[idx]; // precomputed array

        const samplesPerRecord = signalArray.length / edf.getNumberOfRecords();
        const durationOneSample = edf.getRecordDuration() / samplesPerRecord;

        const startIndex = Math.max(0, start);
        const endIndex = Math.min(end, signalArray.length);

        const points = signalArray.slice(startIndex, endIndex).map((y, i) => {
          const globalIdx = startIndex + i;

          return {
            x: globalIdx * durationOneSample,
            y,
            globalIndex: globalIdx,
          };
        });

        return {
          label: edf.getSignalLabel(signalIndex) || `Signal ${signalIndex}`,
          data: points,
        };
      });
    },
    []
  );

  const loadInitialData = useCallback(() => {
    if (!edf || !selectedSignals.length) return;

    const initialPointCount = Math.floor(getSignalLength() * 0.03); // 3% of signal data
    const datasets = createDataset(selectedSignals, 0, initialPointCount);
    setCurrentData(datasets);
  }, [selectedSignals, getSignalLength, createDataset]);

  const signalArrays = useMemo(() => {
    return selectedSignals.map((signalIndex) => {
      const signalData = edf.getPhysicalSignalConcatRecords(signalIndex, 0);
      return Array.from(signalData); // Convert to an array
    });
  }, [edf, selectedSignals]);

  const handlePan = useCallback(
    (chart) => {
      const { min, max } = chart.scales.x;

      // Convert time range (min, max in seconds) to sample indices
      const samplesPerRecord =
        signalArrays[0].length / edf.getNumberOfRecords(); // Assume all signals have the same length
      const durationOneSample = edf.getRecordDuration() / samplesPerRecord;

      const startIndex = Math.floor(min / durationOneSample);
      const endIndex = Math.floor(max / durationOneSample);

      if (startIndex >= 0 && endIndex <= signalArrays[0].length) {
        const newData = createDataset(selectedSignals, startIndex, endIndex);
        setCurrentData(newData);
      }
    },
    [signalArrays, selectedSignals]
  );

  const handleResetZoom = useCallback(() => {
    if (chartRef && chartRef.current) {
      chartRef.current.resetZoom();
    }
  }, []);

  const handleChartOnClick = useCallback(
    (event, activeElements) => {
      if (activeElements.length === 0) return;
      if (event.native.altKey && event.native.button === 0) {
        const chart = chartRef.current;

        const datasetIndex = activeElements[0].datasetIndex;
        const dataIndex = activeElements[0].index;
        const point = chart.data.datasets[datasetIndex].data[dataIndex];
        const globalIndex = point.globalIndex;
        const pointKey = `${datasetIndex}-${globalIndex}`;
        setHighlightedPoints((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(pointKey)) newSet.delete(pointKey);
          else newSet.add(pointKey);
          return newSet;
        });

        chart.update("none");
      }
    },
    [setHighlightedPoints]
  );

  const options = useMemo(() => {
    return {
      responsive: true,
      parsing: false,
      maintainAspectRatio: false,
      interaction: {
        mode: "nearest",
        intersect: true,
      },
      onClick: handleChartOnClick,
      datasets: {
        line: {
          pointRadius: (context) => {
            const globalIndex = context.raw?.globalIndex;
            const pointKey = `${context.datasetIndex}-${globalIndex}`;

            return highlightedPoints.has(pointKey) ? 11 : 0;
          },
          cubicInterpolationMode: "monotone" as const,
          lineTension: 0.1,
          borderJoinStyle: "round" as const,
          pointHitRadius: 10,
        },
        pointBackgroundColor: (context) => {
          const globalIndex = context.raw?.globalIndex;
          const pointKey = `${context.datasetIndex}-${globalIndex}`;

          return highlightedPoints.has(pointKey) ? "red" : "blue";
        },
      },
      events: ["click"],
      animation: false,
      scales: {
        x: {
          type: "linear",
          ticks: {
            callback: function (value: number) {
              const minutes = Math.floor(value / 60); // Convert seconds to minutes
              const seconds = Math.floor(value % 60); // Get remaining seconds
              return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`; // Format as MM:SS
            },
          },
        },
        y: {
          // min: 500,
          ticks: {
            callback: function (value: number) {
              return `${value} ${microVoltUnit}`;
            },
          },
        },
      },
      plugins: {
        autocolors: {
          customize(context) {
            const colors = context.colors;

            const randomizeColor = () => {
              const letters = "0123456789ABCDEF";
              let color = "#";
              for (let i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
              }
              return color;
            };

            const calculateLuminance = (color) => {
              const rgb = parseInt(color.slice(1), 16);
              const r = (rgb >> 16) & 0xff;
              const g = (rgb >> 8) & 0xff;
              const b = (rgb >> 0) & 0xff;

              return 0.299 * r + 0.587 * g + 0.114 * b;
            };

            let randomColor;
            let luminanceDifference;
            do {
              randomColor = randomizeColor();
              luminanceDifference = Math.abs(
                calculateLuminance(colors.background) -
                  calculateLuminance(randomColor)
              );
            } while (luminanceDifference < 128);

            return {
              background: randomColor,
              border: randomColor,
            };
          },
        },
        decimation: {
          enabled: true,
          algorithm: "min-max",
        },
        tooltip: {
          events: [],
        },
        zoom: {
          zoom: {
            animation: {
              duration: 0,
            },
            speed: 1,
            wheel: {
              enabled: true,
            },
            mode: "x",
          },
          pan: {
            enabled: true,
            mode: "x",
            modifierKey: "shift",
            onPan: ({ chart }) => {
              handlePan(chart);
            },
          },
        },
      },
      spanGaps: true,
    };
  }, [highlightedPoints]);

  const data = useMemo(() => {
    const signalDatasets = selectedSignals.map((signalIndex) => {
      const signalData = edf.getPhysicalSignalConcatRecords(
        signalIndex,
        0,
        numberOfRecords
      );

      // Convert Float32Array to a standard array for compatibility
      const signalArray = Array.from(signalData);
      const length = signalArray.length;

      if (length === 0) {
        console.warn(`No data found for signal ${signalIndex}.`);
        return {
          label: edf.getSignalLabel(signalIndex) || `Signal ${signalIndex}`,
          data: [],
        };
      }

      const points = signalArray.map((y, i) => {
        const fractions = i / durationOneSample;
        return {
          x: fractions,
          y,
        };
      });

      return {
        label: edf.getSignalLabel(signalIndex) || `Signal ${signalIndex}`,
        data: points,
      };
    });

    return { datasets: signalDatasets };
  }, [selectedSignals, edf, numberOfRecords, durationOneSample]);

  const findPeaks = async () => {
    try {
      const datasets = data.datasets.map((dataset) => {
        return {
          signal: Array.from(dataset.data),
          samplingFrequency,
        };
      });

      const response = await api.post("http://localhost:3001/findPeaks", {
        data: datasets,
      });

      // console.log(response.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleInfoClick = () => {
    setInfoModalOpen(true);
  };

  return (
    <>
      <Container>
        <TopRightContainer>
          <button
            style={{ border: "none", background: "none" }}
            onClick={handleInfoClick}
          >
            <InfoIcon />
          </button>
        </TopRightContainer>
        <Line
          options={options}
          data={{ datasets: currentData }}
          ref={chartRef}
          updateMode="none"
        />
      </Container>
      <ResetButton onClick={handleResetZoom} variant="outlined">
        Reset zoom
      </ResetButton>
      <Button variant="outlined" onClick={findPeaks} style={{ marginLeft: 16 }}>
        Find peaks
      </Button>
      <InfoModal open={infoModalOpen} setInfoModalOpen={setInfoModalOpen} />
    </>
  );
};

const ResetButton = muiStyled(Button)({});

const Container = styled.div`
  position: relative;
  height: 75vh;
  width: 95vw;
`;

const TopRightContainer = styled.div`
  position: fixed;
  top: 300px;
  right: 0;
  padding: 16px;
`;
