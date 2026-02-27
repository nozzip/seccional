import React from 'react';
import { Box, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const FormSuccess = () => {
  return (
    <Box
      sx={{
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3
      }}
    >
      <CheckCircleOutlineIcon color="success" sx={{ fontSize: 100 }} />
      <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
        ¡Solicitud Recibida!
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 300 }}>
        Gracias por registrarte. Hemos recibido tu información y pronto nos pondremos en contacto contigo.
      </Typography>
    </Box>
  );
};

export default FormSuccess;
