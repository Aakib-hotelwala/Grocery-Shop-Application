import UserModel from "../models/user.model.js";
import cloudinary from "../config/cloudinary.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ================= Register =================
export const RegisterController = async (req, res) => {
  try {
    const { name, email, phoneNo, password } = req.body;

    if (!name || !email || !phoneNo || !password) {
      return res.status(400).json({
        error: true,
        message: "Name, email, phone number, and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existUser = await UserModel.findOne({
      email: normalizedEmail,
      isActive: true,
    });

    if (existUser) {
      return res.status(400).json({
        error: true,
        message: "Email already registered",
      });
    }

    // Upload image if available
    let profileImageUrl = "";
    if (req.file) {
      profileImageUrl =
        req.file.path || req.file.secure_url || req.file.location;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      name,
      email: normalizedEmail,
      phoneNo,
      passwordHash,
      profileImageUrl,
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "Registration successful",
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

// ================= Login =================
export const LoginController = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        error: true,
        message: "All fields are required",
      });
    }

    const user = await UserModel.findOne({
      $or: [{ email: identifier }, { phoneNo: identifier }],
    });

    if (!user || !user.isActive) {
      return res.status(400).json({
        error: true,
        message: "User not found or inactive",
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        error: true,
        message: "Invalid password",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 day
    });

    const { passwordHash, ...userData } = user.toObject();

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: userData,
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

// ================= Logout =================
export const LogoutController = (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

// ================= Refresh Token =================
export const refreshTokenController = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: true, message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.id);

    if (!user || !user.isActive) {
      return res
        .status(401)
        .json({ error: true, message: "User inactive or not found" });
    }

    const newToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Token refreshed",
      token: newToken,
    });
  } catch (error) {
    console.error("Refresh Token Error:", error);
    return res.status(401).json({ error: true, message: "Invalid token" });
  }
};

// ================= Get User Profile =================
export const GetUserProfileController = async (req, res) => {
  try {
    const user = req.user;

    if (!user || !user.isActive) {
      return res
        .status(404)
        .json({ error: true, message: "User not found or inactive" });
    }

    const { passwordHash, ...userData } = user.toObject();

    return res.status(200).json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error("Get Profile Error:", error.message);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

// ================= Update User Profile =================
export const UpdateProfileController = async (req, res) => {
  try {
    const user = req.user;

    if (!user || !user.isActive) {
      return res.status(404).json({ message: "User not found or inactive" });
    }

    const { name, phoneNo } = req.body;
    if (name) user.name = name;
    if (phoneNo) user.phoneNo = phoneNo;

    if (req.file) {
      // ✅ Destroy previous image using public_id
      if (user.profileImageId) {
        await cloudinary.uploader.destroy(user.profileImageId);
      }

      // ✅ Set new image URL and public_id
      user.profileImageUrl =
        req.file.path || req.file.secure_url || req.file.location;
      user.profileImageId = req.file.filename || req.file.public_id || ""; // cloudinary sets this
    }

    await user.save();

    const { passwordHash, ...userData } = user.toObject();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: userData,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

// ================= Get All Users (with search & role filter) =================
export const getAllUsersController = async (req, res) => {
  try {
    const { search = "", role } = req.query;

    // Search conditions
    const query = {
      $and: [
        {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phoneNo: { $regex: search, $options: "i" } },
          ],
        },
      ],
    };

    // If role filter is passed (admin or user)
    if (role && ["admin", "user"].includes(role)) {
      query.$and.push({ role });
    }

    const users = await UserModel.find(query).select("-passwordHash").lean();

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (err) {
    console.error("Get All Users Error:", err);
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
};

// ================= Toggle User Status =================
export const toggleUserStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id);

    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    user.isActive = !user.isActive;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User ${
        user.isActive ? "activated" : "deactivated"
      } successfully`,
    });
  } catch (err) {
    console.error("Toggle User Status Error:", err);
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
};

// ================= Update User Role =================
export const updateUserRoleController = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ error: true, message: "Invalid role" });
    }

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    user.role = role;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
    });
  } catch (err) {
    console.error("Update User Role Error:", err);
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
};
