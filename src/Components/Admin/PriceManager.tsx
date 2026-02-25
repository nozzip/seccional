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

    React.useEffect(() => {
        localStorage.setItem("seccional_products_prices", JSON.stringify(productsPrices));
        window.dispatchEvent(new Event('prices_updated'));
    }, [productsPrices]);

    React.useEffect(() => {
        localStorage.setItem("seccional_swimming_prices", JSON.stringify(swimmingPrices));
        window.dispatchEvent(new Event('prices_updated'));
    }, [swimmingPrices]);

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
            </Tabs>

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
        </Box>
    );
}
