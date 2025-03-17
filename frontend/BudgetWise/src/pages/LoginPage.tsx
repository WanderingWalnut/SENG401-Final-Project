import React, { useState } from "react";
import {
  Grid,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import axios from "axios"; // Import axios for API requests
import { useNavigate } from "react-router-dom"; // For navigation
import GreenGradient from "../assets/GreenGradient.svg";
import Monster from "../assets/monster.png";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState(""); // Store error messages
  const navigate = useNavigate(); // Hook for navigation
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Reset error message

    try {
      console.log("Attempting login with:", formData); // Log the request data
      const response = await axios.post(
        "http://localhost:5001/api/login",
        formData
      );
      console.log("Login response:", response.data); // Log the response

      if (response.data.user_id) {
        localStorage.setItem("user_id", response.data.user_id);
        navigate("/chat");
      }
    } catch (err) {
      // Better error handling
      if (axios.isAxiosError(err)) {
        console.error("Login error details:", err.response?.data); // Log detailed error
        if (err.response) {
          setError(err.response.data.error || "Login failed.");
        } else if (err.request) {
          setError(
            "No response from server. Please check if the server is running."
          );
        } else {
          setError("Error setting up the request.");
        }
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  return (
    <Grid
      container
      sx={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        position: "fixed",
        left: 0,
        top: 0,
      }}
    >
      {/* Left Side (Image Section) */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          display: isSmallScreen ? "none" : "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f5f5f5",
          height: "100vh",
        }}
      >
        <Box
          component="img"
          src={GreenGradient}
          alt="Login"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </Grid>

      {/* Right Side (Login Form Section) */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "white",
          height: "100vh",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            width: "80%",
            maxWidth: "400px",
          }}
        >
          <img src = {Monster}
            style={{
              display: "block",  // Ensures the image is centered
              margin: "0 auto",  // Centers the image horizontally
              width: "200px",     // Adjust width as needed
              height: "200px",    // Adjust height as needed
              objectFit: "contain" // Ensures the image scales properly
            }}
          />
          
          <Typography variant="h4" gutterBottom>
            Login
          </Typography>
          {error && <Alert severity="error">{error}</Alert>}{" "}
          {/* Display error messages */}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
            >
              Login
            </Button>
            <p>
              Don't have an account? <a href="/signup">Sign Up</a>
            </p>
          </form>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Login;
