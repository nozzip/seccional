import { createBot, createProvider, MemoryDB } from '@builderbot/bot';
import { BaileysProvider } from '@builderbot/provider-baileys';
import { fetchLatestBaileysVersion } from 'baileys';
import { flows } from './flows/index.js';
import { pauseManager } from './services/pauseManager.js';
import { isBotGloballyActive, getCachedBotActive } from './services/botConfigService.js';
import 'dotenv/config';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3008;

const main = async () => {
  console.log('🚀 Iniciando WhatsApp Bot - AEFIP Seccional Noroeste...');

  try {
    let version: [number, number, number] = [2, 3000, 1025190524];
    try {
      const vData = await fetchLatestBaileysVersion();
      if (vData?.version) {
        version = vData.version as [number, number, number];
        console.log(`📡 Versión de WhatsApp Web sincronizada: ${version.join('.')} (Última: ${vData.isLatest})`);
      }
    } catch (vErr) {
      console.warn('⚠️ No se pudo obtener la última versión de Baileys online, usando fallback:', vErr);
    }

    const adapterFlow = flows;
    const adapterProvider = createProvider(BaileysProvider, {
      name: 'bot',
      version,
      browser: ['AEFIP Bot', 'Chrome', '124.0.0'],
    });
    const adapterDB = new MemoryDB();

    const bot = await createBot({
      flow: adapterFlow,
      provider: adapterProvider,
      database: adapterDB,
    });

    // Sincronizar estado global del bot (is_bot_active) cada 3 segundos y bloquear respuestas si está deshabilitado
    await isBotGloballyActive();
    setInterval(() => {
      isBotGloballyActive().catch(() => {});
    }, 3000);

    const originalCheckIf = bot.dynamicBlacklist.checkIf.bind(bot.dynamicBlacklist);
    bot.dynamicBlacklist.checkIf = (phoneNumber: string) => {
      if (!getCachedBotActive()) return true;
      return originalCheckIf(phoneNumber);
    };

    bot.httpServer(PORT);

    // Endpoint HTTP local para envío controlado de mensajes salientes desde la sesión activa
    if ((adapterProvider as any).server?.post) {
      (adapterProvider as any).server.post(
        '/v1/messages',
        bot.handleCtx(async (botCtx, req, res) => {
          try {
            const { number, message } = req.body || {};
            if (!number || !message) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ ok: false, error: 'Faltan number o message' }));
            }
            const cleanDigits = String(number).replace(/\D/g, '');
            const target = cleanDigits.startsWith('54') ? cleanDigits : `549${cleanDigits}`;
            await botCtx?.sendMessage(target, String(message), {});
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ ok: true, target }));
          } catch (err: any) {
            console.error('Error en /v1/messages:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ ok: false, error: err?.message || 'Error interno' }));
          }
        })
      );
    }

    // Escuchar mensajes salientes del operador humano (desde el teléfono o WhatsApp Web)
    adapterProvider.on('ready', () => {
      console.log('🤖 Socket de WhatsApp listo. Monitor de respuestas humanas activado.');

      const socket = (adapterProvider as any).vendor;
      if (socket?.ev) {
        socket.ev.on('messages.upsert', async (upsertData: any) => {
          try {
            const messages = upsertData?.messages || [];
            for (const msg of messages) {
              // Si el mensaje fue enviado por el operador (fromMe === true)
              if (msg?.key?.fromMe) {
                const remoteJid = msg.key.remoteJid;
                // Excluir estados y grupos
                if (remoteJid && !remoteJid.includes('status@broadcast') && !remoteJid.endsWith('@g.us')) {
                  const cleanPhone = remoteJid.replace(/@.+/, '').replace(/\D/g, '');
                  if (cleanPhone) {
                    await pauseManager.pauseChat(cleanPhone, bot.dynamicBlacklist);
                  }
                }
              }
            }
          } catch (err) {
            console.error('Error procesando evento de mensaje del operador:', err);
          }
        });
      }
    });

    console.log(`\n======================================================`);
    console.log(`✅ Bot levantado con éxito.`);
    console.log(`🌐 Servidor HTTP / QR Web corriendo en: http://localhost:${PORT}`);
    console.log(`📱 Escanea el código QR que aparecerá en la terminal con WhatsApp.`);
    console.log(`⏱️  Auto-Pausa Activa: Si contestas en un chat, el bot se silenciará por 30 min.`);
    console.log(`======================================================\n`);
  } catch (error) {
    console.error('❌ Error al iniciar el bot:', error);
  }
};

main();
