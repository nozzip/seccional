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
  Grid2 as Grid,
  alpha,
  useTheme,
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
import { logAction } from "../../utils/auditLogger";
import AffiliateDetailsModal from "./AffiliateDetailsModal";
import AddAffiliateModal from "./AddAffiliateModal";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import { normalizeName, parseFullName } from "../../utils/nameNormalization";
import InfoCard from "./InfoCard";
import MaleIcon from "@mui/icons-material/Male";
import FemaleIcon from "@mui/icons-material/Female";
import PersonIcon from "@mui/icons-material/Person";
import WcIcon from "@mui/icons-material/Wc";
import PersonOffIcon from "@mui/icons-material/PersonOff";

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
  telefono?: string;
  email?: string;
  es_jubilado?: boolean;
  fecha_nacimiento?: string;
  is_ups?: boolean;
  is_aportante?: boolean;
  tipo_jubilado?: string;
  is_aefip?: boolean;
  desafiliado?: boolean;
  fecha_desafiliacion?: string | null;
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

// Robust Gender Inference Logic prioritizing CUIL prefixes
const inferGender = (fullName: string, cuil?: string): string => {
  // 1. Priority: CUIL Prefix (Argentine Standard)
  if (cuil) {
    const cleanCuil = String(cuil).replace(/[^0-9]/g, "");
    const prefix = cleanCuil.substring(0, 2);
    
    if (prefix === "27" || prefix === "23") return "Mujer";
    if (prefix === "20") return "Hombre";
    // 24/25/26 are also women's prefixes sometimes used in special cases
    if (prefix === "24" || prefix === "25" || prefix === "26") return "Mujer";
  }

  // 2. Fallback: Name analysis
  const names = fullName.toUpperCase().trim().split(/\s+/);
  const first = names[0] || "";
  const second = names[1] || "";
  
  // Specific exceptions
  const femaleExceptions = [
    "MARIA", "ANA", "NOELIA", "BELEN", "CARLA", "ANDREA", "MONICA", "SILVIA", 
    "PATRICIA", "LUCIA", "BEATRIZ", "INES", "MERCEDES", "RAQUEL", "CARMEN", 
    "IRIS", "GLADYS", "ESTER", "MIRTA", "ZULMA", "RITA", "SARA", "ELSA", 
    "DELIA", "SOLEDAD", "MABEL", "MYRIAM", "NOEMI", "MARILY", "LIDIA", "ROSA", 
    "STELLA", "TERESA", "ELENA", "MARTA", "OLGA", "SONIA", "ALICIA", "NANCY", 
    "GLORIA", "VILMA", "RUTH", "IRMA", "HILDA", "DORA", "CLARA", "NORA", 
    "EDITA", "JUANA", "EVA", "CYNTIA", "CELIA", "MARCELA", "LILIANA", "ROSANA", 
    "VANINA", "LUCIANA", "GABRIELA", "DAIANA", "GEORGINA", "CRISTINA", "MARIANA",
  ];
  const maleExceptions = [
    "JOSE", "LUIS", "ANGEL", "ARIEL", "GABRIEL", "MANUEL", "JAVIER", "RUBEN", 
    "DANIEL", "MIGUEL", "RAUL", "JUAN", "CARLOS", "HECTOR", "VICTOR", "FACUNDO", 
    "NESTOR", "OMAR", "CESAR", "RENE", "CELSO", "AGUSTIN", "ELISEO", "HUGO", 
    "JULIO", "NICOLAS", "TOMAS", "DAVID", "WILLY", "IVAN", "GUSTAVO", "RICARDO", 
    "EDGARDO", "ERNESTO", "ALEJANDRO",
  ];

  if (femaleExceptions.includes(first)) return "Mujer";
  if (maleExceptions.includes(first)) return "Hombre";

  if (first === "MARIA" && second && maleExceptions.includes(second)) return "Mujer";
  if (first === "JOSE" && second && femaleExceptions.includes(second)) return "Hombre";

  if (first.endsWith("A")) return "Mujer";
  if (
    first.endsWith("O") || first.endsWith("E") || first.endsWith("L") || 
    first.endsWith("N") || first.endsWith("R") || first.endsWith("S") || 
    first.endsWith("Z") || first.endsWith("U") || first.endsWith("I")
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

export const cleanLocationName = (name: string | null | undefined): string => {
  if (!name) return "";
  const upper = name.trim().toUpperCase();
  
  if (upper.includes("TUCUMAN") || upper.includes("TUCUMÁN")) {
    return "TUCUMAN";
  }
  if (upper.includes("JUJUY")) {
    return "JUJUY";
  }
  if (upper.includes("CATAMARCA")) {
    return "CATAMARCA";
  }
  if (upper.includes("ORAN") || upper.includes("ORÁN")) {
    return "ORAN";
  }
  
  return upper;
};

export const PROVINCES_LIST = [
    "TUCUMAN", "SALTA", "JUJUY", "CATAMARCA", "SANTIAGO DEL ESTERO", 
    "LA RIOJA", "CORDOBA", "SANTA FE", "BUENOS AIRES", "MENDOZA", "SAN LUIS",
    "ENTRE RIOS", "CORRIENTES", "MISIONES", "CHACO", "FORMOSA", "LA PAMPA",
    "NEUQUEN", "RIO NEGRO", "CHUBUT", "SANTA CRUZ", "TIERRA DEL FUEGO",
    "CABA"
];

const fixLocation = (prov: string, city: string) => {
  const p = prov.trim().toUpperCase();
  const c = city.trim().toUpperCase();
  const provincesList = PROVINCES_LIST;

  let rawProv = prov;
  let rawCity = city;

  // If Province looks like a city (more specific) and City looks like a province (broader)
  if (p.includes("S.M.") || p.includes("SAN MIGUEL") || p.includes("S.S. DE") || p.includes("SAN SALVADOR") || p.includes("CAPITAL")) {
    rawProv = city;
    rawCity = prov;
  } else if (provincesList.includes(c) && !provincesList.includes(p)) {
    rawProv = city;
    rawCity = prov;
  }

  const cleaned = cleanLocationName(rawProv);
  return { provincia: cleaned, ciudad: cleaned };
};

export const formatDateDisplay = (dateStr?: string | null): string => {
  if (!dateStr) return "";
  try {
    const cleanDate = String(dateStr).split("T")[0];
    const parts = cleanDate.split(/[-/]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return `${parts[2].padStart(2, "0")}/${parts[1].padStart(2, "0")}/${parts[0]}`;
      } else if (parts[2].length === 4) {
        return `${parts[0].padStart(2, "0")}/${parts[1].padStart(2, "0")}/${parts[2]}`;
      }
    }
    return cleanDate;
  } catch {
    return String(dateStr || "");
  }
};

export default function AfiliadosManager() {
  const theme = useTheme();
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
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [syncingBirthdays, setSyncingBirthdays] = useState(false);
  const [merging, setMerging] = useState<number | null>(null);

  // Pagination State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Multi-select Filter State
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);

  // Age Filters for Familiares Tab
  const [minAge, setMinAge] = useState<number | "">("");
  const [maxAge, setMaxAge] = useState<number | "">("");

  // Role/Union Filters
  const [filterActive, setFilterActive] = useState(false);
  const [filterUPS, setFilterUPS] = useState(false);
  const [filterJubiladosAP, setFilterJubiladosAP] = useState(false);
  const [filterDesafiliados, setFilterDesafiliados] = useState(false);
  const [selectedEstado, setSelectedEstado] = useState<string>("todos");
  const [selectedDesafiliacionDate, setSelectedDesafiliacionDate] = useState<string>("todas");

  const desafiliacionDates = useMemo(() => {
    return Array.from(
      new Set(
        affiliates
          .filter(a => a.desafiliado || (!a.is_aefip && !a.is_ups && !a.es_jubilado))
          .map(a => a.fecha_desafiliacion)
          .filter(Boolean)
      )
    ).sort().reverse() as string[];
  }, [affiliates]);

  const handleEstadoChange = (val: string) => {
    setSelectedEstado(val);
    setSelectedDesafiliacionDate("todas");
    if (val === "activos") {
      setFilterActive(true);
      setFilterUPS(false);
      setFilterJubiladosAP(false);
      setFilterDesafiliados(false);
    } else if (val === "desafiliados") {
      setFilterDesafiliados(true);
      setFilterActive(false);
      setFilterUPS(false);
      setFilterJubiladosAP(false);
    } else if (val === "ups") {
      setFilterUPS(true);
      setFilterActive(false);
      setFilterJubiladosAP(false);
      setFilterDesafiliados(false);
    } else if (val === "jubilados") {
      setFilterJubiladosAP(true);
      setFilterActive(false);
      setFilterUPS(false);
      setFilterDesafiliados(false);
    } else {
      setFilterActive(false);
      setFilterUPS(false);
      setFilterJubiladosAP(false);
      setFilterDesafiliados(false);
    }
    setPage(0);
  };

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
      const affsWithSearch = (affResponse.data || []).map((a: any) => {
        const cleanedProv = cleanLocationName(a.provincia);
        return {
          ...a,
          provincia: cleanedProv,
          ciudad: cleanedProv,
          family_count: countMap[a.id] || 0,
          _searchStr:
            `${a.nombre} ${a.apellido} ${a.cuil} ${a.legajo} ${a.dni} ${a.desafiliado ? "desafiliado baja" : "activo"} ${a.fecha_desafiliacion || ""}`.toLowerCase(),
        };
      });

      // Build Family Member Details
      const familyDetails: FamilyMemberDetail[] = (famResponse.data || [])
        .map((f: any) => {
          // Find parent locally inside affsWithSearch for speed
          const parent = affsWithSearch.find(
            (parentItem: any) => parentItem.id === f.affiliate_id,
          );

          const cleanedProv = parent ? parent.provincia : cleanLocationName(f.provincia);

          return {
            ...f,
            provincia: cleanedProv,
            ciudad: cleanedProv,
            parent_cuil: parent?.cuil || "",
            parent_nombre: parent?.nombre || "",
            parent_apellido: parent?.apellido || "",
            parent_provincia: cleanedProv,
            parent_ciudad: cleanedProv,
            _inferredGender: inferGender(f.nombre, f.dni),
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

        // Fresh fetch for matching against current database records
        const { data: currentAffs, error: fetchErr } = await supabase.from("affiliates").select("*");
        if (fetchErr || !currentAffs) throw new Error("No se pudo obtener la lista de afiliados.");

        const cleanDigits = (val: any) => String(val || "").replace(/\D/g, "");

        const getRowVal = (row: any, possibleKeys: string[]) => {
          for (const k of Object.keys(row)) {
            const cleanK = k.trim().toLowerCase();
            if (possibleKeys.some((p) => p.toLowerCase() === cleanK)) {
              return row[k];
            }
          }
          return undefined;
        };

        const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
        const todayFormatted = todayStr.split("-").reverse().join("/");

        const updates: any[] = [];
        const inserts: any[] = [];
        const matchedIds = new Set<number>();

        for (const row of data as any[]) {
          let nombre = String(getRowVal(row, ["nombre", "nombres"]) || "").trim();
          let apellido = String(getRowVal(row, ["apellido", "apellidos"]) || "").trim();

          const fullNameRaw = String(getRowVal(row, ["apellido y nombre", "nombre y apellido", "afiliado", "titular"]) || "").trim();
          if ((!apellido || !nombre) && fullNameRaw) {
            const parsed = parseFullName(fullNameRaw);
            apellido = parsed.apellido;
            nombre = parsed.nombre;
          }

          const rawCuil = getRowVal(row, ["cuil", "c.u.i.l.", "c.u.i.l", "cuil titular", "nro cuil", "nro. cuil"]);
          const cuil = String(rawCuil || "").trim();
          const cleanCuil = cleanDigits(cuil);

          const rawLegajo = getRowVal(row, ["legajo", "nro legajo", "nro. legajo", "leg"]);
          const legajo = String(rawLegajo || "").trim();
          const cleanLegajo = cleanDigits(legajo);

          const rawDni = getRowVal(row, ["dni", "documento", "doc", "doc.", "doc nro", "doc. nro.", "nro documento"]);
          const cleanDni = cleanDigits(rawDni);

          const rawProv = String(getRowVal(row, ["provincia", "prov"]) || "").trim();
          const rawCity = String(getRowVal(row, ["ciudad", "localidad", "agencia", "distrito"]) || "").trim();
          const { provincia, ciudad } = fixLocation(rawProv, rawCity);
          const sexoExcel = getRowVal(row, ["sexo", "genero"]);

          if (!cleanCuil && !cleanLegajo && !cleanDni && !apellido && !nombre) continue;

          // Matching against database:
          // 1. Match by clean CUIL
          let match: any = null;
          if (cleanCuil && cleanCuil.length >= 7) {
            match = currentAffs.find((a: any) => cleanDigits(a.cuil) === cleanCuil);
          }

          // 2. Match by clean Legajo
          if (!match && cleanLegajo && cleanLegajo.length >= 3) {
            match = currentAffs.find((a: any) => {
              if (a.legajo?.trim().toLowerCase() === legajo.toLowerCase()) return true;
              return cleanDigits(a.legajo) === cleanLegajo;
            });
          }

          // 3. Match by DNI
          if (!match && cleanDni && cleanDni.length >= 6) {
            match = currentAffs.find((a: any) => {
              const aDni = cleanDigits(a.dni);
              if (aDni === cleanDni) return true;
              const aCuil = cleanDigits(a.cuil);
              return aCuil.length >= 10 && aCuil.substring(2, aCuil.length - 1) === cleanDni;
            });
          }

          // 4. Fallback match by normalized Name
          if (!match && apellido && nombre) {
            const normRowName = normalizeName(`${apellido} ${nombre}`);
            match = currentAffs.find(
              (a: any) => normalizeName(`${a.apellido} ${a.nombre}`) === normRowName
            );
          }

          const affData: any = {
            cuil: cleanCuil || cuil || (match?.cuil || ""),
            legajo: legajo || match?.legajo || "",
            apellido: apellido || match?.apellido || "",
            nombre: nombre || match?.nombre || "",
            provincia: provincia || match?.provincia || "SALTA",
            ciudad: ciudad || match?.ciudad || provincia || "SALTA",
            sexo: sexoExcel ? String(sexoExcel) : (match?.sexo || inferGender(nombre, cuil)),
            is_aefip: true,
            desafiliado: false,
            fecha_desafiliacion: null, // Reactivación: se quita la desafiliación al volver a figurar en el padrón activo
            branch: "noroeste",
          };

          if (match) {
            // "si ya existe en la base de datos, no se agrega" -> NO se agrega a 'inserts', se actualiza / reactiva
            matchedIds.add(match.id);
            updates.push({ id: match.id, ...affData });
          } else {
            // Nuevo afiliado que no existía en el padrón
            inserts.push(affData);
          }
        }

        // 1. Batch updates for existing records (no duplicados)
        let hasColumnError = false;
        if (updates.length > 0) {
          for (const upd of updates) {
            const { id, ...rest } = upd;
            const { error: updErr } = await supabase.from("affiliates").update(rest).eq("id", id);
            if (updErr && (updErr.message?.includes("desafiliado") || updErr.code === "42703")) {
              hasColumnError = true;
              const { desafiliado, fecha_desafiliacion, ...fallbackRest } = rest;
              await supabase.from("affiliates").update(fallbackRest).eq("id", id);
            } else if (updErr) {
              console.error("Error updating affiliate id", id, updErr);
            }
          }
        }

        // 2. Batch inserts for new records
        if (inserts.length > 0) {
          const { error: insErr } = await supabase.from("affiliates").insert(inserts);
          if (insErr && (insErr.message?.includes("desafiliado") || insErr.code === "42703")) {
            hasColumnError = true;
            const fallbackInserts = inserts.map(({ desafiliado, fecha_desafiliacion, ...rest }: any) => rest);
            const { error: insFallbackErr } = await supabase.from("affiliates").insert(fallbackInserts);
            if (insFallbackErr) throw insFallbackErr;
          } else if (insErr) {
            throw insErr;
          }
        }

        // 3. Logic for disaffiliations ("si no esta en la lista, agregar un condicional mas que diga 'Desafiliado' y tenga los datos de que fecha se desafilió, es decir, en que importación ya no apareció más el mismo, para ir teniendo un registro de quienes se desafiliaron"):
        const disaffiliatedCandidates = currentAffs.filter((a: any) => {
          // Ignorar afiliados exclusivos de UPS o jubilados externos que no eran AEFIP
          const isExternalOnly = (a.is_ups && !a.is_aefip) || (a.es_jubilado && !a.is_aefip);
          if (isExternalOnly) return false;

          // No estuvo presente en la lista del archivo importado
          return !matchedIds.has(a.id);
        });

        let newlyDisaffiliatedCount = 0;
        let previouslyDisaffiliatedCount = 0;

        for (const aff of disaffiliatedCandidates) {
          const wasAlreadyDisaffiliated = aff.desafiliado === true && aff.fecha_desafiliacion;
          if (wasAlreadyDisaffiliated) {
            previouslyDisaffiliatedCount++;
            // Ya tenía su fecha de desafiliación original registrada, conservamos el registro histórico
            continue;
          }

          newlyDisaffiliatedCount++;
          const disaffDate = aff.fecha_desafiliacion || todayStr;
          const disaffPayload: any = {
            is_aefip: false,
            desafiliado: true,
            fecha_desafiliacion: disaffDate,
          };

          const { error: disaffErr } = await supabase
            .from("affiliates")
            .update(disaffPayload)
            .eq("id", aff.id);

          if (disaffErr && (disaffErr.message?.includes("desafiliado") || disaffErr.code === "42703")) {
            hasColumnError = true;
            await supabase.from("affiliates").update({ is_aefip: false }).eq("id", aff.id);
          }
        }

        let alertMsg = `Importación de Activos finalizada:\n\n` +
          `• ${updates.length} Afiliados existentes verificados (ya estaban en la base de datos, no se duplicaron).\n` +
          `• ${inserts.length} Nuevos afiliados incorporados al padrón.\n` +
          `• ${newlyDisaffiliatedCount} Afiliados no aparecieron en la lista y fueron marcados como "Desafiliado" (Fecha de baja: ${todayFormatted}).`;

        if (previouslyDisaffiliatedCount > 0) {
          alertMsg += `\n• ${previouslyDisaffiliatedCount} Afiliados continúan desafiliados de importaciones previas (conservando su fecha original).`;
        }

        if (hasColumnError) {
          alertMsg += `\n\n⚠️ AVISO DE BASE DE DATOS:\n` +
            `Para registrar permanentemente las columnas 'desafiliado' y 'fecha_desafiliacion' en Supabase, ejecuta el script: sql/add_desafiliados_to_affiliates.sql en el Editor SQL de tu proyecto Supabase.`;
        }

        alert(alertMsg);

        await logAction(
          "IMPORTAR_EXCEL",
          `Importación de Titulares AEFIP: ${updates.length} verificados (no duplicados), ${inserts.length} nuevos, ${newlyDisaffiliatedCount} dados de baja/desafiliados el ${todayFormatted}`
        );

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

          await logAction(
            "IMPORTAR_EXCEL",
            `Importación de Familiares: ${formattedFamily.length} hijos cargados`
          );

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

      await logAction(
        "VACIAR_FAMILIARES",
        `Eliminación masiva de TODOS los familiares cargados`
      );

      alert("Todos los familiares han sido eliminados.");
      fetchAffiliates();
    } catch (error: any) {
      setErrorMessage("Error al vaciar familiares: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncBirthdays = async () => {
    if (!window.confirm("¿Desea sincronizar los cumpleaños desde el CSV? Esto actualizará la información de los afiliados que coincidan por nombre y apellido.")) return;
    
    setSyncingBirthdays(true);
    try {
      const response = await fetch("/cumples DI RSAL.csv");
      const text = await response.text();
      const rows = text.split("\n").map(line => line.split(";"));
      
      // Remove header
      rows.shift();

      const monthMap: Record<string, string> = {
        'ene': '01', 'feb': '02', 'mar': '03', 'abr': '04', 'may': '05', 'jun': '06',
        'jul': '07', 'ago': '08', 'sept': '09', 'sep': '09', 'oct': '10', 'nov': '11', 'dic': '12'
      };

      let count = 0;
      for (const row of rows) {
        if (row.length < 3) continue;
        const [fechaRaw, apellidoCSV, nombreCSV] = row;
        
        // Parse date "1-ene" -> "1900-01-01"
        const dateParts = fechaRaw.toLowerCase().split("-");
        if (dateParts.length !== 2) continue;
        const day = dateParts[0].padStart(2, "0");
        const monthShort = dateParts[1].trim();
        const month = monthMap[monthShort];
        
        if (!month) continue;
        const formattedDate = `2000-${month}-${day}`;

        // Find match in current affiliates
        const match = affiliates.find(a => 
          a.apellido.trim().toLowerCase() === apellidoCSV.trim().toLowerCase() &&
          a.nombre.trim().toLowerCase() === nombreCSV.trim().toLowerCase()
        );

        if (match) {
          const { error } = await supabase
            .from("affiliates")
            .update({ fecha_nacimiento: formattedDate })
            .eq("id", match.id);
          
          if (!error) count++;
        }
      }

      alert(`Sincronización finalizada. Se actualizaron ${count} cumpleaños.`);
      fetchAffiliates();
    } catch (error: any) {
      console.error("Sync error:", error);
      setErrorMessage("Error al sincronizar cumpleaños: " + error.message);
    } finally {
      setSyncingBirthdays(false);
    }
  };

  const handleImportUPS = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        if (data.length === 0) {
          setErrorMessage("El archivo UPS está vacío.");
          setImporting(false);
          return;
        }

        // Normalize current affiliates for matching
        const { data: currentAffs } = await supabase.from("affiliates").select("*");
        if (!currentAffs) throw new Error("No se pudo obtener la lista de afiliados.");

        const normalizedAffiliates = currentAffs.map(a => ({
          ...a,
          _normName: normalizeName(`${a.apellido} ${a.nombre}`)
        }));

        const updates = [];
        const inserts = [];
        let doubleAffiliationCount = 0;
        let newUpsCount = 0;

        for (const row of data) {
          const apellido = String(row.Apellido || row.APELLIDO || "").trim();
          const nombre = String(row.Nombre || row.NOMBRE || "").trim();
          const rawProv = String(row.Provincia || row.PROVINCIA || "").trim();
          const rawCity = String(row.ciudad || row.CIUDAD || "").trim();
          const { provincia, ciudad } = fixLocation(rawProv, rawCity);
          
          if (!apellido && !nombre) continue;
          
          const normUpsName = normalizeName(`${apellido} ${nombre}`);
          const match = normalizedAffiliates.find(a => a._normName === normUpsName);

          if (match) {
            updates.push(match.id);
            doubleAffiliationCount++;
          } else {
            inserts.push({
              apellido,
              nombre,
              provincia,
              ciudad,
              is_ups: true,
              is_aefip: false,
              branch: "noroeste",
              sexo: inferGender(nombre, row.CUIL || row.cuil || row.DNI || row.dni)
            });
            newUpsCount++;
          }
        }

        // Execute batch updates and inserts
        if (updates.length > 0) {
          await supabase.from("affiliates").update({ is_ups: true }).in("id", updates);
        }
        if (inserts.length > 0) {
          const { error } = await supabase.from("affiliates").insert(inserts);
          if (error) throw error;
        }

        alert(`Importación UPS finalizada:\n- ${doubleAffiliationCount} Doble afiliación detectadas.\n- ${newUpsCount} Nuevos afiliados UPS puros agregados.`);
        fetchAffiliates();
      } catch (error: any) {
        console.error("Error importing UPS:", error);
        setErrorMessage("Error al importar UPS: " + error.message);
      } finally {
        setImporting(false);
        e.target.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImportJubilados = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        if (data.length === 0) {
          setErrorMessage("El archivo de Jubilados está vacío.");
          setImporting(false);
          return;
        }

        // Fresh fetch of current data for accurate matching
        const { data: currentAffs } = await supabase.from("affiliates").select("*");
        if (!currentAffs) throw new Error("No se pudo obtener la lista de afiliados.");

        const updates = [];
        const inserts = [];
        let updatedCount = 0;
        let newJubiladoCount = 0;

        for (const row of data) {
          const cuil = String(row.CUIL || "").trim();
          const dni = String(row.DNI || "").trim();
          const full_name = String(row["Apellido y Nombre"] || "").trim();
          const tipo = String(row.TIPO || "").trim();
          
          const isAportante = tipo.toUpperCase().includes("AP") && !tipo.toUpperCase().includes("NO");
          const { apellido, nombre } = parseFullName(full_name);
          const normName = normalizeName(full_name);

          // Find match by CUIL, DNI or Name
          let match = null;
          if (cuil) match = currentAffs.find(a => a.cuil === cuil);
          if (!match && dni) match = currentAffs.find(a => a.cuil?.includes(dni) || a.legajo?.includes(dni));
          if (!match) match = currentAffs.find(a => normalizeName(`${a.apellido} ${a.nombre}`) === normName);

          if (match) {
            updates.push({
              id: match.id,
              es_jubilado: true,
              is_aportante: isAportante,
              tipo_jubilado: tipo
            });
            updatedCount++;
          } else {
            inserts.push({
              cuil,
              apellido,
              nombre,
              es_jubilado: true,
              is_aportante: isAportante,
              tipo_jubilado: tipo,
              is_aefip: false,
              branch: "noroeste",
              sexo: inferGender(nombre, cuil)
            });
            newJubiladoCount++;
          }
        }

        // Execute batch updates and inserts
        if (updates.length > 0) {
          for (const upd of updates) {
            const { id, ...rest } = upd;
            await supabase.from("affiliates").update(rest).eq("id", id);
          }
        }
        if (inserts.length > 0) {
          const { error } = await supabase.from("affiliates").insert(inserts);
          if (error) throw error;
        }

        alert(`Importación de Jubilados finalizada:\n- ${updatedCount} Afiliados actualizados a Jubilados.\n- ${newJubiladoCount} Nuevos Jubilados externos agregados.`);
        fetchAffiliates();
      } catch (error: any) {
        console.error("Error importing Jubilados:", error);
        setErrorMessage("Error al importar Jubilados: " + error.message);
      } finally {
        setImporting(false);
        e.target.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDeleteAffiliate = async (id: number) => {
    if (!window.confirm("¿Está seguro de eliminar este afiliado?")) return;
    try {
      const { error } = await supabase.from("affiliates").delete().eq("id", id);
      if (error) throw error;

      const deleted = affiliates.find((a: any) => a.id === id);
      await logAction(
        "ELIMINAR_AFILIADO",
        `Baja de afiliado: ${deleted?.apellido || 'N/A'}, ${deleted?.nombre || 'N/A'} (ID: ${id})`
      );

      fetchAffiliates();
    } catch (error: any) {
      setErrorMessage("Error al eliminar: " + error.message);
    }
  };

  const handleMergeAffiliates = async (primaryId: number, secondaryId: number) => {
    if (!window.confirm("¿Confirmas que estas personas son la misma? El registro secundario se eliminará y el principal se marcará con Doble Afiliación.")) return;
    
    setMerging(secondaryId);
    try {
      // 1. Mark primary as UPS
      const { error: updErr } = await supabase
        .from("affiliates")
        .update({ is_ups: true })
        .eq("id", primaryId);
      
      if (updErr) throw updErr;

      // 2. Delete secondary
      const { error: delErr } = await supabase
        .from("affiliates")
        .delete()
        .eq("id", secondaryId);
      
      if (delErr) throw delErr;

      await logAction(
        "UNIFICAR_AFILIADOS",
        `Unificación de doble afiliación: ID primario ${primaryId} (marcado UPS), ID secundario ${secondaryId} (eliminado)`
      );

      alert("Registros unificados con éxito.");
      fetchAffiliates();
    } catch (error: any) {
      console.error("Merge error:", error);
      setErrorMessage("Error al unificar: " + error.message);
    } finally {
      setMerging(null);
    }
  };

  const handleNormalizeGenders = async () => {
    if (!window.confirm("¿Deseas recalcular y actualizar el sexo de todos los afiliados basándose en el CUIL? (20=Hombre, 27/23=Mujer)")) return;
    
    setLoading(true);
    try {
      const updates = affiliates.map(a => {
        const newGender = inferGender(a.nombre, a.cuil);
        if (newGender !== a.sexo && newGender !== "Otro") {
          return { id: a.id, sexo: newGender };
        }
        return null;
      }).filter(Boolean) as { id: number, sexo: string }[];
      
      if (updates.length === 0) {
        alert("Todos los registros ya coinciden con la lógica de CUIL.");
        setLoading(false);
        return;
      }

      // Execute updates in batches of 50
      const chunkSize = 50;
      for (let i = 0; i < updates.length; i += chunkSize) {
        const chunk = updates.slice(i, i + chunkSize);
        await supabase.from("affiliates").upsert(chunk);
      }
      
      alert(`Normalización completada. Se actualizaron ${updates.length} registros.`);
      fetchAffiliates();
    } catch (error: any) {
      console.error("Error normalizing genders:", error);
      setErrorMessage("Error al normalizar sexos: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Base list of affiliates that meet the current status toggles (Active, UPS, Jubilados, Desafiliados)
  const baseAffiliates = useMemo(() => {
    const hasAnyFilter = filterActive || filterUPS || filterJubiladosAP || filterDesafiliados || selectedEstado !== "todos";
    
    return affiliates.filter((a: any) => {
      const isDesafiliado = Boolean(a.desafiliado || (!a.is_aefip && !a.is_ups && !a.es_jubilado));
      const isActivo = Boolean(a.is_aefip && !a.is_ups && !a.es_jubilado && !isDesafiliado);
      const isUps = Boolean(a.is_ups);
      const isJubiladoAp = Boolean(a.es_jubilado && a.is_aportante);
      const isJubiladoNoAp = Boolean(a.es_jubilado && !a.is_aportante);

      if (filterDesafiliados && selectedDesafiliacionDate !== "todas") {
        if (a.fecha_desafiliacion !== selectedDesafiliacionDate) return false;
      }

      if (!hasAnyFilter) return true;

      return (
        (filterActive && isActivo) ||
        (filterUPS && isUps) ||
        (filterJubiladosAP && (isJubiladoAp || isJubiladoNoAp)) ||
        (filterDesafiliados && isDesafiliado)
      );
    });
  }, [affiliates, filterActive, filterUPS, filterJubiladosAP, filterDesafiliados, selectedEstado, selectedDesafiliacionDate]);

  // Derive filter options based on the base list
  const provinces = useMemo(
    () => Array.from(new Set(baseAffiliates.map((a) => a.provincia).filter(Boolean))).sort(),
    [baseAffiliates],
  );

  const genders = useMemo(
    () =>
      Array.from(new Set(baseAffiliates.map((a) => a.sexo).filter(Boolean))).sort(),
    [baseAffiliates],
  );

  const filteredAffiliates = useMemo(() => {
    const searchLow = debouncedSearch.toLowerCase();
    return baseAffiliates.filter((a: any) => {
      const matchesSearch = !searchLow || a._searchStr.includes(searchLow);
      const matchesProv =
        selectedProvinces.length === 0 ||
        selectedProvinces.includes(a.provincia);
      const matchesGender =
        selectedGenders.length === 0 || selectedGenders.includes(a.sexo);

      return (
        matchesSearch &&
        matchesProv &&
        matchesGender
      );
    });
  }, [
    baseAffiliates,
    debouncedSearch,
    selectedProvinces,
    selectedGenders,
  ]);

  const handleNormalizeLocations = async () => {
    if (
      !window.confirm(
        "¿Desea normalizar las localidades? Esto intercambiará Provincia y Ciudad en los casos donde estén invertidos (ej: Provincia: S.M. de Tucumán, Ciudad: Tucumán).",
      )
    )
      return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("affiliates")
        .select("id, provincia, ciudad");
      if (error) throw error;

      const toUpdate = [];
      const provincesList = [
        "TUCUMAN", "SALTA", "JUJUY", "CATAMARCA", "SANTIAGO DEL ESTERO", 
        "LA RIOJA", "CORDOBA", "SANTA FE", "BUENOS AIRES", "MENDOZA", "SAN LUIS"
      ];

      for (const aff of data || []) {
        let prov = (aff.provincia || "").trim().toUpperCase();
        let city = (aff.ciudad || "").trim().toUpperCase();

        let shouldSwap = false;

        // Detection logic for swapped Province/City
        // Case 1: Province name contains "S.M." or "SAN MIGUEL" or "S.S. DE"
        if (prov.includes("S.M.") || prov.includes("SAN MIGUEL") || prov.includes("S.S. DE") || prov.includes("SAN SALVADOR")) {
          shouldSwap = true;
        }
        // Case 2: City name is a pure province name and Province is more specific
        else if (provincesList.includes(city) && !provincesList.includes(prov)) {
          shouldSwap = true;
        }

        const rawProv = shouldSwap ? aff.ciudad : aff.provincia;
        const cleanProv = cleanLocationName(rawProv);

        if (aff.provincia !== cleanProv || aff.ciudad !== cleanProv) {
          toUpdate.push({
            id: aff.id,
            provincia: cleanProv,
            ciudad: cleanProv
          });
        }
      }

      if (toUpdate.length === 0) {
        alert("Todos los registros ya están normalizados.");
        return;
      }

      // Execute updates in batches of 50
      for (let i = 0; i < toUpdate.length; i += 50) {
        const batch = toUpdate.slice(i, i + 50);
        for (const item of batch) {
          await supabase
            .from("affiliates")
            .update({ provincia: item.provincia, ciudad: item.ciudad })
            .eq("id", item.id);
        }
      }

      alert(`Normalización completada: ${toUpdate.length} registros corregidos.`);
      fetchAffiliates();
    } catch (error: any) {
      alert("Error al normalizar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const totalActivos = affiliates.filter(a => a.is_aefip && !a.is_ups && !a.es_jubilado && !a.desafiliado).length;
    const totalUPS = affiliates.filter(a => a.is_ups).length;
    const totalJubiladosAP = affiliates.filter(a => a.es_jubilado && a.is_aportante).length;
    const totalDesafiliados = affiliates.filter(a => a.desafiliado || (!a.is_aefip && !a.is_ups && !a.es_jubilado)).length;
    return { totalActivos, totalUPS, totalJubiladosAP, totalDesafiliados };
  }, [affiliates]);

  const potentialMatches = useMemo(() => {
    // Group by Surname
    const bySurname: Record<string, Affiliate[]> = {};
    affiliates.forEach(a => {
      const surname = a.apellido.trim().toUpperCase();
      if (!bySurname[surname]) bySurname[surname] = [];
      bySurname[surname].push(a);
    });

    const suggestions: { primary: Affiliate, secondary: Affiliate }[] = [];
    
    Object.values(bySurname).forEach(group => {
      if (group.length < 2) return;
      
      const aefipMembers = group.filter(a => a.is_aefip);
      const upsOnlyMembers = group.filter(a => a.is_ups && !a.is_aefip);

      aefipMembers.forEach(aefip => {
        upsOnlyMembers.forEach(ups => {
          // If surnames match and names are similar or share parts
          const name1 = normalizeName(aefip.nombre);
          const name2 = normalizeName(ups.nombre);
          
          const parts1 = name1.split(" ");
          const parts2 = name2.split(" ");
          
          const hasCommonPart = parts1.some(p => p.length > 2 && parts2.includes(p));

          if (hasCommonPart || name1.includes(name2) || name2.includes(name1)) {
            suggestions.push({ primary: aefip, secondary: ups });
          }
        });
      });
    });

    return suggestions;
  }, [affiliates]);

  const filteredFamilyMembers = useMemo(() => {
    const searchLow = debouncedSearch.toLowerCase();
    const min = minAge === "" ? 0 : Number(minAge);
    const max = maxAge === "" ? 999 : Number(maxAge);

    return allFamilyMembers.filter((f) => {
      const matchesSearch = !searchLow || f._searchStr?.includes(searchLow);
      const matchesProv =
        selectedProvinces.length === 0 ||
        selectedProvinces.includes(f.parent_provincia);
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
        matchesGender &&
        matchesAge
      );
    });
  }, [
    allFamilyMembers,
    debouncedSearch,
    selectedProvinces,
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
      const exportData = filteredAffiliates.map((a) => {
        const isDesaf = Boolean(a.desafiliado || (!a.is_aefip && !a.is_ups && !a.es_jubilado));
        const estadoStr = isDesaf
          ? "Desafiliado"
          : a.is_ups
          ? "UPS"
          : a.es_jubilado
          ? a.is_aportante
            ? "Jubilado AP"
            : "Jubilado No AP"
          : "Activo";

        return {
          CUIL: a.cuil,
          LEGAJO: a.legajo,
          APELLIDO: a.apellido,
          NOMBRE: a.nombre,
          PROVINCIA: a.provincia,
          ESTADO: estadoStr,
          FECHA_DESAFILIACION: a.fecha_desafiliacion ? formatDateDisplay(a.fecha_desafiliacion) : "",
          SEXO: a.sexo,
          CANT_HIJOS: a.family_count || 0,
        };
      });
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
        };
      });

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Familiares Filtrados");
      XLSX.writeFile(wb, "Familiares_Filtrados.xlsx");
    }
  };

  return (
    <Box sx={{ p: { xs: 1, md: 2 }, pb: 4 }}>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <InfoCard
            title="Afiliados Activos"
            value={stats.totalActivos}
            icon={PeopleIcon}
            selected={filterActive}
            onClick={() => {
              const next = !filterActive;
              setFilterActive(next);
              setFilterUPS(false);
              setFilterJubiladosAP(false);
              setFilterDesafiliados(false);
              setSelectedEstado(next ? "activos" : "todos");
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <InfoCard
            title="UPS / Doble Afiliación"
            value={stats.totalUPS}
            icon={AssignmentIndIcon}
            color="warning.main"
            selected={filterUPS}
            onClick={() => {
              const next = !filterUPS;
              setFilterUPS(next);
              setFilterActive(false);
              setFilterJubiladosAP(false);
              setFilterDesafiliados(false);
              setSelectedEstado(next ? "ups" : "todos");
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <InfoCard
            title="Jubilados Aportantes"
            value={stats.totalJubiladosAP}
            icon={PeopleIcon}
            color="secondary.main"
            selected={filterJubiladosAP}
            onClick={() => {
              const next = !filterJubiladosAP;
              setFilterJubiladosAP(next);
              setFilterActive(false);
              setFilterUPS(false);
              setFilterDesafiliados(false);
              setSelectedEstado(next ? "jubilados" : "todos");
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <InfoCard
            title="Desafiliados"
            value={stats.totalDesafiliados}
            icon={PersonOffIcon}
            color="error.main"
            selected={filterDesafiliados}
            onClick={() => {
              const next = !filterDesafiliados;
              setFilterDesafiliados(next);
              setFilterActive(false);
              setFilterUPS(false);
              setFilterJubiladosAP(false);
              setSelectedEstado(next ? "desafiliados" : "todos");
            }}
          />
        </Grid>
      </Grid>


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

        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
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
            startIcon={importing ? <CircularProgress size={20} color="inherit" /> : <FileUploadIcon />}
            disabled={importing}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
          >
            {importing ? "Importando Activos..." : "Importar Activos"}
            <input type="file" hidden accept=".csv, .xlsx" onChange={handleImportExcel} />
          </Button>

          <Button
            variant="outlined"
            component="label"
            startIcon={importing ? <CircularProgress size={20} color="inherit" /> : <FileUploadIcon />}
            disabled={importing}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
          >
            {importing ? "Importando UPS..." : "Importar UPS"}
            <input type="file" hidden accept=".csv, .xlsx" onChange={handleImportUPS} />
          </Button>

          <Button
            variant="outlined"
            component="label"
            startIcon={importing ? <CircularProgress size={20} color="inherit" /> : <FileUploadIcon />}
            disabled={importing}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
          >
            {importing ? "Importando Jubilados..." : "Importar Jubilados"}
            <input type="file" hidden accept=".csv, .xlsx" onChange={handleImportJubilados} />
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
            color="info"
            startIcon={<WcIcon />}
            onClick={handleNormalizeGenders}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Normalizar Sexos
          </Button>

          <Button
            variant="outlined"
            color="info"
            startIcon={<FilterAltIcon />}
            onClick={handleNormalizeLocations}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Normalizar Localidades
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
          <Tab
            label="Revisión de Coincidencias"
            icon={<FilterAltIcon />}
            iconPosition="start"
            sx={{ fontWeight: 600, textTransform: "none", fontSize: "1rem" }}
          />
        </Tabs>
      </Box>

      {activeTab === 2 && (
        <Box sx={{ mb: 4 }}>
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            Esta sección muestra afiliados de <strong>AEFIP</strong> y de <strong>UPS</strong> que comparten el mismo apellido y nombres similares, pero que están registrados como personas distintas. Puedes unificarlos si confirmas que son la misma persona.
          </Alert>
          
          {potentialMatches.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3, border: "1px dashed", borderColor: "divider" }}>
              <Typography color="text.secondary">No se encontraron coincidencias sugeridas en este momento.</Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {potentialMatches.map((pair, idx) => (
                <Grid size={{ xs: 12, lg: 6 }} key={idx}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      borderRadius: 3, 
                      border: "1px solid", 
                      borderColor: "divider",
                      bgcolor: alpha(theme.palette.background.paper, 0.5),
                      "&:hover": { borderColor: "primary.main" }
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="primary" sx={{ fontWeight: 800 }}>REGISTRO AEFIP</Typography>
                        <Typography sx={{ fontWeight: 700 }}>{pair.primary.apellido}, {pair.primary.nombre}</Typography>
                        <Typography variant="body2" color="text.secondary">CUIL: {pair.primary.cuil || "N/A"}</Typography>
                      </Box>
                      
                      <Box sx={{ px: 2, color: "divider" }}>
                        <Typography variant="h4">↔</Typography>
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="warning.main" sx={{ fontWeight: 800 }}>REGISTRO UPS SOLO</Typography>
                        <Typography sx={{ fontWeight: 700 }}>{pair.secondary.apellido}, {pair.secondary.nombre}</Typography>
                        <Typography variant="body2" color="text.secondary">{pair.secondary.provincia}</Typography>
                      </Box>

                      <Button 
                        variant="contained" 
                        size="small"
                        onClick={() => handleMergeAffiliates(pair.primary.id, pair.secondary.id)}
                        disabled={merging === pair.secondary.id}
                        sx={{ borderRadius: 2, fontWeight: 700, textTransform: "none" }}
                      >
                        {merging === pair.secondary.id ? <CircularProgress size={20} color="inherit" /> : "Unificar"}
                      </Button>
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

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
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <FilterAltIcon fontSize="small" color="primary" />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Filtros Avanzados
            </Typography>
          </Stack>

          <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap">
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Checkbox checked={filterActive} onChange={(e) => {
                const checked = e.target.checked;
                setFilterActive(checked);
                if (checked) {
                  setFilterDesafiliados(false);
                  setFilterUPS(false);
                  setFilterJubiladosAP(false);
                  setSelectedEstado("activos");
                } else {
                  setSelectedEstado("todos");
                }
              }} size="small" />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Afiliados Activos</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Checkbox checked={filterUPS} onChange={(e) => {
                const checked = e.target.checked;
                setFilterUPS(checked);
                if (checked) {
                  setFilterActive(false);
                  setFilterDesafiliados(false);
                  setFilterJubiladosAP(false);
                  setSelectedEstado("ups");
                } else {
                  setSelectedEstado("todos");
                }
              }} size="small" />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Afiliados UPS</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Checkbox checked={filterJubiladosAP} onChange={(e) => {
                const checked = e.target.checked;
                setFilterJubiladosAP(checked);
                if (checked) {
                  setFilterActive(false);
                  setFilterUPS(false);
                  setFilterDesafiliados(false);
                  setSelectedEstado("jubilados");
                } else {
                  setSelectedEstado("todos");
                }
              }} size="small" />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Jubilados Aportantes</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Checkbox
                checked={filterDesafiliados}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setFilterDesafiliados(checked);
                  if (checked) {
                    setFilterActive(false);
                    setFilterUPS(false);
                    setFilterJubiladosAP(false);
                    setSelectedEstado("desafiliados");
                  } else {
                    setSelectedEstado("todos");
                  }
                }}
                size="small"
                color="error"
              />
              <Typography variant="body2" sx={{ fontWeight: 700, color: "error.main" }}>
                Desafiliados
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: filterDesafiliados && desafiliacionDates.length > 0 ? "2fr 1.2fr 1.2fr 1fr 1fr" : "2fr 1.2fr 1fr 1fr",
            },
            gap: 2,
          }}
        >
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            placeholder="Buscar por nombre, apellido, CUIL, legajo o fecha de baja..."
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

          {activeTab === 0 && (
            <FormControl fullWidth size="small">
              <InputLabel>Estado / Condición</InputLabel>
              <Select
                value={selectedEstado}
                label="Estado / Condición"
                onChange={(e) => handleEstadoChange(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="todos">Todos los Estados</MenuItem>
                <MenuItem value="activos">Solo Activos</MenuItem>
                <MenuItem value="desafiliados" sx={{ color: "error.main", fontWeight: 700 }}>
                  Solo Desafiliados (Bajas)
                </MenuItem>
                <MenuItem value="ups">Solo UPS</MenuItem>
                <MenuItem value="jubilados">Solo Jubilados</MenuItem>
              </Select>
            </FormControl>
          )}

          {activeTab === 0 && filterDesafiliados && desafiliacionDates.length > 0 && (
            <FormControl fullWidth size="small">
              <InputLabel>Fecha de Baja</InputLabel>
              <Select
                value={selectedDesafiliacionDate}
                label="Fecha de Baja"
                onChange={(e) => {
                  setSelectedDesafiliacionDate(e.target.value);
                  setPage(0);
                }}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="todas">Todas las fechas de baja</MenuItem>
                {desafiliacionDates.map((dateStr) => (
                  <MenuItem key={dateStr} value={dateStr}>
                    {formatDateDisplay(dateStr)} ({affiliates.filter(a => a.fecha_desafiliacion === dateStr).length} desafiliados)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

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
          selectedGenders.length > 0 ||
          filterActive ||
          filterUPS ||
          filterJubiladosAP ||
          filterDesafiliados ||
          selectedEstado !== "todos" ||
          selectedDesafiliacionDate !== "todas") && (
          <Button
            size="small"
            variant="text"
            onClick={() => {
              setSelectedProvinces([]);
              setSelectedGenders([]);
              setFilterActive(false);
              setFilterUPS(false);
              setFilterJubiladosAP(false);
              setFilterDesafiliados(false);
              setSelectedEstado("todos");
              setSelectedDesafiliacionDate("todas");
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
                    "ESTADO",
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
                  paginatedAffiliates.map((affiliate) => {
                    const isDesaf = Boolean(affiliate.desafiliado || (!affiliate.is_aefip && !affiliate.is_ups && !affiliate.es_jubilado));

                    return (
                      <TableRow hover key={affiliate.id}>
                        <TableCell>{affiliate.cuil}</TableCell>
                        <TableCell>{affiliate.legajo}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            {affiliate.apellido}
                            {isDesaf && (
                              <Chip 
                                label="BAJA" 
                                size="small" 
                                color="error" 
                                sx={{ height: 16, fontSize: "0.6rem", fontWeight: 800, borderRadius: 1 }} 
                              />
                            )}
                            {affiliate.is_ups && (
                              <Chip 
                                label="UPS" 
                                size="small" 
                                color="warning" 
                                sx={{ height: 16, fontSize: "0.6rem", fontWeight: 800, borderRadius: 1 }} 
                              />
                            )}
                            {affiliate.es_jubilado && (
                              <Chip 
                                label={affiliate.is_aportante ? "JUB. AP" : "JUB. NO AP"} 
                                size="small" 
                                color={affiliate.is_aportante ? "secondary" : "default"}
                                variant={affiliate.is_aportante ? "filled" : "outlined"}
                                sx={{ height: 16, fontSize: "0.6rem", fontWeight: 800, borderRadius: 1 }} 
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>{affiliate.nombre}</TableCell>
                        <TableCell>{affiliate.provincia}</TableCell>
                        <TableCell>
                          {isDesaf ? (
                            <Box>
                              <Chip 
                                label="DESAFILIADO" 
                                size="small" 
                                color="error" 
                                sx={{ height: 22, fontSize: "0.65rem", fontWeight: 800, borderRadius: 1.5 }} 
                              />
                              {affiliate.fecha_desafiliacion && (
                                <Typography 
                                  variant="caption" 
                                  display="block" 
                                  sx={{ color: "error.main", fontSize: "0.68rem", fontWeight: 700, mt: 0.5 }}
                                >
                                  Baja: {formatDateDisplay(affiliate.fecha_desafiliacion)}
                                </Typography>
                              )}
                            </Box>
                          ) : affiliate.is_ups ? (
                            <Chip 
                              label="UPS" 
                              size="small" 
                              color="warning" 
                              sx={{ height: 22, fontSize: "0.65rem", fontWeight: 800, borderRadius: 1.5 }} 
                            />
                          ) : affiliate.es_jubilado ? (
                            <Chip 
                              label={affiliate.is_aportante ? "JUB. AP" : "JUB. NO AP"} 
                              size="small" 
                              color={affiliate.is_aportante ? "secondary" : "default"}
                              variant={affiliate.is_aportante ? "filled" : "outlined"}
                              sx={{ height: 22, fontSize: "0.65rem", fontWeight: 800, borderRadius: 1.5 }} 
                            />
                          ) : (
                            <Chip 
                              label="ACTIVO" 
                              size="small" 
                              color="success"
                              variant="outlined" 
                              sx={{ height: 22, fontSize: "0.65rem", fontWeight: 800, borderRadius: 1.5 }} 
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={
                              affiliate.sexo === "Hombre" ? (
                                <MaleIcon style={{ fontSize: "1rem" }} />
                              ) : affiliate.sexo === "Mujer" ? (
                                <FemaleIcon style={{ fontSize: "1rem" }} />
                              ) : (
                                <PersonIcon style={{ fontSize: "1rem" }} />
                              )
                            }
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
                              fontWeight: 700,
                              fontSize: "0.7rem",
                              height: 22,
                              borderRadius: 1.5,
                              "& .MuiChip-icon": { color: "inherit" }
                            }}
                          />
                        </TableCell>
                      <TableCell align="center">
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="center"
                        >
                          <Tooltip title="Ficha del Afiliado">
                            <IconButton
                              color="primary"
                              onClick={() => {
                                setSelectedAffiliate(affiliate);
                                setIsDetailsModalOpen(true);
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
                                <AssignmentIndIcon fontSize="small" />
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
                  );
                })
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
                    "PROVINCIA",
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
                          {member.parent_provincia}
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

      <AffiliateDetailsModal
        open={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        affiliate={selectedAffiliate}
        onUpdate={fetchAffiliates}
      />

      <AddAffiliateModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchAffiliates}
      />
    </Box>
  );
}
