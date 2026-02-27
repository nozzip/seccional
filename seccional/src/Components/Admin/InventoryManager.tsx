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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import DeleteIcon from "@mui/icons-material/Delete";

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

  const [openAdd, setOpenAdd] = React.useState(false);
  const [newItem, setNewItem] = React.useState({ name: "", category: "Bebidas", price: 0 });

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

  const handleAddItem = () => {
    if (!newItem.name) return;
    const itemToAdd: any = {
      id: Date.now(), // Temporary ID until saved to DB
      name: newItem.name,
      category: newItem.category,
      price: newItem.price,
      initialStock: 0,
      entries: 0,
      exits: 0
    };
    onUpdateItems([...items, itemToAdd]);
    setNewItem({ name: "", category: "Bebidas", price: 0 });
    setOpenAdd(false);
  };

  const handleDeleteItem = (id: number) => {
    if (window.confirm("¿Seguro que deseas eliminar este producto del inventario?")) {
      onUpdateItems(items.filter(i => i.id !== id));
    }
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

        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            variant="contained"
            startIcon={<AddCircleIcon />}
            onClick={() => setOpenAdd(true)}
            sx={{ borderRadius: 3, fontWeight: 700 }}
          >
            Nuevo Producto
          </Button>

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
        </Stack>
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
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                Acción
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
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} PaperProps={{ sx: { borderRadius: 4, p: 2 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Agregar Nuevo Producto</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Nombre del Producto"
              fullWidth
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
            <TextField
              select
              label="Categoría"
              fullWidth
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
            >
              <MenuItem value="Bebidas">Bebidas</MenuItem>
              <MenuItem value="Snacks">Snacks</MenuItem>
              <MenuItem value="Varios">Varios</MenuItem>
            </TextField>
            <TextField
              label="Precio de Venta"
              type="number"
              fullWidth
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setOpenAdd(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleAddItem} sx={{ px: 3, fontWeight: 700 }}>
            Crear Producto
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
