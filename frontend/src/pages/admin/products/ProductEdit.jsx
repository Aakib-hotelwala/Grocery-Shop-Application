// src/pages/admin/products/ProductEdit.jsx

import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  CircularProgress,
  Autocomplete,
  IconButton,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { get, put } from "../../../services/endpoints";
import API_ROUTES from "../../../services/apiRoutes";
import { useNavigate, useParams } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";

const GradientPaper = styled("div")(({ theme }) => ({
  background: theme.components?.custom?.cardGradient,
  boxShadow: theme.components?.custom?.cardShadow,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  maxWidth: 700,
  margin: "0 auto",
  width: "100%",
}));

const ProductEdit = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const imageInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [stock, setStock] = useState("");
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [productData, categoryData] = await Promise.all([
          get(API_ROUTES.GET_PRODUCT_BY_ID(id)),
          get(API_ROUTES.GET_ALL_CATEGORIES),
        ]);

        const product = productData?.product;
        if (product) {
          setName(product.name);
          setDescription(product.description);
          setPrice(product.price);
          setPurchasePrice(product.purchasePrice);
          setStock(product.stock);
          setSelectedCategory(product.categoryId || null);
          setExistingImages(product.images || []);
        }

        setCategories(categoryData?.categories || []);
      } catch (err) {
        console.error("Failed to load data", err);
        toast.error("Failed to load product data");
      }
    };

    fetchInitialData();
  }, [id]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const total = [...newImages, ...files].slice(0, 5 - existingImages.length);
    setNewImages(total);

    if (imageInputRef.current) imageInputRef.current.value = null;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );
    const total = [...newImages, ...files].slice(0, 5 - existingImages.length);
    setNewImages(total);
  };

  const removeImage = (index, isExisting = false) => {
    if (isExisting) {
      const updated = [...existingImages];
      updated.splice(index, 1);
      setExistingImages(updated);
    } else {
      const updated = [...newImages];
      updated.splice(index, 1);
      setNewImages(updated);
    }
  };

  const preventInvalidNumberInput = (e) => {
    if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const parsedPrice = parseFloat(price);
    const parsedPurchasePrice = parseFloat(purchasePrice);
    const parsedStock = parseInt(stock || "0");

    if (!name.trim()) return toast.error("Product name is required.");
    if (!selectedCategory) return toast.error("Please select a category.");
    if (!price || isNaN(parsedPrice) || parsedPrice <= 0)
      return toast.error("Selling price must be a positive number.");
    if (
      !purchasePrice ||
      isNaN(parsedPurchasePrice) ||
      parsedPurchasePrice <= 0
    )
      return toast.error("Purchase price must be a positive number.");
    if (parsedPrice <= parsedPurchasePrice)
      return toast.error("Selling price must be greater than purchase price.");
    if (isNaN(parsedStock) || parsedStock < 0)
      return toast.error("Stock cannot be negative.");
    if (existingImages.length + newImages.length === 0)
      return toast.error("At least one image is required.");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", parsedPrice);
    formData.append("purchasePrice", parsedPurchasePrice);
    formData.append("stock", parsedStock);
    formData.append("categoryId", selectedCategory._id);
    formData.append("existingImages", JSON.stringify(existingImages)); // send filenames/URLs

    newImages.forEach((file) => formData.append("images", file));

    setLoading(true);
    try {
      await put(API_ROUTES.UPDATE_PRODUCT(id), formData);
      toast.success("Product updated successfully!");
      navigate("/admin/products");
    } catch (err) {
      console.error("Update failed", err);
      toast.error("Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 4 },
        py: { xs: 3, sm: 5 },
        maxWidth: "100%",
        mx: "auto",
      }}
    >
      <Typography variant="h5" gutterBottom align="center">
        Edit Product
      </Typography>

      <GradientPaper>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {/* Image Previews */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Product Images (up to 5)
              </Typography>
              <Box
                onClick={() => imageInputRef.current.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                sx={{
                  display: "flex",
                  gap: 2,
                  overflowX: "auto",
                  py: 1,
                  px: 2,
                  border: "2px dashed",
                  borderColor: theme.palette.divider,
                  borderRadius: 2,
                  cursor: "pointer",
                  minHeight: 120,
                  alignItems: "center",
                }}
              >
                {existingImages.map((img, i) => (
                  <Box key={img.public_id || i} sx={imageBoxStyle}>
                    <img src={img.url} alt="Product" style={imgStyle} />
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(i, true);
                      }}
                      sx={deleteButtonStyle}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
                {newImages.map((file, i) => (
                  <Box key={i} sx={imageBoxStyle}>
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${i}`}
                      style={imgStyle}
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(i, false);
                      }}
                      sx={deleteButtonStyle}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
                {existingImages.length + newImages.length < 5 && (
                  <Box sx={uploadBoxStyle}>+</Box>
                )}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleImageUpload}
                />
              </Box>
            </Box>

            {/* Product Fields */}
            <TextField
              label="Product Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
            />

            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              minRows={3}
            />

            <Autocomplete
              options={categories}
              getOptionLabel={(option) => option.name || ""}
              isOptionEqualToValue={(o, v) => o._id === v._id}
              value={selectedCategory}
              onChange={(e, newVal) => setSelectedCategory(newVal)}
              renderInput={(params) => (
                <TextField {...params} label="Category" fullWidth required />
              )}
            />

            <TextField
              label="Selling Price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              onKeyDown={preventInvalidNumberInput}
              onWheel={(e) => e.target.blur()}
              fullWidth
              required
            />

            <TextField
              label="Purchase Price"
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              onKeyDown={preventInvalidNumberInput}
              onWheel={(e) => e.target.blur()}
              fullWidth
              required
            />

            <TextField
              label="Stock"
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              onKeyDown={preventInvalidNumberInput}
              onWheel={(e) => e.target.blur()}
              fullWidth
            />

            <Box display="flex" justifyContent="center">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ minWidth: 160, color: "#fff" }}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Update Product"
                )}
              </Button>
            </Box>
          </Stack>
        </form>
      </GradientPaper>
    </Box>
  );
};

const imageBoxStyle = {
  width: 100,
  height: 100,
  position: "relative",
  borderRadius: 2,
  overflow: "hidden",
  border: "1px solid",
  borderColor: "divider",
  flexShrink: 0,
};

const imgStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const uploadBoxStyle = {
  width: 100,
  height: 100,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 2,
  border: "2px dashed",
  borderColor: "divider",
  color: "text.secondary",
  fontSize: 30,
  flexShrink: 0,
};

const deleteButtonStyle = {
  position: "absolute",
  top: 4,
  right: 4,
  backgroundColor: "rgba(0,0,0,0.5)",
  color: "white",
  "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
};

export default ProductEdit;
