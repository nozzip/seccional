import React from "react";
import { Typography, Paper, Box } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { dataServicios, DataItem } from "../mockData";

export default function CardServicios() {
  return (
    <Grid container spacing={4}>
      {dataServicios.map((item, i) => (
        <Grid key={i} size={{ xs: 12, md: 4 }}>
          <ServicioItem item={item} />
        </Grid>
      ))}
    </Grid>
  );
}

function ServicioItem({ item }: { item: DataItem }) {
  return (
    <Paper
      elevation={0}
      sx={{
        position: "relative",
        height: { xs: 350, md: 480 },
        borderRadius: 6,
        overflow: "hidden",
        boxShadow: "0 10px 40px rgba(0,0,0,0.06)",
        transition: "all 0.4s ease",
        "&:hover": {
          transform: "translateY(-12px)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
          "& .service-bg": {
            transform: "scale(1.1)",
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
          backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.1) 100%), url(${item.thumbnail})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transition: "transform 0.8s ease",
        }}
      />
      <Box
        sx={{
          position: "relative",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          p: { xs: 4, md: 5 },
          color: "white",
          textAlign: "left",
          pointerEvents: "none",
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
      </Box>
    </Paper>
  );
}
