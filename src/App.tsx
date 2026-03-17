import { createHashRouter, RouterProvider, Outlet, useLocation } from "react-router-dom";
import { CssBaseline, Box, CircularProgress } from "@mui/material";
import { HelmetProvider } from "react-helmet-async";
import { ColorModeProvider } from "./ColorModeContext";
import Navbar from "./Components/Navbar/Navbar";
import FooterElements from "./Components/Footer/FooterElements";
import { AnimatePresence, motion } from "framer-motion";
import { Suspense, lazy, useEffect } from "react";

const Inicio = lazy(() => import("./Pages/Inicio"));
const Beneficios = lazy(() => import("./Pages/Beneficios"));
const Prensa = lazy(() => import("./Pages/Prensa"));
const Galeria = lazy(() => import("./Pages/Galeria"));
const Gremio = lazy(() => import("./Pages/Gremio"));
const Login = lazy(() => import("./Pages/Login"));
const AdminDashboard = lazy(() => import("./Pages/Admin/AdminDashboard"));
const MobileBeneficiosApp = lazy(() => import("./Pages/MobileBeneficiosApp"));
const Servicios = lazy(() => import("./Components/Servicios/Servicios"));

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

const AnimatedOutlet = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <PageTransition key={location.pathname}>
        <Outlet />
      </PageTransition>
    </AnimatePresence>
  );
};

const LoadingFallback = () => (
  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
    <CircularProgress />
  </Box>
);

const Layout = () => (
  <ColorModeProvider>
    <CssBaseline />
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Suspense fallback={<LoadingFallback />}>
          <AnimatedOutlet />
        </Suspense>
      </Box>
      <FooterElements />
    </Box>
  </ColorModeProvider>
);

const router = createHashRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Inicio />,
      },
      {
        path: "beneficios",
        element: <Beneficios />,
      },
      {
        path: "prensa",
        element: <Prensa />,
      },
      {
        path: "galeria",
        element: <Galeria />,
      },
      {
        path: "gremio",
        element: <Gremio />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "servicios",
        element: <Servicios />,
      },
      {
        path: "admin",
        element: <AdminDashboard />,
      },
    ],
  },
  {
    path: "/app/beneficios",
    element: (
      <ColorModeProvider>
        <CssBaseline />
        <Suspense fallback={<LoadingFallback />}>
          <MobileBeneficiosApp />
        </Suspense>
      </ColorModeProvider>
    ),
  },
]);

function App() {
  return (
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  );
}

export default App;
