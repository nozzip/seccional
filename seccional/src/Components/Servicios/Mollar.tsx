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
import { photosServiciosMollar } from '../mockData';

function Mollar() {
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
        <ServiceGallery photos={photosServiciosMollar} />
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
          Cabañas del Mollar
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
          El Mollar, Tucumán
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'text.primary',
            lineHeight: 1.8,
            maxWidth: '600px'
          }}
        >
          Nuestras cabañas en El Mollar brindan un espacio de confort y naturaleza para todos los afiliados. Equipadas para la estadía familiar, son el punto de partida ideal para recorrer los paisajes del Dique La Angostura y disfrutar del aire puro de la montaña.
        </Typography>
        <Box sx={{ mt: 4, p: 2, bgcolor: alpha(theme.palette.secondary.main, 0.1), borderRadius: 2, display: 'inline-block' }}>
          <Typography variant="body2" sx={{ fontWeight: 800, color: 'secondary.dark' }}>
            Informes: Seccional Noroeste
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default Mollar;
