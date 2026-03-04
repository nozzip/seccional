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
import SportsTennisIcon from "@mui/icons-material/SportsTennis";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import PoolIcon from "@mui/icons-material/Pool";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ServiceGallery from "./ServiceGallery";
import { photosAzucena } from "../mockData";
import { supabase } from "../../supabaseClient";
import SwimmingPricesModal from "./SwimmingPricesModal";
import CourtPricesModal from "./CourtPricesModal";

function Azucena() {
  const theme = useTheme();

  // States for Swimming
  const [allSwimmingPrices, setAllSwimmingPrices] = useState<any>(null);
  const [loadingSwimming, setLoadingSwimming] = useState(true);
  const [swimmingModalOpen, setSwimmingModalOpen] = useState(false);

  // States for Courts
  const [allCourtPrices, setAllCourtPrices] = useState<any>(null);
  const [loadingCourts, setLoadingCourts] = useState(true);
  const [courtModalOpen, setCourtModalOpen] = useState(false);

  useEffect(() => {
    async function fetchPrices() {
      try {
        const { data, error } = await supabase
          .from("system_configs")
          .select("key, value")
          .in("key", ["swimming_prices", "court_prices"]);

        if (error) throw error;

        const swimData = data?.find((c) => c.key === "swimming_prices");
        if (swimData) setAllSwimmingPrices(swimData.value);

        const courtData = data?.find((c) => c.key === "court_prices");
        if (courtData) setAllCourtPrices(courtData.value);
      } catch (err) {
        console.error("Error fetching prices:", err);
      } finally {
        setLoadingSwimming(false);
        setLoadingCourts(false);
      }
    }
    fetchPrices();
  }, []);

  const amenities = [
    {
      icon: <PoolIcon fontSize="small" />,
      label: loadingSwimming ? <Skeleton width={80} /> : "Pileta Climatizada",
      clickable: true,
      onClick: () => setSwimmingModalOpen(true),
    },
    {
      icon: <SportsTennisIcon fontSize="small" />,
      label: loadingCourts ? <Skeleton width={80} /> : "Canchas de Paddle",
      clickable: true,
      onClick: () => setCourtModalOpen(true),
    },
    {
      icon: <SportsTennisIcon fontSize="small" />,
      label: loadingCourts ? <Skeleton width={80} /> : "Canchas de Squash",
      clickable: true,
      onClick: () => setCourtModalOpen(true),
    },
    {
      icon: <SportsSoccerIcon fontSize="small" />,
      label: loadingCourts ? <Skeleton width={80} /> : "Fútbol 5",
      clickable: true,
      onClick: () => setCourtModalOpen(true),
    },
    {
      icon: <DirectionsRunIcon fontSize="small" />,
      label: "Natación y Recreación",
      clickable: false,
    },
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
            nuestros afiliados instalaciones de primer nivel para el deporte y
            el esparcimiento. Es el lugar ideal para disfrutar en familia de
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
                    onClick={amenity.onClick}
                    size="medium"
                    sx={{
                      cursor: amenity.clickable ? "pointer" : "default",
                      bgcolor: alpha(
                        amenity.clickable
                          ? theme.palette.primary.main
                          : theme.palette.secondary.main,
                        0.1,
                      ),
                      color: amenity.clickable
                        ? "primary.main"
                        : theme.palette.mode === "dark"
                          ? "secondary.light"
                          : "secondary.dark",
                      fontWeight: 600,
                      px: 1,
                      py: 2,
                      border: "1px solid",
                      borderColor: alpha(
                        amenity.clickable
                          ? theme.palette.primary.main
                          : theme.palette.secondary.main,
                        0.2,
                      ),
                      "& .MuiChip-icon": {
                        color: amenity.clickable
                          ? "primary.main"
                          : theme.palette.mode === "dark"
                            ? "secondary.light"
                            : "secondary.main",
                      },
                      "&:hover": amenity.clickable
                        ? {
                            bgcolor: alpha(theme.palette.primary.main, 0.2),
                          }
                        : {},
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
              href="https://wa.me/5493813545911"
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

      <SwimmingPricesModal
        open={swimmingModalOpen}
        onClose={() => setSwimmingModalOpen(false)}
        prices={allSwimmingPrices}
      />

      <CourtPricesModal
        open={courtModalOpen}
        onClose={() => setCourtModalOpen(false)}
        prices={allCourtPrices}
      />
    </>
  );
}

export default Azucena;
