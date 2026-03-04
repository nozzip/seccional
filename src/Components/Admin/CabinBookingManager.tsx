import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
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
  Stack,
  IconButton,
  Tooltip,
  Divider,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import HistoryIcon from "@mui/icons-material/History";
import HouseSidingIcon from "@mui/icons-material/HouseSiding";
import { supabase } from "../../supabaseClient";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";

moment.locale("es");
const localizer = momentLocalizer(moment);

interface CabinBooking {
  id: number;
  cabin_type: number; // 4, 5, 7
  cabin_sub_number: number; // 1, 2
  start_date: string;
  end_date: string;
  user_name: string;
  is_affiliate: boolean;
  status: "Pendiente" | "Pagado";
}

const CABINS = [
  { id: 4, name: "Cabaña 4 Personas", max: 2, capacity: 4 },
  { id: 5, name: "Cabaña 5 Personas", max: 1, capacity: 5 },
  { id: 7, name: "Cabaña 7 Personas", max: 2, capacity: 7 },
];

const HOLIDAYS_2026: Record<string, string> = {
  "2026-01-01": "Año Nuevo",
  "2026-02-16": "Lunes de Carnaval",
  "2026-02-17": "Martes de Carnaval",
  "2026-03-23": "Puente turístico",
  "2026-03-24": "Día de la Memoria",
  "2026-04-02": "Día del Veterano y de los Caídos en Malvinas",
  "2026-04-03": "Viernes Santo",
  "2026-05-01": "Día del Trabajador",
  "2026-05-25": "Día de la Revolución de Mayo",
  "2026-06-15": "Paso a la Inmortalidad de Güemes",
  "2026-06-20": "Paso a la Inmortalidad de Belgrano",
  "2026-07-09": "Día de la Independencia",
  "2026-07-10": "Puente turístico",
  "2026-08-17": "San Martín",
  "2026-10-12": "Diversidad Cultural",
  "2026-11-23": "Día de la Soberanía",
  "2026-12-07": "Puente turístico",
  "2026-12-08": "Inmaculada Concepción",
  "2026-12-25": "Navidad",
};

export default function CabinBookingManager() {
  const [activeTab, setActiveTab] = useState(4); // default to cabin 4
  const [bookings, setBookings] = useState<CabinBooking[]>([]);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{
    start: Date;
    end: Date;
    subNumber: number;
  } | null>(null);
  const [formData, setFormData] = useState({
    user_name: "",
    is_affiliate: false,
    subNumber: 1,
  });

  const theme = useTheme();

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("cabin_bookings")
        .select("*")
        .eq("cabin_type", activeTab);

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error("Error fetching cabin bookings:", error);
    }
  };

  useEffect(() => {
    fetchBookings();

    const subscription = supabase
      .channel("cabin_bookings_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cabin_bookings" },
        () => {
          fetchBookings();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [activeTab]);

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    // Determine which sub-cabin to default to (1 or 2, depending on availability)
    setSelectedRange({ start, end, subNumber: 1 });
    setFormData({
      ...formData,
      subNumber: 1,
      user_name: "",
      is_affiliate: false,
    });
    setOpenDialog(true);
  };

  const handleSaveBooking = async () => {
    if (!selectedRange || !formData.user_name) return;

    try {
      const { error } = await supabase.from("cabin_bookings").insert({
        cabin_type: activeTab,
        cabin_sub_number: formData.subNumber,
        start_date: moment(selectedRange.start).format("YYYY-MM-DD"),
        end_date: moment(selectedRange.end).format("YYYY-MM-DD"), // FullCalendar end date is exclusive
        user_name: formData.user_name,
        is_affiliate: formData.is_affiliate,
        status: "Pendiente",
      });

      if (error) throw error;
      setOpenDialog(false);
      fetchBookings();
    } catch (error) {
      console.error("Error saving cabin booking:", error);
      alert("Error al guardar la reserva. Verifica que no haya superposición.");
    }
  };

  const deleteBooking = async (id: number, status: string) => {
    if (
      status === "Pagado" &&
      !window.confirm(
        "Esta reserva ya está PAGADA. ¿Seguro que deseas eliminarla?",
      )
    )
      return;
    if (status !== "Pagado" && !window.confirm("¿Dar de baja esta reserva?"))
      return;

    try {
      await supabase.from("cabin_bookings").delete().eq("id", id);
      fetchBookings();
    } catch (e) {
      console.error(e);
    }
  };

  const events = bookings.map((b) => ({
    id: b.id,
    title: `U${b.cabin_sub_number} - ${b.user_name} ${b.is_affiliate ? "(Afil)" : ""}`,
    start: moment(b.start_date).toDate(),
    end: moment(b.end_date).toDate(), // React big calendar expects end date to be exclusive for full days
    allDay: true,
    resource: b,
  }));

  const eventStyleGetter = (
    event: any,
    start: Date,
    end: Date,
    isSelected: boolean,
  ) => {
    const isPaid = event.resource.status === "Pagado";
    const subId = event.resource.cabin_sub_number;

    let bgColor = theme.palette.primary.main;

    // Asignar color por unidad
    if (subId === 2) bgColor = theme.palette.secondary.main;
    else if (subId === 3) bgColor = theme.palette.info.main;
    else if (subId >= 4) bgColor = theme.palette.warning.main;

    return {
      style: {
        backgroundColor: alpha(bgColor, isPaid ? 0.9 : 0.6), // Más translúcido si no está pagado
        borderRadius: "4px",
        opacity: 0.9,
        color: "white",
        border: "none",
        borderLeft: `5px solid ${isPaid ? theme.palette.success.main : theme.palette.error.main}`,
        display: "block",
        margin: "2px 0",
      },
    };
  };

  const dayPropGetter = (date: Date) => {
    const dateStr = moment(date).format("YYYY-MM-DD");
    if (HOLIDAYS_2026[dateStr]) {
      return {
        style: {
          backgroundColor: alpha(theme.palette.error.main, 0.05),
        },
      };
    }
    return {};
  };

  const CustomDateHeader = ({ label, date }: { label: string; date: Date }) => {
    const dateStr = moment(date).format("YYYY-MM-DD");
    const holidayName = HOLIDAYS_2026[dateStr];

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          width: "100%",
          pt: 0.5,
          px: 0.5,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: holidayName ? 800 : 700,
            color: holidayName ? "error.main" : "inherit",
          }}
        >
          {label}
        </Typography>
        {holidayName && (
          <Typography
            variant="caption"
            sx={{
              color: "error.main",
              fontSize: "0.65rem",
              textAlign: "right",
              lineHeight: 1.1,
              width: "100%",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
            title={holidayName}
          >
            {holidayName}
          </Typography>
        )}
      </Box>
    );
  };

  const EventComponent = ({ event }: any) => {
    const startDate = moment(event.resource.start_date).format("DD/MM");
    const endDate = moment(event.resource.end_date)
      .subtract(1, "days")
      .format("DD/MM");

    return (
      <Tooltip title={`Ingreso: ${startDate} - Egreso: ${endDate}`}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            px: 0.5,
            py: 0.2,
            overflow: "hidden",
          }}
        >
          <Typography
            variant="caption"
            sx={{ fontWeight: 800, color: "white", fontSize: "0.65rem" }}
            noWrap
          >
            U{event.resource.cabin_sub_number} - {event.resource.user_name} (
            {startDate}-{endDate})
          </Typography>
          <IconButton
            size="small"
            sx={{
              color: "white",
              p: 0,
              opacity: 0.7,
              "&:hover": { opacity: 1 },
            }}
            onClick={(e) => {
              e.stopPropagation();
              deleteBooking(event.id, event.resource.status);
            }}
          >
            <DeleteIcon sx={{ fontSize: 12 }} />
          </IconButton>
        </Box>
      </Tooltip>
    );
  };

  const currentCabinConfig = CABINS.find((c) => c.id === activeTab);
  const subCabins = Array.from(
    { length: currentCabinConfig?.max || 1 },
    (_, i) => i + 1,
  );

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
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Reservas de Cabañas (El Mollar)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Selecciona el tipo de cabaña y arrastra en el calendario para
            reservar fechas libres.
          </Typography>
        </Box>
      </Box>

      <Paper
        elevation={0}
        sx={{ mb: 3, border: "1px solid", borderColor: "divider" }}
      >
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          variant="fullWidth"
        >
          {CABINS.map((cabin) => (
            <Tab
              key={cabin.id}
              value={cabin.id}
              icon={<HouseSidingIcon />}
              label={cabin.name}
              iconPosition="start"
              sx={{ fontWeight: 800 }}
            />
          ))}
        </Tabs>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          height: "95vh",
          minHeight: 850,
          border: "1px solid",
          borderColor: "divider",
          display: "flex",
          flexDirection: "column",
          mb: 4,
          pb: 4,
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            width: "100%",
            // Ajustes CSS para el popup "Ver más" de react-big-calendar
            "& .rbc-show-more": {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.dark,
              fontWeight: 800,
              fontSize: "0.75rem",
              padding: "2px 4px",
              borderRadius: "4px",
              marginTop: "2px",
              textAlign: "center",
              width: "calc(100% - 4px)",
              margin: "2px auto",
            },
            "& .rbc-overlay": {
              zIndex: 100,
              boxShadow: theme.shadows[4],
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              padding: 1,
              backgroundColor: theme.palette.background.paper,
            },
            "& .rbc-overlay-header": {
              fontWeight: 800,
              borderBottom: `1px solid ${theme.palette.divider}`,
              marginBottom: 1,
              paddingBottom: 0.5,
            },
            "& .rbc-toolbar-label": {
              textTransform: "capitalize",
              fontWeight: 800,
              fontSize: "1.2rem",
              color: "text.primary",
            },
            // Estilización profunda del calendario para integrarlo con la página
            "& .rbc-month-view": {
              borderColor: "divider",
              backgroundColor: "background.paper",
            },
            "& .rbc-month-row": {
              borderColor: "divider",
            },
            "& .rbc-day-bg": {
              borderColor: "divider",
            },
            "& .rbc-header": {
              borderColor: "divider",
              color: "text.secondary",
              fontWeight: 800,
              padding: 1,
              backgroundColor: alpha(theme.palette.background.paper, 0.5),
            },
            "& .rbc-today": {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
            },
            "& .rbc-off-range-bg": {
              backgroundColor:
                theme.palette.mode === "dark"
                  ? alpha("#000", 0.2)
                  : alpha(theme.palette.text.disabled, 0.05),
            },
            "& .rbc-date-cell": {
              color: "text.primary",
              fontWeight: 700,
              padding: "4px",
            },
            "& .rbc-off-range": {
              color: "text.disabled",
            },
            "& .rbc-btn-group button": {
              color: "text.primary",
              borderColor: "divider",
              "&:hover": {
                backgroundColor: "action.hover",
              },
              "&.rbc-active": {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
                borderColor: "primary.main",
                boxShadow: "none",
              },
            },
          }}
        >
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            views={["month"]}
            defaultView="month"
            date={currentDate}
            onNavigate={(newDate) => setCurrentDate(newDate)}
            culture="es"
            selectable={true}
            onSelectSlot={handleSelectSlot}
            eventPropGetter={eventStyleGetter}
            dayPropGetter={dayPropGetter}
            components={{
              event: EventComponent,
              month: {
                dateHeader: CustomDateHeader,
              },
            }}
            popup={true}
            style={{ height: "100%", width: "100%" }}
            formats={{
              monthHeaderFormat: (date: any) => {
                const formatter = new Intl.DateTimeFormat("es-ES", {
                  month: "long",
                  year: "numeric",
                });
                return formatter.format(date);
              },
              weekdayFormat: (date: any) => {
                const formatter = new Intl.DateTimeFormat("es-ES", {
                  weekday: "short",
                });
                return formatter.format(date);
              },
              dayFormat: (date: any) => {
                const formatter = new Intl.DateTimeFormat("es-ES", {
                  day: "2-digit",
                });
                return formatter.format(date);
              },
            }}
            messages={{
              next: "Sig",
              previous: "Ant",
              today: "Hoy",
              month: "Mes",
              showMore: (total) => `+${total} más`,
            }}
          />
        </Box>
      </Paper>

      {/* Dialogo de Reserva */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Nueva Reserva: Cabaña para {activeTab}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Box
              sx={{
                p: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                borderRadius: 2,
                border: "1px solid",
                borderColor: alpha(theme.palette.primary.main, 0.1),
              }}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 5 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: "text.secondary",
                      display: "block",
                    }}
                  >
                    INGRESO
                  </Typography>
                  <TextField
                    type="date"
                    size="small"
                    variant="standard"
                    value={
                      selectedRange
                        ? moment(selectedRange.start).format("YYYY-MM-DD")
                        : ""
                    }
                    onChange={(e) => {
                      const newStart = moment(e.target.value).toDate();
                      setSelectedRange((prev) =>
                        prev ? { ...prev, start: newStart } : null,
                      );
                    }}
                    InputProps={{
                      disableUnderline: true,
                      sx: { fontWeight: 800, fontSize: "1.1rem" },
                    }}
                  />
                </Grid>
                <Grid
                  size={{ xs: 2 }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Box sx={{ width: 30, height: 2, bgcolor: "divider" }} />
                </Grid>
                <Grid size={{ xs: 5 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: "text.secondary",
                      display: "block",
                    }}
                  >
                    EGRESO
                  </Typography>
                  <TextField
                    type="date"
                    size="small"
                    variant="standard"
                    value={
                      selectedRange
                        ? moment(selectedRange.end)
                          .subtract(1, "days")
                          .format("YYYY-MM-DD")
                        : ""
                    }
                    onChange={(e) => {
                      const newEnd = moment(e.target.value)
                        .add(1, "days")
                        .toDate();
                      setSelectedRange((prev) =>
                        prev ? { ...prev, end: newEnd } : null,
                      );
                    }}
                    InputProps={{
                      disableUnderline: true,
                      sx: { fontWeight: 800, fontSize: "1.1rem" },
                    }}
                  />
                </Grid>
              </Grid>
              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Chip
                  label={`${selectedRange ? Math.max(0, moment(selectedRange.end).subtract(1, "days").diff(moment(selectedRange.start), "days")) : 0} Noches`}
                  color="primary"
                  size="small"
                  sx={{ fontWeight: 900, px: 2 }}
                />
              </Box>
            </Box>

            <TextField
              select
              fullWidth
              label="Unidad de Cabaña"
              variant="outlined"
              value={formData.subNumber}
              onChange={(e) =>
                setFormData({ ...formData, subNumber: Number(e.target.value) })
              }
            >
              {subCabins.map((num) => (
                <MenuItem key={num} value={num}>
                  Unidad {num}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Nombre del Solicitante / Afiliado"
              placeholder="Ej: Juan Pérez"
              value={formData.user_name}
              onChange={(e) =>
                setFormData({ ...formData, user_name: e.target.value })
              }
              InputProps={{
                startAdornment: (
                  <PersonIcon sx={{ mr: 1, color: "text.secondary" }} />
                ),
              }}
            />

            <TextField
              select
              fullWidth
              label="Condición del Huésped"
              value={formData.is_affiliate ? "Afiliado" : "General"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  is_affiliate: e.target.value === "Afiliado",
                })
              }
            >
              <MenuItem value="Afiliado">Afiliado (Precio Especial)</MenuItem>
              <MenuItem value="General">Público General</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ fontWeight: 700 }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveBooking}
            disabled={!formData.user_name}
            sx={{ fontWeight: 800, px: 4 }}
          >
            CONFIRMAR
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
