import fs from 'fs';

const csvPath = 'e:/Noroeste/seccional/lista_beneficios.csv';
const fileContent = fs.readFileSync(csvPath, 'utf-8');

const lines = fileContent.split('\n').filter(line => line.trim() !== '');
const headers = lines[0].split(';');

const records = lines.slice(1).map(line => {
    // Basic CSV parser for semicolon-delimited values with quotes
    const parts = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ';' && !inQuotes) {
            parts.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    parts.push(current.trim());
    return parts;
});

console.log('INSERT INTO public.benefits (title, category, short_description, thumbnail, mail, telephone)');
console.log('VALUES');

const values = records.map((record) => {
    const title = (record[0] || '').replace(/'/g, "''");
    const category = (record[1] || '').replace(/'/g, "''");
    const description = (record[2] || '').replace(/'/g, "''");
    const image = (record[3] || '').replace(/'/g, "''");
    const email = (record[4] || '').replace(/'/g, "''");
    const phone = (record[5] || '').replace(/'/g, "''");

    return `  ('${title}', '${category}', '${description}', ${image ? `'${image}'` : 'NULL'}, ${email ? `'${email}'` : 'NULL'}, ${phone ? `'${phone}'` : 'NULL'})`;
}).join(',\n');

console.log(values + ';');
