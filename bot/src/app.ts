import { createBot, createProvider, MemoryDB } from '@builderbot/bot';
import { BaileysProvider } from '@builderbot/provider-baileys';
import { fetchLatestBaileysVersion } from 'baileys';
import { flows } from './flows/index.js';
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

    const { handleCtx, httpServer } = await createBot({
      flow: adapterFlow,
      provider: adapterProvider,
      database: adapterDB,
    });

    httpServer(PORT);
    console.log(`\n======================================================`);
    console.log(`✅ Bot levantado con éxito.`);
    console.log(`🌐 Servidor HTTP / QR Web corriendo en: http://localhost:${PORT}`);
    console.log(`📱 Escanea el código QR que aparecerá en la terminal con WhatsApp.`);
    console.log(`======================================================\n`);
  } catch (error) {
    console.error('❌ Error al iniciar el bot:', error);
  }
};

main();
