import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  InputAdornment,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { supabase } from "../../supabaseClient";
import ProviderLedgerModal from "./ProviderLedgerModal";

interface Provider {
  id: number;
  name: string;
  cuit: string;
  balance: number;
}

export default function ProvidersManager() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // States for Ledger Modal
  const [openLedger, setOpenLedger] = useState(false);
  const [ledgerProvider, setLedgerProvider] = useState<Provider | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    cuit: "",
  });

  const fetchProviders = async () => {
    try {
      const { data, error } = await supabase
        .from("providers")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setProviders(data || []);
      setFilteredProviders(data || []);
    } catch (error) {
      console.error("Error fetching providers:", error);
    }
  };

  useEffect(() => {
    fetchProviders();

    // Set up realtime subscription
    const subscription = supabase
      .channel("providers_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "providers" },
        () => {
          fetchProviders();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredProviders(
      providers.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          (p.cuit && p.cuit.includes(term)),
      ),
    );
  }, [searchTerm, providers]);

  const handleOpenModal = (provider?: Provider) => {
    if (provider) {
      setEditingId(provider.id);
      setFormData({ name: provider.name, cuit: provider.cuit || "" });
    } else {
      setEditingId(null);
      setFormData({ name: "", cuit: "" });
    }
    setIsModalOpen(true);
  };

  const handleOpenLedger = (provider: Provider) => {
    setLedgerProvider(provider);
    setOpenLedger(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: "", cuit: "" });
  };

  const handleSave = async () => {
    if (!formData.name) return;

    try {
      if (editingId) {
        const { error } = await supabase
          .from("providers")
          .update({ name: formData.name, cuit: formData.cuit })
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("providers")
          .insert([{ name: formData.name, cuit: formData.cuit }]);
        if (error) throw error;
      }
      handleCloseModal();
      fetchProviders();
    } catch (error) {
      console.error("Error saving provider:", error);
      alert("Error al guardar el proveedor");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Está seguro de eliminar este proveedor?")) return;

    try {
      const { error } = await supabase.from("providers").delete().eq("id", id);
      if (error) throw error;
      fetchProviders();
    } catch (error) {
      console.error("Error deleting provider:", error);
      alert(
        "Error al eliminar el proveedor (Puede estar en uso en alguna transacción)",
      );
    }
  };

  return (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
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
            Gestión de Proveedores
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Directorio global de empresas y proveedores de servicios
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
          sx={{ borderRadius: 2, fontWeight: 700 }}
        >
          Nuevo Proveedor
        </Button>
      </Box>

      <Paper
        elevation={0}
        sx={{ p: 2, mb: 3, border: "1px solid", borderColor: "divider" }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por Nombre o CUIT..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: "1px solid", borderColor: "divider" }}
      >
        <Table>
          <TableHead sx={{ bgcolor: "background.default" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>
                Nombre / Razón Social
              </TableCell>
              <TableCell sx={{ fontWeight: 800 }}>CUIT</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Estado de Cuenta</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800 }}>
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProviders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  <LocalShippingIcon
                    sx={{ fontSize: 40, color: "text.disabled", mb: 1 }}
                  />
                  <Typography color="text.secondary">
                    No se encontraron proveedores
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredProviders.map((provider) => (
                <TableRow key={provider.id} hover>
                  <TableCell>#{provider.id}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {provider.name}
                  </TableCell>
                  <TableCell>{provider.cuit || "-"}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 800,
                        color:
                          (provider.balance || 0) > 0
                            ? "error.main"
                            : (provider.balance || 0) < 0
                              ? "success.main"
                              : "text.secondary",
                      }}
                    >
                      ${Math.abs(provider.balance || 0).toLocaleString()}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color:
                          (provider.balance || 0) > 0
                            ? "error.main"
                            : (provider.balance || 0) < 0
                              ? "success.main"
                              : "text.secondary",
                      }}
                    >
                      {(provider.balance || 0) > 0
                        ? "Deuda"
                        : (provider.balance || 0) < 0
                          ? "Adelanto (A Favor)"
                          : "Saldado"}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="info"
                      title="Ver Cuenta Corriente"
                      onClick={() => handleOpenLedger(provider)}
                    >
                      <AccountBalanceWalletIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      title="Editar Proveedor"
                      onClick={() => handleOpenModal(provider)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(provider.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal Crear/Editar */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingId ? "Editar Proveedor" : "Nuevo Proveedor"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Nombre o Razón Social"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                autoFocus
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="CUIT (Opcional)"
                value={formData.cuit}
                onChange={(e) =>
                  setFormData({ ...formData, cuit: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseModal} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!formData.name}
            sx={{ fontWeight: 700 }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Ledger */}
      <ProviderLedgerModal
        open={openLedger}
        onClose={() => setOpenLedger(false)}
        provider={ledgerProvider}
      />
    </Box>
  );
}
