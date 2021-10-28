import React from 'react';
import GridBeneficios from '../Components/ContentsBeneficios/GridBeneficios';
import { makeStyles, Grid, Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  grid: {
    width: '100vw',
    height: '100%',
    padding: theme.spacing(5, 10, 30, 10),
  },
  titulo: {
    paddingTop: theme.spacing(10),
    borderBottom: '4px solid #ff9e1c',
    fontFamily: 'Lato',
    fontWeight: 600,
    color: 'grey',
    fontSize: '5vw',
  },
}));

function Beneficios() {
  const classes = useStyles();
  

  return (
    <Grid container className={classes.grid} zeroMinWidth>
      <Grid item xs={12}>
        <Typography
          className={classes.titulo}
          align="right"
          gutterBottom={true}
        >
          BENEFICIOS
        </Typography>
        <GridBeneficios />
      </Grid>
    </Grid>
  );
}

export default Beneficios;
