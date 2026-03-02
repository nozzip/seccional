import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  useTheme,
  alpha,
} from "@mui/material";
import { Helmet } from "react-helmet-async";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PoolIcon from "@mui/icons-material/Pool";
import SportsTennisIcon from "@mui/icons-material/SportsTennis";
import AssignmentIcon from "@mui/icons-material/Assignment";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BusinessIcon from "@mui/icons-material/Business";
import PeopleIcon from "@mui/icons-material/People";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SettingsIcon from "@mui/icons-material/Settings";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import { Grid, Card, CardContent, Chip } from "@mui/material";

import AdminOverview from "../../Components/Admin/AdminOverview";
import PoolSchoolGrid from "../../Components/Admin/PoolSchoolGrid";
import CourtBookingGrid from "../../Components/Admin/CourtBookingGrid";
import OrderManagement from "../../Components/Admin/OrderManagement";
import CashFlowManager from "../../Components/Admin/CashFlowManager";
import PriceManager from "../../Components/Admin/PriceManager";
import RecycleBinManager from "../../Components/Admin/RecycleBinManager";
import AfiliadosManager from "../../Components/Admin/AfiliadosManager";
import DeudaAfiliadosManager from "../../Components/Admin/DeudaAfiliadosManager";
import AdminOverviewNoroeste from "../../Components/Admin/AdminOverviewNoroeste";
import CabinBookingManager from "../../Components/Admin/CabinBookingManager";
import PriceManagerNoroeste from "../../Components/Admin/PriceManagerNoroeste";
import ProvidersManager from "../../Components/Admin/ProvidersManager";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

function AdminDashboard() {
  const [activeBranch, setActiveBranch] = useState<"azucena" | "noroeste">(
    "azucena",
  );
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleBranchChange = (branch: "azucena" | "noroeste") => {
    setActiveBranch(branch);
    setActiveTab(0); // Reset tab when switching branches
  };

  // Define tab configuration based on active branch
  const tabsConfig = {
    azucena: [
      {
        label: "Resumen",
        icon: (
          <DashboardIcon sx={{ fontSize: 20, mb: "0 !important", mr: 1 }} />
        ),
        component: <AdminOverview />,
      },
      {
        label: "Finanzas y Caja",
        icon: (
          <AccountBalanceWalletIcon
            sx={{ fontSize: 20, mb: "0 !important", mr: 1 }}
          />
        ),
        component: <CashFlowManager branch="azucena" />,
      },
      {
        label: "Natación",
        icon: <PoolIcon sx={{ fontSize: 20, mb: "0 !important", mr: 1 }} />,
        component: <PoolSchoolGrid />,
      },
      {
        label: "Canchas",
        icon: (
          <SportsTennisIcon sx={{ fontSize: 20, mb: "0 !important", mr: 1 }} />
        ),
        component: <CourtBookingGrid />,
      },
      {
        label: "Pedidos",
        icon: (
          <AssignmentIcon sx={{ fontSize: 20, mb: "0 !important", mr: 1 }} />
        ),
        component: <OrderManagement />,
      },
      {
        label: "Precios",
        icon: <SettingsIcon sx={{ fontSize: 20, mb: "0 !important", mr: 1 }} />,
        component: <PriceManager />,
      },
      {
        label: "Papelera",
        icon: (
          <DeleteSweepIcon sx={{ fontSize: 20, mb: "0 !important", mr: 1 }} />
        ),
        component: <RecycleBinManager />,
      },
      {
        label: "Proveedores",
        icon: (
          <LocalShippingIcon sx={{ fontSize: 20, mb: "0 !important", mr: 1 }} />
        ),
        component: <ProvidersManager />,
      },
    ],
    noroeste: [
      {
        label: "Resumen",
        icon: (
          <DashboardIcon sx={{ fontSize: 20, mb: "0 !important", mr: 1 }} />
        ),
        component: <AdminOverviewNoroeste />,
      },
      {
        label: "Afiliados",
        icon: <PeopleIcon sx={{ fontSize: 20, mb: "0 !important", mr: 1 }} />,
        component: <AfiliadosManager />,
      },
      {
        label: "Deuda Afiliados",
        icon: <MoneyOffIcon sx={{ fontSize: 20, mb: "0 !important", mr: 1 }} />,
        component: <DeudaAfiliadosManager />,
      },
      {
        label: "Finanzas y Caja",
        icon: (
          <AccountBalanceWalletIcon
            sx={{ fontSize: 20, mb: "0 !important", mr: 1 }}
          />
        ),
        component: (
          <CashFlowManager branch="noroeste" hideInventoryAndArqueo={true} />
        ),
      },
      {
        label: "Reservas Cabañas",
        icon: (
          <LocationOnIcon sx={{ fontSize: 20, mb: "0 !important", mr: 1 }} />
        ),
        component: <CabinBookingManager />,
      },
      {
        label: "Pedidos",
        icon: (
          <AssignmentIcon sx={{ fontSize: 20, mb: "0 !important", mr: 1 }} />
        ),
        component: <OrderManagement />,
      },
      {
        label: "Precios Noroeste",
        icon: <SettingsIcon sx={{ fontSize: 20, mb: "0 !important", mr: 1 }} />,
        component: <PriceManagerNoroeste />,
      },
      {
        label: "Papelera",
        icon: (
          <DeleteSweepIcon sx={{ fontSize: 20, mb: "0 !important", mr: 1 }} />
        ),
        component: <RecycleBinManager />,
      },
      {
        label: "Proveedores",
        icon: (
          <LocalShippingIcon sx={{ fontSize: 20, mb: "0 !important", mr: 1 }} />
        ),
        component: <ProvidersManager />,
      },
    ],
  };

  const currentTabs = tabsConfig[activeBranch];

  return (
    <Box
      sx={{
        pt: { xs: 12, md: 16 },
        pb: 10,
        bgcolor: "background.default",
        minHeight: "100vh",
        // Global Scrollbar for the Admin Section
        "& *::-webkit-scrollbar": { width: 8, height: 8 },
        "& *::-webkit-scrollbar-track": {
          bgcolor: alpha(theme.palette.divider, 0.05),
          borderRadius: 10,
        },
        "& *::-webkit-scrollbar-thumb": {
          bgcolor: alpha(theme.palette.primary.main, 0.2),
          borderRadius: 10,
          "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.4) },
        },
      }}
    >
      <Helmet>
        <title>Panel Administrativo - Club Azucena</title>
      </Helmet>

      <Container maxWidth="xl">
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} lg={6}>
            <Paper
              elevation={0}
              onClick={() => handleBranchChange("azucena")}
              sx={{
                p: 3,
                borderRadius: 5,
                border: activeBranch === "azucena" ? "2px solid" : "1px solid",
                borderColor:
                  activeBranch === "azucena" ? "primary.main" : "divider",
                bgcolor:
                  activeBranch === "azucena"
                    ? alpha(theme.palette.primary.main, 0.05)
                    : "transparent",
                position: "relative",
                transition: "all 0.3s ease",
                cursor: "pointer",
                "&:hover": {
                  boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
                  transform: "translateY(-4px)",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 4,
                    bgcolor:
                      activeBranch === "azucena" ? "primary.main" : "divider",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow:
                      activeBranch === "azucena"
                        ? `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`
                        : "none",
                  }}
                >
                  <BusinessIcon
                    sx={{
                      fontSize: 36,
                      color:
                        activeBranch === "azucena" ? "#fff" : "text.secondary",
                    }}
                  />
                </Box>
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 900,
                        color: "text.primary",
                        letterSpacing: -1,
                        fontSize: { xs: "1.5rem", md: "1.8rem" },
                      }}
                    >
                      Administración Central Azucena
                    </Typography>
                    <Chip
                      label="ACTIVO"
                      size="small"
                      color="primary"
                      sx={{ fontWeight: 900, height: 20, fontSize: "0.6rem" }}
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 600, opacity: 0.8 }}
                  >
                    Control general, finanzas e inventario de la Sede Azucena.
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Paper
              elevation={0}
              onClick={() => handleBranchChange("noroeste")}
              sx={{
                p: 3,
                borderRadius: 5,
                border: activeBranch === "noroeste" ? "2px solid" : "1px solid",
                borderColor:
                  activeBranch === "noroeste" ? "primary.main" : "divider",
                bgcolor:
                  activeBranch === "noroeste"
                    ? alpha(theme.palette.primary.main, 0.05)
                    : alpha(theme.palette.text.disabled, 0.03),
                opacity: activeBranch === "noroeste" ? 1 : 0.8,
                position: "relative",
                transition: "all 0.3s ease",
                cursor: "pointer",
                "&:hover": {
                  bgcolor:
                    activeBranch === "noroeste"
                      ? alpha(theme.palette.primary.main, 0.05)
                      : alpha(theme.palette.primary.main, 0.02),
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  opacity: 1,
                  boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
                  transform: "translateY(-4px)",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 4,
                    bgcolor:
                      activeBranch === "noroeste" ? "primary.main" : "divider",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow:
                      activeBranch === "noroeste"
                        ? `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`
                        : "none",
                  }}
                >
                  <LocationOnIcon
                    sx={{
                      fontSize: 36,
                      color: activeBranch === "noroeste" ? "#fff" : "action",
                    }}
                  />
                </Box>
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 900,
                        color: "text.secondary",
                        letterSpacing: -1,
                        fontSize: { xs: "1.5rem", md: "1.8rem" },
                      }}
                    >
                      Administración Central Noroeste
                    </Typography>
                    <Chip
                      label="Sede 2"
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 700, height: 20, fontSize: "0.6rem" }}
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.disabled"
                    sx={{ fontWeight: 500 }}
                  >
                    Gestión para la nueva Sede Noroeste (Configuración inicial).
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Paper
          elevation={0}
          sx={{
            borderRadius: 6,
            border: "1px solid",
            borderColor: alpha(theme.palette.divider, 0.5),
            bgcolor: "background.paper",
            boxShadow: "0 12px 24px rgba(0,0,0,0.03)",
            overflow: "hidden",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            TabIndicatorProps={{
              style: { display: "none" }, // Hide default underline
            }}
            sx={{
              px: { xs: 1, md: 3 },
              pt: 2,
              pb: 1,
              borderBottom: "1px solid",
              borderColor: alpha(theme.palette.divider, 0.3),
              "& .MuiTab-root": {
                minHeight: 50,
                fontWeight: 800,
                fontSize: "0.85rem",
                textTransform: "none",
                borderRadius: 4,
                mx: 0.5,
                color: "text.secondary",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  color: "primary.main",
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                },
                "&.Mui-selected": {
                  color: "primary.main",
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                },
              },
            }}
          >
            {currentTabs.map((tab, index) => (
              <Tab
                key={index}
                icon={tab.icon}
                label={tab.label}
                iconPosition="start"
              />
            ))}
          </Tabs>

          <Box sx={{ p: { xs: 2, md: 4 }, minHeight: "60vh" }}>
            {currentTabs[activeTab]?.component}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default AdminDashboard;
