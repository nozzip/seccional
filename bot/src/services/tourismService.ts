import { supabase, WEB_URL } from '../config/supabase.js';

export interface CabinPricing {
  affiliate?: number | string;
  guest?: number | string;
  deposit?: number | string;
  details?: string;
}

/**
 * Obtiene la información y tarifas de cabañas del predio
 */
export async function getTourismInfo(): Promise<{ prices: any; rawInfo: string }> {
  try {
    const { data } = await supabase
      .from('system_configs')
      .select('value')
      .eq('key', 'cabin_prices')
      .single();

    return {
      prices: data?.value || null,
      rawInfo: '',
    };
  } catch (err) {
    console.error('Error fetching tourism info:', err);
    return { prices: null, rawInfo: '' };
  }
}

/**
 * Formatea la información de Turismo y Cabañas para WhatsApp
 */
export function formatTourismForWhatsApp(pricesData: any): string {
  let text = `🏕️ *PREDIO RECREATIVO Y CABAÑAS*\n`;
  text += `_AEFIP Seccional Noroeste_\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  text += `📍 *Ubicación e Instalaciones:*\n`;
  text += `El predio cuenta con cabañas totalmente equipadas, piscina, quinchos con asadores, canchas deportivas y amplios espacios verdes.\n\n`;

  text += `💰 *Tarifas Estimadas:* \n`;
  if (pricesData) {
    if (typeof pricesData === 'object') {
      for (const [key, val] of Object.entries(pricesData)) {
        text += `• *${key.replace(/_/g, ' ').toUpperCase()}:* $${val}\n`;
      }
    } else {
      text += `• ${pricesData}\n`;
    }
  } else {
    text += `• Consultar promociones de temporada y descuentos por día para afiliados y grupo familiar directo.\n`;
  }

  text += `\n📋 *Requisitos de Reserva:*\n`;
  text += `1. Ser afiliado/a titular activo/a.\n`;
  text += `2. Completar la solicitud de reserva online con anticipación.\n`;
  text += `3. Confirmación sujeta a disponibilidad de fechas.\n\n`;

  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `📅 *Para consultar disponibilidad y solicitar tu reserva:*\n`;
  text += `👉 ${WEB_URL}/#/turismo\n\n`;
  text += `📲 _O comunicate con la secretaría de turismo de la seccional._`;

  return text;
}
