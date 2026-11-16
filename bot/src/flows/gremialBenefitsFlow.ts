import { addKeyword } from '@builderbot/bot';
import { supabase, WEB_URL } from '../config/supabase.js';

export const gremialBenefitsFlow = addKeyword<any, any>([
  '3',
  'beneficios gremiales',
  'gremiales',
  'establecimientos',
  'servicios',
  'san lorenzo',
  'azucena',
  'subsidios',
  'ayudas',
  'turismo',
  'predio',
])
  .addAnswer(
    [
      '🏛️ *BENEFICIOS GREMIALES - AEFIP NOROESTE*',
      '_Establecimientos y Servicios Gremiales_',
      '━━━━━━━━━━━━━━━━━━━━━',
      '',
      'Elegí una opción para ver información detallada:',
      '',
      '1️⃣ 🏡 *Predio San Lorenzo (Salta)* (Instalaciones, pileta, canchas y asadores)',
      '2️⃣ 🏨 *Hotel Azucena (Tafí del Valle, Tucumán)* (Hospedaje y confort)',
      '3️⃣ 💰 *Subsidios y Ayudas Sociales* (Nacimiento, Matrimonio, Adopción, Jubilación)',
      '4️⃣ 🌐 *Ver todos los servicios en la Web*',
      '',
      '━━━━━━━━━━━━━━━━━━━━━',
      '✍️ _Respondé con el número de tu opción (1 al 4) o *0* para volver al menú_'
    ].join('\n'),
    { capture: true },
    async (ctx: any, { flowDynamic, fallBack }: any) => {
      const input = ctx.body?.trim().toLowerCase();

      if (!input || input === '0' || input === 'menu' || input === 'cancelar' || input === 'volver') {
        return;
      }

      switch (input) {
        case '1':
        case 'san lorenzo':
        case 'predio': {
          const text = [
            '🏡 *PREDIO RECREATIVO SAN LORENZO (SALTA)*',
            '_AEFIP Seccional Noroeste_',
            '━━━━━━━━━━━━━━━━━━━━━',
            '',
            '📍 *Ubicación:* Quebrada de San Lorenzo, Salta.',
            '',
            '🌿 *Instalaciones y Servicios:*',
            '• Quinchos y asadores familiares totalmente equipados.',
            '• Pileta de natación olímpica y recreativa (temporada de verano).',
            '• Canchas de fútbol, básquet, tenis y pádel.',
            '• Salón de usos múltiples para eventos de afiliados.',
            '',
            '📲 *Reservas y Consulta de Tarifas:*',
            `👉 ${WEB_URL}/#/turismo`,
            '',
            '━━━━━━━━━━━━━━━━━━━━━',
            '💡 _Escribí *menu* o *0* para volver al menú principal._'
          ].join('\n');
          return await flowDynamic(text);
        }

        // TODO: Revisar para eliminar — case 'warmi' removido por solicitud de retiro de publicidad

        case '2':
        case 'azucena':
        case 'hotel': {
          const text = [
            '🏨 *HOTEL AZUCENA (TAFÍ DEL VALLE - TUCUMÁN)*',
            '_Hospedaje y descanso en los Valles Calchaquíes_',
            '━━━━━━━━━━━━━━━━━━━━━',
            '',
            '📍 *Ubicación:* Tafí del Valle, Tucumán.',
            '',
            '✨ *Servicios y Confort:*',
            '• Habitaciones dobles, triples y familiares con baño privado.',
            '• Desayuno regional incluido.',
            '• Calefacción central, Wi-Fi y estacionamiento propio.',
            '• Excelente ubicación céntrica con acceso a circuitos turísticos.',
            '',
            '📲 *Información y Reservas:*',
            `👉 ${WEB_URL}/#/turismo`,
            '',
            '━━━━━━━━━━━━━━━━━━━━━',
            '💡 _Escribí *menu* o *0* para volver al menú principal._'
          ].join('\n');
          return await flowDynamic(text);
        }

        case '3':
        case 'subsidios':
        case 'ayudas': {
          const text = [
            '💰 *SUBSIDIOS Y AYUDAS SOCIALES GREMIALES*',
            '_Beneficios exclusivos para afiliados/as de AEFIP_',
            '━━━━━━━━━━━━━━━━━━━━━',
            '',
            '💍 *Matrimonio / Luna de Miel:*',
            '• *7 días de estadía gratis para dos* en temporada baja en hoteles sindicales: Bariloche (Hotel Peumayen), Mar del Plata (Hotel Concord), CABA (Hotel Da Vinci) o Cabañas en Necochea (validez: 1 año).',
            '',
            '🥈 *Bodas de Plata (25 años):*',
            '• *7 días de estadía gratis para dos* en temporada baja en la red hotelera sindical.',
            '',
            '👶 *Kit de Nacimiento:*',
            '• Ajuar completo con productos de primera calidad para el recién nacido.',
            '',
            '🤝 *Adopción:*',
            '• Ayuda económica equivalente o kit de nacimiento a elección.',
            '',
            '🎖️ *Jubilación:*',
            '• *7 días de estadía gratis para dos* en hoteles sindicales para celebrar esta nueva etapa.',
            '',
            '📝 *Gestión y Trámites:*',
            '📩 Email de Sociales: *sociales@aefip.org.ar*',
            `🌐 Más información: ${WEB_URL}/#/gremio`,
            '',
            '━━━━━━━━━━━━━━━━━━━━━',
            '💡 _Escribí *menu* o *0* para volver al menú principal._'
          ].join('\n');
          return await flowDynamic(text);
        }

        case '4':
        case 'web': {
          const text = [
            '🌐 *SERVICIOS Y BENEFICIOS GREMIALES EN LA WEB*',
            '━━━━━━━━━━━━━━━━━━━━━',
            '',
            `🏕️ *Turismo y Establecimientos:* ${WEB_URL}/#/turismo`,
            `🏛️ *Subsidios y Acción Social:* ${WEB_URL}/#/gremio`,
            `🏷️ *Convenios Comerciales:* ${WEB_URL}/#/convenios`,
            '',
            '💡 _Escribí *menu* o *0* para volver al menú principal._'
          ].join('\n');
          return await flowDynamic(text);
        }

        default:
          return fallBack('⚠️ Opción no reconocida. Por favor, respondé con un número del *1 al 4* (o *0* para volver al menú):');
      }
    }
  );
