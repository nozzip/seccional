import { addKeyword } from '@builderbot/bot';
import { searchBenefits, formatBenefitsForWhatsApp } from '../services/benefitsService.js';

export const benefitsFlow = addKeyword<any, any>(['1', 'beneficios', 'convenios', 'descuentos', 'comercios'])
  .addAnswer(
    [
      '🏷️ *BUSCADOR DE CONVENIOS Y BENEFICIOS*',
      'Podés consultar convenios de las siguientes formas:',
      '',
      '👉 Escribí el *nombre o rubro* que buscás (ej: _farmacia, gimnasio, hotel, óptica, salta, jujuy_).',
      '',
      'O elegí una provincia escribiendo la letra:',
      '🅰️ *S* - Salta',
      '🅱️ *J* - Jujuy',
      '🅲️ *T* - Todos los convenios',
      '',
      '_Escribí 0 o cancelar para volver al menú principal._'
    ].join('\n'),
    { capture: true },
    async (ctx: any, { flowDynamic, fallBack }: any) => {
      const input = ctx.body?.trim();

      if (!input || input === '0' || input.toLowerCase() === 'cancelar' || input.toLowerCase() === 'menu') {
        return;
      }

      let province: string | undefined = undefined;
      let query = input;

      const lower = input.toLowerCase();
      if (lower === 's' || lower === 'salta') {
        province = 'Salta';
        query = '';
      } else if (lower === 'j' || lower === 'jujuy') {
        province = 'Jujuy';
        query = '';
      } else if (lower === 't' || lower === 'todos') {
        province = undefined;
        query = '';
      }

      await flowDynamic('⏳ *Buscando convenios en la base de datos...*');

      try {
        const results = await searchBenefits(query, province);
        const searchContext = province ? `Provincia: ${province}` : (query || 'Generales');
        const text = formatBenefitsForWhatsApp(results, searchContext);
        await flowDynamic(text);
      } catch (err) {
        console.error('Error in benefitsFlow:', err);
        await flowDynamic('❌ Ocurrió un error al buscar los convenios. Intenta nuevamente.');
      }
    }
  )
  .addAnswer('💡 _Escribí *menu* o *0* para volver al menú principal._');
