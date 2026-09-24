'use strict';
// ===== Clan: Startaufstellung, Simulation, Ereignisse, Aufträge =====
function L(base, stripe, white, eye, extra) { return Object.assign({ base, stripe: stripe || null, white: white || 0, eye: eye || '#e8b923', long: false, patch: null, size: 1 }, extra || {}); }
function createStartCats() {
  const defs = [
    { id: 'sammy', fixed: 'Sammy', pre: 'Feuer', suf: 'herz', rank: 'hauskaetzchen', clan: 'haus', age: 6, sex: 'm', look: L('#e2762a', '#c25a1c', 0, '#6fc23a'), sk: { jagd: 0, kampf: 0, ausdauer: 0, tempo: 1 }, storyLock: true },
    { id: 'wulle', fixed: 'Wulle', rank: 'hauskaetzchen', clan: 'haus', age: 14, sex: 'm', look: L('#1e1c1c', null, 0.6, '#e8b923', { size: 1.08, fat: true }) },
    { id: 'blaustern', pre: 'Blau', suf: 'stern', rank: 'anfuehrer', age: 110, sex: 'w', look: L('#7d8fa3', null, 0.15, '#4fa3d9', { muzzle: '#c9d2dc', size: 1.02 }), storyLock: true },
    { id: 'loewenherz', pre: 'Löwen', suf: 'herz', rank: 'krieger', age: 70, sex: 'm', look: L('#d9a84a', '#b8842e', 0, '#79b94a', { long: true, mane: true, size: 1.15 }), storyLock: true },
    { id: 'tigerkralle', pre: 'Tiger', suf: 'kralle', rank: 'krieger', age: 60, sex: 'm', look: L('#5a3e26', '#1e120a', 0, '#e8a020', { size: 1.25, earS: 0.9 }), storyLock: true },
    { id: 'tuepfelblatt', pre: 'Tüpfel', suf: 'blatt', rank: 'heiler', age: 30, sex: 'w', look: L('#b56a3a', null, 0.32, '#e8b923', { patch: '#2b2220', size: 0.92 }), storyLock: true },
    { id: 'weisspelz', pre: 'Weiß', suf: 'pelz', rank: 'krieger', age: 80, sex: 'm', look: L('#f0f0ec', null, 0, '#e8b923', { size: 1.15, long: true }), storyLock: true },
    { id: 'dunkelstreif', pre: 'Dunkel', suf: 'streif', rank: 'krieger', age: 50, sex: 'm', look: L('#4a4a50', '#1a1a1e', 0, '#e8b923') },
    { id: 'langschweif', pre: 'Lang', suf: 'schweif', rank: 'krieger', age: 30, sex: 'm', look: L('#e0d6ba', '#2a2420', 0, '#d98b2b', { tailL: 1.3 }), rel: 20 },
    { id: 'mausefell', pre: 'Mause', suf: 'fell', rank: 'krieger', age: 45, sex: 'w', look: L('#6e5040', null, 0, '#d98b2b', { size: 0.88 }) },
    { id: 'graupfote', pre: 'Grau', suf: 'streif', rank: 'schueler', age: 7, sex: 'm', look: L('#7e7e84', null, 0, '#e8b923', { long: true, dorsal: '#4a4a52', size: 1.08 }), rel: 70, storyLock: true, mentor: 'loewenherz' },
    { id: 'sandpfote', pre: 'Sand', suf: 'sturm', rank: 'schueler', age: 8, sex: 'w', look: L('#e8c08a', null, 0, '#7bc043'), rel: 35, mentor: 'weisspelz', storyLock: true },
    { id: 'staubpfote', pre: 'Staub', suf: 'fell', rank: 'schueler', age: 8, sex: 'm', look: L('#6a4a32', '#3a2414', 0, '#d98b2b'), rel: 30, mentor: 'dunkelstreif' },
    { id: 'rabenpfote', pre: 'Raben', suf: 'flug', rank: 'schueler', age: 9, sex: 'm', look: L('#18181c', null, 0.32, '#e8b923', { size: 0.9, tailtip: true }), storyLock: true, mentor: 'tigerkralle' },
    { id: 'frostfell', pre: 'Frost', suf: 'fell', rank: 'koenigin', age: 40, sex: 'w', look: L('#f4f4f6', null, 0, '#4fa3d9') },
    { id: 'buntgesicht', pre: 'Bunt', suf: 'gesicht', rank: 'koenigin', age: 38, sex: 'w', look: L('#9a9a9a', '#6a6a6a', 0, '#7bc043') },
    { id: 'goldbluete', pre: 'Gold', suf: 'blüte', rank: 'koenigin', age: 36, sex: 'w', look: L('#e0a850', '#c08830', 0, '#e8b923', { long: true }) },
    { id: 'kleinohr', pre: 'Klein', suf: 'ohr', rank: 'aeltester', age: 140, sex: 'm', look: L('#8a8a92', null, 0, '#e8b923', { earS: 0.6, size: 0.9 }) },
    { id: 'einauge', pre: 'Ein', suf: 'auge', rank: 'aeltester', age: 150, sex: 'w', look: L('#b0a8a0', null, 0, '#e8b923') },
    { id: 'halbschweif', pre: 'Halb', suf: 'schweif', rank: 'aeltester', age: 135, sex: 'm', look: L('#5a3a22', '#2a1a0e', 0, '#d98b2b', { tailL: 0.5 }) },
    { id: 'fleckenschweif', pre: 'Flecken', suf: 'schweif', rank: 'aeltester', age: 145, sex: 'w', look: L('#b56a3a', null, 0, '#e8b923', { patch: '#2b2220' }) },
    { id: 'rotschweif', pre: 'Rot', suf: 'schweif', rank: 'zweiter', age: 80, sex: 'm', alive: false, look: L('#b0582a', '#7a3010', 0, '#e8b923') },
    { id: 'aschenjunges', pre: 'Ruß', suf: 'pelz', rank: 'junges', age: 3, sex: 'w', look: L('#6e6e74', null, 0, '#4fa3d9'), storyLock: true, mother: 'frostfell' },
    { id: 'farnjunges', pre: 'Farn', suf: 'pelz', rank: 'junges', age: 3, sex: 'm', look: L('#b08050', '#7a5030', 0, '#7bc043'), storyLock: true, mother: 'frostfell' },
    { id: 'dornenjunges', pre: 'Dornen', suf: 'kralle', rank: 'junges', age: 3, sex: 'm', look: L('#a07040', '#5a3a1a', 0, '#e8b923'), storyLock: true, mother: 'frostfell' },
    { id: 'prinzessin', fixed: 'Prinzessin', rank: 'hauskaetzchen', clan: 'haus', age: 10, sex: 'w', look: L('#b89468', '#7a5a38', 0.45, '#7bc043'), homePos: { x: LM.prinzessin.x, y: LM.prinzessin.y + 60 } },
    { id: 'gelbzahn', pre: 'Gelb', suf: 'zahn', rank: 'einzel', clan: 'einzel', age: 120, sex: 'w', look: L('#4a4644', null, 0, '#e89020', { long: true, flatface: true }), hidden: true, storyLock: true },
    { id: 'mikusch', fixed: 'Mikusch', rank: 'einzel', clan: 'einzel', age: 60, sex: 'm', look: L('#1e1e1e', null, 0.5, '#e8b923'), hidden: true, home: 'scheune' },
  ];
  for (const d of defs) G.cats.push(makeCat(d));
  for (let i = 0; i < 4; i++) G.cats.push(makeCat({ rank: 'krieger', age: randi(20, 70) }));
  clanCats().forEach((c, i) => { if (isFighterRank(c.rank) && c.rank !== 'anfuehrer') c.duty = i % 3 === 0 ? 'grenze' : 'jagd'; });
  for (const c of G.cats) if (c.alive && !c.hidden) placeAtHome(c);
}
function newOtherClans() {
  return {
    schatten: { leader: 'Braun', lives: 6, str: 28, rel: 35 },
    fluss: { leader: 'Krumm', lives: 5, str: 26, rel: 45 },
    wind: { leader: 'Riesen', lives: 4, str: 22, rel: 60 },
  };
}
const clanLeaderName = k => G.others[k].leader + 'stern';

// ===== Werte =====
function clanStats() {
  const cs = clanCats(), n = cs.length;
  const food = clamp(Math.round(G.clan.pile / Math.max(1, n * 1.6) * 100), 0, 100);
  return { n, food, health: Math.round(G.clan.health), morale: Math.round(G.clan.morale), terr: Math.round(G.clan.terr) };
}
function applyFx(fx, silent) {
  const parts = [];
  const n = Math.max(1, clanCats().length);
  if (fx.food) { G.clan.pile = Math.max(0, G.clan.pile + fx.food * n * 1.6 / 100); parts.push(`Nahrung ${sg(fx.food)}`); }
  if (fx.health) { G.clan.health = clamp(G.clan.health + fx.health, 0, 100); parts.push(`Gesundheit ${sg(fx.health)}`); }
  if (fx.morale) { G.clan.morale = clamp(G.clan.morale + fx.morale, 0, 100); parts.push(`Moral ${sg(fx.morale)}`); }
  if (fx.terr) { G.clan.terr = clamp(G.clan.terr + fx.terr, 0, 100); parts.push(`Territorium ${sg(fx.terr)}`); }
  if (fx.rel) for (const k in fx.rel) { G.others[k].rel = clamp(G.others[k].rel + fx.rel[k], 0, 100); parts.push(`${CLAN_NAMES[k]} ${sg(fx.rel[k])}`); }
  if (fx.rep) { G.player.rep = clamp(G.player.rep + fx.rep, 0, 100); parts.push(`Ansehen ${sg(fx.rep)}`); }
  if (fx.xp) gainXp(P(), fx.xp);
  if (!silent && parts.length) toast(parts.join(' · '));
}
const sg = v => (v > 0 ? '+' : '−') + Math.abs(Math.round(v));

// ===== Tages- und Mondwechsel =====
const Clan = {
  daily() {
    const cs = clanCats(), n = cs.length;
    const hunters = cs.filter(c => (c.rank === 'krieger' || c.rank === 'zweiter' || c.rank === 'schueler') && c.duty === 'jagd' && c !== P()).length;
    const border = cs.filter(c => (c.rank === 'krieger' || c.rank === 'zweiter' || c.rank === 'schueler') && c.duty === 'grenze' && c !== P()).length;
    const rest = cs.filter(c => c.duty === 'lager' && isFighterRank(c.rank)).length;
    const sf = SEASON_PREY[season()];
    const prod = hunters * 1.35 * sf * (0.5 + G.clan.terr / 200) + border * 0.4 * sf;
    const eat = cs.reduce((s, c) => s + (c.rank === 'junges' ? 0.2 : 0.36), 0);
    G.clan.pile = Math.max(0, G.clan.pile + prod - eat);
    const st = clanStats();
    const healers = cs.filter(c => c.rank === 'heiler' || c.rank === 'heilerschueler').length;
    const hT = clamp(45 + healers * 18 + st.food / 5 - (season() === 3 ? 15 : 0) + rest * 2, 0, 100);
    G.clan.health += (hT - G.clan.health) * 0.15;
    const mT = clamp(50 + (st.food - 50) / 3 + (G.clan.health - 50) / 5 + G.player.rep / 10, 0, 100);
    G.clan.morale += (mT - G.clan.morale) * 0.12;
    G.clan.terr = clamp(G.clan.terr + (border >= 3 ? 1 : border >= 1 ? 0 : -1.5), 0, 100);
    for (const k in G.others) G.others[k].rel += (50 - G.others[k].rel) * 0.03;
    G.weather = season() === 3 ? (chance(0.5) ? 'schnee' : null) : (chance(0.25) ? 'regen' : null);
    for (const c of cs) if (c.hurt && chance(0.5)) c.hurt = false;
    for (const c of G.cats) if (c.ai && (c.ai.m === 'patrol')) c.ai = { m: 'home' };
    if (st.food < 25 && G.stage !== 'hauskaetzchen') toast('Der Frischbeutehaufen ist fast leer. Der Clan hungert!');
    G.dayEventDone = false;
  },
  moon() {
    const m = moon();
    toast(`🌕 Ein neuer Mond beginnt (Mond ${m + 1}, ${SEASONS[season()]}).`);
    const cs = clanCats(), leaderPlayer = P().rank === 'anfuehrer';
    for (const c of G.cats) if (c.alive) c.age++;
    // Zeremonien
    for (const c of cs) {
      if (c === P() && (!G.freeplay || c.rank === 'anfuehrer')) continue;
      if (c.rank === 'junges' && c.age >= 6 && !c.storyLock) Clan.queue({ type: 'schueler', id: c.id });
      else if (c.rank === 'schueler' && c.age >= 12 && !c.storyLock) Clan.queue({ type: 'krieger', id: c.id });
      else if (c.rank === 'heilerschueler' && c.age >= 20 && !c.storyLock && !cs.some(k => k.rank === 'heiler')) { setRank(c, 'heiler'); news(`${c.pre}pfote ist jetzt die Heilerkatze ${catName(c)}.`); }
      else if ((c.rank === 'krieger') && c.age >= 100 + hashStr(c.id) * 30 && !c.storyLock) { setRank(c, 'aeltester'); c.duty = 'lager'; news(`${catName(c)} zieht in den Ältestenbau.`); }
      else if (c.rank === 'aeltester' && c.age > 150 && chance(0.18) && !c.storyLock) killCat(c, `${catName(c)} ist friedlich im Schlaf gestorben und jagt nun mit dem SternenClan.`);
      else if (c.rank === 'koenigin' && !cs.some(k => k.rank === 'junges' && k.mother === c.id)) { c.qIdle = (c.qIdle || 0) + 1; if (c.qIdle >= 2) { c.qIdle = 0; if (chance(0.5)) Clan.queue({ type: 'geburt', id: c.id }); else { setRank(c, 'krieger'); news(`${catName(c)} kehrt aus der Kinderstube zurück in den Kriegerbau.`); } } }
      else if (c.rank === 'krieger' && c.sex === 'w' && c.age > 18 && c.age < 80 && chance(0.05) && cs.filter(k => k.rank === 'koenigin').length < 3) { setRank(c, 'koenigin'); news(`${catName(c)} erwartet Junge und zieht in die Kinderstube.`); }
    }
    // andere Clans
    for (const k in G.others) {
      const o = G.others[k];
      o.str = clamp(o.str + randi(-2, 2), 12, 40);
      if (chance(0.07)) {
        o.lives--;
        if (o.lives <= 0) { const old = clanLeaderName(k); o.leader = pick(PREFIXES); o.lives = 9; news(`${old}, Anführer des ${CLAN_NAMES[k]}s, ist gestorben. ${clanLeaderName(k)} führt jetzt den ${CLAN_NAMES[k]}.`, true); }
      }
    }
    // Tigerkralles Rückkehr
    if (G.flags.tigerVerbannt && !G.flags.tigerstern && G.freeplay && m >= G.flags.tigerVerbannt + 3) {
      G.flags.tigerstern = true; G.others.schatten.leader = 'Tiger'; G.others.schatten.lives = 9; G.others.schatten.rel = 15;
      Clan.queue({ type: 'event', id: 'tigerstern' });
    }
    if (G.freeplay && leaderPlayer) Missions.add(makeMission('gathering'));
  },
  queue(ev) { G.eventQ.push(ev); },
  // Ereignisse nacheinander anzeigen (nur wenn nichts los ist)
  process() {
    if (Dlg.open || UI.panel || !G.eventQ.length) return;
    if (nearestFoe(P(), 600)) return;
    const ev = G.eventQ.shift();
    const leaderPlayer = P().rank === 'anfuehrer';
    const c = ev.id ? catById(ev.id) : null;
    if (ev.type === 'schueler') { if (c && c.alive && c.rank === 'junges') ceremonyApprentice(c, leaderPlayer); }
    else if (ev.type === 'krieger') { if (c && c.alive && c.rank === 'schueler') ceremonyWarrior(c, leaderPlayer); }
    else if (ev.type === 'geburt') { if (c && c.alive) birth(c, leaderPlayer); }
    else if (ev.type === 'event') { const E = EVENTS.find(e => e.id === ev.id); if (E) runEvent(E); }
  },
  morning() {
    if (!G.freeplay || P().rank !== 'anfuehrer' || G.dayEventDone) return;
    G.dayEventDone = true;
    if (!chance(0.55)) return;
    const opts = EVENTS.filter(e => !e.special && (!e.when || e.when()) && !(G.evSeen[e.id] > day() - 4));
    if (!opts.length) return;
    const E = pick(opts); G.evSeen[E.id] = day();
    Clan.queue({ type: 'event', id: E.id });
  }
};
function news(text, quiet) { toast(text); chron(text); }
function killCat(c, text) {
  c.alive = false; c.deathMoon = moon();
  if (c.clan === 'donner' && c !== P()) addVigil(c);
  if (c.ai) c.ai = { m: 'home' };
  if (text) news(text);
  for (const k of G.cats) { if (k.mentor === c.id) k.mentor = null; if (k.ai && k.ai.tgt === c.id) k.ai = { m: 'home' }; }
}
function freeWarriors(n = 3) {
  const cs = clanCats().filter(c => (c.rank === 'krieger' || c.rank === 'zweiter') && !clanCats().some(k => k.mentor === c.id && (k.rank === 'schueler')) && c !== P());
  return shuffle(cs).sort((a, b) => b.lvl - a.lvl).slice(0, n);
}
function ceremonyApprentice(c, leader) {
  const lead = clanCats().find(k => k.rank === 'anfuehrer');
  if (!leader) {
    const m = freeWarriors(1)[0]; setRank(c, 'schueler'); c.mentor = m ? m.id : null; c.storyLock = false;
    news(`${lead ? catName(lead) : 'Der Anführer'} hat ${catName(c)} zum Schüler ernannt${m ? ' – Mentor ist ' + catName(m) : ''}.`);
    return;
  }
  const kitName = catName(c);
  const opts = freeWarriors(3).map(m => ({ t: `${catName(m)} (${rankName(m)}, ${m.age} Monde)`, fn: () => doApp(m) }));
  if (!clanCats().some(k => k.mentor === P().id && k.rank === 'schueler')) opts.push({ t: 'Ich selbst werde Mentor', fn: () => doApp(P()) });
  opts.push({ t: 'Heilerschüler werden lassen', fn: () => { setRank(c, 'heilerschueler'); c.mentor = (clanCats().find(k => k.rank === 'heiler') || {}).id || null; news(`${kitName} wird Heilerschüler und heißt jetzt ${catName(c)}.`); } });
  function doApp(m) {
    setRank(c, 'schueler'); c.mentor = m.id;
    news(`${kitName} heißt jetzt ${catName(c)}. Mentor: ${catName(m)}.`);
    return [['erz', `„${catName(c)}, von diesem Tag an bis zu deinem Kriegernamen heißt du so. ${m === P() ? 'Ich selbst' : catName(m)} werde dich ausbilden.“`], [c.id, 'Ich werde mir große Mühe geben!']];
  }
  Dlg.show([CEREMONY(P().id, [c.id]), ['erz', `${kitName} ist sechs Monde alt geworden. Es ist Zeit für die Schülerzeremonie!`], { who: 'player', text: 'Wer soll Mentor werden?', choices: opts }, CEREMONY_END], null, { cine: true });
}
function ceremonyWarrior(c, leader) {
  const old = catName(c);
  if (!leader) { setRank(c, 'krieger'); news(`${old} ist jetzt ein Krieger und heißt ${catName(c)}!`); return; }
  const sufs = [c.suf].concat(shuffle(SUFFIXES.filter(s => s !== c.suf)).slice(0, 2));
  const canon = c.id.endsWith('junges');
  Dlg.show([
    CEREMONY(P().id, [c.id]),
    ['erz', `${old} hat die Ausbildung abgeschlossen. Der ganze Clan versammelt sich unter dem Hochstein.`],
    ['player', `${old}, versprichst du, das Gesetz der Krieger zu achten und deinen Clan zu beschützen – selbst wenn es dein Leben kostet?`],
    [c.id, 'Ich verspreche es.'],
    { who: 'player', text: 'Welchen Kriegernamen gibst du?', choices: sufs.map(s => ({ t: c.pre + s + (canon && s === c.suf ? ' (wie in den Büchern)' : ''), fn: () => { c.suf = s; setRank(c, 'krieger'); news(`${old} ist jetzt ein Krieger: ${catName(c)}!`); applyFx({ morale: 3 }, true); return [['alle', `${catName(c)}! ${catName(c)}!`], CEREMONY_END]; } })) }
  ], null, { cine: true });
}
function birth(q, leader) {
  const n = randi(1, 3), kits = [];
  for (let i = 0; i < n; i++) { const k = makeCat({ rank: 'junges', age: 0, mother: q.id, look: mixLook(q.look), storyLock: false }); kits.push(k); G.cats.push(k); placeAtHome(k); }
  setRank(q, 'koenigin');
  if (!leader) { news(`${catName(q)} hat ${n} Junge bekommen: ${kits.map(catName).join(', ')}.`); return; }
  const pres = shuffle(PREFIXES.slice()).slice(0, 3);
  Dlg.show([['erz', `Große Freude in der Kinderstube: ${catName(q)} hat ${n === 1 ? 'ein Junges' : n + ' Junge'} bekommen!`],
  [q.id, 'Feuerstern … möchtest du dem Erstgeborenen einen Namen geben?'.replace('Feuerstern', catName(P()))],
  { who: 'player', text: 'Wie soll das Junge heißen?', choices: pres.map(p => ({ t: p + 'junges', fn: () => { kits[0].pre = p; news(`${catName(q)} hat Junge bekommen: ${kits.map(catName).join(', ')}.`); applyFx({ morale: 5 }, true); } })) }]);
}
function mixLook(l) { const r = randomLook(); if (chance(0.6)) { r.base = l.base; r.stripe = chance(0.5) ? l.stripe : r.stripe; } return r; }

// ===== Ereignisse für den Anführer =====
function randWarrior() { return pick(clanCats().filter(c => c.rank === 'krieger' && c !== P())); }
function runEvent(E) {
  const ctx = E.prep ? E.prep() : {};
  if (ctx === false) return;
  const text = typeof E.text === 'function' ? E.text(ctx) : E.text;
  Dlg.show([...(E.pre ? E.pre(ctx) : []), { who: E.who ? E.who(ctx) : 'erz', text, choices: E.choices(ctx).map(ch => ({ t: ch.t, fn: () => { const r = ch.fn(); if (E.log) chron(E.log(ctx, ch.t)); return r; } })) }]);
}
const EVENTS = [
  {
    id: 'beute', when: () => clanStats().food < 50, text: 'Es gibt zu wenig Beute. Die Königinnen haben kaum Milch, und die Ältesten werden dünn. Soll der Clan sein Territorium erweitern?',
    choices: () => [
      { t: 'Grenze Richtung WindClan verschieben', fn: () => { applyFx({ terr: 10, food: 12, rel: { wind: -18 } }); if (chance(0.6)) { Missions.add(makeMission('drive', { team: 'wind', n: 3, at: borderPoint('wind'), title: 'WindClan-Vergeltung' })); return [['erz', 'Der WindClan wird das nicht einfach hinnehmen …']]; } } },
      { t: 'Mehr Jagdpatrouillen losschicken', fn: () => applyFx({ food: 12, morale: -5, health: -3 }) },
      { t: 'Ich jage selbst für den Clan', fn: () => Missions.add(makeMission('hunt', { n: 4 })) },
    ], log: (c, t) => `Hunger im Clan – Entscheidung: ${t}`
  },
  {
    id: 'fremde', prep: () => ({ k: makeCat({ rank: 'krieger', clan: 'einzel', age: randi(15, 50), hidden: true }) }), text: c => `Eine fremde Katze namens ${c.k.pre}${c.k.suf} steht am Lagereingang. Sie bittet darum, dem Clan beizutreten.`,
    choices: c => [
      { t: 'Aufnehmen', fn: () => { const k = c.k; k.clan = 'donner'; k.hidden = false; G.cats.push(k); placeAtHome(k); applyFx({ morale: chance(0.5) ? 4 : -4 }); news(`${catName(k)} wurde in den DonnerClan aufgenommen.`); } },
      { t: 'Nur als Gast für eine Nacht', fn: () => applyFx({ rep: 2 }) },
      { t: 'Wegschicken', fn: () => applyFx({ morale: 1 }) },
    ]
  },
  {
    id: 'hauskatze', text: 'Ein junges Hauskätzchen beobachtet euch vom Waldrand aus. Es möchte ein Clan-Krieger werden – genau wie du damals.',
    choices: () => [
      { t: 'Als Schüler aufnehmen', fn: () => { const k = makeCat({ rank: 'schueler', age: 7, clan: 'donner' }); G.cats.push(k); k.mentor = P().id; placeAtHome(k); applyFx({ morale: -2, rep: 4 }); news(`Das Hauskätzchen wird Schüler: ${catName(k)}. Du bist der Mentor.`); return [[k.id, 'Ich werde dich nicht enttäuschen!']]; } },
      { t: 'Zurück zu den Zweibeinern schicken', fn: () => applyFx({ morale: 2 }) },
    ]
  },
  {
    id: 'streit', prep: () => { const cs = shuffle(clanCats().filter(c => c.rank === 'krieger' && c !== P())); return cs.length >= 2 ? { a: cs[0], b: cs[1] } : false; },
    text: c => `Zwei Krieger streiten: ${catName(c.a)} und ${catName(c.b)} fauchen sich an. Es geht um die beste Beute. Wie löst du den Konflikt?`,
    choices: c => [
      { t: `${catName(c.a)} recht geben`, fn: () => { c.a.rel += 10; c.b.rel -= 12; applyFx({ morale: -2 }); } },
      { t: `${catName(c.b)} recht geben`, fn: () => { c.b.rel += 10; c.a.rel -= 12; applyFx({ morale: -2 }); } },
      { t: 'Beide zusammen auf Patrouille schicken', fn: () => chance(0.6) ? (applyFx({ morale: 6 }), [['erz', 'Nach der Patrouille sind die beiden wieder Freunde.']]) : (applyFx({ morale: -5 }), [['erz', 'Die Patrouille endet mit zerzaustem Fell. Der Streit geht weiter.']]) },
      { t: 'An das Gesetz der Krieger erinnern', fn: () => applyFx({ morale: 3, rep: 2 }) },
    ]
  },
  {
    id: 'husten', when: () => season() === 3 || season() === 2, prep: () => ({ k: randWarrior() }), text: c => `Grüner Husten! ${c.k ? catName(c.k) : 'Eine Katze'} hustet und hat Fieber. Die Krankheit könnte sich ausbreiten.`,
    choices: c => [
      { t: 'Katzenminze holen (Auftrag)', fn: () => Missions.add(makeMission('herbs', { kind: 'katzenminze', n: 2 })) },
      { t: 'Kranke Katzen absondern', fn: () => applyFx({ health: -5, morale: -4 }) },
      { t: 'Abwarten', fn: () => { applyFx({ health: -15 }); if (chance(0.35) && c.k) killCat(c.k, `${catName(c.k)} ist am Grünen Husten gestorben.`); } },
    ]
  },
  {
    id: 'fuchs', prep: () => ({ at: pick(donnerPlaces()) }), text: c => `Ein Fuchs streift durch das Territorium nahe ${c.at.name}!`,
    choices: c => [
      { t: 'Ich führe selbst eine Patrouille an', fn: () => Missions.add(makeMission('beast', { kind: 'fuchs', at: c.at })) },
      { t: 'Krieger schicken', fn: () => { if (chance(0.65)) applyFx({ morale: 3, terr: 2 }); else { const w = randWarrior(); if (w) { w.hurt = true; w.hp = 10; } applyFx({ morale: -4 }); return [['erz', 'Die Patrouille kehrt verletzt zurück. Der Fuchs ist noch da.']]; } } },
      { t: 'Ignorieren', fn: () => applyFx({ morale: -3, food: -6 }) },
    ]
  },
  {
    id: 'dachs', when: () => moon() > 2, text: 'Ein Dachs wurde nahe der Großen Platane gesehen. Dachse sind gefährlich – selbst für erfahrene Krieger.',
    choices: () => [
      { t: 'Mit Kriegern angreifen (Auftrag)', fn: () => Missions.add(makeMission('beast', { kind: 'dachs', at: pick(donnerPlaces()), allies: 2 })) },
      { t: 'Die Königinnen im Lager bewachen', fn: () => applyFx({ food: -5, health: 2 }) },
    ]
  },
  {
    id: 'hochwasser', when: () => season() === 0 || season() === 2, text: `Der Fluss ist über die Ufer getreten. Ein Bote des FlussClans bittet um Hilfe: Ihre Jungen sind in Gefahr!`,
    choices: () => [
      { t: 'Krieger zum Helfen schicken', fn: () => applyFx({ rel: { fluss: 20 }, food: -8, rep: 4 }) },
      { t: 'Ablehnen – jeder Clan sorgt für sich', fn: () => applyFx({ rel: { fluss: -10 } }) },
    ]
  },
  {
    id: 'zweibeiner', text: 'Zweibeiner mit lauten Monstern fällen Bäume am Rand des Territoriums. Die Beute flieht.',
    choices: () => [
      { t: 'Neue Jagdgründe suchen', fn: () => applyFx({ terr: -4, morale: -2 }) },
      { t: 'Den Zweibeinern aus dem Weg gehen und warten', fn: () => applyFx({ food: -8 }) },
    ]
  },
  {
    id: 'prophezeiung', prep: () => ({ h: clanCats().find(c => c.rank === 'heiler'), p: pick(PROPHECIES) }), who: c => c.h ? c.h.id : 'erz',
    text: c => `„Ich hatte einen Traum vom SternenClan. Sie sagten: ${c.p}“`,
    choices: c => [
      { t: 'Dem Clan davon erzählen', fn: () => { G.prophecies.push(c.p); applyFx({ morale: 5 }); } },
      { t: 'Vorerst geheim halten', fn: () => { G.prophecies.push(c.p); } },
    ]
  },
  {
    id: 'jungesweg', when: () => clanCats().some(c => c.rank === 'junges'), prep: () => ({ k: pick(clanCats().filter(c => c.rank === 'junges')), at: pick(donnerPlaces()) }),
    text: c => `${catName(c.k)} ist aus der Kinderstube verschwunden! Die Mutter ist außer sich.`,
    choices: c => [
      { t: 'Ich suche selbst!', fn: () => Missions.add(makeMission('kit', { kit: c.k.id, at: c.at })) },
      { t: 'Eine Suchpatrouille schicken', fn: () => { if (chance(0.7)) applyFx({ morale: 2 }); else { killCat(c.k, `${catName(c.k)} wurde nie gefunden. Der Clan trauert.`); applyFx({ morale: -10 }); } } },
    ]
  },
  {
    id: 'grenzstreit', prep: () => ({ k: pick(['schatten', 'fluss', 'wind']) }), text: c => `Der ${CLAN_NAMES[c.k]} hat seine Grenzmarkierungen in euer Territorium verschoben!`,
    choices: c => [
      { t: 'Angreifen und die Grenze zurückerobern', fn: () => Missions.add(makeMission('drive', { team: c.k, n: 3, at: borderPoint(c.k) })) },
      { t: 'Bei der Großen Versammlung ansprechen', fn: () => applyFx({ terr: -3, rel: { [c.k]: 3 } }) },
      { t: 'Die neue Grenze hinnehmen', fn: () => applyFx({ terr: -8, morale: -5, rel: { [c.k]: 5 } }) },
    ]
  },
  {
    id: 'frueh', when: () => clanCats().some(c => c.rank === 'schueler' && c.age >= 9 && c !== P()), prep: () => ({ k: pick(clanCats().filter(c => c.rank === 'schueler' && c.age >= 9 && c !== P())) }),
    text: c => `${catName(c.k)} möchte schon jetzt Krieger werden: „Ich bin bereit! Ich habe allein ein Kaninchen gefangen!“`,
    choices: c => [
      { t: 'Kriegerzeremonie abhalten', fn: () => { Clan.queue({ type: 'krieger', id: c.k.id }); } },
      { t: 'Noch einen Mond warten', fn: () => { c.k.rel -= 5; } },
    ]
  },
  {
    id: 'ueberfall', when: () => Object.values(G.others).some(o => o.rel < 25), prep: () => ({ k: Object.keys(G.others).sort((a, b) => G.others[a].rel - G.others[b].rel)[0] }),
    text: c => `Alarm! Krieger des ${CLAN_NAMES[c.k]}s greifen das Lager an!`,
    choices: c => [{ t: 'Zum Lager! Verteidigt den Clan!', fn: () => Missions.add(makeMission('drive', { team: c.k, n: 4, at: { x: LM.lager.x, y: LM.lager.y + 60, name: 'Lager' }, title: 'Lager verteidigen', now: true })) }]
  },
  {
    id: 'wind_reise', text: 'Eine WindClan-Patrouille bittet darum, durch euer Territorium zu den Hochfelsen reisen zu dürfen.',
    choices: () => [{ t: 'Erlauben', fn: () => applyFx({ rel: { wind: 12 }, terr: -1 }) }, { t: 'Verbieten', fn: () => applyFx({ rel: { wind: -10 }, morale: 2 }) }]
  },
  {
    id: 'tigerstern', special: true, text: 'Schreckliche Nachrichten von der Grenze: Tigerkralle ist zurück! Er ist jetzt Tigerstern, Anführer des SchattenClans.',
    pre: () => [['erz', 'Ein neuer Feind ist aufgetaucht …']],
    choices: () => [
      { t: 'Die Grenzpatrouillen verdoppeln', fn: () => { clanCats().filter(c => c.rank === 'krieger').slice(0, 4).forEach(c => c.duty = 'grenze'); applyFx({ terr: 5, food: -5 }); chron('Tigerkralle kehrt als Tigerstern, Anführer des SchattenClans, zurück.'); } },
      { t: 'Ihn bei der Versammlung zur Rede stellen', fn: () => { applyFx({ rel: { schatten: -5 }, rep: 5 }); chron('Tigerkralle kehrt als Tigerstern, Anführer des SchattenClans, zurück.'); } },
    ]
  },
];
const PROPHECIES = ['„Wenn der Schnee schmilzt, wird ein Stern fallen.“', '„Drei Pfoten werden den Wald vor dem Sturm bewahren.“', '„Das Wasser wird zurückkehren, wenn die Blätter fallen.“',
  '„Ein Schatten wächst im Kiefernwald.“', '„Wolken werden den Mond verhüllen, doch Licht findet einen Weg.“', '„Nur der Mut eines Jungen wird die Dunkelheit brechen.“'];
function donnerPlaces() { return G.flags.see ? [LM.buchenhain, LM.zweibeinernest, LM.seeufer] : [LM.schlangenfelsen, LM.platane, LM.eulenbaum, LM.sonnenfelsen]; }
function borderPoint(k) { if (G.flags.see) return k === 'schatten' ? { x: 6900, y: 2600, name: 'die SchattenClan-Grenze' } : k === 'fluss' ? { x: 6950, y: 3650, name: 'die FlussClan-Grenze' } : { x: 7450, y: 3450, name: 'die WindClan-Grenze' }; return k === 'schatten' ? { x: 2600, y: 1560, name: 'die Grenze am Donnerweg' } : k === 'fluss' ? { x: 1320, y: 2200, name: 'die Sonnenfelsen' } : { x: 1330, y: 1420, name: 'die WindClan-Grenze' }; }

// ===== Aufträge (Missionen) =====
function makeMission(type, o = {}) {
  const m = Object.assign({ id: 'm' + (G.nextId++), type, prog: 0, n: 1, exp: day() + 3 }, o);
  if (type === 'hunt') { m.n = m.n || 3; m.title = `Jagd: ${m.n} Beute für den Haufen`; m.rw = { xp: 30, rep: 3 }; }
  if (type === 'patrol') {
    const route = pick(patrolRoutes()); m.pts = route.map(p => ({ x: p.x, y: p.y, name: p.name, ok: false }));
    m.title = 'Grenzpatrouille: ' + route.map(p => p.name).join(' & '); m.rw = { xp: 30, rep: 3, terr: 3 };
  }
  if (type === 'beast') { m.title = `${BEASTS[m.kind].name} vertreiben (${m.at.name})`; m.rw = { xp: 60, rep: 6, morale: 5 }; }
  if (type === 'drive') { m.title = m.title || `${CLAN_NAMES[m.team]}-Krieger vertreiben`; m.title += ` (${m.at.name})`; m.rw = { xp: 60, rep: 5, terr: 6, morale: 4, rel: { [m.team]: -6 } }; }
  if (type === 'herbs') { m.title = `${m.n} × ${HERBS[m.kind].n} sammeln`; m.rw = { xp: 30, health: 10 }; }
  if (type === 'kit') { m.title = `${catName(catById(m.kit))} finden (${m.at.name})`; m.rw = { xp: 40, morale: 8, rep: 5 }; m.exp = day() + 2; }
  if (type === 'gathering') { m.title = `Große Versammlung (Vollmond-Nacht – ${LM.baumgeviert.name})`; m.exp = day() + 2; m.rw = { rep: 3 }; }
  return m;
}
const Missions = {
  add(m) { if (!m) return; if (G.missions.length >= 5) G.missions.shift(); G.missions.push(m); toast('Neuer Auftrag: ' + m.title); },
  event(type, d) {
    for (const m of G.missions) {
      if (type === 'defeat' && d.group === m.id) m.prog++;
      if (type === 'deliver' && m.type === 'hunt') m.prog++;
      if (type === 'herb' && m.type === 'herbs' && d.kind === m.kind) m.prog++;
    }
  },
  target(m) {
    const pc = P();
    if (m.type === 'hunt') return G.player.carry.length ? denPos('pile') : null;
    if (m.type === 'patrol') { const p = m.pts.find(p => !p.ok); return p; }
    if (m.type === 'herbs') { if (m.prog >= m.n) return healerCat(); return nearestHerb(m.kind, pc); }
    if (m.type === 'kit') { const k = catById(m.kit); return m.stage ? LM.lager : k; }
    if (m.type === 'gathering') return LM.baumgeviert;
    return m.at;
  },
  update(dt) {
    const pc = P();
    for (let i = G.missions.length - 1; i >= 0; i--) {
      const m = G.missions[i];
      if (day() > m.exp && m.type !== 'drive') { G.missions.splice(i, 1); toast('Auftrag verpasst: ' + m.title); applyFx({ morale: -3 }, true); if (m.type === 'gathering') applyFx({ rel: { schatten: -3, fluss: -3, wind: -3 } }, true); if (m.type === 'kit') { const k = catById(m.kit); if (k && k.alive && k.lost) killCat(k, `${catName(k)} wurde nie gefunden.`); } continue; }
      let done = false;
      if (m.type === 'hunt') done = m.prog >= m.n;
      if (m.type === 'patrol') { for (const p of m.pts) if (!p.ok && dist(pc.x, pc.y, p.x, p.y) < 110) { p.ok = true; toast('Grenzmarkierung erneuert: ' + p.name); } done = m.pts.every(p => p.ok); }
      if (m.type === 'beast' || m.type === 'drive') {
        if (!m.spawned && (m.now || dist(pc.x, pc.y, m.at.x, m.at.y) < 650)) {
          m.spawned = true;
          if (m.type === 'beast') { m.n = 1; spawnBeast(m.kind, m.at.x + rand(-60, 60), m.at.y + rand(-60, 60), { group: m.id }); }
          else for (let k = 0; k < m.n; k++) spawnClanCat(m.team, m.at.x + rand(-120, 120), m.at.y + rand(-120, 120) - (m.now ? 300 : 0), { group: m.id, lv: 1 + Math.floor(moon() / 6) });
          if (m.allies) clanCats().filter(c => c.rank === 'krieger' && c !== P()).slice(0, m.allies).forEach(c => { c.x = pc.x + rand(-60, 60); c.y = pc.y + rand(-60, 60); c.ai = { m: 'follow' }; });
          toast(m.type === 'beast' ? `Da ist der ${BEASTS[m.kind].name}!` : 'Feinde in Sicht!');
        }
        done = m.spawned && m.prog >= m.n;
      }
      if (m.type === 'kit') {
        const k = catById(m.kit);
        if (!k || !k.alive) { G.missions.splice(i, 1); continue; }
        if (!m.placed) { m.placed = true; k.lost = true; k.x = m.at.x + rand(-80, 80); k.y = m.at.y + rand(-80, 80); k.ai = { m: 'hold' }; }
        if (!m.stage && dist(pc.x, pc.y, k.x, k.y) < 70) { m.stage = 1; k.ai = { m: 'follow' }; k.slow = true; say(k, 'Ich hatte solche Angst!'); }
        if (m.stage && dist(k.x, k.y, LM.lager.x, LM.lager.y) < 200) { done = true; k.lost = false; k.slow = false; k.ai = { m: 'home' }; }
      }
      if (m.type === 'gathering') {
        if (isNight() && dist(pc.x, pc.y, LM.baumgeviert.x, LM.baumgeviert.y) < 170 && !Dlg.open) { spawnGathering(); gatheringDialog(); done = true; }
      }
      if (done) {
        G.missions.splice(i, 1);
        toast('✔ Auftrag erfüllt: ' + m.title);
        applyFx(m.rw || {});
        if (m.type === 'beast' || m.type === 'drive') for (const c of clanCats()) if (c.ai && c.ai.m === 'follow' && !Story.keepsFollower(c.id)) c.ai = { m: 'home' };
        if (m.type !== 'hunt' && m.type !== 'patrol') chron('Auftrag erfüllt: ' + m.title);
      }
    }
  }
};
function healerCat() { return clanCats().find(c => c.rank === 'heiler') || clanCats().find(c => c.rank === 'heilerschueler'); }
function nearestHerb(kind, pc) {
  let best = null, bd = 1e9;
  OB.herbs.forEach((h, i) => { if ((kind && h.k !== kind) || !herbAvailable(i)) return; const d = dist(pc.x, pc.y, h.x, h.y); if (d < bd) { bd = d; best = h; } });
  return best;
}
function deputyCat() { return clanCats().find(c => c.rank === 'zweiter'); }
function offerMission(giver) {
  const has = G.missions.filter(m => m.type === 'hunt' || m.type === 'patrol').length;
  if (has) return [[giver.id, 'Erledige erst deinen Auftrag. Der Clan zählt auf dich!']];
  const opts = ['hunt', 'patrol'];
  if (G.stage !== 'schueler' && chance(0.4)) opts.push('beast');
  const t = pick(opts);
  let m;
  if (t === 'beast') m = makeMission('beast', { kind: 'fuchs', at: pick(donnerPlaces()) });
  else m = makeMission(t, { n: randi(2, 3) });
  Missions.add(m);
  const lines = { hunt: `Der Frischbeutehaufen wird kleiner. Fang ${m.n} Stück Beute und bring sie ins Lager.`, patrol: `Geh auf Grenzpatrouille und erneuere die Duftmarken: ${m.pts && m.pts.map(p => p.name).join(' und ')}.`, beast: `Man hat einen Fuchs nahe ${m.at && m.at.name} gerochen. Vertreibe ihn!` };
  return [[giver.id, lines[t]]];
}

// ===== Große Versammlung =====
function spawnGathering() {
  for (const e of ENTS) if (e.gathering) e.gone = true;
  const bg = LM.baumgeviert;
  const ks = ['schatten', 'fluss', 'wind'];
  ks.forEach((k, i) => {
    const a = -Math.PI / 2 + (i - 1) * 0.5;
    spawnClanCat(k, bg.x + Math.cos(a) * 35, bg.y + Math.sin(a) * 35, { id: 'leader_' + k, name: clanLeaderName(k), rank: 'anfuehrer', hostile: false, truce: true, gathering: true, ai: 'leader', story: true, look: leaderLook(k) });
    for (let j = 0; j < 4; j++) { const b = i * 2.1 + j * 0.4; spawnClanCat(k, bg.x + Math.cos(b) * 120, bg.y + Math.sin(b) * 120, { hostile: false, truce: true, gathering: true, wander: { x: bg.x + Math.cos(b) * 110, y: bg.y + Math.sin(b) * 110, r: 40 } }); }
  });
}
function leaderLook(k) {
  if (k === 'schatten' && G.others.schatten.leader === 'Tiger') return catById('tigerkralle').look;
  if (k === 'schatten' && G.others.schatten.leader === 'Braun') return L('#5a4030', '#2a1a10', 0, '#d98b2b', { size: 1.15 });
  if (k === 'fluss' && G.others.fluss.leader === 'Krumm') return L('#b8a080', '#6a5030', 0, '#e8b923', { long: true });
  if (k === 'wind' && G.others.wind.leader === 'Riesen') return L('#1e1e20', null, 0.55, '#e8b923', { size: 1.15 });
  const r = mulberry32(hashStr(G.others[k].leader) * 1e9 | 0), f = FUR[Math.floor(r() * FUR.length)];
  return L(f[0], f[1], r() < 0.3 ? 0.4 : 0, EYES[Math.floor(r() * EYES.length)]);
}
function gatheringDialog() {
  const lines = [['erz', 'Vollmond. Katzen aller vier Clans sitzen unter den mächtigen Eichen des Baumgevierts. Heute Nacht herrscht Frieden.']];
  for (const k of ['schatten', 'fluss', 'wind']) {
    const o = G.others[k], id = 'leader_' + k;
    let t;
    if (o.rel < 30) t = pick([`Der ${CLAN_NAMES[k]} ist stark. Der DonnerClan sollte sich hüten, unsere Grenzen zu übertreten!`, `Wir haben DonnerClan-Geruch in unserem Territorium gefunden. Das wird Folgen haben!`]);
    else if (o.rel > 70) t = pick([`Der ${CLAN_NAMES[k]} dankt dem DonnerClan für seine Freundschaft.`, `Unsere Clans leben in Frieden. Möge es so bleiben.`]);
    else t = pick([`Die Beute läuft gut im ${CLAN_NAMES[k]}. Wir haben zwei neue Schüler.`, `Der ${CLAN_NAMES[k]} hat einen harten Mond hinter sich, doch wir sind stark.`, `Ein Fuchs hat unsere Grenze überquert, aber wir haben ihn vertrieben.`]);
    lines.push([id, t]);
  }
  lines.push({
    who: 'player', text: 'Jetzt sprichst du für den DonnerClan. Was sagst du?', choices: [
      { t: '„Der DonnerClan ist stark und gut genährt!“', fn: () => applyFx({ morale: 6, rel: { schatten: -3, fluss: -3, wind: -3 } }) },
      { t: '„Wir wünschen uns Frieden mit allen Clans.“', fn: () => applyFx({ rel: { schatten: 6, fluss: 6, wind: 6 } }) },
      { t: '„Bleibt von unseren Grenzen fern – sonst kämpfen wir!“', fn: () => applyFx({ terr: 6, rel: { schatten: -7, fluss: -7, wind: -7 } }) },
    ]
  });
  lines.push({ do: () => { chron('Große Versammlung am Baumgeviert.'); for (const e of ENTS) if (e.gathering) e.fleeing = true; } });
  Dlg.show(lines);
}

// ===== Fremde Territorien: Grenzpatrouillen =====
let foreignT = 0;
function foreignPatrols(dt) {
  const pc = P(), t = territoryAt(pc.x, pc.y);
  if (!['schatten', 'fluss', 'wind'].includes(t) || G.stage === 'hauskaetzchen' || Story.noPatrols() || (t === 'wind' && G.flags.windExil) || G.flags.zerstoert || (G.flags.see && pc.x < OLD_W)) { foreignT = 0; return; }
  foreignT += dt;
  if (foreignT > 12 && !ENTS.some(e => e.warnT !== undefined && !e.defeated)) {
    foreignT = 0;
    if (!chance(0.45)) return;
    const a = Math.random() * TAU, n = randi(2, 3), friendly = G.others[t].rel > 72;
    for (let i = 0; i < n; i++) {
      const e = spawnClanCat(t, pc.x + Math.cos(a) * 420 + rand(-40, 40), pc.y + Math.sin(a) * 420 + rand(-40, 40), { hostile: false, warnT: 7, friendly, lv: 1 + Math.floor(moon() / 6), group: 'patrol' });
      if (i === 0) say(e, friendly ? `Hallo, ${catName(pc)}. Du bist in ${CLAN_NAMES[t]}-Gebiet – jage hier nicht!` : `Verschwinde aus dem ${CLAN_NAMES[t]}-Territorium!`, 5);
    }
    toast(`Eine ${CLAN_NAMES[t]}-Patrouille hat dich entdeckt! Verlasse ihr Territorium – oder kämpfe.`);
  }
}
// ===== Andere Lager beleben =====
function populateCamps() {
  const pc = P();
  for (const cp of OB.camps) {
    if (cp.clan === 'donner' || (cp.clan === 'wind' && G.flags.windExil && !cp.lake) || cp.lake !== !!G.flags.see || G.flags.zerstoert) continue;
    const near = dist(pc.x, pc.y, cp.lm.x, cp.lm.y) < 900;
    const have = ENTS.filter(e => e.campOf === cp.clan);
    if (near && !have.length) for (let i = 0; i < 6; i++) spawnClanCat(cp.clan, cp.lm.x + rand(-100, 100), cp.lm.y + rand(-100, 100), { hostile: false, campOf: cp.clan, wander: { x: cp.lm.x, y: cp.lm.y, r: 140 }, rank: pick(['krieger', 'krieger', 'koenigin', 'aeltester', 'schueler']) });
    if (!near) have.forEach(e => e.gone = true);
    if (near && dist(pc.x, pc.y, cp.lm.x, cp.lm.y) < cp.lm.r && !Story.noPatrols()) for (const e of have) if (!e.hostile && !e.defeated && G.others[cp.clan].rel < 80) { e.hostile = true; e.wander = null; if (chance(0.3)) say(e, 'Ein Eindringling im Lager!'); }
  }
}

// ===== Tod des Anführers & nächste Generation =====
function leaderDeath() {
  const pc = P();
  const dep = deputyCat() || clanCats().filter(c => c.rank === 'krieger' && c !== pc).sort((a, b) => b.lvl - a.lvl)[0];
  killCat(pc, null);
  chron(`${catName(pc)} hat das letzte Leben verloren und ist zum SternenClan gegangen.`);
  if (!dep) { Dlg.show([['erz', 'Der DonnerClan hat keinen Anführer mehr … Das ist das Ende deiner Geschichte.']]); return; }
  const old = catName(pc);
  const lines = [['erz', `${old} hat das neunte Leben verloren. Der ganze Clan hält Totenwache.`], [dep.id, `Ich werde ${old} nie vergessen. Und ich werde den Clan führen, wie ${old} es mich gelehrt hat.`],
  { do: () => { setRank(dep, 'anfuehrer'); dep.lives = 9; switchPlayer(dep); setStage('generation'); chron(`${catName(dep)} ist der neue Anführer des DonnerClans. Eine neue Generation beginnt.`); } },
  ['erz', `Nach der Reise zum Mondstein erhält ${dep.pre}stern neun Leben. Du spielst jetzt als ${dep.pre}stern – die nächste Generation beginnt!`],
  ['erz', 'Wähle bald einen neuen Zweiten Anführer (Clan-Bildschirm → Mitglieder).']];
  Dlg.show(lines);
  const hp = denPos('anfuehrer'); dep.x = hp.x; dep.y = hp.y + 30; dep.hp = dep.maxHp;
}
function switchPlayer(c) {
  const old = P();
  if (old && old.alive) { old.ai = { m: 'home' }; old.lives = G.player.lives; }
  G.player.catId = c.id;
  c.ai = null; c.spar = false; c.hurt = false; c.hidden = false;
  G.player.carry = [];
  G.player.lives = c.rank === 'anfuehrer' ? (c.lives || 9) : 0;
  toast(`Du spielst jetzt ${catName(c)} (${rankName(c)}).`);
}
