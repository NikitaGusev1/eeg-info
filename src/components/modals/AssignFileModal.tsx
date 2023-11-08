import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  OutlinedInput,
} from "@mui/material";
import { useContext, useState } from "react";
import styled from "styled-components";
import { baseUrl } from "../../utils";
import { UserContext } from "../../contexts/UserContext";

interface Props {
  open: boolean;
  handleCloseAssignModal: () => void;
}

export const AssignFileModal = ({ open, handleCloseAssignModal }: Props) => {
  const [email, setEmail] = useState("");

  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogTitle>Assign Files</DialogTitle>
        <Column>
          <FormControl sx={{ m: 1, width: "25ch" }} variant="outlined">
            <InputLabel>Email</InputLabel>
            <OutlinedInput
              label="Email"
              onChange={(event) => setEmail(event.target.value)}
            />
          </FormControl>
        </Column>
        <Column>
          <Button variant="contained" component="label">
            Choose Files
            <input type="file" hidden />
          </Button>
        </Column>
        <div
          style={{ justifyContent: "space-between", display: "flex", flex: 1 }}
        >
          <Button
            variant="outlined"
            //   onClick={handleAssign}
            // disabled={selectedSignals.length === 0}
          >
            Assign
          </Button>
          <Button variant="outlined" onClick={handleCloseAssignModal}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Column = styled.div`
  flex-direction: column;
  margin-bottom: 16px;
`;
