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
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from "@mui/material";

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
  onAddItem?: (item: Omit<InventoryItem, "id" | "entries" | "exits">) => void;
  onDeleteItem?: (id: number | string) => void;
}

export default function InventoryManager({
  items,
  onUpdateItems,
  onAddItem,
  onDeleteItem,
}: InventoryManagerProps) {
  const theme = useTheme();

  const [openAdd, setOpenAdd] = React.useState(false);
  const [newItem, setNewItem] = React.useState({
    name: "",
    category: "Bebidas",
    initialStock: 0,
    price: 0,
  });

  const handleOpenAdd = () => {
    setNewItem({ name: "", category: "Bebidas", initialStock: 0, price: 0 });
    setOpenAdd(true);
  };

  const handleSaveAdd = () => {
    if (newItem.name && onAddItem) {
      onAddItem(newItem);
      setOpenAdd(false);
    }
  };

  const handleUpdate = (
    target: number | string,
    field: "entries" | "exits",
    delta: number,
  ) => {
    onUpdateItems(
      items.map((item) => {
        const isMatch =
          typeof target === "number"
            ? item.id === target
            : item.name === target;
        return isMatch
          ? { ...item, [field]: Math.max(0, item[field] + delta) }
          : item;
      }),
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
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAdd}
            sx={{ mt: 2, fontWeight: 700, borderRadius: 2 }}
          >
            Agregar Producto
          </Button>
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
            Valor total stock
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
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>Producto</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Categoría</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, minWidth: 150 }}>
                Precio
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 800 }}>
                Inicial
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontWeight: 800,
                  bgcolor: "success.main",
                  color: "#ffffff",
                }}
              >
                Entrada
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontWeight: 800,
                  bgcolor: "error.main",
                  color: "#ffffff",
                }}
              >
                Salida
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontWeight: 800,
                }}
              >
                Final
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 800 }}>
                Valor
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 800 }}>
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => {
              const finalStock = calculateFinal(item);
              const itemValue = finalStock * (item.price || 0);
              return (
                <TableRow key={item.id || item.name} hover>
                  <TableCell sx={{ fontWeight: 700 }}>
                    {item.name.charAt(0).toUpperCase() +
                      item.name.slice(1).toLowerCase()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        item.category.charAt(0).toUpperCase() +
                        item.category.slice(1).toLowerCase()
                      }
                      size="small"
                      sx={{
                        fontWeight: 900,
                        fontSize: "0.65rem",
                        bgcolor: item.category.toLowerCase().includes("bebida")
                          ? "primary.main"
                          : item.category.toLowerCase().includes("snack")
                            ? "warning.main"
                            : "secondary.main",
                        color: "#ffffff",
                        border: "1px solid",
                        borderColor: "rgba(255,255,255,0.1)",
                        textShadow: "0px 0px 2px rgba(0,0,0,0.3)",
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={0.5}
                      justifyContent="flex-end"
                    >
                      <IconButton
                        size="small"
                        onClick={() => {
                          onUpdateItems(
                            items.map((i) =>
                              i.id === item.id || i.name === item.name
                                ? {
                                    ...i,
                                    price: Math.max(0, (i.price || 0) - 100),
                                  }
                                : i,
                            ),
                          );
                        }}
                        sx={{ color: "error.main", p: 0.5 }}
                      >
                        <RemoveCircleIcon fontSize="small" />
                      </IconButton>
                      <TextField
                        type="number"
                        size="small"
                        value={item.price || 0}
                        onChange={(e) => {
                          const newPrice = parseFloat(e.target.value) || 0;
                          onUpdateItems(
                            items.map((i) =>
                              i.id === item.id || i.name === item.name
                                ? { ...i, price: newPrice }
                                : i,
                            ),
                          );
                        }}
                        sx={{
                          width: 90,
                          "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                            {
                              display: "none",
                            },
                          "& input[type=number]": {
                            MozAppearance: "textfield",
                          },
                        }}
                        inputProps={{
                          style: {
                            textAlign: "center",
                            fontWeight: 700,
                            fontSize: "0.875rem",
                          },
                        }}
                        InputProps={{
                          startAdornment: (
                            <Typography
                              variant="caption"
                              sx={{ mr: 0.5, fontWeight: 700, opacity: 0.7 }}
                            >
                              $
                            </Typography>
                          ),
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => {
                          onUpdateItems(
                            items.map((i) =>
                              i.id === item.id || i.name === item.name
                                ? { ...i, price: (i.price || 0) + 100 }
                                : i,
                            ),
                          );
                        }}
                        sx={{ color: "success.main", p: 0.5 }}
                      >
                        <AddCircleIcon fontSize="small" />
                      </IconButton>
                    </Stack>
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
                        onClick={() =>
                          handleUpdate(item.id || item.name, "entries", -1)
                        }
                        color="error"
                      >
                        <RemoveCircleIcon fontSize="small" />
                      </IconButton>
                      <Typography sx={{ minWidth: 20, fontWeight: 700 }}>
                        {item.entries}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleUpdate(item.id || item.name, "entries", 1)
                        }
                        sx={{ color: "success.main" }}
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
                        onClick={() =>
                          handleUpdate(item.id || item.name, "exits", -1)
                        }
                        color="error"
                      >
                        <RemoveCircleIcon fontSize="small" />
                      </IconButton>
                      <Typography sx={{ minWidth: 20, fontWeight: 700 }}>
                        {item.exits}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleUpdate(item.id || item.name, "exits", 1)
                        }
                        sx={{ color: "success.main" }}
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
                    sx={{ fontWeight: 800, minWidth: 100 }}
                  >
                    ${itemValue.toLocaleString()}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDeleteItem?.(item.id || item.name)}
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

      {/* Add Product Dialog */}
      <Dialog
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Agregar Nuevo Producto
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Nombre del Producto"
              fullWidth
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              autoFocus
            />
            <TextField
              select
              label="Categoría"
              fullWidth
              value={newItem.category}
              onChange={(e) =>
                setNewItem({ ...newItem, category: e.target.value })
              }
            >
              <MenuItem value="Bebidas">Bebidas</MenuItem>
              <MenuItem value="Snacks">Snacks</MenuItem>
              <MenuItem value="Otros">Otros</MenuItem>
            </TextField>
            <TextField
              label="Stock Inicial"
              type="number"
              fullWidth
              value={newItem.initialStock}
              onChange={(e) =>
                setNewItem({
                  ...newItem,
                  initialStock: parseInt(e.target.value) || 0,
                })
              }
            />
            <TextField
              label="Precio de Venta"
              type="number"
              fullWidth
              value={newItem.price}
              onChange={(e) =>
                setNewItem({
                  ...newItem,
                  price: parseFloat(e.target.value) || 0,
                })
              }
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenAdd(false)} color="inherit">
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSaveAdd} sx={{ px: 3 }}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
