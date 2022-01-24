import { React, useEffect } from 'react';
import { makeStyles, Grid, Typography, Paper } from '@material-ui/core';
import Carusel from '../Components/ContentsFront/Carusel';
import CardServicios from '../Components/ContentsFront/CardServicios';
import CardNovedades from '../Components/ContentsFront/CardNovedades';
import { motion } from 'framer-motion';
import CardNoticias from '../Components/ContentsFront/CardNoticias';
import Layer1 from '../Components/Layer/Layer1';
import Layer2 from '../Components/Layer/Layer2';
import Main from '../Components/Layer/Main';
import { Link } from 'react-router-dom';

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
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    zIndex: 0,
    paddingTop: theme.spacing(7),
  },

  main: {},

  gridtitulo: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    alignSelf: 'center',
    position: 'absolute',
  },

  titulo: {
    zIndex: 1,
    fontFamily: 'Lato',
    fontWeight: 600,
    color: 'White',
    fontSize: '6vw',
    border: '3px solid white',
    padding: theme.spacing(1),
    backgroundColor: 'transparent',
    marginTop: theme.spacing(-21),
  },
  subtitulo: {
    zIndex: 1,
    fontFamily: 'Lato',
    fontWeight: 600,
    color: 'white',
    fontSize: '4vw',
  },

  spacer: {
    marginTop: theme.spacing(-5),
  },

  spacer2: {
    marginTop: theme.spacing(-1),
    transform: 'rotate(180deg)',
  },

  section2: {
    paddingBottom: theme.spacing(0),
  },

  contenedorTituloAfiliados: {
    marginLeft: theme.spacing(3),
    paddingTop: theme.spacing(4),
  },

  tituloAfiliados: {
    borderBottom: '4px solid #ee7752',
    fontFamily: 'Lato',
    fontWeight: 600,
    color: '#ee7752',
    fontSize: '6vw',
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
    marginLeft: theme.spacing(3),
    paddingTop: theme.spacing(4),
  },
  h1Noticiasfront: {
    borderBottom: '4px solid white',
    fontFamily: 'Lato',
    fontWeight: 600,
    color: 'white',
    fontSize: '6vw',
  },

  contenedorCardsNoticias: {
    padding: theme.spacing(0, 0, 15, 0),
  },

  section3: {
    backgroundColor: '#ee7752',
  },

  contenedorh1section3: {
    marginRight: theme.spacing(3),
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  h1section3: {
    borderBottom: '4px solid White',
    fontFamily: 'Lato',
    fontWeight: 600,
    color: 'white',
    fontSize: '6vw',
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
      delay: 4,
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
      delay: 5,
      type: 'spring',
    },
  },
};

function Inicio() {
  const classes = useStyles();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Grid container className={classes.gridinicio} zeroMinWidth>
        <Grid item xs={12} className={classes.section1}>
          <Grid item xs={12} className={classes.main}>
            <Main />
          </Grid>
          <motion.Grid
            item
            xs={12}
            variants={tituloVariants}
            initial="hidden"
            animate="visible"
            className={classes.gridtitulo}
          >
            <Typography className={classes.titulo} align="center" autofocus>
              SECCIONAL NOROESTE
            </Typography>

            <Typography className={classes.subtitulo} align="center">
              A.E.F.I.P.
            </Typography>
          </motion.Grid>
        </Grid>
        <Grid item xs={12} className={classes.spacer}>
          <Layer1 />
        </Grid>

        <Grid container className={classes.section2}>
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
          <Grid item xs={12} className={classes.spacer2}>
            <Layer2 />
          </Grid>
        </Grid>
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
        <Grid item xs={12} className={classes.contenedorh1section3}>
          <Typography align="right" className={classes.h1section3}>
            TURISMO
          </Typography>
        </Grid>
      </Grid>
      <Grid item className={classes.sectionCardServicios}>
        <motion.div
          variants={beneficiosVariants}
          initial="hidden"
          animate="visible"
        >
          <Link to="/Servicios" style={{ textDecoration: 'none' }}>
            <CardServicios />
          </Link>
        </motion.div>
      </Grid>
    </>
  );
}

export default Inicio;
