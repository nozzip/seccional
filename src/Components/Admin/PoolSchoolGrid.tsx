import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  alpha,
  useTheme,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Tabs,
  Tab,
  Card,
  CardHeader,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DescriptionIcon from "@mui/icons-material/Description";
import PersonIcon from "@mui/icons-material/Person";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import StudentManager from "./StudentManager";
import { StudentData } from "./StudentRegistrationDialog";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const HOURS = Array.from({ length: 14 }, (_, i) => `${i + 8}:00`);

interface Professor {
  id: number;
  name: string;
  specialty: "Adultos" | "Niños" | "Clase";
  className?: string;
  schedule: { [key: string]: boolean };
}

interface SlotData {
  [key: string]: any[];
}
export default function PoolSchoolGrid() {
  const [studentsData, setStudentsData] = useState<StudentData[]>(() => {
    const saved = localStorage.getItem("seccional_students");
    const mockStudents = [
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
          .split("T")[0],
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
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.length > 0) return parsed;
    }
    return mockStudents;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("seccional_students");
      if (saved) setStudentsData(JSON.parse(saved));
    };
    window.addEventListener("storage", handleStorageChange);
    // Personalize event for local updates
    window.addEventListener("students_updated", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("students_updated", handleStorageChange);
    };
  }, []);

  const [professors, setProfessors] = useState<Professor[]>(() => {
    const saved = localStorage.getItem("seccional_professors");
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((p: any) => ({ ...p, schedule: p.schedule || {} }));
    }
    return [
      { id: 1, name: "Profesor Asignado", specialty: "Adultos", schedule: {} },
      { id: 2, name: "Pileta Libre", specialty: "Adultos", schedule: {} },
    ];
  });

  const [openProfDialog, setOpenProfDialog] = useState(false);
  const [profFormData, setProfFormData] = useState<Professor>({
    id: 0,
    name: "",
    specialty: "Adultos",
    className: "",
    schedule: {},
  });

  useEffect(() => {
    localStorage.setItem("seccional_professors", JSON.stringify(professors));
  }, [professors]);

  const theme = useTheme();

  const handleSaveProfessor = () => {
    if (!profFormData.name) return;

    const newProf = {
      ...profFormData,
      id: profFormData.id || Date.now(),
    };

    setProfessors((prev) => {
      const exists = prev.find((p) => p.id === newProf.id);
      if (exists) return prev.map((p) => (p.id === newProf.id ? newProf : p));
      return [...prev, newProf];
    });

    // If it's a Class, register it in Accounts
    if (newProf.specialty === "Clase" && newProf.className) {
      const savedAccounts = JSON.parse(
        localStorage.getItem("seccional_accounts") || "[]",
      );
      if (!savedAccounts.some((a: any) => a.name === newProf.className)) {
        const newAccount = {
          id: Date.now(),
          name: newProf.className,
          type: "Ingreso",
          balance: 0,
          color: theme.palette.secondary.main,
        };
        localStorage.setItem(
          "seccional_accounts",
          JSON.stringify([...savedAccounts, newAccount]),
        );
        window.dispatchEvent(new Event("seccional_accounts_updated"));
      }
    }

    setOpenProfDialog(false);
    setProfFormData({
      id: 0,
      name: "",
      specialty: "Adultos",
      className: "",
      schedule: {},
    });
  };

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return true;
    return new Date(expiryDate) < new Date();
  };

  const activeStudents = studentsData.filter(
    (s: StudentData) => !isExpired(s.expiryDate),
  );

  const formatSchedule = (schedule: { [key: string]: boolean }) => {
    const activeSlots = Object.keys(schedule).filter((k) => schedule[k]);
    if (activeSlots.length === 0) return "Sin horarios asignados";

    // 1. Group hours by day
    const daysMap: { [key: string]: string } = {};
    DAYS.forEach((day) => {
      const daySlots = activeSlots
        .filter((s) => s.startsWith(day))
        .map((s) => s.split("-")[1])
        .sort((a, b) => parseInt(a) - parseInt(b));

      if (daySlots.length > 0) {
        const start = daySlots[0];
        const end = daySlots[daySlots.length - 1];
        const formattedEnd = `${parseInt(end.split(":")[0]) + 1}:00`;
        daysMap[day] = `${start} a ${formattedEnd}`;
      }
    });

    // 2. Group days by identical time range
    const rangeToDays: { [key: string]: string[] } = {};
    Object.entries(daysMap).forEach(([day, range]) => {
      if (!rangeToDays[range]) rangeToDays[range] = [];
      rangeToDays[range].push(day);
    });

    // 3. Format each group
    return Object.entries(rangeToDays)
      .map(([range, days]) => {
        // Detect if days are consecutive in DAYS array
        const dayIndices = days
          .map((d) => DAYS.indexOf(d))
          .sort((a, b) => a - b);
        const isConsecutive =
          dayIndices.length > 1 &&
          dayIndices.every(
            (val, i) => i === 0 || val === dayIndices[i - 1] + 1,
          );

        let dayText = "";
        if (isConsecutive) {
          dayText = `De ${days[0]} a ${days[days.length - 1]}`;
        } else if (days.length === 1) {
          dayText = days[0];
        } else {
          const lastDay = days.pop();
          dayText = `${days.join(", ")} y ${lastDay}`;
        }

        return `${dayText} de ${range}`;
      })
      .join(" | ");
  };

  const poolData: SlotData = {};
  activeStudents.forEach((student: StudentData) => {
    Object.keys(student.schedule).forEach((slotKey) => {
      if (!poolData[slotKey]) poolData[slotKey] = [];
      poolData[slotKey].push({
        id: student.id || 0,
        name: student.fullName.split(" ")[0],
        lastName: student.fullName.split(" ").slice(1).join(" "),
        professor: student.hasProfessor ? "Profesor Asignado" : "Pileta Libre",
      });
    });
  });

  const [view, setView] = useState(0); // 0: Summary, 1: Students

  const getSummaryByProfessor = () => {
    const summary: { [key: string]: any[] } = {};
    // Initialize summary with all professors to show empty cards if needed
    professors.forEach((p) => {
      summary[p.name] = [];
    });

    Object.values(poolData).forEach((students) => {
      students.forEach((student) => {
        if (!summary[student.professor]) summary[student.professor] = [];
        summary[student.professor].push(student);
      });
    });
    return summary;
  };

  const professorSummary = getSummaryByProfessor();

  return (
    <Box>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { sm: "center" },
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, color: "primary.main" }}
          >
            Escuela de Natación
          </Typography>
          <Tabs
            value={view}
            onChange={(_, v) => setView(v)}
            sx={{ minHeight: 40, mt: 1 }}
          >
            <Tab
              icon={<DescriptionIcon sx={{ fontSize: 20 }} />}
              label="Resumen Profesores"
              iconPosition="start"
              sx={{ minHeight: 40 }}
            />
            <Tab
              icon={<PersonIcon sx={{ fontSize: 20 }} />}
              label="Gestión de Alumnos"
              iconPosition="start"
              sx={{ minHeight: 40 }}
            />
          </Tabs>
        </Box>
        {view === 0 && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ alignSelf: "flex-end" }}
            onClick={() => setOpenProfDialog(true)}
          >
            Agregar Profesor / Clase
          </Button>
        )}
      </Box>

      {view === 0 && (
        <Grid container spacing={3}>
          {professors.map((prof) => {
            const students = professorSummary[prof.name] || [];
            return (
              <Grid item xs={12} md={6} lg={4} key={prof.id}>
                <Card
                  sx={{
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  elevation={0}
                >
                  <CardHeader
                    avatar={
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        <PersonIcon />
                      </Avatar>
                    }
                    action={
                      <Chip
                        label={
                          prof.specialty === "Clase"
                            ? prof.className
                            : prof.specialty
                        }
                        size="small"
                        color={
                          prof.specialty === "Clase" ? "secondary" : "default"
                        }
                        variant="outlined"
                        sx={{ fontWeight: 800 }}
                      />
                    }
                    title={
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {prof.name}
                      </Typography>
                    }
                    subheader={`${students.length} Alumnos`}
                    sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}
                  />
                  <Divider />
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: alpha(theme.palette.secondary.main, 0.05),
                    }}
                  >
                    <Typography
                      variant="overline"
                      sx={{ fontWeight: 800, color: "secondary.main" }}
                    >
                      Horarios de Enseñanza
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: "text.primary",
                        mt: 0.5,
                        fontSize: "0.8rem",
                      }}
                    >
                      {formatSchedule(prof.schedule || {})}
                    </Typography>
                  </Box>
                  <Divider />
                  <List sx={{ p: 0, flexGrow: 1 }}>
                    {students.length > 0 ? (
                      students.map((s, idx) => (
                        <ListItem
                          key={`${s.id}-${idx}`}
                          divider={idx !== students.length - 1}
                        >
                          <ListItemText
                            primary={
                              <Typography sx={{ fontWeight: 700 }}>
                                {s.name} {s.lastName}
                              </Typography>
                            }
                            secondary={s.professor}
                          />
                        </ListItem>
                      ))
                    ) : (
                      <Box sx={{ p: 3, textAlign: "center", opacity: 0.5 }}>
                        <Typography variant="body2">
                          Sin alumnos asignados
                        </Typography>
                      </Box>
                    )}
                  </List>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {view === 1 && <StudentManager />}

      <Dialog
        open={openProfDialog}
        onClose={() => setOpenProfDialog(false)}
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <CardHeader title="Configurar Profesor o Clase" sx={{ pb: 0 }} />
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2, minWidth: 300 }}>
            <TextField
              label="Nombre del Profesor"
              fullWidth
              value={profFormData.name}
              onChange={(e) =>
                setProfFormData({ ...profFormData, name: e.target.value })
              }
            />
            <TextField
              select
              label="Especialidad"
              fullWidth
              value={profFormData.specialty}
              onChange={(e: any) =>
                setProfFormData({ ...profFormData, specialty: e.target.value })
              }
              SelectProps={{ native: true }}
            >
              <option value="Adultos">Adultos</option>
              <option value="Niños">Niños</option>
              <option value="Clase">Clase Específica</option>
            </TextField>

            {profFormData.specialty === "Clase" && (
              <TextField
                label="Nombre de la Clase (Se creará como Cuenta)"
                fullWidth
                placeholder="Ej: AquaGym, Waterpolo..."
                value={profFormData.className}
                onChange={(e) =>
                  setProfFormData({
                    ...profFormData,
                    className: e.target.value,
                  })
                }
                helperText="Esto aparecerá automáticamente en el Flujo de Caja."
              />
            )}

            <Typography variant="subtitle2" sx={{ fontWeight: 800, mt: 2 }}>
              Días y Horarios de Enseñanza
            </Typography>

            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{ borderRadius: 3, maxHeight: 300, overflow: "auto" }}
            >
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{ bgcolor: "background.paper", fontWeight: 800 }}
                    >
                      Hs
                    </TableCell>
                    {DAYS.map((day) => (
                      <TableCell
                        key={day}
                        align="center"
                        sx={{ bgcolor: "background.paper", fontWeight: 800 }}
                      >
                        {day.substring(0, 3)}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {HOURS.map((hour) => (
                    <TableRow key={hour}>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem" }}>
                        {hour}
                      </TableCell>
                      {DAYS.map((day) => {
                        const slotKey = `${day}-${hour}`;
                        const isSelected = !!profFormData.schedule?.[slotKey];
                        return (
                          <TableCell key={day} align="center" sx={{ p: 0 }}>
                            <Checkbox
                              size="small"
                              checked={isSelected}
                              onChange={(e) => {
                                const newSchedule = {
                                  ...(profFormData.schedule || {}),
                                };
                                if (e.target.checked)
                                  newSchedule[slotKey] = true;
                                else delete newSchedule[slotKey];
                                setProfFormData({
                                  ...profFormData,
                                  schedule: newSchedule,
                                });
                              }}
                            />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenProfDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveProfessor}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
