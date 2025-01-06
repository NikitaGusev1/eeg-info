import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  OutlinedInput,
} from "@mui/material";
import { useState } from "react";
import styled from "styled-components";
import { baseUrl } from "../../utils";
import api from "../../api/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Props {
  open: boolean;
  handleCloseAddUserModal: () => void;
}

export const AddUserModal = ({ open, handleCloseAddUserModal }: Props) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState("");

  const handleAddUser = async () => {
    const response = await api.post(`${baseUrl}/addUser`, {
      firstName,
      lastName,
    });

    setGeneratedEmail(response.data.email);
    setGeneratedPassword(response.data.password);

    if (response.status === 200) {
      handleNotify("success");
    }

    if (response.status === 500) {
      handleNotify("error");
    }
  };

  const handleCancel = () => {
    handleCloseAddUserModal();
    setFirstName("");
    setLastName("");
    setGeneratedEmail("");
    setGeneratedPassword("");
  };

  const handleNotify = (message: string) => {
    if (message === "success") {
      toast(`Successfully added ${firstName} ${lastName}!`, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
    if (message === "error") {
      toast(`Something went wrong`, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  return (
    <>
      <Dialog open={open}>
        <DialogContent>
          <DialogTitle>Add User</DialogTitle>
          <FormControl sx={{ m: 1, width: "25ch" }} variant="outlined">
            <Column>
              <InputLabel>First Name</InputLabel>
              <OutlinedInput
                label="First Name"
                onChange={(event) => setFirstName(event.target.value)}
              />
            </Column>
          </FormControl>
          <FormControl sx={{ m: 1, width: "25ch" }} variant="outlined">
            <Column>
              <InputLabel>Last Name</InputLabel>
              <OutlinedInput
                label="Last Name"
                onChange={(event) => setLastName(event.target.value)}
              />
            </Column>
          </FormControl>
          {generatedPassword && generatedEmail && (
            <>
              <p
                style={{ textAlign: "center" }}
              >{`Generated email: ${generatedEmail}`}</p>
              <p
                style={{ textAlign: "center" }}
              >{`Generated password: ${generatedPassword}`}</p>
            </>
          )}
          <div
            style={{
              justifyContent: "space-between",
              display: "flex",
              flex: 1,
            }}
          >
            <Button
              variant="outlined"
              onClick={handleAddUser}
              disabled={!firstName || !lastName}
            >
              Add User
            </Button>
            <Button variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const Column = styled.div`
  flex-direction: column;
  margin-bottom: 16px;
`;
