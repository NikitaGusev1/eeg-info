import { useCallback, useContext } from "react";
import { decodeEdf, getInputFileBuffer } from "../../utils";
import { ChartContext } from "../../contexts/ChartContext";
import { SelectSignalsModal } from "../modals/SelectSignalsModal";
import { Chart } from "../Chart/Chart";

export const HomeScreen = () => {
  const {
    selectorOpen,
    setSelectorOpen,
    selectedSignals,
    setSelectedSignals,
    setEdf,
    edf,
  } = useContext(ChartContext);
  // getPhysicalSignalConcatRecords(index, recordStart, howMany)
  // console.log(edf?.getPhysicalSignalConcatRecords(0, 0, 50));
  const isChartReady = edf && !selectorOpen && selectedSignals.length !== 0;

  const handleChangeFile = useCallback(
    async (event: any) => {
      if (!event.target.files[0]) {
        return;
      }

      const file = event.target.files[0];

      const buffer = await getInputFileBuffer(file);
      const decodedEdf = decodeEdf(buffer);
      setEdf(decodedEdf);

      event.target.value = null;
    },
    [setEdf]
  );

  const handleOpenSelector = useCallback(
    (event: any) => {
      handleChangeFile(event);
      setSelectedSignals([]);
      setSelectorOpen(true);
    },
    [setSelectorOpen, handleChangeFile, setSelectedSignals]
  );

  return (
    <div className="App">
      <form>
        <input type="file" onChange={handleOpenSelector} accept=".edf" />
      </form>
      <SelectSignalsModal edf={edf} />
      {isChartReady && <Chart edf={edf} />}
    </div>
  );
};
