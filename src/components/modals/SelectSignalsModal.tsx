import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  List,
  ListItem,
} from "@mui/material";
import { styled as muiStyled } from "@mui/material/styles";
import { useContext, useMemo } from "react";
import styled from "styled-components";
import { ChartContext } from "../../contexts/ChartContext";
import { formatTime } from "../../utils";

interface Props {
  edf: any;
}

export const SelectSignalsModal = ({ edf }: Props) => {
  const {
    handleChangeSignals,
    setSelectorOpen,
    selectorOpen,
    selectedSignals,
    setEdf,
  } = useContext(ChartContext);

  const signalDuration = useMemo(() => {
    const duration = edf?.getRecordDuration() * edf?.getNumberOfRecords();

    return formatTime(duration);
  }, [edf]);

  const handleSelect = () => {
    setSelectorOpen(false);
  };

  const handleCancel = () => {
    setEdf(null);
    setSelectorOpen(false);
  };

  return (
    <Dialog open={selectorOpen}>
      <DialogContent>
        <Subject>{`Subject: ${edf?.getPatientID()}`}</Subject>
        <Recording>{`Recording: ${edf?.getRecordingID()}`}</Recording>
        <Duration>{`Duration: ${signalDuration}`}</Duration>
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
        <Row>
          <Button
            variant="outlined"
            onClick={handleSelect}
            disabled={selectedSignals.length === 0}
          >
            Show chart
          </Button>
          <CancelButton variant="outlined" onClick={handleCancel}>
            Cancel
          </CancelButton>
        </Row>
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

const CancelButton = muiStyled(Button)({});

const Row = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-around;
`;
