import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Switch,
    FormControlLabel,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Alert,
    Chip,
    alpha,
    useTheme,
    MenuItem,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import HouseSidingIcon from '@mui/icons-material/HouseSiding';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { supabase } from '../../supabaseClient';
import { AffiliateData } from '../../types/mobile';

interface FamilyMember {
    id?: number;
    affiliate_id: number;
    nombre: string;
    apellido: string;
    dni?: string;
    fecha_nacimiento?: string;
    edad?: number;
    grado_escolar?: string;
}

interface WorkflowRequestItem {
    id: number;
    type: string;
    status: string;
    created_at: string;
    data?: any;
}

interface PerfilViewProps {
    affiliateData: AffiliateData | null;
    onUpdate: (updates: Partial<AffiliateData>) => void;
    onLogout: () => void;
}

export default function PerfilView({ affiliateData, onUpdate, onLogout }: PerfilViewProps) {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
    const [familyDialogOpen, setFamilyDialogOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Partial<FamilyMember> | null>(null);
    const [affiliateId, setAffiliateId] = useState<number | null>(null);
    const [memberRelationship, setMemberRelationship] = useState<'hijo' | 'conyuge'>('hijo');
    const [myRequests, setMyRequests] = useState<WorkflowRequestItem[]>([]);
    const [loadingRequests, setLoadingRequests] = useState(false);

    const theme = useTheme();

    const [formData, setFormData] = useState({
        telefono: '',
        email: '',
        es_jubilado: false,
        dia: '',
        mes: '',
        anio: '',
    });

    useEffect(() => {
        if (affiliateData) {
            const fechaStr = affiliateData.fecha_nacimiento || localStorage.getItem('mobile_app_fecha_nacimiento') || '';
            const [anio, mes, dia] = fechaStr ? fechaStr.split('-') : ['', '', ''];
            setFormData({
                telefono: affiliateData.telefono || localStorage.getItem('mobile_app_telefono') || '',
                email: affiliateData.email || localStorage.getItem('mobile_app_email') || '',
                es_jubilado: affiliateData.es_jubilado || localStorage.getItem('mobile_app_jubilado') === 'true',
                dia: dia || '',
                mes: mes || '',
                anio: anio || '',
            });
            fetchAffiliateId();
            fetchMyRequests();
        }
    }, [affiliateData]);

    const fetchMyRequests = async () => {
        if (!affiliateData?.legajo) return;
        setLoadingRequests(true);
        try {
            const { data, error } = await supabase
                .from('workflow_requests')
                .select('id, type, status, created_at, data')
                .eq('requester_info->>legajo', affiliateData.legajo)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setMyRequests(data);
            }
        } catch (err) {
            console.error('Error fetching affiliate requests:', err);
        } finally {
            setLoadingRequests(false);
        }
    };

    const fetchAffiliateId = async () => {
        if (!affiliateData?.legajo) return;
        
        try {
            const { data, error } = await supabase
                .from('affiliates')
                .select('id, conyuge_nombre, conyuge_dni, telefono, email, es_jubilado, fecha_nacimiento')
                .eq('legajo', affiliateData.legajo)
                .limit(1);

            if (!error && data && data.length > 0) {
                const aff = data[0];
                setAffiliateId(aff.id);
                fetchFamilyMembers(aff.id);

                // Sync spouse data if present in DB
                if (aff.conyuge_nombre && !affiliateData.conyuge_nombre) {
                    onUpdate({
                        conyuge_nombre: aff.conyuge_nombre,
                        conyuge_dni: aff.conyuge_dni || undefined
                    });
                }
            }
        } catch (err) {
            console.error('Error fetching affiliate ID:', err);
        }
    };

    const fetchFamilyMembers = async (id: number) => {
        try {
            const { data, error } = await supabase
                .from('affiliate_family_members')
                .select('*')
                .eq('affiliate_id', id)
                .order('nombre', { ascending: true });

            if (!error && data) {
                setFamilyMembers(data);
            }
        } catch (err) {
            console.error('Error fetching family members:', err);
        }
    };

    const handleSave = async () => {
        if (!affiliateData?.legajo) return;

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const fechaStr = formData.anio && formData.mes && formData.dia
                ? `${formData.anio.padStart(4, '0')}-${formData.mes.padStart(2, '0')}-${formData.dia.padStart(2, '0')}`
                : null;

            const updateQuery = affiliateId
                ? supabase.from('affiliates').update({
                    telefono: formData.telefono,
                    email: formData.email,
                    es_jubilado: formData.es_jubilado,
                    fecha_nacimiento: fechaStr,
                }).eq('id', affiliateId)
                : supabase.from('affiliates').update({
                    telefono: formData.telefono,
                    email: formData.email,
                    es_jubilado: formData.es_jubilado,
                    fecha_nacimiento: fechaStr,
                }).eq('legajo', affiliateData.legajo);

            const { error: updateError } = await updateQuery;

            if (updateError) throw updateError;

            // Notify Admin in Gestión Unificada (workflow_requests)
            try {
                await supabase.from('workflow_requests').insert({
                    type: 'profile_update',
                    status: 'pending',
                    requester_info: {
                        nombre: `${affiliateData.nombre} ${affiliateData.apellido}`,
                        legajo: affiliateData.legajo,
                        cuil: affiliateData.cuil,
                        email: formData.email,
                        telefono: formData.telefono,
                    },
                    data: {
                        title: `Actualización de Perfil: ${affiliateData.nombre} ${affiliateData.apellido}`,
                        summary: `Tel: ${formData.telefono || 'Sin cambio'} | Email: ${formData.email || 'Sin cambio'} | Jubilado: ${formData.es_jubilado ? 'Sí' : 'No'}`,
                        telefono: formData.telefono,
                        email: formData.email,
                        es_jubilado: formData.es_jubilado,
                        fecha_nacimiento: fechaStr,
                    }
                });
            } catch (wfErr) {
                console.warn("No se pudo registrar solicitud en workflow_requests:", wfErr);
            }

            onUpdate({
                telefono: formData.telefono,
                email: formData.email,
                es_jubilado: formData.es_jubilado,
                fecha_nacimiento: fechaStr ?? undefined,
            });

            setSuccess('Datos guardados correctamente');
            setEditMode(false);
        } catch (err: any) {
            console.error('Error saving:', err);
            setError('Error al guardar los datos');
        } finally {
            setSaving(false);
        }
    };

    const handleAddFamilyMember = async () => {
        if (!affiliateId || !editingMember?.nombre || !editingMember?.apellido) return;

        try {
            if (memberRelationship === 'conyuge') {
                const fullName = `${editingMember.nombre.trim()} ${editingMember.apellido.trim()}`;
                const dni = editingMember.dni?.trim() || null;
                
                const { error } = await supabase
                    .from('affiliates')
                    .update({
                        conyuge_nombre: fullName,
                        conyuge_dni: dni ?? undefined
                    })
                    .eq('id', affiliateId);

                if (error) throw error;

                // Notify Admin in Gestión Unificada (workflow_requests)
                try {
                    await supabase.from('workflow_requests').insert({
                        type: 'family_update',
                        status: 'pending',
                        requester_info: {
                            nombre: `${affiliateData?.nombre} ${affiliateData?.apellido}`,
                            legajo: affiliateData?.legajo,
                            cuil: affiliateData?.cuil,
                            email: affiliateData?.email,
                            telefono: affiliateData?.telefono,
                        },
                        data: {
                            title: `Incorporación de Cónyuge: ${fullName}`,
                            summary: `Cónyuge: ${fullName}${dni ? ` (DNI: ${dni})` : ''}`,
                            action: 'Alta de Cónyuge',
                            nombre: editingMember.nombre.trim(),
                            apellido: editingMember.apellido.trim(),
                            parentesco: 'Cónyuge',
                            dni: dni,
                        }
                    });
                } catch (wfErr) {
                    console.warn("No se pudo registrar solicitud en workflow_requests:", wfErr);
                }

                onUpdate({
                    conyuge_nombre: fullName,
                    conyuge_dni: dni ?? undefined
                });
                
                setFamilyDialogOpen(false);
                setEditingMember(null);
                setSuccess('Cónyuge agregado correctamente');
            } else {
                const memberToInsert = {
                    affiliate_id: affiliateId,
                    nombre: editingMember.nombre?.trim() || '',
                    apellido: editingMember.apellido?.trim() || '',
                    dni: editingMember.dni?.trim() || null,
                    fecha_nacimiento: editingMember.fecha_nacimiento || null,
                    edad: editingMember.edad || null,
                    grado_escolar: editingMember.grado_escolar?.trim() || null,
                };

                const { data, error } = await supabase
                    .from('affiliate_family_members')
                    .insert(memberToInsert)
                    .select()
                    .single();

                if (error) throw error;

                // Notify Admin in Gestión Unificada (workflow_requests)
                try {
                    await supabase.from('workflow_requests').insert({
                        type: 'family_update',
                        status: 'pending',
                        requester_info: {
                            nombre: `${affiliateData?.nombre} ${affiliateData?.apellido}`,
                            legajo: affiliateData?.legajo,
                            cuil: affiliateData?.cuil,
                            email: affiliateData?.email,
                            telefono: affiliateData?.telefono,
                        },
                        data: {
                            title: `Alta de Familiar: ${memberToInsert.nombre} ${memberToInsert.apellido}`,
                            summary: `Hijo/a: ${memberToInsert.nombre} ${memberToInsert.apellido}${memberToInsert.edad ? ` (${memberToInsert.edad} años)` : ''}${memberToInsert.grado_escolar ? ` - Grado: ${memberToInsert.grado_escolar}` : ''}`,
                            action: 'Alta de Hijo/a',
                            nombre: memberToInsert.nombre,
                            apellido: memberToInsert.apellido,
                            parentesco: 'Hijo/a',
                            dni: memberToInsert.dni,
                            fecha_nacimiento: memberToInsert.fecha_nacimiento,
                            edad: memberToInsert.edad,
                            grado_escolar: memberToInsert.grado_escolar,
                        }
                    });
                } catch (wfErr) {
                    console.warn("No se pudo registrar solicitud en workflow_requests:", wfErr);
                }

                setFamilyMembers([...familyMembers, data]);
                setFamilyDialogOpen(false);
                setEditingMember(null);
                setSuccess('Familiar agregado correctamente');
            }
        } catch (err: any) {
            console.error('Error adding family member:', err);
            setError('Error al agregar familiar');
        }
    };

    const handleDeleteConyuge = async () => {
        if (!window.confirm('¿Eliminar al cónyuge del grupo familiar?')) return;
        try {
            const { error } = await supabase
                .from('affiliates')
                .update({
                    conyuge_nombre: null,
                    conyuge_dni: null
                })
                .eq('id', affiliateId);
                
            if (error) throw error;
            
            onUpdate({
                conyuge_nombre: undefined,
                conyuge_dni: undefined
            });
            setSuccess('Cónyuge eliminado correctamente');
        } catch (err) {
            console.error('Error deleting conyuge:', err);
            setError('Error al eliminar cónyuge');
        }
    };

    const handleDeleteFamilyMember = async (id: number) => {
        if (!window.confirm('¿Eliminar este familiar?')) return;

        try {
            await supabase.from('affiliate_family_members').delete().eq('id', id);
            setFamilyMembers(familyMembers.filter(m => m.id !== id));
        } catch (err) {
            console.error('Error deleting family member:', err);
            setError('Error al eliminar familiar');
        }
    };

    if (!affiliateData) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">Cargando datos...</Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, color: 'primary.main', textAlign: 'center' }}>
                MI PERFIL
            </Typography>

            {success && (
                <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            )}
            {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon color="primary" />
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            Datos Personales
                        </Typography>
                    </Box>
                    {!editMode && (
                        <IconButton onClick={() => setEditMode(true)} color="primary">
                            <EditIcon />
                        </IconButton>
                    )}
                </Box>

                <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                        Nombre completo
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {affiliateData.nombre} {affiliateData.apellido}
                    </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                        CUIL
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {affiliateData.cuil || '-'}
                    </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                        Legajo
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {affiliateData.legajo}
                    </Typography>
                </Box>

                {!editMode && (
                    <>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                                Fecha de Nacimiento
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {affiliateData.fecha_nacimiento ? (() => { const [y, m, d] = affiliateData.fecha_nacimiento.split('-'); return `${d}/${m}/${y}`; })() : '-'}
                            </Typography>
                        </Box>
                    </>
                )}

                <Divider sx={{ my: 2 }} />

                <TextField
                    fullWidth
                    label="Teléfono"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    disabled={!editMode}
                    size="small"
                    sx={{ mb: 2 }}
                />

                <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!editMode}
                    size="small"
                    sx={{ mb: 2 }}
                />

                <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                        Fecha de Nacimiento
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            label="Día"
                            value={formData.dia}
                            onChange={(e) => {
                                const v = e.target.value.replace(/\D/g, '').slice(0, 2);
                                setFormData({ ...formData, dia: v });
                            }}
                            disabled={!editMode}
                            size="small"
                            sx={{ width: 80 }}
                            inputProps={{ inputMode: 'numeric', maxLength: 2 }}
                        />
                        <TextField
                            label="Mes"
                            value={formData.mes}
                            onChange={(e) => {
                                const v = e.target.value.replace(/\D/g, '').slice(0, 2);
                                setFormData({ ...formData, mes: v });
                            }}
                            disabled={!editMode}
                            size="small"
                            sx={{ width: 80 }}
                            inputProps={{ inputMode: 'numeric', maxLength: 2 }}
                        />
                        <TextField
                            label="Año"
                            value={formData.anio}
                            onChange={(e) => {
                                const v = e.target.value.replace(/\D/g, '').slice(0, 4);
                                setFormData({ ...formData, anio: v });
                            }}
                            disabled={!editMode}
                            size="small"
                            sx={{ width: 100 }}
                            inputProps={{ inputMode: 'numeric', maxLength: 4 }}
                        />
                    </Box>
                </Box>




                <FormControlLabel
                    control={
                        <Switch
                             checked={formData.es_jubilado}
                             onChange={(e) => setFormData({ ...formData, es_jubilado: e.target.checked })}
                             disabled={!editMode}
                             color="primary"
                        />
                    }
                    label="¿Es jubilado?"
                />

                {editMode && (
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={() => {
                                setEditMode(false);
                                const fechaStr = affiliateData.fecha_nacimiento || '';
                                const [anio, mes, dia] = fechaStr ? fechaStr.split('-') : ['', '', ''];
                                setFormData({
                                    telefono: affiliateData.telefono || '',
                                    email: affiliateData.email || '',
                                    es_jubilado: affiliateData.es_jubilado || false,
                                    dia: dia || '',
                                    mes: mes || '',
                                    anio: anio || '',
                                });
                            }}
                            sx={{ flex: 1 }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSave}
                            disabled={saving}
                            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                            sx={{ flex: 1 }}
                        >
                            Guardar
                        </Button>
                    </Box>
                )}
            </Paper>

            <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FamilyRestroomIcon color="primary" />
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            Grupo Familiar
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={() => {
                            setEditingMember({ nombre: '', apellido: '', dni: '', edad: undefined });
                            setMemberRelationship('hijo');
                            setFamilyDialogOpen(true);
                        }}
                        color="primary"
                    >
                        <AddIcon />
                    </IconButton>
                </Box>

                {familyMembers.length === 0 && !affiliateData.conyuge_nombre ? (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                        No hay familiares registrados
                    </Typography>
                ) : (
                    <List disablePadding>
                        {affiliateData.conyuge_nombre && (
                            <>
                                <ListItem>
                                    <ListItemText
                                        primary={
                                            <Typography sx={{ fontWeight: 600 }}>
                                                {affiliateData.conyuge_nombre}
                                            </Typography>
                                        }
                                        secondary={
                                            <>
                                                Cónyuge
                                                {affiliateData.conyuge_dni && ` - DNI: ${affiliateData.conyuge_dni}`}
                                            </>
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton
                                            edge="end"
                                            color="error"
                                            size="small"
                                            onClick={handleDeleteConyuge}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                                {familyMembers.length > 0 && <Divider />}
                            </>
                        )}
                        {familyMembers.map((member, index) => (
                            <React.Fragment key={member.id}>
                                <ListItem>
                                    <ListItemText
                                        primary={
                                            <Typography sx={{ fontWeight: 600 }}>
                                                {member.nombre} {member.apellido}
                                            </Typography>
                                        }
                                        secondary={
                                            <>
                                                Hijo/a
                                                {member.dni && ` - DNI: ${member.dni}`}
                                                {member.edad && ` - ${member.edad} años`}
                                                {member.grado_escolar && ` - ${member.grado_escolar}`}
                                            </>
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton
                                            edge="end"
                                            color="error"
                                            size="small"
                                            onClick={() => member.id && handleDeleteFamilyMember(member.id)}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                                {index < familyMembers.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </List>
                )}
            </Paper>

            {/* SECCIÓN: HISTORIAL DE GESTIONES Y SOLICITUDES */}
            <Paper 
                elevation={0}
                sx={{ 
                    p: { xs: 2, sm: 3 }, 
                    mb: 3, 
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    background: alpha(theme.palette.background.paper, 0.8),
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                    <AssignmentIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Mis Gestiones y Solicitudes
                    </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Registro histórico de solicitudes de turismo, trámites gremiales y reservas enviadas desde tu portal.
                </Typography>

                {loadingRequests ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                        <CircularProgress size={24} />
                    </Box>
                ) : myRequests.length === 0 ? (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                        No registrás solicitudes enviadas recientemente.
                    </Alert>
                ) : (
                    <List disablePadding>
                        {myRequests.map((req, idx) => {
                            const dateObj = new Date(req.created_at);
                            const fechaStr = dateObj.toLocaleDateString('es-AR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                            });
                            const horaStr = dateObj.toLocaleTimeString('es-AR', {
                                hour: '2-digit',
                                minute: '2-digit'
                            });

                            let title = 'Solicitud';
                            let icon = <AssignmentIcon color="primary" sx={{ fontSize: 28 }} />;
                            let details = '';

                            if (req.type === 'tourism') {
                                title = req.data?.hotel ? `Turismo - ${req.data.hotel}` : 'Solicitud de Turismo';
                                icon = <BeachAccessIcon sx={{ color: 'primary.main', fontSize: 28 }} />;
                                if (req.data?.check_in && req.data?.check_out) {
                                    details = `Fechas: ${req.data.check_in} al ${req.data.check_out} | Pasajeros: ${req.data.passengers || '-'}`;
                                }
                            } else if (req.type === 'cabin_reservation') {
                                title = 'Cabañas El Mollar';
                                icon = <HouseSidingIcon sx={{ color: 'success.main', fontSize: 28 }} />;
                                if (req.data?.check_in && req.data?.check_out) {
                                    details = `Estadía: ${req.data.check_in} al ${req.data.check_out} (${req.data.nights || 1} noches)`;
                                }
                            } else if (req.type === 'benefit') {
                                title = req.data?.benefit_type ? `Trámite Gremial: ${req.data.benefit_type}` : 'Trámite Gremial';
                                icon = <AssignmentIcon sx={{ color: 'warning.main', fontSize: 28 }} />;
                                if (req.data?.notes) {
                                    details = req.data.notes;
                                }
                            } else if (req.type === 'profile_update' || req.type === 'family_update') {
                                title = 'Actualización de Datos';
                                icon = <FamilyRestroomIcon sx={{ color: 'info.main', fontSize: 28 }} />;
                            }

                            return (
                                <React.Fragment key={req.id}>
                                    <ListItem 
                                        alignItems="flex-start"
                                        sx={{ 
                                            px: 1.5, 
                                            py: 1.5,
                                            borderRadius: 2,
                                            mb: 1,
                                            bgcolor: alpha(theme.palette.action.hover, 0.4),
                                            border: '1px solid',
                                            borderColor: alpha(theme.palette.divider, 0.6),
                                            flexDirection: 'column',
                                            alignItems: 'stretch'
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, gap: 1 }}>
                                            {icon}
                                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                                {title}
                                            </Typography>
                                        </Box>

                                        {details && (
                                            <Typography variant="body2" sx={{ color: 'text.secondary', ml: 4.5, mb: 0.5, fontSize: '0.85rem' }}>
                                                {details}
                                            </Typography>
                                        )}

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 4.5, mt: 0.5 }}>
                                            <AccessTimeIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                                Enviado el {fechaStr} a las {horaStr} hs
                                            </Typography>
                                        </Box>
                                    </ListItem>
                                    {idx < myRequests.length - 1 && <Box sx={{ height: 4 }} />}
                                </React.Fragment>
                            );
                        })}
                    </List>
                )}
            </Paper>

            <Button
                fullWidth
                variant="text"
                color="error"
                onClick={onLogout}
                sx={{ mt: 2 }}
            >
                Cerrar Sesión
            </Button>

            <Dialog open={familyDialogOpen} onClose={() => setFamilyDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Agregar Familiar</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            select
                            label="Parentesco / Relación"
                            value={memberRelationship}
                            onChange={(e) => setMemberRelationship(e.target.value as 'hijo' | 'conyuge')}
                            fullWidth
                            size="small"
                        >
                            <MenuItem value="hijo">Hijo/a</MenuItem>
                            {!affiliateData.conyuge_nombre && <MenuItem value="conyuge">Cónyuge</MenuItem>}
                        </TextField>
                        <TextField
                            label="Nombre"
                            value={editingMember?.nombre || ''}
                            onChange={(e) => setEditingMember({ ...editingMember, nombre: e.target.value })}
                            fullWidth
                            size="small"
                        />
                        <TextField
                            label="Apellido"
                            value={editingMember?.apellido || ''}
                            onChange={(e) => setEditingMember({ ...editingMember, apellido: e.target.value })}
                            fullWidth
                            size="small"
                        />
                        <TextField
                            label="DNI"
                            value={editingMember?.dni || ''}
                            onChange={(e) => setEditingMember({ ...editingMember, dni: e.target.value })}
                            fullWidth
                            size="small"
                        />
                        {memberRelationship === 'hijo' && (
                            <>
                                <TextField
                                    label="Edad"
                                    type="number"
                                    value={editingMember?.edad || ''}
                                    onChange={(e) => setEditingMember({ ...editingMember, edad: parseInt(e.target.value) || undefined })}
                                    fullWidth
                                    size="small"
                                />
                                <TextField
                                    label="Grado escolar"
                                    value={editingMember?.grado_escolar || ''}
                                    onChange={(e) => setEditingMember({ ...editingMember, grado_escolar: e.target.value })}
                                    fullWidth
                                    size="small"
                                />
                            </>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setFamilyDialogOpen(false)}>Cancelar</Button>
                    <Button variant="contained" onClick={handleAddFamilyMember}>
                        Agregar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
