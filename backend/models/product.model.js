import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: String,
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    stock: { type: Number, default: 0 }, // number of units
    price: { type: Number, required: true }, // selling price
    purchasePrice: { type: Number, required: true },
    images: [
      {
        url: String,
        public_id: String,
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ProductModel = mongoose.model("Product", productSchema);
export default ProductModel;
