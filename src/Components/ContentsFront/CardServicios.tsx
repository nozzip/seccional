import React from "react";
import { Typography, Paper, Box, alpha, useTheme } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { motion } from "framer-motion";
import { dataServicios, DataItem } from "../mockData";

const MotionPaper = motion.create(Paper);

export default function CardServicios() {
  return (
    <Grid container spacing={4}>
      {dataServicios.map((item, i) => (
        <Grid key={i} size={{ xs: 12, md: 4 }}>
          <ServicioItem item={item} index={i} />
        </Grid>
      ))}
    </Grid>
  );
}

function ServicioItem({ item, index }: { item: DataItem; index: number }) {
  const theme = useTheme();
  return (
    <MotionPaper
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      elevation={0}
      sx={{
        position: "relative",
        height: { xs: 350, md: 480 },
        borderRadius: 6,
        overflow: "hidden",
        boxShadow: `0 10px 40px ${alpha(theme.palette.primary.main, 0.1)}`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        transition: "all 0.4s ease",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-16px)",
          boxShadow: `0 30px 60px ${alpha(theme.palette.primary.main, 0.25)}`,
          borderColor: alpha(theme.palette.primary.main, 0.3),
          "& .service-bg": {
            transform: "scale(1.15)",
          },
          "& .service-content": {
            transform: "translateY(-8px)",
          },
          "& .service-arrow": {
            opacity: 1,
            transform: "translateX(0)",
          },
        },
      }}
    >
      <Box
        className="service-bg"
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `linear-gradient(to top, ${alpha(theme.palette.common.black, 0.9)} 0%, ${alpha(theme.palette.common.black, 0.2)} 60%, transparent 100%), url(${item.thumbnail})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transition: "transform 0.8s ease",
        }}
      />
      <Box
        className="service-content"
        sx={{
          position: "relative",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          p: { xs: 4, md: 5 },
          color: "white",
          textAlign: "left",
          transition: "transform 0.4s ease",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            mb: 1.5,
            textShadow: "0 4px 12px rgba(0,0,0,0.4)",
            fontSize: { xs: "1.6rem", md: "2rem" },
            lineHeight: 1.1,
          }}
        >
          {item.title}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 400,
            opacity: 0.9,
            textShadow: "0 2px 8px rgba(0,0,0,0.3)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            lineHeight: 1.5,
          }}
        >
          {item.short_description}
        </Typography>
        <Box
          className="service-arrow"
          sx={{
            mt: 2,
            opacity: 0,
            transform: "translateX(-20px)",
            transition: "all 0.3s ease",
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            color: theme.palette.secondary.main,
            fontWeight: 700,
          }}
        >
          Ver más →
        </Box>
      </Box>
    </MotionPaper>
  );
}
