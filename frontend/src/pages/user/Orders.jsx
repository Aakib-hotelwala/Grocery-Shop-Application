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
  CircularProgress,
  Chip,
  IconButton,
  Collapse,
  Stack,
} from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  PictureAsPdf,
} from "@mui/icons-material";
import { get } from "../../services/endpoints";
import API_ROUTES from "../../services/apiRoutes";
import { generateInvoicePdf } from "../../services/download";

const handleDownloadPdf = (order) => {
  try {
    generateInvoicePdf(order);
  } catch (error) {
    console.error("PDF generation failed:", error);
  }
};

const OrderRow = ({ order }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
          {order._id.slice(-6).toUpperCase()}
        </TableCell>
        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
        <TableCell>
          <Chip
            label={order.status}
            color={
              order.status === "delivered"
                ? "success"
                : order.status === "cancelled"
                ? "error"
                : "warning"
            }
            variant="outlined"
            size="small"
          />
        </TableCell>
        <TableCell align="right">₹{order.totalAmount}</TableCell>
        <TableCell align="right">
          <IconButton
            onClick={() => handleDownloadPdf(order)}
            title="Download PDF"
          >
            <PictureAsPdf color="primary" />
          </IconButton>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell colSpan={5} sx={{ p: 0, borderBottom: "none" }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box px={3} py={2} bgcolor="background.default">
              <Typography variant="subtitle1" gutterBottom>
                Products:
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.products.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>₹{item.pricePerUnit}</TableCell>
                      <TableCell>₹{item.subtotal}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await get(API_ROUTES.GET_MY_ORDERS);
      setOrders(res.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      px={{ xs: 1, sm: 3 }}
      py={4}
      maxWidth="1000px"
      mx="auto"
      minHeight="100vh"
    >
      <Typography variant="h5" fontWeight={600} mb={3}>
        📦 My Orders
      </Typography>

      {orders.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          You haven’t placed any orders yet.
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Total (₹)</TableCell>
                <TableCell align="right">Invoice</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <OrderRow key={order._id} order={order} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Order;
