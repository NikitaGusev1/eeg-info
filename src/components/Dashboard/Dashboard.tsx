import * as React from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

interface Props {
  setIsAssignModalOpen: (isOpen: boolean) => void;
  setIsAddUserModalOpen: (isOpen: boolean) => void;
}

export default function Dashboard({
  setIsAssignModalOpen,
  setIsAddUserModalOpen,
}: Props) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAssignClick = () => {
    setIsAssignModalOpen(true);
    handleClose();
  };

  const handleAddUserClick = () => {
    setIsAddUserModalOpen(true);
    handleClose();
  };

  return (
    <>
      <Button
        style={{ marginRight: 16 }}
        variant="outlined"
        onClick={handleClick}
      >
        Dashboard
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={handleAddUserClick}>Add User</MenuItem>
        <MenuItem onClick={handleAssignClick}>Assign File</MenuItem>
      </Menu>
    </>
  );
}
