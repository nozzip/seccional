import React, { useEffect } from 'react';
import { Box, Container, Typography } from '@mui/material';
import PrensaCard from '../Components/PrensaContents/PrensaCard';
import { Helmet } from 'react-helmet-async';

function Prensa() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Box sx={{ pt: { xs: 12, md: 16 }, pb: 10, bgcolor: 'background.default' }}>
      <Helmet>
        <title>Prensa y Novedades - A.E.F.I.P Seccional Noroeste</title>
        <meta name="description" content="Mantente informado con las últimas noticias y avisos oficiales de nuestra seccional." />
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
            Prensa
          </Typography>
        </Box>
        <PrensaCard />
      </Container>
    </Box>
  );
}

export default Prensa;

