import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  TextField,
  Typography,
  Link as MuiLink,
  Stack,
  alpha,
  useTheme,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Link } from "react-router-dom";
import { AssignmentInd as AssignmentIndIcon } from "@mui/icons-material";
import { z } from "zod";
import { supabase } from "../../supabaseClient";

const loginSchema = z.object({
  identifier: z.string().min(4, "Ingresa un legajo o DNI válido"),
});

const FormLogin = ({
  submitForm,
}: {
  submitForm: any;
  toggleForm?: () => void;
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const id = data.identifier.trim();
      const baseId = id.replace(/^0+/, "");
      const variations = Array.from(new Set([id, baseId, `0${baseId}`]));

      // Search by legajo OR by CUIL (containing the identifier as DNI)
      const { data: results, error: dbError } = await supabase
        .from("affiliates")
        .select("*")
        .or(`legajo.in.(${variations.join(",")}),cuil.ilike.%${id}%`)
        .eq("branch", "noroeste")
        .limit(1);

      if (dbError) throw dbError;

      if (!results || results.length === 0) {
        setError("No se encontró un afiliado con esos datos en la seccional Noroeste.");
      } else {
        const affiliate = results[0];
        localStorage.setItem("current_affiliate", JSON.stringify(affiliate));
        // Also trigger a custom event so other components know the state changed
        window.dispatchEvent(new Event("affiliate_login"));
        submitForm();
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError("Error al conectar con el servidor. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        maxWidth: 450,
        mx: "auto",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          mb: 1.5,
          color: "primary.main",
          textAlign: "center",
          letterSpacing: "-0.5px",
        }}
      >
        Portal de Afiliados
      </Typography>
      <Typography
        variant="body1"
        sx={{ mb: 4, color: "text.secondary", textAlign: "center" }}
      >
        Ingresa tu Legajo o DNI para acceder a tus beneficios.
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        sx={{ width: "100%" }}
      >
        <Stack spacing={3}>
          <TextField
            fullWidth
            label="Legajo o DNI"
            placeholder="Ej: 33296 o 12345678"
            variant="outlined"
            {...register("identifier")}
            error={!!errors.identifier || !!error}
            helperText={(errors.identifier?.message as string) || error}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AssignmentIndIcon color="action" />
                </InputAdornment>
              ),
              sx: { borderRadius: 3 },
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              mt: 1,
              py: 2,
              fontSize: "1rem",
              fontWeight: 700,
              borderRadius: 3,
              boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              "&:hover": {
                background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.5)}`,
              },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Ingresar"}
          </Button>

          <Typography
            variant="body2"
            align="center"
            sx={{ mt: 2, color: "text.secondary" }}
          >
            ¿Aún no eres afiliado?{" "}
            <MuiLink
              component={Link}
              to="/afiliar"
              sx={{
                fontWeight: 700,
                color: "primary.main",
                textDecoration: "none",
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Solicita tu afiliación aquí
            </MuiLink>
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default FormLogin;
