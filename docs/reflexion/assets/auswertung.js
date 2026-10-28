// Auswertung der Selbstreflexion: Antwort-Dateien (.json) oder Codes (FSR1:…) einlesen und mit Diagrammen zeigen.
// Hauptweg: Lehrkraft meldet sich an (speicher.js) und lädt alle Antworten aus der Datenbank. Datei/Code-Abgaben kommen lokal dazu.
(() => {
  const B = window.BOGEN, $ = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const FARBEN = ['#1F7A4D', '#7BB662', '#F2A541', '#E2383F'];   // ++ + – – –
  const MERK = 'auswertung-' + B.id;
  const mitZufrieden = B.zufrieden !== false;
  const da = id => !!$(id);
  document.title = 'Auswertung · ' + B.titel + ' · ' + B.untertitel;
  $('titel').innerHTML = `Auswertung · ${esc(B.titel)}<small>${esc(B.untertitel)}</small>`;
  let antworten = [];
  try { antworten = JSON.parse(localStorage.getItem(MERK) || '[]'); } catch (e) {}
  const merken = () => { try { localStorage.setItem(MERK, JSON.stringify(antworten)); } catch (e) {} };

  const ausCode = c => JSON.parse(decodeURIComponent(escape(atob(c.replace(/^FSR1:/, '').trim()))));
  function aufnehmen(d) {
    if (!d || d.bogen !== B.id || !Array.isArray(d.stufen)) return 'falsch';
    const k = (d.name || '').toLowerCase() + '|' + (d.klasse || '').toLowerCase();
    const alt = antworten.findIndex(x => ((x.name || '').toLowerCase() + '|' + (x.klasse || '').toLowerCase()) === k);
    if (alt >= 0) { antworten[alt] = d; return 'ersetzt'; }
    antworten.push(d); return 'neu';
  }
  function melden(z) {
    const t = [z.neu && `${z.neu} neu`, z.ersetzt && `${z.ersetzt} ersetzt (gleicher Name)`, z.falsch && `${z.falsch} nicht lesbar oder anderer Bogen`].filter(Boolean).join(' · ');
    $('meldung').className = 'meldung ' + (z.falsch ? 'fehler' : 'ok'); $('meldung').textContent = t || 'Nichts gefunden.';
    merken(); zeichnen();
  }
  async function dateien(fl) {
    const z = { neu: 0, ersetzt: 0, falsch: 0 };
    for (const f of fl) {
      try { const t = await f.text(); const d = t.trim().startsWith('FSR1:') ? ausCode(t) : JSON.parse(t); z[aufnehmen(d)]++; }
      catch (e) { z.falsch++; }
    }
    melden(z);
  }
  $('datei').addEventListener('change', e => dateien(e.target.files));
  const abl = $('ablage');
  abl.addEventListener('dragover', e => { e.preventDefault(); abl.classList.add('ueber'); });
  abl.addEventListener('dragleave', () => abl.classList.remove('ueber'));
  abl.addEventListener('drop', e => { e.preventDefault(); abl.classList.remove('ueber'); dateien(e.dataTransfer.files); });
  $('codes-ok').onclick = () => {
    const z = { neu: 0, ersetzt: 0, falsch: 0 };
    ($('codes').value.match(/FSR1:[A-Za-z0-9+/=]+/g) || []).forEach(c => { try { z[aufnehmen(ausCode(c))]++; } catch (e) { z.falsch++; } });
    $('codes').value = ''; melden(z);
  };
  $('leeren').onclick = () => { if (confirm('Alle eingelesenen Antworten aus diesem Browser entfernen?')) { antworten = []; merken(); zeichnen(); } };
  $('csv').onclick = () => {
    const kopf = ['Vorname', 'Klasse', 'Gruppe', 'Zeit', ...B.aussagen.map((a, i) => `${i + 1} ${a[0]}`), 'zufrieden', 'oui weil', 'non weil', 'Sonstiges', 'brauche', 'brauche frei', 'nächstes Mal', 'Vorsatz', 'Vorsatz Sonstiges'];
    const zelle = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    const L = x => (x || []).join('; ');
    const zeilen = antworten.map(d => [d.name, d.klasse, d.gruppe, d.zeit, ...d.stufen.map(v => B.skala[3 - v] ? B.skala[3 - v][0] : ''), d.zufrieden, L(d.ja), L(d.nein), d.sonstGrund, L(d.brauche), [...Object.values(d.frei || {}), d.braucheSonst].filter(Boolean).join('; '), d.naechstes, L(d.vorsatz), d.vorsatzSonst]);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + [kopf, ...zeilen].map(z => z.map(zelle).join(';')).join('\n')], { type: 'text/csv' }));
    a.download = `auswertung-${B.id}.csv`; a.click();
  };

  function zaehlen(feld, liste) { const m = {}; liste.map(x => x.replace(/\s*___/, '')).concat(['Sonstiges']).forEach(x => m[x] = 0); antworten.forEach(d => (d[feld] || []).forEach(x => { m[x] = (m[x] || 0) + 1; })); return m; }
  // Diagramme mit Chart.js (im Repository mitgeliefert, kein CDN)
  const NAVY = '#1C2B5A', ROT = '#E2383F', GRUEN = '#1F7A4D';
  const diagramme = {};
  function diagramm(id, cfg) { if (diagramme[id]) diagramme[id].destroy(); diagramme[id] = new Chart($(id), cfg); return diagramme[id]; }
  if (window.Chart) { Chart.defaults.font.family = 'Nunito, Segoe UI, Arial, sans-serif'; Chart.defaults.font.size = 13; Chart.defaults.color = '#333'; Chart.defaults.maintainAspectRatio = false; }
  const bereiche = () => [...new Set(B.aussagen.map(a => a[0]))];
  const prozentBereich = (liste, k) => { const v = []; B.aussagen.forEach((a, i) => { if (a[0] === k) liste.forEach(d => { if (d.stufen[i] != null) v.push(d.stufen[i]); }); }); return v.length ? Math.round(v.reduce((x, y) => x + y, 0) / v.length / 3 * 100) : 0; };
  const radarCfg = (werte, farbe, klein) => ({ type: 'radar', data: { labels: bereiche(), datasets: [{ data: werte, backgroundColor: farbe + '33', borderColor: farbe, pointBackgroundColor: farbe, borderWidth: 2 }] },
    options: { plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => c.raw + ' %' } } }, scales: { r: { min: 0, max: 100, ticks: { stepSize: 25, display: !klein, backdropColor: 'transparent' }, pointLabels: { font: { size: klein ? 10 : 13, family: 'Fredoka, Nunito, sans-serif' } } } } } });
  const balkenCfg = (m, farbe) => ({ type: 'bar', data: { labels: Object.keys(m), datasets: [{ data: Object.values(m), backgroundColor: farbe, borderRadius: 4 }] },
    options: { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { precision: 0 } }, y: { grid: { display: false } } } } });
  let mittel = () => 0;
  function zeichnenDiagramme(n, ja) {
    if (!window.Chart) return;
    diagramm('radar', radarCfg(bereiche().map(k => prozentBereich(antworten, k)), NAVY));
    if (da('donut')) diagramm('donut', { type: 'doughnut', data: { labels: ['oui', 'non'], datasets: [{ data: [ja, n - ja], backgroundColor: [GRUEN, ROT], borderWidth: 0 }] },
      options: { cutout: '58%', plugins: { legend: { position: 'bottom' }, tooltip: { callbacks: { label: c => `${c.label}: ${c.raw} (${Math.round(c.raw / n * 100)} %)` } } } } });
    // Likert: zentrierte gestapelte Balken in % (Ablehnung links, Zustimmung rechts)
    const reihen = B.aussagen.map((a, i) => ({ a, i, m: mittel(i), z: [3, 2, 1, 0].map(v => antworten.filter(d => d.stufen[i] === v).length) }));
    if ($('sort').checked) reihen.sort((x, y) => x.m - y.m);
    const kurz = t => t.length > 46 ? t.slice(0, 44) + ' …' : t;
    const pct = c => c / n * 100;
    $('likert-box').style.height = (reihen.length * 34 + 70) + 'px';
    const satz = (label, werte, farbe, zi) => ({ label, data: werte, backgroundColor: farbe, _z: zi, stack: 'a' });
    diagramm('likert', { type: 'bar',
      data: { labels: reihen.map(r => `${r.i + 1}. ${kurz(r.a[1])}`),
        datasets: [
          satz('– trifft eher nicht zu', reihen.map(r => -pct(r.z[2])), '#F2A541', 2),
          satz('– – trifft gar nicht zu', reihen.map(r => -pct(r.z[3])), '#B3261E', 3),
          satz('+ trifft eher zu', reihen.map(r => pct(r.z[1])), '#8CC084', 1),
          satz('++ trifft voll zu', reihen.map(r => pct(r.z[0])), GRUEN, 0)
        ] },
      options: { indexAxis: 'y', plugins: { legend: { position: 'top' },
          tooltip: { callbacks: { title: c => { const r = reihen[c[0].dataIndex]; return `${r.i + 1}. ${r.a[1]}`; },
            label: c => { const r = reihen[c.dataIndex], z = r.z[c.dataset._z]; return `${c.dataset.label}: ${z} (${Math.round(pct(z))} %)`; } } } },
        scales: { x: { stacked: true, min: -100, max: 100, ticks: { callback: v => Math.abs(v) + ' %' } }, y: { stacked: true, grid: { display: false }, ticks: { font: { size: 12 } } } } } });
    if (da('gruende-ja')) diagramm('gruende-ja', balkenCfg(zaehlen('ja', B.ja), GRUEN));
    if (da('gruende-nein')) diagramm('gruende-nein', balkenCfg(zaehlen('nein', B.nein), ROT));
    if (da('vorsatz') && B.vorsatz) diagramm('vorsatz', balkenCfg(zaehlen('vorsatz', B.vorsatz), GRUEN));
    diagramm('brauche', balkenCfg(zaehlen('brauche', B.brauche), NAVY));
    // Einzelprofile (kleine Netzdiagramme)
    Object.keys(diagramme).filter(k => k.startsWith('p-')).forEach(k => { diagramme[k].destroy(); delete diagramme[k]; });
    const sortiert = antworten.slice().sort((x, y) => (x.name || '').localeCompare(y.name || ''));
    $('profile').innerHTML = sortiert.map((d, j) => `<div class="profil"><b>${esc(d.name)}</b><small>${d.gruppe ? 'Groupe ' + esc(d.gruppe) + ' ' : ''}${d.zufrieden === 'oui' ? 'zufrieden' : d.zufrieden === 'non' ? 'nicht zufrieden' : ''}</small><div class="dg"><canvas id="p-${j}"></canvas></div></div>`).join('');
    sortiert.forEach((d, j) => diagramm('p-' + j, radarCfg(bereiche().map(k => prozentBereich([d], k)), d.zufrieden === 'non' ? ROT : NAVY, true)));
  }
  function zeichnen() {
    const n = antworten.length;
    $('ergebnis').hidden = !n;
    $('anzahl').textContent = n ? `${n} Antwort${n === 1 ? '' : 'en'} eingelesen` : 'Noch keine Antworten eingelesen.';
    if (!n) return;
    const ja = antworten.filter(d => d.zufrieden === 'oui').length;
    mittel = i => { const v = antworten.map(d => d.stufen[i]).filter(x => x != null); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0; };
    const gesamt = B.aussagen.reduce((a, _, i) => a + mittel(i), 0) / B.aussagen.length;
    $('kacheln').innerHTML = `<div class="kachel"><b>${n}</b><span>Antworten</span></div>`
      + (mitZufrieden ? `<div class="kachel"><b>${Math.round(ja / n * 100)} %</b><span>zufrieden (oui)</span></div>` : '')
      + `<div class="kachel"><b>${(gesamt / 3 * 100).toFixed(0)} %</b><span>Selbsteinschätzung gesamt<br>(100 % = alles „++“)</span></div>`;
    zeichnenDiagramme(n, ja);
    const ft = d => [d.naechstes, ...Object.values(d.frei || {}).map(v => 'Grammatik: ' + v), d.braucheSonst && 'brauche: ' + d.braucheSonst, d.vorsatzSonst && 'Vorsatz: ' + d.vorsatzSonst].filter(Boolean);
    const frei = antworten.filter(d => ft(d).length || d.sonstGrund);
    $('frei').innerHTML = frei.length ? frei.map(d => `<li><b>${esc(d.name)}:</b> ${ft(d).map(esc).join(' · ')}${d.sonstGrund ? ` <i>(Sonstiges: ${esc(d.sonstGrund)})</i>` : ''}</li>`).join('') : '<li class="hinweis">Keine Freitexte.</li>';
    $('tabelle').innerHTML = `<tr><th>Vorname</th>${B.gruppen ? '<th>Gr.</th>' : ''}${B.aussagen.map((_, i) => `<th title="${esc(B.aussagen[i][1])}">${i + 1}</th>`).join('')}${mitZufrieden ? '<th>zufrieden</th>' : ''}</tr>`
      + antworten.slice().sort((x, y) => (x.name || '').localeCompare(y.name || '')).map(d => `<tr><td>${esc(d.name)}</td>${B.gruppen ? `<td>${esc(d.gruppe)}</td>` : ''}${d.stufen.map((v, j) => `<td style="background:${v == null ? '#fff' : FARBEN[3 - v]}22;text-align:center">${v == null ? '' : esc(B.skala[3 - v][0])}</td>`).join('')}${mitZufrieden ? `<td>${esc(d.zufrieden)}</td>` : ''}</tr>`).join('');
  }
  $('sort').addEventListener('change', zeichnen);

  // Datenbank: anmelden, laden; Token nur für diese Sitzung (sessionStorage)
  let token = null; try { token = sessionStorage.getItem('rf-token'); } catch (e) {}
  async function ausDatenbank() {
    const lm = $('login-meldung'); lm.className = 'meldung'; lm.textContent = 'Lade …';
    try {
      const db = await window.SPEICHER.laden(token, B.id);
      const z = { neu: 0, ersetzt: 0, falsch: 0 }; db.forEach(d => z[aufnehmen(d)]++);
      lm.className = 'meldung ok'; lm.textContent = `${db.length} Antwort${db.length === 1 ? '' : 'en'} aus der Datenbank geladen.`;
      $('anmeldung').querySelector('form').hidden = true; $('neu-laden').hidden = false; merken(); zeichnen();
    } catch (e) {
      token = null; try { sessionStorage.removeItem('rf-token'); } catch (x) {}
      lm.className = 'meldung fehler'; lm.textContent = 'Laden ging nicht – bitte neu anmelden.'; $('anmeldung').querySelector('form').hidden = false;
    }
  }
  $('login').addEventListener('submit', async e => {
    e.preventDefault(); const lm = $('login-meldung');
    try { token = await window.SPEICHER.anmelden($('email').value.trim(), $('passwort').value); try { sessionStorage.setItem('rf-token', token); } catch (x) {} $('passwort').value = ''; ausDatenbank(); }
    catch (err) { lm.className = 'meldung fehler'; lm.textContent = 'Anmeldung fehlgeschlagen: E-Mail oder Passwort prüfen.'; }
  });
  $('neu-laden').onclick = () => { antworten = []; ausDatenbank(); };
  if (token) ausDatenbank();
  zeichnen();
})();
