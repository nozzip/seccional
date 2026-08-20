import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    alpha,
    useTheme,
    Grid,
} from '@mui/material';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import CelebrationIcon from '@mui/icons-material/Celebration';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import SchoolIcon from '@mui/icons-material/School';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import ElderlyIcon from '@mui/icons-material/Elderly';
import HouseSidingIcon from '@mui/icons-material/HouseSiding';
import TurismoForm from './TurismoForm';
import GremialForm from './GremialForm';
import { AffiliateData } from '../../types/mobile';

interface SolicitudesViewProps {
    affiliateData: AffiliateData | null;
}

export default function SolicitudesView({ affiliateData }: SolicitudesViewProps) {
    const [turismoOpen, setTurismoOpen] = useState(false);
    const [turismoSubsidized, setTurismoSubsidized] = useState(false);
    const [gremialOpen, setGremialOpen] = useState(false);
    const [gremialType, setGremialType] = useState('');
    const [cabinOpen, setCabinOpen] = useState(false);
    
    const theme = useTheme();

    if (!affiliateData) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">Cargando datos...</Typography>
            </Box>
        );
    }

    const handleOpenGremial = (type: string) => {
        setGremialType(type);
        setGremialOpen(true);
    };

    return (
        <Box sx={{ pb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, color: 'primary.main', textAlign: 'center' }}>
                SOLICITUDES
            </Typography>

            {/* SECCIÓN 1: TURISMO REGULAR */}
            <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', ml: 1, letterSpacing: 1.5 }}>
                Turismo Particular
            </Typography>
            <Paper 
                sx={{ 
                    p: 2.5, 
                    borderRadius: 4, 
                    mb: 4,
                    border: '1px solid',
                    borderColor: alpha(theme.palette.primary.main, 0.1),
                    background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 1)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
                }}
            >
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={2}>
                        <BeachAccessIcon color="primary" sx={{ fontSize: 40 }} />
                    </Grid>
                    <Grid item xs={10}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
                            Turismo AEFIP
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1.5, color: 'text.secondary' }}>
                            Bariloche (Hostería Peumayen), Mar del Plata (Hotel Concord), Huerta Grande (Hotel Presidente Peron), CABA (Hotel Davinci). Tarifas exclusivas.
                        </Typography>
                        <Button
                            variant="contained"
                            size="small"
                            fullWidth
                            onClick={() => {
                                setTurismoSubsidized(false);
                                setTurismoOpen(true);
                            }}
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                        >
                            Solicitar para mis vacaciones
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* SECCIÓN MOLLAR */}
            <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', ml: 1, letterSpacing: 1.5 }}>
                Cabañas El Mollar
            </Typography>
            <Paper 
                sx={{ 
                    p: 2.5, 
                    borderRadius: 4, 
                    mb: 4,
                    border: '1px solid',
                    borderColor: alpha('#4caf50', 0.1),
                    background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 1)} 0%, ${alpha('#4caf50', 0.05)} 100%)`,
                }}
            >
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={2}>
                        <HouseSidingIcon sx={{ fontSize: 40, color: '#4caf50' }} />
                    </Grid>
                    <Grid item xs={10}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
                            Reserva El Mollar
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1.5, color: 'text.secondary' }}>
                            Disfrutá de nuestras cabañas en Tafí del Valle.
                        </Typography>
                        <Button
                            variant="contained"
                            size="small"
                            fullWidth
                            color="success"
                            onClick={() => setCabinOpen(true)}
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                        >
                            Solicitar reserva de cabaña
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* SECCIÓN 2: TURISMO SUBSIDIADO */}
            <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', ml: 1, letterSpacing: 1.5 }}>
                Turismo Subsidiado (Gremiales)
            </Typography>
            <Paper sx={{ p: 2, borderRadius: 4, mb: 4, border: '1px solid', borderColor: 'divider' }}>
                <Grid container spacing={2}>
                    <Grid item xs={4}>
                        <Box 
                            component="button"
                            onClick={() => {
                                setTurismoSubsidized(true);
                                setGremialType('Matrimonio');
                                setTurismoOpen(true);
                            }}
                            sx={{ 
                                width: '100%', border: 'none', bgcolor: 'transparent', cursor: 'pointer',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, p: 1,
                                borderRadius: 2, '&:active': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                            }}
                        >
                            <FavoriteIcon sx={{ color: '#ff4081', fontSize: 28 }} />
                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.primary', textAlign: 'center' }}>Matrimonio</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={4}>
                        <Box 
                            component="button"
                            onClick={() => {
                                setTurismoSubsidized(true);
                                setGremialType('Jubilados');
                                setTurismoOpen(true);
                            }}
                            sx={{ 
                                width: '100%', border: 'none', bgcolor: 'transparent', cursor: 'pointer',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, p: 1,
                                borderRadius: 2, '&:active': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                            }}
                        >
                            <ElderlyIcon sx={{ color: '#66bb6a', fontSize: 28 }} />
                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.primary', textAlign: 'center' }}>Jubilados</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={4}>
                        <Box 
                            component="button"
                            onClick={() => {
                                setTurismoSubsidized(true);
                                setGremialType('25 años de Plata');
                                setTurismoOpen(true);
                            }}
                            sx={{ 
                                width: '100%', border: 'none', bgcolor: 'transparent', cursor: 'pointer',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, p: 1,
                                borderRadius: 2, '&:active': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                            }}
                        >
                            <MilitaryTechIcon sx={{ color: '#ffb74d', fontSize: 28 }} />
                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.primary', textAlign: 'center' }}>25 de Plata</Typography>
                        </Box>
                    </Grid>
                </Grid>
                <Typography variant="caption" sx={{ display: 'block', mt: 1, px: 1, fontStyle: 'italic', textAlign: 'center', color: 'text.secondary' }}>
                    * Estadías de 7 días sin cargo para el afiliado y acompañante. Sujeto a temporada baja.
                </Typography>
            </Paper>

            {/* SECCIÓN 3: KITS Y SUBSIDIOS */}
            <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', ml: 1, letterSpacing: 1.5 }}>
                Beneficios y Kits
            </Typography>
            <Paper sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                <Box 
                    component="button"
                    onClick={() => handleOpenGremial('Kit Nacimiento / Adopción')}
                    sx={{ 
                        width: '100%', border: 'none', bgcolor: 'transparent', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 2, p: 2.5,
                        borderBottom: '1px solid', borderColor: 'divider',
                        '&:active': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                    }}
                >
                    <ChildCareIcon color="primary" sx={{ fontSize: 32 }} />
                    <Box sx={{ textAlign: 'left' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>Kit Nacimiento / Adopción</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Ropa y accesorios para el recién nacido</Typography>
                    </Box>
                </Box>
            </Paper>

            <TurismoForm
                open={turismoOpen}
                onClose={() => setTurismoOpen(false)}
                affiliateData={affiliateData}
                isSubsidized={turismoSubsidized}
                subsidizedType={turismoSubsidized ? gremialType : ''}
            />

            <GremialForm
                open={gremialOpen}
                onClose={() => setGremialOpen(false)}
                affiliateData={affiliateData}
                type={gremialType}
            />

            <TurismoForm
                open={cabinOpen}
                onClose={() => setCabinOpen(false)}
                affiliateData={affiliateData}
                isSubsidized={false}
                subsidizedType="mollar"
            />
        </Box>
    );
}
