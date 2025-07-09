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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../../store/authStore";
import { FaUserCircle } from "react-icons/fa";

const Navbar = ({ onMenuClick, showMenu }) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const toggleDrawer = (open) => () => setDrawerOpen(open);

  const handleLogout = () => {
    logout();
    localStorage.clear();
    navigate("/login");
  };

  const avatarSize = isMobile ? 32 : 36;

  return (
    <>
      <AppBar
        position="static"
        elevation={1}
        sx={{
          bgcolor: "#ffffff",
          color: "#00796B",
          borderBottom: "1px solid #e0e0e0",
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
                width: avatarSize + 4, // Slightly larger
                height: avatarSize + 4,
                borderRadius: "50%",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#00796B",
                minWidth: avatarSize + 4, // Prevent shrinking in flexbox
              }}
            >
              {user?.profileImageUrl ? (
                <Avatar
                  src={user.profileImageUrl}
                  alt={user?.name || "Admin"}
                  sx={{
                    width: "100%",
                    height: "100%",
                  }}
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
            bgcolor: "#f9f9f9",
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
                  color: "#888",
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
            <ListItem button onClick={() => navigate("/admin/profile")}>
              <ListItemText primary="Profile" />
            </ListItem>
            <ListItem button onClick={handleLogout}>
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
