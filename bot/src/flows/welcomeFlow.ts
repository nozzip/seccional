import { addKeyword, EVENTS } from '@builderbot/bot';
import { isBotGloballyActive } from '../services/botConfigService.js';
import { benefitsFlow } from './benefitsFlow.js';
import { newsFlow } from './newsFlow.js';
import { tourismFlow } from './tourismFlow.js';
import { affiliateFlow } from './affiliateFlow.js';
import { humanAgentFlow } from './humanAgentFlow.js';

export const welcomeFlow = addKeyword<any, any>([
  'hola',
  'buenas',
  'buen dia',
  'buenos dias',
  'buenas tardes',
  'buenas noches',
  'menu',
  'inicio',
  'volver',
  'empezar',
  '0',
  'ayuda',
  'info',
  'seccional',
  EVENTS.WELCOME,
])
  .addAction(async (_ctx: any, { endFlow }: any) => {
    const active = await isBotGloballyActive();
    if (!active) {
      return endFlow();
    }
  })
  .addAnswer(
    [
      '👋 *¡Hola! Te damos la bienvenida al canal oficial de AEFIP Seccional Noroeste.*',
      '',
      '¿En qué podemos ayudarte hoy? Elegí una opción respondiendo con el número correspondiente:',
      '',
      '1️⃣ *Convenios y Beneficios* (Descuentos en comercios)',
      '2️⃣ *Prensa y Noticias* (Últimas novedades gremiales)',
      '3️⃣ *Predio y Cabañas* (Turismo y recreación)',
      '4️⃣ *Consultar Afiliación* (Verificar estado en padrón)',
      '5️⃣ *Atención Gremial* (Contacto directo con sede)',
      '',
      '━━━━━━━━━━━━━━━━━━━━━',
      '✍️ _Respondé con el número de la opción deseada (ej: 1)_'
    ].join('\n'),
    { capture: true },
    async (ctx: any, { gotoFlow, fallBack }: any) => {
      const input = ctx.body?.trim().toLowerCase();

      switch (input) {
        case '1':
        case 'beneficios':
        case 'convenios':
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
          return gotoFlow(humanAgentFlow);

        default:
          return fallBack('⚠️ Opción no reconocida. Por favor, respondé con un número del *1 al 5* para continuar:');
      }
    }
  );
