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
  alpha,
} from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import StarIcon from '@mui/icons-material/Star';
import BadgeIcon from '@mui/icons-material/Badge';
import GroupIcon from '@mui/icons-material/Group';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ElderlyIcon from '@mui/icons-material/Elderly';
import GavelIcon from '@mui/icons-material/Gavel';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const authorities = [
  // SECRETARIADO (Level 1, 2, 3)
  {
    name: "GARCIA SALADO KUHL, RAMIRO NICOLAS",
    role: "SECRETARIO GENERAL",
    location: "Salta",
    level: 1,
    image: `${(import.meta as any).env.BASE_URL}seccionalLogo2.png`,
  },
  {
    name: "DIVARVARO, ALDO RONALD",
    role: "SECRETARIO ADJUNTO",
    location: "Tucumán",
    level: 2,
  },
  {
    name: "RAMASCO, LUZ",
    role: "SECRETARIA DE ASUNTOS SINDICALES",
    location: "Tucumán",
    level: 3,
  },
  {
    name: "TOUZA, MARCELA BENITA",
    role: "SECRETARIA DE FINANZAS",
    location: "Salta",
    level: 3,
  },
  {
    name: "BATALLAN CORTEZ, MARTA DEL ROSARIO",
    role: "SECRETARIA DE ORGANIZACIÓN",
    location: "Salta",
    level: 3,
  },

  {
    name: "FRAGA, JORGE HORACIO",
    role: "SECRETARIO DE PRENSA Y ACTAS",
    location: "Tucumán",
    level: 3,
  },
  {
    name: "CARLOS, GONZALO DAMIÁN",
    role: "SECRETARIO DE ASUNTOS SOCIALES",
    location: "Jujuy",
    level: 3,
  },
  {
    name: "GALLARDO, RAMÓN ERNESTO",
    role: "SECRETARIO ADMINISTRATIVO",
    location: "Tucumán",
    level: 3,
  },
  {
    name: "BADINO, CRISTINA VALERIA",
    role: "SECRETARIA DE GÉNERO E IGUALDAD DE OPORTUNIDADES",
    location: "Salta",
    level: 3,
  },

  // VOCALES
  {
    name: "RODRIGUEZ, ARIEL EDGARDO",
    role: "VOCAL",
    location: "Salta",
    level: 4,
    category: "Vocales",
  },
  {
    name: "JIMENEZ, CLAUDIA ROXANA",
    role: "VOCAL",
    location: "Santiago",
    level: 4,
    category: "Vocales",
  },
  {
    name: "GARLATTI, GUSTAVO NICOLÁS",
    role: "VOCAL",
    location: "Jujuy",
    level: 4,
    category: "Vocales",
  },
  {
    name: "BUSTAMANTE, ORLANDO RAMÓN",
    role: "VOCAL",
    location: "Catamarca",
    level: 4,
    category: "Vocales",
  },
  {
    name: "ISA TORANZOS, JACQUELINE SILVANA",
    role: "VOCAL",
    location: "Salta",
    level: 4,
    category: "Vocales",
  },
  {
    name: "BAZAN, CARLOS JAVIER",
    role: "VOCAL",
    location: "Tucumán",
    level: 4,
    category: "Vocales",
  },

  // CONSEJO DIRECTIVO SUPERIOR
  {
    name: "SUAREZ, TOMAS FABRICIO",
    role: "CONSEJO DIRECTIVO SUPERIOR",
    location: "Tucumán",
    level: 4,
    category: "Consejo Directivo Superior",
  },
  {
    name: "CORDOBA, NESTOR EDUARDO",
    role: "CONSEJO DIRECTIVO SUPERIOR",
    location: "Salta",
    level: 4,
    category: "Consejo Directivo Superior",
  },
  {
    name: "MOLINA, MONICA DEL HUERTO",
    role: "CONSEJO DIRECTIVO SUPERIOR",
    location: "Tucumán",
    level: 4,
    category: "Consejo Directivo Superior",
  },
  {
    name: "FATUM, ORLANDO FABIO",
    role: "CONSEJO DIRECTIVO SUPERIOR",
    location: "Tucumán",
    level: 4,
    category: "Consejo Directivo Superior",
  },
  {
    name: "ALVAREZ, MARÍA EUGENIA",
    role: "CONSEJO DIRECTIVO SUPERIOR",
    location: "Tucumán",
    level: 4,
    category: "Consejo Directivo Superior",
  },
  {
    name: "ABRAHAM, FERNANDO GABRIEL",
    role: "CONSEJO DIRECTIVO SUPERIOR",
    location: "Oran",
    level: 4,
    category: "Consejo Directivo Superior",
  },

  // DELEGADOS A LA ASAMBLEA GENERAL
  {
    name: "ZJARIA, JOSE",
    role: "DELEGADO A LA ASAMBLEA GENERAL",
    location: "Tucumán",
    level: 4,
    category: "Delegados a la Asamblea General",
  },
  {
    name: "CALIZAYA LEBED, GASTÓN",
    role: "DELEGADO A LA ASAMBLEA GENERAL",
    location: "Salta",
    level: 4,
    category: "Delegados a la Asamblea General",
  },
  {
    name: "VERA CORONEL, VIVIANA ROMIRA",
    role: "DELEGADO A LA ASAMBLEA GENERAL",
    location: "Tucumán",
    level: 4,
    category: "Delegados a la Asamblea General",
  },
  {
    name: "MIRANDA, CELESTE NATALIA",
    role: "DELEGADO A LA ASAMBLEA GENERAL",
    location: "Salta",
    level: 4,
    category: "Delegados a la Asamblea General",
  },
  {
    name: "DELGADO, JUAN MARTIN",
    role: "DELEGADO A LA ASAMBLEA GENERAL",
    location: "Concepción",
    level: 4,
    category: "Delegados a la Asamblea General",
  },
  {
    name: "ROMANO, JULIO ANIBAL",
    role: "DELEGADO A LA ASAMBLEA GENERAL",
    location: "Tucumán",
    level: 4,
    category: "Delegados a la Asamblea General",
  },

  // COMISIÓN NACIONAL DE JUBILADOS
  {
    name: "PENNO, GABRIEL BERNARDINO",
    role: "COMISIÓN NACIONAL DE JUBILADOS",
    location: "Salta",
    level: 4,
    category: "Comisión Nacional de Jubilados",
  },
  {
    name: "PAEZ, DORA MARGARITA",
    role: "COMISIÓN NACIONAL DE JUBILADOS",
    location: "Tucumán",
    level: 4,
    category: "Comisión Nacional de Jubilados",
  },
  {
    name: "ACOSTA, FRANCISCO ROBERTO",
    role: "COMISIÓN NACIONAL DE JUBILADOS",
    location: "Tucumán",
    level: 4,
    category: "Comisión Nacional de Jubilados",
  },
  {
    name: "REARTE, SILVIA",
    role: "COMISIÓN NACIONAL DE JUBILADOS",
    location: "Santiago",
    level: 4,
    category: "Comisión Nacional de Jubilados",
  },

  // CONGRESALES F.E.F.R.A.
  {
    name: "MIRANDA, CYNTIA BETIANA",
    role: "CONGRESAL F.E.F.R.A.",
    location: "Oran",
    level: 4,
    category: "Congresales F.E.F.R.A.",
  },
  {
    name: "ARAPA, LUCIA ELENA DEL VALLE",
    role: "CONGRESAL F.E.F.R.A.",
    location: "Tucumán",
    level: 4,
    category: "Congresales F.E.F.R.A.",
  },
  {
    name: "PEREZ, JUAN CARLOS",
    role: "CONGRESAL F.E.F.R.A.",
    location: "Jujuy",
    level: 4,
    category: "Congresales F.E.F.R.A.",
  },
  {
    name: "MARTINEZ, LIA GEORGINA",
    role: "CONGRESAL F.E.F.R.A.",
    location: "Tucumán",
    level: 4,
    category: "Congresales F.E.F.R.A.",
  },
];

function AuthorityCard({ person }: { person: any }) {
  const isMain = person.level === 1;
  const isSecondary = person.level === 2;
  const isTertiary = person.level === 3;
  const isTopAuthority = isMain || isSecondary;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: isMain || isSecondary ? { xs: 'column', md: 'row' } : 'column',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: isMain ? '0 20px 40px rgba(0,0,0,0.12)' : '0 4px 12px rgba(0,0,0,0.05)',
        border: '1px solid',
        borderColor: isMain ? 'secondary.main' : 'divider',
        background: isMain
          ? 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)'
          : isSecondary
            ? 'linear-gradient(135deg, #86bfe5 0%, #b0d9f2 100%)'
            : 'background.paper',
        color: isMain ? 'white' : isSecondary ? 'secondary.main' : 'text.primary',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: isMain
            ? '0 30px 60px rgba(30, 58, 138, 0.25)'
            : '0 12px 24px rgba(0,0,0,0.08)',
        }
      }}
    >
      {person.image && (
        <CardMedia
          component="img"
          image={person.image}
          sx={{
            width: isTopAuthority ? { xs: '100%', md: 400 } : '100%',
            height: isTopAuthority ? { xs: 300, md: 'auto' } : 180,
            objectFit: person.role === 'SECRETARIO GENERAL' ? 'contain' : 'cover',
            bgcolor: person.role === 'SECRETARIO GENERAL' ? 'rgba(255,255,255,0.08)' : 'transparent',
            p: person.role === 'SECRETARIO GENERAL' ? 2 : 0,
          }}
        />
      )}
      <CardContent sx={{
        flex: 1,
        p: { xs: 3, md: 4 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        textAlign: isMain && person.image ? 'left' : 'center'
      }}>
        <Typography
          variant={isMain ? 'h3' : isSecondary ? 'h5' : 'h6'}
          sx={{
            fontWeight: 800,
            mb: 1,
            letterSpacing: -0.5,
            fontSize: isTertiary ? '1.15rem' : undefined,
            color: isMain ? 'white' : isSecondary ? 'secondary.main' : 'primary.main'
          }}
        >
          {person.name}
        </Typography>
        <Typography
          variant={isMain ? 'h5' : 'body2'}
          sx={{
            fontWeight: 600,
            opacity: isMain ? 0.9 : 0.8,
            textTransform: 'uppercase',
            letterSpacing: 1,
            color: isMain ? 'rgba(255,255,255,0.85)' : isSecondary ? 'secondary.dark' : 'text.secondary'
          }}
        >
          {person.role}
        </Typography>

        {person.location && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isMain && person.image ? 'flex-start' : 'center',
              gap: 0.5,
              mt: 2,
            }}
          >
            <LocationOnIcon
              sx={{
                fontSize: '1rem',
                color: isMain ? 'rgba(255,255,255,0.7)' : 'secondary.main',
              }}
            />
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: isMain ? 'rgba(255,255,255,0.8)' : isSecondary ? 'secondary.dark' : 'text.secondary',
                fontSize: '0.85rem',
              }}
            >
              {person.location}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function SectionHeader({ title, icon: Icon }: { title: string; icon: React.ComponentType<any> }) {
  return (
    <Box sx={{ mt: 8, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 48,
          height: 48,
          borderRadius: '50%',
          bgcolor: alpha('#1e3a8a', 0.08),
          color: 'secondary.main',
          mb: 1.5,
        }}
      >
        <Icon sx={{ fontSize: 24 }} />
      </Box>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          color: 'secondary.main',
          textAlign: 'center',
          letterSpacing: 0.5,
          fontSize: { xs: '1.4rem', md: '1.75rem' },
        }}
      >
        {title}
      </Typography>
      <Box
        sx={{
          width: 50,
          height: 3,
          bgcolor: 'primary.main',
          borderRadius: 1,
          mt: 1,
        }}
      />
    </Box>
  );
}

function Gremio() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const secretariado = authorities.filter((p) => p.level === 3);
  const vocales = authorities.filter((p) => p.category === 'Vocales');
  const consejo = authorities.filter((p) => p.category === 'Consejo Directivo Superior');
  const delegados = authorities.filter((p) => p.category === 'Delegados a la Asamblea General');
  const jubilados = authorities.filter((p) => p.category === 'Comisión Nacional de Jubilados');
  const congresales = authorities.filter((p) => p.category === 'Congresales F.E.F.R.A.');

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
            color: 'secondary.main',
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
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ width: { xs: '100%', md: '70%' } }}>
              <AuthorityCard person={authorities[1]} />
            </Box>
          </Grid>

          {/* Secretariats (Level 3) */}
          {secretariado.map((person, index) => (
            <Grid item key={index} xs={12} sm={6} md={4}>
              <AuthorityCard person={person} />
            </Grid>
          ))}
        </Grid>

        {/* Vocales */}
        <SectionHeader title="Cuerpo de Vocales" icon={GroupIcon} />
        <Grid container spacing={3}>
          {vocales.map((person, index) => (
            <Grid item key={index} xs={12} sm={6} md={4}>
              <AuthorityCard person={person} />
            </Grid>
          ))}
        </Grid>

        {/* Consejo Directivo Superior */}
        <SectionHeader title="Consejo Directivo Superior" icon={BusinessIcon} />
        <Grid container spacing={3}>
          {consejo.map((person, index) => (
            <Grid item key={index} xs={12} sm={6} md={4}>
              <AuthorityCard person={person} />
            </Grid>
          ))}
        </Grid>

        {/* Delegados a la Asamblea General */}
        <SectionHeader title="Delegados a la Asamblea General" icon={PeopleAltIcon} />
        <Grid container spacing={3}>
          {delegados.map((person, index) => (
            <Grid item key={index} xs={12} sm={6} md={4}>
              <AuthorityCard person={person} />
            </Grid>
          ))}
        </Grid>

        {/* Comisión Nacional de Jubilados */}
        <SectionHeader title="Comisión Nacional de Jubilados" icon={ElderlyIcon} />
        <Grid container spacing={3}>
          {jubilados.map((person, index) => (
            <Grid item key={index} xs={12} sm={6} md={3}>
              <AuthorityCard person={person} />
            </Grid>
          ))}
        </Grid>

        {/* Congresales F.E.F.R.A. */}
        <SectionHeader title="Congresales F.E.F.R.A." icon={GavelIcon} />
        <Grid container spacing={3}>
          {congresales.map((person, index) => (
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
              borderRadius: 2,
              bgcolor: 'secondary.main',
              color: 'white',
              textAlign: 'center',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
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
                    borderRadius: 1,
                    bgcolor: 'white',
                    color: 'secondary.main',
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
                    borderRadius: 1,
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
