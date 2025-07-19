import { useEffect, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { get } from "../../services/endpoints";
import API_ROUTES from "../../services/apiRoutes";
import { useOutletContext } from "react-router-dom";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const { search, setSearch } = useOutletContext();

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

  useEffect(() => {
    fetchProducts(search);
  }, [search]);

  return (
    <Box>
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Box mt={2}>
          <Typography variant="h6" gutterBottom>
            Products
          </Typography>
          {products.length === 0 ? (
            <Typography>No products found.</Typography>
          ) : (
            <ul>
              {products.map((product) => (
                <li key={product._id}>{product.name}</li>
              ))}
            </ul>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Home;
