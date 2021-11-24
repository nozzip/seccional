import React from 'react';
import Carousel from 'react-material-ui-carousel';
import { Paper, makeStyles, Typography } from '@material-ui/core';
import dataCarusel from '../mockData';
import { Grid } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  carousel: {
    borderRadius: '10px',
    boxShadow: '5px 5px 10px -06px black',

  },

  paper: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    maxHeight: '750px',
  },
  img: {
    height: '500px',
  },
  title: {
    width: '150px',
  },
  text: {
    fontSize: '3vw',
    paddingBottom: '20px',
  },
}));

function Carusel(props) {
  const classes = useStyles();
  return (
    <Grid item xs={12}>
      <Carousel
        className={classes.carousel}
        spacing={1}
        autoPlay={true}
        navButtonsAlwaysVisible={true}
        navButtonsProps={{
          style: {
            backgroundColor: '#ee7752',
            borderRadius: '40px',
          },
        }}
        indicators={false}
        animation="slide"
      >
        {dataCarusel.map((item, i) => (
          <Item key={i} item={item} />
        ))}
      </Carousel>
    </Grid>
  );
}

function Item(props) {
  const classes = useStyles();
  return (
    <Paper className={classes.paper}>
      <img className={classes.img} src={props.item.thumbnail} alt="imgfront" />
      <img className={classes.title} src={props.item.title} />
      <Typography align="center" className={classes.text}>
        {props.item.short_description}
      </Typography>
    </Paper>
  );
}

export default Carusel;
