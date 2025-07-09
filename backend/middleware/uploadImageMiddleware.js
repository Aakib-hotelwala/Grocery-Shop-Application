import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// ✅ Cloudinary Storage Configuration
const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: "grocery-shop-application",
    resource_type: "image",
    public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
  }),
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpg, .jpeg, and .png formats are allowed"), false);
  }
};

// ✅ Multer Config
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export default upload;
