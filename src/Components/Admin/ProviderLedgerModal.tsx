import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    alpha,
    useTheme,
} from "@mui/material";
import { supabase } from "../../supabaseClient";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PaymentIcon from "@mui/icons-material/Payment";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

export interface ProviderData {
    id: number;
    name: string;
    cuit: string;
    balance: number;
}

interface ProviderLedgerModalProps {
    open: boolean;
    onClose: () => void;
    provider: ProviderData | null;
}

export default function ProviderLedgerModal({
    open,
    onClose,
    provider,
}: ProviderLedgerModalProps) {
    const theme = useTheme();
    const [ledgers, setLedgers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchLedgers = async () => {
        if (!provider) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("provider_ledgers")
                .select(`*, transactions(description, branch)`)
                .eq("provider_id", provider.id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setLedgers(data || []);
        } catch (error) {
            console.error("Error fetching provider ledgers:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open && provider) {
            fetchLedgers();
        }
    }, [open, provider]);

    if (!provider) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ pb: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AccountBalanceWalletIcon color="primary" />
                    <Typography sx={{ fontWeight: 800, fontSize: "1.2rem" }}>
                        Cuenta: {provider.name}
                    </Typography>
                </Box>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0 }}>
                <Box
                    sx={{
                        p: 3,
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Box>
                        <Typography variant="overline" color="text.secondary">
                            ESTADO DE CUENTA
                        </Typography>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 900,
                                color:
                                    provider.balance > 0
                                        ? "error.main" // We owe them money
                                        : provider.balance < 0
                                            ? "success.main" // We have advance in our favor
                                            : "text.primary", // Zero
                            }}
                        >
                            ${Math.abs(provider.balance).toLocaleString()}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {provider.balance > 0
                                ? "Deuda Pendiente (A Pagar)"
                                : provider.balance < 0
                                    ? "Saldo a Favor del Club (Adelanto)"
                                    : "Todo Pagado (Sin Deuda)"}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ p: 0 }}>
                    <TableContainer>
                        <Table size="small">
                            <TableHead sx={{ bgcolor: "background.default" }}>
                                <TableRow>
                                    <TableCell>Fecha</TableCell>
                                    <TableCell>Tipo</TableCell>
                                    <TableCell>Detalle</TableCell>
                                    <TableCell align="right">Monto</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                            Cargando historial...
                                        </TableCell>
                                    </TableRow>
                                ) : ledgers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                            <Typography color="text.secondary">
                                                No hay movimientos registrados
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    ledgers.map((l) => (
                                        <TableRow key={l.id} hover>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    {new Date(l.date).toLocaleDateString("es-AR")}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {l.type === "invoice" ? (
                                                    <Chip
                                                        icon={<ReceiptIcon sx={{ fontSize: 16 }} />}
                                                        label="Factura"
                                                        size="small"
                                                        color="error"
                                                        variant="outlined"
                                                    />
                                                ) : (
                                                    <Chip
                                                        icon={<PaymentIcon sx={{ fontSize: 16 }} />}
                                                        label="Adelanto/Pago"
                                                        size="small"
                                                        color="success"
                                                        variant="outlined"
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {l.description}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Medio: {l.payment_method === "Efectivo"
                                                        ? `Efectivo (${l.transactions?.branch === "noroeste" ? "Caja Noroeste" : "Caja Azucena"})`
                                                        : l.payment_method === "Transferencia"
                                                            ? "Transferencia (Banco Compartido)"
                                                            : l.payment_method}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: 700,
                                                        color:
                                                            l.type === "invoice"
                                                                ? "error.main"
                                                                : "success.main",
                                                    }}
                                                >
                                                    {l.type === "invoice" ? "+" : "-"}$
                                                    {Number(l.amount).toLocaleString()}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }}>
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    );
}
