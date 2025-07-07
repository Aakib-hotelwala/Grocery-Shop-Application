import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import cloudinary from "../config/cloudinary.js";

// ================== Create Product ==================
export const createProductController = async (req, res) => {
  try {
    const {
      name,
      description,
      categoryId,
      bulkProductId,
      quantityInGrams,
      price,
      purchasePrice,
    } = req.body;

    // ✅ Required field validation
    if (!name || !categoryId || !quantityInGrams || !price || !purchasePrice) {
      return res.status(400).json({
        error: true,
        message: "Missing required fields",
      });
    }

    let stockInGrams = 0;
    if (!bulkProductId) {
      if (req.body.stockInGrams === undefined) {
        return res.status(400).json({
          error: true,
          message: "stockInGrams is required for bulk product",
        });
      }
      stockInGrams = req.body.stockInGrams;
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
      bulkProductId: bulkProductId || null,
      quantityInGrams,
      stockInGrams,
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
      bulkProductId,
      quantityInGrams,
      price,
      purchasePrice,
      isActive,
    } = req.body;

    if (name) product.name = name;
    if (description) product.description = description;
    if (categoryId) product.categoryId = categoryId;
    if (bulkProductId !== undefined) product.bulkProductId = bulkProductId;
    if (quantityInGrams) product.quantityInGrams = quantityInGrams;
    if (price) product.price = price;
    if (purchasePrice) product.purchasePrice = purchasePrice;
    if (isActive !== undefined) product.isActive = isActive;
    if (!product.bulkProductId && req.body.stockInGrams !== undefined) {
      product.stockInGrams = req.body.stockInGrams;
    }

    if (req.files && req.files.length > 0) {
      for (const img of product.images) {
        if (img.public_id) {
          await cloudinary.uploader.destroy(img.public_id);
        }
      }

      const newImages = req.files.map((file) => ({
        url: file.path || file.secure_url || file.location,
        public_id: file.filename || file.public_id,
      }));

      product.images = newImages;
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

    // ✅ Delete all variants that depend on this product (if it's a bulk product)
    await Product.deleteMany({ bulkProductId: id });

    // ✅ Delete the main product itself
    await product.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Product and its variants deleted successfully",
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

    const product = await Product.findById(id)
      .populate("categoryId", "name")
      .populate("bulkProductId", "price quantityInGrams");

    if (!product) {
      return res.status(404).json({
        error: true,
        message: "Product not found",
      });
    }

    let youSave = "";

    if (product.bulkProductId) {
      const bulk = product.bulkProductId;
      const bulkUnitPrice = bulk.price / bulk.quantityInGrams;
      const thisUnitPrice = product.price / product.quantityInGrams;
      const priceIfBulkRate = bulkUnitPrice * product.quantityInGrams;
      const savings = Math.round(product.price - priceIfBulkRate);
      if (savings > 0) youSave = `₹${savings}`;
    }

    return res.status(200).json({
      success: true,
      product: {
        ...product._doc,
        youSave,
      },
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
        .populate("categoryId", "name")
        .populate("bulkProductId", "price quantityInGrams"),
      Product.countDocuments(query),
    ]);

    // 🧮 Add formatted savings
    const modifiedProducts = products.map((product) => {
      let youSave = "";

      if (product.bulkProductId) {
        const bulk = product.bulkProductId;
        const bulkUnitPrice = bulk.price / bulk.quantityInGrams;
        const thisUnitPrice = product.price / product.quantityInGrams;

        if (thisUnitPrice > bulkUnitPrice) {
          const priceIfBulkRate = bulkUnitPrice * product.quantityInGrams;
          const savings = Math.round(product.price - priceIfBulkRate);
          if (savings > 0) youSave = `₹${savings}`;
        }
      }

      return {
        ...product._doc,
        youSave,
        stockInGrams: product.bulkProductId ? undefined : product.stockInGrams, // ✅ optional
      };
    });

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      products: modifiedProducts,
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
    })
      .populate("categoryId", "name")
      .populate("bulkProductId", "price quantityInGrams");

    // 3. Add `youSave` based on bulkProductId
    const modifiedProducts = products.map((product) => {
      let youSave = "";

      if (product.bulkProductId) {
        const bulk = product.bulkProductId;
        const bulkUnitPrice = bulk.price / bulk.quantityInGrams;
        const thisUnitPrice = product.price / product.quantityInGrams;

        if (thisUnitPrice > bulkUnitPrice) {
          const priceIfBulkRate = bulkUnitPrice * product.quantityInGrams;
          const savings = Math.round(product.price - priceIfBulkRate);
          if (savings > 0) {
            youSave = `₹${savings}`;
          }
        }
      }

      return {
        ...product._doc,
        youSave,
      };
    });

    return res.status(200).json({
      success: true,
      total: modifiedProducts.length,
      products: modifiedProducts,
    });
  } catch (error) {
    console.error("Get Products by Category Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

// ================== Get Bulk Stock ==================
export const getBulkStockController = async (req, res) => {
  try {
    const bulkProducts = await Product.find({
      bulkProductId: null,
      isActive: true,
    }).select("name stockInGrams quantityInGrams");

    return res.status(200).json({
      success: true,
      products: bulkProducts,
    });
  } catch (error) {
    console.error("Get Bulk Stock Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

// ================== Get Variants by Bulk Product ==================
export const getVariantsByBulkProductController = async (req, res) => {
  try {
    const { bulkId } = req.params;

    const variants = await Product.find({
      bulkProductId: bulkId,
      isActive: true,
    });

    return res.status(200).json({
      success: true,
      variants,
    });
  } catch (error) {
    console.error("Get Variants Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};
