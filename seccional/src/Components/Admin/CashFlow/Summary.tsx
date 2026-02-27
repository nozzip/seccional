import React from "react";
import {
    Box,
    Typography,
    Grid,
    Paper,
    Stack,
    alpha,
    useTheme,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";

const MemoizedSummary = React.memo(
    ({ data, totalIncomes, totalExpenses, balance }: any) => {
        const theme = useTheme();
        return (
            <Box sx={{ mt: 4 }}>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 4,
                                border: "1px solid",
                                borderColor: "divider",
                                bgcolor: alpha(theme.palette.success.main, 0.05),
                            }}
                        >
                            <Stack spacing={1}>
                                <Typography
                                    variant="overline"
                                    sx={{ fontWeight: 800, color: "success.main" }}
                                >
                                    INGRESOS TOTALES
                                </Typography>
                                <Typography variant="h3" sx={{ fontWeight: 900 }}>
                                    ${totalIncomes.toLocaleString()}
                                </Typography>
                                <TrendingUpIcon
                                    sx={{ color: "success.main", fontSize: 40, opacity: 0.3 }}
                                />
                            </Stack>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 4,
                                border: "1px solid",
                                borderColor: "divider",
                                bgcolor: alpha(theme.palette.error.main, 0.05),
                            }}
                        >
                            <Stack spacing={1}>
                                <Typography
                                    variant="overline"
                                    sx={{ fontWeight: 800, color: "error.main" }}
                                >
                                    EGRESOS TOTALES
                                </Typography>
                                <Typography variant="h3" sx={{ fontWeight: 900 }}>
                                    ${totalExpenses.toLocaleString()}
                                </Typography>
                                <TrendingDownIcon
                                    sx={{ color: "error.main", fontSize: 40, opacity: 0.3 }}
                                />
                            </Stack>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 4,
                                border: "1px solid",
                                borderColor: "divider",
                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                            }}
                        >
                            <Stack spacing={1}>
                                <Typography
                                    variant="overline"
                                    sx={{ fontWeight: 800, color: "primary.main" }}
                                >
                                    BALANCE NETO
                                </Typography>
                                <Typography variant="h3" sx={{ fontWeight: 900 }}>
                                    ${balance.toLocaleString()}
                                </Typography>
                                <AccountBalanceWalletIcon
                                    sx={{ color: "primary.main", fontSize: 40, opacity: 0.3 }}
                                />
                            </Stack>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, borderRadius: 4 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
                                Dinámica Diaria (Ingresos vs Egresos)
                            </Typography>
                            <Box sx={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data?.dailyChart || []}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="date" fontSize={12} />
                                        <YAxis fontSize={12} />
                                        <RechartsTooltip />
                                        <Legend />
                                        <Bar
                                            dataKey="ingreso"
                                            fill={theme.palette.success.main}
                                            radius={[4, 4, 0, 0]}
                                            name="Ingresos"
                                        />
                                        <Bar
                                            dataKey="egreso"
                                            fill={theme.palette.error.main}
                                            radius={[4, 4, 0, 0]}
                                            name="Egresos"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, borderRadius: 4 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
                                Ingresos por Categoría
                            </Typography>
                            <Box
                                sx={{
                                    height: 300,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data?.pieChart || []}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {(data?.pieChart || []).map((entry: any, index: number) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={
                                                        ["#1a5f7a", "#c39534", "#159895", "#fb2576"][
                                                        index % 4
                                                        ]
                                                    }
                                                />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        );
    },
);

export default MemoizedSummary;
