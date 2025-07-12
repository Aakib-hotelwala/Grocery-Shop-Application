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
        quantity: Number, // how many units ordered
        pricePerUnit: Number,
        subtotal: Number,
      },
    ],

    totalAmount: { type: Number, required: true },
    totalProfit: { type: Number, required: true },

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
