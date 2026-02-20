import React from 'react';
import Carousel from 'react-material-ui-carousel';
import { Paper, Box } from '@mui/material';
import { dataCarusel } from '../mockData';

function Carusel() {
  return (
    <Box sx={{ width: '100%', borderRadius: 4, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
      <Carousel
        autoPlay={true}
        interval={5000}
        animation="fade"
        indicators={true}
        navButtonsAlwaysVisible={true}
        navButtonsProps={{
          style: {
            backgroundColor: 'rgba(255,255,255,0.3)',
            color: 'white',
          }
        }}
        activeIndicatorIconButtonProps={{
          style: {
            color: '#1a5f7a'
          }
        }}
      >
        {dataCarusel.map((item, i) => (
          <Item key={i} item={item} />
        ))}
      </Carousel>
    </Box>
  );
}

function Item({ item }) {
  return (
    <Paper
      elevation={0}
      sx={{
        height: { xs: 300, md: 500 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: 'transparent',
      }}
    >
      <Box
        component="img"
        src={item.thumbnail}
        alt="banner"
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    </Paper>
  );
}

export default Carusel;

