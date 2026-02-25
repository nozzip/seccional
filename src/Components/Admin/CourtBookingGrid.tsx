import React, { useState, useEffect } from 'react';
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
    IconButton
} from '@mui/material';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import OutdoorGrillIcon from '@mui/icons-material/OutdoorGrill';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const DAYS_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
// Horarios de 8:00 a 23:30 en intervalos de 30 minutos
const HOURS = Array.from({ length: 32 }, (_, i) => {
    const h = Math.floor(i / 2) + 8;
    const m = i % 2 === 0 ? '00' : '30';
    return `${h}:${m}`;
});

interface CourtBooking {
    id: number;
    courtType: number;
    dayName: string; // "Lunes"
    startTime: string; // "18:00"
    duration: number; // 60, 90, 120
    user: string;
    isWeekly: boolean;
    date?: string; // "2026-02-25" (only for non-weekly)
    status: 'Pendiente' | 'Pagado';
}

export default function CourtBookingGrid() {
    const [court, setCourt] = useState(0);
    const [currentWeekStart, setCurrentWeekStart] = useState(() => {
        const today = new Date();
        const day = today.getDay(); // 0 (Dom) a 6 (Sab)
        const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Ajustar para que Lunes sea el inicio
        return new Date(today.setDate(diff));
    });

    const [bookings, setBookings] = useState<CourtBooking[]>(() => {
        const saved = localStorage.getItem('seccional_court_bookings');
        return saved ? JSON.parse(saved) : [];
    });

    const [openDialog, setOpenDialog] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ dayName: string, time: string, date: string } | null>(null);
    const [bookingData, setBookingData] = useState({
        user: '',
        duration: 60,
        isWeekly: false
    });

    const theme = useTheme();

    // Persistencia
    useEffect(() => {
        localStorage.setItem('seccional_court_bookings', JSON.stringify(bookings));
        // Disparar un evento personalizado para que CashFlowManager sepa que hubo cambios
        window.dispatchEvent(new Event('court_bookings_updated'));
    }, [bookings]);

    // Escuchar actualizaciones externas (ej: desde CashFlowManager al cobrar)
    useEffect(() => {
        const handleUpdates = () => {
            const saved = localStorage.getItem('seccional_court_bookings');
            if (saved) {
                const updated = JSON.parse(saved);
                // Solo actualizar si realmente hay cambios para evitar bucles infinitos
                setBookings(updated);
            }
        };
        window.addEventListener('court_bookings_updated', handleUpdates);
        return () => window.removeEventListener('court_bookings_updated', handleUpdates);
    }, []);

    const getWeekdayDates = (start: Date) => {
        return DAYS_NAMES.map((name, i) => {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            return {
                name,
                dateStr: d.toISOString().split('T')[0],
                displayDate: d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
            };
        });
    };

    const weekDates = getWeekdayDates(currentWeekStart);

    const handleDoubleClick = (dayName: string, time: string, date: string) => {
        setSelectedSlot({ dayName, time, date });
        setBookingData({ user: '', duration: 60, isWeekly: false });
        setOpenDialog(true);
    };

    const handleSaveBooking = () => {
        if (!selectedSlot || !bookingData.user) return;

        const newBooking: CourtBooking = {
            id: Date.now(),
            courtType: court,
            dayName: selectedSlot.dayName,
            startTime: selectedSlot.time,
            duration: bookingData.duration,
            user: bookingData.user,
            isWeekly: bookingData.isWeekly,
            date: bookingData.isWeekly ? undefined : selectedSlot.date,
            status: 'Pendiente'
        };

        setBookings([...bookings, newBooking]);
        setOpenDialog(false);
        setSelectedSlot(null);
    };

    const handleDeleteBooking = (id: number) => {
        const booking = bookings.find(b => b.id === id);
        if (booking?.status === 'Pagado') return; // Seguridad extra
        setBookings(bookings.filter(b => b.id !== id));
    };

    // Función para determinar si un slot está ocupado y devolver la info de la reserva
    const getBookingInSlot = (dayName: string, time: string, date: string) => {
        return bookings.find(b => {
            if (b.courtType !== court) return false;

            // Si es semanal, coincide si el nombre del día coincide
            // Si no es semanal, coincide si la fecha exacta coincide
            if (b.isWeekly) {
                if (b.dayName !== dayName) return false;
            } else {
                if (b.date !== date) return false;
            }

            const [startH, startM] = b.startTime.split(':').map(Number);
            const [currentH, currentM] = time.split(':').map(Number);
            const startTotal = startH * 60 + startM;
            const currentTotal = currentH * 60 + currentM;
            const endTotal = startTotal + b.duration;

            return currentTotal >= startTotal && currentTotal < endTotal;
        });
    };

    const changeWeek = (offset: number) => {
        const next = new Date(currentWeekStart);
        next.setDate(currentWeekStart.getDate() + offset * 7);
        setCurrentWeekStart(next);
    };

    const getCourtName = () => {
        const labels = ['Paddle', 'Squash', 'Fútbol 5', 'Quinchos'];
        return labels[court] || 'Cancha';
    };

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                <Box>
                    <Tabs value={court} onChange={(_, v) => setCourt(v)} sx={{ mb: 2 }}>
                        <Tab icon={<SportsTennisIcon />} label="Paddle" iconPosition="start" />
                        <Tab icon={<FitnessCenterIcon />} label="Squash" iconPosition="start" />
                        <Tab icon={<SportsSoccerIcon />} label="Fútbol 5" iconPosition="start" />
                        <Tab icon={<OutdoorGrillIcon />} label="Quinchos" iconPosition="start" />
                    </Tabs>
                    <Typography variant="body2" color="text.secondary">
                        Selecciona deporte y navega las semanas. <b>Doble clic</b> para reservar.
                    </Typography>
                </Box>

                <Paper elevation={0} sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton size="small" onClick={() => changeWeek(-1)}><ChevronLeftIcon /></IconButton>
                    <Button
                        startIcon={<CalendarMonthIcon />}
                        sx={{ fontWeight: 800, color: 'text.primary' }}
                        onClick={() => {
                            const today = new Date();
                            const day = today.getDay();
                            const diff = today.getDate() - day + (day === 0 ? -6 : 1);
                            setCurrentWeekStart(new Date(today.setDate(diff)));
                        }}
                    >
                        Semana: {weekDates[0].displayDate} - {weekDates[6].displayDate}
                    </Button>
                    <IconButton size="small" onClick={() => changeWeek(1)}><ChevronRightIcon /></IconButton>
                </Paper>
            </Box>

            <Box sx={{ overflowX: 'auto' }}>
                <Box sx={{ minWidth: 1000 }}>
                    {/* Header */}
                    <Grid container spacing={1} sx={{ mb: 1 }}>
                        <Grid item xs={1}>
                            <Box sx={{ height: 40 }} />
                        </Grid>
                        {weekDates.map(day => (
                            <Grid item xs={1.5} key={day.dateStr}>
                                <Paper elevation={0} sx={{ p: 1, textAlign: 'center', bgcolor: alpha(theme.palette.secondary.main, 0.1), borderRadius: 2 }}>
                                    <Typography sx={{ fontWeight: 800, color: 'secondary.dark', fontSize: '0.9rem' }}>{day.name}</Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>{day.displayDate}</Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Body */}
                    <Box sx={{ maxHeight: '70vh', overflowY: 'auto', pr: 1 }}>
                        {HOURS.map(hour => (
                            <Grid container spacing={1} key={hour} sx={{ mb: 1 }}>
                                <Grid item xs={1}>
                                    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>{hour}</Typography>
                                    </Box>
                                </Grid>
                                {weekDates.map(day => {
                                    const booking = getBookingInSlot(day.name, hour, day.dateStr);
                                    const isStart = booking?.startTime === hour;

                                    return (
                                        <Grid item xs={1.5} key={day.dateStr}>
                                            <Paper
                                                elevation={0}
                                                onDoubleClick={() => {
                                                    if (!booking) handleDoubleClick(day.name, hour, day.dateStr);
                                                }}
                                                sx={{
                                                    p: 0.5,
                                                    height: 45,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    border: '2px solid',
                                                    borderColor: booking ?
                                                        (booking.status === 'Pagado' ? alpha(theme.palette.success.main, 0.6) : (booking.isWeekly ? alpha(theme.palette.secondary.main, 0.4) : alpha(theme.palette.primary.main, 0.4)))
                                                        : 'divider',
                                                    borderRadius: 1.5,
                                                    bgcolor: booking ?
                                                        (booking.status === 'Pagado' ? alpha(theme.palette.success.main, 0.1) : (booking.isWeekly ? alpha(theme.palette.secondary.main, 0.1) : alpha(theme.palette.primary.main, 0.05)))
                                                        : 'transparent',
                                                    cursor: booking ? 'default' : 'pointer',
                                                    transition: 'all 0.1s',
                                                    '&:hover': {
                                                        bgcolor: !booking ? alpha(theme.palette.primary.main, 0.1) : undefined,
                                                        borderColor: !booking ? 'primary.main' : undefined,
                                                    },
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                {booking && isStart ? (
                                                    <Box sx={{ width: '100%', px: 1 }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Typography variant="caption" noWrap sx={{
                                                                fontWeight: 800,
                                                                fontSize: '0.65rem',
                                                                color: booking.status === 'Pagado' ? 'success.dark' : (booking.isWeekly ? 'secondary.dark' : 'primary.dark')
                                                            }}>
                                                                {booking.user}
                                                            </Typography>
                                                            {booking.status === 'Pagado' ? (
                                                                <Chip
                                                                    label="COBRADO"
                                                                    size="small"
                                                                    color="success"
                                                                    sx={{ height: 16, fontSize: '0.5rem', fontWeight: 900, px: 0 }}
                                                                />
                                                            ) : (
                                                                <IconButton
                                                                    size="small"
                                                                    sx={{ p: 0, color: 'error.main', opacity: 0.6, '&:hover': { opacity: 1 } }}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteBooking(booking.id);
                                                                    }}
                                                                >
                                                                    <DeleteIcon sx={{ fontSize: 13 }} />
                                                                </IconButton>
                                                            )}
                                                        </Box>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: -0.5 }}>
                                                            <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>
                                                                {booking.duration}m {booking.isWeekly ? '• Sem' : ''}
                                                            </Typography>
                                                            {booking.status === 'Pendiente' && (
                                                                <Typography variant="caption" sx={{ fontSize: '0.55rem', fontWeight: 700, color: 'warning.main' }}>
                                                                    Pte
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                ) : booking ? (
                                                    <Box sx={{ width: '100%', height: '100%', opacity: 0.2 }} />
                                                ) : (
                                                    <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.6rem', fontWeight: 500 }}>-</Typography>
                                                )}
                                            </Paper>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        ))}
                    </Box>
                </Box>
            </Box>

            {/* Dialog para Nueva Reserva */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 800 }}>Nueva Reserva: {getCourtName()}</DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>RESERVA PARA EL</Typography>
                                <Typography sx={{ fontWeight: 800, color: 'primary.main' }}>
                                    {selectedSlot?.dayName} {selectedSlot?.date.split('-').reverse().join('/')} • {selectedSlot?.time} hs
                                </Typography>
                            </Box>
                        </Box>

                        <TextField
                            fullWidth
                            label="Nombre del Cliente / Grupo"
                            value={bookingData.user}
                            onChange={(e) => setBookingData({ ...bookingData, user: e.target.value })}
                            autoFocus
                            InputProps={{
                                startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            }}
                        />

                        <TextField
                            select
                            fullWidth
                            label="Duración del Turno"
                            value={bookingData.duration}
                            onChange={(e) => setBookingData({ ...bookingData, duration: Number(e.target.value) })}
                            InputProps={{
                                startAdornment: <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            }}
                        >
                            <MenuItem value={60}>1 Hora</MenuItem>
                            <MenuItem value={90}>1 Hora y Media</MenuItem>
                            <MenuItem value={120}>2 Horas</MenuItem>
                        </TextField>

                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderStyle: bookingData.isWeekly ? 'solid' : 'dashed', borderColor: bookingData.isWeekly ? 'secondary.main' : 'divider' }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={bookingData.isWeekly}
                                        onChange={(e) => setBookingData({ ...bookingData, isWeekly: e.target.checked })}
                                        color="secondary"
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography sx={{ fontWeight: 800, fontSize: '0.9rem' }}>Reserva Semanal Permanente</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Se repetirá todos los {selectedSlot?.dayName}s automáticamente para siempre.
                                        </Typography>
                                    </Box>
                                }
                            />
                        </Paper>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenDialog(false)} sx={{ fontWeight: 700 }}>Cancelar</Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveBooking}
                        disabled={!bookingData.user}
                        sx={{ px: 4, fontWeight: 800, borderRadius: 2 }}
                    >
                        CONFIRMAR
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
