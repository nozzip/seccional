import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  alpha,
  useTheme,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Tabs,
  Tab,
  Card,
  CardHeader,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DescriptionIcon from "@mui/icons-material/Description";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import PersonIcon from "@mui/icons-material/Person";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const HOURS = Array.from({ length: 14 }, (_, i) => `${i + 8}:00`);

interface Student {
  id: number;
  name: string;
  lastName: string;
  professor: string;
}

interface SlotData {
  [key: string]: Student[];
}

const mockPoolData: SlotData = {
  "Lunes-09:00": [
    { id: 1, name: "Lucas", lastName: "Rossi", professor: "Prof. García" },
    { id: 2, name: "Ana", lastName: "Sosa", professor: "Prof. García" },
    { id: 3, name: "Mateo", lastName: "Paz", professor: "Prof. Ruiz" },
  ],
  "Martes-10:00": [
    { id: 4, name: "Elena", lastName: "Vigil", professor: "Prof. Ruiz" },
    { id: 5, name: "Pedro", lastName: "Gómez", professor: "Prof. Ruiz" },
  ],
  "Miércoles-15:00": [
    { id: 6, name: "Sofía", lastName: "López", professor: "Prof. García" },
  ],
};

import StudentManager from "./StudentManager";

export default function PoolSchoolGrid() {
  const theme = useTheme();
  const [view, setView] = useState(0); // 0: Grid, 1: Summary, 2: Students
  const [selectedSlot, setSelectedSlot] = useState<{
    day: string;
    hour: string;
  } | null>(null);

  const studentsInSelectedSlot = selectedSlot
    ? mockPoolData[`${selectedSlot.day}-${selectedSlot.hour}`] || []
    : [];

  // Data for summary by professor
  const getSummaryByProfessor = () => {
    const summary: { [key: string]: Student[] } = {};
    Object.values(mockPoolData).forEach((students) => {
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
              icon={<ViewModuleIcon sx={{ fontSize: 20 }} />}
              label="Grilla Horaria"
              iconPosition="start"
              sx={{ minHeight: 40 }}
            />
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
        {view !== 2 && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ alignSelf: "flex-end" }}
          >
            Inscribir Alumno
          </Button>
        )}
      </Box>

      {view === 0 && (
        <Box sx={{ overflowX: "auto" }}>
          <Box sx={{ minWidth: 1000 }}>
            {/* Grid Header */}
            <Grid container spacing={1} sx={{ mb: 1 }}>
              <Grid item xs={1}>
                <Box sx={{ height: 40 }} />
              </Grid>
              {DAYS.map((day) => (
                <Grid item xs={1.8} key={day}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1,
                      textAlign: "center",
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      borderRadius: 2,
                    }}
                  >
                    <Typography sx={{ fontWeight: 800 }}>{day}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {/* Grid Body */}
            {HOURS.map((hour) => (
              <Grid container spacing={1} key={hour} sx={{ mb: 1 }}>
                <Grid item xs={1}>
                  <Box
                    sx={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, color: "text.secondary" }}
                    >
                      {hour}
                    </Typography>
                  </Box>
                </Grid>
                {DAYS.map((day) => {
                  const students = mockPoolData[`${day}-${hour}`] || [];
                  return (
                    <Grid item xs={1.8} key={day}>
                      <Paper
                        elevation={0}
                        onClick={() => setSelectedSlot({ day, hour })}
                        sx={{
                          p: 1.5,
                          minHeight: 70,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "1px solid",
                          borderColor:
                            students.length > 0 ? "secondary.main" : "divider",
                          borderRadius: 2,
                          bgcolor:
                            students.length > 0
                              ? alpha(theme.palette.secondary.main, 0.05)
                              : "transparent",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          "&:hover": {
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            borderColor: "primary.main",
                            transform: "scale(1.02)",
                          },
                        }}
                      >
                        {students.length > 0 ? (
                          <Box sx={{ textAlign: "center" }}>
                            <Typography
                              variant="h6"
                              sx={{
                                color: "secondary.dark",
                                fontWeight: 800,
                                lineHeight: 1,
                              }}
                            >
                              {students.length}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 700, opacity: 0.7 }}
                            >
                              ALUMNOS
                            </Typography>
                          </Box>
                        ) : (
                          <AddIcon sx={{ opacity: 0.1 }} fontSize="small" />
                        )}
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            ))}
          </Box>
        </Box>
      )}

      {view === 1 && (
        <Grid container spacing={3}>
          {Object.entries(professorSummary).map(([prof, students]) => (
            <Grid item xs={12} md={6} lg={4} key={prof}>
              <Card
                sx={{
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                }}
                elevation={0}
              >
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      <PersonIcon />
                    </Avatar>
                  }
                  title={
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      {prof}
                    </Typography>
                  }
                  subheader={`${students.length} Alumnos a cargo`}
                  sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}
                />
                <Divider />
                <List sx={{ p: 0 }}>
                  {students.map((s, idx) => (
                    <ListItem key={s.id} divider={idx !== students.length - 1}>
                      <ListItemText
                        primary={
                          <Typography sx={{ fontWeight: 700 }}>
                            {s.name} {s.lastName}
                          </Typography>
                        }
                        secondary="Natación Nivel 1"
                      />
                    </ListItem>
                  ))}
                </List>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {view === 2 && <StudentManager />}

      {/* Details Dialog */}
      <Dialog
        open={!!selectedSlot}
        onClose={() => setSelectedSlot(null)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {selectedSlot?.day} - {selectedSlot?.hour}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Alumnos registrados en este turno
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {studentsInSelectedSlot.length > 0 ? (
            <List sx={{ pt: 0 }}>
              {studentsInSelectedSlot.map((s) => (
                <ListItem key={s.id} sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "secondary.main" }}>
                      {s.name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${s.name} ${s.lastName}`}
                    secondary={
                      <Box
                        component="span"
                        sx={{ color: "primary.main", fontWeight: 700 }}
                      >
                        {s.professor}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography sx={{ py: 2, textAlign: "center", opacity: 0.5 }}>
              No hay alumnos registrados.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setSelectedSlot(null)}
            fullWidth
            variant="outlined"
          >
            Cerrar
          </Button>
          <Button
            color="primary"
            variant="contained"
            fullWidth
            startIcon={<AddIcon />}
          >
            Inscribir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
