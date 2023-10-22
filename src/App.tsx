import { useCallback, useRef, useState } from "react";
import "./App.css";
import { Line } from "react-chartjs-2";
import { decodeEdf, getInputFileBuffer } from "./utils";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);

function App() {
  const [edf, setEdf] = useState();
  // console.log(edf);
  // getPhysicalSignalConcatRecords(index, recordStart, howMany)
  console.log(edf?.getPhysicalSignalConcatRecords(0, 0, 50));
  const containerRef = useRef();

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
    datasets: {
      line: {
        pointRadius: 0,
        cubicInterpolationMode: "monotone",
        lineTension: 0.1,
        borderJoinStyle: "round",
      },
    },
    events: [],
    animation: false,
    scales: {
      x: {
        ticks: {
          callback: function (value) {
            return 1 / 256; // todo: dynamic ticks based on SAMPLE SIZE / DURATION = 1/256 of seconds is my x axis
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
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "Dataset 2",
        data: edf?.getPhysicalSignalConcatRecords(1, 0, 1280),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
      {
        label: "Dataset 3",
        data: edf?.getPhysicalSignalConcatRecords(2, 0, 1280),
        borderColor: "rgb(82, 199, 36)",
        backgroundColor: "rgba(132, 235, 53, 0.5)",
      },
    ],
  };

  // const signalsArray = edf?.getPhysicalSignalConcatRecords(0, 0, 5);

  return (
    <div className="App">
      <form>
        <input
          type="file"
          // value={selectedFile}
          onChange={handleChangeFile}
        />
      </form>
      {edf && (
        <div
          ref={containerRef}
          style={{ width: window.innerWidth, height: window.innerHeight }}
        >
          <Line options={options} data={data} />
        </div>
      )}
    </div>
  );
}

export default App;
