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
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            name: "Coca Cola 500ml",
            category: "Bebidas",
            initialStock: 20,
            entries: 0,
            exits: 0,
          },
          {
            id: 2,
            name: "Agua Mineral 500ml",
            category: "Bebidas",
            initialStock: 15,
            entries: 5,
            exits: 2,
          },
          {
            id: 3,
            name: "Alfafor (Variedad)",
            category: "Snacks",
            initialStock: 10,
            entries: 0,
            exits: 3,
          },
          {
            id: 4,
            name: "Papas Fritas",
            category: "Snacks",
            initialStock: 12,
            entries: 0,
            exits: 0,
          },
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

  const [shouldDiscountStock, setShouldDiscountStock] = useState(false);
  const [selectedStockProduct, setSelectedStockProduct] = useState<any>(null);
  const [discountQuantity, setDiscountQuantity] = useState(1);
  const [renewalDays, setRenewalDays] = useState(30);

  const frequentCategories = ["Canchas", "Limpieza", "Insumos"];
  const isPileta =
    formData.category.toLowerCase().includes("pileta") ||
    formData.category.toLowerCase().includes("natación") ||
    formData.category.toLowerCase().includes("natacion");

  const isAutoInvoice =
    formData.type === "Ingreso" &&
    (isPileta ||
      formData.category.toLowerCase().includes("bebida") ||
      formData.category.toLowerCase().includes("snack"));

  const isInventoryCategory =
    formData.type === "Ingreso" &&
    (formData.category.toLowerCase().includes("bebida") ||
      formData.category.toLowerCase().includes("snack"));

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
                      ${totalIncomes.toLocaleString()}
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
                      ${totalExpenses.toLocaleString()}
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
                      ${balance.toLocaleString()}
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
                            ${amount.toLocaleString()}
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
                        {t.amount.toLocaleString()}
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
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 2, color: "info.main", fontWeight: 700 }}
                    >
                      Asignar Pago a Alumno
                    </Typography>
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
                          label="Buscar Alumno"
                          size="small"
                        />
                      )}
                    />
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={12}>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          label="Periodo de Pago"
                          value={renewalDays}
                          onChange={(e) =>
                            setRenewalDays(Number(e.target.value))
                          }
                        >
                          <MenuItem value={15}>Quincena (15 días)</MenuItem>
                          <MenuItem value={30}>Mes (30 días)</MenuItem>
                          <MenuItem value={7}>Semana (7 días)</MenuItem>
                        </TextField>
                      </Grid>
                    </Grid>
                    <Button
                      size="small"
                      sx={{ mt: 1, fontWeight: 700 }}
                      onClick={() => setIsCreatingStudent(true)}
                    >
                      + Crear nuevo alumno rápido
                    </Button>
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
                        <Typography sx={{ fontWeight: 800 }}>
                          Descontar del Inventario
                        </Typography>
                      }
                    />

                    {shouldDiscountStock && (
                      <Stack spacing={2} sx={{ mt: 1 }}>
                        <Autocomplete
                          options={inventoryItems.filter(
                            (item) =>
                              item.category
                                .toLowerCase()
                                .includes(
                                  formData.category.toLowerCase().split(" ")[0],
                                ) ||
                              formData.category
                                .toLowerCase()
                                .includes(item.category.toLowerCase()),
                          )}
                          getOptionLabel={(option) =>
                            `${option.name} (Stock: ${option.initialStock + option.entries - option.exits})`
                          }
                          value={selectedStockProduct}
                          onChange={(_, newValue) =>
                            setSelectedStockProduct(newValue)
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Producto de Inventario"
                              size="small"
                            />
                          )}
                        />
                        <TextField
                          label="Cantidad a descontar"
                          size="small"
                          type="number"
                          value={discountQuantity}
                          onChange={(e) =>
                            setDiscountQuantity(parseInt(e.target.value) || 1)
                          }
                          InputProps={{ inputProps: { min: 1 } }}
                        />
                      </Stack>
                    )}
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
                        ${accIncomes.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ fontWeight: 700, color: "error.main" }}>
                        ${accExpenses.toLocaleString()}
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
                        ${accBalance.toLocaleString()}
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
