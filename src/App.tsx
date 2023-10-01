import { useState } from "react";
import "./App.css";
import { EDF, readUploadedFile } from "./utils";

function App() {
  const [edf, setEdf] = useState<EDF>();

  const startSecond = 1;
  // const lengthSeconds = 5;

  //Reading data from all channels [[], [], []]
  // const data = edf.read(startSecond, edf.duration);
  // console.log(data);

  const handleChangeFile = async (event) => {
    const file = event.target.files[0];

    try {
      const fileContents = await readUploadedFile(file);
      console.log(fileContents);

      if (fileContents) {
        let edfResult = new EDF(fileContents);
        setEdf(edfResult);
      }
    } catch (e) {
      console.warn(e.message);
    }
  };

  return (
    <div className="App">
      <form>
        <input
          type="file"
          // value={selectedFile}
          onChange={handleChangeFile}
        />
      </form>
    </div>
  );
}

export default App;
