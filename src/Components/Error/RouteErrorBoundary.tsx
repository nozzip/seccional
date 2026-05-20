import React, { useState } from "react";
import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import { Box, Typography, Button, Paper, Collapse, alpha, useTheme, Container } from "@mui/material";
import { motion } from "framer-motion";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import HomeIcon from "@mui/icons-material/Home";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

export default function RouteErrorBoundary() {
  const error = useRouteError();
  const theme = useTheme();
  const [showDetails, setShowDetails] = useState(false);

  // Obtener mensaje de error amigable
  let errorMessage = "Ocurrió un error inesperado en la aplicación.";
  let technicalDetails = "";

  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || `Error ${error.status}`;
    technicalDetails = error.data ? (typeof error.data === "string" ? error.data : JSON.stringify(error.data, null, 2)) : "";
  } else if (error instanceof Error) {
    errorMessage = error.message;
    technicalDetails = error.stack || "";
  } else if (error && typeof error === "object") {
    technicalDetails = JSON.stringify(error, null, 2);
  }

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.hash = "#/";
    window.location.reload();
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
        py: 4,
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Paper
            elevation={4}
            sx={{
              p: { xs: 3, sm: 5 },
              borderRadius: 3,
              textAlign: "center",
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Gradiente de fondo sutil */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "6px",
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              }}
            />

            {/* Icono animado */}
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, repeatDelay: 3 }}
              style={{ display: "inline-block", marginBottom: "24px" }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "error.main",
                  mx: "auto",
                }}
              >
                <ErrorOutlineIcon sx={{ fontSize: 45 }} />
              </Box>
            </motion.div>

            {/* Títulos */}
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: "-0.5px" }}>
              ¡Ups! Algo salió mal
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: "90%", mx: "auto" }}>
              La aplicación experimentó un inconveniente temporal. Hemos registrado el error y estamos trabajando para solucionarlo.
            </Typography>

            {/* Cuadro de error amigable */}
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 4,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.error.main, 0.02),
                borderColor: alpha(theme.palette.error.main, 0.15),
                textAlign: "left",
              }}
            >
              <Typography variant="caption" color="error.main" sx={{ fontWeight: 700, display: "block", mb: 0.5, letterSpacing: "1px", textTransform: "uppercase" }}>
                Mensaje de error
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {errorMessage}
              </Typography>
            </Paper>

            {/* Botones de acción */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
                justifyContent: "center",
                mb: technicalDetails ? 4 : 0,
              }}
            >
              <Button
                variant="contained"
                onClick={handleReload}
                startIcon={<RefreshIcon />}
                sx={{
                  bgcolor: "primary.main",
                  color: "secondary.contrastText",
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                }}
              >
                Reintentar Carga
              </Button>
              <Button
                variant="outlined"
                onClick={handleGoHome}
                startIcon={<HomeIcon />}
                sx={{
                  borderColor: "divider",
                  color: "text.primary",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    borderColor: "primary.main",
                  },
                }}
              >
                Ir al Inicio
              </Button>
            </Box>

            {/* Detalles Técnicos Colapsables */}
            {technicalDetails && (
              <Box sx={{ textAlign: "left" }}>
                <Button
                  variant="text"
                  color="inherit"
                  size="small"
                  onClick={() => setShowDetails(!showDetails)}
                  endIcon={showDetails ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                  sx={{
                    color: "text.secondary",
                    textTransform: "none",
                    fontWeight: 600,
                    px: 0,
                    "&:hover": { bgcolor: "transparent", color: "text.primary" },
                  }}
                >
                  {showDetails ? "Ocultar detalles técnicos" : "Ver detalles técnicos"}
                </Button>
                <Collapse in={showDetails}>
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: theme.palette.mode === "dark" ? "#0f172a" : "#f1f5f9",
                      border: "1px solid",
                      borderColor: "divider",
                      maxHeight: "150px",
                      overflowY: "auto",
                    }}
                  >
                    <Typography
                      component="pre"
                      variant="caption"
                      sx={{
                        fontFamily: "monospace",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-all",
                        color: "text.secondary",
                      }}
                    >
                      {technicalDetails}
                    </Typography>
                  </Box>
                </Collapse>
              </Box>
            )}
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}
