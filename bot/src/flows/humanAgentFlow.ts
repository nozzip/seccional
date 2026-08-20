import { addKeyword } from '@builderbot/bot';
import { supabase, HUMAN_AGENT_PHONE, WEB_URL } from '../config/supabase.js';

export const humanAgentFlow = addKeyword<any, any>(['5', 'asesor', 'contacto', 'humano', 'representante', 'secretaria'])
  .addAnswer('⏳ *Consultando datos de atención gremial...*', null, async (_ctx: any, { flowDynamic }: any) => {
    try {
      let phone = HUMAN_AGENT_PHONE;
      let hours = 'Lunes a Viernes de 08:00 a 16:00 hs.';
      let address = 'Sede Central: Salta / Jujuy';

      const { data } = await supabase
        .from('system_configs')
        .select('value')
        .eq('key', 'whatsapp_bot_config')
        .single();

      if (data?.value) {
        if (data.value.human_agent_phone) phone = data.value.human_agent_phone;
        if (data.value.office_hours) hours = data.value.office_hours;
        if (data.value.headquarters_address) address = data.value.headquarters_address;
      }

      const text = [
        '👥 *ATENCIÓN GREMIAL Y CONTACTO*',
        '_AEFIP Seccional Noroeste_',
        '━━━━━━━━━━━━━━━━━━━━━',
        '',
        `📍 *Sede Central:* ${address}`,
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
