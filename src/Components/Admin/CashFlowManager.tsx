import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  InputAdornment,
  MenuItem,
  Chip,
  alpha,
  useTheme,
  Stack,
  Divider,
  Snackbar,
  Alert,
  Autocomplete,
  Tab,
  Tabs,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import AddIcon from "@mui/icons-material/Add";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
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

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PrintIcon from "@mui/icons-material/Print";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import EditIcon from "@mui/icons-material/Edit";
import FilterListIcon from "@mui/icons-material/FilterList";
import DownloadIcon from "@mui/icons-material/Download";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InventoryIcon from "@mui/icons-material/Inventory";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import * as XLSX from "xlsx";

interface Transaction {
  id: number;
  date: string;
  type: "Ingreso" | "Egreso";
  category: string;
  amount: number;
  paymentMethod: string;
  invoice?: string;
  description: string;
  booking_id?: number | null;
  inventory_id?: number | null;
  inventory_qty?: number | null;
  student_dni?: string | null;
  provider_id?: number | null;
}

interface Provider {
  id: number;
  name: string;
  cuit: string;
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

interface Account {
  id: number;
  name: string;
  type: "Ingreso" | "Egreso" | "Mixto";
  balance: number;
  color: string;
}

export interface CartItem {
  id: string; // Unique ID for the cart item
  type: "Ingreso" | "Egreso";
  category: string;
  amount: number;
  description: string;
  paymentMethod: string; // "Efectivo", "Transferencia", "A Cuenta"
  // Snapshots of the referenced entities (so we persist exactly what was selected)
  studentSnapshot?: any;
  bookingSnapshot?: any;
  cabinSnapshot?: any;
  inventorySnapshot?: any;
  providerSnapshot?: any;
  // Specific properties (e.g. quantity for inventory)
  inventoryQty?: number;
}


import CashRegistry from "./CashRegistry";
import InventoryManager from "./InventoryManager";
import { OptimizedTextField } from "../common/OptimizedTextField";
import StudentRegistrationDialog, {
  StudentData,
} from "./StudentRegistrationDialog";
import { supabase } from "../../supabaseClient";

const toTitleCase = (str: string) => {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase(),
  );
};

// --- Memoized UI Components to prevent lag ---

const MemoizedTransactionsTable = React.memo(
  ({ transactions, onDelete, onEdit, accountsData }: any) => {
    const theme = useTheme();
    const getAccountColor = (accountName: string) => {
      const acc = accountsData?.find((a: any) => a.name === accountName);
      return acc?.color || "#94a3b8";
    };
    return (
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 4,
          border: "1px solid",
          borderColor: alpha(theme.palette.divider, 0.4),
          "& .MuiTableCell-root": {
            borderColor: alpha(theme.palette.divider, 0.4),
          },
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>Fecha</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Tipo</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Categoría</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Descripción</TableCell>
              <TableCell sx={{ fontWeight: 800 }} align="right">
                Monto
              </TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Pago</TableCell>
              <TableCell sx={{ fontWeight: 800 }} align="center">
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((t: any) => (
              <TableRow key={t.id} hover>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{t.date}</TableCell>
                <TableCell>
                  <Chip
                    label={t.type}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      bgcolor:
                        t.type === "Ingreso" ? "success.light" : "error.light",
                      color:
                        t.type === "Ingreso" ? "success.dark" : "error.dark",
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: getAccountColor(t.category),
                      }}
                    />
                    <Typography sx={{ fontWeight: 500 }}>
                      {t.category}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell
                  sx={{
                    maxWidth: 250,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    color: "text.secondary",
                  }}
                >
                  {t.description}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 900,
                    color: t.type === "Ingreso" ? "success.main" : "error.main",
                  }}
                >
                  ${t.amount.toLocaleString()}
                </TableCell>
                <TableCell>
                  <Stack spacing={0.2} sx={{ minWidth: 90 }}>
                    {t.invoice ? (
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 900,
                          color: "primary.main",
                          fontSize: "0.85rem",
                          display: "block",
                          lineHeight: 1.2,
                        }}
                      >
                        {t.invoice}
                      </Typography>
                    ) : (
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color: "text.disabled",
                          fontSize: "0.7rem",
                          fontStyle: "italic",
                        }}
                      >
                        Sin comprobante
                      </Typography>
                    )}
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 800,
                        color: "text.secondary",
                        fontSize: "0.6rem",
                        textTransform: "uppercase",
                        opacity: 0.7,
                        letterSpacing: 0.5,
                      }}
                    >
                      {t.paymentMethod || "S/M"}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={0.5} justifyContent="center">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => onEdit(t)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDelete(t.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  },
);

const MemoizedCashRegistry = React.memo(CashRegistry);
const MemoizedInventoryManager = React.memo(InventoryManager);

interface TransactionEditDialogProps {
  open: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onSave: (updatedTransaction: Transaction) => void;
  accountsData: Account[];
}

const TransactionEditDialog: React.FC<TransactionEditDialogProps> = ({
  open,
  onClose,
  transaction,
  onSave,
  accountsData,
}) => {
  const [editedTransaction, setEditedTransaction] =
    useState<Transaction | null>(null);

  useEffect(() => {
    if (transaction) {
      setEditedTransaction({ ...transaction });
    }
  }, [transaction]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedTransaction((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        [name]: name === "amount" ? parseFloat(value) || 0 : value,
      };
    });
  };

  const handleSave = () => {
    if (editedTransaction) {
      onSave(editedTransaction);
    }
    onClose();
  };

  if (!editedTransaction) return null;

  const categories = (accountsData || []).map((acc) => acc.name);
  const paymentMethods = [
    "Efectivo",
    "Transferencia",
    "Débito",
    "Crédito",
    "Mercado Pago",
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar Transacción</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Fecha"
              type="date"
              name="date"
              value={editedTransaction.date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Tipo"
              name="type"
              select
              value={editedTransaction.type}
              onChange={handleChange}
            >
              <MenuItem value="Ingreso">Ingreso</MenuItem>
              <MenuItem value="Egreso">Egreso</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Autocomplete
              freeSolo
              options={categories}
              value={editedTransaction.category}
              onChange={(event, newValue) => {
                setEditedTransaction((prev) =>
                  prev ? { ...prev, category: newValue || "" } : null,
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Categoría"
                  name="category"
                  fullWidth
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Descripción"
              name="description"
              value={editedTransaction.description}
              onChange={handleChange}
              multiline
              rows={2}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Monto"
              name="amount"
              type="number"
              value={editedTransaction.amount}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Método de Pago"
              name="paymentMethod"
              select
              value={editedTransaction.paymentMethod}
              onChange={handleChange}
            >
              {paymentMethods.map((method) => (
                <MenuItem key={method} value={method}>
                  {method}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Comprobante (Opcional)"
              name="invoice"
              value={editedTransaction.invoice || ""}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// --- Interfaces ---

interface CashFlowManagerProps {
  hideInventoryAndArqueo?: boolean;
  branch?: "azucena" | "noroeste";
}

export default function CashFlowManager({
  hideInventoryAndArqueo = false,
  branch = "azucena",
}: CashFlowManagerProps) {
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
  const [cabinBookings, setCabinBookings] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [cabinPrices, setCabinPrices] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Transactions
      const { data: transData, error: transErr } = await supabase
        .from("transactions")
        .select("*")
        .eq("branch", branch)
        .is("deleted_at", null)
        .order("date", { ascending: false });

      if (transErr) throw transErr;

      // 2. Fetch Accounts
      const { data: accData, error: accErr } = await supabase
        .from("accounts")
        .select("*")
        .eq("branch", branch)
        .order("name", { ascending: true });

      if (accErr) throw accErr;

      // 3. Fetch Students & Staff Config (Global)
      const { data: studData, error: studErr } = await supabase
        .from("students")
        .select("*")
        .is("deleted_at", null);
      if (studErr) throw studErr;

      const { data: staffData } = await supabase
        .from("system_configs")
        .select("value")
        .eq("key", "staff_roster")
        .single();

      // 4. Fetch Court Bookings (Global)
      const { data: courtData, error: courtErr } = await supabase
        .from("court_bookings")
        .select("*");
      if (courtErr) throw courtErr;

      const { data: cabinData, error: cabinErr } = await supabase
        .from("cabin_bookings")
        .select("*");
      if (cabinErr) throw cabinErr;

      // 5. Fetch Inventory
      const { data: invData, error: invErr } = await supabase
        .from("inventory")
        .select("*")
        .eq("branch", branch)
        .is("deleted_at", null)
        .order("name", { ascending: true });
      if (invErr) throw invErr;

      // 6. Fetch Archived Days
      const { data: archData, error: archErr } = await supabase
        .from("archived_days")
        .select("*")
        .eq("branch", branch)
        .order("date", { ascending: false });
      if (archErr) throw archErr;

      // 7. Fetch Products Prices (Global)
      const { data: pricesData, error: pricesErr } = await supabase
        .from("products_prices")
        .select("*");
      if (pricesErr) throw pricesErr;

      // 8. Fetch System Configs (Global)
      const { data: configs, error: configsErr } = await supabase
        .from("system_configs")
        .select("*");
      if (configsErr) throw configsErr;

      // 9. Fetch Promotions (Global)
      const { data: promosData, error: promosErr } = await supabase
        .from("promotions")
        .select("*");
      if (promosErr) throw promosErr;

      // 10. Fetch Providers (Global)
      const { data: provData, error: provErr } = await supabase
        .from("providers")
        .select("*")
        .order("name", { ascending: true });
      if (provErr) throw provErr;

      setProviders(provData || []);

      setTransactions(
        (transData || []).map((t: any) => ({
          ...t,
          paymentMethod: t.payment_method,
          booking_id: t.booking_id,
          inventory_id: t.inventory_id,
          inventory_qty: t.inventory_qty,
          student_dni: t.student_dni,
          provider_id: t.provider_id,
        })),
      );

      setAccountsData(accData || []);

      setInventoryItems(
        (invData || []).map((i: any) => ({
          ...i,
          initialStock: i.initial_stock,
        })),
      );

      setArchivedDays(archData || []);

      setProductsPrices(pricesData || []);

      const swimming =
        configs?.find((c) => c.key === "swimming_prices")?.value || {};
      setSwimmingPrices(swimming);

      const courtPricesConfig =
        configs?.find((c) => c.key === "court_prices")?.value || {};
      setCourtPrices(courtPricesConfig);

      const cabinPricesConfig =
        configs?.find((c) => c.key === "cabin_prices")?.value || {};
      setCabinPrices(cabinPricesConfig);

      const roster = staffData?.value || {};

      if (Object.keys(roster).length === 0) {
        setStaffRoster({
          Lunes: { morning: "No asignado", afternoon: "No asignado" },
          Martes: { morning: "No asignado", afternoon: "No asignado" },
          Miércoles: { morning: "No asignado", afternoon: "No asignado" },
          Jueves: { morning: "No asignado", afternoon: "No asignado" },
          Viernes: { morning: "No asignado", afternoon: "No asignado" },
          Sábado: { morning: "No asignado", afternoon: "No asignado" },
          Domingo: { morning: "No asignado", afternoon: "No asignado" },
        });
      } else {
        setStaffRoster(roster);
      }
      const freqCats = configs?.find(
        (c) => c.key === "frequent_categories",
      )?.value;
      if (Array.isArray(freqCats) && freqCats.length > 0) {
        setFrequentCategories(freqCats);
      } else {
        setFrequentCategories(["Pileta", "Cancha", "Bebida", "Snack"]);
      }

      // Fetch all historical transactions related to courts (linked or by category) to reconcile status
      const { data: allCourtTxs } = await supabase
        .from("transactions")
        .select("id, booking_id, deleted_at, description, category")
        .eq("branch", branch) // Filter by branch
        .or(`booking_id.not.is.null,category.ilike.%Cancha%`);

      const activeBookingIds = new Set(
        (allCourtTxs || [])
          .filter((t) => t.deleted_at === null && t.booking_id)
          .map((t) => t.booking_id),
      );

      // Fallback description matching for legacy/imported transactions
      const activeCourtTxsWithoutBookingId = (allCourtTxs || []).filter(
        (t) =>
          t.deleted_at === null &&
          !t.booking_id &&
          t.description &&
          t.category.toLowerCase().includes("cancha"),
      );

      const activeBookingDescriptions = activeCourtTxsWithoutBookingId.map(
        (t) => t.description.toLowerCase(),
      );

      const formattedBookings = (courtData || []).map((b: any) => {
        let currentStatus = b.status;

        // Auto-reconciliation: If it's Pagado but no ACTIVE transaction links to it, revert to Pendiente
        if (currentStatus === "Pagado") {
          const isLinkedById = activeBookingIds.has(b.id);
          const isLinkedByDesc = activeBookingDescriptions.some(
            (desc) =>
              desc.includes(b.user_name.toLowerCase()) &&
              desc.includes(b.start_time) &&
              (desc.includes(b.day_name.toLowerCase()) ||
                (b.date && desc.includes(b.date))),
          );

          if (!isLinkedById && !isLinkedByDesc) {
            currentStatus = "Pendiente";
            // We'll update the DB silently here or just in the UI.
            // Silently updating DB ensures the user doesn't see it as "abonada" anymore.
            supabase
              .from("court_bookings")
              .update({ status: "Pendiente" })
              .eq("id", b.id)
              .then(({ error }) => {
                if (error)
                  console.error("Error auto-reconciling booking:", b.id, error);
              });
          }
        }

        return {
          id: b.id,
          courtType: b.court_type,
          courtSubNumber: b.court_sub_number,
          dayName: b.day_name,
          startTime: b.start_time,
          duration: b.duration,
          user: b.user_name,
          isWeekly: b.is_weekly,
          date: b.booking_date,
          status: currentStatus,
        };
      });

      setCourtBookings(formattedBookings);

      setCabinBookings(cabinData || []);

      const today = new Date().toISOString().split("T")[0];
      setPromotions(
        (promosData || []).filter(
          (p: any) =>
            p.active &&
            (!p.start_date || p.start_date <= today) &&
            (!p.end_date || p.end_date >= today),
        ),
      );

      setStudents(
        (studData || []).map((s: any) => ({
          ...s,
          fullName: s.full_name,
          hasProfessor: s.has_professor,
          lastPayment: s.last_payment,
          expiryDate: s.expiry_date,
        })),
      );
    } catch (error: any) {
      console.error("Error loading Supabase data:", error);
      setErrorMessage("Error al cargar los datos: " + error.message);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Set up Realtime Subscriptions with branch filter
    const transSubscription = supabase
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
          filter: `branch=eq.${branch}`,
        },
        (payload) => {
          fetchData(); // Trigger full refetch to keep dependent computations in sync
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "accounts",
          filter: `branch=eq.${branch}`,
        },
        (payload) => {
          fetchData();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "inventory",
          filter: `branch=eq.${branch}`,
        },
        (payload) => {
          fetchData();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "providers",
        },
        (payload) => {
          fetchData();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(transSubscription);
    };
  }, [branch]);

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

  // --- Cart State logic ---
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

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

  const formatCUIT = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 2) return digits;
    if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10, 11)}`;
  };

  const padInvoiceNumbers = () => {
    setInvoiceData((prev) => ({
      ...prev,
      num1: prev.num1 ? prev.num1.padStart(4, "0") : "",
      num2: prev.num2 ? prev.num2.padStart(8, "0") : "",
    }));
  };

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

  const [selectedProvider, setSelectedProvider] = useState<any | null>(null);
  const [providerSearchInput, setProviderSearchInput] = useState("");
  const [isCreatingProvider, setIsCreatingProvider] = useState(false);
  const [providerFormData, setProviderFormData] = useState({
    name: "",
    cuit: "",
  });

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
  const [inventoryAdjustment, setInventoryAdjustment] = useState<any>(null); // Added this based on handleCloseDialog

  const [frequentCategories, setFrequentCategories] = useState([
    "Pileta",
    "Cancha",
    "Bebida",
    "Snack",
  ]);

  const isPileta =
    formData.type === "Ingreso" &&
    (formData.category.toLowerCase().includes("pileta") ||
      formData.category.toLowerCase().includes("natación") ||
      formData.category.toLowerCase().includes("natacion"));

  const isCourtCategory =
    formData.type === "Ingreso" &&
    formData.category.toLowerCase().includes("cancha");

  const isCabinCategory =
    formData.type === "Ingreso" &&
    (formData.category.toLowerCase().includes("mollar") ||
      formData.category.toLowerCase().includes("cabaña") ||
      formData.category.toLowerCase().includes("cabana"));

  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(
    null,
  );
  const [selectedCabinId, setSelectedCabinId] = useState<number | null>(null);

  const isAutoInvoice =
    formData.type === "Ingreso" &&
    (isPileta ||
      isCourtCategory ||
      isCabinCategory ||
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
    if (isPileta && (selectedStudent || isCreatingStudent)) {
      const studentName = isCreatingStudent
        ? newStudentData.fullName
        : selectedStudent?.fullName || "";
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

      setFormData((prev) => ({
        ...prev,
        description: `${plan}${freq} - ${studentName} (Periodo: ${period})`,
      }));
    }
  }, [
    selectedStudent,
    isCreatingStudent,
    newStudentData.fullName,
    swimmingSelection,
    renewalDays,
    isPileta,
  ]);

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

  const handleSaveQuickProvider = async () => {
    if (!providerFormData.name) {
      setErrorMessage("El nombre del proveedor es obligatorio.");
      setShowError(true);
      return;
    }
    try {
      const { data: provData, error: provError } = await supabase
        .from("providers")
        .insert([{ name: providerFormData.name, cuit: providerFormData.cuit }])
        .select()
        .single();
      if (provError) throw provError;
      if (provData) {
        setProviders((prev) => [...prev, provData]);
        setSelectedProvider(provData);
        setIsCreatingProvider(false);
        setProviderFormData({ name: "", cuit: "" });
        setErrorMessage("Proveedor guardado correctamente.");
        setShowSuccess(true);
      }
    } catch (err: any) {
      setErrorMessage("Error al crear el proveedor.");
      setShowError(true);
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

  const removeItemFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddToCart = () => {
    if (!formData.category || !formData.amount) {
      setErrorMessage("Complete la categoría y el monto.");
      setShowError(true);
      return;
    }

    const formattedCategory = toTitleCase(formData.category.trim());
    const parsedAmount = parseFloat(formData.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage("El monto ingresado no es válido.");
      setShowError(true);
      return;
    }

    let finalDesc = formData.description;

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

        finalDesc = `Renovación: ${studentName} - ${plan}${freq} (${period})`;
      } else if (isInventoryCategory && selectedStockProduct) {
        finalDesc = `Venta: ${selectedStockProduct.name} (x${discountQuantity})`;
      } else if (isCourtCategory && selectedBookingId) {
        const booking = courtBookings.find((b) => b.id === selectedBookingId);
        if (booking) {
          finalDesc = `Reserva Cancha: ${booking.user} (${booking.dayName} ${booking.startTime}hs)`;
        } else {
          finalDesc = `Pago de Cancha (${formattedCategory})`;
        }
      } else if (isCabinCategory && selectedCabinId) {
        const cabin = cabinBookings.find((c) => c.id === selectedCabinId);
        if (cabin) {
          finalDesc = `Reserva Cabaña: ${cabin.user_name} (${cabin.start_date})`;
        } else {
          finalDesc = `Pago Cabañas El Mollar`;
        }
      } else {
        // Fallback description based on category if still empty
        finalDesc = `${formattedCategory}`;
      }
    }

    const newItem: CartItem = {
      id: crypto.randomUUID(),
      type: formData.type as "Ingreso" | "Egreso",
      category: formattedCategory,
      amount: parsedAmount,
      description: finalDesc,
      paymentMethod: formData.paymentMethod, // From form 
      studentSnapshot: isPileta ? {
        selectedStudent,
        isCreatingStudent,
        newStudentData,
        renewalDays,
        swimmingSelection
      } : null,
      providerSnapshot: (formData.type === "Egreso" && (selectedProvider || (isCreatingProvider && providerFormData.name))) ? {
        selectedProvider,
        isCreatingProvider,
        providerFormData
      } : null,
      bookingSnapshot: isCourtCategory ? { selectedBookingId } : null,
      cabinSnapshot: isCabinCategory ? { selectedCabinId } : null,
      inventorySnapshot: (isInventoryCategory && shouldDiscountStock) ? { selectedStockProduct } : null,
      inventoryQty: shouldDiscountStock ? discountQuantity : undefined
    };

    setCartItems((prev) => [...prev, newItem]);

    // Reset LOCAL form, leave Global Cart alone
    setFormData((prev) => ({
      ...prev,
      category: "",
      amount: "",
      description: "",
    }));
    setSelectedStudent(null);
    setIsCreatingStudent(false);
    setSelectedBookingId(null);
    setSelectedCabinId(null);
    setSelectedStockProduct(null);
    setShouldDiscountStock(false);
    setDiscountQuantity(1);
    setIsCreatingProvider(false);
    setProviderSearchInput("");
    setStudentSearchInput("");
  };

  const submitCart = async () => {
    if (cartItems.length === 0) return;


    let finalInvoice: string | undefined = undefined;
    if (isAutoInvoice) {
      finalInvoice = generateAutoInvoice();
    } else if (invoiceData.letter || invoiceData.num1 || invoiceData.num2) {
      const paddedNum1 = invoiceData.num1.padStart(4, "0");
      const paddedNum2 = invoiceData.num2.padStart(8, "0");
      finalInvoice = `${invoiceData.letter || "X"}-${paddedNum1}-${paddedNum2}`;

      const isDuplicate = transactions.some((t) => t.invoice === finalInvoice);
      if (isDuplicate) {
        setErrorMessage(
          "Ya existe un movimiento (fuera de este carrito) con este número de comprobante/factura.",
        );
        setShowError(true);
        return;
      }
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const totalCartAmount = cartItems.reduce((acc, i) => acc + i.amount, 0);

    try {
      for (const item of cartItems) {
        let studentToUpsert: any = null;
        if (item.studentSnapshot) {
          const sSnap = item.studentSnapshot;
          const sStudent = sSnap.selectedStudent;
          const sIsCreating = sSnap.isCreatingStudent;
          const sNewData = sSnap.newStudentData;

          const student = students.find(
            (s) => s.dni === (sIsCreating ? sNewData.dni : sStudent.dni),
          );
          const todayDate = new Date();
          const baseDate = student && student.expiryDate && new Date(student.expiryDate) > todayDate
            ? new Date(student.expiryDate)
            : todayDate;
          const newExpiry = new Date(baseDate);
          newExpiry.setDate(newExpiry.getDate() + sSnap.renewalDays);

          studentToUpsert = {
            full_name: sIsCreating ? sNewData.fullName : sStudent.fullName,
            dni: sIsCreating ? sNewData.dni : sStudent.dni,
            phone: sIsCreating ? sNewData.phone : sStudent.phone,
            schedule: sIsCreating ? {} : sStudent.schedule || {},
            has_professor: sIsCreating ? true : (sStudent?.hasProfessor ?? true),
            last_payment: {
              date: todayStr,
              amount: item.amount,
            },
            expiry_date: newExpiry.toISOString().split("T")[0],
            deleted_at: null,
          };

          const { error: studentError } = await supabase
            .from("students")
            .upsert(studentToUpsert, { onConflict: "dni" });
          if (studentError) throw studentError;
        }

        let providerToLink: number | null = null;
        if (item.providerSnapshot) {
          const pSnap = item.providerSnapshot;
          if (pSnap.isCreatingProvider && pSnap.providerFormData.name) {
            const { data: provData, error: provError } = await supabase
              .from("providers")
              .insert([{ name: pSnap.providerFormData.name, cuit: pSnap.providerFormData.cuit }])
              .select().single();
            if (provError) throw provError;
            if (provData) providerToLink = provData.id;
          } else if (pSnap.selectedProvider) {
            providerToLink = pSnap.selectedProvider.id;
          }
        }

        // Simple payment method per item logic
        entriesToInsert.push({
          date: todayStr,
          type: item.type,
          category: item.category,
          amount: item.amount,
          payment_method: item.paymentMethod,
          invoice: finalInvoice,
          description: item.description,
          booking_id: item.bookingSnapshot?.selectedBookingId || item.cabinSnapshot?.selectedCabinId || null,
          inventory_id: item.inventorySnapshot?.selectedStockProduct?.id || null,
          inventory_qty: item.inventoryQty || null,
          student_dni: studentToUpsert ? studentToUpsert.dni : null,
          provider_id: providerToLink,
          branch,
        });

        for (const entry of entriesToInsert) {
          const { data: txData, error: txError } = await supabase
            .from("transactions")
            .insert(entry)
            .select()
            .single();
          if (txError) throw txError;

          if (studentToUpsert && txData) {
            const { error: historyError } = await supabase
              .from("student_payments")
              .insert({
                student_dni: studentToUpsert.dni,
                transaction_id: txData.id,
                amount: entry.amount,
                payment_date: todayStr,
                expiry_date: studentToUpsert.expiry_date,
                plan_details: {
                  ...item.studentSnapshot.swimmingSelection,
                  renewalDays: item.studentSnapshot.renewalDays,
                },
              });
            if (historyError) throw historyError;
          }

          if (providerToLink && txData) {
            const { error: ledgerError } = await supabase
              .from("provider_ledgers")
              .insert({
                provider_id: providerToLink,
                transaction_id: txData.id,
                type: cartGlobalType === "Egreso" && cartPaymentMethod === "A Cuenta" ? "invoice" : "payment",
                amount: entry.amount,
                date: todayStr,
                description: entry.description
              });
            if (ledgerError) throw ledgerError;

            const { data: remainingLedgers } = await supabase
              .from("provider_ledgers")
              .select("type, amount")
              .eq("provider_id", providerToLink);
            const newBalance = (remainingLedgers || []).reduce((acc, l) => {
              return acc + (l.type === "invoice" ? Number(l.amount) : -Number(l.amount));
            }, 0);
            await supabase.from("providers").update({ balance: newBalance }).eq("id", providerToLink);
          }
        }

        if (item.inventorySnapshot && item.inventorySnapshot.selectedStockProduct) {
          const { error: invError } = await supabase
            .from("inventory")
            .update({
              exits: (item.inventorySnapshot.selectedStockProduct.exits || 0) + (item.inventoryQty || 1),
            })
            .eq("id", item.inventorySnapshot.selectedStockProduct.id);
          if (invError) throw invError;
        }

        if (item.bookingSnapshot?.selectedBookingId) {
          await supabase.from("court_bookings").update({ status: "Pagado" }).eq("id", item.bookingSnapshot.selectedBookingId);
        }
        if (item.cabinSnapshot?.selectedCabinId) {
          await supabase.from("cabin_bookings").update({ status: "Pagado" }).eq("id", item.cabinSnapshot.selectedCabinId);
        }
      }

      setShowSuccess(true);
      fetchData();
      handleCloseDialog();
    } catch (error: any) {
      console.error("Error in submitCart:", error);
      const detail = error.message || error.details || "Error desconocido";
      setErrorMessage(`Error al asentar cobro: ${detail}`);
      setShowError(true);
    }
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setShowSuccess(false);
    setCartItems([]);
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
    setErrorMessage("");
    setShowError(false);
    setStudentSearchInput("");
    setSelectedProvider(null);
    setProviderSearchInput("");
    setSelectedBookingId(null);
    setSelectedCabinId(null);
    setInventoryAdjustment(null);
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
        branch: branch,
      });

      if (error) throw error;

      setShowSuccess(true);
      setOpenAccountDialog(false);
      setAccountFormData({ name: "", type: "Ingreso", balance: "0" });
      fetchData();
    } catch (error) {
      console.error("Error creating account:", error);
      setErrorMessage("Error al crear la cuenta.");
      setShowError(true);
    }
  };

  const handleAddFrequentCategory = async () => {
    if (!formData.category) return;
    const formattedName = toTitleCase(formData.category.trim());

    // 1. Add as account if it doesn't exist
    const accountExists = accountsData.some(
      (a) => a.name.toLowerCase() === formattedName.toLowerCase(),
    );

    if (!accountExists) {
      try {
        const { error } = await supabase.from("accounts").insert({
          name: formattedName,
          type: "Mixto",
          balance: 0,
          color: theme.palette.primary.main,
          branch: branch,
        });
        if (error) throw error;
      } catch (err) {
        console.error("Error creating account from chip:", err);
      }
    }

    // 2. Add to frequent categories list and persist
    if (!frequentCategories.includes(formattedName)) {
      const newFreq = [...frequentCategories, formattedName];
      setFrequentCategories(newFreq);
      try {
        await supabase
          .from("system_configs")
          .upsert(
            { key: "frequent_categories", value: newFreq },
            { onConflict: "key" },
          );
      } catch (err) {
        console.error("Error persisting frequent categories:", err);
      }
    }

    fetchData(); // Refresh accounts and configs
  };

  const handleRemoveFrequentCategory = async (cat: string) => {
    const newFreq = frequentCategories.filter((c) => c !== cat);
    setFrequentCategories(newFreq);
    try {
      await supabase
        .from("system_configs")
        .upsert(
          { key: "frequent_categories", value: newFreq },
          { onConflict: "key" },
        );
    } catch (err) {
      console.error("Error removing frequent category:", err);
    }
  };

  const handleUpdateInventory = async (items: any[]) => {
    setInventoryItems(items);
    try {
      // 1. Update inventory tracking
      const { error: invError } = await supabase.from("inventory").upsert(
        items.map((item) => {
          const mapped: any = {
            name: item.name,
            category: item.category,
            initial_stock: item.initialStock || 0,
            entries: item.entries || 0,
            exits: item.exits || 0,
            price: item.price || 0,
            branch: branch,
          };
          if (item.id) mapped.id = item.id;
          return mapped;
        }),
      );
      if (invError) throw invError;

      // 2. Sync global prices
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
    } catch (error) {
      console.error("Error updating inventory/prices:", error);
    }
  };

  const handleAddItem = async (newItem: any) => {
    try {
      const { error: invError } = await supabase.from("inventory").insert([
        {
          name: newItem.name,
          category: newItem.category,
          initial_stock: newItem.initialStock,
          entries: 0,
          exits: 0,
          price: newItem.price,
          branch: branch,
        },
      ]);
      if (invError) throw invError;

      // Also sync to products_prices
      await supabase.from("products_prices").upsert(
        [
          {
            name: newItem.name,
            price: newItem.price,
          },
        ],
        { onConflict: "name" },
      );

      fetchData();
      setShowSuccess(true);
    } catch (error) {
      console.error("Error adding inventory item:", error);
      setErrorMessage("Error al agregar el producto.");
      setShowError(true);
    }
  };

  const handleDeleteItem = async (target: number | string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este producto?"))
      return;
    try {
      // Find item in state. Search by id if number, otherwise by name.
      const itemToDelete = inventoryItems.find((i) =>
        typeof target === "number" ? i.id === target : i.name === target,
      );
      if (!itemToDelete) return;

      // 1. If it has a real DB ID, soft-delete from inventory table
      if (itemToDelete.id) {
        const { error: invError } = await supabase
          .from("inventory")
          .update({ deleted_at: new Date().toISOString() })
          .eq("id", itemToDelete.id);
        if (invError) throw invError;
      }

      // 2. Remove from products_prices table by name (using the unique product name)
      const { error: priceError } = await supabase
        .from("products_prices")
        .delete()
        .eq("name", itemToDelete.name);

      if (priceError) {
        console.warn("Could not delete from products_prices:", priceError);
      }

      fetchData();
      setShowSuccess(true);
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      setErrorMessage("Error al eliminar el producto.");
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
        branch: branch,
      });
      if (error) throw error;
      fetchData();
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

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setOpenEditDialog(true);
  };

  const handleSaveEditedTransaction = async (updatedTx: Transaction) => {
    try {
      const oldTx = transactions.find((t) => t.id === updatedTx.id);
      if (!oldTx) throw new Error("Transacción no encontrada");

      // Side-effect: If category changed, check if we need to clear links
      let booking_id = updatedTx.booking_id;
      let inventory_id = updatedTx.inventory_id;
      let inventory_qty = updatedTx.inventory_qty;
      let student_dni = updatedTx.student_dni;

      const isStillCourt =
        updatedTx.category.toLowerCase().includes("cancha") ||
        updatedTx.category.toLowerCase().includes("cabaña") ||
        updatedTx.category.toLowerCase().includes("mollar");
      const isStillInventory =
        updatedTx.category.toLowerCase().includes("bebida") ||
        updatedTx.category.toLowerCase().includes("snack");
      const isStillPileta =
        updatedTx.category.toLowerCase().includes("pileta") ||
        updatedTx.category.toLowerCase().includes("natación") ||
        updatedTx.category.toLowerCase().includes("natacion");

      if (!isStillCourt) booking_id = null;
      if (!isStillInventory) {
        inventory_id = null;
        inventory_qty = null;
      }
      if (!isStillPileta) student_dni = null;

      const { error } = await supabase
        .from("transactions")
        .update({
          date: updatedTx.date,
          type: updatedTx.type,
          category: updatedTx.category,
          amount: updatedTx.amount,
          description: updatedTx.description,
          payment_method: updatedTx.paymentMethod,
          invoice: updatedTx.invoice,
          booking_id,
          inventory_id,
          inventory_qty,
          student_dni,
        })
        .eq("id", updatedTx.id);

      if (error) throw error;

      // If we cleared a booking_id, the auto-reconciliation in fetchEverything will handle reversion.
      // If the booking_id remains but details changed, the user said "si se modifica... no debería existir la reserva abonada".
      // To be safe, if ANY relevant field changed for a court booking, we could force revert.
      // But let's start with the category change which is the most obvious modification.

      setErrorMessage("Movimiento actualizado correctamente.");
      setShowSuccess(true);
      fetchData();
    } catch (error) {
      console.error("Error updating transaction:", error);
      setErrorMessage("Error al actualizar el movimiento.");
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
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      // Synchronization logic
      if (txToDelete) {
        // 0. Cleanup student_payments history if linked
        if (txToDelete.student_dni) {
          // Try to update by transaction_id first
          const { data: updatedHistory } = await supabase
            .from("student_payments")
            .update({ deleted_at: new Date().toISOString() })
            .eq("transaction_id", id)
            .select();

          // Fallback for legacy records without transaction_id
          if (!updatedHistory || updatedHistory.length === 0) {
            await supabase
              .from("student_payments")
              .update({ deleted_at: new Date().toISOString() })
              .match({
                student_dni: txToDelete.student_dni,
                amount: txToDelete.amount,
                payment_date: txToDelete.date,
              })
              .is("deleted_at", null);
          }
        }

        // 1. Revert Inventory exit
        if (txToDelete.inventory_id && txToDelete.inventory_qty) {
          const invItem = inventoryItems.find(
            (i) => i.id === txToDelete.inventory_id,
          );
          if (invItem) {
            await supabase
              .from("inventory")
              .update({
                exits: Math.max(
                  0,
                  (invItem.exits || 0) - txToDelete.inventory_qty,
                ),
              })
              .eq("id", txToDelete.inventory_id);
          }
        }

        // 2. Revert Court Booking or Cabin Booking
        if (txToDelete.booking_id) {
          // Check if it's a cabin or court (heuristic by category)
          if (
            txToDelete.category?.toLowerCase().includes("cabaña") ||
            txToDelete.category?.toLowerCase().includes("mollar")
          ) {
            await supabase
              .from("cabin_bookings")
              .update({ status: "Pendiente" })
              .eq("id", txToDelete.booking_id);
          } else {
            await supabase
              .from("court_bookings")
              .update({ status: "Pendiente" })
              .eq("id", txToDelete.booking_id);
          }
        } else if (txToDelete.category?.toLowerCase().includes("cancha")) {
          // Fallback legacy parsing if booking_id wasn't stored
          const descMatch = txToDelete.description.match(
            /(?:Reserva|Pago) Cancha: (.*?) \((.*?) (.*?)hs\)/,
          );
          if (descMatch) {
            const matchedUser = descMatch[1].trim();
            const matchedDayName = descMatch[2].trim();
            const matchedStartTime = descMatch[3].trim();

            await supabase
              .from("court_bookings")
              .update({ status: "Pendiente" })
              .match({
                user_name: matchedUser,
                day_name: matchedDayName,
                start_time: matchedStartTime,
                status: "Pagado",
              });
          }
        }

        // 3. Revert Student payment (Smart Reversion)
        if (txToDelete.student_dni) {
          // Find the latest REMAINING payment for this student
          const { data: history } = await supabase
            .from("student_payments")
            .select("*")
            .eq("student_dni", txToDelete.student_dni)
            .is("deleted_at", null)
            .order("expiry_date", { ascending: false })
            .limit(1);

          if (history && history.length > 0) {
            const latest = history[0];
            await supabase
              .from("students")
              .update({
                last_payment: {
                  date: latest.payment_date,
                  amount: latest.amount,
                },
                expiry_date: latest.expiry_date,
              })
              .eq("dni", txToDelete.student_dni);
          } else {
            // No history left, clear student status
            await supabase
              .from("students")
              .update({
                last_payment: null,
                expiry_date: null,
              })
              .eq("dni", txToDelete.student_dni);
          }
        }
      }

      setErrorMessage("Movimiento eliminado correctamente.");
      setShowSuccess(true);
      fetchData();
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
    return accountsData.map((a) => a.name);
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

  const handleExportExcel = () => {
    // 1. Prepare Summary Data
    const summaryData = [
      ["Reporte de Flujo de Caja"],
      ["Generado el", new Date().toLocaleString()],
      [
        "Periodo",
        `${filters.startDate || "Inicio"} al ${filters.endDate || "Hoy"}`,
      ],
      [],
      ["Resumen del Periodo"],
      ["Total Ingresos", totalIncomes],
      ["Total Egresos", totalExpenses],
      ["Balance Neto", balance],
    ];

    // 2. Prepare Transactions Data
    const transactionRows = filteredTransactions.map((t) => ({
      Fecha: t.date,
      Tipo: t.type,
      Categoría: t.category,
      Descripción: t.description,
      Monto: t.amount,
      Método: t.paymentMethod,
      Comprobante: t.invoice || "",
    }));

    // 3. Create Workbook and Sheets
    const wb = XLSX.utils.book_new();
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    const wsDetails = XLSX.utils.json_to_sheet(transactionRows);

    // 4. Append Sheets
    XLSX.utils.book_append_sheet(wb, wsSummary, "Resumen");
    XLSX.utils.book_append_sheet(wb, wsDetails, "Movimientos");

    // 5. Save File
    XLSX.writeFile(
      wb,
      `flujo_caja_${filters.startDate || "inicio"}_al_${filters.endDate || "hoy"}.xlsx`,
    );
  };

  const handleDownloadTemplate = () => {
    const headers = [
      "Fecha",
      "Tipo",
      "Categoría",
      "Monto",
      "Método",
      "Factura",
      "Descripción",
    ];
    const exampleRow = [
      new Date().toISOString().split("T")[0],
      "Ingreso",
      "Pileta",
      "15000",
      "Efectivo",
      "C-0100-00000001",
      "Importación de prueba",
    ];

    const csvContent = [headers.join(","), exampleRow.join(",")].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "plantilla_importacion_caja.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportFile = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Skip header row
        const rows = jsonData.slice(1) as any[][];

        const importedTransactions = rows
          .map((values) => {
            if (!values || values.length === 0) return null;
            return {
              date: values[0] || new Date().toISOString().split("T")[0],
              type: values[1] || "Ingreso",
              category: toTitleCase(String(values[2] || "Otros")),
              amount: parseFloat(values[3]) || 0,
              payment_method: values[4] || "Efectivo",
              invoice: values[5] || "",
              description: values[6] || "",
            };
          })
          .filter((t): t is any => t !== null && t.amount !== undefined);

        if (importedTransactions.length === 0) {
          setErrorMessage("No se encontraron datos válidos en el archivo.");
          setShowError(true);
          return;
        }

        const { error } = await supabase
          .from("transactions")
          .insert(importedTransactions);
        if (error) throw error;

        // Automatically create missing accounts
        const uniqueCats = [
          ...new Set(importedTransactions.map((t) => t.category)),
        ];
        for (const catName of uniqueCats) {
          const exists = accountsData.some(
            (a) => a.name.toLowerCase() === catName.toLowerCase(),
          );
          if (!exists) {
            await supabase.from("accounts").insert({
              name: catName,
              type: "Mixto",
              balance: 0,
              color: theme.palette.primary.main,
            });
          }
        }

        setShowSuccess(true);
        fetchData();
        setErrorMessage(
          `Se importaron ${importedTransactions.length} movimientos.`,
        );
      } catch (error: any) {
        console.error("Error importing file:", error);
        setErrorMessage("Error al importar el archivo. Verifique el formato.");
        setShowError(true);
      }
    };
    reader.readAsBinaryString(file);
    event.target.value = ""; // Reset input
  };

  const handleDownloadImportGuidePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(26, 95, 122);
    doc.text("Guía de Importación Masiva", 14, 22);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(
      "Siga estas instrucciones para importar movimientos desde otro sistema:",
      14,
      35,
    );

    const columns = [
      ["Columna", "Descripción", "Ejemplo"],
      ["Fecha", "Formato YYYY-MM-DD", "2024-03-24"],
      ["Tipo", "Ingreso o Egreso", "Ingreso"],
      ["Categoría", "Nombre de la cuenta", "Venta Bebida"],
      ["Monto", "Número sin símbolos", "1500.50"],
      ["Método", "Efectivo o Transferencia", "Efectivo"],
      ["Factura", "Opcional (Número comprobante)", "C-001-023"],
      ["Descripción", "Detalle adicional", "Venta coca-cola"],
    ];

    autoTable(doc, {
      startY: 45,
      head: [columns[0]],
      body: columns.slice(1),
      headStyles: { fillColor: [26, 95, 122] },
    });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(
      "Nota: El archivo puede ser Excel (.xlsx, .xls) o CSV separado por comas.",
      14,
      doc.internal.pageSize.getHeight() - 20,
    );
    doc.save("Guia_Importacion_Caja.pdf");
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
    const cats: { [key: string]: number } = {};

    filteredTransactions.forEach((t) => {
      // Daily dynamics
      if (!daily[t.date])
        daily[t.date] = { date: t.date, ingreso: 0, egreso: 0 };
      if (t.type === "Ingreso") {
        daily[t.date].ingreso += t.amount;
        cats[t.category] = (cats[t.category] || 0) + t.amount;
      } else {
        daily[t.date].egreso += t.amount;
      }
    });

    return {
      dailyDynamics: Object.values(daily).sort((a, b) =>
        a.date.localeCompare(b.date),
      ),
      incomeByAccount: Object.entries(cats)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
    };
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
    // Get all unique categories from transactions that match current filter (to show relevant ledger)
    const uniqueCategories = Array.from(
      new Set(transactions.map((t) => t.category)),
    );

    // Create a base list of accounts from accountsData, but also add any missing categories
    const allAccountNames = Array.from(
      new Set([...accountsData.map((a) => a.name), ...uniqueCategories]),
    );

    return allAccountNames
      .map((name) => {
        const existingAcc = accountsData.find((a) => a.name === name);
        const accIncomes = filteredTransactions
          .filter((t) => t.category === name && t.type === "Ingreso")
          .reduce((sum, t) => sum + t.amount, 0);
        const accExpenses = filteredTransactions
          .filter((t) => t.category === name && t.type === "Egreso")
          .reduce((sum, t) => sum + t.amount, 0);

        return {
          id: existingAcc?.id || -1,
          name: name,
          type: existingAcc?.type || "Mixto",
          color: existingAcc?.color || theme.palette.divider,
          accIncomes,
          accExpenses,
          accBalance: accIncomes - accExpenses,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [accountsData, transactions, filteredTransactions, theme.palette.divider]);

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
            value={0}
          />
          {!hideInventoryAndArqueo && (
            <Tab
              icon={<PointOfSaleIcon sx={{ fontSize: 20 }} />}
              label="Arqueo de Caja"
              iconPosition="start"
              sx={{ minHeight: 40 }}
              value={1}
            />
          )}
          {!hideInventoryAndArqueo && (
            <Tab
              icon={<InventoryIcon sx={{ fontSize: 20 }} />}
              label="Inventario"
              iconPosition="start"
              sx={{ minHeight: 40 }}
              value={2}
            />
          )}
          <Tab
            icon={<AccountBalanceWalletIcon sx={{ fontSize: 20 }} />}
            label="Libro Mayor"
            iconPosition="start"
            sx={{ minHeight: 40 }}
            value={3}
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

      {/* Filters visible in Flow and Ledger views to refine data list */}
      {(view === 0 || view === 3) && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 4,
            mt: 4,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: alpha(theme.palette.primary.main, 0.02),
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 3 }}>
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
            <Grid size={{ xs: 6, md: 1.5 }}>
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
            <Grid size={{ xs: 6, md: 1.5 }}>
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
                {categories.map((c: string) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
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
            <Grid size={{ xs: 6, md: 2 }}>
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
              size={{ xs: 12, md: 2 }}
              sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}
            >
              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                style={{ display: "none" }}
                id="import-csv-input"
                onChange={handleImportFile}
              />
              <Tooltip title="Importación Masiva">
                <IconButton
                  color="primary"
                  onClick={() =>
                    document.getElementById("import-csv-input")?.click()
                  }
                  sx={{
                    border: "1px solid",
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                  }}
                >
                  <CloudUploadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Exportar Excel">
                <IconButton
                  color="success"
                  onClick={handleExportExcel}
                  sx={{
                    border: "1px solid",
                    borderColor: alpha(theme.palette.success.main, 0.2),
                  }}
                >
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Imprimir PDF">
                <IconButton
                  color="info"
                  onClick={handleExportPDF}
                  sx={{
                    border: "1px solid",
                    borderColor: alpha(theme.palette.info.main, 0.2),
                  }}
                >
                  <PrintIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </Paper>
      )}

      {view === 0 && (
        <>
          <Box sx={{ mb: 4, mt: 2 }}>
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

          <Box sx={{ mt: 4 }}>
            <MemoizedTransactionsTable
              transactions={filteredTransactions}
              onDelete={handleDeleteTransaction}
              onEdit={handleEditTransaction}
              accountsData={accountsData}
            />
          </Box>
          <Dialog
            open={open}
            onClose={handleCloseDialog}
            maxWidth="lg"
            fullWidth
            PaperProps={{ sx: { borderRadius: 4 } }}
          >
            <DialogTitle sx={{ fontWeight: 800 }}>
              Nuevo Movimiento de Caja (Múltiples Ítems)
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={4}>
                {/* Left Column: Add Item Form */}
                <Grid size={{ xs: 12, md: 7 }}>
                  <Stack spacing={3} sx={{ mt: 1 }}>
                    <Typography variant="overline" color="primary" sx={{ fontWeight: 800, borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>
                      1. Agregar Renglón
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6 }}>
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
                      <Grid size={{ xs: 6 }}>
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
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Cuenta"
                            placeholder="Ej: Cuota Pileta, Bebida..."
                          />
                        )}
                      />
                      <Box
                        sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}
                      >
                        {frequentCategories.map((cat) => (
                          <Chip
                            key={cat}
                            label={
                              cat.charAt(0).toUpperCase() +
                              cat.slice(1).toLowerCase()
                            }
                            size="small"
                            onClick={() =>
                              setFormData({ ...formData, category: cat })
                            }
                            onDelete={() => handleRemoveFrequentCategory(cat)}
                            color={
                              formData.category === cat ? "primary" : "default"
                            }
                            variant={
                              formData.category === cat ? "filled" : "outlined"
                            }
                            sx={{
                              fontWeight: 800,
                              "& .MuiChip-label": {
                                color:
                                  formData.category === cat
                                    ? "#ffffff"
                                    : "text.primary",
                              },
                            }}
                          />
                        ))}
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={handleAddFrequentCategory}
                          sx={{
                            border: "1px dashed",
                            borderColor: "primary.main",
                            "&:hover": {
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                            },
                          }}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
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
                                sx={{
                                  fontWeight: 800,
                                  "& .MuiChip-label": {
                                    color: "#ffffff",
                                  },
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Box>

                    {formData.type === "Egreso" && (
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          bgcolor: alpha(theme.palette.error.main, 0.05),
                          borderRadius: 2,
                          border: "1px dashed",
                          borderColor: "error.main",
                          mb: 2,
                        }}
                      >
                        <Stack spacing={2}>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 800, color: "error.dark" }}
                          >
                            Vincular Proveedor (Opcional)
                          </Typography>
                          <Autocomplete
                            options={providers}
                            getOptionLabel={(option) =>
                              `${option.name} ${option.cuit ? `(CUIT: ${option.cuit})` : ""}`
                            }
                            noOptionsText={
                              <Button
                                fullWidth
                                color="error"
                                variant="contained"
                                size="small"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  setIsCreatingProvider(true);
                                }}
                                startIcon={<AddIcon />}
                                sx={{ fontWeight: 800 }}
                              >
                                Crear Proveedor "{providerSearchInput}"
                              </Button>
                            }
                            inputValue={providerSearchInput}
                            onInputChange={(_, newValue) =>
                              setProviderSearchInput(newValue)
                            }
                            value={selectedProvider}
                            onChange={(_, newValue) =>
                              setSelectedProvider(newValue)
                            }
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Seleccionar Proveedor"
                                size="small"
                              />
                            )}
                          />
                          {isCreatingProvider && (
                            <Box
                              sx={{
                                p: 2,
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 2,
                                bgcolor: "background.paper",
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                sx={{ mb: 1, fontWeight: 700 }}
                              >
                                Nuevo Proveedor
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    label="Nombre / Razón Social"
                                    value={providerFormData.name}
                                    onChange={(e) =>
                                      setProviderFormData({
                                        ...providerFormData,
                                        name: e.target.value,
                                      })
                                    }
                                    autoFocus
                                  />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    label="CUIT (Opcional)"
                                    placeholder="XX-XXXXXXXX-X"
                                    value={providerFormData.cuit}
                                    onChange={(e) =>
                                      setProviderFormData({
                                        ...providerFormData,
                                        cuit: formatCUIT(e.target.value),
                                      })
                                    }
                                  />
                                </Grid>
                                <Grid
                                  size={{ xs: 12 }}
                                  display="flex"
                                  justifyContent="flex-end"
                                  gap={1}
                                >
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => setIsCreatingProvider(false)}
                                  >
                                    Cancelar
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="error"
                                    startIcon={<SaveIcon />}
                                    onClick={handleSaveQuickProvider}
                                    sx={{ fontWeight: 800 }}
                                  >
                                    Guardar Proveedor
                                  </Button>
                                </Grid>
                              </Grid>
                            </Box>
                          )}
                        </Stack>
                      </Paper>
                    )}

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
                            <Grid size={{ xs: 12, sm: 6 }}>
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
                                <Grid size={{ xs: 12, sm: 6 }}>
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

                            <Grid size={{ xs: 12 }}>
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
                            if (!student.dni) {
                              setErrorMessage(
                                "Es obligatorio ingresar un DNI para el alumno.",
                              );
                              setShowError(true);
                              return;
                            }
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

                    {isCabinCategory && branch === "noroeste" && (
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
                            sx={{ fontWeight: 800, color: "success.dark" }}
                          >
                            Vincular Reserva de Cabaña (El Mollar)
                          </Typography>

                          <Autocomplete
                            options={cabinBookings.filter(
                              (b) => b.status !== "Pagado",
                            )}
                            getOptionLabel={(option) =>
                              `Cabaña U${option.cabin_sub_number} - ${option.user_name} (${option.start_date}) ${option.is_affiliate ? "[Afiliado]" : "[General]"}`
                            }
                            onChange={(_, newValue) => {
                              setSelectedCabinId(newValue ? newValue.id : null);
                              if (newValue) {
                                const start = new Date(newValue.start_date);
                                const end = new Date(newValue.end_date);
                                const nights = Math.max(
                                  1,
                                  Math.round(
                                    (end.getTime() - start.getTime()) /
                                    (1000 * 3600 * 24),
                                  ),
                                );

                                const priceConfig = cabinPrices[
                                  `confort${newValue.cabin_type}`
                                ] || { general: 0, afiliado: 0 };
                                const pricePerNight = newValue.is_affiliate
                                  ? priceConfig.afiliado
                                  : priceConfig.general;
                                const totalToPay = pricePerNight * nights;

                                setFormData((prev) => ({
                                  ...prev,
                                  amount:
                                    totalToPay > 0 ? totalToPay.toString() : "",
                                  description: `Reserva Cabaña: U${newValue.cabin_sub_number} ${newValue.user_name} (${newValue.start_date} al ${newValue.end_date} - ${nights} Noche/s)`,
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
                            Selecciona la reserva pendiente para vincular el pago y
                            confirmar la cabaña. Recuerda ingresar el monto
                            correspondiente según el precio de Administrador.
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
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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
                        <Grid size={{ xs: 3 }}>
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
                        <Grid size={{ xs: 4 }}>
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
                            onBlur={padInvoiceNumbers}
                          />
                        </Grid>
                        <Grid size={{ xs: 5 }}>
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
                            onBlur={padInvoiceNumbers}
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
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<AddIcon />}
                      onClick={handleAddToCart}
                      sx={{ fontWeight: 800, py: 1.5, borderStyle: 'dashed' }}
                    >
                      AGREGAR AL CARRITO
                    </Button>
                  </Stack>
                </Grid>

                {/* Right Column: Cart & Checkout */}
                <Grid size={{ xs: 12, md: 5 }}>
                  <Stack spacing={3} sx={{ mt: 1, height: '100%' }}>
                    <Typography variant="overline" color="secondary" sx={{ fontWeight: 800, borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>
                      2. Detalle del Cobro
                    </Typography>

                    <Paper variant="outlined" sx={{ p: 2, flex: 1, borderRadius: 3, display: 'flex', flexDirection: 'column', bgcolor: alpha(theme.palette.secondary.main, 0.02) }}>
                      {cartItems.length === 0 ? (
                        <Box sx={{ py: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                            El carrito está vacío.
                          </Typography>
                        </Box>
                      ) : (
                        <Stack spacing={1} sx={{ flex: 1, overflowY: 'auto', maxHeight: 300, pr: 1 }}>
                          {cartItems.map((item) => (
                            <Paper key={item.id} elevation={0} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                    {item.category}
                                    <Chip
                                      size="small"
                                      label={item.paymentMethod}
                                      sx={{ ml: 1, height: 18, fontSize: '0.6rem', fontWeight: 900 }}
                                      color={item.type === "Ingreso" ? "success" : "error"}
                                      variant="outlined"
                                    />
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>{item.description}</Typography>
                                </Box>
                                <IconButton size="small" color="error" onClick={() => removeItemFromCart(item.id)}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                              <Typography variant="body2" sx={{ fontWeight: 900, color: 'primary.main', textAlign: 'right' }}>
                                ${item.amount.toLocaleString()}
                              </Typography>
                            </Paper>
                          ))}
                        </Stack>
                      )}

                      <Box sx={{ borderTop: '2px dashed', borderColor: 'divider', pt: 2, mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>TOTAL:</Typography>
                          <Typography variant="h5" sx={{ fontWeight: 900, color: 'success.main' }}>
                            ${cartItems.reduce((acc, item) => acc + item.amount, 0).toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Stack>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
              <Button onClick={handleCloseDialog} sx={{ fontWeight: 700 }}>
                CERRAR / CANCELAR
              </Button>
              <Button
                variant="contained"
                color="success"
                sx={{ px: 4, fontWeight: 900, py: 1 }}
                onClick={submitCart}
                disabled={cartItems.length === 0}
              >
                ASENTAR COBRO TOTAL
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
            onAddItem={handleAddItem}
            onDeleteItem={handleDeleteItem}
          />
        </Box>
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
          <Box
            sx={{ mb: 4, display: "flex", justifyContent: "flex-end", gap: 2 }}
          >
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenAccountDialog(true)}
            >
              Nueva Cuenta
            </Button>
          </Box>
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
              {accountsSummary.map((acc) => {
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
                        ${(acc.accIncomes || 0).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ fontWeight: 700, color: "error.main" }}>
                        ${(acc.accExpenses || 0).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        sx={{
                          fontWeight: 900,
                          color:
                            acc.accBalance >= 0 ? "primary.main" : "error.main",
                        }}
                      >
                        ${(acc.accBalance || 0).toLocaleString()}
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
              placeholder="Ej: Cuota Pileta, Bebida, Cantina..."
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
                  <Grid size={{ xs: 6 }}>
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
                  <Grid size={{ xs: 6 }}>
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
      <TransactionEditDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        transaction={editingTransaction}
        onSave={handleSaveEditedTransaction}
        accountsData={accountsData}
      />
    </Box>
  );
}
