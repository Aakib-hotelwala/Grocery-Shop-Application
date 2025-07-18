import React, { useState, useEffect, useRef } from "react";
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
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { get, post } from "../../../services/endpoints";
import API_ROUTES from "../../../services/apiRoutes";
import { useNavigate } from "react-router-dom";

const GradientPaper = styled("div")(({ theme }) => ({
  background: theme.components?.custom?.cardGradient,
  boxShadow: theme.components?.custom?.cardShadow,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  maxWidth: 600,
  margin: "0 auto", // center the card
  width: "100%",
}));

const CategoryCreate = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [parentCategoryId, setParentCategoryId] = useState("");
  const [mainCategories, setMainCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const imageInputRef = useRef(null);

  useEffect(() => {
    const fetchMain = async () => {
      try {
        const data = await get(API_ROUTES.GET_ALL_CATEGORIES);
        setMainCategories(data.categories || []);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchMain();
  }, []);

  useEffect(() => {
    if (!image) return setPreview(null);
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
      await post(API_ROUTES.CREATE_CATEGORY, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/admin/categories");
    } catch (err) {
      console.error("Failed to create category", err);
      alert("Failed to create category");
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
        Create Category
      </Typography>

      <GradientPaper>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {/* Image Upload - Centered */}
            <Box display="flex" justifyContent="center">
              <Box
                onClick={() => imageInputRef.current?.click()}
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
                  ref={imageInputRef}
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
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImage(null);
                        setPreview(null);
                        if (imageInputRef.current) {
                          imageInputRef.current.value = null;
                        }
                      }}
                      sx={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        backgroundColor: "rgba(0,0,0,0.6)",
                        color: "white",
                        width: 24,
                        height: 24,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                        zIndex: 1,
                        "&:hover": {
                          backgroundColor: "rgba(0,0,0,0.8)",
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </>
                ) : (
                  <Typography variant="h2" color="text.secondary">
                    +
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Category Name */}
            <TextField
              label="Category Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
            />

            {/* Parent Category */}
            <Autocomplete
              options={mainCategories}
              getOptionLabel={(option) => option.name || ""}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              onChange={(event, newValue) => {
                setParentCategoryId(newValue?._id || "");
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Parent Category"
                  placeholder="None"
                  fullWidth
                />
              )}
              value={
                mainCategories.find((cat) => cat._id === parentCategoryId) ||
                null
              }
            />

            {/* Submit Button - Centered */}
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
                  "Create Category"
                )}
              </Button>
            </Box>
          </Stack>
        </form>
      </GradientPaper>
    </Box>
  );
};

export default CategoryCreate;
