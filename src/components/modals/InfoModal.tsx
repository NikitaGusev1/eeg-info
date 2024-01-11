import {
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

export const InfoModal = ({
  open,
  setInfoModalOpen,
}: {
  open: boolean;
  setInfoModalOpen: (open: boolean) => void;
}) => {
  const handleClose = () => {
    setInfoModalOpen(false);
  };

  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogTitle>Instructions</DialogTitle>
        <DialogContentText>To zoom use mouse wheel</DialogContentText>
        <DialogContentText>
          To shift the diagram right or left use SHIFT + Left Mouse Button
        </DialogContentText>
        <DialogContentText>
          To highlight peaks use ALT + Left Mouse Button
        </DialogContentText>
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Button variant="outlined" onClick={handleClose}>
            OK
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
