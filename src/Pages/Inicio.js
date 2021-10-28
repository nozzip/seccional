import React from 'react';
import { makeStyles, Grid, Typography, Paper } from '@material-ui/core';
import Carusel from '../Components/ContentsFront/Carusel';
import CardServicios from '../Components/ContentsFront/CardServicios';
import CardNovedades from '../Components/ContentsFront/CardNovedades';
import { motion } from 'framer-motion';
import CardNoticias from '../Components/ContentsFront/CardNoticias';




const useStyles = makeStyles((theme) => ({
  gridinicio: {
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
    bacgkroundColor: '#ee7752',
    // background: 'linear-gradient(180deg, #ee7752 ,#eb8934 ,#eeb752 ,#ffffff)',

    alignItems: 'center',
  },

  section1: {
    zIndex: 1,
    background: 'URL(https://i.imgur.com/rxLBUCy.png)',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    padding: theme.spacing(30, 10, 0, 10),
    height: '60em',
  },

  titulo: {
    fontFamily: 'Lato',
    fontWeight: 600,
    color: 'Orange',
    fontSize: '8vw',
    border: '3px solid orange',
    backgroundColor: 'white',
  },
  subtitulo: {
    fontFamily: 'Lato',
    fontWeight: 600,
    color: 'white',
    fontSize: '8vw',
  },

  section2: {
    height: 'auto',
    zIndex: 0,
    marginTop: theme.spacing(-5),
    paddingBottom: theme.spacing(2),
  },

  contenedorTituloAfiliados: {
    marginLeft: theme.spacing(3),
    paddingTop: theme.spacing(5),
  },

  tituloAfiliados: {
    borderBottom: '4px solid #ee7752',
    fontFamily: 'Lato',
    fontWeight: 600,
    color: '#ee7752',
    fontSize: '10vw',
  },

  section2a: {
    margin: theme.spacing(5, 0, 5, 0),
    display: 'flex',
    flexWrap: 'wrap',
  },

  carusel: {
    padding: theme.spacing(5),
  },
  cardsAfiliados: {
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
  },

  sectionNoticiasfront: {
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ee7752',
    marginTop: theme.spacing(-5),
  },

  contenedorh1: {
    zIndex: 1,
    marginLeft: theme.spacing(3),
  },
  h1Noticiasfront: {
    borderBottom: '4px solid white',
    fontFamily: 'Lato',
    fontWeight: 600,
    color: 'white',
    fontSize: '10vw',
  },

  contenedorCardsNoticias: {
    padding: theme.spacing(0, 0, 15, 0),
  },

  section3: {
    backgroundColor: '#ee7752',
    padding: theme.spacing(0, 3, 5, 0),
  },
  h1section3: {
    borderBottom: '4px solid White',
    fontFamily: 'Lato',
    fontWeight: 600,
    color: 'white',
    fontSize: '10vw',
  },
}));

const tituloVariants = {
  hidden: {
    y: '-100vh',
    opacity: 0,
  },
  visible: {
    y: 60,
    opacity: 1,
    transition: {
      delay: 0.3,
      duration: 1.4,
      type: 'spring',
      stiffness: 75,
    },
  },
};
const caruselVariants = {
  hidden: {
    y: '100vh',
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      delay: 2,
      duration: 1.4,
      type: 'spring',
      stiffness: 75,
    },
  },
};
const novedadesVariants = {
  hidden: {
    y: '100vh',
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      delay: 2,
      duration: 1.7,
      type: 'tween',
    },
  },
};
const noticiasVariants = {
  hidden: {
    y: '-100vh',
    opacity: 0,
  },
  visible: {
    y: 60,
    opacity: 1,
    transition: {
      delay: 5,
      duration: 2,
      type: 'spring',
      stiffness: 75,
    },
  },
};
const beneficiosVariants = {
  hidden: {
    opacity: 0,
    y: '100vh',
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      ease: 'easeIn',
      duration: 1.5,
      delay: 7,
      type: 'spring',
    },
  },
};

function Inicio() {
  const classes = useStyles();

  return (
    <>
      <Grid container className={classes.gridinicio} zeroMinWidth>
        <Grid item xs={12} className={classes.section1}>
          <Grid item xs={12}>
            <motion.div
              variants={tituloVariants}
              initial="hidden"
              animate="visible"
            >
              <Typography className={classes.titulo} align="center">
                SECCIONAL NOROESTE
              </Typography>

              <Typography className={classes.subtitulo} align="center">
                A.E.F.I.P.
              </Typography>
            </motion.div>
          </Grid>
        </Grid>

        <Grid container className={classes.section2}>
          <div class="spacer layer1"></div>
          <Grid item xs={12} className={classes.contenedorTituloAfiliados}>
            <Typography align="left" className={classes.tituloAfiliados}>
              AFILIADOS
            </Typography>
          </Grid>
          <Grid item xs={12} className={classes.section2a}>
            <Grid item xs={12} md={6} className={classes.carusel}>
              <motion.div
                variants={caruselVariants}
                initial="hidden"
                animate="visible"
              >
                <Carusel />
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6} className={classes.cardsAfiliados}>
              <motion.div
                variants={novedadesVariants}
                initial="hidden"
                animate="visible"
              >
                <CardNovedades />
              </motion.div>
            </Grid>
          </Grid>
        </Grid>
        <div class="spacer layer2"></div>
      </Grid>

      <Grid item xs={12} className={classes.sectionNoticiasfront}>
        <Grid item xs={12} className={classes.contenedorh1}>
          <Typography align="left" className={classes.h1Noticiasfront}>
            NOTICIAS
          </Typography>
        </Grid>
        <Grid item xs={12} className={classes.contenedorCardsNoticias}>
          <motion.div
            variants={noticiasVariants}
            initial="hidden"
            animate="visible"
          >
            <CardNoticias />
          </motion.div>
        </Grid>
      </Grid>
      <Grid item xs={12} className={classes.section3}>
        <Typography align="right" className={classes.h1section3}>
          SERVICIOS
        </Typography>
      </Grid>

      <Grid item className={classes.sectionCardServicios}>
        <motion.div
          variants={beneficiosVariants}
          initial="hidden"
          animate="visible"
        >
          <CardServicios />
        </motion.div>
      </Grid>
    </>

    //   </Grid>

    //   <Grid container className={classes.section3a} zeroMinWidth>

    //   </Grid>
    // </Grid>
  );
}

export default Inicio;
