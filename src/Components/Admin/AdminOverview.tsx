import React from "react";
import {
  Grid,
  Paper,
  Typography,
  Box,
  Stack,
  alpha,
  useTheme,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import PeopleIcon from "@mui/icons-material/People";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import LocalDrinkIcon from "@mui/icons-material/LocalDrink";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

// Data Mock
const financialData = [
  { name: "Mar", ingresos: 120000, gastos: 85000 },
  { name: "Abr", ingresos: 150000, gastos: 92000 },
  { name: "May", ingresos: 145000, gastos: 110000 },
  { name: "Jun", ingresos: 180000, gastos: 105000 },
  { name: "Jul", ingresos: 170000, gastos: 98000 },
  { name: "Ago", ingresos: 210000, gastos: 115000 },
];

const categoryData = [
  { name: "Natación", value: 45000 },
  { name: "Canchas", value: 35000 },
  { name: "Bebidas", value: 25000 },
  { name: "Cuotas", value: 105000 },
];

const incomeTableData = [
  {
    date: "23/08/2026",
    concept: "Cuota Mensual - Alumno 01",
    category: "Cuotas",
    amount: 15000,
    method: "Transferencia",
  },
  {
    date: "22/08/2026",
    concept: "Alquiler Cancha 1 - 20hs",
    category: "Canchas",
    amount: 8000,
    method: "Efectivo",
  },
  {
    date: "22/08/2026",
    concept: "Venta Bebidas - Pack 12",
    category: "Bebidas",
    amount: 12000,
    method: "Efectivo",
  },
  {
    date: "21/08/2026",
    concept: "Inscripción Natación - Alumno 02",
    category: "Natación",
    amount: 18000,
    method: "Débito",
  },
  {
    date: "21/08/2026",
    concept: "Cuota Mensual - Alumno 03",
    category: "Cuotas",
    amount: 15000,
    method: "Transferencia",
  },
];

const lowStockItems = [
  { name: "Agua Mineral 500ml", stock: 5 },
  { name: "Gatorade Manzana", stock: 2 },
  { name: "Powerade Azul", stock: 3 },
];

const COLORS = ["#1a5f7a", "#c1121f", "#ffb703", "#8ecae6"];

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendType = "up",
}: any) => {
  const theme = useTheme();
  const isTrendUp = trendType === "up";

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        display: "flex",
        alignItems: "center",
        gap: 3,
        transition: "transform 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
        },
      }}
    >
      <Avatar
        sx={{
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          color: "primary.main",
          width: 56,
          height: 56,
        }}
      >
        <Icon sx={{ fontSize: 32 }} />
      </Avatar>
      <Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontWeight: 600 }}
        >
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          {value}
        </Typography>
        {trend && (
          <Typography
            variant="caption"
            sx={{
              color: isTrendUp ? "success.main" : "error.main",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
            }}
          >
            {isTrendUp ? (
              <TrendingUpIcon sx={{ fontSize: 14, mr: 0.5 }} />
            ) : (
              <TrendingDownIcon sx={{ fontSize: 14, mr: 0.5 }} />
            )}
            {trend}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default function AdminOverview() {
  const theme = useTheme();

  return (
    <Box>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Métricas Clave
        </Typography>
        <Button
          startIcon={<FileDownloadIcon />}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Exportar Reporte
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={4}>
          <StatCard
            title="Total Alumnos"
            value="124"
            icon={PeopleIcon}
            trend="+12% este mes"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={4}>
          <StatCard
            title="Ingresos (Ago)"
            value="$210.000"
            icon={AccountBalanceWalletIcon}
            trend="+8% vs Jul"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={4}>
          <StatCard
            title="Gastos (Ago)"
            value="$115.000"
            icon={TrendingDownIcon}
            trend="+5% vs Jul"
            trendType="down"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={4}>
          <StatCard
            title="Ocupación Canchas"
            value="78%"
            icon={EventAvailableIcon}
            trend="Pico: Sábados"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={4}>
          <StatCard
            title="Renovaciones"
            value="45"
            icon={AutorenewIcon}
            trend="85% de socios"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={4}>
          <StatCard
            title="Venta Bebidas"
            value="$25.000"
            icon={LocalDrinkIcon}
            trend="+15% vs Jul"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 800 }}>
              Ingresos vs Gastos
            </Typography>
            <Box sx={{ width: "100%", height: 350 }}>
              <ResponsiveContainer>
                <AreaChart data={financialData}>
                  <defs>
                    <linearGradient
                      id="colorIngresos"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={theme.palette.primary.main}
                        stopOpacity={0.1}
                      />
                      <stop
                        offset="95%"
                        stopColor={theme.palette.primary.main}
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient
                      id="colorGastos"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={theme.palette.error.main}
                        stopOpacity={0.1}
                      />
                      <stop
                        offset="95%"
                        stopColor={theme.palette.error.main}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={theme.palette.divider}
                  />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area
                    type="monotone"
                    dataKey="ingresos"
                    stroke={theme.palette.primary.main}
                    fillOpacity={1}
                    fill="url(#colorIngresos)"
                    strokeWidth={3}
                    name="Ingresos ($)"
                  />
                  <Area
                    type="monotone"
                    dataKey="gastos"
                    stroke={theme.palette.error.main}
                    fillOpacity={1}
                    fill="url(#colorGastos)"
                    strokeWidth={3}
                    name="Gastos ($)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Stack spacing={3} sx={{ height: "100%" }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
                flex: 1,
              }}
            >
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 800 }}>
                Distribución
              </Typography>
              <Box sx={{ width: "100%", height: 200 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Stack spacing={1} sx={{ mt: 2 }}>
                {categoryData.map((entry, index) => (
                  <Box
                    key={entry.name}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          bgcolor: COLORS[index % COLORS.length],
                        }}
                      />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {entry.name}
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary" }}
                    >
                      ${entry.value.toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: alpha(theme.palette.warning.main, 0.05),
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <WarningAmberIcon color="warning" />
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, fontSize: "1rem" }}
                >
                  Stock Bajo
                </Typography>
              </Box>
              <Stack spacing={1.5}>
                {lowStockItems.map((item) => (
                  <Box
                    key={item.name}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {item.name}
                    </Typography>
                    <Chip
                      label={`${item.stock} u.`}
                      size="small"
                      color="warning"
                      variant="outlined"
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: 3,
            borderBottom: "1px solid",
            borderColor: "divider",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Últimos Ingresos Mensuales
          </Typography>
          <Button variant="text" size="small">
            Ver todo
          </Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead
              sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}
            >
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Concepto</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Categoría</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Monto</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Método</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {incomeTableData.map((row, index) => (
                <TableRow key={index} hover>
                  <TableCell sx={{ fontSize: "0.875rem" }}>
                    {row.date}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{row.concept}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.category}
                      size="small"
                      sx={{
                        bgcolor: alpha(COLORS[index % COLORS.length], 0.1),
                        color: COLORS[index % COLORS.length],
                        fontWeight: 800,
                        fontSize: "0.7rem",
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    ${row.amount.toLocaleString()}
                  </TableCell>
                  <TableCell
                    sx={{ color: "text.secondary", fontSize: "0.875rem" }}
                  >
                    {row.method}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
