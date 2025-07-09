import { Box, Grid, Paper, Typography } from "@mui/material";

const stats = [
  { label: "Total Users", value: 340, color: "#81C784" },
  { label: "Total Products", value: 128, color: "#64B5F6" },
  { label: "Total Orders", value: 245, color: "#FFD54F" },
  { label: "Revenue", value: "₹1,24,000", color: "#E57373" },
];

const DashboardHome = () => {
  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3} color="primary">
        Admin Dashboard
      </Typography>

      <Grid container spacing={3}>
        {stats.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.label}>
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
