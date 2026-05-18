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

// Provinces configuration
const PROVINCES = [
  { folder: 'Convenios Catamarca', dbCategory: 'Catamarca' },
  { folder: 'Convenios Jujuy', dbCategory: 'Jujuy' },
  { folder: 'Convenios Santiago', dbCategory: 'Santiago del Estero' },
  { folder: 'Convenios Tucuman', dbCategory: 'Tucumán' }
];

function normalizeString(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]/g, "");     // Remove non-alphanumeric characters
}

async function main() {
  console.log('🚀 Starting Convenios Image Migration to Supabase...\n');

  // Query all benefits
  const { data: dbBenefits, error } = await supabase
    .from('benefits')
    .select('id, title, category, thumbnail');

  if (error) {
    console.error('❌ Error fetching benefits:', error);
    return;
  }

  let successCount = 0;
  let errorCount = 0;

  for (const prov of PROVINCES) {
    const folderPath = path.join('public', prov.folder);
    if (!fs.existsSync(folderPath)) {
      console.warn(`⚠️ Folder not found: ${folderPath}`);
      continue;
    }

    const files = fs.readdirSync(folderPath).filter(f => f.toLowerCase().endsWith('.png') || f.toLowerCase().endsWith('.jpg') || f.toLowerCase().endsWith('.jpeg'));
    console.log(`\n==========================================`);
    console.log(`📦 Province: ${prov.dbCategory}`);
    console.log(`==========================================`);

    const provBenefits = dbBenefits.filter(b => b.category === prov.dbCategory);

    for (const file of files) {
      const ext = path.extname(file);
      const nameWithoutExt = path.basename(file, ext);
      const normalizedFileName = normalizeString(nameWithoutExt);

      // Try to find a match in the category benefits
      let match = provBenefits.find(b => normalizeString(b.title) === normalizedFileName);

      // Soft fallback matching
      if (!match) {
        match = provBenefits.find(b => {
          const normTitle = normalizeString(b.title);
          return normTitle.includes(normalizedFileName) || normalizedFileName.includes(normTitle);
        });
      }

      if (!match) {
        console.warn(`⚠️ Skipping "${file}": No matching benefit card found in DB.`);
        errorCount++;
        continue;
      }

      const filePath = path.join(folderPath, file);
      const fileBuffer = fs.readFileSync(filePath);
      let contentType = 'image/png';
      if (file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg')) {
        contentType = 'image/jpeg';
      }

      // Format storage path to keep it organized (e.g. convenios/Catamarca/AutoSpa.png)
      const cleanCategory = prov.dbCategory.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const storagePath = `convenios/${cleanCategory}/${file}`;

      console.log(`➡️ [Matching: "${match.title}" (ID: ${match.id})]`);
      console.log(`   Uploading image to bucket "benefits" at "${storagePath}"...`);

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('benefits')
        .upload(storagePath, fileBuffer, {
          contentType: contentType,
          upsert: true
        });

      if (uploadError) {
        console.error(`   ❌ Upload failed for "${file}":`, uploadError.message);
        errorCount++;
        continue;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('benefits')
        .getPublicUrl(storagePath);

      const publicUrl = publicUrlData.publicUrl;
      console.log(`   ✅ Uploaded! Public URL: ${publicUrl}`);

      // Update database row
      const { error: updateError } = await supabase
        .from('benefits')
        .update({ thumbnail: publicUrl })
        .eq('id', match.id);

      if (updateError) {
        console.error(`   ❌ Database update failed for ID ${match.id}:`, updateError.message);
        errorCount++;
      } else {
        console.log(`   🎉 Successfully updated DB thumbnail!`);
        successCount++;
      }
    }
  }

  console.log(`\n==========================================`);
  console.log(`🏁 MIGRATION COMPLETED!`);
  console.log(`==========================================`);
  console.log(`Successful updates: ${successCount}`);
  console.log(`Errors/Failures: ${errorCount}`);
}

main();
