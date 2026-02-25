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
import PersonIcon from "@mui/icons-material/Person";

import StudentManager from "./StudentManager";
import { StudentData } from "./StudentRegistrationDialog";

interface Student {
  id: number;
  name: string;
  lastName: string;
  professor: string;
}

interface SlotData {
  [key: string]: Student[];
}

export default function PoolSchoolGrid() {
  const [studentsData] = useState<StudentData[]>(() => {
    const saved = localStorage.getItem("seccional_students");
    return saved ? JSON.parse(saved) : [];
  });

  const theme = useTheme();

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return true;
    return new Date(expiryDate) < new Date();
  };

  const activeStudents = studentsData.filter((s) => !isExpired(s.expiryDate));

  const poolData: SlotData = {};
  activeStudents.forEach((student) => {
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
  // Slots and selection logic removed


  // Data for summary by professor
  const getSummaryByProfessor = () => {
    const summary: { [key: string]: Student[] } = {};
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

      {view === 1 && <StudentManager />}

    </Box>
  );
}
