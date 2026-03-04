import React, { useEffect, useState } from "react";
import {
  Card,
  CardActionArea,
  Typography,
  CardMedia,
  CardContent,
  Skeleton,
  alpha,
  useTheme,
  Box,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { fetchLatestNews, NewsItem } from "../../utils/newsFetcher";
const seccionalLogo = "/seccionalLogo2.png";

function CardNoticias() {
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
    return (
      <Grid container spacing={4}>
        {[1, 2, 3].map((i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ height: "100%", borderRadius: 3 }}>
              <Skeleton variant="rectangular" height={240} />
              <CardContent sx={{ p: 3 }}>
                <Skeleton variant="text" height={32} width="80%" />
                <Skeleton variant="text" height={24} width="60%" />
                <Skeleton variant="text" sx={{ mt: 2 }} />
                <Skeleton variant="text" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={4}>
      {news.slice(0, 3).map((item, i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
          <NoticiaItem item={item} />
        </Grid>
      ))}
    </Grid>
  );
}

function NoticiaItem({ item }: { item: NewsItem }) {
  const theme = useTheme();
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 4,
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
        border: "1px solid",
        borderColor: alpha(theme.palette.divider, 0.5),
        transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        "&:hover": {
          transform: "translateY(-12px)",
          boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.12)}`,
          borderColor: alpha(theme.palette.primary.main, 0.2),
        },
      }}
    >
      <CardActionArea
        href={item.link}
        target="_blank"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }}
      >
        <Box sx={{ position: "relative", pt: "60%", overflow: "hidden" }}>
          <CardMedia
            component="img"
            image={item.imgUrl || seccionalLogo}
            alt={item.title}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: item.imgUrl ? "cover" : "contain",
              bgcolor: alpha(theme.palette.primary.main, 0.03),
              p: item.imgUrl ? 0 : 4,
            }}
            onError={(e) => {
              e.currentTarget.src = seccionalLogo;
              e.currentTarget.style.objectFit = "contain";
              e.currentTarget.style.padding = "32px";
            }}
          />
        </Box>
        <CardContent sx={{ p: 4, flexGrow: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: "text.primary",
              lineHeight: 1.2,
              mb: 2,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {item.title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.7,
              mb: 3,
              opacity: 0.8,
            }}
          >
            {item.summary}
          </Typography>
          <Box
            sx={{
              mt: "auto",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: "primary.main",
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
              }}
            >
              Novedad
            </Typography>
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{ fontWeight: 600 }}
            >
              {item.date}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default CardNoticias;
