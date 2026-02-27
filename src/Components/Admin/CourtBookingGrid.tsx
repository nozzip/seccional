import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  alpha,
  useTheme,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Stack,
  IconButton,
} from "@mui/material";
import SportsTennisIcon from "@mui/icons-material/SportsTennis";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import OutdoorGrillIcon from "@mui/icons-material/OutdoorGrill";
import DeleteIcon from "@mui/icons-material/Delete";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const DAYS_NAMES = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];
// Horarios de 8:00 a 23:30 en intervalos de 30 minutos
const HOURS = Array.from({ length: 32 }, (_, i) => {
  const h = Math.floor(i / 2) + 8;
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});

interface CourtBooking {
  id: number;
  courtType: number; // 0=Paddle, 1=Squash, 2=Fútbol 5, 3=Quinchos
  courtSubNumber: number; // 1 or 2
  dayName: string; // "Lunes"
  startTime: string; // "18:00"
  duration: number; // 60, 90, 120
  user: string;
  isWeekly: boolean;
  date?: string; // "2026-02-25" (only for non-weekly)
  status: "Pendiente" | "Pagado";
}

const BookingDialog = ({
  open,
  onClose,
  onSave,
  selectedSlot,
  courtName,
  hasSubCourts,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: { user: string; duration: number; isWeekly: boolean }) => void;
  selectedSlot: any;
  courtName: string;
  hasSubCourts: boolean;
}) => {
  const [bookingData, setBookingData] = useState({
    user: "",
    duration: 60,
    isWeekly: false,
  });
  const theme = useTheme();

  useEffect(() => {
    if (open) {
      setBookingData({ user: "", duration: 60, isWeekly: false });
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: 800 }}>
        Nueva Reserva: {courtName}{" "}
        {hasSubCourts ? `(Unidad ${selectedSlot?.subNumber})` : ""}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              borderRadius: 2,
            }}
          >
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 700, display: "block" }}
              >
                RESERVA PARA EL
              </Typography>
              <Typography sx={{ fontWeight: 800, color: "primary.main" }}>
                {selectedSlot?.dayName}{" "}
                {selectedSlot?.date?.split("-").reverse().join("/")} •{" "}
                {selectedSlot?.time} hs
              </Typography>
            </Box>
          </Box>

          <TextField
            fullWidth
            label="Nombre del Cliente / Grupo"
            value={bookingData.user}
            onChange={(e) =>
              setBookingData({ ...bookingData, user: e.target.value })
            }
            autoFocus
            InputProps={{
              startAdornment: (
                <PersonIcon sx={{ mr: 1, color: "text.secondary" }} />
              ),
            }}
          />

          <TextField
            select
            fullWidth
            label="Duración del Turno"
            value={bookingData.duration}
            onChange={(e) =>
              setBookingData({
                ...bookingData,
                duration: Number(e.target.value),
              })
            }
            InputProps={{
              startAdornment: (
                <AccessTimeIcon sx={{ mr: 1, color: "text.secondary" }} />
              ),
            }}
          >
            <MenuItem value={60}>1 Hora</MenuItem>
            <MenuItem value={90}>1 Hora y Media</MenuItem>
            <MenuItem value={120}>2 Horas</MenuItem>
          </TextField>

          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              borderStyle: bookingData.isWeekly ? "solid" : "dashed",
              borderColor: bookingData.isWeekly ? "secondary.main" : "divider",
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={bookingData.isWeekly}
                  onChange={(e) =>
                    setBookingData({
                      ...bookingData,
                      isWeekly: e.target.checked,
                    })
                  }
                  color="secondary"
                />
              }
              label={
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: "0.9rem" }}>
                    Reserva Semanal Permanente
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Se repetirá todos los {selectedSlot?.dayName}s
                    automáticamente para siempre.
                  </Typography>
                </Box>
              }
            />
          </Paper>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} sx={{ fontWeight: 700 }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={() => onSave(bookingData)}
          disabled={!bookingData.user}
          sx={{ px: 4, fontWeight: 800, borderRadius: 2 }}
        >
          CONFIRMAR
        </Button>
      </DialogActions>
    </Dialog>
  );
};

import { supabase } from "../../supabaseClient";

export default function CourtBookingGrid() {
  const [court, setCourt] = useState(0);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay(); // 0 (Dom) a 6 (Sab)
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Ajustar para que Lunes sea el inicio
    return new Date(today.setDate(diff));
  });

  const [bookings, setBookings] = useState<CourtBooking[]>([]);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    dayName: string;
    time: string;
    date: string;
    subNumber: number;
  } | null>(null);

  const theme = useTheme();

  const hasSubCourts = () => court !== 2; // Fútbol 5 has only 1 court for now

  const fetchData = async () => {
    try {
      const { data, error } = await supabase.from("court_bookings").select("*");
      if (error) throw error;
      setBookings(
        (data || []).map((b: any) => ({
          id: b.id,
          courtType: b.court_type,
          courtSubNumber: b.court_sub_number,
          dayName: b.day_name,
          startTime: b.start_time,
          duration: b.duration,
          user: b.user_name,
          isWeekly: b.is_weekly,
          date: b.booking_date,
          status: b.status,
        })),
      );
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  useEffect(() => {
    fetchData();

    const subscription = supabase
      .channel("court_bookings_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "court_bookings" },
        () => {
          fetchData();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const getWeekdayDates = (start: Date) => {
    return DAYS_NAMES.map((name, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return {
        name,
        dateStr: d.toISOString().split("T")[0],
        displayDate: d.toLocaleDateString("es-AR", {
          day: "numeric",
          month: "short",
        }),
      };
    });
  };

  const weekDates = getWeekdayDates(currentWeekStart);

  const handleDoubleClick = (
    dayName: string,
    time: string,
    date: string,
    subNumber: number,
  ) => {
    setSelectedSlot({ dayName, time, date, subNumber });
    setOpenDialog(true);
  };

  const handleSaveBooking = async (data: {
    user: string;
    duration: number;
    isWeekly: boolean;
  }) => {
    if (!selectedSlot || !data.user) return;

    try {
      const { error } = await supabase.from("court_bookings").insert({
        court_type: court,
        court_sub_number: selectedSlot.subNumber,
        day_name: selectedSlot.dayName,
        start_time: selectedSlot.time,
        duration: data.duration,
        user_name: data.user,
        is_weekly: data.isWeekly,
        booking_date: data.isWeekly ? null : selectedSlot.date,
        status: "Pendiente",
      });

      if (error) throw error;
      setOpenDialog(false);
      setSelectedSlot(null);
      fetchData();
    } catch (error) {
      console.error("Error saving booking:", error);
    }
  };

  const handleDeleteBooking = async (id: number) => {
    const booking = bookings.find((b) => b.id === id);
    if (booking?.status === "Pagado") return;

    try {
      const { error } = await supabase
        .from("court_bookings")
        .delete()
        .eq("id", id);
      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error("Error deleting booking:", error);
    }
  };

  const bookingsMap = useMemo(() => {
    const map = new Map<string, CourtBooking>();
    bookings.forEach((b) => {
      if (b.courtType !== court) return;

      const [startH, startM] = b.startTime.split(":").map(Number);
      const startTotal = startH * 60 + startM;
      const endTotal = startTotal + b.duration;

      for (let timeTotal = startTotal; timeTotal < endTotal; timeTotal += 30) {
        const h = Math.floor(timeTotal / 60);
        const m = timeTotal % 60 === 0 ? "00" : "30";
        const timeStr = `${h}:${m}`;

        if (b.isWeekly) {
          map.set(`weekly-${b.dayName}-${b.courtSubNumber}-${timeStr}`, b);
        } else {
          map.set(`date-${b.date}-${b.courtSubNumber}-${timeStr}`, b);
        }
      }
    });
    return map;
  }, [bookings, court]);

  // Función para determinar si un slot está ocupado y devolver la info de la reserva
  const getBookingInSlot = (
    dayName: string,
    time: string,
    date: string,
    subNumber: number,
  ) => {
    let b = bookingsMap.get(`weekly-${dayName}-${subNumber}-${time}`);
    if (b) return b;
    return bookingsMap.get(`date-${date}-${subNumber}-${time}`);
  };

  const changeWeek = (offset: number) => {
    const next = new Date(currentWeekStart);
    next.setDate(currentWeekStart.getDate() + offset * 7);
    setCurrentWeekStart(next);
  };

  const getCourtName = () => {
    const labels = ["Paddle", "Squash", "Fútbol 5", "Quinchos"];
    return labels[court] || "Espacio";
  };

  return (
    <Box>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 2,
        }}
      >
        <Box>
          <Tabs value={court} onChange={(_, v) => setCourt(v)} sx={{ mb: 2 }}>
            <Tab
              icon={<SportsTennisIcon />}
              label="Paddle"
              iconPosition="start"
            />
            <Tab
              icon={<FitnessCenterIcon />}
              label="Squash"
              iconPosition="start"
            />
            <Tab
              icon={<SportsSoccerIcon />}
              label="Fútbol 5"
              iconPosition="start"
            />
            <Tab
              icon={<OutdoorGrillIcon />}
              label="Quinchos"
              iconPosition="start"
            />
          </Tabs>
          <Typography variant="body2" color="text.secondary">
            Selecciona deporte y navega las semanas. <b>Doble clic</b> para
            reservar.
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 1,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <IconButton size="small" onClick={() => changeWeek(-1)}>
            <ChevronLeftIcon />
          </IconButton>
          <Button
            startIcon={<CalendarMonthIcon />}
            sx={{ fontWeight: 800, color: "text.primary" }}
            onClick={() => {
              const today = new Date();
              const day = today.getDay();
              const diff = today.getDate() - day + (day === 0 ? -6 : 1);
              setCurrentWeekStart(new Date(today.setDate(diff)));
            }}
          >
            Semana: {weekDates[0].displayDate} - {weekDates[6].displayDate}
          </Button>
          <IconButton size="small" onClick={() => changeWeek(1)}>
            <ChevronRightIcon />
          </IconButton>
        </Paper>
      </Box>

      <Box sx={{ overflowX: "auto" }}>
        <Box sx={{ minWidth: 1000 }}>
          {/* Header */}
          <Grid container spacing={1} sx={{ mb: 1 }}>
            <Grid item xs={1}>
              <Box sx={{ height: 40 }} />
            </Grid>
            {weekDates.map((day) => (
              <Grid item xs={1.5} key={day.dateStr}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1,
                    textAlign: "center",
                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 800,
                      color: "secondary.dark",
                      fontSize: "0.9rem",
                    }}
                  >
                    {day.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, color: "text.secondary" }}
                  >
                    {day.displayDate}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Body */}
          <Box sx={{ maxHeight: "70vh", overflowY: "auto", pr: 1 }}>
            {HOURS.map((hour) => (
              <Grid container spacing={1} key={hour} sx={{ mb: 1 }}>
                <Grid item xs={1}>
                  <Box
                    sx={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, color: "text.secondary" }}
                    >
                      {hour}
                    </Typography>
                  </Box>
                </Grid>
                {weekDates.map((day) => {
                  const subNumbers = hasSubCourts() ? [1, 2] : [1];

                  return (
                    <Grid item xs={1.5} key={day.dateStr}>
                      <Box sx={{ display: "flex", gap: 0.5, height: "100%" }}>
                        {subNumbers.map((subNum) => {
                          const booking = getBookingInSlot(
                            day.name,
                            hour,
                            day.dateStr,
                            subNum,
                          );
                          const isStart = booking?.startTime === hour;

                          return (
                            <Paper
                              key={subNum}
                              elevation={0}
                              onDoubleClick={() => {
                                if (!booking)
                                  handleDoubleClick(
                                    day.name,
                                    hour,
                                    day.dateStr,
                                    subNum,
                                  );
                              }}
                              sx={{
                                p: 0.3,
                                flex: 1,
                                height: 45,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "1.5px solid",
                                borderColor: booking
                                  ? booking.status === "Pagado"
                                    ? alpha(theme.palette.success.main, 0.6)
                                    : booking.isWeekly
                                      ? alpha(theme.palette.secondary.main, 0.4)
                                      : alpha(theme.palette.primary.main, 0.4)
                                  : "divider",
                                borderRadius: 1,
                                bgcolor: booking
                                  ? booking.status === "Pagado"
                                    ? alpha(theme.palette.success.main, 0.1)
                                    : booking.isWeekly
                                      ? alpha(theme.palette.secondary.main, 0.1)
                                      : alpha(theme.palette.primary.main, 0.05)
                                  : "transparent",
                                cursor: booking ? "default" : "pointer",
                                transition: "all 0.1s",
                                position: "relative",
                                "&:hover": {
                                  bgcolor: !booking
                                    ? alpha(theme.palette.primary.main, 0.1)
                                    : undefined,
                                  borderColor: !booking
                                    ? "primary.main"
                                    : undefined,
                                },
                                overflow: "hidden",
                              }}
                            >
                              {hasSubCourts() && !booking && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    position: "absolute",
                                    top: 0,
                                    right: 2,
                                    fontSize: "0.5rem",
                                    fontWeight: 900,
                                    color: "divider",
                                  }}
                                >
                                  {subNum}
                                </Typography>
                              )}
                              {booking && isStart ? (
                                <Box sx={{ width: "100%", px: 0.5 }}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      noWrap
                                      sx={{
                                        fontWeight: 800,
                                        fontSize: "0.55rem",
                                        color:
                                          booking.status === "Pagado"
                                            ? "success.dark"
                                            : booking.isWeekly
                                              ? "secondary.dark"
                                              : "primary.dark",
                                      }}
                                    >
                                      {booking.user}
                                    </Typography>
                                  </Box>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      mt: -0.5,
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        fontSize: "0.5rem",
                                        color: "text.secondary",
                                      }}
                                    >
                                      {booking.duration}m
                                    </Typography>
                                    {booking.status === "Pendiente" ? (
                                      <IconButton
                                        size="small"
                                        sx={{
                                          p: 0,
                                          color: "error.main",
                                          opacity: 0.5,
                                          "&:hover": { opacity: 1 },
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteBooking(booking.id);
                                        }}
                                      >
                                        <DeleteIcon sx={{ fontSize: 10 }} />
                                      </IconButton>
                                    ) : (
                                      <CheckCircleIcon
                                        sx={{
                                          fontSize: 10,
                                          color: "success.main",
                                        }}
                                      />
                                    )}
                                  </Box>
                                </Box>
                              ) : booking ? (
                                <Box
                                  sx={{
                                    width: "100%",
                                    height: "100%",
                                    opacity: 0.2,
                                  }}
                                />
                              ) : (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "text.disabled",
                                    fontSize: "0.6rem",
                                    fontWeight: 500,
                                  }}
                                >
                                  -
                                </Typography>
                              )}
                            </Paper>
                          );
                        })}
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            ))}
          </Box>
        </Box>
      </Box>

      <BookingDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSave={handleSaveBooking}
        selectedSlot={selectedSlot}
        courtName={getCourtName()}
        hasSubCourts={hasSubCourts()}
      />
    </Box>
  );
}
