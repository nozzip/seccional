import React, { useState, useEffect, useMemo } from "react";
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
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Snackbar,
  Stack,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  SelectChangeEvent,
  Chip,
  TablePagination,
  Badge,
  Tabs,
  Tab,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import * as XLSX from "xlsx";
import { supabase } from "../../supabaseClient";
import FamilyMembersModal from "./FamilyMembersModal";
import AddAffiliateModal from "./AddAffiliateModal";

interface Affiliate {
  id: number;
  cuil: string;
  legajo: string;
  apellido: string;
  nombre: string;
  provincia: string;
  ciudad: string;
  sexo: string;
  branch: string;
  family_count?: number;
  _searchStr?: string;
}

export interface FamilyMemberDetail {
  id: number;
  affiliate_id: number;
  nombre: string;
  apellido: string;
  dni: string;
  fecha_nacimiento: string | null;
  edad: number | null;
  grado_escolar: string | null;
  // Parent details attached after fetch
  parent_cuil: string;
  parent_nombre: string;
  parent_apellido: string;
  parent_provincia: string;
  parent_ciudad: string;
  _searchStr?: string;
  _inferredGender?: string;
}

// Robust Gender Inference Logic for Spanish Names
const inferGender = (fullName: string): string => {
  const names = fullName.toUpperCase().split(" ");
  const first = names[0] || "";
  const second = names[1] || "";

  // Exceptions and specific names
  const femaleExceptions = [
    "MARIA",
    "ANA",
    "NOELIA",
    "BELEN",
    "CARLA",
    "ANDREA",
    "MONICA",
    "SILVIA",
    "PATRICIA",
    "LUCIA",
    "BEATRIZ",
    "INES",
    "MERCEDES",
    "RAQUEL",
    "CARMEN",
    "IRIS",
    "GLADYS",
    "ESTER",
    "MIRTA",
    "ZULMA",
    "RITA",
    "SARA",
    "ELSA",
    "DELIA",
    "SOLEDAD",
    "MABEL",
    "MYRIAM",
    "NOEMI",
    "MARILY",
    "LIDIA",
    "ROSA",
    "STELLA",
    "TERESA",
    "ELENA",
    "MARTA",
    "OLGA",
    "SONIA",
    "ALICIA",
    "NANCY",
    "GLORIA",
    "VILMA",
    "RUTH",
    "IRMA",
    "HILDA",
    "DORA",
    "CLARA",
    "NORA",
    "EDITA",
    "JUANA",
    "EVA",
    "CYNTIA",
    "CELIA",
    "MARCELA",
    "LILIANA",
    "ROSANA",
    "VANINA",
    "LUCIANA",
    "GABRIELA",
    "DAIANA",
    "GEORGINA",
    "CRISTINA",
    "MARIANA",
  ];
  const maleExceptions = [
    "JOSE",
    "LUIS",
    "ANGEL",
    "ARIEL",
    "GABRIEL",
    "MANUEL",
    "JAVIER",
    "RUBEN",
    "DANIEL",
    "MIGUEL",
    "RAUL",
    "JUAN",
    "CARLOS",
    "HECTOR",
    "VICTOR",
    "FACUNDO",
    "NESTOR",
    "OMAR",
    "CESAR",
    "RENE",
    "CELSO",
    "AGUSTIN",
    "ELISEO",
    "HUGO",
    "JULIO",
    "NICOLAS",
    "TOMAS",
    "DAVID",
    "WILLY",
    "IVAN",
    "GUSTAVO",
    "RICARDO",
    "EDGARDO",
    "ERNESTO",
    "ALEJANDRO",
  ];

  if (femaleExceptions.includes(first)) return "Mujer";
  if (maleExceptions.includes(first)) return "Hombre";

  // Composite names: "MARIA JOSE" -> Mujer, "JOSE MARIA" -> Hombre
  if (first === "MARIA" && second && maleExceptions.includes(second))
    return "Mujer";
  if (first === "JOSE" && second && femaleExceptions.includes(second))
    return "Hombre";

  // Common endings
  if (first.endsWith("A")) return "Mujer";
  if (
    first.endsWith("O") ||
    first.endsWith("E") ||
    first.endsWith("L") ||
    first.endsWith("N") ||
    first.endsWith("R") ||
    first.endsWith("S") ||
    first.endsWith("Z") ||
    first.endsWith("U") ||
    first.endsWith("I")
  ) {
    return "Hombre";
  }

  return "Otro";
};

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const calculateAge = (dateString: string | null): number | null => {
  if (!dateString) return null;
  const today = new Date();
  const birthDate = new Date(dateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export default function AfiliadosManager() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(""); // Immediate UI state
  const [debouncedSearch, setDebouncedSearch] = useState(""); // Filter state
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [importing, setImporting] = useState(false);
  const [importingFamily, setImportingFamily] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState(0); // 0: Titulares, 1: Familiares
  const [allFamilyMembers, setAllFamilyMembers] = useState<
    FamilyMemberDetail[]
  >([]);

  // Modal State
  const [selectedAffiliate, setSelectedAffiliate] = useState<any>(null);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Pagination State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Multi-select Filter State
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);

  // Age Filters for Familiares Tab
  const [minAge, setMinAge] = useState<number | "">("");
  const [maxAge, setMaxAge] = useState<number | "">("");

  // Debounce search input - Reduced to 150ms for snappier feel
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(0); // Reset to first page on search
    }, 150);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchAffiliates = async () => {
    setLoading(true);
    try {
      // Fetch affiliates and family members in parallel for better performance
      const [affResponse, famResponse] = await Promise.all([
        supabase
          .from("affiliates")
          .select("*")
          .eq("branch", "noroeste")
          .order("apellido", { ascending: true }),
        supabase.from("affiliate_family_members").select("*"), // Fetch entirely to build Family members tab
      ]);

      if (affResponse.error) throw affResponse.error;
      if (famResponse.error) throw famResponse.error;

      // Group counts by affiliate_id
      const countMap: Record<number, number> = {};
      (famResponse.data || []).forEach((f: any) => {
        countMap[f.affiliate_id] = (countMap[f.affiliate_id] || 0) + 1;
      });

      const affsWithSearch = (affResponse.data || []).map((a: any) => ({
        ...a,
        family_count: countMap[a.id] || 0,
        _searchStr:
          `${a.nombre} ${a.apellido} ${a.cuil} ${a.legajo} ${a.dni}`.toLowerCase(),
      }));

      // Build Family Member Details
      const familyDetails: FamilyMemberDetail[] = (famResponse.data || [])
        .map((f: any) => {
          // Find parent locally inside affsWithSearch for speed
          const parent = affsWithSearch.find(
            (parentItem: any) => parentItem.id === f.affiliate_id,
          );

          return {
            ...f,
            parent_cuil: parent?.cuil || "",
            parent_nombre: parent?.nombre || "",
            parent_apellido: parent?.apellido || "",
            parent_provincia: parent?.provincia || "",
            parent_ciudad: parent?.ciudad || "",
            _inferredGender: inferGender(f.nombre),
            _searchStr:
              `${f.nombre} ${f.apellido} ${f.dni} ${parent?.nombre} ${parent?.apellido} ${parent?.cuil}`.toLowerCase(),
          };
        })
        .filter((f: FamilyMemberDetail) => f.parent_cuil); // Only keep if parent in Noroeste

      setAffiliates(affsWithSearch);
      setAllFamilyMembers(familyDetails);
    } catch (error: any) {
      console.error("Error fetching affiliates:", error);
      setErrorMessage("Error al cargar los afiliados: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAffiliates();
  }, []);

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          setErrorMessage("El archivo Excel está vacío.");
          setImporting(false);
          return;
        }

        // Map and validate data
        const formattedData = data.map((row: any) => {
          const nombre = String(row.NOMBRE || row.nombre || "");
          const sexoExcel = row.SEXO || row.sexo;
          return {
            cuil: String(row.CUIL || row.cuil || ""),
            legajo: String(row.LEGAJO || row.legajo || ""),
            apellido: String(row.APELLIDO || row.apellido || ""),
            nombre: nombre,
            provincia: String(row.PROVINCIA || row.provincia || ""),
            ciudad: String(row.CIUDAD || row.ciudad || ""),
            sexo: sexoExcel ? String(sexoExcel) : inferGender(nombre),
            branch: "noroeste",
          };
        });

        const { error } = await supabase
          .from("affiliates")
          .insert(formattedData);
        if (error) throw error;

        setShowSuccess(true);
        fetchAffiliates();
      } catch (error: any) {
        console.error("Error importing Excel:", error);
        setErrorMessage("Error al importar Excel: " + error.message);
      } finally {
        setImporting(false);
        e.target.value = ""; // Clear input
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImportFamilyExcel = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportingFamily(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          setErrorMessage("El archivo Excel está vacío.");
          setImportingFamily(false);
          return;
        }

        // 1. Get all affiliates and existing family members to match parents and prevent duplicates
        const [
          { data: allAffiliates, error: affErr },
          { data: existingFamily, error: famErr },
        ] = await Promise.all([
          supabase
            .from("affiliates")
            .select("id, cuil")
            .eq("branch", "noroeste"),
          supabase
            .from("affiliate_family_members")
            .select("affiliate_id, nombre, apellido, dni"),
        ]);

        if (affErr) throw affErr;
        if (famErr) throw famErr;

        // Create lookups for existing children to prevent duplicates
        const existingNames = new Set(
          (existingFamily || []).map(
            (f) =>
              `${f.affiliate_id}|${f.nombre.trim().toLowerCase()}|${f.apellido.trim().toLowerCase()}`,
          ),
        );
        const existingDNIs = new Set(
          (existingFamily || []).map((f) => f.dni?.trim()).filter(Boolean),
        );

        // 2. Map family members
        const formattedFamily = [];
        const skippedDetails: string[] = [];
        let duplicateCount = 0;

        for (const row of data as any[]) {
          // Helper to safely find keys ignoring case and whitespace
          const getVal = (possibleKeys: string[]) => {
            for (const key of Object.keys(row)) {
              if (possibleKeys.includes(key.trim().toLowerCase())) {
                return row[key];
              }
            }
            return undefined;
          };

          const affCuil = String(
            getVal(["afiliado cuil", "cuil titular"]) || "",
          ).trim();
          const nombre = String(getVal(["nombre"]) || "").trim();
          const apellido = String(getVal(["apellido"]) || "").trim();
          const dni = String(
            getVal([
              "doc nro",
              "doc nro.",
              "doc. nro.",
              "documento numer.",
              "documento numer",
              "dni",
              "documento",
            ]) || "",
          ).trim();

          const childDisplay = `${apellido}, ${nombre} (Titular: ${affCuil})`;

          // Find parent by CUIL
          const parent = allAffiliates.find((a) => a.cuil.trim() === affCuil);

          if (parent) {
            // Check for duplicate by name OR by DNI
            const nameKey = `${parent.id}|${nombre.toLowerCase()}|${apellido.toLowerCase()}`;
            const isDuplicate =
              existingNames.has(nameKey) || (dni && existingDNIs.has(dni));

            if (isDuplicate) {
              duplicateCount++;
              continue;
            }

            // Read Edad (support various cases)
            const edadRaw = getVal(["edad", "edad del hijo", "edad actual"]);
            const edad =
              typeof edadRaw === "number"
                ? edadRaw
                : parseInt(String(edadRaw), 10);

            // Read Birth date if present (backup)
            let fechaNacFormatted = null;
            let rawBday = getVal([
              "fecha nac.",
              "fecha nac",
              "fecha de nac",
              "fecha de nac.",
              "nacimiento",
              "fecha nacimiento",
              "fecha de nacimiento",
            ]);

            if (rawBday) {
              try {
                if (typeof rawBday === "number") {
                  const d = XLSX.SSF.parse_date_code(rawBday);
                  fechaNacFormatted = `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
                } else {
                  const parts = String(rawBday).split(/[\/\-]/);
                  if (parts.length === 3 && parts[2].length === 4) {
                    fechaNacFormatted = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
                  } else {
                    const parsed = new Date(rawBday);
                    if (!isNaN(parsed.getTime()))
                      fechaNacFormatted = parsed.toISOString().split("T")[0];
                  }
                }
              } catch (e) {
                console.warn("Date parse err", e);
              }
            }

            const gradoRaw = getVal(["grado", "grado escolar", "año"]);

            formattedFamily.push({
              affiliate_id: parent.id,
              apellido: apellido,
              nombre: nombre,
              dni: dni || null,
              edad: isNaN(edad) ? null : edad,
              fecha_nacimiento: fechaNacFormatted,
              grado_escolar: String(gradoRaw || ""),
            });

            // Local batch deduplication
            existingNames.add(nameKey);
            if (dni) existingDNIs.add(dni);
          } else {
            skippedDetails.push(childDisplay);
          }
        }

        if (formattedFamily.length > 0) {
          const { error } = await supabase
            .from("affiliate_family_members")
            .insert(formattedFamily);
          if (error) throw error;
          setShowSuccess(true);
        }

        if (skippedDetails.length > 0 || duplicateCount > 0) {
          let message = `Resultados de importación:\n`;
          message += `- ${formattedFamily.length} hijos importados con éxito.\n`;
          if (duplicateCount > 0)
            message += `- ${duplicateCount} registros omitidos por estar ya registrados.\n`;

          if (skippedDetails.length > 0) {
            message += `\n- ${skippedDetails.length} omitidos por no encontrar al titular:\n`;
            message += skippedDetails.slice(0, 10).join("\n");
            if (skippedDetails.length > 10)
              message += `\n... y ${skippedDetails.length - 10} más.`;
          }

          alert(message);
        }
      } catch (error: any) {
        console.error("Error importing family Excel:", error);
        setErrorMessage("Error al importar familiares: " + error.message);
      } finally {
        setImportingFamily(false);
        e.target.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDeleteAllFamilyMembers = async () => {
    if (
      !window.confirm(
        "¿Está seguro de eliminar TODOS los familiares cargados? Esta acción no se puede deshacer.",
      )
    )
      return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from("affiliate_family_members")
        .delete()
        .neq("id", 0); // Hack to delete all if RLS allows and no filter provided

      if (error) throw error;
      alert("Todos los familiares han sido eliminados.");
      fetchAffiliates();
    } catch (error: any) {
      setErrorMessage("Error al vaciar familiares: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAffiliate = async (id: number) => {
    if (!window.confirm("¿Está seguro de eliminar este afiliado?")) return;
    try {
      const { error } = await supabase.from("affiliates").delete().eq("id", id);
      if (error) throw error;
      fetchAffiliates();
    } catch (error: any) {
      setErrorMessage("Error al eliminar: " + error.message);
    }
  };

  // Derive filter options
  const provinces = useMemo(
    () => Array.from(new Set(affiliates.map((a) => a.provincia))).sort(),
    [affiliates],
  );
  const cities = useMemo(() => {
    const filteredByProv =
      selectedProvinces.length > 0
        ? affiliates.filter((a) => selectedProvinces.includes(a.provincia))
        : affiliates;
    return Array.from(new Set(filteredByProv.map((a) => a.ciudad))).sort();
  }, [affiliates, selectedProvinces]);
  const genders = useMemo(
    () =>
      Array.from(new Set(affiliates.map((a) => a.sexo).filter(Boolean))).sort(),
    [affiliates],
  );

  const filteredAffiliates = useMemo(() => {
    const searchLow = debouncedSearch.toLowerCase();
    return affiliates.filter((a: any) => {
      const matchesSearch = !searchLow || a._searchStr.includes(searchLow);
      const matchesProv =
        selectedProvinces.length === 0 ||
        selectedProvinces.includes(a.provincia);
      const matchesCity =
        selectedCities.length === 0 || selectedCities.includes(a.ciudad);
      const matchesGender =
        selectedGenders.length === 0 || selectedGenders.includes(a.sexo);

      return matchesSearch && matchesProv && matchesCity && matchesGender;
    });
  }, [
    affiliates,
    debouncedSearch,
    selectedProvinces,
    selectedCities,
    selectedGenders,
  ]);

  const filteredFamilyMembers = useMemo(() => {
    const searchLow = debouncedSearch.toLowerCase();
    const min = minAge === "" ? 0 : Number(minAge);
    const max = maxAge === "" ? 999 : Number(maxAge);

    return allFamilyMembers.filter((f) => {
      const matchesSearch = !searchLow || f._searchStr?.includes(searchLow);
      const matchesProv =
        selectedProvinces.length === 0 ||
        selectedProvinces.includes(f.parent_provincia);
      const matchesCity =
        selectedCities.length === 0 || selectedCities.includes(f.parent_ciudad);
      const matchesGender =
        selectedGenders.length === 0 ||
        selectedGenders.includes(f._inferredGender || "");

      let ageToUse = f.edad;
      if (ageToUse === null || ageToUse === undefined) {
        ageToUse = calculateAge(f.fecha_nacimiento);
      }

      const matchesAge =
        ageToUse !== null
          ? ageToUse >= min && ageToUse <= max
          : min === 0 && max === 999;

      return (
        matchesSearch &&
        matchesProv &&
        matchesCity &&
        matchesGender &&
        matchesAge
      );
    });
  }, [
    allFamilyMembers,
    debouncedSearch,
    selectedProvinces,
    selectedCities,
    selectedGenders,
    minAge,
    maxAge,
  ]);

  // Paginated Data
  const paginatedAffiliates = useMemo(() => {
    return filteredAffiliates.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage,
    );
  }, [filteredAffiliates, page, rowsPerPage]);

  const paginatedFamilyMembers = useMemo(() => {
    return filteredFamilyMembers.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage,
    );
  }, [filteredFamilyMembers, page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange =
    (setter: React.Dispatch<React.SetStateAction<string[]>>) =>
    (event: SelectChangeEvent<string[]>) => {
      const {
        target: { value },
      } = event;
      setter(typeof value === "string" ? value.split(",") : value);
      setPage(0); // Reset to first page on filter change
    };

  const handleExportFiltrados = () => {
    if (activeTab === 0) {
      // Export Titulares
      const exportData = filteredAffiliates.map((a) => ({
        CUIL: a.cuil,
        LEGAJO: a.legajo,
        APELLIDO: a.apellido,
        NOMBRE: a.nombre,
        PROVINCIA: a.provincia,
        CIUDAD: a.ciudad,
        SEXO: a.sexo,
        CANT_HIJOS: a.family_count || 0,
      }));
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Titulares Filtrados");
      XLSX.writeFile(wb, "Titulares_Filtrados.xlsx");
    } else {
      // Export Familiares
      const exportData = filteredFamilyMembers.map((member) => {
        let ageToUse = member.edad;
        if (ageToUse === null || ageToUse === undefined) {
          ageToUse = calculateAge(member.fecha_nacimiento);
        }

        return {
          "Hijo/a - Apellido": member.apellido,
          "Hijo/a - Nombre": member.nombre,
          "Hijo/a - DNI": member.dni || "N/A",
          "Hijo/a - Edad": ageToUse !== null ? ageToUse : "N/A",
          "Hijo/a - Fecha Nac.": member.fecha_nacimiento || "N/A",
          "Hijo/a - Grado Escolar": member.grado_escolar || "N/A",
          "Titular - Apellido": member.parent_apellido,
          "Titular - Nombre": member.parent_nombre,
          "Titular - CUIL": member.parent_cuil,
          "Titular - Provincia": member.parent_provincia,
          "Titular - Ciudad": member.parent_ciudad,
        };
      });

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Familiares Filtrados");
      XLSX.writeFile(wb, "Familiares_Filtrados.xlsx");
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
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
        <Stack direction="row" spacing={2} alignItems="center">
          <PeopleIcon color="primary" sx={{ fontSize: 40 }} />
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, color: "primary.main" }}
            >
              Gestión de Afiliados
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Administración de afiliados de la sede Noroeste
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddIcon />}
            onClick={() => setIsAddModalOpen(true)}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "0 4px 14px 0 rgba(0,118,255,0.39)",
            }}
          >
            Nuevo Afiliado
          </Button>

          <Button
            variant="outlined"
            component="label"
            startIcon={
              importingFamily ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <ChildCareIcon />
              )
            }
            disabled={importingFamily}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            {importingFamily ? "Importando Hijos..." : "Importar Hijos"}
            <input
              type="file"
              hidden
              accept=".xlsx, .xls"
              onChange={handleImportFamilyExcel}
            />
          </Button>

          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteAllFamilyMembers}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Vaciar Hijos
          </Button>

          <Button
            variant="outlined"
            color="success"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportFiltrados}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Exportar Resultados
          </Button>

          <Button
            variant="contained"
            component="label"
            startIcon={
              importing ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <FileUploadIcon />
              )
            }
            disabled={importing}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "0 4px 14px 0 rgba(0,118,255,0.39)",
            }}
          >
            {importing ? "Importando..." : "Importar Afiliados"}
            <input
              type="file"
              hidden
              accept=".xlsx, .xls"
              onChange={handleImportExcel}
            />
          </Button>
        </Stack>
      </Box>

      {/* Tabs for View Switching */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => {
            setActiveTab(newValue);
            setPage(0); // Reset page on tab change
          }}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab
            label="Titulares"
            sx={{ fontWeight: 600, textTransform: "none", fontSize: "1rem" }}
          />
          <Tab
            label="Familiares"
            sx={{ fontWeight: 600, textTransform: "none", fontSize: "1rem" }}
          />
        </Tabs>
      </Box>

      {/* Advanced Filters */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
          <FilterAltIcon fontSize="small" color="primary" />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Filtros Avanzados
          </Typography>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "2fr 1fr 1fr 1fr" },
            gap: 2,
          }}
        >
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            placeholder="Buscar por nombre, apellido, CUIL o legajo..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />

          {activeTab === 1 && (
            <>
              <TextField
                fullWidth
                size="small"
                label="Edad Mínima"
                type="number"
                value={minAge}
                onChange={(e) =>
                  setMinAge(e.target.value === "" ? "" : Number(e.target.value))
                }
                inputProps={{ min: 0, max: 100 }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
              <TextField
                fullWidth
                size="small"
                label="Edad Máxima"
                type="number"
                value={maxAge}
                onChange={(e) =>
                  setMaxAge(e.target.value === "" ? "" : Number(e.target.value))
                }
                inputProps={{ min: 0, max: 100 }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </>
          )}

          <FormControl fullWidth size="small">
            <InputLabel>Provincia</InputLabel>
            <Select
              multiple
              value={selectedProvinces}
              onChange={handleFilterChange(setSelectedProvinces)}
              input={
                <OutlinedInput label="Provincia" sx={{ borderRadius: 2 }} />
              }
              renderValue={(selected) => selected.join(", ")}
              MenuProps={MenuProps}
            >
              {provinces.map((prov) => (
                <MenuItem key={prov} value={prov}>
                  <Checkbox checked={selectedProvinces.includes(prov)} />
                  <ListItemText primary={prov} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Ciudad</InputLabel>
            <Select
              multiple
              value={selectedCities}
              onChange={handleFilterChange(setSelectedCities)}
              input={<OutlinedInput label="Ciudad" sx={{ borderRadius: 2 }} />}
              renderValue={(selected) => selected.join(", ")}
              MenuProps={MenuProps}
            >
              {cities.map((city) => (
                <MenuItem key={city} value={city}>
                  <Checkbox checked={selectedCities.includes(city)} />
                  <ListItemText primary={city} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Sexo</InputLabel>
            <Select
              multiple
              value={selectedGenders}
              onChange={handleFilterChange(setSelectedGenders)}
              input={<OutlinedInput label="Sexo" sx={{ borderRadius: 2 }} />}
              renderValue={(selected) => selected.join(", ")}
              MenuProps={MenuProps}
            >
              {genders.map((gen) => (
                <MenuItem key={gen} value={gen}>
                  <Checkbox checked={selectedGenders.includes(gen)} />
                  <ListItemText primary={gen} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {(selectedProvinces.length > 0 ||
          selectedCities.length > 0 ||
          selectedGenders.length > 0) && (
          <Button
            size="small"
            variant="text"
            onClick={() => {
              setSelectedProvinces([]);
              setSelectedCities([]);
              setSelectedGenders([]);
              setPage(0);
            }}
            sx={{
              alignSelf: "flex-start",
              textTransform: "none",
              color: "text.secondary",
            }}
          >
            Limpiar filtros
          </Button>
        )}
      </Paper>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}
      >
        <Table stickyHeader>
          {activeTab === 0 ? (
            <>
              <TableHead>
                <TableRow>
                  {[
                    "CUIL",
                    "LEGAJO",
                    "APELLIDO",
                    "NOMBRE",
                    "PROVINCIA",
                    "CIUDAD",
                    "SEXO",
                  ].map((header) => (
                    <TableCell
                      key={header}
                      sx={{
                        fontWeight: 700,
                        backgroundColor: "background.paper",
                        borderBottom: "2px solid",
                        borderColor: "divider",
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      backgroundColor: "background.paper",
                      borderBottom: "2px solid",
                      borderColor: "divider",
                    }}
                  >
                    ACCIONES
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                      <CircularProgress />
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        Cargando titulares...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredAffiliates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                      <Typography variant="body1" color="text.secondary">
                        No se encontraron titulares.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedAffiliates.map((affiliate) => (
                    <TableRow hover key={affiliate.id}>
                      <TableCell>{affiliate.cuil}</TableCell>
                      <TableCell>{affiliate.legajo}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {affiliate.apellido}
                      </TableCell>
                      <TableCell>{affiliate.nombre}</TableCell>
                      <TableCell>{affiliate.provincia}</TableCell>
                      <TableCell>{affiliate.ciudad}</TableCell>
                      <TableCell>
                        <Chip
                          label={affiliate.sexo}
                          size="small"
                          color={
                            affiliate.sexo === "Hombre"
                              ? "primary"
                              : affiliate.sexo === "Mujer"
                                ? "secondary"
                                : "default"
                          }
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.7rem",
                            height: 20,
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="center"
                        >
                          <Tooltip title="Grupo Familiar">
                            <IconButton
                              color="primary"
                              onClick={() => {
                                setSelectedAffiliate(affiliate);
                                setIsFamilyModalOpen(true);
                              }}
                            >
                              <Badge
                                badgeContent={affiliate.family_count}
                                color="secondary"
                                invisible={!affiliate.family_count}
                                sx={{
                                  "& .MuiBadge-badge": {
                                    fontSize: "0.65rem",
                                    height: "16px",
                                    minWidth: "16px",
                                    padding: "0 4px",
                                    right: -2,
                                    top: 2,
                                  },
                                }}
                              >
                                <ChildCareIcon fontSize="small" />
                              </Badge>
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton
                              color="error"
                              onClick={() =>
                                handleDeleteAffiliate(affiliate.id)
                              }
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </>
          ) : (
            <>
              <TableHead>
                <TableRow>
                  {[
                    "HIJO/A APELLIDO",
                    "HIJO/A NOMBRE",
                    "DNI",
                    "EDAD",
                    "TITULAR",
                    "TITULAR PROVINCIA",
                  ].map((header) => (
                    <TableCell
                      key={header}
                      sx={{
                        fontWeight: 700,
                        backgroundColor: "background.paper",
                        borderBottom: "2px solid",
                        borderColor: "divider",
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                      <CircularProgress />
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        Cargando familiares...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredFamilyMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                      <Typography variant="body1" color="text.secondary">
                        No se encontraron familiares.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedFamilyMembers.map((member) => {
                    let calcAge = member.edad;
                    if (calcAge === null || calcAge === undefined) {
                      calcAge = calculateAge(member.fecha_nacimiento);
                    }
                    return (
                      <TableRow hover key={member.id}>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {member.apellido}
                        </TableCell>
                        <TableCell>{member.nombre}</TableCell>
                        <TableCell>{member.dni || "-"}</TableCell>
                        <TableCell>
                          {calcAge !== null ? `${calcAge} años` : "-"}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {member.parent_apellido}, {member.parent_nombre}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            CUIL: {member.parent_cuil}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {member.parent_provincia} - {member.parent_ciudad}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </>
          )}
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={
            activeTab === 0
              ? filteredAffiliates.length
              : filteredFamilyMembers.length
          }
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count}`
          }
        />
      </TableContainer>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 2, display: "block", textAlign: "right" }}
      >
        Mostrando{" "}
        {activeTab === 0
          ? filteredAffiliates.length
          : filteredFamilyMembers.length}{" "}
        de {activeTab === 0 ? affiliates.length : allFamilyMembers.length}{" "}
        {activeTab === 0 ? "titulares" : "familiares"} en total
      </Typography>

      <Snackbar
        open={showSuccess}
        autoHideDuration={4000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          Importación completada con éxito.
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage("")}
      >
        <Alert severity="error" sx={{ width: "100%" }}>
          {errorMessage}
        </Alert>
      </Snackbar>

      <FamilyMembersModal
        open={isFamilyModalOpen}
        onClose={() => setIsFamilyModalOpen(false)}
        affiliate={selectedAffiliate}
      />

      <AddAffiliateModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchAffiliates}
      />
    </Box>
  );
}
