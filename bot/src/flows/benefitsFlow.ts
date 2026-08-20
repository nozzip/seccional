import { addKeyword } from '@builderbot/bot';
import { searchBenefits, searchBenefitsByRubro, formatBenefitsForWhatsApp } from '../services/benefitsService.js';

const RUBROS_MAP: Record<string, { label: string; query: string }> = {
  '1': { label: 'Farmacias y Salud', query: 'farmacia' },
  '2': { label: 'Gimnasios y Deportes', query: 'gimnasio' },
  '3': { label: 'Gastronomía y Bares', query: 'gastronomia' },
  '4': { label: 'Hotelería y Turismo', query: 'hotel' },
  '5': { label: 'Comercios y Servicios', query: 'comercio' },
  '6': { label: 'Ópticas y Cuidado Personal', query: 'optica' },
  '7': { label: 'Todos los convenios', query: 'todos' },
};

export const benefitsFlow = addKeyword<any, any>(['1', 'beneficios', 'convenios', 'descuentos', 'comercios'])
  .addAction(async (ctx: any, { flowDynamic, state }: any) => {
    const prov = state.get('selectedProvince') || 'General';
    const text = [
      `🏷️ *CONVENIOS Y COMERCIOS - ${prov.toUpperCase()}*`,
      '━━━━━━━━━━━━━━━━━━━━━',
      '',
      'Elegí el rubro que deseas consultar:',
      '',
      '1️⃣ 💊 *Farmacias y Salud*',
      '2️⃣ 🏋️ *Gimnasios y Deportes*',
      '3️⃣ 🍽️ *Gastronomía y Bares*',
      '4️⃣ 🏨 *Hotelería y Turismo*',
      '5️⃣ 🛍️ *Comercios y Servicios*',
      '6️⃣ 👓 *Ópticas y Cuidado Personal*',
      `7️⃣ 📋 *Ver TODOS los convenios en ${prov}*`,
      '',
      '🔍 _O escribí directamente el nombre de un comercio o rubro._',
      '━━━━━━━━━━━━━━━━━━━━━',
      '💡 _Escribí *menu* o *0* para volver al menú principal._'
    ].join('\n');
    await flowDynamic(text);
  })
  .addAnswer(
    '✍️ _Respondé con el número del rubro (1 al 7) o nombre buscado:_',
    { capture: true },
    async (ctx: any, { flowDynamic, state }: any) => {
      const input = ctx.body?.trim();

      if (!input || input === '0' || input.toLowerCase() === 'cancelar' || input.toLowerCase() === 'menu') {
        return;
      }

      const selectedProvince = state.get('selectedProvince') || 'General';
      const lower = input.toLowerCase();

      let targetRubro = '';
      let targetLabel = '';

      if (RUBROS_MAP[lower]) {
        targetRubro = RUBROS_MAP[lower].query;
        targetLabel = RUBROS_MAP[lower].label;
      } else {
        targetRubro = input;
        targetLabel = `"${input}"`;
      }

      await flowDynamic(`⏳ *Buscando ${targetLabel} en ${selectedProvince}...*`);

      try {
        let results;
        if (targetRubro === 'todos') {
          results = await searchBenefits('', selectedProvince);
        } else {
          results = await searchBenefitsByRubro(targetRubro, selectedProvince);
          if (!results || results.length === 0) {
            results = await searchBenefits(targetRubro, selectedProvince);
          }
        }

        const searchContext = `${targetLabel} en ${selectedProvince}`;
        const text = formatBenefitsForWhatsApp(results, searchContext);
        await flowDynamic(text);
      } catch (err) {
        console.error('Error in benefitsFlow:', err);
        await flowDynamic('❌ Ocurrió un error al buscar los convenios. Intenta nuevamente.');
      }
    }
  )
  .addAnswer('💡 _Escribí *menu* o *0* para volver al menú principal._');
