// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import RoleRedirect from "../components/common/RoleRedirect";
import ProtectedRoute from "../components/common/ProtectedRoute";
import AdminRoutes from "./AdminRoutes";
import UserRoutes from "./UserRoutes";
import NotFound from "../components/common/NotFound";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Role-Based Redirect after login */}
      <Route path="/" element={<RoleRedirect />} />

      {/* Admin and User routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute role="admin">
            <AdminRoutes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/*"
        element={
          <ProtectedRoute role="user">
            <UserRoutes />
          </ProtectedRoute>
        }
      />

      {/* Fallback route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
