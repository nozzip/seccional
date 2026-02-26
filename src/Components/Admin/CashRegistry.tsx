import React, { useState, useEffect } from "react";
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
  Divider,
  InputAdornment,
  Alert,
  Snackbar,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import HistoryIcon from "@mui/icons-material/History";
import LiquorIcon from "@mui/icons-material/Liquor";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HandshakeIcon from "@mui/icons-material/Handshake";
import ArchiveIcon from "@mui/icons-material/Archive";
import ErrorIcon from "@mui/icons-material/Error";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import PeopleIcon from "@mui/icons-material/People";

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  initialStock: number;
  entries: number;
  exits: number;
}

type ShiftStatus = "No Iniciado" | "Abierta" | "Cerrada";

interface Shift {
  id: number;
  name: string;
  timeLabel: string;
  responsible: string;
  openingCash: number;
  systemIncome: number;
  systemExpense: number;
  realCash: number | null;
  difference: number | null;
  status: ShiftStatus;
  notes?: string;
  openedAt?: number;
  closedAt?: number;
  startingStock?: { name: string; quantity: number }[];
  stockSnapshot?: { name: string; quantity: number }[];
}

interface ArchivedDay {
  date: string;
  shifts: Shift[];
  totalBalance: number;
  movements?: { [key: string]: { income: number; expense: number } };
}

interface CashRegistryProps {
  transactions: any[];
  inventoryItems: InventoryItem[];
  onUpdateInventory?: (newItems: InventoryItem[]) => void;
  archivedDays: ArchivedDay[];
  onArchiveDay: (day: ArchivedDay) => void;
  staffRoster: { [key: string]: { morning: string; afternoon: string } };
  onOpenRoster: () => void;
}

export default function CashRegistry({
  transactions,
  inventoryItems,
  onUpdateInventory,
  archivedDays,
  onArchiveDay,
  staffRoster,
  onOpenRoster,
}: CashRegistryProps) {
  const theme = useTheme();

  // Helper to get today's day in Spanish
  const getTodaySpanish = () => {
    const days = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    return days[new Date().getDay()];
  };

  const todayName = getTodaySpanish();
  const todayStaff = staffRoster[todayName] || staffRoster["Lunes"];

  // States for Day Management
  const [dayArchived, setDayArchived] = useState(false);
  const [shifts, setShifts] = useState<Shift[]>(() => {
    let initialCash = 0;
    if (archivedDays && archivedDays.length > 0) {
      const lastDay = archivedDays[archivedDays.length - 1];
      if (lastDay.shifts && lastDay.shifts.length > 0) {
        initialCash = lastDay.shifts[lastDay.shifts.length - 1].realCash || 0;
      }
    }

    return [
      {
        id: 1,
        name: "Turno Mañana",
        timeLabel: "08:00 a 16:00",
        responsible: todayStaff.morning,
        openingCash: initialCash,
        systemIncome: 0,
        systemExpense: 0,
        realCash: null,
        difference: null,
        status: "Abierta",
        openedAt: new Date().setHours(0, 0, 0, 0),
        startingStock: inventoryItems.map((item) => ({
          name: item.name,
          quantity: item.initialStock,
        })),
      },
      {
        id: 2,
        name: "Turno Tarde",
        timeLabel: "16:00 a 24:00",
        responsible: todayStaff.afternoon,
        openingCash: 0,
        systemIncome: 0,
        systemExpense: 0,
        realCash: null,
        difference: null,
        status: "No Iniciado",
        startingStock: [],
      },
    ];
  });

  // States for Form Inputs
  const [realCashInput, setRealCashInput] = useState<string>("");
  const [notesInput, setNotesInput] = useState<string>("");
  const [stockVerification, setStockVerification] = useState<{
    [key: string]: number;
  }>({});

  // History / Archive State (Removed local, now from props)
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // UI States
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const activeShiftIndex = shifts.findIndex((s) => s.status === "Abierta");
  const activeShift = activeShiftIndex !== -1 ? shifts[activeShiftIndex] : null;

  // Calculos de volumenes para el turno activo
  // Idealmente filtrariamos por timestamp del turno, por ahora filtramos por el día de hoy
  const today = new Date().toISOString().split("T")[0];
  const currentIncome = transactions
    .filter(
      (t) =>
        t.date === today &&
        t.type === "Ingreso" &&
        t.paymentMethod === "Efectivo" &&
        (!activeShift?.openedAt || t.id >= activeShift.openedAt) &&
        (!activeShift?.closedAt || t.id < activeShift.closedAt),
    )
    .reduce((sum, t) => sum + t.amount, 0);
  const currentExpense = transactions
    .filter(
      (t) =>
        t.date === today &&
        t.type === "Egreso" &&
        t.paymentMethod === "Efectivo" &&
        (!activeShift?.openedAt || t.id >= activeShift.openedAt) &&
        (!activeShift?.closedAt || t.id < activeShift.closedAt),
    )
    .reduce((sum, t) => sum + t.amount, 0);

  const currentSystemBalance = activeShift
    ? activeShift.openingCash + currentIncome - currentExpense
    : 0;

  const currentEnteredCash = parseFloat(realCashInput) || 0;
  const currentDifference =
    realCashInput === "" ? null : currentEnteredCash - currentSystemBalance;

  // Resumen de cuentas movidas hoy (solo efectivo para el arqueo)
  const movementsByAccount = transactions
    .filter((t) => t.date === today && t.paymentMethod === "Efectivo")
    .reduce(
      (acc: { [key: string]: { income: number; expense: number } }, t) => {
        if (!acc[t.category]) {
          acc[t.category] = { income: 0, expense: 0 };
        }
        if (t.type === "Ingreso") acc[t.category].income += t.amount;
        else acc[t.category].expense += t.amount;
        return acc;
      },
      {},
    );

  const accountEntries = Object.entries(movementsByAccount);

  const stockMismatches = inventoryItems.filter((item) => {
    const real = stockVerification[item.name];
    if (real === undefined || isNaN(real)) return false;
    const systemFinal = item.initialStock + item.entries - item.exits;
    return real !== systemFinal;
  });

  const hasStockMismatch = stockMismatches.length > 0;

  const isShift1Open = shifts[0].status === "Abierta";
  const isHandover =
    shifts[0].status === "Cerrada" && shifts[1].status === "No Iniciado";
  const isShift2Open = shifts[1].status === "Abierta";
  const isReadyToArchive =
    shifts[0].status === "Cerrada" &&
    shifts[1].status === "Cerrada" &&
    !dayArchived;

  const handleAction = () => {
    const newShifts = [...shifts];

    if (isShift1Open || isShift2Open) {
      const idx = isShift1Open ? 0 : 1;
      if (realCashInput === "") return;

      // Close Shift
      newShifts[idx].realCash = currentEnteredCash;
      newShifts[idx].difference = currentDifference;
      newShifts[idx].status = "Cerrada";
      newShifts[idx].notes = notesInput;
      newShifts[idx].systemIncome = currentIncome;
      newShifts[idx].systemExpense = currentExpense;
      newShifts[idx].closedAt = Date.now();

      // Capture stock snapshot (Prioritize REAL count if entered)
      newShifts[idx].stockSnapshot = inventoryItems.map((item) => {
        const realCount = stockVerification[item.name];
        const systemFinal = item.initialStock + item.entries - item.exits;
        return {
          name: item.name,
          quantity:
            typeof realCount === "number" && !isNaN(realCount)
              ? realCount
              : systemFinal,
        };
      });

      setSuccessMessage(`${newShifts[idx].name} cerrado exitosamente.`);
      setRealCashInput("");
      setNotesInput("");
    } else if (isHandover) {
      // Handover - Pass cash and stock from prev to next
      newShifts[1].openingCash = newShifts[0].realCash || 0;
      newShifts[1].status = "Abierta";
      newShifts[1].openedAt = newShifts[0].closedAt; // Continuity
      newShifts[1].startingStock = [...(newShifts[0].stockSnapshot || [])];

      // Update Parent Inventory
      if (onUpdateInventory) {
        const updatedItems = inventoryItems.map((item) => {
          const snapshot = newShifts[0].stockSnapshot?.find(
            (s) => s.name === item.name,
          );
          return {
            ...item,
            initialStock: snapshot ? snapshot.quantity : item.initialStock,
            entries: 0,
            exits: 0,
          };
        });
        onUpdateInventory(updatedItems);
      }

      setSuccessMessage(
        `Turno Tarde iniciado. Saldo y Stock recibidos correctamente.`,
      );
    } else if (isReadyToArchive) {
      const newArchive: ArchivedDay = {
        date: new Date().toISOString().split("T")[0],
        shifts: [...newShifts],
        totalBalance: newShifts[1].realCash || 0,
        movements: { ...movementsByAccount },
      };
      onArchiveDay(newArchive);
      setDayArchived(true);
      setSuccessMessage("Jornada archivada. Historización completa.");
    }

    setShifts(newShifts);
    setShowSuccess(true);
  };

  const filteredArchivedDays = archivedDays.filter((day) => {
    if (startDate && day.date < startDate) return false;
    if (endDate && day.date > endDate) return false;
    return true;
  });

  const getActiveStep = () => {
    if (dayArchived) return 4;
    if (isReadyToArchive) return 3;
    if (isShift2Open) return 2;
    if (isHandover) return 1;
    return 0;
  };

  const renderStockTable = (shift: Shift) => {
    return (
      <TableContainer component={Paper} variant="outlined" sx={{ my: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Producto</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                Inicial
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                Final (Sis)
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                Real
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventoryItems.map((item) => {
              const startQty =
                shift.startingStock?.find((s) => s.name === item.name)
                  ?.quantity || 0;
              const systemFinal = item.initialStock + item.entries - item.exits;
              const realCount = stockVerification[item.name];
              const isMismatch =
                typeof realCount === "number" &&
                !isNaN(realCount) &&
                realCount !== systemFinal;

              return (
                <TableRow
                  key={item.name}
                  sx={{
                    bgcolor: isMismatch
                      ? alpha(theme.palette.warning.main, 0.05)
                      : "transparent",
                  }}
                >
                  <TableCell variant="body">{item.name}</TableCell>
                  <TableCell align="center">{startQty}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    {systemFinal}
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      size="small"
                      type="number"
                      error={isMismatch}
                      sx={{ width: 60 }}
                      value={
                        stockVerification[item.name] === undefined
                          ? ""
                          : stockVerification[item.name]
                      }
                      onChange={(e) =>
                        setStockVerification({
                          ...stockVerification,
                          [item.name]:
                            e.target.value === ""
                              ? (undefined as any)
                              : parseInt(e.target.value),
                        })
                      }
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box sx={{ p: 1 }}>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: "primary.main",
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <LocalAtmIcon fontSize="large" /> Arqueo y Relevo de Turno
            <Chip
              label={
                activeShift
                  ? `TURNO ACTUAL: ${activeShift.name}`
                  : dayArchived
                    ? "JORNADA FINALIZADA"
                    : "CAJA CERRADA"
              }
              color={
                activeShift ? "primary" : dayArchived ? "success" : "default"
              }
              variant="filled"
              sx={{ ml: { xs: 0, sm: 2 }, fontWeight: 800 }}
            />
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Cierre de jornada, transferencia de stock y conciliación de
            efectivo.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<PeopleIcon />}
          onClick={onOpenRoster}
          sx={{ fontWeight: 700, borderRadius: 2 }}
        >
          Configuración de Personal
        </Button>
      </Box>

      {/* Stepper Status */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stepper activeStep={getActiveStep()} alternativeLabel>
          <Step>
            <StepLabel>Turno Mañana</StepLabel>
          </Step>
          <Step>
            <StepLabel>Relevo / Traspaso</StepLabel>
          </Step>
          <Step>
            <StepLabel>Turno Tarde</StepLabel>
          </Step>
          <Step>
            <StepLabel>Cierre del Día</StepLabel>
          </Step>
        </Stepper>
      </Paper>

      <Grid container spacing={4}>
        {/* Main Action Area */}
        <Grid item xs={12} lg={5}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 4,
              border: "2px solid",
              borderColor: isHandover
                ? "warning.main"
                : isReadyToArchive
                  ? "info.main"
                  : dayArchived
                    ? "success.main"
                    : "primary.main",
              bgcolor: isHandover
                ? alpha(theme.palette.warning.main, 0.02)
                : "background.paper",
            }}
          >
            {dayArchived ? (
              <Stack spacing={2} alignItems="center" textAlign="center">
                <CheckCircleIcon color="success" sx={{ fontSize: 60 }} />
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Jornada Finalizada
                </Typography>
                <Alert severity="success">
                  Los saldos y el stock final se guardaron correctamente.
                </Alert>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => window.location.reload()}
                  sx={{ mt: 2 }}
                >
                  Nuevo Día Contable
                </Button>
              </Stack>
            ) : isHandover ? (
              <Stack spacing={3}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Relevo de Turno
                </Typography>
                <Alert severity="warning">
                  Turno Tarde: Verifique que el efectivo y el stock coinciden
                  con lo declarado por la mañana.
                </Alert>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    EFECTIVO A RECIBIR
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 900, color: "warning.main" }}
                  >
                    ${shifts[0].realCash?.toLocaleString()}
                  </Typography>
                </Box>
                <Divider />
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  Stock Entregado
                </Typography>
                <Table size="small">
                  <TableBody>
                    {shifts[0].stockSnapshot?.map((s) => (
                      <TableRow key={s.name}>
                        <TableCell>{s.name}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                          {s.quantity} u.
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button
                  variant="contained"
                  color="warning"
                  size="large"
                  fullWidth
                  sx={{ py: 2, fontWeight: 900, borderRadius: 2 }}
                  startIcon={<HandshakeIcon />}
                  onClick={handleAction}
                >
                  ACEPTAR Y ABRIR TURNO
                </Button>
              </Stack>
            ) : isReadyToArchive ? (
              <Stack spacing={3}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Cierre de Jornada
                </Typography>
                <Alert severity="info">
                  Ambos turnos cerrados. Efectivo final en caja:{" "}
                  <strong>${shifts[1].realCash?.toLocaleString()}</strong>
                </Alert>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{ py: 2, fontWeight: 900 }}
                  startIcon={<ArchiveIcon />}
                  onClick={handleAction}
                >
                  ARCHIVAR DÍA Y RETIRAR
                </Button>
              </Stack>
            ) : (
              <Stack spacing={3}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    borderBottom: "2px solid",
                    borderColor: "primary.main",
                    pb: 1,
                  }}
                >
                  Arqueo: {activeShift?.name}
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      INICIO TURNO
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      ${activeShift?.openingCash.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      NETO SISTEMA
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 800, color: "primary.main" }}
                    >
                      ${currentSystemBalance.toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>

                <TextField
                  label="Efectivo Físico en Caja"
                  fullWidth
                  variant="filled"
                  type="number"
                  value={realCashInput}
                  onChange={(e) => setRealCashInput(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                    sx: { fontSize: "1.3rem", fontWeight: 900 },
                  }}
                />

                <Typography variant="subtitle2" sx={{ fontWeight: 800, mt: 2 }}>
                  Verificación de Stock Físico
                </Typography>
                {activeShift && renderStockTable(activeShift)}

                {hasStockMismatch && (
                  <Alert severity="warning" sx={{ fontWeight: 700 }}>
                    Inconsistencia detectada en stock. Se recomienda dejar una
                    nota aclaratoria sobre la diferencia.
                  </Alert>
                )}

                <TextField
                  label="Notas / Observaciones"
                  multiline
                  rows={2}
                  fullWidth
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Detalles sobre billetes, roturas, etc."
                />

                {currentDifference !== null && (
                  <Alert
                    severity={currentDifference >= 0 ? "success" : "error"}
                    sx={{ fontWeight: 700 }}
                  >
                    Diferencia: ${currentDifference.toLocaleString()}
                    {currentDifference === 0
                      ? " (Caja terminada con éxito)"
                      : currentDifference > 0
                        ? " (Sobrante en caja)"
                        : " (Faltante: revisar movimientos)"}
                  </Alert>
                )}

                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{ py: 2, fontWeight: 900, borderRadius: 2 }}
                  onClick={handleAction}
                  disabled={!realCashInput}
                >
                  REGISTRAR CIERRE
                </Button>
              </Stack>
            )}
          </Paper>
        </Grid>

        {/* Current Day Status List */}
        <Grid item xs={12} lg={7}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
            Progreso de los Turnos
          </Typography>
          <Stack spacing={2}>
            {shifts.map((s, idx) => (
              <Paper
                key={idx}
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor:
                    s.status === "Abierta" ? "primary.main" : "divider",
                  bgcolor:
                    s.status === "Cerrada"
                      ? alpha(theme.palette.success.main, 0.03)
                      : "background.paper",
                  opacity: s.status === "No Iniciado" ? 0.6 : 1,
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <Typography sx={{ fontWeight: 800 }}>{s.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {s.timeLabel} • Resp: {s.responsible}
                    </Typography>
                  </Grid>
                  <Grid item xs={4} sm={2} textAlign="center">
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      INICIO
                    </Typography>
                    <Typography sx={{ fontWeight: 700 }}>
                      ${s.openingCash.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={4} sm={2} textAlign="center">
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      REAL
                    </Typography>
                    <Typography sx={{ fontWeight: 700 }}>
                      {s.realCash !== null
                        ? `$${s.realCash.toLocaleString()}`
                        : "—"}
                    </Typography>
                  </Grid>
                  <Grid item xs={4} sm={2} textAlign="center">
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      DIFERENCIA
                    </Typography>
                    {s.difference !== null ? (
                      <Typography
                        sx={{
                          fontWeight: 800,
                          color:
                            s.difference >= 0 ? "success.main" : "error.main",
                        }}
                      >
                        {s.difference === 0 ? "OK" : `${s.difference > 0 ? "+" : ""}$${s.difference}`}
                      </Typography>
                    ) : (
                      "—"
                    )}
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Chip
                      label={s.status}
                      size="small"
                      color={
                        s.status === "Cerrada"
                          ? "success"
                          : s.status === "Abierta"
                            ? "primary"
                            : "default"
                      }
                      sx={{ fontWeight: 800, width: "100%" }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Stack>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
              Resumen de Movimientos (Cuentas del Día)
            </Typography>
            {accountEntries.length > 0 ? (
              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{ borderRadius: 3, overflow: "hidden" }}
              >
                <Table size="small">
                  <TableHead
                    sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}
                  >
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Cuenta</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        Ingresos
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        Egresos
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        Neto
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {accountEntries.map(([name, data]) => (
                      <TableRow key={name}>
                        <TableCell
                          sx={{ fontWeight: 600, fontSize: "0.85rem" }}
                        >
                          {name}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ color: "success.main", fontWeight: 700 }}
                        >
                          ${data.income.toLocaleString()}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ color: "error.main", fontWeight: 700 }}
                        >
                          ${data.expense.toLocaleString()}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 800,
                            color:
                              data.income - data.expense >= 0
                                ? "success.main"
                                : "error.main",
                          }}
                        >
                          ${(data.income - data.expense).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow
                      sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}
                    >
                      <TableCell sx={{ fontWeight: 900 }}>
                        TOTAL EFECTIVO
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: 900, color: "success.main" }}
                      >
                        ${currentIncome.toLocaleString()}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: 900, color: "error.main" }}
                      >
                        ${currentExpense.toLocaleString()}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 900,
                          color:
                            currentIncome - currentExpense >= 0
                              ? "success.main"
                              : "error.main",
                        }}
                      >
                        ${(currentIncome - currentExpense).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert
                severity="info"
                variant="outlined"
                sx={{ borderRadius: 3 }}
              >
                Aún no hay movimientos registrados en <strong>Efectivo</strong>{" "}
                para la jornada de hoy.
              </Alert>
            )}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block" }}
            >
              * Solo se muestran movimientos realizados en Efectivo para el
              arqueo de caja.
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* History Section */}
      <Box sx={{ mt: 8, mb: 4 }}>
        <Divider sx={{ mb: 4 }}>
          <Chip
            icon={<HistoryIcon />}
            label="HISTORIAL DE ARQUEOS"
            sx={{ fontWeight: 800, px: 2 }}
          />
        </Divider>

        <Paper
          variant="outlined"
          sx={{
            p: 2,
            mb: 4,
            borderRadius: 3,
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            Filtro de Fecha:
          </Typography>
          <TextField
            type="date"
            size="small"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            label="Desde"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            type="date"
            size="small"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            label="Hasta"
            InputLabelProps={{ shrink: true }}
          />
          {(startDate || endDate) && (
            <Button
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
            >
              Limpiar
            </Button>
          )}
        </Paper>

        <Grid container spacing={3}>
          {filteredArchivedDays.length === 0 ? (
            <Grid
              item
              xs={12}
              sx={{ textAlign: "center", py: 4, opacity: 0.5 }}
            >
              <ErrorIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography>Aún no hay cierres archivados.</Typography>
            </Grid>
          ) : (
            filteredArchivedDays.map((day, idx) => {
              const itemKey = `${day.date}-${idx}`;
              const isExpanded = expandedDay === itemKey;
              return (
                <Grid item xs={12} key={itemKey}>
                  <Paper
                    elevation={0}
                    onClick={() => setExpandedDay(isExpanded ? null : itemKey)}
                    sx={{
                      p: 0,
                      borderRadius: 4,
                      border: "1px solid",
                      borderColor: isExpanded ? "primary.main" : "divider",
                      overflow: "hidden",
                      transition: "all 0.2s ease",
                      cursor: "pointer",
                      "&:hover": {
                        borderColor: "primary.light",
                        bgcolor: alpha(theme.palette.primary.main, 0.01),
                      },
                    }}
                  >
                    <Box
                      sx={{
                        p: 2.5,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Stack direction="row" spacing={3} alignItems="center">
                        <Box sx={{ textAlign: "center", minWidth: 80 }}>
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 800, color: "text.secondary" }}
                          >
                            FECHA
                          </Typography>
                          <Typography
                            sx={{ fontWeight: 900, color: "primary.main" }}
                          >
                            {day.date}
                          </Typography>
                        </Box>
                        <Divider orientation="vertical" flexItem />
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 800, color: "text.secondary" }}
                          >
                            RESPONSABLES
                          </Typography>
                          <Typography sx={{ fontWeight: 700 }}>
                            {day.shifts.map((s) => s.responsible).join(", ")}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack direction="row" spacing={4} alignItems="center">
                        <Box sx={{ textAlign: "right" }}>
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 800, color: "text.secondary" }}
                          >
                            TOTAL CAJA
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 900, color: "success.main" }}
                          >
                            ${day.totalBalance.toLocaleString()}
                          </Typography>
                        </Box>
                        {isExpanded ? (
                          <RemoveCircleIcon color="action" />
                        ) : (
                          <AddCircleIcon color="primary" />
                        )}
                      </Stack>
                    </Box>

                    {isExpanded && (
                      <Box
                        sx={{
                          p: 3,
                          bgcolor: alpha(theme.palette.primary.main, 0.02),
                          borderTop: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Grid container spacing={4}>
                          {day.shifts.map((s, sidx) => (
                            <Grid item xs={12} md={6} key={sidx}>
                              <Box
                                sx={{
                                  p: 2,
                                  bgcolor: "background.paper",
                                  borderRadius: 3,
                                  border: "1px solid",
                                  borderColor: "divider",
                                  height: "100%",
                                }}
                              >
                                <Typography
                                  variant="subtitle1"
                                  sx={{
                                    fontWeight: 900,
                                    mb: 1,
                                    color: "primary.main",
                                  }}
                                >
                                  {s.name}
                                </Typography>
                                <Stack spacing={1}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Responsable:
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{ fontWeight: 700 }}
                                    >
                                      {s.responsible}
                                    </Typography>
                                  </Box>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Apertura:
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{ fontWeight: 700 }}
                                    >
                                      ${s.openingCash.toLocaleString()}
                                    </Typography>
                                  </Box>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Ventas (Efectivo):
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontWeight: 700,
                                        color: "success.main",
                                      }}
                                    >
                                      +${(s.systemIncome || 0).toLocaleString()}
                                    </Typography>
                                  </Box>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Gastos (Efectivo):
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontWeight: 700,
                                        color: "error.main",
                                      }}
                                    >
                                      -$
                                      {(s.systemExpense || 0).toLocaleString()}
                                    </Typography>
                                  </Box>
                                  <Divider />
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      pt: 1,
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Esperado en Caja:
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{ fontWeight: 700 }}
                                    >
                                      $
                                      {(
                                        (s.openingCash || 0) +
                                        (s.systemIncome || 0) -
                                        (s.systemExpense || 0)
                                      ).toLocaleString()}
                                    </Typography>
                                  </Box>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Real declarado:
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontWeight: 900,
                                        color: "primary.main",
                                      }}
                                    >
                                      ${s.realCash?.toLocaleString()}
                                    </Typography>
                                  </Box>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      p: 1,
                                      bgcolor: alpha(
                                        theme.palette.warning.main,
                                        0.1,
                                      ),
                                      borderRadius: 1,
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{ fontWeight: 800 }}
                                    >
                                      Diferencia:
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontWeight: 900,
                                        color:
                                          s.difference !== null
                                            ? s.difference >= 0
                                              ? "success.main"
                                              : "error.main"
                                            : "text.primary",
                                      }}
                                    >
                                      {s.difference !== null
                                        ? `${s.difference > 0 ? "+" : ""}$${s.difference.toLocaleString()}`
                                        : "—"}
                                    </Typography>
                                  </Box>

                                  {/* Shift Stock Snapshot */}
                                  {s.stockSnapshot &&
                                    s.stockSnapshot.length > 0 && (
                                      <Box sx={{ mt: 1 }}>
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            fontWeight: 800,
                                            color: "text.secondary",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 0.5,
                                            mb: 1,
                                          }}
                                        >
                                          <LiquorIcon sx={{ fontSize: 14 }} />{" "}
                                          STOCK DE CIERRE
                                        </Typography>
                                        <Box
                                          sx={{
                                            borderRadius: 2,
                                            border: "1px solid",
                                            borderColor: alpha(
                                              theme.palette.divider,
                                              0.5,
                                            ),
                                            overflow: "hidden",
                                          }}
                                        >
                                          {s.stockSnapshot.map((ss, ssidx) => (
                                            <Box
                                              key={ssidx}
                                              sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                px: 1.5,
                                                py: 0.5,
                                                bgcolor:
                                                  ssidx % 2 === 0
                                                    ? alpha(
                                                      theme.palette.action
                                                        .hover,
                                                      0.5,
                                                    )
                                                    : "transparent",
                                              }}
                                            >
                                              <Typography
                                                sx={{
                                                  fontSize: "0.75rem",
                                                  fontWeight: 600,
                                                }}
                                              >
                                                {ss.name}
                                              </Typography>
                                              <Typography
                                                sx={{
                                                  fontSize: "0.75rem",
                                                  fontWeight: 800,
                                                }}
                                              >
                                                {ss.quantity} u.
                                              </Typography>
                                            </Box>
                                          ))}
                                        </Box>
                                      </Box>
                                    )}

                                  {s.notes && (
                                    <Box
                                      sx={{
                                        mt: 2,
                                        p: 2,
                                        bgcolor: alpha(
                                          theme.palette.info.main,
                                          0.05,
                                        ),
                                        borderRadius: 2,
                                        borderLeft: "4px solid",
                                        borderColor: "info.main",
                                      }}
                                    >
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          fontWeight: 800,
                                          display: "block",
                                          mb: 0.5,
                                          color: "info.main",
                                        }}
                                      >
                                        OBSERVACIONES:
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        sx={{ fontStyle: "italic" }}
                                      >
                                        "{s.notes}"
                                      </Typography>
                                    </Box>
                                  )}
                                </Stack>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              );
            })
          )}
        </Grid>
      </Box>

      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert
          severity="success"
          sx={{ width: "100%", fontWeight: 700, borderRadius: 2 }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
