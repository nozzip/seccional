import { addKeyword } from '@builderbot/bot';
import { benefitsFlow } from './benefitsFlow.js';
import { newsFlow } from './newsFlow.js';
import { tourismFlow } from './tourismFlow.js';
import { affiliateFlow } from './affiliateFlow.js';
import { humanAgentFlow } from './humanAgentFlow.js';

export const mainMenuFlow = addKeyword<any, any>(['_event_main_menu_'])
  .addAction(async (ctx: any, { flowDynamic, state }: any) => {
    const prov = state.get('selectedProvince') || 'Noroeste';
    const text = [
      `📍 *Provincia seleccionada: ${prov}*`,
      '',
      '¿En qué podemos ayudarte hoy? Elegí una opción respondiendo con el número correspondiente:',
      '',
      `1️⃣ *Convenios y Beneficios* (Descuentos en ${prov})`,
      '2️⃣ *Prensa y Noticias* (Últimas novedades gremiales)',
      '3️⃣ *Predio y Cabañas* (Turismo y recreación)',
      '4️⃣ *Consultar Afiliación* (Verificar estado en padrón)',
      `5️⃣ *Atención Gremial y Sedes* (Contactos en ${prov})`,
      '6️⃣ 🔄 *Cambiar de Provincia*',
      '',
      '━━━━━━━━━━━━━━━━━━━━━',
      '✍️ _Respondé con el número de la opción deseada (1 al 6)_'
    ].join('\n');
    await flowDynamic(text);
  })
  .addAnswer(
    '👉 _Ingresá el número de tu opción (1 al 6):_',
    { capture: true },
    async (ctx: any, { gotoFlow, fallBack }: any) => {
      const input = ctx.body?.trim().toLowerCase();

      switch (input) {
        case '1':
        case 'beneficios':
        case 'convenios':
        case 'descuentos':
          return gotoFlow(benefitsFlow);

        case '2':
        case 'noticias':
        case 'prensa':
          return gotoFlow(newsFlow);

        case '3':
        case 'turismo':
        case 'cabana':
        case 'cabaña':
        case 'cabañas':
        case 'predio':
          return gotoFlow(tourismFlow);

        case '4':
        case 'afiliado':
        case 'padron':
        case 'carnet':
        case 'credencial':
          return gotoFlow(affiliateFlow);

        case '5':
        case 'asesor':
        case 'contacto':
        case 'humano':
        case 'sede':
        case 'sedes':
          return gotoFlow(humanAgentFlow);

        case '6':
        case 'cambiar':
        case 'provincia':
        case 'provincias':
          // Redirigir a selección de provincia
          return gotoFlow(welcomeFlow);

        default:
          return fallBack('⚠️ Opción no reconocida. Por favor, respondé con un número del *1 al 6* para continuar:');
      }
    }
  );

// Forward declaration import resolution
import { welcomeFlow } from './welcomeFlow.js';
