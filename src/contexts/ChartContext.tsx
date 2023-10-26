import { ReactNode, createContext, useMemo, useState } from "react";

interface Props {
  children?: ReactNode | ReactNode[];
}

export const ChartContext = createContext({
  selectedSignals: [] as number[],
  setSelectedSignals: (index: number) => {},
  handleChangeSignals: (index: number) => {},
  selectorOpen: false,
  setSelectorOpen: (open: boolean) => {},
});

export const ChartContextProvider = ({ children }: Props) => {
  const [selectedSignals, setSelectedSignals] = useState<number[]>([]);
  const [selectorOpen, setSelectorOpen] = useState(false);

  const handleChangeSignals = (signalIndex: number) => {
    if (selectedSignals.includes(signalIndex)) {
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
    };
  }, [
    selectedSignals,
    setSelectedSignals,
    handleChangeSignals,
    selectorOpen,
    setSelectorOpen,
  ]);

  return (
    <ChartContext.Provider value={value}>{children}</ChartContext.Provider>
  );
};
