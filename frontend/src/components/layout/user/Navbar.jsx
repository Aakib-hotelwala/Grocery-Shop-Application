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
  Badge,
  Divider,
  useTheme,
  useMediaQuery,
  Paper,
  InputBase,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import { FaUserCircle } from "react-icons/fa";
import { FiMoon, FiSun } from "react-icons/fi";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../../store/authStore";
import useThemeStore from "../../../store/themeStore";

const Navbar = ({ search, setSearch }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:600px)");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const [showMobileSearch, setShowMobileSearch] = useState(false);

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
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box
            component="img"
            src="/Logo-2.png"
            alt="Grocery Shop Logo"
            onClick={() => navigate("/user/home")}
            sx={{
              height: { xs: 70, sm: 80 },
              width: "auto",
              cursor: "pointer",
              px: 1,
              objectFit: "contain",
            }}
          />

          {!isMobile ? (
            <Paper
              component="form"
              onSubmit={(e) => e.preventDefault()}
              elevation={0}
              sx={{
                display: "flex",
                alignItems: "center",
                px: 1.5,
                py: 0.5,
                borderRadius: "20px",
                bgcolor: "transparent",
                boxShadow: "none",
                border: "1px solid",
                borderColor: "divider",
                maxWidth: 300,
                width: "100%",
                transition: "border-color 0.2s",
                "&:focus-within": {
                  borderColor: "primary.main",
                },
              }}
            >
              <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />

              <InputBase
                placeholder="Search products..."
                fullWidth
                sx={{ fontSize: 14 }}
                inputProps={{ "aria-label": "search" }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {search && (
                <ClearIcon
                  onClick={() => setSearch("")}
                  sx={{
                    ml: 1,
                    cursor: "pointer",
                    fontSize: 20,
                    color: "text.secondary",
                    "&:hover": { color: "text.primary" },
                  }}
                />
              )}
            </Paper>
          ) : showMobileSearch ? (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                bgcolor: "background.paper",
                zIndex: 1301,
                p: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <SearchIcon />
              <InputBase
                autoFocus
                placeholder="Search products..."
                fullWidth
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ fontSize: 16 }}
              />
              <IconButton onClick={() => setShowMobileSearch(false)}>
                ✖
              </IconButton>
            </Box>
          ) : null}

          <Box display="flex" alignItems="center" gap={2}>
            {isMobile && (
              <IconButton onClick={() => setShowMobileSearch(true)}>
                <SearchIcon />
              </IconButton>
            )}

            {/* Cart */}
            <IconButton color="inherit" onClick={() => navigate("/user/cart")}>
              <Badge badgeContent={0} color="primary">
                <AiOutlineShoppingCart size={24} />
              </Badge>
            </IconButton>

            {/* Avatar */}
            <IconButton onClick={toggleDrawer(true)} sx={{ p: 0 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  overflow: "hidden",
                  bgcolor: theme.palette.primary.main,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {user?.profileImageUrl ? (
                  <Avatar
                    src={user.profileImageUrl}
                    alt={user.name}
                    sx={{ width: "100%", height: "100%" }}
                  />
                ) : (
                  <FaUserCircle color="#fff" size={20} />
                )}
              </Box>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Right Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          width={250}
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <Box textAlign="center" mb={2}>
            {user?.profileImageUrl ? (
              <Avatar
                src={user.profileImageUrl}
                alt={user.name}
                sx={{ width: 64, height: 64, mx: "auto" }}
              />
            ) : (
              <FaUserCircle
                size={64}
                style={{
                  color: theme.palette.text.secondary,
                  margin: "0 auto",
                }}
              />
            )}
            <Typography variant="h6" mt={1}>
              {user?.name || "User"}
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

          <List>
            <ListItem button onClick={() => navigate("/user/profile")}>
              <ListItemText primary="Profile" />
            </ListItem>
            <ListItem button onClick={toggleTheme}>
              <ListItemText
                primary={mode === "light" ? "Dark Mode" : "Light Mode"}
              />
              {mode === "light" ? <FiMoon size={20} /> : <FiSun size={20} />}
            </ListItem>
            <ListItem button onClick={handleLogout}>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
