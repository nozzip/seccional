
export interface DataItem {
  id: number;
  title: string;
  thumbnail: string;
  short_description: string;
}

export interface Beneficio extends DataItem {
  category: string;
  mail?: string;
  telephone?: string;
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
  { id: 1, title: '', thumbnail: 'https://i.imgur.com/uECOaEP.png', short_description: '' },
  { id: 2, title: '', thumbnail: 'https://i.imgur.com/7D0zraW.png', short_description: '' },
  { id: 3, title: '', thumbnail: 'https://i.imgur.com/WXlphHs.png', short_description: '' },
];

export const dataBeneficios: Beneficio[] = [
  {
    id: 1,
    title: 'San Cristobal Seguros',
    category: 'Tucuman',
    thumbnail: 'https://pbs.twimg.com/profile_images/1057618845773586433/ov6dybM9_400x400.jpg',
    short_description: 'Somos una empresa de seguros argentina nacida en Rosario, hace más de 80 años, con un origen mutualista.',
    mail: 'sancristobal@sancristobal',
    telephone: '381-4-458780',
  },
  {
    id: 2,
    title: 'Beneficios 2',
    category: 'Santiago',
    thumbnail: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb',
    short_description: 'Contenido de beneficio 2...',
    mail: 'info@ejemplo.com',
    telephone: '381-4-458780',
  },
];

export const dataServicios: DataItem[] = [
  { id: 1, title: 'MOLLAR', thumbnail: 'https://www.welcomeargentina.com/paseos/dique-la-angostura-el-mollar/dique-la-angostura-el-mollar-4.jpg', short_description: 'Tafí del Valle, Tucumán' },
  { id: 2, title: 'AZUCENA', thumbnail: 'https://i.imgur.com/m1FMXls.png', short_description: 'Yerba Buena, Tucumán' },
  { id: 3, title: 'SALON SAN LORENZO', thumbnail: 'https://images.unsplash.com/photo-1517649763962-0c623066013b', short_description: 'Salta' },
];

export const dataNovedades: DataItem[] = [
  { id: 1, title: '', thumbnail: 'https://i.imgur.com/CRZ7KOC.png', short_description: 'Adquirí tu solicitud de turismo a través de nuestro numero de whatsapp!' },
  { id: 2, title: '', thumbnail: 'https://i.imgur.com/gFIq5md.png', short_description: 'Podes hacerlo directamente por whatsapp!' },
];

export const dataNoticias: Noticia[] = [
  {
    id: 1,
    title: 'TRASLADO DE LICENCIAS ORDINARIAS 2019 Y 2020',
    thumbnail: 'https://images.unsplash.com/photo-1506784919141-935049938011',
    texto: 'Contenido de la noticia 1...',
    date: '10 de Agosto, 2022',
  },
];

export const photos: Photo[] = [
  { src: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb", width: 1200, height: 800 },
];

export const photosServiciosMollar: Photo[] = [
  { src: "https://www.welcomeargentina.com/paseos/dique-la-angostura-el-mollar/dique-la-angostura-el-mollar-4.jpg", width: 1200, height: 800 },
];

export const photosAzucena: Photo[] = [
  { src: "https://i.imgur.com/m1FMXls.png", width: 1200, height: 800 },
];

export const photosWarmi: Photo[] = [
  { src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b", width: 1200, height: 800 },
];