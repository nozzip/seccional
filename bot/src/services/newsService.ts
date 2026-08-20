import { supabase, WEB_URL } from '../config/supabase.js';

export interface NewsArticle {
  id: string | number;
  title: string;
  link?: string;
  summary?: string;
  created_at?: string;
  dateStr?: string;
}

/**
 * Obtiene las últimas novedades y noticias de la Seccional
 */
export async function getLatestNews(limit: number = 3): Promise<NewsArticle[]> {
  try {
    const { data, error } = await supabase
      .from('news')
      .select('id, title, summary, link, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data || data.length === 0) {
      return [];
    }

    return data.map((item) => {
      const date = item.created_at ? new Date(item.created_at) : new Date();
      return {
        id: item.id,
        title: item.title,
        summary: item.summary,
        link: item.link || `${WEB_URL}/#/prensa/${item.id}`,
        dateStr: date.toLocaleDateString('es-AR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
      };
    });
  } catch (err) {
    console.error('Error fetching news:', err);
    return [];
  }
}

/**
 * Formatea las noticias para WhatsApp
 */
export function formatNewsForWhatsApp(newsList: NewsArticle[]): string {
  if (!newsList || newsList.length === 0) {
    return `📰 *PRENSA Y NOVEDADES*\n\nNo hay comunicados recientes cargados en el sistema en este momento.\n\nPuedes consultar la sección de Prensa en:\n👉 ${WEB_URL}/#/prensa`;
  }

  let text = `📰 *ÚLTIMAS NOVEDADES Y COMUNICADOS*\n`;
  text += `_AEFIP Seccional Noroeste_\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  newsList.forEach((n, idx) => {
    text += `*${idx + 1}. ${n.title}*\n`;
    if (n.dateStr) text += `   📅 _${n.dateStr}_\n`;
    if (n.summary) {
      const cleanSummary = n.summary.replace(/<[^>]+>/g, '').trim();
      text += `   📄 ${cleanSummary.slice(0, 120)}${cleanSummary.length > 120 ? '...' : ''}\n`;
    }
    if (n.link) text += `   🔗 Leer más: ${n.link}\n`;
    text += `\n`;
  });

  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `🌐 Ver todas las noticias: ${WEB_URL}/#/prensa`;

  return text;
}
