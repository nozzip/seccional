import { addKeyword } from '@builderbot/bot';
import { getLatestNews, formatNewsForWhatsApp } from '../services/newsService.js';

export const newsFlow = addKeyword<any, any>(['2', 'noticias', 'prensa', 'comunicados', 'novedades'])
  .addAnswer('⏳ *Buscando los últimos comunicados de prensa...*', null, async (_ctx: any, { flowDynamic }: any) => {
    try {
      const news = await getLatestNews(3);
      const text = formatNewsForWhatsApp(news);
      await flowDynamic(text);
    } catch (e) {
      await flowDynamic('❌ Ocurrió un error al obtener las noticias. Intenta nuevamente más tarde.');
    }
  })
  .addAnswer([
    '💡 _Escribí *menu* o *0* para volver al menú principal._'
  ].join('\n'));
