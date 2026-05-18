import React, { useEffect, useState } from "react";
import { 
  Box, 
  Container, 
  Typography, 
  Stack, 
  Button, 
  Card, 
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import CloseIcon from "@mui/icons-material/Close";
import Azucena from "./Azucena";
import Warmi from "./Warmi";
import SanLorenzo from "./SanLorenzo";

const BENEFITS_GREMIALES = [
  {
    id: "matrimonio",
    title: "Matrimonio",
    image: `${import.meta.env.BASE_URL}Gremiales/matrimonio.png`,
    description: "Cuando una afiliada o afiliado decide dar este importante paso en la vida, es nuestro deseo celebrar con él o ella.",
    gift: "Te regalamos una estadía de 7 días para los dos en uno de nuestros hoteles de Bariloche (Hotel Peumayen), Mar del Plata (Hotel Concord), CABA (Hotel Da Vinci) o Complejo de Cabañas en Necochea.",
    conditions: "Se podrá hacer uso de este regalo en temporada baja, y el mismo tendrá una validez de un año.",
    contact: "sociales@aefip.org.ar"
  },
  {
    id: "bodas_de_plata",
    title: "Bodas de Plata",
    image: `${import.meta.env.BASE_URL}Gremiales/bodas_de_plata.png`,
    description: "Después de 25 años juntos queremos estar presentes en la celebración.",
    gift: "Te regalamos una estadía de 7 días para los dos en uno de nuestros hoteles de Bariloche (Hotel Peumayen), Mar del Plata (Hotel Concord), CABA (Hotel Da Vinci) o Complejo de Cabañas en Necochea.",
    conditions: "Se podrá hacer uso de este regalo en temporada baja, y el mismo tendrá una validez de un año.",
    contact: "sociales@aefip.org.ar"
  },
  {
    id: "kit_nacimiento",
    title: "Kit Nacimiento",
    image: `${import.meta.env.BASE_URL}Gremiales/kit_nacimiento.png`,
    description: "La llegada de un nuevo integrante a la familia es una bendición y por eso desde AEFIP queremos estar presente, acompañándote en este momento tan especial de tu vida.",
    gift: "Para obtener el Kit debes contactarte con tu delegada o delegado o enviar un mail a la seccional a la cual perteneces, en ambos casos debes adjuntar la partida de nacimiento.",
    hasProducts: true,
    contact: "sociales@aefip.org.ar"
  },
  {
    id: "adopcion",
    title: "Adopción",
    image: `${import.meta.env.BASE_URL}Gremiales/adopcion.png`,
    description: "Entendemos que la adopción es una de las muestras de amor más sinceras que podemos tener por eso queremos festejarlo junto a vos.",
    gift: "Con la llegada de tu hijo o hija podes acceder a una ayuda económica equivalente al kit de nacimiento o podes optar por el kit de nacimiento.",
    conditions: "Para obtener este beneficio contactate con tu delegado o delegado, o envía un mail a la seccional a la cual perteneces.",
    contact: "sociales@aefip.org.ar"
  },
  {
    id: "jubilacion",
    title: "Jubilación",
    image: `${import.meta.env.BASE_URL}Gremiales/jubilacion.png`,
    description: "Te regalamos una estadía de 7 días para dos personas para celebrar el jubileo de los compañeros y compañeras que se afilien a nuestra Organización en esta nueva etapa de su vida.",
    gift: "La Estadía es en alguno de nuestros hoteles sindicales: Hotel Peumayen (Bariloche), Hotel Concord (Mar del Plata), Hotel Da Vinci (CABA) o Complejo de Cabañas en Necochea.",
    conditions: "Se podrá hacer uso de este beneficio en temporada baja, y el mismo tendrá una validez de un año desde la fecha de afiliación.",
    contact: "sociales@aefip.org.ar"
  }
];

function Servicios() {
  const [activeTab, setActiveTab] = useState<"turismo" | "sociales">("turismo");
  const [kitModalOpen, setKitModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Box sx={{ pt: { xs: 12, md: 16 }, pb: 10, bgcolor: "background.default" }}>
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          sx={{
            mb: 4,
            fontWeight: 800,
            color: "primary.main",
            textAlign: "center",
            fontSize: { xs: "2.5rem", md: "3.5rem" },
            letterSpacing: -0.5,
          }}
        >
          Beneficios Gremiales
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            mb: 6,
            textAlign: "center",
            maxWidth: 600,
            mx: "auto",
            fontWeight: 600,
            fontSize: "1.1rem"
          }}
        >
          Conocé todos los servicios de turismo, recreación, subsidios y ayudas sociales exclusivas que AEFIP Noroeste tiene preparados para vos y tu familia.
        </Typography>

        {/* Custom sleeks glassmorphic switcher */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 8 }}>
          <Box
            sx={{
              display: "flex",
              p: 0.75,
              bgcolor: "action.hover",
              borderRadius: 5,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Button
              onClick={() => setActiveTab("turismo")}
              variant={activeTab === "turismo" ? "contained" : "text"}
              color="primary"
              sx={{
                borderRadius: 4,
                px: { xs: 2, sm: 4 },
                py: 1.5,
                fontWeight: 800,
                textTransform: "none",
                fontSize: { xs: "0.9rem", sm: "1rem" },
                boxShadow: activeTab === "turismo" ? "0 4px 12px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.3s ease",
              }}
            >
              Turismo y Recreación
            </Button>
            <Button
              onClick={() => setActiveTab("sociales")}
              variant={activeTab === "sociales" ? "contained" : "text"}
              color="primary"
              sx={{
                borderRadius: 4,
                px: { xs: 2, sm: 4 },
                py: 1.5,
                fontWeight: 800,
                textTransform: "none",
                fontSize: { xs: "0.9rem", sm: "1rem" },
                boxShadow: activeTab === "sociales" ? "0 4px 12px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.3s ease",
              }}
            >
              Subsidios y Ayudas
            </Button>
          </Box>
        </Box>

        {activeTab === "turismo" ? (
          <Stack spacing={6}>
            <Azucena />
            <Warmi />
            <SanLorenzo />
          </Stack>
        ) : (
          <Grid container spacing={4}>
            {BENEFITS_GREMIALES.map((benefit) => (
              <Grid key={benefit.id} size={{ xs: 12, md: 6, lg: 4 }}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: "divider",
                    overflow: "hidden",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
                    },
                  }}
                >
                  <Box sx={{ height: 200, width: "100%", overflow: "hidden", position: "relative" }}>
                    <Box
                      component="img"
                      src={benefit.image}
                      alt={benefit.title}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.5s ease",
                        "&:hover": {
                          transform: "scale(1.05)",
                        },
                      }}
                    />
                  </Box>
                  <CardContent sx={{ p: 3.5, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: "primary.main", mb: 2, fontSize: "1.35rem" }}>
                      {benefit.title}
                    </Typography>
                    <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.7, mb: 2.5, fontSize: "0.95rem" }}>
                      {benefit.description}
                    </Typography>
                    {benefit.gift && (
                      <Box sx={{ bgcolor: "action.hover", p: 2, borderRadius: 3, borderLeft: "4px solid", borderLeftColor: "primary.main", mb: 2.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary", lineHeight: 1.6 }}>
                          {benefit.gift}
                        </Typography>
                      </Box>
                    )}
                    {benefit.conditions && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2.5, fontStyle: "italic", fontSize: "0.8rem", lineHeight: 1.4 }}>
                        * {benefit.conditions}
                      </Typography>
                    )}
                    {benefit.hasProducts && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setKitModalOpen(true)}
                        sx={{ alignSelf: "flex-start", mt: "auto", mb: 3, fontWeight: 800, borderRadius: 2.5, px: 2, py: 0.75, textTransform: "none" }}
                      >
                        Ver productos del Kit
                      </Button>
                    )}
                    <Box sx={{ mt: "auto", pt: 2.5, borderTop: "1px solid", borderColor: "divider", display: "flex", flexDirection: "column", gap: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.75rem", fontWeight: 600 }}>
                        Contacto oficial de consultas:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: "primary.main", fontSize: "0.9rem" }}>
                        {benefit.contact}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Kit Nacimiento Floating Modal */}
      <Dialog
        open={kitModalOpen}
        onClose={() => setKitModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 5, p: 1.5 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 900, color: "primary.main" }}>
            🎒 Contenido del Kit Nacimiento
          </Typography>
          <IconButton onClick={() => setKitModalOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ py: 3 }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontWeight: 500 }}>
            El Kit de Nacimiento de AEFIP Noroeste se entrega con una selección premium de los mejores artículos para el cuidado y confort de tu bebé:
          </Typography>
          <Grid container spacing={2}>
            {[
              "🎒 Mochila Maternal Impermeable de alta capacidad",
              "🍼 Mamaderas Philips Avent (Línea de flujo natural)",
              "👶 Chupetes anatómicos de silicona marca NUK",
              "🧼 Cepillo limpiador premium para mamaderas NUK",
              "Toalla infantil de algodón con capucha bordada AEFIP",
              "🛏️ Cambiador infantil de viaje acolchado e impermeable",
              "🧴 Kit de cosmética Petit Enfant (Óleo, Shampoo y Talco)",
              "🥤 Vaso entrenador Philips Avent con asas ergonómicas",
              "🍼 Babero de silicona Avent impermeable y ajustable",
              "👕 Ropa infantil de puro algodón (body y batitas)"
            ].map((prod, idx) => (
              <Grid key={idx} size={{ xs: 12, sm: 6 }}>
                <Box 
                  sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 1.5, 
                    p: 2, 
                    bgcolor: "action.hover", 
                    borderRadius: 3, 
                    height: "100%",
                    border: "1px solid",
                    borderColor: "action.selected"
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                    {prod}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button 
            variant="contained" 
            onClick={() => setKitModalOpen(false)} 
            sx={{ fontWeight: 800, borderRadius: 3, px: 5, py: 1, textTransform: "none" }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Servicios;
