import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tabs,
  Tab,
  Button,
  Stack,
  Chip,
  alpha,
  useTheme,
} from "@mui/material";
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { supabase } from "../../supabaseClient";

interface RecycleItem {
  id: number;
  type: "student" | "transaction" | "inventory";
  name: string;
  deleted_at: string;
  original_data: any;
}

export default function RecycleBinManager() {
  const [activeTab, setActiveTab] = useState(0);
  const [items, setItems] = useState<RecycleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const fetchData = async () => {
    setLoading(true);
    try {
      let results: RecycleItem[] = [];

      if (activeTab === 0) {
        // Alumnos
        const { data } = await supabase
          .from("students")
          .select("*")
          .not("deleted_at", "is", null);
        results = (data || []).map((s) => ({
          id: s.id,
          type: "student",
          name: s.full_name,
          deleted_at: s.deleted_at,
          original_data: s,
        }));
      } else if (activeTab === 1) {
        // Transacciones
        const { data } = await supabase
          .from("transactions")
          .select("*")
          .not("deleted_at", "is", null);
        results = (data || []).map((t) => ({
          id: t.id,
          type: "transaction",
          name: `${t.description} (${t.invoice || "S/N"})`,
          deleted_at: t.deleted_at,
          original_data: t,
        }));
      } else {
        // Inventario
        const { data } = await supabase
          .from("inventory")
          .select("*")
          .not("deleted_at", "is", null);
        results = (data || []).map((i) => ({
          id: i.id,
          type: "inventory",
          name: i.description || i.name,
          deleted_at: i.deleted_at,
          original_data: i,
        }));
      }

      setItems(
        results.sort(
          (a, b) =>
            new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime(),
        ),
      );
    } catch (error) {
      console.error("Error fetching recycle bin:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleRestore = async (item: RecycleItem) => {
    try {
      if (item.type === "transaction") {
        // Rule: Restoring transaction clears the invoice to require a new one
        const { error } = await supabase
          .from("transactions")
          .update({ deleted_at: null, invoice: null })
          .eq("id", item.id);
        if (error) throw error;
      } else {
        const table = item.type === "student" ? "students" : "inventory";
        const { error } = await supabase
          .from(table)
          .update({ deleted_at: null })
          .eq("id", item.id);
        if (error) throw error;
      }
      fetchData();
    } catch (error) {
      console.error("Error restoring item:", error);
    }
  };

  const handlePermanentDelete = async (item: RecycleItem) => {
    if (
      !window.confirm(
        "¿Seguro que deseas eliminar esto permanentemente? Esta acción NO se puede deshacer.",
      )
    )
      return;
    try {
      const table =
        item.type === "student"
          ? "students"
          : item.type === "transaction"
            ? "transactions"
            : "inventory";
      const { error } = await supabase.from(table).delete().eq("id", item.id);
      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error("Error deleting item permanently:", error);
    }
  };

  const getTimeRemaining = (deletedAt: string) => {
    const deletedDate = new Date(deletedAt);
    const expiryDate = new Date(
      deletedDate.getTime() + 7 * 24 * 60 * 60 * 1000,
    );
    const now = new Date();
    const diff = expiryDate.getTime() - now.getTime();

    if (diff <= 0) return "Expirando...";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 3 }}>
        Papelera de Reciclaje
      </Typography>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          mb: 4,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{
            px: 2,
            pt: 2,
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: alpha(theme.palette.background.paper, 0.5),
          }}
        >
          <Tab label="Alumnos" sx={{ fontWeight: 700 }} />
          <Tab label="Transacciones" sx={{ fontWeight: 700 }} />
          <Tab label="Inventario" sx={{ fontWeight: 700 }} />
        </Tabs>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}
              >
                <TableCell sx={{ fontWeight: 800 }}>Elemento</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>
                  Fecha Eliminación
                </TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Tiempo Restante</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      La papelera está vacía.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={`${item.type}-${item.id}`} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{item.name}</TableCell>
                    <TableCell>
                      {new Date(item.deleted_at).toLocaleString("es-AR")}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getTimeRemaining(item.deleted_at)}
                        size="small"
                        color="warning"
                        variant="outlined"
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                      >
                        <IconButton
                          size="small"
                          color="success"
                          title="Restaurar"
                          onClick={() => handleRestore(item)}
                        >
                          <RestoreFromTrashIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          title="Eliminar Permanentemente"
                          onClick={() => handlePermanentDelete(item)}
                        >
                          <DeleteForeverIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", textAlign: "center" }}
      >
        Los elementos en la papelera se eliminan automáticamente después de 7
        días. Al restaurar una transacción, el número de factura/comprobante se
        borrará para evitar duplicados.
      </Typography>
    </Box>
  );
}
