import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  Box,
  Typography,
  Container,
  Button,
  useTheme,
  alpha,
  Grid,
  Paper,
  keyframes,
} from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import BirthdayCarousel from "../Components/ContentsFront/BirthdayCarousel";
import CardNoticias from "../Components/ContentsFront/CardNoticias";
import CardServicios from "../Components/ContentsFront/CardServicios";
import Birthdays from "../Components/ContentsFront/Birthdays";
import { getGlassStyles } from "../theme";
import GroupsIcon from "@mui/icons-material/Groups";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import VerifiedIcon from "@mui/icons-material/Verified";

const MotionBox = motion.create(Box);
const MotionTypography = motion.create(Typography);

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
`;

const waveAnimation = keyframes`
  0% { transform: translateX(0) translateY(0); }
  25% { transform: translateX(-5px) translateY(5px); }
  50% { transform: translateX(0) translateY(10px); }
  75% { transform: translateX(5px) translateY(5px); }
  100% { transform: translateX(0) translateY(0); }
`;

const countUp = (end: number, duration: number = 2000): number => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };
    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  return count;
};

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const count = countUp(value);
  return <>{count.toLocaleString()}{suffix}</>;
}

function StatCard({ icon: Icon, value, suffix, label, delay }: { icon: any; value: number; suffix?: string; label: string; delay: number }) {
  const theme = useTheme();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <MotionBox
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          textAlign: "center",
          borderRadius: 4,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-8px)",
            boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
            "& .stat-icon": {
              transform: "scale(1.1) rotate(10deg)",
              color: theme.palette.primary.main,
            },
          },
        }}
      >
        <Box
          className="stat-icon"
          sx={{
            mb: 2,
            p: 2,
            borderRadius: "50%",
            display: "inline-flex",
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            transition: "all 0.3s ease",
          }}
        >
          <Icon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
        </Box>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 900,
            color: "primary.main",
            mb: 1,
            fontSize: { xs: "2rem", md: "3rem" },
          }}
        >
          <AnimatedCounter value={value} suffix={suffix} />
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 600,
            color: "text.secondary",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {label}
        </Typography>
      </Paper>
    </MotionBox>
  );
}

function WaveSeparator() {
  const theme = useTheme();
  return (
    <Box
      sx={{
        position: "relative",
        height: "100px",
        overflow: "hidden",
        mt: -1,
        zIndex: 3,
      }}
    >
      <svg
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={theme.palette.primary.main} />
            <stop offset="50%" stopColor={theme.palette.primary.light} />
            <stop offset="100%" stopColor={theme.palette.primary.main} />
          </linearGradient>
        </defs>
        <path
          fill="url(#waveGradient)"
          d="M0,40 C360,100 720,0 1080,60 C1260,90 1380,70 1440,50 L1440,100 L0,100 Z"
          style={{
            animation: `${waveAnimation} 8s ease-in-out infinite`,
          }}
        />
      </svg>
    </Box>
  );
}

function Particle({ delay }: { delay: number }) {
  const theme = useTheme();
  const randomX = Math.random() * 100;
  const randomSize = Math.random() * 10 + 5;
  const randomDuration = Math.random() * 10 + 10;

  return (
    <Box
      sx={{
        position: "absolute",
        left: `${randomX}%`,
        width: randomSize,
        height: randomSize,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${alpha(theme.palette.common.white, 0.3)} 0%, ${alpha(theme.palette.common.white, 0.1)} 100%)`,
        backdropFilter: "blur(4px)",
        animation: `${float} ${randomDuration}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        pointerEvents: "none",
      }}
    />
  );
}

function Inicio() {
  const theme = useTheme();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true });

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
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 50%, ${theme.palette.primary.dark} 100%)`,
          position: "relative",
          color: "white",
          textAlign: "center",
          px: 4,
          overflow: "hidden",
        }}
      >
        {/* Particles */}
        {[...Array(15)].map((_, i) => (
          <Particle key={i} delay={i * 0.5} />
        ))}

        {/* Glow effects */}
        <Box
          sx={{
            position: "absolute",
            top: "20%",
            left: "10%",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${alpha(theme.palette.common.white, 0.15)} 0%, transparent 70%)`,
            filter: "blur(60px)",
            animation: `${pulse} 4s ease-in-out infinite`,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "20%",
            right: "10%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${alpha(theme.palette.common.white, 0.1)} 0%, transparent 70%)`,
            filter: "blur(80px)",
            animation: `${pulse} 6s ease-in-out infinite`,
            animationDelay: "2s",
          }}
        />

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
            position: "relative",
            zIndex: 1,
            textShadow: `0 4px 30px ${alpha(theme.palette.common.black, 0.3)}`,
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
            opacity: 0.9,
            color: "white",
            letterSpacing: 8,
            textTransform: "uppercase",
            position: "relative",
            zIndex: 1,
          }}
        >
          A.E.F.I.P.
        </MotionTypography>
        <MotionBox
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Button
            component={Link}
            to="/gremio"
            variant="contained"
            size="large"
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
              color: "white",
              px: { xs: 4, md: 8 },
              py: 2.5,
              fontSize: "1.2rem",
              fontWeight: 900,
              borderRadius: "50px",
              boxShadow: `0 10px 30px ${alpha(theme.palette.secondary.main, 0.4)}`,
              position: "relative",
              zIndex: 1,
              overflow: "hidden",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: `0 20px 40px ${alpha(theme.palette.secondary.main, 0.5)}`,
                background: `linear-gradient(135deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.secondary.main} 100%)`,
              },
            }}
          >
            Conocenos
          </Button>
        </MotionBox>
      </Box>

      {/* Wave Separator */}
      <WaveSeparator />

      {/* Stats Section */}
      <Box
        ref={statsRef}
        sx={{
          bgcolor: "primary.main",
          py: 8,
          position: "relative",
          zIndex: 4,
        }}
      >
        <Container maxWidth="lg">
          <Grid2 container spacing={4}>
            <Grid2 size={{ xs: 6, md: 3 }}>
              <StatCard
                icon={GroupsIcon}
                value={1250}
                label="Afiliados"
                delay={0}
              />
            </Grid2>
            <Grid2 size={{ xs: 6, md: 3 }}>
              <StatCard
                icon={AutoAwesomeIcon}
                value={25}
                suffix="+"
                label="Años de Trayectoria"
                delay={0.2}
              />
            </Grid2>
            <Grid2 size={{ xs: 6, md: 3 }}>
              <StatCard
                icon={LocationOnIcon}
                value={5}
                label="Provincias"
                delay={0.4}
              />
            </Grid2>
            <Grid2 size={{ xs: 6, md: 3 }}>
              <StatCard
                icon={VerifiedIcon}
                value={100}
                suffix="%"
                label="Compromiso"
                delay={0.6}
              />
            </Grid2>
          </Grid2>
        </Container>
      </Box>

      {/* Main Content */}
      <Container
        maxWidth="xl"
        sx={{
          position: "relative",
          zIndex: 2,
          pb: 15,
          px: { xs: 2, md: 5 },
        }}
      >
        <Grid2 container spacing={8}>
          {/* Afiliados Section */}
          <Grid2 size={{ xs: 12 }}>
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
                  boxShadow: `0 20px 60px ${alpha(theme.palette.primary.main, 0.1)}`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
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
                <Grid2 container spacing={6}>
                  <Grid2 size={{ xs: 12, lg: 8 }}>
                    <BirthdayCarousel />
                  </Grid2>
                  <Grid2 size={{ xs: 12, lg: 4 }}>
                    <Birthdays />
                  </Grid2>
                </Grid2>
              </Box>
            </MotionBox>
          </Grid2>

          {/* Noticias Section */}
          <Grid2 size={{ xs: 12 }}>
            <MotionBox
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
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
            </MotionBox>
          </Grid2>

          {/* Servicios Section */}
          <Grid2 size={{ xs: 12 }}>
            <MotionBox
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
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
          </Grid2>
        </Grid2>
      </Container>
    </Box>
  );
}

export default Inicio;
