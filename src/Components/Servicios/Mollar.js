import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import { Grid } from '@material-ui/core';
import ServiciosGaleriaMollar from './ServiciosGaleriaMollar';

const useStyles = makeStyles((theme) => ({
  container: {
    height:'100%',
  },

  section1: {
    display: 'flex',
    boxShadow: '5px 5px 10px -06px black',
  },

  card: {
    height:'200px',



  },

  card2: {
    borderRight:'3px solid orange',
    borderRadius:'10px',
    height:'200px',
    width:'auto',

  },

  titulo: {
    paddingTop: theme.spacing(3),
    fontFamily: 'Lato',
    fontSize: '22px',
    fontWeight: '800',
  },

  subtitulo:{
    fontFamily:'Lato',
    fontSize: '12px',
    fontWeight: '800',
  },

  texto:{
    fontFamily:'Lato',
    fontSize: '10px',
    fontWeight: '800',
  },
}));

function Mollar() {
  const classes = useStyles();
  return (
    <Grid container className={classes.container}>
      <Grid item xs={12} className={classes.section1}>
        <Grid item xs={4} md={4}>
          <Card className={classes.card}>
            <ServiciosGaleriaMollar />
          </Card>
        </Grid>
        <Grid item xs={8} md={8}>
          <Card className={classes.card2}>
            <Typography align='center' className={classes.titulo}>Club Azucena</Typography>
            <Typography align='center' className={classes.subtitulo}>
              Sarmiento 480, Yerba Buena - Tucumán - San Miguel de Tucumán
            </Typography>
            <Typography align="center" className={classes.texto}>
              Ofrecemos a nuestros afiliados un lugar donde pueden disfrutar de pileta climatizada, paddle, futbol 5, etc
              <br />
              {
                'Numero de contacto: 382248788 '
              }
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default Mollar;
