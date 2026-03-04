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
  Divider,
} from "@mui/material";
import PoolIcon from "@mui/icons-material/Pool";

interface SwimmingPrices {
  conProfesor: {
    [key: string]: { total: number; club: number; prof: number };
  };
  libre: {
    [key: string]: number;
  };
  porClase: { total: number; club: number; prof: number };
  porDiaLibre: number;
  matronatacion: { total: number; club: number; prof: number };
  plantel: { total: number; club: number; prof: number };
}

interface SwimmingPricesModalProps {
  open: boolean;
  onClose: () => void;
  prices: SwimmingPrices | null;
}

const SwimmingPricesModal: React.FC<SwimmingPricesModalProps> = ({
  open,
  onClose,
  prices,
}) => {
  const theme = useTheme();

  if (!prices) return null;

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
        <PoolIcon color="primary" />
        Aranceles de Natación
      </DialogTitle>
      <DialogContent sx={{ pb: 4 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Valores mensuales para socios y público general.
        </Typography>

        {/* Pileta Libre */}
        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
          Pileta Libre (Mensual)
        </Typography>
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ mb: 4, borderRadius: 2 }}
        >
          <Table size="small">
            <TableHead
              sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}
            >
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Frecuencia</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Total
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>2 veces por semana</TableCell>
                <TableCell align="right">${prices.libre.v2}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>3 veces por semana</TableCell>
                <TableCell align="right">${prices.libre.v3}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>5 veces por semana</TableCell>
                <TableCell align="right">${prices.libre.v5}</TableCell>
              </TableRow>
              <TableRow
                sx={{ "& td": { fontWeight: 700, color: "secondary.main" } }}
              >
                <TableCell>Pase por día (Visitante)</TableCell>
                <TableCell align="right">${prices.porDiaLibre}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* Con Profesor */}
        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
          Con Profesor (Mensual)
        </Typography>
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ mb: 4, borderRadius: 2 }}
        >
          <Table size="small">
            <TableHead
              sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.05) }}
            >
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Frecuencia</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Total
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>2 veces por semana</TableCell>
                <TableCell align="right">
                  ${prices.conProfesor.v2.total}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>3 veces por semana</TableCell>
                <TableCell align="right">
                  ${prices.conProfesor.v3.total}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>5 veces por semana</TableCell>
                <TableCell align="right">
                  ${prices.conProfesor.v5.total}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* Especiales */}
        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
          Categorías Especiales
        </Typography>
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Matronatación</TableCell>
                <TableCell align="right">
                  ${prices.matronatacion.total}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Plantel</TableCell>
                <TableCell align="right">${prices.plantel.total}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Clase Individual</TableCell>
                <TableCell align="right">${prices.porClase.total}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
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

export default SwimmingPricesModal;
