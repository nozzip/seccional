import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Box,
  Grid,
  Button,
  useTheme,
  alpha,
  Zoom,
  Fade,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import PoolIcon from "@mui/icons-material/Pool";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import SecurityIcon from "@mui/icons-material/Security";
import { motion, AnimatePresence } from "framer-motion";

interface AdminCapabilitiesModalProps {
  open: boolean;
  onClose: () => void;
}

const CapabilityItem = ({ icon: Icon, title, description, color }: any) => {
  const theme = useTheme();
  return (
    <Grid item xs={12} sm={6}>
      <motion.div
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Box
          sx={{
            p: 2,
            borderRadius: 4,
            bgcolor: alpha(color, 0.05),
            border: "1px solid",
            borderColor: alpha(color, 0.1),
            height: "100%",
            display: "flex",
            gap: 2,
            transition: "all 0.3s ease",
            "&:hover": {
              bgcolor: alpha(color, 0.08),
              borderColor: alpha(color, 0.2),
              boxShadow: `0 8px 16px ${alpha(color, 0.1)}`,
            },
          }}
        >
          <Box
            sx={{
              p: 1.5,
              borderRadius: 3,
              bgcolor: color,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 12px ${alpha(color, 0.4)}`,
              height: "fit-content",
            }}
          >
            <Icon fontSize="medium" />
          </Box>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 800, color: "text.primary", mb: 0.5 }}
            >
              {title}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", lineHeight: 1.4, fontWeight: 500 }}
            >
              {description}
            </Typography>
          </Box>
        </Box>
      </motion.div>
    </Grid>
  );
};

const AdminCapabilitiesModal: React.FC<AdminCapabilitiesModalProps> = ({
  open,
  onClose,
}) => {
  const theme = useTheme();

  const capabilities = [
    {
      icon: PeopleAltIcon,
      title: "Gestión de Afiliados",
      description:
        "Control total de socios, grupos familiares y estados de cuenta en tiempo real.",
      color: theme.palette.primary.main,
    },
    {
      icon: AccountBalanceWalletIcon,
      title: "Finanzas y Caja",
      description:
        "Registro de ingresos, egresos, arqueos de caja y generación de reportes contables.",
      color: "#2e7d32", // Success variant
    },
    {
      icon: EventAvailableIcon,
      title: "Sistema de Reservas",
      description:
        "Calendario interactivo para canchas y cabañas con precios dinámicos.",
      color: "#ed6c02", // Warning variant
    },
    {
      icon: PoolIcon,
      title: "Escuela de Natación",
      description:
        "Seguimiento de alumnos, asistencias y alertas automáticas de vencimientos.",
      color: "#0288d1", // Info variant
    },
    {
      icon: LocalShippingIcon,
      title: "Proveedores",
      description:
        "Administración de gastos fijos, compras y proveedores de servicios.",
      color: "#9c27b0", // Purple
    },
    {
      icon: SecurityIcon,
      title: "Seguridad Avanzada",
      description:
        "Acceso protegido mediante Supabase Auth y políticas de seguridad (RLS).",
      color: "#d32f2f", // Error variant
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      TransitionComponent={Zoom}
      PaperProps={{
        sx: {
          borderRadius: 6,
          p: 0,
          overflow: "hidden",
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.default, 0.95)} 100%)`,
          boxShadow: `0 24px 48px ${alpha("#000", 0.15)}`,
        },
      }}
    >
      <Box sx={{ position: "relative" }}>
        {/* Header with Gradient Background */}
        <Box
          sx={{
            px: 4,
            pt: 5,
            pb: 3,
            background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.main, 0.02)})`,
            borderBottom: "1px solid",
            borderColor: alpha(theme.palette.divider, 0.1),
          }}
        >
          <IconButton
            onClick={onClose}
            sx={{
              position: "absolute",
              right: 20,
              top: 20,
              color: "text.secondary",
              "&:hover": {
                bgcolor: alpha(theme.palette.error.main, 0.1),
                color: theme.palette.error.main,
              },
            }}
          >
            <CloseIcon />
          </IconButton>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: "50%",
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
                display: "flex",
              }}
            >
              <RocketLaunchIcon fontSize="large" />
            </Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 900, letterSpacing: -1, color: "text.primary" }}
            >
              Panel de Control{" "}
              <span style={{ color: theme.palette.primary.main }}>
                Profesional
              </span>
            </Typography>
          </Box>
          <Typography
            variant="h6"
            sx={{ color: "text.secondary", fontWeight: 500, maxWidth: "90%" }}
          >
            Bienvenido al centro de mando. Descubrí las herramientas diseñadas
            para optimizar la gestión de la Seccional.
          </Typography>
        </Box>

        <DialogContent sx={{ p: 4, pt: 2, pb: 6 }}>
          <Grid container spacing={3}>
            {capabilities.map((cap, index) => (
              <CapabilityItem key={index} {...cap} />
            ))}
          </Grid>

          <Box sx={{ mt: 5, display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              size="large"
              onClick={onClose}
              sx={{
                px: 8,
                py: 1.5,
                borderRadius: 4,
                fontWeight: 900,
                fontSize: "1rem",
                boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.35)}`,
                textTransform: "none",
                "&:hover": {
                  boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.45)}`,
                  transform: "scale(1.02)",
                },
              }}
            >
              Comenzar ahora
            </Button>
          </Box>

          <Typography
            variant="caption"
            sx={{
              display: "block",
              textAlign: "center",
              mt: 3,
              color: "text.disabled",
              fontWeight: 600,
            }}
          >
            Antigravity OS • Sistema v1.0.0
          </Typography>
        </DialogContent>
      </Box>
    </Dialog>
  );
};

export default AdminCapabilitiesModal;
