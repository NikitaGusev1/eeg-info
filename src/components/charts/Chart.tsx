import React from "react";
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
import { Line } from "react-chartjs-2";
// import faker from "faker";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  interaction: {
    mode: "index" as const,
    intersect: true,
  },
  stacked: false,
  plugins: {
    title: {
      display: true,
      text: "Chart.js Line Chart - Multi Axis",
    },
  },
  scales: {
    y: {
      type: "linear" as const,
      display: true,
      position: "left" as const,
    },
    y1: {
      type: "linear" as const,
      display: true,
      position: "right" as const,
      grid: {
        drawOnChartArea: false,
      },
      x: {
        position: "left" as const,
        type: "linear" as const,
      },
    },
  },
};

// const data = {
//   labels,
//   datasets: [
//     {
//       label: "Dataset 1",
//       // data: labels.map(() => faker.datatype.number({ min: -1000, max: 1000 })),
//       data: edf?.readSingleChannel(0, 1, 5).slice(0, 50),
//       borderColor: "rgb(255, 99, 132)",
//       backgroundColor: "rgba(255, 99, 132, 0.5)",
//       yAxisID: "y",
//       xAxisID: "x",
//     },
//     {
//       label: "Dataset 2",
//       data: edf?.readSingleChannel(1, 1, 5).slice(0, 50),
//       // data: [1.5, 2.5, 3.4, 4.6].reverse(),
//       borderColor: "rgb(53, 162, 235)",
//       backgroundColor: "rgba(53, 162, 235, 0.5)",
//       yAxisID: "y1",
//     },
//   ],
// };

export const labels = [
  "00:01",
  "00:02",
  "00:03",
  "00:04",
  "00:05",
  "00:06",
  "00:07",
  "00:08",
];

// export const data = {
//   labels,
//   datasets: [
//     {
//       label: "Dataset 1",
//       data: labels.map(() => faker.datatype.number({ min: -1000, max: 1000 })),
//       borderColor: "rgb(255, 99, 132)",
//       backgroundColor: "rgba(255, 99, 132, 0.5)",
//       yAxisID: "y",
//     },
//     {
//       label: "Dataset 2",
//       data: labels.map(() => faker.datatype.number({ min: -1000, max: 1000 })),
//       borderColor: "rgb(53, 162, 235)",
//       backgroundColor: "rgba(53, 162, 235, 0.5)",
//       yAxisID: "y1",
//     },
//   ],
// };
