export interface DataItem {
  id: number;
  title: string;
  thumbnail: string;
  short_description?: string;
}

export interface Beneficio extends DataItem {
  category: string;
  mail?: string;
  telephone?: string;
  discount_percentage?: number | null;
  rubro?: string;
  images?: string[];
  telephone_type?: 'fixed' | 'whatsapp' | string;
  contact_person?: string;
  address?: string;
  discount_description?: string;
  is_active?: boolean;
  display_order?: number;
}

export interface Noticia extends DataItem {
  subtitle?: string;
  titulo?: string;
  subtitulo?: string;
  texto?: string;
  date?: string;
}

export interface Photo {
  src: string;
  width: number;
  height: number;
  title?: string;
}

export const dataCarusel: DataItem[] = [
  {
    id: 1,
    title: "",
    thumbnail: "https://i.imgur.com/uECOaEP.png",
    short_description: "",
  },
  {
    id: 2,
    title: "",
    thumbnail: "https://i.imgur.com/7D0zraW.png",
    short_description: "",
  },
  {
    id: 3,
    title: "",
    thumbnail: "https://i.imgur.com/WXlphHs.png",
    short_description: "",
  },
];

export const dataBeneficios: Beneficio[] = [
  {
    id: 1,
    title: "Don  Numas  Posada",
    category: "Salta",
    thumbnail: "https://i.ibb.co/cLsgwT8/Don-Numas-Posada.webp",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
    discount_percentage: 20,
  },
  {
    id: 2,
    title: "Hotel  La Linda",
    category: "Salta",
    thumbnail: "https://i.ibb.co/TR2wddf/Hotel-La-linda.webp",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
    discount_percentage: 15,
  },
  {
    id: 3,
    title: "Mirador Del Cerro",
    category: "Salta",
    thumbnail: "https://i.ibb.co/wB31YX9/Mirador-del-cerro.webp",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 4,
    title: "Hotel Plaza De Las Aljabas",
    category: "Salta",
    thumbnail: "https://i.ibb.co/GRPQMyT/Hotel-plaza-de-las-aljabas.webp",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 5,
    title: "Hotel Bo",
    category: "Salta",
    thumbnail: "https://i.ibb.co/F3tgkwf/Hotel-bo.webp",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 6,
    title: "Hotel Termas Rosario De La Frontera",
    category: "Salta",
    thumbnail:
      "https://i.ibb.co/J5pBYPw/Hotel-termas-rosario-de-la-frontera.webp",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 7,
    title: "Caba As Tia Moca",
    category: "Salta",
    thumbnail: "https://i.ibb.co/WFgvFT2/Caba-as-tia-moca.webp",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 8,
    title: "Caba As Del Portal",
    category: "Salta",
    thumbnail: "https://i.ibb.co/r4M1T5K/Caba-as-del-portal.webp",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 9,
    title: "Hotel Terrazas Del Lago",
    category: "Salta",
    thumbnail: "https://i.ibb.co/F681WK4/Hotel-terrazas-del-lago.webp",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 10,
    title: "Hostal  Finca Las  Margaritas",
    category: "Salta",
    thumbnail: "https://i.ibb.co/4Fy6Lq3/Hostal-Finca-las-Margaritas.webp",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 11,
    title: "Amber Salta",
    category: "Salta",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Salta/AmberSalta.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 12,
    title: "Catalina Bliss",
    category: "Salta",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Salta/CatalinaBliss.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 13,
    title: "Estetica Gral",
    category: "Salta",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Salta/EsteticaGral.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 14,
    title: "Figurella",
    category: "Salta",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Salta/Figurella.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 15,
    title: "Hotel Provincial",
    category: "Salta",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Salta/HotelProvincial.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 16,
    title: "Kadabra",
    category: "Salta",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Salta/Kadabra.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 17,
    title: "La Mascotera Sal",
    category: "Salta",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Salta/LaMascoteraSal.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 18,
    title: "Pitagoras Sal",
    category: "Salta",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Salta/PitagorasSal.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 19,
    title: "Shinee Sal",
    category: "Salta",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Salta/ShineeSal.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 20,
    title: "Tuluka Sal",
    category: "Salta",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Salta/TulukaSal.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 21,
    title: "Uñas Vip",
    category: "Salta",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Salta/U%C3%B1asVip.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 22,
    title: "Altos Del Vi A",
    category: "Jujuy",
    thumbnail: "https://i.ibb.co/2d2DKhd/Altos-del-vi-a.webp",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 23,
    title: "Hotel  Alvear",
    category: "Jujuy",
    thumbnail: "https://i.ibb.co/b3nVgwq/Hotel-Alvear.webp",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 24,
    title: "La Posada Del Rio",
    category: "Jujuy",
    thumbnail: "https://i.ibb.co/HKh5VwS/La-posada-del-rio.webp",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 25,
    title: "Hostal De Altura",
    category: "Jujuy",
    thumbnail: "https://i.ibb.co/FwzBFHm/Hostal-de-altura.webp",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 26,
    title: "Belha Jujuy",
    category: "Jujuy",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Jujuy/BelhaJujuy.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 27,
    title: "La Mascotera Jujuy",
    category: "Jujuy",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Jujuy/LaMascoteraJujuy.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 28,
    title: "Ohasis",
    category: "Jujuy",
    thumbnail: "https://aefipnoroeste.org.ar/images/Convenios/Jujuy/Ohasis.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 29,
    title: "Optica Arena",
    category: "Jujuy",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Jujuy/OpticaArena.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 30,
    title: "Hotel Colonial",
    category: "Santiago del Estero",
    thumbnail: "https://i.ibb.co/BGr4F84/Hotel-colonial.webp",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 31,
    title: "Los Carolinos",
    category: "Santiago del Estero",
    thumbnail: "https://i.ibb.co/9HJKfzd/Los-carolinos.webp",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 32,
    title: "Bicentenario",
    category: "Santiago del Estero",
    thumbnail: "https://i.ibb.co/mHGgf3R/Bicentenario.webp",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 33,
    title: "Atlas Tuc",
    category: "Tucumán",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Tucuman/AtlasTuc.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 34,
    title: "Ceivac Tuc",
    category: "Tucumán",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Tucuman/CeivacTuc.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 35,
    title: "Hammer",
    category: "Tucumán",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Tucuman/Hammer.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 36,
    title: "Jockey",
    category: "Tucumán",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Tucuman/Jockey.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 37,
    title: "La Estrella Tuc",
    category: "Tucumán",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Tucuman/LaEstrellaTuc.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 38,
    title: "La Estrella Tuc2",
    category: "Tucumán",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Tucuman/LaEstrellaTuc2.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 39,
    title: "La Mascotera Tuc",
    category: "Tucumán",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Tucuman/LaMascoteraTuc.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 40,
    title: "La Merced",
    category: "Tucumán",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Tucuman/LaMerced.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 41,
    title: "Madras Tuc",
    category: "Tucumán",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Tucuman/MadrasTuc.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 42,
    title: "Prana Tuc",
    category: "Tucumán",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Tucuman/PranaTuc.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 43,
    title: "Seu",
    category: "Tucumán",
    thumbnail: "https://aefipnoroeste.org.ar/images/Convenios/Tucuman/Seu.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 44,
    title: "Zimmerman",
    category: "Tucumán",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Tucuman/Zimmerman.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 45,
    title: "Los Cardones",
    category: "Tucumán",
    thumbnail: "https://i.ibb.co/TWYhGfF/Los-cardones.webp",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 46,
    title: "Hotel Bristol",
    category: "Tucumán",
    thumbnail: "https://i.ibb.co/WPTScRG/hotel-bristol.webp",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 47,
    title: "Hipercell",
    category: "Tucumán",
    thumbnail: "https://i.ibb.co/yfP1wd3/Hipercell-logo.webp",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 48,
    title: "Cortassa",
    category: "Tucumán",
    thumbnail: "https://i.ibb.co/MRB2X2S/Cortassa-logo.webp",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 49,
    title: "Yanuzzi Optica",
    category: "Tucumán",
    thumbnail: "https://i.ibb.co/FBk8JdK/Yanuzzi-optica.webp",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 50,
    title: "Rema Autocare",
    category: "Tucumán",
    thumbnail: "https://i.ibb.co/fGH8KCJ/Rema-autocare.webp",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 51,
    title: "Monitor Servicio De Seguridad",
    category: "Tucumán",
    thumbnail: "https://i.ibb.co/6FC8N9W/Monitor-servicio-de-seguridad.webp",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 52,
    title: "C H Loreto",
    category: "Tucumán",
    thumbnail: "https://i.ibb.co/CmyRQfz/CH-loreto.webp",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 53,
    title: "Tuluka",
    category: "Tucumán",
    thumbnail: "https://i.ibb.co/QMrPWkG/tuluka.webp",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 54,
    title: "Don  Ponciano",
    category: "Tucumán",
    thumbnail: "https://i.ibb.co/kM017NR/Don-Ponciano.webp",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 55,
    title: "Gula Club",
    category: "Tucumán",
    thumbnail: "https://i.ibb.co/WzGq07t/Gula-club.webp",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 56,
    title: "Tob 1",
    category: "Tucumán",
    thumbnail: "https://i.ibb.co/P5MdZqM/tob-1.webp",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 57,
    title: "Progresar Creditos",
    category: "Tucumán",
    thumbnail: "https://i.ibb.co/6Dzq1q2/Progresar-creditos.webp",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 58,
    title: "Express",
    category: "Tucumán",
    thumbnail: "https://i.ibb.co/b224Sd8/logo-express.webp",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 59,
    title: "Atlantica Pin",
    category: "Santiago del Estero",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Santiago/AtlanticaPin.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 60,
    title: "Calido Hotel",
    category: "Santiago del Estero",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Santiago/CalidoHotel.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 61,
    title: "Cortassa San",
    category: "Santiago del Estero",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Santiago/CortassaSan.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 62,
    title: "El Mago",
    category: "Santiago del Estero",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Santiago/ElMago.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 63,
    title: "Express",
    category: "Santiago del Estero",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Santiago/Express.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 64,
    title: "Hiper Cell",
    category: "Santiago del Estero",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Santiago/HiperCell.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 65,
    title: "Ingenio",
    category: "Santiago del Estero",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Santiago/Ingenio.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 66,
    title: "La Mascotera Sgo",
    category: "Santiago del Estero",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Santiago/LaMascoteraSgo.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 67,
    title: "Los Cardones",
    category: "Santiago del Estero",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Santiago/LosCardones.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 68,
    title: "Montenegro",
    category: "Santiago del Estero",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Santiago/Montenegro.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 69,
    title: "Tarjeta Vitta",
    category: "Santiago del Estero",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Santiago/TarjetaVitta.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 70,
    title: "Tuluka Fitness",
    category: "Santiago del Estero",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Santiago/TulukaFitness.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 71,
    title: "Asispre",
    category: "General",
    thumbnail: "https://i.ibb.co/G5H9sqD/asispre.webp",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 72,
    title: "Hotel Embajador",
    category: "General",
    thumbnail: "https://i.ibb.co/ZXq87sx/hotel-embajador.webp",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 73,
    title: "Farmacia Inca",
    category: "General",
    thumbnail: "https://i.ibb.co/5rwt1Lw/Farmacia-inca.webp",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 74,
    title: "El Malik",
    category: "General",
    thumbnail: "https://i.ibb.co/fxVLzsW/el-malik.webp",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 75,
    title: "San Pablo  T",
    category: "Tucumán",
    thumbnail: "https://i.ibb.co/WkNswmK/logo-san-pablo-T.webp",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 76,
    title: "Siglo 21",
    category: "Tucumán",
    thumbnail: "https://i.ibb.co/Gvr6jcc/siglo-21-logo.webp",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 77,
    title: "Unsta",
    category: "Tucumán",
    thumbnail: "https://i.ibb.co/4J6fNxg/unsta-logo.webp",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 78,
    title: "Auto Spa",
    category: "Catamarca",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Catamarca/AutoSpa.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 79,
    title: "Cortassa",
    category: "Catamarca",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Catamarca/Cortassa.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 80,
    title: "Desde El Alma",
    category: "Catamarca",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Catamarca/DesdeElAlma.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 81,
    title: "Giro Didac",
    category: "Catamarca",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Catamarca/GiroDidac.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 82,
    title: "La Bagual",
    category: "Catamarca",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Catamarca/LaBagual.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 83,
    title: "La Vinoteca",
    category: "Catamarca",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Catamarca/LaVinoteca.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 84,
    title: "Man Indumentaria",
    category: "Catamarca",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Catamarca/ManIndumentaria.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 85,
    title: "Noa Cat",
    category: "Catamarca",
    thumbnail:
      "https://aefipnoroeste.org.ar/images/Convenios/Catamarca/NoaCat.png",
    short_description: "Beneficio exclusivo para afiliados.",
    mail: "",
    telephone: "",
  },
  {
    id: 86,
    title: "Club Azucena",
    category: "Tucumán",
    thumbnail: "https://bsougkolkltztytxdbna.supabase.co/storage/v1/object/public/benefits/servicios/AzucenaFrente.jfif",
    short_description: "Club de campo y recreación en Yerba Buena, Tucumán. Instalaciones deportivas, asadores y espacios verdes.",
    mail: "",
    telephone: "3816844462",
    contact_person: "Administración AEFIP",
    address: "Yerba Buena, Tucumán",
    discount_description: "Tarifa preferencial para afiliados",
    is_active: true,
    display_order: 1,
    discount_percentage: undefined,
    images: [],
    rubro: "Turismo",
    telephone_type: "whatsapp"
  },
  {
    id: 87,
    title: "Cabañas Warmi (El Mollar)",
    category: "Tucumán",
    thumbnail: "https://bsougkolkltztytxdbna.supabase.co/storage/v1/object/public/benefits/servicios/CFrente.jfif",
    short_description: "Cabañas totalmente equipadas en El Mollar, Tucumán. Vista al Cerro Ñuñorco y Dique La Angostura.",
    mail: "",
    telephone: "3816844462",
    contact_person: "Administración AEFIP",
    address: "El Mollar, Tafí del Valle, Tucumán",
    discount_description: "Tarifa preferencial para afiliados",
    is_active: true,
    display_order: 1,
    discount_percentage: undefined,
    images: [],
    rubro: "Turismo",
    telephone_type: "whatsapp"
  },
  {
    id: 88,
    title: "Salón San Lorenzo",
    category: "Salta",
    thumbnail: "https://bsougkolkltztytxdbna.supabase.co/storage/v1/object/public/benefits/servicios/SLFrente.jfif",
    short_description: "Salón de eventos y celebraciones en San Lorenzo, Salta. Instalaciones modernas en un entorno natural único.",
    mail: "",
    telephone: "3816844462",
    contact_person: "Administración AEFIP",
    address: "San Lorenzo, Salta",
    discount_description: "Tarifa preferencial para afiliados",
    is_active: true,
    display_order: 1,
    discount_percentage: undefined,
    images: [],
    rubro: "Turismo",
    telephone_type: "whatsapp"
  }
];

export const dataServicios: DataItem[] = [
  {
    id: 1,
    title: "CABAÑAS WARMI",
    thumbnail: "https://bsougkolkltztytxdbna.supabase.co/storage/v1/object/public/benefits/servicios/CFrente.jfif",
    short_description: "El Mollar, Tafí del Valle, Tucumán",
  },
  {
    id: 2,
    title: "CLUB AZUCENA",
    thumbnail: "https://bsougkolkltztytxdbna.supabase.co/storage/v1/object/public/benefits/servicios/AzucenaFrente.jfif",
    short_description: "Yerba Buena, Tucumán",
  },
  {
    id: 3,
    title: "SALON SAN LORENZO",
    thumbnail: "https://bsougkolkltztytxdbna.supabase.co/storage/v1/object/public/benefits/servicios/SLFrente.jfif",
    short_description: "San Lorenzo, Salta",
  },
];

export const dataNovedades: DataItem[] = [
  {
    id: 1,
    title: "",
    thumbnail: "https://i.imgur.com/CRZ7KOC.png",
    short_description:
      "Adquirí tu solicitud de turismo a través de nuestro numero de whatsapp!",
  },
  {
    id: 2,
    title: "",
    thumbnail: "https://i.imgur.com/gFIq5md.png",
    short_description: "Podes hacerlo directamente por whatsapp!",
  },
];

export const dataNoticias: Noticia[] = [
  {
    id: 1,
    title: "TRASLADO DE LICENCIAS ORDINARIAS 2019 Y 2020",
    thumbnail: "https://images.unsplash.com/photo-1506784919141-935049938011",
    texto: "Contenido de la noticia 1...",
    date: "10 de Agosto, 2022",
  },
];

export const photos: Photo[] = [
  {
    src: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb",
    width: 1200,
    height: 800,
  },
];

export const photosSanLorenzo: Photo[] = [
  { src: `${import.meta.env.BASE_URL}Servicios/SLFrente.jfif`, width: 1200, height: 800 },
  { src: `${import.meta.env.BASE_URL}Servicios/SL.jfif`, width: 1200, height: 800 },
  { src: `${import.meta.env.BASE_URL}Servicios/SL2.jfif`, width: 1200, height: 800 },
  { src: `${import.meta.env.BASE_URL}Servicios/SL3.jfif`, width: 1200, height: 800 },
  { src: `${import.meta.env.BASE_URL}Servicios/SL4.jfif`, width: 1200, height: 800 },
  { src: `${import.meta.env.BASE_URL}Servicios/SL5.jfif`, width: 1200, height: 800 },
  { src: `${import.meta.env.BASE_URL}Servicios/SL6.jfif`, width: 1200, height: 800 },
  { src: `${import.meta.env.BASE_URL}Servicios/SL7.jfif`, width: 1200, height: 800 },
  { src: `${import.meta.env.BASE_URL}Servicios/SL8.jfif`, width: 1200, height: 800 },
];

export const photosServiciosMollar: Photo[] = [
  {
    src: "https://www.welcomeargentina.com/paseos/dique-la-angostura-el-mollar/dique-la-angostura-el-mollar-4.jpg",
    width: 1200,
    height: 800,
  },
];

export const photosAzucena: Photo[] = [
  { src: `${import.meta.env.BASE_URL}Servicios/AzucenaFrente.jfif`, width: 1200, height: 800 },
  { src: `${import.meta.env.BASE_URL}Servicios/AzucenaCalle.jfif`, width: 1200, height: 800 },
];

export const photosWarmi: Photo[] = [
  { src: `${import.meta.env.BASE_URL}Servicios/CFrente.jfif`, width: 1200, height: 800 },
  { src: `${import.meta.env.BASE_URL}Servicios/C1.jfif`, width: 1200, height: 800 },
  { src: `${import.meta.env.BASE_URL}Servicios/C2.jfif`, width: 1200, height: 800 },
  { src: `${import.meta.env.BASE_URL}Servicios/C3.jfif`, width: 1200, height: 800 },
  { src: `${import.meta.env.BASE_URL}Servicios/C4.jfif`, width: 1200, height: 800 },
  { src: `${import.meta.env.BASE_URL}Servicios/C5.jfif`, width: 1200, height: 800 },
  { src: `${import.meta.env.BASE_URL}Servicios/C6.jfif`, width: 1200, height: 800 },
  { src: `${import.meta.env.BASE_URL}Servicios/C7.jfif`, width: 1200, height: 800 },
];
