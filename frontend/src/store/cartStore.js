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
    } catch (err) {
      console.error("Update failed:", err);
    }
  },

  removeCartItem: async (productId) => {
    try {
      await del(API_ROUTES.REMOVE_CART_ITEM, { data: { productId } });
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

  addItemLocally: (item) => {
    set((state) => {
      const existing = state.cart.find(
        (i) =>
          i.productId === item.productId || i.productId._id === item.productId
      );

      if (existing) return state; // Don't add if already in cart

      const price = item.pricePerUnit || 0;

      return {
        cart: [
          ...state.cart,
          {
            _id: `local-${Date.now()}`, // temporary ID
            productId: item.productId,
            quantity: item.quantity,
            pricePerUnit: price,
            subtotal: price * item.quantity,
          },
        ],
      };
    });
  },

  updateItemLocally: (productId, quantity) => {
    set((state) => ({
      cart: state.cart.map((item) => {
        const id = item.productId._id || item.productId;
        if (id === productId) {
          return {
            ...item,
            quantity,
            subtotal: quantity * item.pricePerUnit,
          };
        }
        return item;
      }),
    }));
  },

  removeItemLocally: (productId) => {
    set((state) => ({
      cart: state.cart.filter((item) => {
        const id = item.productId._id || item.productId;
        return id !== productId;
      }),
    }));
  },
}));

export default useCartStore;
