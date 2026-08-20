import { addKeyword } from '@builderbot/bot';
import { validateAffiliate, formatAffiliateStatus } from '../services/affiliatesService.js';

export const affiliateFlow = addKeyword<any, any>(['4', 'afiliado', 'padron', 'carnet', 'credencial', 'estado'])
  .addAnswer(
    [
      '🔍 *CONSULTA DE ESTADO DE AFILIACIÓN*',
      'Por favor, *ingresá tu número de DNI o Legajo* (solo números, sin puntos ni espacios):',
      '',
      '_Escribí 0 o cancelar para volver al menú._'
    ].join('\n'),
    { capture: true },
    async (ctx, { flowDynamic, fallBack }) => {
      const input = ctx.body?.trim();

      if (!input || input === '0' || input.toLowerCase() === 'cancelar' || input.toLowerCase() === 'menu') {
        return;
      }

      const digitsOnly = input.replace(/\D/g, '');
      if (digitsOnly.length < 4) {
        return fallBack('⚠️ Por favor ingresa un número de DNI o Legajo válido (mínimo 4 dígitos) o escribe *0* para salir:');
      }

      await flowDynamic('⏳ *Verificando en el padrón de afiliados...*');

      try {
        const result = await validateAffiliate(digitsOnly);
        const text = formatAffiliateStatus(result, digitsOnly);
        await flowDynamic(text);
      } catch (err) {
        await flowDynamic('❌ Error al consultar la base de datos. Intenta nuevamente.');
      }
    }
  )
  .addAnswer('💡 _Escribí *menu* o *0* para volver al menú principal._');
