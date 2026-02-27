import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    alpha,
    useTheme
} from '@mui/material';
import ServiceGallery from './ServiceGallery';
import { photosWarmi } from '../mockData';

function Warmi() {
    const theme = useTheme();

    return (
        <Card
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                borderRadius: 4,
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'transform 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
                }
            }}
        >
            <Box sx={{ width: { xs: '100%', md: '40%' }, minHeight: 250 }}>
                <ServiceGallery photos={photosWarmi} />
            </Box>
            <CardContent sx={{ flex: 1, p: { xs: 3, md: 5 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 800,
                        color: 'primary.main',
                        mb: 2,
                        position: 'relative',
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: -8,
                            left: 0,
                            width: 40,
                            height: 3,
                            backgroundColor: 'secondary.main'
                        }
                    }}
                >
                    Cabañas Warmi
                </Typography>
                <Typography
                    variant="subtitle1"
                    sx={{
                        fontWeight: 700,
                        color: 'text.secondary',
                        mb: 3,
                        mt: 1
                    }}
                >
                    El Mollar, Tucumán - Valle de Tafí
                </Typography>
                <Typography
                    variant="body1"
                    sx={{
                        color: 'text.primary',
                        lineHeight: 1.8,
                        maxWidth: '600px'
                    }}
                >
                    Las Cabañas Warmi ofrecen un refugio único en la tranquilidad de El Mollar. Totalmente equipadas y con una vista privilegiada al Cerro Ñuñorco y al Dique La Angostura, son el destino perfecto para una escapada de descanso en la naturaleza de los valles tucumanos.
                </Typography>
                <Box sx={{ mt: 4, p: 2, bgcolor: alpha(theme.palette.secondary.main, 0.1), borderRadius: 2, display: 'inline-block' }}>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'secondary.dark' }}>
                        Reservas y Consultas: Contactar a la Seccional
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
}

export default Warmi;
