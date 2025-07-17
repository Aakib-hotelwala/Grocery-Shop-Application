import { Box, Grid, Paper, Typography, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { get } from "../../../services/endpoints";
import API_ROUTES from "../../../services/apiRoutes";

const DashboardHome = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await get(API_ROUTES.ADMIN_STATS);
        const { totalUsers, totalProducts, totalOrders, totalRevenue } = res;

        setStats([
          { label: "Total Users", value: totalUsers, color: "#81C784" },
          { label: "Total Products", value: totalProducts, color: "#64B5F6" },
          { label: "Total Orders", value: totalOrders, color: "#FFD54F" },
          {
            label: "Revenue",
            value: `₹${totalRevenue.toLocaleString()}`,
            color: "#E57373",
          },
        ]);
      } catch (err) {
        console.error("Failed to load dashboard stats:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box mt={5} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3} color="primary">
        Admin Dashboard
      </Typography>

      <Grid container spacing={3} columns={{ xs: 12, sm: 12, md: 12 }}>
        {stats?.map((item) => (
          <Grid
            key={item.label}
            sx={{
              gridColumn: {
                xs: "span 12",
                sm: "span 6",
                md: "span 3",
              },
            }}
          >
            <Paper
              elevation={4}
              sx={{
                p: 3,
                textAlign: "center",
                borderRadius: 2,
                background: item.color,
                color: "#fff",
              }}
            >
              <Typography variant="h6">{item.label}</Typography>
              <Typography variant="h4" fontWeight={800} mt={1}>
                {item.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DashboardHome;
