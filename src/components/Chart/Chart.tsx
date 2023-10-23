import { useMemo, useRef } from "react";
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
  const chartRef = useRef(null);

  const numberOfSamples = edf?.getSignalNumberOfSamplesPerRecord(0); // those will be the same for every signal
  const recordDuration = edf?.getRecordDuration();
  const durationOneSample = numberOfSamples / recordDuration;
  const numberOfRecords = edf.getNumberOfRecords();

  const handleResetZoom = () => {
    if (chartRef && chartRef.current) {
      chartRef.current.resetZoom();
    }
  };

  const options = useMemo(() => {
    return {
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
              return value + "s"; // Format the tick label with 's'
            },
          },
        },
      },
      plugins: {
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

  const data = {
    labels: xLabels,
    datasets: [
      {
        label: "Dataset 1",
        data: edf?.getPhysicalSignalConcatRecords(0, 0, numberOfRecords),
      },
      {
        label: "Dataset 2",
        data: edf?.getPhysicalSignalConcatRecords(1, 0, 1280),
      },
      {
        label: "Dataset 3",
        data: edf?.getPhysicalSignalConcatRecords(2, 0, 1280),
      },
    ],
  };

  return (
    <Container>
      <ResetButton onClick={handleResetZoom} variant="contained">
        Reset zoom
      </ResetButton>
      <Line options={options} data={data} ref={chartRef} />
    </Container>
  );
};

const Container = styled.div`
  width: ${window.innerWidth}px;
  height: ${window.innerHeight}px;
`;

const ResetButton = muiStyled(Button)({
  backgroundColor: "red",
});
