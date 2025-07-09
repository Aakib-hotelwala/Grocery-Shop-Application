import { useState } from "react";
import { Box, useMediaQuery } from "@mui/material";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  const isMobile = useMediaQuery("(max-width:768px)");
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box
      display="flex"
      flexDirection={isMobile ? "column" : "row"}
      minHeight="100vh"
      bgcolor="#f0fdf4"
    >
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={handleDrawerToggle}
        isMobile={isMobile}
      />
      <Box flexGrow={1} display="flex" flexDirection="column">
        <Navbar onMenuClick={handleDrawerToggle} showMenu={isMobile} />
        <Box component="main" p={{ xs: 2, sm: 3 }} flexGrow={1}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
