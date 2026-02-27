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
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  Card,
  Divider,
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
import { supabase } from "../../supabaseClient";

const COLORS = [
  "#1a5f7a",
  "#c1121f",
  "#ffb703",
  "#8ecae6",
  "#4caf50",
  "#9c27b0",
];

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendType = "up",
  comparison,
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
      <Box sx={{ flexGrow: 1 }}>
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
          <Stack direction="row" spacing={1} alignItems="center">
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
            {comparison?.variance !== undefined && (
              <Chip
                label={`${comparison.variance > 0 ? '+' : ''}${comparison.variance.toFixed(1)}%`}
                size="small"
                variant="outlined"
                color={comparison.variance >= 0 ? "success" : "error"}
                sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800 }}
              />
            )}
          </Stack>
        )}
      </Box>
    </Paper>
  );
};

export default function AdminOverview() {
  const theme = useTheme();
  const [isExporting, setIsExporting] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState({
    totalStudents: 0,
    incomeMonth: 0,
    expenseMonth: 0,
    lowStock: [] as any[],
    financialSeries: [] as any[],
    categories: [] as any[],
    recentTxs: [] as any[],
    // Comparison data
    compareIncome: 0,
    compareExpense: 0,
    varianceIncome: 0,
    varianceExpense: 0,
    movementsSeries: [] as any[], // Sales vs Renewals
  });

  const [selectedMonth, setSelectedMonth] = React.useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());
  const [compareMode, setCompareMode] = React.useState(false);
  const [compareMonth, setCompareMonth] = React.useState(new Date().getMonth() - 1);
  const [compareYear, setCompareYear] = React.useState(new Date().getFullYear());

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const shortMonthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);

      // 1. Fetch Students
      const { count: studentCount } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true });

      // 2. Fetch Inventory for Low Stock
      const { data: invData } = await supabase.from("inventory").select("*");

      // 3. Fetch Transactions
      const { data: txs } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false });

      if (txs) {
        // --- Helper for Monthly Stats ---
        const getMonthlyMetrics = (m: number, y: number) => {
          let income = 0;
          let expense = 0;
          let sales = 0; // Inventory/Courts
          let renewals = 0; // Swimming/Pileta
          const catMap: { [key: string]: number } = {};

          txs.forEach((t) => {
            const td = new Date(t.date);
            if (td.getMonth() === m && td.getFullYear() === y) {
              const amount = t.amount || 0;
              if (t.type === "Ingreso") {
                income += amount;
                catMap[t.category] = (catMap[t.category] || 0) + amount;

                const cat = t.category.toLowerCase();
                if (cat.includes("pileta") || cat.includes("natación") || cat.includes("natacion") || cat.includes("cuota")) {
                  renewals += amount;
                } else if (cat.includes("bebida") || cat.includes("snack") || cat.includes("cancha") || cat.includes("venta")) {
                  sales += amount;
                }
              } else {
                expense += amount;
              }
            }
          });
          return { income, expense, sales, renewals, catMap };
        };

        const currentPeriodMetrics = getMonthlyMetrics(selectedMonth, selectedYear);
        const comparePeriodMetrics = compareMode ? getMonthlyMetrics(compareMonth, compareYear) : null;

        // --- Calculate Chart Series ---
        const financialSeries: any[] = [];
        const movementsSeries: any[] = [];

        // Show last 6 months for context, but emphasize selected if not comparing
        for (let i = 5; i >= 0; i--) {
          const d = new Date(selectedYear, selectedMonth - i, 1);
          const m = d.getMonth();
          const y = d.getFullYear();
          const metrics = getMonthlyMetrics(m, y);
          const label = `${shortMonthNames[m]} ${y}`;

          financialSeries.push({
            name: label,
            ingresos: metrics.income,
            gastos: metrics.expense,
          });

          movementsSeries.push({
            name: label,
            ventas: metrics.sales,
            renovaciones: metrics.renewals,
          });
        }

        // --- Calculate Variances ---
        let varInc = 0;
        let varExp = 0;
        if (comparePeriodMetrics) {
          if (comparePeriodMetrics.income > 0) {
            varInc = ((currentPeriodMetrics.income - comparePeriodMetrics.income) / comparePeriodMetrics.income) * 100;
          }
          if (comparePeriodMetrics.expense > 0) {
            varExp = ((currentPeriodMetrics.expense - comparePeriodMetrics.expense) / comparePeriodMetrics.expense) * 100;
          }
        }

        setData({
          totalStudents: studentCount || 0,
          incomeMonth: currentPeriodMetrics.income,
          expenseMonth: currentPeriodMetrics.expense,
          lowStock: (invData || [])
            .map((i) => ({
              name: i.name,
              stock: (i.initial_stock || 0) + (i.entries || 0) - (i.exits || 0),
            }))
            .filter((i) => i.stock < 10),
          financialSeries,
          movementsSeries,
          categories: Object.entries(currentPeriodMetrics.catMap).map(([name, value]) => ({
            name,
            value,
          })),
          recentTxs: txs.filter(t => {
            const td = new Date(t.date);
            return td.getMonth() === selectedMonth && td.getFullYear() === selectedYear;
          }).slice(0, 5),
          compareIncome: comparePeriodMetrics?.income || 0,
          compareExpense: comparePeriodMetrics?.expense || 0,
          varianceIncome: varInc,
          varianceExpense: varExp,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, compareMode, compareMonth, compareYear]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExportReport = async () => {
    setIsExporting(true);
    try {
      // Dynamic imports for heavy PDF libraries
      const { default: jsPDF } = await import("jspdf");
      const { default: html2canvas } = await import("html2canvas");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFontSize(22);
      doc.setTextColor(26, 95, 122);
      doc.text("Reporte General de Métricas", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Fecha de emisión: ${new Date().toLocaleString()}`, 14, 28);

      autoTable(doc, {
        startY: 40,
        head: [["Métrica", "Valor Actual", "Tendencia"]],
        body: [
          ["Total Alumnos", "124", "+12%"],
          ["Ingresos (Ago)", "$210.000", "+8%"],
          ["Gastos (Ago)", "$115.000", "+5%"],
          ["Ocupación Canchas", "78%", "Sábados Pico"],
        ],
        headStyles: { fillColor: [26, 95, 122] },
      });

      // Capture charts if possible
      const charts = document.querySelectorAll(
        ".recharts-responsive-container",
      );
      if (charts.length > 0) {
        doc.addPage();
        doc.setFontSize(16);
        doc.text("Visualizaciones de Rendimiento", 14, 20);

        for (let i = 0; i < Math.min(charts.length, 2); i++) {
          const canvas = await html2canvas(charts[i] as HTMLElement, {
            scale: 2,
          });
          const imgData = canvas.toDataURL("image/png");
          const imgWidth = pageWidth - 28;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          doc.addImage(
            imgData,
            "PNG",
            14,
            30 + i * (imgHeight + 10),
            imgWidth,
            imgHeight,
          );
        }
      }

      doc.save("Reporte_General_Admin.pdf");
    } catch (error) {
      console.error("Export error", error);
    } finally {
      setIsExporting(false);
    }
  };

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
          Dashboard de Gestión
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <FormControlLabel
            control={<Switch checked={compareMode} onChange={(e) => setCompareMode(e.target.checked)} />}
            label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Comparar</Typography>}
          />
          <Stack direction="row" spacing={1} alignItems="center">
            <Select
              size="small"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              sx={{ borderRadius: 2, minWidth: 120 }}
            >
              {monthNames.map((name, i) => (
                <MenuItem key={i} value={i}>{name}</MenuItem>
              ))}
            </Select>
            <Select
              size="small"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              sx={{ borderRadius: 2 }}
            >
              {years.map(y => (
                <MenuItem key={y} value={y}>{y}</MenuItem>
              ))}
            </Select>
          </Stack>

          {compareMode && (
            <>
              <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.secondary' }}>VS</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Select
                  size="small"
                  value={compareMonth}
                  onChange={(e) => setCompareMonth(Number(e.target.value))}
                  sx={{ borderRadius: 2, minWidth: 120, bgcolor: alpha(theme.palette.secondary.main, 0.05) }}
                >
                  {monthNames.map((name, i) => (
                    <MenuItem key={i} value={i}>{name}</MenuItem>
                  ))}
                </Select>
                <Select
                  size="small"
                  value={compareYear}
                  onChange={(e) => setCompareYear(Number(e.target.value))}
                  sx={{ borderRadius: 2, bgcolor: alpha(theme.palette.secondary.main, 0.05) }}
                >
                  {years.map(y => (
                    <MenuItem key={y} value={y}>{y}</MenuItem>
                  ))}
                </Select>
              </Stack>
            </>
          )}

          <Button
            startIcon={<FileDownloadIcon />}
            variant="contained"
            onClick={handleExportReport}
            disabled={isExporting}
            sx={{ borderRadius: 2, ml: { sm: 2 } }}
          >
            {isExporting ? "Generando..." : "Exportar"}
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={4}>
          <StatCard
            title="Total Alumnos"
            value={data.totalStudents.toString()}
            icon={PeopleIcon}
            trend="Datos en tiempo real"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={4}>
          <StatCard
            title="Ingresos"
            value={`$${data.incomeMonth.toLocaleString()}`}
            icon={AccountBalanceWalletIcon}
            trend={compareMode ? `vs $${data.compareIncome.toLocaleString()}` : "Total acumulado"}
            trendType={data.varianceIncome >= 0 ? "up" : "down"}
            comparison={{ variance: compareMode ? data.varianceIncome : undefined }}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={4}>
          <StatCard
            title="Gastos"
            value={`$${data.expenseMonth.toLocaleString()}`}
            icon={TrendingDownIcon}
            trend={compareMode ? `vs $${data.compareExpense.toLocaleString()}` : "Total registrado"}
            trendType={data.varianceExpense <= 0 ? "up" : "down"} // For expenses, down is good (up trend icon but green)
            comparison={{ variance: compareMode ? data.varianceExpense : undefined }}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={4}>
          <StatCard
            title="Balance Neto"
            value={`$${(data.incomeMonth - data.expenseMonth).toLocaleString()}`}
            icon={EventAvailableIcon}
            trend="Diferencia del periodo"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={4}>
          <StatCard
            title="Items Stock Bajo"
            value={data.lowStock.length.toString()}
            icon={WarningAmberIcon}
            trend="Requieren atención"
            trendType="down"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={4}>
          <StatCard
            title="Transacciones"
            value={data.recentTxs.length.toString()}
            icon={AutorenewIcon}
            trend="Últimas registradas"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Stack spacing={3}>
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
                Finanzas: Ingresos vs Gastos
              </Typography>
              <Box sx={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <AreaChart data={data.financialSeries}>
                    <defs>
                      <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.1} />
                        <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.palette.error.main} stopOpacity={0.1} />
                        <stop offset="95%" stopColor={theme.palette.error.main} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} />
                    <YAxis axisLine={false} tickLine={false} fontSize={10} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
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
                Movimientos: Ventas vs Renovaciones
              </Typography>
              <Box sx={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={data.movementsSeries}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} />
                    <YAxis axisLine={false} tickLine={false} fontSize={10} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Bar
                      dataKey="ventas"
                      fill={theme.palette.secondary.main}
                      radius={[4, 4, 0, 0]}
                      name="Ventas (Prod/Canchas) $"
                    />
                    <Bar
                      dataKey="renovaciones"
                      fill={theme.palette.info.main}
                      radius={[4, 4, 0, 0]}
                      name="Renovaciones (Pileta) $"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Stack>
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
                      data={data.categories}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.categories.map((entry, index) => (
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
                {data.categories.map((entry: any, index: number) => (
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
                {data.lowStock.length > 0 ? (
                  data.lowStock.map((item) => (
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
                  ))
                ) : (
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    No hay alertas de stock bajo.
                  </Typography>
                )}
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
              {data.recentTxs.map((row, index) => (
                <TableRow key={index} hover>
                  <TableCell sx={{ fontSize: "0.875rem" }}>
                    {row.date}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>
                    {row.description}
                  </TableCell>
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
                    {row.paymentMethod}
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
