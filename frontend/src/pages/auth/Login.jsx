import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../../services/authService";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  useTheme,
} from "@mui/material";
import ClipLoader from "react-spinners/ClipLoader";

const Login = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginUser(formData);
      if (res.success) navigate("/");
    } catch (error) {
      // toast handled inside authService
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
          : "linear-gradient(to right, #e3ffe7, #fffde7)", // From your theme
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
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))",
            }}
          />
        </Box>

        {/* Login Card */}
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            background: isDark
              ? "linear-gradient(145deg, #23272f, #2c303a)"
              : "linear-gradient(135deg, #ffffff, #fff8e1)",
            boxShadow: isDark
              ? "0 10px 30px rgba(0, 0, 0, 0.5)"
              : "0 10px 30px rgba(0,0,0,0.1)",
          }}
        >
          <Typography
            variant="h5"
            textAlign="center"
            fontWeight={700}
            color="primary"
            mb={1}
          >
            Welcome Back
          </Typography>
          <Typography
            variant="body2"
            textAlign="center"
            color="text.secondary"
            mb={3}
          >
            Login to your account
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email or Phone Number"
              name="identifier"
              value={formData.identifier}
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
                {loading ? <ClipLoader color="#fff" size={20} /> : "Login"}
              </Button>
            </Box>
          </form>
        </Paper>

        {/* Register Link */}
        <Box mt={3} textAlign="center">
          <Typography variant="body2" color="text.secondary">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              style={{
                color: theme.palette.primary.main,
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Register here
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
