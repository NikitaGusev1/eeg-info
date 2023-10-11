import { useCallback, useState } from "react";
import "./App.css";
import { Line } from "react-chartjs-2";
import { decodeEdf, getInputFileBuffer } from "./utils";
import { data, options } from "./components/charts/Chart";
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
// import faker from 'faker';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// SAMPLE SIZE / DURATION = 1/256 of seconds is my x axis
// Chartjs works but lags cause canvas. Try observable plot, read about tickformat

function App() {
  const [edf, setEdf] = useState();
  console.log(edf);
  // getPhysicalSignalConcatRecords(index, recordStart, howMany)
  console.log(edf?.getPhysicalSignalConcatRecords(0, 0, 1280)?.length);

  const handleChangeFile = useCallback(
    async (event) => {
      const file = event.target.files[0];

      const buffer = await getInputFileBuffer(file);
      const decodedEdf = decodeEdf(buffer);

      setEdf(decodedEdf);
    },
    [setEdf]
  );

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      // title: {
      //   display: true,
      //   text: "Chart.js Line Chart",
      // },
      scales: {
        x: {
          ticks: {
            callback: function (value) {
              return (1 / 256) * parseFloat(value).toFixed(3) + "s"; // Format the tick label
            },
          },
        },
      },
    },
  };

  const xData = [];
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
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      // {
      //   label: "Dataset 2",
      //   data: [20, 40, 60].reverse(),
      //   borderColor: "rgb(53, 162, 235)",
      //   backgroundColor: "rgba(53, 162, 235, 0.5)",
      // },
    ],
  };

  return (
    <div className="App">
      {edf ? (
        <div style={{ width: 5000, height: 4000 }}>
          <Line options={options} data={data} />
        </div>
      ) : (
        <form>
          <input
            type="file"
            // value={selectedFile}
            onChange={handleChangeFile}
          />
        </form>
      )}
    </div>
  );
}

export default App;
