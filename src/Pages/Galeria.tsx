import React, { useEffect } from 'react';
import { Box, Container, Typography } from '@mui/material';
import FotosGaleria from '../Components/Galeria/FotosGaleria';
import { Helmet } from 'react-helmet-async';

function Galeria() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Box sx={{ pt: { xs: 12, md: 16 }, pb: 10, bgcolor: 'background.default' }}>
      <Helmet>
        <title>Galería - A.E.F.I.P Seccional Noroeste</title>
        <meta name="description" content="Recorrido visual por nuestras actividades, eventos e instalaciones." />
      </Helmet>
      <Container maxWidth="lg">
        <Box sx={{ mb: 6, borderBottom: '4px solid', borderColor: 'secondary.main', pb: 2 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              color: 'primary.main',
              textAlign: { xs: 'center', md: 'right' },
              textTransform: 'uppercase',
              letterSpacing: 2
            }}
          >
            Galería
          </Typography>
        </Box>
        <FotosGaleria />
      </Container>
    </Box>
  );
}

export default Galeria;

