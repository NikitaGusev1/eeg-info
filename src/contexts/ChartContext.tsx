import { ReactNode, createContext, useMemo, useState } from "react";

interface Props {
  children?: ReactNode | ReactNode[];
}

export const ChartContext = createContext({
  selectedSignals: [] as number[],
  setSelectedSignals: (indexes: number[]) => {},
  handleChangeSignals: (index: number) => {},
  selectorOpen: false,
  setSelectorOpen: (open: boolean) => {},
  edf: null,
  setEdf: (edf: any) => {},
});

export const ChartContextProvider = ({ children }: Props) => {
  const [edf, setEdf] = useState(null);
  const [selectedSignals, setSelectedSignals] = useState<number[]>([]);
  const [selectorOpen, setSelectorOpen] = useState(false);

  const handleChangeSignals = (signalIndex: number) => {
    if (signalIndex === -1) {
      // Special value indicating "Select All"
      const allSignalIndices = Array.from(
        { length: edf?._header.signalInfo.length },
        (_, index) => index
      );
      setSelectedSignals(allSignalIndices);
    } else if (selectedSignals.includes(signalIndex)) {
      setSelectedSignals((prevState) =>
        prevState.filter((filteredSignal) => filteredSignal !== signalIndex)
      );
    } else {
      setSelectedSignals((prevState) => [...prevState, signalIndex]);
    }
  };

  const value = useMemo(() => {
    return {
      selectedSignals,
      setSelectedSignals,
      handleChangeSignals,
      selectorOpen,
      setSelectorOpen,
      edf,
      setEdf,
    };
  }, [
    selectedSignals,
    setSelectedSignals,
    handleChangeSignals,
    selectorOpen,
    setSelectorOpen,
    edf,
    setEdf,
  ]);

  return (
    <ChartContext.Provider value={value}>{children}</ChartContext.Provider>
  );
};
