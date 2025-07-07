import Category from "../models/category.model.js";
import cloudinary from "../config/cloudinary.js";

// ================== Create Category ==================
export const createCategoryController = async (req, res) => {
  try {
    const { name, parentCategoryId } = req.body;

    if (!name) {
      return res.status(400).json({
        error: true,
        message: "Category name is required",
      });
    }

    let image = null;

    if (req.file) {
      image = {
        url: req.file.path || req.file.secure_url,
        public_id: req.file.filename || req.file.public_id,
      };
    }

    const category = new Category({
      name,
      parentCategoryId: parentCategoryId || null,
      image,
    });

    await category.save();

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Create Category Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

// ================== Update Category ==================
export const updateCategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, parentCategoryId, isActive } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        error: true,
        message: "Category not found",
      });
    }

    if (name) category.name = name;
    if (parentCategoryId !== undefined)
      category.parentCategoryId = parentCategoryId;
    if (isActive !== undefined) category.isActive = isActive;

    // ✅ Replace image if a new one is uploaded
    if (req.file) {
      // Remove old image from Cloudinary
      if (category.image?.public_id) {
        await cloudinary.uploader.destroy(category.image.public_id);
      }

      category.image = {
        url: req.file.path || req.file.secure_url,
        public_id: req.file.filename || req.file.public_id,
      };
    }

    await category.save();

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Update Category Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

// ================== Delete Category ==================
export const deleteCategoryController = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        error: true,
        message: "Category not found",
      });
    }

    // ✅ Delete Cloudinary image if it exists
    if (category.image?.public_id) {
      await cloudinary.uploader.destroy(category.image.public_id);
    }

    await category.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete Category Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

// ================== Get All Categories ==================
export const getAllCategoriesController = async (req, res) => {
  try {
    const {
      keyword = "",
      isActive = true, // by default only active categories
      page = 1,
      limit = 10,
    } = req.query;

    const filters = {};

    // Keyword search
    if (keyword) {
      filters.name = { $regex: keyword, $options: "i" };
    }

    // isActive filter (string to boolean)
    if (isActive !== "all") {
      filters.isActive = isActive === "true";
    }

    // Step 1: Fetch paginated main categories (parentCategoryId == null)
    const skip = (Number(page) - 1) * Number(limit);

    const [mainCategories, total] = await Promise.all([
      Category.find({
        ...filters,
        parentCategoryId: null,
      })
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 })
        .lean(),

      Category.countDocuments({
        ...filters,
        parentCategoryId: null,
      }),
    ]);

    // Step 2: Get all subcategories that match `isActive`
    const subFilters = {};
    if (isActive !== "all") subFilters.isActive = isActive === "true";

    const subcategories = await Category.find({
      parentCategoryId: { $ne: null },
      ...subFilters,
    }).lean();

    // Step 3: Group subcategories under parents
    const categoryMap = {};
    for (const mainCat of mainCategories) {
      categoryMap[mainCat._id.toString()] = {
        ...mainCat,
        subcategories: [],
      };
    }

    for (const subCat of subcategories) {
      const parentId = subCat.parentCategoryId?.toString();
      if (categoryMap[parentId]) {
        categoryMap[parentId].subcategories.push(subCat);
      }
    }

    const formatted = Object.values(categoryMap);

    return res.status(200).json({
      success: true,
      categories: formatted,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    console.error("Get All Categories Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

// ================== Get Category By ID ==================
export const getCategoryByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id).lean();
    if (!category) {
      return res
        .status(404)
        .json({ error: true, message: "Category not found" });
    }
    return res.status(200).json({ success: true, category });
  } catch (err) {
    console.error("Get Category Error:", err);
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
};

// ================== Toggle Category Status ==================
export const toggleCategoryStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      return res
        .status(404)
        .json({ error: true, message: "Category not found" });
    }
    category.isActive = !category.isActive;
    await category.save();

    return res.status(200).json({
      success: true,
      message: `Category ${
        category.isActive ? "activated" : "deactivated"
      } successfully`,
    });
  } catch (err) {
    console.error("Toggle Category Status Error:", err);
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
};

// ================== Get Subcategories by Parent ID ==================
export const getSubcategoriesController = async (req, res) => {
  try {
    const { parentId } = req.params;
    const subcategories = await Category.find({
      parentCategoryId: parentId,
      isActive: true,
    }).lean();

    return res.status(200).json({
      success: true,
      subcategories,
    });
  } catch (error) {
    console.error("Get Subcategories Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};
