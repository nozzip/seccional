import React from 'react';
import {
  Grid,
  makeStyles,
  Card,
  CardContent,
  Typography,
  CardMedia,
} from '@material-ui/core';
import { FormatAlignCenterOutlined } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  container: {
    height: '100%',
  },
  grid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap:'wrap',
    justifyContent: 'center',
    padding: theme.spacing(20, 10, 20, 10),
  },

  card1: {
    display: 'flex',
    backgroundColor:'#ff9e1c',
    marginBottom: theme.spacing(2),
    width: '1000px',
    height: '300px',
    boxShadow: '1px 2px 0.5px 1px grey',
  },

  cardcontent: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  image: {
    padding:theme.spacing(1),
    maxWidth: '350px',
    minWidth:'50px',
    height: 'auto',
    fitObject:'fill',
  },

  texto:{
    textAlign:'center',
    color:'white',
    fontFamily:'Lato',
    fontWeight: '800',
    fontSize:'3.5vw',
    borderBottom:'1px solid white',
  },
  subtexto:{
    textAlign:'center',
    color:'white',
    fontFamily:'Lato',
    fontWeight: '800',
    fontSize:'3.5vw',
  },


  card2: {
    margin: theme.spacing(0, 1, 1, 0),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '500px',
    height: '300px',
    boxShadow: '1px 2px 0.5px 1px grey',
  },

  card3: {
    margin: theme.spacing(0, 1, 1, 0),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '500px',
    height: '150px',
    boxShadow: '1px 2px 0.5px 1px grey',
  },
}));

function Gremio() {
  const classes = useStyles();

  return (
    <Grid container className={classes.container}>
      <Grid item xs={12} className={classes.grid}>
        <Card className={classes.card1}>
          <CardMedia
            className={classes.image}
            component="img"
            image="https://store-images.s-microsoft.com/image/apps.64444.14416131676512756.a4895ce9-cd8d-4c80-a13c-dd63cf1980f1.4fa73540-3bb6-4190-b96c-fc69bf560940?mode=scale&q=90&h=720&w=1280"
          />
          <CardContent className={classes.cardcontent}>
            <Typography className={classes.texto}>DARUIS MIGUEL</Typography>
            <Typography className={classes.subtexto}>SECRETARIO GENERAL</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card2}>
          <CardContent>
            <Typography>NOMBRE 2</Typography>
            <Typography>PUESTO</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card2}>
          <CardContent>
            <Typography>NOMBRE 3</Typography>
            <Typography>PUESTO</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card2}>
          <CardContent>
            <Typography>NOMBRE 4</Typography>
            <Typography>PUESTO</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card2}>
          <CardContent>
            <Typography>NOMBRE 5</Typography>
            <Typography>PUESTO</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card3}>
          <CardContent>
            <Typography>NOMBRE 6</Typography>
            <Typography>PUESTO</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card3}>
          <CardContent>
            <Typography>NOMBRE 7</Typography>
            <Typography>PUESTO</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card3}>
          <CardContent>
            <Typography>NOMBRE 8</Typography>
            <Typography>PUESTO</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card3}>
          <CardContent>
            <Typography>NOMBRE 9</Typography>
            <Typography>PUESTO</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card3}>
          <CardContent>
            <Typography>NOMBRE 10</Typography>
            <Typography>PUESTO</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card3}>
          <CardContent>
            <Typography>NOMBRE 11</Typography>
            <Typography>PUESTO</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default Gremio;
