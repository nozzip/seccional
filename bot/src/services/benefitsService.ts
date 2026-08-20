import { supabase, WEB_URL } from '../config/supabase.js';

export interface Benefit {
  id?: number | string;
  name?: string;
  title?: string;
  category?: string; // Provincia o General
  rubro?: string;
  discount?: string;
  description?: string;
  address?: string;
  phone?: string;
  location?: string;
}

/**
 * Obtiene la lista de rubros/categorías disponibles
 */
export async function getBenefitCategories(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('benefit_categories')
      .select('name')
      .order('name');

    if (error || !data || data.length === 0) {
      // Fallback a los rubros más comunes
      return ['Farmacias', 'Gimnasios', 'Hotelería y Turismo', 'Comercios', 'Gastronomía', 'Salud'];
    }

    return data.map((c) => c.name).filter(Boolean);
  } catch (err) {
    console.error('Error fetching benefit categories:', err);
    return ['Farmacias', 'Gimnasios', 'Hotelería y Turismo', 'Comercios', 'Gastronomía', 'Salud'];
  }
}

/**
 * Busca beneficios por término clave (nombre, rubro, ciudad)
 */
export async function searchBenefits(query: string, province?: string): Promise<Benefit[]> {
  try {
    let q = supabase.from('benefits').select('*');

    if (province && province.toLowerCase() !== 'todas' && province.toLowerCase() !== 'general') {
      q = q.ilike('category', `%${province}%`);
    }

    if (query && query.trim() !== '') {
      q = q.or(`title.ilike.%${query}%,name.ilike.%${query}%,rubro.ilike.%${query}%,description.ilike.%${query}%`);
    }

    const { data, error } = await q.limit(6);
    if (error) throw error;
    return (data || []) as Benefit[];
  } catch (err) {
    console.error('Error searching benefits:', err);
    return [];
  }
}

/**
 * Formatea una lista de beneficios para WhatsApp
 */
export function formatBenefitsForWhatsApp(benefits: Benefit[], queryContext?: string): string {
  if (!benefits || benefits.length === 0) {
    return `🔍 *No se encontraron convenios* para la búsqueda${queryContext ? ` "${queryContext}"` : ''}.\n\nPuedes consultar todos los convenios actualizados en nuestra web:\n👉 ${WEB_URL}/#/convenios`;
  }

  let text = `🏷️ *CONVENIOS Y BENEFICIOS ENCONTRADOS*:\n`;
  if (queryContext) {
    text += `_Resultados para: ${queryContext}_\n`;
  }
  text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  benefits.forEach((b, index) => {
    const name = b.title || b.name || 'Comercio Adherido';
    const discount = b.discount ? `💥 *${b.discount}*` : '';
    const rubro = b.rubro ? `📁 _${b.rubro}_` : '';
    const prov = b.category ? `📍 ${b.category}` : '';
    const address = b.address ? `🏠 ${b.address}` : '';
    const phone = b.phone ? `📞 ${b.phone}` : '';

    text += `*${index + 1}. ${name}*\n`;
    if (discount) text += `   ${discount}\n`;
    if (rubro || prov) text += `   ${rubro} ${prov ? `(${prov})` : ''}\n`;
    if (address) text += `   ${address}\n`;
    if (phone) text += `   ${phone}\n`;
    if (b.description) text += `   ℹ️ ${b.description.slice(0, 100)}${b.description.length > 100 ? '...' : ''}\n`;
    text += `\n`;
  });

  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `📲 _Presentá tu carnet digital para acceder a los descuentos._\n`;
  text += `🌐 Ver todos los beneficios: ${WEB_URL}/#/convenios`;

  return text;
}
