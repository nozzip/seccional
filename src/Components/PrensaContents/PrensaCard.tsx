import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Skeleton,
  alpha,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import LinearProgress from "@mui/material/LinearProgress";
import { fetchLatestNews, NewsItem } from "../../utils/newsFetcher";
import { Link } from "react-router-dom";
const seccionalLogo = "/seccionalLogo2.png";

export default function PrensaCard() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      // Simulación de progreso inteligente
      timer = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress >= 90) {
            // Desacelerar mucho después de 90%
            return Math.min(oldProgress + 0.5, 98);
          }
          const diff = Math.random() * 15;
          return Math.min(oldProgress + diff, 90);
        });
      }, 400);
    }

    async function loadNews() {
      try {
        const data = await fetchLatestNews();
        setNews(data);
      } finally {
        setProgress(100);
        // Pequeño delay para que se vea el 100% antes de desaparecer
        setTimeout(() => {
          setLoading(false);
        }, 400);
      }
    }
    loadNews();

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [loading]);

  if (loading) {
    return (
      <Box sx={{ width: "100%" }}>
        <LoadingProgress value={progress} />
        <NewsSkeleton />
      </Box>
    );
  }

  if (news.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 10 }}>
        <Typography variant="h6" color="text.secondary">
          No se pudieron cargar las noticias en este momento. Por favor, intenta
          más tarde.
        </Typography>
      </Box>
    );
  }

  const [hero, ...restNews] = news;

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: { xs: 6, md: 10 } }}
    >
      <HeroNewsItem item={hero} />
      <Grid container spacing={4}>
        {restNews.map((item, i) => (
          <Grid key={i} size={{ xs: 12, md: 6, lg: 4 }}>
            <StandardNewsItem item={item} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

function HeroNewsItem({ item }: { item: NewsItem }) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        borderRadius: 6,
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
        border: "1px solid",
        borderColor: alpha(theme.palette.divider, 0.5),
        transition: "all 0.4s ease",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: `0 30px 80px ${alpha(theme.palette.primary.main, 0.12)}`,
        },
      }}
    >
      <Box sx={{ width: { xs: "100%", md: "60%" }, position: "relative" }}>
        <CardMedia
          component="img"
          image={item.imgUrl || seccionalLogo}
          alt=""
          sx={{
            height: { xs: 300, md: "100%" },
            minHeight: { md: 500 },
            objectFit:
              item.imgUrl && !item.imgUrl.includes("seccionalLogo2")
                ? "cover"
                : "contain",
            bgcolor: alpha(theme.palette.primary.main, 0.02),
            p: item.imgUrl && !item.imgUrl.includes("seccionalLogo2") ? 0 : 6,
          }}
          onError={(e) => {
            e.currentTarget.src = seccionalLogo;
            e.currentTarget.style.objectFit = "contain";
            e.currentTarget.style.padding = "48px";
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 24,
            left: 24,
            bgcolor: "secondary.main",
            color: "white",
            px: 3,
            py: 1,
            borderRadius: 10,
            fontWeight: 900,
            textTransform: "uppercase",
            fontSize: "0.85rem",
            letterSpacing: 1,
            boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
          }}
        >
          Destacado
        </Box>
      </Box>

      <Box
        sx={{
          width: { xs: "100%", md: "40%" },
          display: "flex",
          flexDirection: "column",
          bgcolor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: "blur(4px)",
        }}
      >
        <CardContent
          sx={{
            p: { xs: 4, md: 8 },
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: 3,
              color: "primary.main",
            }}
          >
            <CalendarTodayIcon sx={{ fontSize: "1.2rem" }} />
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: 1.5,
              }}
            >
              {item.date}
            </Typography>
          </Box>

          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              color: "text.primary",
              mb: 4,
              fontSize: { xs: "2rem", md: "2.8rem" },
              lineHeight: 1.1,
              letterSpacing: -1,
            }}
          >
            {item.title}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              mb: 6,
              fontSize: "1.2rem",
              lineHeight: 1.8,
              opacity: 0.9,
            }}
          >
            {item.summary}
          </Typography>

          <Box sx={{ mt: "auto" }}>
            <Button
              variant="contained"
              size="large"
              color="primary"
              endIcon={<OpenInNewIcon />}
              {...(item.isLocal
                ? { component: Link, to: `/prensa/${item.id}` }
                : {
                    href: item.link,
                    target: "_blank",
                    rel: "noopener noreferrer",
                  })}
              sx={{
                borderRadius: 10,
                px: 6,
                py: 2.5,
                fontWeight: 900,
                fontSize: "1.1rem",
                boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              Leer Más
            </Button>
          </Box>
        </CardContent>
      </Box>
    </Card>
  );
}

function StandardNewsItem({ item }: { item: NewsItem }) {
  const theme = useTheme();
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 5,
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
        border: "1px solid",
        borderColor: alpha(theme.palette.divider, 0.6),
        transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        "&:hover": {
          transform: "translateY(-10px)",
          boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.1)}`,
          borderColor: alpha(theme.palette.primary.main, 0.2),
        },
      }}
    >
      <Box sx={{ position: "relative", pt: "62%", overflow: "hidden" }}>
        <CardMedia
          component="img"
          image={item.imgUrl || seccionalLogo}
          alt=""
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit:
              item.imgUrl && !item.imgUrl.includes("seccionalLogo2")
                ? "cover"
                : "contain",
            bgcolor: alpha(theme.palette.primary.main, 0.02),
            p: item.imgUrl && !item.imgUrl.includes("seccionalLogo2") ? 0 : 5,
          }}
          onError={(e) => {
            e.currentTarget.src = seccionalLogo;
            e.currentTarget.style.objectFit = "contain";
            e.currentTarget.style.padding = "40px";
          }}
        />
      </Box>
      <CardContent
        sx={{ p: 5, flexGrow: 1, display: "flex", flexDirection: "column" }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 2,
            color: "text.disabled",
          }}
        >
          <CalendarTodayIcon sx={{ fontSize: "0.9rem" }} />
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            {item.date}
          </Typography>
        </Box>

        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            color: "text.primary",
            mb: 2,
            lineHeight: 1.2,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.title}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            mb: 4,
            lineHeight: 1.7,
            flexGrow: 1,
            opacity: 0.8,
          }}
        >
          {item.summary}
        </Typography>

        <Button
          variant="outlined"
          color="primary"
          endIcon={<OpenInNewIcon fontSize="small" />}
          {...(item.isLocal
            ? { component: Link, to: `/prensa/${item.id}` }
            : { href: item.link, target: "_blank", rel: "noopener noreferrer" })}
          fullWidth
          sx={{
            borderRadius: 10,
            fontWeight: 800,
            py: 1.5,
            borderWidth: 2,
            "&:hover": { borderWidth: 2 },
          }}
        >
          {item.isLocal ? "Leer Noticia" : "Seguir Leyendo"}
        </Button>
      </CardContent>
    </Card>
  );
}

function LoadingProgress({ value }: { value: number }) {
  const theme = useTheme();
  return (
    <Box sx={{ width: "100%", mb: 6 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 800,
            color: "text.secondary",
            textTransform: "uppercase",
            letterSpacing: 1,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Box
            component="span"
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: "secondary.main",
              display: "inline-block",
              animation: "pulse 1.5s infinite",
              "@keyframes pulse": {
                "0%": { opacity: 1, transform: "scale(1)" },
                "50%": { opacity: 0.4, transform: "scale(0.8)" },
                "100%": { opacity: 1, transform: "scale(1)" },
              },
            }}
          />
          Sincronizando noticias de MDN
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 900,
            color: "primary.main",
            fontFamily: "monospace",
          }}
        >
          {Math.round(value)}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height: 12,
          borderRadius: 6,
          bgcolor: alpha(theme.palette.primary.main, 0.08),
          "& .MuiLinearProgress-bar": {
            borderRadius: 6,
            backgroundImage: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            boxShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.5)}`,
            transition: "transform 0.4s ease-out",
          },
        }}
      />
    </Box>
  );
}

function NewsSkeleton() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <Skeleton
        variant="rectangular"
        height={500}
        sx={{ borderRadius: 6, width: "100%" }}
      />
      <Grid container spacing={4}>
        {[1, 2, 3].map((i) => (
          <Grid key={i} size={{ xs: 12, md: 6, lg: 4 }}>
            <Skeleton
              variant="rectangular"
              height={450}
              sx={{ borderRadius: 5 }}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
