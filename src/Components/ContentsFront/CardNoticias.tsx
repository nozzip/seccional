import React from 'react';
import {
  Grid,
  Card,
  CardActionArea,
  Typography,
  CardMedia,
  CardContent,
  Box,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { dataNoticias } from '../mockData';

function CardNoticias() {
  return (
    <Grid container spacing={3}>
      {dataNoticias.slice(0, 4).map((item, i) => (
        <Grid item key={i} xs={12} sm={6} md={3}>
          <NoticiaItem item={item} />
        </Grid>
      ))}
    </Grid>
  );
}

function NoticiaItem({ item }) {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
        },
      }}
    >
      <CardActionArea component={Link} to="/prensa" sx={{ flexGrow: 1 }}>
        <CardMedia
          component="img"
          image={item.thumbnail}
          alt={item.title}
          sx={{ height: 200, objectFit: 'cover' }}
        />
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              lineHeight: 1.3,
              mb: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {item.title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.6,
            }}
          >
            {item.subtitle}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default CardNoticias;

