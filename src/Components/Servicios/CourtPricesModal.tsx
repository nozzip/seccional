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
import SportsTennisIcon from "@mui/icons-material/SportsTennis";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";

interface CourtPricesModalProps {
  open: boolean;
  onClose: () => void;
  prices: any | null;
}

const CourtPricesModal: React.FC<CourtPricesModalProps> = ({
  open,
  onClose,
  prices,
}) => {
  const theme = useTheme();

  const courtTypes = [
    {
      id: 0,
      name: "Paddle (Turno)",
      icon: <SportsTennisIcon fontSize="small" />,
    },
    {
      id: 1,
      name: "Squash (Turno)",
      icon: <SportsTennisIcon fontSize="small" />,
    },
    {
      id: 2,
      name: "Fútbol 5 (Turno)",
      icon: <SportsSoccerIcon fontSize="small" />,
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
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
        <SportsTennisIcon color="primary" />
        Aranceles de Canchas
      </DialogTitle>
      <DialogContent sx={{ pb: 4 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Valores por turno (hora) para socios y público general.
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
                <TableCell sx={{ fontWeight: 700 }}>Cancha</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Precio
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courtTypes.map((court) => (
                <TableRow key={court.id}>
                  <TableCell
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <Box sx={{ color: "primary.main", display: "flex" }}>
                      {court.icon}
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {court.name}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {prices && prices[court.id] !== undefined
                      ? `$${prices[court.id]}`
                      : "Consultar"}
                  </TableCell>
                </TableRow>
              ))}
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

export default CourtPricesModal;
