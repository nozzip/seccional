# 🤖 Bot de WhatsApp - AEFIP Seccional Noroeste

Microservicio interactivo y autónomo para atención de afiliados, consulta de convenios/beneficios, novedades gremiales, estado de padrón y turismo de la **AEFIP Seccional Noroeste**, desarrollado con **BuilderBot**, **Baileys (Multi-Device)** y conexión directa a **Supabase**.

---

## 🌟 Características Principales

1. **Protocolo WhatsApp Web Multi-Device (Baileys):**
   - No requiere navegadores pesados como Puppeteer / Chromium (consumo < 100 MB RAM).
   - Genera un código QR en la consola y vía web local para vincular en segundos.
   - Persistencia automática de credenciales en la carpeta `bot_sessions/`.
2. **Consultas a Base de Datos en Tiempo Real (Supabase):**
   - **Convenios y Beneficios:** Búsqueda por provincia (Salta, Jujuy, etc.), rubros o palabras clave (farmacias, ópticas, hoteles).
   - **Prensa y Noticias:** Muestra los últimos comunicados institucionales y enlaces a la web.
   - **Validación de Afiliados:** Verificación de estado activo por DNI o Legajo con enlace directo a la credencial digital.
   - **Turismo y Cabañas:** Información de predio, tarifas actualizadas y enlace a solicitudes de reserva.
3. **Atención Gremial y Derivación:**
   - Información de sedes, horarios y enlace directo al WhatsApp del asesor de guardia.

---

## 📁 Estructura del Proyecto

```
seccional/
├── bot/
│   ├── src/
│   │   ├── config/
│   │   │   └── supabase.ts           # Cliente Supabase y variables globales
│   │   ├── flows/
│   │   │   ├── welcomeFlow.ts        # Menú principal y enrutador
│   │   │   ├── benefitsFlow.ts       # Búsqueda de comercios y convenios
│   │   │   ├── newsFlow.ts           # Últimas noticias de la seccional
│   │   │   ├── affiliateFlow.ts      # Validación en padrón por DNI/Legajo
│   │   │   ├── tourismFlow.ts        # Información de cabañas y tarifas
│   │   │   ├── humanAgentFlow.ts     # Contacto con asesor y sede
│   │   │   └── index.ts              # Exportador de flujos
│   │   ├── services/
│   │   │   ├── benefitsService.ts    # Consultas SQL / Supabase de beneficios
│   │   │   ├── newsService.ts        # Consultas de noticias
│   │   │   ├── affiliatesService.ts  # Consultas de afiliados
│   │   │   └── tourismService.ts     # Consultas de tarifas
│   │   └── app.ts                    # Punto de entrada principal
│   ├── .env.example                  # Plantilla de variables de entorno
│   ├── .env                          # Variables locales (configurado)
│   ├── Dockerfile                    # Despliegue en contenedor
│   ├── docker-compose.yml            # Orquestación con persistencia de sesión
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
```

---

## 🚀 Puesta en Marcha Local

### 1. Requisitos Previos
* **Node.js:** Versión 18 o 20+.
* Un teléfono con la cuenta de WhatsApp de la Seccional (o un chip de prueba).

### 2. Instalación de Dependencias
Abre una terminal en la carpeta `bot`:

```bash
cd bot
npm install
```

### 3. Configuración de Variables (`.env`)
Verifica o edita el archivo `.env`:

```env
PORT=3008
SUPABASE_URL=https://bsougkolkltztytxdbna.supabase.co
SUPABASE_KEY=eyJhbGciOi... (Anon o Service Role Key)
WEB_URL=https://aefipnoroeste.org.ar
HUMAN_AGENT_PHONE=5493870000000
```

### 4. Iniciar en Modo Desarrollo

```bash
npm run dev
```

1. La terminal mostrará un **código QR**.
2. Abre WhatsApp en tu celular > **Dispositivos vinculados** > **Vincular un dispositivo**.
3. Escanea el código QR de la terminal (o ingresa en tu navegador a `http://localhost:3008` si prefieres escanearlo desde la web).
4. ¡Listo! El bot responderá automáticamente cuando cualquier usuario le escriba *"hola"*, *"menu"* o envíe un mensaje.

---

## 🐳 Despliegue en Servidor (VPS / Docker)

Para mantener el bot corriendo 24/7 en un servidor con Docker:

```bash
cd bot
docker compose up -d --build
```

Para ver los logs y escanear el QR:
```bash
docker compose logs -f whatsapp-bot
```

---

## 🔄 Flujos del Bot

| Comando / Opción | Flujo Asociado | Acción |
| :--- | :--- | :--- |
| **`hola` / `menu` / `0`** | `welcomeFlow` | Muestra el menú interactivo con los 5 servicios. |
| **`1` / `beneficios`** | `benefitsFlow` | Permite buscar por provincia (S/J), rubro o nombre de comercio. |
| **`2` / `noticias`** | `newsFlow` | Obtiene los últimos comunicados institucionales y links. |
| **`3` / `turismo`** | `tourismFlow` | Muestra tarifas, reglamento del predio y link a reservas. |
| **`4` / `afiliado`** | `affiliateFlow` | Pide DNI/Legajo y valida condición activa + link a carnet digital. |
| **`5` / `asesor`** | `humanAgentFlow` | Entrega teléfono del guardia/asesor, horarios de sede y pausa. |
