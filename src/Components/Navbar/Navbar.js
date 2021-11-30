import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';
import useScrollTrigger from '@material-ui/core/useScrollTrigger';
import Slide from '@material-ui/core/Slide';
import { Grid, useTheme, useMediaQuery } from '@material-ui/core';
import DrawerComponent from './Drawer';

const useStyles = makeStyles((theme) => ({
  root: {
  },
  barapp: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor:
      'rgba(255, 255, 255, 1)' /* backdropFilter: 'blur(1px)', */,
  },

  button: {
    padding: theme.spacing(0),
    marginRight: '70px',
    fontSize: '16px',
    color: '#ff9e1c',
    '&:hover': {
      color: 'black',
      backgroundColor: 'white',
      borderBottom: '10px solid #ff9e1c',
      transition: 'all 0.3s ease-out',
    },
  },

  logo: {
    padding: theme.spacing(2),
    flexGrow: '1',
    maxWidth: '20vw',
    margin: theme.spacing(0, 0, 0, 3),
  },
}));

function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

function Navbar(props) {
  const classes = useStyles();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Grid container className={classes.root} zeroMinWidth>
      <Grid item xs={12}>
        <HideOnScroll {...props}>
          <AppBar className={classes.barapp}>
            <Link to="/">
              <img
                src="https://i.imgur.com/GdXnW3A.png"
                alt="logo"
                className={classes.logo}
              />
            </Link>

            <Toolbar className={classes.toolBar}>
              {isMobile ? (
                <DrawerComponent />
              ) : (
                <div>
                  <Link to="/" style={{ textDecoration: 'none' }}>
                    <Button className={classes.button}>Inicio</Button>
                  </Link>
                  <Link to="/Gremio" style={{ textDecoration: 'none' }}>
                    <Button className={classes.button}>Gremio</Button>
                  </Link>
                  <Link to="/Beneficios" style={{ textDecoration: 'none' }}>
                    <Button className={classes.button}>Beneficios</Button>
                  </Link>
                  <Link to="/Prensa" style={{ textDecoration: 'none' }}>
                    <Button className={classes.button}>Prensa</Button>
                  </Link>
                  <Link to="/Galeria" style={{ textDecoration: 'none' }}>
                    <Button className={classes.button}>Galeria</Button>
                  </Link>


                </div>
              )}
            </Toolbar>
          </AppBar>
        </HideOnScroll>
      </Grid>
    </Grid>
  );
}

export default Navbar;

{
  /* <Link to="/iniciar-sesion" style={{ textDecoration: 'none' }}>
              <Button className={classes.button}>Iniciar Sesión</Button>
            </Link> */
}
{
  /* <DropDown /> */
}
