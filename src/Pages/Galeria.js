import {React, useEffect} from 'react';
import FotosGaleria from '../Components/Galeria/FotosGaleria';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  grid: {
    width: '100%',
    height: 'auto',
    padding: theme.spacing(2),
    paddingTop: theme.spacing(5),
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

function Galeria() {
  const classes = useStyles();
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  return (
    <Grid container className={classes.grid} zeroMinWidth>
      <Grid item>
        <Typography
          className={classes.titulo}
          align="right"
          gutterBottom={true}
        >
          GALERIA DE FOTOS
        </Typography>
        <FotosGaleria />
      </Grid>
    </Grid>
  );
}

export default Galeria;
