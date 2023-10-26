import { useCallback, useContext, useState } from "react";
import { decodeEdf, getInputFileBuffer } from "../../utils";
import { ChartContext } from "../../contexts/ChartContext";
import { SelectSignalsModal } from "../modals/SelectSignalsModal";
import { Chart } from "../Chart/Chart";

export const HomeScreen = () => {
  const [edf, setEdf] = useState();
  const { selectorOpen, setSelectorOpen, selectedSignals } =
    useContext(ChartContext);
  // getPhysicalSignalConcatRecords(index, recordStart, howMany)
  // console.log(edf?.getPhysicalSignalConcatRecords(0, 0, 50));
  const isChartReady = edf && !selectorOpen && selectedSignals.length !== 0;

  const handleChangeFile = useCallback(
    async (event) => {
      const file = event.target.files[0];

      const buffer = await getInputFileBuffer(file);
      const decodedEdf = decodeEdf(buffer);

      setEdf(decodedEdf);
    },
    [setEdf]
  );

  const handleOpenSelector = useCallback(
    (event) => {
      handleChangeFile(event);
      setSelectorOpen(true);
    },
    [setSelectorOpen, handleChangeFile]
  );

  return (
    <div className="App">
      <form>
        <input type="file" onChange={handleOpenSelector} />
      </form>
      <SelectSignalsModal edf={edf} />
      {isChartReady && <Chart edf={edf} />}
    </div>
  );
};
