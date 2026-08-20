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
    IconButton,
    Alert,
    CircularProgress,
    alpha,
    useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { supabase } from '../../supabaseClient';
import { AffiliateData } from '../../types/mobile';

interface GremialFormProps {
    open: boolean;
    onClose: () => void;
    affiliateData: AffiliateData | null;
    type: string;
}

export default function GremialForm({ open, onClose, affiliateData, type }: GremialFormProps) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const theme = useTheme();

    const [formData, setFormData] = useState({
        telefono: '',
        mail: '',
        observaciones: '',
    });

    React.useEffect(() => {
        if (open) {
            setFormData({
                telefono: localStorage.getItem('mobile_app_telefono') || '',
                mail: localStorage.getItem('mobile_app_email') || '',
                observaciones: '',
            });
            setFile(null);
            setSuccess(false);
            setError('');
        }
    }, [open]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!affiliateData) return;

        if (!formData.telefono || !formData.mail) {
            setError('Por favor, complete su teléfono y email');
            return;
        }

        if (type.includes('Kit Nacimiento') && !file) {
            setError('Debe adjuntar el certificado de fecha probable de parto o partida de nacimiento');
            return;
        }

        setLoading(true);
        setError('');

        try {
            let fileUrl = '';

            // 1. Upload file if exists
            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}_${affiliateData.legajo.replace(/\//g, '_')}.${fileExt}`;
                
                // Sanitize folder name: remove accents, slashes and special chars
                const sanitizedType = type
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
                
                fileUrl = publicUrl;
            }

            // 2. Fetch affiliate internal ID
            const { data: affData } = await supabase
                .from('affiliates')
                .select('id')
                .eq('legajo', affiliateData.legajo)
                .single();

            // 3. Create request
            const { error: insertError } = await supabase
                .from('workflow_requests')
                .insert({
                    type: 'benefit',
                    status: 'pending',
                    requester_info: {
                        nombre: `${affiliateData.nombre} ${affiliateData.apellido}`,
                        cuil: affiliateData.cuil,
                        legajo: affiliateData.legajo,
                        email: formData.mail,
                        telefono: formData.telefono
                    },
                    data: {
                        title: `Beneficio / Subsidio: ${type}`,
                        summary: `Solicitud de subsidio por ${type}`,
                        benefit_type: type,
                        observations: formData.observaciones,
                        attachment_url: fileUrl
                    }
                });

            if (insertError) throw insertError;

            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 2500);

        } catch (err: any) {
            console.error('Error submitting gremial request:', err);
            setError('Ha ocurrido un error al enviar la solicitud. Intente más tarde.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Solicitud: {type}
                <IconButton onClick={onClose} size="small" sx={{ ml: 'auto' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                {success ? (
                    <Alert severity="success" sx={{ borderRadius: 2 }}>
                        Solicitud enviada correctamente. Verificaremos la documentación y te contactaremos.
                    </Alert>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
                        <TextField
                            label="Teléfono de contacto"
                            value={formData.telefono}
                            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                            fullWidth
                            size="small"
                            required
                        />
                        <TextField
                            label="Email"
                            value={formData.mail}
                            onChange={(e) => setFormData({ ...formData, mail: e.target.value })}
                            fullWidth
                            size="small"
                            required
                        />
                        
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                                Documentación requerida
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                                {type.includes('Nacimiento') 
                                    ? 'Adjuntar certificado de Fecha Probable de Parto o Partida de Nacimiento.' 
                                    : 'Adjuntar certificado de Alumno Regular o documentación respaldatoria.'}
                            </Typography>
                            
                            <Button
                                component="label"
                                variant="outlined"
                                startIcon={file ? <AttachFileIcon /> : <CloudUploadIcon />}
                                fullWidth
                                sx={{ 
                                    height: 56, 
                                    borderRadius: 2,
                                    borderStyle: 'dashed',
                                    bgcolor: file ? alpha(theme.palette.success.main, 0.05) : 'transparent',
                                    borderColor: file ? 'success.main' : 'divider',
                                }}
                            >
                                {file ? file.name : 'Subir Documento (PDF/JPG)'}
                                <input
                                    type="file"
                                    hidden
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleFileChange}
                                />
                            </Button>
                        </Box>

                        <TextField
                            label="Observaciones adicionales"
                            value={formData.observaciones}
                            onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                            fullWidth
                            multiline
                            rows={2}
                            size="small"
                        />

                        {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
                    </Box>
                )}
            </DialogContent>
            {!success && (
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={onClose} color="inherit">Cancelar</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {loading ? 'Enviando...' : 'Enviar Solicitud'}
                    </Button>
                </DialogActions>
            )}
        </Dialog>
    );
}
