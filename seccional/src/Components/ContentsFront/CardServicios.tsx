import React from 'react';
import { Box, Typography, Paper, Grid, Container } from '@mui/material';
import { dataServicios } from '../mockData';

export default function CardServicios() {
  return (
    <Box sx={{ width: '100%', py: 4 }}>
      {dataServicios.map((item, i) => (
        <ServicioItem key={i} item={item} />
      ))}
    </Box>
  );
}

function ServicioItem({ item }) {
  return (
    <Paper
      sx={{
        position: 'relative',
        height: { xs: 300, md: 500 },
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
        mb: 4,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 100%), url(${item.thumbnail})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'transform 0.5s ease',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        }}
      />
      <Box
        sx={{
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          p: { xs: 4, md: 8 },
          color: 'white',
          textAlign: 'left',
          pointerEvents: 'none',
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontSize: { xs: '2rem', md: '3.5rem' },
            fontWeight: 800,
            mb: 2,
            textShadow: '0 2px 10px rgba(0,0,0,0.3)',
          }}
        >
          {item.title}
        </Typography>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 400,
            opacity: 0.9,
            maxWidth: '600px',
            textShadow: '0 1px 5px rgba(0,0,0,0.3)',
          }}
        >
          {item.short_description}
        </Typography>
      </Box>
    </Paper>
  );
}

