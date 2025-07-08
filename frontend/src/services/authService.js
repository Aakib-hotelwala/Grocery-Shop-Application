import { get, post } from "./endpoints";
import API_ROUTES from "./apiRoutes";
import useAuthStore from "../store/authStore";
import { toast } from "react-toastify";

export const registerUser = async (data) => {
  try {
    const res = await post(API_ROUTES.REGISTER, data);
    if (res.success) {
      useAuthStore.getState().setAuth(res.token, res.user);
      toast.success(res.message);
    }
    return res;
  } catch (err) {
    toast.error(err?.response?.data?.message || "Registration failed");
    throw err;
  }
};

export const loginUser = async (data) => {
  try {
    const res = await post(API_ROUTES.LOGIN, data);
    if (res.success) {
      useAuthStore.getState().setAuth(res.token, res.user);
      toast.success(res.message);
    }
    return res;
  } catch (err) {
    toast.error(err?.response?.data?.message || "Login failed");
    throw err;
  }
};

export const logoutUser = async () => {
  try {
    await post(API_ROUTES.LOGOUT);
    useAuthStore.getState().logout();
    toast.success("Logged out");
  } catch (err) {
    console.error("Logout failed", err);
  }
};

export const refreshToken = async () => {
  try {
    const res = await get(API_ROUTES.REFRESH_TOKEN);
    if (res.token) {
      useAuthStore.getState().setAuth(res.token, useAuthStore.getState().user);
    }
  } catch (err) {
    console.error("Token refresh failed:", err);
  }
};

export const getProfile = async () => {
  try {
    return await get(API_ROUTES.GET_PROFILE);
  } catch (err) {
    console.error("Profile fetch error:", err);
    throw err;
  }
};
