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

export const LoginModal = () => {
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const {
    setFirstName,
    setLastName,
    setEmail,
    email,
    isLoggedIn,
    setIsLoggedIn,
  } = useContext(UserContext);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const isPasswordValid = () => {
    const hasNumber = /\d/;
    const hasSpecialCharacter = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/;
    const hasUppercaseLetter = /[A-Z]/;

    return (
      password.length >= 8 &&
      hasNumber.test(password) &&
      hasSpecialCharacter.test(password) &&
      hasUppercaseLetter.test(password)
    );
  };

  const handleLogin = async () => {
    // const passwordValid = isPasswordValid();
    // if (passwordValid) {
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
        setFirstName(data.firstName);
        setLastName(data.lastName);
        setIsLoggedIn(true);
      }
      if (response.status === 401) {
        setErrorMessage("Wrong email or password");
      }
    } catch (error) {
      console.log(error);
    }
    // } else {
    //   setErrorMessage(
    //     "Password has to be minimum 8 characters and include one uppercase letter, one number and one special character"
    //   );
    // }
  };

  return (
    <Dialog open={!isLoggedIn}>
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
