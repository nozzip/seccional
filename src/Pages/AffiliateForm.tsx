import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    TextField,
    Button,
    Grid,
    Stepper,
    Step,
    StepLabel,
    IconButton,
    Divider,
    Alert,
    CircularProgress,
    alpha,
    useTheme,
    MenuItem,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    FormControl,
    InputLabel,
    Select,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { PROVINCES_LIST } from '../Components/Admin/AfiliadosManager';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Helmet } from 'react-helmet-async';

const STEPS = ['Datos del Trabajador', 'Grupo Familiar', 'Confirmación'];

interface FamilyMember {
    nombre: string;
    apellido: string;
    parentesco: string;
    dni: string;
    fechaNacimiento: string;
    diaNac?: string;
    mesNac?: string;
    anioNac?: string;
}

const PARENTESCOS = ['Cónyuge', 'Hijo/a', 'Padre/Madre', 'Hermano/a', 'Otro'];

export default function AffiliateForm() {
    const theme = useTheme();
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [workerData, setWorkerData] = useState({
        nombre: '',
        apellido: '',
        cuil: '',
        legajo: '',
        email: '',
        telefono: '',
        seccional: 'Noroeste',
        dependencia: '',
        provincia: '',
        diaNac: '',
        mesNac: '',
        anioNac: '',
    });

    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
    const [newMember, setNewMember] = useState<FamilyMember>({
        nombre: '',
        apellido: '',
        parentesco: '',
        dni: '',
        fechaNacimiento: '',
        diaNac: '',
        mesNac: '',
        anioNac: '',
    });

    const handleNext = async () => {
        setError('');
        if (activeStep === 0) {
            if (!workerData.nombre.trim()) {
                setError('Por favor, ingresá tu nombre.');
                return;
            }
            if (!workerData.apellido.trim()) {
                setError('Por favor, ingresá tu apellido.');
                return;
            }
            if (!workerData.cuil.trim() && !workerData.legajo.trim()) {
                setError('Por favor, ingresá tu número de CUIL o tu número de Legajo (al menos uno es requerido).');
                return;
            }

            setLoading(true);
            try {
                let orConditions = [];
                if (workerData.legajo.trim()) orConditions.push(`legajo.eq.${workerData.legajo.trim()}`);
                if (workerData.cuil.trim()) orConditions.push(`cuil.eq.${workerData.cuil.trim()}`);

                const { data, error: dbError } = await supabase
                    .from('affiliates')
                    .select('id')
                    .or(orConditions.join(','))
                    .eq('branch', 'noroeste')
                    .maybeSingle();

                if (dbError) throw dbError;

                if (data) {
                    setError('El número de CUIL y/o Legajo ingresado ya se encuentra registrado en nuestra base de datos. Ya estás afiliado, por favor ingresá directamente desde el ícono de login.');
                    setLoading(false);
                    return;
                }
            } catch (err: any) {
                console.error('Error al verificar legajo:', err);
                setError('Error de conexión al verificar el legajo. Por favor, intentá nuevamente.');
                setLoading(false);
                return;
            } finally {
                setLoading(false);
            }
        }
        setActiveStep((prev) => prev + 1);
    };
    const handleBack = () => setActiveStep((prev) => prev - 1);

    const handleAddMember = () => {
        if (!newMember.nombre || !newMember.apellido || !newMember.parentesco || !newMember.dni) {
            setError('Complete los datos básicos del familiar');
            return;
        }
        let fechaNac = '';
        if (newMember.diaNac && newMember.mesNac && newMember.anioNac) {
            fechaNac = `${newMember.anioNac}-${newMember.mesNac.padStart(2, '0')}-${newMember.diaNac.padStart(2, '0')}`;
        }
        setFamilyMembers([...familyMembers, { ...newMember, fechaNacimiento: fechaNac }]);
        setNewMember({ nombre: '', apellido: '', parentesco: '', dni: '', fechaNacimiento: '', diaNac: '', mesNac: '', anioNac: '' });
        setError('');
    };

    const handleRemoveMember = (index: number) => {
        setFamilyMembers(familyMembers.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        try {
            const { error: insertError } = await supabase
                .from('workflow_requests')
                .insert({
                    type: 'affiliation',
                    status: 'pending',
                    requester_info: {
                        nombre: `${workerData.nombre} ${workerData.apellido}`,
                        cuil: workerData.cuil,
                        legajo: workerData.legajo,
                        email: workerData.email,
                        telefono: workerData.telefono
                    },
                    data: {
                        worker: {
                            ...workerData,
                            fecha_nacimiento: workerData.anioNac && workerData.mesNac && workerData.diaNac 
                                ? `${workerData.anioNac}-${workerData.mesNac.padStart(2, '0')}-${workerData.diaNac.padStart(2, '0')}` 
                                : null
                        },
                        family: familyMembers
                    }
                });

            if (insertError) throw insertError;

            setSuccess(true);
        } catch (err: any) {
            console.error('Error submitting affiliation:', err);
            setError('Error al enviar la solicitud. Intente más tarde.');
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Grid container spacing={2.5}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Nombre"
                                fullWidth
                                value={workerData.nombre}
                                onChange={(e) => setWorkerData({ ...workerData, nombre: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Apellido"
                                fullWidth
                                value={workerData.apellido}
                                onChange={(e) => setWorkerData({ ...workerData, apellido: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="CUIL"
                                fullWidth
                                placeholder="00-00000000-0"
                                value={workerData.cuil}
                                onChange={(e) => setWorkerData({ ...workerData, cuil: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Legajo"
                                fullWidth
                                value={workerData.legajo}
                                onChange={(e) => setWorkerData({ ...workerData, legajo: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Email"
                                fullWidth
                                type="email"
                                value={workerData.email}
                                onChange={(e) => setWorkerData({ ...workerData, email: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Teléfono"
                                fullWidth
                                value={workerData.telefono}
                                onChange={(e) => setWorkerData({ ...workerData, telefono: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Dependencia / Oficina"
                                fullWidth
                                value={workerData.dependencia}
                                onChange={(e) => setWorkerData({ ...workerData, dependencia: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Provincia (Opcional)</InputLabel>
                                <Select
                                    value={workerData.provincia}
                                    label="Provincia (Opcional)"
                                    onChange={(e) => setWorkerData({ ...workerData, provincia: e.target.value })}
                                >
                                    <MenuItem value=""><em>Ninguna</em></MenuItem>
                                    {PROVINCES_LIST.map((prov) => (
                                        <MenuItem key={prov} value={prov}>{prov}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1, px: 2, position: 'relative' }}>
                                <Typography variant="caption" sx={{ position: 'absolute', top: -10, left: 10, bgcolor: 'background.paper', px: 0.5, color: 'text.secondary' }}>
                                    Fecha de Nacimiento
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                    <TextField
                                        label="Día"
                                        size="small"
                                        value={workerData.diaNac}
                                        onChange={(e) => {
                                            const v = e.target.value.replace(/\D/g, '').slice(0, 2);
                                            setWorkerData({ ...workerData, diaNac: v });
                                        }}
                                        fullWidth
                                        inputProps={{ inputMode: 'numeric', maxLength: 2 }}
                                    />
                                    <TextField
                                        label="Mes"
                                        size="small"
                                        value={workerData.mesNac}
                                        onChange={(e) => {
                                            const v = e.target.value.replace(/\D/g, '').slice(0, 2);
                                            setWorkerData({ ...workerData, mesNac: v });
                                        }}
                                        fullWidth
                                        inputProps={{ inputMode: 'numeric', maxLength: 2 }}
                                    />
                                    <TextField
                                        label="Año"
                                        size="small"
                                        value={workerData.anioNac}
                                        onChange={(e) => {
                                            const v = e.target.value.replace(/\D/g, '').slice(0, 4);
                                            setWorkerData({ ...workerData, anioNac: v });
                                        }}
                                        fullWidth
                                        inputProps={{ inputMode: 'numeric', maxLength: 4 }}
                                    />
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                );
            case 1:
                return (
                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary', fontWeight: 700 }}>
                            Añadir Familiar (Opcional)
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Nombre"
                                        size="small"
                                        fullWidth
                                        value={newMember.nombre}
                                        onChange={(e) => setNewMember({ ...newMember, nombre: e.target.value })}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Apellido"
                                        size="small"
                                        fullWidth
                                        value={newMember.apellido}
                                        onChange={(e) => setNewMember({ ...newMember, apellido: e.target.value })}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        label="Parentesco"
                                        size="small"
                                        select
                                        fullWidth
                                        value={newMember.parentesco}
                                        onChange={(e) => setNewMember({ ...newMember, parentesco: e.target.value })}
                                    >
                                        {PARENTESCOS.map((p) => (
                                            <MenuItem key={p} value={p}>{p}</MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField label="DNI" size="small" fullWidth value={newMember.dni} onChange={(e) => setNewMember({ ...newMember, dni: e.target.value })} />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1, px: 1, position: 'relative' }}>
                                        <Typography variant="caption" sx={{ position: 'absolute', top: -10, left: 10, bgcolor: 'background.paper', px: 0.5, color: 'text.secondary', whiteSpace: 'nowrap' }}>
                                            F. Nacimiento
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                            <TextField label="Día" size="small" value={newMember.diaNac} onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 2); setNewMember({ ...newMember, diaNac: v }); }} inputProps={{ inputMode: 'numeric', maxLength: 2 }} />
                                            <TextField label="Mes" size="small" value={newMember.mesNac} onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 2); setNewMember({ ...newMember, mesNac: v }); }} inputProps={{ inputMode: 'numeric', maxLength: 2 }} />
                                            <TextField label="Año" size="small" value={newMember.anioNac} onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 4); setNewMember({ ...newMember, anioNac: v }); }} inputProps={{ inputMode: 'numeric', maxLength: 4 }} />
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid item xs={12}>
                                    <Button variant="outlined" startIcon={<AddIcon />} fullWidth onClick={handleAddMember}>
                                        Añadir al grupo familiar
                                    </Button>
                                </Grid>
                            </Grid>
                        </Paper>

                        {familyMembers.length > 0 && (
                            <List>
                                <Divider sx={{ mb: 1 }} />
                                {familyMembers.map((member, index) => (
                                    <ListItem key={index} divider>
                                        <ListItemText
                                            primary={`${member.nombre} ${member.apellido}`}
                                            secondary={`${member.parentesco} - DNI: ${member.dni}`}
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton edge="end" onClick={() => handleRemoveMember(index)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Box>
                );
            case 2:
                return (
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" gutterBottom>Revise su información</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Se enviará una solicitud de afiliación para <strong>{workerData.nombre} {workerData.apellido}</strong> (Legajo: {workerData.legajo}) 
                            con {familyMembers.length} familiares a cargo.
                        </Typography>
                        <Box sx={{ mt: 3, p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
                            <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                                Al presionar finalizar, un administrador revisará sus datos y procederá con el alta en el gremio.
                            </Typography>
                        </Box>
                    </Box>
                );
            default:
                return null;
        }
    };

    if (success) {
        return (
            <Container maxWidth="sm" sx={{ py: 15, textAlign: 'center' }}>
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <CheckCircleIcon sx={{ fontSize: 100, color: 'success.main', mb: 3 }} />
                    <Typography variant="h3" sx={{ fontWeight: 900, mb: 2 }}>¡Solicitud Enviada!</Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                        Tu solicitud de afiliación ha sido registrada correctamente. 
                        Pronto nos pondremos en contacto contigo.
                    </Typography>
                    <Button component={Link} to="/" variant="contained" size="large">
                        Volver al Inicio
                    </Button>
                </motion.div>
            </Container>
        );
    }

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 10 }}>
            <Helmet>
                <title>Afiliate - SECCIONAL NOROESTE</title>
            </Helmet>
            
            {/* Header */}
            <Box sx={{ bgcolor: 'primary.main', color: 'white', pt: 12, pb: 20, textAlign: 'center' }}>
                <Container>
                    <Button
                        component={Link}
                        to="/"
                        startIcon={<ArrowBackIcon />}
                        sx={{ color: 'white', mb: 4, opacity: 0.8 }}
                    >
                        Volver
                    </Button>
                    <Typography variant="h2" sx={{ fontWeight: 900, mb: 2 }}>AFILIATE A AEFIP</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 300, opacity: 0.9 }}>Unite a la Seccional Noroeste</Typography>
                </Container>
            </Box>

            <Container sx={{ mt: -15, position: 'relative', zIndex: 1 }}>
                <Paper sx={{ p: { xs: 3, md: 6 }, borderRadius: 4, boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}>
                    <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 6 }}>
                        {STEPS.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>{error}</Alert>}

                    <Box sx={{ minHeight: 400 }}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {renderStepContent(activeStep)}
                            </motion.div>
                        </AnimatePresence>
                    </Box>

                    <Divider sx={{ my: 4 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button
                            disabled={activeStep === 0 || loading}
                            onClick={handleBack}
                            size="large"
                        >
                            Atrás
                        </Button>
                        <Box>
                            {activeStep === STEPS.length - 1 ? (
                                <Button
                                    variant="contained"
                                    onClick={handleSubmit}
                                    size="large"
                                    disabled={loading}
                                    sx={{ px: 6, fontWeight: 900 }}
                                >
                                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Finalizar Solicitud'}
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    onClick={handleNext}
                                    size="large"
                                    disabled={loading}
                                    sx={{ px: 6, fontWeight: 900 }}
                                >
                                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Siguiente'}
                                </Button>
                            )}
                        </Box>
                    </Box>
                </Paper>

                <Box sx={{ mt: 6, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        ¿Ya sos afiliado? <Link to="/login" style={{ color: theme.palette.primary.main, fontWeight: 700 }}>Iniciá Sesión</Link>
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}
