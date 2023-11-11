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
import { baseUrl, convertFilesToBase64 } from "../../utils";
import api from "../../api/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AxiosResponse } from "axios";

interface Props {
  open: boolean;
  handleCloseAssignModal: () => void;
}

export const AssignFileModal = ({ open, handleCloseAssignModal }: Props) => {
  const [email, setEmail] = useState("");
  const [fileStrings, setFileStrings] = useState<string[]>([]);

  const handleFilesChange = useCallback(
    async (event) => {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const files = Array.from(event.target.files);

      convertFilesToBase64(files, (base64Strings: string[]) => {
        setFileStrings(base64Strings);
        console.log(base64Strings);
      });

      event.target.value = null;
    },
    [fileStrings]
  );

  const handleAssign = async () => {
    const response = await api.post(`${baseUrl}/assignFiles`, {
      email,
      files: fileStrings,
    });

    handleNotify(response);
  };

  const handleCancel = () => {
    setFileStrings([]);
    handleCloseAssignModal();
  };

  const handleNotify = (response: AxiosResponse<any, any>) => {
    if (response.status === 200) {
      toast("Successfully assigned!", {
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
            {fileStrings.length > 0 && (
              <p>
                {fileStrings.length === 1
                  ? `${fileStrings.length} file selected`
                  : `${fileStrings.length} files selected`}
              </p>
            )}
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
              disabled={!email || fileStrings.length === 0}
            >
              Assign
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
