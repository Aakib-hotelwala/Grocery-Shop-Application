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

    // Bulk product link
    bulkProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product", // refers to the main product with total stock (e.g. 2kg)
      default: null,
    },

    stockInGrams: { type: Number, default: 0 },

    quantityInGrams: { type: Number, required: true }, // e.g. 100 for 100gm

    price: { type: Number, required: true },
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
