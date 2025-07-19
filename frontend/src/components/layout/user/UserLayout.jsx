import { useEffect, useState } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

const UserLayout = () => {
  const theme = useTheme();

  const [rawSearch, setRawSearch] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setSearch(rawSearch);
    }, 500);

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
        <Outlet context={{ search, setSearch: setRawSearch }} />
      </Box>
    </Box>
  );
};

export default UserLayout;
