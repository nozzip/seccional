import { addKeyword } from '@builderbot/bot';
import { searchBenefits, formatBenefitsForWhatsApp } from '../services/benefitsService.js';

export const benefitsFlow = addKeyword<any, any>(['1', 'beneficios', 'convenios', 'descuentos', 'comercios'])
  .addAction(async (ctx: any, { flowDynamic, state }: any) => {
    const prov = state.get('selectedProvince') || 'Noroeste';
    const text = [
      `🏷️ *CONVENIOS Y BENEFICIOS - ${prov.toUpperCase()}*`,
      '',
      'Podés consultar los convenios de las siguientes maneras:',
      '',
      `👉 Escribí el *nombre o rubro* que buscás en ${prov} (ej: _farmacia, gimnasio, hotel, óptica, supermercado_).`,
      `👉 O enviá *todos* para ver los principales convenios activos en ${prov}.`,
      '',
      '━━━━━━━━━━━━━━━━━━━━━',
      '💡 _Escribí *menu* o *0* para volver al menú principal._'
    ].join('\n');
    await flowDynamic(text);
  })
  .addAnswer(
    '🔍 _Escribí tu búsqueda o "todos":_',
    { capture: true },
    async (ctx: any, { flowDynamic, state }: any) => {
      const input = ctx.body?.trim();

      if (!input || input === '0' || input.toLowerCase() === 'cancelar' || input.toLowerCase() === 'menu') {
        return;
      }

      const selectedProvince = state.get('selectedProvince') || 'General';
      const isAll = input.toLowerCase() === 'todos' || input.toLowerCase() === 'todo' || input === '*';
      const query = isAll ? '' : input;

      await flowDynamic(`⏳ *Buscando convenios en ${selectedProvince}...*`);

      try {
        const results = await searchBenefits(query, selectedProvince);
        const searchContext = isAll ? `Todos los convenios (${selectedProvince})` : `"${input}" en ${selectedProvince}`;
        const text = formatBenefitsForWhatsApp(results, searchContext);
        await flowDynamic(text);
      } catch (err) {
        console.error('Error in benefitsFlow:', err);
        await flowDynamic('❌ Ocurrió un error al buscar los convenios. Intenta nuevamente.');
      }
    }
  )
  .addAnswer('💡 _Escribí *menu* o *0* para volver al menú principal._');
