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
  handleCloseShareModal: () => void;
}

export const ShareModal = ({ open, handleCloseShareModal }: Props) => {
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
    const response = await api.post(`${baseUrl}/assignFiles`, {
      email,
      file: fileString,
      fileName,
      mimeType: "application/edf",
    });
    if (response.status === 200) {
      handleNotify("success");
    }

    if (response.status === 500) {
      handleNotify("error");
    }
  };

  const handleCancel = () => {
    setFileString("");
    setFileName("");
    handleCloseShareModal();
  };

  const handleNotify = (message: string) => {
    if (message === "success") {
      toast("Successfully shared!", {
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
      toast("Successfully shared!", {
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

    handleCancel();
  };

  return (
    <>
      <Dialog open={open}>
        <DialogContent>
          <DialogTitle>Share File</DialogTitle>
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
              Choose File
              <input type="file" onChange={handleFilesChange} hidden />
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
              onClick={handleAssign}
              disabled={!email || !fileString}
            >
              Share
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
