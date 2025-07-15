// src/routes/AdminRoutes.jsx
import { Routes, Route } from "react-router-dom";
import AdminLayout from "../components/layout/admin/AdminLayout";
import DashboardHome from "../pages/admin/dashboard/DashboardHome";
import UserList from "../pages/admin/users/UserList";
import UserEdit from "../pages/admin/users/UserEdit";
import ProductList from "../pages/admin/products/ProductList";
import ProductCreate from "../pages/admin/products/ProductCreate";
import ProductEdit from "../pages/admin/products/ProductEdit";
import CategoryList from "../pages/admin/categories/CategoryList";
import CategoryCreate from "../pages/admin/categories/CategoryCreate";
import CategoryEdit from "../pages/admin/categories/CategoryEdit";
import OrderList from "../pages/admin/orders/OrderList";
import OrderDetail from "../pages/admin/orders/OrderDetail";
import AnalyticsDashboard from "../pages/admin/analytics/AnalyticsDashboard";
import AdminProfile from "../pages/admin/profile/AdminProfile";
import ManualSale from "../pages/admin/analytics/ManualSale";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="dashboard" element={<DashboardHome />} />

        <Route path="profile" element={<AdminProfile />} />

        {/* Users */}
        <Route path="users" element={<UserList />} />
        <Route path="users/:id/edit" element={<UserEdit />} />

        {/* Products */}
        <Route path="products" element={<ProductList />} />
        <Route path="products/create" element={<ProductCreate />} />
        <Route path="products/:id/edit" element={<ProductEdit />} />

        {/* Categories */}
        <Route path="categories" element={<CategoryList />} />
        <Route path="categories/create" element={<CategoryCreate />} />
        <Route path="categories/:id/edit" element={<CategoryEdit />} />

        {/* Orders */}
        <Route path="orders" element={<OrderList />} />
        <Route path="orders/:id" element={<OrderDetail />} />

        {/* Analytics */}
        <Route path="analytics" element={<AnalyticsDashboard />} />
        <Route path="manual-sale" element={<ManualSale />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
