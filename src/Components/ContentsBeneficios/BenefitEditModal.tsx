import React, { useState, useEffect } from 'react';
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
    CircularProgress,
    Alert,
    alpha,
    useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { supabase } from '../../supabaseClient';

export interface Benefit {
    id: number;
    title: string;
    category: string;
    thumbnail: string | null;
    short_description: string | null;
    mail: string | null;
    telephone: string | null;
    contact_person: string | null;
    address: string | null;
    discount_description: string | null;
    is_active: boolean;
    display_order: number;
}

interface BenefitEditModalProps {
    open: boolean;
    onClose: () => void;
    benefit: Benefit | null;
    onSave: () => void;
}

const CATEGORIES = [
    'Tucumán',
    'Catamarca',
    'Salta',
    'Santiago del Estero',
    'Jujuy',
    'General',
];

export default function BenefitEditModal({ open, onClose, benefit, onSave }: BenefitEditModalProps) {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const theme = useTheme();

    const [formData, setFormData] = useState<Partial<Benefit>>({
        title: '',
        category: 'Tucumán',
        thumbnail: '',
        short_description: '',
        mail: '',
        telephone: '',
        contact_person: '',
        address: '',
        discount_description: '',
        is_active: true,
        display_order: 0,
    });

    useEffect(() => {
        if (benefit) {
            setFormData({
                title: benefit.title || '',
                category: benefit.category || 'Tucumán',
                thumbnail: benefit.thumbnail || '',
                short_description: benefit.short_description || '',
                mail: benefit.mail || '',
                telephone: benefit.telephone || '',
                contact_person: benefit.contact_person || '',
                address: benefit.address || '',
                discount_description: benefit.discount_description || '',
                is_active: benefit.is_active ?? true,
                display_order: benefit.display_order || 0,
            });
        } else {
            setFormData({
                title: '',
                category: 'Tucumán',
                thumbnail: '',
                short_description: '',
                mail: '',
                telephone: '',
                contact_person: '',
                address: '',
                discount_description: '',
                is_active: true,
                display_order: 0,
            });
        }
        setError('');
        setSuccess('');
    }, [benefit, open]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError('');

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('benefits')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('benefits')
                .getPublicUrl(filePath);

            setFormData({
                ...formData,
                thumbnail: data.publicUrl
            });
            setSuccess('Imagen subida correctamente');
        } catch (err: any) {
            console.error('Error uploading file:', err);
            setError('Error al subir imagen: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.title || !formData.category) {
            setError('El título y la categoría son obligatorios');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const dataToSave = {
                title: formData.title,
                category: formData.category,
                thumbnail: formData.thumbnail || null,
                short_description: formData.short_description || null,
                mail: formData.mail || null,
                telephone: formData.telephone || null,
                contact_person: formData.contact_person || null,
                address: formData.address || null,
                discount_description: formData.discount_description || null,
                is_active: formData.is_active ?? true,
                display_order: formData.display_order || 0,
                updated_at: new Date().toISOString(),
            };

            if (benefit?.id) {
                const { error: updateError } = await supabase
                    .from('benefits')
                    .update(dataToSave)
                    .eq('id', benefit.id);

                if (updateError) throw updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('benefits')
                    .insert(dataToSave);

                if (insertError) throw insertError;
            }

            setSuccess('Beneficio guardado correctamente');
            setTimeout(() => {
                onSave();
                onClose();
            }, 1000);
        } catch (err: any) {
            console.error('Error saving benefit:', err);
            setError('Error al guardar: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!benefit?.id) return;
        if (!window.confirm('¿Estás seguro de eliminar este beneficio?')) return;

        setLoading(true);
        try {
            const { error: deleteError } = await supabase
                .from('benefits')
                .delete()
                .eq('id', benefit.id);

            if (deleteError) throw deleteError;
            onSave();
            onClose();
        } catch (err: any) {
            setError('Error al eliminar: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="paper">
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {benefit?.id ? 'Editar Beneficio' : 'Nuevo Beneficio'}
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                {error && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
                        {error}
                    </Alert>
                )}
                {success && (
                    <Alert severity="success" sx={{ mb: 2, borderRadius: 1 }}>
                        {success}
                    </Alert>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Título"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        fullWidth
                        required
                        size="small"
                    />

                    <TextField
                        label="Categoría"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        fullWidth
                        required
                        select
                        size="small"
                    >
                        {CATEGORIES.map((cat) => (
                            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                        ))}
                    </TextField>

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                        <TextField
                            label="URL de Imagen"
                            name="thumbnail"
                            value={formData.thumbnail}
                            onChange={handleChange}
                            fullWidth
                            size="small"
                            placeholder="https://..."
                        />
                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                            disabled={uploading}
                            sx={{ 
                                minWidth: '130px', 
                                height: '40px', // Matches MUI small TextField height
                                borderRadius: 1 
                            }}
                            size="small"
                        >
                            {uploading ? 'Subiendo...' : 'Subir'}
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={handleFileUpload}
                            />
                        </Button>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: -1, ml: 1, display: 'block' }}>
                        Opcional: puedes pegar una URL o subir un archivo local
                    </Typography>

                    <TextField
                        label="Descripción"
                        name="short_description"
                        value={formData.short_description}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={2}
                        size="small"
                    />

                    <TextField
                        label="Teléfono"
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleChange}
                        fullWidth
                        size="small"
                    />

                    <TextField
                        label="Email"
                        name="mail"
                        value={formData.mail}
                        onChange={handleChange}
                        fullWidth
                        size="small"
                    />

                    <TextField
                        label="Persona de contacto"
                        name="contact_person"
                        value={formData.contact_person}
                        onChange={handleChange}
                        fullWidth
                        size="small"
                    />

                    <TextField
                        label="Dirección"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        fullWidth
                        size="small"
                    />

                    <TextField
                        label="Descripción del descuento"
                        name="discount_description"
                        value={formData.discount_description}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={2}
                        size="small"
                        placeholder="Ej: 20% de descuento en..."
                    />

                    <TextField
                        label="Orden de visualización"
                        name="display_order"
                        type="number"
                        value={formData.display_order}
                        onChange={handleChange}
                        fullWidth
                        size="small"
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
                <Box>
                    {benefit?.id && (
                        <Button
                            onClick={handleDelete}
                            color="error"
                            disabled={loading}
                        >
                            Eliminar
                        </Button>
                    )}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button onClick={onClose} color="inherit">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={saving}
                        startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                    >
                        {saving ? 'Guardando...' : 'Guardar'}
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
}
