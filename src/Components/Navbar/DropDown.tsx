import React, { useState } from 'react';
import {
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  alpha,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DraftsIcon from '@mui/icons-material/Drafts';
import SendIcon from '@mui/icons-material/Send';

export default function DropDown() {
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      <IconButton
        onClick={handleClick}
        color="primary"
        sx={{
          transition: 'transform 0.3s ease',
          '&:hover': { transform: 'rotate(90deg)' }
        }}
      >
        <MenuIcon fontSize="large" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1.5,
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            minWidth: 200,
            overflow: 'visible',
            '&::before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
      >
        <MenuItem onClick={handleClose} sx={{ py: 1.5, px: 2.5 }}>
          <ListItemIcon>
            <SendIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primary="Enviar" />
        </MenuItem>
        <MenuItem onClick={handleClose} sx={{ py: 1.5, px: 2.5 }}>
          <ListItemIcon>
            <DraftsIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primary="Contáctenos" />
        </MenuItem>
        <MenuItem onClick={handleClose} sx={{ py: 1.5, px: 2.5 }}>
          <ListItemIcon>
            <CalendarTodayIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primary="Calendario" />
        </MenuItem>
      </Menu>
    </Box>
  );
}
