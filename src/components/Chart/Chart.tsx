import { useContext, useEffect, useMemo, useRef, useState } from "react";
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

  // Data state
  const [currentData, setCurrentData] = useState([]);

  // Load initial data when signals or EDF data change
  useEffect(() => {
    loadInitialData();
  }, [edf, selectedSignals]);

  // Load initial data and set it to the chart
  const loadInitialData = () => {
    if (!edf || !selectedSignals.length) return;

    const initialPointCount = Math.floor(getSignalLength() * 0.1); // 10% of signal data
    const datasets = createDataset(selectedSignals, 0, initialPointCount);
    setCurrentData(datasets);
  };

  // Utility to get the length of the first selected signal
  const getSignalLength = () => {
    if (!selectedSignals.length) return 0;
    const signalIndex = selectedSignals[0];
    const signalData = edf.getPhysicalSignalConcatRecords(signalIndex, 0);
    return Array.from(signalData).length;
  };

  const signalArrays = useMemo(() => {
    return selectedSignals.map((signalIndex) => {
      const signalData = edf.getPhysicalSignalConcatRecords(signalIndex, 0);
      return Array.from(signalData); // Convert to an array
    });
  }, [edf, selectedSignals]);

  const createDataset = (signals, start, end) => {
    return signals.map((signalIndex, idx) => {
      const signalArray = signalArrays[idx]; // Use precomputed array

      const samplesPerRecord = signalArray.length / edf.getNumberOfRecords();
      const durationOneSample = edf.getRecordDuration() / samplesPerRecord;

      const startIndex = Math.max(0, start);
      const endIndex = Math.min(end, signalArray.length);

      const points = signalArray.slice(startIndex, endIndex).map((y, i) => ({
        x: (start + i) * durationOneSample, // Time in seconds
        y,
      }));

      return {
        label: edf.getSignalLabel(signalIndex) || `Signal ${signalIndex}`,
        data: points,
      };
    });
  };

  const handlePan = (chart) => {
    const { min, max } = chart.scales.x;

    // Convert time range (min, max in seconds) to sample indices
    const samplesPerRecord = signalArrays[0].length / edf.getNumberOfRecords(); // Assume all signals have the same length
    const durationOneSample = edf.getRecordDuration() / samplesPerRecord;

    const startIndex = Math.floor(min / durationOneSample);
    const endIndex = Math.floor(max / durationOneSample);

    if (startIndex >= 0 && endIndex <= signalArrays[0].length) {
      const newData = createDataset(selectedSignals, startIndex, endIndex);
      setCurrentData(newData);
    }
  };

  const handleResetZoom = () => {
    if (chartRef && chartRef.current) {
      chartRef.current.resetZoom();
    }
  };

  const options = useMemo(() => {
    return {
      responsive: true,
      parsing: false,
      maintainAspectRatio: false,
      interaction: {
        mode: "nearest",
        intersect: true,
      },
      onClick: (event, activeElements) => {
        if (activeElements.length === 0) return;

        if (event.native.altKey && event.native.button === 0) {
          const datasetIndex = activeElements[0].datasetIndex;
          console.log(datasetIndex);

          const index = activeElements[0].index;

          // setHighlightedPoints((prev) => {
          //   const newSet = new Set(prev);
          //   const range = 3;
          //   const start = Math.max(0, index - range);
          //   const end = Math.min(
          //     chartRef.current.data.datasets[datasetIndex].data.length - 1,
          //     index + range
          //   );

          //   for (let i = start; i <= end; i++) {
          //     newSet.add(`${datasetIndex}-${i}`);
          //   }

          //   return newSet;
          // });
          setHighlightedPoints((prev) => {
            const newSet = new Set(prev);
            const pointKey = `${datasetIndex}-${index}`;

            if (newSet.has(pointKey)) {
              // If point is already highlighted, remove it (toggle off)
              newSet.delete(pointKey);
            } else {
              // If point is not highlighted, add it (toggle on)
              newSet.add(pointKey);
            }

            return newSet;
          });

          chartRef.current.update();
        }
      },
      datasets: {
        line: {
          pointRadius: (context) => {
            const pointKey = `${context.datasetIndex}-${context.dataIndex}`;
            return highlightedPoints.has(pointKey) ? 11 : 0;
          },
          cubicInterpolationMode: "monotone" as const,
          lineTension: 0.1,
          borderJoinStyle: "round" as const,
          pointHitRadius: 5,
        },
        pointBackgroundColor: (context) => {
          const pointKey = `${context.datasetIndex}-${context.dataIndex}`;
          return highlightedPoints.has(pointKey) ? "red" : "blue";
        },
      },
      events: ["click"],
      animation: false,
      scales: {
        x: {
          type: "linear",
          // min: 1000,
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
            limits: {
              // y: { min: 50, max: 100 },
              x: { min: 0, max: 100 },
            },
            animation: {
              duration: 0,
            },
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

  // const xLabels = useMemo(() => {
  //   const data = [];
  //   const length = edf?.getPhysicalSignalConcatRecords(
  //     0,
  //     0,
  //     numberOfRecords
  //   ).length;

  //   for (let i = 0; i < length; i++) {
  //     const fractions = i / durationOneSample; // 1/Xth second interval
  //     data.push(fractions);
  //   }
  //   return data;
  // }, [edf, durationOneSample]);

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
