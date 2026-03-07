import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, AppBar, Toolbar, useTheme, alpha } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import MobileLogin from '../Components/Mobile/MobileLogin';
import GridBeneficios from '../Components/ContentsBeneficios/GridBeneficios';
import { Helmet } from 'react-helmet-async';

export default function MobileBeneficiosApp() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userName, setUserName] = useState('');
    const theme = useTheme();

    useEffect(() => {
        // Check local storage on mount
        const storedLegajo = localStorage.getItem('mobile_app_legajo');
        const storedName = localStorage.getItem('mobile_app_name');

        if (storedLegajo && storedName) {
            setIsAuthenticated(true);
            setUserName(storedName);
        }
    }, []);

    const handleLoginSuccess = (legajo: string, name: string) => {
        localStorage.setItem('mobile_app_legajo', legajo);
        localStorage.setItem('mobile_app_name', name);
        setUserName(name);
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('mobile_app_legajo');
        localStorage.removeItem('mobile_app_name');
        setIsAuthenticated(false);
        setUserName('');
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

            {/* Custom Mobile Header */}
            <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                            Hola,
                        </Typography>
                        <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                            {userName}
                        </Typography>
                    </Box>
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
                </Toolbar>
            </AppBar>

            {/* Main Content Area */}
            <Box sx={{ flexGrow: 1, p: 2, pt: 3, pb: 6 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, color: 'primary.main', textAlign: 'center' }}>
                    TUS BENEFICIOS
                </Typography>
                <GridBeneficios />
            </Box>
        </Box>
    );
}
