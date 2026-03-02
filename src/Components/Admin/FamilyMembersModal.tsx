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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import PersonIcon from "@mui/icons-material/Person";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import { supabase } from "../../supabaseClient";

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

interface FamilyMembersModalProps {
  open: boolean;
  onClose: () => void;
  affiliate: {
    id: number;
    nombre: string;
    apellido: string;
    cuil: string;
  } | null;
}

export default function FamilyMembersModal({
  open,
  onClose,
  affiliate,
}: FamilyMembersModalProps) {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMember, setNewMember] = useState<Partial<FamilyMember>>({
    nombre: "",
    apellido: "",
    dni: "",
    fecha_nacimiento: "",
    edad: undefined,
    grado_escolar: "",
  });

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

  useEffect(() => {
    if (open && affiliate) {
      fetchFamilyMembers();
    }
  }, [open, affiliate]);

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

      console.log("Inserción de familiar:", memberToInsert);

      const { error } = await supabase
        .from("affiliate_family_members")
        .insert([memberToInsert]);

      if (error) {
        console.error("Error de Supabase:", error);
        alert("Error al cargar familiar: " + error.message);
        throw error;
      }

      fetchFamilyMembers();
      setNewMember({
        nombre: "",
        apellido: "",
        dni: "",
        fecha_nacimiento: "",
        edad: undefined,
        grado_escolar: "",
      });
    } catch (error) {
      console.error("Error adding family member:", error);
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
      fetchFamilyMembers();
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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: { borderRadius: 3, p: 1 },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <ChildCareIcon color="primary" sx={{ fontSize: 30 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Grupo Familiar
            </Typography>
            {affiliate && (
              <Typography variant="body2" color="text.secondary">
                Titular: {affiliate.apellido}, {affiliate.nombre} (
                {affiliate.cuil})
              </Typography>
            )}
          </Box>
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent>
        {/* Form to add new member */}
        <Box
          sx={{
            mb: 4,
            p: 2,
            backgroundColor: "background.default",
            borderRadius: 2,
            border: "1px dashed",
            borderColor: "primary.main",
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>
            Agregar Familiar
          </Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Nombre"
              size="small"
              value={newMember.nombre}
              onChange={(e) =>
                setNewMember({ ...newMember, nombre: e.target.value })
              }
              sx={{ flex: 2 }}
            />
            <TextField
              label="Apellido"
              size="small"
              value={newMember.apellido}
              onChange={(e) =>
                setNewMember({ ...newMember, apellido: e.target.value })
              }
              sx={{ flex: 2 }}
            />
            <TextField
              label="DNI"
              size="small"
              value={newMember.dni}
              onChange={(e) =>
                setNewMember({ ...newMember, dni: e.target.value })
              }
              sx={{ flex: 1.5 }}
            />
            <TextField
              label="Nacimiento"
              type="date"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={newMember.fecha_nacimiento}
              onChange={(e) =>
                setNewMember({ ...newMember, fecha_nacimiento: e.target.value })
              }
              sx={{ flex: 1.5 }}
            />
            <TextField
              label="Edad"
              type="number"
              size="small"
              value={newMember.edad || ""}
              onChange={(e) =>
                setNewMember({
                  ...newMember,
                  edad: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              sx={{ flex: 0.8 }}
            />
            <TextField
              label="Grado"
              size="small"
              value={newMember.grado_escolar}
              onChange={(e) =>
                setNewMember({ ...newMember, grado_escolar: e.target.value })
              }
              sx={{ flex: 1 }}
            />
            <Button
              variant="contained"
              onClick={handleAddMember}
              startIcon={<AddIcon />}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Cargar
            </Button>
          </Stack>
        </Box>

        {/* Family Members Table */}
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "action.hover" }}>
                <TableCell sx={{ fontWeight: 700 }}>Apellido</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>DNI</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Nacimiento</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Edad</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Grado</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : familyMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No hay familiares registrados.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                familyMembers.map((member: any) => (
                  <TableRow key={member.id} hover>
                    <TableCell>{member.apellido}</TableCell>
                    <TableCell>{member.nombre}</TableCell>
                    <TableCell>{member.dni || "-"}</TableCell>
                    <TableCell>
                      {member.fecha_nacimiento
                        ? new Date(member.fecha_nacimiento).toLocaleDateString(
                            "es-AR",
                            { timeZone: "UTC" },
                          )
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {member.edad !== null && member.edad !== undefined
                        ? member.edad
                        : calculateAge(member.fecha_nacimiento) || "-"}
                    </TableCell>
                    <TableCell>{member.grado_escolar || "-"}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteMember(member.id!)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ fontWeight: 600 }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
