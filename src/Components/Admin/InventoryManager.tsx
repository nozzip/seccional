import React from "react";
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
  Stack,
  alpha,
  useTheme,
  Button,
  Chip,
  TextField,
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  initialStock: number;
  entries: number;
  exits: number;
  price?: number;
}

interface InventoryManagerProps {
  items: InventoryItem[];
  onUpdateItems: (items: InventoryItem[]) => void;
}

export default function InventoryManager({
  items,
  onUpdateItems,
}: InventoryManagerProps) {
  const theme = useTheme();

  const handleUpdate = (
    id: number,
    field: "entries" | "exits",
    delta: number,
  ) => {
    onUpdateItems(
      items.map((item) =>
        item.id === id
          ? { ...item, [field]: Math.max(0, item[field] + delta) }
          : item,
      ),
    );
  };

  const calculateFinal = (item: InventoryItem) => {
    return item.initialStock + item.entries - item.exits;
  };

  const totalInventoryValue = items.reduce((acc, item) => {
    const final = calculateFinal(item);
    return acc + final * (item.price || 0);
  }, 0);

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
            Control de Inventario Diario
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gestión de stock: Inicial + Entradas - Salidas = Final
          </Typography>
        </Box>

        <Paper
          variant="outlined"
          sx={{
            px: 3,
            py: 1,
            borderRadius: 3,
            bgcolor: alpha(theme.palette.success.main, 0.05),
            borderColor: "success.main",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, color: "text.secondary" }}
          >
            VALOR TOTAL STOCk
          </Typography>
          <Typography
            variant="h6"
            sx={{ fontWeight: 900, color: "success.dark" }}
          >
            ${totalInventoryValue.toLocaleString()}
          </Typography>
        </Paper>
      </Box>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}
      >
        <Table>
          <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Producto</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Categoría</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Precio
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontWeight: 700,
                  bgcolor: alpha(theme.palette.info.main, 0.05),
                }}
              >
                Inicial
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontWeight: 700,
                  bgcolor: alpha(theme.palette.info.main, 0.05),
                }}
              >
                Entradas
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontWeight: 700,
                  bgcolor: alpha(theme.palette.error.main, 0.05),
                }}
              >
                Salidas
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontWeight: 700,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                }}
              >
                FINAL
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  fontWeight: 700,
                  bgcolor: alpha(theme.palette.success.main, 0.05),
                }}
              >
                VALOR
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => {
              const finalStock = calculateFinal(item);
              const itemValue = finalStock * (item.price || 0);
              return (
                <TableRow key={item.id} hover>
                  <TableCell sx={{ fontWeight: 700 }}>{item.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={item.category}
                      size="small"
                      sx={{ fontWeight: 700, fontSize: "0.65rem" }}
                      color={
                        item.category === "Bebidas" ? "primary" : "warning"
                      }
                    />
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      size="small"
                      value={item.price || 0}
                      onChange={(e) => {
                        const newPrice = parseFloat(e.target.value) || 0;
                        onUpdateItems(
                          items.map((i) =>
                            i.id === item.id ? { ...i, price: newPrice } : i,
                          ),
                        );
                      }}
                      sx={{ width: 80 }}
                      inputProps={{
                        style: {
                          textAlign: "right",
                          fontWeight: 700,
                          fontSize: "0.875rem",
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <Typography
                            variant="caption"
                            sx={{ mr: 0.5, fontWeight: 700 }}
                          >
                            $
                          </Typography>
                        ),
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography sx={{ fontWeight: 600 }}>
                      {item.initialStock}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="center"
                      alignItems="center"
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleUpdate(item.id, "entries", -1)}
                        color="error"
                      >
                        <RemoveCircleIcon fontSize="small" />
                      </IconButton>
                      <Typography sx={{ minWidth: 20, fontWeight: 700 }}>
                        {item.entries}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleUpdate(item.id, "entries", 1)}
                        color="info"
                      >
                        <AddCircleIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="center"
                      alignItems="center"
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleUpdate(item.id, "exits", -1)}
                        color="error"
                      >
                        <RemoveCircleIcon fontSize="small" />
                      </IconButton>
                      <Typography sx={{ minWidth: 20, fontWeight: 700 }}>
                        {item.exits}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleUpdate(item.id, "exits", 1)}
                        color="error"
                      >
                        <AddCircleIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <Typography
                      sx={{
                        fontWeight: 900,
                        color: finalStock >= 0 ? "success.main" : "error.main",
                      }}
                    >
                      {finalStock}
                    </Typography>
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: 800, color: "success.dark" }}
                  >
                    ${itemValue.toLocaleString()}
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
