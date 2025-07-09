import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../../store/authStore";
import { FaUserCircle } from "react-icons/fa";
import { FiMoon, FiSun } from "react-icons/fi";
import useThemeStore from "../../../store/themeStore";

const Navbar = ({ onMenuClick, showMenu }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:600px)");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const mode = useThemeStore((state) => state.mode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const toggleDrawer = (open) => () => setDrawerOpen(open);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const avatarSize = isMobile ? 32 : 36;

  return (
    <>
      <AppBar
        position="static"
        elevation={1}
        sx={{
          bgcolor: theme.palette.background.paper,
          color: theme.palette.primary.main,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar
          sx={{
            justifyContent: "space-between",
            px: { xs: 1, sm: 2 },
          }}
        >
          {/* Left side: logo + menu icon */}
          <Box display="flex" alignItems="center">
            {showMenu && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={onMenuClick}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography
              variant="h6"
              fontWeight={700}
              fontSize={{ xs: "1rem", sm: "1.2rem" }}
            >
              Admin Panel
            </Typography>
          </Box>

          {/* Right side - Profile Avatar */}
          <IconButton onClick={toggleDrawer(true)} sx={{ p: 0 }}>
            <Box
              sx={{
                width: avatarSize + 4,
                height: avatarSize + 4,
                borderRadius: "50%",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: theme.palette.primary.main,
                minWidth: avatarSize + 4,
              }}
            >
              {user?.profileImageUrl ? (
                <Avatar
                  src={user.profileImageUrl}
                  alt={user?.name || "Admin"}
                  sx={{ width: "100%", height: "100%" }}
                  imgProps={{
                    loading: "lazy",
                    style: { objectFit: "cover" },
                  }}
                />
              ) : (
                <FaUserCircle
                  style={{
                    color: "#fff",
                    fontSize: avatarSize * 0.9,
                  }}
                />
              )}
            </Box>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Right Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          width={250}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            bgcolor: theme.palette.background.paper,
          }}
        >
          {/* Profile Section */}
          <Box textAlign="center" mb={2}>
            {user?.profileImageUrl ? (
              <Avatar
                src={user.profileImageUrl}
                alt={user.name}
                sx={{ width: 64, height: 64, margin: "0 auto" }}
              />
            ) : (
              <FaUserCircle
                size={64}
                style={{
                  color: theme.palette.text.secondary,
                  margin: "0 auto",
                  display: "block",
                }}
              />
            )}
            <Typography variant="h6" mt={1}>
              {user?.name || "Admin"}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ wordBreak: "break-word", px: 1 }}
            >
              {user?.email}
            </Typography>
          </Box>

          <Divider />

          {/* Drawer Links */}
          <List>
            <ListItem
              button
              onClick={() => navigate("/admin/profile")}
              sx={{ cursor: "pointer" }}
            >
              <ListItemText primary="Profile" />
            </ListItem>

            {/* 🌗 Theme Toggle */}
            <ListItem button onClick={toggleTheme} sx={{ cursor: "pointer" }}>
              <ListItemText
                primary={mode === "light" ? "Dark Mode" : "Light Mode"}
              />
              {mode === "light" ? <FiMoon size={20} /> : <FiSun size={20} />}
            </ListItem>

            <ListItem button onClick={handleLogout} sx={{ cursor: "pointer" }}>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>

          <Box flexGrow={1} />

          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            mt={2}
          >
            © Grocery Admin
          </Typography>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
