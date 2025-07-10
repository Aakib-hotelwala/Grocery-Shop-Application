// src/pages/admin/UserList.jsx

import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  CircularProgress,
  TextField,
  FormControlLabel,
  Checkbox,
  Stack,
  Grid,
  useMediaQuery,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import useAuthStore from "../../../store/authStore";
import { get, patch } from "../../../services/endpoints";
import API_ROUTES from "../../../services/apiRoutes";

const GradientPaper = styled(Paper)(({ theme }) => ({
  background: theme.components?.custom?.cardGradient,
  boxShadow: theme.components?.custom?.cardShadow,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1),
  },
}));

const UserList = () => {
  const theme = useTheme();
  const currentUser = useAuthStore((state) => state.user);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const fetchUsers = async (searchTerm = "", role = "") => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (role) params.role = role;

      const data = await get(API_ROUTES.GET_ALL_USERS, params);
      setUsers(data?.users || []);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await patch(API_ROUTES.TOGGLE_USER_STATUS(id));
      setUsers((prev) =>
        prev.map((user) =>
          user._id === id ? { ...user, isActive: !user.isActive } : user
        )
      );
    } catch (err) {
      console.error("Failed to toggle user status", err);
    }
  };

  const handleToggleRole = async (id, currentRole) => {
    try {
      const newRole = currentRole === "admin" ? "user" : "admin";
      await patch(API_ROUTES.UPDATE_USER_ROLE(id), { role: newRole });
      setUsers((prev) =>
        prev.map((user) =>
          user._id === id ? { ...user, role: newRole } : user
        )
      );
    } catch (err) {
      console.error("Failed to toggle user role", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchUsers(search, roleFilter);
  }, [search, roleFilter]);

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>
        User Management
      </Typography>

      <GradientPaper sx={{ mb: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
        >
          {/* Search with maxWidth */}
          <Box sx={{ flexGrow: 1, maxWidth: 300, width: "100%" }}>
            <TextField
              label="Search Users"
              variant="outlined"
              size="small"
              fullWidth
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Box>

          {/* Role Filters */}
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            sx={{ mt: { xs: 1, sm: 0 } }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={roleFilter === "admin"}
                  onChange={(e) =>
                    setRoleFilter(e.target.checked ? "admin" : "")
                  }
                />
              }
              label="Only Admins"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={roleFilter === "user"}
                  onChange={(e) =>
                    setRoleFilter(e.target.checked ? "user" : "")
                  }
                  disabled={roleFilter === "admin"}
                />
              }
              label="Only Users"
            />
          </Stack>
        </Stack>
      </GradientPaper>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <GradientPaper>
          <Box sx={{ overflowX: "auto" }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar src={user.profileImageUrl} />
                          <Box>
                            <Typography>{user.name}</Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>{user.email}</TableCell>

                      <TableCell>{user.phoneNo}</TableCell>

                      <TableCell>
                        <Chip
                          label={user.role}
                          color={user.role === "admin" ? "success" : "info"}
                          variant="outlined"
                          sx={{
                            px: 1.5,
                            py: 0.5,
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            cursor:
                              user._id === currentUser._id
                                ? "not-allowed"
                                : "pointer",
                            opacity: user._id === currentUser._id ? 0.8 : 1,
                          }}
                          onClick={
                            user._id !== currentUser._id
                              ? () => handleToggleRole(user._id, user.role)
                              : undefined
                          }
                        />
                      </TableCell>

                      <TableCell align="center">
                        <Switch
                          checked={user.isActive}
                          onChange={() => handleToggleStatus(user._id)}
                          color="primary"
                          disabled={user._id === currentUser._id} // ✅ Disable for self
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </GradientPaper>
      )}
    </Box>
  );
};

export default UserList;
