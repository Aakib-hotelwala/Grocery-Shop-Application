import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import cloudinary from "../config/cloudinary.js";

// ================== Create Product ==================
export const createProductController = async (req, res) => {
  try {
    const { name, description, categoryId, stock, price, purchasePrice } =
      req.body;

    // ✅ Required field validation
    if (!name || !categoryId || !price || !purchasePrice) {
      return res.status(400).json({
        error: true,
        message: "Missing required fields",
      });
    }

    const images = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        images.push({
          url: file.path || file.secure_url || file.location,
          public_id: file.filename || file.public_id,
        });
      }
    }

    const newProduct = new Product({
      name,
      description,
      categoryId,
      stock: stock || 0,
      price,
      purchasePrice,
      images,
    });

    await newProduct.save();

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Create Product Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

// ================== Update Product ==================
export const updateProductController = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        error: true,
        message: "Product not found",
      });
    }

    const {
      name,
      description,
      categoryId,
      stock,
      price,
      purchasePrice,
      isActive,
    } = req.body;

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (categoryId !== undefined) product.categoryId = categoryId;
    if (stock !== undefined) product.stock = stock;
    if (price !== undefined) product.price = price;
    if (purchasePrice !== undefined) product.purchasePrice = purchasePrice;
    if (isActive !== undefined) product.isActive = isActive;

    if (req.files && req.files.length > 0) {
      const existingImages = JSON.parse(req.body.existingImages || "[]");

      // Delete removed images from Cloudinary
      const removedImages = product.images.filter(
        (img) => !existingImages.some((ei) => ei.public_id === img.public_id)
      );
      for (const img of removedImages) {
        if (img.public_id) {
          await cloudinary.uploader.destroy(img.public_id);
        }
      }

      // Add newly uploaded images
      const newUploadedImages = req.files.map((file) => ({
        url: file.path || file.secure_url || file.location,
        public_id: file.filename || file.public_id,
      }));

      product.images = [...existingImages, ...newUploadedImages];
    } else if (req.body.existingImages) {
      product.images = JSON.parse(req.body.existingImages);
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update Product Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

// ================== Delete Product ==================
export const deleteProductController = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        error: true,
        message: "Product not found",
      });
    }

    // ✅ Delete each image from Cloudinary
    for (const image of product.images) {
      if (image.public_id) {
        await cloudinary.uploader.destroy(image.public_id);
      }
    }

    // ✅ Delete the product itself
    await product.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete Product Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

// ================== Toggle Product Status ==================
export const toggleProductStatusController = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ error: true, message: "Product not found" });
    }

    product.isActive = !product.isActive;
    await product.save();

    return res.status(200).json({
      success: true,
      message: `Product is now ${product.isActive ? "active" : "inactive"}`,
    });
  } catch (error) {
    console.error("Toggle Product Status Error:", error);
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
};

// ================== Get Single Product ==================
export const getSingleProductController = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).populate("categoryId", "name");

    if (!product) {
      return res.status(404).json({
        error: true,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get Single Product Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

// ================== Get All Product ==================
export const getAllProductsController = async (req, res) => {
  try {
    const { keyword = "", categoryId, page = 1, limit = 10 } = req.query;

    const query = {
      isActive: true,
    };

    // 🔍 Keyword Search
    if (keyword) {
      query.name = { $regex: keyword, $options: "i" };
    }

    // 📂 Filter by Category
    if (categoryId) {
      query.categoryId = categoryId;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("categoryId", "name"),
      Product.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      products,
    });
  } catch (error) {
    console.error("Get All Products Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

// ================== Get Products by Category or Subcategory ==================
export const getProductsByCategoryController = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!categoryId) {
      return res.status(400).json({
        error: true,
        message: "Category ID is required",
      });
    }

    // 1. Get subcategories of the given category
    const subcategories = await Category.find({
      parentCategoryId: categoryId,
      isActive: true,
    }).select("_id");

    const categoryIds = [categoryId, ...subcategories.map((cat) => cat._id)];

    // 2. Get all matching products
    const products = await Product.find({
      categoryId: { $in: categoryIds },
      isActive: true,
    }).populate("categoryId", "name");

    return res.status(200).json({
      success: true,
      total: products.length,
      products,
    });
  } catch (error) {
    console.error("Get Products by Category Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};
