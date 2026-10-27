// Supabase-Anbindung der Selbstreflexion. Der Publishable key darf öffentlich sein:
// Schüler können damit nur Antworten absenden (Regel „absenden“), lesen darf nur die angemeldete Lehrkraft.
window.SPEICHER = {
  url: 'https://cbjpdeebckcpmktaargm.supabase.co',
  key: 'sb_publishable_lTkEIsAbPvOT_5gwKRuRCQ_JJQK8tSf',
  async senden(d) {
    const r = await fetch(this.url + '/rest/v1/reflexion', {
      method: 'POST',
      headers: { apikey: this.key, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ bogen: d.bogen, klasse: d.klasse, name: d.name, daten: d })
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
  },
  async anmelden(email, passwort) {
    const r = await fetch(this.url + '/auth/v1/token?grant_type=password', {
      method: 'POST', headers: { apikey: this.key, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: passwort })
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.access_token) throw new Error(j.error_description || j.msg || 'Anmeldung fehlgeschlagen');
    return j.access_token;
  },
  async laden(token, bogen) {
    const r = await fetch(`${this.url}/rest/v1/reflexion?bogen=eq.${encodeURIComponent(bogen)}&select=id,erstellt,daten&order=erstellt.asc`, {
      headers: { apikey: this.key, Authorization: 'Bearer ' + token }
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return (await r.json()).map(z => Object.assign({}, z.daten, { _id: z.id, zeit: z.daten.zeit || z.erstellt }));
  }
};
