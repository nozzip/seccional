import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    useTheme,
    CircularProgress,
    alpha,
    Tabs,
    Tab,
    Paper,
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import { motion, AnimatePresence } from 'framer-motion';

import PerfilView from '../Components/Mobile/PerfilView';
import CarnetView from '../Components/Mobile/CarnetView';
import SolicitudesView from '../Components/Mobile/SolicitudesView';
import { AffiliateData } from '../types/mobile';
import { supabase } from '../supabaseClient';
import { getGlassStyles } from '../theme';

export default function Perfil() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [affiliateData, setAffiliateData] = useState<AffiliateData | null>(null);
    const [loading, setLoading] = useState(true);

    const tabParam = searchParams.get('tab');
    const initialTab = tabParam === 'carnet' ? 1 : tabParam === 'solicitudes' ? 2 : 0;
    const [activeTab, setActiveTab] = useState(initialTab);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
        const tabName = newValue === 1 ? 'carnet' : newValue === 2 ? 'solicitudes' : 'datos';
        setSearchParams({ tab: tabName }, { replace: true });
    };

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const storedAffiliate = localStorage.getItem('current_affiliate');
                const storedLegajo = localStorage.getItem('mobile_app_legajo') || (storedAffiliate ? JSON.parse(storedAffiliate).legajo : null);

                if (!storedLegajo) {
                    navigate('/login', { replace: true });
                    return;
                }

                // Initial load from storage if available
                if (storedAffiliate) {
                    const parsed = JSON.parse(storedAffiliate);
                    setAffiliateData({
                        legajo: parsed.legajo,
                        nombre: parsed.nombre,
                        apellido: parsed.apellido,
                        cuil: parsed.cuil || localStorage.getItem('mobile_app_cuil') || '',
                        telefono: parsed.telefono || localStorage.getItem('mobile_app_telefono') || '',
                        email: parsed.email || localStorage.getItem('mobile_app_email') || '',
                        es_jubilado: parsed.es_jubilado ?? (localStorage.getItem('mobile_app_jubilado') === 'true'),
                        validation_token: parsed.validation_token || localStorage.getItem('mobile_app_validation_token') || undefined,
                        fecha_nacimiento: parsed.fecha_nacimiento || localStorage.getItem('mobile_app_fecha_nacimiento') || '',
                        conyuge_nombre: parsed.conyuge_nombre || localStorage.getItem('mobile_app_conyuge_nombre') || '',
                        conyuge_dni: parsed.conyuge_dni || localStorage.getItem('mobile_app_conyuge_dni') || '',
                    });
                }

                // Sincronizar con Supabase
                const { data, error } = await supabase
                    .from('affiliates')
                    .select('id, nombre, apellido, legajo, cuil, telefono, email, es_jubilado, validation_token, fecha_nacimiento, conyuge_nombre, conyuge_dni')
                    .eq('legajo', storedLegajo)
                    .eq('branch', 'noroeste')
                    .maybeSingle();

                if (!error && data) {
                    const fullData: AffiliateData = {
                        legajo: data.legajo,
                        nombre: data.nombre,
                        apellido: data.apellido,
                        cuil: data.cuil || '',
                        telefono: data.telefono || '',
                        email: data.email || '',
                        es_jubilado: !!data.es_jubilado,
                        validation_token: data.validation_token || undefined,
                        fecha_nacimiento: data.fecha_nacimiento || '',
                        conyuge_nombre: data.conyuge_nombre || '',
                        conyuge_dni: data.conyuge_dni || '',
                    };

                    setAffiliateData(fullData);

                    // Keep localStorage synchronized
                    localStorage.setItem('mobile_app_legajo', data.legajo);
                    localStorage.setItem('mobile_app_name', `${data.nombre} ${data.apellido}`);
                    localStorage.setItem('mobile_app_cuil', data.cuil || '');
                    localStorage.setItem('mobile_app_validation_token', data.validation_token || '');
                    localStorage.setItem('mobile_app_telefono', data.telefono || '');
                    localStorage.setItem('mobile_app_email', data.email || '');
                    localStorage.setItem('mobile_app_jubilado', String(data.es_jubilado || false));
                    localStorage.setItem('mobile_app_fecha_nacimiento', data.fecha_nacimiento || '');
                    localStorage.setItem('mobile_app_conyuge_nombre', data.conyuge_nombre || '');
                    localStorage.setItem('mobile_app_conyuge_dni', data.conyuge_dni || '');

                    const currentStored = localStorage.getItem('current_affiliate');
                    if (currentStored) {
                        const parsed = JSON.parse(currentStored);
                        localStorage.setItem('current_affiliate', JSON.stringify({ ...parsed, ...fullData }));
                    }
                }
            } catch (err) {
                console.error("Error loading profile:", err);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [navigate]);

    const handleUpdate = (updates: Partial<AffiliateData>) => {
        if (affiliateData) {
            const newData = { ...affiliateData, ...updates };
            setAffiliateData(newData);

            if (updates.telefono !== undefined) localStorage.setItem('mobile_app_telefono', updates.telefono || '');
            if (updates.email !== undefined) localStorage.setItem('mobile_app_email', updates.email || '');
            if (updates.es_jubilado !== undefined) localStorage.setItem('mobile_app_jubilado', String(updates.es_jubilado));
            if (updates.fecha_nacimiento !== undefined) localStorage.setItem('mobile_app_fecha_nacimiento', updates.fecha_nacimiento || '');
            if (updates.conyuge_nombre !== undefined) localStorage.setItem('mobile_app_conyuge_nombre', updates.conyuge_nombre || '');
            if (updates.conyuge_dni !== undefined) localStorage.setItem('mobile_app_conyuge_dni', updates.conyuge_dni || '');

            const currentStored = localStorage.getItem('current_affiliate');
            if (currentStored) {
                const parsed = JSON.parse(currentStored);
                localStorage.setItem('current_affiliate', JSON.stringify({ ...parsed, ...newData }));
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('current_affiliate');
        localStorage.removeItem('mobile_app_legajo');
        localStorage.removeItem('mobile_app_name');
        localStorage.removeItem('mobile_app_cuil');
        localStorage.removeItem('mobile_app_telefono');
        localStorage.removeItem('mobile_app_email');
        localStorage.removeItem('mobile_app_jubilado');
        localStorage.removeItem('mobile_app_validation_token');
        localStorage.removeItem('mobile_app_fecha_nacimiento');
        localStorage.removeItem('mobile_app_conyuge_nombre');
        localStorage.removeItem('mobile_app_conyuge_dni');
        window.dispatchEvent(new Event('affiliate_login'));
        navigate('/', { replace: true });
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
            <Helmet>
                <title>Portal del Afiliado - A.E.F.I.P Seccional Noroeste</title>
                <meta name="description" content="Gestioná tu perfil de afiliado, credenciales digitales y solicitudes gremiales." />
            </Helmet>

            <Box
                sx={{
                    pt: { xs: 12, md: 14 },
                    pb: 8,
                    minHeight: '100vh',
                    background:
                        theme.palette.mode === 'light'
                            ? `linear-gradient(180deg, ${alpha(theme.palette.primary.light, 0.08)} 0%, ${theme.palette.background.default} 100%)`
                            : `linear-gradient(180deg, ${alpha(theme.palette.primary.dark, 0.15)} 0%, ${theme.palette.background.default} 100%)`,
                }}
            >
                <Container maxWidth="md">
                    {/* Header */}
                    <Box sx={{ mb: 3, textAlign: 'center' }}>
                        <Typography
                            variant="h4"
                            component="h1"
                            sx={{
                                fontWeight: 900,
                                color: 'primary.main',
                                letterSpacing: '-0.5px',
                                mb: 1,
                            }}
                        >
                            Portal del Afiliado
                        </Typography>
                        {affiliateData && (
                            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                                {affiliateData.nombre} {affiliateData.apellido}
                            </Typography>
                        )}
                        <Typography variant="body2" color="text.secondary">
                            Legajo: <strong>{affiliateData?.legajo}</strong> | Seccional Noroeste
                        </Typography>
                    </Box>

                    {/* Navigation Tabs */}
                    <Paper
                        elevation={0}
                        sx={{
                            ...getGlassStyles(theme),
                            mb: 4,
                            borderRadius: 3,
                            p: 0.5,
                            border: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <Tabs
                            value={activeTab}
                            onChange={handleTabChange}
                            variant="fullWidth"
                            indicatorColor="primary"
                            textColor="primary"
                            sx={{
                                '& .MuiTab-root': {
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    fontSize: { xs: '0.85rem', sm: '0.95rem' },
                                    minHeight: 52,
                                    borderRadius: 2.5,
                                    transition: 'all 0.2s ease',
                                    '&.Mui-selected': {
                                        color: 'primary.main',
                                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                    },
                                },
                            }}
                        >
                            <Tab
                                icon={<PersonIcon sx={{ fontSize: 20 }} />}
                                iconPosition="start"
                                label="Mi Perfil"
                            />
                            <Tab
                                icon={<BadgeIcon sx={{ fontSize: 20 }} />}
                                iconPosition="start"
                                label="Carnet Digital"
                            />
                            <Tab
                                icon={<BeachAccessIcon sx={{ fontSize: 20 }} />}
                                iconPosition="start"
                                label="Solicitudes"
                            />
                        </Tabs>
                    </Paper>

                    {/* Tab Panels */}
                    <AnimatePresence mode="wait">
                        {activeTab === 0 && (
                            <motion.div
                                key="tab-perfil"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.25 }}
                            >
                                <PerfilView
                                    affiliateData={affiliateData}
                                    onUpdate={handleUpdate}
                                    onLogout={handleLogout}
                                />
                            </motion.div>
                        )}

                        {activeTab === 1 && (
                            <motion.div
                                key="tab-carnet"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.25 }}
                            >
                                <CarnetView affiliateData={affiliateData} />
                            </motion.div>
                        )}

                        {activeTab === 2 && (
                            <motion.div
                                key="tab-solicitudes"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.25 }}
                            >
                                <SolicitudesView affiliateData={affiliateData} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Container>
            </Box>
        </>
    );
}
