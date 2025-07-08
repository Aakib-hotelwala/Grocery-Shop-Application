// components/common/RoleRedirect.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const RoleRedirect = () => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      if (user?.role === "admin") navigate("/admin/dashboard");
      else if (user?.role === "user") navigate("/user/home");
      else navigate("/unauthorized");
    }
  }, [isAuthenticated, user, navigate]);

  return null; // No UI — it just redirects
};

export default RoleRedirect;
