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
  Skeleton,
  alpha,
  useTheme,
  Tooltip,
} from "@mui/material";
import CakeIcon from "@mui/icons-material/Cake";
import { supabase } from "../../supabaseClient";

interface Affiliate {
  nombre: string;
  apellido: string;
  fecha_nacimiento?: string;
}

export default function Birthdays() {
  const theme = useTheme();
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAffiliates() {
      try {
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        
        const { data, error } = await supabase
          .from("affiliates")
          .select("nombre, apellido, fecha_nacimiento")
          .eq("branch", "noroeste")
          .not("fecha_nacimiento", "is", null);

        if (error) throw error;

        // Filter and Sort in JS to be year-agnostic
        const monthBirthdays = (data || [])
          .filter(a => {
            if (!a.fecha_nacimiento) return false;
            const [y, m, d] = a.fecha_nacimiento.split("-");
            return parseInt(m) === currentMonth;
          })
          .sort((a, b) => {
            const dayA = parseInt(a.fecha_nacimiento!.split("-")[2]);
            const dayB = parseInt(b.fecha_nacimiento!.split("-")[2]);
            return dayA - dayB;
          });

        setAffiliates(monthBirthdays);
      } catch (error) {
        console.error("Error fetching birthdays of the month:", error);
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
        borderRadius: 1,
        bgcolor: alpha(theme.palette.background.paper, 0.4),
        backdropFilter: "blur(4px)",
        border: "1px solid",
        borderColor: alpha(theme.palette.primary.main, 0.1),
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
        <Avatar sx={{ bgcolor: "secondary.main", width: 32, height: 32, borderRadius: 1 }}>
          <CakeIcon sx={{ color: "white", fontSize: 20 }} />
        </Avatar>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 800, color: "primary.main", lineHeight: 1 }}
        >
          Cumpleaños del Mes
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", gap: 2, overflowX: "hidden" }}>
          {[1, 2, 3, 4].map((i) => (
            <Box key={i} sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, minWidth: 60 }}>
              <Skeleton variant="circular" width={48} height={48} />
              <Skeleton variant="text" width={40} />
            </Box>
          ))}
        </Box>
      ) : (
        <Box 
          sx={{ 
            display: "flex", 
            overflowX: "auto", 
            gap: 2, 
            pb: 1, 
            '&::-webkit-scrollbar': { height: 6 }, 
            '&::-webkit-scrollbar-thumb': { backgroundColor: alpha(theme.palette.primary.main, 0.3), borderRadius: 4 },
            '&::-webkit-scrollbar-track': { backgroundColor: alpha(theme.palette.common.black, 0.05) }
          }}
        >
          {affiliates.length > 0 ? (
            affiliates.map((aff, index) => (
              <Box key={index} sx={{ minWidth: 70, textAlign: "center" }}>
                <Tooltip title={`${aff.nombre} ${aff.apellido} - ${aff.fecha_nacimiento ? `${new Date(aff.fecha_nacimiento).getUTCDate()} de ${new Date(aff.fecha_nacimiento).toLocaleString('es-AR', { month: 'long', timeZone: 'UTC' })}` : ""}`} arrow>
                  <Avatar
                    sx={{
                      margin: "auto",
                      mb: 1,
                      width: 48,
                      height: 48,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: "primary.main",
                      fontWeight: 700,
                      fontSize: "1rem",
                      borderRadius: 2,
                    }}
                  >
                    {aff.nombre[0]}
                    {aff.apellido[0]}
                  </Avatar>
                </Tooltip>
                <Typography variant="caption" display="block" noWrap sx={{ fontWeight: 700, fontSize: "0.7rem", lineHeight: 1.2 }}>
                  {aff.apellido.split(' ')[0]}
                </Typography>
                <Typography variant="caption" display="block" noWrap color="text.secondary" sx={{ fontSize: "0.65rem", fontWeight: 600 }}>
                  {aff.fecha_nacimiento ? `${new Date(aff.fecha_nacimiento).getUTCDate()}/${new Date(aff.fecha_nacimiento).getUTCMonth()+1}` : ""}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", width: "100%", py: 2 }}
            >
              No hay cumpleaños este mes.
            </Typography>
          )}
        </Box>
      )}
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
