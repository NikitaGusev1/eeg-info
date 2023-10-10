import "./App.css";
import { Line } from "react-chartjs-2";

// SAMPLE SIZE / DURATION = 1/256 of seconds is my x axis

function App() {
  return (
    <div className="App">
      {edf ? (
        <Line options={options} data={data} />
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
