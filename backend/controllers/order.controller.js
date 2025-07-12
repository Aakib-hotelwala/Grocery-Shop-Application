import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

// ================== Place Order ==================
export const placeOrderController = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId });
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ error: true, message: "Cart is empty" });
    }

    let totalAmount = 0;
    let totalProfit = 0;
    const orderProducts = [];

    for (const item of cart.products) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        return res
          .status(400)
          .json({ error: true, message: `Product ${item.name} not available` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: true,
          message: `Insufficient stock for ${item.name}. Available: ${product.stock}, Required: ${item.quantity}`,
        });
      }

      const profit = (product.price - product.purchasePrice) * item.quantity;
      totalProfit += profit;

      // Deduct stock (unit-based)
      product.stock -= item.quantity;
      await product.save();

      totalAmount += item.subtotal;

      orderProducts.push({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        pricePerUnit: item.pricePerUnit,
        subtotal: item.subtotal,
      });
    }

    const order = new Order({
      userId,
      products: orderProducts,
      totalAmount,
      totalProfit,
    });

    await order.save();

    // Clear cart
    cart.products = [];
    await cart.save();

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Place Order Error:", error.message);
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
};

// ================== Get User Orders ==================
export const getUserOrdersController = async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get User Orders Error:", error.message);
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
};

// ================== Get All Orders ==================
export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get All Orders Error:", error.message);
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
};

export const updateOrderStatusController = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!["pending", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ error: true, message: "Invalid status" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: true, message: "Order not found" });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (error) {
    console.error("Update Order Status Error:", error.message);
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
};

// ================== Get Single Order ==================
export const getSingleOrderController = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate(
      "userId",
      "name email"
    );

    if (!order) {
      return res.status(404).json({ error: true, message: "Order not found" });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Get Single Order Error:", error.message);
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
};

// ================== Delete Order ==================
export const deleteOrderController = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: true, message: "Order not found" });
    }

    await order.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Delete Order Error:", error.message);
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
};

// ================== Get Orders By Status ==================
export const getOrdersByStatusController = async (req, res) => {
  try {
    const { status } = req.params;

    if (!["pending", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ error: true, message: "Invalid status" });
    }

    const orders = await Order.find({ status })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Get Orders By Status Error:", error.message);
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
};
