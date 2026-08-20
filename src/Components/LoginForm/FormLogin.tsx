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
import { Link, useNavigate } from "react-router-dom";
import { 
  AssignmentInd as AssignmentIndIcon,
  Visibility,
  VisibilityOff
} from "@mui/icons-material";
import { z } from "zod";
import { supabase } from "../../supabaseClient";
import { isUserAdmin } from "../../utils/auth";


const loginSchema = z.object({
  identifier: z.string().min(4, "Ingresa un legajo o DNI válido"),
  password: z.string().optional(),
});

const ADMIN_DNI = "34185803";
const ADMIN_PASS = "Lecongy@290";
const RAMIRO_LEGAJO = "042418/00";

const FormLogin = ({
  submitForm,
}: {
  submitForm?: any;
  toggleForm?: () => void;
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    }
  });

  const identifier = watch("identifier").trim();
  const isAdminDNI = identifier === ADMIN_DNI;
  const isRamiro = identifier === RAMIRO_LEGAJO;
  const showPasswordField = isAdminDNI || isRamiro;

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const id = data.identifier.trim();

      // Check if it's the admin
      if (id === ADMIN_DNI) {
        if (data.password === ADMIN_PASS) {
          const adminUser = {
            id: "admin-01",
            nombre: "Administrador",
            apellido: "Sistema",
            role: "admin",
            legajo: "ADMIN",
            dni: "34185803",
            branch: "noroeste"
          };
          localStorage.setItem("current_affiliate", JSON.stringify(adminUser));
          localStorage.setItem("mobile_app_legajo", "ADMIN");
          localStorage.setItem("mobile_app_name", "Administrador Sistema");
          window.dispatchEvent(new Event("affiliate_login"));
          if (submitForm) submitForm();
          navigate("/admin");
          return;
        } else {
          setError("Contraseña de administrador incorrecta.");
          setLoading(false);
          return;
        }
      }

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
        const user = results[0];

        // Special logic for Ramiro
        if (id === RAMIRO_LEGAJO) {
          if (!data.password) {
            setError("Debes ingresar una contraseña.");
            setLoading(false);
            return;
          }

          if (!user.password) {
            // First time login: save the password
            const { error: updErr } = await supabase
              .from("affiliates")
              .update({ password: data.password, role: "admin" })
              .eq("id", user.id);
            
            if (updErr) throw updErr;
          } else if (user.password !== data.password) {
            setError("Contraseña incorrecta.");
            setLoading(false);
            return;
          }
        }

        const isAdmin = isUserAdmin({ ...user, legajo: id });
        const affiliate = { ...user, role: isAdmin ? "admin" : "user" };
        
        localStorage.setItem("current_affiliate", JSON.stringify(affiliate));
        localStorage.setItem("mobile_app_legajo", affiliate.legajo);
        localStorage.setItem("mobile_app_name", `${affiliate.nombre} ${affiliate.apellido}`);
        localStorage.setItem("mobile_app_cuil", affiliate.cuil || "");
        localStorage.setItem("mobile_app_validation_token", affiliate.validation_token || "");
        localStorage.setItem("mobile_app_telefono", affiliate.telefono || "");
        localStorage.setItem("mobile_app_email", affiliate.email || "");
        localStorage.setItem("mobile_app_jubilado", String(affiliate.es_jubilado || false));
        localStorage.setItem("mobile_app_fecha_nacimiento", affiliate.fecha_nacimiento || "");
        localStorage.setItem("mobile_app_conyuge_nombre", affiliate.conyuge_nombre || "");
        localStorage.setItem("mobile_app_conyuge_dni", affiliate.conyuge_dni || "");

        window.dispatchEvent(new Event("affiliate_login"));
        if (submitForm) submitForm();

        if (isAdmin) {
          navigate("/admin");
        } else {
          navigate("/perfil");
        }
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
        {showPasswordField 
          ? "Ingresa tu contraseña para continuar." 
          : "Ingresa tu Legajo o DNI para acceder a tus beneficios."}
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
            helperText={(errors.identifier?.message as string) || (error && !showPasswordField ? error : "")}
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

          {showPasswordField && (
            <TextField
              fullWidth
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              {...register("password")}
              error={!!error && showPasswordField}
              helperText={showPasswordField ? error : ""}
              disabled={loading}
              InputProps={{
                sx: { borderRadius: 3 },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}

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

          {!isAdminDNI && (
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
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default FormLogin;
