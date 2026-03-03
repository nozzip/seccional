import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Grid,
  Skeleton,
  alpha,
  useTheme,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { fetchLatestNews, NewsItem } from "../../utils/newsFetcher";
import seccionalLogo from "../../../public/seccionalLogo2.png";

export default function PrensaCard() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNews() {
      const data = await fetchLatestNews();
      setNews(data);
      setLoading(false);
    }
    loadNews();
  }, []);

  if (loading) {
    return <NewsSkeleton />;
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
      sx={{ display: "flex", flexDirection: "column", gap: { xs: 4, md: 6 } }}
    >
      <HeroNewsItem item={hero} />
      <Grid container spacing={4}>
        {restNews.map((item, i) => (
          <Grid item xs={12} md={6} key={i}>
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
        borderRadius: 4,
        overflow: "hidden",
        boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
        border: "1px solid",
        borderColor: "divider",
        transition: "transform 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 16px 50px rgba(0,0,0,0.12)",
        },
      }}
    >
      <Box sx={{ width: { xs: "100%", md: "55%" }, position: "relative" }}>
        <CardMedia
          component="img"
          image={item.imgUrl || seccionalLogo}
          alt={item.title}
          sx={{
            height: { xs: 300, md: "100%" },
            minHeight: { md: 450 },
            objectFit: item.imgUrl ? "cover" : "contain",
            bgcolor: item.imgUrl
              ? "transparent"
              : alpha(theme.palette.primary.main, 0.05),
            p: item.imgUrl ? 0 : 4,
          }}
          onError={(e) => {
            e.currentTarget.src = seccionalLogo;
            e.currentTarget.style.objectFit = "contain";
            e.currentTarget.style.backgroundColor = alpha(
              theme.palette.primary.main,
              0.05,
            );
            e.currentTarget.style.padding = "32px";
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 16,
            left: 16,
            bgcolor: "secondary.main",
            color: "white",
            px: 2,
            py: 0.5,
            borderRadius: 8,
            fontWeight: 800,
            textTransform: "uppercase",
            fontSize: "0.8rem",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          }}
        >
          Destacado
        </Box>
      </Box>

      <Box
        sx={{
          width: { xs: "100%", md: "45%" },
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CardContent
          sx={{
            p: { xs: 4, md: 6 },
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
              gap: 1,
              mb: 2,
              color: "text.secondary",
            }}
          >
            <CalendarTodayIcon sx={{ fontSize: "1rem" }} />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              {item.date}
            </Typography>
          </Box>

          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              color: "primary.main",
              mb: 3,
              fontSize: { xs: "1.8rem", md: "2.5rem" },
              lineHeight: 1.1,
            }}
          >
            {item.title}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              mb: 4,
              fontSize: "1.1rem",
              lineHeight: 1.7,
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
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                borderRadius: 8,
                px: 4,
                py: 1.5,
                fontWeight: 700,
                boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              Leer Artículo Completo
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
        borderRadius: 4,
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        border: "1px solid",
        borderColor: "divider",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 30px rgba(0,0,0,0.1)",
        },
      }}
    >
      <CardMedia
        component="img"
        height="240"
        image={item.imgUrl || seccionalLogo}
        alt={item.title}
        sx={{
          objectFit: item.imgUrl ? "cover" : "contain",
          bgcolor: item.imgUrl
            ? "transparent"
            : alpha(theme.palette.primary.main, 0.05),
          p: item.imgUrl ? 0 : 3,
        }}
        onError={(e) => {
          e.currentTarget.src = seccionalLogo;
          e.currentTarget.style.objectFit = "contain";
          e.currentTarget.style.backgroundColor = alpha(
            theme.palette.primary.main,
            0.05,
          );
          e.currentTarget.style.padding = "24px";
        }}
      />
      <CardContent
        sx={{ p: 4, flexGrow: 1, display: "flex", flexDirection: "column" }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 2,
            color: "text.secondary",
          }}
        >
          <CalendarTodayIcon sx={{ fontSize: "0.9rem" }} />
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, textTransform: "uppercase" }}
          >
            {item.date}
          </Typography>
        </Box>

        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            color: "primary.main",
            mb: 2,
            lineHeight: 1.3,
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
            lineHeight: 1.6,
            flexGrow: 1,
          }}
        >
          {item.summary}
        </Typography>

        <Button
          variant="outlined"
          color="secondary"
          endIcon={<OpenInNewIcon fontSize="small" />}
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          fullWidth
          sx={{
            borderRadius: 8,
            fontWeight: 700,
            borderWidth: 2,
            "&:hover": { borderWidth: 2 },
          }}
        >
          Leer Más
        </Button>
      </CardContent>
    </Card>
  );
}

function NewsSkeleton() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {/* Hero Skeleton */}
      <Card
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          borderRadius: 4,
          height: { md: 450 },
        }}
      >
        <Skeleton
          variant="rectangular"
          sx={{
            width: { xs: "100%", md: "55%" },
            height: { xs: 300, md: "100%" },
          }}
        />
        <CardContent
          sx={{
            width: { xs: "100%", md: "45%" },
            p: 6,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Skeleton variant="text" width="30%" height={24} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="90%" height={60} />
          <Skeleton variant="text" width="70%" height={60} sx={{ mb: 3 }} />
          <Skeleton variant="text" width="100%" height={24} />
          <Skeleton variant="text" width="100%" height={24} />
          <Skeleton variant="text" width="80%" height={24} sx={{ mb: 4 }} />
          <Skeleton
            variant="rectangular"
            width="60%"
            height={48}
            sx={{ borderRadius: 8, mt: "auto" }}
          />
        </CardContent>
      </Card>

      {/* Grid Skeletons */}
      <Grid container spacing={4}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={12} md={6} key={i}>
            <Card sx={{ borderRadius: 4, height: 450 }}>
              <Skeleton variant="rectangular" height={240} />
              <CardContent sx={{ p: 4 }}>
                <Skeleton
                  variant="text"
                  width="40%"
                  height={20}
                  sx={{ mb: 2 }}
                />
                <Skeleton variant="text" width="100%" height={32} />
                <Skeleton
                  variant="text"
                  width="80%"
                  height={32}
                  sx={{ mb: 3 }}
                />
                <Skeleton variant="text" width="100%" height={20} />
                <Skeleton
                  variant="text"
                  width="90%"
                  height={20}
                  sx={{ mb: 4 }}
                />
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={40}
                  sx={{ borderRadius: 8, mt: "auto" }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
