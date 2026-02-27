import React from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  useTheme,
  useMediaQuery,
  Slide,
  useScrollTrigger,
  Box,
  IconButton,
  alpha,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import DrawerComponent from './Drawer';
import { getGlassStyles } from '../../theme';
import { useColorMode } from '../../ColorModeContext';

function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children ?? <div />}
    </Slide>
  );
}

function Navbar(props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const { toggleColorMode } = useColorMode();

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Gremio', path: '/gremio' },
    { name: 'Servicios', path: '/servicios' },
    { name: 'Beneficios', path: '/beneficios' },
    { name: 'Prensa', path: '/prensa' },
    { name: 'Admin', path: '/admin' },
  ];

  return (
    <HideOnScroll {...props}>
      <AppBar
        position="fixed"
        sx={{
          ...getGlassStyles(theme),
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          boxShadow: 'none',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            px: { xs: 2, md: 4 },
            minHeight: { xs: 70, md: 80 },
          }}
        >
          <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
            <Box
              component="img"
              src="https://i.imgur.com/GdXnW3A.png"
              alt="logo"
              sx={{
                height: { xs: 45, md: 55 },
                width: 'auto',
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'scale(1.05)' },
                filter: theme.palette.mode === 'dark' ? 'brightness(1.2)' : 'none',
              }}
            />
          </Link>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Button
                      key={link.name}
                      component={Link}
                      to={link.path}
                      sx={{
                        color: isActive ? 'primary.main' : 'text.primary',
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '1rem',
                        px: 2,
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: '10%',
                          width: isActive ? '80%' : '0%',
                          height: '3px',
                          backgroundColor: 'primary.main',
                          transition: 'width 0.3s ease',
                        },
                        '&:hover': {
                          backgroundColor: 'transparent',
                          color: 'primary.main',
                          '&::after': { width: '80%' },
                        },
                      }}
                    >
                      {link.name}
                    </Button>
                  );
                })}
              </Box>
            )}

            <IconButton
              onClick={toggleColorMode}
              color="primary"
              aria-label="Reflejar modo oscuro"
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
              }}
            >
              {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>

            <Button
              component={Link}
              to="/login"
              variant="contained"
              sx={{
                display: { xs: 'none', sm: 'flex' },
                bgcolor: 'primary.main',
                borderRadius: 2,
                px: 3,
                fontWeight: 700,
              }}
            >
              Ingresar
            </Button>

            {isMobile && <DrawerComponent />}
          </Box>
        </Toolbar>
      </AppBar>
    </HideOnScroll>
  );
}

export default Navbar;
