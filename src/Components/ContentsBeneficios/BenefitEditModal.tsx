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
    rubro?: string | null;
    thumbnail: string | null;
    images?: string[] | null;
    short_description: string | null;
    mail: string | null;
    telephone: string | null;
    telephone_type?: 'fixed' | 'whatsapp' | null;
    contact_person: string | null;
    address: string | null;
    discount_description: string | null;
    discount_percentage?: number | null;
    is_active: boolean;
    display_order: number;
}

interface BenefitEditModalProps {
    open: boolean;
    onClose: () => void;
    benefit: Benefit | null;
    onSave: () => void;
}

const PROVINCIAS = [
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
    const [rubros, setRubros] = useState<string[]>([]);
    const [newRubro, setNewRubro] = useState('');
    const theme = useTheme();

    const [formData, setFormData] = useState<Partial<Benefit>>({
        title: '',
        category: 'Tucumán',
        rubro: '',
        thumbnail: '',
        images: [],
        short_description: '',
        mail: '',
        telephone: '',
        telephone_type: 'fixed',
        contact_person: '',
        address: '',
        discount_description: '',
        discount_percentage: null,
        is_active: true,
        display_order: 0,
    });

    useEffect(() => {
        fetchRubros();
    }, []);

    const fetchRubros = async () => {
        try {
            const { data: catData } = await supabase
                .from('benefit_categories')
                .select('name');
            
            const { data: benData } = await supabase
                .from('benefits')
                .select('rubro');
            
            const allRubrosSet = new Set<string>();
            if (catData) catData.forEach(c => allRubrosSet.add(c.name));
            if (benData) benData.forEach(b => { if (b.rubro) allRubrosSet.add(b.rubro); });
            
            setRubros(Array.from(allRubrosSet).sort());
        } catch (err) {
            console.error('Error fetching rubros:', err);
        }
    };

    useEffect(() => {
        if (benefit) {
            setFormData({
                title: benefit.title || '',
                category: benefit.category || 'Tucumán',
                rubro: benefit.rubro || '',
                thumbnail: benefit.thumbnail || '',
                images: benefit.images || [],
                short_description: benefit.short_description || '',
                mail: benefit.mail || '',
                telephone: benefit.telephone || '',
                telephone_type: benefit.telephone_type || 'fixed',
                contact_person: benefit.contact_person || '',
                address: benefit.address || '',
                discount_description: benefit.discount_description || '',
                discount_percentage: benefit.discount_percentage || null,
                is_active: benefit.is_active ?? true,
                display_order: benefit.display_order || 0,
            });
        } else {
            setFormData({
                title: '',
                category: 'Tucumán',
                rubro: '',
                thumbnail: '',
                images: [],
                short_description: '',
                mail: '',
                telephone: '',
                telephone_type: 'fixed',
                contact_person: '',
                address: '',
                discount_description: '',
                discount_percentage: null,
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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isGallery = false) => {
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

            if (isGallery) {
                setFormData({
                    ...formData,
                    images: [...(formData.images || []), data.publicUrl]
                });
            } else {
                setFormData({
                    ...formData,
                    thumbnail: data.publicUrl
                });
            }
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
            setError('El título y la provincia son obligatorios');
            return;
        }

        setSaving(true);
        setError('');

        try {
            // Check if we need to add a new rubro
            let finalRubro = formData.rubro;
            if (newRubro) {
                // Attempt to add to categories, but don't block if it fails (e.g. already exists)
                await supabase
                    .from('benefit_categories')
                    .insert([{ name: newRubro }]);
                
                finalRubro = newRubro;
            }

            const dataToSave = {
                title: formData.title,
                category: formData.category,
                rubro: finalRubro || null,
                thumbnail: formData.thumbnail || null,
                images: formData.images || [],
                short_description: formData.short_description || null,
                mail: formData.mail || null,
                telephone: formData.telephone || null,
                telephone_type: formData.telephone_type || 'fixed',
                contact_person: formData.contact_person || null,
                address: formData.address || null,
                discount_description: formData.discount_description || null,
                discount_percentage: formData.discount_percentage || null,
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
                        label="Título / Nombre del Convenio"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        fullWidth
                        required
                        size="small"
                    />

                    <TextField
                        label="Provincia"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        fullWidth
                        required
                        select
                        size="small"
                    >
                        {PROVINCIAS.map((cat) => (
                            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                        ))}
                    </TextField>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            label="Rubro"
                            name="rubro"
                            value={formData.rubro}
                            onChange={handleChange}
                            fullWidth
                            select
                            size="small"
                        >
                            <MenuItem value=""><em>Ninguno</em></MenuItem>
                            {rubros.map((r) => (
                                <MenuItem key={r} value={r}>{r}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Nuevo Rubro"
                            placeholder="Agregar..."
                            value={newRubro}
                            onChange={(e) => setNewRubro(e.target.value)}
                            fullWidth
                            size="small"
                        />
                    </Box>

                    <Box sx={{ border: '1px solid', borderColor: 'divider', p: 2, borderRadius: 1 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Imagen Principal</Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <TextField
                                label="URL de Imagen"
                                name="thumbnail"
                                value={formData.thumbnail}
                                onChange={handleChange}
                                fullWidth
                                size="small"
                            />
                            <Button
                                variant="outlined"
                                component="label"
                                startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                                disabled={uploading}
                                size="small"
                            >
                                {uploading ? '...' : 'Subir'}
                                <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e, false)} />
                            </Button>
                        </Box>
                        {formData.thumbnail && (
                            <Box sx={{ mt: 1, width: 60, height: 60, borderRadius: 1, overflow: 'hidden', border: '1px solid divider' }}>
                                <img src={formData.thumbnail} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </Box>
                        )}
                    </Box>

                    <Box sx={{ border: '1px solid', borderColor: 'divider', p: 2, borderRadius: 1 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Galería de Imágenes (Carrusel)</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                            {formData.images?.map((img, i) => (
                                <Box key={i} sx={{ position: 'relative', width: 60, height: 60, borderRadius: 1, overflow: 'hidden', border: '1px solid divider' }}>
                                    <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <IconButton 
                                        size="small" 
                                        sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'rgba(255,255,255,0.7)', p: 0 }}
                                        onClick={() => setFormData({ ...formData, images: formData.images?.filter((_, idx) => idx !== i) })}
                                    >
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            ))}
                        </Box>
                        <Button
                            variant="outlined"
                            component="label"
                            fullWidth
                            startIcon={<CloudUploadIcon />}
                            disabled={uploading}
                            size="small"
                        >
                            Añadir imagen a la galería
                            <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e, true)} />
                        </Button>
                    </Box>

                    <TextField
                        label="Descripción Completa"
                        name="short_description"
                        value={formData.short_description}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={3}
                        size="small"
                    />

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            label="Teléfono"
                            name="telephone"
                            value={formData.telephone}
                            onChange={handleChange}
                            fullWidth
                            size="small"
                        />
                        <TextField
                            label="Tipo"
                            name="telephone_type"
                            value={formData.telephone_type}
                            onChange={handleChange}
                            select
                            size="small"
                            sx={{ minWidth: 120 }}
                        >
                            <MenuItem value="fixed">Fijo</MenuItem>
                            <MenuItem value="whatsapp">WhatsApp</MenuItem>
                        </TextField>
                    </Box>

                    <TextField
                        label="Email"
                        name="mail"
                        value={formData.mail}
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
                        label="% Descuento"
                        name="discount_percentage"
                        type="number"
                        value={formData.discount_percentage || ''}
                        onChange={handleChange}
                        fullWidth
                        size="small"
                        placeholder="Ej: 15"
                    />

                    <TextField
                        label="Orden"
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
