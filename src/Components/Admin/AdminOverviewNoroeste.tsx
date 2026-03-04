import React, { useState, useEffect, useCallback } from "react";
import {
  Paper,
  Typography,
  Box,
  Stack,
  alpha,
  useTheme,
  Avatar,
  CircularProgress,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import PeopleIcon from "@mui/icons-material/People";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { supabase } from "../../supabaseClient";

const StatCard = ({
  title,
  value,
  icon: Icon,
  color = "primary.main",
  subtitle,
}: any) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        border: "1px solid",
        borderColor: alpha(theme.palette.divider, 0.5),
        bgcolor: "background.paper",
        display: "flex",
        alignItems: "center",
        gap: 3,
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 24px rgba(0,0,0,0.06)",
          borderColor: alpha(theme.palette.primary.main, 0.3),
        },
      }}
    >
      <Avatar
        sx={{
          bgcolor: alpha(theme.palette.primary.main, 0.08),
          color: color,
          width: 64,
          height: 64,
          borderRadius: 3,
        }}
      >
        <Icon sx={{ fontSize: 32 }} />
      </Avatar>
      <Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontWeight: 700,
            letterSpacing: 0.5,
            textTransform: "uppercase",
            fontSize: "0.7rem",
            mb: 0.5,
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="h4"
          sx={{ fontWeight: 900, color: "text.primary" }}
        >
          {value}
        </Typography>
        {subtitle && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 0.5, fontWeight: 600 }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default function AdminOverviewNoroeste() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAffiliates: 0,
    totalFamily: 0,
    cajaCentralIncome: 0,
    cajaCentralExpense: 0,
    bancoIncome: 0,
    bancoExpense: 0,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Affiliates Count
      const { count: affCount } = await supabase
        .from("affiliates")
        .select("*", { count: "exact", head: true });

      // 2. Fetch Family Members Count
      const { count: famCount } = await supabase
        .from("affiliate_family_members")
        .select("*", { count: "exact", head: true });

      // 3. Fetch Transactions for Noroeste
      const { data: txs } = await supabase
        .from("transactions")
        .select("*")
        .eq("branch", "noroeste")
        .is("deleted_at", null);

      let cajaInc = 0;
      let cajaExp = 0;
      let bancoInc = 0;
      let bancoExp = 0;

      if (txs) {
        txs.forEach((t) => {
          const category = (t.category || "").toLowerCase();
          const amount = parseFloat(t.amount) || 0;

          if (category.includes("caja central")) {
            if (t.type === "Ingreso") cajaInc += amount;
            else cajaExp += amount;
          } else if (category.includes("banco")) {
            if (t.type === "Ingreso") bancoInc += amount;
            else bancoExp += amount;
          }
        });
      }

      setStats({
        totalAffiliates: affCount || 0,
        totalFamily: famCount || 0,
        cajaCentralIncome: cajaInc,
        cajaCentralExpense: cajaExp,
        bancoIncome: bancoInc,
        bancoExpense: bancoExp,
      });
    } catch (error) {
      console.error("Error fetching Noroeste overview stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Subset of real-time subscriptions
    const channel = supabase
      .channel("noroeste_overview_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "affiliates" },
        fetchData,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "affiliate_family_members" },
        fetchData,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions" },
        fetchData,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography
        variant="h5"
        sx={{ mb: 4, fontWeight: 800, color: "primary.main" }}
      >
        Resumen General Noroeste
      </Typography>

      <Grid container spacing={4}>
        {/* Lado Izquierdo: Estadísticas de Personas */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack spacing={3}>
            <StatCard
              title="Total Afiliados"
              value={stats.totalAffiliates.toString()}
              icon={PeopleIcon}
              color="primary.main"
            />
            <StatCard
              title="Total Hijos"
              value={stats.totalFamily.toString()}
              icon={ChildCareIcon}
              color="secondary.main"
            />
          </Stack>
        </Grid>

        {/* Lado Derecho: Finanzas (Caja Central arriba, Banco abajo) */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Stack spacing={3} alignItems="flex-end">
            {/* Financial Section - Caja Central */}
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 5,
                border: "1px solid",
                borderColor: "divider",
                width: "100%",
                maxWidth: 600,
              }}
            >
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ mb: 3 }}
              >
                <Avatar
                  sx={{ bgcolor: alpha("#4caf50", 0.1), color: "#4caf50" }}
                >
                  <AccountBalanceWalletIcon />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Caja Central
                </Typography>
              </Stack>

              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="success.main"
                      sx={{ fontWeight: 900, textTransform: "uppercase" }}
                    >
                      Ingresos
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900 }}>
                      ${stats.cajaCentralIncome.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="error.main"
                      sx={{ fontWeight: 900, textTransform: "uppercase" }}
                    >
                      Egresos
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900 }}>
                      ${stats.cajaCentralExpense.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box
                    sx={{
                      mt: 1,
                      pt: 2,
                      borderTop: "1px dashed",
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 700 }}
                    >
                      Saldo Neto
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 900,
                        color:
                          stats.cajaCentralIncome - stats.cajaCentralExpense >= 0
                            ? "success.main"
                            : "error.main",
                      }}
                    >
                      $
                      {(
                        stats.cajaCentralIncome - stats.cajaCentralExpense
                      ).toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Financial Section - Banco */}
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 5,
                border: "1px solid",
                borderColor: "divider",
                width: "100%",
                maxWidth: 600,
              }}
            >
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ mb: 3 }}
              >
                <Avatar
                  sx={{ bgcolor: alpha("#1a5f7a", 0.1), color: "#1a5f7a" }}
                >
                  <AccountBalanceIcon />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Banco
                </Typography>
              </Stack>

              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="success.main"
                      sx={{ fontWeight: 900, textTransform: "uppercase" }}
                    >
                      Ingresos
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900 }}>
                      ${stats.bancoIncome.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="error.main"
                      sx={{ fontWeight: 900, textTransform: "uppercase" }}
                    >
                      Egresos
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900 }}>
                      ${stats.bancoExpense.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box
                    sx={{
                      mt: 1,
                      pt: 2,
                      borderTop: "1px dashed",
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 700 }}
                    >
                      Saldo Neto
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 900,
                        color:
                          stats.bancoIncome - stats.bancoExpense >= 0
                            ? "success.main"
                            : "error.main",
                      }}
                    >
                      $
                      {(
                        stats.bancoIncome - stats.bancoExpense
                      ).toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
