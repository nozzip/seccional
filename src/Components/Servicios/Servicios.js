import React from 'react';
import { Grid, makeStyles } from '@material-ui/core';


const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop:'2000px',
    backgroundColor: 'grey',
  },
}));

function Servicios() {
  const classes = useStyles();
  return (
    <Grid container >
      <Grid item xs={12}>
        <div>
          <h1>ASDASDADASDAS
          </h1>
        </div>
      </Grid>
    </Grid>
  );
}

export default Servicios;
