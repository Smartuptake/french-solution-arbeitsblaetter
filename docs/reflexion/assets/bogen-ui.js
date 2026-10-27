// Selbstreflexionsbogen: baut das Formular aus window.BOGEN, speichert die Antwort als Datei und als Code (für die Abgabe in Moodle).
// Absenden an die Datenbank (speicher.js); geht das nicht (kein Netz), bleiben Datei und Code als Abgabe über Moodle.
(() => {
  const B = window.BOGEN, $ = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const MERK = 'reflexion-' + B.id;
  document.title = B.titel + ' · ' + B.untertitel;
  $('titel').innerHTML = `${esc(B.titel)}<small>${esc(B.untertitel)}</small>`;

  const wahl = (name, wert, inhalt, typ = 'radio') => `<label class="wahl"><input type="${typ}" name="${name}" value="${esc(wert)}"><span>${inhalt}</span></label>`;
  $('aussagen').innerHTML = B.aussagen.map(([k, t], i) => `<div class="aussage"><span class="k">${esc(k)}</span><p>${i + 1}. ${esc(t)}</p>
    <div class="stufen" role="radiogroup" aria-label="Aussage ${i + 1}">${B.skala.map(([z, w], j) => wahl('a' + i, 3 - j, `<b>${esc(z)}</b>${esc(w)}`)).join('')}</div></div>`).join('');
  const liste = (name, l) => l.map(x => wahl(name, x, esc(x), 'checkbox')).join('') + wahl(name, 'Sonstiges', 'Sonstiges', 'checkbox');
  $('ja').innerHTML = liste('ja', B.ja);
  $('nein').innerHTML = liste('nein', B.nein);
  $('brauche').innerHTML = liste('brauche', B.brauche);
  $('zufrieden').innerHTML = wahl('zufrieden', 'oui', 'oui') + wahl('zufrieden', 'non', 'non');
  $('zufrieden').addEventListener('change', () => {
    const z = (document.querySelector('[name=zufrieden]:checked') || {}).value;
    $('ja-box').hidden = z !== 'oui'; $('nein-box').hidden = z !== 'non';
  });

  // Zwischenstand im Browser merken (falls die Seite aus Versehen geschlossen wird)
  const lesen = () => {
    const w = n => [...document.querySelectorAll(`[name="${n}"]:checked`)].map(x => x.value);
    return {
      bogen: B.id, version: 1, zeit: new Date().toISOString(),
      name: $('name').value.trim(), klasse: $('klasse').value.trim(),
      stufen: B.aussagen.map((_, i) => { const v = w('a' + i)[0]; return v == null ? null : +v; }),
      zufrieden: w('zufrieden')[0] || '', ja: w('ja'), nein: w('nein'), sonstGrund: $('sonst-grund').value.trim(),
      brauche: w('brauche'), naechstes: $('naechstes').value.trim()
    };
  };
  const setzen = d => {
    $('name').value = d.name || ''; $('klasse').value = d.klasse || '';
    (d.stufen || []).forEach((v, i) => { const el = document.querySelector(`[name="a${i}"][value="${v}"]`); if (el) el.checked = true; });
    ['zufrieden', 'ja', 'nein', 'brauche'].forEach(n => [].concat(d[n] || []).forEach(v => { const el = document.querySelector(`[name="${n}"][value="${CSS.escape(v)}"]`); if (el) el.checked = true; }));
    $('sonst-grund').value = d.sonstGrund || ''; $('naechstes').value = d.naechstes || '';
    $('zufrieden').dispatchEvent(new Event('change'));
  };
  try { const d = JSON.parse(localStorage.getItem(MERK) || 'null'); if (d) setzen(d); } catch (e) {}
  document.addEventListener('input', () => { try { localStorage.setItem(MERK, JSON.stringify(lesen())); } catch (e) {} });
  document.addEventListener('change', () => { try { localStorage.setItem(MERK, JSON.stringify(lesen())); } catch (e) {} });

  // Code: Kennung + Base64 des JSON (UTF-8)
  const zuCode = d => 'FSR1:' + btoa(unescape(encodeURIComponent(JSON.stringify(d))));
  $('fertig').onclick = async () => {
    const d = lesen(), fehlt = d.stufen.map((v, i) => v == null ? i + 1 : 0).filter(Boolean);
    const m = $('meldung');
    if (!d.name) { m.className = 'meldung fehler'; m.textContent = 'Bitte trage deinen Vornamen ein.'; $('name').focus(); return; }
    if (fehlt.length) { m.className = 'meldung fehler'; m.textContent = 'Bitte kreuze noch an: Aussage ' + fehlt.join(', ') + '.'; return; }
    if (!d.zufrieden) { m.className = 'meldung fehler'; m.textContent = 'Bitte kreuze an, ob du zufrieden bist (oui / non).'; return; }
    $('fertig').disabled = true; m.className = 'meldung'; m.textContent = 'Wird gesendet …';
    try {
      await window.SPEICHER.senden(d);
      m.className = 'meldung ok'; m.textContent = 'Danke! Deine Antwort ist angekommen. Du kannst die Seite jetzt schließen.';
      $('fertig').textContent = 'Gesendet ✓'; try { localStorage.removeItem(MERK); } catch (e) {}
      return;
    } catch (e) {
      $('fertig').disabled = false;
      m.className = 'meldung fehler'; m.textContent = 'Senden hat nicht geklappt (keine Verbindung?). Versuche es gleich noch einmal oder gib deine Antwort unten als Datei oder Code ab.';
    }
    const code = zuCode(d);
    $('code').textContent = code; $('abgabe').hidden = false;
    const datei = `reflexion-${B.id}-${d.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-')}.json`;
    $('laden').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(d, null, 1)], { type: 'application/json' })); a.download = datei; a.click(); };
    $('kopieren').onclick = async () => {
      try { await navigator.clipboard.writeText(code); $('kopiert').textContent = 'Code kopiert. Füge ihn in Moodle ein.'; }
      catch (e) { $('kopiert').textContent = 'Kopieren ging nicht: Markiere den Code und kopiere ihn von Hand.'; }
    };
    $('abgabe').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
})();
