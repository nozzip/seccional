import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    Box, 
    Typography, 
    Paper, 
    CircularProgress, 
    Button, 
    Container,
    Avatar,
    Chip,
    useTheme,
    alpha
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { supabase } from '../../supabaseClient';

export default function AffiliateValidator() {
    const { token } = useParams<{ token: string }>();
    const [loading, setLoading] = useState(true);
    const [affiliate, setAffiliate] = useState<any>(null);
    const theme = useTheme();

    useEffect(() => {
        const validateToken = async () => {
            if (!token) return;
            
            try {
                const { data, error } = await supabase
                    .from('affiliates')
                    .select('nombre, apellido, branch, validation_token')
                    .eq('validation_token', token)
                    .single();

                if (error) throw error;
                setAffiliate(data);
            } catch (err) {
                console.error('Validation error:', err);
                setAffiliate(null);
            } finally {
                setLoading(false);
            }
        };

        validateToken();
    }, [token]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: 2 }}>
                <CircularProgress />
                <Typography variant="body1" color="text.secondary">Verificando credencial...</Typography>
            </Box>
        );
    }

    return (
        <Container maxWidth="xs" sx={{ py: 8 }}>
            <Paper 
                elevation={0}
                sx={{ 
                    p: 4, 
                    borderRadius: 4, 
                    textAlign: 'center',
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    overflow: 'hidden',
                    position: 'relative'
                }}
            >
                {/* Header Pattern */}
                <Box 
                    sx={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        right: 0, 
                        height: 80, 
                        bgcolor: affiliate ? 'primary.main' : 'error.main',
                        opacity: 0.1,
                        zIndex: 0
                    }} 
                />

                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    {affiliate ? (
                        <>
                            <Avatar 
                                sx={{ 
                                    width: 80, 
                                    height: 80, 
                                    margin: '0 auto 24px', 
                                    bgcolor: 'success.main',
                                    boxShadow: `0 8px 16px ${alpha(theme.palette.success.main, 0.4)}`
                                }}
                            >
                                <CheckCircleIcon sx={{ fontSize: 48 }} />
                            </Avatar>
                            
                            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
                                Credencial Verificada
                            </Typography>
                            
                            <Chip 
                                icon={<VerifiedUserIcon />} 
                                label="Afiliado Activo" 
                                color="success" 
                                sx={{ mb: 4, fontWeight: 700, borderRadius: 2 }} 
                            />

                            <Box sx={{ textAlign: 'left', mb: 4, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                                    TITULAR
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 700, mb: 2, fontSize: '1.2rem' }}>
                                    {affiliate.nombre} {affiliate.apellido}
                                </Typography>

                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                                    SECCIONAL
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {affiliate.branch || 'Noroeste'}
                                </Typography>
                            </Box>
                        </>
                    ) : (
                        <>
                            <Avatar 
                                sx={{ 
                                    width: 80, 
                                    height: 80, 
                                    margin: '0 auto 24px', 
                                    bgcolor: 'error.main',
                                    boxShadow: `0 8px 16px ${alpha(theme.palette.error.main, 0.4)}`
                                }}
                            >
                                <ErrorIcon sx={{ fontSize: 48 }} />
                            </Avatar>
                            
                            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
                                Validación Fallida
                            </Typography>
                            
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                                La credencial escaneada no es válida o ha expirado. Por favor, contacte a la seccional.
                            </Typography>
                        </>
                    )}

                    <Button 
                        component={Link} 
                        to="/" 
                        variant="outlined" 
                        fullWidth
                        sx={{ borderRadius: 2, py: 1.5, fontWeight: 700 }}
                    >
                        Volver al Inicio
                    </Button>
                </Box>
            </Paper>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                    © {new Date().getFullYear()} A.E.F.I.P. Seccional Noroeste
                    <br />
                    Sistema de Validación Digital
                </Typography>
            </Box>
        </Container>
    );
}
