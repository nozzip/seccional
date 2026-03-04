import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  alpha,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stack,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Tooltip,
  Tabs,
  Tab,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BuildIcon from "@mui/icons-material/Build";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreIcon from "@mui/icons-material/Restore";
import ArchiveIcon from "@mui/icons-material/Archive";
import UnarchiveIcon from "@mui/icons-material/Unarchive";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { supabase } from "../../supabaseClient";

interface MaintenanceRequest {
  id: string;
  created_at: string;
  user_name: string;
  description: string;
  request_type: string;
  amount: number | null;
  status: "Pendiente" | "Aprobado" | "Completado" | "Rechazado";
  notes: string | null;
  archived_at: string | null;
}

const COLUMN_COLORS = {
  Pendiente: "#f59e0b", // Amber
  Aprobado: "#3b82f6", // Blue
  Completado: "#10b981", // Emerald
  Rechazado: "#ef4444", // Red
};

export default function OrderManagement() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [activeView, setActiveView] = useState(0); // 0: Dashboard, 1: Archivo
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const [formData, setFormData] = useState({
    user_name: "",
    description: "",
    request_type: "Reparación",
    amount: "",
  });

  const fetchData = async () => {
    try {
      const { data: reqs, error: reqError } = await supabase
        .from("maintenance_requests")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (!reqError && reqs) setRequests(reqs);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("maintenance_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "maintenance_requests" },
        fetchData,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleCreate = async () => {
    setLoading(true);
    const { error } = await supabase.from("maintenance_requests").insert({
      user_name: formData.user_name,
      description: formData.description,
      request_type: formData.request_type,
      amount: formData.amount ? parseFloat(formData.amount) : null,
      status: "Pendiente",
    });

    if (!error) {
      setOpenDialog(false);
      setFormData({
        user_name: "",
        description: "",
        request_type: "Reparación",
        amount: "",
      });
      fetchData();
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("maintenance_requests")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) fetchData();
  };

  const handleArchive = async (id: string, archive: boolean) => {
    const { error } = await supabase
      .from("maintenance_requests")
      .update({ archived_at: archive ? new Date().toISOString() : null })
      .eq("id", id);

    if (!error) fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar este pedido?")) return;

    const { error } = await supabase
      .from("maintenance_requests")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) fetchData();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "Reparación":
        return <BuildIcon fontSize="small" />;
      case "Compra":
        return <ShoppingCartIcon fontSize="small" />;
      default:
        return <AssignmentIcon fontSize="small" />;
    }
  };

  const calculateTotal = (status: string, includeArchived: boolean = false) => {
    return requests
      .filter(
        (r) =>
          r.status === status &&
          (includeArchived ? !!r.archived_at : !r.archived_at),
      )
      .reduce((sum, r) => sum + (r.amount || 0), 0);
  };

  const RequestCard = ({ req }: { req: MaintenanceRequest }) => (
    <Card
      elevation={0}
      sx={{
        mb: 2,
        borderRadius: 4,
        border: "1px solid",
        borderColor: alpha(theme.palette.divider, 0.5),
        bgcolor: "background.paper",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 24px rgba(0,0,0,0.06)",
          borderColor: alpha(COLUMN_COLORS[req.status], 0.4),
        },
      }}
    >
      <CardContent sx={{ pb: 1, pt: activeView === 1 ? 1.5 : 2.5 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 2,
            alignItems: "center",
          }}
        >
          <Chip
            label={req.request_type.toUpperCase()}
            size="small"
            icon={getIcon(req.request_type)}
            sx={{
              fontWeight: 900,
              fontSize: "0.6rem",
              height: 22,
              bgcolor: alpha(COLUMN_COLORS[req.status], 0.1),
              color: COLUMN_COLORS[req.status],
              letterSpacing: 0.5,
            }}
          />
          <Stack direction="row" spacing={0.5}>
            {!req.archived_at &&
              (req.status === "Completado" || req.status === "Rechazado") && (
                <Tooltip title="Archivar">
                  <IconButton
                    size="small"
                    onClick={() => handleArchive(req.id, true)}
                    sx={{
                      opacity: 0.5,
                      "&:hover": { opacity: 1, color: "primary.main" },
                    }}
                  >
                    <ArchiveIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              )}
            {req.archived_at && (
              <Tooltip title="Desarchivar">
                <IconButton
                  size="small"
                  onClick={() => handleArchive(req.id, false)}
                  sx={{
                    opacity: 0.5,
                    "&:hover": { opacity: 1, color: "primary.main" },
                  }}
                >
                  <UnarchiveIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Eliminar">
              <IconButton
                size="small"
                onClick={() => handleDelete(req.id)}
                sx={{
                  opacity: 0.2,
                  "&:hover": { opacity: 1, color: "error.main" },
                }}
              >
                <DeleteIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 800,
            mb: 0.5,
            lineHeight: 1.3,
            color: "text.primary",
          }}
        >
          {req.description}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mb: 2,
            color: "text.secondary",
            fontWeight: 600,
          }}
        >
          Solicitó:{" "}
          <Box component="span" sx={{ color: "primary.main" }}>
            {req.user_name}
          </Box>{" "}
          • {new Date(req.created_at).toLocaleDateString()}
        </Typography>
        {req.amount && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mt: 1.5,
              p: 1,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.03),
              border: "1px dashed",
              borderColor: alpha(theme.palette.primary.main, 0.1),
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                color: "text.secondary",
                fontSize: "0.6rem",
              }}
            >
              PRESUPUESTO:
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 900, color: "primary.main" }}
            >
              ${req.amount.toLocaleString()}
            </Typography>
          </Box>
        )}
      </CardContent>
      {!req.archived_at && (
        <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 2, pt: 0 }}>
          {req.status === "Pendiente" && (
            <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
              <Button
                fullWidth
                size="small"
                variant="outlined"
                color="error"
                onClick={() => updateStatus(req.id, "Rechazado")}
                sx={{ fontWeight: 800, fontSize: "0.7rem", borderRadius: 2 }}
              >
                Rechazar
              </Button>
              <Button
                fullWidth
                variant="contained"
                size="small"
                color="primary"
                startIcon={<CheckCircleIcon />}
                onClick={() => updateStatus(req.id, "Aprobado")}
                sx={{
                  borderRadius: 2,
                  fontWeight: 900,
                  fontSize: "0.7rem",
                  boxShadow: "none",
                }}
              >
                Aprobar
              </Button>
            </Stack>
          )}
          {req.status === "Aprobado" && (
            <Button
              fullWidth
              variant="contained"
              size="small"
              color="success"
              startIcon={<PlayArrowIcon />}
              onClick={() => updateStatus(req.id, "Completado")}
              sx={{
                borderRadius: 3,
                fontWeight: 900,
                fontSize: "0.75rem",
                py: 1,
                boxShadow: "none",
              }}
            >
              Finalizar Tarea
            </Button>
          )}
          {(req.status === "Rechazado" || req.status === "Completado") && (
            <Button
              fullWidth
              variant="outlined"
              size="small"
              startIcon={<RestoreIcon />}
              onClick={() => updateStatus(req.id, "Pendiente")}
              sx={{
                fontWeight: 800,
                fontSize: "0.7rem",
                borderRadius: 2,
                borderColor: alpha(theme.palette.divider, 0.5),
              }}
            >
              Reabrir
            </Button>
          )}
        </CardActions>
      )}
    </Card>
  );

  const Column = ({ title, status }: { title: string; status: string }) => {
    const totalAmount = calculateTotal(status);
    return (
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              bgcolor: alpha(
                COLUMN_COLORS[status as keyof typeof COLUMN_COLORS],
                0.03,
              ),
              borderRadius: 5,
              border: "1px solid",
              borderColor: alpha(
                COLUMN_COLORS[status as keyof typeof COLUMN_COLORS],
                0.08,
              ),
              flexGrow: 1,
              transition: "background 0.3s",
            }}
          >
            <Box sx={{ mb: 3.5, px: 0.5 }}>
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor:
                      COLUMN_COLORS[status as keyof typeof COLUMN_COLORS],
                    boxShadow: `0 0 10px ${alpha(COLUMN_COLORS[status as keyof typeof COLUMN_COLORS], 0.5)}`,
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 900,
                    textTransform: "uppercase",
                    fontSize: "0.8rem",
                    letterSpacing: 1.2,
                    color: "text.primary",
                  }}
                >
                  {title}
                </Typography>
              </Stack>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 900,
                    color: COLUMN_COLORS[status as keyof typeof COLUMN_COLORS],
                  }}
                >
                  ${totalAmount.toLocaleString()}
                </Typography>
                <Chip
                  label={
                    requests.filter(
                      (r) => r.status === status && !r.archived_at,
                    ).length
                  }
                  size="small"
                  sx={{
                    fontWeight: 900,
                    fontSize: "0.7rem",
                    bgcolor: "background.paper",
                    color: "text.secondary",
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ mt: 1 }}>
              {requests
                .filter((r) => r.status === status && !r.archived_at)
                .map((req) => (
                  <RequestCard key={req.id} req={req} />
                ))}
            </Box>
          </Paper>
        </Box>
      </Grid>
    );
  };

  return (
    <Box sx={{ pb: 4 }}>
      <Box
        sx={{
          mb: 6,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: 3,
        }}
      >
        <Box>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              color: "text.primary",
              mb: 1,
              letterSpacing: -1,
              fontSize: { xs: "2rem", md: "3rem" },
            }}
          >
            Gestión de Pedidos
          </Typography>
          <Tabs
            value={activeView}
            onChange={(_, v) => setActiveView(v)}
            sx={{
              minHeight: 0,
              "& .MuiTab-root": {
                py: 1,
                minHeight: 0,
                fontWeight: 800,
                fontSize: "0.85rem",
                borderRadius: 2,
                mr: 1,
              },
            }}
          >
            <Tab
              icon={<DashboardIcon sx={{ fontSize: 18 }} />}
              label="Tablero"
              iconPosition="start"
            />
            <Tab
              icon={<ArchiveIcon sx={{ fontSize: 18 }} />}
              label="Archivo"
              iconPosition="start"
            />
          </Tabs>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{
            borderRadius: 4,
            px: 5,
            py: 2,
            fontWeight: 900,
            boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.25)}`,
          }}
        >
          NUEVO PEDIDO
        </Button>
      </Box>

      {activeView === 0 ? (
        <Grid container spacing={3} sx={{ alignItems: "stretch" }}>
          <Column title="Pendientes" status="Pendiente" />
          <Column title="Aprobados" status="Aprobado" />
          <Column title="Finalizados" status="Completado" />
          <Column title="Rechazados" status="Rechazado" />
        </Grid>
      ) : (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Paper
              sx={{
                p: 4,
                borderRadius: 5,
                bgcolor: alpha(theme.palette.divider, 0.02),
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 4 }}>
                Pedidos Archivados
              </Typography>
              <Grid container spacing={2}>
                {requests.filter((r) => !!r.archived_at).length === 0 ? (
                  <Grid size={{ xs: 12 }}>
                    <Typography
                      color="text.secondary"
                      align="center"
                      sx={{ py: 10, fontWeight: 600 }}
                    >
                      No hay pedidos archivados.
                    </Typography>
                  </Grid>
                ) : (
                  requests
                    .filter((r) => !!r.archived_at)
                    .map((req) => (
                      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={req.id}>
                        <RequestCard req={req} />
                      </Grid>
                    ))
                )}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 6, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, pt: 4, px: 4, fontSize: "1.5rem" }}>
          Crear Nuevo Pedido
        </DialogTitle>
        <DialogContent sx={{ px: 4 }}>
          <Stack spacing={4} sx={{ mt: 1 }}>
            <TextField
              label="¿Quién solicita?"
              placeholder="Ej: Encargado de Canchas"
              fullWidth
              value={formData.user_name}
              onChange={(e) =>
                setFormData({ ...formData, user_name: e.target.value })
              }
              InputProps={{ sx: { borderRadius: 3, fontWeight: 600 } }}
            />
            <TextField
              label="Descripción del Pedido"
              multiline
              rows={4}
              fullWidth
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              InputProps={{ sx: { borderRadius: 3, fontWeight: 600 } }}
            />
            <Grid container spacing={3}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  select
                  label="Categoría"
                  fullWidth
                  value={formData.request_type}
                  onChange={(e) =>
                    setFormData({ ...formData, request_type: e.target.value })
                  }
                  InputProps={{ sx: { borderRadius: 3, fontWeight: 600 } }}
                >
                  <MenuItem value="Reparación">🔧 Reparación</MenuItem>
                  <MenuItem value="Compra">🛒 Compra</MenuItem>
                  <MenuItem value="Suministros">📦 Suministros</MenuItem>
                  <MenuItem value="Otro">📝 Otro</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Presupuesto $"
                  type="number"
                  fullWidth
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  InputProps={{ sx: { borderRadius: 3, fontWeight: 800 } }}
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 4, pt: 2 }}>
          <Button
            onClick={() => setOpenDialog(false)}
            sx={{ fontWeight: 800, color: "text.secondary" }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            disabled={!formData.user_name || !formData.description || loading}
            onClick={handleCreate}
            sx={{
              fontWeight: 900,
              px: 5,
              py: 1.5,
              borderRadius: 3,
              boxShadow: "none",
            }}
          >
            CREAR
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
