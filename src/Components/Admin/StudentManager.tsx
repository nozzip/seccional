import React, { useState, useEffect } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Stack,
  Divider,
  alpha,
  useTheme,
  InputAdornment,
  Chip,
  Collapse,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PaidIcon from "@mui/icons-material/Paid";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import StudentRegistrationDialog, {
  StudentData,
} from "./StudentRegistrationDialog";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import HistoryIcon from "@mui/icons-material/History";
import DownloadIcon from "@mui/icons-material/Download";
import UploadIcon from "@mui/icons-material/Upload";
import * as XLSX from "xlsx";
import { supabase } from "../../supabaseClient";

export interface StudentManagerProps {
  onDataChanged?: () => void;
}

export default function StudentManager({ onDataChanged }: StudentManagerProps = {}) {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      let allData: any[] = [];
      let pageConfig = 0;
      let hasMoreConfig = true;

      while (hasMoreConfig) {
        const { data, error } = await supabase
          .from("students")
          .select("*")
          .is("deleted_at", null)
          .order("full_name", { ascending: true })
          .range(pageConfig * 1000, (pageConfig + 1) * 1000 - 1);

        if (error) throw error;

        if (data && data.length > 0) {
          allData = [...allData, ...data];
          if (data.length < 1000) {
            hasMoreConfig = false;
          } else {
            pageConfig++;
          }
        } else {
          hasMoreConfig = false;
        }
      }

      const mapped = (allData || []).map((s: any) => ({
        ...s,
        fullName: s.full_name,
        hasProfessor: s.has_professor,
        lastPayment: s.last_payment,
        expiryDate: s.expiry_date,
        assignedClass: s.assigned_class,
      }));
      setStudents(mapped);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("students_manager_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "students" },
        fetchData,
      )
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterExpiring, setFilterExpiring] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [historyStudent, setHistoryStudent] = useState<StudentData | null>(
    null,
  );
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filterPaymentDateFrom, setFilterPaymentDateFrom] = useState("");
  const [filterPaymentDateTo, setFilterPaymentDateTo] = useState("");
  const [filterExpiryDateFrom, setFilterExpiryDateFrom] = useState("");
  const [filterExpiryDateTo, setFilterExpiryDateTo] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todos");

  const getExpiryStatus = (expiryDate?: string) => {
    if (!expiryDate) return { label: "SIN PAGOS", color: "default" as const };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expiryDate);
    exp.setHours(23, 59, 59, 999);

    if (exp < today) return { label: "VENCIDO", color: "error" as const };

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    if (exp <= nextWeek) return { label: "POR VENCER", color: "warning" as const };

    return { label: "ACTIVO", color: "success" as const };
  };

  const handleDelete = async (studentId: number) => {
    if (
      !window.confirm(
        "¿Deseas enviar a este alumno a la Papelera? Permanecerá allí por 7 días antes de eliminarse definitivamente.",
      )
    )
      return;
    try {
      const { error } = await supabase
        .from("students")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", studentId);
      if (error) throw error;
      fetchData();
      if (onDataChanged) onDataChanged();
    } catch (error) {
      console.error("Error soft-deleting student:", error);
    }
  };

  const handleClearPayment = async (studentId: number) => {
    if (
      !window.confirm(
        "¿Deseas anular el estado de pago de este alumno? El registro del alumno se mantendrá pero figurará como deuda.",
      )
    )
      return;
    try {
      const { error } = await supabase
        .from("students")
        .update({
          last_payment: null,
          expiry_date: null,
        })
        .eq("id", studentId);
      if (error) throw error;
      fetchData();
      if (onDataChanged) onDataChanged();
    } catch (error) {
      console.error("Error clearing payment:", error);
    }
  };

  const calculateAge = (dob: string | undefined): number | null => {
    if (!dob || dob === "1900-01-01") return null;
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleViewHistory = async (student: StudentData) => {
    setHistoryStudent(student);
    setOpenHistory(true);
    setPaymentHistory([]);
    try {
      const { data, error } = await supabase
        .from("student_payments")
        .select("*")
        .eq("student_dni", student.dni)
        .order("payment_date", { ascending: false });
      if (error) throw error;

      // Enrich with transaction details where available
      const enriched = await Promise.all((data || []).map(async (p: any) => {
        if (p.transaction_id) {
          const { data: tx } = await supabase
            .from("transactions")
            .select("payment_method, branch")
            .eq("id", p.transaction_id)
            .single();
          return { ...p, transactions: tx };
        }
        return { ...p, transactions: null };
      }));

      setPaymentHistory(enriched);
    } catch (error) {
      console.error("Error fetching payment history:", error);
    }
  };

  const theme = useTheme();

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    const today = new Date();
    const todayStr = today.toLocaleDateString("es-AR", { year: 'numeric', month: '2-digit', day: '2-digit' });
    const ws_data = [
      [
        "Apellido y Nombre", "DNI", "Tel. Celular", "Domicilio", "Localidad",
        "Fecha Nacim.", "Con Prof (x)", "Lunes", "Martes", "Miercoles", "Jueves",
        "Viernes", "Sabados", "7 a 8", "8 a 9", "9 a 10", "10 a 11", "11 a 12",
        "12 a 13", "13 a 14", "14 a 15", "15 a 16", "16 a 17", "17 a 18",
        "18 a 19", "19 a 20", "20 a 21", "21 a 22", "22 a 23", "Edad", "Profesor",
        "Fecha de Pago", "Importe",
      ],
      [
        "Ejemplo, Juan", "12345678", "3815123456", "Calle Falsa 123", "Tucumán",
        "1990-05-15", "x", "x", "", "x", "",
        "", "", "", "", "", "", "",
        "", "", "", "", "", "",
        "x", "", "", "", "", "34", "Prof. Gomez",
        todayStr, "50000",
      ]
    ];
    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    // Auto-size columns slightly
    const wscols = ws_data[0].map(col => ({ wch: Math.max(12, col.length) }));
    ws['!cols'] = wscols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla Alumnos");
    XLSX.writeFile(wb, "Plantilla_Alumnos.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        // Se quita cellDates: true para evitar que la librería genere objetos Date con zonas horarias extrañas
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        const data = XLSX.utils.sheet_to_json(ws, { defval: "" }) as any[];

        const { data: existingDB } = await supabase.from("students").select("dni, expiry_date, last_payment");
        const existingMap = new Map();
        existingDB?.forEach(s => existingMap.set(s.dni, s));

        // Fetch all student payments to avoid duplicating history
        const { data: allHistory } = await supabase.from("student_payments").select("student_dni, payment_date");
        const historyMap = new Map();
        allHistory?.forEach(h => {
          const dateStr = new Date(h.payment_date).toISOString().split("T")[0];
          historyMap.set(`${h.student_dni}_${dateStr}`, true);
        });

        const paymentsToInsert: any[] = [];

        const mappedStudents = data.map((row) => {
          const getVal = (keyBase: string) => {
            const key = Object.keys(row).find(k => k.toLowerCase().includes(keyBase.toLowerCase()));
            return key ? row[key] : "";
          };

          const fullName = getVal("Apellido y Nombre") || getVal("Nombre");
          const dniStr = getVal("DNI");
          let dni = String(dniStr).replace(/[^0-9]/g, ""); // DNI

          // Only process valid students. Skip the example row or invalid rows immediately.
          if (!fullName || !dni || fullName === "Ejemplo, Juan") {
            return null;
          }

          const phone = String(getVal("Tel. Celular") || getVal("Tel") || getVal("Celular") || "").trim();
          const address = getVal("Domicilio");
          const city = getVal("Localidad");

          let rawDob = getVal("Fecha Nacim.");
          let dob = null;
          if (rawDob) {
            if (rawDob instanceof Date) {
              if (!isNaN(rawDob.getTime())) {
                dob = rawDob.toISOString().split("T")[0];
              }
            } else if (typeof rawDob === "string") {
              const parts = rawDob.split("/");
              if (parts.length === 3) {
                const y = parseInt(parts[2]);
                const m = parseInt(parts[1]);
                const day = parseInt(parts[0]);
                if (!isNaN(y) && !isNaN(m) && !isNaN(day)) {
                  // Validate if it's a real date (e.g., Nov 31 doesn't exist)
                  const testDate = new Date(y, m - 1, day);
                  if (testDate.getFullYear() === y && testDate.getMonth() === m - 1 && testDate.getDate() === day) {
                    // Check for reasonable year range to avoid Postgres "out of range" errors
                    if (y >= 1800 && y <= 2100) {
                      dob = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    }
                  }
                }
              } else {
                const testDate = new Date(rawDob);
                if (!isNaN(testDate.getTime())) {
                  const y = testDate.getFullYear();
                  if (y >= 1800 && y <= 2100) {
                    dob = testDate.toISOString().split("T")[0];
                  }
                }
              }
            } else if (typeof rawDob === "number") {
              // Convert Excel number manually, extracting exact UTC components
              const utcDate = new Date(Math.round((rawDob - 25569) * 86400 * 1000));
              if (!isNaN(utcDate.getTime())) {
                const y = utcDate.getUTCFullYear();
                if (y >= 1800 && y <= 2100) {
                  const m = utcDate.getUTCMonth() + 1;
                  const d = utcDate.getUTCDate();
                  dob = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                }
              }
            }
            // If rawDob existed but we couldn't parse it into a valid 'dob' or it was out of range, use 1900-01-01 as requested
            if (!dob) dob = "1900-01-01";
          }

          const conProfVal = String(getVal("Con Prof (x)") || getVal("Con Prof") || "").trim().toLowerCase();
          const profesorVal = String(getVal("Profesor") || "").trim();
          const hasProfessorStr = conProfVal === "x" || profesorVal !== "";

          const daysMarks = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabados"].filter(d => {
            const val = String(getVal(d)).trim().toLowerCase();
            return val !== "" && val !== "no" && val !== "0" && val !== "falso" && val !== "false";
          });
          const fixedDaysMarks = daysMarks.map(d => {
            if (d === "Miercoles") return "Miércoles";
            if (d === "Sabados") return "Sábado";
            return d;
          });

          const hourSlots = ["7 a 8", "8 a 9", "9 a 10", "10 a 11", "11 a 12", "12 a 13", "13 a 14", "14 a 15", "15 a 16", "16 a 17", "17 a 18", "18 a 19", "19 a 20", "20 a 21", "21 a 22", "22 a 23"];
          const selectedHourStrings = hourSlots.filter(h => {
            const val = String(getVal(h)).trim().toLowerCase();
            return val !== "" && val !== "no" && val !== "0" && val !== "falso" && val !== "false";
          });

          const schedule: any = {};
          if (selectedHourStrings.length > 0 && fixedDaysMarks.length > 0) {
            const mappedHourStrings = selectedHourStrings.map(h => {
              const startHour = h.split(" ")[0];
              return `${startHour}:00`;
            });

            for (const d of fixedDaysMarks) {
              for (const h of mappedHourStrings) {
                schedule[`${d}-${h}`] = true;
              }
            }
          }

          let lastPayment = null;
          let expiryDate = null;
          const mapLastPaymentDate = getVal("Fecha de Pago") || getVal("Fecha");
          const mapLastPaymentAmountStr = String(getVal("Importe")).replace(/[^0-9.-]+/g, "");
          const mapLastPaymentAmount = parseFloat(mapLastPaymentAmountStr);

          if (mapLastPaymentDate && !isNaN(mapLastPaymentAmount)) {
            let pYear, pMonth, pDay;
            let parsedDate: Date | null = null;

            if (mapLastPaymentDate instanceof Date) {
              pYear = mapLastPaymentDate.getUTCFullYear();
              pMonth = mapLastPaymentDate.getUTCMonth();
              pDay = mapLastPaymentDate.getUTCDate();
              parsedDate = new Date(pYear, pMonth, pDay);
            } else if (typeof mapLastPaymentDate === "string") {
              const parts = mapLastPaymentDate.split("/");
              if (parts.length === 3) {
                pYear = parseInt(parts[2]);
                pMonth = parseInt(parts[1]) - 1;
                pDay = parseInt(parts[0]);
                parsedDate = new Date(pYear, pMonth, pDay);
              } else {
                parsedDate = new Date(mapLastPaymentDate);
              }
            } else if (typeof mapLastPaymentDate === "number") {
              const utcDate = new Date(Math.round((mapLastPaymentDate - 25569) * 86400 * 1000));
              pYear = utcDate.getUTCFullYear();
              pMonth = utcDate.getUTCMonth();
              pDay = utcDate.getUTCDate();
              // Constructing local date matching exact day to format locally avoiding shift
              parsedDate = new Date(pYear, pMonth, pDay);
            }

            if (parsedDate && !isNaN(parsedDate.getTime()) && parsedDate.getFullYear() >= 1800 && parsedDate.getFullYear() <= 2100) {
              const dateStr = parsedDate.toLocaleDateString("es-AR", { year: 'numeric', month: '2-digit', day: '2-digit' });

              const existing = existingMap.get(dni);

              if (existing && existing.last_payment && existing.last_payment.date !== dateStr) {
                // Hay un pago anterior en la DB que es DIFERENTE al que viene en el Excel.
                // Nos aseguramos de que el pago anterior esté archivado en el historial.
                const parts = existing.last_payment.date.split("/");
                if (parts.length === 3) {
                  const oldIso = `${parts[2]}-${parts[1]}-${parts[0]}`;
                  if (!historyMap.has(`${dni}_${oldIso}`)) {
                    // El pago anterior no estaba en el historial, lo agregamos para no perderlo
                    paymentsToInsert.push({
                      student_dni: dni,
                      payment_date: oldIso,
                      amount: existing.last_payment.amount,
                      expiry_date: existing.expiry_date
                    });
                    // Agregamos al historyMap para no duplicarlo si hay más filas del mismo alumno
                    historyMap.set(`${dni}_${oldIso}`, true);
                  }
                }
              }

              if (existing && existing.last_payment && existing.last_payment.date === dateStr) {
                // Se trata del mismo pago ya guardado previamente, mantenemos datos
                lastPayment = existing.last_payment;
                expiryDate = existing.expiry_date;
              } else {
                // Nuevo pago detectado
                lastPayment = { date: dateStr, amount: mapLastPaymentAmount };

                // Definir base para vencimiento
                let baseDateForExpiry = new Date(parsedDate);

                // Si ya era alumno activo y su vencimiento actual es posterior a su nueva fecha de pago
                // Sumamos 30 dias (1 mes) a partir de su vencimiento vigente.
                if (existing && existing.expiry_date) {
                  // Asumimos parsear tomando mediodía para evitar problemas de timezone
                  const currentExpiry = new Date(`${existing.expiry_date}T12:00:00`);
                  const paymentTime = new Date(`${parsedDate.toISOString().split("T")[0]}T12:00:00`);
                  if (currentExpiry >= paymentTime) {
                    baseDateForExpiry = new Date(currentExpiry);
                  } else {
                    baseDateForExpiry = new Date(paymentTime);
                  }
                }

                const expiry = new Date(baseDateForExpiry);
                expiry.setMonth(expiry.getMonth() + 1);
                const exY = expiry.getFullYear();
                const exM = expiry.getMonth() + 1;
                const exD = expiry.getDate();
                expiryDate = `${exY}-${String(exM).padStart(2, '0')}-${String(exD).padStart(2, '0')}`;

                // Preparar el pago NUEVO para archivarlo en el historial si no existe aún
                const newIso = parsedDate.toISOString().split("T")[0];
                if (!historyMap.has(`${dni}_${newIso}`)) {
                  paymentsToInsert.push({
                    student_dni: dni,
                    payment_date: newIso,
                    amount: mapLastPaymentAmount,
                    expiry_date: expiryDate
                  });
                  historyMap.set(`${dni}_${newIso}`, true);
                }
              }
            } else {
              // If it has logic for payment but date is weird, fallback
              expiryDate = "1900-01-01";
            }
          }

          return {
            full_name: fullName,
            dni: dni,
            phone: phone,
            address: address || null,
            city: city || null,
            dob: dob,
            has_professor: hasProfessorStr,
            schedule: schedule,
            last_payment: lastPayment,
            expiry_date: expiryDate
          };
        }).filter(Boolean);

        const uniqueStudentsMap = new Map();
        mappedStudents.forEach((s: any) => {
          if (s) {
            if (uniqueStudentsMap.has(s.dni)) {
              const existingLine = uniqueStudentsMap.get(s.dni);
              const mergedSchedule = { ...existingLine.schedule, ...s.schedule };
              const mergedStudent = { ...existingLine, ...s, schedule: mergedSchedule };
              // Prefer fields that are not empty string or null from the new object
              Object.keys(s).forEach(key => {
                if (s[key] && !existingLine[key]) {
                  mergedStudent[key] = s[key];
                }
              });
              uniqueStudentsMap.set(s.dni, mergedStudent);
            } else {
              uniqueStudentsMap.set(s.dni, s);
            }
          }
        });
        const finalStudents = Array.from(uniqueStudentsMap.values());

        if (finalStudents.length > 0) {
          const chunkSize = 500;
          let successCount = 0;
          let hasError = false;

          for (let i = 0; i < finalStudents.length; i += chunkSize) {
            const chunk = finalStudents.slice(i, i + chunkSize);
            const { error } = await supabase
              .from("students")
              .upsert(chunk, { onConflict: "dni" });

            if (error) {
              console.error(error);
              alert("Error al importar el lote: " + error.message);
              hasError = true;
              break;
            } else {
              successCount += chunk.length;
            }
          }

          if (!hasError && paymentsToInsert.length > 0) {
            // Quitamos repetidos dentro del mismo excel para un mismo dni
            const uniquePaymentsMap = new Map();
            paymentsToInsert.forEach(p => uniquePaymentsMap.set(`${p.student_dni}-${p.payment_date}`, p));
            const uniquePayments = Array.from(uniquePaymentsMap.values());

            for (let i = 0; i < uniquePayments.length; i += 500) {
              const chunk = uniquePayments.slice(i, i + 500);
              const { error: histError } = await supabase.from("student_payments").insert(chunk);
              if (histError) {
                console.error("Error guardando historial", histError);
                alert("Advertencia: No se pudo guardar el historial de pagos. " + histError.message);
              }
            }
          }

          if (!hasError) {
            alert(`Se procesaron ${successCount} registros correctamente (los DNIs existentes se actualizaron).`);
            fetchData();
            if (onDataChanged) onDataChanged();
          }
        } else {
          alert("No se encontraron registros válidos para importar (falta Nombre o DNI).");
        }
      } catch (err) {
        console.error(err);
        alert("Error al leer el archivo Excel.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);


  const hasActiveFilters = filterPaymentDateFrom || filterPaymentDateTo || filterExpiryDateFrom || filterExpiryDateTo || filterStatus !== "todos";

  const clearAllFilters = () => {
    setFilterPaymentDateFrom("");
    setFilterPaymentDateTo("");
    setFilterExpiryDateFrom("");
    setFilterExpiryDateTo("");
    setFilterStatus("todos");
    setFilterExpiring(false);
  };

  const filteredStudents = React.useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.dni.includes(searchTerm);

      let matchesExpiring = true;
      if (filterExpiring) {
        const { label } = getExpiryStatus(s.expiryDate);
        matchesExpiring = label === "POR VENCER" || label === "VENCIDO";
      }

      // Date filters
      let matchesPaymentDate = true;
      if (filterPaymentDateFrom || filterPaymentDateTo) {
        const paymentDateStr = s.lastPayment?.date;
        if (!paymentDateStr) {
          matchesPaymentDate = false;
        } else {
          // Parse DD/MM/YYYY to a comparable date
          const parts = paymentDateStr.split("/");
          if (parts.length === 3) {
            const payDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
            payDate.setHours(12, 0, 0, 0);
            if (filterPaymentDateFrom) {
              const from = new Date(filterPaymentDateFrom + "T00:00:00");
              if (payDate < from) matchesPaymentDate = false;
            }
            if (filterPaymentDateTo) {
              const to = new Date(filterPaymentDateTo + "T23:59:59");
              if (payDate > to) matchesPaymentDate = false;
            }
          } else {
            matchesPaymentDate = false;
          }
        }
      }

      let matchesExpiryDate = true;
      if (filterExpiryDateFrom || filterExpiryDateTo) {
        if (!s.expiryDate) {
          matchesExpiryDate = false;
        } else {
          const expDate = new Date(s.expiryDate + "T12:00:00");
          if (filterExpiryDateFrom) {
            const from = new Date(filterExpiryDateFrom + "T00:00:00");
            if (expDate < from) matchesExpiryDate = false;
          }
          if (filterExpiryDateTo) {
            const to = new Date(filterExpiryDateTo + "T23:59:59");
            if (expDate > to) matchesExpiryDate = false;
          }
        }
      }

      let matchesStatus = true;
      if (filterStatus !== "todos") {
        const { label } = getExpiryStatus(s.expiryDate);
        if (filterStatus === "activo") matchesStatus = label === "ACTIVO";
        else if (filterStatus === "por_vencer") matchesStatus = label === "POR VENCER";
        else if (filterStatus === "vencido") matchesStatus = label === "VENCIDO";
        else if (filterStatus === "sin_pagos") matchesStatus = label === "SIN PAGOS";
      }

      return matchesSearch && matchesExpiring && matchesPaymentDate && matchesExpiryDate && matchesStatus;
    });
  }, [students, searchTerm, filterExpiring, filterPaymentDateFrom, filterPaymentDateTo, filterExpiryDateFrom, filterExpiryDateTo, filterStatus]);

  const stats = React.useMemo(() => {
    let vigentes = 0;
    let vencidos = 0;
    let porVencer = 0;
    let totalDineroActivos = 0;
    let totalDineroPorVencer = 0;

    filteredStudents.forEach((s) => {
      const { label } = getExpiryStatus(s.expiryDate);
      const amount = s.lastPayment?.amount ? Number(s.lastPayment.amount) : 0;

      if (label === "ACTIVO") {
        vigentes++;
        totalDineroActivos += amount;
      } else if (label === "POR VENCER") {
        porVencer++;
        totalDineroPorVencer += amount;
      } else if (label === "VENCIDO" || label === "SIN PAGOS") {
        vencidos++;
      }
    });
    return {
      total: filteredStudents.length,
      vigentes,
      vencidos,
      porVencer,
      totalDineroActivos,
      totalDineroPorVencer,
      totalDineroTotal: totalDineroActivos + totalDineroPorVencer,
    };
  }, [filteredStudents]);

  const paginatedStudents = React.useMemo(() => {
    return filteredStudents.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredStudents, page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", gap: 2, flex: 1 }}>
          <TextField
            placeholder="Buscar por nombre, DNI..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: { xs: "100%", md: 400 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant={filterExpiring ? "contained" : "outlined"}
            color={filterExpiring ? "warning" : "inherit"}
            onClick={() => setFilterExpiring(!filterExpiring)}
            sx={{
              fontWeight: 700,
              borderColor: filterExpiring ? "warning.main" : "divider",
            }}
          >
            {filterExpiring
              ? "Mostrando Alertas (7 Días)"
              : "Ver Alertas de Vencimiento"}
          </Button>
          <Button
            variant={showFilters ? "contained" : "outlined"}
            color={hasActiveFilters ? "secondary" : "inherit"}
            onClick={() => setShowFilters(!showFilters)}
            startIcon={<FilterListIcon />}
            sx={{
              fontWeight: 700,
              borderColor: showFilters ? "secondary.main" : "divider",
            }}
          >
            Filtros{hasActiveFilters ? " ●" : ""}
          </Button>
        </Box>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            onClick={handleDownloadTemplate}
            startIcon={<DownloadIcon />}
            sx={{ fontWeight: 700 }}
          >
            Descargar Plantilla
          </Button>
          <Button
            variant="outlined"
            onClick={() => fileInputRef.current?.click()}
            startIcon={<UploadIcon />}
            sx={{ fontWeight: 700 }}
          >
            Importar Excel
          </Button>
          <input
            type="file"
            accept=".xlsx, .xls"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedStudent(null);
              setOpen(true);
            }}
            sx={{ fontWeight: 700 }}
          >
            Nuevo Alumno
          </Button>
        </Box>
      </Box>

      {/* Collapsible Filter Panel */}
      <Collapse in={showFilters}>
        <Paper
          elevation={0}
          sx={{
            mb: 2,
            p: 2.5,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            bgcolor: alpha(theme.palette.primary.main, 0.02),
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
              <FilterListIcon fontSize="small" /> Filtros Avanzados
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              {hasActiveFilters && (
                <Button size="small" color="error" onClick={clearAllFilters} startIcon={<CloseIcon />}>
                  Limpiar Filtros
                </Button>
              )}
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "flex-end" }}>
            {/* Payment Date Range */}
            <Box sx={{ flex: "1 1 auto", minWidth: 200 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5, display: "block" }}>
                Fecha de Pago (Desde)
              </Typography>
              <TextField
                type="date"
                size="small"
                fullWidth
                value={filterPaymentDateFrom}
                onChange={(e) => { setFilterPaymentDateFrom(e.target.value); setPage(0); }}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Box sx={{ flex: "1 1 auto", minWidth: 200 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5, display: "block" }}>
                Fecha de Pago (Hasta)
              </Typography>
              <TextField
                type="date"
                size="small"
                fullWidth
                value={filterPaymentDateTo}
                onChange={(e) => { setFilterPaymentDateTo(e.target.value); setPage(0); }}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            {/* Expiry Date Range */}
            <Box sx={{ flex: "1 1 auto", minWidth: 200 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5, display: "block" }}>
                Vencimiento (Desde)
              </Typography>
              <TextField
                type="date"
                size="small"
                fullWidth
                value={filterExpiryDateFrom}
                onChange={(e) => { setFilterExpiryDateFrom(e.target.value); setPage(0); }}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Box sx={{ flex: "1 1 auto", minWidth: 200 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5, display: "block" }}>
                Vencimiento (Hasta)
              </Typography>
              <TextField
                type="date"
                size="small"
                fullWidth
                value={filterExpiryDateTo}
                onChange={(e) => { setFilterExpiryDateTo(e.target.value); setPage(0); }}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            {/* Status Filter */}
            <Box sx={{ flex: "1 1 auto", minWidth: 180 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5, display: "block" }}>
                Estado
              </Typography>
              <FormControl size="small" fullWidth>
                <Select
                  value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value as string); setPage(0); }}
                >
                  <MenuItem value="todos">Todos</MenuItem>
                  <MenuItem value="activo">Activo</MenuItem>
                  <MenuItem value="por_vencer">Por Vencer</MenuItem>
                  <MenuItem value="vencido">Vencido</MenuItem>
                  <MenuItem value="sin_pagos">Sin Pagos</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
          {hasActiveFilters && (
            <Box sx={{ mt: 1.5 }}>
              <Chip
                label={`Resultados filtrados: ${filteredStudents.length} alumnos`}
                color="secondary"
                variant="outlined"
                size="small"
                sx={{ fontWeight: 700 }}
              />
            </Box>
          )}
        </Paper>
      </Collapse>

      <Box sx={{ mb: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Chip label={`Total Alumnos: ${stats.total}`} color="primary" variant="outlined" sx={{ fontWeight: 700 }} />
        <Chip label={`Alumnos Vigentes (Pagos al día): ${stats.vigentes} ($${stats.totalDineroActivos.toLocaleString()})`} color="success" variant="outlined" sx={{ fontWeight: 700 }} />
        <Chip label={`Alumnos Por Vencer: ${stats.porVencer} ($${stats.totalDineroPorVencer.toLocaleString()})`} color="warning" variant="outlined" sx={{ fontWeight: 700 }} />
        <Chip label={`Total Recaudado (Activos): $${stats.totalDineroTotal.toLocaleString()}`} color="info" variant="filled" sx={{ fontWeight: 800 }} />
        <Chip label={`Alumnos Vencidos / Sin Pagos: ${stats.vencidos}`} color="error" variant="outlined" sx={{ fontWeight: 700 }} />
      </Box>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}
      >
        <Table>
          <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Alumno</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>DNI</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Edad</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Contacto</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                Próximo Vencimiento
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Estado Pago</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedStudents.map((s) => (
              <TableRow key={s.id} hover>
                <TableCell>
                  <Typography sx={{ fontWeight: 700 }}>
                    {s.fullName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {s.hasProfessor ? "Con Profesor" : "Pileta Libre"}
                  </Typography>
                </TableCell>
                <TableCell>{s.dni}</TableCell>
                <TableCell>
                  {calculateAge(s.dob) !== null ? `${calculateAge(s.dob)} años` : "-"}
                </TableCell>
                <TableCell>{s.phone}</TableCell>
                <TableCell>
                  {s.expiryDate ? (
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: getExpiryStatus(s.expiryDate).color + ".main",
                        }}
                      >
                        {new Date(s.expiryDate).toLocaleDateString("es-AR")}
                      </Typography>
                      <Typography
                        variant="caption"
                        color={
                          getExpiryStatus(s.expiryDate).color === "warning"
                            ? "warning.main"
                            : "text.secondary"
                        }
                        sx={{
                          fontWeight:
                            getExpiryStatus(s.expiryDate).color === "warning" ? 700 : 400,
                        }}
                      >
                        {getExpiryStatus(s.expiryDate).label === "VENCIDO"
                          ? "Vencido"
                          : "Días restantes: " +
                          Math.ceil(
                            (new Date(s.expiryDate).getTime() -
                              new Date().getTime() +
                              1000) /
                            (1000 * 60 * 60 * 24),
                          )}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      -
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {s.lastPayment ? (
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <PaidIcon color="success" sx={{ fontSize: 18 }} />
                      <Box>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600 }}
                          >
                            ${s.lastPayment.amount}
                          </Typography>
                          <Chip
                            icon={
                              <FiberManualRecordIcon
                                sx={{ fontSize: "10px !important" }}
                              />
                            }
                            label={
                              getExpiryStatus(s.expiryDate).label
                            }
                            size="small"
                            color={
                              getExpiryStatus(s.expiryDate).color
                            }
                            sx={{
                              height: 20,
                              fontSize: "0.65rem",
                              fontWeight: 800,
                            }}
                          />
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          Pago: {s.lastPayment.date} • Vence: {s.expiryDate}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Chip label="SIN PAGOS" size="small" variant="outlined" />
                  )}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    color="info"
                    title="Ver Historial de Pagos"
                    onClick={() => s.id && handleViewHistory(s)}
                  >
                    <HistoryIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="warning"
                    title="Limpiar Estado de Pago"
                    onClick={() => s.id && handleClearPayment(s.id)}
                    disabled={!s.lastPayment}
                  >
                    <MoneyOffIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="primary"
                    title="Editar Datos"
                    onClick={() => {
                      setSelectedStudent(s);
                      setOpen(true);
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    title="Eliminar Alumno (Baja Definitiva)"
                    onClick={() => s.id && handleDelete(s.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filteredStudents.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[15, 25, 50, 100]}
        labelRowsPerPage="Alumnos por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
      />

      <StudentRegistrationDialog
        open={open}
        onClose={() => setOpen(false)}
        initialData={selectedStudent}
        onSave={async (updatedStudent) => {
          try {
            const studentToSave = {
              full_name: updatedStudent.fullName,
              dni: updatedStudent.dni,
              phone: updatedStudent.phone,
              dob: updatedStudent.dob || null,
              address: updatedStudent.address,
              city: updatedStudent.city,
              has_professor: updatedStudent.hasProfessor,
              schedule: updatedStudent.schedule,
              last_payment: updatedStudent.lastPayment || null,
              expiry_date: updatedStudent.expiryDate || null,
              assigned_class: updatedStudent.assignedClass || null,
            };

            if (selectedStudent?.id) {
              const { error } = await supabase
                .from("students")
                .update(studentToSave)
                .eq("id", selectedStudent.id);
              if (error) throw error;
            } else {
              const { error } = await supabase
                .from("students")
                .insert(studentToSave);
              if (error) throw error;
            }

            setOpen(false);
            setSelectedStudent(null);
            fetchData();
            if (onDataChanged) onDataChanged();
          } catch (error) {
            console.error("Error saving student:", error);
          }
        }}
      />

      {/* History Dialog */}
      <Dialog
        open={openHistory}
        onClose={() => setOpenHistory(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Historial de Pagos: {historyStudent?.fullName}
        </DialogTitle>
        <DialogContent>
          {historyStudent?.lastPayment && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 3,
                mt: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                borderRadius: 3,
                border: "1px solid",
                borderColor: alpha(theme.palette.primary.main, 0.1),
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: "primary.main", display: "block", mb: 0.5 }}>
                  ÚLTIMO PAGO REGISTRADO EN FICHA
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  ${historyStudent.lastPayment.amount.toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Fecha: {historyStudent.lastPayment.date}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Vencimiento: {historyStudent.expiryDate}
                </Typography>
              </Box>
            </Paper>
          )}

          {paymentHistory.length === 0 ? (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <Typography color="text.secondary">
                No hay registros de pagos previos.
              </Typography>
            </Box>
          ) : (
            <TableContainer sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Fecha Pago</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Vencimiento</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Monto</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Caja / Medio</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paymentHistory.map((h) => {
                    const isDeleted = !!h.deleted_at;
                    const status = getExpiryStatus(h.expiry_date);

                    let paymentMethodStr = "Importado (Excel)";
                    if (h.transactions) {
                      const method = h.transactions.payment_method;
                      const branch = h.transactions.branch;
                      if (method === "Efectivo") {
                        paymentMethodStr = `Efectivo (${branch === "noroeste" ? "Caja Noroeste" : "Caja Azucena"})`;
                      } else if (method === "Transferencia") {
                        paymentMethodStr = "Transferencia (Banco Compartido)";
                      } else {
                        paymentMethodStr = method;
                      }
                    }

                    return (
                      <TableRow
                        key={h.id}
                        sx={{
                          bgcolor: isDeleted
                            ? alpha(theme.palette.error.main, 0.05)
                            : "inherit",
                          opacity: isDeleted ? 0.8 : 1,
                        }}
                      >
                        <TableCell
                          sx={{
                            textDecoration: isDeleted ? "line-through" : "none",
                            color: isDeleted ? "text.disabled" : "inherit",
                          }}
                        >
                          {new Date(h.payment_date).toLocaleDateString("es-AR")}
                        </TableCell>
                        <TableCell
                          sx={{
                            textDecoration: isDeleted ? "line-through" : "none",
                            color: isDeleted ? "text.disabled" : "inherit",
                          }}
                        >
                          {new Date(h.expiry_date).toLocaleDateString("es-AR")}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            textDecoration: isDeleted ? "line-through" : "none",
                            color: isDeleted ? "error.light" : "inherit",
                          }}
                        >
                          ${h.amount.toLocaleString()}
                        </TableCell>
                        <TableCell
                          sx={{
                            textDecoration: isDeleted ? "line-through" : "none",
                            color: isDeleted ? "text.disabled" : "inherit",
                            fontSize: "0.8rem"
                          }}
                        >
                          {paymentMethodStr}
                        </TableCell>
                        <TableCell>
                          {isDeleted ? (
                            <Chip
                              label={`ELIMINADO (${new Date(h.deleted_at).toLocaleDateString("es-AR")})`}
                              size="small"
                              color="error"
                              variant="outlined"
                              sx={{
                                fontSize: "0.6rem",
                                fontWeight: 800,
                                height: 20,
                              }}
                            />
                          ) : (
                            <Chip
                              label={status.label}
                              size="small"
                              color={status.color}
                              variant="outlined"
                              sx={{
                                fontSize: "0.6rem",
                                fontWeight: 800,
                                height: 20,
                              }}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            variant="contained"
            onClick={() => setOpenHistory(false)}
            sx={{ fontWeight: 700, px: 4 }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
