/* Arbeitsblatt-Renderer für French Solution (fach "fs") und Mandarin Maverick (fach "mm") – gemeinsam für Generator, Schülerfassung und GitHub-Build.
   render(sheet, {modus: 'druck' | 'loesung' | 'schueler', asset: name => url}) → HTML-Fragment (ohne <html>)
   standalone(sheet, {asset, fontFredoka, fontNunito, fontHanzi}) → vollständige Schülerseite (offline, ohne externe Quellen)
   MM-Regeln (Designhandbuch v1.9): Hanzi immer #B02418 in Kaiti, Pinyin #2271FF eine Stufe größer, Deutsch #111111, Struktur Türkis #039A9A. */
(function (root) {
  'use strict';
  const NB = ' ';
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  // französische Typografie: schmales geschütztes Leerzeichen vor ? ! ; : und in « »
  const F = s => String(s == null ? '' : s).replace(/'/g, '’').replace(/«\s*/g, '«' + NB).replace(/\s*»/g, NB + '»').replace(/\s+([?!;:])(?=\s|$|»|\))/g, NB + '$1');
  const fmt = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
  const fr = s => fmt(F(s));
  // Chinesisch: Hanzi-Läufe und Pinyin-Wörter (mit Tonzeichen) automatisch auszeichnen
  const CJK = /[㐀-鿿豈-﫿　-〿！-～]+/g;
  const PYW = /[A-Za-zÀ-ÿ]*[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ][A-Za-zÀ-ÿāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü']*/g;
  const zh = s => fmt(s).replace(CJK, m => `<span class="hz">${m}</span>`).replace(/(^|>)([^<]*)/g, (all, a, txt) => a + txt.replace(PYW, w => `<span class="py">${w}</span>`));
  const istCJK = s => /[㐀-鿿]/.test(s);

  // Marken: Beschriftungen, Text-Formatierung, Dateipräfixe
  const MARKE = {
    fs: {
      pre: 'fs', name: 'French Solution', logo: 'logo/fs-logo-quer.png', T: fr, D: fmt, lang: 'fr',
      kopf: { zeit: 'Durée', name: 'Nom :', datum: 'Date :', loesung: ' · Corrigé', fach: 'Französisch', titel: 'Fiche de travail' },
      bh: { vor: ['Avant de commencer', 'Bevor du startest'], nach: ['Ce que tu produis', 'Was am Ende entsteht'], fertig: ['Quand tu as fini', 'Wenn du fertig bist'],
            ue: ['Exercices', 'Übungen'], raster: ['Grille d’évaluation', 'Kompetenzraster'] },
      f: { auftrag: ['Consigne', 'Auftrag'], ziel: ['Objectif', 'Ziel'], zeit: ['Durée', 'Zeit'], sozial: ['Forme de travail', 'Sozialform'], medium: ['Supports', 'analog / digital'],
           ki: ['IA', 'KI-Nutzung'], methode: ['Méthode', 'Methode'], abgabe: ['Rendu', 'Abgabeformat'], praes: ['Présentation', 'Präsentationsform'],
           kriterien: ['Critères de qualité', 'Qualitätskriterien'], bewertung: ['Évaluation', 'Bewertung'] },
      pflicht: 'obligatoire · Pflicht', wahl: 'au choix · Wahl', bis: 'bis · jusqu’au',
      sozial: { einzel: ['seul·e', 'Einzelarbeit'], tandem: ['en tandem', 'Tandem'], gruppe: ['en groupe', 'Gruppe'], plenum: ['en classe', 'Plenum'] },
      medium: { analog: ['papier-crayon', 'analog'], digital: ['iPad', 'digital'] },
      ki: { erlaubt: 'autorisée · erlaubt', verboten: 'interdite · verboten' },
      praes: { keine: ['seulement rendre', 'keine – nur Abgabe'], vortrag: ['présenter les résultats', 'Kurzvortrag / Ergebnisse vorstellen'],
               plakat: ['affiche / visite de galerie', 'Plakat / Galerierundgang'], medien: ['audio / vidéo / diapositives', 'Audio / Video / Folien'] },
      bewertung: { punkte: ['points et note', 'Punkte und Note'], raster: ['grille de compétences', 'Kompetenzraster'],
                   feedback: ['retour sans note', 'Rückmeldung ohne Note'], selbst: ['auto-évaluation et évaluation par un·e partenaire', 'Selbst- und Partnerbewertung'] },
      skala: ['tout à fait', 'plutôt oui', 'plutôt non', 'pas du tout'], ja: 'oui', nein: 'non',
      r: { prozess: ['Réflexion : le travail', 'Selbstreflexion Arbeitsprozess'], ergebnis: ['Réflexion : le résultat', 'Selbstreflexion Arbeitsergebnis'],
           eval: ['Évaluation de la tâche', 'Wie fand ich die Aufgabe?'], weiter: ['Et ensuite ?', 'Wie geht es weiter?'], feedback: ['Retour du professeur', 'Rückmeldung der Lehrkraft'] },
      eval: [['La consigne était claire.', 'Die Aufgabe war verständlich.'], ['Le niveau de difficulté me convenait.', 'Der Schwierigkeitsgrad hat für mich gepasst.'],
             ['La tâche était intéressante.', 'Die Aufgabe war interessant.'], ['Le temps était suffisant.', 'Die Zeit hat gepasst.']]
    },
    mm: {
      pre: 'mm', name: 'Mandarin Maverick', logo: 'logo/mm-logo.png', T: zh, D: zh, lang: 'de',
      kopf: { zeit: 'Arbeitszeit', name: 'Name:', datum: 'Datum:', loesung: ' · Lösung', fach: 'Chinesisch', titel: 'Arbeitsblatt' },
      bh: { vor: ['Bevor du startest', '开始以前 · kāishǐ yǐqián'], nach: ['Was am Ende entsteht', '成果 · chéngguǒ'], fertig: ['Wenn du fertig bist', '完成以后 · wánchéng yǐhòu'],
            ue: ['Übungen', '练习 · liànxí'], raster: ['Kompetenzraster', '评分标准 · píngfēn biāozhǔn'] },
      f: { auftrag: ['Auftrag', 'Rènwu'], ziel: ['Ziel', 'Mùbiāo'], zeit: ['Arbeitszeit', 'Shíjiān'], sozial: ['Sozialform', 'Gōngzuò xíngshì'], medium: ['Arbeitsmittel', 'Gōngjù'],
           ki: ['KI-Nutzung', 'Réngōng zhìnéng'], methode: ['Methode', 'Fāngfǎ'], abgabe: ['Abgabe', 'Tíjiāo'], praes: ['Präsentation', 'Zhǎnshì'],
           kriterien: ['Erfolgskriterien', 'Chénggōng biāozhǔn'], bewertung: ['Bewertung', 'Píngfēn'] },
      pflicht: 'Pflicht · bìxuǎn', wahl: 'Wahl · kěxuǎn', bis: 'bis',
      sozial: { einzel: ['Einzelarbeit', 'gèrén'], tandem: ['Tandem', 'shuāngrén'], gruppe: ['Gruppe', 'xiǎozǔ'], plenum: ['Plenum', 'quánbān'] },
      medium: { analog: ['analog', 'zhǐ hé bǐ'], digital: ['iPad', ''] },
      ki: { erlaubt: 'erlaubt · kěyǐ', verboten: 'verboten · bù kěyǐ' },
      praes: { keine: ['keine – nur Abgabe', ''], vortrag: ['Kurzvortrag / Ergebnisse vorstellen', ''], plakat: ['Plakat / Galerierundgang', ''], medien: ['Audio / Video / Folien', ''] },
      bewertung: { punkte: ['Punkte und Note', ''], raster: ['Kompetenzraster', ''], feedback: ['Rückmeldung ohne Note', ''], selbst: ['Selbst- und Partnerbewertung', ''] },
      skala: ['trifft voll zu', 'trifft eher zu', 'trifft eher nicht zu', 'trifft nicht zu'], ja: 'ja', nein: 'nein',
      r: { prozess: ['Selbstreflexion: Arbeitsprozess', 'Fǎnsī: guòchéng'], ergebnis: ['Selbstreflexion: Arbeitsergebnis', 'Fǎnsī: chéngguǒ'],
           eval: ['Rückmeldung zur Aufgabe', 'Fǎnkuì'], weiter: ['Wie geht es weiter?', 'Xià yī bù'], feedback: ['Rückmeldung der Lehrkraft', ''] },
      eval: [['Die Aufgabe war verständlich.', ''], ['Der Schwierigkeitsgrad hat für mich gepasst.', ''], ['Die Aufgabe war interessant.', ''], ['Die Zeit hat gepasst.', '']]
    }
  };
  const marke = s => MARKE[s && s.fach === 'mm' ? 'mm' : 'fs'];
  const neben = s => (s && s.fach === 'mm' ? zh : fmt);   // Nebenzeilen: MM mit Hanzi/Pinyin-Auszeichnung, FS schlicht

  const SOZIAL_ICON = { einzel: 'einzel', tandem: 'tandem', gruppe: 'gruppe', plenum: 'unterricht' };
  const MEDIUM_ICON = { analog: 'analog', digital: 'ipad' };
  // ältere Aufrufer (Generator) lesen die Auswahllisten hieraus: [Zielsprache, Deutsch]
  const SOZIAL = { einzel: ['seul·e', 'Einzelarbeit', 'einzel'], tandem: ['en tandem', 'Tandem', 'tandem'], gruppe: ['en groupe', 'Gruppe', 'gruppe'], plenum: ['en classe', 'Plenum', 'unterricht'] };
  const MEDIUM = { analog: ['papier-crayon', 'analog', 'analog'], digital: ['iPad', 'digital', 'ipad'] };
  const PRAES = MARKE.fs.praes, BEWERTUNG = MARKE.fs.bewertung;
  const UEBUNGSTYPEN = { luecken: 'luecken-fuellen', zuordnen: 'zuordnen', uebersetzen: 'uebersetzen', fragen: 'fragen-beantworten', schreiben: 'schreiben', frei: 'dokument', zeichen: 'schriftzeichen' };
  const HINDERNISSE = ['Handy / Ablenkung', 'Stress', 'zu wenig Zeit eingeplant', 'kein ruhiger Arbeitsplatz', 'Aufgabe unklar', 'keine Lust', 'Sonstiges: ______'];
  const BRAUCHE = ['mehr Zeit zum Prüfen', 'mehr Übungen', 'weitere Erklärungen', 'Sonstiges: ______'];

  // Linien-Icons für die neuen Felder (Präsentation, Bewertung, Aufgaben-Evaluation) im Stil der Block-Icons
  const SVG = {
    praesentation: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h18"/><path d="M4 4v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4"/><path d="M12 16v4"/><path d="M9 20h6"/><path d="M8 12l3-3 2 2 3-3"/></svg>',
    bewertung: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="6"/><path d="M9 14.5 7.5 21 12 18.5 16.5 21 15 14.5"/><path d="M10 9l1.5 1.5L14.5 7.5"/></svg>',
    evaluation: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v2h6V3"/><path d="M8.5 10h1"/><path d="M12 10h3.5"/><path d="M8.5 14h1"/><path d="M12 14h3.5"/><path d="M8.5 18h7"/></svg>'
  };

  // Anweisungssprache nach Lernjahr: FS LJ 1–4 zweisprachig, ab LJ 5 nur Französisch; MM: Deutsch immer, Chinesisch zusätzlich, wenn eingetragen
  const zweisprachig = (sheet, de, immer) => de && (sheet.fach === 'mm' || Number(sheet.lernjahr) <= 4 || immer);

  function zeilen(n, modus, name) {
    if (modus === 'schueler') return `<textarea class="sch-ta" name="${name}" rows="${Math.max(1, n)}" aria-label="Antwort"></textarea>`;
    return '<div class="lin">' + '<div></div>'.repeat(Math.max(1, n)) + '</div>';
  }
  const kasten = (an, modus, name, label) => modus === 'schueler'
    ? `<label class="ck"><input type="checkbox" name="${name}"${an ? ' checked' : ''}> ${label}</label>`
    : `<span class="ck"><span class="bx${an ? ' an' : ''}"></span> ${label}</span>`;
  const klein = s => s ? ` <small>${zh(s)}</small>` : '';   // nur für MM-Pinyin bzw. deutsche FS-Wörter ohne Akzente

  // Anweisung: FS Französisch fett + Deutsch; MM Deutsch fett + Chinesisch (Hanzi/Pinyin) darunter
  function anweisung(sheet, ziel, de, immer) {
    const M = marke(sheet);
    if (sheet.fach === 'mm') return (de ? `<div class="fr">${zh(de)}</div>` : '') + (ziel ? `<div class="de zs">${zh(ziel)}</div>` : '');
    return `<div class="fr">${M.T(ziel)}</div>` + (zweisprachig(sheet, de, immer) ? `<div class="de">${fmt(de)}</div>` : '');
  }

  function bloc(sheet, o) {
    const A = o.asset, M = marke(sheet), z = [];
    const row = (icon, lab, inhalt, svg) => z.push(`<div class="br"><div class="bi">${svg ? `<span class="svgi">${SVG[svg]}</span>` : `<img src="${A('block/' + M.pre + '-block-' + icon + '.png')}" alt="">`}</div>`
      + `<div class="bl"><b>${lab[0]}</b><span>${lab[1]}</span></div><div class="bc">${inhalt}</div></div>`);
    const a = sheet.aufgabe || {};
    row('auftrag', M.f.auftrag, anweisung(sheet, a.fr, a.de, true) + `<div class="opt">${kasten(a.art !== 'wahl', 'druck', '', M.pflicht)} ${kasten(a.art === 'wahl', 'druck', '', M.wahl)}</div>`);
    if (sheet.lernziel && (sheet.lernziel.fr || sheet.lernziel.de)) row('ziel', M.f.ziel, anweisung(sheet, sheet.lernziel.fr, sheet.lernziel.de, true));
    row('zeit', M.f.zeit, `<div class="fr">${esc(sheet.zeit || '')}</div>`);
    row('sozialform', M.f.sozial, '<div class="opt">' + Object.entries(M.sozial).map(([k, v]) =>
      `<span class="ck"><span class="bx${(sheet.sozial || []).includes(k) ? ' an' : ''}"></span><img class="mi" src="${A('block/' + M.pre + '-block-' + SOZIAL_ICON[k] + '.png')}" alt=""> ${v[0]}${klein(v[1])}</span>`).join(' ') + '</div>');
    row('arbeitsmittel', M.f.medium, '<div class="opt">' + Object.entries(M.medium).map(([k, v]) =>
      `<span class="ck"><span class="bx${(sheet.medium || []).includes(k) ? ' an' : ''}"></span><img class="mi" src="${A('block/' + M.pre + '-block-' + MEDIUM_ICON[k] + '.png')}" alt=""> ${v[0]}${klein(v[1])}</span>`).join(' ') + '</div>');
    row('ki', M.f.ki, '<div class="opt">' + ['erlaubt', 'verboten'].map(k =>
      `<span class="ck"><span class="bx${sheet.ki === k ? ' an' : ''}"></span><img class="mi" src="${A('block/' + M.pre + '-block-ki-' + k + '.png')}" alt=""> ${M.T(M.ki[k])}</span>`).join(' ') + '</div>');
    if (sheet.methode) row('methode', M.f.methode, `<div class="de">${M.D(sheet.methode)}</div>`);
    const vor = `<div class="blk"><div class="bh">${M.bh.vor[0]} <span>${neben(sheet)(M.bh.vor[1])}</span></div>${z.join('')}</div>`;
    z.length = 0;
    const ab = sheet.abgabe || {};
    row('abgabe', M.f.abgabe, `<div class="fr">${M.D(ab.format || '')}</div>` + (ab.termin ? `<div class="de">${M.bis} ${esc(ab.termin)}</div>` : ''));
    row('', M.f.praes, '<div class="opt">' + Object.entries(M.praes).map(([k, v]) =>
      `<span class="ck"><span class="bx${(sheet.praesentation || []).includes(k) ? ' an' : ''}"></span> ${v[0]}${v[1] ? ` <small>${v[1]}</small>` : ''}</span>`).join(' ') + '</div>', 'praesentation');
    if ((sheet.kriterien || []).length) row('kriterien', M.f.kriterien, '<ul class="kr">' + sheet.kriterien.map(k => `<li>${M.D(k)}</li>`).join('') + '</ul>');
    const bw = sheet.bewertung || {}, arten = bw.arten || [];
    row('', M.f.bewertung, '<div class="opt">' + Object.entries(M.bewertung).map(([k, v]) =>
      `<span class="ck"><span class="bx${arten.includes(k) ? ' an' : ''}"></span> ${v[0]}${v[1] ? ` <small>${v[1]}</small>` : ''}</span>`).join(' ') + '</div>'
      + (arten.includes('punkte') ? `<div class="de">Punkte: ${punkteSumme(sheet)} · Notenschlüssel 90 / 75 / 60 / 45 / 25 %</div>` : ''), 'bewertung');
    const nach = `<div class="blk"><div class="bh">${M.bh.nach[0]} <span>${neben(sheet)(M.bh.nach[1])}</span></div>${z.join('')}</div>`;
    return vor + nach;
  }
  const punkteSumme = s => (s.uebungen || []).reduce((a, u) => a + (Number(u.punkte) || 0), 0);

  // Lücken {{Lösung|Variante}}; Breite nach Länge (Hanzi breiter)
  function lueckenHTML(text, o, nr, T, z) {
    let i = 0;
    return T(text).replace(/\{\{(.+?)\}\}/g, (_, l) => {
      i++;
      const roh = l.replace(/<[^>]+>/g, ''), loes = roh.split('|')[0];
      if (o.modus === 'loesung') return `<span class="lsg">${T(loes)}</span>`;
      const hz = (loes.match(/[㐀-鿿]/g) || []).length;
      const w = Math.min(60, Math.max(14, hz * 6.5 + (loes.length - hz) * 2.4 + 6));
      if (o.modus === 'schueler') return `<input class="sch-in" name="u${nr}-l${z || ''}${i}" style="width:${w}mm" aria-label="Lücke ${i}">`;
      return `<span class="gap" style="width:${w}mm"></span>`;
    });
  }
  // MM-Zeile „Hanzi || Pinyin || Deutsch“
  function mmZeile(s, o, nr, idx) {
    const [hz, py, de] = String(s).split('||').map(x => x.trim());
    return `<div class="zz">${lueckenHTML(hz, o, nr, zh, idx + 'h')}</div>` + (py ? `<div class="zp">${lueckenHTML(py, o, nr, zh, idx + 'p')}</div>` : '') + (de ? `<div class="zd">${esc(de)}</div>` : '');
  }
  const loesText = (s, T) => String(s || '').split('|').map(x => x.split('||').map((t, k) => k ? `<span class="zp">${T(t.trim())}</span>` : T(t.trim())).join(' ')).join(' / ');

  function uebung(u, nr, sheet, o) {
    const m = o.modus, A = o.asset, d = u.daten || {}, M = marke(sheet), T = M.T, mm = sheet.fach === 'mm';
    const icon = u.icon || UEBUNGSTYPEN[u.typ] || 'dokument';
    let body = '';
    if (u.typ === 'luecken') {
      const saetze = d.saetze && d.saetze.length ? d.saetze : null;
      body = saetze ? '<ol class="sz">' + saetze.map((s, i) => `<li>${mm ? mmZeile(s, o, nr, i) : lueckenHTML(s, o, nr, T)}</li>`).join('') + '</ol>' : `<p class="lt">${lueckenHTML(d.text || '', o, nr, T)}</p>`;
    } else if (u.typ === 'zuordnen') {
      const paare = d.paare || [], buch = 'abcdefghijklmnop';
      // rechte Spalte in fester, gemischter Reihenfolge (Reihenfolge aus d.mischung oder versetzt)
      const n = paare.length, ggt = (x, y) => y ? ggt(y, x % y) : x;
      const reihe = d.mischung || (ggt(3, n) === 1 ? paare.map((_, i) => (i * 3 + 1) % n) : paare.map((_, i) => (2 * n - i + 1) % n));   // immer eine Permutation
      const rechts = reihe.map(i => paare[i] ? paare[i][1] : '');
      const loesBuch = paare.map((_, i) => buch[reihe.indexOf(i)]);
      body = '<div class="zo"><ol class="zl">' + paare.map((p, i) => `<li><span class="zx">${m === 'loesung' ? `<span class="zb lsg">${loesBuch[i]}</span>`
        : m === 'schueler' ? `<input class="sch-in kurz" name="u${nr}-z${i}" maxlength="2" aria-label="Buchstabe">` : '<span class="zb"></span>'}</span> ${T(p[0])}</li>`).join('')
        + '</ol><ol class="zr" type="a">' + rechts.map(r => `<li>${T(r)}</li>`).join('') + '</ol></div>';
    } else if (u.typ === 'uebersetzen' || u.typ === 'fragen') {
      body = '<ol class="sz">' + (d.saetze || []).map((s, i) => `<li><div>${mm ? zh(s[0]) : u.typ === 'uebersetzen' ? fmt(s[0]) : fr(s[0])}</div>`
        + (m === 'loesung' ? `<div class="lsg blk2">${loesText(s[1], T)}</div>` : (d.papier === 'kaestchen' && m !== 'schueler' ? kaestchen(d.zeilen || 1) : zeilen(d.zeilen || 2, m, `u${nr}-s${i}`))) + '</li>').join('') + '</ol>';
    } else if (u.typ === 'zeichen') {
      const n = Math.max(1, Math.min(10, d.kaestchen || 6));
      body = '<table class="zt">' + (d.zeichen || []).map(z => `<tr><td class="zc"><span class="hz">${esc(z[0])}</span></td><td class="zi"><span class="py">${esc(z[1] || '')}</span><br><span class="zd">${esc(z[2] || '')}</span></td>`
        + (m === 'loesung' ? '' : '<td class="zk">' + Array.from({ length: n }, (_, k) => `<span class="tz">${k === 0 ? `<span class="hz nach">${esc(z[0])}</span>` : ''}</span>`).join('') + '</td>') + '</tr>').join('') + '</table>';
    } else if (u.typ === 'schreiben') {
      const papier = d.papier === 'kaestchen' && m !== 'schueler' ? kaestchen(d.zeilen || 8) : zeilen(d.zeilen || 10, m, `u${nr}-t`);
      body = ((d.checkliste || []).length ? '<div class="chk"><b>Checkliste</b>' + d.checkliste.map((c, i) => `<div>${kasten(false, m === 'schueler' ? 'schueler' : 'druck', `u${nr}-c${i}`, M.D(c))}</div>`).join('') + '</div>' : '')
        + (m === 'loesung' ? (d.muster ? `<div class="lsg blk2">${T(d.muster)}</div>` : '<div class="de">individuelle Lösung</div>') : papier);
    } else {
      body = (d.text ? `<p>${T(d.text)}</p>` : '') + (m === 'loesung' ? (d.loesung ? `<div class="lsg blk2">${T(d.loesung)}</div>` : '') : zeilen(d.zeilen || 4, m, `u${nr}-f`));
    }
    const bw = (sheet.bewertung || {}).arten || [];
    const rechts = [u.zeit ? `${esc(u.zeit)} min` : '', bw.includes('punkte') && u.punkte ? `${m === 'loesung' ? '' : '___ / '}${esc(u.punkte)} P.` : '', u.niveau ? '★'.repeat(u.niveau) : ''].filter(Boolean).join(' · ');
    return `<section class="ue"><div class="uk"><div class="un">${nr}</div><img src="${A('icons/' + M.pre + '-icon-' + icon + '.png')}" alt="">`
      + `<div class="ua">${anweisung(sheet, u.fr, u.de)}</div><div class="up">${rechts}</div></div>${body}</section>`;
  }
  // Kästchenpapier für Hanzi (Reihen à 11 mm)
  const kaestchen = n => `<div class="kp" style="height:${Math.max(1, n) * 11}mm"></div>`;

  function raster(sheet, o) {
    const bw = sheet.bewertung || {}, M = marke(sheet);
    if (!(bw.arten || []).includes('raster') || !(bw.raster || []).length) return '';
    const selbst = (bw.arten || []).includes('selbst');
    const kopf = ['Kriterium', 'Stufe 4', 'Stufe 3', 'Stufe 2', 'Stufe 1'];
    return `<div class="blk"><div class="bh">${M.bh.raster[0]} <span>${neben(sheet)(M.bh.raster[1])}${selbst ? ' · S = selbst, P = Partner, L = Lehrkraft' : ''}</span></div><table class="rst"><tr>${kopf.map(k => `<th>${k}</th>`).join('')}</tr>`
      + bw.raster.map(r => `<tr><td><b>${M.D(r.kriterium)}</b></td>` + (r.stufen || []).slice(0, 4).map(s => `<td>${M.D(s)}${selbst ? '<div class="spl"><span>S ☐</span><span>P ☐</span><span>L ☐</span></div>' : ''}</td>`).join('') + '</tr>').join('') + '</table></div>';
  }

  function nachher(sheet, o) {
    if (o.modus === 'loesung') return '';
    const m = o.modus, r = sheet.reflexion || {}, z = [], M = marke(sheet), P = M.pre;
    const skz = (t, name) => `<tr><td>${t}</td>` + M.skala.map((s, i) => `<td class="sk">${m === 'schueler' ? `<input type="radio" name="${name}" value="${i}" aria-label="${s}">` : '<span class="bx"></span>'}<small>${s}</small></td>`).join('') + '</tr>';
    const titel = (bild, t, svg) => `<div class="rt">${svg ? `<span class="svgi">${SVG[svg]}</span>` : `<img src="${o.asset('block/' + P + '-block-' + bild + '.png')}" alt="">`} ${M.T(t[0])} <span>${neben(sheet)(t[1])}</span></div>`;
    const thema = sheet.thema || 'dieses Thema';
    if (r.prozess !== false) {
      z.push(`<div class="rf">${titel('reflexion-prozess', M.r.prozess)}`
        + `<div class="rq">Ich habe die Aufgaben gewissenhaft erledigt. ${kasten(false, m, 'r-gew-j', M.ja)} ${kasten(false, m, 'r-gew-n', M.nein)} – wenn nein, warum?</div>${zeilen(1, m, 'r-gew-t')}`
        + `<div class="rq">Ich habe alle meine Fragen gestellt. ${kasten(false, m, 'r-fr-j', M.ja)} ${kasten(false, m, 'r-fr-n', M.nein)} – wenn nein: Wen frage ich bis wann?</div>${zeilen(1, m, 'r-fr-t')}`
        + `<div class="rq">Was brauche ich noch zu „${neben(sheet)(thema)}“, um sicher zu sein? ${BRAUCHE.map((b, i) => kasten(false, m, 'r-br' + i, b)).join(' ')}</div>`
        + `<div class="rq">Was hat mich am gewissenhaften, effektiven Lernen gehindert? ${HINDERNISSE.map((b, i) => kasten(false, m, 'r-hi' + i, b)).join(' ')}</div></div>`);
    }
    if (r.ergebnis !== false) {
      z.push(`<div class="rf">${titel('reflexion-ergebnis', M.r.ergebnis)}`
        + `<table class="skt">${skz('Ich bin mit meinem Einsatz und dem Gelernten zufrieden.', 'r-zuf')}${skz('Mein Ergebnis erfüllt die ' + (P === 'mm' ? 'Erfolgskriterien.' : 'Qualitätskriterien.'), 'r-krit')}</table>`
        + `<div class="rq">ja → Mein Tipp für andere · nein → Woran lag es?</div>${zeilen(1, m, 'r-tipp')}`
        + `<div class="rq">Beim nächsten Mal nehme ich mir vor … – und daran sieht man es:</div>${zeilen(2, m, 'r-vors')}</div>`);
    }
    if (sheet.evaluation !== false) {
      z.push(`<div class="rf">${P === 'mm' ? titel('rueckmeldung', M.r.eval) : titel('', M.r.eval, 'evaluation')}`
        + `<table class="skt">${M.eval.map((e, i) => skz(P === 'mm' ? esc(e[0]) : `${F(e[0])} <small>${e[1]}</small>`, 'e' + i)).join('')}</table>`
        + `<div class="rq">Das würde ich an der Aufgabe ändern:</div>${zeilen(2, m, 'e-aend')}</div>`);
    }
    const weiter = sheet.weiter ? `<div class="rf">${titel('weiter', M.r.weiter)}<div class="de">${M.D(sheet.weiter)}</div></div>` : '';
    const bw = (sheet.bewertung || {}).arten || [];
    const fb = bw.includes('feedback') ? `<div class="rf">${titel(P === 'mm' ? 'ergebnis' : 'rueckmeldung', M.r.feedback)}${zeilen(3, 'druck')}</div>` : '';
    return `<div class="blk nach"><div class="bh">${M.bh.fertig[0]} <span>${neben(sheet)(M.bh.fertig[1])}</span></div>${z.join('')}${fb}${weiter}`
      + `<div class="bsp">Besprechung: gemeinsam im Plenum und/oder im Einzel-Feedbackgespräch</div></div>`;
  }

  function kopf(sheet, o) {
    const M = marke(sheet), K = M.kopf;
    const titel = sheet.titel || K.titel;
    return `<header class="kf"><img class="logo" src="${o.asset(M.logo)}" alt="${M.name}"><div class="kt"><h1>${M.T(titel)}${o.modus === 'loesung' ? K.loesung : ''}</h1>`
      + `<div class="km">${K.fach} · ${esc(sheet.lernjahr)}. Lernjahr · ${sheet.fach === 'mm' ? '' : 'Klasse '}${esc(sheet.klasse || '')} · ${M.D(sheet.thema || '')}</div></div>`
      + `<div class="kz"><small>${K.zeit}</small><b>${esc(sheet.zeit || '')}</b></div></header>`
      + (o.modus === 'loesung' ? '' : `<div class="nm">${K.name} ${o.modus === 'schueler' ? '<input class="sch-in" name="name" style="width:70mm" aria-label="Name">' : '<span class="gap" style="width:80mm"></span>'}   ${K.datum} <span class="gap" style="width:30mm"></span></div>`);
  }

  function render(sheet, opt) {
    const o = Object.assign({ modus: 'druck', asset: n => 'assets/' + n }, opt || {}), M = marke(sheet);
    const ue = (sheet.uebungen || []).map((u, i) => uebung(u, i + 1, sheet, o)).join('');
    return `<article class="fsb fsb-${o.modus}${sheet.fach === 'mm' ? ' mm' : ''}" lang="${M.lang}">${kopf(sheet, o)}${o.modus === 'loesung' ? '' : bloc(sheet, o) + raster(sheet, o)}`
      + `<div class="ueh">${M.bh.ue[0]} <span>${neben(sheet)(M.bh.ue[1])}</span></div>${ue}${nachher(sheet, o)}`
      + `<footer class="ff">${M.name} · ${esc(sheet.klasse || '')} · ${M.D(sheet.thema || '')}</footer></article>`;
  }

  // Blattgestaltung: FS (Bleu marine #1C2B5A, Rouge #E2383F, Bleu clair #EEF2FA, Fredoka/Nunito); MM überschreibt in .fsb.mm
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
.fsb .ue{margin:4mm 0}.fsb .uk{break-after:avoid}.fsb ol.sz>li,.fsb .chk,.fsb .zo,.fsb .zt tr{break-inside:avoid}.fsb .uk{display:grid;grid-template-columns:7mm 9mm 1fr auto;gap:2.5mm;align-items:start;border-top:1.2pt solid var(--navy);padding-top:2mm;margin-bottom:2mm}
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
.fsb input[type=checkbox],.fsb input[type=radio]{accent-color:var(--navy)}
.fsb .zt td{border-bottom:.5pt solid #DDE2EC;padding:1.5mm 2mm;vertical-align:middle}.fsb .zc{width:16mm;text-align:center}.fsb .zc .hz{font-size:26pt;line-height:1}.fsb .zi{width:34mm;font-size:9pt}
.fsb .tz{display:inline-block;width:13mm;height:13mm;margin:0 .8mm .8mm 0;border:.8pt solid var(--linie);position:relative;vertical-align:middle;
  background:linear-gradient(to right,transparent calc(50% - .3pt),#D5DAE4 calc(50% - .3pt),#D5DAE4 calc(50% + .3pt),transparent calc(50% + .3pt)),linear-gradient(to bottom,transparent calc(50% - .3pt),#D5DAE4 calc(50% - .3pt),#D5DAE4 calc(50% + .3pt),transparent calc(50% + .3pt))}
.fsb .tz .hz.nach{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:24pt;opacity:.22}
.fsb .kp{background-image:linear-gradient(to right,var(--linie) .6pt,transparent .6pt),linear-gradient(to bottom,var(--linie) .6pt,transparent .6pt);background-size:11mm 11mm;border-right:.6pt solid var(--linie);border-bottom:.6pt solid var(--linie);width:calc(11mm * 16)}
.fsb .zz{line-height:2.1}.fsb .zp{font-size:10pt}.fsb .zd{font-size:9pt;color:#111}
.fsb.mm{--navy:#039A9A;--rouge:#039A9A;--clair:#E6F5F5;--grau:#5C5C5C;--linie:#A9C9C9;font-family:'Helvetica Neue',Helvetica,Arial,'Noto Sans',sans-serif;color:#111}
.fsb.mm h1,.fsb.mm .kz,.fsb.mm .ueh,.fsb.mm .un,.fsb.mm .rt{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:700}
.fsb.mm .ueh span,.fsb.mm .rt span,.fsb.mm .bh span{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif}
.fsb.mm .logo{width:30mm}.fsb.mm .kf{grid-template-columns:30mm 1fr 24mm}
.fsb.mm .bh{background:var(--clair);color:var(--navy);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:700;border-bottom:1pt solid var(--navy)}.fsb.mm .bh span{opacity:1;color:#111}
.fsb.mm .blk{border-width:1.5pt}.fsb.mm .br{border-top-color:#CFE6E6}.fsb.mm .de{color:#111}.fsb.mm .lsg{color:#111;text-decoration-color:var(--navy)}
.fsb.mm .sch-in{background:#F2FAFA;color:#111}.fsb.mm .sch-ta{color:#111;background:repeating-linear-gradient(#fff 0 7.4mm,#CFE6E6 7.4mm 7.6mm)}
.fsb .hz{font-family:'MM Kai','Kaiti SC','STKaiti','KaiTi','Kaiti TC','LXGW WenKai',serif;color:#B02418;font-size:1.3em;font-weight:400}
.fsb .py{color:#2271FF;font-size:1.06em}.fsb small .py,.fsb .bl .py,.fsb .bh .py,.fsb .rt .py,.fsb .ck small .py,.fsb .zi .py{color:#1A5CD8}
.fsb.mm .zs{font-weight:400;margin-top:.5mm}.fsb.mm .zs .hz{font-size:1.25em}
@media print{.fsb .blk:not(.nach),.fsb .rf{break-inside:avoid}}
`;

  function standalone(sheet, opt) {
    const o = Object.assign({ modus: 'schueler' }, opt || {}), M = marke(sheet), mm = sheet.fach === 'mm';
    const fonts = (o.fontFredoka ? `@font-face{font-family:Fredoka;src:url(${o.fontFredoka}) format('truetype');font-weight:300 700}` : '')
      + (o.fontNunito ? `@font-face{font-family:Nunito;src:url(${o.fontNunito}) format('truetype');font-weight:200 1000}` : '')
      + (o.fontHanzi ? `@font-face{font-family:'MM Kai';src:url(${o.fontHanzi}) format('truetype')}` : '');
    const key = (mm ? 'mmb-' : 'fsb-') + (sheet.id || 'blatt');
    const farbe = mm ? '#039A9A' : '#1C2B5A';
    return `<!doctype html><html lang="${M.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(sheet.titel || M.kopf.titel)} – ${M.name}</title>
<style>${fonts}${CSS}
body{margin:0;background:${mm ? '#E6F0F0' : '#E9EDF5'}}.wrap{background:#fff;max-width:200mm;margin:0 auto;padding:12mm 10mm 16mm;min-height:100vh}
.leiste{position:sticky;top:0;z-index:5;background:${farbe};color:#fff;font-family:${mm ? "'Helvetica Neue',Helvetica,Arial" : 'Nunito'},sans-serif;font-size:14px;display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center;justify-content:center;padding:8px 16px}
.leiste button{font:inherit;font-weight:700;background:#fff;color:${farbe};border:0;border-radius:6px;padding:6px 14px;cursor:pointer}.leiste button:focus-visible{outline:3px solid ${mm ? '#111' : '#E2383F'};outline-offset:2px}.leiste .st{opacity:.85}
@media print{body{background:#fff}.leiste{display:none}.wrap{padding:0;max-width:none}@page{size:A4;margin:14mm 14mm 16mm}.fsb .sch-ta{border:0;resize:none;overflow:hidden}.fsb .sch-in{background:none}}
@media (max-width:600px){.wrap{padding:16px}.fsb .br{grid-template-columns:7mm 1fr}.fsb .br .bc{grid-column:1/-1}.fsb .zo{grid-template-columns:1fr}.fsb .kf{grid-template-columns:1fr}.fsb .kp{width:100%}}
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

  // alle Hanzi eines Blatts (für Schrift-Teilmengen beim Einbetten)
  const zeichenListe = sheet => [...new Set((JSON.stringify(sheet).match(/[㐀-鿿　-〿！-～]/g) || []).concat('开始以前成果完成以后练习评分标准'.split('')))].join('');

  const api = { render, standalone, CSS, F, esc, zh, istCJK, zeichenListe, MARKE, UEBUNGSTYPEN, SOZIAL, MEDIUM, PRAES, BEWERTUNG, punkteSumme };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.FSBlatt = api;
})(typeof window !== 'undefined' ? window : globalThis);
