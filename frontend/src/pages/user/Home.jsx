import { useEffect, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { get } from "../../services/endpoints";
import API_ROUTES from "../../services/apiRoutes";
import { useOutletContext } from "react-router-dom";
import CategoryRow from "../../components/common/CategoryRow";

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [groupedProducts, setGroupedProducts] = useState({});
  const { search } = useOutletContext();

  const groupByCategory = (products) => {
    const grouped = {};
    for (let p of products) {
      const category = p?.categoryId?.name || "Uncategorized";
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(p);
    }
    return grouped;
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.keyword = search;

      const data = await get(API_ROUTES.GET_ALL_PRODUCTS, params);
      const grouped = groupByCategory(data?.products || []);
      setGroupedProducts(grouped);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  return (
    <Box px={2} py={2}>
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {Object.keys(groupedProducts).length === 0 ? (
            <Typography>No products found.</Typography>
          ) : (
            Object.entries(groupedProducts).map(([category, items]) => (
              <CategoryRow key={category} title={category} products={items} />
            ))
          )}
        </>
      )}
    </Box>
  );
};

export default Home;
