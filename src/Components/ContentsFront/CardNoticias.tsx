import React, { useEffect, useState, memo, useCallback } from "react";
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
  Chip,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { motion } from "framer-motion";
import { fetchLatestNews, NewsItem } from "../../utils/newsFetcher";

const seccionalLogo = "/seccionalLogo2.png";

const MotionCard = motion.create(Card);

const OptimizedImage = memo(({ 
  src, 
  alt, 
  onError,
  objectFit = "cover",
  p = 0
}: { 
  src: string; 
  alt: string; 
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  objectFit?: "cover" | "contain";
  p?: number;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleLoad = () => setIsLoaded(true);
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setError(true);
    onError?.(e);
  };

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%", bgcolor: alpha("#000", 0.02) }}>
      {!isLoaded && !error && (
        <Skeleton
          variant="rectangular"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        />
      )}
      <CardMedia
        component="img"
        src={error ? seccionalLogo : src}
        alt={alt}
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
        sx={{
          width: "100%",
          height: "100%",
          objectFit,
          p,
          opacity: isLoaded ? 1 : 0,
          transition: "opacity 0.3s ease",
          display: error ? "flex" : "block",
          justifyContent: "center",
          alignItems: "center",
        }}
      />
    </Box>
  );
});

OptimizedImage.displayName = "OptimizedImage";

const NoticiaItem = memo(function NoticiaItem({ item, index }: { item: NewsItem; index: number }) {
  const theme = useTheme();
  
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = seccionalLogo;
    e.currentTarget.style.objectFit = "contain";
    e.currentTarget.style.padding = "32px";
  }, []);

  return (
    <MotionCard
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 4,
        overflow: "hidden",
        boxShadow: `0 10px 40px ${alpha(theme.palette.primary.main, 0.08)}`,
        border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
        background: `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${theme.palette.background.paper} 100%)`,
        backdropFilter: "blur(10px)",
        transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        "&:hover": {
          transform: "translateY(-16px)",
          boxShadow: `0 30px 60px ${alpha(theme.palette.primary.main, 0.2)}`,
          borderColor: alpha(theme.palette.primary.main, 0.3),
          "& .news-image": {
            transform: "scale(1.1)",
          },
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
          <Box
            className="news-image"
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              transition: "transform 0.6s ease",
            }}
          >
            <OptimizedImage
              src={item.imgUrl || seccionalLogo}
              alt={item.title}
              onError={handleImageError}
              objectFit={item.imgUrl ? "cover" : "contain"}
              p={item.imgUrl ? 0 : 4}
            />
          </Box>
          <Box
            sx={{
              position: "absolute",
              top: 16,
              left: 16,
            }}
          >
            <Chip
              label="NUEVO"
              size="small"
              sx={{
                bgcolor: theme.palette.secondary.main,
                color: "white",
                fontWeight: 800,
                fontSize: "0.7rem",
                boxShadow: `0 4px 15px ${alpha(theme.palette.secondary.main, 0.4)}`,
              }}
            />
          </Box>
        </Box>
        <CardContent sx={{ p: 4, flexGrow: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: "text.primary",
              lineHeight: 1.3,
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
              opacity: 0.85,
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
              pt: 2,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: "primary.main",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              Ver más
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
    </MotionCard>
  );
});

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
        <Grid key={`${item.title}-${i}`} size={{ xs: 12, sm: 6, md: 4 }}>
          <NoticiaItem item={item} index={i} />
        </Grid>
      ))}
    </Grid>
  );
}

export default memo(CardNoticias);