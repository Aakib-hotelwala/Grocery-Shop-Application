// src/routes/UserRoutes.jsx
import { Routes, Route } from "react-router-dom";
import UserLayout from "../components/layout/user/UserLayout";
import Home from "../pages/user/Home";
import ProductList from "../pages/user/ProductList";
import Cart from "../pages/user/Cart";
import Orders from "../pages/user/Orders";
import Profile from "../pages/user/Profile";

const UserRoutes = () => {
  return (
    <Routes>
      <Route element={<UserLayout />}>
        <Route path="home" element={<Home />} />
        <Route path="products" element={<ProductList />} />
        <Route path="cart" element={<Cart />} />
        <Route path="orders" element={<Orders />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
};

export default UserRoutes;
