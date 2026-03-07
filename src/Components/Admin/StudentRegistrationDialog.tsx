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
  FormControlLabel,
  Checkbox,
  Stack,
  Box,
  alpha,
  useTheme,
  Chip,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { supabase } from "../../supabaseClient";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const HOURS = Array.from({ length: 18 }, (_, i) => `${i + 7}:00`);

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
  balance?: number;
  assignedClass?: string | null;
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
  const theme = useTheme();
  const [formData, setFormData] = useState<StudentData>({
    fullName: "",
    dni: "",
    phone: "",
    dob: "",
    address: "",
    city: "",
    hasProfessor: true,
    schedule: {},
    assignedClass: null,
  });

  const [classesList, setClassesList] = useState<{ id: number; name: string; class_name?: string }[]>([]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data, error } = await supabase
          .from("professors")
          .select("id, name, class_name")
          .in("specialty", ["Clase", "Particular"]);
        if (error) throw error;

        // Filter out duplicate class names
        const uniqueClasses: typeof data = [];
        const seenNames = new Set<string>();
        for (const cls of data || []) {
          const nameToUse = cls.class_name || cls.name;
          if (!seenNames.has(nameToUse)) {
            seenNames.add(nameToUse);
            uniqueClasses.push(cls);
          }
        }

        setClassesList(uniqueClasses);
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    };
    if (open) fetchClasses();
  }, [open]);

  useEffect(() => {
    if (open) {
      setFormData({
        fullName: initialData?.fullName || "",
        dni: initialData?.dni || "",
        phone: initialData?.phone || "",
        dob: initialData?.dob || "",
        address: initialData?.address || "",
        city: initialData?.city || "",
        hasProfessor: initialData?.hasProfessor ?? true,
        schedule: (typeof initialData?.schedule === 'string'
          ? JSON.parse(initialData.schedule)
          : initialData?.schedule) || {},
        lastPayment: initialData?.lastPayment,
        expiryDate: initialData?.expiryDate,
        assignedClass: initialData?.assignedClass || null,
      });
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
          <Grid size={{ xs: 12, md: 6 }}>
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
                <Grid size={{ xs: 6 }}>
                  <TextField
                    label="DNI"
                    fullWidth
                    value={formData.dni}
                    onChange={(e) => handleChange("dni", e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
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

              {formData.lastPayment && (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.success.main, 0.02),
                    borderColor: alpha(theme.palette.success.main, 0.2),
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 800, color: "success.main", display: "block", mb: 1 }}
                  >
                    ESTADO DE PAGO ACTUAL
                  </Typography>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                        ${formData.lastPayment.amount.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Pagado el: {formData.lastPayment.date}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        Vence: {formData.expiryDate}
                      </Typography>
                      <Chip
                        label={new Date(formData.expiryDate || "") > new Date() ? "ACTIVO" : "VENCIDO"}
                        size="small"
                        color={new Date(formData.expiryDate || "") > new Date() ? "success" : "error"}
                        sx={{ height: 20, fontSize: "0.6rem", fontWeight: 800, mt: 0.5 }}
                      />
                    </Box>
                  </Stack>
                </Paper>
              )}
            </Stack>
          </Grid>

          {/* Schedule & Prof */}
          <Grid size={{ xs: 12, md: 6 }}>
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
                <CalendarMonthIcon fontSize="small" /> HORARIOS Y DÍAS
              </Typography>

              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{ borderRadius: 3, maxHeight: 400, overflow: "auto" }}
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
                          sx={{
                            bgcolor: "background.paper",
                            fontWeight: 800,
                            minWidth: 80,
                          }}
                        >
                          {day.substring(0, 3)}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {HOURS.map((hour) => {
                      const hr = parseInt(hour.split(":")[0]);
                      const label = hr === 7 ? "7:00 a 8:00" : `${hr}:01 a ${hr + 1}:00`;
                      return (
                        <TableRow key={hour}>
                          <TableCell
                            sx={{ fontWeight: 700, fontSize: "0.75rem", whiteSpace: "nowrap" }}
                          >
                            {label}
                          </TableCell>
                          {DAYS.map((day) => {
                            const slotKey = `${day}-${hour}`;
                            const isSelected = !!formData.schedule[slotKey];
                            return (
                              <TableCell key={day} align="center" sx={{ p: 0 }}>
                                <Checkbox
                                  size="small"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    const newSchedule = { ...formData.schedule };
                                    if (e.target.checked)
                                      newSchedule[slotKey] = true;
                                    else delete newSchedule[slotKey];
                                    handleChange("schedule", newSchedule);
                                  }}
                                  sx={{
                                    color: alpha(theme.palette.primary.main, 0.2),
                                    "&.Mui-checked": { color: "primary.main" },
                                  }}
                                />
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

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

              <TextField
                select
                label="Asignar a Clase Específica (Opcional)"
                fullWidth
                value={formData.assignedClass || ""}
                onChange={(e) =>
                  handleChange("assignedClass", e.target.value || null)
                }
                SelectProps={{ native: true }}
                InputLabelProps={{ shrink: true }}
                helperText="Si selecciona una clase, se priorizará este profesor en sus horarios."
              >
                <option value="">Ninguna clase específica</option>
                {classesList.map((cls) => (
                  <option key={cls.id} value={cls.class_name || cls.name}>
                    {cls.class_name || cls.name}
                  </option>
                ))}
              </TextField>
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
