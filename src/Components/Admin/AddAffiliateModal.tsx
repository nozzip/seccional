import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Stack,
  IconButton,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { supabase } from "../../supabaseClient";

interface AddAffiliateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddAffiliateModal({
  open,
  onClose,
  onSuccess,
}: AddAffiliateModalProps) {
  const [formData, setFormData] = useState({
    cuil: "",
    legajo: "",
    apellido: "",
    nombre: "",
    provincia: "",
    ciudad: "",
    sexo: "Hombre",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!formData.cuil || !formData.apellido || !formData.nombre) {
      setError("CUIL, Apellido y Nombre son campos obligatorios.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase.from("affiliates").insert([
        {
          ...formData,
          branch: "noroeste",
        },
      ]);

      if (insertError) throw insertError;

      onSuccess();
      onClose();
      setFormData({
        cuil: "",
        legajo: "",
        apellido: "",
        nombre: "",
        provincia: "",
        ciudad: "",
        sexo: "Hombre",
      });
    } catch (err: any) {
      console.error(err);
      setError("Error al guardar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Nuevo Afiliado Titular
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              label="CUIL"
              name="cuil"
              value={formData.cuil}
              onChange={handleChange}
              size="small"
              required
            />
            <TextField
              fullWidth
              label="Legajo"
              name="legajo"
              value={formData.legajo}
              onChange={handleChange}
              size="small"
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              label="Apellido"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              size="small"
              required
            />
            <TextField
              fullWidth
              label="Nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              size="small"
              required
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              label="Provincia"
              name="provincia"
              value={formData.provincia}
              onChange={handleChange}
              size="small"
            />
            <TextField
              fullWidth
              label="Ciudad"
              name="ciudad"
              value={formData.ciudad}
              onChange={handleChange}
              size="small"
            />
          </Stack>

          <FormControl fullWidth size="small">
            <InputLabel>Sexo</InputLabel>
            <Select
              name="sexo"
              value={formData.sexo}
              label="Sexo"
              onChange={handleChange}
            >
              <MenuItem value="Hombre">Hombre</MenuItem>
              <MenuItem value="Mujer">Mujer</MenuItem>
              <MenuItem value="Otro">Otro/Prefiero no decir</MenuItem>
            </Select>
          </FormControl>

          {error && (
            <Typography color="error" variant="caption">
              {error}
            </Typography>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, px: 3 }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading}
          startIcon={
            loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <PersonAddIcon />
            )
          }
          sx={{ borderRadius: 2 }}
        >
          {loading ? "Guardando..." : "Guardar Afiliado"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
