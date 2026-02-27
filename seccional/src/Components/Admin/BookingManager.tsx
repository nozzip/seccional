import React, { useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Chip,
    Avatar,
    IconButton,
    Tooltip,
    Divider,
    alpha,
    useTheme
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface Booking {
    id: number;
    user: string;
    type: string;
    time: string;
    status: 'Confirmado' | 'Pendiente' | 'Cancelado';
}

interface BookingManagerProps {
    title: string;
    bookings: Booking[];
}

export default function BookingManager({ title, bookings }: BookingManagerProps) {
    const theme = useTheme();

    return (
        <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>{title}</Typography>

            <Grid container spacing={2}>
                {bookings.map((booking) => (
                    <Grid item xs={12} md={6} lg={4} key={booking.id}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2.5,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) }
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40, fontSize: '1rem' }}>
                                        {booking.user.charAt(0)}
                                    </Avatar>
                                    <Box>
                                        <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>{booking.user}</Typography>
                                        <Typography variant="caption" color="text.secondary">{booking.type}</Typography>
                                    </Box>
                                </Box>
                                <Chip
                                    label={booking.status}
                                    size="small"
                                    color={booking.status === 'Confirmado' ? 'success' : booking.status === 'Pendiente' ? 'warning' : 'error'}
                                    sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                                />
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 2 }}>
                                <AccessTimeIcon sx={{ fontSize: 18 }} />
                                <Typography variant="body2">{booking.time}</Typography>
                            </Box>

                            <Divider sx={{ mb: 2 }} />

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                <Tooltip title="Confirmar">
                                    <IconButton color="success" size="small"><CheckCircleIcon /></IconButton>
                                </Tooltip>
                                <Tooltip title="Cancelar">
                                    <IconButton color="error" size="small"><CancelIcon /></IconButton>
                                </Tooltip>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
