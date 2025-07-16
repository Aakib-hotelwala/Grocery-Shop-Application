import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import { Parser } from "json2csv";
import PDFDocument from "pdfkit";

// ================== Get Daily Stats ==================
export const getDailyStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const orders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today },
          status: "completed",
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" },
          totalProfit: { $sum: "$totalProfit" },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      stats: orders[0] || {
        totalSales: 0,
        totalProfit: 0,
        orderCount: 0,
      },
    });
  } catch (err) {
    res.status(500).json({ error: true, message: "Server Error" });
  }
};

// ================== Get Monthly Stats ==================
export const getMonthlyStats = async (req, res) => {
  try {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

    const orders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: firstDay },
          status: "completed",
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" },
          totalProfit: { $sum: "$totalProfit" },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      stats: orders[0] || {
        totalSales: 0,
        totalProfit: 0,
        orderCount: 0,
      },
    });
  } catch (err) {
    res.status(500).json({ error: true, message: "Server Error" });
  }
};

// ================== Get Top Selling Products ==================
export const getTopSellingProducts = async (req, res) => {
  try {
    const pipeline = [
      { $unwind: "$products" },
      { $match: { status: "completed" } },
      {
        $group: {
          _id: "$products.productId",
          totalQuantity: { $sum: "$products.quantity" },
          totalSales: { $sum: "$products.subtotal" },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
    ];

    const result = await Order.aggregate(pipeline);

    res.json({ success: true, topProducts: result });
  } catch (err) {
    res.status(500).json({ error: true, message: "Server Error" });
  }
};

// ================== Record Manual Sale ==================
export const recordManualSale = async (req, res) => {
  try {
    const { products } = req.body; // [{ productId, quantity }]

    if (!products || !products.length) {
      return res.status(400).json({ error: true, message: "No products" });
    }

    let totalAmount = 0;
    let totalProfit = 0;
    const orderProducts = [];

    for (const item of products) {
      try {
        if (!item.productId || item.quantity < 1) {
          continue; // Skip invalid item
        }

        const product = await Product.findById(item.productId);
        if (!product || !product.isActive) {
          continue; // Skip inactive or missing product
        }

        if (product.stock < item.quantity) {
          continue; // Skip if insufficient stock
        }

        product.stock -= item.quantity;
        await product.save();

        const subtotal = product.price * item.quantity;
        const profit = (product.price - product.purchasePrice) * item.quantity;

        totalAmount += subtotal;
        totalProfit += profit;

        orderProducts.push({
          productId: product._id,
          name: product.name,
          quantity: item.quantity,
          pricePerUnit: product.price,
          subtotal,
        });
      } catch (err) {
        console.error("Manual sale item error:", err.message);
        continue;
      }
    }

    if (orderProducts.length === 0) {
      return res
        .status(400)
        .json({ error: true, message: "No valid products for manual sale" });
    }

    const order = new Order({
      products: orderProducts,
      totalAmount,
      totalProfit,
      status: "completed",
      isManualSale: true,
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: "Manual sale recorded",
      order,
    });
  } catch (err) {
    console.error("Manual Sale Error:", err.message);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// ================== Get Revenue Over Time ==================
export const getRevenueOverTime = async (req, res) => {
  try {
    const days = 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);

    const revenueData = await Order.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          dailyRevenue: { $sum: "$totalAmount" },
          dailyProfit: { $sum: "$totalProfit" },
          orderCount: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
      },
    ]);

    // Format response: Fill missing days with zeros
    const result = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();

      const dayData = revenueData.find(
        (d) => d._id.year === year && d._id.month === month && d._id.day === day
      );

      result.push({
        date: date.toISOString().slice(0, 10), // YYYY-MM-DD
        revenue: dayData ? dayData.dailyRevenue : 0,
        profit: dayData ? dayData.dailyProfit : 0,
        orders: dayData ? dayData.orderCount : 0,
      });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Revenue Over Time Error:", error);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// ================== Get Sales By Category ==================
export const getSalesByCategory = async (req, res) => {
  try {
    const pipeline = [
      { $match: { status: "completed" } },
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: "$productDetails.categoryId",
          totalQuantity: { $sum: "$products.quantity" },
          totalSales: { $sum: "$products.subtotal" },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $project: {
          _id: 0,
          categoryId: "$category._id",
          categoryName: "$category.name",
          totalQuantity: 1,
          totalSales: 1,
        },
      },
      { $sort: { totalSales: -1 } },
    ];

    const salesByCategory = await Order.aggregate(pipeline);

    res.json({ success: true, data: salesByCategory });
  } catch (error) {
    console.error("Sales By Category Error:", error);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// ================== Export Orders as CSV and PDF ==================
export const exportOrdersCSV = async (req, res) => {
  try {
    const orders = await Order.find().populate("userId", "name email").lean();

    const fields = [
      { label: "Order ID", value: "_id" },
      { label: "User Name", value: "userId.name" },
      { label: "User Email", value: "userId.email" },
      { label: "Total Amount", value: "totalAmount" },
      { label: "Total Profit", value: "totalProfit" },
      { label: "Status", value: "status" },
      { label: "Created At", value: (row) => row.createdAt.toISOString() },
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(orders);

    res.header("Content-Type", "text/csv");
    res.attachment("orders_report.csv");
    return res.send(csv);
  } catch (error) {
    console.error("Export Orders CSV Error:", error);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// ================== Export Orders as PDF ==================
export const exportOrdersPDF = async (req, res) => {
  try {
    const orders = await Order.find().populate("userId", "name email").lean();

    const doc = new PDFDocument({ size: "A4", margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="orders_report.pdf"'
    );

    doc.pipe(res);

    doc.fontSize(20).text("Orders Report", { align: "center" });
    doc.moveDown();

    orders.forEach((order, i) => {
      doc
        .fontSize(12)
        .text(`Order #${i + 1}: ${order._id}`, { underline: true });
      doc.text(`User: ${order.userId?.name || "N/A"}`);
      doc.text(`Email: ${order.userId?.email || "N/A"}`);
      doc.text(`Total Amount: ₹${order.totalAmount.toFixed(2)}`);
      doc.text(`Total Profit: ₹${order.totalProfit.toFixed(2)}`);
      doc.text(`Status: ${order.status}`);
      doc.text(`Created At: ${order.createdAt.toISOString()}`);
      doc.moveDown();
    });

    doc.end();
  } catch (error) {
    console.error("Export Orders PDF Error:", error);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};
