// Auswertung der Selbstreflexion: Antwort-Dateien (.json) oder Codes (FSR1:…) einlesen und mit Diagrammen zeigen.
// Hauptweg: Lehrkraft meldet sich an (speicher.js) und lädt alle Antworten aus der Datenbank. Datei/Code-Abgaben kommen lokal dazu.
(() => {
  const B = window.BOGEN, $ = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const FARBEN = ['#1F7A4D', '#7BB662', '#F2A541', '#E2383F'];   // ++ + – – –
  const MERK = 'auswertung-' + B.id;
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
    const kopf = ['Vorname', 'Klasse', 'Zeit', ...B.aussagen.map((a, i) => `${i + 1} ${a[0]}`), 'zufrieden', 'oui weil', 'non weil', 'Sonstiges', 'brauche', 'nächstes Mal'];
    const zelle = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    const zeilen = antworten.map(d => [d.name, d.klasse, d.zeit, ...d.stufen.map(v => B.skala[3 - v] ? B.skala[3 - v][0] : ''), d.zufrieden, d.ja.join('; '), d.nein.join('; '), d.sonstGrund, d.brauche.join('; '), d.naechstes]);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + [kopf, ...zeilen].map(z => z.map(zelle).join(';')).join('\n')], { type: 'text/csv' }));
    a.download = `auswertung-${B.id}.csv`; a.click();
  };

  function zaehlen(feld, liste) { const m = {}; liste.concat(['Sonstiges']).forEach(x => m[x] = 0); antworten.forEach(d => (d[feld] || []).forEach(x => { m[x] = (m[x] || 0) + 1; })); return m; }
  function hbars(m, rot) {
    const max = Math.max(1, ...Object.values(m));
    return Object.entries(m).map(([k, v]) => `<div class="hbar"><span>${esc(k)}</span><div><div class="bar${rot ? ' rot' : ''}" style="width:${v / max * 100}%"></div></div><span class="zahl">${v}</span></div>`).join('');
  }
  function zeichnen() {
    const n = antworten.length;
    $('ergebnis').hidden = !n;
    $('anzahl').textContent = n ? `${n} Antwort${n === 1 ? '' : 'en'} eingelesen` : 'Noch keine Antworten eingelesen.';
    if (!n) return;
    const ja = antworten.filter(d => d.zufrieden === 'oui').length;
    const mittel = i => { const v = antworten.map(d => d.stufen[i]).filter(x => x != null); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0; };
    const gesamt = B.aussagen.reduce((a, _, i) => a + mittel(i), 0) / B.aussagen.length;
    $('kacheln').innerHTML = `<div class="kachel"><b>${n}</b><span>Antworten</span></div>`
      + `<div class="kachel"><b>${Math.round(ja / n * 100)} %</b><span>zufrieden (oui)</span></div>`
      + `<div class="kachel"><b>${(gesamt / 3 * 100).toFixed(0)} %</b><span>Selbsteinschätzung gesamt<br>(100 % = alles „++“)</span></div>`;
    $('leg').innerHTML = B.skala.map(([z, w], j) => `<span><i style="background:${FARBEN[j]}"></i>${esc(z)} ${esc(w)}</span>`).join('');
    // Aussagen: gestapelte Balken, sortierbar nach Schwäche (Mittelwert aufsteigend)
    const reihen = B.aussagen.map((a, i) => ({ a, i, m: mittel(i), z: [3, 2, 1, 0].map(v => antworten.filter(d => d.stufen[i] === v).length) }));
    if ($('sort').checked) reihen.sort((x, y) => x.m - y.m);
    $('aussagen').innerHTML = reihen.map(({ a, i, z }) => `<div class="balken"><div class="t"><span class="k">${esc(a[0])}</span>${i + 1}. ${esc(a[1])}</div>`
      + `<div class="stapel" role="img" aria-label="${z.map((c, j) => B.skala[j][0] + ': ' + c).join(', ')}">${z.map((c, j) => c ? `<div style="width:${c / n * 100}%;background:${FARBEN[j]}" title="${esc(B.skala[j][1])}: ${c}">${c}</div>` : '').join('')}</div></div>`).join('');
    $('gruende-ja').innerHTML = hbars(zaehlen('ja', B.ja));
    $('gruende-nein').innerHTML = hbars(zaehlen('nein', B.nein), true);
    $('brauche').innerHTML = hbars(zaehlen('brauche', B.brauche));
    $('zufrieden').innerHTML = `<div class="stapel" style="height:30px">${ja ? `<div style="width:${ja / n * 100}%;background:#1F7A4D">oui ${ja}</div>` : ''}${n - ja ? `<div style="width:${(n - ja) / n * 100}%;background:#E2383F">non ${n - ja}</div>` : ''}</div>`;
    const frei = antworten.filter(d => d.naechstes || d.sonstGrund);
    $('frei').innerHTML = frei.length ? frei.map(d => `<li><b>${esc(d.name)}:</b> ${esc(d.naechstes)}${d.sonstGrund ? ` <i>(Sonstiges: ${esc(d.sonstGrund)})</i>` : ''}</li>`).join('') : '<li class="hinweis">Keine Freitexte.</li>';
    $('tabelle').innerHTML = `<tr><th>Vorname</th>${B.aussagen.map((_, i) => `<th title="${esc(B.aussagen[i][1])}">${i + 1}</th>`).join('')}<th>zufrieden</th></tr>`
      + antworten.slice().sort((x, y) => (x.name || '').localeCompare(y.name || '')).map(d => `<tr><td>${esc(d.name)}</td>${d.stufen.map((v, j) => `<td style="background:${v == null ? '#fff' : FARBEN[3 - v]}22;text-align:center">${v == null ? '' : esc(B.skala[3 - v][0])}</td>`).join('')}<td>${esc(d.zufrieden)}</td></tr>`).join('');
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
