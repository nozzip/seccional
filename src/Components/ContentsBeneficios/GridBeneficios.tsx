import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  alpha,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { dataBeneficios } from '../mockData';

export default function GridBeneficios() {
  const [beneficios, setBeneficios] = useState(dataBeneficios);
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const categories = ['Todos', 'Tucuman', 'Catamarca', 'Salta', 'Santiago', 'Jujuy', 'Oran'];

  const filter = (provinciaId) => {
    setSelectedCategory(provinciaId);
    if (provinciaId === 'Todos') {
      setBeneficios(dataBeneficios);
    } else {
      setBeneficios(dataBeneficios.filter((item) => item.category === provinciaId));
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mb: 6 }}>
        {categories.map((cat) => (
          <Chip
            key={cat}
            label={cat === 'Tucuman' ? 'Tucumán' : cat === 'Santiago' ? 'Santiago del Estero' : cat}
            onClick={() => filter(cat)}
            color={selectedCategory === cat ? 'primary' : 'default'}
            variant={selectedCategory === cat ? 'filled' : 'outlined'}
            sx={{
              fontWeight: 700,
              px: 2,
              py: 2.5,
              fontSize: '0.9rem',
              borderRadius: '12px',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }
            }}
          />
        ))}
      </Box>

      <Grid container spacing={3}>
        {beneficios.map((item, i) => (
          <Grid item key={i} xs={12} sm={6} md={4}>
            <BenefitItem item={item} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

function BenefitItem({ item }) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Paper
        onClick={handleOpen}
        sx={{
          height: 300,
          position: 'relative',
          borderRadius: 4,
          overflow: 'hidden',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'scale(1.03) translateY(-8px)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
            '& .overlay': {
              opacity: 1,
            }
          }
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
            backgroundImage: `url(${item.thumbnail})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Box
          className="overlay"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: alpha(theme.palette.primary.main, 0.8),
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 3,
            opacity: 0,
            transition: 'opacity 0.3s ease',
            color: 'white',
            textAlign: 'center'
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            {item.title}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Click para más info
          </Typography>
        </Box>
      </Paper>

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: { borderRadius: 4, p: 1 }
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, fontWeight: 800, color: 'primary.main', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {item.title}
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ py: 3 }}>
          <Box
            sx={{
              width: '100%',
              height: 250,
              borderRadius: 3,
              mb: 3,
              backgroundImage: `url(${item.thumbnail})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <Typography variant="h6" gutterBottom sx={{ color: 'secondary.main', fontWeight: 700 }}>
            {item.location}
          </Typography>
          <Typography variant="body1" paragraph sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
            {item.short_description}
          </Typography>

          <Box sx={{ mt: 3, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              Contacto:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {item.mail}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {item.telephone}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} variant="contained" sx={{ px: 4 }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
