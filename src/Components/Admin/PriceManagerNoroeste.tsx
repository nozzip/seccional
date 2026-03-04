import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  alpha,
  useTheme,
  InputAdornment,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import SaveIcon from "@mui/icons-material/Save";
import HouseSidingIcon from "@mui/icons-material/HouseSiding";
import { supabase } from "../../supabaseClient";

interface CabinPrices {
  confort4: { general: number; afiliado: number };
  confort5: { general: number; afiliado: number };
  confort7: { general: number; afiliado: number };
  [key: string]: any;
}

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

export default function PriceManagerNoroeste() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);

  const [cabinPrices, setCabinPrices] = useState<CabinPrices>({
    confort4: { general: 40000, afiliado: 20000 },
    confort5: { general: 50000, afiliado: 25000 },
    confort7: { general: 90000, afiliado: 50000 },
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: configs } = await supabase
        .from("system_configs")
        .select("*")
        .eq("key", "cabin_prices");

      if (configs && configs.length > 0 && configs[0].value) {
        setCabinPrices(configs[0].value);
      } else {
        // If not exists, create with defaults
        await supabase
          .from("system_configs")
          .insert({ key: "cabin_prices", value: cabinPrices });
      }
    } catch (error) {
      console.error("Error fetching cabin prices:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveChanges = async () => {
    try {
      const { error } = await supabase
        .from("system_configs")
        .upsert(
          { key: "cabin_prices", value: cabinPrices },
          { onConflict: "key" },
        );

      if (error) throw error;
      alert("Precios de cabañas guardados exitosamente");
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("Error al guardar los cambios");
    }
  };

  const handleCabinPriceChange = (
    category: string,
    type: "general" | "afiliado",
    value: string,
  ) => {
    const val = parseInt(value) || 0;
    setCabinPrices((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [type]: val,
      },
    }));
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
            Gestor de Precios (Noroeste)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configuración de aranceles para El Mollar
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSaveChanges}
          sx={{ borderRadius: 2, fontWeight: 700 }}
        >
          Guardar Cambios
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 1 }}>
              <HouseSidingIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Alquiler de Cabañas (Día)
              </Typography>
            </Box>

            <Stack spacing={4}>
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, mb: 2, color: "text.secondary" }}
                >
                  Cabaña 4 Personas
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <OptimizedPriceInput
                      label="Público General"
                      value={cabinPrices.confort4.general}
                      onChange={(val) =>
                        handleCabinPriceChange("confort4", "general", val)
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <OptimizedPriceInput
                      label="Afiliados"
                      value={cabinPrices.confort4.afiliado}
                      onChange={(val) =>
                        handleCabinPriceChange("confort4", "afiliado", val)
                      }
                    />
                  </Grid>
                </Grid>
              </Box>

              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, mb: 2, color: "text.secondary" }}
                >
                  Cabaña 5 Personas
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <OptimizedPriceInput
                      label="Público General"
                      value={cabinPrices.confort5.general}
                      onChange={(val) =>
                        handleCabinPriceChange("confort5", "general", val)
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <OptimizedPriceInput
                      label="Afiliados"
                      value={cabinPrices.confort5.afiliado}
                      onChange={(val) =>
                        handleCabinPriceChange("confort5", "afiliado", val)
                      }
                    />
                  </Grid>
                </Grid>
              </Box>

              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, mb: 2, color: "text.secondary" }}
                >
                  Cabaña 7 Personas
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <OptimizedPriceInput
                      label="Público General"
                      value={cabinPrices.confort7.general}
                      onChange={(val) =>
                        handleCabinPriceChange("confort7", "general", val)
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <OptimizedPriceInput
                      label="Afiliados"
                      value={cabinPrices.confort7.afiliado}
                      onChange={(val) =>
                        handleCabinPriceChange("confort7", "afiliado", val)
                      }
                    />
                  </Grid>
                </Grid>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
