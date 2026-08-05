import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  alpha,
  useTheme,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CollectionsIcon from "@mui/icons-material/Collections";
import { supabase } from "../../supabaseClient";
import { isUserAdmin } from "../../utils/auth";

interface AddNewsDialogProps {
  open: boolean;
  onClose: () => void;
  onNewsAdded: () => void;
}

export default function AddNewsDialog({
  open,
  onClose,
  onNewsAdded,
}: AddNewsDialogProps) {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    content: "",
    link: "",
    imgUrl: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [thumbnailFiles, setThumbnailFiles] = useState<File[]>([]);
  const [thumbnailPreviews, setThumbnailPreviews] = useState<string[]>([]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleThumbnailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const updatedFiles = [...thumbnailFiles, ...selectedFiles];
      const updatedPreviews = [
        ...thumbnailPreviews,
        ...selectedFiles.map((file) => URL.createObjectURL(file)),
      ];
      setThumbnailFiles(updatedFiles);
      setThumbnailPreviews(updatedPreviews);
    }
  };

  const handleRemoveThumbnail = (index: number) => {
    setThumbnailFiles((prev) => prev.filter((_, i) => i !== index));
    setThumbnailPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.summary) {
      alert("Por favor completa el título y el resumen.");
      return;
    }

    // Doble verificación de seguridad en el cliente
    const userStr = localStorage.getItem("current_affiliate");
    const user = userStr ? JSON.parse(userStr) : null;
    const isAdmin = isUserAdmin(user);

    if (!isAdmin) {
      alert("No tienes permisos para realizar esta acción.");
      return;
    }

    setLoading(true);
    try {
      let finalImgUrl = formData.imgUrl;

      // 1. Upload main image if file exists
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `news/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("benefits") // Reutilizamos el bucket benefits o uno de news si existe
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("benefits")
          .getPublicUrl(filePath);
        
        finalImgUrl = publicUrlData.publicUrl;
      }

      // 2. Upload thumbnail gallery images
      const uploadedThumbnails: string[] = [];
      for (const file of thumbnailFiles) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `news/thumbnails/${fileName}`;

        const { error: uploadErr } = await supabase.storage
          .from("benefits")
          .upload(filePath, file);

        if (!uploadErr) {
          const { data: pubData } = supabase.storage
            .from("benefits")
            .getPublicUrl(filePath);
          if (pubData?.publicUrl) {
            uploadedThumbnails.push(pubData.publicUrl);
          }
        } else {
          console.warn("Upload thumbnail error:", uploadErr);
        }
      }

      // 3. Prepare payload for news table
      let finalContent = formData.content;
      if (uploadedThumbnails.length > 0) {
        finalContent = `${formData.content}\n\n<!--GALLERY:${JSON.stringify(uploadedThumbnails)}-->`;
      }

      const insertPayload: any = {
        title: formData.title,
        summary: formData.summary,
        content: finalContent,
        link: formData.link,
        img_url: finalImgUrl,
      };

      if (uploadedThumbnails.length > 0) {
        insertPayload.gallery_urls = uploadedThumbnails;
      }

      let { error: insertError } = await supabase.from("news").insert([insertPayload]);

      // Si falla porque la columna 'gallery_urls' no existe en la BD de Supabase, reintentar omitiendo esa columna
      if (insertError && (insertError.code === "PGRST204" || insertError.message?.includes("gallery_urls"))) {
        delete insertPayload.gallery_urls;
        const retry = await supabase.from("news").insert([insertPayload]);
        insertError = retry.error;
      }

      if (insertError) throw insertError;

      onNewsAdded();
      handleClose();
    } catch (error: any) {
      console.error("Error al guardar noticia:", error);
      alert("Error al guardar la noticia: " + (error.message || "Comprueba los datos ingresados."));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ title: "", summary: "", content: "", link: "", imgUrl: "" });
    setImageFile(null);
    setImagePreview(null);
    setThumbnailFiles([]);
    setThumbnailPreviews([]);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: 2,
          backgroundImage: "none",
        },
      }}
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h5" component="div" fontWeight={800} color="primary">
          Cargar Nueva Noticia
        </Typography>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ border: "none", px: 4, py: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5, mt: 1 }}>
          <TextField
            label="Título de la Noticia"
            name="title"
            fullWidth
            value={formData.title}
            onChange={handleTextChange}
            required
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                bgcolor: alpha(theme.palette.background.paper, 0.5),
              },
            }}
          />
          
          <TextField
            label="Resumen / Descripción corta"
            name="summary"
            fullWidth
            multiline
            rows={2}
            value={formData.summary}
            onChange={handleTextChange}
            required
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                bgcolor: alpha(theme.palette.background.paper, 0.5),
              },
            }}
          />

          <TextField
            label="Cuerpo de la Noticia (Contenido Completo)"
            name="content"
            fullWidth
            multiline
            rows={8}
            value={formData.content}
            onChange={handleTextChange}
            placeholder="Escribe aquí el desarrollo de la noticia..."
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                bgcolor: alpha(theme.palette.background.paper, 0.5),
              },
            }}
          />

          <TextField
            label="Link Externo (Opcional)"
            name="link"
            fullWidth
            value={formData.link}
            onChange={handleTextChange}
            placeholder="https://..."
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                bgcolor: alpha(theme.palette.background.paper, 0.5),
              },
            }}
          />

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 800, color: "text.primary", ml: 0.5 }}>
              Imagen de la Noticia
            </Typography>
            <Box 
              sx={{ 
                border: "2px dashed", 
                borderColor: alpha(theme.palette.primary.main, 0.4),
                borderRadius: 4,
                p: 3,
                textAlign: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.03),
                cursor: "pointer",
                display: "block",
                transition: "all 0.3s ease",
                "&:hover": { 
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  borderColor: theme.palette.primary.main,
                  transform: "scale(1.01)"
                }
              }}
              component="label"
            >
              <input type="file" hidden accept="image/*" onChange={handleImageChange} />
              {imagePreview ? (
                <Box 
                  component="img" 
                  src={imagePreview} 
                  sx={{ 
                    width: "100%", 
                    maxHeight: 250, 
                    objectFit: "cover", 
                    borderRadius: 3,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.2)"
                  }} 
                />
              ) : (
                <Box sx={{ py: 3 }}>
                  <PhotoCameraIcon sx={{ fontSize: 48, color: "primary.main", mb: 1.5, opacity: 0.8 }} />
                  <Typography variant="body1" sx={{ fontWeight: 600, color: "text.secondary" }}>
                    Haz clic para subir una imagen de portada
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.disabled", mt: 1, display: "block" }}>
                    Formatos soportados: JPG, PNG, WEBP
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* Cargar imagenes thumbnails */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 800, color: "text.primary", ml: 0.5 }}>
              Cargar imagenes thumbnails (pie de noticia)
            </Typography>
            <Box 
              sx={{ 
                border: "2px dashed", 
                borderColor: alpha(theme.palette.secondary.main, 0.4),
                borderRadius: 4,
                p: 3,
                textAlign: "center",
                bgcolor: alpha(theme.palette.secondary.main, 0.03),
                cursor: "pointer",
                display: "block",
                transition: "all 0.3s ease",
                "&:hover": { 
                  bgcolor: alpha(theme.palette.secondary.main, 0.08),
                  borderColor: theme.palette.secondary.main,
                  transform: "scale(1.005)"
                }
              }}
              component="label"
            >
              <input 
                type="file" 
                hidden 
                accept="image/*" 
                multiple 
                onChange={handleThumbnailsChange} 
              />
              <Box sx={{ py: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <CollectionsIcon sx={{ fontSize: 44, color: "secondary.main", mb: 1, opacity: 0.8 }} />
                <Typography variant="body1" sx={{ fontWeight: 600, color: "text.secondary" }}>
                  Haz clic para agregar varias imágenes al pie
                </Typography>
                <Typography variant="caption" sx={{ color: "text.disabled", mt: 0.5 }}>
                  Puedes seleccionar múltiples fotos (JPG, PNG, WEBP)
                </Typography>
              </Box>
            </Box>

            {thumbnailPreviews.length > 0 && (
              <Box sx={{ mt: 2.5, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 1.5 }}>
                {thumbnailPreviews.map((preview, index) => (
                  <Box
                    key={index}
                    sx={{
                      position: "relative",
                      width: "100%",
                      paddingTop: "100%",
                      borderRadius: 3,
                      overflow: "hidden",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      border: "1px solid",
                      borderColor: alpha(theme.palette.divider, 0.5),
                    }}
                  >
                    <Box
                      component="img"
                      src={preview}
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveThumbnail(index);
                      }}
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        bgcolor: "rgba(0,0,0,0.65)",
                        color: "white",
                        p: 0.4,
                        "&:hover": { bgcolor: "error.main" },
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 4, pt: 2, justifyContent: "flex-end", gap: 2 }}>
        <Button 
          onClick={handleClose} 
          sx={{ 
            fontWeight: 800, 
            color: "text.secondary",
            px: 3,
            "&:hover": { color: "error.main" }
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{ 
            borderRadius: 10, 
            px: 5, 
            py: 1.5,
            fontWeight: 900,
            fontSize: "1rem",
            textTransform: "none",
            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
            "&:hover": {
              boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.5)}`,
            }
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Publicar Noticia"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
