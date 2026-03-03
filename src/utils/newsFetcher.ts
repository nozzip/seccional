export interface NewsItem {
  title: string;
  link: string;
  date: string;
  imgUrl: string;
  summary: string;
}

export async function fetchLatestNews(): Promise<NewsItem[]> {
  try {
    const rssUrl = "https://www.aefip.org.ar/prensa?format=feed&type=rss";
    // Using CodeTabs CORS proxy
    const response = await fetch(
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(rssUrl)}`,
    );

    if (!response.ok) {
      throw new Error("Failed to fetch RSS feed");
    }

    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");

    const items = Array.from(xmlDoc.querySelectorAll("item")).slice(0, 10);

    return items.map((item) => {
      const title = item.querySelector("title")?.textContent || "Sin Título";
      const link = item.querySelector("link")?.textContent || "#";
      const pubDate = item.querySelector("pubDate")?.textContent;

      // Parse the date to a more readable format (e.g., DD/MM/YYYY)
      let formattedDate = "Fecha desconocida";
      if (pubDate) {
        const dateObj = new Date(pubDate);
        if (!isNaN(dateObj.getTime())) {
          formattedDate = dateObj.toLocaleDateString("es-AR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        }
      }

      const description = item.querySelector("description")?.textContent || "";

      // Extract the first image src from the HTML description
      const imgMatch = description.match(/<img[^>]+src="([^">]+)"/i);
      let imgUrl =
        imgMatch && imgMatch[1] !== "https://www.aefip.org.ar/"
          ? imgMatch[1]
          : "";

      // Ensure absolute URL for AEFIP images if they use relative paths
      if (imgUrl && imgUrl.startsWith("/")) {
        imgUrl = `https://www.aefip.org.ar${imgUrl}`;
      }

      // If no image is found, use a fallback image from our public folder or empty
      if (!imgUrl) {
        imgUrl = "/seccionalLogo2.png"; // Fallback
      }

      // Clean the HTML description to create a plain text summary
      // 1. Remove img tags
      let cleanSummary = description.replace(/<img[^>]*>/g, "");
      // 2. Remove all other HTML tags
      cleanSummary = cleanSummary.replace(/<[^>]+>/g, " ");
      // 3. Decode HTML entities (basic) & clean whitespace
      cleanSummary = cleanSummary
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      // Truncate to ~150 chars
      if (cleanSummary.length > 150) {
        cleanSummary = cleanSummary.substring(0, 150) + "...";
      }

      return {
        title,
        link,
        date: formattedDate,
        imgUrl,
        summary: cleanSummary,
      };
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}
