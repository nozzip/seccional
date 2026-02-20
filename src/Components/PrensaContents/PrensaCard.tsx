import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Collapse,
  Divider,
  Button,
  alpha,
  useTheme
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { dataNoticias } from '../mockData';

export default function PrensaCard() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {dataNoticias.map((item, i) => (
        <NewsItem key={i} item={item} />
      ))}
    </Box>
  );
}

function NewsItem({ item }) {
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Card
      sx={{
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.3s ease'
      }}
    >
      <Box sx={{ p: { xs: 3, md: 4 }, position: 'relative' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: 'text.secondary' }}>
          <CalendarTodayIcon sx={{ fontSize: '1rem' }} />
          <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
            {item.date}
          </Typography>
        </Box>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: 'primary.main',
            mb: 2,
            fontSize: { xs: '1.5rem', md: '2rem' },
            lineHeight: 1.2
          }}
        >
          {item.title}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
          <Button
            onClick={handleExpandClick}
            endIcon={<ExpandMoreIcon sx={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />}
            sx={{ fontWeight: 700 }}
          >
            {expanded ? 'Leer menos' : 'Leer más'}
          </Button>
        </Box>
      </Box>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider />
        <CardContent sx={{ p: { xs: 3, md: 6 }, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
          {item.thumbnail && (
            <CardMedia
              component="img"
              image={item.thumbnail}
              alt={item.title}
              sx={{
                width: '100%',
                maxHeight: 500,
                borderRadius: 3,
                mb: 4,
                objectFit: 'cover',
                boxShadow: '0 8px 30px rgba(0,0,0,0.1)'
              }}
            />
          )}

          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: 'secondary.main',
              textAlign: 'center'
            }}
          >
            {item.titulo}
          </Typography>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 500,
              mb: 4,
              color: 'text.secondary',
              textAlign: 'center',
              fontStyle: 'italic'
            }}
          >
            {item.subtitulo}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: 'text.primary',
              lineHeight: 1.8,
              fontSize: '1.1rem',
              whiteSpace: 'pre-line'
            }}
          >
            {item.texto}
          </Typography>
        </CardContent>
      </Collapse>
    </Card>
  );
}
