import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  alpha,
  useTheme,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";

interface CabinPrices {
  confort4: { general: number; afiliado: number };
  confort5: { general: number; afiliado: number };
  confort7: { general: number; afiliado: number };
}

interface WarmiPricesModalProps {
  open: boolean;
  onClose: () => void;
  prices: CabinPrices | null;
}

const WarmiPricesModal: React.FC<WarmiPricesModalProps> = ({
  open,
  onClose,
  prices,
}) => {
  const theme = useTheme();

  const cabinOptions = [
    { key: "confort4" as const, name: "Cabaña 4 Personas", capacity: 4 },
    { key: "confort5" as const, name: "Cabaña 5 Personas", capacity: 5 },
    { key: "confort7" as const, name: "Cabaña 7 Personas", capacity: 7 },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 4, backgroundImage: "none" },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          fontWeight: 800,
          color: "primary.main",
          pb: 1,
        }}
      >
        <HomeIcon color="primary" />
        Tarifas Cabañas Warmi (El Mollar)
      </DialogTitle>
      <DialogContent sx={{ pb: 4 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Valores por día de alojamiento. Tarifas diferenciadas para afiliados a
          AEFIP.
        </Typography>

        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          <Table size="small">
            <TableHead
              sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}
            >
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Categoría</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Afiliado
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Gral.
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cabinOptions.map((option) => (
                <TableRow key={option.key}>
                  <TableCell
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <PeopleIcon
                      fontSize="small"
                      sx={{ color: "text.secondary" }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {option.name}
                    </Typography>
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: 700, color: "success.main" }}
                  >
                    {prices
                      ? `$${prices[option.key].afiliado.toLocaleString()}`
                      : "Consultar"}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {prices
                      ? `$${prices[option.key].general.toLocaleString()}`
                      : "Consultar"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box
          sx={{
            mt: 3,
            p: 2,
            bgcolor: alpha(theme.palette.info.main, 0.05),
            borderRadius: 2,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", fontStyle: "italic" }}
          >
            * Las tarifas están sujetas a cambios según temporada y
            disponibilidad. Los precios para afiliados requieren presentar la
            documentación correspondiente.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={onClose}
          fullWidth
          variant="contained"
          sx={{ borderRadius: 2, fontWeight: 700 }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WarmiPricesModal;
