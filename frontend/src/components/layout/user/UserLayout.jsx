import { useEffect, useState } from "react";
import { Box, useTheme } from "@mui/material";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

const UserLayout = () => {
  const theme = useTheme();

  const [rawSearch, setRawSearch] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const trimmed = rawSearch.trim();

    const delayDebounce = setTimeout(() => {
      setSearch(trimmed);
    }, 400); // Slightly faster debounce

    return () => clearTimeout(delayDebounce);
  }, [rawSearch]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      minHeight="100vh"
      width="100%"
      sx={{ overflowX: "hidden" }}
      bgcolor={theme.palette.background.default}
    >
      <Navbar search={rawSearch} setSearch={setRawSearch} />
      <Box
        component="main"
        flexGrow={1}
        p={{ xs: 2, sm: 3 }}
        sx={{
          width: "100%",
          maxWidth: "100vw",
          overflowX: "hidden",
        }}
      >
        <Outlet context={{ search }} />
      </Box>
    </Box>
  );
};

export default UserLayout;
