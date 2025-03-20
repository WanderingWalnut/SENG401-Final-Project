import React, { useState, useEffect } from "react";
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
  IconButton,
  InputAdornment,
  Link,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Monster from "../assets/monster.png";
import Logo from "../assets/logo.svg";
import LogoText from "../assets/logoText.png";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    showPassword: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    if (localStorage.getItem("user_id")) {
      navigate("/chat");
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5001/api/login",
        formData
      );

      if (response.data.user_id && response.data.name) {
        localStorage.setItem("user_id", response.data.user_id);
        localStorage.setItem("user_name", response.data.name);
        navigate("/chat");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data.error || "Login failed.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid
      container
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
        color: "#E2E8F0",
      }}
    >
      {/* Clickable Logo */}
      <Box
        sx={{
          position: "absolute",
          top: 20,
          left: 20,
          cursor: "pointer",
          zIndex: 1000,
          opacity: 1,
          transition: "opacity 0.2s ease-in-out, transform 0.2s ease-in-out",
          transform: "rotate(-30deg)",
          width: 150,
          height: "auto",
          "&:hover": {
            transform: "rotate(-30deg) scale(1.1)",
          },
        }}
        onClick={() => navigate("/")}
      >
        <img
          src={Logo}
          alt="Logo"
          style={{
            width: "90%",
            height: "auto",
            display: "block",
            pointerEvents: "auto",
          }}
        />
      </Box>

      {/* Left Side - Graphic Section (Desktop only) */}
      {!isSmallScreen && (
        <Grid
          item
          md={6}
          sx={{
            position: "relative",
            background:
              "linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage:
                "radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
              opacity: 0.15,
            }}
          />
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              p: 8,
            }}
          >
            <h1
              style={{
                fontSize: "3rem",
                fontWeight: "700",
                lineHeight: "1.3",
                textAlign: "center",
                color: "white",
                margin: "20px 0",
                letterSpacing: "2px",
                textTransform: "uppercase",
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.1)",
                width: "100%",
                maxWidth: "600px",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              Save More, Live Better
            </h1>
          </Box>
        </Grid>
      )}

      {/* Right Side - Login Form (Always visible) */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 4,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ maxWidth: 500, width: "100%" }}
        >
          <Paper
            sx={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
              borderRadius: 4,
              p: 4,
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.36)",
            }}
          >
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <motion.img
                src={Monster}
                style={{
                  width: 120,
                  height: 120,
                  marginBottom: 16,
                  filter: "drop-shadow(0 4px 12px rgba(0, 196, 159, 0.3))",
                }}
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  background:
                    "linear-gradient(45deg, #00C49F 30%, #00b48f 90%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Welcome Back
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: "#94A3B8" }}>
                Please sign in to continue
              </Typography>
            </Box>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  background: "rgba(255, 68, 68, 0.1)",
                  border: "1px solid #FF4444",
                  color: "#FF4444",
                }}
              >
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    color: "#E2E8F0",
                    borderRadius: 2,
                    "& fieldset": { borderColor: "#334155" },
                    "&:hover fieldset": { borderColor: "#475569" },
                    "&.Mui-focused fieldset": { borderColor: "#00C49F" },
                  },
                  "& .MuiInputLabel-root": { color: "#94A3B8" },
                }}
                required
              />

              <TextField
                fullWidth
                label="Password"
                name="password"
                type={formData.showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    color: "#E2E8F0",
                    borderRadius: 2,
                    "& fieldset": { borderColor: "#334155" },
                    "&:hover fieldset": { borderColor: "#475569" },
                    "&.Mui-focused fieldset": { borderColor: "#00C49F" },
                  },
                  "& .MuiInputLabel-root": { color: "#94A3B8" },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setFormData({
                            ...formData,
                            showPassword: !formData.showPassword,
                          })
                        }
                        edge="end"
                        sx={{ color: "#94A3B8" }}
                      >
                        {formData.showPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                required
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  background:
                    "linear-gradient(45deg, #00C49F 30%, #00b48f 90%)",
                  "&:hover": {
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 12px rgba(0, 196, 159, 0.3)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>

              <Typography
                variant="body2"
                sx={{
                  mt: 3,
                  textAlign: "center",
                  color: "#94A3B8",
                  "& a": {
                    color: "#00C49F",
                    textDecoration: "none",
                    fontWeight: 500,
                    "&:hover": { textDecoration: "underline" },
                  },
                }}
              >
                Don't have an account?{" "}
                <Link href="/signup">Create account</Link>
              </Typography>
            </form>
          </Paper>
        </motion.div>
      </Grid>
    </Grid>
  );
};

export default Login;
