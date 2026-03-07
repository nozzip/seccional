import React, { useState } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Alert, Paper, Container } from '@mui/material';
import { supabase } from '../../supabaseClient';

interface MobileLoginProps {
    onLoginSuccess: (legajo: string, name: string) => void;
}

export default function MobileLogin({ onLoginSuccess }: MobileLoginProps) {
    const [legajo, setLegajo] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!legajo.trim()) {
            setError('Por favor, ingresa tu número de legajo.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const trimmedLegajo = legajo.trim();
            // Quitamos ceros a la izquierda para armar variantes (ej: si escribe 033296 o 33296)
            const baseLegajo = trimmedLegajo.replace(/^0+/, '');
            const legajoVariations = Array.from(new Set([
                trimmedLegajo,
                baseLegajo,
                `0${baseLegajo}`
            ]));

            const { data, error: dbError } = await supabase
                .from('affiliates')
                .select('nombre, apellido, legajo')
                .in('legajo', legajoVariations)
                .eq('branch', 'noroeste')
                .limit(1);

            if (dbError) {
                setError('Error de conexión. Por favor, intenta nuevamente.');
                console.error('Login error:', dbError);
            } else if (!data || data.length === 0) {
                setError('No se encontró un afiliado con ese legajo en la seccional Noroeste.');
            } else {
                // Success
                const affiliate = data[0];
                const fullName = `${affiliate.nombre} ${affiliate.apellido}`;
                onLoginSuccess(affiliate.legajo, fullName);
            }
        } catch (err) {
            setError('Ocurrió un error inesperado al iniciar sesión.');
            console.error('Unexpected login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
            <Paper elevation={4} sx={{ p: 4, width: '100%', borderRadius: 4, textAlign: 'center' }}>
                <Box sx={{ mb: 4 }}>
                    {/* We can use the same logo image if available, else just a title */}
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
                        AEFIP Beneficios
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Ingresa tu Legajo para ver los beneficios exclusivos
                    </Typography>
                </Box>

                <form onSubmit={handleLogin}>
                    <TextField
                        fullWidth
                        label="N° de Legajo"
                        variant="outlined"
                        value={legajo}
                        onChange={(e) => setLegajo(e.target.value)}
                        disabled={loading}
                        sx={{ mb: 3 }}
                        InputProps={{
                            sx: { borderRadius: 2 }
                        }}
                    />

                    {error && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2, textAlign: 'left' }}>
                            {error}
                        </Alert>
                    )}

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={loading}
                        sx={{
                            py: 1.5,
                            borderRadius: 2,
                            fontWeight: 700,
                            fontSize: '1.1rem'
                        }}
                    >
                        {loading ? <CircularProgress size={26} color="inherit" /> : 'Ingresar'}
                    </Button>
                </form>
            </Paper>
        </Container>
    );
}
