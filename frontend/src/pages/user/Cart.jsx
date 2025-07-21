import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Stack,
  useMediaQuery,
  useTheme,
  Snackbar,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

import useCartStore from "../../store/cartStore";
import { post } from "../../services/endpoints";
import API_ROUTES from "../../services/apiRoutes";

const Cart = () => {
  const {
    cart,
    loading,
    fetchCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    removeItemLocally,
    updateItemLocally,
  } = useCartStore();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [placingOrder, setPlacingOrder] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchCart();
  }, []);

  const handleQuantityChange = (item, change) => {
    const newQty = item.quantity + change;
    const productId = item.productId._id;

    if (newQty < 1) {
      removeItemLocally(productId);
      removeCartItem(productId);
    } else {
      updateItemLocally(productId, newQty);
      updateCartItem({ productId, quantity: newQty });
    }
  };

  const handleCheckout = async () => {
    try {
      setPlacingOrder(true);
      const orderData = {
        items: cart.map((item) => ({
          productId: item.productId._id,
          quantity: item.quantity,
        })),
        totalAmount: totalAmount,
      };

      const res = await post(API_ROUTES.PLACE_ORDER, orderData);
      setSnackbar({
        open: true,
        message: "✅ Order placed successfully!",
        severity: "success",
      });
      clearCart();
    } catch (error) {
      console.error("Order error:", error);
      setSnackbar({
        open: true,
        message: "❌ Failed to place order",
        severity: "error",
      });
    } finally {
      setPlacingOrder(false);
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      minHeight="100vh"
      overflow="hidden"
      px={{ xs: 1, sm: 3 }}
      py={4}
      maxWidth="1000px"
      mx="auto"
    >
      <Typography variant="h5" fontWeight={600} mb={3}>
        🛒 Shopping Cart
      </Typography>

      {cart.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          Your cart is empty.
        </Typography>
      ) : (
        <>
          <TableContainer
            component={Paper}
            sx={{
              overflowX: "auto",
              maxHeight: { xs: 360, sm: "none" },
              "& table": { minWidth: 600 },
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="center">Price</TableCell>
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell align="center">Subtotal</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cart.map((item) => {
                  const product = item.productId;
                  const imageUrl = product?.images?.[0]?.url || "";

                  return (
                    <TableRow key={item._id}>
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Box
                            component="img"
                            src={imageUrl}
                            alt={product.name}
                            sx={{
                              width: 60,
                              height: 60,
                              objectFit: "cover",
                              borderRadius: 1,
                            }}
                          />
                          <Stack spacing={0.5}>
                            <Typography
                              fontWeight={500}
                              noWrap
                              sx={{
                                maxWidth: { xs: 120, sm: 160 },
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {product.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color={
                                product.stock > 0 ? "text.secondary" : "error"
                              }
                            >
                              Stock: {product.stock}
                            </Typography>
                          </Stack>
                        </Stack>
                      </TableCell>

                      <TableCell align="center">₹{item.pricePerUnit}</TableCell>

                      <TableCell align="center">
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          justifyContent="center"
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(item, -1)}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <Typography>{item.quantity}</Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(item, 1)}
                            disabled={item.quantity >= product.stock}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>

                      <TableCell align="center">₹{item.subtotal}</TableCell>

                      <TableCell align="center">
                        <IconButton
                          color="error"
                          onClick={() => {
                            removeItemLocally(product._id);
                            removeCartItem(product._id);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Box
            mt={4}
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
            gap={2}
          >
            <Typography fontWeight={600} fontSize={18}>
              Total: ₹{totalAmount}
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              width={{ xs: "100%", sm: "auto" }}
            >
              <Button
                variant="outlined"
                color="error"
                onClick={clearCart}
                fullWidth
              >
                Clear Cart
              </Button>
              <Button
                variant="contained"
                color="primary"
                sx={{ color: "#fff" }}
                onClick={handleCheckout}
                disabled={placingOrder}
                fullWidth
              >
                {placingOrder ? "Placing Order..." : "Checkout"}
              </Button>
            </Stack>
          </Box>
        </>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Cart;
