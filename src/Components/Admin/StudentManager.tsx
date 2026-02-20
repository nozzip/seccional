import React, { useState } from 'react';
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
    InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PaidIcon from '@mui/icons-material/Paid';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
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

const mockStudents: Student[] = [
    {
        id: 1,
        fullName: 'Juan Pérez',
        dni: '35.123.456',
        phone: '381-1234567',
        address: 'Av. Aconquija 1234',
        city: 'Yerba Buena',
        dob: '1990-05-15',
        hasProfessor: true,
        schedule: { 'Lunes-09:00': true, 'Miércoles-09:00': true, 'Viernes-09:00': true },
        lastPayment: { date: '2026-02-05', amount: 4500 }
    }
];

export default function StudentManager() {
    const [students] = useState<Student[]>(mockStudents);
    const [open, setOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const theme = useTheme();

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                <TextField
                    placeholder="Buscar por nombre, DNI..."
                    size="small"
                    sx={{ width: 400 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                />
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setSelectedStudent(null); setOpen(true); }}>
                    Nuevo Alumno
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                <Table>
                    <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Alumno</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>DNI</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Contacto</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Estado Pago</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {students.map((s) => (
                            <TableRow key={s.id} hover>
                                <TableCell>
                                    <Typography sx={{ fontWeight: 700 }}>{s.fullName}</Typography>
                                    <Typography variant="caption" color="text.secondary">{s.hasProfessor ? 'Con Profesor' : 'Pileta Libre'}</Typography>
                                </TableCell>
                                <TableCell>{s.dni}</TableCell>
                                <TableCell>{s.phone}</TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PaidIcon color="success" sx={{ fontSize: 18 }} />
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>${s.lastPayment.amount}</Typography>
                                            <Typography variant="caption" color="text.secondary">{s.lastPayment.date}</Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" color="primary" onClick={() => { setSelectedStudent(s); setOpen(true); }}>
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

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ fontWeight: 800, px: 4, pt: 4 }}>
                    {selectedStudent ? 'Editar Alumno' : 'Registrar Nuevo Alumno'}
                </DialogTitle>
                <DialogContent sx={{ px: 4, pb: 4 }}>
                    <Grid container spacing={4}>
                        {/* Personal Data */}
                        <Grid item xs={12} md={6}>
                            <Stack spacing={3}>
                                <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main', fontWeight: 700 }}>
                                    <ContactPhoneIcon fontSize="small" /> DATOS PERSONALES
                                </Typography>
                                <TextField label="Nombre y Apellido completo" variant="outlined" fullWidth />
                                <Grid container spacing={2}>
                                    <Grid item xs={6}><TextField label="DNI" fullWidth /></Grid>
                                    <Grid item xs={6}><TextField label="Fecha de Nacimiento" type="date" fullWidth InputLabelProps={{ shrink: true }} /></Grid>
                                </Grid>
                                <TextField label="Número de Teléfono" fullWidth />
                                <TextField label="Domicilio" fullWidth />
                                <TextField label="Localidad" fullWidth />

                                <Divider />

                                <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main', fontWeight: 700 }}>
                                    <PaidIcon fontSize="small" /> ÚLTIMO PAGO
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}><TextField label="Fecha" type="date" fullWidth InputLabelProps={{ shrink: true }} /></Grid>
                                    <Grid item xs={6}><TextField label="Importe" fullWidth InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} /></Grid>
                                </Grid>
                            </Stack>
                        </Grid>

                        {/* Schedule & Prof */}
                        <Grid item xs={12} md={6}>
                            <Stack spacing={3}>
                                <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main', fontWeight: 700 }}>
                                    <CalendarMonthIcon fontSize="small" /> HORARIOS Y PROFESOR
                                </Typography>

                                <FormControlLabel
                                    control={<Checkbox defaultChecked />}
                                    label="Asignar Profesor"
                                    sx={{ '& .MuiTypography-root': { fontWeight: 700 } }}
                                />

                                <Box>
                                    <Typography variant="caption" sx={{ fontWeight: 700, mb: 1, display: 'block' }}>DÍAS Y HORAS</Typography>
                                    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', maxHeight: 400, overflowY: 'auto' }}>
                                        <Table size="small" stickyHeader>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ bgcolor: 'background.paper', zIndex: 3, left: 0, position: 'sticky' }}>Hora</TableCell>
                                                    {DAYS.map(day => (
                                                        <TableCell key={day} align="center" sx={{ bgcolor: 'background.paper' }}>{day.substring(0, 3)}</TableCell>
                                                    ))}
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {HOURS.map(hour => (
                                                    <TableRow key={hour}>
                                                        <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper', zIndex: 1, left: 0, position: 'sticky' }}>{hour}</TableCell>
                                                        {DAYS.map(day => (
                                                            <TableCell key={day} align="center">
                                                                <Checkbox size="small" padding="none" />
                                                            </TableCell>
                                                        ))}
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
                    <Button onClick={() => setOpen(false)} sx={{ fontWeight: 700 }}>Cancelar</Button>
                    <Button variant="contained" sx={{ px: 4, py: 1, borderRadius: 2, fontWeight: 700 }}>Guardar Alumno</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
