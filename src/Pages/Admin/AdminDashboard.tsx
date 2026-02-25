import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  useTheme,
} from "@mui/material";
import { Helmet } from "react-helmet-async";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PoolIcon from "@mui/icons-material/Pool";
import SportsTennisIcon from "@mui/icons-material/SportsTennis";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SettingsIcon from "@mui/icons-material/Settings";

import AdminOverview from "../../Components/Admin/AdminOverview";
import PoolSchoolGrid from "../../Components/Admin/PoolSchoolGrid";
import CourtBookingGrid from "../../Components/Admin/CourtBookingGrid";
import CashFlowManager from "../../Components/Admin/CashFlowManager";
import PriceManager from "../../Components/Admin/PriceManager";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box
      sx={{
        pt: { xs: 12, md: 16 },
        pb: 10,
        bgcolor: "background.default",
        minHeight: "100vh",
      }}
    >
      <Helmet>
        <title>Panel Administrativo - Club Azucena</title>
      </Helmet>

      <Container maxWidth="xl">
        <Box sx={{ mb: 6, display: "flex", alignItems: "center", gap: 2 }}>
          <DashboardIcon color="primary" sx={{ fontSize: 40 }} />
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                color: "primary.main",
                fontSize: { xs: "2rem", md: "3rem" },
              }}
            >
              Administración Club Azucena
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Control total: Finanzas, Inventario y Operaciones diarias
            </Typography>
          </Box>
        </Box>

        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: 2,
              pt: 2,
              borderBottom: 1,
              borderColor: "divider",
              "& .MuiTab-root": {
                minHeight: 64,
                fontWeight: 700,
                fontSize: "0.9rem",
                gap: 1,
              },
            }}
          >
            <Tab
              icon={<DashboardIcon />}
              label="Resumen"
              iconPosition="start"
            />
            <Tab
              icon={<AccountBalanceWalletIcon />}
              label="Finanzas y Caja"
              iconPosition="start"
            />
            <Tab icon={<PoolIcon />} label="Natación" iconPosition="start" />
            <Tab
              icon={<SportsTennisIcon />}
              label="Canchas"
              iconPosition="start"
            />
            <Tab icon={<SettingsIcon />} label="Precios" iconPosition="start" />
          </Tabs>

          <Box sx={{ p: { xs: 2, md: 4 } }}>
            {activeTab === 0 && <AdminOverview />}
            {activeTab === 1 && <CashFlowManager />}
            {activeTab === 2 && <PoolSchoolGrid />}
            {activeTab === 3 && <CourtBookingGrid />}
            {activeTab === 4 && <PriceManager />}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default AdminDashboard;
