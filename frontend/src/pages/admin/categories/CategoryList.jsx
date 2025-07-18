// src/pages/admin/CategoryList.jsx

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  Avatar,
  Chip,
  TextField,
  CircularProgress,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { get, patch, del } from "../../../services/endpoints";
import API_ROUTES from "../../../services/apiRoutes";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const GradientPaper = styled(Paper)(({ theme }) => ({
  background: theme.components?.custom?.cardGradient,
  boxShadow: theme.components?.custom?.cardShadow,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1),
  },
}));

const CategoryList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const fetchCategories = async (keyword = "") => {
    setLoading(true);
    try {
      const params = {};
      if (keyword) params.keyword = keyword;
      const data = await get(API_ROUTES.GET_ALL_CATEGORIES, params);

      // Flatten main categories and subcategories into one list
      const flat = [];
      data?.categories?.forEach((main) => {
        flat.push({ ...main, parent: null }); // main category
        main.subcategories?.forEach((sub) => {
          flat.push({ ...sub, parent: main }); // subcategory with reference to parent
        });
      });

      setCategories(flat);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await patch(API_ROUTES.TOGGLE_CATEGORY_STATUS(id));
      setCategories((prev) =>
        prev.map((cat) =>
          cat._id === id ? { ...cat, isActive: !cat.isActive } : cat
        )
      );
    } catch (err) {
      console.error("Failed to toggle status", err);
    }
  };

  const handleDeleteCategory = (id) => {
    setCategoryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await del(API_ROUTES.DELETE_CATEGORY(categoryToDelete));
      setCategories((prev) =>
        prev.filter((cat) => cat._id !== categoryToDelete)
      );
    } catch (err) {
      console.error("Failed to delete category", err);
    } finally {
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchCategories(search);
  }, [search]);

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>
        Category Management
      </Typography>

      <GradientPaper sx={{ mb: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
        >
          <Box sx={{ flexGrow: 1, maxWidth: 300, width: "100%" }}>
            <TextField
              label="Search Categories"
              variant="outlined"
              size="small"
              fullWidth
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Box>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate("/admin/categories/create")}
            sx={{ borderRadius: 2, mt: { xs: 1, sm: 0 }, color: "#fff" }}
          >
            Create Category
          </Button>
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
                    <TableCell>Category</TableCell>
                    <TableCell>Parent Category</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories.map((cat) => (
                    <TableRow key={cat._id}>
                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={1.5}
                          alignItems="center"
                        >
                          <Avatar src={cat.image?.url} />
                          <Typography>{cat.name}</Typography>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        {cat.parent ? (
                          <Chip
                            label={cat.parent.name}
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        ) : (
                          "-"
                        )}
                      </TableCell>

                      <TableCell>
                        <Switch
                          checked={cat.isActive}
                          onChange={() => handleToggleStatus(cat._id)}
                          color="primary"
                        />
                      </TableCell>

                      <TableCell align="center">
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="center"
                        >
                          <IconButton
                            color="info"
                            onClick={() =>
                              navigate(`/admin/categories/${cat._id}/edit`)
                            }
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteCategory(cat._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </GradientPaper>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this category?
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            color="secondary"
            sx={{ color: "#fff" }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            sx={{ color: "#fff" }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoryList;
