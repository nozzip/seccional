import React from 'react';
import {
  Grid,
  makeStyles,
  Card,
  CardContent,
  Typography,
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  container: {
    height: '100%',
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: theme.spacing(20, 5, 20, 5),
  },

  card1: {
    marginBottom: theme.spacing(2),
    width: '1000px',
    height: '300px',
    boxShadow: '1px 2px 0.5px 1px grey',
  },

  card2: {
    width: '500px',
    height: '300px',
    boxShadow: '1px 2px 0.5px 1px grey',
  },
  card3: {
    width: '500px',
    height: '300px',
    marginBottom: theme.spacing(1),
    boxShadow: '1px 2px 0.5px 1px grey',
  },
}));

function Gremio() {
  const classes = useStyles();

  return (
    <Grid container className={classes.container}>
      <Grid item xs={12} className={classes.grid}>
        <Card className={classes.card1}>
          <CardContent>
            <Typography>ASDASDASD</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card3}>
          <CardContent>
            <Typography>ASDASDASD</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card3}>
          <CardContent>
            <Typography>ASDASDASD</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card3}>
          <CardContent>
            <Typography>ASDASDASD</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card3}>
          <CardContent>
            <Typography>ASDASDASD</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default Gremio;
