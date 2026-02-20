import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Box, Grid, Typography, Container, Button, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Carusel from '../Components/ContentsFront/Carusel';
import CardNovedades from '../Components/ContentsFront/CardNovedades';
import CardNoticias from '../Components/ContentsFront/CardNoticias';
import CardServicios from '../Components/ContentsFront/CardServicios';
import { getGlassStyles } from '../theme';

const MotionBox = motion.create(Box);
const MotionTypography = motion.create(Typography);


function Inicio() {
  const theme = useTheme();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Box sx={{ overflowX: 'hidden' }}>
      <Helmet>
        <title>A.E.F.I.P Seccional Noroeste - Inicio</title>
        <meta name="description" content="Bienvenido a la Seccional Noroeste de AEFIP. Asociación de Empleados de Fiscalización e Ingresos Públicos." />
        <meta property="og:title" content="A.E.F.I.P Seccional Noroeste" />
        <meta property="og:description" content="Gremio de empleados de AFIP - Seccional Noroeste." />
      </Helmet>
      {/* Hero Section */}
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #1a5f7a 0%, #00354e 100%)',
          position: 'relative',
          color: 'white',
          textAlign: 'center',
          px: 2,
        }}
      >
        <MotionTypography
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          variant="h1"
          sx={{
            fontSize: { xs: '2.5rem', md: '5rem' },
            fontWeight: 800,
            mb: 1,
            letterSpacing: -1,
            color: 'white'
          }}
        >
          SECCIONAL NOROESTE
        </MotionTypography>
        <MotionTypography
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
          variant="h2"
          sx={{
            fontSize: { xs: '1.5rem', md: '3rem' },
            fontWeight: 400,
            mb: 4,
            opacity: 0.9,
            color: 'white'
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
              bgcolor: 'secondary.main',
              '&:hover': { bgcolor: 'secondary.dark' },
              px: { xs: 4, md: 6 },
              py: 2,
              fontSize: '1.1rem',
            }}
          >
            Conocenos
          </Button>
        </MotionBox>
      </Box>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ mt: -10, position: 'relative', zIndex: 2, pb: 10 }}>
        <Grid container spacing={4}>
          {/* Afiliados Section */}
          <Grid item xs={12}>
            <MotionBox
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Box
                sx={{
                  ...getGlassStyles(theme),
                  p: { xs: 3, md: 6 },
                  borderRadius: 4,
                  mb: 6,
                }}
              >
                <Typography variant="h3" sx={{ mb: 4, color: 'primary.main', fontWeight: 700 }}>
                  AFILIADOS
                </Typography>
                <Grid container spacing={4} alignItems="center">
                  <Grid item xs={12} lg={7}>
                    <Carusel />
                  </Grid>
                  <Grid item xs={12} lg={5}>
                    <CardNovedades />
                  </Grid>
                </Grid>
              </Box>
            </MotionBox>
          </Grid>

          {/* Noticias Section */}
          <Grid item xs={12}>
            <Box sx={{ mb: 8 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4 }}>
                <Typography variant="h3" sx={{ color: 'primary.main', fontWeight: 700 }}>
                  NOTICIAS
                </Typography>
                <Button component={Link} to="/prensa" color="primary">
                  Ver todas
                </Button>
              </Box>
              <CardNoticias />
            </Box>
          </Grid>

          {/* Servicios Section */}
          <Grid item xs={12}>
            <MotionBox
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              sx={{ textAlign: 'center' }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 6 }}>
                <Typography variant="h3" sx={{ color: 'primary.main', fontWeight: 700 }}>
                  TURISMO Y SERVICIOS
                </Typography>
                <Button component={Link} to="/servicios" color="primary">
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

