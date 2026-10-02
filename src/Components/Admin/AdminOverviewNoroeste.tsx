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
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import GroupsIcon from "@mui/icons-material/Groups";
import { supabase } from "../../supabaseClient";

const StatCard = ({
  title,
  value,
  icon: Icon,
  color = "primary.main",
  subtitle,
}: any) => {
  const theme = useTheme();

  const getResolvedColor = (colorStr: string) => {
    if (colorStr.includes(".")) {
      const [palette, shade] = colorStr.split(".");
      return (theme.palette as any)[palette]?.[shade] || theme.palette.primary.main;
    }
    return colorStr;
  };

  const resolvedColor = getResolvedColor(color);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.2,
        borderRadius: 4,
        border: "1px solid",
        borderColor: alpha(theme.palette.divider, 0.4),
        bgcolor: "background.paper",
        display: "flex",
        alignItems: "center",
        gap: 2,
        height: "100%",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 12px 24px ${alpha(resolvedColor, 0.08)}`,
          borderColor: alpha(resolvedColor, 0.35),
        },
      }}
    >
      <Avatar
        sx={{
          bgcolor: alpha(resolvedColor, 0.1),
          color: color,
          width: 50,
          height: 50,
          borderRadius: 2.5,
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 26 }} />
      </Avatar>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontWeight: 700,
            letterSpacing: 0.5,
            textTransform: "uppercase",
            fontSize: "0.68rem",
            mb: 0.25,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="h5"
          sx={{ fontWeight: 900, color: "text.primary", lineHeight: 1.1 }}
        >
          {value}
        </Typography>
        {subtitle && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 0.25, fontWeight: 600, fontSize: "0.65rem" }}
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
    totalActivos: 0,
    totalUPS: 0,
    totalJubiladosAP: 0,
    totalDesafiliados: 0,
    totalFamily: 0,
    totalPadron: 0,
    cajaCentralIncome: 0,
    cajaCentralExpense: 0,
    bancoIncome: 0,
    bancoExpense: 0,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Affiliates for Noroeste with all relevant status columns
      const { data: affs, error: affErr } = await supabase
        .from("affiliates")
        .select("id, branch, is_aefip, is_ups, es_jubilado, is_aportante, desafiliado")
        .eq("branch", "noroeste");

      if (affErr) throw affErr;

      // 2. Fetch Family Members Count
      const { count: famCount } = await supabase
        .from("affiliate_family_members")
        .select("*", { count: "exact", head: true });

      // Breakdown identical to AfiliadosManager.tsx
      const affList = affs || [];
      const totalActivos = affList.filter(
        (a) => a.is_aefip && !a.is_ups && !a.es_jubilado && !a.desafiliado
      ).length;
      const totalUPS = affList.filter((a) => a.is_ups).length;
      const totalJubiladosAP = affList.filter(
        (a) => a.es_jubilado && a.is_aportante
      ).length;
      const totalDesafiliados = affList.filter(
        (a) => a.desafiliado || (!a.is_aefip && !a.is_ups && !a.es_jubilado)
      ).length;
      const totalPadron = affList.length;

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
        totalAffiliates: totalActivos,
        totalActivos,
        totalUPS,
        totalJubiladosAP,
        totalDesafiliados,
        totalFamily: famCount || 0,
        totalPadron,
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
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      <Typography
        variant="h5"
        sx={{ mb: 4, fontWeight: 800, color: "primary.main" }}
      >
        Resumen General Noroeste
      </Typography>

      <Grid container spacing={4}>
        {/* Lado Izquierdo: Estadísticas de Personas */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <StatCard
                title="Afiliados Activos"
                value={stats.totalActivos.toString()}
                icon={PeopleIcon}
                color="primary.main"
                subtitle="Titulares activos"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <StatCard
                title="UPS / Doble Afil."
                value={stats.totalUPS.toString()}
                icon={AssignmentIndIcon}
                color="warning.main"
                subtitle="Doble afiliación"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <StatCard
                title="Jubilados Aport."
                value={stats.totalJubiladosAP.toString()}
                icon={PeopleIcon}
                color="secondary.main"
                subtitle="Aportantes"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <StatCard
                title="Desafiliados"
                value={stats.totalDesafiliados.toString()}
                icon={PersonOffIcon}
                color="error.main"
                subtitle="Bajas registradas"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <StatCard
                title="Total Hijos"
                value={stats.totalFamily.toString()}
                icon={ChildCareIcon}
                color="info.main"
                subtitle="Familiares a cargo"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <StatCard
                title="Padrón Total"
                value={stats.totalPadron.toString()}
                icon={GroupsIcon}
                color="text.primary"
                subtitle="Titulares registrados"
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Lado Derecho: Finanzas (Caja Central arriba, Banco abajo) */}
        <Grid size={{ xs: 12, lg: 6 }}>
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
