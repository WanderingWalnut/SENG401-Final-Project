import React, { useState } from "react";
import { Grid, Paper, TextField, Button, Typography, Box } from "@mui/material";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <Grid
      container
      sx={{
        width: "100vw", // Ensures full viewport width
        height: "100vh", // Ensures full viewport height
        margin: 0, // Removes unwanted margins
        padding: 0, // Removes unwanted padding
        position: "fixed", // Ensures full-screen coverage
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
          src="/assets/GreenGradient.svg"
          alt="Sign Up"
          sx={{
            width: "100%", // Takes full width
            height: "100%", // Takes full height
            objectFit: "cover", // Prevents distortion
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
          <Typography variant="h4" gutterBottom>
            Sign Up
          </Typography>

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
          </form>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default SignUp;
