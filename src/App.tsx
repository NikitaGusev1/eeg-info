import { useState } from "react";
import "./App.css";
import { readUploadedFile } from "./utils";

function App() {
  const [signalsIntArray, setSignalsIntArray] = useState<Uint8Array>();
  console.log(signalsIntArray);

  const handleChangeFile = async (event) => {
    const file = event.target.files[0];

    try {
      const fileContents = await readUploadedFile(file);
      setSignalsIntArray(fileContents as Uint8Array);
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
