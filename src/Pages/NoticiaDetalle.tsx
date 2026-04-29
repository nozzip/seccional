import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  alpha,
  useTheme,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { supabase } from "../supabaseClient";
import { Helmet } from "react-helmet-async";

const seccionalLogo = `${import.meta.env.BASE_URL}seccionalLogo2.png`;

export default function NoticiaDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [news, setNews] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    async function loadNews() {
      try {
        const { data, error } = await supabase
          .from("news")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setNews(data);
      } catch (err) {
        console.error("Error cargando noticia:", err);
      } finally {
        setLoading(false);
      }
    }
    loadNews();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!news) {
    return (
      <Container maxWidth="md" sx={{ py: 20, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>Noticia no encontrada</Typography>
        <Button variant="contained" onClick={() => navigate("/prensa")} startIcon={<ArrowBackIcon />}>
          Volver a Prensa
        </Button>
      </Container>
    );
  }

  const formattedDate = new Date(news.created_at).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Box sx={{ pt: { xs: 12, md: 16 }, pb: 10, bgcolor: "background.default" }}>
      <Helmet>
        <title>{news.title} - A.E.F.I.P Prensa</title>
      </Helmet>
      <Container maxWidth="md">
        <Button
          onClick={() => navigate("/prensa")}
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 4, fontWeight: 700 }}
        >
          Volver a Prensa
        </Button>

        <Box component="article">
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              color: "text.primary",
              mb: 3,
              fontSize: { xs: "2.5rem", md: "3.5rem" },
              lineHeight: 1.1,
            }}
          >
            {news.title}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4, color: "text.secondary" }}>
            <CalendarTodayIcon fontSize="small" />
            <Typography variant="subtitle1" fontWeight={700}>
              {formattedDate}
            </Typography>
          </Box>

          <Box
            sx={{
              width: "100%",
              height: { xs: 250, md: 450 },
              borderRadius: 4,
              overflow: "hidden",
              mb: 6,
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
              bgcolor: alpha(theme.palette.primary.main, 0.03),
              position: "relative",
            }}
          >
            <Box
              component="img"
              src={news.img_url || seccionalLogo}
              alt={news.title}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: news.img_url ? "cover" : "contain",
                p: news.img_url ? 0 : 8,
              }}
            />
          </Box>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              lineHeight: 1.6,
              color: "primary.main",
              mb: 4,
              fontStyle: "italic",
            }}
          >
            {news.summary}
          </Typography>

          <Divider sx={{ mb: 6 }} />

          <Box
            sx={{
              color: "text.primary",
              fontSize: "1.15rem",
              lineHeight: 1.8,
              whiteSpace: "pre-wrap",
            }}
          >
            {news.content || "Sin contenido adicional disponible."}
          </Box>

          {news.link && (
            <Box sx={{ mt: 8, p: 4, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 3, textAlign: "center" }}>
              <Typography variant="body1" sx={{ mb: 2, fontWeight: 600 }}>
                Para más información, puedes visitar el enlace oficial:
              </Typography>
              <Button
                variant="contained"
                href={news.link}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ borderRadius: 10, px: 4, fontWeight: 800 }}
              >
                Ver Fuente Original
              </Button>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
}
