import {
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useContext } from "react";
import { UserContext } from "../../contexts/UserContext";
import api from "../../api/api";

interface Props {
  open: boolean;
  handleCloseSharedFilesModal: (open: boolean) => void;
}

export const SharedFilesModal = ({
  open,
  handleCloseSharedFilesModal,
}: Props) => {
  const { assignedFiles } = useContext(UserContext);

  const downloadFile = async (fileName) => {
    try {
      const response = await api.get(`/download/${fileName}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();

      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const handleDownload = (fileName: string) => {
    downloadFile(fileName);
  };

  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogTitle>Assigned Files</DialogTitle>

        <ul style={{ listStyleType: "none" }}>
          {assignedFiles?.map((fileName, index) => (
            <li key={`${fileName}+${index}`}>
              <button
                style={{ border: "none", background: "none" }}
                onClick={() => handleDownload(fileName)}
              >
                <DialogContentText>{fileName}</DialogContentText>
              </button>
            </li>
          ))}
        </ul>
        <Button
          variant="outlined"
          onClick={() => handleCloseSharedFilesModal(false)}
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
};
