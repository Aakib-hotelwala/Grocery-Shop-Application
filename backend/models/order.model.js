import e from "express";
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: String,
        quantity: Number, // how many packs ordered
        quantityInGrams: Number, // grams per pack (e.g. 500g)
        pricePerUnit: Number,
        subtotal: Number,
        profit: Number,
      },
    ],

    totalAmount: { type: Number, required: true },

    totalProfit: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const OrderModel = mongoose.model("Order", orderSchema);
export default OrderModel;
