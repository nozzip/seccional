import { addKeyword } from '@builderbot/bot';
import { getTourismInfo, formatTourismForWhatsApp } from '../services/tourismService.js';

export const tourismFlow = addKeyword<any, any>(['3', 'turismo', 'cabana', 'cabaña', 'cabañas', 'predio', 'pileta', 'camping'])
  .addAnswer('⏳ *Consultando información del predio y cabañas...*', null, async (_ctx, { flowDynamic }) => {
    try {
      const info = await getTourismInfo();
      const text = formatTourismForWhatsApp(info.prices);
      await flowDynamic(text);
    } catch (e) {
      await flowDynamic('❌ Ocurrió un error al obtener la información de turismo. Intenta más tarde.');
    }
  })
  .addAnswer([
    '💡 _Escribí *menu* o *0* para volver al menú principal._'
  ].join('\n'));
