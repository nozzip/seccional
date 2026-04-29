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
import { supabase } from "../../supabaseClient";

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

  const handleSubmit = async () => {
    if (!formData.title || !formData.summary) {
      alert("Por favor completa el título y el resumen.");
      return;
    }

    // Doble verificación de seguridad en el cliente
    const userStr = localStorage.getItem("current_affiliate");
    const user = userStr ? JSON.parse(userStr) : null;
    const isAdmin = user?.role === "admin" || user?.dni === "34185803";

    if (!isAdmin) {
      alert("No tienes permisos para realizar esta acción.");
      return;
    }

    setLoading(true);
    try {
      let finalImgUrl = formData.imgUrl;

      // 1. Upload image if file exists
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

      // 2. Insert into news table
      const { error: insertError } = await supabase.from("news").insert([
        {
          title: formData.title,
          summary: formData.summary,
          content: formData.content,
          link: formData.link,
          img_url: finalImgUrl,
        },
      ]);

      if (insertError) throw insertError;

      onNewsAdded();
      handleClose();
    } catch (error: any) {
      console.error("Error al guardar noticia:", error);
      alert("Error al guardar la noticia: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ title: "", summary: "", content: "", link: "", imgUrl: "" });
    setImageFile(null);
    setImagePreview(null);
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
        <Typography variant="h5" fontWeight={800} color="primary">
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
                    Haz clic para subir una imagen
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.disabled", mt: 1, display: "block" }}>
                    Formatos soportados: JPG, PNG, WEBP
                  </Typography>
                </Box>
              )}
            </Box>
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
