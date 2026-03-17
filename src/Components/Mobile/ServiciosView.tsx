import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Alert,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction,
    alpha,
    useTheme,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import HomeIcon from '@mui/icons-material/Home';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { supabase } from '../../supabaseClient';

interface AffiliateData {
    legajo: string;
    nombre: string;
    apellido: string;
    cuil?: string;
}

interface DebtRecord {
    id: number;
    nombre_apellido: string;
    cuil_dni: string | null;
    importe: string | null;
    mes: string | null;
    created_at?: string;
}

interface ServiciosViewProps {
    affiliateData: AffiliateData | null;
}

export default function ServiciosView({ affiliateData }: ServiciosViewProps) {
    const [debts, setDebts] = useState<DebtRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const theme = useTheme();

    useEffect(() => {
        if (affiliateData?.cuil) {
            fetchDebts();
        } else {
            setLoading(false);
            setError('No hay datos de CUIL disponibles para este afiliado.');
        }
    }, [affiliateData]);

    const fetchDebts = async () => {
        if (!affiliateData?.cuil) return;
        
        setLoading(true);
        setError('');

        try {
            const { data, error: dbError } = await supabase
                .from('affiliate_debts')
                .select('*')
                .or(`cuil_dni.eq.${affiliateData.cuil},nombre_apellido.ilike.%${affiliateData.apellido}%`)
                .order('created_at', { ascending: false });

            if (dbError) {
                if (dbError.code === '42P01') {
                    setError('La tabla de servicios aún no está configurada. Contacte al administrador.');
                    setDebts([]);
                } else {
                    throw dbError;
                }
            } else {
                setDebts(data || []);
            }
        } catch (err: any) {
            console.error('Error fetching debts:', err);
            setError('Error al cargar los servicios. Intente más tarde.');
        } finally {
            setLoading(false);
        }
    };

    const getServiceIcon = (mes: string | null, importe: string | null) => {
        const mesLower = (mes || '').toLowerCase();
        const importeLower = (importe || '').toLowerCase();
        
        if (mesLower.includes('claro') || importeLower.includes('claro')) {
            return <PhoneAndroidIcon sx={{ color: '#d32f2f' }} />;
        }
        if (mesLower.includes('asispre') || importeLower.includes('asispre') || mesLower.includes('asistencia')) {
            return <HomeIcon sx={{ color: '#1976d2' }} />;
        }
        return <ReceiptIcon sx={{ color: theme.palette.primary.main }} />;
    };

    const isPaid = (importe: string | null) => {
        if (!importe) return true;
        const lower = importe.toLowerCase();
        return lower.includes('pagado') || lower.includes('no registra') || lower.includes('sin deuda');
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    const groupedDebts = debts.reduce((acc, debt) => {
        const serviceName = debt.mes || 'Otros servicios';
        if (!acc[serviceName]) {
            acc[serviceName] = [];
        }
        acc[serviceName].push(debt);
        return acc;
    }, {} as Record<string, DebtRecord[]>);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, color: 'primary.main', textAlign: 'center' }}>
                TUS SERVICIOS
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                Estado de pagos de servicios a favor del gremio
            </Typography>

            {error && (
                <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                </Alert>
            )}

            {!loading && debts.length === 0 && !error && (
                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
                    <ReceiptIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        Sin registros
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        No se encontraron servicios registrados a tu nombre.
                    </Typography>
                </Paper>
            )}

            {Object.entries(groupedDebts).map(([serviceName, records]) => (
                <Paper
                    key={serviceName}
                    sx={{
                        mb: 3,
                        borderRadius: 3,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Box
                        sx={{
                            p: 2,
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                        }}
                    >
                        {getServiceIcon(serviceName, records[0]?.importe || null)}
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main' }}>
                            {serviceName}
                        </Typography>
                        <Chip
                            label={`${records.length} registro${records.length > 1 ? 's' : ''}`}
                            size="small"
                            sx={{ ml: 'auto', fontWeight: 600 }}
                        />
                    </Box>

                    <List disablePadding>
                        {records.map((record, index) => {
                            const paid = isPaid(record.importe);
                            return (
                                <React.Fragment key={record.id}>
                                    <ListItem sx={{ py: 1.5 }}>
                                        <ListItemIcon>
                                            {paid ? (
                                                <CheckCircleIcon sx={{ color: 'success.main' }} />
                                            ) : (
                                                <WarningIcon sx={{ color: 'error.main' }} />
                                            )}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                    {record.importe || 'Sin información'}
                                                </Typography>
                                            }
                                            secondary={
                                                record.created_at ? (
                                                    <Typography variant="caption" color="text.secondary">
                                                        Actualizado: {formatDate(record.created_at)}
                                                    </Typography>
                                                ) : null
                                            }
                                        />
                                        <ListItemSecondaryAction>
                                            <Chip
                                                label={paid ? 'Pagado' : 'Pendiente'}
                                                color={paid ? 'success' : 'error'}
                                                size="small"
                                                variant={paid ? 'filled' : 'outlined'}
                                                sx={{ fontWeight: 700 }}
                                            />
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    {index < records.length - 1 && <Divider component="li" />}
                                </React.Fragment>
                            );
                        })}
                    </List>
                </Paper>
            ))}

            <Paper sx={{ p: 2.5, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.08) }}>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                    Los pagos registrados son gestionados por el gremio. Para consultas, acercate a la seccional.
                </Typography>
            </Paper>
        </Box>
    );
}
