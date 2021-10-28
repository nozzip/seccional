import React from 'react';
import Carousel from 'react-material-ui-carousel';
import { Paper, makeStyles } from '@material-ui/core';
import {dataCaruselSection1} from '../mockData';

const useStyles = makeStyles((theme) => ({
  carousel: {
    padding: theme.spacing(4),
    margin: theme.spacing(-1),
  },

  paper: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    padding: theme.spacing(1),
    width: '40em',
    height: '20em',
    borderRadius: '20px',
    boxShadow: '4px 10px 10px 2px black',
    backgroundColor: 'rgba(255, 0, 0, 0.4)',
  },
  img: {
    padding: theme.spacing(2),
    height: '400px',
    width: '300px',
  },
  title: {
    alignContent: 'center',
    textAlign: 'center',
    padding: theme.spacing(1),
    fontSize: '40px',
  },
  text: {
    textAlign: 'center',
    fontSize: '2em',
    padding: theme.spacing(1),
  },
}));

function Caruselsection1(props) {
  const classes = useStyles();
  return (
    <Carousel
      className={classes.carousel}
      autoPlay={true}
      NextIcon={false}
      PrevIcon={false}
      animation="slide"
      IndicatorIcon={false}
      navButtonsProps={{
        style: {
          backgroundColor: 'transparent',
          borderRadius: 0,
        },
      }}
    >
      {dataCaruselSection1.map((item, i) => (
        <Item key={i} item={item} />
      ))}
    </Carousel>
  );
}

function Item(props) {
  const classes = useStyles();
  return (
    <Paper className={classes.paper}>
      <h1 className={classes.title}>{props.item.title}</h1>
      <h2 className={classes.text}>{props.item.short_description}</h2>
    </Paper>
  );
}

export default Caruselsection1;
