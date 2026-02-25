import React, { useState, useEffect } from "react";
import {
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Stack,
  Box,
} from "@mui/material";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const HOURS = Array.from({ length: 14 }, (_, i) => `${i + 8}:00`);

export interface StudentData {
  id?: number;
  fullName: string;
  dni: string;
  phone: string;
  dob?: string;
  address?: string;
  city?: string;
  hasProfessor?: boolean;
  schedule: { [key: string]: boolean };
  lastPayment?: { date: string; amount: number };
  expiryDate?: string;
}

interface StudentRegistrationDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (student: StudentData) => void;
  initialData?: StudentData | null;
}

export default function StudentRegistrationDialog({
  open,
  onClose,
  onSave,
  initialData,
}: StudentRegistrationDialogProps) {
  const [formData, setFormData] = useState<StudentData>({
    fullName: "",
    dni: "",
    phone: "",
    dob: "",
    address: "",
    city: "",
    hasProfessor: true,
    schedule: {},
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({ ...formData, ...initialData });
      } else {
        setFormData({
          fullName: "",
          dni: "",
          phone: "",
          dob: "",
          address: "",
          city: "",
          hasProfessor: true,
          schedule: {},
        });
      }
    }
  }, [open, initialData]);

  const handleChange = (field: keyof StudentData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { borderRadius: 4 } }}
    >
      <DialogTitle sx={{ fontWeight: 800, px: 4, pt: 4 }}>
        {initialData ? "Editar Alumno" : "Registrar Nuevo Alumno"}
      </DialogTitle>
      <DialogContent sx={{ px: 4, pb: 4 }}>
        <Grid container spacing={4}>
          {/* Personal Data */}
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              <Typography
                variant="subtitle2"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "primary.main",
                  fontWeight: 700,
                }}
              >
                <ContactPhoneIcon fontSize="small" /> DATOS PERSONALES
              </Typography>
              <TextField
                label="Nombre y Apellido completo"
                variant="outlined"
                fullWidth
                value={formData.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="DNI"
                    fullWidth
                    value={formData.dni}
                    onChange={(e) => handleChange("dni", e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Fecha de Nacimiento"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={formData.dob}
                    onChange={(e) => handleChange("dob", e.target.value)}
                  />
                </Grid>
              </Grid>
              <TextField
                label="Número de Teléfono"
                fullWidth
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
              <TextField
                label="Domicilio"
                fullWidth
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
              <TextField
                label="Localidad"
                fullWidth
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
              />
            </Stack>
          </Grid>

          {/* Schedule & Prof */}
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              <Typography
                variant="subtitle2"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "primary.main",
                  fontWeight: 700,
                }}
              >
                <CalendarMonthIcon fontSize="small" /> HORARIOS Y PROFESOR
              </Typography>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.hasProfessor}
                    onChange={(e) =>
                      handleChange("hasProfessor", e.target.checked)
                    }
                  />
                }
                label="Asignar Profesor"
                sx={{ "& .MuiTypography-root": { fontWeight: 700 } }}
              />

              <Box>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, mb: 1, display: "block" }}
                >
                  DÍAS Y HORAS
                </Typography>
                <TableContainer
                  component={Paper}
                  elevation={0}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    maxHeight: 400,
                    overflowY: "auto",
                  }}
                >
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            bgcolor: "background.paper",
                            zIndex: 3,
                            left: 0,
                            position: "sticky",
                          }}
                        >
                          Hora
                        </TableCell>
                        {DAYS.map((day) => (
                          <TableCell
                            key={day}
                            align="center"
                            sx={{ bgcolor: "background.paper" }}
                          >
                            {day.substring(0, 3)}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {HOURS.map((hour) => (
                        <TableRow key={hour}>
                          <TableCell
                            sx={{
                              fontWeight: 600,
                              bgcolor: "background.paper",
                              zIndex: 1,
                              left: 0,
                              position: "sticky",
                            }}
                          >
                            {hour}
                          </TableCell>
                          {DAYS.map((day) => {
                            const slotKey = `${day}-${hour}`;
                            return (
                              <TableCell key={day} align="center">
                                <Checkbox
                                  size="small"
                                  sx={{ p: 0 }}
                                  checked={formData.schedule[slotKey] || false}
                                  onChange={(e) => {
                                    const newSchedule = {
                                      ...formData.schedule,
                                    };
                                    if (e.target.checked)
                                      newSchedule[slotKey] = true;
                                    else delete newSchedule[slotKey];
                                    handleChange("schedule", newSchedule);
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
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 4, pt: 0 }}>
        <Button onClick={onClose} sx={{ fontWeight: 700 }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          sx={{ px: 4, py: 1, borderRadius: 2, fontWeight: 700 }}
          onClick={() => onSave(formData)}
        >
          Guardar Alumno
        </Button>
      </DialogActions>
    </Dialog>
  );
}
