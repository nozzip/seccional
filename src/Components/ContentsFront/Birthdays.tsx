import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Divider,
  Skeleton,
  alpha,
  useTheme,
} from "@mui/material";
import CakeIcon from "@mui/icons-material/Cake";
import { supabase } from "../../supabaseClient";

interface Affiliate {
  nombre: string;
  apellido: string;
}

export default function Birthdays() {
  const theme = useTheme();
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAffiliates() {
      try {
        const { data, error } = await supabase
          .from("affiliates")
          .select("nombre, apellido")
          .eq("branch", "noroeste")
          .range(3, 13); // Skip first 3 (used in carousel) to avoid direct visible duplicates

        if (error) throw error;
        setAffiliates(data || []);
      } catch (error) {
        console.error("Error fetching affiliate names for birthdays:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAffiliates();
  }, []);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        bgcolor: alpha(theme.palette.background.paper, 0.4),
        backdropFilter: "blur(4px)",
        border: "1px solid",
        borderColor: alpha(theme.palette.primary.main, 0.1),
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <Avatar sx={{ bgcolor: "secondary.main", width: 40, height: 40 }}>
          <CakeIcon sx={{ color: "white" }} />
        </Avatar>
        <Typography
          variant="h6"
          sx={{ fontWeight: 800, color: "primary.main" }}
        >
          Cumpleaños del Mes
        </Typography>
      </Box>

      {loading ? (
        <Stack spacing={2}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Box key={i} sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Skeleton variant="circular" width={40} height={40} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
              </Box>
            </Box>
          ))}
        </Stack>
      ) : (
        <List sx={{ p: 0, flex: 1, overflowY: "auto", maxHeight: 400 }}>
          {affiliates.length > 0 ? (
            affiliates.map((aff, index) => (
              <React.Fragment key={index}>
                <ListItem sx={{ px: 0, py: 1.5 }}>
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: "primary.main",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                      }}
                    >
                      {aff.nombre[0]}
                      {aff.apellido[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${aff.nombre} ${aff.apellido}`}
                    secondary="Afiliado Seccional"
                    primaryTypographyProps={{
                      fontWeight: 600,
                      color: "text.primary",
                      variant: "body2",
                    }}
                    secondaryTypographyProps={{
                      variant: "caption",
                      sx: { opacity: 0.7 },
                    }}
                  />
                </ListItem>
                {index < affiliates.length - 1 && (
                  <Divider component="li" sx={{ opacity: 0.5 }} />
                )}
              </React.Fragment>
            ))
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", py: 4 }}
            >
              No se encontraron afiliados.
            </Typography>
          )}
        </List>
      )}

      <Box
        sx={{
          mt: 2,
          pt: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          textAlign: "center",
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontStyle: "italic" }}
        >
          ¡Felicidades a nuestros compañeros!
        </Typography>
      </Box>
    </Paper>
  );
}

function Stack({
  children,
  spacing,
}: {
  children: React.ReactNode;
  spacing: number;
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: spacing }}>
      {children}
    </Box>
  );
}
