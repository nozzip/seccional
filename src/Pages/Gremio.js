import React from 'react';
import {
  Grid,
  makeStyles,
  Card,
  CardContent,
  Typography,
  CardMedia,
  Button,
} from '@material-ui/core';
import GetAppIcon from '@material-ui/icons/GetApp';

const useStyles = makeStyles((theme) => ({
  container: {
    height: '100%',
  },
  grid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: theme.spacing(20, 10, 5, 10),
  },

  card1: {
    display: 'flex',
    backgroundColor: '#ff9e1c',
    marginBottom: theme.spacing(2),
    width: '1000px',
    height: '300px',
    boxShadow: '1px 2px 0.5px 1px grey',
  },

  cardcontent: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  image: {
    padding: theme.spacing(1),
    maxWidth: '350px',
    minWidth: '50px',
    height: 'auto',
    fitObject: 'fill',
  },

  texto: {
    textAlign: 'center',
    color: 'white',
    fontFamily: 'Lato',
    fontWeight: '800',
    fontSize: '3.5vw',
    borderBottom: '1px solid white',
  },
  texto1: {
    textAlign: 'center',
    color: 'orange',
    fontFamily: 'Lato',
    fontWeight: '800',
    fontSize: '3vw',
    borderBottom: '1px solid grey',
  },
  texto2: {
    textAlign: 'center',
    color: 'orange',
    fontFamily: 'Lato',
    fontWeight: '800',
    fontSize: '18px',
    borderBottom: '1px solid grey',
  },
  subtexto: {
    textAlign: 'center',
    color: 'white',
    fontFamily: 'Lato',
    fontWeight: '800',
    fontSize: '3.5vw',
  },
  subtexto1: {
    textAlign: 'center',
    color: 'grey',
    fontFamily: 'Lato',
    fontWeight: '800',
    fontSize: '3vw',
  },

  subtexto2: {
    textAlign: 'center',
    color: 'grey',
    fontFamily: 'Lato',
    fontWeight: '800',
    fontSize: '18px',
  },

  card2: {
    margin: theme.spacing(0, 1, 1, 0),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1000px',
    height: '200px',
    boxShadow: '1px 2px 0.5px 1px grey',
  },

  card3: {
    margin: theme.spacing(0, 1, 1, 0),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '500px',
    height: '150px',
    boxShadow: '1px 2px 0.5px 1px grey',
  },

  card4: {
    margin: theme.spacing(0, 1, 1, 0),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '400px',
    height: '150px',
    boxShadow: '1px 2px 0.5px 1px grey',
  },

  convenio: {
    display: 'flex',
    justifyContent: 'center',
    padding: theme.spacing(10, 10, 10, 10),
  },

  textoconvenio: {
    fontFamily: 'Lato',
    fontWeight: '800',
    fontSize: '4vw',
  },

  button: {
    color: 'orange',
    '&:hover': {
      color: 'white',

      backgroundColor: 'orange',
      transition: 'all 0.3s ease-out',
    },
  },
}));

function Gremio() {
  const classes = useStyles();

  return (
    <Grid container className={classes.container}>
      <Grid item xs={12} className={classes.grid}>
        <Card className={classes.card1}>
          <CardMedia
            className={classes.image}
            component="img"
            image="https://store-images.s-microsoft.com/image/apps.64444.14416131676512756.a4895ce9-cd8d-4c80-a13c-dd63cf1980f1.4fa73540-3bb6-4190-b96c-fc69bf560940?mode=scale&q=90&h=720&w=1280"
          />
          <CardContent className={classes.cardcontent}>
            <Typography className={classes.texto}>DARUIS MIGUEL</Typography>
            <Typography className={classes.subtexto}>
              SECRETARIO GENERAL
            </Typography>
          </CardContent>
        </Card>
        <Card className={classes.card2}>
          <CardContent>
            <Typography className={classes.texto1}>
              García Salado, Ramiro Nicolás
            </Typography>
            <Typography className={classes.subtexto1}>
              Secretario Adjunto
            </Typography>
          </CardContent>
        </Card>
        <Card className={classes.card3}>
          <CardContent>
            <Typography className={classes.texto2}>
              Flores, Jorge David
            </Typography>
            <Typography className={classes.subtexto2}>
              Secretario Asuntos Sindicales
            </Typography>
          </CardContent>
        </Card>
        <Card className={classes.card3}>
          <CardContent>
            <Typography className={classes.texto2}>
              Sáenz, Jorge Alberto
            </Typography>
            <Typography className={classes.subtexto2}>
              Secretario de Finanzas
            </Typography>
          </CardContent>
        </Card>
        <Card className={classes.card3}>
          <CardContent>
            <Typography className={classes.texto2}>
              Laud, Jorge Eduardo
            </Typography>
            <Typography className={classes.subtexto2}>
              Secretario Administrativo
            </Typography>
          </CardContent>
        </Card>
        <Card className={classes.card3}>
          <CardContent>
            <Typography className={classes.texto2}>
              Ruiz, María Virginia
            </Typography>
            <Typography className={classes.subtexto2}>
              Secretario de Asuntos Sociales
            </Typography>
          </CardContent>
        </Card>
        <Card className={classes.card3}>
          <CardContent>
            <Typography className={classes.texto2}>
              Arias, Liliana Nanci
            </Typography>
            <Typography className={classes.subtexto2}>
              Secretario de Prensa y Actas
            </Typography>
          </CardContent>
        </Card>
        <Card className={classes.card3}>
          <CardContent>
            <Typography className={classes.texto2}>Aguierre, Rita Noemí</Typography>
            <Typography className={classes.subtexto2}>Secretario de Organización</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card4}>
          <CardContent>
            <Typography className={classes.texto2}>Garamendi, Miguel Enrique</Typography>
            <Typography className={classes.subtexto2}>Vocal Titular</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card4}>
          <CardContent>
            <Typography className={classes.texto2}>Matheus, David Arthur</Typography>
            <Typography className={classes.subtexto2}>Vocal Titular</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card4}>
          <CardContent>
            <Typography className={classes.texto2}>Marchetti, María Marcela</Typography>
            <Typography className={classes.subtexto2}>Vocal Titular</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card4}>
          <CardContent>
            <Typography className={classes.texto2}>Rodriguez, Edgardo Ariel</Typography>
            <Typography className={classes.subtexto2}>Vocal Suplente</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card4}>
          <CardContent>
            <Typography className={classes.texto2}>Bocoy, Carolina</Typography>
            <Typography className={classes.subtexto2}>Vocal Suplente</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card4}>
          <CardContent>
            <Typography className={classes.texto2}>Nuñez Ingrao, Manuel Antonio</Typography>
            <Typography className={classes.subtexto2}>Deleg. Tit. Consejo Directivo Superior</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card4}>
          <CardContent>
            <Typography className={classes.texto2}>Tejerina, Marcela Alejandro</Typography>
            <Typography className={classes.subtexto2}>Deleg. Tit. Consejo Directivo Superior</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card4}>
          <CardContent>
            <Typography className={classes.texto2}>Ortiz, Javier Alejandro</Typography>
            <Typography className={classes.subtexto2}>Deleg. Tit. Consejo Directivo Superior</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card4}>
          <CardContent>
            <Typography className={classes.texto2}>Fatum, Orlando</Typography>
            <Typography className={classes.subtexto2}>Deleg. Tit. Consejo Directivo Superior</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card4}>
          <CardContent>
            <Typography className={classes.texto2}>Jiménez, Silvia Leonor del Valle</Typography>
            <Typography className={classes.subtexto2}>Deleg. Supl. Consejo Directivo Superior</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card4}>
          <CardContent>
            <Typography className={classes.texto2}>Badino, Cristina Valeria</Typography>
            <Typography className={classes.subtexto2}>Deleg. Supl. Consejo Directivo Superior</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card4}>
          <CardContent>
            <Typography className={classes.texto2}>Araoz Vallejo, Miguel Alejandro</Typography>
            <Typography className={classes.subtexto2}>Deleg. Supl. Consejo Directivo Superior</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card4}>
          <CardContent>
            <Typography className={classes.texto2}>Martinez, Silvia del Carmen</Typography>
            <Typography className={classes.subtexto2}>Deleg. Supl. Consejo Directivo Superior</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card4}>
          <CardContent>
            <Typography className={classes.texto2}>Jalile, Luis Marcelo</Typography>
            <Typography className={classes.subtexto2}>Deleg. Tit. Asamblea General</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card4}>
          <CardContent>
            <Typography className={classes.texto2}>Chireno, Silvia Verónica</Typography>
            <Typography className={classes.subtexto2}>Deleg. Tit. Asamblea General</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card4}>
          <CardContent>
            <Typography className={classes.texto2}>Melo, Walter Gabriel</Typography>
            <Typography className={classes.subtexto2}>Deleg. Tit. Asamblea General</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card4}>
          <CardContent>
            <Typography className={classes.texto2}>Albornoz, María Inés</Typography>
            <Typography className={classes.subtexto2}>Deleg. Tit. Asamblea General</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card4}>
          <CardContent>
            <Typography className={classes.texto2}>Stoyanoff, Esteban Rafael</Typography>
            <Typography className={classes.subtexto2}>Deleg. Supl. Asamblea General</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card4}>
          <CardContent>
            <Typography className={classes.texto2}>Leguizamón, Pablo Fernando</Typography>
            <Typography className={classes.subtexto2}>Deleg. Supl. Asamblea General</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card4}>
          <CardContent>
            <Typography className={classes.texto2}>Miranda, Celesta Natalia</Typography>
            <Typography className={classes.subtexto2}>Deleg. Supl. Asamblea General</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card4}>
          <CardContent>
            <Typography className={classes.texto2}>Chavez, Raúl Daniel</Typography>
            <Typography className={classes.subtexto2}>Deleg. Supl. Asamblea General</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card4}>
          <CardContent>
            <Typography className={classes.texto2}>Mercado, Griselda del Transito</Typography>
            <Typography className={classes.subtexto2}>Deleg. Tit. Comisión Nac. de Jubilados</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card4}>
          <CardContent>
            <Typography className={classes.texto2}>Celedón, Miguel Ángel</Typography>
            <Typography className={classes.subtexto2}>Deleg. Tit. Comisión Nac. de Jubilados</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card4}>
          <CardContent>
            <Typography className={classes.texto2}>Navarro, María Marta</Typography>
            <Typography className={classes.subtexto2}>Deleg. Supl. Comisión Nac. de Jubilados</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card4}>
          <CardContent>
            <Typography className={classes.texto2}>Litovic, Juan José</Typography>
            <Typography className={classes.subtexto2}>Deleg. Supl. Comisión Nac. de Jubilados</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card4}>
          <CardContent>
            <Typography className={classes.texto2}>Calizaya, Lebed Gastón</Typography>
            <Typography className={classes.subtexto2}>Congresal Titular a la F.E.F.R.A.</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card4}>
          <CardContent>
            <Typography className={classes.texto2}>Mercado, José Antonio</Typography>
            <Typography className={classes.subtexto2}>Congresal Titular a la F.E.F.R.A.</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card4}>
          <CardContent>
            <Typography className={classes.texto2}>Miranda, Cyntia Betiana</Typography>
            <Typography className={classes.subtexto2}>Congresal Suplente a la F.E.F.R.A.</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card4}>
          <CardContent>
            <Typography className={classes.texto2}>Bulacio Álvarez, Luciana</Typography>
            <Typography className={classes.subtexto2}>Congresal Suplente a la F.E.F.R.A.</Typography>
          </CardContent>
        </Card>

      </Grid>
      <Grid item xs={6} className={classes.convenio}>
        <Button className={classes.button}>
          <Typography variant="h1" className={classes.textoconvenio}>
            <a
              href="https://aefip.org.ar/images/documentos/AEFIP_Mesa_Directiva_Nacional_-_Convenio_Colectivo_de_Trabajo_CCT.pdf"
              target="_blank"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              CONVENIO COLECTIVO DE TRABAJO (PDF
              <GetAppIcon fontSize="4vw" />)
            </a>
          </Typography>
        </Button>
      </Grid>
      <Grid item xs={6} className={classes.convenio}>
        <Button className={classes.button}>
          <Typography className={classes.textoconvenio}>
            <a
              href="https://aefip.org.ar/index.php/institucional/estatuto"
              target="_blank"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              ESTATUTO
            </a>
          </Typography>
        </Button>
      </Grid>
    </Grid>
  );
}

export default Gremio;
