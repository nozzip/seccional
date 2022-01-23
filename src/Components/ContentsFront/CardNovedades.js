import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import { dataNovedades } from '../mockData';
import { Grid } from '@material-ui/core';
import WhatsAppIcon from '@material-ui/icons/WhatsApp';

const useStyles = makeStyles((theme) => ({
  grid: {},
  root: {
    height: 'auto',
    borderRadius: '10px',
    boxShadow: '5px 5px 10px -06px black',
  },
  gridreturn: {
    paddingTop: theme.spacing(5),
  },
  font: {
    fontFamily: 'lato',
    fontWeight: '800',
  },
}));

export default function CardNovedades(props) {
  const classes = useStyles();
  return (
    <Grid container className={classes.grid}>
      <Grid item xs={12}>
        {dataNovedades.map((item, i) => (
          <Item key={i} item={item} />
        ))}
      </Grid>
    </Grid>
  );
}

function Item(props) {
  const classes = useStyles();

  return (
    <Grid container className={classes.gridreturn}>
      <Grid item xs={12}>
        <Card className={classes.root}>
          <CardMedia
            component="img"
            alt="Novedades"
            height="88"
            src={props.item.thumbnail}
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2" align="center">
              {props.item.title}
              <a href="https://wa.me/+5493816844462" target="_blank">
                <WhatsAppIcon style={{ color: '#25D366' }} fontSize="Large" />
              </a>
            </Typography>
            <Typography
              variant="h5"
              color="textPrimary"
              component="p"
              align="center"
              className={classes.font}
            >
              {props.item.short_description}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
