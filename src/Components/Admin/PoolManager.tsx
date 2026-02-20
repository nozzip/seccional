import React, { useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    TextField,
    Button,
    Stack,
    Switch,
    FormControlLabel,
    Divider,
    Paper,
    alpha,
    useTheme
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

export default function PoolManager() {
    const theme = useTheme();

    return (
        <Box>
            <Grid container spacing={4}>
                {/* Prices Section */}
                <Grid item xs={12} lg={4}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Precios de Temporada</Typography>
                    <Stack spacing={3}>
                        <TextField
                            label="Afiliados (Por día)"
                            fullWidth
                            defaultValue="$1500"
                            InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>$</Typography> }}
                        />
                        <TextField
                            label="Invitados (Por día)"
                            fullWidth
                            defaultValue="$4500"
                            InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>$</Typography> }}
                        />
                        <TextField
                            label="Abono Mensual Familiar"
                            fullWidth
                            defaultValue="$25000"
                            InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>$</Typography> }}
                        />
                        <Button variant="contained" startIcon={<SaveIcon />} fullWidth>
                            Guardar Precios
                        </Button>
                    </Stack>
                </Grid>

                {/* Schedules Section */}
                <Grid item xs={12} lg={8}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Horarios y Disponibilidad</Typography>
                    <Stack spacing={2}>
                        {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day) => (
                            <Paper
                                key={day}
                                elevation={0}
                                sx={{ p: 2, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
                                    <Typography sx={{ fontWeight: 600, width: 100 }}>{day}</Typography>
                                    <TextField size="small" defaultValue="09:00" label="Desde" sx={{ width: 120 }} />
                                    <TextField size="small" defaultValue="20:00" label="Hasta" sx={{ width: 120 }} />
                                </Box>
                                <FormControlLabel
                                    control={<Switch defaultChecked color="primary" />}
                                    label="Abierto"
                                />
                            </Paper>
                        ))}
                        <Button variant="outlined" startIcon={<SaveIcon />} sx={{ mt: 2, alignSelf: 'flex-end' }}>
                            Guardar Horarios
                        </Button>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
}
