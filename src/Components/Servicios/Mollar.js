import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import { Grid } from '@material-ui/core';
import ServiciosGaleriaMollar from './ServiciosGaleriaMollar';

const useStyles = makeStyles((theme) => ({
  container: {
    height: '100vh',
  },

  card: {
    borderRadius: '10px',
    boxShadow: '5px 5px 10px -06px black',
    display: 'flex',
    flexDirection: 'row',
    width: '100vw',
    height: '300px',
  },

  card2: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    paddingTop: theme.spacing(2),
    borderRadius: '10px',
    boxShadow: '5px 5px 10px -06px black',
    width: '100vw',
  },

  titulo: {
    fontFamily: 'Lato',
    fontSize: '3vw',
    fontWeight: '800',
  },
}));

function Mollar() {
  const classes = useStyles();
  return (
    <Grid container className={classes.container}>
      <Grid item xs={12}>
        <Card className={classes.card}>
          <ServiciosGaleriaMollar />
        </Card>
        <Card className={classes.card2}>
          <Typography className={classes.titulo}>Club Azucena</Typography>
          <Typography>

            Sarmiento 480, Yerba Buena - Tucumán - San Miguel de Tucumán
          </Typography>
          <Typography align='center'>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.Donec vel
            maximus orci, vehicula cursus urna. Etiam vel enim dolor. Praesent
            et velit vitae ex facilisis laoreet eu eget ex. Proin in tortor eu
            odio dignissim pretium non nec quam. Curabitur quis libero sodales,
            maximus ante sit amet, dictum quam. Orci varius natoque penatibus et
            magnis dis parturient montes, nascetur ridiculus mus. Donec egestas
            commodo ex, ut luctus turpis feugiat sagittis. Donec quis hendrerit
            risus, nec ultricies elit. Phasellus non tortor orci.
            <br />
            {'Vestibulum vitae dictum dui. Morbi cursus nisl sed massa malesuada ultrices.Morbi nec condimentum magna. Nunc viverra porta lectus, et ornare metus facilisis mattis. Mauris nec sapien lorem. Vestibulum eget mi. In ultricies massa non ante viverra, a venenatis justo auctor.Integer maximus tellus sed lacinia dignissim. Fusce eget urna felis consectetur interdum sit amet nec mauris. Nam non risus nonfelis porttitor tempus. Vivamus molestie fringilla dui, ascelerisque urna volutpat a'}
          </Typography>
        </Card>
      </Grid>
    </Grid>
  );
}

export default Mollar;
