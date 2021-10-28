import './App.css';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Navbar from './Components/Navbar/Navbar';
import Beneficios from './Pages/Beneficios';
import IniciarSesion from './Pages/IniciarSesion';
import Inicio from './Pages/Inicio';
import Prensa from './Pages/Prensa';
import Galeria from './Pages/Galeria';
import FooterElements from './Components/Footer/FooterElements';





function App() {
  return (
    <Router>
      <Navbar />
      <Switch>
        <Route exact path="/" component={Inicio} />
        <Route path="/beneficios" component={Beneficios} />
        {/* <Route path="/iniciar-sesion" component={IniciarSesion} /> */}
        <Route path="/prensa" component={Prensa} />
        <Route path="/galeria" component={Galeria} />
      </Switch>
      <FooterElements />
    </Router>

  );
}

export default App;
