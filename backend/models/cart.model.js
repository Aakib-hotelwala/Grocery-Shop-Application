import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
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
        quantity: { type: Number, default: 1 },
        pricePerUnit: Number,
        purchasePrice: Number,
        subtotal: Number,
      },
    ],
  },
  { timestamps: true }
);

const CartModel = mongoose.model("Cart", cartSchema);
export default CartModel;
