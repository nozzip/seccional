import React from 'react';
import Carousel from 'react-material-ui-carousel';
import { Paper, Typography, Box, alpha, useTheme } from '@mui/material';
import { dataCarusel, DataItem } from '../mockData';

function Caruselsection1() {
  return (
    <Carousel
      autoPlay={true}
      interval={6000}
      animation="slide"
      indicators={false}
      navButtonsAlwaysInvisible={true}
      sx={{
        borderRadius: 6,
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
        width: '100%',
        maxWidth: '1200px',
        mx: 'auto',
      }}
    >
      {dataCarusel.map((item, i) => (
        <Item key={i} item={item} />
      ))}
    </Carousel>
  );
}

function Item({ item }: { item: DataItem }) {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: { xs: 4, md: 8 },
        height: { xs: 350, md: 450 },
        textAlign: 'center',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.85)} 0%, ${alpha(theme.palette.secondary.main, 0.85)} 100%), url(${item.thumbnail})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay',
        color: 'white',
        borderRadius: 6,
      }}
    >
      <Typography
        variant="h2"
        sx={{
          fontWeight: 900,
          mb: 3,
          fontSize: { xs: '2rem', md: '3.5rem' },
          lineHeight: 1.1,
          textShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}
      >
        {item.title}
      </Typography>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 500,
          opacity: 0.9,
          fontSize: { xs: '1.1rem', md: '1.5rem' },
          maxWidth: '800px',
          textShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}
      >
        {item.short_description}
      </Typography>
    </Paper>
  );
}

export default Caruselsection1;
