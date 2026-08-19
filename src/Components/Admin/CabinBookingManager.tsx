import React, { useState, useEffect, useMemo, useRef } from "react";
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
  Tooltip,
  Divider,
  Alert,
  InputAdornment,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import HouseSidingIcon from "@mui/icons-material/HouseSiding";
import PaymentsIcon from "@mui/icons-material/Payments";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TodayIcon from "@mui/icons-material/Today";
import { supabase } from "../../supabaseClient";
import moment from "moment";
import "moment/locale/es";

moment.locale("es");

interface CabinBooking {
  id: number;
  cabin_type: number;
  cabin_sub_number: number;
  start_date: string;
  end_date: string;
  user_name: string;
  is_affiliate: boolean;
  status: "Pendiente" | "Señada" | "Pagada" | "Cancelada";
  total_price: number;
  deposit_amount: number;
  remaining_balance: number;
  nights_count: number;
  notes: string;
}

const UNITS = [
    { type: 4, sub: 1, name: "C4 - Unidad 1", key: 'confort4' },
    { type: 4, sub: 2, name: "C4 - Unidad 2", key: 'confort4' },
    { type: 5, sub: 1, name: "C5 - Unidad 1", key: 'confort5' },
    { type: 7, sub: 1, name: "C7 - Unidad 1", key: 'confort7' },
    { type: 7, sub: 2, name: "C7 - Unidad 2", key: 'confort7' },
];

export default function CabinBookingManager() {
  const theme = useTheme();
  const [viewStartDate, setViewStartDate] = useState(moment().startOf('day'));
  const [bookings, setBookings] = useState<CabinBooking[]>([]);
  const [prices, setPrices] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{
    start: Date;
    end: Date;
    unit: typeof UNITS[0];
  } | null>(null);
  
  const [formData, setFormData] = useState({
    user_name: "",
    is_affiliate: true,
    deposit: 0,
    notes: "",
    status: "Pendiente" as any
  });
  const [conflictError, setConflictError] = useState<string | null>(null);

  const [editingBookingId, setEditingBookingId] = useState<number | null>(null);

  // Fetching data
  const fetchData = async () => {
    const { data: bData } = await supabase.from("cabin_bookings").select("*");
    setBookings(bData || []);

    const { data: pData } = await supabase.from('system_configs').select('value').eq('key', 'cabin_prices').single();
    if (pData?.value) setPrices(pData.value);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Grilla de 15 días
  const daysInView = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => moment(viewStartDate).add(i, 'days'));
  }, [viewStartDate]);

  const handleDayClick = (day: moment.Moment, unit: typeof UNITS[0]) => {
    setEditingBookingId(null);
    setSelectedRange({
        start: day.clone().toDate(),
        end: day.clone().add(1, 'day').toDate(),
        unit
    });
    setFormData({ user_name: "", deposit: 0, notes: "", status: 'Pendiente', is_affiliate: true });
    setConflictError(null);
    setOpenDialog(true);
  };

  const handleBookingClick = (booking: CabinBooking) => {
    const unit = UNITS.find(u => u.type === booking.cabin_type && u.sub === booking.cabin_sub_number) || UNITS[0];
    setEditingBookingId(booking.id);
    setSelectedRange({
        start: moment(booking.start_date, 'YYYY-MM-DD').toDate(),
        end: moment(booking.end_date, 'YYYY-MM-DD').toDate(),
        unit
    });
    setFormData({
        user_name: booking.user_name,
        is_affiliate: booking.is_affiliate,
        deposit: booking.deposit_amount || 0,
        notes: booking.notes || "",
        status: booking.status || "Pendiente"
    });
    setConflictError(null);
    setOpenDialog(true);
  };

  const handleStartDateChange = (newStartStr: string) => {
    if (!selectedRange || !newStartStr) return;
    const newStart = moment(newStartStr, 'YYYY-MM-DD').toDate();
    let newEnd = selectedRange.end;
    if (moment(newEnd).isSameOrBefore(moment(newStart), 'day')) {
      newEnd = moment(newStart).add(1, 'day').toDate();
    }
    setSelectedRange({ ...selectedRange, start: newStart, end: newEnd });
  };

  const handleEndDateChange = (newEndStr: string) => {
    if (!selectedRange || !newEndStr) return;
    const newEnd = moment(newEndStr, 'YYYY-MM-DD').toDate();
    setSelectedRange({ ...selectedRange, end: newEnd });
  };

  const handleNightsChange = (newNights: number) => {
    if (!selectedRange || newNights < 1) return;
    const newEnd = moment(selectedRange.start).add(newNights, 'days').toDate();
    setSelectedRange({ ...selectedRange, end: newEnd });
  };

  const checkConflict = (start: Date, end: Date, type: number, sub: number, ignoreId?: number | null) => {
    const sStr = moment(start).format('YYYY-MM-DD');
    const eStr = moment(end).format('YYYY-MM-DD');
    return bookings.find(b => b.id !== ignoreId && b.cabin_type === type && b.cabin_sub_number === sub && (sStr < b.end_date) && (eStr > b.start_date));
  };

  useEffect(() => {
    if (selectedRange && openDialog) {
      if (moment(selectedRange.end).isSameOrBefore(moment(selectedRange.start), 'day')) {
        setConflictError("La fecha de egreso debe ser posterior a la fecha de ingreso.");
      } else if (checkConflict(selectedRange.start, selectedRange.end, selectedRange.unit.type, selectedRange.unit.sub, editingBookingId)) {
        setConflictError("¡Conflicto detectado! La unidad ya se encuentra reservada en esas fechas.");
      } else {
        setConflictError(null);
      }
    }
  }, [selectedRange, bookings, openDialog, editingBookingId]);

  const handleSaveBooking = async () => {
    if (!selectedRange || !formData.user_name) return;

    if (moment(selectedRange.end).isSameOrBefore(moment(selectedRange.start), 'day')) {
        setConflictError("La fecha de egreso debe ser posterior a la fecha de ingreso.");
        return;
    }

    if (checkConflict(selectedRange.start, selectedRange.end, selectedRange.unit.type, selectedRange.unit.sub, editingBookingId)) {
        setConflictError("¡Conflicto detectado en esas fechas!");
        return;
    }

    const priceKey = selectedRange.unit.key as any;
    const pricePerNight = prices && prices[priceKey] ? (formData.is_affiliate ? prices[priceKey].afiliado : prices[priceKey].general) : 0;
    const nights = Math.max(1, moment(selectedRange.end).diff(moment(selectedRange.start), 'days'));
    const total = nights * pricePerNight;

    try {
      const payload = {
        cabin_type: selectedRange.unit.type,
        cabin_sub_number: selectedRange.unit.sub,
        start_date: moment(selectedRange.start).format("YYYY-MM-DD"),
        end_date: moment(selectedRange.end).format("YYYY-MM-DD"),
        user_name: formData.user_name,
        is_affiliate: formData.is_affiliate,
        status: formData.status || (formData.deposit > 0 ? "Señada" : "Pendiente"),
        total_price: total,
        deposit_amount: formData.deposit,
        remaining_balance: total - formData.deposit,
        nights_count: nights,
        notes: formData.notes
      };

      if (editingBookingId) {
        const { error } = await supabase.from("cabin_bookings").update(payload).eq("id", editingBookingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("cabin_bookings").insert(payload);
        if (error) throw error;
      }

      setOpenDialog(false);
      fetchData();
    } catch (e) {
      alert("Error al guardar la reserva.");
    }
  };

  const deleteBooking = async (id: number) => {
    if (!window.confirm("¿Eliminar esta reserva definitivamente?")) return;
    await supabase.from("cabin_bookings").delete().eq("id", id);
    setOpenDialog(false);
    fetchData();
  };

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      
      {/* HEADER: Navegación Compacta */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
                <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main' }}>Tablero Global (15 Días)</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    {viewStartDate.format('MMMM [de] YYYY').toUpperCase()}
                </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
                <Button size="small" variant="outlined" startIcon={<TodayIcon />} onClick={() => setViewStartDate(moment().startOf('day'))}>Hoy</Button>
                <IconButton onClick={() => setViewStartDate(prev => prev.clone().subtract(15, 'days'))}><ChevronLeftIcon /></IconButton>
                <IconButton onClick={() => setViewStartDate(prev => prev.clone().add(15, 'days'))}><ChevronRightIcon /></IconButton>
            </Stack>
        </Box>
        
        {/* Mini Calendario de ayuda (Opcional, pero se integra en la cabecera de la grilla) */}
      </Paper>

      {/* GRID PRINCIPAL (Modo Hotel) */}
      <Paper elevation={0} sx={{ flexGrow: 1, borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ overflowX: 'auto', flexGrow: 1 }}>
            <Box sx={{ minWidth: 1000 }}>
                {/* Header de la Grilla (Días) */}
                <Box sx={{ display: 'flex', borderBottom: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.background.paper, 0.5) }}>
                    <Box sx={{ width: 180, p: 2, borderRight: '1px solid', borderColor: 'divider', fontWeight: 900 }}>UNIDAD</Box>
                    {daysInView.map((day, i) => {
                        const isToday = day.isSame(moment(), 'day');
                        const isWeekend = day.day() === 0 || day.day() === 6;
                        return (
                            <Box key={i} sx={{ 
                                flex: 1, p: 1, textAlign: 'center', borderRight: '1px solid', borderColor: 'divider',
                                bgcolor: isToday ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                                borderBottom: isToday ? `3px solid ${theme.palette.primary.main}` : 'none'
                             }}>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: isWeekend ? 'error.main' : 'text.secondary' }}>
                                    {day.format('ddd').toUpperCase()}
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1 }}>{day.format('DD')}</Typography>
                            </Box>
                        );
                    })}
                </Box>

                {/* Filas de Cabañas */}
                {UNITS.map((unit, idx) => (
                    <Box key={idx} sx={{ display: 'flex', height: 80, borderBottom: '1px solid', borderColor: 'divider' }}>
                        {/* Celda de Nombre */}
                        <Box sx={{ width: 180, p: 2, borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                            <HouseSidingIcon color="primary" sx={{ fontSize: 20 }} />
                            <Typography variant="body2" sx={{ fontWeight: 800 }}>{unit.name}</Typography>
                        </Box>

                        {/* Celdas de Tiempo */}
                        <Box sx={{ flex: 1, display: 'flex', position: 'relative' }}>
                            {daysInView.map((day, i) => (
                                <Box key={i} onClick={() => handleDayClick(day, unit)} sx={{ 
                                    flex: 1, borderRight: '1px dotted', borderColor: 'divider', transition: '0.2s',
                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05), cursor: 'pointer' }
                                }} />
                            ))}

                            {/* Render de Reservas encima (Relativo a la fila) */}
                            {bookings.filter(b => b.cabin_type === unit.type && b.cabin_sub_number === unit.sub).map(booking => {
                                const startDay = moment(booking.start_date);
                                const endDay = moment(booking.end_date);
                                
                                // Calculamos posicion si está dentro del rango visible
                                const gridStart = viewStartDate;
                                const gridEnd = moment(viewStartDate).add(15, 'days');

                                if (startDay.isAfter(gridEnd) || endDay.isBefore(gridStart)) return null;

                                const offset = Math.max(0, startDay.diff(gridStart, 'days'));
                                const duration = Math.min(15 - offset, endDay.diff(moment.max(startDay, gridStart), 'days'));
                                
                                if (duration <= 0) return null;

                                const isPaid = booking.status === 'Pagada';
                                const left = `${(offset / 15) * 100}%`;
                                const width = `${(duration / 15) * 100}%`;

                                return (
                                    <Box key={booking.id} sx={{
                                        position: 'absolute', top: 12, left, width, height: 56, zIndex: 1,
                                        p: 1, cursor: 'pointer', transition: '0.2s',
                                        '&:hover': { transform: 'scaleY(1.05)', zIndex: 2 }
                                    }} onClick={(e) => { e.stopPropagation(); handleBookingClick(booking); }}>
                                        <Paper elevation={3} sx={{
                                            height: '100%', borderRadius: 2, p: 1, overflow: 'hidden',
                                            bgcolor: isPaid ? 'success.main' : booking.status === 'Señada' ? 'warning.main' : 'primary.main',
                                            color: 'white', border: '1px solid rgba(255,255,255,0.2)',
                                            display: 'flex', flexDirection: 'column', justifyContent: 'center'
                                        }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="caption" sx={{ fontWeight: 900, whiteSpace: 'nowrap' }}>
                                                    {booking.user_name}
                                                </Typography>
                                                <IconButton size="small" sx={{ p: 0, color: 'white', opacity: 0.7 }} onClick={(e) => { e.stopPropagation(); deleteBooking(booking.id); }}>
                                                    <DeleteIcon sx={{ fontSize: 14 }} />
                                                </IconButton>
                                            </Box>
                                            <Typography variant="caption" sx={{ fontSize: '0.6rem', opacity: 0.9 }}>
                                                {booking.nights_count} Nts - Bal: ${booking.remaining_balance.toLocaleString()}
                                            </Typography>
                                        </Paper>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
      </Paper>

      {/* MODAL DE RESERVA (Crear / Editar / Eliminar) */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 900, pb: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="span" sx={{ fontWeight: 900 }}>
                {editingBookingId ? `Editar Reserva: ${selectedRange?.unit.name}` : `Nueva Reserva: ${selectedRange?.unit.name}`}
            </Typography>
            {editingBookingId && (
                <Button color="error" size="small" variant="outlined" startIcon={<DeleteIcon />} onClick={() => deleteBooking(editingBookingId)} sx={{ fontWeight: 800 }}>
                    Eliminar
                </Button>
            )}
        </DialogTitle>
        <DialogContent dividers sx={{ mt: 2 }}>
            {conflictError && <Alert severity="error" sx={{ mb: 2 }}>{conflictError}</Alert>}
            <Grid container spacing={3}>
                <Grid size={12}>
                    <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>PERIODO SELECCIONADO</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 900 }}>
                                {selectedRange ? moment(selectedRange.start).format('DD/MM/YYYY') : ''} al {selectedRange ? moment(selectedRange.end).format('DD/MM/YYYY') : ''}
                            </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Chip label={`${selectedRange ? Math.max(0, moment(selectedRange.end).diff(moment(selectedRange.start), 'days')) : 0} Noches`} color="primary" sx={{ fontWeight: 900 }} />
                            {prices && selectedRange?.unit.key && prices[selectedRange.unit.key as any] && (
                                <Chip 
                                    label={`Total: $${(
                                        Math.max(0, moment(selectedRange.end).diff(moment(selectedRange.start), 'days')) * 
                                        (formData.is_affiliate ? prices[selectedRange.unit.key as any].afiliado : prices[selectedRange.unit.key as any].general)
                                    ).toLocaleString()}`} 
                                    color="success" 
                                    variant="outlined" 
                                    sx={{ fontWeight: 900 }} 
                                />
                            )}
                        </Stack>
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 5 }}>
                    <TextField
                        label="Fecha de Inicio (Ingreso)"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={selectedRange ? moment(selectedRange.start).format('YYYY-MM-DD') : ''}
                        onChange={(e) => handleStartDateChange(e.target.value)}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 5 }}>
                    <TextField
                        label="Fecha de Fin (Egreso)"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={selectedRange ? moment(selectedRange.end).format('YYYY-MM-DD') : ''}
                        onChange={(e) => handleEndDateChange(e.target.value)}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                    <TextField
                        label="Noches"
                        type="number"
                        fullWidth
                        inputProps={{ min: 1 }}
                        value={selectedRange ? Math.max(1, moment(selectedRange.end).diff(moment(selectedRange.start), 'days')) : 1}
                        onChange={(e) => handleNightsChange(Number(e.target.value))}
                    />
                </Grid>

                <Grid size={12}>
                    <TextField 
                        select 
                        label="Cabaña / Unidad" 
                        fullWidth 
                        value={`${selectedRange?.unit.type}-${selectedRange?.unit.sub}`} 
                        onChange={(e) => {
                            const [type, sub] = e.target.value.split('-').map(Number);
                            const foundUnit = UNITS.find(u => u.type === type && u.sub === sub);
                            if (foundUnit && selectedRange) {
                                setSelectedRange({ ...selectedRange, unit: foundUnit });
                            }
                        }}
                    >
                        {UNITS.map((u) => (
                            <MenuItem key={`${u.type}-${u.sub}`} value={`${u.type}-${u.sub}`}>{u.name}</MenuItem>
                        ))}
                    </TextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField label="Nombre del Titular" fullWidth value={formData.user_name} onChange={(e) => setFormData({ ...formData, user_name: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField select label="Categoría" fullWidth value={formData.is_affiliate ? 'Afil' : 'Gral'} onChange={(e) => setFormData({ ...formData, is_affiliate: e.target.value === 'Afil' })}>
                        <MenuItem value="Afil">Afiliado</MenuItem>
                        <MenuItem value="Gral">Público General</MenuItem>
                    </TextField>
                </Grid>

                <Grid size={12}><Divider sx={{ my: 1 }} /></Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField label="Seña Recibida" fullWidth type="number" value={formData.deposit} onChange={(e) => setFormData({ ...formData, deposit: Number(e.target.value) })} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 8 }}>
                    <TextField select label="Estado" fullWidth value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                        <MenuItem value="Pendiente">Pendiente</MenuItem>
                        <MenuItem value="Señada">Señada</MenuItem>
                        <MenuItem value="Pagada">Pagada</MenuItem>
                    </TextField>
                </Grid>

                <Grid size={12}>
                    <TextField label="Observaciones" fullWidth multiline rows={2} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                </Grid>
            </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button onClick={() => setOpenDialog(false)} sx={{ fontWeight: 700 }}>Cancelar</Button>
            <Button variant="contained" onClick={handleSaveBooking} disabled={!formData.user_name || !!conflictError} sx={{ fontWeight: 900, px: 4 }}>
                {editingBookingId ? 'Guardar Cambios' : 'Confirmar Reserva'}
            </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
