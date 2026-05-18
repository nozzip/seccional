import fs from 'fs';
import path from 'path';

// Path to the service worker in the build output directory
const swPath = path.join(process.cwd(), 'dist', 'sw.js');

if (fs.existsSync(swPath)) {
  try {
    let content = fs.readFileSync(swPath, 'utf8');
    const timestamp = Date.now();
    const newCacheName = `aefip-cache-${timestamp}`;

    // Replace the static CACHE_NAME with a dynamic timestamp-based cache name
    content = content.replace(
      /const CACHE_NAME = ['"].*?['"];/,
      `const CACHE_NAME = '${newCacheName}';`
    );

    // Append a unique build timestamp comment at the top
    const dateString = new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });
    content = `// Build Timestamp: ${dateString}\n// Unique ID: ${timestamp}\n` + content;

    fs.writeFileSync(swPath, content, 'utf8');
    console.log(`\n[PWA Builder] successfully updated dist/sw.js:`);
    console.log(`  - CACHE_NAME set to: "${newCacheName}"`);
    console.log(`  - Build time set to: ${dateString}\n`);
  } catch (error) {
    console.error('[PWA Builder] Error updating dist/sw.js:', error);
  }
} else {
  console.error('[PWA Builder] dist/sw.js not found! Make sure vite build ran first.');
}
