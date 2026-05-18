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
  // Query all benefits
  const { data: dbBenefits, error } = await supabase
    .from('benefits')
    .select('id, title, category, thumbnail');

  if (error) {
    console.error('Error fetching benefits:', error);
    return;
  }

  console.log(`Loaded ${dbBenefits.length} benefits from Supabase.\n`);

  let totalImagesFound = 0;
  let matchesCount = 0;
  let misses = [];

  for (const prov of PROVINCES) {
    const folderPath = path.join('public', prov.folder);
    if (!fs.existsSync(folderPath)) {
      console.warn(`Folder not found: ${folderPath}`);
      continue;
    }

    const files = fs.readdirSync(folderPath).filter(f => f.toLowerCase().endsWith('.png') || f.toLowerCase().endsWith('.jpg') || f.toLowerCase().endsWith('.jpeg'));
    console.log(`=== Province: ${prov.dbCategory} (Folder: ${prov.folder}) ===`);
    console.log(`Found ${files.length} images locally.`);
    totalImagesFound += files.length;

    // Filter benefits of this category
    const provBenefits = dbBenefits.filter(b => b.category === prov.dbCategory);
    console.log(`Found ${provBenefits.length} benefits in database for ${prov.dbCategory}.`);

    for (const file of files) {
      const ext = path.extname(file);
      const nameWithoutExt = path.basename(file, ext);
      const normalizedFileName = normalizeString(nameWithoutExt);

      // Try to find a match in the category benefits
      let match = provBenefits.find(b => normalizeString(b.title) === normalizedFileName);

      // Soft fallback matching (e.g. check if filename is included in title or vice versa)
      if (!match) {
        match = provBenefits.find(b => {
          const normTitle = normalizeString(b.title);
          return normTitle.includes(normalizedFileName) || normalizedFileName.includes(normTitle);
        });
      }

      if (match) {
        console.log(`✅ MATCH: "${file}" ➡️ "${match.title}" (ID: ${match.id})`);
        matchesCount++;
      } else {
        console.log(`❌ NO MATCH: "${file}" (Normalized: "${normalizedFileName}")`);
        misses.push({ province: prov.dbCategory, file, normalizedFileName });
      }
    }
    console.log('');
  }

  console.log(`--- SUMMARY ---`);
  console.log(`Total local images: ${totalImagesFound}`);
  console.log(`Matched successfully: ${matchesCount} / ${totalImagesFound}`);
  console.log(`Failed to match: ${totalImagesFound - matchesCount}`);

  if (misses.length > 0) {
    console.log(`\nMissed list:`);
    misses.forEach(m => console.log(` - [${m.province}] "${m.file}"`));
  }
}

main();
