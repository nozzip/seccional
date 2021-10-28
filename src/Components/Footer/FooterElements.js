import React from 'react';
import { makeStyles, Grid } from '@material-ui/core';
import { Link } from 'react-router-dom';
import FacebookIcon from '@material-ui/icons/Facebook';
import TwitterIcon from '@material-ui/icons/Twitter';
import InstagramIcon from '@material-ui/icons/Instagram';
import WhatsAppIcon from '@material-ui/icons/WhatsApp';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#242424',
  },

  icons: {
    padding: theme.spacing(2),
  },
  footerContainer: {
    paddingTop: theme.spacing(8),
  },
  footerSubscription: {
    textAlign: 'center',
    marginBottom: '4px',
    padding: '4px',
    color: '#fff',
  },
  footerSubiscriptionHeading: {
    marginBottom: theme.spacing(2),
    fontSize: '25px',
  },
  footerLinks: {},
  footerLinkWrapper: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  socialMedia: {},
  socialMediaWrap: {
    justifyContent: 'center',
  },
  socialLogo: {
    display: 'flex',
    justifyContent: 'center',
    textAlign: 'center',
    color: '#fff',
    textDecoration: 'none',
    fontSize: '25px',
    paddingTop: theme.spacing(3),
    marginBottom: theme.spacing(10),
  },
}));

export default function FooterElements() {
  const classes = useStyles();
  return (
    <Grid container>
      <Grid item xs={12} className={classes.container}>
        <Grid item xs={12} className={classes.footerContainer}>
          <Grid item xs={12} className={classes.footerSubscription}>
            <p className={classes.footerSubiscriptionHeading}>
              ¡Seguimos comunicados en nuestras redes sociales!
            </p>
          </Grid>
          <Grid item xs={12} className={classes.footerLinks}>
            <Grid item className={classes.footerLinkWrapper}>
              <Grid className={classes.icons}>
                <a
                  href="https://www.facebook.com/aefip.seccionalnoroeste"
                  target="_blank"
                >
                  <FacebookIcon style={{ fontSize: '8vw', color: '#4267B2' }} />
                </a>
              </Grid>
              <Grid className={classes.icons}>
                <a
                  href="https://www.instagram.com/aefipseccionalnoroeste/"
                  target="_blank"
                >
                  <InstagramIcon
                    style={{ fontSize: '8vw', color: '#cd486b' }}
                  />
                </a>
              </Grid>
            </Grid>
            <Grid className={classes.footerLinkWrapper}>
              <Grid className={classes.icons}>
                <a
                  href="https://twitter.com/AEFIPNoa?ref_src=twsrc%5Etfw"
                  target="_blank"
                >
                  <TwitterIcon style={{ fontSize: '8vw', color: '#1DA1F2' }} />
                </a>
              </Grid>
              <Grid className={classes.icons}>
                <a href="https://wa.me/+5493816844462" target="_blank">
                  <WhatsAppIcon style={{ fontSize: '8vw', color: '#25D366' }} />
                </a>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} className={classes.socialMedia}>
            <Grid item xs={12} className={classes.socialMediaWrap}>
              <Link to="/" className={classes.socialLogo}>
                A.E.F.I.P Seccional Noroeste @ 2021
              </Link>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
