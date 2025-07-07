import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

// ================== Get Cart ==================
export const getCartController = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId }).populate(
      "products.productId",
      "name price quantityInGrams images"
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
    const quantityInGrams = product.quantityInGrams;
    const subtotal = pricePerUnit * quantity;
    const profitPerUnit = product.price - product.purchasePrice;
    const profit = profitPerUnit * quantity;

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
            quantityInGrams,
            pricePerUnit,
            subtotal,
            profit,
          },
        ],
      });
    } else {
      const existingProductIndex = cart.products.findIndex((item) =>
        item.productId.equals(productId)
      );

      if (existingProductIndex !== -1) {
        // 🔁 Update quantity and totals
        cart.products[existingProductIndex].quantity += quantity;
        cart.products[existingProductIndex].subtotal += subtotal;
        cart.products[existingProductIndex].profit += profit;
      } else {
        // ➕ Add new product
        cart.products.push({
          productId,
          name: product.name,
          quantity,
          quantityInGrams,
          pricePerUnit,
          subtotal,
          profit,
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
      // ❌ Remove product
      cart.products.splice(productIndex, 1);
    } else {
      const dbProduct = await Product.findById(productId);
      if (!dbProduct || !dbProduct.isActive) {
        return res
          .status(404)
          .json({ error: true, message: "Product not found or inactive" });
      }

      const pricePerUnit = dbProduct.price;
      const profitPerUnit = dbProduct.price - dbProduct.purchasePrice;
      const quantityInGrams = dbProduct.quantityInGrams;

      // ✅ Update values
      cart.products[productIndex].quantity = quantity;
      cart.products[productIndex].subtotal = pricePerUnit * quantity;
      cart.products[productIndex].profit = profitPerUnit * quantity;
      cart.products[productIndex].pricePerUnit = pricePerUnit;
      cart.products[productIndex].quantityInGrams = quantityInGrams;
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
      return res
        .status(400)
        .json({ error: true, message: "Product ID is required" });
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

    cart.products.splice(productIndex, 1);
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart,
    });
  } catch (error) {
    console.error("Remove Cart Item Error:", error.message);
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
};

// ================== Clear Cart ==================
export const clearCartController = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: true, message: "Cart not found" });
    }

    cart.products = [];
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
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

      const totalQuantityGrams = item.quantity * item.quantityInGrams;
      if (product.stockInGrams < totalQuantityGrams) {
        errors.push({
          productId: item.productId,
          reason: `Insufficient stock. Available: ${product.stockInGrams}g, Required: ${totalQuantityGrams}g`,
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
