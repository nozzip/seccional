import { React, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { dataBeneficios } from '../mockData';
import Popover from '@material-ui/core/Popover';
import Chip from '@material-ui/core/Chip';

const useStyles = makeStyles((theme) => ({
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    height: '100vh',
    margin: theme.spacing(1),
  },

  chip: {
    display: 'flex',
    justifyContent: 'center',
  },

  chipIcon: {
    margin: theme.spacing(1),
    padding: theme.spacing(2),
    borderRadius: '15px',
    fontFamily: 'Lato',
    backgroundColor: 'white',
    fontWeight: '800',
    color: 'Grey',
    fontSize: '20px',
    border: '1px solid #ff9e1c',
    '&:hover': {
      color: 'black',
      backgroundColor: 'white',
      borderBottom: '5px solid #ff9e1c',
      transition: 'all 0.2s ease-out',
    },
  },

  paper: {
    padding: theme.spacing(0.5),
    margin: theme.spacing(2),
    backgroundColor: '#ff9e1c',
    width: '25vw',
    height: 'auto',
    overflow: 'hidden',
    boxShadow: '2px 2px 5px 2px #888888',
    '&:hover': {
      border: '3px solid rgba(235,148,12, .2)',
      borderRadius: '15px',
      transition: 'transform .5s',
      transform: 'scale(1.1)',
      padding: theme.spacing(0),
    },
  },
  img: {
    padding: theme.spacing(-1),
    height: '100%',
  },
  popover: {},
  contenedorTexto: {
    textAlign: 'center',
  },
  title: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(2),
    borderBottom: '3px solid #ff9e1c',
  },
  texth2: {
    maxWidth: '800px',
    padding: theme.spacing(2),
    fontSize: '20px',
    borderBottom: '5px solid #ff9e1c',
  },
  texth3: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing(2),
    justifyContent: 'space-between',
  },
  location: {
    fontWeight: '500',
    fontSize: '18px',
    fontFamily: 'Helvetica',
  },
  telephone: {},
}));

export default function GridBeneficios(props) {
  const classes = useStyles();

  const [beneficios, setBeneficios] = useState(dataBeneficios);
  let filteredProvincias = [];

  const filter = (provinciaId) => {
    if (provinciaId === 'Todos') {
      filteredProvincias = [...dataBeneficios];
    } else {
      filteredProvincias = dataBeneficios.filter((item) => {
        return item.category === provinciaId;
      });
    }

    setBeneficios(filteredProvincias);
  };

  return (
    <Grid container className={classes.chip} zeroMinWidth>
      <Chip
        onClick={() => filter('Todos')}
        variant="filled"
        clickable={true}
        size="medium"
        label="Todos"
        className={classes.chipIcon}
      />
      <Chip
        onClick={() => filter('Tucuman')}
        variant="filled"
        clickable={true}
        size="medium"
        label="Tucumán"
        className={classes.chipIcon}
      />
      <Chip
        onClick={() => filter('Catamarca')}
        variant="filled"
        clickable={true}
        size="medium"
        label="Catamarca"
        className={classes.chipIcon}
      />
      <Chip
        onClick={() => filter('Salta')}
        variant="filled"
        clickable={true}
        size="medium"
        label="Salta"
        className={classes.chipIcon}
      />
      <Chip
        onClick={() => filter('Santiago')}
        variant="filled"
        clickable={true}
        size="medium"
        label="Santiago"
        className={classes.chipIcon}
      />

      <Grid xs={12} item className={classes.grid}>
        {beneficios.map((item, i) => (
          <Item key={i} item={item} />
        ))}
      </Grid>
    </Grid>
  );
}

function Item(props) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const [checked, setChecked] = useState(false);

  const handleChange = () => {
    setChecked((prev) => !prev);
  };

  return (
    <Paper className={classes.paper} onClick={handleClick}>
      <div
        className={classes.img}
        style={{
          backgroundImage: `url(${props.item.thumbnail})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className={classes.contenedorTexto} spacing={3}>
          <Popover
            className={classes.popover}
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            <h1 className={classes.title}>
              {props.item.title}
              <span className={classes.location}>{props.item.location}</span>
            </h1>
            <h2 className={classes.texth2}>{props.item.short_description}</h2>
            <h3 className={classes.texth3}>
              {props.item.mail}
              <span className={classes.telephone}>{props.item.telephone}</span>
            </h3>
          </Popover>
        </div>
      </div>
    </Paper>
  );
}
