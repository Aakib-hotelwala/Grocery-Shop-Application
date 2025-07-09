import {
  Box,
  Typography,
  Avatar,
  Paper,
  Divider,
  Grid,
  Chip,
  Stack,
} from "@mui/material";
import useAuthStore from "../../../store/authStore";
import { useTheme } from "@mui/material/styles";
import { format } from "date-fns";

const AdminProfile = () => {
  const user = useAuthStore((state) => state.user);
  const theme = useTheme();

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="calc(100vh - 120px)"
      p={2}
    >
      <Paper
        elevation={4}
        sx={{
          p: { xs: 3, sm: 4 },
          width: "100%",
          maxWidth: 700,
          borderRadius: 3,
          bgcolor: theme.palette.background.paper,
        }}
      >
        {/* Profile Header */}
        <Box textAlign="center" mb={4}>
          <Avatar
            src={user?.profileImageUrl}
            alt={user?.name}
            sx={{
              width: 100,
              height: 100,
              mx: "auto",
              mb: 2,
              boxShadow: 3,
            }}
            imgProps={{ style: { objectFit: "cover" } }}
          />
          <Typography variant="h5" fontWeight={600}>
            {user?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {user?.email}
          </Typography>
          <Chip
            label={user?.role?.toUpperCase()}
            color="primary"
            size="small"
            sx={{ mt: 1 }}
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Profile Details */}
        <Box>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            color="text.primary"
            gutterBottom
          >
            Personal Details
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Stack spacing={0.5}>
                <Typography variant="subtitle2" color="text.secondary">
                  Phone Number
                </Typography>
                <Typography variant="body1">
                  {user?.phoneNo || "N/A"}
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Stack spacing={0.5}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={user?.isActive ? "Active" : "Inactive"}
                  color={user?.isActive ? "success" : "error"}
                  size="small"
                />
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Stack spacing={0.5}>
                <Typography variant="subtitle2" color="text.secondary">
                  Account Created
                </Typography>
                <Typography variant="body1">
                  {format(new Date(user?.createdAt), "dd MMM yyyy")}
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Stack spacing={0.5}>
                <Typography variant="subtitle2" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body1">
                  {format(new Date(user?.updatedAt), "dd MMM yyyy")}
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminProfile;
