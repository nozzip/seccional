import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, IconButton, AppBar, Toolbar, useTheme, alpha, BottomNavigation, BottomNavigationAction, Paper, Tooltip } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BadgeIcon from '@mui/icons-material/Badge';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import PersonIcon from '@mui/icons-material/Person';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import MobileLogin from '../Components/Mobile/MobileLogin';
import GridBeneficios from '../Components/ContentsBeneficios/GridBeneficios';
import { Helmet } from 'react-helmet-async';
import ServiciosView from '../Components/Mobile/ServiciosView';
import CarnetView from '../Components/Mobile/CarnetView';
import PerfilView from '../Components/Mobile/PerfilView';
import SolicitudesView from '../Components/Mobile/SolicitudesView';
import { AffiliateData } from '../types/mobile';
import { useColorMode } from '../ColorModeContext';
import { supabase } from '../supabaseClient';

export default function MobileBeneficiosApp() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userName, setUserName] = useState('');
    const [affiliateData, setAffiliateData] = useState<AffiliateData | null>(null);
    const [currentTab, setCurrentTab] = useState(0);
    const theme = useTheme();
    const { toggleColorMode } = useColorMode();

    const showServiciosTab = false; // TODO: Cambiar a true cuando esté lista la base de datos de deudas de servicios

    useEffect(() => {
        const storedLegajo = localStorage.getItem('mobile_app_legajo');
        const storedName = localStorage.getItem('mobile_app_name');
        const storedCuil = localStorage.getItem('mobile_app_cuil');
        const storedToken = localStorage.getItem('mobile_app_validation_token');

        if (storedLegajo && storedName) {
            setIsAuthenticated(true);
            setUserName(storedName);
            setAffiliateData({
                legajo: storedLegajo,
                nombre: storedName.split(' ')[0] || '',
                apellido: storedName.split(' ').slice(1).join(' ') || '',
                cuil: storedCuil || '',
                validation_token: storedToken || undefined,
                telefono: localStorage.getItem('mobile_app_telefono') || '',
                email: localStorage.getItem('mobile_app_email') || '',
                es_jubilado: localStorage.getItem('mobile_app_jubilado') === 'true',
                fecha_nacimiento: localStorage.getItem('mobile_app_fecha_nacimiento') || '',
            });
        }
    }, []);

    // Effect to fetch validation_token if it's missing (for existing sessions)
    useEffect(() => {
        const fetchMissingToken = async () => {
            if (isAuthenticated && affiliateData && !affiliateData.validation_token) {
                try {
                    const { data, error } = await supabase
                        .from('affiliates')
                        .select('validation_token')
                        .eq('legajo', affiliateData.legajo)
                        .eq('branch', 'noroeste')
                        .single();
                    
                    if (data?.validation_token) {
                        localStorage.setItem('mobile_app_validation_token', data.validation_token);
                        setAffiliateData(prev => prev ? { ...prev, validation_token: data.validation_token } : null);
                    }
                } catch (err) {
                    console.error("Error fetching missing token:", err);
                }
            }
        };
        fetchMissingToken();
    }, [isAuthenticated, affiliateData]);

    const handleLoginSuccess = (data: AffiliateData) => {
        localStorage.setItem('mobile_app_legajo', data.legajo);
        localStorage.setItem('mobile_app_name', `${data.nombre} ${data.apellido}`);
        localStorage.setItem('mobile_app_cuil', data.cuil || '');
        localStorage.setItem('mobile_app_validation_token', data.validation_token || '');
        localStorage.setItem('mobile_app_telefono', data.telefono || '');
        localStorage.setItem('mobile_app_email', data.email || '');
        localStorage.setItem('mobile_app_jubilado', String(data.es_jubilado || false));
        localStorage.setItem('mobile_app_fecha_nacimiento', data.fecha_nacimiento || '');
        
        setUserName(`${data.nombre} ${data.apellido}`);
        setAffiliateData(data);
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('mobile_app_legajo');
        localStorage.removeItem('mobile_app_name');
        localStorage.removeItem('mobile_app_cuil');
        localStorage.removeItem('mobile_app_telefono');
        localStorage.removeItem('mobile_app_email');
        localStorage.removeItem('mobile_app_jubilado');
        localStorage.removeItem('mobile_app_validation_token');
        setIsAuthenticated(false);
        setUserName('');
        setAffiliateData(null);
        setCurrentTab(0);
    };

    const updateAffiliateData = (updates: Partial<AffiliateData>) => {
        if (affiliateData) {
            const newData = { ...affiliateData, ...updates };
            setAffiliateData(newData);
            if (updates.telefono !== undefined) localStorage.setItem('mobile_app_telefono', updates.telefono || '');
            if (updates.email !== undefined) localStorage.setItem('mobile_app_email', updates.email || '');
            if (updates.es_jubilado !== undefined) localStorage.setItem('mobile_app_jubilado', String(updates.es_jubilado));
            if (updates.fecha_nacimiento !== undefined) localStorage.setItem('mobile_app_fecha_nacimiento', updates.fecha_nacimiento || '');
        }
    };

    const tabs = useMemo(() => [
        { id: 'inicio', label: 'Inicio', icon: <HomeIcon />, component: <GridBeneficios /> },
        ...(showServiciosTab ? [{ id: 'servicios', label: 'Servicios', icon: <AssignmentIcon />, component: <ServiciosView affiliateData={affiliateData} /> }] : []),
        { id: 'carnet', label: 'Carnet', icon: <BadgeIcon />, component: <CarnetView affiliateData={affiliateData} /> },
        { id: 'solicitudes', label: 'Solicitudes', icon: <BeachAccessIcon />, component: <SolicitudesView affiliateData={affiliateData} /> },
        { id: 'perfil', label: 'Perfil', icon: <PersonIcon />, component: <PerfilView affiliateData={affiliateData} onUpdate={updateAffiliateData} onLogout={handleLogout} /> }
    ], [affiliateData, showServiciosTab]);

    const renderContent = () => {
        if (currentTab >= tabs.length) return <GridBeneficios />;
        return tabs[currentTab].component;
    };

    if (!isAuthenticated) {
        return (
            <>
                <Helmet>
                    <title>Login - App Beneficios</title>
                    <meta name="theme-color" content={theme.palette.primary.main} />
                </Helmet>
                <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
                    <MobileLogin onLoginSuccess={handleLoginSuccess} />
                </Box>
            </>
        );
    }

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Helmet>
                <title>App Beneficios - AEFIP</title>
                <meta name="theme-color" content={theme.palette.primary.main} />
            </Helmet>

            <AppBar position="sticky" elevation={0} sx={{ bgcolor: theme.palette.mode === 'dark' ? '#1a1a1a' : 'white', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Toolbar sx={{ maxWidth: 600, mx: 'auto', width: '100%', justifyContent: 'space-between', px: { xs: 2, sm: 0 } }}>
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                            Hola,
                        </Typography>
                        <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                            {userName}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title={theme.palette.mode === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
                            <IconButton
                                onClick={toggleColorMode}
                                color="primary"
                                sx={{
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                                }}
                            >
                                {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                            </IconButton>
                        </Tooltip>
                        <IconButton
                            onClick={handleLogout}
                            color="primary"
                            sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                            }}
                        >
                            <LogoutIcon />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            <Box sx={{ flexGrow: 1, p: 2, pt: 3, pb: 8, overflow: 'auto' }}>
                <Box sx={{ maxWidth: 600, mx: 'auto', width: '100%' }}>
                    {currentTab === 0 && (
                        <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, color: 'primary.main', textAlign: 'center' }}>
                            TUS BENEFICIOS
                        </Typography>
                    )}
                    {renderContent()}
                </Box>
            </Box>

            <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }} elevation={8}>
                <Box sx={{ maxWidth: 600, mx: 'auto', width: '100%' }}>
                    <BottomNavigation
                        value={currentTab}
                        onChange={(_, newValue) => setCurrentTab(newValue)}
                        showLabels
                        sx={{
                            height: 65,
                            bgcolor: theme.palette.mode === 'dark' ? '#1a1a1a' : 'white',
                            color: theme.palette.text.secondary,
                            '& .MuiBottomNavigationAction-root': {
                                minWidth: 0,
                                padding: '6px 8px',
                                '&.Mui-selected': {
                                    color: 'primary.main',
                                }
                            }
                        }}
                    >
                        {tabs.map((tab) => (
                            <BottomNavigationAction key={tab.id} label={tab.label} icon={tab.icon} />
                        ))}
                    </BottomNavigation>
                </Box>
            </Paper>
        </Box>
    );
}
