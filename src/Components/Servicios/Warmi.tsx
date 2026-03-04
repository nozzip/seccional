import React, { useEffect, useState } from "react";
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
  Skeleton,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import HomeIcon from "@mui/icons-material/Home";
import KitchenIcon from "@mui/icons-material/Kitchen";
import BedIcon from "@mui/icons-material/Bed";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import WifiIcon from "@mui/icons-material/Wifi";
import TvIcon from "@mui/icons-material/Tv";
import FreeBreakfastIcon from "@mui/icons-material/FreeBreakfast";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PeopleIcon from "@mui/icons-material/People";
import ServiceGallery from "./ServiceGallery";
import { photosWarmi } from "../mockData";
import { supabase } from "../../supabaseClient";
import WarmiPricesModal from "./WarmiPricesModal";

function Warmi() {
  const theme = useTheme();
  const [cabinPrices, setCabinPrices] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function fetchPrices() {
      try {
        const { data, error } = await supabase
          .from("system_configs")
          .select("value")
          .eq("key", "cabin_prices")
          .single();

        if (error) throw error;
        if (data?.value) {
          setCabinPrices(data.value);
        }
      } catch (err) {
        console.error("Error fetching cabin prices:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPrices();
  }, []);

  const amenities = [
    { icon: <KitchenIcon fontSize="small" />, label: "Cocina Equipada" },
    { icon: <BedIcon fontSize="small" />, label: "Sommier Alta Gama" },
    { icon: <AcUnitIcon fontSize="small" />, label: "Calefacción" },
    { icon: <WifiIcon fontSize="small" />, label: "Wi-Fi" },
    { icon: <TvIcon fontSize="small" />, label: "TV" },
    { icon: <FreeBreakfastIcon fontSize="small" />, label: "Desayuno" },
    {
      icon: <CleaningServicesIcon fontSize="small" />,
      label: "Ropa Blanca & Mucama",
    },
  ];

  const getCabinLabel = (key: string, baseLabel: string) => {
    if (loading) return <Skeleton width={120} />;
    if (!cabinPrices || !cabinPrices[key]) return baseLabel;
    return `${baseLabel} - $${cabinPrices[key].general.toLocaleString()}`;
  };

  const cabinOptions = [
    { key: "confort4", label: "Cabaña 4 Personas" },
    { key: "confort5", label: "Cabaña 5 Personas" },
    { key: "confort7", label: "Cabaña 7 Personas" },
  ];

  return (
    <>
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
            height: { xs: 350, lg: "auto" },
          }}
        >
          <ServiceGallery photos={photosWarmi} />
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
            <HomeIcon fontSize="large" color="primary" />
            Cabañas Warmi
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
              El Mollar, Valle Calchaquí, Tucumán (Calle 5 s/n)
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
            Las Cabañas Warmi ofrecen un refugio único en la tranquilidad de El
            Mollar. Totalmente equipadas y con una vista privilegiada al Cerro
            Ñuñorco y al Dique La Angostura, son el destino perfecto para una
            escapada de descanso en la naturaleza de los valles tucumanos.
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, color: "primary.main", mb: 2 }}
              >
                Opciones de Alojamiento
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {cabinOptions.map((option) => (
                  <Chip
                    key={option.key}
                    icon={<PeopleIcon fontSize="small" />}
                    label={getCabinLabel(option.key, option.label)}
                    onClick={() => setModalOpen(true)}
                    sx={{
                      fontWeight: 700,
                      borderRadius: 2,
                      py: 2.5,
                      px: 1,
                      justifyContent: "flex-start",
                      cursor: "pointer",
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      border: "1px solid",
                      borderColor: alpha(theme.palette.primary.main, 0.2),
                      color: "primary.main",
                      "& .MuiChip-icon": { color: "primary.main" },
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.2),
                        transform: "translateX(4px)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  />
                ))}
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 600, ml: 1 }}
                >
                  * Precios por día. Toca una cabaña para ver tarifas de
                  afiliados.
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, color: "primary.main", mb: 2 }}
              >
                Servicios y Amenities
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                {amenities.map((amenity, index) => (
                  <Chip
                    key={index}
                    icon={amenity.icon}
                    label={amenity.label}
                    size="small"
                    sx={{
                      bgcolor: alpha(theme.palette.secondary.main, 0.1),
                      color:
                        theme.palette.mode === "dark"
                          ? "secondary.light"
                          : "secondary.dark",
                      fontWeight: 600,
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
                Reservas y Consultas
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", fontWeight: 600 }}
              >
                AEFIP Seccional Noroeste • Lunes a Viernes de 09:00 a 17:00 hs.
              </Typography>
            </Box>

            <Button
              variant="contained"
              color="success"
              startIcon={<WhatsAppIcon />}
              href="https://wa.me/5493816844462"
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
              Contactar
            </Button>
          </Box>
        </CardContent>
      </Card>

      <WarmiPricesModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        prices={cabinPrices}
      />
    </>
  );
}

export default Warmi;
