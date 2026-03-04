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
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Lock,
} from "@mui/icons-material";
import { signupSchema } from "./schemas";

const FormSignup = ({
  submitForm,
  toggleForm,
}: {
  submitForm: any;
  toggleForm: () => void;
}) => {
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = (data: any) => {
    console.log(data);
    submitForm();
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
        Crear Cuenta
      </Typography>
      <Typography
        variant="body1"
        sx={{ mb: 4, color: "text.secondary", textAlign: "center" }}
      >
        Únete a la Seccional Noroeste y accede a tus beneficios.
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        sx={{ width: "100%" }}
      >
        <Stack spacing={2.5}>
          <TextField
            fullWidth
            label="Nombre de usuario"
            placeholder="Ej: jmarterie"
            variant="outlined"
            {...register("username")}
            error={!!errors.username}
            helperText={errors.username?.message as string}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person color="action" />
                </InputAdornment>
              ),
              sx: { borderRadius: 3 },
            }}
          />

          <TextField
            fullWidth
            label="Email"
            type="email"
            placeholder="correo@ejemplo.com"
            variant="outlined"
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message as string}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="action" />
                </InputAdornment>
              ),
              sx: { borderRadius: 3 },
            }}
          />

          <TextField
            fullWidth
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message as string}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
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
              sx: { borderRadius: 3 },
            }}
          />

          <TextField
            fullWidth
            label="Confirmar Contraseña"
            type="password"
            variant="outlined"
            {...register("password2")}
            error={!!errors.password2}
            helperText={errors.password2?.message as string}
            InputProps={{
              sx: { borderRadius: 3 },
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
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
            Registrarse
          </Button>

          <Typography
            variant="body2"
            align="center"
            sx={{ mt: 2, color: "text.secondary" }}
          >
            ¿Ya tienes una cuenta?{" "}
            <MuiLink
              component="button"
              type="button"
              onClick={toggleForm}
              sx={{
                fontWeight: 700,
                color: "primary.main",
                textDecoration: "none",
                border: "none",
                background: "none",
                cursor: "pointer",
                padding: 0,
                fontSize: "inherit",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Inicia sesión aquí
            </MuiLink>
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default FormSignup;
