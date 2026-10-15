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
  IconButton,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CollectionsIcon from "@mui/icons-material/Collections";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EditIcon from "@mui/icons-material/Edit";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DownloadIcon from "@mui/icons-material/Download";
import { supabase } from "../supabaseClient";
import { Helmet } from "react-helmet-async";
import { isUserAdmin } from "../utils/auth";
import AddNewsDialog from "../Components/PrensaContents/AddNewsDialog";

const seccionalLogo = `${import.meta.env.BASE_URL}seccionalLogo2.png`;

export default function NoticiaDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [news, setNews] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedImgIndex, setSelectedImgIndex] = useState<number | null>(null);
  const [isZoomedIn, setIsZoomedIn] = useState(false);

  const loadNewsData = async () => {
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
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    const userStr = localStorage.getItem("current_affiliate");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsAdmin(isUserAdmin(user));
      } catch (e) {}
    }

    loadNewsData();
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

  let gallery: string[] = news.gallery_urls || news.gallery || news.thumbnails || [];
  let displayContent = news.content || "";

  if ((!gallery || gallery.length === 0) && news.content) {
    const match = news.content.match(/<!--GALLERY:(.*?)-->/);
    if (match && match[1]) {
      try {
        gallery = JSON.parse(match[1]);
      } catch (e) {}
    }
  }

  let pdfDocs: Array<{ url: string; name: string }> = Array.isArray(news.pdf_docs) ? [...news.pdf_docs] : [];

  if (news.content) {
    const pdfsMatch = news.content.match(/<!--PDFS:(.*?)-->/);
    if (pdfsMatch && pdfsMatch[1]) {
      try {
        const parsed = JSON.parse(pdfsMatch[1]);
        if (Array.isArray(parsed) && parsed.length > 0) {
          pdfDocs = parsed;
        }
      } catch (e) {}
    }

    if (pdfDocs.length === 0) {
      const pdfMatch = news.content.match(/<!--PDF:(.*?)-->/);
      if (pdfMatch && pdfMatch[1]) {
        try {
          const parsedPdf = JSON.parse(pdfMatch[1]);
          if (parsedPdf.url) {
            pdfDocs = [{ url: parsedPdf.url, name: parsedPdf.name || "Documento oficial adjunto" }];
          }
        } catch (e) {}
      }
    }
  }

  if (pdfDocs.length === 0 && (news.pdf_url || news.file_url)) {
    pdfDocs = [{
      url: news.pdf_url || news.file_url,
      name: news.pdf_name || news.file_name || "Documento oficial adjunto",
    }];
  }

  if (displayContent) {
    displayContent = displayContent
      .replace(/<!--GALLERY:.*?-->/g, "")
      .replace(/<!--PDFS:.*?-->/g, "")
      .replace(/<!--PDF:.*?-->/g, "")
      .trim();
  }

  return (
    <Box sx={{ pt: { xs: 12, md: 16 }, pb: 10, bgcolor: "background.default" }}>
      <Helmet>
        <title>{news.title} - A.E.F.I.P Prensa</title>
      </Helmet>
      <Container maxWidth="md">
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
          <Button
            onClick={() => navigate("/prensa")}
            startIcon={<ArrowBackIcon />}
            sx={{ fontWeight: 700 }}
          >
            Volver a Prensa
          </Button>
          {isAdmin && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={() => setOpenEditDialog(true)}
              sx={{ borderRadius: 8, px: 3, fontWeight: 800 }}
            >
              Editar Noticia
            </Button>
          )}
        </Box>

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
              borderRadius: 4,
              overflow: "hidden",
              mb: 6,
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
              bgcolor: alpha(theme.palette.background.paper, 0.4),
              border: "1px solid",
              borderColor: alpha(theme.palette.divider, 0.4),
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              minHeight: { xs: 260, md: 380 },
              ...(news.img_url && {
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: `url(${news.img_url})`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                  filter: "blur(30px) brightness(0.65)",
                  transform: "scale(1.15)",
                  opacity: 0.35,
                  zIndex: 0,
                },
              }),
            }}
          >
            <Box
              component="img"
              src={news.img_url || seccionalLogo}
              alt={news.title}
              sx={{
                width: "auto",
                maxWidth: "100%",
                maxHeight: { xs: 500, sm: 650, md: 800 },
                height: "auto",
                objectFit: "contain",
                display: "block",
                position: "relative",
                zIndex: 1,
                borderRadius: 2,
                p: news.img_url ? { xs: 1, sm: 2 } : 6,
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
            {displayContent || "Sin contenido adicional disponible."}
          </Box>

          {/* Documentos PDF adjuntos si existen */}
          {pdfDocs.length > 0 && (
            <Box sx={{ mt: 6 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: "text.primary",
                  mb: 2.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <PictureAsPdfIcon color="error" />
                {pdfDocs.length === 1
                  ? "Documento Oficial Adjunto"
                  : `Documentos Oficiales Adjuntos (${pdfDocs.length})`}
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {pdfDocs.map((doc, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: { xs: 2.5, sm: 3 },
                      borderRadius: 4,
                      bgcolor: alpha(theme.palette.error.main, 0.04),
                      border: "1px solid",
                      borderColor: alpha(theme.palette.error.main, 0.25),
                      boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: { xs: "flex-start", sm: "center" },
                      justifyContent: "space-between",
                      gap: 2,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        borderColor: alpha(theme.palette.error.main, 0.5),
                        boxShadow: `0 8px 24px ${alpha(theme.palette.error.main, 0.1)}`,
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0 }}>
                      <Box
                        sx={{
                          p: 1.2,
                          borderRadius: 3,
                          bgcolor: alpha(theme.palette.error.main, 0.12),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <PictureAsPdfIcon sx={{ color: "error.main", fontSize: 30 }} />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 800,
                            color: "text.primary",
                            lineHeight: 1.3,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {doc.name || `Documento ${idx + 1}.pdf`}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                          Documento PDF • Consulta o descarga el archivo original
                        </Typography>
                      </Box>
                    </Box>

                    <Button
                      variant="contained"
                      color="error"
                      component="a"
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={doc.name || "documento.pdf"}
                      startIcon={<DownloadIcon />}
                      sx={{
                        borderRadius: 8,
                        px: 3,
                        py: 1.1,
                        fontWeight: 800,
                        textTransform: "none",
                        boxShadow: `0 8px 20px ${alpha(theme.palette.error.main, 0.35)}`,
                        whiteSpace: "nowrap",
                        width: { xs: "100%", sm: "auto" },
                      }}
                    >
                      Descargar PDF
                    </Button>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Galería de imágenes (Thumbnails Grid al pie de la noticia) */}
          {gallery.length > 0 && (
            <Box sx={{ mt: 8, pt: 4, borderTop: "1px dashed", borderColor: alpha(theme.palette.divider, 0.8) }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: "text.primary",
                  mb: 3,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <CollectionsIcon color="primary" /> Galería de Imágenes
              </Typography>

              <Grid container spacing={2.5}>
                {gallery.map((imgUrl: string, idx: number) => (
                  <Grid key={idx} size={{ xs: 6, sm: 4, md: 3 }}>
                    <Box
                      onClick={() => {
                        setSelectedImgIndex(idx);
                        setIsZoomedIn(false);
                      }}
                      sx={{
                        position: "relative",
                        paddingTop: "75%",
                        borderRadius: 3,
                        overflow: "hidden",
                        cursor: "pointer",
                        boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                        border: "1px solid",
                        borderColor: alpha(theme.palette.divider, 0.5),
                        transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                        "&:hover": {
                          transform: "scale(1.04)",
                          boxShadow: `0 14px 28px ${alpha(theme.palette.primary.main, 0.2)}`,
                          borderColor: theme.palette.primary.main,
                          "& .zoom-overlay": {
                            opacity: 1,
                          },
                        },
                      }}
                    >
                      <Box
                        component="img"
                        src={imgUrl}
                        alt={`Thumbnail ${idx + 1}`}
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <Box
                        className="zoom-overlay"
                        sx={{
                          position: "absolute",
                          inset: 0,
                          bgcolor: "rgba(0, 0, 0, 0.45)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          opacity: 0,
                          transition: "opacity 0.3s ease",
                        }}
                      >
                        <ZoomInIcon sx={{ fontSize: 38 }} />
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

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

      {/* Modal Zoom Lightbox */}
      {selectedImgIndex !== null && gallery[selectedImgIndex] && (
        <Box
          onClick={() => {
            setSelectedImgIndex(null);
            setIsZoomedIn(false);
          }}
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(0, 0, 0, 0.92)",
            backdropFilter: "blur(12px)",
            zIndex: 99999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
            userSelect: "none",
          }}
        >
          {/* Top Bar */}
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              position: "absolute",
              top: 24,
              left: 24,
              right: 24,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              zIndex: 10,
            }}
          >
            <Typography variant="subtitle1" sx={{ color: "white", fontWeight: 800, letterSpacing: 1 }}>
              {selectedImgIndex + 1} / {gallery.length}
            </Typography>
            <IconButton
              onClick={() => {
                setSelectedImgIndex(null);
                setIsZoomedIn(false);
              }}
              sx={{
                color: "white",
                bgcolor: "rgba(255, 255, 255, 0.15)",
                "&:hover": { bgcolor: "error.main" },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Previous Button */}
          {gallery.length > 1 && (
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImgIndex((prev) => (prev !== null ? (prev - 1 + gallery.length) % gallery.length : 0));
                setIsZoomedIn(false);
              }}
              sx={{
                position: "absolute",
                left: { xs: 10, md: 30 },
                color: "white",
                bgcolor: "rgba(255, 255, 255, 0.15)",
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.35)", transform: "scale(1.1)" },
                zIndex: 10,
              }}
            >
              <ChevronLeftIcon fontSize="large" />
            </IconButton>
          )}

          {/* Main Zoomed Image Container */}
          <Box
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomedIn(!isZoomedIn);
            }}
            sx={{
              maxWidth: isZoomedIn ? "none" : "90vw",
              maxHeight: isZoomedIn ? "none" : "85vh",
              overflow: isZoomedIn ? "auto" : "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: isZoomedIn ? "zoom-out" : "zoom-in",
            }}
          >
            <Box
              component="img"
              src={gallery[selectedImgIndex]}
              alt={`Imagen ampliada ${selectedImgIndex + 1}`}
              sx={{
                maxWidth: isZoomedIn ? "160vw" : "90vw",
                maxHeight: isZoomedIn ? "160vh" : "85vh",
                objectFit: "contain",
                borderRadius: 3,
                boxShadow: "0 24px 72px rgba(0, 0, 0, 0.8)",
                transform: isZoomedIn ? "scale(1.4)" : "scale(1)",
                transition: "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              }}
            />
          </Box>

          {/* Next Button */}
          {gallery.length > 1 && (
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImgIndex((prev) => (prev !== null ? (prev + 1) % gallery.length : 0));
                setIsZoomedIn(false);
              }}
              sx={{
                position: "absolute",
                right: { xs: 10, md: 30 },
                color: "white",
                bgcolor: "rgba(255, 255, 255, 0.15)",
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.35)", transform: "scale(1.1)" },
                zIndex: 10,
              }}
            >
              <ChevronRightIcon fontSize="large" />
            </IconButton>
          )}
        </Box>
      )}

      {isAdmin && news && (
        <AddNewsDialog
          open={openEditDialog}
          onClose={() => setOpenEditDialog(false)}
          onNewsAdded={loadNewsData}
          newsToEdit={{
            id: news.id,
            title: news.title,
            summary: news.summary || "",
            content: news.content || "",
            link: news.link || "",
            imgUrl: news.img_url || "",
            date: formattedDate,
            isLocal: true,
            gallery_urls: gallery,
          }}
        />
      )}
    </Box>
  );
}


