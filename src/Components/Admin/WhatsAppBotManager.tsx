import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Chip,
  Avatar,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  IconButton,
  Tooltip,
  Tab,
  Tabs,
  useTheme,
  alpha,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import SettingsIcon from "@mui/icons-material/Settings";
import SendIcon from "@mui/icons-material/Send";
import RefreshIcon from "@mui/icons-material/Refresh";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SaveIcon from "@mui/icons-material/Save";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import TerminalIcon from "@mui/icons-material/Terminal";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { supabase } from "../../supabaseClient";
import { isUserAdmin } from "../../utils/auth";

interface BotConfig {
  is_bot_active: boolean;
  human_agent_phone: string;
  office_hours: string;
  headquarters_address: string;
  welcome_title: string;
  custom_footer: string;
  local_port: number;
}

const DEFAULT_CONFIG: BotConfig = {
  is_bot_active: true,
  human_agent_phone: "5493870000000",
  office_hours: "Lunes a Viernes de 08:00 a 16:00 hs.",
  headquarters_address: "Av. Belgrano / Mitre, Salta - Jujuy",
  welcome_title: "¡Hola! Te damos la bienvenida al canal oficial de AEFIP Seccional Noroeste.",
  custom_footer: "Presentá tu carnet digital para acceder a los beneficios.",
  local_port: 3008,
};

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  time: string;
}

export default function WhatsAppBotManager() {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [config, setConfig] = useState<BotConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Simulator state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "bot",
      text: `👋 *¡Hola! Te damos la bienvenida al canal oficial de AEFIP Seccional Noroeste.*\n\n¿En qué podemos ayudarte hoy? Elegí una opción respondiendo con el número:\n\n1️⃣ *Convenios y Beneficios* (Descuentos)\n2️⃣ *Prensa y Noticias* (Novedades gremiales)\n3️⃣ *Predio y Cabañas* (Turismo)\n4️⃣ *Consultar Afiliación* (Verificar estado)\n5️⃣ *Atención Gremial* (Contacto directo)\n\n━━━━━━━━━━━━━━━━━━━━━\n✍️ _Respondé con el número (1 al 5)_`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Load config from Supabase system_configs
  useEffect(() => {
    fetchBotConfig();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchBotConfig = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("system_configs")
        .select("value")
        .eq("key", "whatsapp_bot_config")
        .single();

      if (!error && data?.value) {
        setConfig({ ...DEFAULT_CONFIG, ...data.value });
      }
    } catch (err) {
      console.warn("Using default WhatsApp bot config:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from("system_configs").upsert(
        {
          key: "whatsapp_bot_config",
          value: config,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );

      if (error) throw error;
      setSnackbar({
        open: true,
        message: "Configuración del Bot guardada exitosamente en la base de datos.",
        severity: "success",
      });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: "Error al guardar la configuración: " + err.message,
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // Simulator Response Engine
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSimulating) return;

    const userText = inputMessage.trim();
    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: userText,
      time: timeNow,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsSimulating(true);

    // Process logic against actual Supabase database in real time
    setTimeout(async () => {
      let replyText = "";
      const lower = userText.toLowerCase();

      try {
        if (
          ["hola", "buenas", "buen dia", "menu", "inicio", "volver", "0", "empezar", "ayuda"].some((k) =>
            lower.includes(k)
          )
        ) {
          replyText = `👋 *${config.welcome_title}*\n\n¿En qué podemos ayudarte hoy? Elegí una opción respondiendo con el número correspondiente:\n\n1️⃣ *Convenios y Beneficios* (Descuentos)\n2️⃣ *Prensa y Noticias* (Últimas novedades gremiales)\n3️⃣ *Predio y Cabañas* (Turismo y recreación)\n4️⃣ *Consultar Afiliación* (Verificar estado en padrón)\n5️⃣ *Atención Gremial* (Contacto directo con sede)\n\n━━━━━━━━━━━━━━━━━━━━━\n✍️ _Respondé con el número deseado (ej: 1)_`;
        } else if (lower === "1" || lower.includes("beneficio") || lower.includes("convenio") || lower.includes("descuento")) {
          const { data } = await supabase.from("benefits").select("*").limit(4);
          if (data && data.length > 0) {
            replyText = `🏷️ *CONVENIOS Y BENEFICIOS ENCONTRADOS*:\n━━━━━━━━━━━━━━━━━━━━━\n\n`;
            data.forEach((b: any, i: number) => {
              replyText += `*${i + 1}. ${b.title || b.name}*\n`;
              if (b.discount) replyText += `   💥 *${b.discount}*\n`;
              if (b.rubro) replyText += `   📁 _${b.rubro}_ (${b.category || "General"})\n`;
              if (b.address) replyText += `   🏠 ${b.address}\n`;
              replyText += `\n`;
            });
            replyText += `━━━━━━━━━━━━━━━━━━━━━\n📲 _${config.custom_footer}_\n🌐 Ver todos: https://aefipnoroeste.org.ar/#/convenios`;
          } else {
            replyText = `🔍 *No se encontraron convenios* registrados.\n🌐 Consultá en: https://aefipnoroeste.org.ar/#/convenios`;
          }
        } else if (lower === "2" || lower.includes("noticia") || lower.includes("prensa")) {
          const { data } = await supabase.from("news").select("title, summary, id").order("created_at", { ascending: false }).limit(3);
          if (data && data.length > 0) {
            replyText = `📰 *ÚLTIMAS NOVEDADES Y COMUNICADOS*\n_AEFIP Seccional Noroeste_\n━━━━━━━━━━━━━━━━━━━━━\n\n`;
            data.forEach((n: any, i: number) => {
              replyText += `*${i + 1}. ${n.title}*\n`;
              if (n.summary) replyText += `   📄 ${n.summary.slice(0, 90)}...\n`;
              replyText += `   🔗 https://aefipnoroeste.org.ar/#/prensa/${n.id}\n\n`;
            });
            replyText += `━━━━━━━━━━━━━━━━━━━━━\n🌐 Ver todas: https://aefipnoroeste.org.ar/#/prensa`;
          } else {
            replyText = `📰 No hay comunicados recientes cargados en el sistema en este momento.`;
          }
        } else if (lower === "3" || lower.includes("turismo") || lower.includes("cabaña") || lower.includes("predio")) {
          const { data } = await supabase.from("system_configs").select("value").eq("key", "cabin_prices").single();
          replyText = `🏕️ *PREDIO RECREATIVO Y CABAÑAS*\n_AEFIP Seccional Noroeste_\n━━━━━━━━━━━━━━━━━━━━━\n\n📍 *Instalaciones:* Cabañas equipadas, pileta, canchas y asadores.\n\n💰 *Tarifas de Referencia:*\n`;
          if (data?.value && typeof data.value === "object") {
            for (const [k, v] of Object.entries(data.value)) {
              replyText += `• *${k.toUpperCase()}:* $${v}\n`;
            }
          } else {
            replyText += `• Descuentos para afiliados y familiares directos.\n`;
          }
          replyText += `\n📅 *Para solicitar tu reserva online:*\n👉 https://aefipnoroeste.org.ar/#/turismo`;
        } else if (lower === "4" || lower.includes("afiliado") || lower.includes("padron") || lower.includes("carnet")) {
          replyText = `🔍 *CONSULTA DE ESTADO DE AFILIACIÓN*\n\nPor favor, ingresá tu número de DNI o Legajo (ej: *34185803*):`;
        } else if (/^\d{6,9}$/.test(lower)) {
          // User entered a DNI
          const { data } = await supabase
            .from("affiliates")
            .select("nombre, apellido, legajo, branch, validation_token")
            .or(`dni.eq.${lower},legajo.ilike.%${lower}%`)
            .limit(1);

          if (data && data.length > 0) {
            const aff = data[0];
            replyText = `✅ *ESTADO DE AFILIACIÓN CONFIRMADO*\n\n👤 *Afiliado/a:* ${aff.apellido?.toUpperCase()}, ${aff.nombre}\n🔖 *Legajo:* ${aff.legajo || "Registrado"}\n🏢 *Seccional:* ${aff.branch?.toUpperCase() || "NOROESTE"}\n🟢 *Condición:* Activo/a\n\n💳 *Carnet Digital:* https://aefipnoroeste.org.ar/#/validar/${aff.validation_token || ""}`;
          } else {
            replyText = `❌ *AFILIADO NO ENCONTRADO*\n\nNo se encontró ningún afiliado activo con el identificador *"${lower}"* en el padrón de Seccional Noroeste.\n\n_Para tramitar la afiliación:_ https://aefipnoroeste.org.ar/#/afiliate`;
          }
        } else if (lower === "5" || lower.includes("asesor") || lower.includes("contacto") || lower.includes("humano")) {
          replyText = `👥 *ATENCIÓN GREMIAL Y CONTACTO*\n_AEFIP Seccional Noroeste_\n━━━━━━━━━━━━━━━━━━━━━\n\n📍 *Sede:* ${config.headquarters_address}\n⏰ *Horarios:* ${config.office_hours}\n\n📞 *WhatsApp Directo:* https://wa.me/${config.human_agent_phone}\n🌐 *Web:* https://aefipnoroeste.org.ar`;
        } else {
          // Search fallback in benefits
          const { data } = await supabase
            .from("benefits")
            .select("*")
            .or(`title.ilike.%${lower}%,rubro.ilike.%${lower}%,description.ilike.%${lower}%`)
            .limit(3);

          if (data && data.length > 0) {
            replyText = `🏷️ *CONVENIOS ENCONTRADOS PARA "${userText}"*:\n━━━━━━━━━━━━━━━━━━━━━\n\n`;
            data.forEach((b: any, i: number) => {
              replyText += `*${i + 1}. ${b.title || b.name}*\n`;
              if (b.discount) replyText += `   💥 *${b.discount}*\n`;
              if (b.address) replyText += `   🏠 ${b.address}\n`;
              replyText += `\n`;
            });
            replyText += `🌐 Ver todos: https://aefipnoroeste.org.ar/#/convenios`;
          } else {
            replyText = `⚠️ No comprendí tu mensaje. Escribí *menu* o *0* para ver las opciones disponibles.`;
          }
        }
      } catch (err: any) {
        replyText = `❌ Error en el procesamiento. Escribe *menu* para reiniciar.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setIsSimulating(false);
    }, 450);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSnackbar({
      open: true,
      message: "Copiado al portapapeles.",
      severity: "success",
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha("#25D366", 0.15)} 0%, ${alpha(
            theme.palette.primary.main,
            0.1
          )} 100%)`,
          border: `1px solid ${alpha("#25D366", 0.3)}`,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: "#25D366",
              color: "#fff",
              width: 56,
              height: 56,
              boxShadow: "0 4px 12px rgba(37, 211, 102, 0.4)",
            }}
          >
            <WhatsAppIcon sx={{ fontSize: 36 }} />
          </Avatar>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Bot de WhatsApp - AEFIP Noroeste
              </Typography>
              <Chip
                icon={<SmartToyIcon sx={{ fontSize: 16 }} />}
                label={config.is_bot_active ? "Servicio Habilitado" : "Servicio En Pausa"}
                color={config.is_bot_active ? "success" : "default"}
                size="small"
                sx={{ fontWeight: 700 }}
              />
              <Chip label="Solo Administrador" size="small" variant="outlined" color="primary" />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Automatización de atención a afiliados, consultas de convenios, novedades, estado de padrón y turismo.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<OpenInNewIcon />}
            href={`http://localhost:${config.local_port || 3008}`}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
          >
            Ver QR / Servidor Local
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveConfig}
            disabled={saving}
            sx={{
              borderRadius: 2,
              bgcolor: "#25D366",
              "&:hover": { bgcolor: "#1ebc59" },
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper elevation={0} sx={{ borderRadius: 3, mb: 3, border: `1px solid ${theme.palette.divider}` }}>
        <Tabs
          value={tabValue}
          onChange={(_e, v) => setTabValue(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            "& .MuiTab-root": { textTransform: "none", fontWeight: 700, minHeight: 56 },
          }}
        >
          <Tab icon={<SmartToyIcon />} iconPosition="start" label="Simulador en Vivo" />
          <Tab icon={<SettingsIcon />} iconPosition="start" label="Configuración del Bot" />
          <Tab icon={<QrCodeScannerIcon />} iconPosition="start" label="Estado y Vinculación QR" />
          <Tab icon={<TerminalIcon />} iconPosition="start" label="Guía de Despliegue 24/7" />
        </Tabs>

        {/* TAB 0: SIMULADOR INTERACTIVO DE CHAT */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 7 }}>
                <Box
                  sx={{
                    width: "100%",
                    maxWidth: 550,
                    mx: "auto",
                    borderRadius: 4,
                    overflow: "hidden",
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: "0 12px 32px rgba(0,0,0,0.1)",
                    display: "flex",
                    flexDirection: "column",
                    height: 600,
                    bgcolor: theme.palette.mode === "dark" ? "#121b22" : "#efeae2",
                  }}
                >
                  {/* WhatsApp Chat Header */}
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: theme.palette.mode === "dark" ? "#1f2c34" : "#075e54",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: "#25D366", color: "#fff" }}>
                        <WhatsAppIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                          AEFIP Noroeste (Bot Oficial)
                        </Typography>
                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}>
                          en línea • cuenta institucional
                        </Typography>
                      </Box>
                    </Box>
                    <Tooltip title="Reiniciar chat de prueba">
                      <IconButton
                        size="small"
                        sx={{ color: "#fff" }}
                        onClick={() =>
                          setMessages([
                            {
                              id: "1",
                              sender: "bot",
                              text: `👋 *${config.welcome_title}*\n\n1️⃣ *Convenios y Beneficios*\n2️⃣ *Prensa y Noticias*\n3️⃣ *Predio y Cabañas*\n4️⃣ *Consultar Afiliación*\n5️⃣ *Atención Gremial*\n\n✍️ _Respondé con el número (1 al 5)_`,
                              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                            },
                          ])
                        }
                      >
                        <RefreshIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {/* Messages Area */}
                  <Box sx={{ flex: 1, p: 2, overflowY: "auto", display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {messages.map((m) => {
                      const isBot = m.sender === "bot";
                      return (
                        <Box
                          key={m.id}
                          sx={{
                            alignSelf: isBot ? "flex-start" : "flex-end",
                            maxWidth: "85%",
                            bgcolor: isBot
                              ? theme.palette.mode === "dark"
                                ? "#202c33"
                                : "#ffffff"
                              : theme.palette.mode === "dark"
                              ? "#005c4b"
                              : "#d9fdd3",
                            color: theme.palette.mode === "dark" ? "#e9edef" : "#111b21",
                            p: 1.5,
                            borderRadius: 2.5,
                            borderTopLeftRadius: isBot ? 0 : 2.5,
                            borderTopRightRadius: isBot ? 2.5 : 0,
                            boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
                            position: "relative",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                              fontSize: "0.875rem",
                              lineHeight: 1.45,
                            }}
                          >
                            {m.text}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              textAlign: "right",
                              fontSize: "0.68rem",
                              color: theme.palette.mode === "dark" ? "#8696a0" : "#667781",
                              mt: 0.5,
                            }}
                          >
                            {m.time} {isBot ? "" : "✓✓"}
                          </Typography>
                        </Box>
                      );
                    })}
                    {isSimulating && (
                      <Box
                        sx={{
                          alignSelf: "flex-start",
                          bgcolor: theme.palette.mode === "dark" ? "#202c33" : "#ffffff",
                          p: 1,
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <CircularProgress size={14} sx={{ color: "#25D366" }} />
                        <Typography variant="caption" color="text.secondary">
                          escribiendo respuesta en vivo...
                        </Typography>
                      </Box>
                    )}
                    <div ref={chatBottomRef} />
                  </Box>

                  {/* Input Box */}
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: theme.palette.mode === "dark" ? "#202c33" : "#f0f2f5",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Escribe un comando (ej: 1, farmacia, 4, 34185803, turismo)..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 3,
                          bgcolor: theme.palette.mode === "dark" ? "#2a3942" : "#ffffff",
                        },
                      }}
                    />
                    <IconButton
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isSimulating}
                      sx={{
                        bgcolor: "#25D366",
                        color: "#fff",
                        "&:hover": { bgcolor: "#1ebc59" },
                        "&:disabled": { bgcolor: alpha("#25D366", 0.3) },
                      }}
                    >
                      <SendIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Grid>

              {/* Guide / Test Shortcuts */}
              <Grid size={{ xs: 12, md: 5 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                  🧪 Comandos Rápidos de Prueba
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Hacé clic en cualquier opción para enviar el mensaje simulado directamente contra tu base de datos de Supabase:
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {[
                    { label: "1️⃣ Ver Convenios Generales", text: "1" },
                    { label: "💊 Buscar Farmacias con Descuento", text: "farmacia" },
                    { label: "🏨 Buscar Hoteles / Turismo", text: "hotel" },
                    { label: "📰 Consultar Últimas Noticias", text: "2" },
                    { label: "🏕️ Tarifas de Cabañas y Predio", text: "3" },
                    { label: "🔍 Validar Afiliado Activo (DNI Demo)", text: "34185803" },
                    { label: "📞 Derivación a Asesor Humano", text: "5" },
                    { label: "🔄 Volver al Menú Principal", text: "menu" },
                  ].map((btn, idx) => (
                    <Button
                      key={idx}
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setInputMessage(btn.text);
                      }}
                      sx={{
                        justifyContent: "flex-start",
                        textAlign: "left",
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                        py: 1,
                      }}
                    >
                      {btn.label}
                    </Button>
                  ))}
                </Box>

                <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    💡 El simulador consulta en tiempo real las tablas <strong>benefits</strong>, <strong>news</strong>,{" "}
                    <strong>affiliates</strong> y <strong>system_configs</strong> exactamente igual que el microservicio en Node.js.
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* TAB 1: CONFIGURACIÓN GENERAL */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined" sx={{ borderRadius: 3, height: "100%" }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                      ⚙️ Parámetros de Atención Gremial
                    </Typography>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={config.is_bot_active}
                            onChange={(e) => setConfig({ ...config, is_bot_active: e.target.checked })}
                            color="success"
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              Estado del Bot
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Habilitar o pausar respuestas automáticas.
                            </Typography>
                          </Box>
                        }
                      />

                      <TextField
                        label="Teléfono Asesor / Guardia (WhatsApp)"
                        fullWidth
                        size="small"
                        value={config.human_agent_phone}
                        onChange={(e) => setConfig({ ...config, human_agent_phone: e.target.value })}
                        helperText="Formato internacional sin signos (ej: 5493870000000)"
                      />

                      <TextField
                        label="Horario de Atención de Sede"
                        fullWidth
                        size="small"
                        value={config.office_hours}
                        onChange={(e) => setConfig({ ...config, office_hours: e.target.value })}
                      />

                      <TextField
                        label="Dirección de Sede Central"
                        fullWidth
                        size="small"
                        value={config.headquarters_address}
                        onChange={(e) => setConfig({ ...config, headquarters_address: e.target.value })}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined" sx={{ borderRadius: 3, height: "100%" }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                      💬 Mensajes y Textos Personalizados
                    </Typography>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                      <TextField
                        label="Título de Bienvenida"
                        fullWidth
                        multiline
                        rows={2}
                        value={config.welcome_title}
                        onChange={(e) => setConfig({ ...config, welcome_title: e.target.value })}
                      />

                      <TextField
                        label="Pie de Mensaje de Convenios"
                        fullWidth
                        multiline
                        rows={2}
                        value={config.custom_footer}
                        onChange={(e) => setConfig({ ...config, custom_footer: e.target.value })}
                      />

                      <TextField
                        label="Puerto Local del Servidor Bot"
                        type="number"
                        size="small"
                        value={config.local_port}
                        onChange={(e) => setConfig({ ...config, local_port: parseInt(e.target.value, 10) || 3008 })}
                        helperText="Puerto HTTP para visor de QR y Webhooks (por defecto 3008)"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveConfig}
                    disabled={saving}
                    sx={{
                      borderRadius: 2,
                      bgcolor: "#25D366",
                      "&:hover": { bgcolor: "#1ebc59" },
                      fontWeight: 700,
                      px: 4,
                    }}
                  >
                    {saving ? "Guardando en Supabase..." : "Guardar Configuración en Supabase"}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* TAB 2: ESTADO Y VINCULACIÓN QR */}
        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 7 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                  📱 Vinculación por Código QR (Multi-Dispositivo)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  El bot funciona como un dispositivo vinculado oficial de WhatsApp (igual que cuando abres WhatsApp Web en tu PC). El teléfono principal puede seguir usándose libremente.
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <CheckCircleIcon sx={{ color: "#25D366", fontSize: 32 }} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          Persistencia Automática de Sesión
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Las credenciales de acceso se guardan encriptadas en <code>bot/bot_sessions</code> para que no tengas que reescanear el QR cada vez que se reinicie el bot.
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>

                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <QrCodeScannerIcon sx={{ color: "primary.main", fontSize: 32 }} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          Visor Web de Código QR
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Podés escanear el QR directamente desde tu navegador en <strong>http://localhost:{config.local_port || 3008}</strong> o desde la terminal de comandos.
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<OpenInNewIcon />}
                      href={`http://localhost:${config.local_port || 3008}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
                    >
                      Abrir Visor QR
                    </Button>
                  </Paper>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 5 }}>
                <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.6) }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
                      📋 Pasos para Escanear
                    </Typography>
                    <Box component="ol" sx={{ pl: 2, fontSize: "0.875rem", color: "text.secondary", m: 0 }}>
                      <li style={{ marginBottom: 8 }}>
                        Iniciá el microservicio con <code>cd bot && npm run dev</code>.
                      </li>
                      <li style={{ marginBottom: 8 }}>
                        Abrí <strong>WhatsApp</strong> en el teléfono de la Seccional.
                      </li>
                      <li style={{ marginBottom: 8 }}>
                        Tocá en <strong>Dispositivos Vinculados</strong> &gt; <strong>Vincular un dispositivo</strong>.
                      </li>
                      <li style={{ marginBottom: 8 }}>
                        Apuntá la cámara al código QR que aparece en la consola o en el navegador.
                      </li>
                      <li>¡Listo! El bot comenzará a responder automáticamente.</li>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* TAB 3: GUÍA DE DESPLIEGUE */}
        {tabValue === 3 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
              🚀 Despliegue en Servidor 24/7 (Docker / VPS / Railway / Render)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Para que el bot responda las 24 horas sin necesidad de tener tu computadora encendida, se incluye soporte nativo para Docker y PM2.
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                      <CloudDoneIcon color="primary" /> Opción A: Despliegue con Docker Compose
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                      Levanta el bot en segundo plano con reinicio automático si el servidor se reinicia.
                    </Typography>

                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: theme.palette.mode === "dark" ? "#0d1117" : "#f6f8fa",
                        borderRadius: 2,
                        fontFamily: "monospace",
                        fontSize: "0.82rem",
                        position: "relative",
                      }}
                    >
                      <IconButton
                        size="small"
                        sx={{ position: "absolute", right: 8, top: 8 }}
                        onClick={() => copyToClipboard("cd bot\ndocker compose up -d --build")}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                      <div># 1. Ingresar a la carpeta del bot</div>
                      <div>cd bot</div>
                      <br />
                      <div># 2. Levantar el contenedor en background</div>
                      <div>docker compose up -d --build</div>
                      <br />
                      <div># 3. Ver logs y código QR</div>
                      <div>docker compose logs -f whatsapp-bot</div>
                    </Paper>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                      <TerminalIcon color="primary" /> Opción B: Ejecución en Local / Node.js
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                      Ideal para desarrollo y pruebas rápidas en tu equipo.
                    </Typography>

                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: theme.palette.mode === "dark" ? "#0d1117" : "#f6f8fa",
                        borderRadius: 2,
                        fontFamily: "monospace",
                        fontSize: "0.82rem",
                        position: "relative",
                      }}
                    >
                      <IconButton
                        size="small"
                        sx={{ position: "absolute", right: 8, top: 8 }}
                        onClick={() => copyToClipboard("cd bot\nnpm install\nnpm run dev")}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                      <div># 1. Instalar dependencias</div>
                      <div>cd bot</div>
                      <div>npm install</div>
                      <br />
                      <div># 2. Ejecutar con recarga automática</div>
                      <div>npm run dev</div>
                    </Paper>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Notification Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
