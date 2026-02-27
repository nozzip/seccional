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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
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
  });

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // 1. Fetch Students
      const { count: studentCount } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true });

      // 2. Fetch Inventory for Low Stock
      const { data: invData } = await supabase.from("inventory").select("*");

      // 3. Fetch Transactions for Financials
      const { data: txs } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false });

      if (txs) {
        const monthlyStats: { [key: string]: any } = {};
        const monthNames = [
          "Ene",
          "Feb",
          "Mar",
          "Abr",
          "May",
          "Jun",
          "Jul",
          "Ago",
          "Sep",
          "Oct",
          "Nov",
          "Dic",
        ];

        // Calculate series for chart (last 6 months)
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const m = d.getMonth();
          const y = d.getFullYear();
          const label = `${monthNames[m]} ${y}`;
          monthlyStats[label] = { name: label, ingresos: 0, gastos: 0, m, y };
        }

        let incM = 0;
        let expM = 0;
        const catMap: { [key: string]: number } = {};

        txs.forEach((t) => {
          const td = new Date(t.date);
          const tm = td.getMonth();
          const ty = td.getFullYear();
          const tLabel = `${monthNames[tm]} ${ty}`;

          if (monthlyStats[tLabel]) {
            if (t.type === "Ingreso") monthlyStats[tLabel].ingresos += t.amount;
            else monthlyStats[tLabel].gastos += t.amount;
          }

          if (tm === currentMonth && ty === currentYear) {
            if (t.type === "Ingreso") {
              incM += t.amount;
              catMap[t.category] = (catMap[t.category] || 0) + t.amount;
            } else {
              expM += t.amount;
            }
          }
        });

        setData({
          totalStudents: studentCount || 0,
          incomeMonth: incM,
          expenseMonth: expM,
          lowStock: (invData || [])
            .map((i) => ({
              name: i.name,
              stock: (i.initial_stock || 0) + (i.entries || 0) - (i.exits || 0),
            }))
            .filter((i) => i.stock < 10),
          financialSeries: Object.values(monthlyStats),
          categories: Object.entries(catMap).map(([name, value]) => ({
            name,
            value,
          })),
          recentTxs: txs.slice(0, 5),
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExportReport = async () => {
    setIsExporting(true);
    try {
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
          Métricas Clave
        </Typography>
        <Button
          startIcon={<FileDownloadIcon />}
          variant="outlined"
          onClick={handleExportReport}
          disabled={isExporting}
          sx={{ borderRadius: 2 }}
        >
          {isExporting ? "Generando..." : "Exportar Reporte"}
        </Button>
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
            title="Ingresos del Mes"
            value={`$${data.incomeMonth.toLocaleString()}`}
            icon={AccountBalanceWalletIcon}
            trend="Total acumulado"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={4}>
          <StatCard
            title="Gastos del Mes"
            value={`$${data.expenseMonth.toLocaleString()}`}
            icon={TrendingDownIcon}
            trend="Total registrado"
            trendType="down"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={4}>
          <StatCard
            title="Balance Neto"
            value={`$${(data.incomeMonth - data.expenseMonth).toLocaleString()}`}
            icon={EventAvailableIcon}
            trend="Diferencia mensual"
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
                <AreaChart data={data.financialSeries}>
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
