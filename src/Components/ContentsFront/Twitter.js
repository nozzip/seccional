import React from 'react';
import { makeStyles, Card, Grid } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  gridcontainer: {
    width: 'auto',
    display: 'flex',
    flexDirection: 'row',

  },

  card1: {
    minWidth: '301px',
    borderRadius:'20px',
  },

  card2:{
    minWidth:'503px',
    borderRadius:'20px',
  },
}));

function Twitter() {
  const classes = useStyles();
  return (
    <Grid container className={classes.gridcontainer}>
      <Grid item sm={6} xs={12}>
        <Card className={classes.card1}>
          <a
            class="twitter-timeline"
            data-width="300"
            data-height="500"
            href="https://twitter.com/AEFIPNoa?ref_src=twsrc%5Etfw"
          >
            Tweets by AEFIPNoa
          </a>
          <script
            async
            src="https://platform.twitter.com/widgets.js"
            charset="utf-8"
          ></script>
        </Card>
      </Grid>
      <Grid item sm={6} xs={12}>
        <Card className={classes.card2}>
          <div
            class="fb-page"
            data-href="https://www.facebook.com/AEFIPNOROESTE/"
            data-tabs="timeline"
            data-width="1400"
            data-height="500"
            data-small-header="true"
            data-adapt-container-width="true"
            data-hide-cover="true"
            data-show-facepile="true"
          >
            <blockquote
              cite="https://www.facebook.com/AEFIPNOROESTE/"
              class="fb-xfbml-parse-ignore"
            >
              <a href="https://www.facebook.com/AEFIPNOROESTE/">
                AEFIP Noroeste
              </a>
            </blockquote>
          </div>
        </Card>
      </Grid>
    </Grid>
  );
}

export default Twitter;
