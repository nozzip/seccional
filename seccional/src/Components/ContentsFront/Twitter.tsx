import React from 'react';
import { Card, Grid, Box } from '@mui/material';

function Twitter() {
  return (
    <Grid container spacing={2}>
      <Grid item sm={6} xs={12}>
        <Card
          sx={{
            minWidth: '301px',
            borderRadius: '20px',
            overflow: 'hidden'
          }}
        >
          <a
            className="twitter-timeline"
            data-width="300"
            data-height="500"
            href="https://twitter.com/AEFIPNoa?ref_src=twsrc%5Etfw"
          >
            Tweets by AEFIPNoa
          </a>
          <script
            async
            src="https://platform.twitter.com/widgets.js"
            charSet="utf-8"
          ></script>
        </Card>
      </Grid>
      <Grid item sm={6} xs={12}>
        <Card
          sx={{
            minWidth: '503px',
            borderRadius: '20px',
            overflow: 'hidden'
          }}
        >
          <Box
            className="fb-page"
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
              className="fb-xfbml-parse-ignore"
            >
              <a href="https://www.facebook.com/AEFIPNOROESTE/">
                AEFIP Noroeste
              </a>
            </blockquote>
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
}

export default Twitter;
