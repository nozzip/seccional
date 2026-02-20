import React, { useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    TextField,
    Stack,
    Chip,
    alpha,
    useTheme,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    InputAdornment,
    MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

interface Transaction {
    id: number;
    date: string;
    type: 'Ingreso' | 'Egreso';
    category: string;
    amount: number;
    invoice?: string;
    description: string;
}

const initialTransactions: Transaction[] = [
    { id: 1, date: '2026-02-20', type: 'Ingreso', category: 'Venta Bebidas', amount: 4500, description: 'Coca-cola y Aguas' },
    { id: 2, date: '2026-02-20', type: 'Ingreso', category: 'Canchas', amount: 12000, description: 'Turnos Paddle 18hs/19hs' },
    { id: 3, date: '2026-02-20', type: 'Egreso', category: 'Limpieza', amount: 3500, invoice: 'A001-00045', description: 'Compra de artículos de limpieza' },
];

export default function CashFlowManager() {
    const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
    const [open, setOpen] = useState(false);
    const theme = useTheme();

    const totalIncomes = transactions.filter(t => t.type === 'Ingreso').reduce((acc, t) => acc + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'Egreso').reduce((acc, t) => acc + t.amount, 0);
    const balance = totalIncomes - totalExpenses;

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>
                        Flujo de Caja Mensual / Diario
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Registro consolidado de todos los movimientos de dinero
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
                    Nuevo Movimiento
                </Button>
            </Box>

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <TrendingUpIcon color="success" />
                            <Box>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'success.main' }}>TOTAL INGRESOS</Typography>
                                <Typography variant="h5" sx={{ fontWeight: 800 }}>${totalIncomes.toLocaleString()}</Typography>
                            </Box>
                        </Stack>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.error.main, 0.05) }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <TrendingDownIcon color="error" />
                            <Box>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'error.main' }}>TOTAL EGRESOS</Typography>
                                <Typography variant="h5" sx={{ fontWeight: 800 }}>${totalExpenses.toLocaleString()}</Typography>
                            </Box>
                        </Stack>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <AccountBalanceWalletIcon color="primary" />
                            <Box>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>BALANCE NETO</Typography>
                                <Typography variant="h5" sx={{ fontWeight: 800 }}>${balance.toLocaleString()}</Typography>
                            </Box>
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                <Table>
                    <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Categoría</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Descripción</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Comprobante</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>Importe</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {transactions.map((t) => (
                            <TableRow key={t.id} hover>
                                <TableCell sx={{ fontSize: '0.85rem' }}>{t.date}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={t.type}
                                        size="small"
                                        color={t.type === 'Ingreso' ? 'success' : 'error'}
                                        variant="outlined"
                                        sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                                    />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{t.category}</TableCell>
                                <TableCell sx={{ fontSize: '0.85rem' }}>{t.description}</TableCell>
                                <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>{t.invoice || '-'}</TableCell>
                                <TableCell align="right">
                                    <Typography sx={{ fontWeight: 800, color: t.type === 'Ingreso' ? 'success.main' : 'error.main' }}>
                                        {t.type === 'Ingreso' ? '+' : '-'}${t.amount.toLocaleString()}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ fontWeight: 800 }}>Nuevo Movimiento de Caja</DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <TextField select label="Tipo de Movimiento" fullWidth defaultValue="Egreso">
                            <MenuItem value="Ingreso">Ingreso (+)</MenuItem>
                            <MenuItem value="Egreso">Egreso (-)</MenuItem>
                        </TextField>
                        <TextField label="Categoría" fullWidth placeholder="Eje: Insumos, Sueldos, Limpieza..." />
                        <TextField
                            label="Importe"
                            fullWidth
                            type="number"
                            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                        />
                        <TextField label="Nro de Factura / Ticket" fullWidth />
                        <TextField label="Descripción" fullWidth multiline rows={2} />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={() => setOpen(false)} sx={{ fontWeight: 700 }}>Cancelar</Button>
                    <Button variant="contained" sx={{ px: 4, fontWeight: 700 }}>Registrar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
