import React from "react";
import { Box, Typography, Button } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { motion } from "framer-motion";

const FormSuccess = () => {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      sx={{
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        p: 4,
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.2,
        }}
      >
        <CheckCircleOutlineIcon
          color="success"
          sx={{
            fontSize: 120,
            filter: "drop-shadow(0 8px 16px rgba(46, 125, 50, 0.2))",
          }}
        />
      </motion.div>

      <Typography
        variant="h4"
        sx={{ fontWeight: 800, color: "primary.main", letterSpacing: "-0.5px" }}
      >
        ¡Solicitud Recibida!
      </Typography>

      <Typography
        variant="body1"
        sx={{ color: "text.secondary", maxWidth: 350, lineHeight: 1.6 }}
      >
        Gracias por registrarte en la Seccional Noroeste. Hemos recibido tu
        información y nuestro equipo la procesará a la brevedad.
      </Typography>

      <Button
        variant="outlined"
        size="large"
        href="/"
        sx={{ mt: 2, borderRadius: 2, px: 4 }}
      >
        Volver al Inicio
      </Button>
    </Box>
  );
};

export default FormSuccess;
