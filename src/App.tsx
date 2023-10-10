import { useCallback, useState } from "react";
import "./App.css";
import { Line } from "react-chartjs-2";
import { decodeEdf, getInputFileBuffer } from "./utils";

// SAMPLE SIZE / DURATION = 1/256 of seconds is my x axis

function App() {
  const [edf, setEdf] = useState();
  console.log(edf);

  const handleChangeFile = useCallback(
    async (event) => {
      const file = event.target.files[0];

      const buffer = await getInputFileBuffer(file);
      console.log(buffer);

      const decodedEdf = decodeEdf(buffer);

      setEdf(decodedEdf);
    },
    [setEdf]
  );

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
