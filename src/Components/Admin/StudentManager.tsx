import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
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
import StudentRegistrationDialog, {
  StudentData,
} from "./StudentRegistrationDialog";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const HOURS = Array.from({ length: 14 }, (_, i) => `${i + 8}:00`);

interface Student {
  id: number;
  fullName: string;
  dni: string;
  phone: string;
  address: string;
  city: string;
  dob: string;
  hasProfessor: boolean;
  schedule: { [key: string]: boolean };
  lastPayment: { date: string; amount: number };
}

const mockStudents: StudentData[] = [
  {
    id: 1,
    fullName: "Juan Pérez (VENCIDO)",
    dni: "35.123.456",
    phone: "381-1234567",
    address: "Av. Aconquija 1234",
    city: "Yerba Buena",
    dob: "1990-05-15",
    hasProfessor: true,
    schedule: { "Lunes-09:00": true, "Miércoles-09:00": true },
    lastPayment: { date: "2026-01-20", amount: 70000 },
    expiryDate: "2026-02-20",
  },
  {
    id: 2,
    fullName: "María García (A VENCER)",
    dni: "40.987.654",
    phone: "381-7654321",
    address: "San Martín 500",
    city: "San Miguel",
    dob: "1995-12-10",
    hasProfessor: false,
    schedule: { "Martes-18:00": true, "Jueves-18:00": true },
    lastPayment: { date: "2026-02-11", amount: 63000 },
    expiryDate: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // En 3 días
  },
  {
    id: 3,
    fullName: "Carlos López (EN REGLA)",
    dni: "28.333.444",
    phone: "381-8889999",
    address: "Belgrano 1200",
    city: "Tafí Viejo",
    dob: "1985-03-22",
    hasProfessor: true,
    schedule: {
      "Lunes-11:00": true,
      "Martes-11:00": true,
      "Miércoles-11:00": true,
    },
    lastPayment: { date: "2026-02-25", amount: 80000 },
    expiryDate: "2026-03-27",
  },
];

export default function StudentManager() {
  const [students, setStudents] = useState<StudentData[]>(() => {
    const saved = localStorage.getItem("seccional_students");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.length > 0) return parsed;
    }
    return mockStudents;
  });
  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterExpiring, setFilterExpiring] = useState(false);

  useEffect(() => {
    localStorage.setItem("seccional_students", JSON.stringify(students));
    window.dispatchEvent(new Event("students_updated"));
  }, [students]);

  const theme = useTheme();

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return true;
    return new Date(expiryDate) < new Date();
  };

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
                            color: isExpired(s.expiryDate)
                              ? "error.main"
                              : Math.ceil(
                                    (new Date(s.expiryDate).getTime() -
                                      new Date().getTime() +
                                      1000) /
                                      (1000 * 60 * 60 * 24),
                                  ) <= 7
                                ? "warning.main"
                                : "success.main",
                          }}
                        >
                          {new Date(s.expiryDate).toLocaleDateString("es-AR")}
                        </Typography>
                        <Typography
                          variant="caption"
                          color={
                            Math.ceil(
                              (new Date(s.expiryDate!).getTime() -
                                new Date().getTime() +
                                1000) /
                                (1000 * 60 * 60 * 24),
                            ) <= 7 && !isExpired(s.expiryDate)
                              ? "warning.main"
                              : "text.secondary"
                          }
                          sx={{
                            fontWeight:
                              Math.ceil(
                                (new Date(s.expiryDate!).getTime() -
                                  new Date().getTime() +
                                  1000) /
                                  (1000 * 60 * 60 * 24),
                              ) <= 7
                                ? 700
                                : 400,
                          }}
                        >
                          {isExpired(s.expiryDate)
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
                                isExpired(s.expiryDate) ? "VENCIDO" : "ACTIVO"
                              }
                              size="small"
                              color={
                                isExpired(s.expiryDate) ? "error" : "success"
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
                      color="primary"
                      onClick={() => {
                        setSelectedStudent(s);
                        setOpen(true);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error">
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
        onSave={(updatedStudent) => {
          if (selectedStudent) {
            setStudents(
              students.map((s) =>
                s.dni === selectedStudent.dni ? { ...s, ...updatedStudent } : s,
              ),
            );
          } else {
            setStudents([...students, { ...updatedStudent, id: Date.now() }]);
          }
          setOpen(false);
          setSelectedStudent(null);
        }}
      />
    </Box>
  );
}
