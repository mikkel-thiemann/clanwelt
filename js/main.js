'use strict';
// ===== Hauptprogramm =====
let G = null;
const ENTS = [], PREY = [], CARS = [], FX = [];
const SEASONS = ['Blattfrische', 'Blattgrüne', 'Blattfall', 'Blattleere'];
const SAVE_KEY = 'clanwelt_save_v1';
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
    story: { q: 0, s: 0, prog: 0 }, flags: {}, stage: 'hauskaetzchen', stages: {},
    clan: { pile: 34, health: 80, morale: 70, terr: 80 }, others: newOtherClans(),
    missions: [], chron: [], prophecies: [], herbsTaken: {}, seen: {}, eventQ: [], evSeen: {}, lastDay: 0, freeplay: false, weather: null
  };
  createStartCats();
  setStage('hauskaetzchen');
  chron('Sammy, ein junges Hauskätzchen, lebt am Rand des Waldes.');
  startPlay();
  Story.enter();
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
  const pc = P(); cam.x = pc.x; cam.y = pc.y;
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
  const pc = P(), pl = G.player, inp = inputVec();
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
const cv = $('game'), ctx = cv.getContext('2d');
let dpr = 1, VW = 0, VH = 0, zoom = 1, nightCv = null;
const cam = { x: 2100, y: 3700 };
function resize() {
  dpr = Math.min(2, window.devicePixelRatio || 1); VW = innerWidth; VH = innerHeight;
  cv.width = VW * dpr; cv.height = VH * dpr;
  zoom = clamp(Math.min(VW / 1150, VH / 820), 0.62, 1.35);
  nightCv = document.createElement('canvas'); nightCv.width = VW; nightCv.height = VH;
  if (UI.panel === 'map') drawBigMap();
}
addEventListener('resize', resize);
const weather = [];
function render(t) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = '#0b0f0a'; ctx.fillRect(0, 0, VW, VH);
  if (!G) return;
  const pc = P();
  let fx = pc.x, fy = pc.y;
  if (state === 'title') { fx = 2300 + Math.sin(t * 0.05) * 400; fy = 2500 + Math.cos(t * 0.04) * 300; }
  cam.x = lerp(cam.x, fx, state === 'title' ? 1 : 0.12); cam.y = lerp(cam.y, fy, state === 'title' ? 1 : 0.12);
  const hw = VW / 2 / zoom, hh = VH / 2 / zoom;
  cam.x = clamp(cam.x, hw, W - hw); cam.y = clamp(cam.y, hh, H - hh);
  const v = { x0: cam.x - hw, y0: cam.y - hh, x1: cam.x + hw, y1: cam.y + hh };
  ctx.setTransform(dpr * zoom, 0, 0, dpr * zoom, dpr * (VW / 2 - cam.x * zoom), dpr * (VH / 2 - cam.y * zoom));
  drawGround(ctx, v);
  drawLow(ctx, v, t);
  // Beute am Boden
  for (const p of PREY) if (vis(p, v, 20) && p.st !== 'fly') {
    drawPreyShape(ctx, p.k, p.x, p.y, p.dir, false);
    if (p.st2 === 'alert' && p.st !== 'flee') { ctx.fillStyle = '#ffe14a'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('!', p.x, p.y - 12); }
  }
  // Katzen & Wesen nach Y sortiert
  const list = [];
  for (const c of G.cats) if (c.alive && !c.hidden && vis(c, v, 40)) list.push(c);
  for (const e of ENTS) if (vis(e, v, 50)) list.push(e);
  for (const c of CARS) if (vis(c, v, 60)) list.push(c);
  list.sort((a, b) => a.y - b.y);
  for (const e of list) {
    if (e.sp && e.lane !== undefined) { drawCar(ctx, e); continue; }
    if (e.beast) { drawBeast(ctx, e, t); continue; }
    const s = e.kind === 'cat' ? (e.rank === 'anfuehrer' ? 1.1 : 1) * (e.look.size || 1) : catSize(e);
    drawCatShape(ctx, e.look, e.x, e.y, e.dir, s, { phase: e.phase, moving: e.moving, sleep: e.sleep && !e.moving, sneak: e === pc && G.player.sneak, t: t + (e.ox || 0), flash: e.flash, carry: e === pc && G.player.carry[0], star: e.alive === false });
  }
  // Fliegende Vögel
  for (const p of PREY) if (p.st === 'fly' && vis(p, v, 30)) drawPreyShape(ctx, p.k, p.x, p.y - (p.z || 0), p.dir, false, p.flap);
  drawHigh(ctx, v, pc.x, pc.y, t);
  // Namen, Sprechblasen, Lebensbalken
  ctx.textAlign = 'center';
  const named = new Set(list.filter(e => e !== pc && !(e.lane !== undefined && e.sp) && !e.hostile && !e.spar && dist(e.x, e.y, pc.x, pc.y) < 110)
    .sort((a, b) => dist(a.x, a.y, pc.x, pc.y) - dist(b.x, b.y, pc.x, pc.y)).slice(0, 3));
  for (const e of list) {
    if (e.lane !== undefined && e.sp) continue;
    const nm = e.beast ? e.name : nameOf(e);
    if (e !== pc && (named.has(e) || e.hostile || e.spar) && state === 'play') {
      ctx.font = '11px Trebuchet MS'; ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillText(nm, e.x + 1, e.y - 25);
      ctx.fillStyle = e.hostile || e.spar ? '#ff9a8a' : (e.team && e.team !== 'donner' ? '#cfe0ff' : '#fff3c4'); ctx.fillText(nm, e.x, e.y - 26);
    }
    if ((e.hostile || e.spar || e === pc) && e.hp < e.maxHp && e.maxHp < 5000) { ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(e.x - 16, e.y - 22, 32, 4); ctx.fillStyle = e === pc ? '#6ee06e' : '#ff5050'; ctx.fillRect(e.x - 16, e.y - 22, 32 * clamp(e.hp / e.maxHp, 0, 1), 4); }
    if (e.sayT > 0 && e.sayText) bubble(e.x, e.y - 40, e.sayText);
  }
  for (const f of FX) { ctx.globalAlpha = clamp(f.t, 0, 1); ctx.font = 'bold 14px Trebuchet MS'; ctx.fillStyle = '#000'; ctx.fillText(f.text, f.x + 1, f.y + 1); ctx.fillStyle = f.col; ctx.fillText(f.text, f.x, f.y); ctx.globalAlpha = 1; }
  // Zielmarkierungen in der Welt
  if (state === 'play') for (const tg of targets()) if (vis(tg, v, 0)) { const bob = Math.sin(t * 4) * 5; ctx.fillStyle = tg.col; ctx.beginPath(); ctx.moveTo(tg.x, tg.y - 34 + bob); ctx.lineTo(tg.x - 8, tg.y - 48 + bob); ctx.lineTo(tg.x + 8, tg.y - 48 + bob); ctx.fill(); }
  // ---- Bildschirm-Ebene ----
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawNight(pc);
  drawWeather(t);
  if (state === 'play') drawArrows(v);
  if (state === 'play' && pc.hp < pc.maxHp * 0.3) { const g = ctx.createRadialGradient(VW / 2, VH / 2, VH * 0.3, VW / 2, VH / 2, VH * 0.8); g.addColorStop(0, 'rgba(120,0,0,0)'); g.addColorStop(1, `rgba(140,0,0,${0.35 + Math.sin(t * 5) * 0.1})`); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH); }
}
function bubble(x, y, text) {
  ctx.font = '12px Trebuchet MS'; const w = ctx.measureText(text).width + 14;
  ctx.fillStyle = 'rgba(255,250,235,.95)'; roundRect(ctx, x - w / 2, y - 18, w, 20, 8); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 5, y + 2); ctx.lineTo(x + 5, y + 2); ctx.lineTo(x, y + 8); ctx.fill();
  ctx.fillStyle = '#2a2014'; ctx.fillText(text, x, y - 4);
}
function nightAlpha() { const h = hour(); if (h >= 21 || h < 5) return 0.62; if (h >= 18.5) return (h - 18.5) / 2.5 * 0.62; if (h < 7) return (7 - h) / 2 * 0.62; return 0; }
function drawNight(pc) {
  const a = nightAlpha(); if (a <= 0.01) return;
  const g = nightCv.getContext('2d');
  g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, VW, VH);
  g.fillStyle = `rgba(8,12,38,${a})`; g.fillRect(0, 0, VW, VH);
  const sx = (pc.x - cam.x) * zoom + VW / 2, sy = (pc.y - cam.y) * zoom + VH / 2, r = 260 * zoom;
  g.globalCompositeOperation = 'destination-out';
  const gr = g.createRadialGradient(sx, sy, r * 0.2, sx, sy, r); gr.addColorStop(0, 'rgba(0,0,0,.75)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, VW, VH);
  ctx.drawImage(nightCv, 0, 0);
  if (a > 0.4) { ctx.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 40; i++) { const x = (i * 97.3) % VW, y = (i * 53.7) % (VH * 0.3); ctx.globalAlpha = (a - 0.4) * 2 * (0.4 + (i % 3) * 0.2); ctx.fillRect(x, y, 1.5, 1.5); } ctx.globalAlpha = 1; }
}
function drawWeather(t) {
  if (!G.weather) { weather.length = 0; return; }
  while (weather.length < 140) weather.push({ x: Math.random() * VW, y: Math.random() * VH, s: rand(0.6, 1.4) });
  ctx.strokeStyle = 'rgba(190,210,255,.45)'; ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 1;
  for (const p of weather) {
    if (G.weather === 'regen') { p.y += 16 * p.s; p.x -= 3; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + 3, p.y - 12 * p.s); ctx.stroke(); }
    else { p.y += 1.3 * p.s; p.x += Math.sin(t + p.s * 10) * 0.6; ctx.beginPath(); ctx.arc(p.x, p.y, 1.8 * p.s, 0, TAU); ctx.fill(); }
    if (p.y > VH) { p.y = -10; p.x = Math.random() * VW; } if (p.x < 0) p.x = VW;
  }
}
function drawArrows(v) {
  for (const tg of targets()) {
    if (vis(tg, v, -40)) continue;
    const sx = (tg.x - cam.x) * zoom + VW / 2, sy = (tg.y - cam.y) * zoom + VH / 2;
    const a = Math.atan2(sy - VH / 2, sx - VW / 2);
    const m = 46, ex = clamp(sx, m, VW - m), ey = clamp(sy, m + (VW < 700 ? 110 : 0), VH - m);
    ctx.save(); ctx.translate(ex, ey); ctx.rotate(a);
    ctx.fillStyle = tg.col; ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(-10, -12); ctx.lineTo(-4, 0); ctx.lineTo(-10, 12); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
    const d = Math.round(dist(tg.x, tg.y, P().x, P().y) / 10);
    ctx.font = 'bold 11px Trebuchet MS'; ctx.textAlign = 'center'; ctx.fillStyle = '#000'; ctx.fillText(d + ' m', ex + 1, ey + 27); ctx.fillStyle = tg.col; ctx.fillText(d + ' m', ex, ey + 26);
  }
}

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
  if (!window.NORENDER) render(gameT);
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
  document.querySelectorAll('#touch [data-key]').forEach(b => {
    b.addEventListener('touchstart', e => { e.preventDefault(); e.stopPropagation(); const k = b.dataset.key; if (Dlg.open) { Dlg.next(); return; } pressed.add(k); }, { passive: false });
  });
}

// ===== Start =====
function init() {
  resize();
  $('loading').textContent = 'Der Wald wächst …';
  setTimeout(() => {
    buildTerrain(); buildObjects();
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
