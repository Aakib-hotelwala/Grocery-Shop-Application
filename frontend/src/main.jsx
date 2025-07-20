import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { ToastContainer } from "react-toastify";
import useThemeStore from "./store/themeStore";
import { lightTheme, darkTheme } from "./theme";
import { useEffect } from "react";
import { refreshToken } from "./services/authService";

// 🔁 AppWithTheme wrapper applies current theme directly
const AppWithTheme = () => {
  const mode = useThemeStore((state) => state.mode);
  const theme = mode === "dark" ? darkTheme : lightTheme;

  useEffect(() => {
    refreshToken();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
      <ToastContainer />
    </ThemeProvider>
  );
};

// ✅ Only create root once
const container = document.getElementById("root");

if (!container._reactRoot) {
  container._reactRoot = createRoot(container);
}

container._reactRoot.render(<AppWithTheme />);
