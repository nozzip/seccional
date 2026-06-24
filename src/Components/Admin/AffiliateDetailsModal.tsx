import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
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
  Stack,
  Tooltip,
  CircularProgress,
  Divider,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  Chip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import PersonIcon from "@mui/icons-material/Person";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import SaveIcon from "@mui/icons-material/Save";
import { supabase } from "../../supabaseClient";
import { logAction } from "../../utils/auditLogger";
import { cleanLocationName } from "./AfiliadosManager";

interface FamilyMember {
  id?: number;
  affiliate_id: number;
  nombre: string;
  apellido: string;
  dni?: string;
  fecha_nacimiento?: string;
  edad?: number;
  grado_escolar?: string;
}

interface AffiliateDetailsModalProps {
  open: boolean;
  onClose: () => void;
  affiliate: any | null;
  onUpdate: () => void;
}

export default function AffiliateDetailsModal({
  open,
  onClose,
  affiliate,
  onUpdate,
}: AffiliateDetailsModalProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Edit State for Affiliate
  const [editData, setEditData] = useState<any>({});
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("current_affiliate");
    if (stored) {
      setCurrentUser(JSON.parse(stored));
    }
  }, []);

  const isAdmin = currentUser && (
    currentUser.role === 'admin' ||
    currentUser.role === 'superadmin' ||
    ['34185803', '042418/00', '23276817159'].includes(currentUser.legajo) ||
    ['34185803', '23276817159'].includes(currentUser.cuil)
  );

  const [newMember, setNewMember] = useState<Partial<FamilyMember>>({
    nombre: "",
    apellido: "",
    dni: "",
    fecha_nacimiento: "",
    edad: undefined,
    grado_escolar: "",
  });

  useEffect(() => {
    if (open && affiliate) {
      setEditData({ ...affiliate });
      fetchFamilyMembers();
      setActiveTab(0);
      setSuccess(false);
    }
  }, [open, affiliate]);

  const fetchFamilyMembers = async () => {
    if (!affiliate) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("affiliate_family_members")
        .select("*")
        .eq("affiliate_id", affiliate.id)
        .order("nombre", { ascending: true });

      if (error) throw error;
      setFamilyMembers(data || []);
    } catch (error) {
      console.error("Error fetching family members:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAffiliate = async () => {
    if (!affiliate) return;
    setSaving(true);
    try {
      const cleanProv = cleanLocationName(editData.provincia);
      const { family_count, _searchStr, ...dataToSave } = editData;
      const dataToSaveWithClean = {
        ...dataToSave,
        provincia: cleanProv,
        ciudad: cleanProv
      };
      
      const { error } = await supabase
        .from("affiliates")
        .update(dataToSaveWithClean)
        .eq("id", affiliate.id);

      if (error) throw error;

      await logAction(
        "ACTUALIZAR_AFILIADO",
        `Actualización de perfil: ${editData.apellido || ''}, ${editData.nombre || ''} (ID: ${affiliate.id})`
      );

      setSuccess(true);
      onUpdate();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      alert("Error al actualizar: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddMember = async () => {
    if (!affiliate || !newMember.nombre || !newMember.apellido) return;

    try {
      const memberToInsert = {
        affiliate_id: affiliate.id,
        nombre: newMember.nombre?.trim() || "",
        apellido: newMember.apellido?.trim() || "",
        dni: newMember.dni?.trim() || null,
        fecha_nacimiento: newMember.fecha_nacimiento || null,
        edad: newMember.edad ?? null,
        grado_escolar: newMember.grado_escolar?.trim() || null,
      };

      const { error } = await supabase
        .from("affiliate_family_members")
        .insert([memberToInsert]);

      if (error) throw error;

      await logAction(
        "AGREGAR_FAMILIAR",
        `Familiar agregado: ${newMember.apellido || ''}, ${newMember.nombre || ''} al afiliado ${affiliate?.apellido || ''}, ${affiliate?.nombre || ''} (ID: ${affiliate?.id})`
      );

      fetchFamilyMembers();
      onUpdate(); // Update family count in main table
      setNewMember({
        nombre: "",
        apellido: "",
        dni: "",
        fecha_nacimiento: "",
        edad: undefined,
        grado_escolar: "",
      });
    } catch (error: any) {
      alert("Error al cargar familiar: " + error.message);
    }
  };

  const handleDeleteMember = async (id: number) => {
    if (!window.confirm("¿Está seguro de eliminar este familiar?")) return;
    try {
      const { error } = await supabase
        .from("affiliate_family_members")
        .delete()
        .eq("id", id);

      if (error) throw error;

      const deletedMember = familyMembers.find((m: any) => m.id === id);
      await logAction(
        "ELIMINAR_FAMILIAR",
        `Familiar eliminado: ${deletedMember?.apellido || 'N/A'}, ${deletedMember?.nombre || 'N/A'} del afiliado ${affiliate?.apellido || ''}, ${affiliate?.nombre || ''} (ID: ${affiliate?.id})`
      );

      fetchFamilyMembers();
      onUpdate();
    } catch (error) {
      console.error("Error deleting family member:", error);
    }
  };

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (!affiliate) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: { borderRadius: 1, p: 0, overflow: 'hidden' },
      }}
    >
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', py: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <PersonIcon sx={{ fontSize: 30 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Ficha del Afiliado
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {affiliate.apellido}, {affiliate.nombre} | CUIL: {affiliate.cuil}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              {affiliate.is_ups && <Chip label="UPS" size="small" color="warning" sx={{ fontWeight: 800, height: 20 }} />}
              {affiliate.es_jubilado && (
                <Chip 
                  label={affiliate.is_aportante ? "Jubilado Aportante" : "Jubilado No Aportante"} 
                  size="small" 
                  color="secondary" 
                  sx={{ fontWeight: 800, height: 20 }} 
                />
              )}
              {affiliate.legajo && <Chip label="AEFIP" size="small" color="info" sx={{ fontWeight: 800, height: 20 }} />}
              {affiliate.role === 'admin' && <Chip label="ADMIN" size="small" color="error" sx={{ fontWeight: 900, height: 20 }} />}
            </Stack>
          </Box>
        </Stack>
      </DialogTitle>

      <Tabs
        value={activeTab}
        onChange={(e, v) => setActiveTab(v)}
        sx={{ borderBottom: 1, borderColor: "divider", px: 2, pt: 1 }}
      >
        <Tab label="Datos Personales" icon={<PersonIcon />} iconPosition="start" />
        <Tab label="Grupo Familiar" icon={<ChildCareIcon />} iconPosition="start" />
      </Tabs>

      <DialogContent sx={{ minHeight: 400, py: 3 }}>
        {activeTab === 0 ? (
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {success && <Alert severity="success" sx={{ mb: 2 }}>Datos actualizados con éxito</Alert>}
            
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth label="Apellido" value={editData.apellido || ""}
                onChange={(e) => setEditData({...editData, apellido: e.target.value})}
              />
              <TextField
                fullWidth label="Nombre" value={editData.nombre || ""}
                onChange={(e) => setEditData({...editData, nombre: e.target.value})}
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth label="CUIL" value={editData.cuil || ""}
                onChange={(e) => setEditData({...editData, cuil: e.target.value})}
              />
              <TextField
                fullWidth label="Legajo" value={editData.legajo || ""}
                onChange={(e) => setEditData({...editData, legajo: e.target.value})}
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth label="Provincia" value={editData.provincia || ""}
                onChange={(e) => setEditData({...editData, provincia: e.target.value, ciudad: e.target.value})}
              />
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              <FormControl fullWidth>
                <InputLabel>Sexo</InputLabel>
                <Select
                  value={editData.sexo || "Hombre"}
                  label="Sexo"
                  onChange={(e) => setEditData({...editData, sexo: e.target.value})}
                >
                  <MenuItem value="Hombre">Hombre</MenuItem>
                  <MenuItem value="Mujer">Mujer</MenuItem>
                  <MenuItem value="Otro">Otro</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth label="Fecha Nacimiento / Cumpleaños" type="date"
                InputLabelProps={{ shrink: true }}
                value={editData.fecha_nacimiento || ""}
                onChange={(e) => setEditData({...editData, fecha_nacimiento: e.target.value})}
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth label="Teléfono" value={editData.telefono || ""}
                onChange={(e) => setEditData({...editData, telefono: e.target.value})}
              />
              <TextField
                fullWidth label="Email" value={editData.email || ""}
                onChange={(e) => setEditData({...editData, email: e.target.value})}
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth label="Nombre de Cónyuge" value={editData.conyuge_nombre || ""}
                onChange={(e) => setEditData({...editData, conyuge_nombre: e.target.value})}
              />
              <TextField
                fullWidth label="DNI de Cónyuge" value={editData.conyuge_dni || ""}
                onChange={(e) => setEditData({...editData, conyuge_dni: e.target.value})}
              />
            </Stack>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editData.es_jubilado || false}
                    onChange={(e) => setEditData({...editData, es_jubilado: e.target.checked})}
                  />
                }
                label="Es Jubilado"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={editData.is_aportante || false}
                    onChange={(e) => setEditData({...editData, is_aportante: e.target.checked})}
                  />
                }
                label="Es Aportante (AP)"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={editData.is_ups || false}
                    onChange={(e) => setEditData({...editData, is_ups: e.target.checked})}
                  />
                }
                label="Afiliado UPS"
              />
              {isAdmin && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={editData.role === 'admin'}
                      onChange={(e) => {
                        const makeAdmin = e.target.checked;
                        if (window.confirm(`¿Está seguro de que desea ${makeAdmin ? 'otorgar' : 'quitar'} los permisos de administrador a este afiliado?`)) {
                          setEditData({...editData, role: makeAdmin ? 'admin' : 'user'});
                        }
                      }}
                      color="error"
                    />
                  }
                  label="Admin"
                  sx={{ color: 'error.main', '& .MuiTypography-root': { fontWeight: 800 } }}
                />
              )}
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                disabled={saving}
                onClick={handleSaveAffiliate}
                sx={{ px: 4, fontWeight: 700, borderRadius: 1 }}
              >
                Guardar Cambios
              </Button>
            </Box>
          </Box>
        ) : (
          <Box>
            <Box
              sx={{
                mb: 4, p: 2, bgcolor: "action.hover", borderRadius: 1, border: "1px dashed", borderColor: "primary.main",
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>Agregar Familiar</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap gap={1}>
                <TextField
                  label="Nombre" size="small" value={newMember.nombre}
                  onChange={(e) => setNewMember({ ...newMember, nombre: e.target.value })}
                  sx={{ flex: 1, minWidth: 150 }}
                />
                <TextField
                  label="Apellido" size="small" value={newMember.apellido}
                  onChange={(e) => setNewMember({ ...newMember, apellido: e.target.value })}
                  sx={{ flex: 1, minWidth: 150 }}
                />
                <TextField
                  label="DNI" size="small" value={newMember.dni}
                  onChange={(e) => setNewMember({ ...newMember, dni: e.target.value })}
                  sx={{ width: 120 }}
                />
                <TextField
                  label="Nacimiento" type="date" size="small" InputLabelProps={{ shrink: true }}
                  value={newMember.fecha_nacimiento}
                  onChange={(e) => setNewMember({ ...newMember, fecha_nacimiento: e.target.value })}
                  sx={{ width: 140 }}
                />
                <TextField
                  label="Grado" size="small" value={newMember.grado_escolar}
                  onChange={(e) => setNewMember({ ...newMember, grado_escolar: e.target.value })}
                  sx={{ width: 100 }}
                />
                <Button variant="contained" onClick={handleAddMember} startIcon={<AddIcon />} sx={{ borderRadius: 1 }}>
                  Cargar
                </Button>
              </Stack>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "action.selected" }}>
                    <TableCell sx={{ fontWeight: 700 }}>Apellido</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Nombre</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>DNI</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Nacimiento</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Edad</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}><CircularProgress size={24} /></TableCell></TableRow>
                  ) : familyMembers.length === 0 ? (
                    <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}><Typography variant="body2" color="text.secondary">No hay familiares registrados.</Typography></TableCell></TableRow>
                  ) : (
                    familyMembers.map((member: any) => (
                      <TableRow key={member.id} hover>
                        <TableCell>{member.apellido}</TableCell>
                        <TableCell>{member.nombre}</TableCell>
                        <TableCell>{member.dni || "-"}</TableCell>
                        <TableCell>{member.fecha_nacimiento ? new Date(member.fecha_nacimiento).toLocaleDateString("es-AR", { timeZone: "UTC" }) : "-"}</TableCell>
                        <TableCell>{member.edad ?? calculateAge(member.fecha_nacimiento) ?? "-"}</TableCell>
                        <TableCell align="center">
                          <IconButton size="small" color="error" onClick={() => handleDeleteMember(member.id!)}><DeleteIcon fontSize="small" /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, bgcolor: 'action.hover' }}>
        <Button onClick={onClose} variant="outlined" sx={{ fontWeight: 600, borderRadius: 1 }}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}
