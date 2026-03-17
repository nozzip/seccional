import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    MenuItem,
    IconButton,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Alert,
    CircularProgress,
    Divider,
    alpha,
    useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import { supabase } from '../../supabaseClient';
import { AffiliateData } from '../../types/mobile';

interface Guest {
    nombre: string;
    apellido: string;
    parentesco: string;
    edad: number | '';
    dni: string;
}

interface TurismoFormProps {
    open: boolean;
    onClose: () => void;
    affiliateData: AffiliateData | null;
}

const DESTINOS = [
    { value: 'Bariloche', label: 'Bariloche' },
    { value: 'Mar del Plata', label: 'Mar del Plata' },
    { value: 'Huerta Grande', label: 'Huerta Grande' },
];

const PARENTESCOS = [
    'Cónyuge',
    'Hijo/a',
    'Padre',
    'Madre',
    'Hermano/a',
    'Otro',
];

export default function TurismoForm({ open, onClose, affiliateData }: TurismoFormProps) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [guests, setGuests] = useState<Guest[]>([]);
    const [newGuest, setNewGuest] = useState<Guest>({
        nombre: '',
        apellido: '',
        parentesco: '',
        edad: '',
        dni: '',
    });
    const theme = useTheme();

    const [formData, setFormData] = useState({
        es_jubilado: false,
        telefono: '',
        mail: '',
        destino: '',
        fecha_ingreso: '',
        fecha_salida: '',
        plazas_req: 1,
        observaciones: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleAddGuest = () => {
        if (!newGuest.nombre || !newGuest.apellido || !newGuest.parentesco) {
            setError('Debe completar nombre, apellido y parentesco del invitado');
            return;
        }
        setGuests([...guests, { ...newGuest, edad: newGuest.edad || 0 }]);
        setNewGuest({ nombre: '', apellido: '', parentesco: '', edad: '', dni: '' });
        setError('');
    };

    const handleRemoveGuest = (index: number) => {
        setGuests(guests.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!affiliateData) return;

        if (!formData.telefono || !formData.mail || !formData.destino || !formData.fecha_ingreso || !formData.fecha_salida) {
            setError('Por favor, complete todos los campos requeridos');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const affiliateIdResult = await supabase
                .from('affiliates')
                .select('id')
                .eq('legajo', affiliateData.legajo)
                .eq('branch', 'noroeste')
                .limit(1);

            const affiliateId = affiliateIdResult.data?.[0]?.id;

            const requestData = {
                affiliate_id: affiliateId,
                nombre_apellido: `${affiliateData.nombre} ${affiliateData.apellido}`,
                cuil: affiliateData.cuil,
                es_jubilado: formData.es_jubilado,
                departamento: 'Noroeste',
                telefono: formData.telefono,
                mail: formData.mail,
                destino: formData.destino,
                fecha_ingreso: formData.fecha_ingreso,
                fecha_salida: formData.fecha_salida,
                plazas_req: formData.plazas_req + guests.length,
                observaciones: formData.observaciones,
                estado: 'pendiente',
            };

            const { data: requestResult, error: requestError } = await supabase
                .from('tourism_requests')
                .insert(requestData)
                .select()
                .single();

            if (requestError) throw requestError;

            if (guests.length > 0 && requestResult) {
                const guestsData = guests.map(guest => ({
                    tourism_request_id: requestResult.id,
                    nombre: guest.nombre,
                    apellido: guest.apellido,
                    parentesco: guest.parentesco,
                    edad: guest.edad,
                    dni: guest.dni || null,
                }));

                const { error: guestsError } = await supabase
                    .from('tourism_guests')
                    .insert(guestsData);

                if (guestsError) throw guestsError;
            }

            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setGuests([]);
                setFormData({
                    es_jubilado: false,
                    telefono: '',
                    mail: '',
                    destino: '',
                    fecha_ingreso: '',
                    fecha_salida: '',
                    plazas_req: 1,
                    observaciones: '',
                });
            }, 2000);
        } catch (err: any) {
            console.error('Error submitting tourism request:', err);
            setError('Error al enviar la solicitud. Intente más tarde.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="paper">
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BeachAccessIcon color="primary" />
                Solicitud de Turismo
                <IconButton onClick={onClose} size="small" sx={{ ml: 'auto' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                {success ? (
                    <Alert severity="success" sx={{ borderRadius: 2 }}>
                        Solicitud enviada correctamente. Te contactaremos pronto.
                    </Alert>
                ) : (
                    <>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                            {affiliateData?.nombre} {affiliateData?.apellido} - CUIL: {affiliateData?.cuil || '-'}
                        </Typography>

                        {error && (
                            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                label="Teléfono"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleChange}
                                fullWidth
                                required
                                size="small"
                            />

                            <TextField
                                label="Email"
                                name="mail"
                                type="email"
                                value={formData.mail}
                                onChange={handleChange}
                                fullWidth
                                required
                                size="small"
                            />

                            <TextField
                                label="¿Es jubilado?"
                                name="es_jubilado"
                                select
                                value={formData.es_jubilado ? 'si' : 'no'}
                                onChange={(e) => setFormData({ ...formData, es_jubilado: e.target.value === 'si' })}
                                fullWidth
                                size="small"
                            >
                                <MenuItem value="no">No</MenuItem>
                                <MenuItem value="si">Sí</MenuItem>
                            </TextField>

                            <TextField
                                label="Destino"
                                name="destino"
                                select
                                value={formData.destino}
                                onChange={handleChange}
                                fullWidth
                                required
                                size="small"
                            >
                                {DESTINOS.map((dest) => (
                                    <MenuItem key={dest.value} value={dest.value}>
                                        {dest.label}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    label="Fecha Ingreso"
                                    name="fecha_ingreso"
                                    type="date"
                                    value={formData.fecha_ingreso}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                />
                                <TextField
                                    label="Fecha Salida"
                                    name="fecha_salida"
                                    type="date"
                                    value={formData.fecha_salida}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Box>

                            <TextField
                                label="Cantidad de plazas propias"
                                name="plazas_req"
                                type="number"
                                value={formData.plazas_req}
                                onChange={handleChange}
                                fullWidth
                                required
                                size="small"
                                inputProps={{ min: 1, max: 10 }}
                            />

                            <TextField
                                label="Observaciones"
                                name="observaciones"
                                value={formData.observaciones}
                                onChange={handleChange}
                                fullWidth
                                multiline
                                rows={2}
                                size="small"
                            />

                            <Divider sx={{ my: 1 }} />

                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                Invitados
                            </Typography>

                            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                    <TextField
                                        label="Nombre"
                                        value={newGuest.nombre}
                                        onChange={(e) => setNewGuest({ ...newGuest, nombre: e.target.value })}
                                        size="small"
                                        sx={{ flex: 1 }}
                                    />
                                    <TextField
                                        label="Apellido"
                                        value={newGuest.apellido}
                                        onChange={(e) => setNewGuest({ ...newGuest, apellido: e.target.value })}
                                        size="small"
                                        sx={{ flex: 1 }}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                    <TextField
                                        label="Parentesco"
                                        value={newGuest.parentesco}
                                        onChange={(e) => setNewGuest({ ...newGuest, parentesco: e.target.value })}
                                        select
                                        size="small"
                                        sx={{ flex: 1 }}
                                    >
                                        {PARENTESCOS.map((p) => (
                                            <MenuItem key={p} value={p}>{p}</MenuItem>
                                        ))}
                                    </TextField>
                                    <TextField
                                        label="Edad"
                                        type="number"
                                        value={newGuest.edad}
                                        onChange={(e) => setNewGuest({ ...newGuest, edad: parseInt(e.target.value) || '' })}
                                        size="small"
                                        sx={{ width: 80 }}
                                    />
                                    <TextField
                                        label="DNI"
                                        value={newGuest.dni}
                                        onChange={(e) => setNewGuest({ ...newGuest, dni: e.target.value })}
                                        size="small"
                                        sx={{ flex: 1 }}
                                    />
                                </Box>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<AddIcon />}
                                    onClick={handleAddGuest}
                                    fullWidth
                                >
                                    Agregar Invitado
                                </Button>
                            </Paper>

                            {guests.length > 0 && (
                                <List dense disablePadding>
                                    {guests.map((guest, index) => (
                                        <ListItem key={index} sx={{ bgcolor: 'background.paper', borderRadius: 1, mb: 0.5 }}>
                                            <ListItemText
                                                primary={`${guest.nombre} ${guest.apellido}`}
                                                secondary={`${guest.parentesco} - ${guest.edad} años - DNI: ${guest.dni || '-'}`}
                                            />
                                            <ListItemSecondaryAction>
                                                <IconButton edge="end" size="small" onClick={() => handleRemoveGuest(index)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Box>
                    </>
                )}
            </DialogContent>
            {!success && (
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={onClose} color="inherit">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <BeachAccessIcon />}
                    >
                        {loading ? 'Enviando...' : 'Enviar Solicitud'}
                    </Button>
                </DialogActions>
            )}
        </Dialog>
    );
}
