import React, { useState } from "react";
import {
    Box,
    Typography,
    Grid,
    Paper,
    TextField,
    Button,
    Stack,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    alpha,
    useTheme,
    InputAdornment,
    Divider,
    Dialog,
    Chip,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import PoolIcon from "@mui/icons-material/Pool";
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket";

interface ProductPrice {
    id: number;
    name: string;
    price: number;
}

interface SwimmingPrices {
    conProfesor: {
        [key: string]: { total: number; club: number; prof: number };
    };
    libre: {
        [key: string]: number;
    };
    porClase: { total: number; club: number; prof: number };
    porDiaLibre: number;
    matronatacion: { total: number; club: number; prof: number };
    plantel: { total: number; club: number; prof: number };
    [key: string]: any;
}

interface Promotion {
    id: number;
    name: string;
    description: string;
    price: number;
    active: boolean;
    startDate?: string;
    endDate?: string;
}

export default function PriceManager() {
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState(0);

    // Precios globales de productos para sincronizar con Inventario
    const [productsPrices, setProductsPrices] = useState<ProductPrice[]>(() => {
        const saved = localStorage.getItem("seccional_products_prices");
        return saved ? JSON.parse(saved) : [
            { id: 1, name: "Agua chica", price: 1000 },
            { id: 2, name: "Agua grande", price: 2000 },
            { id: 3, name: "Aquarius 1500cc", price: 3000 },
            { id: 4, name: "Aquarius 500cc", price: 2000 },
            { id: 5, name: "Coca Cola 1500cc", price: 3000 },
            { id: 6, name: "Coca Coca 500cc", price: 2000 },
            { id: 7, name: "Powerade 500cc", price: 3000 },
            { id: 8, name: "Monster", price: 4000 },
            { id: 9, name: "Heineken", price: 8000 },
            { id: 10, name: "Cereales", price: 3000 },
            { id: 11, name: "Papas fritas 20grs", price: 2000 },
            { id: 12, name: "Papas fritas 40grs", price: 3000 },
            { id: 13, name: "Manies-Palitos-Chizitos", price: 3000 },
            { id: 14, name: "Barra cereal", price: 2000 },
        ];
    });

    // --- NUEVOS ESTADOS COMPARTIDOS PARA INTEGRACIÓN NATACIÓN/FINANZAS ---

    // Precios de Natación (Extraídos de PriceManager e inicializados aquí)
    const [swimmingPrices, setSwimmingPrices] = useState<SwimmingPrices>(() => {
        const saved = localStorage.getItem("seccional_swimming_prices");
        return saved ? JSON.parse(saved) : {
            conProfesor: {
                v2: { total: 70000, club: 50000, prof: 20000 },
                v3: { total: 80000, club: 53000, prof: 27000 },
                v5: { total: 94000, club: 60000, prof: 34000 },
            },
            libre: {
                v2: 63000,
                v3: 70000,
                v5: 86000,
            },
            porClase: { total: 15000, club: 10000, prof: 5000 },
            porDiaLibre: 12000,
            matronatacion: { total: 48000, club: 30000, prof: 18000 },
            plantel: { total: 63000, club: 42000, prof: 21000 },
        };
    });

    const [promotions, setPromotions] = useState<Promotion[]>(() => {
        const saved = localStorage.getItem("seccional_promotions");
        return saved ? JSON.parse(saved) : [
            { id: 1, name: "Combo Pileta + Gym", description: "Acceso libre a ambas instalaciones", price: 120000, active: true },
            { id: 2, name: "Promo 2x1 Bebidas", description: "Solo días de semana", price: 3000, active: false },
        ];
    });

    const [massAdjustment, setMassAdjustment] = useState({ percent: 10, roundTo: 100 });
    const [openPromoDialog, setOpenPromoDialog] = useState(false);
    const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);

    React.useEffect(() => {
        localStorage.setItem("seccional_products_prices", JSON.stringify(productsPrices));
        window.dispatchEvent(new Event('prices_updated'));
    }, [productsPrices]);

    React.useEffect(() => {
        localStorage.setItem("seccional_swimming_prices", JSON.stringify(swimmingPrices));
        window.dispatchEvent(new Event('prices_updated'));
    }, [swimmingPrices]);

    React.useEffect(() => {
        localStorage.setItem("seccional_promotions", JSON.stringify(promotions));
        window.dispatchEvent(new Event('promotions_updated'));
    }, [promotions]);

    const applyMassAdjustmentToProducts = () => {
        const factor = 1 + massAdjustment.percent / 100;
        setProductsPrices(prev => prev.map(p => ({
            ...p,
            price: Math.round((p.price * factor) / massAdjustment.roundTo) * massAdjustment.roundTo
        })));
    };

    const applyMassAdjustmentToSwimming = () => {
        const factor = 1 + massAdjustment.percent / 100;
        const adjust = (val: number) => Math.round((val * factor) / massAdjustment.roundTo) * massAdjustment.roundTo;

        const newPrices = { ...swimmingPrices };

        // Helper recursive to adjust all numbers
        const process = (obj: any) => {
            for (const key in obj) {
                if (typeof obj[key] === 'number') {
                    obj[key] = adjust(obj[key]);
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    process(obj[key]);
                }
            }
        };

        process(newPrices);
        setSwimmingPrices(newPrices);
    };

    const handleSavePromo = (promoData: Partial<Promotion>) => {
        if (editingPromo) {
            setPromotions(prev => prev.map(p => p.id === editingPromo.id ? { ...p, ...promoData } as Promotion : p));
        } else {
            setPromotions(prev => [...prev, {
                id: Date.now(),
                name: promoData.name || "",
                description: promoData.description || "",
                price: promoData.price || 0,
                active: true,
                startDate: promoData.startDate,
                endDate: promoData.endDate,
            } as Promotion]);
        }
        setOpenPromoDialog(false);
        setEditingPromo(null);
    };

    const handleProductPriceChange = (id: number, newPrice: string) => {
        setProductsPrices(
            (prev) => prev.map((p) =>
                p.id === id ? { ...p, price: parseInt(newPrice) || 0 } : p,
            ),
        );
    };

    const handleSwimmingPriceChange = (path: string[], value: string) => {
        const val = parseInt(value) || 0;
        const newPrices = { ...swimmingPrices };
        let current: any = newPrices;
        for (let i = 0; i < path.length - 1; i++) {
            current = current[path[i]];
        }
        current[path[path.length - 1]] = val;
        setSwimmingPrices(newPrices);
    };

    return (
        <Box>
            <Box
                sx={{
                    mb: 4,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <Box>
                    <Typography
                        variant="h5"
                        sx={{ fontWeight: 800, color: "primary.main" }}
                    >
                        Gestor de Precios
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Configuración centralizada de aranceles y productos
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    sx={{ borderRadius: 2, fontWeight: 700 }}
                >
                    Guardar Cambios Globales
                </Button>
            </Box>

            <Tabs
                value={activeTab}
                onChange={(_, v) => setActiveTab(v)}
                sx={{
                    mb: 4,
                    borderBottom: 1,
                    borderColor: "divider",
                    "& .MuiTab-root": { fontWeight: 700 },
                }}
            >
                <Tab icon={<PoolIcon />} label="Natación" iconPosition="start" />
                <Tab
                    icon={<ShoppingBasketIcon />}
                    label="Snacks y Bebidas"
                    iconPosition="start"
                />
                <Tab icon={<SaveIcon />} label="Promociones" iconPosition="start" />
            </Tabs>

            {(activeTab === 0 || activeTab === 1) && (
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        mb: 3,
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.warning.main, 0.05),
                        border: "1px solid",
                        borderColor: alpha(theme.palette.warning.main, 0.2),
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                        flexWrap: "wrap"
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                            AJUSTE MASIVO (%)
                        </Typography>
                        <TextField
                            type="number"
                            size="small"
                            value={massAdjustment.percent}
                            onChange={(e) => setMassAdjustment({ ...massAdjustment, percent: parseInt(e.target.value) || 0 })}
                            sx={{ width: 80 }}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                sx: { fontWeight: 800 }
                            }}
                        />
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                            REDONDEAR A:
                        </Typography>
                        <TextField
                            select
                            size="small"
                            value={massAdjustment.roundTo}
                            onChange={(e) => setMassAdjustment({ ...massAdjustment, roundTo: parseInt(e.target.value) || 1 })}
                            SelectProps={{ native: true }}
                            sx={{ width: 100 }}
                        >
                            <option value={1}>Sin Redondeo</option>
                            <option value={10}>10</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            <option value={500}>500</option>
                        </TextField>
                    </Box>

                    <Button
                        variant="contained"
                        color="warning"
                        onClick={activeTab === 0 ? applyMassAdjustmentToSwimming : applyMassAdjustmentToProducts}
                        sx={{ fontWeight: 800, borderRadius: 2 }}
                    >
                        APLICAR A TODA LA SECCIÓN
                    </Button>

                    <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 300 }}>
                        Esto modificará todos los precios de esta pestaña según el porcentaje indicado y aplicará el redondeo.
                    </Typography>
                </Paper>
            )}

            {activeTab === 0 && (
                <Grid container spacing={4}>
                    <Grid item xs={12} lg={6}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                border: "1px solid",
                                borderColor: "divider",
                            }}
                        >
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 800 }}>
                                Con Profesor (Mensual)
                            </Typography>
                            <Stack spacing={3}>
                                {Object.entries(swimmingPrices.conProfesor).map(
                                    ([freq, data]: [string, any]) => (
                                        <Box key={freq}>
                                            <Typography
                                                variant="subtitle2"
                                                sx={{ fontWeight: 700, mb: 1, color: "text.secondary" }}
                                            >
                                                {freq === "v2"
                                                    ? "2 veces por semana"
                                                    : freq === "v3"
                                                        ? "3 veces por semana"
                                                        : "5 veces por semana"}
                                            </Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={4}>
                                                    <TextField
                                                        label="Total"
                                                        size="small"
                                                        fullWidth
                                                        value={data.total}
                                                        onChange={(e) =>
                                                            handleSwimmingPriceChange(
                                                                ["conProfesor", freq, "total"],
                                                                e.target.value,
                                                            )
                                                        }
                                                        InputProps={{
                                                            startAdornment: (
                                                                <InputAdornment position="start">
                                                                    $
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <TextField
                                                        label="Club"
                                                        size="small"
                                                        fullWidth
                                                        value={data.club}
                                                        onChange={(e) =>
                                                            handleSwimmingPriceChange(
                                                                ["conProfesor", freq, "club"],
                                                                e.target.value,
                                                            )
                                                        }
                                                        InputProps={{
                                                            startAdornment: (
                                                                <InputAdornment position="start">
                                                                    $
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <TextField
                                                        label="Profesor"
                                                        size="small"
                                                        fullWidth
                                                        value={data.prof}
                                                        onChange={(e) =>
                                                            handleSwimmingPriceChange(
                                                                ["conProfesor", freq, "prof"],
                                                                e.target.value,
                                                            )
                                                        }
                                                        InputProps={{
                                                            startAdornment: (
                                                                <InputAdornment position="start">
                                                                    $
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    ),
                                )}
                            </Stack>
                        </Paper>

                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                mt: 3,
                                borderRadius: 3,
                                border: "1px solid",
                                borderColor: "divider",
                            }}
                        >
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 800 }}>
                                Otras Categorías
                            </Typography>
                            <Stack spacing={3}>
                                {[
                                    { key: "matronatacion", label: "Matronatación" },
                                    { key: "plantel", label: "Plantel" },
                                    { key: "porClase", label: "Clase Suelta" },
                                ].map((item) => (
                                    <Box key={item.key}>
                                        <Typography
                                            variant="subtitle2"
                                            sx={{ fontWeight: 700, mb: 1, color: "text.secondary" }}
                                        >
                                            {item.label}
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={4}>
                                                <TextField
                                                    label="Total"
                                                    size="small"
                                                    fullWidth
                                                    value={(swimmingPrices as any)[item.key].total}
                                                    onChange={(e) =>
                                                        handleSwimmingPriceChange(
                                                            [item.key, "total"],
                                                            e.target.value,
                                                        )
                                                    }
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                $
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={4}>
                                                <TextField
                                                    label="Club"
                                                    size="small"
                                                    fullWidth
                                                    value={(swimmingPrices as any)[item.key].club}
                                                    onChange={(e) =>
                                                        handleSwimmingPriceChange(
                                                            [item.key, "club"],
                                                            e.target.value,
                                                        )
                                                    }
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                $
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={4}>
                                                <TextField
                                                    label="Profesor"
                                                    size="small"
                                                    fullWidth
                                                    value={(swimmingPrices as any)[item.key].prof}
                                                    onChange={(e) =>
                                                        handleSwimmingPriceChange(
                                                            [item.key, "prof"],
                                                            e.target.value,
                                                        )
                                                    }
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                $
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Box>
                                ))}
                            </Stack>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} lg={6}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                border: "1px solid",
                                borderColor: "divider",
                            }}
                        >
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 800 }}>
                                Pileta Libre (Mensual)
                            </Typography>
                            <Stack spacing={3}>
                                {Object.entries(swimmingPrices.libre).map(([freq, price]) => (
                                    <TextField
                                        key={freq}
                                        label={
                                            freq === "v2"
                                                ? "2 veces por semana"
                                                : freq === "v3"
                                                    ? "3 veces por semana"
                                                    : "5 veces por semana"
                                        }
                                        fullWidth
                                        value={price}
                                        onChange={(e) =>
                                            handleSwimmingPriceChange(["libre", freq], e.target.value)
                                        }
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">$</InputAdornment>
                                            ),
                                        }}
                                    />
                                ))}
                                <Divider />
                                <TextField
                                    label="Por Día Libre"
                                    fullWidth
                                    value={swimmingPrices.porDiaLibre}
                                    onChange={(e) =>
                                        handleSwimmingPriceChange(["porDiaLibre"], e.target.value)
                                    }
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">$</InputAdornment>
                                        ),
                                    }}
                                />
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {activeTab === 1 && (
                <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}
                >
                    <Table>
                        <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700 }}>Producto</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>
                                    Precio de Venta
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {productsPrices.map((product) => (
                                <TableRow key={product.id} hover>
                                    <TableCell sx={{ fontWeight: 600 }}>{product.name}</TableCell>
                                    <TableCell align="right">
                                        <TextField
                                            size="small"
                                            type="number"
                                            value={product.price}
                                            onChange={(e) =>
                                                handleProductPriceChange(product.id, e.target.value)
                                            }
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">$</InputAdornment>
                                                ),
                                                sx: { maxWidth: 150, fontWeight: 700 },
                                            }}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {activeTab === 2 && (
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={() => {
                                setEditingPromo(null);
                                setOpenPromoDialog(true);
                            }}
                        >
                            Crear Promoción
                        </Button>
                    </Box>
                    <Grid container spacing={2}>
                        {promotions.map(promo => {
                            const today = new Date().toISOString().split('T')[0];
                            let statusLabel = "Vigente";
                            let statusColor: "success" | "warning" | "error" | "default" = "success";

                            if (promo.startDate && promo.startDate > today) {
                                statusLabel = "Programada";
                                statusColor = "warning";
                            } else if (promo.endDate && promo.endDate < today) {
                                statusLabel = "Vencida";
                                statusColor = "error";
                            }

                            if (!promo.active) {
                                statusLabel = "Inactiva";
                                statusColor = "default";
                            }

                            return (
                                <Grid item xs={12} sm={6} md={4} key={promo.id}>
                                    <Paper variant="outlined" sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <Box>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{promo.name}</Typography>
                                                <Typography variant="body2" color="text.secondary">{promo.description}</Typography>
                                            </Box>
                                            <Typography variant="h6" color="primary" sx={{ fontWeight: 900 }}>${promo.price.toLocaleString()}</Typography>
                                        </Box>
                                        <Box sx={{ mb: 2 }}>
                                            <Chip label={statusLabel} color={statusColor} size="small" sx={{ mb: 1, mr: 1, fontWeight: 700 }} />
                                            {(promo.startDate || promo.endDate) && (
                                                <Typography variant="caption" display="block" color="text.secondary">
                                                    Validez: {promo.startDate ? new Date(promo.startDate).toLocaleDateString() : 'Siempre'} - {promo.endDate ? new Date(promo.endDate).toLocaleDateString() : 'Siempre'}
                                                </Typography>
                                            )}
                                        </Box>
                                        <Box sx={{ flexGrow: 1 }} />
                                        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() => {
                                                    setEditingPromo(promo);
                                                    setOpenPromoDialog(true);
                                                }}
                                            >
                                                Editar
                                            </Button>
                                            <Button
                                                size="small"
                                                color={promo.active ? "error" : "success"}
                                                onClick={() => setPromotions(prev => prev.map(p => p.id === promo.id ? { ...p, active: !p.active } : p))}
                                            >
                                                {promo.active ? "Desactivar" : "Activar"}
                                            </Button>
                                        </Stack>
                                    </Paper>
                                </Grid>
                            )
                        })}
                    </Grid>
                </Box>
            )}

            <Dialog
                open={openPromoDialog}
                onClose={() => setOpenPromoDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <Box sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 800 }}>
                        {editingPromo ? "Editar Promoción" : "Nueva Promoción"}
                    </Typography>
                    <Stack spacing={2}>
                        <TextField
                            label="Nombre de la Promo"
                            fullWidth
                            defaultValue={editingPromo?.name}
                            id="promo-name"
                        />
                        <TextField
                            label="Descripción"
                            fullWidth
                            multiline
                            rows={2}
                            defaultValue={editingPromo?.description}
                            id="promo-desc"
                        />
                        <TextField
                            label="Precio Final de la Promo"
                            type="number"
                            fullWidth
                            defaultValue={editingPromo?.price}
                            id="promo-price"
                            InputProps={{
                                startAdornment: <InputAdornment position="start">$</InputAdornment>
                            }}
                        />
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    label="Fecha de Inicio"
                                    type="date"
                                    fullWidth
                                    defaultValue={editingPromo?.startDate || ''}
                                    id="promo-start"
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Fecha de Fin"
                                    type="date"
                                    fullWidth
                                    defaultValue={editingPromo?.endDate || ''}
                                    id="promo-end"
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                        </Grid>
                        <Button
                            variant="contained"
                            fullWidth
                            sx={{ mt: 2 }}
                            onClick={() => {
                                const name = (document.getElementById('promo-name') as HTMLInputElement).value;
                                const description = (document.getElementById('promo-desc') as HTMLInputElement).value;
                                const price = parseInt((document.getElementById('promo-price') as HTMLInputElement).value) || 0;
                                const startDate = (document.getElementById('promo-start') as HTMLInputElement).value;
                                const endDate = (document.getElementById('promo-end') as HTMLInputElement).value;
                                handleSavePromo({ name, description, price, startDate, endDate });
                            }}
                        >
                            Guardar
                        </Button>
                    </Stack>
                </Box>
            </Dialog>
        </Box>
    );
}
