import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { CssBaseline, Box } from '@mui/material';
import { ColorModeProvider } from './ColorModeContext';
import ErrorBoundary from './Components/common/ErrorBoundary';
import Navbar from './Components/Navbar/Navbar';
import FooterElements from './Components/Footer/FooterElements';
import Inicio from './Pages/Inicio';
import Beneficios from './Pages/Beneficios';
import Prensa from './Pages/Prensa';
import Galeria from './Pages/Galeria';
import Gremio from './Pages/Gremio';
import Login from './Pages/Login';
import Servicios from './Components/Servicios/Servicios';
import AdminDashboard from './Pages/Admin/AdminDashboard';

const Layout = () => (
  <ColorModeProvider>
    <ErrorBoundary>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Outlet />
        </Box>
        <FooterElements />
      </Box>
    </ErrorBoundary>
  </ColorModeProvider>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Inicio />,
      },
      {
        path: 'beneficios',
        element: <Beneficios />,
      },
      {
        path: 'prensa',
        element: <Prensa />,
      },
      {
        path: 'galeria',
        element: <Galeria />,
      },
      {
        path: 'gremio',
        element: <Gremio />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'servicios',
        element: <Servicios />,
      },
      {
        path: 'admin',
        element: <AdminDashboard />,
      },
    ],
  },
]);

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
