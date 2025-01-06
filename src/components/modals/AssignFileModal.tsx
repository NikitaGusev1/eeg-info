import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  OutlinedInput,
} from "@mui/material";
import { useCallback, useState } from "react";
import styled from "styled-components";
import { baseUrl, convertFileToBase64 } from "../../utils";
import api from "../../api/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Props {
  open: boolean;
  handleCloseAssignModal: () => void;
}

export const AssignFileModal = ({ open, handleCloseAssignModal }: Props) => {
  const [email, setEmail] = useState("");
  const [fileString, setFileString] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");

  const handleFilesChange = useCallback(
    async (event) => {
      if (!event.target.files[0]) {
        return;
      }

      const file = event.target.files[0];
      setFileName(file.name);
      const base64String = await convertFileToBase64(file);
      setFileString(base64String);

      event.target.value = null;
    },
    [setFileString]
  );

  const handleAssign = async () => {
    try {
      const response = await api.post(`${baseUrl}/assignFiles`, {
        email,
        file: fileString,
        fileName,
        mimeType: "application/edf",
      });

      if (response.status === 200) {
        handleNotify("success");
      } else {
        handleNotify("error");
      }
    } catch (error) {
      handleNotify("error");
    }
  };

  const handleNotify = (type: "success" | "error") => {
    const message =
      type === "success" ? "Successfully assigned!" : "Something went wrong";

    toast(message, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "dark",
    });

    handleCancel();
  };

  const handleCancel = () => {
    setFileString("");
    setFileName("");
    handleCloseAssignModal();
  };

  return (
    <>
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
              <input type="file" onChange={handleFilesChange} multiple hidden />
            </Button>
            {/* {fileStrings.length > 0 && (
              <p>
                {fileStrings.length === 1
                  ? `${fileStrings.length} file selected`
                  : `${fileStrings.length} files selected`}
              </p>
            )} */}
          </Column>
          <div
            style={{
              justifyContent: "space-between",
              display: "flex",
              flex: 1,
            }}
          >
            <Button
              variant="outlined"
              onClick={() => {
                handleAssign();
              }}
              disabled={!email || !fileString}
            >
              Assign
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
