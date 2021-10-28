import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  makeStyles,
  IconButton,
  Button,
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  listitem:{
    boxShadow: 'inset 0 0 2000px rgba(255, 255, 255, .5)',
    filter: 'blur(2px)',
  },

  list: {
    paddingTop: theme.spacing(),
  },

  logo: {
    padding: theme.spacing(4),
    flexGrow: '1',
    width:'180px',
    borderBottom:'1px solid #ff9e1c',
  },

  button: {
    padding: theme.spacing(0),
    marginRight: '70px',
    fontSize: '20px',
  },
  link: {
    padding: theme.spacing(1),
    color: '#ff9e1c',

    borderLeft: '1px solid #ff9e1c',
    

    '&:hover': {
      color: 'black',
      backgroundColor: 'white',
      borderRight: '20px solid #ff9e1c',
    },
  },

  menuicon: {
    color: '#ff9e1c ',
  },
}));

function DrawerComponent() {
  const classes = useStyles();
  const [openDrawer, setOpenDrawer] = useState(false);
  return (
    <>
      <Drawer open={openDrawer} onClose={() => setOpenDrawer(false)}>
      <Link to="/">
            <img
              src="https://i.imgur.com/GdXnW3A.png"
              alt="logo"
              className={classes.logo}
            />
          </Link>
        <List className={classes.list}>

          <ListItem onClick={() => setOpenDrawer(false)}>
            <ListItemText>
              <Button className={classes.button}>
                <Link
                  to="/"
                  className={classes.link}
                  style={{ textDecoration: 'none' }}
                >
                  Inicio
                </Link>
              </Button>
            </ListItemText>
          </ListItem>
          <ListItem onClick={() => setOpenDrawer(false)}>
            <ListItemText>
              <Button className={classes.button}>
                <Link
                  to="/beneficios"
                  className={classes.link}
                  style={{ textDecoration: 'none' }}
                >
                  Beneficios{' '}
                </Link>
              </Button>
            </ListItemText>
          </ListItem>
          <ListItem onClick={() => setOpenDrawer(false)}>
            <ListItemText>
              <Button className={classes.button}>
                <Link
                  to="/prensa"
                  className={classes.link}
                  style={{ textDecoration: 'none' }}
                >
                  Prensa{' '}
                </Link>
              </Button>
            </ListItemText>
          </ListItem>
          <ListItem onClick={() => setOpenDrawer(false)}>
            <ListItemText>
              <Button className={classes.button}>
                <Link
                  to="/galeria"
                  className={classes.link}
                  style={{ textDecoration: 'none' }}
                >
                  Galeria{' '}
                </Link>
              </Button>
            </ListItemText>
          </ListItem>
        </List>
      </Drawer>
      <IconButton onClick={() => setOpenDrawer(!openDrawer)}>
        <MenuIcon className={classes.menuicon} />
      </IconButton>
    </>
  );
}
export default DrawerComponent;
