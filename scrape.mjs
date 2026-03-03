import fs from "fs";

async function scrape() {
  try {
    const res = await fetch("https://aefipnoroeste.org.ar/Beneficios", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    const html = await res.text();

    // Find all image tags
    const imgs = html.match(/<img[^>]+src="([^">]+)"/gi) || [];

    let srcs = imgs
      .map((img) => {
        const match = img.match(/src="([^">]+)"/i);
        if (match) {
          let src = match[1];
          if (!src.startsWith("http")) {
            src = src.startsWith("/")
              ? `https://aefipnoroeste.org.ar${src}`
              : `https://aefipnoroeste.org.ar/${src}`;
          }
          return src;
        }
        return null;
      })
      .filter(Boolean);

    // Filter out common UI images to just leave the potential benefit images
    srcs = srcs.filter((src) => {
      const lowerSrc = src.toLowerCase();
      return (
        !lowerSrc.includes("logo") &&
        !lowerSrc.includes("icon") &&
        !lowerSrc.includes("footer") &&
        !lowerSrc.includes("header")
      );
    });

    console.log("Found images:", srcs.length);
    fs.writeFileSync("scraped_images.json", JSON.stringify(srcs, null, 2));
  } catch (e) {
    console.error("Fetch error:", e.message);
  }
}
scrape();
