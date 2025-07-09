// main.jsx or index.jsx
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { ToastContainer } from "react-toastify";
import useThemeStore from "./store/themeStore";
import { lightTheme, darkTheme } from "./theme";

// 🔁 AppWithTheme wrapper applies current theme directly
const AppWithTheme = () => {
  const mode = useThemeStore((state) => state.mode);
  const theme = mode === "dark" ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
      <ToastContainer />
    </ThemeProvider>
  );
};

createRoot(document.getElementById("root")).render(<AppWithTheme />);
