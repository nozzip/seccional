import { createHashRouter, RouterProvider, Outlet, useLocation, Navigate } from "react-router-dom";
import { CssBaseline, Box, CircularProgress } from "@mui/material";
import { HelmetProvider } from "react-helmet-async";
import { ColorModeProvider } from "./ColorModeContext";
import Navbar from "./Components/Navbar/Navbar";
import FooterElements from "./Components/Footer/FooterElements";
import { AnimatePresence, motion } from "framer-motion";
import { Suspense, lazy, useEffect } from "react";
import RouteErrorBoundary from "./Components/Error/RouteErrorBoundary";

const Inicio = lazy(() => import("./Pages/Inicio"));
const Beneficios = lazy(() => import("./Pages/Beneficios"));
const Prensa = lazy(() => import("./Pages/Prensa"));
const Galeria = lazy(() => import("./Pages/Galeria"));
const Gremio = lazy(() => import("./Pages/Gremio"));
const Login = lazy(() => import("./Pages/Login"));
const AdminDashboard = lazy(() => import("./Pages/Admin/AdminDashboard"));
const MobileBeneficiosApp = lazy(() => import("./Pages/MobileBeneficiosApp"));
const Servicios = lazy(() => import("./Components/Servicios/Servicios"));
const MobileAppView = lazy(() => import("./Components/MobileApp/MobileAppView"));
const AffiliateValidator = lazy(() => import("./Components/Public/AffiliateValidator"));
const AffiliateForm = lazy(() => import("./Pages/AffiliateForm"));

const NoticiaDetalle = lazy(() => import("./Pages/NoticiaDetalle"));

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

const ProtectedRoute = ({ children, role }: { children: React.ReactNode; role?: string }) => {
  const stored = localStorage.getItem("current_affiliate");
  const user = stored ? JSON.parse(stored) : null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

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
    errorElement: <RouteErrorBoundary />,
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
        path: "prensa/:id",
        element: <NoticiaDetalle />,
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
        element: (
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "app",
        element: <MobileAppView />,
      },
      {
        path: "validar/:token",
        element: <AffiliateValidator />,
      },
      {
        path: "afiliar",
        element: <AffiliateForm />,
      },
    ],
  },
  {
    path: "/app/beneficios",
    errorElement: <RouteErrorBoundary />,
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
  useEffect(() => {
    // Check if the app is running in standalone mode (PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone || 
                        window.location.search.includes('mode=standalone');

    if (isStandalone && window.location.hash === '#/') {
      // Redirect to the Benefits App if it's the PWA entry
      window.location.hash = '#/app/beneficios';
    }
  }, []);

  return (
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  );
}

export default App;
