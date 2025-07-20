import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Stack,
  Button,
  Box,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useEffect, useState } from "react";
import useCartStore from "../../store/cartStore";

const ProductCard = ({ product }) => {
  const {
    cart,
    addToCart,
    addItemLocally,
    updateCartItem,
    updateItemLocally,
    removeCartItem,
    removeItemLocally,
  } = useCartStore();

  const cartItem = cart.find(
    (item) =>
      item.productId?._id === product._id || item.productId === product._id
  );

  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = async () => {
    if (product.stock <= 0) return;

    addItemLocally({
      productId: product._id,
      quantity: 1,
      pricePerUnit: product.price,
    });

    await addToCart({ productId: product._id, quantity: 1 });
  };

  const handleIncrease = async () => {
    if (quantity < product.stock) {
      updateItemLocally(product._id, quantity + 1);
      await updateCartItem({ productId: product._id, quantity: quantity + 1 });
    }
  };

  const handleDecrease = async () => {
    if (quantity === 1) {
      removeItemLocally(product._id);
      await removeCartItem(product._id);
    } else if (quantity > 1) {
      updateItemLocally(product._id, quantity - 1);
      await updateCartItem({ productId: product._id, quantity: quantity - 1 });
    }
  };

  return (
    <Card
      sx={{
        width: 140,
        height: 230,
        mr: 1.5,
        boxShadow: 2,
        borderRadius: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
      }}
    >
      <CardMedia
        component="img"
        image={product?.images?.[0]?.url || ""}
        alt={product.name}
        sx={{
          height: 100,
          width: "100%",
          objectFit: "cover",
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
        }}
      />

      <CardContent
        sx={{
          p: 1,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            variant="body2"
            sx={{
              fontSize: 13,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontWeight: 600,
            }}
          >
            {product.name}
          </Typography>

          <Box mt={0.5}>
            <Typography
              variant="body2"
              sx={{ fontSize: 13, fontWeight: 500, color: "text.primary" }}
            >
              ₹{product.price}
            </Typography>
            <Typography
              variant="caption"
              color={product.stock > 0 ? "text.secondary" : "error"}
              sx={{ fontSize: 12 }}
            >
              {product.stock > 0 ? `Stock: ${product.stock}` : "Out of stock"}
            </Typography>
          </Box>
        </Box>

        {/* ✅ Action buttons */}
        <Box mt={1}>
          {quantity === 0 ? (
            <Button
              size="small"
              variant="outlined"
              fullWidth
              startIcon={<ShoppingCartIcon fontSize="small" />}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              sx={{
                borderRadius: "4px",
                textTransform: "none",
                fontSize: 12,
                py: 0.5,
              }}
            >
              Add
            </Button>
          ) : (
            <Stack
              direction="row"
              spacing={1}
              justifyContent="center"
              alignItems="center"
            >
              <IconButton size="small" onClick={handleDecrease} color="primary">
                <RemoveIcon fontSize="small" />
              </IconButton>
              <Typography fontSize={13} fontWeight="bold">
                {quantity}
              </Typography>
              <IconButton
                size="small"
                onClick={handleIncrease}
                color="primary"
                disabled={quantity >= product.stock}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Stack>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
