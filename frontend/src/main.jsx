import { createRoot } from "react-dom/client";
import "./index.css";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { lightTheme } from "./theme";
import App from "./App";
import { ToastContainer } from "react-toastify";

createRoot(document.getElementById("root")).render(
  <ThemeProvider theme={lightTheme}>
    <CssBaseline />
    <App />
    <ToastContainer duration={1000} />
  </ThemeProvider>
);
