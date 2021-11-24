import React from 'react';
import {
  Grid,
  makeStyles,
  Card,
  CardActionArea,
  Typography,
  CardMedia,
  CardContent,
} from '@material-ui/core';
import Prensa from '../../Pages/Prensa';
import { Link } from 'react-router-dom';

import { dataNoticias } from '../mockData';

const useStyles = makeStyles((theme) => ({
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },

  card: {
    padding: theme.spacing(0.5),
    margin: theme.spacing(2),
    width: '300px',
    height: 'auto',
    border: '1px solid white',
    boxShadow: '2px 2px 5px 2px grey',
    borderRadius: '10px',
  },

  cardmedia: {
    width: '100%',
    height: '300px',
    objectFit: 'cover',
  },

  cardcontent: {
    height: '5vh',
    border: '1px solid #ee7752',
    paddingBottom: theme.spacing(4),
  },

  typo: {
    textAlign: 'center',
    alignItems: 'center',
    height: '150px',
    fontFamily: 'Lato',
    fontWeight: 600,
    fontSize: '15px',
  },
}));

function CardNoticias(props) {
  const classes = useStyles();
  return (
    <Grid xs={12} className={classes.grid}>
      {dataNoticias.slice(0, 4).map((item, i) => (
        <Item key={i} item={item} />
      ))}
    </Grid>
  );
}

function Item(props) {
  const classes = useStyles();
  return (
    <Grid container className={classes.card}>
      <Grid item xs={12}>
        <Link to="/Prensa" style={{ textDecoration: 'none' }}>
          <Card>
            <CardActionArea>
              <CardMedia
                className={classes.cardmedia}
                component="img"
                src={props.item.thumbnail}
              />
            </CardActionArea>
            <CardContent className={classes.cardcontent}>
              <Typography className={classes.typo}>
                {props.item.title}
              </Typography>
              <Typography>{props.item.subtitle}</Typography>
            </CardContent>
          </Card>
        </Link>
      </Grid>
    </Grid>
  );
}

export default CardNoticias;
