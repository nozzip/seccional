import React, { useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  CardMedia,
  Button,
  Container,
  Box,
  Divider,
  Paper,
} from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';

const authorities = [
  { name: 'GARCIA SALADO KUHL, RAMIRO', role: 'SECRETARIO GENERAL', level: 1, image: 'https://store-images.s-microsoft.com/image/apps.64444.14416131676512756.a4895ce9-cd8d-4c80-a13c-dd63cf1980f1.4fa73540-3bb6-4190-b96c-fc69bf560940?mode=scale&q=90&h=720&w=1280' },
  { name: 'DIVARVARO, ALDO RONALD', role: 'SECRETARIO ADJUNTO', level: 2 },
  { name: 'RAMASCO, LUZ', role: 'SECRETARIO DE ASUNTOS SINDICALES', level: 3 },
  { name: 'GALLARDO, RAMON ERNESTO', role: 'SECRETARIO ADMINISTRATIVO', level: 3 },
  { name: 'BATALLAN CORTEZ, MARTA DEL R.', role: 'SECRETARIO DE ORGANIZACIÓN', level: 3 },
  { name: 'FRAGA, JORGE HORACIO', role: 'SECRETARIA DE PRENSA Y ACTAS', level: 3 },
  { name: 'CARLOS, GONZALO DAMIAN', role: 'SECRETARIO DE ASUNTOS SOCIALES', level: 3 },
  { name: 'TOUZA, MARCELA BENITA', role: 'SECRETARIA DE FINANZAS', level: 3 },
  { name: 'BADINO, CRISTINA VALERIA', role: 'SECRETARIA DE GÉNERO E IGUALDAD DE OPORTUNIDADES', level: 3 },
  { name: 'RODRIGUEZ, EDGARDO ARIEL', role: 'PRIMER VOCAL TITULAR', level: 4 },
  { name: 'JIMENEZ, CLAUDIA ROXANA', role: 'SEGUNDA VOCAL TITULAR', level: 4 },
  { name: 'GARLATTI, GUSTAVO NICOLAS', role: 'TERCER VOCAL TITULAR', level: 4 },
  { name: 'BUSTAMANTE, ORLANDO RAMON', role: 'PRIMERA VOCAL SUPLENTE', level: 4 },
  { name: 'ISA TORANZOS, JAQUELINE SILVANA', role: 'SEGUNDO VOCAL SUPLENTE', level: 4 },
  { name: 'BAZAN, CARLOS JAVIER', role: 'TERCERA VOCAL SUPLENTE', level: 4 },
  { name: 'MERCADO, GRISELDA DEL TRANSITO', role: 'DELEG. TIT. COMISIÓN NAC. DE JUBILADOS', level: 4 },
  { name: 'CELEDÓN, MIGUEL ÁNGEL', role: 'DELEG. TIT. COMISIÓN NAC. DE JUBILADOS', level: 4 },
  { name: 'NAVARRO, MARÍA MARTA', role: 'DELEG. SUPL. COMISIÓN NAC. DE JUBILADOS', level: 4 },
  { name: 'LITOVIC, JUAN JOSÉ', role: 'DELEG. SUPL. COMISIÓN NAC. DE JUBILADOS', level: 4 },
  { name: 'CALIZAYA, LEBED GASTÓN', role: 'CONGRESAL TITULAR A LA F.E.F.R.A.', level: 4 },
  { name: 'MERCADO, JOSÉ ANTONIO', role: 'CONGRESAL TITULAR A LA F.E.F.R.A.', level: 4 },
  { name: 'MIRANDA, CYNTIA BETIANA', role: 'CONGRESAL SUPLENTE A LA F.E.F.R.A.', level: 4 },
  { name: 'BULACIO ÁLVAREZ, LUCIANA', role: 'CONGRESAL SUPLENTE A LA F.E.F.R.A.', level: 4 },
];

function AuthorityCard({ person }: { person: any }) {
  const isMain = person.level === 1;
  const isSecondary = person.level === 2;
  const isTertiary = person.level === 3;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: isMain ? { xs: 'column', md: 'row' } : 'column',
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: isMain ? '0 20px 40px rgba(0,0,0,0.12)' : '0 4px 12px rgba(0,0,0,0.05)',
        border: '1px solid',
        borderColor: isMain ? 'primary.main' : 'divider',
        bgcolor: isMain ? 'primary.main' : 'background.paper',
        color: isMain ? 'white' : 'text.primary',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
        }
      }}
    >
      {person.image && (
        <CardMedia
          component="img"
          image={person.image}
          sx={{
            width: isMain ? { xs: '100%', md: 400 } : '100%',
            height: isMain ? { xs: 300, md: 'auto' } : 180,
            objectFit: 'cover',
          }}
        />
      )}
      <CardContent sx={{
        flex: 1,
        p: { xs: 3, md: 4 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        textAlign: isMain ? 'left' : 'center'
      }}>
        <Typography
          variant={isMain ? 'h3' : isSecondary ? 'h5' : 'h6'}
          sx={{
            fontWeight: 800,
            mb: 1,
            letterSpacing: -0.5,
            fontSize: isTertiary ? '1.1rem' : undefined,
            color: isMain ? 'white' : 'primary.main'
          }}
        >
          {person.name}
        </Typography>
        <Typography
          variant={isMain ? 'h5' : 'body2'}
          sx={{
            fontWeight: 600,
            opacity: isMain ? 0.9 : 0.7,
            textTransform: 'uppercase',
            letterSpacing: 1,
            color: isMain ? 'rgba(255,255,255,0.8)' : 'text.secondary'
          }}
        >
          {person.role}
        </Typography>
      </CardContent>
    </Card>
  );
}

function Gremio() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Box sx={{ pt: { xs: 12, md: 16 }, pb: 10, bgcolor: 'background.default' }}>
      <title>Autoridades - A.E.F.I.P Seccional Noroeste</title>
      <meta name="description" content="Conoce a las autoridades y representantes gremiales de nuestra seccional." />
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          sx={{
            textAlign: 'center',
            mb: 2,
            fontWeight: 800,
            color: 'primary.main',
            fontSize: { xs: '2.5rem', md: '3.5rem' }
          }}
        >
          Autoridades
        </Typography>
        <Typography
          variant="h5"
          sx={{
            textAlign: 'center',
            mb: 8,
            color: 'text.secondary',
            maxWidth: '800px',
            mx: 'auto'
          }}
        >
          Conocé a los representantes de nuestra seccional comprometidos con la defensa de tus derechos.
        </Typography>

        <Grid container spacing={4}>
          {/* Main Leader */}
          <Grid item xs={12}>
            <AuthorityCard person={authorities[0]} />
          </Grid>

          {/* Secondary Leader */}
          <Grid item xs={12} md={8} sx={{ mx: 'auto' }}>
            <AuthorityCard person={authorities[1]} />
          </Grid>

          {/* Secretariats (Level 3) */}
          {authorities.filter(p => p.level === 3).map((person, index) => (
            <Grid item key={index} xs={12} sm={6} md={4}>
              <AuthorityCard person={person} />
            </Grid>
          ))}

          {/* Other Members (Level 4) */}
          <Grid item xs={12}>
            <Divider sx={{ my: 4 }}>
              <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                Cuerpo Directivo y Delegados
              </Typography>
            </Divider>
          </Grid>

          {authorities.filter(p => p.level === 4).map((person, index) => (
            <Grid item key={index} xs={12} sm={6} md={3}>
              <AuthorityCard person={person} />
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 12 }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              borderRadius: 6,
              bgcolor: 'primary.main',
              color: 'white',
              textAlign: 'center'
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 4 }}>
              Documentación Institucional
            </Typography>
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} md={5}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  href="https://aefip.org.ar/images/documentos/AEFIP_Mesa_Directiva_Nacional_-_Convenio_Colectivo_de_Trabajo_CCT.pdf"
                  target="_blank"
                  startIcon={<GetAppIcon />}
                  sx={{
                    py: 2,
                    borderRadius: 3,
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                  }}
                >
                  Convenio Colectivo
                </Button>
              </Grid>
              <Grid item xs={12} md={5}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  href="https://aefip.org.ar/index.php/institucional/estatuto"
                  target="_blank"
                  sx={{
                    py: 2,
                    borderRadius: 3,
                    color: 'white',
                    borderColor: 'white',
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  Estatuto AEFIP
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}

export default Gremio;
