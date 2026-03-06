import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
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
  IconButton,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import AddIcon from "@mui/icons-material/Add";
import DescriptionIcon from "@mui/icons-material/Description";
import PersonIcon from "@mui/icons-material/Person";
import TableChartIcon from "@mui/icons-material/TableChart";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

import StudentManager from "./StudentManager";
import { StudentData } from "./StudentRegistrationDialog";
import { supabase } from "../../supabaseClient";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const HOURS = Array.from({ length: 18 }, (_, i) => `${i + 7}:00`);

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
  const [studentsData, setStudentsData] = useState<StudentData[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      let allStudents: any[] = [];
      let pageConfig = 0;
      let hasMoreConfig = true;

      while (hasMoreConfig) {
        const { data: students, error: sError } = await supabase
          .from("students")
          .select("*")
          .is("deleted_at", null)
          .range(pageConfig * 1000, (pageConfig + 1) * 1000 - 1);

        if (sError) throw sError;

        if (students && students.length > 0) {
          allStudents = [...allStudents, ...students];
          if (students.length < 1000) {
            hasMoreConfig = false;
          } else {
            pageConfig++;
          }
        } else {
          hasMoreConfig = false;
        }
      }

      const mappedStudents: StudentData[] = (allStudents || []).map((s: any) => ({
        ...s,
        fullName: s.full_name,
        hasProfessor: s.has_professor,
        lastPayment: s.last_payment,
        expiryDate: s.expiry_date,
      }));
      setStudentsData(mappedStudents);

      const { data: profs, error: pError } = await supabase
        .from("professors")
        .select("*");
      if (pError) throw pError;

      const mappedProfs: Professor[] = (profs || []).map((p: any) => ({
        ...p,
        className: p.class_name,
      }));
      setProfessors(mappedProfs);
    } catch (error) {
      console.error("Error fetching data from Supabase:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Subscribe to changes
    const studentsChannel = supabase
      .channel("students_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "students" },
        fetchData,
      )
      .subscribe();

    const profsChannel = supabase
      .channel("profs_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "professors" },
        fetchData,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(studentsChannel);
      supabase.removeChannel(profsChannel);
    };
  }, []);

  const [openProfDialog, setOpenProfDialog] = useState(false);
  const [profFormData, setProfFormData] = useState<Professor>({
    id: 0,
    name: "",
    specialty: "Adultos",
    className: "",
    schedule: {},
  });

  const [selectedSlot, setSelectedSlot] = useState<{
    day: string;
    hour: string;
    students: any[];
  } | null>(null);

  const theme = useTheme();

  const handleSaveProfessor = async () => {
    if (!profFormData.name) return;

    try {
      const profToSave = {
        name: profFormData.name,
        specialty: profFormData.specialty,
        class_name: profFormData.className,
        schedule: profFormData.schedule,
      };

      if (profFormData.id) {
        const { error } = await supabase
          .from("professors")
          .update(profToSave)
          .eq("id", profFormData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("professors").insert(profToSave);
        if (error) throw error;
      }

      // If it's a Class, register it in Accounts
      if (profFormData.specialty === "Clase" && profFormData.className) {
        const { data: existingAccounts } = await supabase
          .from("accounts")
          .select("id")
          .eq("name", profFormData.className);

        if (!existingAccounts || existingAccounts.length === 0) {
          const { error: accError } = await supabase.from("accounts").insert({
            name: profFormData.className,
            type: "Ingreso",
            balance: 0,
            color: theme.palette.secondary.main,
          });
          if (accError) throw accError;
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
      fetchData();
    } catch (error) {
      console.error("Error saving professor:", error);
    }
  };

  const handleDeleteProfessor = async (id: number) => {
    if (window.confirm("¿Está seguro de que desea eliminar este profesor/clase? Los alumnos dejarán de estar asignados a este si coinciden en el horario.")) {
      try {
        const { error } = await supabase.from("professors").delete().eq("id", id);
        if (error) throw error;
        fetchData();
      } catch (error) {
        console.error("Error deleting professor:", error);
        alert("Ocurrió un error al eliminar el profesor.");
      }
    }
  };

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expiryDate);
    exp.setHours(23, 59, 59, 999);
    return exp < today;
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

  const calculateAge = (dob: string | undefined): number | null => {
    if (!dob || dob === "1900-01-01") return null;
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const poolData: SlotData = {};
  activeStudents.forEach((student: StudentData) => {
    if (!student.schedule) return;
    Object.keys(student.schedule).forEach((slotKey) => {
      if (!student.schedule[slotKey]) return;
      if (!poolData[slotKey]) poolData[slotKey] = [];

      // 1. Calculate age to determine category
      const age = calculateAge(student.dob);
      const isKid = age !== null && age >= 4 && age <= 12;

      // 2. Find eligible professors testing in this slot
      const availableProfs = professors.filter(
        (p) => p.schedule && p.schedule[slotKey],
      );

      // 3. Prioritize by specialty
      let matchingProf = null;
      if (isKid) {
        matchingProf =
          availableProfs.find((p) => p.specialty === "Niños") ||
          availableProfs.find((p) => p.specialty !== "Clase");
      } else {
        matchingProf =
          availableProfs.find((p) => p.specialty === "Adultos") ||
          availableProfs.find((p) => p.specialty !== "Clase");
      }

      // If still not found, try to fallback to any class just in case, though usually shouldn't default to "Clase"
      if (!matchingProf && availableProfs.length > 0) {
        matchingProf = availableProfs[0];
      }

      poolData[slotKey].push({
        id: student.id || 0,
        name: student.fullName.split(" ")[0],
        lastName: student.fullName.split(" ").slice(1).join(" "),
        professor: matchingProf
          ? matchingProf.name
          : student.hasProfessor
            ? "Sin Profesor Asignado"
            : "Pileta Libre",
      });
    });
  });

  const [view, setView] = useState(0); // 0: Summary, 1: Students

  const getSummaryByProfessor = () => {
    const summary: {
      [key: string]: {
        uniqueStudents: Set<number>;
        timeSlots: { [time: string]: any[] };
      };
    } = {};

    // Initialize with known professors
    professors.forEach((p) => {
      summary[p.name] = { uniqueStudents: new Set(), timeSlots: {} };
    });

    Object.entries(poolData).forEach(([slot, slotStudents]) => {
      const time = slot.split("-")[1]; // Extract the hour part, e.g. "7:00"

      slotStudents.forEach((student) => {
        const profName = student.professor;
        if (!summary[profName]) {
          summary[profName] = { uniqueStudents: new Set(), timeSlots: {} };
        }

        if (!summary[profName].timeSlots[time]) {
          summary[profName].timeSlots[time] = [];
        }

        // Add student to the timeSlot only if they aren't already there
        const isAlreadyInTimeSlot = summary[profName].timeSlots[time].some(
          (s: any) => s.id === student.id,
        );
        if (!isAlreadyInTimeSlot) {
          summary[profName].timeSlots[time].push(student);
        }

        summary[profName].uniqueStudents.add(student.id);
      });
    });

    // Alphabetically sort students in each time slot
    Object.values(summary).forEach((profSummary) => {
      Object.values(profSummary.timeSlots).forEach((studentsList) => {
        studentsList.sort((a, b) => {
          const nameA = `${a.lastName} ${a.name}`.toLowerCase();
          const nameB = `${b.lastName} ${b.name}`.toLowerCase();
          return nameA.localeCompare(nameB);
        });
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
          gap: 1,
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, color: "primary.main" }}
          >
            Escuela de Natación
          </Typography>
          <Tabs
            value={view}
            onChange={(_, v) => setView(v)}
            sx={{ minHeight: 32, mt: 0.5 }}
          >
            <Tab
              icon={<DescriptionIcon sx={{ fontSize: 18 }} />}
              label="Resumen Profesores"
              iconPosition="start"
              sx={{ minHeight: 32, fontSize: "0.75rem" }}
            />
            <Tab
              icon={<PersonIcon sx={{ fontSize: 18 }} />}
              label="Gestión de Alumnos"
              iconPosition="start"
              sx={{ minHeight: 32, fontSize: "0.75rem" }}
            />
            <Tab
              icon={<TableChartIcon sx={{ fontSize: 18 }} />}
              label="Ocupación Semanal"
              iconPosition="start"
              sx={{ minHeight: 32, fontSize: "0.75rem" }}
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
            const profData = professorSummary[prof.name] || {
              uniqueStudents: new Set(),
              timeSlots: {},
            };
            const uniqueCount = profData.uniqueStudents.size;
            const slotsData = profData.timeSlots;
            const sortedSlots = Object.keys(slotsData).sort((a, b) => {
              return parseInt(a) - parseInt(b);
            });

            return (
              <Grid key={prof.id} size={{ xs: 12, md: 6, lg: 4 }}>
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
                      <Stack direction="row" spacing={1} alignItems="center">
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
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => {
                            setProfFormData(prof);
                            setOpenProfDialog(true);
                          }}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteProfessor(prof.id)}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    }
                    title={
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {prof.name}
                      </Typography>
                    }
                    subheader={`${uniqueCount} Alumnos`}
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
                    {sortedSlots.length > 0 ? (
                      sortedSlots.map((slot) => {
                        const slotStudents = slotsData[slot];
                        return (
                          <React.Fragment key={slot}>
                            <ListItem
                              sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                py: 0.5,
                              }}
                            >
                              <Typography
                                variant="overline"
                                sx={{ fontWeight: 800, lineHeight: 1.2 }}
                              >
                                {slot} hs
                              </Typography>
                            </ListItem>
                            {slotStudents.map((s: any, idx: number) => (
                              <ListItem
                                key={`${s.id}-${idx}`}
                                divider={idx !== slotStudents.length - 1}
                                dense
                              >
                                <ListItemText
                                  primary={
                                    <Typography
                                      sx={{
                                        fontWeight: 700,
                                        fontSize: "0.85rem",
                                      }}
                                    >
                                      {s.name} {s.lastName}
                                    </Typography>
                                  }
                                />
                              </ListItem>
                            ))}
                          </React.Fragment>
                        );
                      })
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

      {view === 2 && (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <TableContainer sx={{ overflow: "visible" }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      bgcolor: "background.paper",
                      fontWeight: 900,
                      width: 60,
                      fontSize: "0.7rem",
                      zIndex: 3,
                      borderBottom: "1.5px solid",
                      borderRight: "2.5px solid",
                      borderColor: alpha(theme.palette.divider, 0.4),
                      py: 0.5,
                    }}
                  >
                    HORA
                  </TableCell>
                  {DAYS.map((day, idx) => (
                    <TableCell
                      key={day}
                      align="center"
                      sx={{
                        bgcolor: "background.paper",
                        fontWeight: 900,
                        minWidth: 80,
                        fontSize: "0.7rem",
                        zIndex: 2,
                        borderBottom: "1.5px solid",
                        borderRight:
                          idx % 2 === 1 ? "2.5px solid" : "1px solid",
                        borderColor: alpha(theme.palette.divider, 0.4),
                        py: 0.5,
                      }}
                    >
                      {day.toUpperCase()}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {HOURS.map((hour) => (
                  <TableRow key={hour}>
                    <TableCell
                      sx={{
                        fontWeight: 800,
                        fontSize: "0.7rem",
                        bgcolor: alpha(theme.palette.primary.main, 0.02),
                        position: "sticky",
                        left: 0,
                        zIndex: 1,
                        py: 0,
                        height: 32,
                        borderBottom: "1.5px solid",
                        borderRight: "2.5px solid",
                        borderColor: alpha(theme.palette.divider, 0.4),
                      }}
                    >
                      {hour}
                    </TableCell>
                    {DAYS.map((day, idx) => {
                      const slotKey = `${day}-${hour}`;
                      const students = poolData[slotKey] || [];
                      const count = students.length;

                      // Heatmap color intensity
                      const getBgColor = (c: number) => {
                        if (c === 0) return "transparent";
                        if (c <= 2) return alpha(theme.palette.info.light, 0.2);
                        if (c <= 5) return alpha(theme.palette.info.main, 0.4);
                        return alpha(theme.palette.info.dark, 0.6);
                      };

                      return (
                        <TableCell
                          key={day}
                          align="center"
                          onClick={() =>
                            count > 0 &&
                            setSelectedSlot({ day, hour, students })
                          }
                          sx={{
                            bgcolor: getBgColor(count),
                            cursor: count > 0 ? "pointer" : "default",
                            transition: "all 0.2s",
                            "&:hover": {
                              bgcolor:
                                count > 0
                                  ? alpha(theme.palette.primary.main, 0.1)
                                  : "transparent",
                            },
                            borderBottom: "1.5px solid",
                            borderRight:
                              idx % 2 === 1 ? "2.5px solid" : "1px solid",
                            borderColor: alpha(theme.palette.divider, 0.4),
                            height: 32,
                            py: 0,
                          }}
                        >
                          {count > 0 && (
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 900,
                                  color: "text.primary",
                                  lineHeight: 1,
                                }}
                              >
                                {count}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 800,
                                  color: "text.secondary",
                                  fontSize: "0.5rem",
                                  display: "block",
                                  lineHeight: 1,
                                }}
                              >
                                ALUMNOS
                              </Typography>
                            </Box>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
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

      <Dialog
        open={!!selectedSlot}
        onClose={() => setSelectedSlot(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          Alumnos en Horario:
          <Typography
            variant="subtitle1"
            color="primary"
            sx={{ fontWeight: 800 }}
          >
            {selectedSlot?.day} - {selectedSlot?.hour}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <List sx={{ pt: 0 }}>
            {selectedSlot?.students.map((s, idx) => (
              <ListItem key={`${s.id}-${idx}`} sx={{ px: 0 }}>
                <Avatar
                  sx={{
                    mr: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: "primary.main",
                    width: 32,
                    height: 32,
                    fontSize: "0.9rem",
                    fontWeight: 700,
                  }}
                >
                  {s.name[0]}
                </Avatar>
                <ListItemText
                  primary={
                    <Typography sx={{ fontWeight: 700 }}>
                      {s.name} {s.lastName}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {s.professor}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSelectedSlot(null)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
