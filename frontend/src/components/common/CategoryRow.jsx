import { Box, Typography } from "@mui/material";
import ProductCard from "./ProductCard";

const CategoryRow = ({ title, products }) => {
  return (
    <Box mb={4}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ display: "flex", overflowX: "auto", pb: 1 }}>
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </Box>
    </Box>
  );
};

export default CategoryRow;
