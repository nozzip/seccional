import { addKeyword, EVENTS } from '@builderbot/bot';
import { isBotGloballyActive } from '../services/botConfigService.js';
import { mainMenuFlow } from './mainMenuFlow.js';

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
      '📍 Para brindarte información, sedes y convenios específicos de tu área, por favor *seleccioná tu provincia*:',
      '',
      '1️⃣ *Salta*',
      '2️⃣ *Jujuy*',
      '3️⃣ *Tucumán*',
      '4️⃣ *Santiago del Estero*',
      '5️⃣ *Catamarca*',
      '6️⃣ *Toda la Seccional (General)*',
      '',
      '━━━━━━━━━━━━━━━━━━━━━',
      '✍️ _Respondé con el número de tu provincia (1 al 6)_'
    ].join('\n'),
    { capture: true },
    async (ctx: any, { gotoFlow, fallBack, state }: any) => {
      const input = ctx.body?.trim().toLowerCase();

      let selectedProvince: string | null = null;

      if (input === '1' || input === 'salta') {
        selectedProvince = 'Salta';
      } else if (input === '2' || input === 'jujuy') {
        selectedProvince = 'Jujuy';
      } else if (input === '3' || input === 'tucuman' || input === 'tucumán') {
        selectedProvince = 'Tucumán';
      } else if (input === '4' || input.includes('santiago')) {
        selectedProvince = 'Santiago del Estero';
      } else if (input === '5' || input === 'catamarca') {
        selectedProvince = 'Catamarca';
      } else if (input === '6' || input === 'general' || input === 'todas' || input === 'toda') {
        selectedProvince = 'General';
      }

      if (!selectedProvince) {
        return fallBack('⚠️ Opción no válida. Por favor, respondé con un número del *1 al 6* para seleccionar tu provincia:');
      }

      await state.update({ selectedProvince });
      return gotoFlow(mainMenuFlow);
    }
  );
