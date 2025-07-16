import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  IconButton,
  Stack,
  CircularProgress,
  Button,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  Autocomplete,
} from "@mui/material";
import { Add, Remove, Delete, ShoppingCart, Close } from "@mui/icons-material";
import { get, post } from "../../../services/endpoints";
import API_ROUTES from "../../../services/apiRoutes";
import { toast } from "react-toastify";

const ManualSale = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [productQuantities, setProductQuantities] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [openCart, setOpenCart] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await get(API_ROUTES.GET_ALL_CATEGORIES);
        const active = res.categories.filter((cat) => cat.isActive);
        setCategories(active);
      } catch (err) {
        toast.error("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  const fetchProducts = async (keyword = "", categoryId = null) => {
    setLoading(true);
    try {
      const params = {};
      if (keyword) params.keyword = keyword;
      if (categoryId) params.categoryId = categoryId;

      const data = await get(API_ROUTES.GET_ALL_PRODUCTS, params);
      const filtered = (data.products || []).filter(
        (p) => p.isActive && p.stock > 0
      );

      const updated = filtered.map((p) => ({
        ...p,
        quantity: productQuantities[p._id] || 0,
      }));

      setProducts(updated);
    } catch (err) {
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchProducts(search, selectedCategory);
    }, 300);
    return () => clearTimeout(delay);
  }, [search, selectedCategory]);

  const updateQuantity = (productId, change, maxStock) => {
    setProductQuantities((prev) => {
      const current = prev[productId] || 0;
      const newQty = current + change;
      if (newQty < 0 || newQty > maxStock) return prev;

      // Get product data from either product list or cart
      const product =
        products.find((p) => p._id === productId) ||
        cartItems.find((p) => p._id === productId);

      if (!product) return prev;

      // Update or insert into cart
      setCartItems((prevCart) => {
        const exists = prevCart.find((item) => item._id === productId);
        if (exists) {
          return prevCart.map((item) =>
            item._id === productId ? { ...item, quantity: newQty } : item
          );
        } else {
          return [...prevCart, { ...product, quantity: newQty }];
        }
      });

      return { ...prev, [productId]: newQty };
    });
  };

  const clearQuantity = (productId) => {
    setProductQuantities((prev) => {
      const updated = { ...prev };
      delete updated[productId];
      return updated;
    });

    setCartItems((prev) => prev.filter((item) => item._id !== productId));
  };

  const selectedItems = cartItems.filter((item) => item.quantity > 0);

  const totalAmount = selectedItems.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0
  );

  const handleSubmit = async () => {
    if (selectedItems.length === 0) return toast.warn("No items selected");

    const payload = {
      products: selectedItems.map((p) => ({
        productId: p._id,
        quantity: p.quantity,
      })),
    };

    try {
      await post(API_ROUTES.RECORD_MANUAL_SALE, payload);
      toast.success("Manual sale recorded");
      setProductQuantities({});
      fetchProducts(search);

      setProductQuantities({});
      setCartItems([]);
      fetchProducts(search, selectedCategory);

      setOpenCart(false);
    } catch (err) {
      toast.error("Failed to record manual sale");
    }
  };

  return (
    <Box p={2}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems="center"
        mb={2}
      >
        {/* Category Filter */}
        <Autocomplete
          options={categories}
          size="small"
          fullWidth
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(option, value) => option._id === value._id}
          value={categories.find((cat) => cat._id === selectedCategory) || null}
          onChange={(e, value) => {
            setSelectedCategory(value ? value._id : null);
          }}
          renderOption={(props, option) => (
            <Box
              component="li"
              {...props}
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Avatar
                src={option.image?.url}
                sx={{ width: 30, height: 30 }}
                variant="rounded"
              />
              <Typography>{option.name}</Typography>
            </Box>
          )}
          renderInput={(params) => (
            <TextField {...params} label="Filter by Category" />
          )}
          sx={{ flex: 1 }}
        />

        {/* Product Search */}
        <TextField
          fullWidth
          label="Search Products"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1 }}
          slotProps={{
            input: {
              endAdornment: search && (
                <IconButton size="small" onClick={() => setSearch("")}>
                  <Close fontSize="small" />
                </IconButton>
              ),
            },
          }}
        />

        {/* Cart Icon */}
        <IconButton color="primary" onClick={() => setOpenCart(true)}>
          <Badge badgeContent={selectedItems.length} color="error">
            <ShoppingCart />
          </Badge>
        </IconButton>
      </Stack>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper>
          <Typography variant="subtitle1" px={2} py={1}>
            All Products
          </Typography>
          <Divider />
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Subtotal</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => {
                  const qty = productQuantities[product._id] || 0;
                  return (
                    <TableRow key={product._id}>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar src={product.images?.[0]?.url} />
                          <Typography>{product.name}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>₹{product.price}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <IconButton
                            onClick={() =>
                              updateQuantity(product._id, -1, product.stock)
                            }
                          >
                            <Remove />
                          </IconButton>
                          <Typography>{qty}</Typography>
                          <IconButton
                            onClick={() =>
                              updateQuantity(product._id, 1, product.stock)
                            }
                          >
                            <Add />
                          </IconButton>
                        </Stack>
                      </TableCell>
                      <TableCell>₹{product.price * qty}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="error"
                          onClick={() => clearQuantity(product._id)}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Cart Dialog */}
      <Dialog
        open={openCart}
        onClose={() => setOpenCart(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Selected Products</DialogTitle>
        <DialogContent dividers>
          {selectedItems.length === 0 ? (
            <Typography>No products selected</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Subtotal</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedItems.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar src={product.images?.[0]?.url} />
                        <Typography>{product.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>₹{product.price}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <IconButton
                          onClick={() =>
                            updateQuantity(product._id, -1, product.stock)
                          }
                        >
                          <Remove />
                        </IconButton>
                        <Typography>{product.quantity}</Typography>
                        <IconButton
                          onClick={() =>
                            updateQuantity(product._id, 1, product.stock)
                          }
                        >
                          <Add />
                        </IconButton>
                      </Stack>
                    </TableCell>
                    <TableCell>₹{product.price * product.quantity}</TableCell>
                    <TableCell>
                      <IconButton
                        color="error"
                        onClick={() => clearQuantity(product._id)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions>
          <Typography flexGrow={1} ml={2}>
            Total: ₹{totalAmount}
          </Typography>
          <Button onClick={() => setOpenCart(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleSubmit}
            disabled={selectedItems.length === 0}
            sx={{ mt: { xs: 1, sm: 0 }, color: "#fff" }}
          >
            Submit Sale
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManualSale;
