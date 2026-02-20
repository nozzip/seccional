import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Link as MuiLink,
  Stack,
  alpha,
  useTheme
} from '@mui/material';
import { signupSchema } from './schemas';

const FormSignup = ({ submitForm }) => {
  const theme = useTheme();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = (data) => {
    console.log(data);
    submitForm();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: 450,
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, color: 'primary.main', textAlign: 'center' }}>
        Crear Cuenta
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', textAlign: 'center' }}>
        Únete a la Seccional Noroeste hoy mismo.
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ width: '100%' }}>
        <Stack spacing={2.5}>
          <TextField
            fullWidth
            label="Nombre de usuario"
            placeholder="Ej: jmarterie"
            {...register('username')}
            error={!!errors.username}
            helperText={errors.username?.message}
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            placeholder="correo@ejemplo.com"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            fullWidth
            label="Contraseña"
            type="password"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <TextField
            fullWidth
            label="Confirmar Contraseña"
            type="password"
            {...register('password2')}
            error={!!errors.password2}
            helperText={errors.password2?.message}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{
              mt: 2,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 700,
              boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          >
            Registrarse
          </Button>

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            ¿Ya tienes una cuenta?{' '}
            <MuiLink href="#" sx={{ fontWeight: 700, color: 'primary.main', textDecoration: 'none' }}>
              Inicia sesión aquí
            </MuiLink>
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default FormSignup;
