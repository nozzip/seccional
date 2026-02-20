import React from 'react';
import {
    Grid,
    Paper,
    Typography,
    Box,
    Stack,
    alpha,
    useTheme
} from '@mui/material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import PeopleIcon from '@mui/icons-material/People';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const enrollmentData = [
    { name: 'Mar', alumnos: 45 },
    { name: 'Abr', alumnos: 52 },
    { name: 'May', alumnos: 48 },
    { name: 'Jun', alumnos: 61 },
    { name: 'Jul', alumnos: 55 },
    { name: 'Ago', alumnos: 67 },
];

const revenueData = [
    { name: 'Mar', monto: 120000 },
    { name: 'Abr', monto: 150000 },
    { name: 'May', monto: 145000 },
    { name: 'Jun', monto: 180000 },
    { name: 'Jul', monto: 170000 },
    { name: 'Ago', monto: 210000 },
];

const categoryData = [
    { name: 'Natación', value: 400 },
    { name: 'Canchas', value: 300 },
    { name: 'Quinchos', value: 150 },
    { name: 'Invitados', value: 100 },
];

const COLORS = ['#1a5f7a', '#c1121f', '#ffb703', '#8ecae6'];

const StatCard = ({ title, value, icon: Icon, trend }: any) => {
    const theme = useTheme();
    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                gap: 3
            }}
        >
            <Avatar
                sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    width: 56,
                    height: 56
                }}
            >
                <Icon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {title}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    {value}
                </Typography>
                {trend && (
                    <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                        <TrendingUpIcon sx={{ fontSize: 14, mr: 0.5 }} /> {trend}
                    </Typography>
                )}
            </Box>
        </Paper>
    );
};

import { Avatar } from '@mui/material';

export default function AdminOverview() {
    const theme = useTheme();

    return (
        <Box>
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard title="Total Alumnos" value="124" icon={PeopleIcon} trend="+12% este mes" />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard title="Ingresos (Ago)" value="$210.000" icon={AccountBalanceWalletIcon} trend="+8% vs Jul" />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard title="Ocupación Canchas" value="78%" icon={EventAvailableIcon} />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard title="Nuevos Socios" value="15" icon={TrendingUpIcon} />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 800 }}>Inscripciones Mensuales</Typography>
                        <Box sx={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={enrollmentData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        cursor={{ fill: alpha(theme.palette.primary.main, 0.05) }}
                                    />
                                    <Bar dataKey="alumnos" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} lg={4}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 800 }}>Distribución de Ingresos</Typography>
                        <Box sx={{ width: '100%', height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <Stack direction="row" spacing={2} sx={{ mt: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                                {categoryData.map((entry, index) => (
                                    <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: COLORS[index % COLORS.length] }} />
                                        <Typography variant="caption" sx={{ fontWeight: 600 }}>{entry.name}</Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
