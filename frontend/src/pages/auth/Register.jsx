// src/pages/auth/Register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../../services/authService";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material";
import { FaUserCircle } from "react-icons/fa";
import { FiCamera } from "react-icons/fi";
import ClipLoader from "react-spinners/ClipLoader";

const Register = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNo: "",
    profileImage: null,
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, profileImage: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("email", formData.email);
    payload.append("password", formData.password);
    payload.append("phoneNo", formData.phoneNo || "");
    if (formData.profileImage) {
      payload.append("profileImage", formData.profileImage);
    }

    try {
      await registerUser(payload);
      navigate("/login");
    } catch (error) {
      // toast handled in service
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{
        px: 2,
        background: isDark
          ? "linear-gradient(to right, #1e1f23, #2a2d33)"
          : "linear-gradient(to right, #e3ffe7, #fffde7)",
      }}
    >
      <Container maxWidth="xs">
        {/* Logo */}
        <Box display="flex" justifyContent="center" mb={3}>
          <img
            src="/Logo-2.png"
            alt="Grocery Shop Logo"
            style={{
              width: "100px",
              objectFit: "contain",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
            }}
          />
        </Box>

        <Paper
          elevation={5}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            background: isDark
              ? "linear-gradient(145deg, #23272f, #2c303a)"
              : "linear-gradient(135deg, #ffffff, #fff8e1)",
            boxShadow: isDark
              ? "0 10px 30px rgba(0, 0, 0, 0.5)"
              : "0 10px 25px rgba(0, 0, 0, 0.08)",
          }}
        >
          <Typography
            variant="h5"
            textAlign="center"
            fontWeight={700}
            color="primary"
            mb={1}
          >
            Create Account
          </Typography>
          <Typography
            variant="body2"
            textAlign="center"
            color="text.secondary"
            mb={3}
          >
            Join and start shopping now
          </Typography>

          {/* Profile Image Upload */}
          <Box
            position="relative"
            display="flex"
            justifyContent="center"
            mb={2}
          >
            <Box sx={{ position: "relative", width: 90, height: 90 }}>
              <label htmlFor="profile-upload">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "50%",
                      cursor: "pointer",
                      border: "2px solid #4caf50",
                    }}
                  />
                ) : (
                  <FaUserCircle
                    size={90}
                    color="#ccc"
                    style={{ cursor: "pointer" }}
                  />
                )}
              </label>
              <label htmlFor="profile-upload">
                <IconButton
                  component="span"
                  sx={{
                    position: "absolute",
                    bottom: 4,
                    right: 4,
                    bgcolor: "#e1bee7",
                    color: "#6a1b9a",
                    p: 0.5,
                    border: "1px solid #ccc",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                    ":hover": {
                      bgcolor: "#ce93d8",
                    },
                  }}
                  size="small"
                >
                  <FiCamera size={16} />
                </IconButton>
              </label>
              <input
                type="file"
                accept="image/*"
                id="profile-upload"
                hidden
                onChange={handleImageChange}
              />
            </Box>
          </Box>

          {/* Form */}
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
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Phone Number"
              name="phoneNo"
              value={formData.phoneNo || ""}
              onChange={handleChange}
              margin="normal"
            />

            <Box mt={3}>
              <Button
                variant="contained"
                type="submit"
                fullWidth
                disabled={loading}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: "1.1rem",
                  backgroundColor: theme.palette.primary.main,
                  ":hover": {
                    backgroundColor: theme.palette.primary.dark,
                  },
                  color: "#fff",
                }}
              >
                {loading ? <ClipLoader color="#fff" size={20} /> : "Register"}
              </Button>
            </Box>
          </form>
        </Paper>

        <Box mt={3} textAlign="center">
          <Typography variant="body2" color="text.secondary">
            Already have an account?{" "}
            <Link
              to="/login"
              style={{
                color: theme.palette.primary.main,
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Login here
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Register;
