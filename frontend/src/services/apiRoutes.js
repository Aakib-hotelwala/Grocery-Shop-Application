const API_ROUTES = {
  // ========== Auth / Users ==========
  REGISTER: "/users/register",
  LOGIN: "/users/login",
  LOGOUT: "/users/logout",
  REFRESH_TOKEN: "/users/refresh-token",
  GET_PROFILE: "/users/me",
  UPDATE_PROFILE: "/users/update-profile",
  GET_ALL_USERS: "/users",
  TOGGLE_USER_STATUS: (id) => `/users/${id}/status`,
  UPDATE_USER_ROLE: (id) => `/users/${id}/role`,

  // ========== Products ==========
  GET_ALL_PRODUCTS: "/products",
  GET_PRODUCT_BY_ID: (id) => `/products/${id}`,
  CREATE_PRODUCT: "/products",
  UPDATE_PRODUCT: (id) => `/products/${id}`,
  DELETE_PRODUCT: (id) => `/products/${id}`,
  TOGGLE_PRODUCT_STATUS: (id) => `/products/${id}/status`,
  GET_BULK_STOCK: "/products/bulk/stock",
  GET_VARIANTS_BY_BULK: (bulkId) => `/products/bulk/${bulkId}/variants`,
  GET_PRODUCTS_BY_CATEGORY: (categoryId) => `/products/category/${categoryId}`,

  // ========== Categories ==========
  GET_ALL_CATEGORIES: "/categories",
  GET_CATEGORY_BY_ID: (id) => `/categories/${id}`,
  GET_SUBCATEGORIES: (parentId) => `/categories/subcategories/${parentId}`,
  CREATE_CATEGORY: "/categories",
  UPDATE_CATEGORY: (id) => `/categories/${id}`,
  DELETE_CATEGORY: (id) => `/categories/${id}`,
  TOGGLE_CATEGORY_STATUS: (id) => `/categories/${id}/status`,

  // ========== Orders ==========
  PLACE_ORDER: "/orders", // User
  GET_MY_ORDERS: "/orders/my", // User
  GET_ALL_ORDERS: "/orders", // Admin
  GET_ORDERS_BY_STATUS: (status) => `/orders/status/${status}`,
  GET_ORDER_BY_ID: (id) => `/orders/${id}`,
  UPDATE_ORDER_STATUS: "/orders/status",
  DELETE_ORDER: (id) => `/orders/${id}`,

  // ========== Cart ==========
  GET_CART: "/cart",
  ADD_TO_CART: "/cart/add",
  UPDATE_CART_ITEM: "/cart/update",
  REMOVE_CART_ITEM: "/cart/remove",
  CLEAR_CART: "/cart/clear",
  VALIDATE_CART_STOCK: "/cart/validate-stock",

  // ========== Analytics ==========
  ANALYTICS_DAILY: "/analytics/daily",
  ANALYTICS_MONTHLY: "/analytics/monthly",
  TOP_PRODUCTS: "/analytics/top-products",
  REVENUE_OVER_TIME: "/analytics/revenue-over-time",
  SALES_BY_CATEGORY: "/analytics/sales-by-category",
  EXPORT_ORDERS_CSV: "/analytics/export/orders/csv",
  EXPORT_ORDERS_PDF: "/analytics/export/orders/pdf",
  RECORD_MANUAL_SALE: "/analytics/manual-sale",
};

export default API_ROUTES;
