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
  const [highlightedIndices, setHighlightedIndices] = useState(new Set());
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
  // Add and remove event listener for chart interaction
  useEffect(() => {
    const chartCanvas = chartRef.current?.chartInstance?.canvas;
    if (chartCanvas) {
      chartCanvas.addEventListener("click", handleAltClick);
    }

    return () => {
      if (chartCanvas) {
        chartCanvas.removeEventListener("click", handleAltClick);
      }
    };
  }, [chartRef]);

  const handleAltClick = (event) => {
    if (event.altKey && chartRef.current) {
      const activePoints = chartRef.current.getElementsAtEventForMode(
        event.nativeEvent,
        "nearest",
        { intersect: true },
        false
      );

      if (activePoints.length > 0) {
        const { datasetIndex, index } = activePoints[0];
        // Create a unique identifier for the point
        const pointId = `${datasetIndex}-${index}`;

        setHighlightedIndices((prev) => {
          const newIndices = new Set(prev);
          if (newIndices.has(pointId)) {
            newIndices.delete(pointId);
          } else {
            newIndices.add(pointId);
          }
          return newIndices;
        });
      }
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
      datasets: {
        line: {
          pointRadius: 0,
          cubicInterpolationMode: "monotone" as const,
          lineTension: 0.1,
          borderJoinStyle: "round" as const,
        },
        pointBackgroundColor: (context) => {
          const pointId = `${context.datasetIndex}-${context.dataIndex}`;
          return highlightedIndices.has(pointId) && "red";
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
  }, []);

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
