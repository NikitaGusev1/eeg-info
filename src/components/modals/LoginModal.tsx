import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useContext, useState } from "react";
import styled from "styled-components";
import { baseUrl } from "../../utils";
import { UserContext } from "../../contexts/UserContext";

// TODO: better pw requirements

interface Props {
  open: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;
}

export const LoginModal = ({ open, setIsLoggedIn }: Props) => {
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { setName, setEmail, email } = useContext(UserContext);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const handleLogin = async () => {
    try {
      const response = await fetch(`${baseUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        setErrorMessage("");

        const data = await response.json();
        const token = data.token;
        localStorage.setItem("token", token);
        setName(data.name);
        setIsLoggedIn(true);
      }
      if (response.status === 401) {
        setErrorMessage("Wrong email or password");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogTitle>Login to EEG-Info</DialogTitle>
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
          <FormControl sx={{ m: 1, width: "25ch" }} variant="outlined">
            <InputLabel>Password</InputLabel>
            <OutlinedInput
              type={showPassword ? "text" : "password"}
              onChange={(event) => setPassword(event.target.value)}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="Password"
            />
          </FormControl>
        </Column>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        <Button
          variant="outlined"
          onClick={handleLogin}
          // disabled={selectedSignals.length === 0}
        >
          Login
        </Button>
      </DialogContent>
    </Dialog>
  );
};

const Column = styled.div`
  flex-direction: column;
  margin-bottom: 16px;
`;
