import React from 'react';
import { Grid, makeStyles } from '@material-ui/core';
import ServiciosGaleria from './ServiciosGaleriaMollar';
import Mollar from './Mollar';

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(20),
    height: '100%',
  },

  card: {
    borderRadius: '10px',
    boxShadow: '5px 5px 10px -06px black',
  },
}));

function Servicios() {
  const classes = useStyles();
  return (
    <Grid container className={classes.container}>
      <Grid item xs={12}>
        <Mollar />
      </Grid>
    </Grid>
  );
}

export default Servicios;

{
  /* <ServiciosGaleria /> */
}
