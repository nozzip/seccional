import React, { useMemo } from "react";
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    alpha,
    useTheme,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Chip,
    Stack,
    Divider,
    Grid,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { Transaction, Account } from "./types";

interface GeneralLedgerProps {
    transactions: Transaction[];
    accountsData: Account[];
    onAutoCreateAccount?: (categoryName: string) => void;
}

const GeneralLedger: React.FC<GeneralLedgerProps> = ({
    transactions,
    accountsData,
    onAutoCreateAccount,
}) => {
    const theme = useTheme();

    const ledgerData = useMemo(() => {
        return accountsData.map((acc) => {
            const accTransactions = transactions
                .filter((t) => t.category === acc.name)
                .sort(
                    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
                );

            let runningBalance = 0;
            const history = accTransactions.map((t) => {
                if (t.type === "Ingreso") runningBalance += t.amount;
                else runningBalance -= t.amount;
                return { ...t, currentBalance: runningBalance };
            });

            const totalIn = accTransactions
                .filter((t) => t.type === "Ingreso")
                .reduce((sum, t) => sum + t.amount, 0);
            const totalOut = accTransactions
                .filter((t) => t.type === "Egreso")
                .reduce((sum, t) => sum + t.amount, 0);

            return {
                ...acc,
                history,
                totalIn,
                totalOut,
                finalBalance: totalIn - totalOut,
            };
        });
    }, [accountsData, transactions]);

    const missingAccounts = useMemo(() => {
        const categoriesInTx = new Set(transactions.map((t) => t.category));
        const accountNames = new Set(accountsData.map((a) => a.name));
        return Array.from(categoriesInTx).filter(
            (cat) => cat && !accountNames.has(cat)
        );
    }, [transactions, accountsData]);

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 800, color: "primary.main" }}>
                Libro Mayor por Cuenta
            </Typography>

            {missingAccounts.length > 0 && (
                <Paper sx={{ p: 2, mb: 3, bgcolor: alpha(theme.palette.warning.main, 0.1), border: "1px solid", borderColor: "warning.light", borderRadius: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "warning.dark", mb: 1 }}>
                        Cuentas faltantes detectadas ({missingAccounts.length})
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
                        Las siguientes categorías tienen movimientos pero no están creadas como cuentas en el Libro Mayor:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
                        {missingAccounts.map((cat) => (
                            <Chip
                                key={cat}
                                label={`Crear "${cat}"`}
                                onClick={() => onAutoCreateAccount?.(cat)}
                                color="warning"
                                variant="outlined"
                                clickable
                                sx={{ fontWeight: 700 }}
                            />
                        ))}
                    </Stack>
                </Paper>
            )}

            <Stack spacing={2}>
                {ledgerData.map((acc) => (
                    <Accordion
                        key={acc.id}
                        sx={{
                            borderRadius: "16px !important",
                            border: "1px solid",
                            borderColor: "divider",
                            boxShadow: "none",
                            "&:before": { display: "none" },
                            overflow: "hidden",
                        }}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            sx={{
                                bgcolor: alpha(acc.color || theme.palette.primary.main, 0.05),
                                px: 3,
                                py: 1,
                            }}
                        >
                            <Stack
                                direction="row"
                                spacing={3}
                                alignItems="center"
                                sx={{ width: "100%" }}
                            >
                                <Box
                                    sx={{
                                        p: 1,
                                        borderRadius: "12px",
                                        bgcolor: acc.color || theme.palette.primary.main,
                                        color: "white",
                                        display: "flex",
                                    }}
                                >
                                    <AccountBalanceIcon fontSize="small" />
                                </Box>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                                        {acc.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                        {acc.history.length} movimientos registrados
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: "right", minWidth: 150 }}>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 900,
                                            color: acc.finalBalance >= 0 ? "success.main" : "error.main",
                                        }}
                                    >
                                        ${acc.finalBalance.toLocaleString()}
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.7 }}>
                                        SALDO ACTUAL
                                    </Typography>
                                </Box>
                            </Stack>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 0 }}>
                            <Divider />
                            <Box sx={{ p: 3, bgcolor: alpha(theme.palette.background.paper, 0.5) }}>
                                <Grid container spacing={4} sx={{ mb: 3 }}>
                                    <Grid item xs={6} md={3}>
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary" }}>
                                            TOTAL INGRESOS (DEBE)
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 800, color: "success.main" }}>
                                            +${acc.totalIn.toLocaleString()}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6} md={3}>
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary" }}>
                                            TOTAL EGRESOS (HABER)
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 800, color: "error.main" }}>
                                            -${acc.totalOut.toLocaleString()}
                                        </Typography>
                                    </Grid>
                                </Grid>

                                <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
                                    <Table size="small">
                                        <TableHead sx={{ bgcolor: alpha(theme.palette.action.hover, 0.5) }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 800 }}>Fecha</TableCell>
                                                <TableCell sx={{ fontWeight: 800 }}>Detalle / Concepto</TableCell>
                                                <TableCell sx={{ fontWeight: 800 }} align="right">Debe</TableCell>
                                                <TableCell sx={{ fontWeight: 800 }} align="right">Haber</TableCell>
                                                <TableCell sx={{ fontWeight: 800 }} align="right">Saldo</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {acc.history.length > 0 ? (
                                                acc.history.map((tx) => (
                                                    <TableRow key={tx.id} hover>
                                                        <TableCell sx={{ fontSize: "0.85rem", fontWeight: 600 }}>{tx.date}</TableCell>
                                                        <TableCell sx={{ fontSize: "0.85rem" }}>{tx.description}</TableCell>
                                                        <TableCell align="right" sx={{ color: "success.main", fontWeight: 700 }}>
                                                            {tx.type === "Ingreso" ? `$${tx.amount.toLocaleString()}` : "-"}
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ color: "error.main", fontWeight: 700 }}>
                                                            {tx.type === "Egreso" ? `$${tx.amount.toLocaleString()}` : "-"}
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: 800, bgcolor: alpha(theme.palette.action.hover, 0.3) }}>
                                                            ${tx.currentBalance.toLocaleString()}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={5} align="center" sx={{ py: 4, opacity: 0.5 }}>
                                                        No hay movimientos registrados para esta cuenta.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </Stack>
        </Box>
    );
};


export default GeneralLedger;
