import { useCallback, useContext, useState } from "react";
import { decodeEdf, getInputFileBuffer } from "../../utils";
import { ChartContext } from "../../contexts/ChartContext";
import { SelectSignalsModal } from "../modals/SelectSignalsModal";
import { Chart } from "../Chart/Chart";
import { LoginModal } from "../modals/LoginModal";
import styled from "styled-components";
import { UserContext } from "../../contexts/UserContext";

// TODO: logout

export const HomeScreen = () => {
  const {
    selectorOpen,
    setSelectorOpen,
    selectedSignals,
    setSelectedSignals,
    setEdf,
    edf,
  } = useContext(ChartContext);
  const { name, isLoggedIn } = useContext(UserContext);

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
    <div className="App" style={{ padding: 16 }}>
      {!isLoggedIn ? (
        <LoginModal />
      ) : (
        <>
          <UserName>{`Logged in as ${name}`}</UserName>
          <form>
            <input type="file" onChange={handleOpenSelector} accept=".edf" />
          </form>
          <SelectSignalsModal edf={edf} />
          {isChartReady && <Chart edf={edf} />}
        </>
      )}
    </div>
  );
};

const UserName = styled.p`
  position: fixed;
  top: 0;
  right: 0;
  padding: 16px;
`;
