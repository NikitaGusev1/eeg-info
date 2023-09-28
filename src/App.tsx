import { useCallback, useState } from "react";
import "./App.css";
import { handleFileRead } from "./utils";

function App() {
  // const [selectedFile, setSelectedFile] = useState<File | File[]>();

  const handleChangeFile = useCallback((e) => {
    handleFileRead(e);
  }, []);

  return (
    <div className="App">
      <form>
        <input
          type="file"
          // value={selectedFile}
          onChange={(e) => handleChangeFile(e.target.files[0])}
        />
      </form>
    </div>
  );
}

export default App;
