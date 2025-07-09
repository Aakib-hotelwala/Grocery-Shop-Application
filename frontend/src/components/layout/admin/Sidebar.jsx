import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
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
          backgroundColor: "#f5f5f5",
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
                    backgroundColor: "#e0f2f1",
                    fontWeight: "bold",
                    color: "primary.main",
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
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
