import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
} from "@mui/material";
import {
  Dashboard,
  Category,
  ShoppingCart,
  Group,
  InsertChart,
  Inventory,
} from "@mui/icons-material";
import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Dashboard", icon: <Dashboard />, path: "/admin/dashboard" },
  { label: "Users", icon: <Group />, path: "/admin/users" },
  { label: "Products", icon: <Inventory />, path: "/admin/products" },
  { label: "Categories", icon: <Category />, path: "/admin/categories" },
  { label: "Orders", icon: <ShoppingCart />, path: "/admin/orders" },
  { label: "Analytics", icon: <InsertChart />, path: "/admin/analytics" },
];

const Sidebar = ({ mobileOpen, onClose, isMobile }) => {
  const theme = useTheme();

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      anchor="left"
      open={isMobile ? mobileOpen : true}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // better mobile performance
      }}
      sx={{
        width: 220,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 220,
          boxSizing: "border-box",
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <Box sx={{ mt: 2 }}>
        <List>
          {navItems.map((item) => (
            <ListItem key={item.label} disablePadding>
              <ListItemButton
                component={NavLink}
                to={item.path}
                onClick={isMobile ? onClose : undefined}
                sx={{
                  "&.active": {
                    backgroundColor: theme.palette.action.selected,
                    fontWeight: "bold",
                    color: theme.palette.primary.main,
                    "& .MuiListItemIcon-root": {
                      color: theme.palette.primary.main,
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ color: "inherit" }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
