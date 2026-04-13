import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  alpha,
  useTheme,
  Chip,
  Button,
  Divider,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import ParkIcon from "@mui/icons-material/Park";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ServiceGallery from "./ServiceGallery";
import { photosSanLorenzo } from "../mockData";

function SanLorenzo() {
  const theme = useTheme();

  const amenities = [
    { icon: <EventSeatIcon fontSize="small" />, label: "Amplia Capacidad" },
    { icon: <LocalDiningIcon fontSize="small" />, label: "Sector Asadores" },
    { icon: <ParkIcon fontSize="small" />, label: "Espacios Verdes" },
    { icon: <AcUnitIcon fontSize="small" />, label: "Ambiente Climatizado" },
  ];

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: { xs: "column", lg: "row" },
        borderRadius: 4,
        overflow: "hidden",
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        border: "1px solid",
        borderColor: "divider",
        transition: "transform 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
        },
      }}
    >
      <Box
        sx={{
          width: { xs: "100%", lg: "45%" },
          height: { xs: 400, lg: "auto" },
        }}
      >
        <ServiceGallery photos={photosSanLorenzo} />
      </Box>

      <CardContent
        sx={{
          flex: 1,
          p: { xs: 3, md: 5 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            color: "primary.main",
            mb: 1,
            position: "relative",
            letterSpacing: -0.5,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <EventSeatIcon fontSize="large" color="primary" />
          Salón San Lorenzo
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 3,
            color: "text.secondary",
          }}
        >
          <LocationOnIcon fontSize="small" color="secondary" />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            San Lorenzo, Salta
          </Typography>
        </Box>

        <Typography
          variant="body1"
          sx={{
            color: "text.primary",
            lineHeight: 1.8,
            mb: 4,
            fontSize: "1.05rem",
          }}
        >
          Ubicado en el hermoso entorno de San Lorenzo, nuestro salón está
          diseñado para brindarle a los afiliados de AEFIP el espacio perfecto
          para sus eventos y celebraciones. Disfrute de instalaciones modernas y
          cómodas en un ambiente natural.
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid size={12}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, color: "primary.main", mb: 2 }}
            >
              Comodidades y Servicios
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
              {amenities.map((amenity, index) => (
                <Chip
                  key={index}
                  icon={amenity.icon}
                  label={amenity.label}
                  size="medium"
                  sx={{
                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                    color:
                      theme.palette.mode === "dark"
                        ? "secondary.light"
                        : "secondary.dark",
                    fontWeight: 600,
                    px: 1,
                    py: 2,
                    "& .MuiChip-icon": {
                      color:
                        theme.palette.mode === "dark"
                          ? "secondary.light"
                          : "secondary.main",
                    },
                  }}
                />
              ))}
            </Box>
          </Grid>
        </Grid>

        <Box
          sx={{
            mt: "auto",
            p: 4,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            borderRadius: 4,
            display: "flex",
            flexDirection: "column",
            gap: 3,
            border: "1px solid",
            borderColor: alpha(theme.palette.primary.main, 0.1),
          }}
        >
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, color: "primary.main", mb: 0.5 }}
            >
              Reservas y Consultas
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "text.secondary", fontWeight: 600 }}
            >
              Contactate con nosotros para consultar disponibilidad.
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="success"
            startIcon={<WhatsAppIcon />}
            href="https://wa.me/5493816844462"
            target="_blank"
            sx={{
              fontWeight: 800,
              borderRadius: 3,
              py: 2,
              fontSize: "1.1rem",
              textTransform: "none",
              bgcolor: "#25D366",
              boxShadow: "0 4px 12px rgba(37, 211, 102, 0.3)",
              "&:hover": {
                bgcolor: "#128C7E",
                transform: "translateY(-2px)",
                boxShadow: "0 6px 16px rgba(37, 211, 102, 0.4)",
              },
              transition: "all 0.3s ease",
              width: "100%",
            }}
          >
            Contactar por WhatsApp
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default SanLorenzo;
