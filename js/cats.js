'use strict';
// ===== Katzen: Daten, Aussehen, Verhalten, Kampf =====
const RANKS = {
  anfuehrer: ['Anführer', 'Anführerin'], zweiter: ['Zweiter Anführer', 'Zweite Anführerin'], heiler: ['Heiler', 'Heilerin'],
  heilerschueler: ['Heilerschüler', 'Heilerschülerin'], krieger: ['Krieger', 'Kriegerin'], schueler: ['Schüler', 'Schülerin'],
  koenigin: ['Königin', 'Königin'], junges: ['Junges', 'Junges'], aeltester: ['Ältester', 'Älteste'],
  hauskaetzchen: ['Hauskätzchen', 'Hauskätzchen'], einzel: ['Einzelläufer', 'Einzelläuferin'], sternen: ['SternenClan', 'SternenClan']
};
const RANK_ORDER = ['anfuehrer', 'zweiter', 'heiler', 'heilerschueler', 'krieger', 'schueler', 'koenigin', 'junges', 'aeltester'];
const rankName = c => (RANKS[c.rank] || ['?', '?'])[c.sex === 'w' ? 1 : 0];
function catName(c) {
  if (!c) return '?';
  if (c.name) return c.name;
  if (c.fixed) return c.fixed;
  switch (c.rank) {
    case 'junges': return c.pre + 'junges';
    case 'schueler': case 'heilerschueler': return c.pre + 'pfote';
    case 'anfuehrer': return c.pre + 'stern';
    default: return c.pre + c.suf;
  }
}
const nameOf = e => e ? (e.name || catName(e)) : '';
const catById = id => G.cats.find(c => c.id === id);
const P = () => catById(G.player.catId);
const clanCats = () => G.cats.filter(c => c.alive && c.clan === 'donner');
const isFighterRank = r => r === 'krieger' || r === 'zweiter' || r === 'anfuehrer' || r === 'schueler';

function defaultSkills(rank) {
  if (rank === 'anfuehrer' || rank === 'zweiter') return { jagd: 3, kampf: 3, ausdauer: 2, tempo: 2 };
  if (rank === 'krieger') return { jagd: 2, kampf: 2, ausdauer: 1, tempo: 1 };
  if (rank === 'schueler') return { jagd: 1, kampf: 1, ausdauer: 0, tempo: 1 };
  return { jagd: 0, kampf: 0, ausdauer: 0, tempo: 0 };
}
function makeCat(o) {
  const c = Object.assign({
    id: 'k' + (G.nextId++), pre: pick(PREFIXES), suf: pick(SUFFIXES), rank: 'krieger', age: 30, sex: chance(0.5) ? 'w' : 'm',
    clan: 'donner', alive: true, rel: 50, xp: 0, lvl: 1, duty: 'jagd', mentor: null, look: randomLook(),
    x: 0, y: 0, dir: Math.random() * TAU, hidden: false
  }, o);
  if (!c.sk) c.sk = defaultSkills(c.rank);
  c.ox = (hashStr(c.id) - 0.5) * 60; c.oy = (hashStr(c.id + 'y') - 0.5) * 40;
  c.maxHp = maxHpOf(c); c.hp = c.maxHp;
  return c;
}
function maxHpOf(c) {
  let b = 90;
  if (c.rank === 'junges') b = 25; else if (c.rank === 'schueler' || c.rank === 'heilerschueler' || (c.rank === 'hauskaetzchen' && c.age < 12)) b = 65;
  else if (c.rank === 'aeltester') b = 60; else if (c.rank === 'anfuehrer') b = 110;
  return b + (c.sk ? c.sk.ausdauer : 0) * 12;
}
const atkOf = c => 7 + (c.sk ? c.sk.kampf : 0) * 3 + (c.rank === 'krieger' || c.rank === 'zweiter' || c.rank === 'anfuehrer' ? 3 : 0);
function catSize(c) {
  if (c.rank === 'junges') return 0.45 + Math.min(6, c.age) * 0.04;
  if (c.rank === 'schueler' || c.rank === 'heilerschueler' || (c.rank === 'hauskaetzchen' && c.age < 12)) return 0.82;
  return (c.look && c.look.size) || 1;
}
function setRank(c, rank) {
  c.rank = rank; const hpF = c.hp / (c.maxHp || 1);
  const d = defaultSkills(rank); for (const k in d) c.sk[k] = Math.max(c.sk[k] || 0, d[k]);
  c.maxHp = maxHpOf(c); c.hp = c.maxHp * clamp(hpF, 0.3, 1);
}

// ===== Zeichnen =====
// Porträt im gemalten Anime-Stil (wie Fan-Art): Hintergrund mit Wald und Lichtpunkten, flauschiger Kopf, große leuchtende Augen
function drawPortrait(ctx, look, w, h, opt = {}) {
  ctx.save(); ctx.clearRect(0, 0, w, h);
  const s = w / 96, R = mulberry32(hashStr(JSON.stringify(look || {})) * 1e9 | 0);
  const night = opt.star || (typeof G !== 'undefined' && G && G.time !== undefined && typeof isNight === 'function' && isNight());
  // --- Hintergrund: weicher Wald, Stämme, Lichtpunkte ---
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  if (night) { bg.addColorStop(0, '#1d3f9a'); bg.addColorStop(0.6, '#0e2466'); bg.addColorStop(1, '#07123a'); }
  else { bg.addColorStop(0, '#b8d890'); bg.addColorStop(0.5, '#6f9a52'); bg.addColorStop(1, '#2f4a26'); }
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 0.35; ctx.fillStyle = night ? '#050c28' : '#2a3a1c';
  for (let i = 0; i < 4; i++) { const x = (0.1 + i * 0.27 + R() * 0.08) * w; ctx.fillRect(x, 0, (4 + R() * 7) * s, h); }
  ctx.globalAlpha = 1;
  if (!night) { const gr = ctx.createLinearGradient(w * 0.2, 0, w * 0.5, h); gr.addColorStop(0, 'rgba(255,250,200,.45)'); gr.addColorStop(1, 'rgba(255,250,200,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(w * 0.25, 0); ctx.lineTo(w * 0.45, 0); ctx.lineTo(w * 0.75, h); ctx.lineTo(w * 0.5, h); ctx.fill(); }
  for (let i = 0; i < 22; i++) { ctx.globalAlpha = 0.25 + R() * 0.6; ctx.fillStyle = night ? '#dfeaff' : '#fff8d8'; ctx.beginPath(); ctx.arc(R() * w, R() * h, (0.4 + R() * 1.4) * s, 0, TAU); ctx.fill(); }
  ctx.globalAlpha = 1;
  if (!look) { ctx.restore(); return; }
  const base = look.base, dark = hexMix(base, '#000000', 0.45), light = hexMix(base, '#ffffff', 0.35);
  const cx = w * 0.5, cy = h * 0.6, r = w * 0.3, earS = look.earS || 1, rim = night ? '#9fc4ff' : '#fff0c0';
  // --- Hals / Schultern ---
  ctx.fillStyle = dark; ctx.beginPath(); ctx.ellipse(cx, h * 1.02, r * 1.6, r * 0.9, 0, 0, TAU); ctx.fill();
  // --- Ohren ---
  for (const sg of [-1, 1]) {
    ctx.fillStyle = base; ctx.beginPath(); ctx.moveTo(cx + sg * r * 0.25, cy - r * 0.7); ctx.lineTo(cx + sg * r * 0.95, cy - r * (1.55 * earS)); ctx.lineTo(cx + sg * r * 1.05, cy - r * 0.25); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d9909a'; ctx.beginPath(); ctx.moveTo(cx + sg * r * 0.45, cy - r * 0.68); ctx.lineTo(cx + sg * r * 0.9, cy - r * (1.35 * earS)); ctx.lineTo(cx + sg * r * 0.93, cy - r * 0.45); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 0.7 * s; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(cx + sg * r * 0.85, cy - r * 0.5); ctx.lineTo(cx + sg * r * (0.6 + k * 0.08), cy - r * (0.95 + k * 0.1)); ctx.stroke(); }
  }
  // --- Kopf mit flauschigem Rand (Fellbüschel) ---
  const head = new Path2D(); const N = 40;
  for (let i = 0; i <= N; i++) { const a = i / N * TAU, tuft = (i % 2 ? 1.0 : 1.09) + (Math.sin(a) > 0.2 ? 0.12 * (i % 2) : 0) + (look.long ? 0.06 : 0); const rx = r * 1.08 * tuft * (look.fat ? 1.1 : 1), ry = r * 0.98 * tuft; const x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry + (Math.sin(a) > 0 ? Math.sin(a) * r * 0.1 : 0); i ? head.lineTo(x, y) : head.moveTo(x, y); }
  head.closePath();
  const hg = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.4, r * 0.1, cx, cy, r * 1.3); hg.addColorStop(0, light); hg.addColorStop(0.55, base); hg.addColorStop(1, dark);
  ctx.fillStyle = hg; ctx.fill(head);
  ctx.save(); ctx.clip(head);
  if (look.patch) { ctx.fillStyle = look.patch; ctx.beginPath(); ctx.ellipse(cx - r * 0.5, cy - r * 0.45, r * 0.45, r * 0.38, 0.4, 0, TAU); ctx.fill(); }
  if (look.dorsal) { ctx.fillStyle = look.dorsal; ctx.fillRect(cx - r * 0.12, cy - r * 1.1, r * 0.24, r * 0.5); }
  if (look.stripe) {
    ctx.strokeStyle = look.stripe; ctx.lineCap = 'round';
    ctx.lineWidth = r * 0.09; for (const dx of [-0.28, 0, 0.28]) { ctx.beginPath(); ctx.moveTo(cx + dx * r, cy - r * 0.95); ctx.quadraticCurveTo(cx + dx * r * 1.1, cy - r * 0.7, cx + dx * r * 0.7, cy - r * 0.42); ctx.stroke(); }
    ctx.lineWidth = r * 0.07; for (const sg of [-1, 1]) for (let k = 0; k < 2; k++) { ctx.beginPath(); ctx.moveTo(cx + sg * r * 1.05, cy + r * (0.0 + k * 0.22)); ctx.quadraticCurveTo(cx + sg * r * 0.8, cy + r * (0.02 + k * 0.2), cx + sg * r * 0.62, cy + r * (0.12 + k * 0.18)); ctx.stroke(); }
  }
  // Fell-Pinselstriche
  for (let i = 0; i < 70; i++) { const a = R() * TAU, d = R() * r; ctx.strokeStyle = R() < 0.5 ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.12)'; ctx.lineWidth = 0.8 * s; const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * 0.9; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * 3 * s, y + Math.sin(a) * 3 * s); ctx.stroke(); }
  ctx.restore();
  // Lichtsaum am Rand
  ctx.save(); ctx.strokeStyle = rim; ctx.globalAlpha = 0.7; ctx.lineWidth = 1.6 * s; ctx.shadowColor = rim; ctx.shadowBlur = 6 * s; ctx.stroke(head); ctx.restore();
  // --- Schnauze, Wangen ---
  const muz = look.white > 0.35 ? '#f4efe6' : (look.muzzle || hexMix(base, '#fff4e0', 0.45));
  ctx.fillStyle = muz; ctx.beginPath(); ctx.ellipse(cx, cy + r * 0.42, r * 0.5 * (look.flatface ? 1.1 : 1), r * 0.36, 0, 0, TAU); ctx.fill();
  if (look.white > 0.5) { ctx.beginPath(); ctx.moveTo(cx, cy - r * 0.55); ctx.lineTo(cx - r * 0.16, cy + r * 0.15); ctx.lineTo(cx + r * 0.16, cy + r * 0.15); ctx.fill(); }
  // --- Große Anime-Augen ---
  for (const sg of [-1, 1]) {
    const ex = cx + sg * r * 0.43, ey = cy - r * 0.05, ew = r * 0.27, eh = r * 0.21;
    ctx.save(); ctx.translate(ex, ey); ctx.rotate(sg * -0.18);
    const almond = new Path2D(); almond.moveTo(-ew, eh * 0.15); almond.quadraticCurveTo(0, -eh * 1.5, ew, -eh * 0.25); almond.quadraticCurveTo(0, eh * 1.3, -ew, eh * 0.15);
    const ig = ctx.createRadialGradient(0, eh * 0.2, 1, 0, 0, ew * 1.1); ig.addColorStop(0, hexMix(look.eye, '#ffffff', 0.5)); ig.addColorStop(0.55, look.eye); ig.addColorStop(1, hexMix(look.eye, '#000000', 0.45));
    ctx.shadowColor = look.eye; ctx.shadowBlur = (night ? 10 : 4) * s; ctx.fillStyle = ig; ctx.fill(almond); ctx.shadowBlur = 0;
    ctx.save(); ctx.clip(almond); ctx.fillStyle = '#060404'; ctx.beginPath(); ctx.ellipse(0, 0, ew * 0.2, eh * 1.05, 0, 0, TAU); ctx.fill(); ctx.restore();
    ctx.strokeStyle = '#140a06'; ctx.lineWidth = 1.8 * s; ctx.stroke(almond);
    ctx.lineWidth = 2.6 * s; ctx.beginPath(); ctx.moveTo(-ew * 1.05, eh * 0.1); ctx.quadraticCurveTo(0, -eh * 1.55, ew * 1.1, -eh * 0.35); ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(ew * 0.25, -eh * 0.3, 1.5 * s, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(-ew * 0.25, eh * 0.3, 0.8 * s, 0, TAU); ctx.fill();
    ctx.restore();
  }
  // --- Nase, Mund, Schnurrhaare ---
  ctx.fillStyle = '#d2828e'; ctx.beginPath(); ctx.moveTo(cx - r * 0.1, cy + r * 0.24); ctx.lineTo(cx + r * 0.1, cy + r * 0.24); ctx.lineTo(cx, cy + r * 0.36); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(40,20,20,.7)'; ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.moveTo(cx, cy + r * 0.36); ctx.quadraticCurveTo(cx - r * 0.08, cy + r * 0.5, cx - r * 0.18, cy + r * 0.46); ctx.moveTo(cx, cy + r * 0.36); ctx.quadraticCurveTo(cx + r * 0.08, cy + r * 0.5, cx + r * 0.18, cy + r * 0.46); ctx.stroke();
  ctx.fillStyle = 'rgba(60,30,30,.5)'; for (const sg of [-1, 1]) for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(cx + sg * r * (0.2 + k * 0.08), cy + r * (0.4 + (k % 2) * 0.06), 0.6 * s, 0, TAU); ctx.fill(); }
  ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 0.6 * s;
  for (const sg of [-1, 1]) for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(cx + sg * r * 0.3, cy + r * 0.42 + i * 2 * s); ctx.quadraticCurveTo(cx + sg * r * 0.9, cy + r * (0.3 + i * 0.12), cx + sg * r * 1.5, cy + r * (0.3 + i * 0.22)); ctx.stroke(); }
  if (opt.star) { ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = 'rgba(120,160,255,.25)'; ctx.fillRect(0, 0, w, h); }
  ctx.restore();
}
const portraitCache = new Map();
function portraitURL(look, size = 48, star = false) {
  const k = JSON.stringify(look) + size + star + (typeof isNight === 'function' && G && G.time !== undefined && isNight());
  if (portraitCache.has(k)) return portraitCache.get(k);
  const c = document.createElement('canvas'); c.width = c.height = size;
  drawPortrait(c.getContext('2d'), look, size, size, { star });
  const u = c.toDataURL(); portraitCache.set(k, u); return u;
}

// ===== Beute =====
const PREY_T = {
  maus: { n: 'Maus', sp: 135, sz: 5, col: '#8b7a66', val: 1, xp: 8, ter: ['donner', 'schatten', 'zweibeiner', 'fluss', 'hochland', 'baumgeviert'] },
  wuehlmaus: { n: 'Wühlmaus', sp: 120, sz: 5.5, col: '#6b5a46', val: 1, xp: 8, ter: ['donner', 'fluss', 'wind'] },
  eichhoernchen: { n: 'Eichhörnchen', sp: 195, sz: 7, col: '#b5602a', val: 2, xp: 14, ter: ['donner', 'baumgeviert'] },
  amsel: { n: 'Amsel', sp: 260, sz: 6, col: '#26262a', val: 1, xp: 12, fly: true, ter: ['donner', 'schatten', 'fluss', 'zweibeiner'] },
  kaninchen: { n: 'Kaninchen', sp: 245, sz: 9, col: '#9b8a70', val: 3, xp: 18, ter: ['wind', 'hochland'] },
  frosch: { n: 'Frosch', sp: 110, sz: 5, col: '#5a8a3a', val: 1, xp: 8, ter: ['schatten'] },
  fisch: { n: 'Fisch', sp: 120, sz: 7, col: '#a8b8c8', val: 2, xp: 14, water: true },
};
const SEASON_PREY = [1.0, 1.25, 0.85, 0.45];
function preyNoise(pc) {
  let n;
  const sneak = G.player.sneak, run = pc.running;
  if (pc.moving) n = sneak ? 55 : run ? 330 : 165; else n = sneak ? 25 : 55;
  n *= 1 - 0.07 * (pc.sk.jagd || 0);
  if (inBush(pc.x, pc.y)) n *= 0.6;
  if (isNight()) n *= 0.85;
  return n;
}
function spawnPrey(pc) {
  const cap = Math.round(20 * SEASON_PREY[season()]) + 4;
  if (PREY.length >= cap) return;
  const a = Math.random() * TAU, d = rand(420, 1000), x = pc.x + Math.cos(a) * d, y = pc.y + Math.sin(a) * d;
  if (x < 20 || y < 20 || x > W - 20 || y > H - 20) return;
  let k;
  if (inRiver(x, y)) { if (chance(0.5)) k = 'fisch'; else return; }
  else {
    if (isWater(x, y) || inRoad(x, y)) return;
    for (const cp of OB.camps) if (dist(x, y, cp.lm.x, cp.lm.y) < cp.lm.r + 20) return;
    if (G.flags.zerstoert && x < OLD_W && chance(0.5 + G.flags.zerstoert * 0.4)) return;
    let t = territoryAt(x, y); if (t === 'verlassen') t = 'donner'; if (t === 'berge' || t === 'kueste') t = 'hochland';
    const opts = Object.keys(PREY_T).filter(p => PREY_T[p].ter && PREY_T[p].ter.includes(t));
    if (!opts.length) return;
    k = pick(opts);
  }
  PREY.push({ k, x, y, dir: Math.random() * TAU, st: 'wander', t: rand(1, 3), alert: 0, sp: PREY_T[k].sp });
}
function updatePrey(dt, pc) {
  spawnPrey(pc);
  const noise = preyNoise(pc);
  for (let i = PREY.length - 1; i >= 0; i--) {
    const p = PREY[i], T = PREY_T[p.k], d = dist(p.x, p.y, pc.x, pc.y);
    if (d > 1400 || p.gone) { PREY.splice(i, 1); continue; }
    p.t -= dt;
    if (p.st === 'fly') { p.x += Math.cos(p.dir) * p.sp * dt; p.y += Math.sin(p.dir) * p.sp * dt; p.flap = (p.flap || 0) + dt * 25; p.z = Math.min(40, (p.z || 0) + dt * 60); if (p.t < 0) PREY.splice(i, 1); continue; }
    if (p.st !== 'flee') {
      if (d < noise) { if (T.fly) { p.st = 'fly'; p.t = 2.5; p.dir = Math.atan2(p.y - pc.y, p.x - pc.x) + rand(-0.4, 0.4); } else { p.st = 'flee'; p.t = rand(2, 3.5); } continue; }
      if (d < noise * 1.7) { p.alert += dt; if (p.alert > 1.2 && d < noise * 1.25) { p.st = 'flee'; p.t = 2.5; } p.st2 = 'alert'; }
      else { p.alert = Math.max(0, p.alert - dt); p.st2 = null; }
    }
    let sp = 0;
    if (p.st === 'flee') {
      const a = Math.atan2(p.y - pc.y, p.x - pc.x); p.dir += angDiff(p.dir, a + Math.sin(p.t * 5) * 0.4) * Math.min(1, dt * 6); sp = p.sp;
      if (p.t < 0) { if (d > noise * 1.4) { p.st = 'wander'; p.t = 1; } else p.t = 1; }
    } else if (p.st2 !== 'alert') {
      if (p.t < 0) { p.st = p.st === 'wander' ? 'graze' : 'wander'; p.t = rand(1, 3.5); p.dir += rand(-1.5, 1.5); }
      if (p.st === 'wander') sp = p.sp * 0.25;
    }
    if (sp) {
      const nx = p.x + Math.cos(p.dir) * sp * dt, ny = p.y + Math.sin(p.dir) * sp * dt;
      if (T.water ? inRiver(nx, ny) : (!isWater(nx, ny) && !inRoad(nx, ny) || p.st === 'flee')) { p.x = nx; p.y = ny; collide(p, 4); }
      else { p.dir += Math.PI * 0.7; }
    }
  }
}

// ===== Transiente Wesen (Gegner, andere Clans, Tiere) =====
const BEASTS = {
  fuchs: { name: 'Fuchs', hp: 70, atk: 11, sp: 185, r: 18, col: '#c8641e' },
  hund: { name: 'Hund', hp: 110, atk: 14, sp: 215, r: 24, col: '#7a5a3a' },
  dachs: { name: 'Dachs', hp: 140, atk: 16, sp: 140, r: 20, col: '#555' },
  meute: { name: 'Anführer der Meute', hp: 9999, atk: 18, sp: 205, r: 28, col: '#3a2e26' },
  ratte: { name: 'Ratte', hp: 16, atk: 4, sp: 165, r: 6, col: '#6a625a' },
  scharfzahn: { name: 'Scharfzahn', hp: 360, atk: 17, sp: 230, r: 30, col: '#b8925a' },
};
function spawnBeast(kind, x, y, o = {}) {
  const B = BEASTS[kind];
  const e = Object.assign({ kind, beast: true, name: B.name, hp: B.hp, maxHp: B.hp, atk: B.atk, speed: B.sp, r: B.r, x, y, dir: 0, team: 'tier', hostile: true, fleeAt: 0.2 }, o);
  ENTS.push(e); return e;
}
function spawnClanCat(team, x, y, o = {}) {
  const lv = o.lv || 1;
  const e = Object.assign({
    kind: 'cat', team, pre: pick(PREFIXES), suf: pick(SUFFIXES), rank: 'krieger', sex: chance(0.5) ? 'w' : 'm', look: randomLook(team === 'schatten'),
    x, y, dir: Math.random() * TAU, hostile: true, fleeAt: 0.3, speed: 175 + lv * 5, r: 10, sk: { kampf: lv, jagd: 1, ausdauer: 0, tempo: 1 }
  }, o);
  e.name = e.name || catName(e);
  e.maxHp = e.hp = o.hp || (70 + lv * 12); e.atk = o.atk || (6 + lv * 2.5);
  ENTS.push(e); return e;
}
const teamOf = e => e.team || e.clan;
function isFoe(a, b) {
  if (a === b || b.dead || a.dead || b.defeated || a.defeated || b.hidden || a.hidden || !b.alive && b.alive !== undefined) return false;
  const pc = P();
  if ((a.spar && b === pc) || (b.spar && a === pc)) return true;
  if (a.spar || b.spar) return false;
  if (a.beast && b.beast) return false;
  if (a.beast || b.beast) return !(b.star || a.star || a.tame || b.tame);
  if (teamOf(a) === teamOf(b)) return false;
  if (a.truce || b.truce) return false;
  return !!(a.hostile || b.hostile);
}
function fighters() { return G.cats.filter(c => c.alive && !c.hidden).concat(ENTS); }
function nearestFoe(e, range) {
  let best = null, bd = range;
  for (const o of fighters()) { if (!isFoe(e, o)) continue; const d = dist(e.x, e.y, o.x, o.y); if (d < bd) { bd = d; best = o; } }
  return best;
}
function moveEnt(e, vx, vy, dt) {
  let f = 1;
  if (isWater(e.x, e.y) && !e.beast) f = e.team === 'fluss' ? 0.85 : 0.5;
  if (e.kx || e.ky) { vx += e.kx; vy += e.ky; e.kx *= Math.pow(0.002, dt); e.ky *= Math.pow(0.002, dt); if (Math.abs(e.kx) + Math.abs(e.ky) < 5) e.kx = e.ky = 0; }
  const ox = e.x, oy = e.y;
  e.x += vx * f * dt; e.y += vy * f * dt; if (!e.onRock) collide(e, e.r || 10);
  const sp = Math.hypot(vx, vy);
  if (sp > 5) { const a = Math.atan2(vy, vx); e.dir += angDiff(e.dir, a) * Math.min(1, dt * 12); e.phase = (e.phase || 0) + dt * sp * 0.09; e.moving = true; }
  else e.moving = false;
  // gegen Hängenbleiben
  if (sp > 30 && dist(ox, oy, e.x, e.y) < sp * f * dt * 0.25) { e.stuck = (e.stuck || 0) + dt; if (e.stuck > 0.4) { e.unstick = 0.6; e.stuck = 0; e.unA = (Math.random() < 0.5 ? 1 : -1) * 1.5; } }
  else e.stuck = 0;
}
// Weg um Lagermauern herum: durch den Eingang hinein/hinaus oder außen herum
function campDetour(e, tx, ty) {
  for (const cp of OB.camps) {
    const c = cp.lm, R = c.r + 4, ein = dist(e.x, e.y, c.x, c.y) < R, tin = dist(tx, ty, c.x, c.y) < R;
    const gx = Math.cos(cp.gap), gy = Math.sin(cp.gap);
    if (ein !== tin) {
      const out = { x: c.x + gx * (R + 45), y: c.y + gy * (R + 45) }, inn = { x: c.x + gx * (R - 70), y: c.y + gy * (R - 70) };
      const along = (e.x - c.x) * gx + (e.y - c.y) * gy, side = Math.abs((e.x - c.x) * -gy + (e.y - c.y) * gx);
      if (side < 30 && along > R - 90 && along < R + 60) return { x: tin ? inn.x : out.x, y: tin ? inn.y : out.y };
      return ein ? inn : out;
    }
    if (!ein && !tin) {
      const dx = tx - e.x, dy = ty - e.y, L2 = dx * dx + dy * dy || 1;
      const u = clamp(((c.x - e.x) * dx + (c.y - e.y) * dy) / L2, 0, 1), qx = e.x + dx * u, qy = e.y + dy * u, qd = Math.hypot(qx - c.x, qy - c.y);
      if (qd < R + 20 && u > 0 && u < 1) { let nx = qx - c.x, ny = qy - c.y; if (qd < 1) { nx = -dy; ny = dx; } const nl = Math.hypot(nx, ny); return { x: c.x + nx / nl * (R + 90), y: c.y + ny / nl * (R + 90) }; }
    }
  }
  return null;
}
function steer(e, tx, ty, speed, dt, stop = 5) {
  const dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy);
  if (d < stop) { moveEnt(e, 0, 0, dt); return true; }
  const via = d > 40 ? campDetour(e, tx, ty) : null;
  let a = via ? Math.atan2(via.y - e.y, via.x - e.x) : Math.atan2(dy, dx);
  if (e.unstick > 0) { e.unstick -= dt; a += e.unA; }
  moveEnt(e, Math.cos(a) * speed, Math.sin(a) * speed, dt);
  return false;
}
function fightStep(e, f, dt) {
  const d = dist(e.x, e.y, f.x, f.y), reach = (e.r || 10) + (f.r || 10) + 12;
  e.atkCd = (e.atkCd || 0) - dt;
  if (e.wind > 0) {
    e.wind -= dt; e.dir += angDiff(e.dir, Math.atan2(f.y - e.y, f.x - e.x)) * 0.3; moveEnt(e, 0, 0, dt);
    if (e.wind <= 0) { if (d < reach + 8) hurt(f, (e.atk || atkOf(e)) * rand(0.8, 1.2), e); e.atkCd = rand(0.8, 1.3) * (e.slow || 1); e.lunge = 0.12; }
    return;
  }
  if (d > reach) steer(e, f.x, f.y, e.speed || 175, dt);
  else {
    const a = Math.atan2(e.y - f.y, e.x - f.x) + 1.4;
    moveEnt(e, Math.cos(a) * 40, Math.sin(a) * 40, dt);
    if (e.atkCd <= 0) e.wind = e.windup || 0.3;
  }
}
function hurt(t, dmg, src) {
  dmg = Math.max(1, Math.round(dmg));
  const pc = P();
  if (t === pc && G.player.invul > 0) return;
  t.hp -= dmg; t.flash = 0.18;
  const a = Math.atan2(t.y - src.y, t.x - src.x), kb = t.beast ? 90 : 230;
  t.kx = Math.cos(a) * kb; t.ky = Math.sin(a) * kb;
  addFx(t.x, t.y - 22, '-' + dmg, t === pc ? '#ff7070' : '#ffe08a');
  if (typeof FX3 !== 'undefined' && FX3.sysN) FX3.hit(t, src);
  if (t === pc || src === pc) CAMS.shake = Math.max(CAMS.shake || 0, t === pc ? 3.5 : 1.5);
  if (t === pc) {
    G.player.invul = 0.25;
    if (src.spar && t.hp < t.maxHp * 0.2) { sparLost(src); return; }
    if (t.hp <= 0) playerDown(src);
  } else if (t.spar) {
    if (t.hp <= t.maxHp * 0.3) defeatEnt(t);
  } else if (t.hp <= t.maxHp * (t.fleeAt || 0) || t.hp <= 0) defeatEnt(t);
}
function sparLost(src) {
  const pc = P(); pc.hp = pc.maxHp; src.hp = src.maxHp;
  say(src, pick(['Ha! Noch mal?', 'Gib nicht auf!', 'Du musst schneller werden!']));
  toast('Du hast das Übungsduell verloren. Versuch es noch einmal!');
  src.atkCd = 1.5;
}
function defeatEnt(e) {
  if (e.spar) {
    e.spar = false; e.hp = e.maxHp; e.ai = { m: 'hold' };
    gainXp(P(), 25);
    Story.event('defeat', { group: e.group || e.id });
    return;
  }
  if (G.cats.includes(e)) { e.hurt = true; e.hp = Math.max(1, e.hp); say(e, 'Ich bin verletzt!'); return; }
  if (e.story && e.boss) { e.hp = 1; return; }
  e.defeated = true; e.hostile = false; e.fleeing = true;
  if (!e.beast && chance(0.6)) say(e, pick(['Das wirst du bereuen!', 'Rückzug!', 'Wir kommen wieder!', 'Au! Schon gut!']));
  gainXp(P(), e.beast ? 30 : 18);
  Story.event('defeat', { group: e.group });
  Missions.event('defeat', { group: e.group });
}
function playerDown(src) {
  const pc = P();
  if (pc.rank === 'anfuehrer' && G.player.lives > 1) {
    G.player.lives--;
    chron(`${catName(pc)} verlor ein Leben. (${G.player.lives} Leben übrig)`);
    Dlg.show([['erz', `Alles wird dunkel … Sternenlicht umgibt dich. Der SternenClan nimmt dir ein Leben.`], ['erz', `Du erwachst im Lager. Du hast noch ${G.player.lives} Leben.`]]);
    respawn(denPos('anfuehrer'), 1);
    return;
  }
  if (pc.rank === 'anfuehrer') { leaderDeath(); return; }
  const home = pc.clan === 'donner' ? denPos('heiler') : { x: LM.garten.x, y: LM.garten.y + 150 };
  Dlg.show([['erz', pc.clan === 'donner' ? 'Dir wird schwarz vor Augen … Du erwachst im Heilerbau. Deine Wunden wurden versorgt.' : 'Dir wird schwarz vor Augen … Du erwachst in deinem Körbchen. Deine Zweibeiner haben dich gefunden.']]);
  G.player.carry = [];
  G.time += 180;
  respawn(home, 0.6);
}
function respawn(pos, hpF) {
  const pc = P(); pc.x = pos.x; pc.y = pos.y + 20; pc.hp = pc.maxHp * hpF; pc.kx = pc.ky = 0;
  for (const e of ENTS) if (e.hostile && dist(e.x, e.y, pc.x, pc.y) < 2000 && !e.story) e.gone = true;
  for (const c of G.cats) if (c.spar) { c.hp = c.maxHp; }
  Story.resetStep();
  G.player.invul = 2;
}
function updateEnts(dt) {
  const pc = P();
  for (let i = ENTS.length - 1; i >= 0; i--) {
    const e = ENTS[i];
    if (e.flash > 0) e.flash -= dt;
    if (e.sayT > 0) e.sayT -= dt;
    if (e.gone || dist(e.x, e.y, pc.x, pc.y) > 3200 && !e.story && !e.persistent) { ENTS.splice(i, 1); continue; }
    if (e.fleeing) {
      const a = Math.atan2(e.y - pc.y, e.x - pc.x);
      moveEnt(e, Math.cos(a) * (e.speed || 170), Math.sin(a) * (e.speed || 170), dt);
      if (dist(e.x, e.y, pc.x, pc.y) > 700) ENTS.splice(i, 1);
      continue;
    }
    if (e.corpse) continue;
    if (e.kind === 'bagger') { // Zweibeiner-Monster fährt hin und her
      const tg = e.leg ? e.b : e.a;
      if (steer(e, tg.x, tg.y, 55, dt, 20)) e.leg = !e.leg;
      if (dist(e.x, e.y, pc.x, pc.y) < 120 && !(pc.carHit > 0)) { pc.carHit = 1; hurt(pc, 25, e); toast('Vorsicht vor den Monstern der Zweibeiner!'); }
      continue;
    }
    if (e.followP) { // folgt dem Spieler (z. B. WindClan auf dem Heimweg, gerettete Junge)
      const d = dist(e.x, e.y, pc.x, pc.y), sl = e.slot || 0, bx = pc.x - Math.cos(pc.dir + sl) * 60, by = pc.y - Math.sin(pc.dir + sl) * 60;
      if (d > 1000) { e.x = bx; e.y = by; }
      if (d > 75) steer(e, bx, by, d > 170 ? 250 : (e.speed || 160) * 0.9, dt, 10); else moveEnt(e, 0, 0, dt);
      continue;
    }
    if (e.ai === 'leader') { e.dir += angDiff(e.dir, Math.atan2(pc.y - e.y, pc.x - e.x)) * dt * 3; moveEnt(e, 0, 0, dt); continue; }
    if (e.chase) { // Meute-Anführer jagt den Spieler – bleibt er an Bäumen hängen oder fällt zurück, holt er auf
      const d = dist(e.x, e.y, pc.x, pc.y);
      if (d > 40) {
        const ox = e.x, oy = e.y; steer(e, pc.x, pc.y, e.speed, dt);
        e.stuckT = Math.hypot(e.x - ox, e.y - oy) < e.speed * dt * 0.3 ? (e.stuckT || 0) + dt : 0;
        if (d > 340 || e.stuckT > 0.6) { const a = Math.atan2(e.y - pc.y, e.x - pc.x); e.x = pc.x + Math.cos(a) * 230; e.y = pc.y + Math.sin(a) * 230; e.stuckT = 0; }
      } else fightStep(e, pc, dt);
      continue;
    }
    if (e.warnT !== undefined && !e.hostile) { // Grenzpatrouille warnt zuerst
      e.warnT -= dt;
      steer(e, pc.x, pc.y, 120, dt, 90);
      if (e.warnT <= 0) { if (territoryAt(pc.x, pc.y) === e.team && !e.friendly) { e.hostile = true; say(e, 'Angriff!'); } else { e.fleeing = true; e.defeated = true; } }
      continue;
    }
    const f = e.hostile || e.ally ? nearestFoe(e, e.story ? 1400 : 600) : null;
    if (f) fightStep(e, f, dt);
    else if (e.wander) {
      e.wt = (e.wt || 0) - dt;
      if (e.wt <= 0) { e.wt = rand(2, 5); const a = Math.random() * TAU, d = Math.random() * e.wander.r; e.tx = e.wander.x + Math.cos(a) * d; e.ty = e.wander.y + Math.sin(a) * d; }
      steer(e, e.tx, e.ty, 70, dt, 8);
    } else moveEnt(e, 0, 0, dt);
  }
}

// ===== Clan-Katzen: Verhalten =====
function denKeyOf(c) {
  if (c.den) return c.den;
  return { anfuehrer: 'anfuehrer', zweiter: 'krieger', krieger: 'krieger', heiler: 'heiler', heilerschueler: 'heiler', schueler: 'schueler', koenigin: 'kinder', junges: 'kinder', aeltester: 'aeltest' }[c.rank] || 'krieger';
}
function homeOf(c) {
  if (c.clan === 'donner') return denPos(denKeyOf(c));
  if (c.id === 'sammy') return { x: 2100, y: 3890 };
  if (c.id === 'wulle') return { x: LM.wulle.x, y: LM.wulle.y + 60 };
  if (c.home && LM[c.home]) return { x: LM[c.home].x + c.ox * 0.5, y: LM[c.home].y + 60 };
  if (c.homePos) return c.homePos;
  return { x: c.x, y: c.y };
}
function placeAtHome(c) { const h = homeOf(c); c.x = h.x + c.ox; c.y = h.y + c.oy; c.ai = { m: 'home' }; }
function say(e, text, t = 3) { e.sayText = text; e.sayT = t; }

function updateCat(c, dt, t) {
  const pc = P();
  if (c.flash > 0) c.flash -= dt;
  if (c.sayT > 0) c.sayT -= dt;
  if (c === pc) return;
  if (c.hp < c.maxHp) c.hp = Math.min(c.maxHp, c.hp + dt * (c.hurt ? 2 : 0.8));
  c.sleep = false;
  const ai = c.ai || (c.ai = { m: 'home' });
  if (c.hurt) {
    const h = denPos('heiler');
    if (c.clan === 'donner' && !steer(c, h.x + c.ox * 0.6, h.y + 30 + c.oy * 0.4, 110, dt, 8)) return;
    c.sleep = true; moveEnt(c, 0, 0, dt);
    if (c.hp >= c.maxHp * 0.9) c.hurt = false; return;
  }
  if (c.spar) { fightStep(c, pc, dt); return; }
  if (ai.m !== 'script' && ai.m !== 'hold') {
    if (isFighterRank(c.rank) && c.clan === 'donner') { const f = nearestFoe(c, ai.m === 'follow' ? 420 : 320); if (f) { fightStep(c, f, dt); return; } }
    else { const f = nearestFoe(c, 180); if (f) { const a = Math.atan2(c.y - f.y, c.x - f.x); moveEnt(c, Math.cos(a) * 150, Math.sin(a) * 150, dt); return; } }
  }
  switch (ai.m) {
    case 'follow': {
      const tg = ai.tgt ? (catById(ai.tgt) || pc) : pc, d = dist(c.x, c.y, tg.x, tg.y);
      if (d > 1100) { c.x = tg.x - Math.cos(tg.dir) * 60; c.y = tg.y - Math.sin(tg.dir) * 60; }
      const slot = (hashStr(c.id) - 0.5) * 2.4, bx = tg.x - Math.cos(tg.dir + slot) * 55, by = tg.y - Math.sin(tg.dir + slot) * 55;
      if (d > 70) steer(c, bx, by, d > 160 ? 260 : (c.slow ? 110 : 170), dt, 10); else moveEnt(c, 0, 0, dt);
      break;
    }
    case 'lead': { // zeigt dem Spieler den Weg: läuft voraus und wartet
      const d = dist(c.x, c.y, pc.x, pc.y), toT = dist(c.x, c.y, ai.x, ai.y);
      const lookBack = () => { c.dir += angDiff(c.dir, Math.atan2(pc.y - c.y, pc.x - c.x)) * Math.min(1, dt * 4); };
      if (toT < 45) { moveEnt(c, 0, 0, dt); lookBack(); if (!ai.arr) { ai.arr = true; say(c, pick(['Hier ist es!', 'Da sind wir.', 'Schau, hier!']), 3); } break; }
      ai.arr = false;
      if (d > 1500) { const a = Math.atan2(ai.y - pc.y, ai.x - pc.x); c.x = pc.x + Math.cos(a) * 90; c.y = pc.y + Math.sin(a) * 90; }
      if (d > 240) { moveEnt(c, 0, 0, dt); lookBack(); ai.wt = (ai.wt || 0) - dt; if (ai.wt <= 0) { ai.wt = 7; say(c, pick(['Komm, hier entlang!', 'Folge mir!', 'Wo bleibst du denn?']), 2.5); } break; }
      steer(c, ai.x, ai.y, d > 150 ? 85 : (pc.running ? 255 : 165), dt, 30);
      break;
    }
    case 'goto': case 'script':
      if (steer(c, ai.x, ai.y, ai.sp || 150, dt, 8)) { if (ai.m === 'goto') c.ai = { m: ai.then || 'hold' }; }
      break;
    case 'hold':
      moveEnt(c, 0, 0, dt);
      if (ai.face !== undefined) c.dir += angDiff(c.dir, ai.face) * Math.min(1, dt * 4);
      else if (dist(c.x, c.y, pc.x, pc.y) < 150) c.dir += angDiff(c.dir, Math.atan2(pc.y - c.y, pc.x - c.x)) * dt * 3;
      break;
    case 'patrol': {
      const wp = ai.wp[ai.i];
      if (!wp) { c.ai = { m: 'home' }; break; }
      if (steer(c, wp.x + c.ox * 0.5, wp.y + c.oy * 0.5, 115, dt, 20)) ai.i++;
      break;
    }
    default: { // zuhause
      const h = homeOf(c);
      const night = isNight() && hour() > 21 || hour() < 5;
      if (night || c.rank === 'aeltester' && chance(0.001)) {
        if (steer(c, h.x + c.ox * 0.5, h.y + c.oy * 0.5 + 28, 110, dt, 8)) c.sleep = true;
        break;
      }
      ai.t = (ai.t || 0) - dt;
      if (ai.t <= 0) {
        ai.t = rand(3, 9);
        let r = c.rank === 'junges' ? 60 : c.rank === 'aeltester' ? 35 : 90;
        let cx = h.x, cy = h.y + 40;
        if (c.clan === 'donner' && chance(0.35) && c.rank !== 'aeltester') { cx = LM.lager.x; cy = LM.lager.y; r = LM.lager.r - 90; }
        if (c.clan === 'donner' && c.rank === 'anfuehrer' && chance(0.3)) { const hs = denPos('hochstein'); cx = hs.x; cy = hs.y + 50; r = 10; }
        const a = Math.random() * TAU, d = Math.random() * r; ai.x = cx + Math.cos(a) * d; ai.y = cy + Math.sin(a) * d;
        ai.rest = chance(0.35);
      }
      if (ai.x !== undefined && !steer(c, ai.x, ai.y, c.rank === 'junges' ? 120 : 75, dt, 6)) { }
      else if (ai.rest) c.sleep = true;
    }
  }
}
function patrolRoutes() {
  if (G.flags && G.flags.see) return [[LM.zweibeinernest, LM.buchenhain], [LM.seeufer, LM.zweibeinernest], [LM.buchenhain, LM.seeufer]];
  return [
    [LM.sonnenfelsen, LM.eulenbaum], [LM.donnerweg, LM.schlangenfelsen], [LM.baumgeviert, LM.schlucht],
    [LM.platane, LM.waldrand], [LM.eulenbaum, LM.donnerweg], [LM.schlucht, LM.platane]
  ];
}
function sendPatrols() {
  const avail = clanCats().filter(c => (c.rank === 'krieger' || c.rank === 'schueler') && !c.hidden && c.ai && c.ai.m === 'home' && !c.hurt && c !== P());
  const groups = {};
  for (const c of avail) if (c.duty !== 'lager' && chance(0.6)) (groups[c.duty] = groups[c.duty] || []).push(c);
  for (const duty in groups) {
    const g = groups[duty];
    for (let i = 0; i < g.length; i += 3) {
      const route = pick(patrolRoutes()).map(p => ({ x: p.x + rand(-60, 60), y: p.y + rand(-60, 60) }));
      const wp = [{ x: LM.lager.x, y: LM.lager.y + 280 }].concat(route, [{ x: LM.lager.x, y: LM.lager.y + 280 }, { x: LM.lager.x, y: LM.lager.y }]);
      for (const c of g.slice(i, i + 3)) c.ai = { m: 'patrol', wp, i: 0 };
    }
  }
}

// ===== Autos (Monster) =====
function carPos(rd, s, lane) {
  const P_ = rd.pts, C = rd.cum; let i = 1; while (i < P_.length - 1 && C[i] < s) i++;
  const [ax, ay] = P_[i - 1], [bx, by] = P_[i], l = C[i] - C[i - 1] || 1, t = clamp((s - C[i - 1]) / l, 0, 1), dx = (bx - ax) / l, dy = (by - ay) / l;
  return { x: ax + (bx - ax) * t - dy * lane, y: ay + (by - ay) * t + dx * lane, a: Math.atan2(dy, dx) };
}
let carTimer = 2;
function updateCars(dt) {
  carTimer -= dt;
  if (carTimer <= 0) { carTimer = rand(2.2, 6); const d = chance(0.5) ? 1 : -1; const rd = ROADS[chance(0.75) ? 0 : 1]; CARS.push({ rd, s: d > 0 ? 0 : rd.len, d, lane: d > 0 ? 70 : -70, sp: rand(650, 900), col: pick(['#c0392b', '#2980b9', '#f1c40f', '#ecf0f1', '#27ae60', '#8e44ad', '#34495e']) }); }
  const pc = P();
  for (let i = CARS.length - 1; i >= 0; i--) {
    const c = CARS[i]; c.s += c.d * c.sp * dt;
    if (c.s < -10 || c.s > c.rd.len + 10) { CARS.splice(i, 1); continue; }
    const p = carPos(c.rd, c.s, c.lane); c.x = p.x; c.y = p.y; c.a = p.a + (c.d < 0 ? Math.PI : 0);
    for (const e of [pc, ...ENTS.filter(e => e.kind === 'cat' || e.beast), ...G.cats.filter(k => k.alive && !k.hidden && k !== pc)]) {
      if (e.carHit > 0) continue;
      if (dist(e.x, e.y, c.x, c.y) < 95) {
        e.carHit = 1.2;
        const a = Math.atan2(e.y - c.y, e.x - c.x);
        if (e === pc) { if (G.player.invul <= 0) { hurt(pc, 35, c); toast('Ein Monster hat dich erwischt! Pass auf dem Donnerweg auf!'); } }
        else if (e.beast || e.kind === 'cat') { e.hp -= 40; if (e.hp <= e.maxHp * (e.fleeAt || 0)) defeatEnt(e); }
        e.kx = Math.cos(a) * 500; e.ky = Math.sin(a) * 500;
      }
    }
  }
  for (const e of [pc, ...ENTS, ...G.cats]) if (e.carHit > 0) e.carHit -= dt;
}
// ===== Effekte =====
function addFx(x, y, text, col) { FX.push({ x, y, text, col, t: 1.1 }); }
function updateFx(dt) { for (let i = FX.length - 1; i >= 0; i--) { FX[i].t -= dt; FX[i].y -= dt * 30; if (FX[i].t <= 0) FX.splice(i, 1); } }

// ===== Erfahrung =====
function xpNeed(c) { return 60 + c.lvl * 50; }
function gainXp(c, n) {
  if (!c) return;
  c.xp += n;
  while (c.xp >= xpNeed(c)) {
    c.xp -= xpNeed(c); c.lvl++;
    if (c === P()) {
      G.player.points = (G.player.points || 0) + 1;
      if (typeof FX3 !== 'undefined' && FX3.sysN) FX3.levelUp(c.x, surfaceY(c.x, c.y), c.y);
      toast(`⭐ Stufe ${c.lvl}! Du kannst eine Fähigkeit verbessern (Taste L oder im Clan-Bildschirm).`);
    }
  }
}
