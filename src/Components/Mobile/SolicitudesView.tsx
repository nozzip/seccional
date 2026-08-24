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
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import { CircularProgress, Alert, List, ListItem } from '@mui/material';
import { supabase } from '../../supabaseClient';
import TurismoForm from './TurismoForm';
import GremialForm from './GremialForm';
import { AffiliateData } from '../../types/mobile';

interface WorkflowRequestItem {
    id: number;
    type: string;
    status: string;
    created_at: string;
    data?: any;
}

interface SolicitudesViewProps {
    affiliateData: AffiliateData | null;
}

export default function SolicitudesView({ affiliateData }: SolicitudesViewProps) {
    const [turismoOpen, setTurismoOpen] = useState(false);
    const [turismoSubsidized, setTurismoSubsidized] = useState(false);
    const [gremialOpen, setGremialOpen] = useState(false);
    const [gremialType, setGremialType] = useState('');
    const [cabinOpen, setCabinOpen] = useState(false);
    const [myRequests, setMyRequests] = useState<WorkflowRequestItem[]>([]);
    const [loadingRequests, setLoadingRequests] = useState(false);
    
    const theme = useTheme();

    React.useEffect(() => {
        if (affiliateData?.legajo) {
            fetchMyRequests();
        }
    }, [affiliateData]);

    const fetchMyRequests = async () => {
        if (!affiliateData?.legajo) return;
        setLoadingRequests(true);
        try {
            const { data, error } = await supabase
                .from('workflow_requests')
                .select('id, type, status, created_at, data')
                .eq('requester_info->>legajo', affiliateData.legajo)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setMyRequests(data);
            }
        } catch (err) {
            console.error('Error fetching requests in SolicitudesView:', err);
        } finally {
            setLoadingRequests(false);
        }
    };

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

            {/* SECCIÓN 4: HISTORIAL DE GESTIONES Y SOLICITUDES */}
            <Typography variant="overline" sx={{ display: 'block', fontWeight: 800, color: 'text.secondary', ml: 1, mt: 4, letterSpacing: 1.5 }}>
                Mis Gestiones Enviadas
            </Typography>
            <Paper 
                elevation={0}
                sx={{ 
                    p: { xs: 2, sm: 2.5 }, 
                    borderRadius: 4, 
                    border: '1px solid', 
                    borderColor: 'divider',
                    background: alpha(theme.palette.background.paper, 0.8),
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1 }}>
                    <AssignmentIcon color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
                        Registro de Solicitudes
                    </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Historial de trámites de turismo, reservas y beneficios enviados desde tu cuenta.
                </Typography>

                {loadingRequests ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                        <CircularProgress size={24} />
                    </Box>
                ) : myRequests.length === 0 ? (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                        No registrás solicitudes enviadas recientemente.
                    </Alert>
                ) : (
                    <List disablePadding>
                        {myRequests.map((req, idx) => {
                            const dateObj = new Date(req.created_at);
                            const fechaStr = dateObj.toLocaleDateString('es-AR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                            });
                            const horaStr = dateObj.toLocaleTimeString('es-AR', {
                                hour: '2-digit',
                                minute: '2-digit'
                            });

                            let title = 'Solicitud';
                            let icon = <AssignmentIcon color="primary" sx={{ fontSize: 24 }} />;
                            let details = '';

                            if (req.type === 'tourism') {
                                title = req.data?.hotel ? `Turismo - ${req.data.hotel}` : 'Solicitud de Turismo';
                                icon = <BeachAccessIcon sx={{ color: 'primary.main', fontSize: 24 }} />;
                                if (req.data?.check_in && req.data?.check_out) {
                                    details = `Fechas: ${req.data.check_in} al ${req.data.check_out} | Pasajeros: ${req.data.passengers || '-'}`;
                                }
                            } else if (req.type === 'cabin_reservation') {
                                title = 'Cabañas El Mollar';
                                icon = <HouseSidingIcon sx={{ color: 'success.main', fontSize: 24 }} />;
                                if (req.data?.check_in && req.data?.check_out) {
                                    details = `Estadía: ${req.data.check_in} al ${req.data.check_out} (${req.data.nights || 1} noches)`;
                                }
                            } else if (req.type === 'benefit') {
                                title = req.data?.benefit_type ? `Trámite Gremial: ${req.data.benefit_type}` : 'Trámite Gremial';
                                icon = <AssignmentIcon sx={{ color: 'warning.main', fontSize: 24 }} />;
                                if (req.data?.notes) {
                                    details = req.data.notes;
                                }
                            } else if (req.type === 'profile_update' || req.type === 'family_update') {
                                title = 'Actualización de Datos';
                                icon = <FamilyRestroomIcon sx={{ color: 'info.main', fontSize: 24 }} />;
                            }

                            return (
                                <React.Fragment key={req.id}>
                                    <ListItem 
                                        alignItems="flex-start"
                                        sx={{ 
                                            px: 1.5, 
                                            py: 1.5,
                                            borderRadius: 2,
                                            mb: 1,
                                            bgcolor: alpha(theme.palette.action.hover, 0.4),
                                            border: '1px solid',
                                            borderColor: alpha(theme.palette.divider, 0.6),
                                            flexDirection: 'column',
                                            alignItems: 'stretch'
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, gap: 1 }}>
                                            {icon}
                                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                                {title}
                                            </Typography>
                                        </Box>

                                        {details && (
                                            <Typography variant="body2" sx={{ color: 'text.secondary', ml: 4, mb: 0.5, fontSize: '0.85rem' }}>
                                                {details}
                                            </Typography>
                                        )}

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 4, mt: 0.5 }}>
                                            <AccessTimeIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                                Enviado el {fechaStr} a las {horaStr} hs
                                            </Typography>
                                        </Box>
                                    </ListItem>
                                    {idx < myRequests.length - 1 && <Box sx={{ height: 4 }} />}
                                </React.Fragment>
                            );
                        })}
                    </List>
                )}
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
