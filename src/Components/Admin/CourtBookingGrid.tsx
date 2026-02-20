import React, { useState } from 'react';
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
    Tab
} from '@mui/material';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import OutdoorGrillIcon from '@mui/icons-material/OutdoorGrill';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const HOURS = Array.from({ length: 14 }, (_, i) => `${i + 8}:00`);

interface Booking {
    user: string;
    status: 'Ocupado' | 'Reservado' | 'Disponible';
}

interface CourtData {
    [key: string]: Booking;
}

const mockBookingData: CourtData = {
    'Lunes-18:00': { user: 'Juan Pérez', status: 'Ocupado' },
    'Lunes-19:00': { user: 'Gremio AFIP', status: 'Reservado' },
    'Martes-20:00': { user: 'Carlos Ruiz', status: 'Ocupado' },
};

export default function CourtBookingGrid() {
    const [court, setCourt] = useState(0);
    const theme = useTheme();

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Tabs value={court} onChange={(_, v) => setCourt(v)} sx={{ mb: 2 }}>
                        <Tab icon={<SportsTennisIcon />} label="Paddle" iconPosition="start" />
                        <Tab icon={<FitnessCenterIcon />} label="Squash" iconPosition="start" />
                        <Tab icon={<SportsSoccerIcon />} label="Fútbol 5" iconPosition="start" />
                        <Tab icon={<OutdoorGrillIcon />} label="Quinchos" iconPosition="start" />
                    </Tabs>
                    <Typography variant="body2" color="text.secondary">
                        Gestión de turnos y disponibilidad (Canchas y Quinchos)
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ overflowX: 'auto' }}>
                <Box sx={{ minWidth: 1000 }}>
                    {/* Header */}
                    <Grid container spacing={1} sx={{ mb: 1 }}>
                        <Grid item xs={1}>
                            <Box sx={{ height: 40 }} />
                        </Grid>
                        {DAYS.map(day => (
                            <Grid item xs={1.5} key={day}>
                                <Paper elevation={0} sx={{ p: 1, textAlign: 'center', bgcolor: alpha(theme.palette.secondary.main, 0.1), borderRadius: 2 }}>
                                    <Typography sx={{ fontWeight: 800, color: 'secondary.dark' }}>{day}</Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Body */}
                    {HOURS.map(hour => (
                        <Grid container spacing={1} key={hour} sx={{ mb: 1 }}>
                            <Grid item xs={1}>
                                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>{hour}</Typography>
                                </Box>
                            </Grid>
                            {DAYS.map(day => {
                                const booking = mockBookingData[`${day}-${hour}`];

                                return (
                                    <Grid item xs={1.5} key={day}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 1,
                                                height: 60,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: '1px solid',
                                                borderColor: booking ? alpha(theme.palette.error.main, 0.2) : 'divider',
                                                borderRadius: 2,
                                                bgcolor: booking?.status === 'Ocupado' ? alpha(theme.palette.error.main, 0.05) :
                                                    booking?.status === 'Reservado' ? alpha(theme.palette.warning.main, 0.05) : 'transparent',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                                                    borderColor: 'primary.main',
                                                }
                                            }}
                                        >
                                            {booking ? (
                                                <>
                                                    <Typography variant="caption" sx={{ fontWeight: 800, color: booking.status === 'Ocupado' ? 'error.main' : 'warning.main', fontSize: '0.65rem' }}>
                                                        {booking.status.toUpperCase()}
                                                    </Typography>
                                                    <Typography variant="caption" noWrap sx={{ width: '100%', textAlign: 'center', fontWeight: 600 }}>
                                                        {booking.user}
                                                    </Typography>
                                                </>
                                            ) : (
                                                <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700 }}>Libre</Typography>
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
    );
}
