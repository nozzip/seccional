import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Stack,
  Chip,
  alpha,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  MenuItem,
  Snackbar,
  Alert,
  Autocomplete,
  FormControlLabel,
  Checkbox,
  IconButton,
  Menu,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AssessmentIcon from "@mui/icons-material/Assessment";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import FilterListIcon from "@mui/icons-material/FilterList";
import DownloadIcon from "@mui/icons-material/Download";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RefreshIcon from "@mui/icons-material/Refresh";
import { OptimizedTextField } from "../common/OptimizedTextField";

import {
  Transaction,
  Shift,
  ArchivedDay,
  StaffRoster,
  Account,
} from "./CashFlow/types";

import CashRegistry from "./CashRegistry";
import InventoryManager from "./InventoryManager";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import InventoryIcon from "@mui/icons-material/Inventory";
import { Tabs, Tab, InputBase, Tooltip } from "@mui/material";
import StudentRegistrationDialog, {
  StudentData,
} from "./StudentRegistrationDialog";
import { supabase } from "../../supabaseClient";

// Modularized Components
import MemoizedSummary from "./CashFlow/Summary";
import MemoizedTransactionsTable from "./CashFlow/TransactionsTable";
import GeneralLedger from "./CashFlow/GeneralLedger";

const toTitleCase = (str: string) => {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase(),
  );
};

// --- Memoized UI Components to prevent lag ---

// Memoized UI wrappers for already modular components to keep logic consistent
const MemoizedCashRegistry = React.memo(CashRegistry);
const MemoizedInventoryManager = React.memo(InventoryManager);

export default function CashFlowManager() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accountsData, setAccountsData] = useState<Account[]>([]);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [staffRoster, setStaffRoster] = useState<StaffRoster>({});
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [archivedDays, setArchivedDays] = useState<ArchivedDay[]>([]);
  const [productsPrices, setProductsPrices] = useState<any[]>([]);
  const [swimmingPrices, setSwimmingPrices] = useState<any>({});
  const [courtPrices, setCourtPrices] = useState<any>({});
  const [courtBookings, setCourtBookings] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [professors, setProfessors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEverything = async () => {
    setLoading(true);
    try {
      const { data: txs } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false })
        .order("id", { ascending: false });
      setTransactions(
        (txs || []).map((t: any) => ({
          ...t,
          paymentMethod: t.payment_method, // Map database snake_case to camelCase
        })),
      );

      const { data: accs } = await supabase.from("accounts").select("*");
      setAccountsData(accs || []);

      const { data: inv } = await supabase.from("inventory").select("*");
      setInventoryItems(
        (inv || []).map((i: any) => ({
          ...i,
          initialStock: i.initial_stock,
        })),
      );

      const { data: arch } = await supabase.from("archived_days").select("*");
      setArchivedDays(arch || []);

      const { data: prices } = await supabase
        .from("products_prices")
        .select("*");
      setProductsPrices(prices || []);

      const { data: configs } = await supabase
        .from("system_configs")
        .select("*");
      const swimming =
        configs?.find((c) => c.key === "swimming_prices")?.value || {};
      setSwimmingPrices(swimming);

      const courtPricesConfig =
        configs?.find((c) => c.key === "court_prices")?.value || {};
      setCourtPrices(courtPricesConfig);

      const roster =
        configs?.find((c) => c.key === "staff_roster")?.value || {};
      setStaffRoster(roster);

      const { data: bookings } = await supabase
        .from("court_bookings")
        .select("*");
      setCourtBookings(
        (bookings || []).map((b: any) => ({
          id: b.id,
          courtType: b.court_type,
          courtSubNumber: b.court_sub_number,
          dayName: b.day_name,
          startTime: b.start_time,
          duration: b.duration,
          user: b.user_name,
          isWeekly: b.is_weekly,
          date: b.booking_date,
          status: b.status,
        })),
      );

      const { data: promos } = await supabase.from("promotions").select("*");
      const today = new Date().toISOString().split("T")[0];
      setPromotions(
        (promos || []).filter(
          (p: any) =>
            p.active &&
            (!p.start_date || p.start_date <= today) &&
            (!p.end_date || p.end_date >= today),
        ),
      );

      const { data: stds } = await supabase.from("students").select("*");
      setStudents(
        (stds || []).map((s: any) => ({
          ...s,
          fullName: s.full_name,
          hasProfessor: s.has_professor,
          professorName: s.professor_name,
          planType: s.plan_type,
          lastPayment: s.last_payment,
          expiryDate: s.expiry_date,
        })),
      );

      const { data: profs } = await supabase.from("professors").select("*");
      setProfessors(profs || []);

      // Auto-ensure core accounts exist and cleanup duplicates
      const coreAccounts = ["Pileta", "Snack", "Bebida"];
      const currentAccs = accs || [];
      let needsRefresh = false;

      for (const coreName of coreAccounts) {
        // Find all accounts that match this core name (case-insensitive and trimmed)
        const matches = currentAccs.filter(
          (a: any) => a.name.toLowerCase().trim() === coreName.toLowerCase(),
        );

        if (matches.length > 1) {
          // Found duplicates: pick one as survivor (prefer exact match or first found)
          const survivor =
            matches.find((a: any) => a.name === coreName) || matches[0];
          const toDelete = matches.filter((a: any) => a.id !== survivor.id);

          for (const dupe of toDelete) {
            // 1. Reassign transactions to the survivor's exact name
            await supabase
              .from("transactions")
              .update({ category: survivor.name })
              .eq("category", dupe.name);

            // 2. Delete the duplicate account record
            await supabase.from("accounts").delete().eq("id", dupe.id);
          }
          needsRefresh = true;
        } else if (matches.length === 0) {
          // Account doesn't exist at all: create it
          await supabase.from("accounts").insert({
            name: coreName,
            type: "Mixto",
            balance: 0,
            color: theme.palette.primary.main,
          });
          needsRefresh = true;
        }
      }

      if (needsRefresh) {
        const { data: refreshedAccs } = await supabase
          .from("accounts")
          .select("*");
        setAccountsData(refreshedAccs || []);
      }
    } catch (error) {
      console.error("Error loading Supabase data:", error);
    } finally {
      setLoading(false);
    }
  };

  const syncStudentPayments = async () => {
    setLoading(true);
    try {
      let repairedCount = 0;
      for (const student of students) {
        // If student is marked as having a last payment or expiry, verify against transactions
        if (student.lastPayment || student.expiryDate) {
          const payments = transactions.filter(t =>
            t.type === 'Ingreso' &&
            (t.category.toLowerCase().includes('pileta') || t.category.toLowerCase().includes('natación') || t.category.toLowerCase().includes('natacion')) &&
            (t.description.includes(`[DNI:${student.dni}]`) || t.description.includes(student.fullName))
          ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          if (payments.length === 0) {
            // Data inconsistency: Student marked paid but no transaction found
            await supabase.from('students').update({
              last_payment: null,
              expiry_date: null
            }).eq('dni', student.dni);
            repairedCount++;
          } else {
            // Optionally, ensure the dates match the latest transaction
            const latest = payments[0];
            const pMatch = latest.description.match(/\((?:Periodo: )?(.*?)\)/);
            const periodStr = pMatch ? pMatch[1].toLowerCase() : "mes";
            const pDays = periodStr.includes("quincena") ? 15 : periodStr.includes("semana") ? 7 : 30;
            const calcExp = new Date(latest.date);
            calcExp.setDate(calcExp.getDate() + pDays);
            const expStr = calcExp.toISOString().split('T')[0];

            if (student.expiryDate !== expStr || student.lastPayment?.date !== latest.date) {
              await supabase.from('students').update({
                last_payment: { date: latest.date, amount: latest.amount },
                expiry_date: expStr
              }).eq('dni', student.dni);
              repairedCount++;
            }
          }
        }
      }

      if (repairedCount > 0) {
        fetchEverything();
        setErrorMessage(`Se sincronizaron ${repairedCount} estados de alumnos.`);
        setShowSuccess(true);
      } else {
        setErrorMessage("Todos los estados están correctamente sincronizados.");
        setShowSuccess(true);
      }
    } catch (error) {
      console.error("Error syncing student payments:", error);
      setErrorMessage("Error al sincronizar alumnos.");
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEverything();

    const channel = supabase
      .channel("cashflow_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions" },
        fetchEverything,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const [open, setOpen] = useState(false);
  const [openAccountDialog, setOpenAccountDialog] = useState(false);
  const [openRosterDialog, setOpenRosterDialog] = useState(false);
  const [openSummaryExport, setOpenSummaryExport] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [view, setView] = useState(0); // 0: Flow, 1: Registry, 2: Inventory, 3: Accounts, 4: Resumen
  const [summaryMonth, setSummaryMonth] = useState(new Date().getMonth() + 1);
  const [summaryYear, setSummaryYear] = useState(new Date().getFullYear());
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    type: "Ingreso",
    category: "",
    amount: "",
    paymentMethod: "Efectivo",
    description: "",
  });
  const [accountFormData, setAccountFormData] = useState({
    name: "",
    type: "Mixto",
    balance: "0",
  });
  const [invoiceData, setInvoiceData] = useState({
    letter: "",
    num1: "",
    num2: "",
  });

  const [filters, setFilters] = useState({
    search: "",
    type: "Todos",
    category: "Todas",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isCreatingStudent, setIsCreatingStudent] = useState(false);
  const [studentSearchInput, setStudentSearchInput] = useState("");
  const [newStudentData, setNewStudentData] = useState({
    fullName: "",
    dni: "",
    phone: "",
  });

  const [renewalDays, setRenewalDays] = useState(30);
  const [swimmingSelection, setSwimmingSelection] = useState({
    planType: "conProfesor", // conProfesor, libre, matronatacion, plantel, porClase, porDiaLibre
    frequency: "v2", // v2, v3, v5
  });

  const [shouldDiscountStock, setShouldDiscountStock] = useState(false);
  const [selectedStockProduct, setSelectedStockProduct] = useState<any>(null);
  const [discountQuantity, setDiscountQuantity] = useState(1);



  const isPileta =
    formData.type === "Ingreso" &&
    (formData.category.toLowerCase().includes("pileta") ||
      formData.category.toLowerCase().includes("natación") ||
      formData.category.toLowerCase().includes("natacion"));

  const isCourtCategory =
    formData.type === "Ingreso" &&
    formData.category.toLowerCase().includes("cancha");

  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(
    null,
  );

  const isAutoInvoice =
    formData.type === "Ingreso" &&
    (isPileta ||
      formData.category.toLowerCase().includes("bebida") ||
      formData.category.toLowerCase().includes("snack"));

  const isInventoryCategory =
    formData.type === "Ingreso" &&
    (formData.category.toLowerCase().includes("bebida") ||
      formData.category.toLowerCase().includes("snack"));

  // Sync inventory items with centralized productsPrices
  useEffect(() => {
    if (productsPrices.length === 0) return;
    setInventoryItems((prev: any[]) => {
      // 1. Map existing items to update prices
      const updatedExisting = prev.map((item) => {
        const globalInfo = productsPrices.find(
          (p: any) => p.name === item.name,
        );
        return globalInfo ? { ...item, price: globalInfo.price } : item;
      });

      // 2. Identify and add missing products from global list
      const missingProducts = productsPrices
        .filter((gp: any) => !prev.some((item) => item.name === gp.name))
        .map((gp: any) => ({
          name: gp.name,
          category:
            gp.name.toLowerCase().includes("agua") ||
              gp.name.toLowerCase().includes("coca") ||
              gp.name.toLowerCase().includes("aquarius") ||
              gp.name.toLowerCase().includes("powerade") ||
              gp.name.toLowerCase().includes("monster") ||
              gp.name.toLowerCase().includes("heineken")
              ? "Bebidas"
              : "Snacks",
          initialStock: 0,
          entries: 0,
          exits: 0,
          price: gp.price,
        }));

      if (missingProducts.length === 0) {
        const pricesChanged = updatedExisting.some(
          (item, idx) => item.price !== prev[idx]?.price,
        );
        if (!pricesChanged) return prev;
      }

      return [...updatedExisting, ...missingProducts];
    });
  }, [productsPrices]);

  // Efecto para calcular el precio de Club automáticamente para Natación
  useEffect(() => {
    if (isPileta && swimmingPrices && Object.keys(swimmingPrices).length > 0) {
      let baseClubPrice = 0;
      const { planType, frequency } = swimmingSelection;

      if (planType === "conProfesor") {
        baseClubPrice =
          (swimmingPrices.conProfesor as any)?.[frequency]?.club || 0;
      } else if (planType === "libre") {
        baseClubPrice = (swimmingPrices.libre as any)?.[frequency] || 0;
      } else if (planType === "porDiaLibre") {
        baseClubPrice = swimmingPrices.porDiaLibre || 0;
      } else {
        baseClubPrice =
          (swimmingPrices as any)?.[planType]?.club ||
          (swimmingPrices as any)?.[planType] ||
          0;
      }

      // Ajustar por periodo (30 días es el base)
      const calculatedAmount = (baseClubPrice * renewalDays) / 30;
      setFormData((prev) => ({
        ...prev,
        amount: Math.round(calculatedAmount).toString(),
      }));
    }
  }, [swimmingSelection, renewalDays, isPileta, swimmingPrices]);

  // Efecto para autogenerar la descripción para Natación
  useEffect(() => {
    if (isPileta && selectedStudent) {
      const planNames: { [key: string]: string } = {
        conProfesor: "Con Profesor",
        libre: "Pileta Libre",
        matronatacion: "Matronatación",
        plantel: "Plantel",
        porClase: "Clase Suelta",
        porDiaLibre: "Día Libre",
      };

      const freqLabels: { [key: string]: string } = {
        v2: "2 veces p/semana",
        v3: "3 veces p/semana",
        v5: "5 veces p/semana",
      };

      const plan =
        planNames[swimmingSelection.planType] || swimmingSelection.planType;
      const freq =
        swimmingSelection.planType === "conProfesor" ||
          swimmingSelection.planType === "libre"
          ? ` (${freqLabels[swimmingSelection.frequency] || ""})`
          : "";
      const period =
        renewalDays === 30 ? "Mes" : renewalDays === 15 ? "Quincena" : "Semana";

      const prof = selectedStudent?.hasProfessor && selectedStudent?.professorName
        ? ` (Prof: ${selectedStudent.professorName})`
        : "";

      setFormData((prev) => ({
        ...prev,
        description: `${plan}${freq}${prof} - ${selectedStudent.fullName} [DNI:${selectedStudent.dni}] (Periodo: ${period})`,
      }));
    }
  }, [selectedStudent, swimmingSelection, renewalDays, isPileta]);

  // Efecto para calcular el precio de Inventario automáticamente (Precio * Cantidad)
  useEffect(() => {
    if (isInventoryCategory && selectedStockProduct) {
      const total = selectedStockProduct.price * discountQuantity;
      setFormData((prev) => ({ ...prev, amount: total.toString() }));
    }
  }, [selectedStockProduct, discountQuantity, isInventoryCategory]);

  const handleInvoiceChange = (
    field: "letter" | "num1" | "num2",
    value: string,
  ) => {
    // Restrict num1 and num2 to digits only
    if (
      (field === "num1" || field === "num2") &&
      value !== "" &&
      !/^\d+$/.test(value)
    ) {
      return;
    }

    const newData = { ...invoiceData, [field]: value.toUpperCase() };
    setInvoiceData(newData);

    if (field === "letter" && value.length >= 1) {
      document.getElementById("invoice-num1")?.focus();
    } else if (field === "num1" && value.length >= 4) {
      document.getElementById("invoice-num2")?.focus();
    }
  };

  const theme = useTheme();

  const generateAutoInvoice = () => {
    const prefix = "C-0100-";
    const relevantInvoices = transactions
      .filter((t) => t.invoice?.startsWith(prefix))
      .map((t) => {
        const parts = t.invoice?.split("-");
        return parts ? parseInt(parts[2]) : 0;
      });

    const nextNumber =
      relevantInvoices.length > 0 ? Math.max(...relevantInvoices) + 1 : 1;
    return `${prefix}${nextNumber.toString().padStart(8, "0")}`;
  };

  const handleRegister = async () => {
    if (!formData.category || !formData.amount) return;

    const formattedCategory = toTitleCase(formData.category.trim());

    let finalInvoice: string | undefined = undefined;
    if (isAutoInvoice) {
      finalInvoice = generateAutoInvoice();
    } else if (invoiceData.letter || invoiceData.num1 || invoiceData.num2) {
      finalInvoice = `${invoiceData.letter || "X"}-${invoiceData.num1 || "0000"}-${invoiceData.num2 || "00000000"}`;

      const isDuplicate = transactions.some((t) => t.invoice === finalInvoice);
      if (isDuplicate) {
        setErrorMessage(
          "Ya existe un movimiento con este número de comprobante/factura.",
        );
        setShowError(true);
        return;
      }
    }

    let finalDesc = formData.description;
    let studentToUpsert: any = null;

    // Automatic Description Logic
    if (!finalDesc) {
      if (isPileta) {
        const studentName =
          isCreatingStudent && newStudentData.fullName
            ? newStudentData.fullName
            : selectedStudent?.fullName || "Alumno";

        const period =
          renewalDays === 30
            ? "Mes"
            : renewalDays === 15
              ? "Quincena"
              : "Semana";

        const planNames: { [key: string]: string } = {
          conProfesor: "Con Profesor",
          libre: "Pileta Libre",
          matronatacion: "Matronatación",
          plantel: "Plantel",
          porClase: "Clase Suelta",
          porDiaLibre: "Día Libre",
        };
        const freqLabels: { [key: string]: string } = {
          v2: "2 veces p/semana",
          v3: "3 veces p/semana",
          v5: "5 veces p/semana",
        };
        const plan =
          planNames[swimmingSelection.planType] || swimmingSelection.planType;
        const freq =
          swimmingSelection.planType === "conProfesor" ||
            swimmingSelection.planType === "libre"
            ? ` (${freqLabels[swimmingSelection.frequency] || ""})`
            : "";

        finalDesc = `Renovación: ${studentName} [DNI:${isCreatingStudent ? newStudentData.dni : selectedStudent?.dni}] - ${plan}${freq} (${period})`;
      } else if (isInventoryCategory && selectedStockProduct) {
        finalDesc = `Venta: ${selectedStockProduct.name} (x${discountQuantity})`;
      } else if (isCourtCategory && selectedBookingId) {
        const booking = courtBookings.find((b) => b.id === selectedBookingId);
        if (booking) {
          finalDesc = `Reserva Cancha: ${booking.user} (${booking.dayName} ${booking.startTime}hs)`;
        } else {
          finalDesc = `Pago de Cancha (${formattedCategory})`;
        }
      } else if (formattedCategory.toLowerCase().includes("kiosco")) {
        finalDesc = "Venta Kiosco";
      } else {
        // Fallback description based on category if still empty
        finalDesc = `${formattedCategory}`;
      }
    }

    if (isPileta) {
      if (selectedStudent || isCreatingStudent) {
        const student = students.find(
          (s) =>
            s.dni ===
            (isCreatingStudent ? newStudentData.dni : selectedStudent.dni),
        );
        const today = new Date();
        const baseDate =
          student && student.expiryDate && new Date(student.expiryDate) > today
            ? new Date(student.expiryDate)
            : today;

        const newExpiry = new Date(baseDate);
        newExpiry.setDate(newExpiry.getDate() + renewalDays);

        studentToUpsert = {
          full_name: isCreatingStudent
            ? newStudentData.fullName
            : selectedStudent.fullName,
          dni: isCreatingStudent ? newStudentData.dni : selectedStudent.dni,
          phone: isCreatingStudent
            ? newStudentData.phone
            : selectedStudent.phone,
          has_professor: isCreatingStudent
            ? false
            : selectedStudent.hasProfessor,
          professor_name: isCreatingStudent
            ? ""
            : selectedStudent.professorName,
          plan_type: isCreatingStudent
            ? swimmingSelection.planType
            : selectedStudent.planType,
          last_payment: {
            date: today.toISOString().split("T")[0],
            amount: parseFloat(formData.amount),
          },
          expiry_date: newExpiry.toISOString().split("T")[0],
        };
      }
    }

    const parsedAmount = parseFloat(formData.amount);
    if (isNaN(parsedAmount)) {
      setErrorMessage("El monto ingresado no es un número válido.");
      setShowError(true);
      return;
    }

    try {
      const { error: txError } = await supabase.from("transactions").insert({
        date: new Date().toISOString().split("T")[0],
        type: formData.type,
        category: formattedCategory,
        amount: parsedAmount,
        payment_method: formData.paymentMethod,
        invoice: finalInvoice,
        description: finalDesc,
      });

      if (txError) throw txError;

      // Ensure the category exists in accounts table for ledger consistency
      const trimCat = formattedCategory.trim();
      const categoryExists = accountsData.some(
        (a) => a.name.trim().toLowerCase() === trimCat.toLowerCase(),
      );
      if (!categoryExists && trimCat) {
        await supabase.from("accounts").insert({
          name: trimCat,
          type: "Mixto",
          balance: 0,
          color: theme.palette.primary.main,
        });
        // Fetch again to update accountsData and prevent further duplicate attempts
        fetchEverything();
      }

      if (studentToUpsert) {
        const { error: studentError } = await supabase
          .from("students")
          .upsert(studentToUpsert, { onConflict: "dni" });
        if (studentError) throw studentError;
      }

      if (shouldDiscountStock && selectedStockProduct) {
        const { error: invError } = await supabase
          .from("inventory")
          .update({
            exits: (selectedStockProduct.exits || 0) + discountQuantity,
          })
          .eq("id", selectedStockProduct.id);
        if (invError) throw invError;
      }

      if (selectedBookingId) {
        const { error: bookingError } = await supabase
          .from("court_bookings")
          .update({ status: "Pagado" })
          .eq("id", selectedBookingId);
        if (bookingError) throw bookingError;
      }

      setShowSuccess(true);
      fetchEverything();

      // Clear form but keep dialog open to allow continuous entry
      setFormData({
        type: "Ingreso",
        category: "",
        amount: "",
        paymentMethod: "Efectivo",
        description: "",
      });
      setInvoiceData({ letter: "", num1: "", num2: "" });
      setSelectedStudent(null);
      setIsCreatingStudent(false);
      setShouldDiscountStock(false);
      setSelectedStockProduct(null);
      setSelectedBookingId(null);
      setDiscountQuantity(1);
    } catch (error: any) {
      console.error("Error in handleRegister:", error);
      const detail = error.message || error.details || "Error desconocido";
      setErrorMessage(`Error al registrar: ${detail}`);
      setShowError(true);
    }
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setShowSuccess(false);
    setFormData({
      type: "Ingreso",
      category: "",
      amount: "",
      paymentMethod: "Efectivo",
      description: "",
    });
    setInvoiceData({ letter: "", num1: "", num2: "" });
    setSelectedStudent(null);
    setIsCreatingStudent(false);
    setShouldDiscountStock(false);
    setSelectedStockProduct(null);
    setSelectedBookingId(null);
    setDiscountQuantity(1);
  };

  const handleCreateAccount = async () => {
    if (!accountFormData.name) return;

    const formattedName = toTitleCase(accountFormData.name.trim());

    // Validate uniqueness
    const exists = accountsData.some(
      (a) => a.name.toLowerCase() === formattedName.toLowerCase(),
    );
    if (exists) {
      setErrorMessage("Ya existe una cuenta con ese nombre.");
      setShowError(true);
      return;
    }

    try {
      const { error } = await supabase.from("accounts").insert({
        name: formattedName,
        type: accountFormData.type,
        balance: parseFloat(accountFormData.balance) || 0,
        color: theme.palette.primary.main,
      });

      if (error) throw error;

      setShowSuccess(true);
      setOpenAccountDialog(false);
      setAccountFormData({ name: "", type: "Mixto", balance: "0" });
      fetchEverything();
    } catch (error) {
      console.error("Error creating account:", error);
      setErrorMessage("Error al crear la cuenta.");
      setShowError(true);
    }
  };

  const handleUpdateInventory = async (items: any[]) => {
    // Determine which items were deleted
    const deletedIds = inventoryItems
      .filter((oldItem) => !items.some((newItem) => newItem.id === oldItem.id))
      .map((item) => item.id);

    setInventoryItems(items);

    try {
      // 1. Delete items that are no longer in the list
      if (deletedIds.length > 0) {
        const { error: delError } = await supabase
          .from("inventory")
          .delete()
          .in("id", deletedIds);
        if (delError) throw delError;
      }

      // 2. Update/Insert remaining items
      const { error: invError } = await supabase.from("inventory").upsert(
        items.map((item) => ({
          // If it's a temporary ID (Date.now()), don't send it so Supabase generates a real one
          ...(typeof item.id === 'number' && item.id > 1700000000000 ? {} : { id: item.id }),
          name: item.name,
          category: item.category,
          initial_stock: item.initialStock,
          entries: item.entries,
          exits: item.exits,
          price: item.price,
        })),
      );
      if (invError) throw invError;

      // 3. Sync global prices
      const { error: priceError } = await supabase
        .from("products_prices")
        .upsert(
          items.map((item) => ({
            name: item.name,
            price: item.price,
          })),
          { onConflict: "name" },
        );
      if (priceError) throw priceError;

      // If we added new items, fetch again to get real IDs from DB
      if (items.some(i => typeof i.id === 'number' && i.id > 1700000000000)) {
        fetchEverything();
      }
    } catch (error) {
      console.error("Error updating inventory/prices:", error);
      setErrorMessage("Error al actualizar el inventario.");
      setShowError(true);
    }
  };

  const handleArchiveDay = async (newDay: any) => {
    try {
      const { error } = await supabase.from("archived_days").insert({
        date: newDay.date,
        shifts: newDay.shifts,
        total_balance: newDay.totalBalance,
        movements: newDay.movements,
      });
      if (error) throw error;
      fetchEverything();
      setShowSuccess(true);
    } catch (error) {
      console.error("Error archiving day:", error);
      setErrorMessage("Error al archivar la jornada.");
      setShowError(true);
    }
  };

  const handleSaveRoster = async () => {
    try {
      const { error } = await supabase
        .from("system_configs")
        .upsert(
          { key: "staff_roster", value: staffRoster },
          { onConflict: "key" },
        );
      if (error) throw error;
      setOpenRosterDialog(false);
      setShowSuccess(true);
    } catch (error) {
      console.error("Error saving roster:", error);
      setErrorMessage("Error al guardar la configuración de personal.");
      setShowError(true);
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    if (
      !window.confirm(
        "¿Estás seguro de que deseas eliminar este movimiento? Esta acción no se puede deshacer y también eliminará las reservas de cancha asociadas.",
      )
    )
      return;

    try {
      const txToDelete = transactions.find((t) => t.id === id);

      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      if (txToDelete && txToDelete.category?.toLowerCase().includes("cancha")) {
        const descMatch = txToDelete.description.match(
          /(?:Reserva|Pago) Cancha: (.*?) \((.*?) (.*?)hs\)/,
        );
        if (descMatch) {
          const matchedUser = descMatch[1].trim();
          const matchedDayName = descMatch[2].trim();
          const matchedStartTime = descMatch[3].trim();

          await supabase.from("court_bookings").delete().match({
            user_name: matchedUser,
            day_name: matchedDayName,
            start_time: matchedStartTime,
            status: "Pagado",
          });
        }
      }

      setErrorMessage("Movimiento eliminado correctamente.");
      setShowSuccess(true);
      fetchEverything();

      // Correlación con Inventario: Revertir stock/egresos
      if (txToDelete && txToDelete.description.startsWith("Venta: ")) {
        const invMatch = txToDelete.description.match(/Venta: (.*?) \(x(\d+)\)/);
        if (invMatch) {
          const prodName = invMatch[1];
          const qty = parseInt(invMatch[2]);
          const invItem = inventoryItems.find((i) => i.name === prodName);
          if (invItem) {
            await supabase
              .from("inventory")
              .update({ exits: (invItem.exits || 0) - qty })
              .eq("id", invItem.id);
          }
        }
      }

      // Correlación con Alumnos: Revertir estado de pago
      if (
        txToDelete &&
        txToDelete.type === "Ingreso" &&
        (txToDelete.category.toLowerCase().includes("pileta") ||
          txToDelete.category.toLowerCase().includes("natación") ||
          txToDelete.category.toLowerCase().includes("natacion"))
      ) {
        // Intentar obtener DNI o Nombre de la descripción
        const dniMatch = txToDelete.description.match(/\[DNI:(.*?)\]/);
        const nameMatch = txToDelete.description.match(/Renovación: (.*?) \[/);
        const studentDni = dniMatch ? dniMatch[1] : null;
        const studentName = nameMatch
          ? nameMatch[1]
          : txToDelete.description.split(" - ")[1];

        const student = students.find(
          (s) =>
            (studentDni && s.dni === studentDni) || s.fullName === studentName,
        );

        if (student) {
          // Buscar todos los otros pagos del alumno
          const otherPayments = transactions
            .filter(
              (t) =>
                t.id !== id &&
                t.type === "Ingreso" &&
                (t.category.toLowerCase().includes("pileta") ||
                  t.category.toLowerCase().includes("natación") ||
                  t.category.toLowerCase().includes("natacion")) &&
                (t.description.includes(`[DNI:${student.dni}]`) ||
                  t.description.includes(student.fullName)),
            )
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            );

          let studentUpdate = {
            last_payment: null as any,
            expiry_date: null as any,
          };

          if (otherPayments.length > 0) {
            const lastP = otherPayments[0];
            // Intentar extraer periodo para recalcular vencimiento
            const pMatch = lastP.description.match(/\((?:Periodo: )?(.*?)\)/);
            const periodStr = pMatch ? pMatch[1].toLowerCase() : "mes";
            const pDays = periodStr.includes("quincena")
              ? 15
              : periodStr.includes("semana")
                ? 7
                : 30;

            const newExp = new Date(lastP.date);
            newExp.setDate(newExp.getDate() + pDays);

            studentUpdate = {
              last_payment: { date: lastP.date, amount: lastP.amount },
              expiry_date: newExp.toISOString().split("T")[0],
            };
          }

          await supabase
            .from("students")
            .update(studentUpdate)
            .eq("dni", student.dni);
        }
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      setErrorMessage("Error al eliminar el movimiento.");
      setShowError(true);
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        t.category.toLowerCase().includes(filters.search.toLowerCase()) ||
        t.description.toLowerCase().includes(filters.search.toLowerCase());
      const matchesType = filters.type === "Todos" || t.type === filters.type;
      const matchesCategory =
        filters.category === "Todas" || t.category === filters.category;
      const matchesDate =
        (!filters.startDate || t.date >= filters.startDate) &&
        (!filters.endDate || t.date <= filters.endDate);
      return matchesSearch && matchesType && matchesCategory && matchesDate;
    });
  }, [transactions, filters]);

  const categories = useMemo(() => {
    return ["Todas", ...new Set(transactions.map((t) => t.category))];
  }, [transactions]);

  const accountOptions = useMemo(() => {
    return accountsData.map((a) => a.name.trim());
  }, [accountsData]);

  const handleExportPDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(20);
    doc.setTextColor(26, 95, 122);
    doc.text("Reporte de Flujo de Caja", 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(
      `Periodo: ${filters.startDate || "Inicio"} al ${filters.endDate || "Hoy"}`,
      14,
      35,
    );

    // Summary Box
    doc.setDrawColor(230);
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(14, 42, pageWidth - 28, 30, 2, 2, "F");

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Resumen del Periodo", 20, 50);

    doc.setFontSize(10);
    doc.text(`Total Ingresos: $${totalIncomes.toLocaleString()}`, 20, 58);
    doc.text(`Total Egresos: $${totalExpenses.toLocaleString()}`, 20, 64);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Balance Neto: $${balance.toLocaleString()}`, pageWidth - 70, 64);
    doc.setFont("helvetica", "normal");

    // Capture Chart if exists
    const chartElement = document.getElementById("cashflow-charts");
    if (chartElement) {
      const canvas = await html2canvas(chartElement, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = pageWidth - 28;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      doc.addImage(imgData, "PNG", 14, 78, imgWidth, imgHeight);

      // Start table after chart
      autoTable(doc, {
        startY: 78 + imgHeight + 10,
        head: [
          ["Fecha", "Tipo", "Categoría", "Descripción", "Monto", "Método"],
        ],
        body: filteredTransactions.map((t) => [
          t.date,
          t.type,
          t.category,
          t.description,
          `$${t.amount.toLocaleString()}`,
          t.paymentMethod,
        ]),
        headStyles: { fillColor: [26, 95, 122] },
        alternateRowStyles: { fillColor: [245, 247, 250] },
      });
    } else {
      autoTable(doc, {
        startY: 78,
        head: [
          ["Fecha", "Tipo", "Categoría", "Descripción", "Monto", "Método"],
        ],
        body: filteredTransactions.map((t) => [
          t.date,
          t.type,
          t.category,
          t.description,
          `$${t.amount.toLocaleString()}`,
          t.paymentMethod,
        ]),
        headStyles: { fillColor: [26, 95, 122] },
        alternateRowStyles: { fillColor: [245, 247, 250] },
      });
    }

    doc.save(`Reporte_Caja_${filters.startDate}_v_${filters.endDate}.pdf`);
  };

  // Handle file export (CSV or Excel)
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);

  const handleExportFile = (format: "csv" | "excel") => {
    setExportMenuAnchor(null);
    const headers = [
      "Fecha",
      "Tipo",
      "Categoría",
      "Descripción",
      "Monto",
      "Método",
      "Factura",
    ];
    const rows = filteredTransactions.map((t) => [
      t.date,
      t.type,
      t.category,
      t.description,
      t.amount.toString(),
      t.paymentMethod,
      t.invoice || "",
    ]);

    const separator = format === "excel" ? ";" : ",";

    const csvContent = [
      headers.join(separator),
      ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(separator)),
    ].join("\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `flujo_caja_${filters.startDate}_al_${filters.endDate}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportSummaryPDF = async () => {
    const monthNames = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    const monthName = monthNames[summaryMonth - 1];

    const monthlyTxs = transactions.filter((t) => {
      const d = new Date(t.date);
      return (
        d.getMonth() + 1 === summaryMonth && d.getFullYear() === summaryYear
      );
    });
    setOpenSummaryExport(false);
    setIsGeneratingPDF(true);

    try {
      // Use landscape for better layout on a single page
      const doc = new jsPDF("l", "pt", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // compact Header
      doc.setFillColor(26, 95, 122);
      doc.rect(0, 0, pageWidth, 50, "F");
      doc.setFontSize(22);
      doc.setTextColor(255);
      doc.setFont("helvetica", "bold");
      doc.text("INFORME DE GESTIÓN MENSUAL", 30, 32);
      doc.setFontSize(14);
      doc.text(
        `${monthName.toUpperCase()} ${summaryYear}`,
        pageWidth - 30,
        32,
        { align: "right" },
      );

      // Stats Grid - Row 1
      const mIncomes = monthlyTxs
        .filter((t) => t.type === "Ingreso")
        .reduce((acc, t) => acc + t.amount, 0);
      const mExpenses = monthlyTxs
        .filter((t) => t.type === "Egreso")
        .reduce((acc, t) => acc + t.amount, 0);

      doc.setTextColor(40);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("INGRESOS TOTALES", 40, 75);
      doc.text("EGRESOS TOTALES", 200, 75);
      doc.text("RESULTADO NETO", 360, 75);

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(46, 125, 50); // green
      doc.text(`$${mIncomes.toLocaleString()}`, 40, 95);
      doc.setTextColor(211, 47, 47); // red
      doc.text(`$${mExpenses.toLocaleString()}`, 200, 95);
      doc.setTextColor(26, 95, 122); // blue
      doc.text(`$${(mIncomes - mExpenses).toLocaleString()}`, 360, 95);

      // Main Content: Table (Left) + Charts (Right)
      const cats: { [key: string]: number } = {};
      monthlyTxs
        .filter((t) => t.type === "Ingreso")
        .forEach(
          (t) => (cats[t.category] = (cats[t.category] || 0) + t.amount),
        );

      autoTable(doc, {
        startY: 120,
        margin: { left: 30 },
        tableWidth: 350,
        head: [["Categoría de Ingreso", "Importe"]],
        body: Object.entries(cats).map(([name, val]) => [
          name,
          `$${val.toLocaleString()}`,
        ]),
        theme: "striped",
        headStyles: { fillColor: [26, 95, 122], fontSize: 9 },
        bodyStyles: { fontSize: 8 },
      });

      const chartElement = document.getElementById("cashflow-charts");
      if (chartElement) {
        const canvas = await html2canvas(chartElement, {
          scale: 2,
          useCORS: true,
          logging: false,
        });
        const imgData = canvas.toDataURL("image/png");

        // Fit charts on the right side of the page
        const chartX = 400;
        const chartWidth = pageWidth - 430;
        const chartHeight = (canvas.height * chartWidth) / canvas.width;

        doc.addImage(imgData, "PNG", chartX, 120, chartWidth, chartHeight);
      }

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Generado automáticamente el ${new Date().toLocaleString()}`,
        30,
        pageHeight - 20,
      );

      doc.save(`Resumen_${monthName}_${summaryYear}.pdf`);
      setShowSuccess(true);
    } catch (error) {
      console.error("PDF Error:", error);
      setErrorMessage("Error al generar el PDF. Reintentando...");
      setShowError(true);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const chartData = useMemo(() => {
    const daily: { [key: string]: any } = {};
    filteredTransactions.forEach((t) => {
      if (!daily[t.date])
        daily[t.date] = { date: t.date, ingreso: 0, egreso: 0 };
      if (t.type === "Ingreso") daily[t.date].ingreso += t.amount;
      else daily[t.date].egreso += t.amount;
    });
    return Object.values(daily).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredTransactions]);

  const pieData = useMemo(() => {
    const cats: { [key: string]: number } = {};
    filteredTransactions
      .filter((t) => t.type === "Ingreso")
      .forEach((t) => {
        cats[t.category] = (cats[t.category] || 0) + t.amount;
      });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [filteredTransactions]);

  const COLORS = [
    "#1a5f7a",
    "#c1121f",
    "#ffb703",
    "#8ecae6",
    "#4caf50",
    "#9c27b0",
  ];

  const dashboardData = useMemo(() => {
    const monthlyTxs = transactions.filter((t) => {
      const d = new Date(t.date);
      return (
        d.getMonth() + 1 === summaryMonth && d.getFullYear() === summaryYear
      );
    });

    const income = monthlyTxs
      .filter((t) => t.type === "Ingreso")
      .reduce((acc, t) => acc + t.amount, 0);
    const expense = monthlyTxs
      .filter((t) => t.type === "Egreso")
      .reduce((acc, t) => acc + t.amount, 0);

    const daily: { [key: string]: any } = {};
    const methodMap: { [key: string]: number } = {};
    const weekdayMap: { [key: string]: number } = {
      Lunes: 0,
      Martes: 0,
      Miércoles: 0,
      Jueves: 0,
      Viernes: 0,
      Sábado: 0,
      Domingo: 0,
    };
    const daysArr = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];

    const categoryStats: {
      [key: string]: { income: number; expense: number };
    } = {};

    const studentRank: { [key: string]: number } = {};
    const productSales: { [key: string]: number } = {};

    monthlyTxs.forEach((t) => {
      // Daily dynamics
      if (!daily[t.date])
        daily[t.date] = { date: t.date, ingreso: 0, egreso: 0 };
      if (t.type === "Ingreso") daily[t.date].ingreso += t.amount;
      else daily[t.date].egreso += t.amount;

      // Method distribution
      methodMap[t.paymentMethod] = (methodMap[t.paymentMethod] || 0) + t.amount;

      // Weekday activity (Concurrence proxy)
      const dayName = daysArr[new Date(t.date).getDay()];
      weekdayMap[dayName]++;

      // Category breakdown
      if (!categoryStats[t.category])
        categoryStats[t.category] = { income: 0, expense: 0 };
      if (t.type === "Ingreso") categoryStats[t.category].income += t.amount;
      else categoryStats[t.category].expense += t.amount;

      // Student activity extraction
      if (
        t.category.toLowerCase().includes("pileta") ||
        t.category.toLowerCase().includes("natación")
      ) {
        const parts = t.description.split(" - ");
        const name = parts[1] || parts[0];
        if (name && name !== "N/A" && name.length > 3) {
          studentRank[name] = (studentRank[name] || 0) + 1;
        }
      }

      // Product sales volume
      if (
        t.category.toLowerCase().includes("bebida") ||
        t.category.toLowerCase().includes("snack")
      ) {
        productSales[t.description] = (productSales[t.description] || 0) + 1;
      }
    });

    const incomeCats = Object.entries(categoryStats)
      .filter(([_, v]) => v.income > 0)
      .sort((a, b) => b[1].income - a[1].income);
    const expenseCats = Object.entries(categoryStats)
      .filter(([_, v]) => v.expense > 0)
      .sort((a, b) => b[1].expense - a[1].expense);

    // Annual Concurrence Trend
    const monthNames = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];
    const annualTrend = monthNames.map((name, i) => {
      const ops = transactions.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === i && d.getFullYear() === summaryYear;
      }).length;
      return { name, concurrencia: ops };
    });

    // Stock vs Sales Data
    const stockVsSales = inventoryItems
      .slice(0, 10)
      .map((item) => ({
        name: item.name,
        stock:
          (item.initialStock || 0) + (item.entries || 0) - (item.exits || 0),
        ventasMes: productSales[item.name] || 0,
      }))
      .sort((a, b) => b.ventasMes - a.ventasMes);

    return {
      monthlyTxs,
      income,
      expense,
      net: income - expense,
      topIncomeCat: incomeCats[0] ? incomeCats[0][0] : "N/A",
      topExpenseCat: expenseCats[0] ? expenseCats[0][0] : "N/A",
      dailyChart: Object.values(daily).sort((a, b) =>
        a.date.localeCompare(b.date),
      ),
      pieChart: incomeCats.map(([name, v]) => ({ name, value: v.income })),
      methodChart: Object.entries(methodMap).map(([name, value]) => ({
        name,
        value,
      })),
      activityChart: Object.entries(weekdayMap).map(([name, value]) => ({
        name,
        value,
      })),
      studentRanking: Object.entries(studentRank)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      annualTrend,
      stockVsSales,
    };
  }, [transactions, summaryMonth, summaryYear, inventoryItems]);

  const accountsSummary = useMemo(() => {
    return accountsData.map((acc) => {
      const accIncomes = transactions
        .filter((t) => t.category === acc.name && t.type === "Ingreso")
        .reduce((sum, t) => sum + t.amount, 0);
      const accExpenses = transactions
        .filter((t) => t.category === acc.name && t.type === "Egreso")
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        ...acc,
        accIncomes,
        accExpenses,
        accBalance: accIncomes - accExpenses,
      };
    });
  }, [accountsData, transactions]);

  const { totalIncomes, totalExpenses, balance } = useMemo(() => {
    const income = filteredTransactions
      .filter((t) => t.type === "Ingreso")
      .reduce((acc, t) => acc + t.amount, 0);
    const expense = filteredTransactions
      .filter((t) => t.type === "Egreso")
      .reduce((acc, t) => acc + t.amount, 0);
    return {
      totalIncomes: income,
      totalExpenses: expense,
      balance: income - expense,
    };
  }, [filteredTransactions]);
  return (
    <Box>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          pb: 1,
        }}
      >
        <Tabs
          value={view}
          onChange={(_, v) => setView(v)}
          sx={{ minHeight: 40 }}
        >
          <Tab
            icon={<AccountBalanceWalletIcon sx={{ fontSize: 20 }} />}
            label="Flujo de Caja"
            iconPosition="start"
            sx={{ minHeight: 40 }}
          />
          <Tab
            icon={<PointOfSaleIcon sx={{ fontSize: 20 }} />}
            label="Arqueo de Caja"
            iconPosition="start"
            sx={{ minHeight: 40 }}
          />
          <Tab
            icon={<InventoryIcon sx={{ fontSize: 20 }} />}
            label="Inventario"
            iconPosition="start"
            sx={{ minHeight: 40 }}
          />
          <Tab
            icon={<AccountBalanceWalletIcon sx={{ fontSize: 20 }} />}
            label="Libro Mayor"
            iconPosition="start"
            sx={{ minHeight: 40 }}
          />
        </Tabs>

        <Typography
          variant="h6"
          sx={{ fontWeight: 800, color: "text.secondary", pb: 1 }}
        >
          {new Date().toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </Typography>
      </Box>

      {view === 0 && (
        <>
          <Box sx={{ mb: 4 }}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<AddIcon sx={{ fontSize: 24 }} />}
              onClick={() => setOpen(true)}
              sx={{
                py: 2,
                fontSize: "1.1rem",
                fontWeight: 900,
                borderRadius: 3,
                boxShadow: theme.shadows[4],
                "&:hover": {
                  boxShadow: theme.shadows[8],
                  transform: "translateY(-2px)",
                },
                transition: "all 0.2s",
              }}
            >
              REGISTRAR NUEVO MOVIMIENTO
            </Button>
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 4,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: alpha(theme.palette.primary.main, 0.02),
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    bgcolor: "background.paper",
                    borderRadius: 2,
                    px: 2,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <SearchIcon color="action" fontSize="small" />
                  <OptimizedTextField
                    placeholder="Buscar..."
                    sx={{ ml: 1, flex: 1 }}
                    InputProps={{
                      sx: {
                        fontSize: "0.9rem",
                        py: 0.5,
                        "& fieldset": { border: "none" },
                      },
                    }}
                    value={filters.search}
                    debounceMs={300}
                    onChange={(val) => setFilters({ ...filters, search: val })}
                  />
                </Box>
              </Grid>
              <Grid item xs={6} md={1.5}>
                <TextField
                  select
                  size="small"
                  fullWidth
                  value={filters.type}
                  onChange={(e) =>
                    setFilters({ ...filters, type: e.target.value })
                  }
                  InputProps={{ sx: { borderRadius: 2, fontSize: "0.85rem" } }}
                >
                  <MenuItem value="Todos">Todos</MenuItem>
                  <MenuItem value="Ingreso">Ingresos</MenuItem>
                  <MenuItem value="Egreso">Egresos</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6} md={1.5}>
                <TextField
                  select
                  size="small"
                  fullWidth
                  value={filters.category}
                  onChange={(e) =>
                    setFilters({ ...filters, category: e.target.value })
                  }
                  InputProps={{ sx: { borderRadius: 2, fontSize: "0.85rem" } }}
                >
                  {categories.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField
                  type="date"
                  label="Desde"
                  size="small"
                  fullWidth
                  value={filters.startDate}
                  onChange={(e) =>
                    setFilters({ ...filters, startDate: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ sx: { borderRadius: 2, fontSize: "0.85rem" } }}
                />
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField
                  type="date"
                  label="Hasta"
                  size="small"
                  fullWidth
                  value={filters.endDate}
                  onChange={(e) =>
                    setFilters({ ...filters, endDate: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ sx: { borderRadius: 2, fontSize: "0.85rem" } }}
                />
              </Grid>
              <Grid
                item
                xs={12}
                md={2}
                sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}
              >
                <Tooltip title="Corregir inconsistencias: Sincroniza el estado de los alumnos con los movimientos reales de caja">
                  <Button
                    startIcon={<RefreshIcon />}
                    variant="outlined"
                    color="warning"
                    onClick={syncStudentPayments}
                    sx={{
                      borderRadius: 2,
                      fontWeight: 700,
                      textTransform: "none",
                      minWidth: 'auto',
                      px: 2
                    }}
                  >
                    Sincronizar
                  </Button>
                </Tooltip>
                <Tooltip title="Exportar a CSV / Excel">
                  <IconButton
                    onClick={(e) => setExportMenuAnchor(e.currentTarget)}
                    color="primary"
                    sx={{
                      borderRadius: 2,
                      bgcolor: "primary.main",
                      color: "white",
                      "&:hover": { bgcolor: "primary.dark" },
                      width: 40,
                      height: 40
                    }}
                  >
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={exportMenuAnchor}
                  open={Boolean(exportMenuAnchor)}
                  onClose={() => setExportMenuAnchor(null)}
                >
                  <MenuItem onClick={() => handleExportFile("csv")}>Descargar CSV</MenuItem>
                  <MenuItem onClick={() => handleExportFile("excel")}>Descargar Excel</MenuItem>
                </Menu>
              </Grid>
            </Grid>
          </Paper>

          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: alpha(theme.palette.success.main, 0.05),
                  height: "100%",
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <TrendingUpIcon color="success" />
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, color: "success.main" }}
                    >
                      INGRESOS (RANGO)
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      ${(totalIncomes || 0).toLocaleString()}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: alpha(theme.palette.error.main, 0.05),
                  height: "100%",
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <TrendingDownIcon color="error" />
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, color: "error.main" }}
                    >
                      EGRESOS (RANGO)
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      ${(totalExpenses || 0).toLocaleString()}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  height: "100%",
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <AccountBalanceWalletIcon color="primary" />
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, color: "primary.main" }}
                    >
                      BALANCE (RANGO)
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      ${(balance || 0).toLocaleString()}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4 }}>
            <MemoizedTransactionsTable
              transactions={filteredTransactions}
              onDelete={handleDeleteTransaction}
              accountsData={accountsData}
            />
          </Box>
          <Dialog
            open={open}
            onClose={handleCloseDialog}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 4 } }}
          >
            <DialogTitle sx={{ fontWeight: 800 }}>
              Nuevo Movimiento de Caja
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      select
                      label="Tipo"
                      fullWidth
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                    >
                      <MenuItem value="Ingreso">Ingreso (+)</MenuItem>
                      <MenuItem value="Egreso">Egreso (-)</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      select
                      label="Método de Pago"
                      fullWidth
                      value={formData.paymentMethod}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paymentMethod: e.target.value,
                        })
                      }
                    >
                      <MenuItem value="Efectivo">
                        Caja Azucena (Efectivo)
                      </MenuItem>
                      <MenuItem value="Transferencia">
                        Banco Ficticio (Transferencia)
                      </MenuItem>
                    </TextField>
                  </Grid>
                </Grid>

                <Box>
                  <Autocomplete
                    freeSolo
                    options={accountOptions}
                    value={formData.category}
                    onInputChange={(_, newValue) =>
                      setFormData({ ...formData, category: newValue })
                    }
                    filterOptions={(options, params) => {
                      const { inputValue } = params;
                      const cleanInput = inputValue.trim().toLowerCase();

                      const filtered = options.filter((option) =>
                        option.toLowerCase().includes(cleanInput),
                      );

                      // Suggest the creation of a new value only if it doesn't exist
                      const isExisting = options.some(
                        (option) => cleanInput === option.trim().toLowerCase(),
                      );

                      if (inputValue !== "" && !isExisting) {
                        filtered.push(`Crear nueva cuenta: "${toTitleCase(inputValue)}"`);
                      }

                      return filtered;
                    }}
                    onChange={(_, newValue) => {
                      if (newValue?.startsWith('Crear nueva cuenta: "')) {
                        const cleanValue = newValue.match(/"(.*?)"/)?.[1] || "";
                        setFormData({ ...formData, category: cleanValue });
                      } else {
                        setFormData({ ...formData, category: newValue || "" });
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Cuenta / Categoría"
                        placeholder="Ej: Cuota Pileta, Kiosco..."
                        helperText={
                          formData.category.trim() &&
                            !accountOptions.some(
                              (opt) =>
                                opt.toLowerCase() === formData.category.trim().toLowerCase(),
                            )
                            ? `Esta cuenta no existe. Se creará como: "${toTitleCase(formData.category.trim())}"`
                            : ""
                        }
                        FormHelperTextProps={{
                          sx: { color: "warning.main", fontWeight: 700 },
                        }}
                      />
                    )}
                  />
                  <Box
                    sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}
                  >
                    {["Pileta", "Snack", "Bebida"].map((cat) => {
                      const exists = accountsData.some(a => a.name.toLowerCase().trim() === cat.toLowerCase());
                      return (
                        <Chip
                          key={cat}
                          label={cat}
                          size="small"
                          onClick={() => setFormData({ ...formData, category: cat })}
                          color={
                            formData.category.trim().toLowerCase() === cat.toLowerCase()
                              ? "primary"
                              : exists ? "default" : "warning"
                          }
                          variant={
                            formData.category.trim().toLowerCase() === cat.toLowerCase()
                              ? "filled"
                              : "outlined"
                          }
                          sx={{ fontWeight: 700 }}
                        />
                      );
                    })}
                  </Box>

                  {promotions.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 800,
                          color: "success.main",
                          mb: 1,
                          display: "block",
                        }}
                      >
                        PROMOCIONES ACTIVAS
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {promotions.map((promo) => (
                          <Chip
                            key={promo.id}
                            label={`${promo.name} ($${promo.price.toLocaleString()})`}
                            size="small"
                            color="success"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                amount: promo.price.toString(),
                                description: `PROMO: ${promo.name} - ${promo.description}`,
                                category: "Promociones",
                              });
                            }}
                            variant={
                              formData.description.includes(promo.id)
                                ? "filled"
                                : "outlined"
                            }
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>

                {isPileta && (
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      bgcolor: alpha(theme.palette.info.main, 0.05),
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "info.main",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 2, color: "info.main", fontWeight: 800 }}
                    >
                      Configuración de Natación (Cálculo Automático Club)
                    </Typography>

                    <Stack spacing={2}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            select
                            label="Tipo de Plan"
                            fullWidth
                            size="small"
                            value={swimmingSelection.planType}
                            onChange={(e) =>
                              setSwimmingSelection({
                                ...swimmingSelection,
                                planType: e.target.value,
                              })
                            }
                          >
                            <MenuItem value="conProfesor">
                              Con Profesor
                            </MenuItem>
                            <MenuItem value="libre">Pileta Libre</MenuItem>
                            <MenuItem value="matronatacion">
                              Matronatación
                            </MenuItem>
                            <MenuItem value="plantel">Plantel</MenuItem>
                            <MenuItem value="porClase">Clase Suelta</MenuItem>
                            <MenuItem value="porDiaLibre">Día Libre</MenuItem>
                          </TextField>
                        </Grid>

                        {(swimmingSelection.planType === "conProfesor" ||
                          swimmingSelection.planType === "libre") && (
                            <Grid item xs={12} sm={6}>
                              <TextField
                                select
                                label="Frecuencia"
                                fullWidth
                                size="small"
                                value={swimmingSelection.frequency}
                                onChange={(e) =>
                                  setSwimmingSelection({
                                    ...swimmingSelection,
                                    frequency: e.target.value,
                                  })
                                }
                              >
                                <MenuItem value="v2">2 veces p/semana</MenuItem>
                                <MenuItem value="v3">3 veces p/semana</MenuItem>
                                <MenuItem value="v5">5 veces p/semana</MenuItem>
                              </TextField>
                            </Grid>
                          )}

                        <Grid item xs={12}>
                          <TextField
                            select
                            fullWidth
                            size="small"
                            label="Duración / Periodo de Pago"
                            value={renewalDays}
                            onChange={(e) =>
                              setRenewalDays(Number(e.target.value))
                            }
                          >
                            <MenuItem value={30}>
                              Mes Completo (30 días)
                            </MenuItem>
                            <MenuItem value={15}>Quincena (15 días)</MenuItem>
                            <MenuItem value={7}>Semana (7 días)</MenuItem>
                          </TextField>
                        </Grid>
                      </Grid>

                      <Autocomplete
                        options={students}
                        getOptionLabel={(option) =>
                          `${option.fullName} (DNI: ${option.dni})`
                        }
                        noOptionsText={
                          <Button
                            fullWidth
                            color="primary"
                            variant="contained"
                            size="small"
                            onMouseDown={(e) => {
                              // Prevent losing focus and closing dialog before click
                              e.preventDefault();
                              setIsCreatingStudent(true);
                            }}
                            startIcon={<AddIcon />}
                            sx={{ fontWeight: 800 }}
                          >
                            No encontrado. Crear "{studentSearchInput}"
                          </Button>
                        }
                        inputValue={studentSearchInput}
                        onInputChange={(_, newValue) =>
                          setStudentSearchInput(newValue)
                        }
                        value={selectedStudent}
                        onChange={(_, newValue) => {
                          setSelectedStudent(newValue);
                          if (newValue && newValue.planType) {
                            setSwimmingSelection((prev) => ({
                              ...prev,
                              planType: newValue.planType,
                            }));
                          }
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Asignar Alumno"
                            size="small"
                          />
                        )}
                      />

                      <Button
                        size="small"
                        sx={{ fontWeight: 700, alignSelf: "flex-start" }}
                        onClick={() => setIsCreatingStudent(true)}
                        startIcon={<AddIcon />}
                      >
                        Crear nuevo alumno
                      </Button>
                    </Stack>

                    <StudentRegistrationDialog
                      open={isCreatingStudent}
                      onClose={() => setIsCreatingStudent(false)}
                      initialData={
                        studentSearchInput
                          ? ({
                            fullName: studentSearchInput,
                            dni: "",
                            phone: "",
                            schedule: {},
                          } as any)
                          : null
                      }
                      onSave={(student) => {
                        setSelectedStudent(student);
                        setIsCreatingStudent(false);
                      }}
                      professors={professors}
                    />
                  </Paper>
                )}

                {isCourtCategory && (
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      bgcolor: alpha(theme.palette.warning.main, 0.05),
                      borderRadius: 2,
                      border: "1px dashed",
                      borderColor: "warning.main",
                    }}
                  >
                    <Stack spacing={2}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 800, color: "warning.dark" }}
                      >
                        Vincular Reserva de Cancha (Pendientes)
                      </Typography>

                      <Autocomplete
                        options={courtBookings.filter((b) => {
                          if (b.status === "Pagado") return false;

                          // Categoría de cancha
                          const cat = formData.category.toLowerCase();
                          if (
                            (cat.includes("paddle") || cat.includes("padel")) &&
                            b.courtType !== 0
                          )
                            return false;
                          if (cat.includes("squash") && b.courtType !== 1)
                            return false;
                          if (
                            (cat.includes("fútbol") ||
                              cat.includes("futbol")) &&
                            b.courtType !== 2
                          ) {
                            return false;
                          }
                          if (cat.includes("quincho") && b.courtType !== 3)
                            return false;

                          // Filtro de proximidad (Hoy +/- 2 días)
                          if (!b.isWeekly && b.date) {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const bDate = new Date(b.date);
                            bDate.setHours(0, 0, 0, 0);
                            const diffDays =
                              Math.abs(bDate.getTime() - today.getTime()) /
                              (1000 * 60 * 60 * 24);
                            if (diffDays > 2) return false;
                          }

                          return true;
                        })}
                        getOptionLabel={(option) =>
                          `${option.user} - ${option.dayName} (${option.startTime} hs) - ${option.duration}m`
                        }
                        onChange={(_, newValue) => {
                          setSelectedBookingId(newValue ? newValue.id : null);
                          if (newValue) {
                            // Calculate price based on courtPrices and duration
                            // Note: We use Math.ceil to allow for increments or fractional hour pricing if needed, usually duration is in minutes. 1 hour = 60 mins.
                            const durationInHours = newValue.duration / 60;
                            const courtPricePerHour =
                              courtPrices[newValue.courtType] || 0;
                            const totalToPay =
                              courtPricePerHour > 0
                                ? courtPricePerHour * Math.ceil(durationInHours)
                                : 0;

                            setFormData((prev) => ({
                              ...prev,
                              description: `Pago Cancha: ${newValue.user} (${newValue.dayName} ${newValue.startTime}hs)`,
                              amount:
                                totalToPay > 0 ? totalToPay.toString() : "",
                            }));
                          }
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Seleccionar Reserva Pendiente"
                            size="small"
                          />
                        )}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Al registrar el ingreso, la reserva se marcará
                        automáticamente como <b>Pagada</b> en el calendario.
                      </Typography>
                    </Stack>
                  </Paper>
                )}

                {isInventoryCategory && (
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      bgcolor: alpha(theme.palette.success.main, 0.05),
                      borderRadius: 2,
                      border: "1px dashed",
                      borderColor: "success.main",
                    }}
                  >
                    <Stack spacing={2}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 800, color: "success.main" }}
                      >
                        Venta de Productos (Precio e Inventario Automático)
                      </Typography>

                      <Autocomplete
                        options={inventoryItems.filter((item: any) => {
                          const cat = formData.category.toLowerCase();
                          // Match category: Bebidas or Snacks (Kiosco usually implies one of these)
                          if (cat.includes("bebida"))
                            return item.category === "Bebidas";
                          if (cat.includes("snack") || cat.includes("kiosco"))
                            return item.category === "Snacks";
                          return true;
                        })}
                        getOptionLabel={(option) =>
                          `${option.name} ($${option.price?.toLocaleString() || 0}) - Stock: ${option.initialStock + option.entries - option.exits}`
                        }
                        value={selectedStockProduct}
                        onChange={(_, newValue) => {
                          setSelectedStockProduct(newValue);
                          if (newValue) {
                            setShouldDiscountStock(true);
                            setFormData((prev) => ({
                              ...prev,
                              amount: (
                                newValue.price * discountQuantity
                              ).toString(),
                            }));
                          }
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Seleccionar Producto"
                            size="small"
                          />
                        )}
                      />

                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={shouldDiscountStock}
                            onChange={(e) =>
                              setShouldDiscountStock(e.target.checked)
                            }
                            color="success"
                          />
                        }
                        label={
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 800 }}
                          >
                            Descontar del Inventario al registrar
                          </Typography>
                        }
                      />

                      {shouldDiscountStock && (
                        <TextField
                          label="Cantidad a vender"
                          size="small"
                          type="number"
                          value={discountQuantity}
                          onChange={(e) =>
                            setDiscountQuantity(parseInt(e.target.value) || 1)
                          }
                          InputProps={{ inputProps: { min: 1 } }}
                          sx={{ maxWidth: 150 }}
                        />
                      )}
                    </Stack>
                  </Paper>
                )}

                <OptimizedTextField
                  label="Importe"
                  fullWidth
                  type="number"
                  value={formData.amount}
                  onChange={(val) => setFormData({ ...formData, amount: val })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                    sx: { fontSize: "1.2rem", fontWeight: 700 },
                  }}
                />

                <Box>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, mb: 0.5, display: "block" }}
                  >
                    Nro de Factura / Ticket
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={3}>
                      <OptimizedTextField
                        placeholder="A"
                        disabled={isAutoInvoice}
                        inputProps={{
                          maxLength: 1,
                          style: {
                            textAlign: "center",
                            textTransform: "uppercase",
                          },
                        }}
                        value={isAutoInvoice ? "C" : invoiceData.letter}
                        onChange={(val) => handleInvoiceChange("letter", val)}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <OptimizedTextField
                        id="invoice-num1"
                        placeholder="0001"
                        disabled={isAutoInvoice}
                        inputProps={{
                          maxLength: 4,
                          style: { textAlign: "center" },
                        }}
                        value={isAutoInvoice ? "0100" : invoiceData.num1}
                        onChange={(val) => handleInvoiceChange("num1", val)}
                      />
                    </Grid>
                    <Grid item xs={5}>
                      <OptimizedTextField
                        id="invoice-num2"
                        placeholder={isAutoInvoice ? "AUTO" : "00000000"}
                        disabled={isAutoInvoice}
                        inputProps={{
                          maxLength: 8,
                          style: { textAlign: "center" },
                        }}
                        value={isAutoInvoice ? "" : invoiceData.num2}
                        onChange={(val) => handleInvoiceChange("num2", val)}
                        helperText={isAutoInvoice ? "Asignado por sistema" : ""}
                        FormHelperTextProps={{
                          sx: { fontWeight: 700, color: "primary.main" },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <OptimizedTextField
                  label="Descripción"
                  fullWidth
                  multiline
                  rows={2}
                  value={formData.description}
                  onChange={(val) =>
                    setFormData({ ...formData, description: val })
                  }
                />
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button onClick={handleCloseDialog} sx={{ fontWeight: 700 }}>
                Cancelar
              </Button>
              <Button
                variant="contained"
                sx={{ px: 4, fontWeight: 700 }}
                onClick={handleRegister}
              >
                Registrar
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
      {view === 1 && (
        <MemoizedCashRegistry
          transactions={transactions}
          inventoryItems={inventoryItems}
          onUpdateInventory={handleUpdateInventory}
          archivedDays={archivedDays}
          onArchiveDay={handleArchiveDay}
          staffRoster={staffRoster}
          onOpenRoster={() => setOpenRosterDialog(true)}
        />
      )}
      {view === 2 && (
        <Box sx={{ mt: 4 }}>
          <MemoizedInventoryManager
            items={inventoryItems}
            onUpdateItems={handleUpdateInventory}
          />
        </Box>
      )}
      {view === 3 && (
        <Box>
          <Box
            sx={{ mb: 4, display: "flex", justifyContent: "flex-end", gap: 2 }}
          >
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenAccountDialog(true)}
              sx={{ fontWeight: 800, borderRadius: 2 }}
            >
              Nueva Cuenta
            </Button>
          </Box>
          <GeneralLedger
            transactions={filteredTransactions}
            accountsData={accountsData}
            onAutoCreateAccount={async (catName: string) => {
              const formatted = toTitleCase(catName.trim());
              const { error } = await supabase.from("accounts").insert({
                name: formatted,
                type: "Mixto",
                balance: 0,
                color: theme.palette.primary.main,
              });
              if (!error) fetchEverything();
            }}
          />
        </Box>
      )}

      {/* Sections for Registry, Inventory, and Ledger remain here */}

      {/* Account Dialog */}
      <Dialog
        open={openAccountDialog}
        onClose={() => setOpenAccountDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Nueva Cuenta</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Nombre de la Cuenta"
              fullWidth
              value={accountFormData.name}
              onChange={(e) =>
                setAccountFormData({
                  ...accountFormData,
                  name: e.target.value,
                })
              }
              placeholder="Ej: Cuota Pileta, Kiosco, Cantina..."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setOpenAccountDialog(false)}
            sx={{ fontWeight: 700 }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateAccount}
            sx={{ fontWeight: 700, px: 4 }}
          >
            Crear Cuenta
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          sx={{ width: "100%", borderRadius: 3, fontWeight: 700 }}
        >
          Movimiento registrado exitosamente
        </Alert>
      </Snackbar>

      <Snackbar
        open={showError}
        autoHideDuration={4000}
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="error"
          sx={{ width: "100%", borderRadius: 3, fontWeight: 700 }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>

      <Dialog
        open={openRosterDialog}
        onClose={() => setOpenRosterDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Personal Responsable por Día
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Define quiénes estarán a cargo de cada turno. Estos nombres se
            asignarán automáticamente al abrir la caja cada día (Lunes a
            Sábado).
          </Typography>
          <Stack spacing={3}>
            {Object.entries(staffRoster).map(([day, staff]) => (
              <Box
                key={day}
                sx={{
                  p: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 800, mb: 1, color: "primary.main" }}
                >
                  {day}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Turno Mañana"
                      fullWidth
                      size="small"
                      value={staff.morning}
                      onChange={(e) =>
                        setStaffRoster({
                          ...staffRoster,
                          [day]: { ...staff, morning: e.target.value },
                        })
                      }
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Turno Tarde"
                      fullWidth
                      size="small"
                      value={staff.afternoon}
                      onChange={(e) =>
                        setStaffRoster({
                          ...staffRoster,
                          [day]: { ...staff, afternoon: e.target.value },
                        })
                      }
                    />
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setOpenRosterDialog(false)}
            variant="outlined"
            sx={{ fontWeight: 800 }}
          >
            CANCELAR
          </Button>
          <Button
            onClick={handleSaveRoster}
            variant="contained"
            sx={{ fontWeight: 800 }}
          >
            GUARDAR CONFIGURACIÓN
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openSummaryExport}
        onClose={() => setOpenSummaryExport(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Presentación de Resumen
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Seleccione el periodo para generar el reporte de presentación en
            PDF.
          </Typography>
          <Stack spacing={2}>
            <TextField
              select
              label="Mes"
              fullWidth
              value={summaryMonth}
              onChange={(e) => setSummaryMonth(parseInt(e.target.value))}
            >
              {[
                "Enero",
                "Febrero",
                "Marzo",
                "Abril",
                "Mayo",
                "Junio",
                "Julio",
                "Agosto",
                "Septiembre",
                "Octubre",
                "Noviembre",
                "Diciembre",
              ].map((m, i) => (
                <MenuItem key={m} value={i + 1}>
                  {m}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="number"
              label="Año"
              fullWidth
              value={summaryYear}
              onChange={(e) => setSummaryYear(parseInt(e.target.value))}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenSummaryExport(false)} color="inherit">
            Cancelar
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExportSummaryPDF}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            Exportar Presentación
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
