import { createBot, createProvider, MemoryDB } from '@builderbot/bot';
import { BaileysProvider } from '@builderbot/provider-baileys';
import { flows } from './flows/index.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3008;

const main = async () => {
  console.log('🚀 Iniciando WhatsApp Bot - AEFIP Seccional Noroeste...');

  try {
    const adapterFlow = flows;
    const adapterProvider = createProvider(BaileysProvider);
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
