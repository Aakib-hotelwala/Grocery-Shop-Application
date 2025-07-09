// src/theme/darkTheme.js
import { createTheme } from "@mui/material/styles";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#81c784", // Warm soft green
    },
    secondary: {
      main: "#ffcc80", // Soft orange
    },
    background: {
      default: "#181a1f", // Slightly warm black
      paper: "#23272f", // For cards and panels
    },
    info: {
      main: "#80deea", // Aqua for accents
    },
    success: {
      main: "#aed581",
    },
    warning: {
      main: "#fbc02d",
    },
    error: {
      main: "#ef9a9a",
    },
    text: {
      primary: "#e0f2f1", // Soft teal-white
      secondary: "#b0bec5", // Soft bluish-gray
    },
  },
  typography: {
    fontFamily: "Inter, Roboto, sans-serif",
    button: {
      textTransform: "none",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          background: "linear-gradient(145deg, #23272f, #2c303a)",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: "linear-gradient(to right, #1e1f23, #2a2d33)", // Dark gradient
        },
      },
    },
  },
});

export default darkTheme;
