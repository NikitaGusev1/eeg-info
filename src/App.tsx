import { useCallback, useState } from "react";
import { decodeEdf, getInputFileBuffer } from "./utils";
import { Chart } from "./components/Chart/Chart";

function App() {
  const [edf, setEdf] = useState();
  // getPhysicalSignalConcatRecords(index, recordStart, howMany)
  // console.log(edf?.getPhysicalSignalConcatRecords(0, 0, 50));
  console.log(edf?.getSignalNumberOfSamplesPerRecord(0));

  const handleChangeFile = useCallback(
    async (event) => {
      const file = event.target.files[0];

      const buffer = await getInputFileBuffer(file);
      const decodedEdf = decodeEdf(buffer);

      setEdf(decodedEdf);
    },
    [setEdf]
  );

  return (
    <div className="App">
      <form>
        <input type="file" onChange={handleChangeFile} />
      </form>
      {edf && <Chart edf={edf} />}
    </div>
  );
}

export default App;
