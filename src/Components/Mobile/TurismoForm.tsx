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
    Chip,
    alpha,
    useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import HouseSidingIcon from '@mui/icons-material/HouseSiding';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
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
    isSubsidized?: boolean;
    subsidizedType?: string;
}

const DESTINOS = [
    { value: 'Bariloche - Hostería Peumayen', label: 'Bariloche - Hostería Peumayen' },
    { value: 'Mar del Plata - Hotel Concord', label: 'Mar del Plata - Hotel Concord' },
    { value: 'Huerta Grande - Hotel Presidente Peron', label: 'Huerta Grande - Hotel Presidente Peron' },
    { value: 'CABA - Hotel Davinci', label: 'CABA - Hotel Davinci' },
];

const CABIN_TYPES = [
    { value: 'Cabaña para 4', label: 'Cabaña para 4 personas' },
    { value: 'Cabaña para 5', label: 'Cabaña para 5 personas' },
    { value: 'Cabaña para 7', label: 'Cabaña para 7 personas' },
];

const PARENTESCOS = [
    'Cónyuge',
    'Hijo/a',
    'Padre',
    'Madre',
    'Hermano/a',
    'Otro',
];

export default function TurismoForm({ open, onClose, affiliateData, isSubsidized = false, subsidizedType = '' }: TurismoFormProps) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [guests, setGuests] = useState<Guest[]>([]);
    const [savedFamily, setSavedFamily] = useState<Guest[]>([]);
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

    // Reset destino when subsidizedType changes to avoid MUI out-of-range error
    React.useEffect(() => {
        setFormData(prev => ({
            ...prev,
            destino: subsidizedType === 'mollar' ? '' : prev.destino
        }));
    }, [subsidizedType]);

    const calculateAge = (birthDate?: string | null): number | null => {
        if (!birthDate) return null;
        const today = new Date();
        const parts = birthDate.split('T')[0].split('-');
        const birth = parts.length === 3
            ? new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
            : new Date(birthDate);
        if (isNaN(birth.getTime())) return null;
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age >= 0 ? age : null;
    };

    React.useEffect(() => {
        if (open) {
            setFormData(prev => ({
                ...prev,
                destino: '', // Always clear on open to ensure fresh selection
                telefono: localStorage.getItem('mobile_app_telefono') || '',
                mail: localStorage.getItem('mobile_app_email') || '',
            }));
            setGuests([]);
            setFile(null);
            setError('');
            setSuccess(false);

            const loadFamilyMembers = async () => {
                if (!affiliateData?.legajo) return;
                const list: Guest[] = [];
                if (affiliateData.conyuge_nombre) {
                    const parts = affiliateData.conyuge_nombre.trim().split(' ');
                    list.push({
                        nombre: parts[0] || affiliateData.conyuge_nombre,
                        apellido: parts.slice(1).join(' ') || '-',
                        parentesco: 'Cónyuge',
                        edad: 0,
                        dni: affiliateData.conyuge_dni || '',
                    });
                }
                try {
                    const { data: affData } = await supabase
                        .from('affiliates')
                        .select('id')
                        .eq('legajo', affiliateData.legajo)
                        .eq('branch', 'noroeste')
                        .limit(1);

                    if (affData && affData.length > 0) {
                        const { data: famData } = await supabase
                            .from('affiliate_family_members')
                            .select('nombre, apellido, dni, fecha_nacimiento, edad')
                            .eq('affiliate_id', affData[0].id)
                            .order('nombre', { ascending: true });

                        if (famData) {
                            famData.forEach((m: any) => {
                                list.push({
                                    nombre: m.nombre || '',
                                    apellido: m.apellido || '',
                                    parentesco: 'Hijo/a',
                                    edad: calculateAge(m.fecha_nacimiento) ?? m.edad ?? 0,
                                    dni: m.dni || '',
                                });
                            });
                        }
                    }
                } catch (e) {
                    console.warn('Error loading family for TurismoForm:', e);
                }
                setSavedFamily(list);
            };
            loadFamilyMembers();
        }
    }, [open, affiliateData]);

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

        const needsFile = isSubsidized && subsidizedType !== 'Jubilados';

        if (needsFile && !file) {
            setError('Para este beneficio es obligatorio adjuntar el Certificado de Matrimonio');
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

            let attachmentUrl = '';

            // 1. Upload file if subsidized
            if (isSubsidized && file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}_${affiliateData.legajo.replace(/\//g, '_')}.${fileExt}`;
                
                // Sanitize folder name: remove accents, slashes and special chars
                const sanitizedType = subsidizedType
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-zA-Z0-9\s]/g, "")
                    .replace(/\s+/g, '_')
                    .toLowerCase();
                    
                const filePath = `${sanitizedType}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('request-attachments')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('request-attachments')
                    .getPublicUrl(filePath);
                
                attachmentUrl = publicUrl;
            }

            const isMollar = subsidizedType === 'mollar';
            const requestTitle = isMollar
                ? `Reserva Cabañas El Mollar: ${formData.destino}`
                : (isSubsidized
                    ? `Turismo Subsidiado (${subsidizedType === 'matrimonio' ? 'Luna de Miel' : 'Bodas de Plata'}): ${formData.destino}`
                    : `Turismo: ${formData.destino}`);

            const requestData = {
                type: isMollar ? 'cabin_reservation' : 'tourism',
                status: 'pending',
                requester_info: {
                    nombre: `${affiliateData.nombre} ${affiliateData.apellido}`,
                    cuil: affiliateData.cuil,
                    legajo: affiliateData.legajo,
                    email: formData.mail,
                    telefono: formData.telefono
                },
                data: {
                    title: requestTitle,
                    summary: `${formData.fecha_ingreso} al ${formData.fecha_salida} | ${formData.plazas_req} plazas`,
                    is_subsidized: isSubsidized,
                    subsidized_type: subsidizedType,
                    destino: formData.destino,
                    fecha_ingreso: formData.fecha_ingreso,
                    fecha_salida: formData.fecha_salida,
                    plazas_req: formData.plazas_req,
                    observaciones: formData.observaciones,
                    guests: guests,
                    attachment_url: attachmentUrl
                }
            };

            const { error: requestError } = await supabase
                .from('workflow_requests')
                .insert(requestData);

            if (requestError) throw requestError;

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
                setFile(null);
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
                {subsidizedType === 'mollar' ? <HouseSidingIcon color="success" /> : <BeachAccessIcon color="primary" />}
                {subsidizedType === 'mollar' ? 'Reserva El Mollar' : (isSubsidized ? `Turismo: ${subsidizedType}` : 'Solicitud de Turismo')}
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
                                label={subsidizedType === 'mollar' ? "Tipo de Cabaña" : "Destino"}
                                name="destino"
                                select
                                value={formData.destino}
                                onChange={handleChange}
                                fullWidth
                                required
                                size="small"
                            >
                                {(subsidizedType === 'mollar' ? CABIN_TYPES : DESTINOS).map((dest) => (
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

                            {isSubsidized && subsidizedType !== 'Jubilados' && (
                                <Box sx={{ mt: 1 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
                                        Certificado de Matrimonio *
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                                        Es requisito indispensable para tramitar el beneficio de Matrimonio o Bodas de Plata.
                                    </Typography>
                                    <Button
                                        component="label"
                                        variant="outlined"
                                        startIcon={file ? <AttachFileIcon /> : <CloudUploadIcon />}
                                        fullWidth
                                        sx={{ 
                                            borderRadius: 2, 
                                            height: 50, 
                                            borderStyle: 'dashed',
                                            bgcolor: file ? alpha(theme.palette.success.main, 0.05) : 'transparent'
                                        }}
                                    >
                                        {file ? file.name : 'Subir Certificado (PDF/JPG)'}
                                        <input
                                            type="file"
                                            hidden
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(e) => e.target.files && setFile(e.target.files[0])}
                                        />
                                    </Button>
                                </Box>
                            )}

                            <Divider sx={{ my: 1 }} />

                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                Invitados
                            </Typography>

                            {savedFamily.length > 0 && (
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 1.5,
                                        borderRadius: 2,
                                        border: '1px dashed',
                                        borderColor: 'primary.main',
                                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <FamilyRestroomIcon color="primary" fontSize="small" />
                                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                                                Seleccionar de mi Grupo Familiar (1 toque):
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {savedFamily.map((fam, idx) => {
                                            const alreadyAdded = guests.some(
                                                g => (fam.dni && g.dni === fam.dni) || (g.nombre === fam.nombre && g.apellido === fam.apellido)
                                            );
                                            return (
                                                <Chip
                                                    key={idx}
                                                    label={`${fam.nombre} (${fam.parentesco})`}
                                                    size="small"
                                                    color={alreadyAdded ? 'success' : 'primary'}
                                                    variant={alreadyAdded ? 'filled' : 'outlined'}
                                                    disabled={alreadyAdded}
                                                    onClick={() => {
                                                        if (!alreadyAdded) {
                                                            setGuests(prev => [...prev, fam]);
                                                        }
                                                    }}
                                                    sx={{ fontWeight: 700 }}
                                                />
                                            );
                                        })}
                                    </Box>
                                </Paper>
                            )}

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
                        startIcon={loading ? <CircularProgress size={20} /> : (subsidizedType === 'mollar' ? <HouseSidingIcon /> : <BeachAccessIcon />)}
                    >
                        {loading ? 'Enviando...' : (subsidizedType === 'mollar' ? 'Solicitar Reserva' : 'Enviar Solicitud')}
                    </Button>
                </DialogActions>
            )}
        </Dialog>
    );
}
