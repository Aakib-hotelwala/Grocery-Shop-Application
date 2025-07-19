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
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";

const ProductCard = ({ product }) => {
  const [quantity, setQuantity] = useState(0);

  const handleAddToCart = () => {
    setQuantity(1);
    // Add to cart logic here
  };

  const increase = () => {
    setQuantity((prev) => prev + 1);
    // Update cart logic
  };

  const decrease = () => {
    if (quantity === 1) {
      setQuantity(0);
      // Remove from cart logic
    } else {
      setQuantity((prev) => prev - 1);
      // Update cart logic
    }
  };

  return (
    <Card
      sx={{
        width: 140,
        height: 210,
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

          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography
              variant="body2"
              sx={{ fontSize: 13, fontWeight: 500, color: "text.secondary" }}
            >
              ₹{product.price}
            </Typography>

            {quantity > 0 && (
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "green",
                  bgcolor: "green.50",
                  px: 0.6,
                  py: 0.1,
                  borderRadius: 1,
                }}
              >
                Subtotal: ₹{product.price * quantity}
              </Typography>
            )}
          </Stack>
        </Box>

        <Box mt={1}>
          {quantity === 0 ? (
            <Button
              size="small"
              variant="outlined"
              fullWidth
              startIcon={<ShoppingCartIcon fontSize="small" />}
              onClick={handleAddToCart}
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
              <IconButton size="small" onClick={decrease} color="primary">
                <RemoveIcon fontSize="small" />
              </IconButton>
              <Typography fontSize={13} fontWeight="bold">
                {quantity}
              </Typography>
              <IconButton size="small" onClick={increase} color="primary">
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
