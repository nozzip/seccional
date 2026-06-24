import React, { useEffect, useState } from "react";
import Carousel from "react-material-ui-carousel";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  alpha,
  useTheme,
  Skeleton,
} from "@mui/material";
import CakeIcon from "@mui/icons-material/Cake";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { supabase } from "../../supabaseClient";

interface Affiliate {
  nombre: string;
  apellido: string;
  fecha_nacimiento?: string;
}

export default function BirthdayCarousel() {
  const theme = useTheme();
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTodayBirthdays() {
      try {
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentDay = today.getDate();

        const { data, error } = await supabase
          .from("affiliates")
          .select("nombre, apellido, fecha_nacimiento")
          .eq("branch", "noroeste")
          .not("fecha_nacimiento", "is", null);

        if (error) throw error;
        
        // Filter in JS to be year-agnostic
        const todayBirthdays = (data || []).filter(a => {
          if (!a.fecha_nacimiento) return false;
          const [y, m, d] = a.fecha_nacimiento.split("-");
          return parseInt(m) === currentMonth && parseInt(d) === currentDay;
        });

        setAffiliates(todayBirthdays);
      } catch (error) {
        console.error("Error fetching today birthdays:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTodayBirthdays();
  }, []);

  if (loading) {
    return (
      <Skeleton
        variant="rectangular"
        height={350}
        sx={{ borderRadius: 1, width: "100%" }}
      />
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        borderRadius: 1,
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
      }}
    >
      <Carousel
        autoPlay={true}
        interval={6000}
        animation="slide"
        indicators={true}
        navButtonsAlwaysVisible={false}
        activeIndicatorIconButtonProps={{
          style: { color: theme.palette.primary.main },
        }}
        height={350}
        sx={{ minHeight: { xs: 350, md: 350 } }}
      >
        {affiliates.length > 0 ? (
          affiliates.map((item, i) => (
            <BirthdayItem key={i} name={item.nombre} lastName={item.apellido} />
          ))
        ) : (
          <Box
            sx={{
              height: 350,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha(theme.palette.background.paper, 0.5),
            }}
          >
            <Typography variant="h6" color="text.secondary">
              No hay cumpleaños hoy
            </Typography>
          </Box>
        )}
      </Carousel>
    </Box>
  );
}

function BirthdayItem({ name, lastName }: { name: string; lastName: string }) {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        height: { xs: 350, md: 350 },
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.palette.background.paper, // Opaque base
        backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
        p: 2,
      }}
    >
      {/* Decorative Ornaments */}
      <Box sx={{ position: "absolute", top: -20, left: -20, opacity: 0.1 }}>
        <CakeIcon sx={{ fontSize: 150, transform: "rotate(-20deg)" }} />
      </Box>
      <Box sx={{ position: "absolute", bottom: -20, right: -20, opacity: 0.1 }}>
        <FavoriteIcon sx={{ fontSize: 150, transform: "rotate(20deg)" }} />
      </Box>

      <Avatar
        sx={{
          width: 80,
          height: 80,
          bgcolor: "primary.main",
          mb: 2,
          fontSize: "2rem",
          fontWeight: 800,
          borderRadius: 1,
          boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
        }}
      >
        {name[0]}
        {lastName[0]}
      </Avatar>

      <Typography
        variant="h5"
        sx={{
          color: "secondary.main",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 2,
          mb: 1,
        }}
      >
        ¡Feliz Cumpleaños!
      </Typography>

      <Typography
        variant="h2"
        sx={{
          fontWeight: 900,
          color: "primary.main",
          fontSize: { xs: "1.6rem", md: "2.2rem" },
          mb: 1,
          lineHeight: 1.2,
          px: 2,
        }}
      >
        {name} {lastName}
      </Typography>

      <Typography
        variant="h6"
        sx={{
          color: "text.secondary",
          fontStyle: "italic",
          maxWidth: 400,
        }}
      ></Typography>
    </Paper>
  );
}
