import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

const EXCEL_PATH = 'd:/Users/A.E.F.I.P. Noroeste/Downloads/SDT Noviembre 2026.xlsx';
const STATE_PATH = path.resolve('scratch/sdt_noviembre_estado.json');
const BOT_ENDPOINT = 'http://localhost:3008/v1/messages';

const args = process.argv.slice(2);
const limitArgIdx = args.indexOf('--limit');
const limit = limitArgIdx !== -1 ? parseInt(args[limitArgIdx + 1], 10) : Infinity;
const dryRun = args.includes('--dry-run');
const BATCH_SIZE = 15;

function parseMoney(val) {
  if (typeof val === 'number') return val;
  const s = String(val || '').replace(/[^0-9,.-]/g, '').replace(/\./g, '').replace(',', '.');
  return parseFloat(s) || 0;
}

function formatRoundedUp(amount) {
  return '$' + Math.ceil(amount).toLocaleString('es-AR');
}

function buildDetailLine(row) {
  const name = String(row['Apellido y Nombre del Afiliado'] || '').trim();
  const claro = parseMoney(row['Total Claro']);
  const asispre = parseMoney(row['Total Asispre']);
  const total = parseMoney(row['Total']);

  if (claro > 0 && asispre > 0) {
    return `${name}: Claro = ${String(row['Total Claro']).trim()} + Asispre = ${String(row['Total Asispre']).trim()} = ${formatRoundedUp(total)}`;
  }
  return `${name}: ${formatRoundedUp(total)}`;
}

function buildMessage(entry, group) {
  const hour = new Date().getHours();
  const saludo = hour >= 12 ? 'Buenas tardes!' : 'Buenos días!';
  const detailLines = entry.detailLines || (group ? group.rows.map(buildDetailLine).join('\n') : '');

  return [
    `${saludo} nos comunicamos para informarle sobre el monto de servicios abonados a su nombre en este último mes`,
    '',
    detailLines,
    '',
    'El mismo debe ser abonado a la siguiente cuenta del gremio',
    '',
    'Número de Cuenta\tCC en Pesos 069-008950/0',
    'Número de CBU\t0720069420000000895004',
    'Alias\tAEFIP.SEC.NOROESTE',
    'Razón Social\tAEDGI SECCIONAL TUCUMAN',
    'CUIT/CUIL\t33679949379',
    '',
    'Si nos puede enviar el comprobante por este medio, se lo agradeceríamos, si tiene alguna consulta, no dude en preguntarnos, muchas gracias',
  ].join('\n');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadGroups() {
  if (!fs.existsSync(EXCEL_PATH)) {
    return [];
  }
  const wb = XLSX.readFile(EXCEL_PATH);
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });

  const byPhone = new Map();
  for (const r of rows) {
    const digits = String(r['Telefono'] || '').replace(/\D/g, '');
    if (!digits) continue;
    if (!byPhone.has(digits)) {
      byPhone.set(digits, { phone: digits, rows: [] });
    }
    byPhone.get(digits).rows.push(r);
  }
  return Array.from(byPhone.values());
}

function loadState(groups) {
  if (fs.existsSync(STATE_PATH)) {
    return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
  }
  const initial = groups.map((g, idx) => ({
    index: idx + 1,
    phone: g.phone,
    target: `549${g.phone}`,
    affiliates: g.rows.map((r) => String(r['Apellido y Nombre del Afiliado']).trim()),
    status: 'PENDING',
    sentAt: null,
    error: null,
  }));
  fs.writeFileSync(STATE_PATH, JSON.stringify(initial, null, 2), 'utf8');
  return initial;
}

async function main() {
  const groups = loadGroups();
  const state = loadState(groups);
  const groupMap = new Map(groups.map((g) => [g.phone, g]));

  const pending = state.filter((item) => item.status !== 'SENT');
  const toProcess = pending.slice(0, limit);

  console.log(`Total chats únicos: ${state.length} | Pendientes antes de correr: ${pending.length} | A enviar ahora: ${toProcess.length}`);

  for (let i = 0; i < toProcess.length; i++) {
    const entry = toProcess[i];
    const group = groupMap.get(entry.phone);
    const message = buildMessage(entry, group);

    if (dryRun) {
      console.log(`\n--- [DRY-RUN #${entry.index}] ${entry.target} (${entry.affiliates.join(' / ')}) ---`);
      console.log(message);
      continue;
    }

    try {
      const resp = await fetch(BOT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: entry.phone, message }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.ok) {
        throw new Error(data.error || `HTTP ${resp.status}`);
      }
      entry.status = 'SENT';
      entry.sentAt = new Date().toISOString();
      entry.error = null;
      console.log(`✅ [${entry.index}/${state.length}] Enviado a ${entry.target} (${entry.affiliates.join(' / ')})`);
    } catch (err) {
      entry.status = 'ERROR';
      entry.error = err.message;
      console.error(`❌ [${entry.index}/${state.length}] Error enviando a ${entry.target}:`, err.message);
    }

    fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), 'utf8');

    if (i < toProcess.length - 1) {
      const sentInRun = i + 1;
      if (sentInRun % BATCH_SIZE === 0) {
        const batchPauseMs = 600000 + Math.floor(Math.random() * 180000); // 10-13 min entre tandas de 15
        console.log(`🛑 Tanda de ${BATCH_SIZE} completada. Pausa anti-spam de ${(batchPauseMs / 60000).toFixed(1)} minutos...`);
        await sleep(batchPauseMs);
      } else {
        const delayMs = 25000 + Math.floor(Math.random() * 30000); // 25-55s aleatorio
        console.log(`⏳ Esperando ${(delayMs / 1000).toFixed(1)}s antes del siguiente envío...`);
        await sleep(delayMs);
      }
    }
  }

  const remaining = state.filter((item) => item.status !== 'SENT');
  console.log(`\n📊 Resumen: Enviados=${state.length - remaining.length}/${state.length} | Pendientes=${remaining.length}`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
