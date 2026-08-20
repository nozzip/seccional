import { addKeyword } from '@builderbot/bot';
import { HUMAN_AGENT_PHONE, WEB_URL } from '../config/supabase.js';

export const humanAgentFlow = addKeyword<any, any>(['5', 'asesor', 'contacto', 'humano', 'representante', 'secretaria'])
  .addAnswer(
    [
      '👥 *ATENCIÓN GREMIAL Y CONTACTO*',
      '_AEFIP Seccional Noroeste_',
      '━━━━━━━━━━━━━━━━━━━━━',
      '',
      '📍 *Sede Central:*',
      'Dirección: Salta / Jujuy',
      '⏰ *Horarios de Atención:*',
      'Lunes a Viernes de 08:00 a 16:00 hs.',
      '',
      '📞 *Canal Directo de Guardia / Asesor:*',
      `WhatsApp Directo: https://wa.me/${HUMAN_AGENT_PHONE}`,
      '',
      '🌐 *Portal Web Oficial:*',
      `👉 ${WEB_URL}`,
      '',
      '━━━━━━━━━━━━━━━━━━━━━',
      '💡 _Escribí *menu* o *0* para volver al menú principal._'
    ].join('\n')
  );
