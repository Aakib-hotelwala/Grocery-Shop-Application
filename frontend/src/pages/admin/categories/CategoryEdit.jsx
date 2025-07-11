// src/pages/admin/CategoryEdit.jsx

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Autocomplete,
  Typography,
  Stack,
  CircularProgress,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { get, put } from "../../../services/endpoints";
import API_ROUTES from "../../../services/apiRoutes";
import { useNavigate, useParams } from "react-router-dom";

const GradientPaper = styled("div")(({ theme }) => ({
  background: theme.components?.custom?.cardGradient,
  boxShadow: theme.components?.custom?.cardShadow,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  maxWidth: 600,
  margin: "0 auto",
  width: "100%",
}));

const CategoryEdit = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();

  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [parentCategoryId, setParentCategoryId] = useState("");
  const [mainCategories, setMainCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allData, categoryRes] = await Promise.all([
          get(API_ROUTES.GET_ALL_CATEGORIES),
          get(API_ROUTES.GET_CATEGORY_BY_ID(id)),
        ]);

        const category = categoryRes.category;

        setMainCategories(allData.categories || []);
        setName(category.name || "");
        setParentCategoryId(category.parentCategoryId || "");
        if (category.image?.url) {
          setPreview(category.image.url);
        }
      } catch (err) {
        console.error("Failed to load data", err);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!image) return;
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(image);
  }, [image]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("Name is required");

    const formData = new FormData();
    formData.append("name", name);
    if (image) formData.append("image", image);
    if (parentCategoryId) formData.append("parentCategoryId", parentCategoryId);

    setLoading(true);
    try {
      await put(API_ROUTES.UPDATE_CATEGORY(id), formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/admin/categories");
    } catch (err) {
      console.error("Failed to update category", err);
      alert("Failed to update category");
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
        Edit Category
      </Typography>

      <GradientPaper>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {/* Image Upload */}
            <Box display="flex" justifyContent="center">
              <Box
                onClick={() => document.getElementById("image-upload").click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor =
                    theme.palette.primary.main;
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = theme.palette.divider;
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file && file.type.startsWith("image/")) {
                    setImage(file);
                  }
                  e.currentTarget.style.borderColor = theme.palette.divider;
                }}
                sx={{
                  width: 150,
                  height: 150,
                  border: "2px dashed",
                  borderColor: theme.palette.divider,
                  borderRadius: 2,
                  cursor: "pointer",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  bgcolor: theme.palette.background.default,
                  transition: "border-color 0.2s",
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  id="image-upload"
                  style={{ display: "none" }}
                  onChange={(e) => setImage(e.target.files[0])}
                />

                {preview ? (
                  <>
                    <img
                      src={preview}
                      alt="Preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <Box
                      onClick={(e) => {
                        e.stopPropagation();
                        setImage(null);
                        setPreview(null);
                      }}
                      sx={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        backgroundColor: "rgba(0,0,0,0.6)",
                        color: "white",
                        borderRadius: "50%",
                        width: 24,
                        height: 24,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 16,
                        cursor: "pointer",
                        zIndex: 1,
                      }}
                    >
                      ×
                    </Box>
                  </>
                ) : (
                  <Typography variant="h2" color="text.secondary">
                    +
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Name Input */}
            <TextField
              label="Category Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
            />

            {/* Parent Category Autocomplete */}
            <Autocomplete
              options={mainCategories}
              getOptionLabel={(option) => option.name || ""}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              onChange={(event, newValue) => {
                setParentCategoryId(newValue?._id || "");
              }}
              value={
                mainCategories.find((cat) => cat._id === parentCategoryId) ||
                null
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Parent Category"
                  placeholder="None"
                  fullWidth
                />
              )}
            />

            {/* Submit */}
            <Box display="flex" justifyContent="center">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ color: "#fff", minWidth: 160 }}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Update Category"
                )}
              </Button>
            </Box>
          </Stack>
        </form>
      </GradientPaper>
    </Box>
  );
};

export default CategoryEdit;
