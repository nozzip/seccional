import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Stack,
  Chip,
  alpha,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

import FilterListIcon from "@mui/icons-material/FilterList";
import DownloadIcon from "@mui/icons-material/Download";
import SearchIcon from "@mui/icons-material/Search";

interface Transaction {
  id: number;
  date: string;
  type: "Ingreso" | "Egreso";
  category: string;
  amount: number;
  paymentMethod: "Efectivo" | "Transferencia" | "Tarjeta" | "Otro";
  invoice?: string;
  description: string;
}

const initialTransactions: Transaction[] = [
  {
    id: 1,
    date: "2026-02-23",
    type: "Ingreso",
    category: "Venta Bebidas",
    amount: 4500,
    paymentMethod: "Efectivo",
    description: "Coca-cola y Aguas",
  },
  {
    id: 2,
    date: "2026-02-22",
    type: "Ingreso",
    category: "Canchas",
    amount: 12000,
    paymentMethod: "Transferencia",
    description: "Turnos Paddle 18hs/19hs",
  },
  {
    id: 3,
    date: "2026-02-21",
    type: "Egreso",
    category: "Limpieza",
    amount: 3500,
    paymentMethod: "Efectivo",
    invoice: "A001-00045",
    description: "Compra de artículos de limpieza",
  },
  {
    id: 4,
    date: "2026-02-20",
    type: "Ingreso",
    category: "Natación",
    amount: 8500,
    paymentMethod: "Tarjeta",
    description: "Inscripción - Juan Pérez",
  },
];

import CashRegistry from "./CashRegistry";
import InventoryManager from "./InventoryManager";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import InventoryIcon from "@mui/icons-material/Inventory";
import { Tabs, Tab, InputBase, Tooltip } from "@mui/material";

export default function CashFlowManager() {
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(0); // 0: Flow, 1: Registry, 2: Inventory
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    type: "Egreso",
    category: "",
    amount: "",
    paymentMethod: "Efectivo",
    invoice: "",
    description: "",
  });
  const [filters, setFilters] = useState({
    search: "",
    type: "Todos",
    category: "Todas",
  });

  const theme = useTheme();

  const handleRegister = () => {
    if (!formData.category || !formData.amount) return;

    const newTransaction: Transaction = {
      id: Date.now(),
      date: new Date().toISOString().split("T")[0],
      type: formData.type as "Ingreso" | "Egreso",
      category: formData.category,
      amount: parseFloat(formData.amount),
      paymentMethod: formData.paymentMethod as any,
      invoice: formData.invoice,
      description: formData.description,
    };

    setTransactions([newTransaction, ...transactions]);
    setShowSuccess(true);
    setFormData({
      type: "Egreso",
      category: "",
      amount: "",
      paymentMethod: "Efectivo",
      invoice: "",
      description: "",
    });
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setShowSuccess(false);
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.category.toLowerCase().includes(filters.search.toLowerCase()) ||
      t.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchesType = filters.type === "Todos" || t.type === filters.type;
    const matchesCategory =
      filters.category === "Todas" || t.category === filters.category;
    return matchesSearch && matchesType && matchesCategory;
  });

  const categories = ["Todas", ...new Set(transactions.map((t) => t.category))];

  const totalIncomes = filteredTransactions
    .filter((t) => t.type === "Ingreso")
    .reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = filteredTransactions
    .filter((t) => t.type === "Egreso")
    .reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncomes - totalExpenses;

  return (
    <Box>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, color: "primary.main" }}
          >
            Finanzas y Caja •{" "}
            {new Date().toLocaleDateString("es-AR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </Typography>
          <Tabs
            value={view}
            onChange={(_, v) => setView(v)}
            sx={{ minHeight: 40, mt: 1 }}
          >
            <Tab
              icon={<AccountBalanceWalletIcon sx={{ fontSize: 20 }} />}
              label="Flujo de Caja"
              iconPosition="start"
              sx={{ minHeight: 40 }}
            />
            <Tab
              icon={<PointOfSaleIcon sx={{ fontSize: 20 }} />}
              label="Arqueo de Caja"
              iconPosition="start"
              sx={{ minHeight: 40 }}
            />
            <Tab
              icon={<InventoryIcon sx={{ fontSize: 20 }} />}
              label="Inventario de Bebidas"
              iconPosition="start"
              sx={{ minHeight: 40 }}
            />
          </Tabs>
        </Box>
        {view === 0 && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
          >
            Nuevo Movimiento
          </Button>
        )}
      </Box>

      {view === 0 && (
        <>
          {/* Filters Row */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 4,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: alpha(theme.palette.primary.main, 0.02),
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    bgcolor: "background.paper",
                    borderRadius: 2,
                    px: 2,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <SearchIcon color="action" fontSize="small" />
                  <InputBase
                    placeholder="Buscar descripción o categoría..."
                    sx={{ ml: 1, flex: 1, fontSize: "0.9rem", py: 0.5 }}
                    value={filters.search}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                  />
                </Box>
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField
                  select
                  size="small"
                  fullWidth
                  value={filters.type}
                  onChange={(e) =>
                    setFilters({ ...filters, type: e.target.value })
                  }
                  InputProps={{ sx: { borderRadius: 2, fontSize: "0.85rem" } }}
                >
                  <MenuItem value="Todos">Todos los tipos</MenuItem>
                  <MenuItem value="Ingreso">Ingresos</MenuItem>
                  <MenuItem value="Egreso">Egresos</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField
                  select
                  size="small"
                  fullWidth
                  value={filters.category}
                  onChange={(e) =>
                    setFilters({ ...filters, category: e.target.value })
                  }
                  InputProps={{ sx: { borderRadius: 2, fontSize: "0.85rem" } }}
                >
                  {categories.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid
                item
                xs={12}
                md={4}
                sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}
              >
                <Button
                  startIcon={<DownloadIcon />}
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    fontWeight: 700,
                    textTransform: "none",
                  }}
                >
                  Exportar
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Summary Grid */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: alpha(theme.palette.success.main, 0.05),
                  height: "100%",
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <TrendingUpIcon color="success" />
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, color: "success.main" }}
                    >
                      INGRESOS (ESTE DÍA)
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      ${totalIncomes.toLocaleString()}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: alpha(theme.palette.error.main, 0.05),
                  height: "100%",
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <TrendingDownIcon color="error" />
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, color: "error.main" }}
                    >
                      EGRESOS (ESTE DÍA)
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      ${totalExpenses.toLocaleString()}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  height: "100%",
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <AccountBalanceWalletIcon color="primary" />
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, color: "primary.main" }}
                    >
                      BALANCE (ESTE DÍA)
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      ${balance.toLocaleString()}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  height: "100%",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 800,
                    color: "text.secondary",
                    display: "block",
                    mb: 1.5,
                  }}
                >
                  INGRESOS POR MÉTODO (HOY)
                </Typography>
                <Stack spacing={1}>
                  {["Efectivo", "Transferencia", "Tarjeta"].map((method) => {
                    const amount = filteredTransactions
                      .filter(
                        (t) =>
                          t.type === "Ingreso" && t.paymentMethod === method,
                      )
                      .reduce((acc, t) => acc + t.amount, 0);
                    const percentage =
                      totalIncomes > 0 ? (amount / totalIncomes) * 100 : 0;

                    return (
                      <Box key={method}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          sx={{ mb: 0.5 }}
                        >
                          <Typography
                            sx={{ fontSize: "0.75rem", fontWeight: 700 }}
                          >
                            {method}
                          </Typography>
                          <Typography
                            sx={{ fontSize: "0.75rem", fontWeight: 800 }}
                          >
                            ${amount.toLocaleString()}
                          </Typography>
                        </Stack>
                        <Box
                          sx={{
                            height: 4,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            borderRadius: 1,
                            overflow: "hidden",
                          }}
                        >
                          <Box
                            sx={{
                              height: "100%",
                              width: `${percentage}%`,
                              bgcolor: "primary.main",
                              borderRadius: 1,
                            }}
                          />
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
            }}
          >
            <Table>
              <TableHead
                sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}
              >
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Categoría</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Descripción</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Método</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Comprobante</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Importe
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.map((t) => (
                  <TableRow key={t.id} hover>
                    <TableCell sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
                      {t.date}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={t.type}
                        size="small"
                        color={t.type === "Ingreso" ? "success" : "error"}
                        variant="outlined"
                        sx={{ fontWeight: 700, fontSize: "0.7rem" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.85rem",
                          color: "primary.main",
                        }}
                      >
                        {t.category}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.85rem" }}>
                      {t.description}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={t.paymentMethod}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.7rem",
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: "primary.dark",
                          border: "none",
                        }}
                      />
                    </TableCell>
                    <TableCell
                      sx={{ fontSize: "0.85rem", color: "text.secondary" }}
                    >
                      {t.invoice || "-"}
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        sx={{
                          fontWeight: 800,
                          color:
                            t.type === "Ingreso"
                              ? "success.main"
                              : "error.main",
                        }}
                      >
                        {t.type === "Ingreso" ? "+" : "-"}$
                        {t.amount.toLocaleString()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Dialog
            open={open}
            onClose={handleCloseDialog}
            maxWidth="xs"
            fullWidth
            PaperProps={{ sx: { borderRadius: 4 } }}
          >
            <DialogTitle sx={{ fontWeight: 800 }}>
              Nuevo Movimiento de Caja
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      select
                      label="Tipo"
                      fullWidth
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                    >
                      <MenuItem value="Ingreso">Ingreso (+)</MenuItem>
                      <MenuItem value="Egreso">Egreso (-)</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      select
                      label="Método de Pago"
                      fullWidth
                      value={formData.paymentMethod}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paymentMethod: e.target.value,
                        })
                      }
                    >
                      <MenuItem value="Efectivo">Efectivo</MenuItem>
                      <MenuItem value="Transferencia">Transferencia</MenuItem>
                      <MenuItem value="Tarjeta">Tarjeta</MenuItem>
                      <MenuItem value="Otro">Otro</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
                <TextField
                  label="Categoría"
                  fullWidth
                  placeholder="Eje: Insumos, Sueldos, Limpieza..."
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                />
                <TextField
                  label="Importe"
                  fullWidth
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Nro de Factura / Ticket"
                  fullWidth
                  value={formData.invoice}
                  onChange={(e) =>
                    setFormData({ ...formData, invoice: e.target.value })
                  }
                />
                <TextField
                  label="Descripción"
                  fullWidth
                  multiline
                  rows={2}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button onClick={handleCloseDialog} sx={{ fontWeight: 700 }}>
                Cancelar
              </Button>
              <Button
                variant="contained"
                sx={{ px: 4, fontWeight: 700 }}
                onClick={handleRegister}
              >
                Registrar
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
      {view === 1 && <CashRegistry />}
      {view === 2 && <InventoryManager />}

      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          sx={{ width: "100%", borderRadius: 3, fontWeight: 700 }}
        >
          Movimiento registrado exitosamente
        </Alert>
      </Snackbar>
    </Box>
  );
}
