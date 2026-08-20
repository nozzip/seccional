import React from "react";
import {
  Typography,
  AppBar,
  Toolbar,
  Button,
  useTheme,
  useMediaQuery,
  Slide,
  useScrollTrigger,
  Box,
  IconButton,
  alpha,
  Tooltip,
  Badge,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import LoginIcon from "@mui/icons-material/Login";
import DrawerComponent from "./Drawer";
import { getGlassStyles } from "../../theme";
import { useColorMode } from "../../ColorModeContext";
import { isUserAdmin } from "../../utils/auth";


function HideOnScroll(props: any) {
  const { children } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children ?? <div />}
    </Slide>
  );
}

function Navbar(props: any) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const { toggleColorMode } = useColorMode();

  const [currentAffiliate, setCurrentAffiliate] = React.useState<any>(null);

  const isAdmin = isUserAdmin(currentAffiliate);

  const navLinks = [
    { name: "Inicio", path: "/" },
    { name: "Institución", path: "/gremio" },
    { name: "Beneficios Gremiales", path: "/servicios" },
    { name: "Convenios", path: "/beneficios" },
    { name: "Prensa", path: "/prensa" },
    ...(currentAffiliate ? [{ name: "Mi Perfil", path: "/perfil" }] : []),
    ...(isAdmin ? [{ name: "Admin", path: "/admin" }] : []),
  ];

  React.useEffect(() => {
    const checkUser = () => {
      const stored = localStorage.getItem("current_affiliate");
      if (stored) {
        setCurrentAffiliate(JSON.parse(stored));
      } else {
        setCurrentAffiliate(null);
      }
    };

    checkUser();
    window.addEventListener("affiliate_login", checkUser);
    return () => window.removeEventListener("affiliate_login", checkUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("current_affiliate");
    localStorage.removeItem("mobile_app_legajo");
    localStorage.removeItem("mobile_app_name");
    localStorage.removeItem("mobile_app_cuil");
    localStorage.removeItem("mobile_app_telefono");
    localStorage.removeItem("mobile_app_email");
    localStorage.removeItem("mobile_app_jubilado");
    localStorage.removeItem("mobile_app_validation_token");
    localStorage.removeItem("mobile_app_fecha_nacimiento");
    localStorage.removeItem("mobile_app_conyuge_nombre");
    localStorage.removeItem("mobile_app_conyuge_dni");
    setCurrentAffiliate(null);
    window.dispatchEvent(new Event("affiliate_login"));
  };

  return (
    <HideOnScroll {...props}>
      <AppBar
        position="fixed"
        sx={{
          ...getGlassStyles(theme),
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          boxShadow: "none",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Toolbar
          sx={{
            justifyContent: "space-between",
            px: { xs: 2, md: 4 },
            minHeight: { xs: 70, md: 80 },
          }}
        >
          <Link to="/" style={{ display: "flex", alignItems: "center" }}>
            <Box
              component="img"
              src={`${import.meta.env.BASE_URL}seccionalLogo.png`}
              alt="logo"
              sx={{
                height: { xs: 45, md: 55 },
                width: "auto",
                transition: "transform 0.3s ease",
                "&:hover": { transform: "scale(1.05)" },
                filter:
                  theme.palette.mode === "dark" ? "brightness(1.2)" : "none",
              }}
            />
          </Link>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1, md: 2 },
            }}
          >
            {!isMobile && (
              <Box sx={{ display: "flex", gap: 1 }}>
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Button
                      key={link.name}
                      component={Link}
                      to={link.path}
                      sx={{
                        color: isActive ? "primary.main" : "text.primary",
                        fontWeight: isActive ? 700 : 500,
                        fontSize: "1rem",
                        px: 2,
                        position: "relative",
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          bottom: 0,
                          left: "10%",
                          width: isActive ? "80%" : "0%",
                          height: "3px",
                          backgroundColor: "primary.main",
                          transition: "width 0.3s ease",
                        },
                        "&:hover": {
                          backgroundColor: "transparent",
                          color: "primary.main",
                          "&::after": { width: "80%" },
                        },
                      }}
                    >
                      {link.name}
                    </Button>
                  );
                })}
              </Box>
            )}

            <IconButton
              onClick={toggleColorMode}
              color="primary"
              aria-label="Reflejar modo oscuro"
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.2) },
              }}
            >
              {theme.palette.mode === "dark" ? (
                <Brightness7Icon />
              ) : (
                <Brightness4Icon />
              )}
            </IconButton>

            {currentAffiliate ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {!isMobile && (
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                    Hola, {currentAffiliate.nombre}
                  </Typography>
                )}
                <Button
                  onClick={handleLogout}
                  variant="outlined"
                  size="small"
                  sx={{
                    borderRadius: 1,
                    textTransform: "none",
                    fontWeight: 700,
                  }}
                >
                  Salir
                </Button>
              </Box>
            ) : (
              <Button
                component={Link}
                to="/login"
                variant="contained"
                sx={{
                  display: { xs: "none", sm: "flex" },
                  bgcolor: "primary.main",
                  borderRadius: 1,
                  px: 3,
                  fontWeight: 700,
                }}
              >
                Ingresar
              </Button>
            )}

            <Tooltip title="Ingreso Afiliados">
              <IconButton
                component={Link}
                to="/app/beneficios"
                color="primary"
                aria-label="Ingreso Afiliados"
                sx={{
                  display: { xs: "inline-flex", sm: "none" },
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.2) },
                }}
              >
                <LoginIcon />
              </IconButton>
            </Tooltip>

            {isMobile && <DrawerComponent />}
          </Box>
        </Toolbar>
      </AppBar>
    </HideOnScroll>
  );
}

export default Navbar;
