/* French Solution – Arbeitsblatt-Renderer (gemeinsam für Generator, Schülerfassung und GitHub-Build).
   render(sheet, {modus: 'druck' | 'loesung' | 'schueler', asset: name => url}) → HTML-Fragment (ohne <html>)
   standalone(sheet, {asset, fontFredoka, fontNunito}) → vollständige Schülerseite (offline, ohne externe Quellen)
   Datenmodell: siehe BEISPIEL in generator.html bzw. blaetter/*.json im Repo. */
(function (root) {
  'use strict';
  const NB = ' ';
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  // französische Typografie: schmales geschütztes Leerzeichen vor ? ! ; : und in « »
  const F = s => String(s == null ? '' : s).replace(/'/g, '’').replace(/«\s*/g, '«' + NB).replace(/\s*»/g, NB + '»').replace(/\s+([?!;:])(?=\s|$|»|\))/g, NB + '$1');
  const fmt = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
  const fr = s => fmt(F(s));

  const SOZIAL = { einzel: ['seul·e', 'Einzelarbeit', 'einzel'], tandem: ['en tandem', 'Tandem', 'tandem'], gruppe: ['en groupe', 'Gruppe', 'gruppe'], plenum: ['en classe', 'Plenum', 'unterricht'] };
  const MEDIUM = { analog: ['papier-crayon', 'analog', 'analog'], digital: ['iPad', 'digital', 'ipad'] };
  const PRAES = { keine: ['seulement rendre', 'keine – nur Abgabe'], vortrag: ['présenter les résultats', 'Kurzvortrag / Ergebnisse vorstellen'],
                  plakat: ['affiche / visite de galerie', 'Plakat / Galerierundgang'], medien: ['audio / vidéo / diapositives', 'Audio / Video / Folien'] };
  const BEWERTUNG = { punkte: ['points et note', 'Punkte und Note'], raster: ['grille de compétences', 'Kompetenzraster'],
                      feedback: ['retour sans note', 'Rückmeldung ohne Note'], selbst: ['auto-évaluation et évaluation par un·e partenaire', 'Selbst- und Partnerbewertung'] };
  const SKALA = ['tout à fait', 'plutôt oui', 'plutôt non', 'pas du tout'];
  const SKALA_DE = ['trifft voll zu', 'eher ja', 'eher nein', 'gar nicht'];
  const UEBUNGSTYPEN = { luecken: 'luecken-fuellen', zuordnen: 'zuordnen', uebersetzen: 'uebersetzen', fragen: 'fragen-beantworten', schreiben: 'schreiben', frei: 'dokument' };
  const EVAL = [['La consigne était claire.', 'Die Aufgabe war verständlich.'], ['La difficulté était bonne pour moi.', 'Der Schwierigkeitsgrad hat für mich gepasst.'],
                ['La tâche était intéressante.', 'Die Aufgabe war interessant.'], ['Le temps était suffisant.', 'Die Zeit hat gepasst.']];
  const HINDERNISSE = ['Handy / Ablenkung', 'Stress', 'zu wenig Zeit eingeplant', 'kein ruhiger Arbeitsplatz', 'Aufgabe unklar', 'keine Lust', 'Sonstiges: ______'];
  const BRAUCHE = ['mehr Zeit zum Prüfen', 'mehr Übungen', 'weitere Erklärungen', 'Sonstiges: ______'];

  // Linien-Icons für die neuen Felder (Präsentation, Bewertung, Aufgaben-Evaluation) im Stil der Block-Icons
  const SVG = {
    praesentation: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h18"/><path d="M4 4v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4"/><path d="M12 16v4"/><path d="M9 20h6"/><path d="M8 12l3-3 2 2 3-3"/></svg>',
    bewertung: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="6"/><path d="M9 14.5 7.5 21 12 18.5 16.5 21 15 14.5"/><path d="M10 9l1.5 1.5L14.5 7.5"/></svg>',
    evaluation: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v2h6V3"/><path d="M8.5 10h1"/><path d="M12 10h3.5"/><path d="M8.5 14h1"/><path d="M12 14h3.5"/><path d="M8.5 18h7"/></svg>'
  };

  // Anweisungssprache nach Lernjahr: LJ 1–4 zweisprachig, ab LJ 5 nur Französisch (Deutsch nur, wenn ausdrücklich gesetzt)
  const zweisprachig = (sheet, de, immer) => de && (Number(sheet.lernjahr) <= 4 || immer);

  function zeilen(n, modus, name) {
    if (modus === 'schueler') return `<textarea class="sch-ta" name="${name}" rows="${Math.max(1, n)}" aria-label="Antwort"></textarea>`;
    return '<div class="lin">' + '<div></div>'.repeat(Math.max(1, n)) + '</div>';
  }
  const kasten = (an, modus, name, label) => modus === 'schueler'
    ? `<label class="ck"><input type="checkbox" name="${name}"${an ? ' checked' : ''}> ${label}</label>`
    : `<span class="ck"><span class="bx${an ? ' an' : ''}"></span> ${label}</span>`;

  function bloc(sheet, o) {
    const A = o.asset, m = o.modus, z = [];
    const row = (icon, frL, deL, inhalt, svg) => z.push(`<div class="br"><div class="bi">${svg ? `<span class="svgi">${SVG[svg]}</span>` : `<img src="${A('block/fs-block-' + icon + '.png')}" alt="">`}</div>`
      + `<div class="bl"><b>${frL}</b><span>${deL}</span></div><div class="bc">${inhalt}</div></div>`);
    const zs = (f, d, immer) => `<div class="fr">${fr(f)}</div>` + (zweisprachig(sheet, d, immer) ? `<div class="de">${fmt(d)}</div>` : '');
    const a = sheet.aufgabe || {};
    row('auftrag', 'Consigne', 'Auftrag', zs(a.fr, a.de, true) + `<div class="opt">${kasten(a.art !== 'wahl', 'druck', '', 'obligatoire · Pflicht')} ${kasten(a.art === 'wahl', 'druck', '', 'au choix · Wahl')}</div>`);
    if (sheet.lernziel && (sheet.lernziel.fr || sheet.lernziel.de)) row('ziel', 'Objectif', 'Ziel', zs(sheet.lernziel.fr, sheet.lernziel.de, true));
    row('zeit', 'Durée', 'Zeit', `<div class="fr">${esc(sheet.zeit || '')}</div>`);
    row('sozialform', 'Forme de travail', 'Sozialform', '<div class="opt">' + Object.entries(SOZIAL).map(([k, v]) =>
      `<span class="ck"><span class="bx${(sheet.sozial || []).includes(k) ? ' an' : ''}"></span><img class="mi" src="${A('block/fs-block-' + v[2] + '.png')}" alt=""> ${v[0]} <small>${v[1]}</small></span>`).join(' ') + '</div>');
    row('arbeitsmittel', 'Supports', 'analog / digital', '<div class="opt">' + Object.entries(MEDIUM).map(([k, v]) =>
      `<span class="ck"><span class="bx${(sheet.medium || []).includes(k) ? ' an' : ''}"></span><img class="mi" src="${A('block/fs-block-' + v[2] + '.png')}" alt=""> ${v[0]} <small>${v[1]}</small></span>`).join(' ') + '</div>');
    row('ki', 'IA', 'KI-Nutzung', '<div class="opt">' + [['erlaubt', 'autorisée · erlaubt'], ['verboten', 'interdite · verboten']].map(([k, l]) =>
      `<span class="ck"><span class="bx${sheet.ki === k ? ' an' : ''}"></span><img class="mi" src="${A('block/fs-block-ki-' + k + '.png')}" alt=""> ${l}</span>`).join(' ') + '</div>');
    if (sheet.methode) row('methode', 'Méthode', 'Methode', `<div class="de">${fmt(sheet.methode)}</div>`);
    const vor = `<div class="blk"><div class="bh">Avant de commencer <span>Bevor du startest</span></div>${z.join('')}</div>`;
    z.length = 0;
    const ab = sheet.abgabe || {};
    row('abgabe', 'Rendu', 'Abgabeformat', `<div class="fr">${fmt(ab.format || '')}</div>` + (ab.termin ? `<div class="de">bis · jusqu’au ${esc(ab.termin)}</div>` : ''));
    row('', 'Présentation', 'Präsentationsform', '<div class="opt">' + Object.entries(PRAES).map(([k, v]) =>
      `<span class="ck"><span class="bx${(sheet.praesentation || []).includes(k) ? ' an' : ''}"></span> ${v[0]} <small>${v[1]}</small></span>`).join(' ') + '</div>', 'praesentation');
    if ((sheet.kriterien || []).length) row('kriterien', 'Critères de qualité', 'Qualitätskriterien', '<ul class="kr">' + sheet.kriterien.map(k => `<li>${fmt(k)}</li>`).join('') + '</ul>');
    const bw = sheet.bewertung || {}, arten = bw.arten || [];
    row('', 'Évaluation', 'Bewertung', '<div class="opt">' + Object.entries(BEWERTUNG).map(([k, v]) =>
      `<span class="ck"><span class="bx${arten.includes(k) ? ' an' : ''}"></span> ${v[0]} <small>${v[1]}</small></span>`).join(' ') + '</div>'
      + (arten.includes('punkte') ? `<div class="de">Punkte: ${punkteSumme(sheet)} · Notenschlüssel 90 / 75 / 60 / 45 / 25 %</div>` : ''), 'bewertung');
    const nach = `<div class="blk"><div class="bh">Ce que tu produis <span>Was am Ende entsteht</span></div>${z.join('')}</div>`;
    return vor + nach;
  }
  const punkteSumme = s => (s.uebungen || []).reduce((a, u) => a + (Number(u.punkte) || 0), 0);

  function lueckenHTML(text, o, nr) {
    let i = 0;
    return fr(text).replace(/\{\{(.+?)\}\}/g, (_, l) => {
      i++;
      const loes = l.split('|')[0];
      if (o.modus === 'loesung') return `<span class="lsg">${loes}</span>`;
      const w = Math.min(60, Math.max(14, loes.length * 2.4 + 6));
      if (o.modus === 'schueler') return `<input class="sch-in" name="u${nr}-l${i}" style="width:${w}mm" aria-label="Lücke ${i}">`;
      return `<span class="gap" style="width:${w}mm"></span>`;
    });
  }

  function uebung(u, nr, sheet, o) {
    const m = o.modus, A = o.asset, d = u.daten || {};
    const icon = u.icon || UEBUNGSTYPEN[u.typ] || 'dokument';
    let body = '';
    if (u.typ === 'luecken') {
      const saetze = d.saetze && d.saetze.length ? d.saetze : null;
      body = saetze ? '<ol class="sz">' + saetze.map(s => `<li>${lueckenHTML(s, o, nr)}</li>`).join('') + '</ol>' : `<p class="lt">${lueckenHTML(d.text || '', o, nr)}</p>`;
    } else if (u.typ === 'zuordnen') {
      const paare = d.paare || [], buch = 'abcdefghijklmnop';
      // rechte Spalte in fester, gemischter Reihenfolge (Reihenfolge aus d.mischung oder rückwärts versetzt)
      const reihe = d.mischung || paare.map((_, i) => (i * 3 + 1) % paare.length);
      const rechts = reihe.map(i => paare[i] ? paare[i][1] : '');
      const loesBuch = paare.map((_, i) => buch[reihe.indexOf(i)]);
      body = '<div class="zo"><ol class="zl">' + paare.map((p, i) => `<li><span class="zx">${m === 'loesung' ? `<span class="zb lsg">${loesBuch[i]}</span>`
        : m === 'schueler' ? `<input class="sch-in kurz" name="u${nr}-z${i}" maxlength="2" aria-label="Buchstabe">` : '<span class="zb"></span>'}</span> ${fr(p[0])}</li>`).join('')
        + '</ol><ol class="zr" type="a">' + rechts.map(r => `<li>${fr(r)}</li>`).join('') + '</ol></div>';
    } else if (u.typ === 'uebersetzen' || u.typ === 'fragen') {
      body = '<ol class="sz">' + (d.saetze || []).map((s, i) => `<li><div>${u.typ === 'uebersetzen' ? fmt(s[0]) : fr(s[0])}</div>`
        + (m === 'loesung' ? `<div class="lsg blk2">${fr(String(s[1] || '').split('|').join(' / '))}</div>` : zeilen(d.zeilen || 2, m, `u${nr}-s${i}`)) + '</li>').join('') + '</ol>';
    } else if (u.typ === 'schreiben') {
      body = ((d.checkliste || []).length ? '<div class="chk"><b>Checkliste</b>' + d.checkliste.map((c, i) => `<div>${kasten(false, m === 'schueler' ? 'schueler' : 'druck', `u${nr}-c${i}`, fmt(c))}</div>`).join('') + '</div>' : '')
        + (m === 'loesung' ? (d.muster ? `<div class="lsg blk2">${fr(d.muster)}</div>` : '<div class="de">individuelle Lösung</div>') : zeilen(d.zeilen || 10, m, `u${nr}-t`));
    } else {
      body = (d.text ? `<p>${fr(d.text)}</p>` : '') + (m === 'loesung' ? (d.loesung ? `<div class="lsg blk2">${fr(d.loesung)}</div>` : '') : zeilen(d.zeilen || 4, m, `u${nr}-f`));
    }
    const bw = (sheet.bewertung || {}).arten || [];
    const rechts = [u.zeit ? `${esc(u.zeit)} min` : '', bw.includes('punkte') && u.punkte ? `${m === 'loesung' ? '' : '___ / '}${esc(u.punkte)} P.` : '', u.niveau ? '★'.repeat(u.niveau) : ''].filter(Boolean).join(' · ');
    return `<section class="ue"><div class="uk"><div class="un">${nr}</div><img src="${A('icons/fs-icon-' + icon + '.png')}" alt="">`
      + `<div class="ua"><div class="fr">${fr(u.fr)}</div>${zweisprachig(sheet, u.de) ? `<div class="de">${fmt(u.de)}</div>` : ''}</div><div class="up">${rechts}</div></div>${body}</section>`;
  }

  function raster(sheet, o) {
    const bw = sheet.bewertung || {};
    if (!(bw.arten || []).includes('raster') || !(bw.raster || []).length) return '';
    const selbst = (bw.arten || []).includes('selbst');
    const kopf = ['Kriterium', 'Stufe 4', 'Stufe 3', 'Stufe 2', 'Stufe 1'];
    return `<div class="blk"><div class="bh">Grille d’évaluation <span>Kompetenzraster${selbst ? ' · S = selbst, P = Partner, L = Lehrkraft' : ''}</span></div><table class="rst"><tr>${kopf.map(k => `<th>${k}</th>`).join('')}</tr>`
      + bw.raster.map(r => `<tr><td><b>${fmt(r.kriterium)}</b></td>` + (r.stufen || []).slice(0, 4).map(s => `<td>${fmt(s)}${selbst ? '<div class="spl"><span>S ☐</span><span>P ☐</span><span>L ☐</span></div>' : ''}</td>`).join('') + '</tr>').join('') + '</table></div>';
  }

  function nachher(sheet, o) {
    if (o.modus === 'loesung') return '';
    const m = o.modus, r = sheet.reflexion || {}, z = [];
    const skz = (t, name) => `<tr><td>${t}</td>` + SKALA.map((s, i) => `<td class="sk">${m === 'schueler' ? `<input type="radio" name="${name}" value="${i}" aria-label="${s}">` : '<span class="bx"></span>'}<small>${s}</small></td>`).join('') + '</tr>';
    const thema = sheet.thema || 'dieses Thema';
    if (r.prozess !== false) {
      z.push(`<div class="rf"><div class="rt"><img src="${o.asset('block/fs-block-reflexion-prozess.png')}" alt=""> Réflexion : le travail <span>Selbstreflexion Arbeitsprozess</span></div>`
        + `<div class="rq">Ich habe die Aufgaben gewissenhaft erledigt. ${kasten(false, m, 'r-gew-j', 'oui')} ${kasten(false, m, 'r-gew-n', 'non')} – wenn nein, warum?</div>${zeilen(1, m, 'r-gew-t')}`
        + `<div class="rq">Ich habe alle meine Fragen gestellt. ${kasten(false, m, 'r-fr-j', 'oui')} ${kasten(false, m, 'r-fr-n', 'non')} – wenn nein: Wen frage ich bis wann?</div>${zeilen(1, m, 'r-fr-t')}`
        + `<div class="rq">Was brauche ich noch zu „${esc(thema)}“, um sicher zu sein? ${BRAUCHE.map((b, i) => kasten(false, m, 'r-br' + i, b)).join(' ')}</div>`
        + `<div class="rq">Was hat mich am gewissenhaften, effektiven Lernen gehindert? ${HINDERNISSE.map((b, i) => kasten(false, m, 'r-hi' + i, b)).join(' ')}</div></div>`);
    }
    if (r.ergebnis !== false) {
      z.push(`<div class="rf"><div class="rt"><img src="${o.asset('block/fs-block-reflexion-ergebnis.png')}" alt=""> Réflexion : le résultat <span>Selbstreflexion Arbeitsergebnis</span></div>`
        + `<table class="skt">${skz('Ich bin mit meinem Einsatz und dem Gelernten zufrieden.', 'r-zuf')}${skz('Mein Ergebnis erfüllt die Qualitätskriterien.', 'r-krit')}</table>`
        + `<div class="rq">ja → Mein Tipp für andere · nein → Woran lag es?</div>${zeilen(1, m, 'r-tipp')}`
        + `<div class="rq">Beim nächsten Mal nehme ich mir vor … – und daran sieht man es:</div>${zeilen(2, m, 'r-vors')}</div>`);
    }
    if (sheet.evaluation !== false) {
      z.push(`<div class="rf"><div class="rt"><span class="svgi">${SVG.evaluation}</span> Évaluation de la tâche <span>Wie fand ich die Aufgabe?</span></div>`
        + `<table class="skt">${EVAL.map((e, i) => skz(`${F(e[0])} <small>${e[1]}</small>`, 'e' + i)).join('')}</table>`
        + `<div class="rq">Das würde ich an der Aufgabe ändern:</div>${zeilen(2, m, 'e-aend')}</div>`);
    }
    const weiter = sheet.weiter ? `<div class="rf"><div class="rt"><img src="${o.asset('block/fs-block-weiter.png')}" alt=""> Et ensuite ? <span>Wie geht es weiter?</span></div><div class="de">${fmt(sheet.weiter)}</div></div>` : '';
    const bw = (sheet.bewertung || {}).arten || [];
    const fb = bw.includes('feedback') ? `<div class="rf"><div class="rt"><img src="${o.asset('block/fs-block-rueckmeldung.png')}" alt=""> Retour du professeur <span>Rückmeldung der Lehrkraft</span></div>${zeilen(3, 'druck')}</div>` : '';
    return `<div class="blk nach"><div class="bh">Quand tu as fini <span>Wenn du fertig bist</span></div>${z.join('')}${fb}${weiter}`
      + `<div class="bsp">Besprechung: gemeinsam im Plenum und/oder im Einzel-Feedbackgespräch</div></div>`;
  }

  function kopf(sheet, o) {
    const titel = sheet.titel || 'Fiche de travail';
    return `<header class="kf"><img class="logo" src="${o.asset('logo/fs-logo-quer.png')}" alt="French Solution"><div class="kt"><h1>${fr(titel)}${o.modus === 'loesung' ? ' · Corrigé' : ''}</h1>`
      + `<div class="km">${esc(sheet.fach === 'mm' ? 'Chinesisch' : 'Französisch')} · ${esc(sheet.lernjahr)}. Lernjahr · Klasse ${esc(sheet.klasse || '')} · ${fmt(sheet.thema || '')}</div></div>`
      + `<div class="kz"><small>Durée</small><b>${esc(sheet.zeit || '')}</b></div></header>`
      + (o.modus === 'loesung' ? '' : `<div class="nm">Nom : ${o.modus === 'schueler' ? '<input class="sch-in" name="name" style="width:70mm" aria-label="Name">' : '<span class="gap" style="width:80mm"></span>'}   Date : <span class="gap" style="width:30mm"></span></div>`);
  }

  function render(sheet, opt) {
    const o = Object.assign({ modus: 'druck', asset: n => 'assets/' + n }, opt || {});
    const ue = (sheet.uebungen || []).map((u, i) => uebung(u, i + 1, sheet, o)).join('');
    return `<article class="fsb fsb-${o.modus}">${kopf(sheet, o)}${o.modus === 'loesung' ? '' : bloc(sheet, o) + raster(sheet, o)}`
      + `<div class="ueh">Exercices <span>Übungen</span></div>${ue}${nachher(sheet, o)}`
      + `<footer class="ff">French Solution · ${esc(sheet.klasse || '')} · ${fmt(sheet.thema || '')}</footer></article>`;
  }

  // Druck-/Blattgestaltung (Designhandbuch FS: Bleu marine #1C2B5A, Rouge #E2383F, Bleu clair #EEF2FA, Fredoka/Nunito)
  const CSS = `
.fsb{--navy:#1C2B5A;--rouge:#E2383F;--clair:#EEF2FA;--grau:#5C5C5C;--linie:#9AA3B5;font-family:Nunito,'Segoe UI',Arial,sans-serif;color:#1a1a1a;background:#fff;font-size:10.5pt;line-height:1.45;max-width:180mm;margin:0 auto}
.fsb *{box-sizing:border-box}.fsb img{max-width:100%}
.fsb .kf{display:grid;grid-template-columns:44mm 1fr 24mm;gap:4mm;align-items:center;border-bottom:1.5pt solid var(--navy);padding-bottom:3mm}
.fsb .logo{width:44mm}.fsb h1{font-family:Fredoka,Nunito,sans-serif;font-weight:600;color:var(--navy);font-size:17pt;line-height:1.15;margin:0 0 1mm;text-wrap:balance}
.fsb .km{font-size:9pt;color:var(--grau)}.fsb .kz{border:1.2pt solid var(--navy);border-radius:2mm;text-align:center;padding:1.5mm;font-family:Fredoka,sans-serif;color:var(--navy)}
.fsb .kz small{display:block;font-size:8pt}.fsb .kz b{font-size:12pt;font-weight:600}
.fsb .nm{margin:3mm 0 2mm;font-size:10pt}.fsb .gap{display:inline-block;border-bottom:.8pt solid #111;height:1.1em;vertical-align:baseline}.fsb .gap.kurz{width:10mm}
.fsb .blk{border:1.2pt solid var(--navy);border-radius:2.5mm;margin:3mm 0;overflow:hidden;break-inside:avoid}
.fsb .bh{background:var(--navy);color:#fff;font-family:Fredoka,sans-serif;font-weight:600;font-size:11pt;padding:1.5mm 4mm}.fsb .bh span{font-family:Nunito,sans-serif;font-weight:400;font-size:8.5pt;opacity:.85;margin-left:2mm}
.fsb .br{display:grid;grid-template-columns:8mm 30mm 1fr;gap:2.5mm;padding:1.6mm 3mm;border-top:.5pt solid #DDE2EC;align-items:start}.fsb .br:first-of-type{border-top:0}
.fsb .bi img,.fsb .svgi svg{width:6mm;height:6mm;display:block}.fsb .svgi{color:var(--navy);display:inline-block;vertical-align:middle}.fsb .rt .svgi svg{width:5mm;height:5mm}
.fsb .bl b{display:block;color:var(--navy);font-size:9.5pt}.fsb .bl span{font-size:8pt;color:var(--grau)}
.fsb .fr{font-weight:600}.fsb .de{font-size:9pt;color:#333}
.fsb .opt{display:flex;flex-wrap:wrap;gap:1mm 4mm;font-size:9pt}.fsb .ck{display:inline-flex;align-items:center;gap:1.2mm;white-space:nowrap}.fsb .ck small{color:var(--grau)}
.fsb .bx{display:inline-block;width:3.2mm;height:3.2mm;border:.8pt solid var(--navy);border-radius:.6mm;position:relative}.fsb .bx.an::after{content:'';position:absolute;left:.7mm;top:.1mm;width:1.2mm;height:2mm;border:solid var(--navy);border-width:0 .6mm .6mm 0;transform:rotate(45deg)}
.fsb .mi{width:4mm;height:4mm}.fsb ul.kr{margin:0;padding-left:4.5mm;font-size:9.5pt}
.fsb .ueh{font-family:Fredoka,sans-serif;font-weight:600;color:var(--navy);font-size:13pt;margin:5mm 0 1mm;border-bottom:.8pt solid var(--navy)}.fsb .ueh span{font-family:Nunito,sans-serif;font-size:9pt;font-weight:400;color:var(--grau);margin-left:2mm}
.fsb .ue{margin:4mm 0}.fsb .uk{break-after:avoid}.fsb ol.sz>li,.fsb .chk,.fsb .zo{break-inside:avoid}.fsb .uk{display:grid;grid-template-columns:7mm 9mm 1fr auto;gap:2.5mm;align-items:start;border-top:1.2pt solid var(--navy);padding-top:2mm;margin-bottom:2mm}
.fsb .un{font-family:Fredoka,sans-serif;font-weight:600;color:var(--rouge);font-size:14pt;line-height:1}.fsb .uk img{width:9mm}.fsb .up{font-size:8.5pt;color:var(--navy);text-align:right;white-space:nowrap}
.fsb .lt{line-height:2.2;margin:0}.fsb ol.sz{margin:0;padding-left:6mm}.fsb ol.sz>li{margin:1.5mm 0 2.5mm;line-height:2}
.fsb .lin div{height:8mm;border-bottom:.6pt solid var(--linie)}
.fsb .zo{display:grid;grid-template-columns:1fr 1fr;gap:6mm}.fsb .zo ol{margin:0;padding-left:6mm}.fsb .zo li{margin:1.5mm 0}.fsb .zx{display:inline-block;margin-right:2mm;vertical-align:middle}.fsb .zb{display:inline-block;width:7mm;height:6mm;border:.8pt solid var(--navy);border-radius:1mm;text-align:center;line-height:6mm}.fsb .zb.lsg{text-decoration:none}
.fsb .chk{border:.75pt solid var(--navy);border-radius:2mm;padding:2mm 3.5mm;margin:0 0 2mm;font-size:9.5pt;background:#fff}.fsb .chk b{color:var(--navy)}
.fsb .lsg{color:var(--navy);font-weight:700;text-decoration:underline;text-decoration-color:var(--linie);text-underline-offset:1mm}.fsb .blk2{display:block;text-decoration:none;font-size:10pt;margin:1mm 0 2mm}
.fsb table{border-collapse:collapse;width:100%}.fsb .rst{font-size:8.5pt}.fsb .rst th{background:var(--clair);color:var(--navy);text-align:left;padding:1.2mm 2mm;border:.5pt solid #C9D0DE}.fsb .rst td{border:.5pt solid #C9D0DE;padding:1.5mm 2mm;vertical-align:top}
.fsb .spl{display:flex;gap:2mm;margin-top:1mm;font-size:7.5pt;color:var(--grau)}
.fsb .nach{background:var(--clair)}.fsb .rf{padding:2mm 4mm;border-top:.5pt solid #C9D0DE}.fsb .rt{font-family:Fredoka,sans-serif;font-weight:600;color:var(--navy);font-size:10.5pt;display:flex;align-items:center;gap:2mm}.fsb .rt img{width:5mm}.fsb .rt span{font-family:Nunito,sans-serif;font-weight:400;font-size:8.5pt;color:var(--grau)}
.fsb .rq{font-size:9pt;margin:1.5mm 0 0;display:flex;flex-wrap:wrap;gap:1mm 3mm;align-items:center}.fsb .rf .lin div{height:7mm}
.fsb .skt td{font-size:9pt;padding:.8mm 1mm}.fsb .skt td.sk{text-align:center;width:15mm;font-size:7pt;color:var(--grau)}.fsb .skt td.sk .bx,.fsb .skt td.sk input{display:block;margin:0 auto .5mm}
.fsb .bsp{font-size:8.5pt;color:var(--navy);padding:2mm 4mm;border-top:.5pt solid #C9D0DE}
.fsb .ff{margin-top:6mm;font-size:7.5pt;color:var(--grau);border-top:.5pt solid #DDE2EC;padding-top:1.5mm}
.fsb .sch-in{font:inherit;border:0;border-bottom:1pt solid var(--navy);background:#F6F8FD;padding:0 1mm;color:var(--navy);font-weight:700}.fsb .sch-in.kurz{width:10mm;text-align:center}
.fsb .sch-ta{display:block;width:100%;font:inherit;border:.8pt solid var(--linie);border-radius:1.5mm;background:repeating-linear-gradient(#fff 0 7.4mm,#C9D0DE 7.4mm 7.6mm);line-height:7.6mm;padding:0 2mm;color:var(--navy);resize:vertical}
.fsb input[type=checkbox],.fsb input[type=radio]{accent-color:#1C2B5A}
@media print{.fsb .blk:not(.nach),.fsb .rf{break-inside:avoid}}
`;

  function standalone(sheet, opt) {
    const o = Object.assign({ modus: 'schueler' }, opt || {});
    const fonts = (o.fontFredoka ? `@font-face{font-family:Fredoka;src:url(${o.fontFredoka}) format('truetype');font-weight:300 700}` : '')
      + (o.fontNunito ? `@font-face{font-family:Nunito;src:url(${o.fontNunito}) format('truetype');font-weight:200 1000}` : '');
    const key = 'fsb-' + (sheet.id || 'blatt');
    return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(sheet.titel || 'Fiche de travail')} – French Solution</title>
<style>${fonts}${CSS}
body{margin:0;background:#E9EDF5}.wrap{background:#fff;max-width:200mm;margin:0 auto;padding:12mm 10mm 16mm;min-height:100vh}
.leiste{position:sticky;top:0;z-index:5;background:#1C2B5A;color:#fff;font-family:Nunito,sans-serif;font-size:14px;display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center;justify-content:center;padding:8px 16px}
.leiste button{font:inherit;font-weight:700;background:#fff;color:#1C2B5A;border:0;border-radius:6px;padding:6px 14px;cursor:pointer}.leiste button:focus-visible{outline:3px solid #E2383F;outline-offset:2px}.leiste .st{opacity:.85}
@media print{body{background:#fff}.leiste{display:none}.wrap{padding:0;max-width:none}@page{size:A4;margin:14mm 14mm 16mm}.fsb .sch-ta{border:0;resize:none;overflow:hidden}.fsb .sch-in{background:none}}
@media (max-width:600px){.wrap{padding:16px}.fsb .br{grid-template-columns:7mm 1fr}.fsb .br .bc{grid-column:1/-1}.fsb .zo{grid-template-columns:1fr}.fsb .kf{grid-template-columns:1fr}}
</style></head><body>
<div class="leiste"><span>Deine Antworten werden auf diesem Gerät gespeichert.</span><button type="button" id="druck">Als PDF speichern / drucken</button><button type="button" id="leeren">Alles löschen</button><span class="st" id="st"></span></div>
<div class="wrap">${render(sheet, o)}</div>
<script>
(function(){var K=${JSON.stringify(key)},f=document.querySelectorAll('input,textarea'),st=document.getElementById('st');
function lesen(){try{return JSON.parse(localStorage.getItem(K)||'{}')}catch(e){return {}}}
function sichern(){var d={};f.forEach(function(e){if(!e.name)return;if(e.type==='checkbox')d[e.name]=e.checked;else if(e.type==='radio'){if(e.checked)d[e.name]=e.value}else d[e.name]=e.value});
try{localStorage.setItem(K,JSON.stringify(d));st.textContent='gespeichert '+new Date().toLocaleTimeString().slice(0,5)}catch(e){st.textContent='Speichern nicht möglich – bitte am Ende als PDF sichern'}}
var d=lesen();f.forEach(function(e){if(!e.name||!(e.name in d))return;if(e.type==='checkbox')e.checked=!!d[e.name];else if(e.type==='radio')e.checked=d[e.name]===e.value;else e.value=d[e.name]});
document.addEventListener('input',sichern);document.addEventListener('change',sichern);
function hoehe(){document.querySelectorAll('textarea').forEach(function(t){t.style.height='auto';t.style.height=Math.max(t.scrollHeight,t.offsetHeight)+'px'})}window.addEventListener('beforeprint',hoehe);document.getElementById('druck').onclick=function(){hoehe();window.print()};
var w=false;document.getElementById('leeren').onclick=function(){if(!w){w=true;this.textContent='Wirklich alles löschen?';return}try{localStorage.removeItem(K)}catch(e){}location.reload()};
})();
</script></body></html>`;
  }

  const api = { render, standalone, CSS, F, esc, UEBUNGSTYPEN, SOZIAL, MEDIUM, PRAES, BEWERTUNG, punkteSumme };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.FSBlatt = api;
})(typeof window !== 'undefined' ? window : globalThis);
