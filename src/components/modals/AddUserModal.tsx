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
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AxiosResponse } from "axios";

interface Props {
  open: boolean;
  handleCloseAddUserModal: () => void;
}

export const AddUserModal = ({ open, handleCloseAddUserModal }: Props) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleAddUser = async () => {
    const response = await api.post(`${baseUrl}/addUser`, {
      firstName,
      lastName,
    });

    handleNotify(response);
  };

  const handleCancel = () => {
    handleCloseAddUserModal();
    setFirstName("");
    setLastName("");
  };

  const handleNotify = (response: AxiosResponse<any, any>) => {
    if (response.status === 200) {
      toast(`Successfully added ${firstName} ${lastName}!`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } else {
      toast(`${response.data.message}`);
    }

    handleCancel();
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
      <ToastContainer />
    </>
  );
};

const Column = styled.div`
  flex-direction: column;
  margin-bottom: 16px;
`;
