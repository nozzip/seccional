import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env.local
const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2];
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['VITE_SUPABASE_ANON_KEY'];
const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadImage(localName, storageName) {
  const filePath = path.join('public', 'Servicios', localName);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Local file not found: ${filePath}`);
    return null;
  }

  const fileBuffer = fs.readFileSync(filePath);
  const storagePath = `servicios/${storageName}`;

  console.log(`Uploading "${localName}" to Supabase storage at "${storagePath}"...`);

  const { data, error } = await supabase.storage
    .from('benefits')
    .upload(storagePath, fileBuffer, {
      contentType: 'image/jpeg',
      upsert: true
    });

  if (error) {
    console.error(`❌ Upload failed for "${localName}":`, error.message);
    return null;
  }

  const { data: publicUrlData } = supabase.storage
    .from('benefits')
    .getPublicUrl(storagePath);

  console.log(`✅ Uploaded successfully! Public URL: ${publicUrlData.publicUrl}`);
  return publicUrlData.publicUrl;
}

async function main() {
  console.log('🚀 Starting Services insertion to Benefits table in Supabase...\n');

  // 1. Upload cover images to Supabase storage
  const azucenaUrl = await uploadImage('AzucenaFrente.jfif', 'AzucenaFrente.jfif');
  const cabanasUrl = await uploadImage('CFrente.jfif', 'CFrente.jfif');
  const sanLorenzoUrl = await uploadImage('SLFrente.jfif', 'SLFrente.jfif');

  if (!azucenaUrl || !cabanasUrl || !sanLorenzoUrl) {
    console.error('❌ Failed to upload one or more cover images. Aborting insert.');
    return;
  }

  // 2. Prepare benefits payload
  const newBenefits = [
    {
      title: "Club Azucena",
      category: "Tucumán",
      rubro: "Turismo",
      thumbnail: azucenaUrl,
      short_description: "Club de campo y recreación en Yerba Buena, Tucumán. Instalaciones deportivas, asadores y espacios verdes.",
      telephone: "3816844462",
      telephone_type: "whatsapp",
      is_active: true,
      display_order: 1,
      mail: "",
      address: "Yerba Buena, Tucumán",
      discount_description: "Tarifa preferencial para afiliados",
      contact_person: "Administración AEFIP"
    },
    {
      title: "Cabañas Warmi (El Mollar)",
      category: "Tucumán",
      rubro: "Turismo",
      thumbnail: cabanasUrl,
      short_description: "Cabañas totalmente equipadas en El Mollar, Tucumán. Vista al Cerro Ñuñorco y Dique La Angostura.",
      telephone: "3816844462",
      telephone_type: "whatsapp",
      is_active: true,
      display_order: 1,
      mail: "",
      address: "El Mollar, Tafí del Valle, Tucumán",
      discount_description: "Tarifa preferencial para afiliados",
      contact_person: "Administración AEFIP"
    },
    {
      title: "Salón San Lorenzo",
      category: "Salta",
      rubro: "Turismo",
      thumbnail: sanLorenzoUrl,
      short_description: "Salón de eventos y celebraciones en San Lorenzo, Salta. Instalaciones modernas en un entorno natural único.",
      telephone: "3816844462",
      telephone_type: "whatsapp",
      is_active: true,
      display_order: 1,
      mail: "",
      address: "San Lorenzo, Salta",
      discount_description: "Tarifa preferencial para afiliados",
      contact_person: "Administración AEFIP"
    }
  ];

  console.log('\nInserting new benefit cards into the database...');

  const { data, error } = await supabase
    .from('benefits')
    .insert(newBenefits)
    .select();

  if (error) {
    console.error('❌ Database insertion failed:', error.message);
  } else {
    console.log('🎉 Successfully inserted 3 new service-benefit cards in Supabase DB!');
    console.log(data);
  }
}

main();
