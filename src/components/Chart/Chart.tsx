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

  const numberOfSamples = edf?.getSignalNumberOfSamplesPerRecord(0); // those will be the same for every signal
  const recordDuration = edf?.getRecordDuration();
  const durationOneSample = numberOfSamples / recordDuration;
  const numberOfRecords = edf.getNumberOfRecords();

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

  const xData = [];
  // todo: use records array length instead 47360
  for (let i = 0; i < 47360; i++) {
    const fractions = i / durationOneSample; // 1/Xth second interval
    xData.push(fractions);
  }

  const data = {
    labels: xData,
    datasets: [
      {
        label: "Dataset 1",
        data: edf?.getPhysicalSignalConcatRecords(0, 0, numberOfRecords),
      },
      //   {
      //     label: "Dataset 2",
      //     data: edf?.getPhysicalSignalConcatRecords(1, 0, 1280),
      //   },
      //   {
      //     label: "Dataset 3",
      //     data: edf?.getPhysicalSignalConcatRecords(2, 0, 1280),
      //   },
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
