import React, { useState } from 'react';
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
    InputAdornment
} from '@mui/material';
import LockClockIcon from '@mui/icons-material/LockClock';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import BalanceIcon from '@mui/icons-material/Balance';

interface Closure {
    time: string;
    responsible: string;
    openingCash: number;
    systemBalance: number;
    realCash: number;
    difference: number;
    status: 'Abierta' | 'Cerrada';
}

export default function CashRegistry() {
    const theme = useTheme();
    const [closures, setClosures] = useState<Closure[]>([
        {
            time: '16:00 hs',
            responsible: 'Admin Dia',
            openingCash: 5000,
            systemBalance: 12500,
            realCash: 12500,
            difference: 0,
            status: 'Cerrada'
        },
        {
            time: '24:00 hs',
            responsible: 'Admin Noche',
            openingCash: 12500,
            systemBalance: 24300,
            realCash: 0,
            difference: 0,
            status: 'Abierta'
        },
    ]);

    const activeClosure = closures.find(c => c.status === 'Abierta');

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>
                    Arqueo y Cierre de Caja
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Control de efectivo físico vs. registros del sistema (16:00 hs y 24:00 hs)
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {/* Active Closure Form */}
                <Grid item xs={12} lg={4}>
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '2px solid', borderColor: 'primary.main', position: 'relative' }}>
                        <Box sx={{ position: 'absolute', top: -12, left: 24, bgcolor: 'primary.main', px: 2, py: 0.5, borderRadius: 1 }}>
                            <Typography variant="caption" sx={{ color: 'white', fontWeight: 800 }}>TURNO ACTUAL: {activeClosure?.time}</Typography>
                        </Box>

                        <Stack spacing={3} sx={{ mt: 1 }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>CAPITAL DE APERTURA</Typography>
                                <Typography variant="h5" sx={{ fontWeight: 800 }}>${activeClosure?.openingCash.toLocaleString()}</Typography>
                            </Box>

                            <Divider />

                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>VENTAS SEGÚN SISTEMA</Typography>
                                <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>${activeClosure?.systemBalance.toLocaleString()}</Typography>
                            </Box>

                            <TextField
                                label="Efectivo Real en Caja"
                                fullWidth
                                variant="filled"
                                type="number"
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                    sx: { fontSize: '1.5rem', fontWeight: 800 }
                                }}
                            />

                            <Alert severity="info" sx={{ borderRadius: 2 }}>
                                La diferencia se calculará automáticamente al ingresar el efectivo real.
                            </Alert>

                            <Button variant="contained" fullWidth size="large" sx={{ py: 1.5, borderRadius: 2, fontWeight: 800 }} startIcon={<LockClockIcon />}>
                                Cerrar Turno {activeClosure?.time}
                            </Button>
                        </Stack>
                    </Paper>
                </Grid>

                {/* History / Previous Closures */}
                <Grid item xs={12} lg={8}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BalanceIcon color="action" /> Resumen de Jornada
                    </Typography>
                    <Stack spacing={2}>
                        {closures.map((c, idx) => (
                            <Paper
                                key={idx}
                                elevation={0}
                                sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    bgcolor: c.status === 'Cerrada' ? alpha(theme.palette.action.disabledBackground, 0.3) : 'transparent'
                                }}
                            >
                                <Grid container alignItems="center">
                                    <Grid item xs={3}>
                                        <Typography sx={{ fontWeight: 800, color: c.status === 'Cerrada' ? 'text.secondary' : 'primary.main' }}>{c.time}</Typography>
                                        <Typography variant="caption" color="text.secondary">Responsable: {c.responsible}</Typography>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Typography variant="caption" color="text.secondary">Sistema</Typography>
                                        <Typography sx={{ fontWeight: 700 }}>${c.systemBalance.toLocaleString()}</Typography>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Typography variant="caption" color="text.secondary">Real</Typography>
                                        <Typography sx={{ fontWeight: 700 }}>${c.realCash.toLocaleString()}</Typography>
                                    </Grid>
                                    <Grid item xs={3} textAlign="right">
                                        <Box sx={{
                                            display: 'inline-block',
                                            px: 2,
                                            py: 0.5,
                                            borderRadius: 1,
                                            bgcolor: c.difference === 0 ? 'success.light' : 'error.light',
                                            color: c.difference === 0 ? 'success.dark' : 'error.dark',
                                            fontWeight: 800,
                                            fontSize: '0.75rem'
                                        }}>
                                            {c.difference === 0 ? 'SIN DIFERENCIA' : `DIF: $${c.difference}`}
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Paper>
                        ))}
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
}
