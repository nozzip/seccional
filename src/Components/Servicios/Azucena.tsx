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
import SportsTennisIcon from "@mui/icons-material/SportsTennis";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import PoolIcon from "@mui/icons-material/Pool";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ServiceGallery from "./ServiceGallery";
import { photosAzucena } from "../mockData";

function Azucena() {
  const theme = useTheme();

  const amenities = [
    { icon: <PoolIcon fontSize="small" />, label: "Pileta climatizada" },
    { icon: <SportsTennisIcon fontSize="small" />, label: "Canchas de Paddle" },
    { icon: <SportsSoccerIcon fontSize="small" />, label: "Fútbol 5" },
    {
      icon: <DirectionsRunIcon fontSize="small" />,
      label: "Natación y Recreación",
    },
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
      <Box sx={{ width: { xs: "100%", lg: "45%" }, minHeight: 350 }}>
        <ServiceGallery photos={photosAzucena} />
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
          <DirectionsRunIcon fontSize="large" color="primary" />
          Club Azucena
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
            Sarmiento 480, Yerba Buena - Tucumán
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
          Ubicado en el corazón de Yerba Buena, el Club Azucena ofrece a
          nuestros afiliados instalaciones de primer nivel para el deporte y el
          esparcimiento. Es el lugar ideal para disfrutar en familia de
          actividades deportivas, recreativas y mantenerse activo.
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid size={12}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, color: "primary.main", mb: 2 }}
            >
              Instalaciones y Actividades
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
            p: 3,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            borderRadius: 3,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            border: "1px solid",
            borderColor: alpha(theme.palette.primary.main, 0.1),
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, color: "primary.main", mb: 0.5 }}
            >
              Informes y Consultas
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", fontWeight: 600 }}
            >
              Comunicate directamente con la administración del Club.
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="success"
            startIcon={<WhatsAppIcon />}
            href="https://wa.me/5493812248788"
            target="_blank"
            sx={{
              fontWeight: 700,
              borderRadius: 2,
              boxShadow: "0 4px 14px rgba(46, 125, 50, 0.3)",
              "&:hover": {
                bgcolor: "#2e7d32",
                transform: "translateY(-2px)",
              },
              transition: "all 0.2s ease",
              px: 3,
              py: 1.5,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            381 224-8788
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default Azucena;
