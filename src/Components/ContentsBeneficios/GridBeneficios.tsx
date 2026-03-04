import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  alpha,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import CloseIcon from "@mui/icons-material/Close";
import { dataBeneficios, Beneficio } from "../mockData";

export default function GridBeneficios() {
  const [beneficios, setBeneficios] = useState(dataBeneficios);
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const categories = [
    "Todos",
    "Tucumán",
    "Catamarca",
    "Salta",
    "Santiago del Estero",
    "Jujuy",
    "General",
  ];

  const filter = (provinciaId: string) => {
    setSelectedCategory(provinciaId);
    if (provinciaId === "Todos") {
      setBeneficios(dataBeneficios);
    } else {
      setBeneficios(
        dataBeneficios.filter((item) => item.category === provinciaId),
      );
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1.5,
          justifyContent: "center",
          mb: 8,
        }}
      >
        {categories.map((cat) => (
          <Chip
            key={cat}
            label={cat}
            onClick={() => filter(cat)}
            color={selectedCategory === cat ? "primary" : "default"}
            variant={selectedCategory === cat ? "filled" : "outlined"}
            sx={{
              fontWeight: 800,
              px: { xs: 2, md: 3 },
              py: 3,
              fontSize: "1rem",
              borderRadius: "50px",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              borderWidth: 2,
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                borderWidth: 2,
              },
            }}
          />
        ))}
      </Box>

      <Grid container spacing={4}>
        {beneficios.map((item, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, lg: 4 }}>
            <BenefitItem item={item} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

function BenefitItem({ item }: { item: Beneficio }) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Paper
        onClick={handleOpen}
        elevation={0}
        sx={{
          height: 380,
          position: "relative",
          borderRadius: 6,
          overflow: "hidden",
          cursor: "pointer",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          border: "1px solid",
          borderColor: alpha(theme.palette.divider, 0.5),
          transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          "&:hover": {
            transform: "translateY(-12px)",
            boxShadow: `0 30px 60px ${alpha(theme.palette.primary.main, 0.1)}`,
            borderColor: alpha(theme.palette.primary.main, 0.2),
            "& .benefit-overlay": {
              opacity: 1,
              transform: "translateY(0)",
            },
            "& .benefit-img": {
              transform: "scale(1.1)",
            },
          },
        }}
      >
        <Box
          className="benefit-img"
          sx={{
            width: "100%",
            height: "100%",
            backgroundImage: `url(${item.thumbnail})`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            bgcolor: "#fff",
            p: 4,
            transition: "transform 0.6s ease",
          }}
        />
        <Box
          className="benefit-overlay"
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "50%",
            background: `linear-gradient(to top, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            p: 4,
            opacity: 0,
            transform: "translateY(20px)",
            transition: "all 0.4s ease",
            color: "white",
            textAlign: "center",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 900, mb: 1.5, lineHeight: 1.2 }}>
            {item.title}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>
            Click para más info
          </Typography>
        </Box>
        <Box
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            bgcolor: "white",
            color: "primary.main",
            px: 2,
            py: 0.5,
            borderRadius: 8,
            fontWeight: 800,
            fontSize: "0.75rem",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          {item.category}
        </Box>
      </Paper>

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: { borderRadius: 8, overflow: "hidden" },
        }}
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 3,
            fontWeight: 900,
            color: "primary.main",
            fontSize: "1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {item.title}
          <IconButton onClick={handleClose} sx={{ color: "text.disabled" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Box
            sx={{
              width: "100%",
              height: 300,
              borderRadius: 5,
              mb: 4,
              backgroundImage: `url(${item.thumbnail})`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              bgcolor: alpha(theme.palette.background.default, 0.5),
              border: "1px solid",
              borderColor: "divider",
              p: 4,
            }}
          />
          <Typography
            variant="h6"
            sx={{ color: "secondary.main", fontWeight: 800, mb: 2 }}
          >
            {item.category}
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", lineHeight: 1.8, mb: 4, fontSize: "1.1rem" }}
          >
            {item.short_description}
          </Typography>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              borderRadius: 4,
              border: "1px solid",
              borderColor: alpha(theme.palette.primary.main, 0.1),
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: "primary.main", textTransform: "uppercase", letterSpacing: 1 }}>
              Información de Contacto:
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {item.mail && (
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Email: <Box component="span" sx={{ fontWeight: 400, color: "text.secondary" }}>{item.mail}</Box>
                </Typography>
              )}
              {item.telephone && (
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Teléfono: <Box component="span" sx={{ fontWeight: 400, color: "text.secondary" }}>{item.telephone}</Box>
                </Typography>
              )}
            </Box>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 4, pt: 0 }}>
          <Button
            onClick={handleClose}
            variant="contained"
            fullWidth
            sx={{
              py: 2,
              borderRadius: 4,
              fontWeight: 900,
              fontSize: "1.1rem",
              boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
