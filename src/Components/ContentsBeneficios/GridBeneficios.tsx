import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  alpha,
  useTheme,
  CircularProgress,
  Fab,
  Tooltip,
  TablePagination,
  TextField,
  MenuItem,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import ReportIcon from "@mui/icons-material/ReportProblem";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PhoneIcon from "@mui/icons-material/Phone";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { dataBeneficios } from "../mockData";
import { supabase } from "../../supabaseClient";
import BenefitEditModal, { Benefit } from "./BenefitEditModal";

const ITEMS_PER_PAGE = 15;

type BenefitItem = Benefit;

export default function GridBeneficios() {
  const [beneficios, setBeneficios] = useState<BenefitItem[]>([]);
  const [dbBenefits, setDbBenefits] = useState<Benefit[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedRubro, setSelectedRubro] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [rubros, setRubros] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedBenefit, setSelectedBenefit] = useState<Benefit | null>(null);
  const [page, setPage] = useState(0);
  const theme = useTheme();

  const categories = [
    "Todos",
    "Tucumán",
    "Catamarca",
    "Salta",
    "Santiago del Estero",
    "Jujuy",
    "General",
  ];

  useEffect(() => {
    fetchBenefits();
    fetchRubros();
  }, []);

  const fetchRubros = async (currentBenefits?: BenefitItem[]) => {
    try {
      const { data: catData } = await supabase
        .from('benefit_categories')
        .select('name')
        .order('name');
      
      const benefitList = currentBenefits || beneficios;
      const dynamicRubros = [...new Set(benefitList.map(b => b.rubro).filter(Boolean) as string[])];
      
      const allRubros = ["Todos"];
      
      // Add from categories table
      if (catData) {
        catData.forEach(c => {
          if (!allRubros.includes(c.name)) allRubros.push(c.name);
        });
      }
      
      // Add from actual benefits (safety net)
      dynamicRubros.forEach(r => {
        if (!allRubros.includes(r)) allRubros.push(r);
      });

      setRubros(allRubros.sort((a, b) => a === "Todos" ? -1 : b === "Todos" ? 1 : a.localeCompare(b)));
    } catch (err) {
      console.error('Error fetching rubros:', err);
    }
  };

  const fetchBenefits = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("benefits")
        .select("*")
        .order("display_order", { ascending: true });

      if (!error && data && data.length > 0) {
        setDbBenefits(data);
        setBeneficios(data);
        fetchRubros(data);
      } else {
        const mock = dataBeneficios as BenefitItem[];
        setBeneficios(mock);
        fetchRubros(mock);
      }
    } catch (err) {
      console.error("Error fetching benefits:", err);
      setBeneficios(dataBeneficios as BenefitItem[]);
    } finally {
      setLoading(false);
    }
  };

  const getAllBenefits = (): BenefitItem[] => {
    if (dbBenefits.length > 0) {
      return dbBenefits;
    }
    return dataBeneficios as BenefitItem[];
  };

  const filteredBenefits = useMemo(() => {
    let all = getAllBenefits();

    // Filter by Provincia (category)
    if (selectedCategory !== "Todos") {
      all = all.filter((item) => item.category === selectedCategory);
    }

    // Filter by Rubro
    if (selectedRubro !== "Todos") {
      all = all.filter((item) => item.rubro === selectedRubro);
    }

    // Filter by Search Term
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      all = all.filter(
        (item) =>
          item.title.toLowerCase().includes(lowerSearch) ||
          (item.short_description?.toLowerCase() || "").includes(lowerSearch) ||
          (item.rubro?.toLowerCase() || "").includes(lowerSearch)
      );
    }

    return all;
  }, [selectedCategory, selectedRubro, searchTerm, dbBenefits]);

  const paginatedBenefits = useMemo(() => {
    const start = page * ITEMS_PER_PAGE;
    return filteredBenefits.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBenefits, page]);

  const handleCategoryChange = useCallback((provinciaId: string) => {
    setSelectedCategory(provinciaId);
    setPage(0);
  }, []);

  const handlePageChange = useCallback((_: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleEdit = (benefit: BenefitItem) => {
    setSelectedBenefit(benefit);
    setEditModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedBenefit(null);
    setEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    fetchBenefits();
    fetchRubros();
  };

  const [currentAffiliate, setCurrentAffiliate] = useState<any>(null);

  useEffect(() => {
    const checkUser = () => {
      // Check web session
      const stored = localStorage.getItem("current_affiliate");
      if (stored) {
        setCurrentAffiliate(JSON.parse(stored));
        return;
      }

      // Check mobile session
      const mobileName = localStorage.getItem("mobile_app_name");
      const mobileLegajo = localStorage.getItem("mobile_app_legajo");
      if (mobileName && mobileLegajo) {
        const [nombre, ...apellidoParts] = mobileName.split(" ");
        setCurrentAffiliate({
          nombre: nombre,
          apellido: apellidoParts.join(" "),
          legajo: mobileLegajo
        });
      } else {
        setCurrentAffiliate(null);
      }
    };

    checkUser();
    window.addEventListener("affiliate_login", checkUser);
    return () => window.removeEventListener("affiliate_login", checkUser);
  }, []);

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          mb: 5,
          alignItems: "center"
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 800, display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
          <TextField
            fullWidth
            placeholder="Buscar por nombre, descripción o rubro..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />,
              sx: { borderRadius: 3, bgcolor: "background.paper" }
            }}
          />
          <TextField
            select
            value={selectedRubro}
            onChange={(e) => { setSelectedRubro(e.target.value); setPage(0); }}
            sx={{ minWidth: { sm: 200 } }}
            InputProps={{ sx: { borderRadius: 3, bgcolor: "background.paper" } }}
            label="Rubro"
          >
            {rubros.length > 0 ? rubros.map(r => (
              <MenuItem key={r} value={r}>{r}</MenuItem>
            )) : <MenuItem value="Todos">Cargando rubros...</MenuItem>}
          </TextField>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1.5,
            justifyContent: "center",
          }}
        >
          {categories.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              onClick={() => handleCategoryChange(cat)}
              color={selectedCategory === cat ? "primary" : "default"}
              variant={selectedCategory === cat ? "filled" : "outlined"}
              sx={{
                fontWeight: 800,
                px: { xs: 2, md: 3 },
                py: 2.5,
                fontSize: "0.9rem",
                borderRadius: 2,
                transition: "all 0.3s ease",
                borderWidth: 2,
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  borderWidth: 2,
                },
              }}
            />
          ))}
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={4}>
            {paginatedBenefits.map((item, i) => (
              <Grid key={item.id || `paginated-${i}`} size={{ xs: 12, sm: 6, lg: 4 }}>
                <BenefitItemComponent
                  item={item}
                  onEdit={() => handleEdit(item)}
                  currentAffiliate={currentAffiliate}
                />
              </Grid>
            ))}
          </Grid>

          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <TablePagination
              component="div"
              count={filteredBenefits.length}
              page={page}
              onPageChange={handlePageChange}
              rowsPerPage={ITEMS_PER_PAGE}
              rowsPerPageOptions={[]}
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
          </Box>
        </>
      )}

      <Tooltip title="Agregar beneficio">
        <Fab
          color="primary"
          onClick={handleAdd}
          sx={{
            position: "fixed",
            bottom: 80,
            right: 24,
            zIndex: 1000,
          }}
        >
          <AddIcon />
        </Fab>
      </Tooltip>

      <BenefitEditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        benefit={selectedBenefit}
        onSave={handleSaveEdit}
      />
    </Box>
  );
}

function BenefitItemComponent({
  item,
  onEdit,
  currentAffiliate
}: {
  item: BenefitItem;
  onEdit: () => void;
  currentAffiliate: any;
}) {
  const [open, setOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportOtherReason, setReportOtherReason] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const theme = useTheme();

  const handleOpen = useCallback(() => {
    setOpen(true);
    setCurrentImgIndex(0);
  }, []);
  const handleClose = useCallback(() => setOpen(false), []);

  const gallery = useMemo(() => {
    const list = [];
    if (item.thumbnail) list.push(item.thumbnail);
    if (item.images && Array.isArray(item.images)) {
      list.push(...item.images);
    }
    return list;
  }, [item]);

  const handleNextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % gallery.length);
  };

  const handlePrevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  const handleContact = () => {
    if (!item.telephone) return;

    if (item.telephone_type === 'whatsapp') {
      const nombre = currentAffiliate ? `${currentAffiliate.nombre} ${currentAffiliate.apellido}` : "[Tu Nombre]";
      const message = `Hola, mi nombre es ${nombre} soy afiliado/a de AEFIP Seccional Noroeste y me gustaría hacer uso del convenio establecido`;
      const encodedMsg = encodeURIComponent(message);
      // Remove symbols from phone
      const cleanPhone = item.telephone.replace(/\D/g, '');
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
      window.open(waUrl, '_blank');
    } else {
      window.open(`tel:${item.telephone}`, '_self');
    }
  };

  const handleReportSubmit = async () => {
    if (!reportReason || !currentAffiliate) return;

    setReportLoading(true);
    try {
      const reasonText = reportReason === "Otro inconveniente" ? reportOtherReason : reportReason;
      const description = `REPORTE DE CONVENIO: ${item.title}. Motivo: ${reasonText}.`;
      const { error } = await supabase.from("maintenance_requests").insert({
        user_name: `${currentAffiliate.nombre} ${currentAffiliate.apellido} (Legajo: ${currentAffiliate.legajo})`,
        description: description,
        request_type: "Reporte de Convenio",
        status: "Pendiente",
      });

      if (error) throw error;
      setReportSuccess(true);
      setTimeout(() => {
        setReportDialogOpen(false);
        setReportSuccess(false);
        setReportReason("");
        setReportOtherReason("");
      }, 2000);
    } catch (err) {
      console.error("Error submitting report:", err);
      alert("Error al enviar el reporte. Por favor intenta más tarde.");
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <>
      <Box sx={{ position: "relative", height: 380 }}>
        {item.discount_percentage && (
          <Box
            sx={{
              position: "absolute",
              top: -20,
              right: -20,
              width: 110,
              height: 110,
              background: "#d50000",
              color: "white",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              clipPath: "polygon(50% 0%, 55% 3%, 60% 1%, 65% 5%, 70% 3%, 75% 9%, 80% 8%, 85% 15%, 89% 15%, 93% 23%, 95% 25%, 98% 34%, 98% 38%, 100% 48%, 98% 58%, 98% 62%, 95% 71%, 93% 73%, 89% 81%, 85% 81%, 80% 88%, 75% 87%, 70% 93%, 65% 91%, 60% 95%, 55% 93%, 50% 96%, 45% 93%, 40% 95%, 35% 91%, 30% 93%, 25% 87%, 20% 88%, 15% 81%, 11% 81%, 7% 73%, 5% 71%, 2% 62%, 2% 58%, 0% 48%, 2% 38%, 2% 34%, 5% 25%, 7% 23%, 11% 15%, 15% 15%, 20% 8%, 25% 9%, 30% 3%, 35% 5%, 40% 1%, 45% 3%)",
              boxShadow: "0 15px 35px rgba(213, 0, 0, 0.6)",
              transform: "rotate(12deg)",
              zIndex: 1000,
              animation: "float 3s infinite ease-in-out",
              "@keyframes float": {
                "0%": { transform: "rotate(12deg) translateY(0px) scale(1)" },
                "50%": { transform: "rotate(12deg) translateY(-5px) scale(1.05)" },
                "100%": { transform: "rotate(12deg) translateY(0px) scale(1)" },
              },
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                lineHeight: 1,
                textShadow: "3px 3px 6px rgba(0,0,0,0.4)",
                fontSize: "1.9rem",
                mb: -0.5
              }}
            >
              {item.discount_percentage}%
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 950,
                textTransform: "uppercase",
                fontSize: "0.85rem",
                letterSpacing: 1.5,
                textShadow: "1px 1px 2px rgba(0,0,0,0.3)"
              }}
            >
              OFF
            </Typography>
          </Box>
        )}

        <Paper
          onClick={handleOpen}
          elevation={0}
          sx={{
            height: "100%",
            position: "relative",
            borderRadius: 4,
            overflow: "hidden",
            cursor: "pointer",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            border: "1px solid",
            borderColor: alpha(theme.palette.divider, 0.5),
            transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            "&:hover": {
              transform: "translateY(-12px)",
              boxShadow: `0 30px 60px ${alpha(theme.palette.primary.main, 0.1)}`,
              borderColor: alpha(theme.palette.primary.main, 0.2),
              "& .benefit-overlay": {
                opacity: 1,
                transform: "translateY(0)",
              },
              "& .benefit-img": {
                transform: "scale(1.1)",
              },
            },
          }}
        >
          <Box
            className="benefit-img"
            sx={{
              width: "100%",
              height: "100%",
              backgroundImage: `url(${item.thumbnail})`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              bgcolor: "background.paper",
              p: 4,
              transition: "transform 0.6s ease",
            }}
          />

          <Box
            className="benefit-overlay"
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              height: "50%",
              background: `linear-gradient(to top, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              p: 4,
              opacity: 0,
              transform: "translateY(20px)",
              transition: "all 0.4s ease",
              color: "white",
              textAlign: "center",
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 900, mb: 1.5, lineHeight: 1.2 }}>
              {item.title}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>
              Click para más info
            </Typography>
          </Box>
          <Box
            sx={{
              position: "absolute",
              top: 16,
              left: 16,
              bgcolor: "white",
              color: "primary.main",
              px: 2,
              py: 0.5,
              borderRadius: 1,
              fontWeight: 800,
              fontSize: "0.75rem",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              border: "1px solid",
              borderColor: "divider",
              zIndex: 5,
            }}
          >
            {item.category}
          </Box>
        </Paper>
      </Box>

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: { borderRadius: 1, overflow: "hidden" },
        }}
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 3,
            fontWeight: 900,
            color: "primary.main",
            fontSize: "1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {item.title}
          <IconButton onClick={(e) => { e.stopPropagation(); onEdit(); }} sx={{ color: "primary.main" }}>
            <EditIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          {/* Carousel Section */}
          <Box sx={{ position: "relative", mb: 4 }}>
            <Box
              sx={{
                width: "100%",
                height: 350,
                borderRadius: 4,
                backgroundImage: `url(${gallery[currentImgIndex]})`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                bgcolor: alpha(theme.palette.background.default, 0.5),
                border: "1px solid",
                borderColor: "divider",
                p: 4,
                transition: "background-image 0.5s ease",
              }}
            />
            {gallery.length > 1 && (
              <>
                <IconButton
                  onClick={handlePrevImg}
                  sx={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", bgcolor: "white", "&:hover": { bgcolor: alpha("#fff", 0.9) } }}
                >
                  <ArrowBackIosNewIcon />
                </IconButton>
                <IconButton
                  onClick={handleNextImg}
                  sx={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", bgcolor: "white", "&:hover": { bgcolor: alpha("#fff", 0.9) } }}
                >
                  <ArrowForwardIosIcon />
                </IconButton>

                {/* Thumbnails */}
                <Box sx={{ display: "flex", gap: 1, mt: 1, overflowX: "auto", pb: 1, justifyContent: "center" }}>
                  {gallery.map((img, idx) => (
                    <Box
                      key={idx}
                      onClick={() => setCurrentImgIndex(idx)}
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: 1,
                        border: "2px solid",
                        borderColor: currentImgIndex === idx ? "primary.main" : "transparent",
                        cursor: "pointer",
                        backgroundImage: `url(${img})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        opacity: currentImgIndex === idx ? 1 : 0.6,
                      }}
                    />
                  ))}
                </Box>
              </>
            )}
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ color: "primary.main", fontWeight: 800 }}>
                {item.rubro || "General"}
              </Typography>
              <Typography variant="subtitle1" color="secondary" sx={{ fontWeight: 700 }}>
                {item.category}
              </Typography>
            </Box>

            {item.telephone && (
              <Button
                variant="contained"
                onClick={handleContact}
                startIcon={item.telephone_type === 'whatsapp' ? <WhatsAppIcon /> : <PhoneIcon />}
                sx={{
                  bgcolor: item.telephone_type === 'whatsapp' ? "#25D366" : "primary.main",
                  "&:hover": {
                    bgcolor: item.telephone_type === 'whatsapp' ? "#128C7E" : "primary.dark",
                  },
                  borderRadius: 2,
                  fontWeight: 800,
                  boxShadow: 2
                }}
              >
                {item.telephone_type === 'whatsapp' ? "WhatsApp" : "Llamar"}
              </Button>
            )}
          </Box>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", lineHeight: 1.8, mb: 4, fontSize: "1.1rem" }}
          >
            {item.short_description || "Sin descripción disponible"}
          </Typography>

          {item.discount_description && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 3,
                bgcolor: alpha(theme.palette.success.main, 0.08),
                borderRadius: 1,
                border: "1px solid",
                borderColor: alpha(theme.palette.success.main, 0.2),
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: "success.main", textTransform: "uppercase", letterSpacing: 1 }}>
                Descuento:
              </Typography>
              <Typography variant="body1" sx={{ color: "text.secondary" }}>
                {item.discount_description}
              </Typography>
            </Paper>
          )}

          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              borderRadius: 1,
              border: "1px solid",
              borderColor: alpha(theme.palette.primary.main, 0.1),
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: "primary.main", textTransform: "uppercase", letterSpacing: 1 }}>
              Información de Contacto:
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {item.mail && (
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Email: <Box component="span" sx={{ fontWeight: 400, color: "text.secondary" }}>{item.mail}</Box>
                </Typography>
              )}
              {item.telephone && (
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Teléfono: <Box component="span" sx={{ fontWeight: 400, color: "text.secondary" }}>{item.telephone}</Box>
                </Typography>
              )}
              {item.contact_person && (
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Contacto: <Box component="span" sx={{ fontWeight: 400, color: "text.secondary" }}>{item.contact_person}</Box>
                </Typography>
              )}
              {item.address && (
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Dirección: <Box component="span" sx={{ fontWeight: 400, color: "text.secondary" }}>{item.address}</Box>
                </Typography>
              )}
              {!item.mail && !item.telephone && !item.contact_person && !item.address && (
                <Typography variant="body2" sx={{ fontWeight: 400, color: "text.secondary" }}>
                  Sin información de contacto disponible
                </Typography>
              )}
            </Box>
          </Paper>

          {currentAffiliate && (
            <Box sx={{ mt: 4 }}>
              <Button
                variant="outlined"
                color="error"
                fullWidth
                startIcon={<ReportIcon />}
                onClick={() => setReportDialogOpen(true)}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 800,
                  borderWidth: 2,
                  "&:hover": { borderWidth: 2 },
                }}
              >
                Reportar Problema con este Convenio
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 4, pt: 0 }}>
          <Button
            onClick={handleClose}
            variant="contained"
            fullWidth
            sx={{
              py: 2,
              borderRadius: 1,
              fontWeight: 900,
              fontSize: "1.1rem",
              boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={reportDialogOpen}
        onClose={() => !reportLoading && setReportDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Reportar Convenio</DialogTitle>
        <DialogContent>
          {reportSuccess ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <CheckCircleIcon sx={{ fontSize: 60, color: "success.main", mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Reporte Enviado</Typography>
              <Typography variant="body2" color="text.secondary">
                Gracias por ayudarnos a mejorar. Revisaremos el inconveniente a la brevedad.
              </Typography>
            </Box>
          ) : (
            <>
              <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
                Cuéntanos qué sucede con <strong>{item.title}</strong>:
              </Typography>
              <TextField
                select
                fullWidth
                label="Motivo del reporte"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                disabled={reportLoading}
                sx={{ mb: 3 }}
                InputProps={{ sx: { borderRadius: 2 } }}
              >
                <MenuItem value="El convenio ya no existe">El convenio ya no existe</MenuItem>
                <MenuItem value="El lugar/establecimiento ya no existe">El lugar/establecimiento ya no existe</MenuItem>
                <MenuItem value="Hay que renovar los datos">Hay que renovar los datos</MenuItem>
                <MenuItem value="El % de descuento no corresponde">El % de descuento no corresponde</MenuItem>
                <MenuItem value="La imagen no corresponde">La imagen no corresponde</MenuItem>
                <MenuItem value="Otro inconveniente">Otro inconveniente</MenuItem>
              </TextField>
              {reportReason === "Otro inconveniente" && (
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Detalla el problema"
                  placeholder="Escribe aquí los detalles..."
                  value={reportOtherReason}
                  onChange={(e) => setReportOtherReason(e.target.value)}
                  disabled={reportLoading}
                  sx={{ mb: 2 }}
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
              )}
            </>
          )}
        </DialogContent>
        {!reportSuccess && (
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button
              onClick={() => setReportDialogOpen(false)}
              disabled={reportLoading}
              sx={{ fontWeight: 700, color: "text.secondary" }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="error"
              disabled={!reportReason || reportLoading}
              onClick={handleReportSubmit}
              sx={{ fontWeight: 800, borderRadius: 2, px: 4 }}
            >
              {reportLoading ? <CircularProgress size={24} color="inherit" /> : "Enviar Reporte"}
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </>
  );
}
