import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";

export default function DeudaAfiliadosManager() {
  return (
    <Box>
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
        <MoneyOffIcon color="error" sx={{ fontSize: 40 }} />
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, color: "error.main" }}
          >
            Deuda de Afiliados
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Control y seguimiento de morosidad
          </Typography>
        </Box>
      </Box>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          border: "1px dashed",
          borderColor: "divider",
          textAlign: "center",
        }}
      >
        <Typography variant="body1" color="text.secondary">
          Módulo en construcción. Aquí podrá gestionar las deudas.
        </Typography>
      </Paper>
    </Box>
  );
}
