import React, { useEffect, useState } from "react";
import {
  Grid,
  Card,
  CardActionArea,
  Typography,
  CardMedia,
  CardContent,
  Skeleton,
  alpha,
  useTheme,
} from "@mui/material";
import { fetchLatestNews, NewsItem } from "../../utils/newsFetcher";
import seccionalLogo from "../../../public/seccionalLogo2.png";

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
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item key={i} xs={12} sm={6} md={3}>
            <Card sx={{ height: "100%", borderRadius: 3 }}>
              <Skeleton variant="rectangular" height={200} />
              <CardContent>
                <Skeleton variant="text" height={24} width="80%" />
                <Skeleton variant="text" height={24} width="60%" />
                <Skeleton variant="text" sx={{ mt: 1 }} />
                <Skeleton variant="text" />
                <Skeleton variant="text" width="90%" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      {news.slice(0, 4).map((item, i) => (
        <Grid item key={i} xs={12} sm={6} md={3}>
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
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        border: "1px solid",
        borderColor: "divider",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
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
        <CardMedia
          component="img"
          image={item.imgUrl || seccionalLogo}
          alt={item.title}
          sx={{
            height: 200,
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
        <CardContent sx={{ p: 3, flexGrow: 1 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              color: "primary.main",
              lineHeight: 1.3,
              mb: 1,
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
              lineHeight: 1.6,
              mb: 1,
            }}
          >
            {item.summary}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 600 }}
          >
            {item.date}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default CardNoticias;
