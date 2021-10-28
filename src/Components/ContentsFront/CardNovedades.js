import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { dataNovedades } from '../mockData';
import { Grid } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  grid: {

  },
  root: {
    borderRadius: '10px',
    boxShadow: '5px 5px 10px -06px black',
  },
  gridreturn: {
    marginTop: theme.spacing(8),

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
          <CardActionArea>
            <CardMedia
              component="img"
              alt="Novedades"
              height="88"
              src={props.item.thumbnail}
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="h2" align='center'>
                {props.item.title}
              </Typography>
              <Typography variant="body2" color="textSecondary" component="p" align='center'>
                {props.item.short_description}
              </Typography>
            </CardContent>
          </CardActionArea>

        </Card>
      </Grid>
    </Grid>
  );
}
