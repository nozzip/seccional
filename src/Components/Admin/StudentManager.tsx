import React, { useState, useEffect } from "react";
import {
  Box,
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Stack,
  Divider,
  alpha,
  useTheme,
  InputAdornment,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PaidIcon from "@mui/icons-material/Paid";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import StudentRegistrationDialog, {
  StudentData,
} from "./StudentRegistrationDialog";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import HistoryIcon from "@mui/icons-material/History";
import { supabase } from "../../supabaseClient";

export default function StudentManager() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .is("deleted_at", null)
        .order("full_name", { ascending: true });

      if (error) throw error;

      const mapped = (data || []).map((s: any) => ({
        ...s,
        fullName: s.full_name,
        hasProfessor: s.has_professor,
        lastPayment: s.last_payment,
        expiryDate: s.expiry_date,
      }));
      setStudents(mapped);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("students_manager_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "students" },
        fetchData,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterExpiring, setFilterExpiring] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [historyStudent, setHistoryStudent] = useState<StudentData | null>(
    null,
  );
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);

  const getExpiryStatus = (expiryDate?: string) => {
    if (!expiryDate) return { label: "SIN PAGOS", color: "default" as const };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expiryDate);
    exp.setHours(23, 59, 59, 999);

    if (exp < today) return { label: "VENCIDO", color: "error" as const };

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    if (exp <= nextWeek) return { label: "POR VENCER", color: "warning" as const };

    return { label: "ACTIVO", color: "success" as const };
  };

  const handleDelete = async (studentId: number) => {
    if (
      !window.confirm(
        "¿Deseas enviar a este alumno a la Papelera? Permanecerá allí por 7 días antes de eliminarse definitivamente.",
      )
    )
      return;
    try {
      const { error } = await supabase
        .from("students")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", studentId);
      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error("Error soft-deleting student:", error);
    }
  };

  const handleClearPayment = async (studentId: number) => {
    if (
      !window.confirm(
        "¿Deseas anular el estado de pago de este alumno? El registro del alumno se mantendrá pero figurará como deuda.",
      )
    )
      return;
    try {
      const { error } = await supabase
        .from("students")
        .update({
          last_payment: null,
          expiry_date: null,
        })
        .eq("id", studentId);
      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error("Error clearing payment:", error);
    }
  };

  const handleViewHistory = async (student: StudentData) => {
    setHistoryStudent(student);
    setOpenHistory(true);
    setPaymentHistory([]);
    try {
      const { data, error } = await supabase
        .from("student_payments")
        .select("*, transactions(payment_method, branch)")
        .eq("student_dni", student.dni)
        .order("payment_date", { ascending: false });
      if (error) throw error;
      setPaymentHistory(data || []);
    } catch (error) {
      console.error("Error fetching payment history:", error);
    }
  };

  const theme = useTheme();

  return (
    <Box>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", gap: 2, flex: 1 }}>
          <TextField
            placeholder="Buscar por nombre, DNI..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: { xs: "100%", md: 400 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant={filterExpiring ? "contained" : "outlined"}
            color={filterExpiring ? "warning" : "inherit"}
            onClick={() => setFilterExpiring(!filterExpiring)}
            sx={{
              fontWeight: 700,
              borderColor: filterExpiring ? "warning.main" : "divider",
            }}
          >
            {filterExpiring
              ? "Mostrando Alertas (7 Días)"
              : "Ver Alertas de Vencimiento"}
          </Button>
        </Box>
        <Button
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedStudent(null);
            setOpen(true);
          }}
        >
          Nuevo Alumno
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}
      >
        <Table>
          <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Alumno</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>DNI</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Contacto</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                Próximo Vencimiento
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Estado Pago</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students
              .filter((s) => {
                const matchesSearch =
                  s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  s.dni.includes(searchTerm);

                let matchesExpiring = true;
                if (filterExpiring) {
                  const daysLeft = s.expiryDate
                    ? Math.ceil(
                      (new Date(s.expiryDate).getTime() -
                        new Date().getTime() +
                        1000) /
                      (1000 * 60 * 60 * 24),
                    )
                    : 0;
                  matchesExpiring = daysLeft <= 7;
                }

                return matchesSearch && matchesExpiring;
              })
              .map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell>
                    <Typography sx={{ fontWeight: 700 }}>
                      {s.fullName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {s.hasProfessor ? "Con Profesor" : "Pileta Libre"}
                    </Typography>
                  </TableCell>
                  <TableCell>{s.dni}</TableCell>
                  <TableCell>{s.phone}</TableCell>
                  <TableCell>
                    {s.expiryDate ? (
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            color: getExpiryStatus(s.expiryDate).color + ".main",
                          }}
                        >
                          {new Date(s.expiryDate).toLocaleDateString("es-AR")}
                        </Typography>
                        <Typography
                          variant="caption"
                          color={
                            getExpiryStatus(s.expiryDate).color === "warning"
                              ? "warning.main"
                              : "text.secondary"
                          }
                          sx={{
                            fontWeight:
                              getExpiryStatus(s.expiryDate).color === "warning" ? 700 : 400,
                          }}
                        >
                          {getExpiryStatus(s.expiryDate).label === "VENCIDO"
                            ? "Vencido"
                            : "Días restantes: " +
                            Math.ceil(
                              (new Date(s.expiryDate).getTime() -
                                new Date().getTime() +
                                1000) /
                              (1000 * 60 * 60 * 24),
                            )}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {s.lastPayment ? (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <PaidIcon color="success" sx={{ fontSize: 18 }} />
                        <Box>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              ${s.lastPayment.amount}
                            </Typography>
                            <Chip
                              icon={
                                <FiberManualRecordIcon
                                  sx={{ fontSize: "10px !important" }}
                                />
                              }
                              label={
                                getExpiryStatus(s.expiryDate).label
                              }
                              size="small"
                              color={
                                getExpiryStatus(s.expiryDate).color
                              }
                              sx={{
                                height: 20,
                                fontSize: "0.65rem",
                                fontWeight: 800,
                              }}
                            />
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            Pago: {s.lastPayment.date} • Vence: {s.expiryDate}
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Chip label="SIN PAGOS" size="small" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="info"
                      title="Ver Historial de Pagos"
                      onClick={() => s.id && handleViewHistory(s)}
                    >
                      <HistoryIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="warning"
                      title="Limpiar Estado de Pago"
                      onClick={() => s.id && handleClearPayment(s.id)}
                      disabled={!s.lastPayment}
                    >
                      <MoneyOffIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      title="Editar Datos"
                      onClick={() => {
                        setSelectedStudent(s);
                        setOpen(true);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      title="Eliminar Alumno (Baja Definitiva)"
                      onClick={() => s.id && handleDelete(s.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <StudentRegistrationDialog
        open={open}
        onClose={() => setOpen(false)}
        initialData={selectedStudent}
        onSave={async (updatedStudent) => {
          try {
            const studentToSave = {
              full_name: updatedStudent.fullName,
              dni: updatedStudent.dni,
              phone: updatedStudent.phone,
              dob: updatedStudent.dob || null,
              address: updatedStudent.address,
              city: updatedStudent.city,
              has_professor: updatedStudent.hasProfessor,
              schedule: updatedStudent.schedule,
              last_payment: updatedStudent.lastPayment || null,
              expiry_date: updatedStudent.expiryDate || null,
            };

            if (selectedStudent?.id) {
              const { error } = await supabase
                .from("students")
                .update(studentToSave)
                .eq("id", selectedStudent.id);
              if (error) throw error;
            } else {
              const { error } = await supabase
                .from("students")
                .insert(studentToSave);
              if (error) throw error;
            }

            setOpen(false);
            setSelectedStudent(null);
            fetchData();
          } catch (error) {
            console.error("Error saving student:", error);
          }
        }}
      />

      {/* History Dialog */}
      <Dialog
        open={openHistory}
        onClose={() => setOpenHistory(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Historial de Pagos: {historyStudent?.fullName}
        </DialogTitle>
        <DialogContent>
          {historyStudent?.lastPayment && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 3,
                mt: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                borderRadius: 3,
                border: "1px solid",
                borderColor: alpha(theme.palette.primary.main, 0.1),
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: "primary.main", display: "block", mb: 0.5 }}>
                  ÚLTIMO PAGO REGISTRADO EN FICHA
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  ${historyStudent.lastPayment.amount.toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Fecha: {historyStudent.lastPayment.date}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Vencimiento: {historyStudent.expiryDate}
                </Typography>
              </Box>
            </Paper>
          )}

          {paymentHistory.length === 0 ? (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <Typography color="text.secondary">
                No hay registros de pagos previos.
              </Typography>
            </Box>
          ) : (
            <TableContainer sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Fecha Pago</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Vencimiento</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Monto</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Caja / Medio</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paymentHistory.map((h) => {
                    const isDeleted = !!h.deleted_at;
                    const status = getExpiryStatus(h.expiry_date);

                    let paymentMethodStr = "-";
                    if (h.transactions) {
                      const method = h.transactions.payment_method;
                      const branch = h.transactions.branch;
                      if (method === "Efectivo") {
                        paymentMethodStr = `Efectivo (${branch === "noroeste" ? "Caja Noroeste" : "Caja Azucena"})`;
                      } else if (method === "Transferencia") {
                        paymentMethodStr = "Transferencia (Banco Compartido)";
                      } else {
                        paymentMethodStr = method;
                      }
                    }

                    return (
                      <TableRow
                        key={h.id}
                        sx={{
                          bgcolor: isDeleted
                            ? alpha(theme.palette.error.main, 0.05)
                            : "inherit",
                          opacity: isDeleted ? 0.8 : 1,
                        }}
                      >
                        <TableCell
                          sx={{
                            textDecoration: isDeleted ? "line-through" : "none",
                            color: isDeleted ? "text.disabled" : "inherit",
                          }}
                        >
                          {new Date(h.payment_date).toLocaleDateString("es-AR")}
                        </TableCell>
                        <TableCell
                          sx={{
                            textDecoration: isDeleted ? "line-through" : "none",
                            color: isDeleted ? "text.disabled" : "inherit",
                          }}
                        >
                          {new Date(h.expiry_date).toLocaleDateString("es-AR")}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            textDecoration: isDeleted ? "line-through" : "none",
                            color: isDeleted ? "error.light" : "inherit",
                          }}
                        >
                          ${h.amount.toLocaleString()}
                        </TableCell>
                        <TableCell
                          sx={{
                            textDecoration: isDeleted ? "line-through" : "none",
                            color: isDeleted ? "text.disabled" : "inherit",
                            fontSize: "0.8rem"
                          }}
                        >
                          {paymentMethodStr}
                        </TableCell>
                        <TableCell>
                          {isDeleted ? (
                            <Chip
                              label={`ELIMINADO (${new Date(h.deleted_at).toLocaleDateString("es-AR")})`}
                              size="small"
                              color="error"
                              variant="outlined"
                              sx={{
                                fontSize: "0.6rem",
                                fontWeight: 800,
                                height: 20,
                              }}
                            />
                          ) : (
                            <Chip
                              label={status.label}
                              size="small"
                              color={status.color}
                              variant="outlined"
                              sx={{
                                fontSize: "0.6rem",
                                fontWeight: 800,
                                height: 20,
                              }}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            variant="contained"
            onClick={() => setOpenHistory(false)}
            sx={{ fontWeight: 700, px: 4 }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
