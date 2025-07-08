// components/common/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user?.role))
    return <Navigate to="/unauthorized" />;

  return children;
};

export default ProtectedRoute;
