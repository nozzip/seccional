import React, { useState } from 'react';
import { Box, Container, Paper, useTheme, alpha } from '@mui/material';
import FormSignup from './FormSignup';
import FormSuccess from './FormSuccess';
import { getGlassStyles } from '../../theme';

const Formulary = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const theme = useTheme();

  function submitForm() {
    setIsSubmitted(true);
  }

  return (
    <Box
      sx={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.palette.mode === 'light'
          ? `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.background.default, 1)} 100%)`
          : `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.2)} 0%, ${alpha(theme.palette.background.default, 1)} 100%)`,
        py: 8,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            ...getGlassStyles(theme),
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            borderRadius: 6,
            overflow: 'hidden',
            minHeight: 550,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          {/* Left Side: Branding/Image */}
          <Box
            sx={{
              flex: 1,
              bgcolor: 'primary.main',
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 6,
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                width: '150%',
                height: '150%',
                background: `radial-gradient(circle, ${alpha('#ffffff', 0.15)} 0%, transparent 70%)`,
                top: '-25%',
                left: '-25%',
              }
            }}
          >
            <Box
              component="img"
              src="https://i.imgur.com/GdXnW3A.png"
              alt="logo"
              sx={{ width: '80%', mb: 4, filter: 'brightness(0) invert(1)' }}
            />
            <Box
              component="img"
              src="https://i.imgur.com/CRZ7KOC.png" // Placeholder or similar
              alt="illustration"
              sx={{ width: '100%', maxWidth: 300, mt: 'auto', borderRadius: 4 }}
            />
          </Box>

          {/* Right Side: Form */}
          <Box
            sx={{
              flex: 1.2,
              p: { xs: 4, md: 8 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {!isSubmitted ? (
              <FormSignup submitForm={submitForm} />
            ) : (
              <FormSuccess />
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Formulary;