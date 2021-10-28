import React from 'react';
import { Grid, makeStyles, Typography } from '@material-ui/core';
import PrensaCard from '../Components/PrensaContents/PrensaCard';

const useStyles = makeStyles((theme) => ({
  grid: {
    width:'100vw',
    height:'100%',
    padding: theme.spacing(5, 10, 30, 10),
  },
  titulo: {
    paddingTop: theme.spacing(10),
    borderBottom: '4px solid #ff9e1c',
    fontFamily: 'Lato',
    fontWeight: 600,
    color: 'grey',
    fontSize:'5vw',
  },
}));

function Prensa() {
  const classes = useStyles();
  return (
    <Grid container className={classes.grid} zeroMinWidth>
      <Grid item>
        <Typography
          className={classes.titulo}
          align="right"
          gutterBottom={true}
        >
          NOTICIAS
        </Typography>
        <PrensaCard />
      </Grid>
    </Grid>
  );
}

export default Prensa;
