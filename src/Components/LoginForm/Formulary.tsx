import React, { useState } from "react";
import {
  Box,
  Container,
  Paper,
  useTheme,
  alpha,
  Typography,
} from "@mui/material";
import FormSignup from "./FormSignup";
import FormLogin from "./FormLogin";
import FormSuccess from "./FormSuccess";
import { getGlassStyles } from "../../theme";

const Formulary = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const theme = useTheme();

  function submitForm() {
    setIsSubmitted(true);
  }

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        background:
          theme.palette.mode === "light"
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.2)} 0%, ${alpha(theme.palette.background.default, 1)} 100%)`
            : `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.1)} 0%, ${alpha(theme.palette.background.default, 1)} 100%)`,
        py: { xs: 4, md: 8 },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url("/auth_bg.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: theme.palette.mode === "light" ? 0.4 : 0.2,
          zIndex: 0,
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
        <Paper
          elevation={0}
          sx={{
            ...getGlassStyles(theme),
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            borderRadius: 6,
            overflow: "hidden",
            minHeight: 650,
            border: "1px solid",
            borderColor: alpha(theme.palette.divider, 0.1),
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          }}
        >
          {/* Left Side: Branding/Image */}
          <Box
            sx={{
              flex: 1,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              display: { xs: "none", md: "flex" },
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              p: 6,
              color: "white",
            }}
          >
            <Box style={{ textAlign: "center", zIndex: 2 }}>
              <Box
                component="img"
                src="/seccionalLogo.png"
                alt="logo"
                sx={{ width: "70%", mb: 4, filter: "brightness(0) invert(1)" }}
              />
              <Typography
                variant="h3"
                sx={{ fontWeight: 800, mb: 2, letterSpacing: "-1px" }}
              >
                A.E.F.I.P
              </Typography>
              <Typography
                variant="h5"
                sx={{ fontWeight: 500, opacity: 0.9, mb: 4 }}
              >
                Seccional Noroeste
              </Typography>
              <Box
                sx={{
                  width: 60,
                  height: 4,
                  bgcolor: "white",
                  borderRadius: 2,
                  mx: "auto",
                  mb: 4,
                }}
              />
              <Typography
                variant="body1"
                sx={{
                  maxWidth: 350,
                  mx: "auto",
                  lineHeight: 1.8,
                  opacity: 0.8,
                }}
              >
                Bienvenido al portal oficial de afiliados. Accede a trámites,
                beneficios y noticias gremiales en un solo lugar.
              </Typography>
            </Box>

            {/* Abstract Shape */}
            <Box
              sx={{
                position: "absolute",
                bottom: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: "50%",
                bgcolor: alpha("#fff", 0.1),
                zIndex: 1,
              }}
            />
          </Box>

          {/* Right Side: Form */}
          <Box
            sx={{
              flex: 1.2,
              p: { xs: 4, md: 8 },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha(theme.palette.background.paper, 0.4),
            }}
          >
            {isSubmitted ? (
              <FormSuccess key="success" />
            ) : isLogin ? (
              <FormLogin
                key="login"
                submitForm={submitForm}
                toggleForm={toggleAuthMode}
              />
            ) : (
              <FormSignup
                key="signup"
                submitForm={submitForm}
                toggleForm={toggleAuthMode}
              />
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Formulary;
