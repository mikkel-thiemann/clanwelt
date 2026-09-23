'use strict';
// ===== Hauptprogramm =====
let G = null;
const ENTS = [], PREY = [], CARS = [], FX = [];
const SEASONS = ['Blattfrische', 'Blattgrüne', 'Blattfall', 'Blattleere'];
const SAVE_KEY = 'clanwelt_save_v2';
let state = 'title', gameT = 0;

const day = () => Math.floor(G.time / 1440);
const hour = () => (G.time / 60) % 24;
const moon = () => Math.floor(day() / 3);
const season = () => (Math.floor(moon() / 3) + 1) % 4;
const isNight = () => { const h = hour(); return h >= 20.5 || h < 5.5; };

function newGame() {
  ENTS.length = PREY.length = CARS.length = FX.length = 0;
  G = {
    v: 1, time: 8 * 60, nextId: 1, cats: [], playTime: 0,
    player: { catId: 'sammy', hunger: 85, stamina: 100, carry: [], herbs: {}, rep: 20, lives: 0, sneak: false, points: 0, invul: 0 },
    story: { q: 0, s: 0, prog: 0 }, flags: { windExil: true }, stage: 'hauskaetzchen', stages: {},
    clan: { pile: 34, health: 80, morale: 70, terr: 80 }, others: newOtherClans(),
    missions: [], chron: [], prophecies: [], herbsTaken: {}, seen: {}, eventQ: [], evSeen: {}, lastDay: 0, freeplay: false, weather: null
  };
  createStartCats();
  setStage('hauskaetzchen');
  chron('Sammy, ein junges Hauskätzchen, lebt am Rand des Waldes.');
  startPlay();
  Story.enter();
  setTimeout(() => titleCard('Buch 1', BOOKS[1]), 300);
}
function saveGame() {
  if (!G) return;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(G)); } catch (e) { }
}
function hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } }
function loadGame() {
  let d = null;
  try { d = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { }
  if (!d) return false;
  ENTS.length = PREY.length = CARS.length = FX.length = 0;
  G = d;
  for (const c of G.cats) { c.spar = false; c.kx = c.ky = 0; if (c.ai && c.ai.m !== 'follow' && c.ai.m !== 'hold') c.ai = { m: 'home' }; if (!c.ai) c.ai = { m: 'home' }; }
  for (const m of G.missions) { m.spawned = false; if (m.type === 'kit') { m.placed = false; m.stage = 0; } }
  startPlay();
  Story.enter(true);
  return true;
}
function startPlay() {
  state = 'play'; $('title').classList.add('hidden'); $('hud').classList.remove('hidden'); $('topright').classList.remove('hidden'); $('menubar').classList.remove('hidden');
  CAMS.snap = true; CAMS.pitch = 0.34; CAMS.dist = 105; CAMS.yaw = -Math.PI / 2;
  if (isTouch) $('touch').classList.remove('hidden');
}
function showTitle() {
  state = 'title'; $('title').classList.remove('hidden'); $('hud').classList.add('hidden'); $('topright').classList.add('hidden'); $('menubar').classList.add('hidden'); $('touch').classList.add('hidden');
  $('btnLoad').style.display = hasSave() ? '' : 'none';
}

// ===== Eingabe =====
const keys = new Set(), pressed = new Set();
const isTouch = matchMedia('(pointer: coarse)').matches;
const touchVec = { x: 0, y: 0 };
addEventListener('keydown', e => {
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) e.preventDefault();
  if (!keys.has(e.code)) pressed.add(e.code);
  keys.add(e.code);
  if (state !== 'play') return;
  if (Dlg.open) {
    if (['Space', 'Enter', 'KeyE'].includes(e.code)) Dlg.next();
    const n = parseInt(e.key); if (Dlg.choosing && n >= 1 && Dlg.curChoices[n - 1]) Dlg.choose(Dlg.curChoices[n - 1]);
    return;
  }
  if (e.code === 'Escape') { UI.panel ? closePanel() : openPanel('menu'); }
  else if (e.code === 'KeyM' || e.code === 'Tab') openPanel('map');
  else if (e.code === 'KeyK') openPanel('clan');
  else if (e.code === 'KeyJ') openPanel('chron');
  else if (e.code === 'KeyL') openPanel('skills');
});
addEventListener('keyup', e => keys.delete(e.code));
addEventListener('blur', () => keys.clear());
function inputVec() {
  let x = 0, y = 0;
  if (keys.has('KeyW') || keys.has('ArrowUp')) y--; if (keys.has('KeyS') || keys.has('ArrowDown')) y++;
  if (keys.has('KeyA') || keys.has('ArrowLeft')) x--; if (keys.has('KeyD') || keys.has('ArrowRight')) x++;
  x += touchVec.x; y += touchVec.y;
  const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; }
  return { x, y };
}

// ===== Interaktion =====
function playerDen() {
  const pc = P();
  if (pc.clan === 'donner') return denPos(denKeyOf(pc));
  if (pc.id === 'sammy' && pc.clan === 'haus') return { x: 2100, y: 3890 };
  return null;
}
function findInteract() {
  const pc = P(); let best = null, bd = 1e9;
  const take = (d, o) => { if (d < bd) { bd = d; best = o; } };
  const st = Story.step(), storyWho = st && st.t === 'talk' ? st.who : null;
  for (const c of G.cats) { if (!c.alive || c.hidden || c === pc || c.spar) continue; const d = dist(pc.x, pc.y, c.x, c.y); if (d < 62) take(c.id === storyWho ? d - 60 : d, { type: 'cat', c, label: `Sprechen mit ${catName(c)}` }); }
  for (const e of ENTS) { if (e.hostile || e.defeated || e.kind !== 'cat') continue; const d = dist(pc.x, pc.y, e.x, e.y); if (d < 62) take(d, { type: 'ent', e, label: `Sprechen mit ${e.name}` }); }
  if (pc.clan === 'donner') { const p = denPos('pile'), d = dist(pc.x, pc.y, p.x, p.y); if (d < 55) take(d - 20, { type: 'pile', label: G.player.carry.length ? 'Beute auf den Frischbeutehaufen legen' : `Frischbeutehaufen (${Math.floor(G.clan.pile)} Stück) – F: fressen` }); }
  const den = playerDen(); if (den) { const d = dist(pc.x, pc.y, den.x, den.y + 20); if (d < 60) take(d + 10, { type: 'den', label: 'Ausruhen / Schlafen' }); }
  OB.herbs.forEach((h, i) => { if (!herbAvailable(i)) return; const d = dist(pc.x, pc.y, h.x, h.y); if (d < 34) take(d - 30, { type: 'herb', i, label: `${HERBS[h.k].n} pflücken` }); });
  return best;
}
function interact(it) {
  const pc = P();
  if (it.type === 'cat') { if (!Story.talk(it.c)) genericTalk(it.c); }
  else if (it.type === 'ent') Dlg.show([[it.e.id || { name: it.e.name, look: it.e.look }, it.e.gathering ? pick(['Heute Nacht herrscht Frieden. Morgen sind wir wieder Rivalen.', 'Der SternenClan sieht uns zu – benimm dich.', 'Habt ihr genug Beute im DonnerClan?']) : pick(['Was willst du hier?', 'Hmpf.', 'Das ist nicht dein Lager!'])]]);
  else if (it.type === 'pile') {
    if (!G.player.carry.length) { toast(`Auf dem Haufen liegen ${Math.floor(G.clan.pile)} Stück Frischbeute. Drücke F, um zu fressen.`); return; }
    const n = G.player.carry.length;
    for (const k of G.player.carry) { G.clan.pile += PREY_T[k].val; gainXp(pc, 6); Story.event('deliver'); Missions.event('deliver'); }
    G.player.carry = []; applyFx({ rep: n }, true);
    toast(`Du legst ${n} Beute auf den Frischbeutehaufen. Der Clan dankt dir!`);
  }
  else if (it.type === 'den') denMenu();
  else if (it.type === 'herb') {
    const h = OB.herbs[it.i]; G.herbsTaken[it.i] = day() + 3;
    G.player.herbs[h.k] = (G.player.herbs[h.k] || 0) + 1; gainXp(pc, 4);
    toast(`${HERBS[h.k].n} gepflückt.`);
    FX3.sparkle(h.x, surfaceY(h.x, h.y) + 6, h.y, HERBS[h.k].col, 12);
    Story.event('herb', { kind: h.k }); Missions.event('herb', { kind: h.k });
  }
}
function denMenu() {
  const h = hour(), pc = P();
  const ch = [];
  if (h >= 17 || h < 6) ch.push({ t: 'Schlafen bis zum Morgen', fn: () => sleepUntil(6) });
  if (h >= 6 && h < 20) ch.push({ t: 'Ausruhen bis zum Abend', fn: () => sleepUntil(20.6) });
  ch.push({ t: 'Kurz ausruhen (2 Stunden)', fn: () => { G.time += 120; restHeal(0.3); } });
  ch.push({ t: 'Weiter', fn: () => { } });
  Dlg.show([{ who: 'erz', text: pc.clan === 'donner' ? `Dein Schlafplatz im ${DEN_LABELS[denKeyOf(pc)] || 'Bau'}. Das Moos ist weich.` : 'Dein weiches Körbchen.', choices: ch }]);
}
function sleepUntil(hh) {
  let t = Math.floor(G.time / 1440) * 1440 + hh * 60;
  if (t <= G.time) t += 1440;
  fade(() => {
    G.time = t; restHeal(1); G.player.hunger = Math.max(10, G.player.hunger - 15);
    for (const e of ENTS) if (!e.story) e.gone = true;
    for (const c of clanCats()) if (c !== P() && c.ai && c.ai.m === 'home') placeAtHome(c);
    saveGame();
  });
}
function restHeal(f) { const pc = P(); pc.hp = Math.min(pc.maxHp, pc.hp + pc.maxHp * f); G.player.stamina = 100; }
function fade(fn) { const f = $('fade'); f.classList.add('on'); setTimeout(() => { fn(); setTimeout(() => f.classList.remove('on'), 150); }, 450); }

const DEN_LABELS = { anfuehrer: 'Anführerbau', heiler: 'Heilerbau', krieger: 'Kriegerbau', schueler: 'Schülerbau', kinder: 'Kinderstube', aeltest: 'Ältestenbau' };
const LORE = ['Kennst du das Gesetz der Krieger? Verteidige deinen Clan – auch wenn es dein Leben kostet.', 'Früher, als ich jung war, gab es so viele Mäuse, dass wir sie gar nicht alle fangen konnten!',
  'Der SternenClan spricht durch die Heiler. Achte auf Zeichen am Himmel.', 'Ein Krieger tötet nicht ohne Grund. Das unterscheidet uns von Einzelläufern.',
  'Weißt du, warum der Donnerweg so heißt? Weil die Monster donnern wie ein Sturm!', 'Bei der Großen Versammlung herrscht Frieden – so will es der SternenClan seit Anbeginn.',
  'Die Ältesten und die Jungen werden zuerst gefüttert. So war es immer.', 'Ich habe einmal einen Dachs gesehen, so groß wie ein Fuchs und doppelt so wütend!'];
function greet(c) {
  const pc = P(), n = catName(pc), st = clanStats();
  if (c.id === 'wulle') return pc.clan === 'haus' ? pick(['Die Zweibeiner haben heute ein neues Kissen gekauft. Herrlich!', 'Hast du von den wilden Katzen gehört? Brrr.']) : pick([`Sammy?! Bist du das? Du riechst nach Wald … und nach Abenteuer.`, 'Ist das Leben im Wald nicht kalt? Hier gibt es warmes Futter, weißt du.']);
  if (c.id === 'mikusch') return 'Die Mäuse in der Scheune sind fett. Rabenpfote geht es gut hier.';
  if (c.id === 'rabenpfote' && c.clan === 'einzel') return 'Feuerherz! Es tut gut, dich zu sehen. Ich vermisse den Clan manchmal … aber hier bin ich sicher.';
  if (c.clan !== 'donner') return 'Hm?';
  if (c.rank === 'junges') return pick(['Spielst du mit uns Mooskugel?', 'Wenn ich groß bin, werde ich Anführer!', `Erzähl uns vom Kampf, ${n}!`, 'Ich hab heute einen Käfer gefangen!']);
  if (c.rank === 'aeltester') return pick(LORE);
  if (c.rank === 'heiler' || c.rank === 'heilerschueler') return pc.hp < pc.maxHp * 0.8 ? 'Du bist verletzt! Komm her, ich kümmere mich darum.' : pick(['Ringelblume gegen Entzündung, Spinnweben gegen Blutungen, Katzenminze gegen Grünen Husten.', 'Der SternenClan war letzte Nacht sehr still …', 'Bring mir Kräuter, wenn du welche findest.']);
  if (c.rank === 'koenigin') return pick(['Die Jungen halten mich ganz schön auf Trab!', st.food < 40 ? 'Ich habe kaum Milch … wir brauchen mehr Beute.' : 'Danke, dass du für den Clan jagst.']);
  if (c.rel < 30) return pick([pc.fixed || G.stage === 'schueler' ? 'Was willst du, Hauskätzchen?' : 'Lass mich in Ruhe.', 'Hmpf. Hast du nichts zu tun?']);
  if (st.food < 35) return pick(['Die Beute ist knapp. Wir müssen alle mehr jagen.', 'Mein Magen knurrt wie ein Dachs.']);
  if (c.rel > 70) return pick([`Schön, dich zu sehen, ${n}!`, 'Wollen wir später zusammen jagen?', `Ich bin froh, dass du im Clan bist, ${n}.`]);
  return pick([['Die Blattfrische bringt endlich wieder Beute.', 'Was für eine warme Blattgrüne!', 'Die Blätter fallen … bald wird es kalt.', 'Diese Blattleere ist bitterkalt.'][season()], 'Hast du SchattenClan-Geruch an der Grenze bemerkt?', 'Gute Jagd heute?']);
}
function genericTalk(c) {
  const pc = P(), ch = [];
  if (c.talkDay !== day() && c.clan === 'donner') { c.talkDay = day(); c.rel = clamp(c.rel + 2, 0, 100); }
  if ((c.rank === 'heiler' || c.rank === 'heilerschueler')) {
    const hm = G.missions.find(m => m.type === 'herbs' && m.prog >= m.n);
    if (hm) ch.push({ t: `${HERBS[hm.kind].n} übergeben`, fn: () => { hm.exp = 1e9; hm.prog = hm.n; G.missions.splice(G.missions.indexOf(hm), 1); applyFx(hm.rw); toast('✔ Auftrag erfüllt: ' + hm.title); chron(`${catName(pc)} bringt ${HERBS[hm.kind].n} für den Clan.`); return [[c.id, 'Wunderbar! Damit kann ich die Kranken heilen.']]; } });
    if (pc.hp < pc.maxHp) ch.push({ t: 'Bitte behandle meine Wunden', fn: () => { pc.hp = pc.maxHp; return [[c.id, 'So. Spinnweben auf die Kratzer, und ein bisschen Ringelblume. Ruh dich aus.']]; } });
    const herbSum = Object.values(G.player.herbs).reduce((a, b) => a + b, 0);
    if (herbSum > 0) ch.push({ t: 'Meine Kräuter abgeben', fn: () => { const n = herbSum; G.player.herbs = {}; applyFx({ health: Math.min(15, n * 2), rep: 2 }); return [[c.id, `Danke! ${n} Kräuter für den Vorrat.`]]; } });
  }
  const dep = deputyCat();
  if (c === dep && (pc.rank === 'schueler' || pc.rank === 'krieger')) ch.push({ t: 'Hast du einen Auftrag für mich?', fn: () => offerMission(c) });
  if (c.id === pc.mentor && pc.rank === 'schueler') ch.push({ t: 'Kannst du mir einen Auftrag geben?', fn: () => offerMission(c) });
  if (c.rank === 'aeltester' && G.player.carry.length) ch.push({ t: 'Beute schenken', fn: () => { G.player.carry.shift(); c.rel += 8; applyFx({ rep: 3, morale: 1 }); return [[c.id, 'Oh, wie freundlich! Die Jugend von heute hat doch noch Respekt.']]; } });
  if (c.rank === 'junges') ch.push({ t: 'Mit den Jungen spielen', fn: () => { c.rel += 5; applyFx({ morale: 1 }, true); G.time += 30; return [['erz', 'Ihr jagt einer Mooskugel hinterher. Die Jungen quieken vor Freude.']]; } });
  if (isFighterRank(c.rank) && (pc.rank === 'zweiter' || pc.rank === 'anfuehrer' || c.rel > 60) && G.stage !== 'schueler' && c.clan === 'donner')
    ch.push(c.ai && c.ai.m === 'follow' ? { t: 'Geh zurück ins Lager', fn: () => { c.ai = { m: 'home' }; } } : { t: 'Komm mit mir!', fn: () => { c.ai = { m: 'follow' }; return [[c.id, 'Ich bin bei dir!']]; } });
  if (G.freeplay && pc.rank === 'anfuehrer' && c.clan === 'donner' && c.rank !== 'junges') ch.push({ t: `Als ${catName(c)} spielen`, fn: () => { switchPlayer(c); } });
  const lines = [[c.id, greet(c)]];
  if (ch.length) { ch.push({ t: 'Tschüss', fn: () => { } }); lines.push({ who: 'player', text: 'Was möchtest du tun?', choices: ch }); }
  Dlg.show(lines);
}
function eat() {
  const pc = P();
  if (G.player.hunger > 92) { toast('Du bist satt.'); return; }
  if (G.player.carry.length) {
    const k = G.player.carry.shift();
    G.player.hunger = Math.min(100, G.player.hunger + 20 + PREY_T[k].val * 12);
    if (pc.clan === 'donner' && G.player.hunger > 40 && clanStats().food < 50 && dist(pc.x, pc.y, LM.lager.x, LM.lager.y) > 300) { applyFx({ rep: -4 }, true); toast('Gesetz der Krieger: Der Clan wird zuerst gefüttert! (Ansehen −4)'); }
    else toast(`Du frisst ${PREY_T[k].n === 'Amsel' ? 'eine Amsel' : 'die Beute'}. Lecker!`);
    return;
  }
  const p = denPos('pile');
  if (pc.clan === 'donner' && dist(pc.x, pc.y, p.x, p.y) < 70 && G.clan.pile >= 1) { G.clan.pile--; G.player.hunger = Math.min(100, G.player.hunger + 35); toast('Du frisst etwas vom Frischbeutehaufen.'); return; }
  if (dist(pc.x, pc.y, 2100, 3890) < 90 || (pc.clan === 'haus' && territoryAt(pc.x, pc.y) === 'zweibeiner' && dist(pc.x, pc.y, LM.garten.x, LM.garten.y) < 250)) {
    G.player.hunger = 100;
    if (pc.clan === 'donner') { applyFx({ rep: -6 }, true); toast('Du frisst aus deinem alten Napf … Hauskätzchen-Futter! Wenn das der Clan erfährt … (Ansehen −6)'); }
    else toast('Du frisst aus deinem Napf. Trockenfutter … schmeckt nach nichts.');
    return;
  }
  toast('Du hast keine Beute. Fang etwas (Leertaste) oder friss am Frischbeutehaufen.');
}
function useHerb() {
  const pc = P(); const ks = Object.keys(G.player.herbs).filter(k => G.player.herbs[k] > 0).sort((a, b) => HERBS[b].heal - HERBS[a].heal);
  if (!ks.length) { toast('Du hast keine Kräuter.'); return; }
  if (pc.hp >= pc.maxHp) { toast('Du bist nicht verletzt.'); return; }
  const k = ks[0]; G.player.herbs[k]--; pc.hp = Math.min(pc.maxHp, pc.hp + HERBS[k].heal); addFx(pc.x, pc.y - 25, '+' + HERBS[k].heal, '#7fe07f'); toast(`${HERBS[k].n} benutzt.`);
}
function carryCap() { return 2 + (P().sk.jagd >= 3 ? 1 : 0); }

// ===== Spieler =====
function updatePlayer(dt) {
  const pc = P(), pl = G.player, raw = inputVec();
  // Eingabe relativ zur Kamera
  const fx = Math.cos(CAMS.yaw), fz = Math.sin(CAMS.yaw);
  const inp = { x: fx * -raw.y - fz * raw.x, y: fz * -raw.y + fx * raw.x };
  CAMS.dragT += dt;
  if (raw.y < -0.3 && CAMS.dragT > 1.2 && !pc.lungeT) CAMS.yaw += angDiff(CAMS.yaw, pc.dir) * Math.min(1, dt * 1.2);
  if (pressed.has('KeyQ')) { pl.sneak = !pl.sneak; toast(pl.sneak ? 'Du schleichst (Beute hört dich kaum).' : 'Du läufst normal.'); }
  const moving = inp.x || inp.y;
  let sp = pl.sneak ? 78 : 150 + pc.sk.tempo * 6;
  const wantRun = (keys.has('ShiftLeft') || keys.has('ShiftRight') || touchRun) && !pl.sneak && moving;
  if (wantRun && pl.stamina > 1) { sp = 250 + pc.sk.tempo * 12; pl.stamina -= dt * 22; pc.running = true; }
  else { pc.running = false; pl.stamina = Math.min(100, pl.stamina + dt * (13 + pc.sk.ausdauer * 2)); }
  if (pl.hunger <= 0) sp *= 0.8;
  if (G.player.carry.length >= 2) sp *= 0.93;
  pc.atkCd = (pc.atkCd || 0) - dt;
  if (pl.invul > 0) pl.invul -= dt;
  if (pc.flash > 0) pc.flash -= dt;
  if (pressed.has('Space') && pc.atkCd <= 0 && pl.stamina >= 5) {
    pc.lungeT = 0.17; pc.hitDone = false; pc.caught = false; pl.stamina -= 6; pc.atkCd = 0.45;
    if (moving) pc.dir = Math.atan2(inp.y, inp.x);
  }
  if (pc.lungeT > 0) {
    pc.lungeT -= dt;
    moveEnt(pc, Math.cos(pc.dir) * 520, Math.sin(pc.dir) * 520, dt); pc.moving = true;
    const hx = pc.x + Math.cos(pc.dir) * 16, hy = pc.y + Math.sin(pc.dir) * 16;
    if (!pc.caught) for (const p of PREY) {
      if (p.st === 'fly' || p.gone) continue;
      if (dist(hx, hy, p.x, p.y) < 16 + PREY_T[p.k].sz) { p.gone = true; pc.caught = true; catchPrey(p); break; }
    }
    if (!pc.hitDone) for (const f of fighters()) {
      if (!isFoe(pc, f)) continue;
      if (dist(hx, hy, f.x, f.y) < 22 + (f.r || 10)) { pc.hitDone = true; hurt(f, atkOf(pc) * rand(0.85, 1.2) * (pl.hunger <= 0 ? 0.7 : 1), pc); break; }
    }
  } else moveEnt(pc, inp.x * sp, inp.y * sp, dt);
  // Hunger & Heilung
  pl.hunger = Math.max(0, pl.hunger - dt * (pc.running ? 0.18 : 0.1));
  if (pl.hunger <= 0) { pc.hp = Math.max(1, pc.hp - dt * 1.2); if (Math.random() < dt / 12) toast('Du hast großen Hunger! Friss etwas (F).'); }
  else if (pl.hunger > 25 && !nearestFoe(pc, 400)) pc.hp = Math.min(pc.maxHp, pc.hp + dt * 0.8);
  if (pressed.has('KeyE')) { const it = findInteract(); if (it) interact(it); }
  if (pressed.has('KeyF')) eat();
  if (pressed.has('KeyH')) useHerb();
  // Entdeckungen
  for (const k in LM) { if (G.seen[k]) continue; const l = LM[k]; if (dist(pc.x, pc.y, l.x, l.y) < l.r + 40) { G.seen[k] = 1; if (day() > 0 || k !== 'garten') { toast('Entdeckt: ' + l.name); gainXp(pc, 10); } } }
  const t = territoryAt(pc.x, pc.y);
  if (t !== pl.lastTerr) { if (['schatten', 'fluss', 'wind'].includes(t) && pc.clan === 'donner') toast(`Du riechst die Grenzmarkierungen des ${CLAN_NAMES[t]}s.`); pl.lastTerr = t; }
}
function catchPrey(p) {
  const pc = P(), T = PREY_T[p.k];
  gainXp(pc, T.xp);
  addFx(p.x, p.y - 10, T.n + '!', '#aef07a');
  FX3.sparkle(p.x, surfaceY(p.x, p.y) + 6, p.y, '#fff2a0', 14);
  if (G.player.carry.length >= carryCap()) toast(`${T.n} gefangen – aber du kannst nicht mehr tragen! Bring Beute ins Lager oder friss (F).`);
  else { G.player.carry.push(p.k); toast(`${T.n} gefangen!`); }
  Story.event('catch');
}

// ===== Zeit =====
let lastHourPatrol = -1;
function timeTick(dt) {
  G.time += dt * 6; G.playTime += dt;
  const d = day();
  if (hour() >= 6 && G.lastDay < d) {
    G.lastDay = d;
    Clan.daily();
    if (d % 3 === 0) Clan.moon();
    Clan.morning();
  }
  const h = Math.floor(hour());
  if ((h === 8 || h === 15) && lastHourPatrol !== h) { lastHourPatrol = h; sendPatrols(); }
}

// ===== Kamera & Zeichnen =====
const ov = $('ov'), octx = ov.getContext('2d');
let VW = 0, VH = 0;
function resize() {
  VW = innerWidth; VH = innerHeight; ov.width = VW; ov.height = VH;
  resize3D();
  if (UI.panel === 'map') drawBigMap();
}
addEventListener('resize', resize);
function render(t, dt) {
  if (!G || !R3) return;
  const pc = P(), title = state === 'title';
  const tx = title ? LM.lager.x : pc.x, tz = title ? LM.lager.y : pc.y;
  render3D(t, dt, tx, tz, title);
  octx.clearRect(0, 0, VW, VH);
  if (title) { hideLabels(); return; }
  drawArrows();
  updateLabels(pc);
  if (pc.hp < pc.maxHp * 0.3) { const g = octx.createRadialGradient(VW / 2, VH / 2, VH * 0.3, VW / 2, VH / 2, VH * 0.8); g.addColorStop(0, 'rgba(120,0,0,0)'); g.addColorStop(1, `rgba(140,0,0,${0.35 + Math.sin(t * 5) * 0.1})`); octx.fillStyle = g; octx.fillRect(0, 0, VW, VH); }
  if (G.fire && dist(pc.x, pc.y, G.fire.x, G.fire.y) < G.fire.r + 200) { octx.fillStyle = `rgba(255,120,30,${0.12 + Math.sin(t * 7) * 0.03})`; octx.fillRect(0, 0, VW, VH); }
}
// Namen, Sprechblasen, Schadenszahlen als HTML über der 3D-Szene
const labelPool = [];
function label(i) {
  let d = labelPool[i];
  if (!d) { d = document.createElement('div'); d.className = 'lbl'; $('labels').appendChild(d); labelPool[i] = d; }
  return d;
}
function hideLabels() { for (const d of labelPool) d.style.display = 'none'; }
function updateLabels(pc) {
  let n = 0;
  const put = (x, y, z, html, cls) => {
    const p = project(x, y, z); if (!p.vis || p.x < -50 || p.x > VW + 50 || p.y < -30 || p.y > VH + 30) return;
    const d = label(n++); d.style.display = 'block'; d.className = 'lbl ' + (cls || ''); if (d._h !== html) { d.innerHTML = html; d._h = html; }
    d.style.transform = `translate(${p.x | 0}px,${p.y | 0}px) translate(-50%,-100%)`;
  };
  const all = G.cats.filter(c => c.alive && !c.hidden).concat(ENTS);
  const named = new Set(all.filter(e => e !== pc && !e.hostile && !e.spar && dist(e.x, e.y, pc.x, pc.y) < 130).sort((a, b) => dist(a.x, a.y, pc.x, pc.y) - dist(b.x, b.y, pc.x, pc.y)).slice(0, 3));
  for (const e of all) {
    if (dist(e.x, e.y, pc.x, pc.y) > 900) continue;
    const top = surfaceY(e.x, e.y) + (e.beast ? 38 : 30 * (e.kind === 'cat' ? 1 : catSize(e)));
    const showName = e !== pc && (named.has(e) || e.hostile || e.spar);
    const hpBar = (e.hostile || e.spar || e.boss) && e.hp < e.maxHp && e.maxHp < 5000 ? `<div class="hpb"><i style="width:${clamp(e.hp / e.maxHp, 0, 1) * 100}%"></i></div>` : '';
    const bub = e.sayT > 0 && e.sayText ? `<div class="bub">${e.sayText}</div>` : '';
    if (showName || hpBar || bub) put(e.x, top, e.y, bub + (showName ? `<span class="${e.hostile || e.spar ? 'foe' : (e.team && e.team !== 'donner' ? 'oth' : '')}">${e.beast ? e.name : nameOf(e)}</span>` : '') + hpBar);
  }
  for (const f of FX) put(f.x, surfaceY(f.x, f.y) + 40 + (1.1 - f.t) * 30, f.y, `<b style="color:${f.col}">${f.text}</b>`, 'fx');
  for (const p of PREY) if (p.st2 === 'alert' && p.st !== 'flee' && dist(p.x, p.y, pc.x, pc.y) < 400) put(p.x, surfaceY(p.x, p.y) + 16, p.y, '<b class="alert">!</b>', 'fx');
  for (let i = n; i < labelPool.length; i++) labelPool[i].style.display = 'none';
}
function drawArrows() {
  const pc = P();
  for (const tg of targets()) {
    const p = project(tg.x, surfaceY(tg.x, tg.y) + 20, tg.y);
    const on = p.vis && p.x > 40 && p.x < VW - 40 && p.y > 40 && p.y < VH - 40;
    const d = Math.round(dist(tg.x, tg.y, pc.x, pc.y) / 10);
    if (on) { if (d > 12) { octx.font = 'bold 12px Trebuchet MS'; octx.textAlign = 'center'; octx.fillStyle = '#000'; octx.fillText(d + ' m', p.x + 1, p.y - 40); octx.fillStyle = tg.col; octx.fillText(d + ' m', p.x, p.y - 41); } continue; }
    // Richtung relativ zur Kamera
    const a = Math.atan2(tg.y - pc.y, tg.x - pc.x) - CAMS.yaw - Math.PI / 2;
    const cx = VW / 2 + Math.sin(-a) * 0, r = Math.min(VW, VH) * 0.42;
    let ex = VW / 2 + Math.cos(a) * r, ey = VH / 2 + Math.sin(a) * r;
    ex = clamp(ex, 40, VW - 40); ey = clamp(ey, 40 + (VW < 700 ? 110 : 0), VH - 40);
    octx.save(); octx.translate(ex, ey); octx.rotate(a);
    octx.fillStyle = tg.col; octx.strokeStyle = 'rgba(0,0,0,.6)'; octx.lineWidth = 2;
    octx.beginPath(); octx.moveTo(18, 0); octx.lineTo(-10, -12); octx.lineTo(-4, 0); octx.lineTo(-10, 12); octx.closePath(); octx.fill(); octx.stroke();
    octx.restore();
    octx.font = 'bold 11px Trebuchet MS'; octx.textAlign = 'center'; octx.fillStyle = '#000'; octx.fillText(d + ' m', ex + 1, ey + 27); octx.fillStyle = tg.col; octx.fillText(d + ' m', ex, ey + 26);
  }
}
// Kamera mit Maus drehen
let mouseDrag = null;
$('game').addEventListener('mousedown', e => { mouseDrag = { x: e.clientX, y: e.clientY }; });
addEventListener('mouseup', () => mouseDrag = null);
addEventListener('mousemove', e => {
  if (!mouseDrag) return;
  CAMS.yaw += (e.clientX - mouseDrag.x) * 0.006; CAMS.pitch = clamp(CAMS.pitch + (e.clientY - mouseDrag.y) * 0.004, 0.05, 1.25);
  mouseDrag = { x: e.clientX, y: e.clientY }; CAMS.dragT = 0;
});
$('game').addEventListener('wheel', e => { CAMS.dist = clamp(CAMS.dist * (e.deltaY > 0 ? 1.1 : 0.9), 45, 340); e.preventDefault(); }, { passive: false });
$('game').addEventListener('contextmenu', e => e.preventDefault());

// ===== Hauptschleife =====
let lastT = 0, saveT = 0, campT = 0;
function frame(ts) {
  const dt = Math.min(0.05, (ts - lastT) / 1000 || 0); lastT = ts; gameT += dt;
  if (state === 'play' && G) {
    Dlg.tick(dt);
    if (!Dlg.open && !UI.panel) {
      timeTick(dt);
      updatePlayer(dt);
      for (const c of G.cats) if (c.alive && !c.hidden) updateCat(c, dt, gameT);
      updateEnts(dt); updatePrey(dt, P()); updateCars(dt); updateFx(dt);
      Story.update(dt); Missions.update(dt);
      foreignPatrols(dt);
      campT -= dt; if (campT <= 0) { campT = 1; populateCamps(); }
      Clan.process();
      saveT += dt; if (saveT > 30) { saveT = 0; saveGame(); }
    }
    pressed.clear();
    UI.hud(dt);
    const it = !Dlg.open && !UI.panel ? findInteract() : null;
    const hint = $('hint');
    if (it) { hint.textContent = (isTouch ? '' : 'E: ') + it.label; hint.classList.remove('hidden'); } else hint.classList.add('hidden');
  } else pressed.clear();
  if (!window.NORENDER) render(gameT, dt);
  requestAnimationFrame(frame);
}

// ===== Touch-Steuerung =====
let touchRun = false;
function setupTouch() {
  const stick = $('stick'), knob = $('knob');
  let sid = null, cx = 0, cy = 0;
  stick.addEventListener('touchstart', e => { const t = e.changedTouches[0]; sid = t.identifier; const r = stick.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2; e.preventDefault(); }, { passive: false });
  addEventListener('touchmove', e => { for (const t of e.changedTouches) if (t.identifier === sid) { let dx = t.clientX - cx, dy = t.clientY - cy; const l = Math.hypot(dx, dy), m = 50; if (l > m) { dx *= m / l; dy *= m / l; } touchVec.x = dx / m; touchVec.y = dy / m; knob.style.transform = `translate(${dx}px,${dy}px)`; touchRun = l > 58; } }, { passive: false });
  const end = e => { for (const t of e.changedTouches) if (t.identifier === sid) { sid = null; touchVec.x = touchVec.y = 0; knob.style.transform = ''; touchRun = false; } };
  addEventListener('touchend', end); addEventListener('touchcancel', end);
  // Kamera mit dem Finger drehen (überall außer Joystick und Tasten)
  let cid = null, lx = 0, ly = 0;
  $('game').addEventListener('touchstart', e => { const t = e.changedTouches[0]; if (cid === null) { cid = t.identifier; lx = t.clientX; ly = t.clientY; } }, { passive: true });
  addEventListener('touchmove', e => { for (const t of e.changedTouches) if (t.identifier === cid) { CAMS.yaw += (t.clientX - lx) * 0.008; CAMS.pitch = clamp(CAMS.pitch + (t.clientY - ly) * 0.005, 0.05, 1.25); lx = t.clientX; ly = t.clientY; CAMS.dragT = 0; } }, { passive: true });
  const cend = e => { for (const t of e.changedTouches) if (t.identifier === cid) cid = null; };
  addEventListener('touchend', cend); addEventListener('touchcancel', cend);
  document.querySelectorAll('#touch [data-key]').forEach(b => {
    b.addEventListener('touchstart', e => { e.preventDefault(); e.stopPropagation(); const k = b.dataset.key; if (Dlg.open) { Dlg.next(); return; } pressed.add(k); }, { passive: false });
  });
}

// ===== Start =====
function init() {
  resize();
  $('loading').textContent = 'Der Wald wächst …';
  setTimeout(() => {
    buildTerrain(); buildObjects(); init3D();
    $('loading').classList.add('hidden'); $('titleBtns').classList.remove('hidden');
    G = null;
    // Hintergrund für den Titelbildschirm
    G = { time: 10 * 60, cats: [], player: { catId: 'x', carry: [], herbs: {} }, clan: { pile: 30 }, others: newOtherClans(), herbsTaken: {}, missions: [], nextId: 1, story: { q: 0, s: 0 }, seen: {}, flags: {}, stage: 'title', eventQ: [] };
    G.cats.push(makeCat({ id: 'x', look: L('#e0782a', '#a8480f', 0, '#6fc23a'), x: 2300, y: 2500 }));
    showTitle();
    requestAnimationFrame(frame);
  }, 30);
  $('btnNew').onclick = () => { if (hasSave() && !confirm('Neues Spiel beginnen? Der gespeicherte Spielstand wird überschrieben.')) return; newGame(); };
  $('btnLoad').onclick = () => { if (!loadGame()) toast('Kein Spielstand gefunden.'); };
  $('btnHelp').onclick = () => { $('titleHelp').classList.toggle('hidden'); };
  $('titleHelp').innerHTML = HELP_HTML;
  $('panel').addEventListener('click', panelClick);
  $('dialog').addEventListener('click', () => { if (!Dlg.choosing) Dlg.next(); });
  document.querySelectorAll('#menubar [data-open]').forEach(b => b.onclick = () => { if (b.dataset.open === 'menu' && UI.panel) closePanel(); else openPanel(b.dataset.open); });
  if (isTouch) setupTouch();
  addEventListener('beforeunload', () => { if (state === 'play') saveGame(); });
}
init();
