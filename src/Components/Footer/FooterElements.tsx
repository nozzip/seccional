import React from 'react';
import { Box, Grid, Typography, Container, IconButton, Divider, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

export default function FooterElements() {
  const currentYear = new Date().getFullYear();

  return (
    <Box component="footer" sx={{ bgcolor: '#1a1a1a', color: 'white', pt: 8, pb: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="center" alignItems="center">
          <Grid item xs={12}>
            <Typography
              variant="h5"
              align="center"
              sx={{ mb: 4, fontWeight: 600, letterSpacing: 0.5 }}
            >
              ¡Seguimos comunicados en nuestras redes sociales!
            </Typography>
          </Grid>

          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 6 }}>
            {[
              { icon: <FacebookIcon />, color: '#1877F2', url: 'https://www.facebook.com/aefip.seccionalnoroeste', label: 'Facebook' },
              { icon: <InstagramIcon />, color: '#E4405F', url: 'https://www.instagram.com/aefipseccionalnoroeste/', label: 'Instagram' },
              { icon: <TwitterIcon />, color: '#1DA1F2', url: 'https://twitter.com/AEFIPNoa', label: 'Twitter' },
              { icon: <WhatsAppIcon />, color: '#25D366', url: 'https://wa.me/+5493816844462', label: 'WhatsApp' },
            ].map((social, index) => (
              <IconButton
                key={index}
                href={social.url}
                target="_blank"
                aria-label={social.label}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  p: 2,
                  '&:hover': {
                    bgcolor: social.color,
                    transform: 'translateY(-5px)',
                    transition: 'all 0.3s ease',
                  },
                }}
              >
                {React.cloneElement(social.icon, { fontSize: 'large' })}
              </IconButton>
            ))}
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 4 }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography
            component={Link}
            to="/"
            variant="body1"
            sx={{
              color: 'rgba(255,255,255,0.6)',
              textDecoration: 'none',
              fontWeight: 500,
              '&:hover': { color: 'white' },
            }}
          >
            A.E.F.I.P Seccional Noroeste © {currentYear}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', mt: 1 }}>
            Asociación de Empleados de Fiscalización e Ingresos Públicos
          </Typography>
          <Box sx={{ mt: 2 }}>
            <MuiLink
              component={Link}
              to="/admin"
              sx={{
                color: 'rgba(255,255,255,0.2)',
                textDecoration: 'none',
                fontSize: '0.75rem',
                '&:hover': { color: 'rgba(255,255,255,0.5)' }
              }}
            >
              Acceso Administración
            </MuiLink>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

