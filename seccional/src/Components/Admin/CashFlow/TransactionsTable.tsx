import React from "react";
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
    Stack,
    Chip,
    IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { Transaction, Account } from "./types";

const MemoizedTransactionsTable = React.memo(
    ({ transactions, onDelete, accountsData }: {
        transactions: Transaction[];
        onDelete: (id: number) => void;
        accountsData: Account[];
    }) => {
        const getAccountColor = (accountName: string) => {
            const acc = accountsData?.find((a: any) => a.name === accountName);
            return acc?.color || "#94a3b8";
        };
        return (
            <TableContainer
                component={Paper}
                elevation={0}
                sx={{ borderRadius: 4, border: "1px solid", borderColor: "divider" }}
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
                        {transactions.map((t: any, index: number) => {
                            const isNewDate = index === 0 || t.date !== transactions[index - 1].date;
                            return (
                                <TableRow
                                    key={t.id}
                                    hover
                                    sx={{
                                        ...(isNewDate && index !== 0 && {
                                            borderTop: "2px solid",
                                            borderColor: "primary.light"
                                        }),
                                        "& td": { py: 1 } // Compact padding
                                    }}
                                >
                                    <TableCell sx={{ whiteSpace: "nowrap", fontWeight: isNewDate ? 800 : 400 }}>
                                        {isNewDate ? t.date : ""}
                                    </TableCell>
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
                                                height: 20,
                                                fontSize: "0.65rem"
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
                                            <Typography sx={{ fontWeight: 500, fontSize: "0.875rem" }}>
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
                                            fontSize: "0.875rem"
                                        }}
                                    >
                                        {t.description}
                                    </TableCell>
                                    <TableCell
                                        align="right"
                                        sx={{
                                            fontWeight: 900,
                                            color: t.type === "Ingreso" ? "success.main" : "error.main",
                                            fontSize: "1rem"
                                        }}
                                    >
                                        ${t.amount.toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <Stack spacing={0.5}>
                                            <Chip
                                                label={t.paymentMethod || "S/M"}
                                                variant="outlined"
                                                size="small"
                                                sx={{ fontWeight: 700, fontSize: "0.6rem", height: 18 }}
                                            />
                                            {t.invoice && (
                                                <Box
                                                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                                                >
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            fontWeight: 800,
                                                            color: "text.secondary",
                                                            fontSize: "0.55rem",
                                                            textTransform: "uppercase",
                                                        }}
                                                    >
                                                        Cpd:
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            fontWeight: 800,
                                                            color: "primary.main",
                                                            fontSize: "0.7rem",
                                                        }}
                                                    >
                                                        {t.invoice}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Stack>
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => onDelete(t.id)}
                                            sx={{ p: 0.5 }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    },
);

export default MemoizedTransactionsTable;
