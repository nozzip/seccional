import React, { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    alpha,
    useTheme,
    Tooltip,
    TextField,
    MenuItem,
    Grid,
    Divider,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import AddBoxIcon from '@mui/icons-material/AddBox';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import HouseSidingIcon from '@mui/icons-material/HouseSiding';
import { supabase } from '../../supabaseClient';

interface Request {
    id: number;
    type: string;
    status: string;
    requester_info: any;
    data: any;
    created_at: string;
    internal_notes: string;
    performer_notes: string;
}

const REQUEST_TYPES = [
    { value: 'task', label: 'Tarea / Para Hacer', icon: <TaskAltIcon /> },
    { value: 'budget_review', label: 'Revisar Presupuesto', icon: <AssignmentIcon /> },
    { value: 'internal_order', label: 'Orden Interna', icon: <AssignmentIcon /> },
    { value: 'cabin_reservation', label: 'Inquietud de Reserva', icon: <HouseSidingIcon /> },
    { value: 'affiliation', label: 'Afiliación', icon: <PeopleIcon /> },
    { value: 'tourism', label: 'Turismo', icon: <BeachAccessIcon /> },
    { value: 'benefit', label: 'Beneficio / Kit', icon: <TaskAltIcon /> },
];

export default function RequestManager() {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [executingNotes, setExecutingNotes] = useState('');
    const theme = useTheme();

    const [newRequest, setNewRequest] = useState({
        type: 'task',
        title: '',
        description: '',
        priority: 'media',
    });

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('workflow_requests')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error) setRequests(data || []);
        setLoading(false);
    };

    const handleUpdateStatus = async (id: number, newStatus: string, notes?: string) => {
        const updateData: any = { status: newStatus };
        if (notes) updateData.performer_notes = notes;

        const { error } = await supabase
            .from('workflow_requests')
            .update(updateData)
            .eq('id', id);

        if (!error) {
            setRequests(requests.map(r => r.id === id ? { ...r, ...updateData } : r));
            setDetailOpen(false);
            setExecutingNotes('');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Está seguro de eliminar este pedido permanentemente?')) return;
        
        const { error } = await supabase
            .from('workflow_requests')
            .delete()
            .eq('id', id);

        if (!error) {
            setRequests(requests.filter(r => r.id !== id));
        }
    };

    const handleCreateInternal = async () => {
        if (!newRequest.title) return;

        const { error } = await supabase
            .from('workflow_requests')
            .insert({
                type: newRequest.type,
                status: 'pending',
                requester_info: { nombre: 'Administración (Interno)' },
                data: {
                    title: newRequest.title,
                    description: newRequest.description,
                    priority: newRequest.priority
                }
            });

        if (!error) {
            setCreateOpen(false);
            setNewRequest({ type: 'task', title: '', description: '', priority: 'media' });
            fetchRequests();
        }
    };

    const getTypeDisplay = (type: string) => {
        const found = REQUEST_TYPES.find(r => r.value === type);
        return {
            label: found?.label || type,
            icon: found?.icon || <AssignmentIcon />
        };
    };

    const getStatusChip = (status: string) => {
        switch (status) {
            case 'pending': return <Chip label="Pendiente" size="small" sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.main', fontWeight: 700 }} />;
            case 'done': return <Chip label="Realizado" size="small" sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main', fontWeight: 700 }} />;
            case 'rejected': return <Chip label="Desestimado" size="small" sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main', fontWeight: 700 }} />;
            default: return <Chip label={status} size="small" />;
        }
    };

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', mb: 1 }}>
                        Bandeja de Pedidos y Tareas
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Control de solicitudes externas y tareas operativas pendientes de realizar.
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" onClick={fetchRequests} disabled={loading}>
                        Actualizar
                    </Button>
                    <Button variant="contained" startIcon={<AddBoxIcon />} onClick={() => setCreateOpen(true)}>
                        Cargar Tarea / Pedido
                    </Button>
                    <Button 
                        variant="outlined" 
                        color="secondary"
                        onClick={async () => {
                            const tests = [
                                { type: 'affiliation', requester: 'Test Afiliación', data: { worker: { nombre: 'Juan', apellido: 'Prueba', cuil: '20-12345678-9', dependencia: 'AFIP Salta' }, family: [] } },
                                { type: 'tourism', requester: 'Test Turismo', data: { destino: 'Bariloche', fecha_ingreso: '2026-06-01', fecha_salida: '2026-06-08', plazas_req: 2 } },
                                { type: 'benefit', requester: 'Test Kit', data: { benefit_type: 'Kit Escolar', observations: 'Prueba de kit para 2 niños' } },
                                { type: 'cabin_reservation', requester: 'Test Mollar', data: { destino: 'El Mollar', fecha_ingreso: '2026-05-15', fecha_salida: '2026-05-20' } }
                            ];
                            for (const test of tests) {
                                await supabase.from('workflow_requests').insert({
                                    type: test.type,
                                    status: 'pending',
                                    requester_info: { nombre: test.requester },
                                    data: test.data
                                });
                            }
                            fetchRequests();
                        }}
                    >
                        Generar Test de Prueba
                    </Button>
                </Box>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                            <TableCell sx={{ fontWeight: 800 }}>Tipo de Pedido</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Descripción / Asunto</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Fecha</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Estado</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 800 }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {requests.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                                    <Typography color="text.secondary">No hay pedidos ni tareas pendientes.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                        {requests.map((request) => {
                            const { label, icon } = getTypeDisplay(request.type);
                            let asunto = request.data?.title || '';
                            if (request.type === 'affiliation') asunto = 'Solicitud de Nueva Afiliación';
                            if (request.type === 'tourism') asunto = `Turismo: ${request.data?.destino || 'Solicitud'}`;
                            if (request.type === 'benefit') asunto = `Beneficio: ${request.data?.benefit_type || 'Pedido'}`;
                            if (request.type === 'cabin_reservation') {
                                asunto = `Reserva El Mollar: ${request.data?.destino || 'Cabaña'}`;
                            }
                            return (
                                <TableRow key={request.id} hover sx={{ opacity: request.status === 'done' ? 0.7 : 1 }}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            {icon}
                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                {label}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{asunto}</Typography>
                                        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', maxWidth: 300 }}>
                                            {request.data?.description || request.requester_info?.nombre || ''}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{new Date(request.created_at).toLocaleDateString('es-AR')}</TableCell>
                                    <TableCell>{getStatusChip(request.status)}</TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Ver y Gestionar">
                                            <IconButton size="small" onClick={() => { setSelectedRequest(request); setDetailOpen(true); }}>
                                                <VisibilityIcon />
                                            </IconButton>
                                        </Tooltip>
                                        {request.status === 'pending' && (
                                            <Tooltip title="Marcar como Realizado">
                                                <IconButton size="small" color="success" onClick={() => { setSelectedRequest(request); setDetailOpen(true); }}>
                                                    <CheckCircleOutlineIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        <Tooltip title="Borrar Pedido">
                                            <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDelete(request.id); }}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal de Detalle y Ejecución */}
            <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {selectedRequest && getTypeDisplay(selectedRequest.type).label} #{selectedRequest?.id}
                    <Box>{selectedRequest && getStatusChip(selectedRequest.status)}</Box>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedRequest && (
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
                                    {selectedRequest.data?.title || getTypeDisplay(selectedRequest.type).label}
                                </Typography>
                                
                                {selectedRequest.type === 'affiliation' && (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Datos del Trabajador:</Typography>
                                        <Typography variant="body2">CUIL: {selectedRequest.data?.worker?.cuil}</Typography>
                                        <Typography variant="body2">Dependencia: {selectedRequest.data?.worker?.dependencia}</Typography>
                                        <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 700 }}>Grupo Familiar ({selectedRequest.data?.family?.length || 0}):</Typography>
                                        {selectedRequest.data?.family?.map((f: any, i: number) => (
                                            <Typography key={i} variant="caption" sx={{ display: 'block' }}>- {f.nombre} {f.apellido} ({f.parentesco})</Typography>
                                        ))}
                                    </Box>
                                )}

                                {selectedRequest.type === 'tourism' && (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2"><strong>Destino:</strong> {selectedRequest.data?.destino}</Typography>
                                        <Typography variant="body2"><strong>Fechas:</strong> {selectedRequest.data?.fecha_ingreso} al {selectedRequest.data?.fecha_salida}</Typography>
                                        <Typography variant="body2"><strong>Plazas:</strong> {selectedRequest.data?.plazas_req}</Typography>
                                        {selectedRequest.data?.is_subsidized && <Chip label="SUBSIDIADO" color="secondary" size="small" sx={{ mt: 1, fontWeight: 800 }} />}
                                        {selectedRequest.data?.attachment_url && (
                                            <Button variant="outlined" size="small" href={selectedRequest.data.attachment_url} target="_blank" sx={{ mt: 1, display: 'block' }}>Ver Adjunto</Button>
                                        )}
                                    </Box>
                                )}

                                {selectedRequest.type === 'benefit' && (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2"><strong>Tipo de Beneficio:</strong> {selectedRequest.data?.benefit_type}</Typography>
                                        <Typography variant="body2" sx={{ mt: 1 }}><strong>Observaciones:</strong> {selectedRequest.data?.observations || 'Sin observaciones'}</Typography>
                                        {selectedRequest.data?.attachment_url && (
                                            <Button variant="outlined" size="small" href={selectedRequest.data.attachment_url} target="_blank" sx={{ mt: 1, display: 'block' }}>Ver Documentación</Button>
                                        )}
                                    </Box>
                                )}

                                {selectedRequest.type === 'cabin_reservation' && (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2"><strong>Destino:</strong> {selectedRequest.data?.destino}</Typography>
                                        <Typography variant="body2"><strong>Ingreso:</strong> {selectedRequest.data?.fecha_ingreso}</Typography>
                                        <Typography variant="body2"><strong>Salida:</strong> {selectedRequest.data?.fecha_salida}</Typography>
                                    </Box>
                                )}

                                {!['affiliation', 'tourism', 'benefit', 'cabin_reservation'].includes(selectedRequest.type) && (
                                    <Typography variant="body1" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                                        {selectedRequest.data?.description || 'Sin descripción detallada.'}
                                    </Typography>
                                )}
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 900 }}>Solicitante</Typography>
                                <Typography variant="body2"><strong>{selectedRequest.requester_info?.nombre}</strong></Typography>
                                {selectedRequest.requester_info?.legajo && <Typography variant="body2">Legajo: {selectedRequest.requester_info.legajo}</Typography>}
                            </Grid>

                            <Grid item xs={12}>
                                <Divider sx={{ my: 1 }} />
                            </Grid>

                            {selectedRequest.status === 'pending' ? (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 800 }}>Completar este pedido / tarea</Typography>
                                    <TextField
                                        label="Observaciones de ejecución (Opcional)"
                                        multiline
                                        rows={3}
                                        fullWidth
                                        placeholder="Ej: Ya se contactó al afiliado, se autorizó el gasto, etc."
                                        value={executingNotes}
                                        onChange={(e) => setExecutingNotes(e.target.value)}
                                        sx={{ bgcolor: alpha(theme.palette.success.main, 0.02) }}
                                    />
                                </Grid>
                            ) : (
                                <Grid item xs={12}>
                                    <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: 2 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'success.main' }}>Nota de Realización:</Typography>
                                        <Typography variant="body1">{selectedRequest.performer_notes || 'Sin observaciones al finalizar.'}</Typography>
                                    </Paper>
                                </Grid>
                            )}
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2.5, gap: 1 }}>
                    <Button onClick={() => setDetailOpen(false)} color="inherit">Cerrar</Button>
                    {selectedRequest?.status === 'pending' && (
                        <>
                            <Button variant="outlined" color="error" onClick={() => handleUpdateStatus(selectedRequest.id, 'rejected')}>Desestimar</Button>
                            <Button variant="contained" color="success" onClick={() => handleUpdateStatus(selectedRequest.id, 'done', executingNotes)}>Marcar como Realizado</Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>

            {/* Modal de Creación Interna */}
            <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 800 }}>Cargar Nuevo Pedido / Tarea</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2.5} sx={{ pt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                select
                                label="Tipo de Pedido"
                                fullWidth
                                value={newRequest.type}
                                onChange={(e) => setNewRequest({ ...newRequest, type: e.target.value })}
                            >
                                {REQUEST_TYPES.filter(t => !['affiliation', 'tourism'].includes(t.value)).map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {option.icon} {option.label}
                                        </Box>
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Asunto / Título"
                                fullWidth
                                value={newRequest.title}
                                onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                                placeholder="Ej: Revisar presupuesto de computación"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Instrucciones o Detalles"
                                multiline
                                rows={4}
                                fullWidth
                                value={newRequest.description}
                                onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                                placeholder="Describa qué es lo que hay que hacer..."
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                select
                                label="Prioridad"
                                fullWidth
                                value={newRequest.priority}
                                onChange={(e) => setNewRequest({ ...newRequest, priority: e.target.value })}
                            >
                                <MenuItem value="baja">Baja</MenuItem>
                                <MenuItem value="media">Media</MenuItem>
                                <MenuItem value="alta">Alta</MenuItem>
                                <MenuItem value="urgente">Urgente</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setCreateOpen(false)} color="inherit">Cancelar</Button>
                    <Button variant="contained" onClick={handleCreateInternal} disabled={!newRequest.title}>Cargar Pedido</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
