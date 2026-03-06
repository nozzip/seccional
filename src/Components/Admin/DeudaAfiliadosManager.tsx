import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Stack,
  alpha,
  useTheme,
  InputAdornment,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  CloseIcon,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import HistoryIcon from "@mui/icons-material/History";
import CancelIcon from "@mui/icons-material/Close";
import * as XLSX from "xlsx";
import { supabase } from "../../supabaseClient";

interface AffiliateDebt {
  id: number;
  nombre_apellido: string;
  cuil_dni: string | null;
  importe: string | null;
  mes?: string | null;
  created_at?: string;
}

interface AffiliateDebtGroup {
  id: string; // unique key (combination of cuil or name)
  nombre_apellido: string;
  cuil_dni: string | null;
  history: AffiliateDebt[];
}

export default function DeudaAfiliadosManager() {
  const [debts, setDebts] = useState<AffiliateDebt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDebts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("affiliate_debts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        if (error.code === "42P01") {
          console.warn("Table affiliate_debts does not exist yet.");
          setDebts([]);
        } else {
          throw error;
        }
      } else {
        setDebts(data || []);
      }
    } catch (error) {
      console.error("Error fetching affiliate debts:", error);
      setDebts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebts();
  }, []);

  const filteredGroups = useMemo(() => {
    const map = new Map<string, AffiliateDebtGroup>();

    debts.forEach((d) => {
      const key = (d.cuil_dni || d.nombre_apellido).toLowerCase().trim();
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          nombre_apellido: d.nombre_apellido,
          cuil_dni: d.cuil_dni,
          history: [],
        });
      }
      map.get(key)!.history.push(d);
    });

    const groups = Array.from(map.values()).sort((a, b) =>
      a.nombre_apellido.localeCompare(b.nombre_apellido),
    );

    const search = searchTerm.toLowerCase();
    return groups.filter((g) => {
      return (
        g.nombre_apellido.toLowerCase().includes(search) ||
        (g.cuil_dni || "").toLowerCase().includes(search) ||
        g.history.some(
          (h) =>
            (h.importe || "").toLowerCase().includes(search) ||
            (h.mes || "").toLowerCase().includes(search),
        )
      );
    });
  }, [debts, searchTerm]);

  const paginatedGroups = useMemo(() => {
    return filteredGroups.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage,
    );
  }, [filteredGroups, page, rowsPerPage]);

  const selectedGroup = useMemo(() => {
    if (!selectedGroupId) return null;
    return filteredGroups.find((g) => g.id === selectedGroupId) || null;
  }, [filteredGroups, selectedGroupId]);

  const handleDownloadTemplate = () => {
    const ws_data = [
      ["Nombre y apellido", "CUIL o DNI", "Mes", "Importe"],
      ["Perez Juan", "20-12345678-9", "Marzo", "5000"],
      ["Gomez Maria", "", "Enero", "No se registran pagos"],
      ["Vazquez Luis", "30123456", "Febrero", ""],
    ];
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Modelo Importacion");
    XLSX.writeFile(wb, "Modelo_Deuda_Pagos.xlsx");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });

        let data: any[] = [];
        for (const sheetName of wb.SheetNames) {
          const ws = wb.Sheets[sheetName];
          const sheetData = XLSX.utils.sheet_to_json(ws) as any[];
          data = data.concat(sheetData);
        }

        if (data.length === 0) {
          alert("El archivo está vacío o no tiene formatos válidos.");
          return;
        }

        setLoading(true);

        const { data: dbData, error: dbErr } = await supabase
          .from("affiliate_debts")
          .select("*");

        if (dbErr && dbErr.code === "42P01") {
          alert("Error: La tabla 'affiliate_debts' no existe.");
          setLoading(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }

        const existingData = dbData || [];
        const mapByKey = new Map<string, any>();

        const buildKey = (item: any) => {
          const namePart = (
            item.cuil_dni
              ? String(item.cuil_dni).trim()
              : String(item.nombre_apellido).trim()
          ).toLowerCase();
          const mesPart = item.mes
            ? String(item.mes).trim().toLowerCase()
            : "sin-mes";
          return `${namePart}_${mesPart}`;
        };

        existingData.forEach((item) => {
          mapByKey.set(buildKey(item), item);
        });

        const inserts = [];
        const updates = [];

        for (const row of data) {
          const keys = Object.keys(row);
          const nameKey = keys.find((k) => {
            const kl = k.toLowerCase();
            return (
              kl.includes("nombre") ||
              kl.includes("apellido") ||
              kl.includes("afiliado") ||
              kl.includes("name")
            );
          });
          const cuilKey = keys.find((k) => {
            const kl = k.toLowerCase();
            return (
              kl.includes("cuil") ||
              kl.includes("dni") ||
              kl.includes("documento")
            );
          });
          const mesKey = keys.find((k) => {
            const kl = k.toLowerCase();
            return (
              kl.includes("mes") ||
              kl.includes("periodo") ||
              kl.includes("fecha")
            );
          });
          const importeKey = keys.find((k) => {
            const kl = k.toLowerCase();
            return (
              kl.includes("importe") ||
              kl.includes("pago") ||
              kl.includes("monto") ||
              kl.includes("estado") ||
              kl.includes("deuda")
            );
          });

          const colName = nameKey ? row[nameKey] : undefined;
          const nombreApellido = String(colName || "").trim();

          const colCuil = cuilKey ? row[cuilKey] : undefined;
          const cuilDni = colCuil ? String(colCuil).trim() : null;

          const colMes = mesKey ? row[mesKey] : undefined;
          const mes = colMes ? String(colMes).trim() : null;

          const colImporte = importeKey ? row[importeKey] : undefined;
          let importe = colImporte ? String(colImporte).trim() : "";

          if (!importe || importe.trim().toLowerCase() === "undefined") {
            importe = "No se registran pagos";
          }

          if (!nombreApellido) continue;

          const rowKey = buildKey({
            cuil_dni: cuilDni,
            nombre_apellido: nombreApellido,
            mes,
          });

          if (mapByKey.has(rowKey)) {
            const existing = mapByKey.get(rowKey);
            // If we've already set id to -1, it means we pushed it to inserts in a previous iteration of THIS excel file.
            if (existing.id === -1) {
              // We just skip it to avoid duplicates from the same excel file
              continue;
            }
            updates.push({
              id: existing.id,
              nombre_apellido: nombreApellido,
              cuil_dni: cuilDni || existing.cuil_dni,
              importe,
              mes: mes || existing.mes,
              created_at: existing.created_at,
            });
            // Update the map to prevent duplicate updates if excel has the same row repeatedly
            existing.importe = importe;
            existing.cuil_dni = cuilDni || existing.cuil_dni;
            existing.mes = mes || existing.mes;
          } else {
            const newItem = {
              nombre_apellido: nombreApellido,
              cuil_dni: cuilDni,
              importe,
              mes,
            };
            inserts.push(newItem);
            // Give it a dummy map entry so duplicates in the same file don't insert twice
            mapByKey.set(rowKey, { ...newItem, id: -1 });
          }
        }

        if (updates.length > 0) {
          const chunkSize = 50;
          for (let i = 0; i < updates.length; i += chunkSize) {
            const chunk = updates.slice(i, i + chunkSize);
            const { error } = await supabase
              .from("affiliate_debts")
              .upsert(chunk);
            if (error) {
              console.error("Error al actualizar el bloque:", error);
              alert(
                `Hubo un error al actualizar registros. Detalle: ${error.message || error.details}`,
              );
            }
          }
        }

        if (inserts.length > 0) {
          const chunkSize = 50;
          for (let i = 0; i < inserts.length; i += chunkSize) {
            const chunk = inserts.slice(i, i + chunkSize);
            const { error } = await supabase
              .from("affiliate_debts")
              .insert(chunk);
            if (error) {
              console.error("Error al insertar el bloque:", error);
              alert(
                `Hubo un error al insertar registros. Detalle: ${error.message || error.details}`,
              );
            }
          }
        }

        const total = inserts.length + updates.length;
        alert(
          `Importación completada con éxito. Se procesaron ${total} registros (${inserts.length} nuevos, ${updates.length} actualizados).`,
        );
        fetchDebts();
      } catch (err) {
        console.error(err);
        alert(
          "Error procesando el archivo de importación. Verifique el formato.",
        );
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Seguro que desea eliminar este registro?")) return;
    try {
      const { error } = await supabase
        .from("affiliate_debts")
        .delete()
        .eq("id", id);
      if (error) throw error;
      fetchDebts();
    } catch (err) {
      console.error("Error al eliminar", err);
      alert("Error al eliminar el registro.");
    }
  };

  const handleDeleteAllGroup = async (g: AffiliateDebtGroup) => {
    if (
      !window.confirm(
        `¿Seguro que desea eliminar TODOS los registros del historial de ${g.nombre_apellido}?`,
      )
    )
      return;
    try {
      for (const record of g.history) {
        await supabase.from("affiliate_debts").delete().eq("id", record.id);
      }
      fetchDebts();
      if (selectedGroupId === g.id) setHistoryOpen(false);
    } catch (err) {
      console.error("Error eliminando historial del afiliado", err);
      alert("Error al eliminar los registros del afiliado.");
    }
  };

  const handleDeleteAll = async () => {
    if (
      !window.confirm(
        "ATENCIÓN: ¿Seguro que desea eliminar TODOS los registros importados? Esta acción vaciará la tabla y no se puede deshacer.",
      )
    )
      return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("affiliate_debts")
        .select("id");
      if (error) throw error;
      if (data && data.length > 0) {
        await supabase.from("affiliate_debts").delete().neq("id", 0);
      }
      alert("Todos los registros han sido eliminados.");
      fetchDebts();
    } catch (err) {
      console.error("Error vaciando tabla", err);
      alert("Error al vaciar los registros.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <MoneyOffIcon color="error" sx={{ fontSize: 40 }} />
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, color: "error.main" }}
            >
              Control Deuda / Pagos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Importación independiente - Separado del Padrón
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            onClick={handleDownloadTemplate}
            startIcon={<DownloadIcon />}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            Modelo Importación
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<FileUploadIcon />}
            onClick={() => fileInputRef.current?.click()}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            Importar Excel
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteAll}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            Vaciar Lista
          </Button>
          <input
            type="file"
            accept=".xlsx, .xls"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={handleImport}
          />
        </Box>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          mb: 4,
        }}
      >
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <TextField
            placeholder="Buscar por nombre, apellido, CUIL/DNI, mes o estado..."
            size="small"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: 450 }}
          />
        </Stack>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}
              >
                <TableCell sx={{ fontWeight: 800 }}>
                  Nombre y Apellido
                </TableCell>
                <TableCell sx={{ fontWeight: 800 }}>CUIL / DNI</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Historial</TableCell>
                <TableCell sx={{ fontWeight: 800 }} align="center">
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      Cargando registros...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedGroups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      No se encontraron registros importados.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedGroups.map((g) => (
                  <TableRow key={g.id} hover>
                    <TableCell sx={{ fontWeight: 700 }}>
                      {g.nombre_apellido}
                    </TableCell>
                    <TableCell>
                      {g.cuil_dni || (
                        <Typography variant="caption" color="text.secondary">
                          Sin especificar
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<HistoryIcon />}
                        onClick={() => {
                          setSelectedGroupId(g.id);
                          setHistoryOpen(true);
                        }}
                        sx={{ borderRadius: 2 }}
                      >
                        Ver Historial ({g.history.length})
                      </Button>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Eliminar TODOS los registros de este afiliado">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDeleteAllGroup(g)}
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
        <TablePagination
          component="div"
          count={filteredGroups.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Afiliados por página"
        />
      </Paper>

      <Dialog
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, color: "primary.main" }}
            >
              Historial de Pagos / Deuda
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Afiliado: {selectedGroup?.nombre_apellido}
            </Typography>
          </Box>
          <IconButton onClick={() => setHistoryOpen(false)} size="small">
            <CancelIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <Table size="small">
              <TableHead>
                <TableRow
                  sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}
                >
                  <TableCell sx={{ fontWeight: 700 }}>Mes / Periodo</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    Importe o Estado
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Fecha Carga</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Eliminar
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedGroup?.history?.map((h: any) => (
                  <TableRow key={h.id}>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {h.mes || "-"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={h.importe || "Sin datos"}
                        color={
                          !h.importe ||
                          h.importe.toLowerCase().includes("no se registran")
                            ? "default"
                            : "error"
                        }
                        size="small"
                        variant={
                          !h.importe ||
                          h.importe.toLowerCase().includes("no se registran")
                            ? "outlined"
                            : "filled"
                        }
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell>
                      {h.created_at
                        ? new Date(h.created_at).toLocaleDateString("es-AR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })
                        : "-"}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDelete(h.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {(!selectedGroup?.history ||
                  selectedGroup.history.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        Sin registros en el historial
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
