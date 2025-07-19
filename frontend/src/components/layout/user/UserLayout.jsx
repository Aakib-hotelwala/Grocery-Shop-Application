import { useState } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

const UserLayout = () => {
  const isMobile = useMediaQuery("(max-width:768px)");
  const theme = useTheme();

  const [search, setSearch] = useState("");

  return (
    <Box
      display="flex"
      flexDirection="column"
      minHeight="100vh"
      width="100%"
      sx={{ overflowX: "hidden" }}
      bgcolor={theme.palette.background.default}
    >
      <Navbar search={search} setSearch={setSearch} />
      <Box
        component="main"
        flexGrow={1}
        p={{ xs: 2, sm: 3 }}
        sx={{
          width: "100%",
          maxWidth: "100vw", // prevent horizontal scroll
          overflowX: "hidden", // avoid scrollbars if any child overflows
        }}
      >
        <Outlet context={{ search, setSearch }} />
      </Box>
    </Box>
  );
};

export default UserLayout;
