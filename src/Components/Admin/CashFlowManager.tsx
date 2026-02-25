import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

import FilterListIcon from "@mui/icons-material/FilterList";
import DownloadIcon from "@mui/icons-material/Download";
import SearchIcon from "@mui/icons-material/Search";

interface Transaction {
  id: number;
  date: string;
  type: "Ingreso" | "Egreso";
  category: string;
  amount: number;
  paymentMethod: string; // Updated to be dynamic
  invoice?: string;
  description: string;
}

interface Shift {
  id: number;
  name: string;
  timeLabel: string;
  responsible: string;
  openingCash: number;
  systemIncome: number;
  systemExpense: number;
  realCash: number | null;
  difference: number | null;
  status: "No Iniciado" | "Abierta" | "Cerrada";
  notes?: string;
  openedAt?: number;
  closedAt?: number;
  startingStock?: { name: string; quantity: number }[];
  stockSnapshot?: { name: string; quantity: number }[];
}

interface ArchivedDay {
  date: string;
  shifts: Shift[];
  totalBalance: number;
  movements?: { [key: string]: { income: number; expense: number } };
}

interface StaffRoster {
  [key: string]: {
    morning: string;
    afternoon: string;
  };
}

const defaultRoster: StaffRoster = {
  Lunes: { morning: "Juan (Admin)", afternoon: "María (Admin)" },
  Martes: { morning: "Juan (Admin)", afternoon: "María (Admin)" },
  Miércoles: { morning: "Juan (Admin)", afternoon: "María (Admin)" },
  Jueves: { morning: "Juan (Admin)", afternoon: "María (Admin)" },
  Viernes: { morning: "Juan (Admin)", afternoon: "María (Admin)" },
  Sábado: { morning: "Juan (Admin)", afternoon: "María (Admin)" },
};

interface Account {
  id: number;
  name: string;
  type: "Ingreso" | "Egreso" | "Mixto";
  balance: number;
  color: string;
}

const initialAccountsData: Account[] = [
  {
    id: 1,
    name: "Cuota Pileta",
    type: "Ingreso",
    balance: 0,
    color: "#4caf50",
  },
  { id: 2, name: "Kiosco", type: "Ingreso", balance: 0, color: "#2196f3" },
  {
    id: 3,
    name: "Venta Bebidas",
    type: "Ingreso",
    balance: 0,
    color: "#ff9800",
  },
  { id: 4, name: "Limpieza", type: "Egreso", balance: 0, color: "#f44336" },
];

const initialTransactions: Transaction[] = [
  {
    id: 1,
    date: new Date().toISOString().split("T")[0],
    type: "Ingreso",
    category: "Venta Bebidas",
    amount: 4500,
    paymentMethod: "Efectivo",
    description: "Coca-cola y Aguas",
  },
  {
    id: 2,
    date: new Date().toISOString().split("T")[0],
    type: "Ingreso",
    category: "Canchas",
    amount: 12000,
    paymentMethod: "Transferencia",
    description: "Turnos Paddle 18hs/19hs",
  },
  {
    id: 3,
    date: new Date().toISOString().split("T")[0],
    type: "Egreso",
    category: "Limpieza",
    amount: 3500,
    paymentMethod: "Efectivo",
    invoice: "A001-00045",
    description: "Compra de artículos de limpieza",
  },
  {
    id: 4,
    date: "2026-02-20",
    type: "Ingreso",
    category: "Natación",
    amount: 8500,
    paymentMethod: "Tarjeta",
    description: "Inscripción - Juan Pérez",
  },
];

import CashRegistry from "./CashRegistry";
import InventoryManager from "./InventoryManager";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import InventoryIcon from "@mui/icons-material/Inventory";
import { Tabs, Tab, InputBase, Tooltip } from "@mui/material";
import StudentRegistrationDialog, {
  StudentData,
} from "./StudentRegistrationDialog";

export default function CashFlowManager() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("seccional_transactions");
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [accountsData, setAccountsData] = useState<Account[]>(() => {
    const saved = localStorage.getItem("seccional_accounts");
    return saved ? JSON.parse(saved) : initialAccountsData;
  });

  const [open, setOpen] = useState(false);
  const [openAccountDialog, setOpenAccountDialog] = useState(false);
  const [openRosterDialog, setOpenRosterDialog] = useState(false);
  const [view, setView] = useState(0); // 0: Flow, 1: Registry, 2: Inventory, 3: Accounts
  const [showSuccess, setShowSuccess] = useState(false);

  const [students, setStudents] = useState<StudentData[]>(() => {
    const saved = localStorage.getItem("seccional_students");
    return saved ? JSON.parse(saved) : [];
  });

  const [staffRoster, setStaffRoster] = useState<StaffRoster>(() => {
    const saved = localStorage.getItem("seccional_staff_roster");
    return saved ? JSON.parse(saved) : defaultRoster;
  });

  const [inventoryItems, setInventoryItems] = useState(() => {
    const saved = localStorage.getItem("seccional_inventory");
    if (saved) return JSON.parse(saved);

    // Default items based on the user's price list and categorization rules
    return [
      { id: 1, name: 'Agua chica', category: 'Bebidas', initialStock: 10, entries: 0, exits: 0, price: 1000 },
      { id: 2, name: 'Agua grande', category: 'Bebidas', initialStock: 10, entries: 0, exits: 0, price: 2000 },
      { id: 3, name: 'Aquarius 1500cc', category: 'Bebidas', initialStock: 10, entries: 0, exits: 0, price: 3000 },
      { id: 4, name: 'Aquarius 500cc', category: 'Bebidas', initialStock: 10, entries: 0, exits: 0, price: 2000 },
      { id: 5, name: 'Coca Cola 1500cc', category: 'Bebidas', initialStock: 10, entries: 0, exits: 0, price: 3000 },
      { id: 6, name: 'Coca Coca 500cc', category: 'Bebidas', initialStock: 10, entries: 0, exits: 0, price: 2000 },
      { id: 7, name: 'Powerade 500cc', category: 'Bebidas', initialStock: 10, entries: 0, exits: 0, price: 3000 },
      { id: 8, name: 'Monster', category: 'Bebidas', initialStock: 10, entries: 0, exits: 0, price: 4000 },
      { id: 9, name: 'Heineken', category: 'Bebidas', initialStock: 10, entries: 0, exits: 0, price: 8000 },
      { id: 10, name: 'Cereales', category: 'Snacks', initialStock: 10, entries: 0, exits: 0, price: 3000 },
      { id: 11, name: 'Papas fritas 20grs', category: 'Snacks', initialStock: 10, entries: 0, exits: 0, price: 2000 },
      { id: 12, name: 'Papas fritas 40grs', category: 'Snacks', initialStock: 10, entries: 0, exits: 0, price: 3000 },
      { id: 13, name: 'Manies-Palitos-Chizitos', category: 'Snacks', initialStock: 10, entries: 0, exits: 0, price: 3000 },
      { id: 14, name: 'Barra cereal', category: 'Snacks', initialStock: 10, entries: 0, exits: 0, price: 2000 },
    ];
  });

  const [archivedDays, setArchivedDays] = useState<ArchivedDay[]>(() => {
    const saved = localStorage.getItem("seccional_archived_days");
    return saved ? JSON.parse(saved) : [];
  });

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem(
      "seccional_transactions",
      JSON.stringify(transactions),
    );
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("seccional_accounts", JSON.stringify(accountsData));
  }, [accountsData]);

  useEffect(() => {
    localStorage.setItem("seccional_inventory", JSON.stringify(inventoryItems));
  }, [inventoryItems]);

  useEffect(() => {
    localStorage.setItem(
      "seccional_archived_days",
      JSON.stringify(archivedDays),
    );
  }, [archivedDays]);

  useEffect(() => {
    localStorage.setItem("seccional_staff_roster", JSON.stringify(staffRoster));
  }, [staffRoster]);

  useEffect(() => {
    localStorage.setItem("seccional_students", JSON.stringify(students));
  }, [students]);

  // Precios globales de productos para sincronizar con Inventario
  const [productsPrices, setProductsPrices] = useState(() => {
    const saved = localStorage.getItem("seccional_products_prices");
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Agua chica', price: 1000 },
      { id: 2, name: 'Agua grande', price: 2000 },
      { id: 3, name: 'Aquarius 1500cc', price: 3000 },
      { id: 4, name: 'Aquarius 500cc', price: 2000 },
      { id: 5, name: 'Coca Cola 1500cc', price: 3000 },
      { id: 6, name: 'Coca Coca 500cc', price: 2000 },
      { id: 7, name: 'Powerade 500cc', price: 3000 },
      { id: 8, name: 'Monster', price: 4000 },
      { id: 9, name: 'Heineken', price: 8000 },
      { id: 10, name: 'Cereales', price: 3000 },
      { id: 11, name: 'Papas fritas 20grs', price: 2000 },
      { id: 12, name: 'Papas fritas 40grs', price: 3000 },
      { id: 13, name: 'Manies-Palitos-Chizitos', price: 3000 },
      { id: 14, name: 'Barra cereal', price: 2000 },
    ];
  });

  // --- NUEVOS ESTADOS COMPARTIDOS PARA INTEGRACIÓN NATACIÓN/FINANZAS ---

  // Precios de Natación (Extraídos de PriceManager e inicializados aquí)
  const [swimmingPrices, setSwimmingPrices] = useState(() => {
    const saved = localStorage.getItem("seccional_swimming_prices");
    return saved ? JSON.parse(saved) : {
      conProfesor: {
        v2: { total: 70000, club: 50000, prof: 20000 },
        v3: { total: 80000, club: 53000, prof: 27000 },
        v5: { total: 94000, club: 60000, prof: 34000 }
      },
      libre: {
        v2: 63000,
        v3: 70000,
        v5: 86000
      },
      porClase: { total: 15000, club: 10000, prof: 5000 },
      porDiaLibre: 12000,
      matronatacion: { total: 48000, club: 30000, prof: 18000 },
      plantel: { total: 63000, club: 42000, prof: 21000 }
    };
  });

  // Sync inventory items with centralized productsPrices
  useEffect(() => {
    setInventoryItems((prev: any[]) => {
      // 1. Map existing items to update prices
      const updatedExisting = prev.map(item => {
        const globalInfo = productsPrices.find((p: any) => p.name === item.name);
        return globalInfo ? { ...item, price: globalInfo.price } : item;
      });

      // 2. Identify and add missing products from global list
      const missingProducts = productsPrices.filter(
        (gp: any) => !prev.some(item => item.name === gp.name)
      ).map((gp: any) => ({
        id: gp.id,
        name: gp.name,
        category: gp.name.toLowerCase().includes('agua') || gp.name.toLowerCase().includes('coca') || gp.name.toLowerCase().includes('aquarius') || gp.name.toLowerCase().includes('powerade') || gp.name.toLowerCase().includes('monster') || gp.name.toLowerCase().includes('heineken') ? 'Bebidas' : 'Snacks',
        initialStock: 0,
        entries: 0,
        exits: 0,
        price: gp.price
      }));

      // Only updating if there are missing products or price changes to avoid infinite loop
      // (React's setState with function handles this mostly, but we are returning a new array)
      if (missingProducts.length === 0) {
        // Check if prices actually changed to decide if we return new array
        const pricesChanged = updatedExisting.some((item, idx) => item.price !== prev[idx]?.price);
        if (!pricesChanged) return prev;
      }

      return [...updatedExisting, ...missingProducts];
    });
  }, [productsPrices]);

  const [formData, setFormData] = useState({
    type: "Ingreso",
    category: "",
    amount: "",
    paymentMethod: "Efectivo",
    description: "",
  });
  const [accountFormData, setAccountFormData] = useState({
    name: "",
    type: "Ingreso",
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
  });

  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isCreatingStudent, setIsCreatingStudent] = useState(false);
  const [newStudentData, setNewStudentData] = useState({
    fullName: "",
    dni: "",
    phone: "",
  });

  const [renewalDays, setRenewalDays] = useState(30);
  const [swimmingSelection, setSwimmingSelection] = useState({
    planType: 'conProfesor', // conProfesor, libre, matronatacion, plantel, porClase, porDiaLibre
    frequency: 'v2', // v2, v3, v5
  });

  const [shouldDiscountStock, setShouldDiscountStock] = useState(false);
  const [selectedStockProduct, setSelectedStockProduct] = useState<any>(null);
  const [discountQuantity, setDiscountQuantity] = useState(1);

  const frequentCategories = ["Pileta", "Bebida", "Snack"];

  const isPileta =
    formData.type === "Ingreso" &&
    (formData.category.toLowerCase().includes("pileta") ||
      formData.category.toLowerCase().includes("natación") ||
      formData.category.toLowerCase().includes("natacion"));

  const isCourtCategory =
    formData.type === "Ingreso" &&
    formData.category.toLowerCase().includes("cancha");

  const [courtBookings, setCourtBookings] = useState<any[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);

  useEffect(() => {
    const loadBookings = () => {
      const saved = localStorage.getItem('seccional_court_bookings');
      if (saved) setCourtBookings(JSON.parse(saved));
    };
    const loadPrices = () => {
      const savedProducts = localStorage.getItem("seccional_products_prices");
      if (savedProducts) setProductsPrices(JSON.parse(savedProducts));
      const savedSwimming = localStorage.getItem("seccional_swimming_prices");
      if (savedSwimming) setSwimmingPrices(JSON.parse(savedSwimming));
    };

    loadBookings();
    loadPrices();

    window.addEventListener('court_bookings_updated', loadBookings);
    window.addEventListener('prices_updated', loadPrices);

    return () => {
      window.removeEventListener('court_bookings_updated', loadBookings);
      window.removeEventListener('prices_updated', loadPrices);
    };
  }, []);

  const isAutoInvoice =
    formData.type === "Ingreso" &&
    (isPileta ||
      formData.category.toLowerCase().includes("bebida") ||
      formData.category.toLowerCase().includes("snack"));

  const isInventoryCategory =
    formData.type === "Ingreso" &&
    (formData.category.toLowerCase().includes("bebida") ||
      formData.category.toLowerCase().includes("snack"));

  // Efecto para calcular el precio de Club automáticamente para Natación
  useEffect(() => {
    if (isPileta) {
      let baseClubPrice = 0;
      const { planType, frequency } = swimmingSelection;

      if (planType === 'conProfesor') {
        baseClubPrice = (swimmingPrices.conProfesor as any)[frequency]?.club || 0;
      } else if (planType === 'libre') {
        baseClubPrice = (swimmingPrices.libre as any)[frequency] || 0;
      } else if (planType === 'porDiaLibre') {
        baseClubPrice = swimmingPrices.porDiaLibre;
      } else {
        baseClubPrice = (swimmingPrices as any)[planType]?.club || (swimmingPrices as any)[planType] || 0;
      }

      // Ajustar por periodo (30 días es el base)
      const calculatedAmount = (baseClubPrice * renewalDays) / 30;
      setFormData(prev => ({ ...prev, amount: Math.round(calculatedAmount).toString() }));
    }
  }, [swimmingSelection, renewalDays, isPileta, swimmingPrices]);

  // Efecto para calcular el precio de Inventario automáticamente (Precio * Cantidad)
  useEffect(() => {
    if (isInventoryCategory && selectedStockProduct) {
      const total = selectedStockProduct.price * discountQuantity;
      setFormData(prev => ({ ...prev, amount: total.toString() }));
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

  const handleRegister = () => {
    if (!formData.category || !formData.amount) return;

    let finalInvoice = undefined;
    if (isAutoInvoice) {
      finalInvoice = generateAutoInvoice();
    } else if (invoiceData.letter || invoiceData.num1 || invoiceData.num2) {
      finalInvoice = `${invoiceData.letter || "X"}-${invoiceData.num1 || "0000"}-${invoiceData.num2 || "00000000"}`;
    }

    let finalDesc = formData.description;
    if (isPileta) {
      if (isCreatingStudent && newStudentData.fullName)
        finalDesc += ` (Nuevo Alumno: ${newStudentData.fullName} - ${newStudentData.dni})`;
      else if (selectedStudent)
        finalDesc += ` (Alumno: ${selectedStudent.fullName})`;
    }

    const newTransaction: Transaction = {
      id: Date.now(),
      date: new Date().toISOString().split("T")[0],
      type: formData.type as "Ingreso" | "Egreso",
      category: formData.category,
      amount: parseFloat(formData.amount),
      paymentMethod: formData.paymentMethod as any,
      invoice: finalInvoice,
      description: finalDesc,
    };

    setTransactions([newTransaction, ...transactions]);

    // Update account balance or create if missing
    setAccountsData((prev) => {
      const exists = prev.find((a) => a.name === formData.category);
      if (exists) {
        return prev.map((acc) => {
          if (acc.name === formData.category) {
            return {
              ...acc,
              balance:
                acc.balance +
                (formData.type === "Ingreso"
                  ? parseFloat(formData.amount)
                  : -parseFloat(formData.amount)),
            };
          }
          return acc;
        });
      } else {
        // Create new account automatically
        const newAcc: Account = {
          id: Date.now(),
          name: formData.category,
          type: "Mixto",
          balance:
            formData.type === "Ingreso"
              ? parseFloat(formData.amount)
              : -parseFloat(formData.amount),
          color: theme.palette.primary.main,
        };
        return [...prev, newAcc];
      }
    });

    // Handle Inventory Discount
    if (shouldDiscountStock && selectedStockProduct) {
      setInventoryItems((prev: any[]) =>
        prev.map((item: any) =>
          item.id === selectedStockProduct.id
            ? { ...item, exits: item.exits + discountQuantity }
            : item,
        ),
      );
    }

    // Handle Student Enrollment/Renewal
    if (isPileta && selectedStudent) {
      setStudents((prev) => {
        const student = prev.find((s) => s.dni === selectedStudent.dni);
        const today = new Date();
        const baseDate =
          student && student.expiryDate && new Date(student.expiryDate) > today
            ? new Date(student.expiryDate)
            : today;

        const newExpiry = new Date(baseDate);
        newExpiry.setDate(newExpiry.getDate() + renewalDays);

        const updatedData = {
          ...selectedStudent,
          lastPayment: {
            date: today.toISOString().split("T")[0],
            amount: parseFloat(formData.amount),
          },
          expiryDate: newExpiry.toISOString().split("T")[0],
        };

        if (student) {
          return prev.map((s) => (s.dni === student.dni ? updatedData : s));
        } else {
          return [...prev, { ...updatedData, id: Date.now() }];
        }
      });
    }

    // Handle Court Booking Payment
    if (selectedBookingId) {
      const savedBookings = JSON.parse(localStorage.getItem('seccional_court_bookings') || '[]');
      const updatedBookings = savedBookings.map((b: any) =>
        b.id === selectedBookingId ? { ...b, status: 'Pagado' } : b
      );
      localStorage.setItem('seccional_court_bookings', JSON.stringify(updatedBookings));
      window.dispatchEvent(new Event('court_bookings_updated'));
      setSelectedBookingId(null);
    }

    setShowSuccess(true);
    setFormData({
      ...formData,
      amount: "",
      description: "",
    });
    setInvoiceData({ letter: "", num1: "", num2: "" });
    setSelectedStudent(null);
    setIsCreatingStudent(false);
    setNewStudentData({ fullName: "", dni: "", phone: "" });

    // Reset stock discount states
    setShouldDiscountStock(false);
    setSelectedStockProduct(null);
    setDiscountQuantity(1);
  };

  const handleCreateAccount = () => {
    if (!accountFormData.name) return;
    const newAcc: Account = {
      id: Date.now(),
      name: accountFormData.name,
      type: accountFormData.type as any,
      balance: parseFloat(accountFormData.balance) || 0,
      color: theme.palette.primary.main,
    };
    setAccountsData([...accountsData, newAcc]);
    setOpenAccountDialog(false);
    setAccountFormData({ name: "", type: "Ingreso", balance: "0" });
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

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.category.toLowerCase().includes(filters.search.toLowerCase()) ||
      t.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchesType = filters.type === "Todos" || t.type === filters.type;
    const matchesCategory =
      filters.category === "Todas" || t.category === filters.category;
    return matchesSearch && matchesType && matchesCategory;
  });

  const categories = ["Todas", ...new Set(transactions.map((t) => t.category))];

  const totalIncomes = filteredTransactions
    .filter((t) => t.type === "Ingreso")
    .reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = filteredTransactions
    .filter((t) => t.type === "Egreso")
    .reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncomes - totalExpenses;
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
      )}

      <Box sx={{ mb: 4, display: "flex", justifyContent: "flex-end", gap: 2 }}>
        {view === 3 && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenAccountDialog(true)}
          >
            Nueva Cuenta
          </Button>
        )}
      </Box>

      {view === 0 && (
        <>
          {/* Filters Row */}
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
              <Grid item xs={12} md={4}>
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
                  <InputBase
                    placeholder="Buscar descripción o categoría..."
                    sx={{ ml: 1, flex: 1, fontSize: "0.9rem", py: 0.5 }}
                    value={filters.search}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                  />
                </Box>
              </Grid>
              <Grid item xs={6} md={2}>
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
                  <MenuItem value="Todos">Todos los tipos</MenuItem>
                  <MenuItem value="Ingreso">Ingresos</MenuItem>
                  <MenuItem value="Egreso">Egresos</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6} md={2}>
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
              <Grid
                item
                xs={12}
                md={4}
                sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}
              >
                <Button
                  startIcon={<DownloadIcon />}
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    fontWeight: 700,
                    textTransform: "none",
                  }}
                >
                  Exportar
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Summary Grid */}
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
                      INGRESOS (ESTE DÍA)
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
                      EGRESOS (ESTE DÍA)
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
                      BALANCE (ESTE DÍA)
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      ${(balance || 0).toLocaleString()}
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
                  height: "100%",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 800,
                    color: "text.secondary",
                    display: "block",
                    mb: 1.5,
                  }}
                >
                  INGRESOS POR MÉTODO (HOY)
                </Typography>
                <Stack spacing={1}>
                  {["Efectivo", "Transferencia"].map((method) => {
                    const mappedName =
                      method === "Efectivo"
                        ? "Caja Azucena (Efvo)"
                        : "Banco Ficticio (Transf)";
                    const amount = filteredTransactions
                      .filter(
                        (t) =>
                          t.type === "Ingreso" && t.paymentMethod === method,
                      )
                      .reduce((acc, t) => acc + t.amount, 0);
                    const percentage =
                      totalIncomes > 0 ? (amount / totalIncomes) * 100 : 0;

                    return (
                      <Box key={method}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          sx={{ mb: 0.5 }}
                        >
                          <Typography
                            sx={{ fontSize: "0.75rem", fontWeight: 700 }}
                          >
                            {mappedName}
                          </Typography>
                          <Typography
                            sx={{ fontSize: "0.75rem", fontWeight: 800 }}
                          >
                            ${(amount || 0).toLocaleString()}
                          </Typography>
                        </Stack>
                        <Box
                          sx={{
                            height: 4,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            borderRadius: 1,
                            overflow: "hidden",
                          }}
                        >
                          <Box
                            sx={{
                              height: "100%",
                              width: `${percentage}%`,
                              bgcolor: "primary.main",
                              borderRadius: 1,
                            }}
                          />
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
            }}
          >
            <Table>
              <TableHead
                sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}
              >
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Categoría</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Descripción</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Método</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Comprobante</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Importe
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.map((t) => (
                  <TableRow key={t.id} hover>
                    <TableCell sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
                      {t.date}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={t.type}
                        size="small"
                        color={t.type === "Ingreso" ? "success" : "error"}
                        variant="outlined"
                        sx={{ fontWeight: 700, fontSize: "0.7rem" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.85rem",
                          color: "primary.main",
                        }}
                      >
                        {t.category}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.85rem" }}>
                      {t.description}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={t.paymentMethod}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.7rem",
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: "primary.dark",
                          border: "none",
                        }}
                      />
                    </TableCell>
                    <TableCell
                      sx={{ fontSize: "0.85rem", color: "text.secondary" }}
                    >
                      {t.invoice || "-"}
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        sx={{
                          fontWeight: 800,
                          color:
                            t.type === "Ingreso"
                              ? "success.main"
                              : "error.main",
                        }}
                      >
                        {t.type === "Ingreso" ? "+" : "-"}$
                        {(t.amount || 0).toLocaleString()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

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
                    options={accountsData.map((a) => a.name)}
                    value={formData.category}
                    onInputChange={(_, newValue) =>
                      setFormData({ ...formData, category: newValue })
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Cuenta"
                        placeholder="Ej: Cuota Pileta, Kiosco..."
                      />
                    )}
                  />
                  <Box
                    sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}
                  >
                    {frequentCategories.map((cat) => (
                      <Chip
                        key={cat}
                        label={cat}
                        size="small"
                        onClick={() =>
                          setFormData({ ...formData, category: cat })
                        }
                        color={
                          formData.category === cat ? "primary" : "default"
                        }
                        variant={
                          formData.category === cat ? "filled" : "outlined"
                        }
                      />
                    ))}
                  </Box>
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
                            onChange={(e) => setSwimmingSelection({ ...swimmingSelection, planType: e.target.value })}
                          >
                            <MenuItem value="conProfesor">Con Profesor</MenuItem>
                            <MenuItem value="libre">Pileta Libre</MenuItem>
                            <MenuItem value="matronatacion">Matronatación</MenuItem>
                            <MenuItem value="plantel">Plantel</MenuItem>
                            <MenuItem value="porClase">Clase Suelta</MenuItem>
                            <MenuItem value="porDiaLibre">Día Libre</MenuItem>
                          </TextField>
                        </Grid>

                        {(swimmingSelection.planType === 'conProfesor' || swimmingSelection.planType === 'libre') && (
                          <Grid item xs={12} sm={6}>
                            <TextField
                              select
                              label="Frecuencia"
                              fullWidth
                              size="small"
                              value={swimmingSelection.frequency}
                              onChange={(e) => setSwimmingSelection({ ...swimmingSelection, frequency: e.target.value })}
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
                            onChange={(e) => setRenewalDays(Number(e.target.value))}
                          >
                            <MenuItem value={30}>Mes Completo (30 días)</MenuItem>
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
                        value={selectedStudent}
                        onChange={(_, newValue) => setSelectedStudent(newValue)}
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
                        sx={{ fontWeight: 700, alignSelf: 'flex-start' }}
                        onClick={() => setIsCreatingStudent(true)}
                      >
                        + Crear nuevo alumno rápido
                      </Button>
                    </Stack>

                    <StudentRegistrationDialog
                      open={isCreatingStudent}
                      onClose={() => setIsCreatingStudent(false)}
                      onSave={(student) => {
                        setSelectedStudent(student);
                        setIsCreatingStudent(false);
                      }}
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
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "warning.dark" }}>
                        Vincular Reserva de Cancha (Pendientes)
                      </Typography>

                      <Autocomplete
                        options={courtBookings.filter(b => {
                          if (b.status === 'Pagado') return false;

                          // Categoría de cancha
                          const cat = formData.category.toLowerCase();
                          if (cat.includes('paddle') && b.courtType !== 0) return false;
                          if (cat.includes('squash') && b.courtType !== 1) return false;
                          if (cat.includes('fútbol') || cat.includes('futbol')) {
                            if (b.courtType !== 2) return false;
                          }

                          // Filtro de proximidad (Hoy +/- 2 días)
                          if (!b.isWeekly && b.date) {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const bDate = new Date(b.date);
                            bDate.setHours(0, 0, 0, 0);
                            const diffDays = Math.abs(bDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
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
                            // Si se selecciona una reserva, se podría sugerir el precio, por ahora permitimos que sigan usando el default o lo ingresen
                            setFormData(prev => ({ ...prev, description: `Pago Cancha: ${newValue.user} (${newValue.dayName} ${newValue.startTime}hs)` }));
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
                        Al registrar el ingreso, la reserva se marcará automáticamente como <b>Pagada</b> en el calendario.
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
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "success.main" }}>
                        Venta de Productos (Precio e Inventario Automático)
                      </Typography>

                      <Autocomplete
                        options={inventoryItems.filter(item => {
                          const cat = formData.category.toLowerCase();
                          // Match category: Bebidas or Snacks (Kiosco usually implies one of these)
                          if (cat.includes('bebida')) return item.category === 'Bebidas';
                          if (cat.includes('snack') || cat.includes('kiosco')) return item.category === 'Snacks';
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
                            setFormData(prev => ({ ...prev, amount: (newValue.price * discountQuantity).toString() }));
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
                          <Typography variant="caption" sx={{ fontWeight: 800 }}>
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

                <TextField
                  label="Importe"
                  fullWidth
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
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
                      <TextField
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
                        onChange={(e) =>
                          handleInvoiceChange("letter", e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        id="invoice-num1"
                        placeholder="0001"
                        disabled={isAutoInvoice}
                        inputProps={{
                          maxLength: 4,
                          style: { textAlign: "center" },
                        }}
                        value={isAutoInvoice ? "0100" : invoiceData.num1}
                        onChange={(e) =>
                          handleInvoiceChange("num1", e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={5}>
                      <TextField
                        id="invoice-num2"
                        placeholder={isAutoInvoice ? "AUTO" : "00000000"}
                        disabled={isAutoInvoice}
                        inputProps={{
                          maxLength: 8,
                          style: { textAlign: "center" },
                        }}
                        value={isAutoInvoice ? "" : invoiceData.num2}
                        onChange={(e) =>
                          handleInvoiceChange("num2", e.target.value)
                        }
                        helperText={isAutoInvoice ? "Asignado por sistema" : ""}
                        FormHelperTextProps={{
                          sx: { fontWeight: 700, color: "primary.main" },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <TextField
                  label="Descripción"
                  fullWidth
                  multiline
                  rows={2}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
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
        <CashRegistry
          transactions={transactions}
          inventoryItems={inventoryItems}
          onUpdateInventory={setInventoryItems}
          archivedDays={archivedDays}
          onArchiveDay={(newDay: ArchivedDay) =>
            setArchivedDays([newDay, ...archivedDays])
          }
          staffRoster={staffRoster}
          onOpenRoster={() => setOpenRosterDialog(true)}
        />
      )}
      {view === 2 && (
        <InventoryManager
          items={inventoryItems}
          onUpdateItems={setInventoryItems}
        />
      )}
      {view === 3 && (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
          }}
        >
          <Table>
            <TableHead
              sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}
            >
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Cuenta</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Total Ingresos (Debe)
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Total Egresos (Haber)
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Saldo Neto
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accountsData.map((acc) => {
                const accIncomes = transactions
                  .filter(
                    (t) => t.category === acc.name && t.type === "Ingreso",
                  )
                  .reduce((sum, t) => sum + t.amount, 0);
                const accExpenses = transactions
                  .filter((t) => t.category === acc.name && t.type === "Egreso")
                  .reduce((sum, t) => sum + t.amount, 0);
                const accBalance = accIncomes - accExpenses;

                return (
                  <TableRow key={acc.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            bgcolor: acc.color,
                          }}
                        />
                        <Typography sx={{ fontWeight: 700 }}>
                          {acc.name}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={acc.type}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        sx={{ fontWeight: 700, color: "success.main" }}
                      >
                        ${(accIncomes || 0).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ fontWeight: 700, color: "error.main" }}>
                        ${(accExpenses || 0).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        sx={{
                          fontWeight: 900,
                          color:
                            accBalance >= 0 ? "primary.main" : "error.main",
                        }}
                      >
                        ${(accBalance || 0).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="text"
                        sx={{ fontWeight: 700 }}
                        onClick={() => {
                          setFilters({ ...filters, category: acc.name });
                          setView(0);
                        }}
                      >
                        Auditar
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

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
            <TextField
              select
              label="Tipo Predominante"
              fullWidth
              value={accountFormData.type}
              onChange={(e) =>
                setAccountFormData({
                  ...accountFormData,
                  type: e.target.value,
                })
              }
            >
              <MenuItem value="Ingreso">Ingreso</MenuItem>
              <MenuItem value="Egreso">Egreso</MenuItem>
              <MenuItem value="Mixto">Mixto</MenuItem>
            </TextField>
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
            variant="contained"
            fullWidth
            sx={{ fontWeight: 800 }}
          >
            GUARDAR CONFIGURACIÓN
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
