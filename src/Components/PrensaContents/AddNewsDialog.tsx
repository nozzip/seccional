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
    setFormData({ title: "", summary: "", link: "", imgUrl: "" });
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

      <DialogContent dividers sx={{ border: "none" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, py: 1 }}>
          <TextField
            label="Título de la Noticia"
            name="title"
            fullWidth
            value={formData.title}
            onChange={handleTextChange}
            required
            variant="outlined"
          />
          
          <TextField
            label="Resumen / Descripción"
            name="summary"
            fullWidth
            multiline
            rows={4}
            value={formData.summary}
            onChange={handleTextChange}
            required
          />

          <TextField
            label="Link Externo (Opcional)"
            name="link"
            fullWidth
            value={formData.link}
            onChange={handleTextChange}
            placeholder="https://..."
          />

          <Box>
            <Typography variant="subtitle2" gutterBottom fontWeight={700}>
              Imagen de la Noticia
            </Typography>
            <Box 
              sx={{ 
                border: "2px dashed", 
                borderColor: alpha(theme.palette.primary.main, 0.3),
                borderRadius: 3,
                p: 2,
                textAlign: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.02),
                cursor: "pointer",
                "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.05) }
              }}
              component="label"
            >
              <input type="file" hidden accept="image/*" onChange={handleImageChange} />
              {imagePreview ? (
                <Box component="img" src={imagePreview} sx={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 2 }} />
              ) : (
                <Box sx={{ py: 2 }}>
                  <PhotoCameraIcon sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Haz clic para subir una imagen
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} color="inherit" sx={{ fontWeight: 700 }}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{ 
            borderRadius: 10, 
            px: 4, 
            fontWeight: 800,
            boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Publicar Noticia"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
