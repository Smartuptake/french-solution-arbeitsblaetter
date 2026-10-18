// Baut aus blaetter/*.json die Schülerfassungen (offline, Assets eingebettet) und eine Übersichtsseite.
// Aufruf: node tools/build.mjs [zielordner] [pruef]   (Standard: site/; „pruef“ = zusätzlich Druck- und Lösungsfassung, nie für docs/)
import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const B = require(path.join(root, 'blatt.js'));
const ziel = path.resolve(process.argv[2] || path.join(root, 'site'));
fs.mkdirSync(path.join(ziel, 'blaetter'), { recursive: true });
const mime = p => p.endsWith('.png') ? 'image/png' : p.endsWith('.ttf') ? 'font/ttf' : 'application/octet-stream';
const uri = p => `data:${mime(p)};base64,` + fs.readFileSync(path.join(root, 'assets', p)).toString('base64');
const liste = [];
for (const f of fs.readdirSync(path.join(root, 'blaetter')).filter(f => f.endsWith('.json')).sort()) {
  const s = JSON.parse(fs.readFileSync(path.join(root, 'blaetter', f), 'utf8'));
  const html = B.standalone(s, { asset: uri, fontFredoka: uri('fonts/Fredoka.ttf'), fontNunito: uri('fonts/Nunito.ttf') });
  fs.writeFileSync(path.join(ziel, 'blaetter', s.id + '.html'), html);
  // Druck- und Lösungsfassung zum Prüfen (verweist auf assets/)
  if (process.argv[3] === 'pruef') for (const m of ['druck', 'loesung']) fs.writeFileSync(path.join(ziel, 'blaetter', `${s.id}-${m}.html`),
    `<!doctype html><meta charset="utf-8"><title>${B.esc(s.titel)}</title><style>@font-face{font-family:Fredoka;src:url(${uri("fonts/Fredoka.ttf")})}@font-face{font-family:Nunito;src:url(${uri("fonts/Nunito.ttf")});font-weight:200 1000}${B.CSS}body{margin:0;padding:12mm;background:#fff}@page{size:A4;margin:12mm}</style>${B.render(s, { modus: m, asset: uri })}`);
  liste.push(s);
}
const idx = `<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>French Solution – Arbeitsblätter</title>
<style>body{font-family:Nunito,Arial,sans-serif;margin:0;background:#EEF2FA;color:#1C2B5A}main{max-width:820px;margin:0 auto;padding:24px 16px}h1{font-family:Fredoka,Nunito,sans-serif;font-weight:600}
ul{list-style:none;padding:0;display:grid;gap:10px}li{background:#fff;border:1px solid #D9DEEA;border-radius:10px;padding:12px 14px}a{color:#1C2B5A;font-weight:700}small{display:block;color:#5B6585}</style>
<main><h1>French Solution · Arbeitsblätter</h1><p>Schülerfassungen zum Ausfüllen im Browser. Am Ende „Als PDF speichern“ und in Moodle abgeben.</p><ul>
${liste.map(s => `<li><a href="blaetter/${s.id}.html">${B.esc(s.titel)}</a><small>Klasse ${B.esc(s.klasse)} · ${s.lernjahr}. Lernjahr · ${B.esc(s.thema)}</small></li>`).join('\n')}
</ul></main></html>`;
fs.writeFileSync(path.join(ziel, 'index.html'), idx);
console.log('ok', liste.length, 'Blätter →', ziel);
