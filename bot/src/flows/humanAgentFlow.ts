import { addKeyword } from '@builderbot/bot';
import { supabase, HUMAN_AGENT_PHONE, WEB_URL } from '../config/supabase.js';

const DELEGATIONS: Record<string, string> = {
  Salta: '📍 *Sede Salta:* España 832 / Av. Belgrano, Salta Capital',
  Jujuy: '📍 *Delegación Jujuy:* San Salvador de Jujuy',
  Tucumán: '📍 *Delegación Tucumán:* San Miguel de Tucumán',
  'Santiago del Estero': '📍 *Delegación Santiago del Estero:* Santiago del Estero',
  Catamarca: '📍 *Delegación Catamarca:* San Fernando del Valle de Catamarca',
  General: '📍 *Sede Central Noroeste:* Jurisdicción Salta, Jujuy, Tucumán, Santiago del Estero y Catamarca',
};

export const humanAgentFlow = addKeyword<any, any>(['5', 'asesor', 'contacto', 'humano', 'representante', 'secretaria', 'sede', 'sedes'])
  .addAnswer('⏳ *Consultando datos de atención gremial...*', null, async (_ctx: any, { flowDynamic, state }: any) => {
    try {
      const selectedProvince = state.get('selectedProvince') || 'General';
      const delegationInfo = DELEGATIONS[selectedProvince] || DELEGATIONS['General'];

      let phone = HUMAN_AGENT_PHONE;
      let hours = 'Lunes a Viernes de 08:00 a 16:00 hs.';
      let address = delegationInfo;

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
        '👥 *ATENCIÓN GREMIAL Y CONTACTO*',
        `_AEFIP Seccional Noroeste - ${selectedProvince}_`,
        '━━━━━━━━━━━━━━━━━━━━━',
        '',
        address,
        `⏰ *Horarios de Atención:* ${hours}`,
        '',
        '📞 *Canal Directo de Guardia / Asesor:*',
        `WhatsApp Directo: https://wa.me/${phone}`,
        '',
        '🌐 *Portal Web Oficial:*',
        `👉 ${WEB_URL}`,
        '',
        '━━━━━━━━━━━━━━━━━━━━━',
        '💡 _Escribí *menu* o *0* para volver al menú principal._'
      ].join('\n');

      await flowDynamic(text);
    } catch (e) {
      await flowDynamic(`📞 *Canal Directo de Guardia:* https://wa.me/${HUMAN_AGENT_PHONE}\n🌐 *Web:* ${WEB_URL}`);
    }
  });
