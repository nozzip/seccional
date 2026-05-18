import React, { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    Alert,
    CircularProgress,
    alpha,
    useTheme,
    Stack,
    Divider,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { supabase } from '../../supabaseClient';

interface Props {
    open: boolean;
    onClose: () => void;
    initialType?: string;
    mode?: 'cabin' | 'salon';
}

export default function CabinReservationForm({ open, onClose, initialType = 'confort4', mode = 'cabin' }: Props) {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        nombre: '',
        telefono: '',
        cuil: '',
        is_affiliate: true,
        cabin_type: mode === 'salon' ? 'cumpleaños' : initialType,
        start_date: '',
        end_date: '',
        guests: mode === 'salon' ? 50 : 2,
        notes: ''
    });

    const handleSubmit = async () => {
        if (!formData.nombre || !formData.telefono || !formData.start_date || (mode === 'cabin' && !formData.end_date)) {
            setError('Por favor complete los campos obligatorios.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { error: insertError } = await supabase
                .from('workflow_requests')
                .insert({
                    type: mode === 'salon' ? 'salon_reservation' : 'cabin_reservation',
                    status: 'pending',
                    requester_info: {
                        nombre: formData.nombre,
                        telefono: formData.telefono,
                        cuil: formData.cuil,
                        is_affiliate: formData.is_affiliate
                    },
                    data: {
                        event_type: mode === 'salon' ? formData.cabin_type : undefined,
                        cabin_type: mode === 'cabin' ? formData.cabin_type : undefined,
                        start_date: formData.start_date,
                        end_date: mode === 'salon' ? formData.start_date : formData.end_date,
                        guests: formData.guests,
                        notes: formData.notes
                    }
                });

            if (insertError) throw insertError;
            setSuccess(true);
        } catch (err: any) {
            console.error('Error submitting reservation request:', err);
            setError('Hubo un error al enviar su pedido. Por favor intente más tarde.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
                <DialogContent sx={{ textAlign: 'center', py: 6 }}>
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                        <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                        <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>Pedido Enviado</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Hemos recibido su pedido de reserva. Nos pondremos en contacto pronto para confirmar disponibilidad y procesar los detalles.
                        </Typography>
                        <Button onClick={onClose} variant="contained" sx={{ mt: 4, px: 4 }}>Entendido</Button>
                    </motion.div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarMonthIcon color="primary" /> {mode === 'salon' ? 'Solicitar Reserva en Salón San Lorenzo' : 'Solicitar Reserva en El Mollar'}
            </DialogTitle>
            <DialogContent dividers>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Complete los datos y nuestro equipo verificará la disponibilidad para las fechas solicitadas.
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={8}>
                        <TextField label="Nombre Completo" fullWidth required value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField label="¿Es Afiliado?" select fullWidth value={formData.is_affiliate ? 'S' : 'N'} onChange={(e) => setFormData({ ...formData, is_affiliate: e.target.value === 'S' })}>
                            <MenuItem value="S">Sí</MenuItem>
                            <MenuItem value="N">No</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField label="WhatsApp / Celular" fullWidth required value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField label="CUIL" fullWidth value={formData.cuil} onChange={(e) => setFormData({ ...formData, cuil: e.target.value })} />
                    </Grid>
                    
                    <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

                    {mode === 'cabin' ? (
                        <>
                            <Grid item xs={12} sm={6}>
                                <TextField select label="Cabaña" fullWidth value={formData.cabin_type} onChange={(e) => setFormData({ ...formData, cabin_type: e.target.value })}>
                                    <MenuItem value="confort4">Cabaña 4 Personas</MenuItem>
                                    <MenuItem value="confort5">Cabaña 5 Personas</MenuItem>
                                    <MenuItem value="confort7">Cabaña 7 Personas</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField type="number" label="Pasajeros" fullWidth value={formData.guests} onChange={(e) => setFormData({ ...formData, guests: Number(e.target.value) })} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField type="date" label="Ingreso" fullWidth InputLabelProps={{ shrink: true }} value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField type="date" label="Egreso" fullWidth InputLabelProps={{ shrink: true }} value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
                            </Grid>
                        </>
                    ) : (
                        <>
                            <Grid item xs={12} sm={6}>
                                <TextField select label="Tipo de Evento" fullWidth value={formData.cabin_type} onChange={(e) => setFormData({ ...formData, cabin_type: e.target.value })}>
                                    <MenuItem value="cumpleaños">Cumpleaños</MenuItem>
                                    <MenuItem value="casamiento">Casamiento / Boda</MenuItem>
                                    <MenuItem value="gremial">Reunión Gremial</MenuItem>
                                    <MenuItem value="cena_almuerzo">Cena / Almuerzo</MenuItem>
                                    <MenuItem value="otro">Otro Evento</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField type="number" label="Invitados Estimados" fullWidth value={formData.guests} onChange={(e) => setFormData({ ...formData, guests: Number(e.target.value) })} />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField type="date" label="Fecha del Evento" fullWidth InputLabelProps={{ shrink: true }} value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
                            </Grid>
                        </>
                    )}

                    <Grid item xs={12}>
                        <TextField label="Consultas adicionales" multiline rows={2} fullWidth value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3, gap: 1 }}>
                <Button onClick={onClose} sx={{ fontWeight: 700 }}>Cancelar</Button>
                <Button 
                    variant="contained" 
                    onClick={handleSubmit} 
                    disabled={loading}
                    sx={{ fontWeight: 900, px: 4 }}
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ContactSupportIcon />}
                >
                    Enviar Pedido
                </Button>
            </DialogActions>
        </Dialog>
    );
}
