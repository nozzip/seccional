import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Skeleton from "@mui/material/Skeleton";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import HistoryIcon from "@mui/icons-material/History";
import PersonIcon from "@mui/icons-material/Person";
import ClearIcon from "@mui/icons-material/Clear";
import EventNoteIcon from "@mui/icons-material/EventNote";
import { useTheme, alpha } from "@mui/material/styles";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AuditLog {
  id: number;
  admin_name: string;
  action_type: string;
  description: string;
  created_at: string;
  branch: string;
}

type ActionType =
  | "CREAR_AFILIADO"
  | "ACTUALIZAR_AFILIADO"
  | "ELIMINAR_AFILIADO"
  | "IMPORTAR_EXCEL"
  | "CIERRE_CAJA"
  | "ACTUALIZAR_SOLICITUD"
  | "ELIMINAR_SOLICITUD"
  | "CREAR_ORDEN_INTERNA"
  | "AGREGAR_FAMILIAR"
  | "ELIMINAR_FAMILIAR"
  | "UNIFICAR_AFILIADOS"
  | "VACIAR_FAMILIARES";

// ─── Constants ───────────────────────────────────────────────────────────────

const ACTION_TYPES: ActionType[] = [
  "CREAR_AFILIADO",
  "ACTUALIZAR_AFILIADO",
  "ELIMINAR_AFILIADO",
  "IMPORTAR_EXCEL",
  "CIERRE_CAJA",
  "ACTUALIZAR_SOLICITUD",
  "ELIMINAR_SOLICITUD",
  "CREAR_ORDEN_INTERNA",
  "AGREGAR_FAMILIAR",
  "ELIMINAR_FAMILIAR",
  "UNIFICAR_AFILIADOS",
  "VACIAR_FAMILIARES",
];

const ACTION_COLOR_MAP: Record<string, { bg: string; text: string; label: string }> = {
  CREAR_AFILIADO:       { bg: "#16a34a", text: "#fff", label: "Crear Afiliado" },
  ACTUALIZAR_AFILIADO:  { bg: "#2563eb", text: "#fff", label: "Actualizar Afiliado" },
  ELIMINAR_AFILIADO:    { bg: "#dc2626", text: "#fff", label: "Eliminar Afiliado" },
  IMPORTAR_EXCEL:       { bg: "#ea580c", text: "#fff", label: "Importar Excel" },
  CIERRE_CAJA:          { bg: "#7c3aed", text: "#fff", label: "Cierre de Caja" },
  ACTUALIZAR_SOLICITUD: { bg: "#0891b2", text: "#fff", label: "Actualizar Solicitud" },
  ELIMINAR_SOLICITUD:   { bg: "#be123c", text: "#fff", label: "Eliminar Solicitud" },
  CREAR_ORDEN_INTERNA:  { bg: "#059669", text: "#fff", label: "Crear Orden Interna" },
  AGREGAR_FAMILIAR:     { bg: "#4f46e5", text: "#fff", label: "Agregar Familiar" },
  ELIMINAR_FAMILIAR:    { bg: "#e11d48", text: "#fff", label: "Eliminar Familiar" },
  UNIFICAR_AFILIADOS:   { bg: "#d97706", text: "#fff", label: "Unificar Afiliados" },
  VACIAR_FAMILIARES:    { bg: "#9333ea", text: "#fff", label: "Vaciar Familiares" },
};

const PAGE_SIZE = 15;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTimestamp(iso: string): string {
  try {
    const date = new Date(iso);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return iso;
  }
}

function getActionChipColors(actionType: string) {
  return (
    ACTION_COLOR_MAP[actionType] || {
      bg: "#6b7280",
      text: "#fff",
      label: actionType,
    }
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AuditLogsManager() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // State
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [actionFilter, dateFrom, dateTo]);

  // Fetch logs
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from("audit_logs")
        .select("*", { count: "exact" })
        .eq("branch", "noroeste")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (actionFilter) {
        query = query.eq("action_type", actionFilter);
      }

      if (debouncedSearch) {
        query = query.or(
          `admin_name.ilike.%${debouncedSearch}%,description.ilike.%${debouncedSearch}%`
        );
      }

      if (dateFrom) {
        query = query.gte("created_at", `${dateFrom}T00:00:00`);
      }

      if (dateTo) {
        query = query.lte("created_at", `${dateTo}T23:59:59`);
      }

      const { data, count, error } = await query;

      if (error) {
        console.error("Error fetching audit logs:", error);
        setLogs([]);
        setTotalCount(0);
      } else {
        setLogs((data as AuditLog[]) || []);
        setTotalCount(count || 0);
      }
    } catch (err) {
      console.error("Unexpected error fetching audit logs:", err);
      setLogs([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, actionFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handleClearFilters = () => {
    setSearch("");
    setActionFilter("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const hasActiveFilters = search || actionFilter || dateFrom || dateTo;

  // ─── Styles ──────────────────────────────────────────────────────────────

  const paperBg = isDark
    ? alpha(theme.palette.background.paper, 0.7)
    : alpha(theme.palette.background.paper, 0.95);

  const rowHoverBg = isDark
    ? alpha(theme.palette.primary.main, 0.06)
    : alpha(theme.palette.primary.main, 0.03);

  const subtleBorder = isDark
    ? alpha(theme.palette.divider, 0.12)
    : alpha(theme.palette.divider, 0.2);

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto", py: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          mb: 3,
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`,
          }}
        >
          <HistoryIcon sx={{ color: "#fff", fontSize: 24 }} />
        </Box>
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: theme.palette.text.primary,
            }}
          >
            Registro de Auditoría
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: theme.palette.text.secondary, mt: -0.3 }}
          >
            {totalCount > 0
              ? `${totalCount} registros encontrados`
              : "Historial de acciones administrativas"}
          </Typography>
        </Box>
      </Box>

      {/* Filters */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 2.5,
          borderRadius: "16px",
          backgroundColor: paperBg,
          backdropFilter: "blur(12px)",
          border: `1px solid ${subtleBorder}`,
        }}
      >
        <Stack spacing={2}>
          {/* Row 1: Search + Action filter */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por administrador o descripción..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      sx={{ color: theme.palette.text.secondary, fontSize: 20 }}
                    />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearch("")}>
                      <ClearIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  backgroundColor: isDark
                    ? alpha(theme.palette.background.default, 0.5)
                    : alpha(theme.palette.grey[100], 0.7),
                },
              }}
            />
            <TextField
              select
              size="small"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              label="Tipo de acción"
              sx={{
                minWidth: 220,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  backgroundColor: isDark
                    ? alpha(theme.palette.background.default, 0.5)
                    : alpha(theme.palette.grey[100], 0.7),
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterListIcon
                      sx={{ color: theme.palette.text.secondary, fontSize: 20 }}
                    />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="">
                <em>Todas las acciones</em>
              </MenuItem>
              {ACTION_TYPES.map((type) => {
                const colors = getActionChipColors(type);
                return (
                  <MenuItem key={type} value={type}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          backgroundColor: colors.bg,
                        }}
                      />
                      {colors.label}
                    </Box>
                  </MenuItem>
                );
              })}
            </TextField>
          </Stack>

          {/* Row 2: Date filters + Clear */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems="center"
          >
            <TextField
              size="small"
              type="date"
              label="Desde"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{
                minWidth: 170,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  backgroundColor: isDark
                    ? alpha(theme.palette.background.default, 0.5)
                    : alpha(theme.palette.grey[100], 0.7),
                },
              }}
            />
            <TextField
              size="small"
              type="date"
              label="Hasta"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{
                minWidth: 170,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  backgroundColor: isDark
                    ? alpha(theme.palette.background.default, 0.5)
                    : alpha(theme.palette.grey[100], 0.7),
                },
              }}
            />
            {hasActiveFilters && (
              <Tooltip title="Limpiar filtros" arrow>
                <IconButton
                  onClick={handleClearFilters}
                  size="small"
                  sx={{
                    border: `1px solid ${subtleBorder}`,
                    borderRadius: "10px",
                    px: 1.5,
                    color: theme.palette.text.secondary,
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.error.main, 0.08),
                      color: theme.palette.error.main,
                      borderColor: alpha(theme.palette.error.main, 0.3),
                    },
                  }}
                >
                  <ClearIcon sx={{ fontSize: 18, mr: 0.5 }} />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    Limpiar
                  </Typography>
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>
      </Paper>

      {/* Content */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "16px",
          backgroundColor: paperBg,
          backdropFilter: "blur(12px)",
          border: `1px solid ${subtleBorder}`,
          overflow: "hidden",
        }}
      >
        {/* Loading state */}
        {loading && (
          <Box sx={{ p: 2 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  py: 1.5,
                  px: 2,
                  borderBottom:
                    i < 5 ? `1px solid ${subtleBorder}` : "none",
                }}
              >
                <Skeleton variant="circular" width={36} height={36} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="30%" height={22} />
                  <Skeleton variant="text" width="60%" height={18} />
                </Box>
                <Skeleton
                  variant="rounded"
                  width={120}
                  height={26}
                  sx={{ borderRadius: "13px" }}
                />
                <Skeleton variant="text" width={110} height={18} />
              </Box>
            ))}
          </Box>
        )}

        {/* Empty state */}
        {!loading && logs.length === 0 && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 8,
              px: 3,
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: alpha(theme.palette.text.secondary, 0.06),
                mb: 2.5,
              }}
            >
              <EventNoteIcon
                sx={{
                  fontSize: 36,
                  color: alpha(theme.palette.text.secondary, 0.4),
                }}
              />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.secondary,
                mb: 0.5,
              }}
            >
              Sin registros
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: alpha(theme.palette.text.secondary, 0.7) }}
            >
              {hasActiveFilters
                ? "No se encontraron registros con los filtros aplicados."
                : "Aún no hay registros de auditoría disponibles."}
            </Typography>
          </Box>
        )}

        {/* Log list */}
        {!loading && logs.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              key={`page-${page}-${debouncedSearch}-${actionFilter}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {logs.map((log, index) => {
                const chipColors = getActionChipColors(log.action_type);
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.25,
                      delay: index * 0.03,
                      ease: "easeOut",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 2,
                        py: 1.8,
                        px: 2.5,
                        borderBottom:
                          index < logs.length - 1
                            ? `1px solid ${subtleBorder}`
                            : "none",
                        transition: "background-color 0.15s ease",
                        "&:hover": {
                          backgroundColor: rowHoverBg,
                        },
                      }}
                    >
                      {/* Avatar */}
                      <Box
                        sx={{
                          width: 38,
                          height: 38,
                          borderRadius: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: alpha(chipColors.bg, 0.12),
                          flexShrink: 0,
                          mt: 0.3,
                        }}
                      >
                        <PersonIcon
                          sx={{
                            fontSize: 20,
                            color: chipColors.bg,
                          }}
                        />
                      </Box>

                      {/* Content */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 0.4,
                            flexWrap: "wrap",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 650,
                              color: theme.palette.text.primary,
                              lineHeight: 1.3,
                            }}
                          >
                            {log.admin_name}
                          </Typography>
                          <Chip
                            label={chipColors.label}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              letterSpacing: "0.03em",
                              backgroundColor: chipColors.bg,
                              color: chipColors.text,
                              borderRadius: "6px",
                              "& .MuiChip-label": {
                                px: 1,
                              },
                            }}
                          />
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color: theme.palette.text.secondary,
                            lineHeight: 1.5,
                            wordBreak: "break-word",
                          }}
                        >
                          {log.description}
                        </Typography>
                      </Box>

                      {/* Timestamp */}
                      <Typography
                        variant="caption"
                        sx={{
                          color: alpha(theme.palette.text.secondary, 0.65),
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                          mt: 0.5,
                          fontWeight: 500,
                          fontSize: "0.72rem",
                        }}
                      >
                        {formatTimestamp(log.created_at)}
                      </Typography>
                    </Box>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </Paper>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 2.5,
          }}
        >
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_e, value) => setPage(value)}
            color="primary"
            shape="rounded"
            sx={{
              "& .MuiPaginationItem-root": {
                borderRadius: "10px",
                fontWeight: 600,
                "&.Mui-selected": {
                  boxShadow: `0 2px 8px ${alpha(
                    theme.palette.primary.main,
                    0.3
                  )}`,
                },
              },
            }}
          />
        </Box>
      )}

      {/* Footer count */}
      {!loading && logs.length > 0 && (
        <Typography
          variant="caption"
          sx={{
            display: "block",
            textAlign: "center",
            mt: 1.5,
            color: alpha(theme.palette.text.secondary, 0.5),
            fontWeight: 500,
          }}
        >
          Mostrando {(page - 1) * PAGE_SIZE + 1}–
          {Math.min(page * PAGE_SIZE, totalCount)} de {totalCount} registros
        </Typography>
      )}
    </Box>
  );
}
