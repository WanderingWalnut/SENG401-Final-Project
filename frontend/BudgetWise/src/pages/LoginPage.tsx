import React, { useState } from "react";
import { Grid, Paper, TextField, Button, Typography, Box, Alert } from "@mui/material";
import axios from "axios";  // Import axios for API requests
import { useNavigate } from "react-router-dom"; // For navigation
import GreenGradient from "../assets/GreenGradient.svg"

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState(""); // Store error messages
  const navigate = useNavigate(); // Hook for navigation

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Reset error message

    try {
      const response = await axios.post("http://localhost:5001/api/login", formData);

      if (response.data.user_id) {
        localStorage.setItem("user_id", response.data.user_id); // Save user ID in localStorage
        navigate("/chat"); // Redirect user after successful login
      }
    } catch (err: any) {
      if (err.response) {
        setError(err.response.data.error || "Login failed.");
      } else {
        setError("Server error. Please try again later.");
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
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f5f5f5",
          height: "100vh",
        }}
      >
        <Box
          component="img"
          src= {GreenGradient}
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
          <Typography variant="h4" gutterBottom>
            Login
          </Typography>

          {error && <Alert severity="error">{error}</Alert>} {/* Display error messages */}

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
            <p>Don't have an account? <a href="/signup">Sign Up</a></p>
          </form>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Login;
