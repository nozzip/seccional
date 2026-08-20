import { addKeyword } from '@builderbot/bot';
import { supabase, HUMAN_AGENT_PHONE, WEB_URL } from '../config/supabase.js';

const DELEGATIONS: Record<string, string> = {
  Salta: '📍 *Sede Salta:* España 832 / Av. Belgrano, Salta Capital',
  Jujuy: '📍 *Delegación Jujuy:* San Salvador de Jujuy',
  Tucumán: '📍 *Delegación Tucumán:* San Miguel de Tucumán',
  'Santiago del Estero': '📍 *Delegación Santiago del Estero:* Santiago del Estero',
  Catamarca: '📍 *Delegación Catamarca:* San Fernando del Valle de Catamarca',
  General: '📍 *Sede Central Noroeste:* Salta, Jujuy, Tucumán, Santiago del Estero y Catamarca',
};

export const humanAgentFlow = addKeyword<any, any>([
  '5',
  'asesor',
  'contacto',
  'humano',
  'representante',
  'secretaria',
  'atencion',
  'atención',
  'guardia',
])
  .addAnswer('⏳ *Conectando con atención gremial...*', null, async (_ctx: any, { flowDynamic, state }: any) => {
    try {
      const selectedProvince = state.get('selectedProvince') || 'General';
      const delegationInfo = DELEGATIONS[selectedProvince] || DELEGATIONS['General'];

      let phone = HUMAN_AGENT_PHONE;
      let hours = 'Lunes a Viernes de 08:00 a 16:00 hs.';

      const { data } = await supabase
        .from('system_configs')
        .select('value')
        .eq('key', 'whatsapp_bot_config')
        .single();

      if (data?.value) {
        if (data.value.human_agent_phone) phone = data.value.human_agent_phone;
        if (data.value.office_hours) hours = data.value.office_hours;
      }

      const text = [
        '👨‍💼 *COMUNICACIÓN DIRECTA CON ASESOR GREMIAL*',
        `_AEFIP Seccional Noroeste - ${selectedProvince}_`,
        '━━━━━━━━━━━━━━━━━━━━━',
        '',
        'Podés comunicarte directamente con nuestro equipo de atención y guardia para consultas gremiales, legales o administrativas:',
        '',
        '📲 *Hacé clic para chatear con un Asesor:*',
        `👉 https://wa.me/${phone}?text=${encodeURIComponent('Hola, me comunico desde el Bot oficial de AEFIP Noroeste para realizar una consulta gremial.')}`,
        '',
        delegationInfo,
        `⏰ *Horario de Atención:* ${hours}`,
        '',
        '━━━━━━━━━━━━━━━━━━━━━',
        '💡 _Escribí *menu* o *0* para volver al menú principal._'
      ].join('\n');

      await flowDynamic(text);
    } catch (e) {
      await flowDynamic(`📞 *Chatear con un Asesor:* https://wa.me/${HUMAN_AGENT_PHONE}`);
    }
  });
