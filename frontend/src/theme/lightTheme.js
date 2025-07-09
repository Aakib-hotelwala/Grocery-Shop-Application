// src/theme/lightTheme.js
import { createTheme } from "@mui/material/styles";

const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#43a047", // Fresh leafy green
    },
    secondary: {
      main: "#ffb74d", // Soft orange for accents
    },
    tertiary: {
      main: "#ffee58", // Yellow (not used by MUI by default but useful via sx)
    },
    background: {
      default: "#fdf6ec", // Warm creamy tone
      paper: "#ffffff", // Card background
    },
    text: {
      primary: "#263238", // Rich gray-blue
      secondary: "#546e7a", // Muted slate
    },
    info: {
      main: "#a7ffeb", // Aqua green
    },
    success: {
      main: "#66bb6a",
    },
    warning: {
      main: "#fbc02d",
    },
    error: {
      main: "#e57373",
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
          background: "linear-gradient(135deg, #ffffff, #fff8e1)",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.07)",
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: "linear-gradient(to right, #e3ffe7, #fffde7)", // Soft green-yellow blend
        },
      },
    },
  },
});

export default lightTheme;
