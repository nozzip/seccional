import React, { useEffect } from 'react';
import { Card, Box, alpha, useTheme } from '@mui/material';
import Grid from '@mui/material/Grid2';

function Twitter() {
  const theme = useTheme();

  useEffect(() => {
    // Load Twitter widgets
    const twitterScript = document.createElement('script');
    twitterScript.src = 'https://platform.twitter.com/widgets.js';
    twitterScript.async = true;
    twitterScript.charset = 'utf-8';
    document.body.appendChild(twitterScript);

    // Load Facebook SDK
    const fbScript = document.createElement('script');
    fbScript.src = 'https://connect.facebook.net/es_LA/sdk.js#xfbml=1&version=v22.0';
    fbScript.async = true;
    fbScript.defer = true;
    fbScript.crossOrigin = 'anonymous';
    document.body.appendChild(fbScript);

    return () => {
      document.body.removeChild(twitterScript);
      document.body.removeChild(fbScript);
    };
  }, []);

  return (
    <Grid container spacing={4} sx={{ width: '100%', mb: 6 }}>
      <Grid size={{ xs: 12, md: 5 }}>
        <Card
          sx={{
            borderRadius: 6,
            overflow: 'hidden',
            boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
            border: '1px solid',
            borderColor: 'divider',
            height: 500,
          }}
        >
          <a
            className="twitter-timeline"
            data-height="500"
            data-theme={theme.palette.mode}
            href="https://twitter.com/AEFIPNoa?ref_src=twsrc%5Etfw"
          >
            Tweets by AEFIPNoa
          </a>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 7 }}>
        <Card
          sx={{
            borderRadius: 6,
            overflow: 'hidden',
            boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
            border: '1px solid',
            borderColor: 'divider',
            height: 500,
            bgcolor: theme.palette.mode === 'dark' ? alpha('#1877F2', 0.05) : '#f0f2f5',
          }}
        >
          <div
            className="fb-page"
            data-href="https://www.facebook.com/AEFIPNOROESTE/"
            data-tabs="timeline"
            data-width="500"
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
          </div>
        </Card>
      </Grid>
    </Grid>
  );
}

export default Twitter;
