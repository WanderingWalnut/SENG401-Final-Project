import React, { useState } from "react";
import { Grid, Paper, TextField, Button, Typography, Box } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // For navigation
import GreenGradient from "../assets/GreenGradient.svg"
import Monster from "../assets/monster.png";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState(""); // Success or error message
  const navigate = useNavigate(); // Hook for navigation

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:5001/api/signup", formData);
      setMessage(response.data.message); // Show success message
      navigate("/login"); // Redirect user after successful login
      setFormData({ name: "", email: "", password: "" }); // Clear form
    } catch (error: any) {
      setMessage(error.response?.data?.error || "Signup failed"); // Show error message
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
          display: { xs: "none", md: "flex" },
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f5f5f5",
          height: "100vh",
        }}
      >
        <Box
          component="img"
          src={GreenGradient}
          alt="Sign Up"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </Grid>

      {/* Right Side (Sign-Up Form Section) */}
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
            Sign Up
          </Typography>

          {message && (
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
              {message}
            </Typography>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
            />

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
              Sign Up
            </Button>
            <p>
              Already have an account? <a href="/login">Login</a>
            </p>
          </form>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default SignUp;
