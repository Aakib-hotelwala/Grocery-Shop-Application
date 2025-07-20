import { create } from "zustand";
import { get, post, put, del } from "../services/endpoints";
import API_ROUTES from "../services/apiRoutes";

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
      useCartStore.getState().fetchCart();
    } catch (err) {
      console.error("Add to cart failed:", err);
    }
  },

  updateCartItem: async (item) => {
    try {
      await put(API_ROUTES.UPDATE_CART_ITEM, item);
      useCartStore.getState().fetchCart();
    } catch (err) {
      console.error("Update failed:", err);
    }
  },

  removeCartItem: async (productId) => {
    try {
      await del(API_ROUTES.REMOVE_CART_ITEM, { data: { productId } });
      useCartStore.getState().fetchCart();
    } catch (err) {
      console.error("Remove failed:", err);
    }
  },

  clearCart: async () => {
    try {
      await del(API_ROUTES.CLEAR_CART);
      set({ cart: [] });
    } catch (err) {
      console.error("Clear failed:", err);
    }
  },
}));

export default useCartStore;
