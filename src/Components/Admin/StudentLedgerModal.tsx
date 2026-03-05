import React, { useState, useEffect } from "react";
import {
    Typography,
    Paper,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    Box,
    alpha,
    useTheme,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { supabase } from "../../supabaseClient";
import { StudentData } from "./StudentRegistrationDialog";

interface StudentLedgerModalProps {
    open: boolean;
    onClose: () => void;
    student: StudentData | null;
    onLedgerUpdated: () => void; // Para recargar al padre
}

export default function StudentLedgerModal({
    open,
    onClose,
    student,
    onLedgerUpdated,
}: StudentLedgerModalProps) {
    const theme = useTheme();
    const [ledgers, setLedgers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Form para recarga
    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState("Efectivo");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchLedgers = async () => {
        if (!student?.id) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("student_ledgers")
                .select("*")
                .eq("student_id", student.id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setLedgers(data || []);
        } catch (error) {
            console.error("Error fetching ledgers:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open && student) {
            fetchLedgers();
            setAmount("");
            setMethod("Efectivo");
        }
    }, [open, student]);

    const handleDeposit = async () => {
        if (!student || !student.id) return;
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            alert("Ingrese un monto válido mayor a 0.");
            return;
        }

        if (!window.confirm(`¿Confirma la recarga de $${parsedAmount} para ${student.fullName} vía ${method}?`)) {
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Registrar el ingreso en transactions (afecta caja diaria)
            const { data: txData, error: txError } = await supabase
                .from("transactions")
                .insert({
                    date: new Date().toISOString().split("T")[0],
                    type: "Ingreso",
                    category: "Recarga Saldo a Favor",
                    amount: parsedAmount,
                    payment_method: method,
                    description: `Recarga de saldo: ${student.fullName}`,
                    student_dni: student.dni,
                    branch: "azucena", // Guardar en rama azucena
                })
                .select()
                .single();

            if (txError) throw txError;

            // 2. Registrar en student_ledgers
            const { error: ledgerError } = await supabase
                .from("student_ledgers")
                .insert({
                    student_id: student.id,
                    date: new Date().toISOString().split("T")[0],
                    type: "deposit",
                    amount: parsedAmount,
                    description: `Recarga vía ${method}`,
                    payment_method: method,
                    transaction_id: txData.id,
                });

            if (ledgerError) throw ledgerError;

            // 3. Actualizar el balance del alumno
            const newBalance = (student.balance || 0) + parsedAmount;
            const { error: studentError } = await supabase
                .from("students")
                .update({ balance: newBalance })
                .eq("id", student.id);

            if (studentError) throw studentError;

            // Exito
            setAmount("");
            fetchLedgers();
            onLedgerUpdated(); // Notificar al padre

        } catch (error: any) {
            console.error("Error in handleDeposit:", error);
            alert("Error al procesar la recarga: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!student) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { borderRadius: 4 } }}
        >
            <DialogTitle sx={{ fontWeight: 800, px: 4, pt: 4 }}>
                Cuenta Corriente: {student.fullName}
            </DialogTitle>
            <DialogContent sx={{ px: 4, pb: 4 }}>
                <Grid container spacing={4}>
                    <Grid size={{ xs: 12 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                bgcolor: alpha(theme.palette.success.main, 0.05),
                                border: "1px solid",
                                borderColor: "success.light",
                                borderRadius: 4,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                mt: 1,
                            }}
                        >
                            <Box>
                                <Typography variant="overline" color="success.main" sx={{ fontWeight: 800 }}>
                                    SALDO A FAVOR ACTUAL
                                </Typography>
                                <Typography variant="h3" color="success.main" sx={{ fontWeight: 900 }}>
                                    ${(student.balance || 0).toLocaleString()}
                                </Typography>
                            </Box>
                            <AccountBalanceWalletIcon sx={{ fontSize: 60, color: "success.main", opacity: 0.5 }} />
                        </Paper>
                    </Grid>

                    {/* Formulario de recarga rápida */}
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: "primary.main" }}>
                            NUEVA RECARGA DE SALDO
                        </Typography>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
                            <TextField
                                label="Monto ($)"
                                type="number"
                                size="small"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                sx={{ flex: 1 }}
                            />
                            <FormControl size="small" sx={{ flex: 1 }}>
                                <InputLabel>Medio de Pago</InputLabel>
                                <Select
                                    value={method}
                                    label="Medio de Pago"
                                    onChange={(e) => setMethod(e.target.value)}
                                >
                                    <MenuItem value="Efectivo">Efectivo (Caja Azucena)</MenuItem>
                                    <MenuItem value="Transferencia">Transferencia</MenuItem>
                                </Select>
                            </FormControl>
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<AddCircleIcon />}
                                onClick={handleDeposit}
                                disabled={isSubmitting || !amount}
                                sx={{ height: 40, fontWeight: 700, px: 3, borderRadius: 2 }}
                            >
                                Abonar a Cuenta
                            </Button>
                        </Stack>
                    </Grid>

                    {/* Historial */}
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: "text.secondary" }}>
                            HISTORIAL DE MOVIMIENTOS
                        </Typography>
                        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
                            <Table size="small">
                                <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Descripción</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }} align="right">Monto</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                                Cargando...
                                            </TableCell>
                                        </TableRow>
                                    ) : ledgers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" sx={{ py: 3, color: "text.secondary" }}>
                                                No hay movimientos registrados.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        ledgers.map((l) => (
                                            <TableRow key={l.id} hover>
                                                <TableCell>
                                                    {new Date(l.created_at).toLocaleDateString("es-AR")}
                                                    <Typography variant="caption" display="block" color="text.secondary">
                                                        {new Date(l.created_at).toLocaleTimeString("es-AR", { hour: '2-digit', minute: '2-digit' })}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>{l.description}</TableCell>
                                                <TableCell>
                                                    {l.type === "deposit" ? (
                                                        <Chip label="RECARGA" size="small" color="success" variant="outlined" sx={{ fontWeight: 800, fontSize: "0.65rem" }} />
                                                    ) : (
                                                        <Chip label="CONSUMO" size="small" color="error" variant="outlined" sx={{ fontWeight: 800, fontSize: "0.65rem" }} />
                                                    )}
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 700, color: l.type === "deposit" ? "success.main" : "error.main" }}>
                                                    {l.type === "deposit" ? "+" : "-"}${Number(l.amount).toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 4, pt: 0 }}>
                <Button onClick={onClose} sx={{ fontWeight: 700 }}>
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    );
}
