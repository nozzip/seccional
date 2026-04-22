import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  BottomNavigation,
  BottomNavigationAction,
  useTheme,
  alpha,
  Avatar,
  IconButton,
  Fab,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import PersonIcon from "@mui/icons-material/Person";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import NotificationsIcon from "@mui/icons-material/Notifications";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import GridBeneficios from "../ContentsBeneficios/GridBeneficios";
import BirthdayCarousel from "../ContentsFront/BirthdayCarousel";
import { useEffect } from "react";
import { supabase } from "../../supabaseClient";
import FormLogin from "../LoginForm/FormLogin";
import LogoutIcon from "@mui/icons-material/Logout";

export default function MobileAppView() {
  const theme = useTheme();
  const [value, setValue] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const renderContent = () => {
    switch (value) {
      case 0: // Inicio
        return (
          <Box sx={{ p: 2 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                ¡Hola, Afiliado! 👋
              </Typography>
              <BirthdayCarousel />
            </Box>
            
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
              Tus Próximos Servicios
            </Typography>
            <Paper sx={{ p: 2, borderRadius: 2, mb: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>Reserva en Cabañas - "La Warmi"</Typography>
              <Typography variant="caption" color="text.secondary">Fecha: Próximo Sábado 12:00hs</Typography>
            </Paper>
          </Box>
        );
      case 1: // Beneficios
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
              Tus Beneficios
            </Typography>
            <GridBeneficios />
          </Box>
        );
      case 2: // Novedades
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
              Prensa y Novedades
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No hay novedades nuevas hoy.
            </Typography>
          </Box>
        );
      case 3: // Perfil
        if (loading) {
          return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography>Cargando...</Typography>
            </Box>
          );
        }

        if (!user) {
          return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
                Área de Afiliados
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Inicia sesión para acceder a tu credencial digital y beneficios exclusivos.
              </Typography>
              <FormLogin submitForm={() => {}} toggleForm={() => {}} />
            </Box>
          );
        }

        return (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Avatar 
              src={user.user_metadata?.avatar_url}
              sx={{ width: 100, height: 100, mx: "auto", mb: 2, bgcolor: "primary.main" }}
            >
              {user.email?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {user.user_metadata?.full_name || user.email}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Afiliado - Noroeste
            </Typography>
            
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, textAlign: "left", mb: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main" }}>ESTADO DE CUENTA</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>Al día ✅</Typography>
            </Paper>

            <IconButton 
              onClick={handleLogout}
              color="error"
              sx={{ mt: 2 }}
            >
              <LogoutIcon sx={{ mr: 1 }} />
              <Typography variant="button">Cerrar Sesión</Typography>
            </IconButton>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 450,
        height: "100vh",
        bgcolor: "background.default",
        position: "relative",
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        borderLeft: "1px solid",
        borderRight: "1px solid",
        borderColor: "divider",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box component="img" src="/seccionalLogo.png" sx={{ height: 35 }} />
        <IconButton color="primary">
          <NotificationsIcon />
        </IconButton>
      </Box>

      {/* Content Area */}
      <Box sx={{ flex: 1, overflowY: "auto", pb: 10 }}>
        {renderContent()}
      </Box>

      {/* Floating Action Button for QR/Credential */}
      <Fab 
        color="primary" 
        sx={{ 
          position: "absolute", 
          bottom: 80, 
          left: "50%", 
          transform: "translateX(-50%)",
          boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`
        }}
      >
        <QrCode2Icon />
      </Fab>

      {/* Bottom Navigation */}
      <Paper
        sx={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
        elevation={3}
      >
        <BottomNavigation
          showLabels
          value={value}
          onChange={(event, newValue) => {
            setValue(newValue);
          }}
        >
          <BottomNavigationAction label="Inicio" icon={<HomeIcon />} />
          <BottomNavigationAction label="Beneficios" icon={<CardGiftcardIcon />} />
          <BottomNavigationAction label="Prensa" icon={<NewspaperIcon />} />
          <BottomNavigationAction label="Perfil" icon={<PersonIcon />} />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
