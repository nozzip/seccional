import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  TextField,
  Stack,
  alpha,
  useTheme,
  Divider,
  Alert,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  Snackbar,
  Chip,
} from "@mui/material";
import LockClockIcon from "@mui/icons-material/LockClock";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import BalanceIcon from "@mui/icons-material/Balance";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ArchiveIcon from "@mui/icons-material/Archive";
import HandshakeIcon from "@mui/icons-material/Handshake";
import LiquorIcon from "@mui/icons-material/Liquor";
import HistoryIcon from "@mui/icons-material/History";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

type ShiftStatus = "No Iniciado" | "Abierta" | "Cerrada";

interface Shift {
  id: 1 | 2;
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
  startingStock?: { name: string; quantity: number }[];
  stockSnapshot?: { name: string; quantity: number }[];
}

interface ArchivedDay {
  date: string;
  shifts: Shift[];
  totalBalance: number;
}

export default function CashRegistry() {
  const theme = useTheme();
  const [dayArchived, setDayArchived] = useState(false);
  const [realCashInput, setRealCashInput] = useState<string>("");
  const [stockInput, setStockInput] = useState<{ [key: string]: string }>({});
  const [notesInput, setNotesInput] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [archivedDays, setArchivedDays] = useState<ArchivedDay[]>([
    {
      date: "2026-02-22",
      totalBalance: 25400,
      shifts: [
        {
          id: 1,
          name: "Turno Mañana",
          timeLabel: "08:00 a 16:00",
          responsible: "Juan",
          openingCash: 5000,
          systemIncome: 12000,
          systemExpense: 0,
          realCash: 17000,
          difference: 0,
          status: "Cerrada",
          notes: "Todo ok",
        },
        {
          id: 2,
          name: "Turno Tarde",
          timeLabel: "16:00 a 24:00",
          responsible: "Maria",
          openingCash: 17000,
          systemIncome: 8400,
          systemExpense: 0,
          realCash: 25400,
          difference: 0,
          status: "Cerrada",
          notes: "Sin novedades",
        },
      ],
    },
  ]);

  // Mock initial stock for tracing
  const [systemStock] = useState([
    { name: "Cerveza Quilmes 1L", quantity: 24 },
    { name: "Gaseosa Coca-Cola 1.5L", quantity: 18 },
    { name: "Agua Mineral 500ml", quantity: 42 },
  ]);

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const filteredArchivedDays = archivedDays.filter((day) => {
    if (!startDate && !endDate) return true;
    if (startDate && day.date < startDate) return false;
    if (endDate && day.date > endDate) return false;
    return true;
  });

  const [shifts, setShifts] = useState<Shift[]>([
    {
      id: 1,
      name: "Turno Mañana",
      timeLabel: "08:00 a 16:00",
      responsible: "Admin Mañana",
      openingCash: 5000,
      systemIncome: 12500, // mock data
      systemExpense: 1500, // mock data
      realCash: null,
      difference: null,
      status: "Abierta",
      startingStock: [
        { name: "Cerveza Quilmes 1L", quantity: 24 },
        { name: "Gaseosa Coca-Cola 1.5L", quantity: 18 },
        { name: "Agua Mineral 500ml", quantity: 42 },
      ],
    },
    {
      id: 2,
      name: "Turno Tarde",
      timeLabel: "16:00 a 24:00",
      responsible: "Admin Tarde",
      openingCash: 0,
      systemIncome: 8400,
      systemExpense: 0,
      realCash: null,
      difference: null,
      status: "No Iniciado",
      startingStock: [],
    },
  ]);

  const activeShiftIndex = shifts.findIndex((s) => s.status === "Abierta");
  const activeShift = activeShiftIndex !== -1 ? shifts[activeShiftIndex] : null;

  // Calculamos el balance del sistema para el turno activo
  const currentSystemBalance = activeShift
    ? activeShift.openingCash +
      activeShift.systemIncome -
      activeShift.systemExpense
    : 0;

  // Difference is calculated dynamically as the user types
  const currentEnteredCash = parseFloat(realCashInput) || 0;
  const currentDifference =
    realCashInput === "" ? null : currentEnteredCash - currentSystemBalance;

  // Estado del ciclo diario
  const isShift1Open = shifts[0].status === "Abierta";
  const isHandover =
    shifts[0].status === "Cerrada" && shifts[1].status === "No Iniciado";
  const isShift2Open = shifts[1].status === "Abierta";
  const isReadyToArchive =
    shifts[0].status === "Cerrada" &&
    shifts[1].status === "Cerrada" &&
    !dayArchived;

  const getActiveStep = () => {
    if (dayArchived) return 4;
    if (isReadyToArchive) return 3;
    if (isShift2Open) return 2;
    if (isHandover) return 1;
    return 0; // isShift1Open or completely not started
  };

  const handleAction = () => {
    const newShifts = [...shifts];

    if (isShift1Open) {
      // Cerrar Turno 1
      if (realCashInput === "") return;
      newShifts[0].realCash = currentEnteredCash;
      newShifts[0].difference = currentDifference;
      newShifts[0].status = "Cerrada";
      newShifts[0].notes = notesInput;

      // Save stock snapshot
      newShifts[0].stockSnapshot = systemStock.map((item) => ({
        name: item.name,
        quantity: parseInt(stockInput[item.name]) || 0,
      }));

      setSuccessMessage(
        `Turno Mañana cerrado. Diferencia: $${currentDifference}`,
      );
      setRealCashInput("");
      setNotesInput("");
      setStockInput({});
    } else if (isHandover) {
      // Relevo - Abrir Turno 2
      // El saldo inicial del Turno 2 es el real declarado en el cierre del Turno 1
      newShifts[1].openingCash = newShifts[0].realCash || 0;
      newShifts[1].status = "Abierta";

      setSuccessMessage(
        `Turno Tarde abierto con saldo inicial de $${newShifts[1].openingCash.toLocaleString()}`,
      );

      // Transfer Shift 1's final stock as Shift 2's starting stock
      newShifts[1].startingStock = [...(newShifts[0].stockSnapshot || [])];

      setRealCashInput(""); // Limpiar para cuando tenga que cerrar
    } else if (isShift2Open) {
      // Cerrar Turno 2
      if (realCashInput === "") return;
      newShifts[1].realCash = currentEnteredCash;
      newShifts[1].difference = currentDifference;
      newShifts[1].status = "Cerrada";
      newShifts[1].notes = notesInput;

      // Save stock snapshot
      newShifts[1].stockSnapshot = systemStock.map((item) => ({
        name: item.name,
        quantity: parseInt(stockInput[item.name]) || 0,
      }));

      setSuccessMessage(
        `Turno Tarde cerrado. Diferencia: $${currentDifference}`,
      );
      setRealCashInput("");
      setNotesInput("");
      setStockInput({});
    } else if (isReadyToArchive) {
      // Archivar Jornada
      const newArchive: ArchivedDay = {
        date: new Date().toISOString().split("T")[0],
        shifts: [...newShifts],
        totalBalance: newShifts[1].realCash || 0,
      };

      setArchivedDays((prev) => [newArchive, ...prev]);
      setDayArchived(true);
      setSuccessMessage(
        "Jornada archivada exitosamente. Se puede consultar en el historial inferior.",
      );
    }

    setShifts(newShifts);
    setShowSuccess(true);
  };

  const startNewDay = () => {
    // Get last saved totals from current shifts (since we haven't reset them yet)
    const lastCash = shifts[1].realCash || 0;
    const lastStock = shifts[1].stockSnapshot || [];

    setShifts([
      {
        id: 1,
        name: "Turno Mañana",
        timeLabel: "08:00 a 16:00",
        responsible: "Admin Mañana",
        openingCash: lastCash,
        systemIncome: 0,
        systemExpense: 0,
        realCash: null,
        difference: null,
        status: "Abierta",
        startingStock: lastStock,
      },
      {
        id: 2,
        name: "Turno Tarde",
        timeLabel: "16:00 a 24:00",
        responsible: "Admin Tarde",
        openingCash: 0,
        systemIncome: 0,
        systemExpense: 0,
        realCash: null,
        difference: null,
        status: "No Iniciado",
        startingStock: [],
      },
    ]);

    setDayArchived(false);
    setRealCashInput("");
    setNotesInput("");
    setStockInput({});
    setSuccessMessage("Nueva jornada iniciada. Saldo y stock transferidos.");
    setShowSuccess(true);
  };

  const renderActionArea = () => {
    if (dayArchived) {
      return (
        <Stack spacing={2}>
          <Alert severity="success" sx={{ borderRadius: 2 }}>
            La jornada ha sido archivada. Todos los movimientos fueron
            registrados y consolidados.
          </Alert>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            size="large"
            sx={{
              py: 1.5,
              borderRadius: 2,
              fontWeight: 800,
              borderStyle: "dashed",
            }}
            startIcon={<PlayArrowIcon />}
            onClick={startNewDay}
          >
            Iniciar Nueva Jornada (Día Siguiente)
          </Button>
        </Stack>
      );
    }

    if (isReadyToArchive) {
      return (
        <Stack spacing={3}>
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            Ambos turnos del día están cerrados. Por favor archive la jornada
            para transferir el saldo (
            <strong>${(shifts[1].realCash || 0).toLocaleString()}</strong>) como
            apertura del día siguiente.
          </Alert>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            sx={{ py: 1.5, borderRadius: 2, fontWeight: 800 }}
            startIcon={<ArchiveIcon />}
            onClick={handleAction}
          >
            Archivar Jornada Completa
          </Button>
        </Stack>
      );
    }

    if (isHandover) {
      return (
        <Stack spacing={3}>
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            Esperando relevo. El Turno Tarde debe confirmar la caja recibida.
          </Alert>
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 700 }}
            >
              EFECTIVO DECLARADO POR TURNO ANTERIOR
            </Typography>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, color: "primary.main" }}
            >
              ${(shifts[0].realCash || 0).toLocaleString()}
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            size="large"
            sx={{ py: 1.5, borderRadius: 2, fontWeight: 800 }}
            startIcon={<HandshakeIcon />}
            onClick={handleAction}
          >
            Confirmar Relevo e Iniciar Turno Tarde
          </Button>

          {shifts[0].notes && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                bgcolor: alpha(theme.palette.info.main, 0.05),
                borderRadius: 2,
                borderStyle: "dashed",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 800,
                  color: "info.main",
                  display: "block",
                  mb: 0.5,
                }}
              >
                NOTA DEL TURNO ANTERIOR:
              </Typography>
              <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                "{shifts[0].notes}"
              </Typography>
            </Paper>
          )}
        </Stack>
      );
    }

    // Si es isShift1Open o isShift2Open
    return (
      <Stack spacing={3} sx={{ mt: 1 }}>
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 700 }}
          >
            CAPITAL DE APERTURA
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            ${activeShift?.openingCash.toLocaleString()}
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography
              variant="caption"
              color="success.main"
              sx={{ fontWeight: 700 }}
            >
              + INGRESOS SISTEMA
            </Typography>
            <Typography sx={{ fontWeight: 700 }}>
              ${activeShift?.systemIncome.toLocaleString()}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography
              variant="caption"
              color="error.main"
              sx={{ fontWeight: 700 }}
            >
              - EGRESOS SISTEMA
            </Typography>
            <Typography sx={{ fontWeight: 700 }}>
              ${activeShift?.systemExpense.toLocaleString()}
            </Typography>
          </Grid>
        </Grid>

        <Divider />

        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 700 }}
          >
            TOTAL ACUMULADO (SISTEMA)
          </Typography>
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, color: "primary.main" }}
          >
            ${currentSystemBalance.toLocaleString()}
          </Typography>
        </Box>

        <TextField
          label="Efectivo Físico en Caja"
          fullWidth
          variant="filled"
          type="number"
          value={realCashInput}
          onChange={(e) => setRealCashInput(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
            sx: { fontSize: "1.25rem", fontWeight: 800 },
          }}
        />

        <Box
          sx={{
            p: 2,
            bgcolor: alpha(theme.palette.divider, 0.05),
            borderRadius: 2,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              color: "text.secondary",
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 1.5,
            }}
          >
            <LiquorIcon fontSize="small" /> CONTROL DE STOCK Y BEBIDAS
          </Typography>
          <Grid container spacing={2}>
            {systemStock.map((item) => (
              <Grid item xs={12} sm={4} key={item.name}>
                <TextField
                  label={item.name}
                  size="small"
                  fullWidth
                  type="number"
                  value={stockInput[item.name] || ""}
                  onChange={(e) =>
                    setStockInput({
                      ...stockInput,
                      [item.name]: e.target.value,
                    })
                  }
                  placeholder={`Inic: ${activeShift?.startingStock?.find((s) => s.name === item.name)?.quantity || 0}`}
                  InputProps={{ sx: { borderRadius: 1.5, fontSize: "0.8rem" } }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        <TextField
          label="Notas o Comentarios Relevo"
          fullWidth
          variant="outlined"
          multiline
          rows={2}
          value={notesInput}
          onChange={(e) => setNotesInput(e.target.value)}
          placeholder="Ej: Dejo $500 mas en billetes de 100..."
          InputProps={{
            sx: { borderRadius: 2, fontSize: "0.9rem" },
          }}
        />

        {currentDifference !== null && (
          <Alert
            severity={currentDifference === 0 ? "success" : "warning"}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            {currentDifference === 0
              ? "Caja cuadrada perfectamente."
              : `Diferencia detectada: ${currentDifference > 0 ? "Sobran" : "Faltan"} $${Math.abs(currentDifference).toLocaleString()}`}
          </Alert>
        )}

        <Button
          variant="contained"
          fullWidth
          size="large"
          disabled={realCashInput === ""}
          sx={{ py: 1.5, borderRadius: 2, fontWeight: 800 }}
          startIcon={<LockClockIcon />}
          onClick={handleAction}
        >
          Cerrar {activeShift?.name}
        </Button>
      </Stack>
    );
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
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
          <LocalAtmIcon fontSize="large" /> Arqueo de Caja Diario
          <Box
            component="span"
            sx={{
              color: "text.secondary",
              fontWeight: 400,
              ml: 1,
              fontSize: "1.2rem",
            }}
          >
            —{" "}
            {new Date().toLocaleDateString("es-AR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </Box>
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Control de efectivo físico y gestión de relevos del día de hoy.
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: alpha(theme.palette.background.paper, 0.5),
        }}
      >
        <Stepper activeStep={getActiveStep()} alternativeLabel>
          <Step>
            <StepLabel sx={{ "& .MuiStepLabel-label": { fontWeight: 700 } }}>
              Turno Mañana
            </StepLabel>
          </Step>
          <Step>
            <StepLabel sx={{ "& .MuiStepLabel-label": { fontWeight: 700 } }}>
              Relevo (16hs)
            </StepLabel>
          </Step>
          <Step>
            <StepLabel sx={{ "& .MuiStepLabel-label": { fontWeight: 700 } }}>
              Turno Tarde
            </StepLabel>
          </Step>
          <Step>
            <StepLabel sx={{ "& .MuiStepLabel-label": { fontWeight: 700 } }}>
              Fin Jornada (24hs)
            </StepLabel>
          </Step>
        </Stepper>
      </Paper>

      <Grid container spacing={4}>
        {/* Active Action Form */}
        <Grid item xs={12} lg={4}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 4,
              border: "2px solid",
              borderColor: isReadyToArchive
                ? "primary.main"
                : isHandover
                  ? "secondary.main"
                  : "primary.main",
              position: "relative",
            }}
          >
            {!dayArchived && (
              <Box
                sx={{
                  position: "absolute",
                  top: -14,
                  left: 24,
                  bgcolor: isHandover ? "secondary.main" : "primary.main",
                  px: 2,
                  py: 0.5,
                  borderRadius: 1,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: "white", fontWeight: 800 }}
                >
                  {isReadyToArchive
                    ? "CIERRE TOTAL"
                    : isHandover
                      ? "ESPERANDO RELEVO"
                      : `MODO: ${activeShift?.name.toUpperCase()}`}
                </Typography>
              </Box>
            )}

            {renderActionArea()}
          </Paper>
        </Grid>

        {/* History / Previous Closures */}
        <Grid item xs={12} lg={8}>
          <Typography
            variant="subtitle1"
            sx={{
              mb: 2,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <BalanceIcon color="action" /> Resumen Detallado —{" "}
            {new Date().toLocaleDateString("es-AR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </Typography>
          <Stack spacing={2}>
            {shifts.map((s, idx) => {
              const isSystemInfoReady = s.status !== "No Iniciado";
              const isRealInfoReady = s.status === "Cerrada";

              return (
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
                        ? alpha(theme.palette.success.main, 0.05)
                        : "background.paper",
                    opacity: s.status === "No Iniciado" ? 0.6 : 1,
                  }}
                >
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={12} sm={3}>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          color:
                            s.status === "Cerrada"
                              ? "success.main"
                              : "text.primary",
                        }}
                      >
                        {s.name}
                        {s.status === "Abierta" && (
                          <PlayArrowIcon color="primary" fontSize="small" />
                        )}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        {s.timeLabel} •{" "}
                        {new Date().toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        Inicio
                      </Typography>
                      <Typography sx={{ fontWeight: 700 }}>
                        {isSystemInfoReady
                          ? `$${s.openingCash.toLocaleString()}`
                          : "-"}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        Neto Sistema
                      </Typography>
                      <Typography sx={{ fontWeight: 700 }}>
                        {isSystemInfoReady
                          ? `$${(s.systemIncome - s.systemExpense).toLocaleString()}`
                          : "-"}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        Efectivo Físico
                      </Typography>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          color: isRealInfoReady ? "primary.main" : "inherit",
                        }}
                      >
                        {isRealInfoReady && s.realCash !== null
                          ? `$${s.realCash.toLocaleString()}`
                          : "Pendiente"}
                      </Typography>
                    </Grid>
                    <Grid
                      item
                      xs={6}
                      sm={3}
                      textAlign={{ xs: "left", sm: "right" }}
                    >
                      {isRealInfoReady && s.difference !== null && (
                        <Box
                          sx={{
                            display: "inline-block",
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor:
                              s.difference === 0
                                ? "success.light"
                                : "warning.light",
                            color:
                              s.difference === 0
                                ? "success.dark"
                                : "warning.dark",
                            fontWeight: 800,
                            fontSize: "0.75rem",
                          }}
                        >
                          {s.difference === 0
                            ? "SIN DIFERENCIA"
                            : `DIF: $${s.difference}`}
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                  {s.notes && (
                    <>
                      <Divider sx={{ my: 1.5, borderStyle: "dotted" }} />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 700, display: "block", mb: 0.5 }}
                      >
                        NOTAS:
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: "0.85rem" }}
                      >
                        {s.notes}
                      </Typography>
                    </>
                  )}
                </Paper>
              );
            })}
          </Stack>
        </Grid>
      </Grid>

      {/* Archived History Section */}
      <Box sx={{ mt: 8, mb: 4 }}>
        <Divider sx={{ mb: 4 }}>
          <Chip
            icon={<HistoryIcon />}
            label="HISTORIAL DE ARQUEOS ARCHIVADOS"
            sx={{ fontWeight: 800, px: 2, height: 32 }}
          />
        </Divider>

        <Box sx={{ mb: 4, display: "flex", justifyContent: "center" }}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
              justifyContent: "center",
              bgcolor: alpha(theme.palette.background.paper, 0.6),
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, color: "text.secondary" }}
            >
              RANGO DE FECHAS:
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                type="date"
                size="small"
                label="Dese"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                  width: 160,
                }}
              />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                al
              </Typography>
              <TextField
                type="date"
                size="small"
                label="Hasta"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                  width: 160,
                }}
              />
            </Stack>
            {(startDate || endDate) && (
              <Button
                size="small"
                color="inherit"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                sx={{ textTransform: "none", fontWeight: 700 }}
              >
                Limpiar
              </Button>
            )}
          </Paper>
        </Box>

        <Grid container spacing={3}>
          {filteredArchivedDays.length === 0 ? (
            <Grid item xs={12}>
              <Box sx={{ textAlign: "center", py: 8, opacity: 0.5 }}>
                <ErrorIcon sx={{ fontSize: 48, mb: 2 }} color="disabled" />
                <Typography>
                  No hay arqueos archivados para el rango seleccionado.
                </Typography>
              </Box>
            </Grid>
          ) : (
            filteredArchivedDays.map((day, dIdx) => (
              <Grid item xs={12} key={dIdx}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 0,
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: "divider",
                    overflow: "hidden",
                  }}
                >
                  {/* Header of Archived Day */}
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography sx={{ fontWeight: 800, color: "primary.main" }}>
                      Jornada:{" "}
                      {new Date(day.date).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>
                      Cierre: ${day.totalBalance.toLocaleString()}
                    </Typography>
                  </Box>

                  {/* Shifts in that day */}
                  <Grid container>
                    {day.shifts.map((s, sIdx) => (
                      <Grid
                        item
                        xs={12}
                        md={6}
                        key={sIdx}
                        sx={{
                          p: 2,
                          borderRight:
                            sIdx === 0 ? { md: "1px solid" } : "none",
                          borderColor: "divider",
                        }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="flex-start"
                          sx={{ mb: 1 }}
                        >
                          <Box>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 800 }}
                            >
                              {s.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {s.responsible}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: "right" }}>
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 800,
                                color:
                                  s.difference === 0
                                    ? "success.main"
                                    : "warning.main",
                              }}
                            >
                              {s.difference === 0
                                ? "CUADRADA"
                                : `DIF: $${s.difference}`}
                            </Typography>
                          </Box>
                        </Stack>

                        <Grid
                          container
                          spacing={1}
                          sx={{
                            bgcolor: alpha(
                              theme.palette.background.default,
                              0.5,
                            ),
                            p: 1,
                            borderRadius: 1,
                          }}
                        >
                          <Grid item xs={6}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Efectivo Físico
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 700 }}
                            >
                              ${s.realCash?.toLocaleString()}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Neto Sistema
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 700 }}
                            >
                              $
                              {(
                                s.systemIncome - s.systemExpense
                              ).toLocaleString()}
                            </Typography>
                          </Grid>
                        </Grid>

                        {s.stockSnapshot && s.stockSnapshot.length > 0 && (
                          <Box sx={{ mt: 1.5 }}>
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 800,
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                mb: 0.5,
                              }}
                            >
                              <LiquorIcon sx={{ fontSize: 14 }} /> STOCK
                              DECLARADO:
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                              {s.stockSnapshot.map((item, iIdx) => {
                                const startQty =
                                  s.startingStock?.find(
                                    (st) => st.name === item.name,
                                  )?.quantity || 0;
                                return (
                                  <Chip
                                    key={iIdx}
                                    label={`${item.name}: ${startQty} ➔ ${item.quantity}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                      fontSize: "0.65rem",
                                      height: 20,
                                      mb: 0.5,
                                    }}
                                  />
                                );
                              })}
                            </Stack>
                          </Box>
                        )}
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            ))
          )}
        </Grid>
      </Box>

      {/* Notification */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={4000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          sx={{ width: "100%", borderRadius: 3, fontWeight: 700 }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
