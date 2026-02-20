import React, { useState } from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    TextField,
    Button,
    Stack,
    alpha,
    useTheme,
    Tooltip,
    InputAdornment
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

interface InventoryItem {
    id: number;
    name: string;
    category: string;
    initialStock: number;
    entries: number;
    exits: number;
}

const initialItems: InventoryItem[] = [
    { id: 1, name: 'Coca Cola 500ml', category: 'Bebidas', initialStock: 20, entries: 0, exits: 0 },
    { id: 2, name: 'Agua Mineral 500ml', category: 'Bebidas', initialStock: 15, entries: 5, exits: 2 },
    { id: 3, name: 'Alfafor (Variedad)', category: 'Snacks', initialStock: 10, entries: 0, exits: 3 },
    { id: 4, name: 'Papas Fritas', category: 'Snacks', initialStock: 12, entries: 0, exits: 0 },
];

export default function InventoryManager() {
    const [items, setItems] = useState<InventoryItem[]>(initialItems);
    const theme = useTheme();

    const handleUpdate = (id: number, field: 'entries' | 'exits', delta: number) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, [field]: Math.max(0, item[field] + delta) } : item
        ));
    };

    const calculateFinal = (item: InventoryItem) => {
        return item.initialStock + item.entries - item.exits;
    };

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>
                        Control de Inventario Diario
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Gestión de stock: Inicial + Entradas - Salidas = Final
                    </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                    <Button variant="outlined" startIcon={<RestartAltIcon />} color="warning">Reiniciar Día</Button>
                    <Button variant="contained" startIcon={<SaveIcon />}>Guardar Jornada</Button>
                </Stack>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                <Table>
                    <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Producto</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Categoría</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.info.main, 0.05) }}>Inicial</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.success.main, 0.05) }}>Entradas</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.error.main, 0.05) }}>Salidas (Ventas)</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>STOCK FINAL</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items.map((item) => {
                            const finalStock = calculateFinal(item);
                            return (
                                <TableRow key={item.id} hover>
                                    <TableCell sx={{ fontWeight: 700 }}>{item.name}</TableCell>
                                    <TableCell>{item.category}</TableCell>
                                    <TableCell align="center">
                                        <Typography sx={{ fontWeight: 600 }}>{item.initialStock}</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                                            <IconButton size="small" onClick={() => handleUpdate(item.id, 'entries', -1)} color="error">
                                                <RemoveCircleIcon fontSize="small" />
                                            </IconButton>
                                            <Typography sx={{ minWidth: 20, fontWeight: 700 }}>{item.entries}</Typography>
                                            <IconButton size="small" onClick={() => handleUpdate(item.id, 'entries', 1)} color="success">
                                                <AddCircleIcon fontSize="small" />
                                            </IconButton>
                                        </Stack>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                                            <IconButton size="small" onClick={() => handleUpdate(item.id, 'exits', -1)} color="error">
                                                <RemoveCircleIcon fontSize="small" />
                                            </IconButton>
                                            <Typography sx={{ minWidth: 20, fontWeight: 700 }}>{item.exits}</Typography>
                                            <IconButton size="small" onClick={() => handleUpdate(item.id, 'exits', 1)} color="success">
                                                <AddCircleIcon fontSize="small" />
                                            </IconButton>
                                        </Stack>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box
                                            sx={{
                                                display: 'inline-block',
                                                px: 2,
                                                py: 0.5,
                                                borderRadius: 2,
                                                fontWeight: 800,
                                                bgcolor: finalStock < 5 ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.primary.main, 0.1),
                                                color: finalStock < 5 ? 'error.main' : 'primary.main',
                                            }}
                                        >
                                            {finalStock}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
