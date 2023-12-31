import { useContext, useMemo, useRef } from "react";
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
  // TODO: look into colors, currently they are too similar
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
      events: [],
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

  console.log(Array.from(data.datasets[0].data));

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

  return (
    <>
      <Container>
        <Line options={options} data={data} ref={chartRef} />
      </Container>
      <ResetButton onClick={handleResetZoom} variant="contained">
        Reset zoom
      </ResetButton>
      <Button variant="outlined" onClick={findPeaks}>
        Find peaks
      </Button>
    </>
  );
};

const ResetButton = muiStyled(Button)({
  backgroundColor: "red",
});

const Container = styled.div`
  position: relative;
  height: 75vh;
  width: 95vw;
`;
