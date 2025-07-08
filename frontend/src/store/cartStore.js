import { create } from "zustand";
import { get, post, put, del } from "../services/endpoints";
import API_ROUTES from "../services/apiRoutes";
import { toast } from "react-toastify";

const useCartStore = create((set) => ({
  cart: [],
  loading: false,

  fetchCart: async () => {
    set({ loading: true });
    try {
      const res = await get(API_ROUTES.GET_CART);
      set({ cart: res.cart.products || [] });
    } catch (err) {
      console.error("Fetch cart error:", err);
    } finally {
      set({ loading: false });
    }
  },

  addToCart: async (item) => {
    try {
      await post(API_ROUTES.ADD_TO_CART, item);
      toast.success("Added to cart");
      useCartStore.getState().fetchCart();
    } catch (err) {
      toast.error("Add to cart failed");
    }
  },

  updateCartItem: async (item) => {
    try {
      await put(API_ROUTES.UPDATE_CART_ITEM, item);
      toast.success("Updated cart item");
      useCartStore.getState().fetchCart();
    } catch (err) {
      toast.error("Update failed");
    }
  },

  removeCartItem: async (productId) => {
    try {
      await del(API_ROUTES.REMOVE_CART_ITEM, { data: { productId } });
      toast.success("Removed from cart");
      useCartStore.getState().fetchCart();
    } catch (err) {
      toast.error("Remove failed");
    }
  },

  clearCart: async () => {
    try {
      await del(API_ROUTES.CLEAR_CART);
      set({ cart: [] });
      toast.success("Cart cleared");
    } catch (err) {
      toast.error("Clear failed");
    }
  },
}));

export default useCartStore;
