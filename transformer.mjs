import fs from "fs";

const urls = [
  "https://aefipnoroeste.org.ar/images/logoBanner.png",
  "https://i.ibb.co/cLsgwT8/Don-Numas-Posada.webp",
  "https://i.ibb.co/TR2wddf/Hotel-La-linda.webp",
  "https://i.ibb.co/wB31YX9/Mirador-del-cerro.webp",
  "https://i.ibb.co/GRPQMyT/Hotel-plaza-de-las-aljabas.webp",
  "https://i.ibb.co/F3tgkwf/Hotel-bo.webp",
  "https://i.ibb.co/J5pBYPw/Hotel-termas-rosario-de-la-frontera.webp",
  "https://i.ibb.co/WFgvFT2/Caba-as-tia-moca.webp",
  "https://i.ibb.co/r4M1T5K/Caba-as-del-portal.webp",
  "https://i.ibb.co/F681WK4/Hotel-terrazas-del-lago.webp",
  "https://i.ibb.co/4Fy6Lq3/Hostal-Finca-las-Margaritas.webp",
  "https://aefipnoroeste.org.ar/images/Convenios/Salta/AmberSalta.png",
  "https://aefipnoroeste.org.ar/images/Convenios/Salta/CatalinaBliss.png",
  "https://aefipnoroeste.org.ar/images/Convenios/Salta/EsteticaGral.png",
  "https://aefipnoroeste.org.ar/images/Convenios/Salta/Figurella.png",
  "https://aefipnoroeste.org.ar/images/Convenios/Salta/HotelProvincial.png",
  "https://aefipnoroeste.org.ar/images/Convenios/Salta/Kadabra.png",
  "https://aefipnoroeste.org.ar/images/Convenios/Salta/LaMascoteraSal.png",
  "https://aefipnoroeste.org.ar/images/Convenios/Salta/PitagorasSal.png",
  "https://aefipnoroeste.org.ar/images/Convenios/Salta/ShineeSal.png",
  "https://aefipnoroeste.org.ar/images/Convenios/Salta/TulukaSal.png",
  "https://aefipnoroeste.org.ar/images/Convenios/Salta/U%C3%B1asVip.png",
  "https://i.ibb.co/2d2DKhd/Altos-del-vi-a.webp",
  "https://i.ibb.co/b3nVgwq/Hotel-Alvear.webp",
  "https://i.ibb.co/Yk0vsh6/ezgif-com-gif-maker.webp",
  "https://i.ibb.co/HKh5VwS/La-posada-del-rio.webp",
  "https://i.ibb.co/FwzBFHm/Hostal-de-altura.webp",
  "https://aefipnoroeste.org.ar/images/Convenios/Jujuy/BelhaJujuy.png",
  "https://aefipnoroeste.org.ar/images/Convenios/Jujuy/LaMascoteraJujuy.png",
  "https://aefipnoroeste.org.ar/images/Convenios/Jujuy/Ohasis.png",
  "https://aefipnoroeste.org.ar/images/Convenios/Jujuy/OpticaArena.png",
  "https://i.ibb.co/BGr4F84/Hotel-colonial.webp",
  "https://i.ibb.co/9HJKfzd/Los-carolinos.webp",
  "https://i.ibb.co/mHGgf3R/Bicentenario.webp",
  "https://aefipnoroeste.org.ar/images/Convenios/Tucuman/AtlasTuc.png",
  "https://aefipnoroeste.org.ar/images/Convenios/Tucuman/CeivacTuc.png",
  "https://aefipnoroeste.org.ar/images/Convenios/Tucuman/Hammer.png",
  "https://aefipnoroeste.org.ar/images/Convenios/Tucuman/Jockey.png",
  "https://aefipnoroeste.org.ar/images/Convenios/Tucuman/LaEstrellaTuc.png",
  "https://aefipnoroeste.org.ar/images/Convenios/Tucuman/LaEstrellaTuc2.png",
  "https://aefipnoroeste.org.ar/images/Convenios/Tucuman/LaMascoteraTuc.png",
  "https://aefipnoroeste.org.ar/images/Convenios/Tucuman/LaMerced.png",
  "https://aefipnoroeste.org.ar/images/Convenios/Tucuman/MadrasTuc.png",
  "https://aefipnoroeste.org.ar/images/Convenios/Tucuman/PranaTuc.png",
  "https://aefipnoroeste.org.ar/images/Convenios/Tucuman/Seu.png",
  "https://aefipnoroeste.org.ar/images/Convenios/Tucuman/Zimmerman.png",
  "https://i.ibb.co/TWYhGfF/Los-cardones.webp",
  "https://i.ibb.co/WPTScRG/hotel-bristol.webp",
  "https://i.ibb.co/yfP1wd3/Hipercell-logo.webp",
  "https://i.ibb.co/MRB2X2S/Cortassa-logo.webp",
  "https://i.ibb.co/FBk8JdK/Yanuzzi-optica.webp",
  "https://i.ibb.co/fGH8KCJ/Rema-autocare.webp",
  "https://i.ibb.co/6FC8N9W/Monitor-servicio-de-seguridad.webp",
  "https://i.ibb.co/CmyRQfz/CH-loreto.webp",
  "https://i.ibb.co/QMrPWkG/tuluka.webp",
  "https://i.ibb.co/kM017NR/Don-Ponciano.webp",
  "https://i.ibb.co/WzGq07t/Gula-club.webp",
  "https://i.ibb.co/P5MdZqM/tob-1.webp",
  "https://i.ibb.co/6Dzq1q2/Progresar-creditos.webp",
  "https://i.ibb.co/b224Sd8/logo-express.webp",
  "https://aefipnoroeste.org.ar/images/Convenios/Santiago/AtlanticaPin.png",
  "https://aefipnoroeste.org.ar/images/Convenios/Santiago/CalidoHotel.png",
  "https://aefipnoroeste.org.ar/images/Convenios/Santiago/CortassaSan.png",
  "https://aefipnoroeste.org.ar/images/Convenios/Santiago/ElMago.png",
  "https://aefipnoroeste.org.ar/images/Convenios/Santiago/Express.png",
  "https://aefipnoroeste.org.ar/images/Convenios/Santiago/HiperCell.png",
  "https://aefipnoroeste.org.ar/images/Convenios/Santiago/Ingenio.png",
  "https://aefipnoroeste.org.ar/images/Convenios/Santiago/LaMascoteraSgo.png",
  "https://aefipnoroeste.org.ar/images/Convenios/Santiago/LosCardones.png",
  "https://aefipnoroeste.org.ar/images/Convenios/Santiago/Montenegro.png",
  "https://aefipnoroeste.org.ar/images/Convenios/Santiago/TarjetaVitta.png",
  "https://aefipnoroeste.org.ar/images/Convenios/Santiago/TulukaFitness.png",
  "https://i.ibb.co/G5H9sqD/asispre.webp",
  "https://i.ibb.co/ZXq87sx/hotel-embajador.webp",
  "https://i.ibb.co/5rwt1Lw/Farmacia-inca.webp",
  "https://i.ibb.co/fxVLzsW/el-malik.webp",
  "https://i.ibb.co/WkNswmK/logo-san-pablo-T.webp",
  "https://i.ibb.co/Gvr6jcc/siglo-21-logo.webp",
  "https://i.ibb.co/4J6fNxg/unsta-logo.webp",
  "https://aefipnoroeste.org.ar/images/Convenios/Catamarca/AutoSpa.png",
  "https://aefipnoroeste.org.ar/images/Convenios/Catamarca/Cortassa.png",
  "https://aefipnoroeste.org.ar/images/Convenios/Catamarca/DesdeElAlma.png",
  "https://aefipnoroeste.org.ar/images/Convenios/Catamarca/GiroDidac.png",
  "https://aefipnoroeste.org.ar/images/Convenios/Catamarca/LaBagual.png",
  "https://aefipnoroeste.org.ar/images/Convenios/Catamarca/LaVinoteca.png",
  "https://aefipnoroeste.org.ar/images/Convenios/Catamarca/ManIndumentaria.png",
  "https://aefipnoroeste.org.ar/images/Convenios/Catamarca/NoaCat.png",
];

function determineCategory(url) {
  url = url.toLowerCase();
  if (url.includes("/salta/")) return "Salta";
  if (url.includes("/jujuy/")) return "Jujuy";
  if (url.includes("/tucuman/")) return "Tucumán";
  if (url.includes("/santiago/")) return "Santiago del Estero";
  if (url.includes("/catamarca/")) return "Catamarca";

  // Guess based on name for i.ibb.co links (from subagent report)
  if (
    url.includes("numas") ||
    url.includes("linda") ||
    url.includes("mirador") ||
    url.includes("aljabas") ||
    url.includes("bo.webp") ||
    url.includes("termas") ||
    url.includes("moca") ||
    url.includes("portal") ||
    url.includes("terrazas") ||
    url.includes("margaritas")
  ) {
    return "Salta";
  }
  if (
    url.includes("vi-a") ||
    url.includes("alvear") ||
    url.includes("ezgif") ||
    url.includes("posada-del-rio") ||
    url.includes("hostal-de-altura")
  ) {
    return "Jujuy";
  }
  if (
    url.includes("colonial") ||
    url.includes("carolinos") ||
    url.includes("bicentenario")
  ) {
    return "Santiago del Estero";
  }
  if (
    url.includes("bristol") ||
    url.includes("hipercell") ||
    url.includes("cortassa") ||
    url.includes("yanuzzi") ||
    url.includes("rema") ||
    url.includes("monitor") ||
    url.includes("loreto") ||
    url.includes("tuluka.webp") ||
    url.includes("ponciano") ||
    url.includes("gula") ||
    url.includes("tob-") ||
    url.includes("progresar") ||
    url.includes("express") ||
    url.includes("pablo") ||
    url.includes("siglo") ||
    url.includes("unsta") ||
    url.includes("cardones")
  ) {
    return "Tucumán";
  }

  return "General";
}

function extractName(url) {
  const parts = url.split("/");
  let filename = parts[parts.length - 1];
  filename = decodeURIComponent(filename);
  filename = filename.replace(/\.(png|webp|jpg|jpeg|gif)$/i, "");
  filename = filename.replace(/-/g, " ");
  filename = filename.replace(/([A-Z])/g, " $1").trim();
  filename = filename.replace(/logo/gi, "").trim();
  // Capitalize first letter of each word
  return filename
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

const beneficios = urls
  .filter(
    (u) => !u.includes("logoBanner.png") && !u.includes("ezgif-com-gif-maker"),
  )
  .map((url, i) => {
    const title = extractName(url);
    const category = determineCategory(url);

    return {
      id: i + 1,
      title: title || "Beneficio",
      category: category,
      thumbnail: url,
      short_description: "Beneficio exclusivo para afiliados.",
      mail: "",
      telephone: "",
    };
  });

// Since the new data structure needs to be put into mockData.ts
// Output the code snippet to be injected

const output =
  "export const dataBeneficios: Beneficio[] = " +
  JSON.stringify(beneficios, null, 2).replace(/"([^"]+)":/g, "$1:") +
  ";";

fs.writeFileSync("generated_beneficios.ts", output);
console.log("Written to generated_beneficios.ts");
