import {React, useEffect} from 'react';
import { Grid, makeStyles, Typography } from '@material-ui/core';
import PrensaCard from '../Components/PrensaContents/PrensaCard';

const useStyles = makeStyles((theme) => ({
  grid: {
    width:'100%',
    height:'auto',
    padding: theme.spacing(2),
    paddingTop: theme.spacing(5),

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
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  return (
    <Grid container className={classes.grid} zeroMinWidth autofocus>
      <Grid item xs={12}>
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
