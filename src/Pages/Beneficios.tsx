import React, { useEffect } from 'react';
import { Box, Container, Typography } from '@mui/material';
import GridBeneficios from '../Components/ContentsBeneficios/GridBeneficios';
import { Helmet } from 'react-helmet-async';

function Beneficios() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Box sx={{ pt: { xs: 12, md: 16 }, pb: 10, bgcolor: 'background.default' }}>
      <Helmet>
        <title>Beneficios - A.E.F.I.P Seccional Noroeste</title>
        <meta name="description" content="Descubre todos los beneficios, convenios y promociones exclusivas para nuestros afiliados." />
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
            Beneficios
          </Typography>
        </Box>
        <GridBeneficios />
      </Container>
    </Box>
  );
}

export default Beneficios;

