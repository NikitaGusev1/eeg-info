import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  List,
  ListItem,
} from "@mui/material";
import { useContext, useMemo } from "react";
import styled from "styled-components";
import { ChartContext } from "../../contexts/ChartContext";

interface Props {
  edf: any;
}

export const SelectSignalsModal = ({ edf }: Props) => {
  const { handleChangeSignals, setSelectorOpen, selectorOpen } =
    useContext(ChartContext);

  const durationInSeconds = useMemo(() => {
    return edf?.getRecordDuration() * edf?.getNumberOfRecords();
  }, [edf]);

  const handleClose = () => {
    setSelectorOpen(false);
  };

  return (
    <Dialog open={selectorOpen}>
      <DialogContent>
        <Subject>{`Subject: ${edf?.getPatientID()}`}</Subject>
        <Recording>{`Recording: ${edf?.getRecordingID()}`}</Recording>
        <Duration>{`Duration: ${durationInSeconds} seconds`}</Duration>
        <p>Select signals:</p>
        <List>
          {edf?._header.signalInfo?.map((signal: any, index: number) => (
            <ListItem key={signal.label}>
              <Checkbox onChange={() => handleChangeSignals(index)} />
              <Index>{`${index + 1}.`}</Index>
              <Label>{signal.label}</Label>
            </ListItem>
          ))}
        </List>
        <Button variant="outlined" onClick={() => handleClose()}>
          Show chart
        </Button>
      </DialogContent>
    </Dialog>
  );
};

const Subject = styled.p``;

const Recording = styled.p``;

const Duration = styled.p``;

const Index = styled.p`
  margin-right: 8px;
`;

const Label = styled.p``;
