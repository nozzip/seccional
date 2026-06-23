import React from "react";
import {
  Box,
  Typography,
  Paper,
  alpha,
  useTheme,
  keyframes,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";

// ─── Types ──────────────────────────────────────────────────────────────────
interface FinancialStatisticsProps {
  transactions: any[];
  accounts: any[];
}

// ─── Currency Formatter (ARS) ───────────────────────────────────────────────
const formatARS = (value: number): string => {
  return `$ ${value.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// ─── Vibrant Color Palettes ─────────────────────────────────────────────────
const INCOME_CATEGORY_COLORS = [
  "#10b981", "#34d399", "#6ee7b7", "#059669", "#047857",
  "#14b8a6", "#2dd4bf", "#0d9488",
];

const EXPENSE_CATEGORY_COLORS = [
  "#ef4444", "#f87171", "#fca5a5", "#dc2626", "#b91c1c",
  "#f97316", "#fb923c", "#e11d48",
];

const PAYMENT_METHOD_COLORS = [
  "#8b5cf6", "#a78bfa", "#6366f1", "#818cf8",
  "#c084fc", "#7c3aed", "#4f46e5", "#6d28d9",
];

// ─── Animations ─────────────────────────────────────────────────────────────
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(0,0,0,0.05); }
  50% { box-shadow: 0 0 40px rgba(0,0,0,0.1); }
`;

// ─── Animated Counter Hook ──────────────────────────────────────────────────
function useAnimatedCounter(target: number, duration = 1200): number {
  const [current, setCurrent] = React.useState(0);
  const prevTarget = React.useRef(0);

  React.useEffect(() => {
    const start = prevTarget.current;
    prevTarget.current = target;
    const diff = target - start;
    if (diff === 0) return;

    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(start + diff * eased);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration]);

  return current;
}

// ─── KPI Card ───────────────────────────────────────────────────────────────
interface KPICardProps {
  title: string;
  value: number;
  gradientFrom: string;
  gradientTo: string;
  icon: string;
  delay: number;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  gradientFrom,
  gradientTo,
  icon,
  delay,
}) => {
  const animatedValue = useAnimatedCounter(value);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
        color: "#fff",
        position: "relative",
        overflow: "hidden",
        animation: `${fadeInUp} 0.6s ease-out ${delay}ms both`,
        transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-6px) scale(1.02)",
          animation: `${fadeInUp} 0.6s ease-out ${delay}ms both, ${pulseGlow} 2s ease-in-out infinite`,
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
          backgroundSize: "200% 100%",
          animation: `${shimmer} 3s ease-in-out infinite`,
          pointerEvents: "none",
        },
      }}
    >
      {/* Background decorative circle */}
      <Box
        sx={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -30,
          right: 30,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
          pointerEvents: "none",
        }}
      />

      <Typography
        variant="overline"
        sx={{
          fontWeight: 700,
          letterSpacing: 1.5,
          opacity: 0.85,
          fontSize: "0.7rem",
          display: "block",
          mb: 1,
        }}
      >
        {title}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Typography
          sx={{
            fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
            fontWeight: 900,
            letterSpacing: -0.5,
            lineHeight: 1.2,
            textShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          {formatARS(animatedValue)}
        </Typography>
        <Typography
          sx={{
            fontSize: "2rem",
            ml: "auto",
            opacity: 0.3,
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
          }}
        >
          {icon}
        </Typography>
      </Box>
    </Paper>
  );
};

// ─── Custom Recharts Tooltip ────────────────────────────────────────────────
const CustomTooltipContent = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <Paper
      elevation={8}
      sx={{
        p: 2,
        borderRadius: 3,
        border: "none",
        backdropFilter: "blur(12px)",
        background: "rgba(255,255,255,0.95)",
        minWidth: 180,
      }}
    >
      <Typography
        variant="caption"
        sx={{ fontWeight: 700, color: "text.secondary", mb: 1, display: "block" }}
      >
        {label}
      </Typography>
      {payload.map((entry: any, idx: number) => (
        <Box
          key={idx}
          sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: entry.color,
            }}
          />
          <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>
            {entry.name}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 800 }}>
            {formatARS(entry.value)}
          </Typography>
        </Box>
      ))}
    </Paper>
  );
};

// ─── Section Wrapper ────────────────────────────────────────────────────────
const ChartSection: React.FC<{
  title: string;
  children: React.ReactNode;
  delay?: number;
  height?: number | string;
}> = ({ title, children, delay = 0, height }) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        border: "1px solid",
        borderColor: alpha(theme.palette.divider, 0.12),
        bgcolor: "background.paper",
        animation: `${fadeInUp} 0.6s ease-out ${delay}ms both`,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        height: height || "auto",
        display: "flex",
        flexDirection: "column",
        "&:hover": {
          borderColor: alpha(theme.palette.primary.main, 0.2),
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.06)}`,
        },
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: 800,
          mb: 2.5,
          fontSize: "1rem",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        {title}
      </Typography>
      <Box sx={{ flex: 1, minHeight: 0 }}>{children}</Box>
    </Paper>
  );
};

// ─── Data Processing Helpers ────────────────────────────────────────────────
function processTimeSeriesData(transactions: any[]) {
  const grouped: Record<string, { income: number; expense: number }> = {};

  transactions.forEach((tx) => {
    const d = new Date(tx.date);
    const key = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
    if (!grouped[key]) grouped[key] = { income: 0, expense: 0 };
    if (tx.type === "income") grouped[key].income += tx.amount;
    else grouped[key].expense += tx.amount;
  });

  return Object.entries(grouped)
    .sort(([a], [b]) => {
      const [da, ma] = a.split("/").map(Number);
      const [db, mb] = b.split("/").map(Number);
      return ma - mb || da - db;
    })
    .map(([name, data]) => ({ name, ...data }));
}

function processCategoryData(transactions: any[], type: "income" | "expense") {
  const catMap: Record<string, number> = {};
  transactions
    .filter((tx) => tx.type === type)
    .forEach((tx) => {
      catMap[tx.category] = (catMap[tx.category] || 0) + tx.amount;
    });

  return Object.entries(catMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function processPaymentMethodData(transactions: any[]) {
  const methodMap: Record<string, number> = {};
  transactions.forEach((tx) => {
    const method = tx.payment_method || "Otro";
    methodMap[method] = (methodMap[method] || 0) + tx.amount;
  });

  return Object.entries(methodMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

// ─── Custom Pie Label ───────────────────────────────────────────────────────
const renderCustomPieLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={700}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
export default function FinancialStatistics({
  transactions,
  accounts,
}: FinancialStatisticsProps) {
  const theme = useTheme();

  // ── Computed Data ──
  const totalIncome = React.useMemo(
    () =>
      transactions
        .filter((tx) => tx.type === "income")
        .reduce((sum, tx) => sum + tx.amount, 0),
    [transactions]
  );

  const totalExpenses = React.useMemo(
    () =>
      transactions
        .filter((tx) => tx.type === "expense")
        .reduce((sum, tx) => sum + tx.amount, 0),
    [transactions]
  );

  const netBalance = totalIncome - totalExpenses;

  const timeSeriesData = React.useMemo(
    () => processTimeSeriesData(transactions),
    [transactions]
  );

  const incomeCategoryData = React.useMemo(
    () => processCategoryData(transactions, "income"),
    [transactions]
  );

  const expenseCategoryData = React.useMemo(
    () => processCategoryData(transactions, "expense"),
    [transactions]
  );

  const paymentMethodData = React.useMemo(
    () => processPaymentMethodData(transactions),
    [transactions]
  );

  // ── Empty State ──
  if (!transactions || transactions.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: 10,
          px: 3,
          animation: `${fadeInUp} 0.6s ease-out`,
        }}
      >
        <Typography sx={{ fontSize: "4rem", mb: 2 }}>📊</Typography>
        <Typography
          variant="h5"
          sx={{ fontWeight: 800, mb: 1, textAlign: "center" }}
        >
          Sin datos financieros
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: "text.secondary", textAlign: "center", maxWidth: 400 }}
        >
          Aún no hay transacciones registradas. Las estadísticas aparecerán aquí
          cuando se agreguen ingresos o egresos.
        </Typography>
      </Box>
    );
  }

  // ── Gradient definitions for charts ──
  const gradientDefs = (
    <defs>
      <linearGradient id="fsGradIncome" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
      </linearGradient>
      <linearGradient id="fsGradExpense" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
      </linearGradient>
      <linearGradient id="fsBarGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.8} />
      </linearGradient>
    </defs>
  );

  return (
    <Box sx={{ p: { xs: 1, md: 0 } }}>
      {/* ─── KPI CARDS ─── */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <KPICard
            title="Ingresos Totales"
            value={totalIncome}
            gradientFrom="#059669"
            gradientTo="#10b981"
            icon="📈"
            delay={0}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <KPICard
            title="Egresos Totales"
            value={totalExpenses}
            gradientFrom="#dc2626"
            gradientTo="#ef4444"
            icon="📉"
            delay={150}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 12, md: 4 }}>
          <KPICard
            title="Balance Neto"
            value={netBalance}
            gradientFrom="#4f46e5"
            gradientTo="#8b5cf6"
            icon="💰"
            delay={300}
          />
        </Grid>
      </Grid>

      {/* ─── AREA CHART: Income vs Expenses Over Time ─── */}
      <Box sx={{ mb: 4 }}>
        <ChartSection title="📊 Ingresos vs Egresos en el Tiempo" delay={400}>
          <Box sx={{ width: "100%", height: 350 }}>
            <ResponsiveContainer width="100%" height="100%" debounce={50}>
              <AreaChart data={timeSeriesData}>
                {gradientDefs}
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={alpha(theme.palette.divider, 0.4)}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: theme.palette.text.secondary,
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  tick={{
                    fill: theme.palette.text.secondary,
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                />
                <RechartsTooltip content={<CustomTooltipContent />} />
                <Legend
                  verticalAlign="top"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontWeight: 600, fontSize: 13 }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#fsGradIncome)"
                  strokeWidth={3}
                  name="Ingresos"
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#ef4444"
                  fillOpacity={1}
                  fill="url(#fsGradExpense)"
                  strokeWidth={3}
                  name="Egresos"
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </ChartSection>
      </Box>

      {/* ─── TWIN PIE CHARTS: Income by Category + Expenses by Category ─── */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartSection title="🟢 Ingresos por Categoría" delay={500} height="100%">
            {incomeCategoryData.length > 0 ? (
              <Box sx={{ width: "100%", height: 300 }}>
                <ResponsiveContainer width="100%" height="100%" debounce={50}>
                  <PieChart>
                    <Pie
                      data={incomeCategoryData}
                      innerRadius={55}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                      label={renderCustomPieLabel}
                      labelLine={false}
                      animationBegin={0}
                      animationDuration={1200}
                    >
                      {incomeCategoryData.map((_entry, index) => (
                        <Cell
                          key={`income-cell-${index}`}
                          fill={INCOME_CATEGORY_COLORS[index % INCOME_CATEGORY_COLORS.length]}
                          stroke="none"
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value: number) => formatARS(value)}
                      contentStyle={{
                        borderRadius: 12,
                        border: "none",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: 12, fontWeight: 600 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 300,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Sin ingresos por categoría
                </Typography>
              </Box>
            )}
          </ChartSection>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ChartSection title="🔴 Egresos por Categoría" delay={600} height="100%">
            {expenseCategoryData.length > 0 ? (
              <Box sx={{ width: "100%", height: 300 }}>
                <ResponsiveContainer width="100%" height="100%" debounce={50}>
                  <PieChart>
                    <Pie
                      data={expenseCategoryData}
                      innerRadius={55}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                      label={renderCustomPieLabel}
                      labelLine={false}
                      animationBegin={0}
                      animationDuration={1200}
                    >
                      {expenseCategoryData.map((_entry, index) => (
                        <Cell
                          key={`expense-cell-${index}`}
                          fill={EXPENSE_CATEGORY_COLORS[index % EXPENSE_CATEGORY_COLORS.length]}
                          stroke="none"
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value: number) => formatARS(value)}
                      contentStyle={{
                        borderRadius: 12,
                        border: "none",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: 12, fontWeight: 600 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 300,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Sin egresos por categoría
                </Typography>
              </Box>
            )}
          </ChartSection>
        </Grid>
      </Grid>

      {/* ─── BAR CHART: Payment Method Distribution ─── */}
      <ChartSection title="💳 Distribución por Método de Pago" delay={700}>
        <Box sx={{ width: "100%", height: 350 }}>
          <ResponsiveContainer width="100%" height="100%" debounce={50}>
            <BarChart
              data={paymentMethodData}
              layout="vertical"
              margin={{ left: 20, right: 30, top: 5, bottom: 5 }}
            >
              {gradientDefs}
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke={alpha(theme.palette.divider, 0.3)}
              />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                tick={{
                  fill: theme.palette.text.secondary,
                  fontSize: 12,
                  fontWeight: 500,
                }}
              />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                width={100}
                tick={{
                  fill: theme.palette.text.primary,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              />
              <RechartsTooltip
                content={<CustomTooltipContent />}
                cursor={{ fill: alpha(theme.palette.primary.main, 0.04) }}
              />
              <Bar
                dataKey="value"
                name="Monto Total"
                radius={[0, 8, 8, 0]}
                barSize={28}
                animationDuration={1500}
              >
                {paymentMethodData.map((_entry, index) => (
                  <Cell
                    key={`bar-cell-${index}`}
                    fill={PAYMENT_METHOD_COLORS[index % PAYMENT_METHOD_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </ChartSection>
    </Box>
  );
}
