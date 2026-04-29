import React, { useEffect, useState } from "react";
import { Box, Container, Typography, Fab, useTheme, alpha } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PrensaCard from "../Components/PrensaContents/PrensaCard";
import AddNewsDialog from "../Components/PrensaContents/AddNewsDialog";
import { Helmet } from "react-helmet-async";

function Prensa() {
  const theme = useTheme();
  const [isAdmin, setIsAdmin] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Verificar si el usuario es admin
    const userStr = localStorage.getItem("current_affiliate");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        // El admin oficial es DNI 34185803, pero también permitimos cualquier usuario con rol 'admin'
        setIsAdmin(user.role === "admin" || user.dni === "34185803");
      } catch (e) {
        console.error("Error parsing user from localStorage", e);
      }
    }
  }, []);

  const handleNewsAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Box sx={{ pt: { xs: 12, md: 16 }, pb: 10, bgcolor: "background.default" }}>
      <Helmet>
        <title>Prensa y Novedades - A.E.F.I.P Seccional Noroeste</title>
        <meta
          name="description"
          content="Mantente informado con las últimas noticias y avisos oficiales de nuestra seccional."
        />
      </Helmet>
      <Container maxWidth="lg">
        <Box
          sx={{
            mb: 6,
            borderBottom: "4px solid",
            borderColor: "secondary.main",
            pb: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "center", md: "flex-end" },
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          <Box>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                color: "primary.main",
                textAlign: { xs: "center", md: "left" },
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              Prensa
            </Typography>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{
                mt: 1,
                fontWeight: 500,
                textAlign: { xs: "center", md: "left" },
              }}
            >
              Noticias y actualizaciones en tiempo real de la Mesa Directiva
              Nacional
            </Typography>
          </Box>
        </Box>
        
        <PrensaCard 
          key={refreshKey} 
          isAdmin={isAdmin} 
          onRefresh={handleNewsAdded} 
        />

        {isAdmin && (
          <Fab
            color="primary"
            aria-label="add news"
            onClick={() => setOpenAddDialog(true)}
            sx={{
              position: "fixed",
              bottom: { xs: 80, md: 32 },
              right: 32,
              boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
              zIndex: 1000,
            }}
          >
            <AddIcon />
          </Fab>
        )}

        <AddNewsDialog 
          open={openAddDialog} 
          onClose={() => setOpenAddDialog(false)} 
          onNewsAdded={handleNewsAdded}
        />
      </Container>
    </Box>
  );
}

export default Prensa;
