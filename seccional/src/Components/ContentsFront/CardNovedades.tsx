import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  IconButton,
  Stack,
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { dataNovedades } from '../mockData';

export default function CardNovedades() {
  return (
    <Stack spacing={3}>
      {dataNovedades.map((item, i) => (
        <NovedadItem key={i} item={item} />
      ))}
    </Stack>
  );
}

function NovedadItem({ item }) {
  return (
    <Card
      sx={{
        display: 'flex',
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'transform 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 30px rgba(0,0,0,0.1)',
        },
      }}
    >
      <CardMedia
        component="img"
        sx={{ width: 140, display: { xs: 'none', sm: 'block' } }}
        image={item.thumbnail}
        alt={item.title}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <CardContent sx={{ flex: '1 0 auto', p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {item.title}
            </Typography>
            <IconButton
              href="https://wa.me/+5493816844462"
              target="_blank"
              sx={{ color: '#25D366', mt: -1 }}
            >
              <WhatsAppIcon />
            </IconButton>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 500 }}>
            {item.short_description}
          </Typography>
        </CardContent>
      </Box>
    </Card>
  );
}

