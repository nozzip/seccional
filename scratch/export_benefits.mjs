
import fs from 'fs';

const mockDataPath = 'e:\\Noroeste\\seccional\\src\\Components\\mockData.ts';
const content = fs.readFileSync(mockDataPath, 'utf8');

// Use a more relaxed regex to catch properties regardless of exact formatting
// We match based on the id property as a start of a block
const blocks = content.split('id:').slice(1); // skip stuff before first id

const benefits = blocks.map(block => {
  const title = block.match(/title:\s*"([^"]*)"/)?.[1] || '';
  const category = block.match(/category:\s*"([^"]*)"/)?.[1] || '';
  const thumbnail = block.match(/thumbnail:\s*"([^"]*)"/)?.[1] || '';
  const description = block.match(/short_description:\s*"([^"]*)"/)?.[1] || '';
  const mail = block.match(/mail:\s*"([^"]*)"/)?.[1] || '';
  const telephone = block.match(/telephone:\s*"([^"]*)"/)?.[1] || '';
  
  // Only return if it has a title (to avoid matching other blocks)
  if (title && category) {
      return { title, category, thumbnail, description, mail, telephone };
  }
  return null;
}).filter(b => b !== null);

// Convert to CSV
const header = 'Titulo;Categoria;Descripcion;Imagen;Email;Telefono';
const csvContent = benefits.map(b => 
  `"${b.title}";"${b.category}";"${b.description}";"${b.thumbnail}";"${b.mail}";"${b.telephone}"`
).join('\n');

const finalCsv = header + '\n' + csvContent;

fs.writeFileSync('e:\\Noroeste\\seccional\\lista_beneficios.csv', finalCsv, 'utf8');
console.log(`Exportados ${benefits.length} beneficios.`);
