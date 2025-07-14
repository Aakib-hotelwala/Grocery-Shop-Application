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
import { get, post } from "../../../services/endpoints";
import API_ROUTES from "../../../services/apiRoutes";
import { useNavigate } from "react-router-dom";
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

const CreateProduct = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const imageInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [stock, setStock] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await get(API_ROUTES.GET_ALL_CATEGORIES);
        setCategories(res?.categories || []);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const urls = images.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const total = [...images, ...files].slice(0, 5);
    setImages(total);

    // Reset input so same file can be selected again
    if (imageInputRef.current) {
      imageInputRef.current.value = null;
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );
    if (!files.length) return;
    const total = [...images, ...files].slice(0, 5);
    setImages(total);
  };

  const removeImage = (index) => {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);

    // Reset file input when all images are removed
    if (updated.length === 0 && imageInputRef.current) {
      imageInputRef.current.value = null;
    }
  };

  const preventInvalidNumberInput = (e) => {
    if (["e", "E", "+", "-"].includes(e.key)) {
      e.preventDefault();
    }
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
    if (images.length === 0)
      return toast.error("Please upload at least one product image.");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", parsedPrice);
    formData.append("purchasePrice", parsedPurchasePrice);
    formData.append("stock", parsedStock);
    formData.append("categoryId", selectedCategory._id);
    images.forEach((file) => formData.append("images", file));

    setLoading(true);
    try {
      await post(API_ROUTES.CREATE_PRODUCT, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Product created successfully!");
      navigate("/admin/products");
    } catch (err) {
      console.error("Failed to create product", err);
      toast.error("Failed to create product.");
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
        Create Product
      </Typography>

      <GradientPaper>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {/* Drag-and-Drop Image Upload */}
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
                {previews.map((url, i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 100,
                      height: 100,
                      position: "relative",
                      borderRadius: 2,
                      overflow: "hidden",
                      border: "1px solid",
                      borderColor: theme.palette.divider,
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={url}
                      alt={`Preview ${i}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(i);
                      }}
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        color: "white",
                        "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
                {images.length < 5 && (
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 2,
                      border: "2px dashed",
                      borderColor: theme.palette.divider,
                      color: "text.secondary",
                      fontSize: 30,
                      flexShrink: 0,
                    }}
                  >
                    +
                  </Box>
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
              slotProps={{
                input: {
                  min: 1,
                },
              }}
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
              slotProps={{
                input: {
                  min: 1,
                },
              }}
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
              slotProps={{
                input: {
                  min: 0,
                },
              }}
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
                  "Create Product"
                )}
              </Button>
            </Box>
          </Stack>
        </form>
      </GradientPaper>
    </Box>
  );
};

export default CreateProduct;
