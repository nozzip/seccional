import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Box,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useLocation } from 'react-router-dom';

function DrawerComponent() {
  const [openDrawer, setOpenDrawer] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Gremio', path: '/gremio' },
    { name: 'Servicios', path: '/servicios' },
    { name: 'Beneficios', path: '/beneficios' },
    { name: 'Prensa', path: '/prensa' },
    { name: 'Admin', path: '/admin' },
  ];

  return (
    <>
      <Drawer
        anchor="right"
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        PaperProps={{
          sx: {
            width: 280,
            backgroundColor: 'background.paper',
            backgroundImage: 'none',
          },
        }}
      >
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Link to="/" onClick={() => setOpenDrawer(false)}>
            <Box
              component="img"
              src="https://i.imgur.com/GdXnW3A.png"
              alt="logo"
              sx={{ width: 180, mb: 1 }}
            />
          </Link>
        </Box>
        <Divider />
        <List sx={{ pt: 2 }}>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <ListItem
                key={link.name}
                onClick={() => setOpenDrawer(false)}
                disablePadding
              >
                <Button
                  component={Link}
                  to={link.path}
                  fullWidth
                  sx={{
                    justifyContent: 'flex-start',
                    px: 3,
                    py: 1.5,
                    color: isActive ? 'primary.main' : 'text.primary',
                    backgroundColor: isActive ? 'primary.light' : 'transparent',
                    opacity: isActive ? 0.1 : 1, // Hack for light background or use alpha
                    '&:hover': {
                      backgroundColor: 'primary.light',
                      opacity: 0.2,
                    },
                    borderRadius: 0,
                    fontWeight: isActive ? 700 : 500,
                  }}
                >
                  <ListItemText
                    primary={link.name}
                    primaryTypographyProps={{
                      fontSize: '1.1rem',
                      fontWeight: isActive ? 700 : 500,
                    }}
                  />
                </Button>
              </ListItem>
            );
          })}
        </List>
      </Drawer>
      <IconButton
        onClick={() => setOpenDrawer(!openDrawer)}
        sx={{ color: 'primary.main' }}
      >
        <MenuIcon fontSize="large" />
      </IconButton>
    </>
  );
}

export default DrawerComponent;

