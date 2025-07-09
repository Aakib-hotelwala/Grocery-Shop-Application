import { Box, Typography, Avatar, Paper } from "@mui/material";
import useAuthStore from "../../store/authStore";

const UserProfile = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <Paper elevation={2} sx={{ p: 3, maxWidth: 500, mx: "auto" }}>
      <Box textAlign="center">
        <Avatar
          src={user?.profileImageUrl}
          alt={user?.name}
          sx={{ width: 80, height: 80, mx: "auto", mb: 2 }}
        />
        <Typography variant="h5">{user?.name}</Typography>
        <Typography variant="body1" color="text.secondary">
          {user?.email}
        </Typography>
      </Box>
    </Paper>
  );
};

export default UserProfile;
