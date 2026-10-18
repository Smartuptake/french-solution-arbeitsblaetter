// Baut aus blaetter/*.json die Schülerfassungen (offline, Assets eingebettet) und eine Übersichtsseite.
// Aufruf: node tools/build.mjs [zielordner] [pruef] [--fach=fs|mm]   (Standard: site/; „pruef“ = zusätzlich Druck- und Lösungsfassung, nie für docs/)
import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
import { execFileSync } from 'node:child_process';
import os from 'node:os';
const PY = process.env.FONT_PY || path.join(os.homedir(), 'Documents/MM-Werkstatt/fs-8b-klausur/venv/bin/python');   // Python mit fontTools
const WENKAI = process.env.WENKAI || path.join(os.homedir(), 'Library/Fonts/LXGWWenKai-Regular.ttf');
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const B = require(path.join(root, 'blatt.js'));
const args = process.argv.slice(2), FACH = (args.find(a => a.startsWith('--fach=')) || '--fach=fs').slice(7), PRUEF = args.includes('pruef');
const ziel = path.resolve(args.find(a => !a.startsWith('--') && a !== 'pruef') || path.join(root, 'site'));
const NAME = FACH === 'mm' ? 'Mandarin Maverick' : 'French Solution';
fs.mkdirSync(path.join(ziel, 'blaetter'), { recursive: true });
const mime = p => p.endsWith('.png') ? 'image/png' : p.endsWith('.ttf') ? 'font/ttf' : 'application/octet-stream';
const uri = p => `data:${mime(p)};base64,` + fs.readFileSync(path.join(root, 'assets', p)).toString('base64');
const liste = [];
for (const f of fs.readdirSync(path.join(root, 'blaetter')).filter(f => f.endsWith('.json')).sort()) {
  const s = JSON.parse(fs.readFileSync(path.join(root, 'blaetter', f), 'utf8'));
  if ((s.fach || 'fs') !== FACH) continue;
  // MM: nur die Hanzi des Blatts aus LXGW WenKai (OFL) einbetten
  const hanzi = () => { const tmp = path.join(root, 'site', '.sub-' + s.id + '.ttf'); fs.mkdirSync(path.dirname(tmp), { recursive: true });
    execFileSync(PY, ['-c', 'import sys;from fontTools import subset;o=subset.Options();o.notdef_outline=True;f=subset.load_font(sys.argv[1],o);t=subset.Subsetter(o);t.populate(text=sys.argv[2]);t.subset(f);subset.save_font(f,sys.argv[3],o)',
      WENKAI, B.zeichenListe(s), tmp]); const u = 'data:font/ttf;base64,' + fs.readFileSync(tmp).toString('base64'); fs.unlinkSync(tmp); return u; };
  const html = s.fach === 'mm' ? B.standalone(s, { asset: uri, fontHanzi: hanzi() }) : B.standalone(s, { asset: uri, fontFredoka: uri('fonts/Fredoka.ttf'), fontNunito: uri('fonts/Nunito.ttf') });
  fs.writeFileSync(path.join(ziel, 'blaetter', s.id + '.html'), html);
  // Druck- und Lösungsfassung zum Prüfen (verweist auf assets/)
  if (PRUEF) for (const m of ['druck', 'loesung']) fs.writeFileSync(path.join(ziel, 'blaetter', `${s.id}-${m}.html`),
    `<!doctype html><meta charset="utf-8"><title>${B.esc(s.titel)}</title><style>@font-face{font-family:'MM Kai';src:url(${uri("fonts/MMKai-gb2312.ttf")})}@font-face{font-family:Fredoka;src:url(${uri("fonts/Fredoka.ttf")})}@font-face{font-family:Nunito;src:url(${uri("fonts/Nunito.ttf")});font-weight:200 1000}${B.CSS}body{margin:0;padding:12mm;background:#fff}@page{size:A4;margin:12mm}</style>${B.render(s, { modus: m, asset: uri })}`);
  liste.push(s);
}
const idx = `<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${NAME} – Arbeitsblätter</title>
<style>body{font-family:${FACH === "mm" ? "'Helvetica Neue',Helvetica,Arial" : "Nunito,Arial"},sans-serif;margin:0;background:${FACH === "mm" ? "#E6F5F5" : "#EEF2FA"};color:${FACH === "mm" ? "#02736F" : "#1C2B5A"}}main{max-width:820px;margin:0 auto;padding:24px 16px}h1{font-family:${FACH === "mm" ? "'Helvetica Neue',Helvetica,Arial" : "Fredoka,Nunito"},sans-serif;font-weight:600}
ul{list-style:none;padding:0;display:grid;gap:10px}li{background:#fff;border:1px solid #D9DEEA;border-radius:10px;padding:12px 14px}a{color:${FACH === "mm" ? "#02736F" : "#1C2B5A"};font-weight:700}small{display:block;color:#5B6585}</style>
<main><h1>${NAME} · Arbeitsblätter</h1><p>Schülerfassungen zum Ausfüllen im Browser. Am Ende „Als PDF speichern“ und in Moodle abgeben.</p><ul>
${liste.map(s => `<li><a href="blaetter/${s.id}.html">${B.esc(s.titel)}</a><small>${s.fach === 'mm' ? 'Chinesisch' : 'Französisch'} · ${B.esc(s.klasse)} · ${s.lernjahr}. Lernjahr · ${B.esc(s.thema)}</small></li>`).join('\n')}
</ul><p><small>Für Lehrkräfte: <a href="generator/">Arbeitsblatt-Generator (Offline-Fassung)</a></small></p></main></html>`;
fs.writeFileSync(path.join(ziel, 'index.html'), idx);
// Generator (Offline-Fassung für Lehrkräfte): gleiche Seite wie auf claude.ai, speichert im Browser
const gz = path.join(ziel, 'generator'); fs.mkdirSync(gz, { recursive: true });
fs.writeFileSync(path.join(gz, 'index.html'), '<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0}</style></head><body>'
  + fs.readFileSync(path.join(root, 'generator.html'), 'utf8').replace("const FACH = 'fs';", `const FACH = '${FACH}';`).replace('<title>FS Arbeitsblatt-Generator</title>', `<title>${FACH === 'mm' ? 'MM' : 'FS'} Arbeitsblatt-Generator</title>`) + '</body></html>');
fs.copyFileSync(path.join(root, 'blatt.js'), path.join(gz, 'blatt.js'));
const fremd = FACH === 'mm' ? /^(fs-|Fredoka|Nunito)/ : /^(mm-|MMKai)/;   // nur die Dateien der eigenen Marke
fs.rmSync(path.join(gz, 'assets'), { recursive: true, force: true });
fs.cpSync(path.join(root, 'assets'), path.join(gz, 'assets'), { recursive: true, filter: q => !fremd.test(path.basename(q)) });
console.log('ok', liste.length, 'Blätter →', ziel);
