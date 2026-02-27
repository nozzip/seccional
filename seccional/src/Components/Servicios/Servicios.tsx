import React, { useEffect } from 'react';
import { Box, Container, Typography, Stack } from '@mui/material';
import Mollar from './Mollar';
import Azucena from './Azucena';
import Warmi from './Warmi';

function Servicios() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Box sx={{ pt: { xs: 12, md: 16 }, pb: 10, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          sx={{
            mb: 8,
            fontWeight: 800,
            color: 'primary.main',
            textAlign: 'center',
            fontSize: { xs: '2.5rem', md: '3.5rem' }
          }}
        >
          Turismo y Servicios
        </Typography>

        <Stack spacing={6}>
          <Azucena />
          <Mollar />
          <Warmi />
        </Stack>
      </Container>
    </Box>
  );
}

export default Servicios;
