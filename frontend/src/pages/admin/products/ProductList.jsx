// src/pages/admin/products/ProductList.jsx

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
  TextField,
  CircularProgress,
  Stack,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { get, patch, del } from "../../../services/endpoints";
import API_ROUTES from "../../../services/apiRoutes";
import { useNavigate } from "react-router-dom";
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

const ProductList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const fetchProducts = async (keyword = "") => {
    setLoading(true);
    try {
      const params = {};
      if (keyword) params.keyword = keyword;
      const data = await get(API_ROUTES.GET_ALL_PRODUCTS, params);
      setProducts(data?.products || []);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await patch(API_ROUTES.TOGGLE_PRODUCT_STATUS(id));
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, isActive: !p.isActive } : p))
      );
    } catch (err) {
      console.error("Failed to toggle product status", err);
    }
  };

  const handleDeleteProduct = (id) => {
    setProductToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await del(API_ROUTES.DELETE_PRODUCT(productToDelete));
      setProducts((prev) =>
        prev.filter((prod) => prod._id !== productToDelete)
      );
    } catch (err) {
      console.error("Failed to delete product", err);
    } finally {
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchProducts(search);
  }, [search]);

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>
        Product Management
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
              label="Search Products"
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
            onClick={() => navigate("/admin/products/create")}
            sx={{ borderRadius: 2, mt: { xs: 1, sm: 0 }, color: "#fff" }}
          >
            Create Product
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
                    <TableCell>Product</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Selling Price</TableCell>
                    <TableCell>Purchase Price</TableCell>
                    <TableCell>Stock</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={1.5}
                          alignItems="center"
                        >
                          <Avatar src={product.images?.[0]?.url} />
                          <Typography>{product.name}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{product.categoryId?.name || "-"}</TableCell>
                      <TableCell>₹{product.price}</TableCell>
                      <TableCell>₹{product.purchasePrice}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        <Switch
                          checked={product.isActive}
                          onChange={() => handleToggleStatus(product._id)}
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
                              navigate(`/admin/products/${product._id}/edit`)
                            }
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteProduct(product._id)}
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
          Are you sure you want to delete this product? This action cannot be
          undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="secondary">
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

export default ProductList;
