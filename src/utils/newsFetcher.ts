import { supabase } from "../supabaseClient";

export interface NewsItem {
  id?: string;
  title: string;
  link: string;
  date: string;
  imgUrl: string;
  summary: string;
  isLocal?: boolean;
  content?: string;
}

async function fetchRssNews(): Promise<NewsItem[]> {
  try {
    const rssUrl = "https://www.aefip.org.ar/prensa?format=feed&type=rss";
    const response = await fetch(
      `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`,
    );

    if (!response.ok) throw new Error("Failed to fetch RSS feed");

    const data = await response.json();
    if (!data || !data.items) return [];

    const items = data.items.slice(0, 10);

    return items.map((item: any) => {
      const title = item.title || "Sin Título";
      const link = item.link || "#";
      const pubDate = item.pubDate;

      let formattedDate = "Fecha desconocida";
      if (pubDate) {
        const dateObj = new Date(pubDate.replace(" ", "T"));
        if (!isNaN(dateObj.getTime())) {
          formattedDate = dateObj.toLocaleDateString("es-AR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        }
      }

      const description = item.description || item.content || "";
      
      let imgUrl = item.thumbnail || "";
      if (!imgUrl) {
         const imgMatch = description.match(/<img[^>]+src="([^">]+)"/i);
         imgUrl = imgMatch && imgMatch[1] !== "https://www.aefip.org.ar/" ? imgMatch[1] : "";
      }

      if (imgUrl && imgUrl.startsWith("/")) {
        imgUrl = `https://www.aefip.org.ar${imgUrl}`;
      }

      if (!imgUrl) imgUrl = "/seccionalLogo2.png";

      let cleanSummary = description.replace(/<img[^>]*>/g, "");
      cleanSummary = cleanSummary.replace(/<[^>]+>/g, " ");
      cleanSummary = cleanSummary
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (cleanSummary.length > 150) {
        cleanSummary = cleanSummary.substring(0, 150) + "...";
      }

      return {
        id: link,
        title,
        link,
        date: formattedDate,
        imgUrl,
        summary: cleanSummary,
        isLocal: false,
      };
    });
  } catch (error) {
    console.error("RSS Fetch Error:", error);
    return [];
  }
}

export async function fetchLatestNews(): Promise<NewsItem[]> {
  try {
    // 1. Fetch RSS
    const rssNews = await fetchRssNews();

    // 2. Fetch Supabase News
    const { data: dbNews, error } = await supabase
      .from("news")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("DB News Fetch Error:", error);
      return rssNews;
    }

    const localNews: NewsItem[] = (dbNews || []).map((item) => ({
      id: item.id,
      title: item.title,
      link: item.link || `/prensa/${item.id}`,
      date: new Date(item.created_at).toLocaleDateString("es-AR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      imgUrl: item.img_url || "",
      summary: item.summary || "",
      content: item.content || "",
      isLocal: true,
    }));

    // 3. Merge (Local news first)
    return [...localNews, ...rssNews];
  } catch (error) {
    console.error("General Fetch Error:", error);
    return [];
  }
}
