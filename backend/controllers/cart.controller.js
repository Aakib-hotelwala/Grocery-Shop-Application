import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

// ================== Get Cart ==================
export const getCartController = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId }).populate(
      "products.productId",
      "name price images"
    );

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart is empty",
        cart: { products: [] },
      });
    }

    return res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error("Get Cart Error:", error.message);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

// ================== Add to Cart ==================
export const addToCartController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({ error: true, message: "Invalid input" });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res
        .status(404)
        .json({ error: true, message: "Product not found or inactive" });
    }

    const pricePerUnit = product.price;
    const purchasePrice = product.purchasePrice;
    const subtotal = pricePerUnit * quantity;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // 🆕 Create new cart
      cart = new Cart({
        userId,
        products: [
          {
            productId,
            name: product.name,
            quantity,
            pricePerUnit,
            purchasePrice,
            subtotal,
          },
        ],
      });
    } else {
      const existingProductIndex = cart.products.findIndex((item) =>
        item.productId.equals(productId)
      );

      if (existingProductIndex !== -1) {
        // 🔁 Update quantity and subtotal
        cart.products[existingProductIndex].quantity += quantity;
        cart.products[existingProductIndex].subtotal += subtotal;
      } else {
        // ➕ Add new product
        cart.products.push({
          productId,
          name: product.name,
          quantity,
          pricePerUnit,
          purchasePrice,
          subtotal,
        });
      }
    }

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart,
    });
  } catch (error) {
    console.error("Add to Cart Error:", error.message);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

// ================== Update Cart Item ==================
export const updateCartItemController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity } = req.body;

    if (!productId || quantity == null || quantity < 0) {
      return res.status(400).json({ error: true, message: "Invalid input" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: true, message: "Cart not found" });
    }

    const productIndex = cart.products.findIndex((p) =>
      p.productId.equals(productId)
    );

    if (productIndex === -1) {
      return res
        .status(404)
        .json({ error: true, message: "Product not in cart" });
    }

    if (quantity === 0) {
      // ❌ Remove product from cart
      cart.products.splice(productIndex, 1);
    } else {
      const dbProduct = await Product.findById(productId);
      if (!dbProduct || !dbProduct.isActive) {
        return res
          .status(404)
          .json({ error: true, message: "Product not found or inactive" });
      }

      const pricePerUnit = dbProduct.price;
      const purchasePrice = dbProduct.purchasePrice;

      // ✅ Update values
      cart.products[productIndex].quantity = quantity;
      cart.products[productIndex].pricePerUnit = pricePerUnit;
      cart.products[productIndex].purchasePrice = purchasePrice;
      cart.products[productIndex].subtotal = pricePerUnit * quantity;
    }

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart,
    });
  } catch (error) {
    console.error("Update Cart Item Error:", error.message);
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
};

// ================== Remove from Cart ==================
export const removeCartItemController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        error: true,
        message: "Product ID is required",
      });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart || cart.products.length === 0) {
      return res.status(404).json({
        error: true,
        message: "Cart is empty or not found",
      });
    }

    const initialLength = cart.products.length;
    cart.products = cart.products.filter(
      (item) => !item.productId.equals(productId)
    );

    if (cart.products.length === initialLength) {
      return res.status(404).json({
        error: true,
        message: "Product not in cart",
      });
    }

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart,
    });
  } catch (error) {
    console.error("Remove Cart Item Error:", error.message);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

// ================== Clear Cart ==================
export const clearCartController = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId });
    if (!cart || cart.products.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Cart is already empty",
      });
    }

    cart.products = [];
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      cart,
    });
  } catch (error) {
    console.error("Clear Cart Error:", error.message);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

// ================== Validate Stock Before Checkout ==================
export const validateStockBeforeCheckoutController = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId });
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ error: true, message: "Cart is empty" });
    }

    const errors = [];

    for (const item of cart.products) {
      const product = await Product.findById(item.productId);

      if (!product || !product.isActive) {
        errors.push({
          productId: item.productId,
          reason: "Product not found or inactive",
        });
        continue;
      }

      if (product.stock < item.quantity) {
        errors.push({
          productId: item.productId,
          reason: `Insufficient stock. Available: ${product.stock}, Required: ${item.quantity}`,
        });
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: true,
        message: "Stock validation failed",
        issues: errors,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Stock is valid for all cart items",
    });
  } catch (error) {
    console.error("Stock Validation Error:", error.message);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};
