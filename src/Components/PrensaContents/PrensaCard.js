import { React, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { Grid } from '@material-ui/core';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import FavoriteIcon from '@material-ui/icons/Favorite';
import ShareIcon from '@material-ui/icons/Share';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { dataNoticias } from '../mockData';

const useStyles = makeStyles((theme) => ({
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },

  card: {
    display: 'flex',
    margin: theme.spacing(2, -2, 2, -2),
    borderBottom: 'solid 3px orange',
    borderRight: 'solid 3px orange',
  },
  cardtitulo: {
    fontFamily: 'Lato',
    fontWeight: '600',
    fontSize: '4vw',
  },
  cardcontent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },

  media: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
  },

  titulocontent: {
    fontSize: '6vw',
  },

  titulocontent2: {
    fontSize: '14px',
    paddingBottom: theme.spacing(3),
  },

  textocontent: {
    fontSize: '3vh',
    fontFamily: 'Helvetica',
    textIndent: '50px',
  },

  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expand2: {
    transform: 'rotate(0deg)',
    marginLeft: theme.spacing(-1),
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
}));

function PrensaCard(props) {
  const classes = useStyles();
  return (
    <Grid xs={12} className={classes.grid}>
      {dataNoticias.map((item, i) => (
        <Item key={i} item={item} />
      ))}
    </Grid>
  );
}

function Item(props) {
  const classes = useStyles();
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Grid container className={classes.card}>
      <Grid item xs={12}>
        <CardContent>
          <Typography
            className={classes.cardtitulo}
            color="textPrimary"
            component="p"
            align="left"
          >
            {props.item.title}
            <Typography>{props.item.date}</Typography>
          </Typography>
        </CardContent>
        <CardActions className={classes.actions}>
          <IconButton
            className={clsx(classes.expand2, {
              [classes.expandOpen]: expanded,
            })}
            onClick={() => handleExpandClick(props.item.id)}
            aria-expanded={expanded === props.item.id}
            aria-label="show more"
          >
            <ExpandMoreIcon />
          </IconButton>
          {/* <IconButton aria-label="add to favorites">
            <FavoriteIcon />
          </IconButton> */}
          {/* <IconButton aria-label="share">
            <ShareIcon />
          </IconButton> */}
        </CardActions>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent className={classes.cardcontent}>
            <img className={classes.media} src={props.item.thumbnail} />
            <Typography
              color="textPrimary"
              component="p"
              align="center"
              className={classes.titulocontent}
            >
              {props.item.titulo}
            </Typography>
            <Typography
              variant="h4"
              color="textSecondary"
              align="center"
              gutterBottom={true}
              className={classes.titulocontent2}
            >
              {props.item.subtitulo}
            </Typography>
            <Typography
              align="center"
              paragraph={true}
              className={classes.textocontent}
            >
              {props.item.texto}
            </Typography>
          </CardContent>
          <IconButton
            color="inherit"
            className={clsx(classes.expand, {
              [classes.expandOpen]: expanded,
            })}
            onClick={() => handleExpandClick(props.item.id)}
            aria-expanded={expanded === props.item.id}
            aria-label="show more"
          >
            <ExpandMoreIcon />
          </IconButton>
        </Collapse>
      </Grid>
    </Grid>
  );
}

export default PrensaCard;
