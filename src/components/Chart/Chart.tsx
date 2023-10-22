import { useMemo, useRef } from "react";
import { Line } from "react-chartjs-2";
import styled from "styled-components";
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
  const containerRef = useRef();

  const options = useMemo(() => {
    const numberOfSamples = edf?.getSignalNumberOfSamplesPerRecord(0); // those will be the same for every signal
    const duration = edf?.getRecordDuration();
    const durationOneSample = numberOfSamples / duration;

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
          ticks: {
            callback: function () {
              return 1 / durationOneSample;
            },
            sampleSize: 1,
          },
        },
        y: {
          ticks: {
            sampleSize: 1,
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
  }, [edf]);

  const xData = [];
  // todo: use records array length instead 47360
  for (let i = 0; i < 47360; i++) {
    const timeInSeconds = i / 256; // 1/256th second interval
    xData.push(timeInSeconds.toFixed(3)); // Format as seconds with 3 decimal places
  }

  const data = {
    labels: xData,
    datasets: [
      {
        label: "Dataset 1",
        data: edf?.getPhysicalSignalConcatRecords(0, 0, 1280),
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
    <Container ref={containerRef}>
      <Line options={options} data={data} />
    </Container>
  );
};

const Container = styled.div`
  width: ${window.innerWidth}px;
  height: ${window.innerHeight}px;
`;
