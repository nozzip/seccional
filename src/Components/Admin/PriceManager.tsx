import React, { useState, useEffect } from "react";
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
import SportsTennisIcon from "@mui/icons-material/SportsTennis";
import { supabase } from "../../supabaseClient";

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

// Local component to handle individual input state and avoid full-page re-renders
const OptimizedPriceInput = ({
  value,
  onChange,
  label,
  size = "small",
  fullWidth = true,
  prefix = "$",
}: {
  value: number;
  onChange: (val: string) => void;
  label?: string;
  size?: "small" | "medium";
  fullWidth?: boolean;
  prefix?: string;
}) => {
  const [localValue, setLocalValue] = useState(value.toString());

  useEffect(() => {
    setLocalValue(value.toString());
  }, [value]);

  return (
    <TextField
      label={label}
      size={size}
      fullWidth={fullWidth}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={() => {
        if (localValue !== value.toString()) {
          onChange(localValue);
        }
      }}
      InputProps={{
        startAdornment: prefix ? (
          <InputAdornment position="start">{prefix}</InputAdornment>
        ) : null,
        sx: { fontWeight: 700 },
      }}
    />
  );
};

export default function PriceManager() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  // Precios globales de productos para sincronizar con Inventario
  const [productsPrices, setProductsPrices] = useState<ProductPrice[]>([]);

  // Precios de Natación
  const [swimmingPrices, setSwimmingPrices] = useState<SwimmingPrices>({
    conProfesor: {
      v2: { total: 0, club: 0, prof: 0 },
      v3: { total: 0, club: 0, prof: 0 },
      v5: { total: 0, club: 0, prof: 0 },
    },
    libre: {
      v2: 0,
      v3: 0,
      v5: 0,
    },
    porClase: { total: 0, club: 0, prof: 0 },
    porDiaLibre: 0,
    matronatacion: { total: 0, club: 0, prof: 0 },
    plantel: { total: 0, club: 0, prof: 0 },
  });

  // Precios de Canchas
  const [courtPrices, setCourtPrices] = useState<any>({
    0: 15000, // Paddle
    1: 12000, // Squash
    2: 18000, // Futbol
    3: 50000, // Quincho
  });

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: prices } = await supabase
        .from("products_prices")
        .select("*");
      if (prices) setProductsPrices(prices);

      const { data: promos } = await supabase.from("promotions").select("*");
      if (promos) setPromotions(promos);

      const { data: configs } = await supabase
        .from("system_configs")
        .select("*")
        .in("key", ["swimming_prices", "court_prices"]);

      const swimConfig = configs?.find((c) => c.key === "swimming_prices");
      if (swimConfig?.value) setSwimmingPrices(swimConfig.value);

      const courtConfig = configs?.find((c) => c.key === "court_prices");
      if (courtConfig?.value) setCourtPrices(courtConfig.value);
    } catch (error) {
      console.error("Error fetching prices:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleSaveChanges = async () => {
    try {
      // Save Products
      const { error: pError } = await supabase
        .from("products_prices")
        .upsert(productsPrices);
      if (pError) throw pError;

      // Save Promotions
      const { error: prError } = await supabase
        .from("promotions")
        .upsert(promotions);
      if (prError) throw prError;

      // Save Swimming Prices
      const { error: sError } = await supabase
        .from("system_configs")
        .upsert(
          { key: "swimming_prices", value: swimmingPrices },
          { onConflict: "key" },
        );
      if (sError) throw sError;

      // Save Court Prices
      const { error: cError } = await supabase
        .from("system_configs")
        .upsert(
          { key: "court_prices", value: courtPrices },
          { onConflict: "key" },
        );
      if (cError) throw cError;

      alert("Cambios guardados exitosamente");
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("Error al guardar los cambios");
    }
  };

  const [massAdjustment, setMassAdjustment] = useState({
    percent: 10,
    roundTo: 100,
  });
  const [openPromoDialog, setOpenPromoDialog] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);

  const applyMassAdjustmentToProducts = () => {
    const factor = 1 + massAdjustment.percent / 100;
    setProductsPrices((prev) =>
      prev.map((p) => ({
        ...p,
        price:
          Math.round((p.price * factor) / massAdjustment.roundTo) *
          massAdjustment.roundTo,
      })),
    );
  };

  const applyMassAdjustmentToSwimming = () => {
    const factor = 1 + massAdjustment.percent / 100;
    const adjust = (val: number) =>
      Math.round((val * factor) / massAdjustment.roundTo) *
      massAdjustment.roundTo;

    const newPrices = JSON.parse(JSON.stringify(swimmingPrices));

    // Helper recursive to adjust all numbers
    const process = (obj: any) => {
      for (const key in obj) {
        if (typeof obj[key] === "number") {
          obj[key] = adjust(obj[key]);
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          process(obj[key]);
        }
      }
    };

    process(newPrices);
    setSwimmingPrices(newPrices);
  };

  const handleSavePromo = (promoData: Partial<Promotion>) => {
    if (editingPromo) {
      setPromotions((prev) =>
        prev.map((p) =>
          p.id === editingPromo.id ? ({ ...p, ...promoData } as Promotion) : p,
        ),
      );
    } else {
      setPromotions((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: promoData.name || "",
          description: promoData.description || "",
          price: promoData.price || 0,
          active: true,
          startDate: promoData.startDate,
          endDate: promoData.endDate,
        } as Promotion,
      ]);
    }
    setOpenPromoDialog(false);
    setEditingPromo(null);
  };

  const handleProductPriceChange = (id: number, newPrice: string) => {
    setProductsPrices((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, price: parseInt(newPrice) || 0 } : p,
      ),
    );
  };

  const handleSwimmingPriceChange = (path: string[], value: string) => {
    const val = parseInt(value) || 0;
    const newPrices = JSON.parse(JSON.stringify(swimmingPrices));
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
          onClick={handleSaveChanges}
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
        <Tab icon={<SportsTennisIcon />} label="Canchas" iconPosition="start" />
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
            flexWrap: "wrap",
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
              onChange={(e) =>
                setMassAdjustment({
                  ...massAdjustment,
                  percent: parseInt(e.target.value) || 0,
                })
              }
              sx={{ width: 80 }}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                sx: { fontWeight: 800 },
              }}
            />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 700 }}
            >
              REDONDEAR A:
            </Typography>
            <TextField
              select
              size="small"
              value={massAdjustment.roundTo}
              onChange={(e) =>
                setMassAdjustment({
                  ...massAdjustment,
                  roundTo: parseInt(e.target.value) || 1,
                })
              }
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
            onClick={
              activeTab === 0
                ? applyMassAdjustmentToSwimming
                : applyMassAdjustmentToProducts
            }
            sx={{ fontWeight: 800, borderRadius: 2 }}
          >
            APLICAR A TODA LA SECCIÓN
          </Button>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ maxWidth: 300 }}
          >
            Esto modificará todos los precios de esta pestaña según el
            porcentaje indicado y aplicará el redondeo.
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
                          <OptimizedPriceInput
                            label="Total"
                            value={data.total}
                            onChange={(val) =>
                              handleSwimmingPriceChange(
                                ["conProfesor", freq, "total"],
                                val,
                              )
                            }
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <OptimizedPriceInput
                            label="Club"
                            value={data.club}
                            onChange={(val) =>
                              handleSwimmingPriceChange(
                                ["conProfesor", freq, "club"],
                                val,
                              )
                            }
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <OptimizedPriceInput
                            label="Profesor"
                            value={data.prof}
                            onChange={(val) =>
                              handleSwimmingPriceChange(
                                ["conProfesor", freq, "prof"],
                                val,
                              )
                            }
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
                        <OptimizedPriceInput
                          label="Total"
                          value={(swimmingPrices as any)[item.key].total}
                          onChange={(val) =>
                            handleSwimmingPriceChange([item.key, "total"], val)
                          }
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <OptimizedPriceInput
                          label="Club"
                          value={(swimmingPrices as any)[item.key].club}
                          onChange={(val) =>
                            handleSwimmingPriceChange([item.key, "club"], val)
                          }
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <OptimizedPriceInput
                          label="Profesor"
                          value={(swimmingPrices as any)[item.key].prof}
                          onChange={(val) =>
                            handleSwimmingPriceChange([item.key, "prof"], val)
                          }
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
                  <OptimizedPriceInput
                    key={freq}
                    label={
                      freq === "v2"
                        ? "2 veces por semana"
                        : freq === "v3"
                          ? "3 veces por semana"
                          : "5 veces por semana"
                    }
                    value={price}
                    onChange={(val) =>
                      handleSwimmingPriceChange(["libre", freq], val)
                    }
                  />
                ))}
                <Divider />
                <OptimizedPriceInput
                  label="Por Día Libre"
                  value={swimmingPrices.porDiaLibre}
                  onChange={(val) =>
                    handleSwimmingPriceChange(["porDiaLibre"], val)
                  }
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
            <TableHead
              sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}
            >
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
                    <OptimizedPriceInput
                      value={product.price}
                      onChange={(val) =>
                        handleProductPriceChange(product.id, val)
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={4}>
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
                Alquiler de Canchas (Hora)
              </Typography>
              <Stack spacing={3}>
                <OptimizedPriceInput
                  label="Paddle (Turno)"
                  value={courtPrices[0]}
                  onChange={(val) =>
                    setCourtPrices({ ...courtPrices, 0: parseInt(val) || 0 })
                  }
                />
                <OptimizedPriceInput
                  label="Squash (Turno)"
                  value={courtPrices[1]}
                  onChange={(val) =>
                    setCourtPrices({ ...courtPrices, 1: parseInt(val) || 0 })
                  }
                />
                <OptimizedPriceInput
                  label="Fútbol 5 (Turno)"
                  value={courtPrices[2]}
                  onChange={(val) =>
                    setCourtPrices({ ...courtPrices, 2: parseInt(val) || 0 })
                  }
                />
                <OptimizedPriceInput
                  label="Quincho (Reserva)"
                  value={courtPrices[3]}
                  onChange={(val) =>
                    setCourtPrices({ ...courtPrices, 3: parseInt(val) || 0 })
                  }
                />
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
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
            {promotions.map((promo) => {
              const today = new Date().toISOString().split("T")[0];
              let statusLabel = "Vigente";
              let statusColor: "success" | "warning" | "error" | "default" =
                "success";

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
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Box
                      sx={{
                        mb: 2,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 800 }}
                        >
                          {promo.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {promo.description}
                        </Typography>
                      </Box>
                      <Typography
                        variant="h6"
                        color="primary"
                        sx={{ fontWeight: 900 }}
                      >
                        ${promo.price.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={statusLabel}
                        color={statusColor}
                        size="small"
                        sx={{ mb: 1, mr: 1, fontWeight: 700 }}
                      />
                      {(promo.startDate || promo.endDate) && (
                        <Typography
                          variant="caption"
                          display="block"
                          color="text.secondary"
                        >
                          Validez:{" "}
                          {promo.startDate
                            ? new Date(promo.startDate).toLocaleDateString()
                            : "Siempre"}{" "}
                          -{" "}
                          {promo.endDate
                            ? new Date(promo.endDate).toLocaleDateString()
                            : "Siempre"}
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
                        onClick={() =>
                          setPromotions((prev) =>
                            prev.map((p) =>
                              p.id === promo.id
                                ? { ...p, active: !p.active }
                                : p,
                            ),
                          )
                        }
                      >
                        {promo.active ? "Desactivar" : "Activar"}
                      </Button>
                    </Stack>
                  </Paper>
                </Grid>
              );
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
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Fecha de Inicio"
                  type="date"
                  fullWidth
                  defaultValue={editingPromo?.startDate || ""}
                  id="promo-start"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Fecha de Fin"
                  type="date"
                  fullWidth
                  defaultValue={editingPromo?.endDate || ""}
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
                const name = (
                  document.getElementById("promo-name") as HTMLInputElement
                ).value;
                const description = (
                  document.getElementById("promo-desc") as HTMLInputElement
                ).value;
                const price =
                  parseInt(
                    (document.getElementById("promo-price") as HTMLInputElement)
                      .value,
                  ) || 0;
                const startDate = (
                  document.getElementById("promo-start") as HTMLInputElement
                ).value;
                const endDate = (
                  document.getElementById("promo-end") as HTMLInputElement
                ).value;
                handleSavePromo({
                  name,
                  description,
                  price,
                  startDate,
                  endDate,
                });
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
