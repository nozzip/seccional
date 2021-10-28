import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { dataServicios } from '../mockData';
import { Link } from 'react-router-dom';
import Servicios from '../Servicios/Servicios';
import { Typography } from '@material-ui/core';
import { Route } from 'react-router';

const useStyles = makeStyles((theme) => ({
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  paper: {
    display: 'flex',
    width: '100%',
    height: 'auto',
    backgroundColor: 'green',
    padding: theme.spacing(0),
  },
  img: {
    width: '100%',
    height: '70vh',
    objectFit: 'cover',
  },

  contenedorTexto: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    paddingTop: theme.spacing(20),

    color: 'white',
    '&:hover': {
      transform: 'scale(1.1)',
      transition: 'all 0.2s ease-out',
      textShadow: '0px 0px 8px #ee7752',
    },
  },
  title: {
    fontFamily: 'Lato',
    fontWeight: 600,
    fontSize: '8vw',
  },
  text: {
    fontFamily: 'Lato',
    fontWeight: 100,
    fontSize: '4vw',
  },
}));

export default function CardServicios(props) {
  const classes = useStyles();

  return (
    <Grid xs={12} className={classes.grid}>
      {dataServicios.map((item, i) => (
        <Item key={i} item={item} />
      ))}
    </Grid>
  );
}

function Item(props) {
  const classes = useStyles();
  return (
    <Paper className={classes.paper}>
      <div
        className={classes.img}
        style={{
          backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.3) 0%,
            rgba(0, 0, 0, 0.6) 100%), url(${props.item.thumbnail})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <Grid container>
          <Grid item xs={12} className={classes.contenedorTexto}>
            <Typography variant="h1" align="center" className={classes.title}>
              {props.item.title}
            </Typography>
            <Typography variant="h2" align="center" className={classes.text}>
              {props.item.short_description}
            </Typography>
          </Grid>
        </Grid>
      </div>
    </Paper>
  );
}
