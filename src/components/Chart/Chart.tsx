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
  const durationOneSample = numberOfSamples / recordDuration;
  const numberOfRecords = edf?.getNumberOfRecords();
  const microVoltUnit = edf?.getSignalPhysicalUnit(0); // same for all signals
  const samplingFrequency = edf?.getSignalSamplingFrequency(0); // same for all signals
  const [highlightedIndices, setHighlightedIndices] = useState(new Set());
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  console.log(highlightedIndices);

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
  }, [chartRef, highlightedIndices]);

  const handleAltClick = (event) => {
    if (event.altKey && chartRef.current) {
      console.log("clicked");
      const activePoints = chartRef.current.getElementsAtEventForMode(
        event.nativeEvent,
        "nearest",
        { intersect: true },
        false
      );

      if (activePoints.length > 0) {
        const firstPoint = activePoints[0];
        const datasetIndex = firstPoint.datasetIndex;
        const index = firstPoint.index;

        // Create a unique identifier for the point across all datasets
        const pointId = `${datasetIndex}-${index}`;

        if (highlightedIndices.has(pointId)) {
          highlightedIndices.delete(pointId);
        } else {
          highlightedIndices.add(pointId);
        }

        setHighlightedIndices(new Set(highlightedIndices));
        chartRef.current.update();
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
      maintainAspectRatio: false,
      datasets: {
        line: {
          pointRadius: 0,
          cubicInterpolationMode: "monotone" as const,
          lineTension: 0.1,
          borderJoinStyle: "round" as const,
        },
      },
      events: ["click"],
      animation: false,
      scales: {
        x: {
          type: "linear",
          ticks: {
            callback: function (value: number) {
              return value + "s";
            },
          },
        },
        y: {
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
        tooltip: {
          events: [],
        },
        zoom: {
          zoom: {
            wheel: {
              enabled: true,
            },
            mode: "xy",
          },
          pan: {
            enabled: true,
            mode: "xy",
            modifierKey: "shift",
          },
        },
      },
      spanGaps: true,
    };
  }, []);

  const xLabels = useMemo(() => {
    const data = [];
    const length = edf?.getPhysicalSignalConcatRecords(
      0,
      0,
      numberOfRecords
    ).length;

    for (let i = 0; i < length; i++) {
      const fractions = i / durationOneSample; // 1/Xth second interval
      data.push(fractions);
    }
    return data;
  }, [edf, durationOneSample]);

  const data = useMemo(() => {
    const datasets = selectedSignals.map((signalIndex) => ({
      label: edf?.getSignalLabel(signalIndex),
      data: edf?.getPhysicalSignalConcatRecords(
        signalIndex,
        0,
        numberOfRecords
      ),
    }));

    return {
      labels: xLabels,
      datasets,
    };
  }, [selectedSignals, edf, numberOfRecords, xLabels]);

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
        <Line options={options} data={data} ref={chartRef} />
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
