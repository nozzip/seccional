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
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import { supabase } from '../../supabaseClient';
import { AffiliateData } from '../../types/mobile';
import TurismoForm from './TurismoForm';

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
    const [turismoOpen, setTurismoOpen] = useState(false);
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
    const [familyDialogOpen, setFamilyDialogOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Partial<FamilyMember> | null>(null);
    const [affiliateId, setAffiliateId] = useState<number | null>(null);

    const theme = useTheme();

    const [formData, setFormData] = useState({
        telefono: '',
        email: '',
        es_jubilado: false,
    });

    useEffect(() => {
        if (affiliateData) {
            setFormData({
                telefono: affiliateData.telefono || localStorage.getItem('mobile_app_telefono') || '',
                email: affiliateData.email || localStorage.getItem('mobile_app_email') || '',
                es_jubilado: affiliateData.es_jubilado || localStorage.getItem('mobile_app_jubilado') === 'true',
            });
            fetchAffiliateId();
        }
    }, [affiliateData]);

    const fetchAffiliateId = async () => {
        if (!affiliateData?.legajo) return;
        
        try {
            const { data, error } = await supabase
                .from('affiliates')
                .select('id')
                .eq('legajo', affiliateData.legajo)
                .eq('branch', 'noroeste')
                .limit(1);

            if (data && data.length > 0) {
                setAffiliateId(data[0].id);
                fetchFamilyMembers(data[0].id);
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
            const { error: updateError } = await supabase
                .from('affiliates')
                .update({
                    telefono: formData.telefono,
                    email: formData.email,
                    es_jubilado: formData.es_jubilado,
                })
                .eq('legajo', affiliateData.legajo)
                .eq('branch', 'noroeste');

            if (updateError) throw updateError;

            onUpdate({
                telefono: formData.telefono,
                email: formData.email,
                es_jubilado: formData.es_jubilado,
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

            setFamilyMembers([...familyMembers, data]);
            setFamilyDialogOpen(false);
            setEditingMember(null);
        } catch (err) {
            console.error('Error adding family member:', err);
            setError('Error al agregar familiar');
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
                                setFormData({
                                    telefono: affiliateData.telefono || '',
                                    email: affiliateData.email || '',
                                    es_jubilado: affiliateData.es_jubilado || false,
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
                            setFamilyDialogOpen(true);
                        }}
                        color="primary"
                    >
                        <AddIcon />
                    </IconButton>
                </Box>

                {familyMembers.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                        No hay familiares registrados
                    </Typography>
                ) : (
                    <List disablePadding>
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
                                                {member.dni && `DNI: ${member.dni}`}
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

            <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <BeachAccessIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Solicitudes
                    </Typography>
                </Box>

                <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => setTurismoOpen(true)}
                    sx={{
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 600,
                    }}
                >
                    Solicitar Turismo
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                    Bariloche • Mar del Plata • Huerta Grande
                </Typography>
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
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setFamilyDialogOpen(false)}>Cancelar</Button>
                    <Button variant="contained" onClick={handleAddFamilyMember}>
                        Agregar
                    </Button>
                </DialogActions>
            </Dialog>

            <TurismoForm
                open={turismoOpen}
                onClose={() => setTurismoOpen(false)}
                affiliateData={affiliateData}
            />
        </Box>
    );
}
