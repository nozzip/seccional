import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  Box,
  Typography,
  Container,
  Button,
  useTheme,
  alpha,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import BirthdayCarousel from "../Components/ContentsFront/BirthdayCarousel";
import CardNoticias from "../Components/ContentsFront/CardNoticias";
import CardServicios from "../Components/ContentsFront/CardServicios";
import Birthdays from "../Components/ContentsFront/Birthdays";
import { getGlassStyles } from "../theme";

const MotionBox = motion.create(Box);
const MotionTypography = motion.create(Typography);

function Inicio() {
  const theme = useTheme();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Box sx={{ overflowX: "hidden" }}>
      <Helmet>
        <title>A.E.F.I.P Seccional Noroeste - Inicio</title>
        <meta
          name="description"
          content="Bienvenido a la Seccional Noroeste de AEFIP. Asociación de Empleados de Fiscalización e Ingresos Públicos."
        />
        <meta property="og:title" content="A.E.F.I.P Seccional Noroeste" />
        <meta
          property="og:description"
          content="Gremio de empleados de AFIP - Seccional Noroeste."
        />
      </Helmet>

      {/* Hero Section */}
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          position: "relative",
          color: "white",
          textAlign: "center",
          px: 4,
        }}
      >
        <MotionTypography
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          variant="h1"
          sx={{
            fontSize: { xs: "2.5rem", md: "5.5rem" },
            fontWeight: 900,
            mb: 1,
            letterSpacing: -2,
            lineHeight: 1,
            color: "white",
          }}
        >
          SECCIONAL NOROESTE
        </MotionTypography>
        <MotionTypography
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          variant="h2"
          sx={{
            fontSize: { xs: "1.2rem", md: "2.5rem" },
            fontWeight: 300,
            mb: 6,
            opacity: 0.8,
            color: "white",
            letterSpacing: 8,
            textTransform: "uppercase",
          }}
        >
          A.E.F.I.P.
        </MotionTypography>
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <Button
            component={Link}
            to="/gremio"
            variant="contained"
            size="large"
            sx={{
              bgcolor: "white",
              "&:hover": { bgcolor: alpha("#fff", 0.9) },
              color: "primary.main",
              px: { xs: 4, md: 8 },
              py: 2.5,
              fontSize: "1.2rem",
              fontWeight: 900,
              borderRadius: "50px",
              boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
            }}
          >
            Conocenos
          </Button>
        </MotionBox>
      </Box>

      {/* Main Content */}
      <Container
        maxWidth="xl"
        sx={{
          mt: -12,
          position: "relative",
          zIndex: 2,
          pb: 15,
          px: { xs: 2, md: 5 },
        }}
      >
        <Grid container spacing={8}>
          {/* Afiliados Section */}
          <Grid size={{ xs: 12 }}>
            <MotionBox
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Box
                sx={{
                  ...getGlassStyles(theme),
                  p: { xs: 3, md: 8 },
                  borderRadius: 8,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    mb: 6,
                    color: "primary.main",
                    fontWeight: 900,
                    letterSpacing: -1,
                  }}
                >
                  AFILIADOS
                </Typography>
                <Grid container spacing={6}>
                  <Grid size={{ xs: 12, lg: 8 }}>
                    <BirthdayCarousel />
                  </Grid>
                  <Grid size={{ xs: 12, lg: 4 }}>
                    <Birthdays />
                  </Grid>
                </Grid>
              </Box>
            </MotionBox>
          </Grid>

          {/* Noticias Section */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{ mb: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 6,
                }}
              >
                <Typography
                  variant="h2"
                  sx={{
                    color: "primary.main",
                    fontWeight: 900,
                    letterSpacing: -1,
                  }}
                >
                  NOTICIAS
                </Typography>
                <Button
                  component={Link}
                  to="/prensa"
                  variant="outlined"
                  sx={{
                    borderRadius: "50px",
                    px: 4,
                    fontWeight: 700,
                    borderWidth: 2,
                    "&:hover": { borderWidth: 2 },
                  }}
                >
                  Ver todas
                </Button>
              </Box>
              <CardNoticias />
            </Box>
          </Grid>

          {/* Servicios Section */}
          <Grid size={{ xs: 12 }}>
            <MotionBox
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 6,
                }}
              >
                <Typography
                  variant="h2"
                  sx={{
                    color: "primary.main",
                    fontWeight: 900,
                    letterSpacing: -1,
                  }}
                >
                  TURISMO Y SERVICIOS
                </Typography>
                <Button
                  component={Link}
                  to="/servicios"
                  variant="outlined"
                  sx={{
                    borderRadius: "50px",
                    px: 4,
                    fontWeight: 700,
                    borderWidth: 2,
                    "&:hover": { borderWidth: 2 },
                  }}
                >
                  Ver todos
                </Button>
              </Box>
              <CardServicios />
            </MotionBox>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default Inicio;
