'use strict';
// ===== Die Welt: Territorien, Landschaft, Hindernisse =====
const W = 5200, H = 4200, ROAD_X1 = 3150, CELL = 128;

const LM = {
  garten: { x: 2100, y: 3700, r: 170, name: 'Sammys Garten' },
  wulle: { x: 2500, y: 3700, r: 150, name: 'Wulles Garten' },
  waldrand: { x: 2100, y: 3300, r: 140, name: 'Waldrand' },
  lager: { x: 2300, y: 2450, r: 260, name: 'DonnerClan-Lager' },
  sandkuhle: { x: 1850, y: 2870, r: 120, name: 'Sandkuhle' },
  platane: { x: 2820, y: 3100, r: 110, name: 'Große Platane' },
  eulenbaum: { x: 1750, y: 1950, r: 110, name: 'Eulenbaum' },
  sonnenfelsen: { x: 1420, y: 2300, r: 170, name: 'Sonnenfelsen' },
  schlangenfelsen: { x: 2950, y: 1850, r: 150, name: 'Schlangenfelsen' },
  schlucht: { x: 3330, y: 2750, r: 110, name: 'Schlucht' },
  donnerweg: { x: 2300, y: 1520, r: 110, name: 'Donnerweg' },
  baumgeviert: { x: 3420, y: 1520, r: 190, name: 'Baumgeviert' },
  schattenlager: { x: 2100, y: 650, r: 200, name: 'SchattenClan-Lager' },
  flusslager: { x: 560, y: 2350, r: 200, name: 'FlussClan-Lager' },
  windlager: { x: 4350, y: 2300, r: 200, name: 'WindClan-Lager' },
  scheune: { x: 4170, y: 850, r: 120, name: 'Scheune' },
  mondstein: { x: 4750, y: 520, r: 70, name: 'Mondstein (Hochfelsen)' },
};
const TERR_NAMES = {
  donner: 'DonnerClan-Territorium', schatten: 'SchattenClan-Territorium', fluss: 'FlussClan-Territorium',
  wind: 'WindClan-Territorium', zweibeiner: 'Zweibeinerort', donnerweg: 'Donnerweg', baumgeviert: 'Baumgeviert', hochland: 'Hochland'
};
const CLAN_NAMES = { donner: 'DonnerClan', schatten: 'SchattenClan', fluss: 'FlussClan', wind: 'WindClan', einzel: 'Einzelläufer', haus: 'Hauskätzchen' };
const CLAN_COLORS = { donner: '#e0a040', schatten: '#7a6aa8', fluss: '#4fa3d9', wind: '#c9c070' };

function roadY(x) { return 1400 + Math.sin(x / 600) * 60; }
function riverX(y) { return 1120 + Math.sin(y / 520) * 90 + Math.sin(y / 170 + 1) * 22; }
function windEdge(y) { return 3600 + Math.sin(y / 400) * 60; }
function inRoad(x, y) {
  if (x < ROAD_X1 && Math.abs(y - roadY(x)) < 46) return true;
  return Math.abs(x - ROAD_X1) < 46 && y < roadY(ROAD_X1);
}
function inRiver(x, y) { return y < 3440 && Math.abs(x - riverX(y)) < 52 && !inRoad(x, y); }
function marshPool(x, y) { return y < 1250 && x > 1300 && x < 3000 && NOISE(x / 260 + 50, y / 260 + 50) > 0.7; }
function isWater(x, y) { return inRiver(x, y) || marshPool(x, y); }
function territoryAt(x, y) {
  if (y > 3440 && x > 1060) return 'zweibeiner';
  if (dist(x, y, LM.baumgeviert.x, LM.baumgeviert.y) < LM.baumgeviert.r + 30) return 'baumgeviert';
  if (inRoad(x, y)) return 'donnerweg';
  if (x < riverX(y) + 52) return 'fluss';
  if (x > windEdge(y)) return y < 1150 ? 'hochland' : 'wind';
  if (y < roadY(Math.min(x, ROAD_X1))) return 'schatten';
  return 'donner';
}

// ===== Boden vorberechnen =====
const TS = 0.33;
let terrainCanvas = null;
function groundColor(x, y, o) {
  const n = NOISE(x / 220, y / 220), m = NOISE(x / 35 + 300, y / 35 + 300), j = (m - 0.5) * 18;
  let r, g, b;
  if (inRoad(x, y)) {
    const vert = x >= ROAD_X1 - 46 && y < roadY(ROAD_X1) - 40;
    const dy = vert ? Math.abs(x - ROAD_X1) : Math.abs(y - roadY(x));
    const along = vert ? y : x;
    if (dy < 2.5 && Math.floor(along / 70) % 2 === 0) { r = 215; g = 210; b = 180; }
    else if (dy > 41) { r = 95; g = 92; b = 84; }
    else { r = 58; g = 58; b = 62; }
    o[0] = r + j * .4; o[1] = g + j * .4; o[2] = b + j * .4; return o;
  }
  const rd = Math.abs(x - riverX(y));
  if (y < 3440 && rd < 52) { const t = rd / 52; o[0] = 35 + t * 25 + j * .5; o[1] = 88 + t * 30 + j * .5; o[2] = 145 - t * 10 + (m > 0.62 ? 20 : 0); return o; }
  if (y < 3440 && rd < 68) { o[0] = 140 + j; o[1] = 128 + j; o[2] = 92 + j; return o; }
  const t = territoryAt(x, y);
  const dl = dist(x, y, LM.lager.x, LM.lager.y);
  if (dl < 250) { const k = clamp((dl - 200) / 50, 0, 1); r = lerp(152, 70, k); g = lerp(128, 95, k); b = lerp(88, 45, k); }
  else if (dist(x, y, LM.sandkuhle.x, LM.sandkuhle.y) < LM.sandkuhle.r) { r = 205; g = 180; b = 120; }
  else if (t === 'zweibeiner') {
    if (y > 3940 || x < 1100 || x > 3500) { r = 122; g = 120; b = 114; if (Math.floor(x / 40) % 2 === Math.floor(y / 40) % 2) { r += 6; g += 6; b += 6; } }
    else { r = 88 + n * 20; g = 152 + n * 25; b = 62; }
  }
  else if (t === 'donner') { r = lerp(50, 98, n); g = lerp(94, 78, n); b = lerp(38, 42, n); }
  else if (t === 'schatten') {
    const mp = NOISE(x / 260 + 50, y / 260 + 50);
    if (y < 1250 && x > 1300 && x < 3000 && mp > 0.7) { r = 48; g = 74; b = 82; }
    else if (y < 1250 && mp > 0.6) { r = 74; g = 90; b = 58; }
    else { r = lerp(40, 70, n); g = lerp(66, 58, n); b = lerp(38, 34, n); }
  }
  else if (t === 'fluss') { r = lerp(62, 92, n); g = lerp(130, 118, n); b = lerp(50, 60, n); }
  else if (t === 'wind') { r = lerp(145, 112, n); g = lerp(148, 126, n); b = lerp(80, 70, n); if (m > 0.74) { r = 128; g = 92; b = 122; } }
  else if (t === 'hochland') { r = lerp(122, 96, n); g = lerp(116, 100, n); b = lerp(96, 80, n); }
  else if (t === 'baumgeviert') { const d = dist(x, y, LM.baumgeviert.x, LM.baumgeviert.y) / 220; r = lerp(52, 70, d); g = lerp(92, 105, d); b = 44; }
  else { r = 80; g = 100; b = 60; }
  o[0] = r + j; o[1] = g + j; o[2] = b + j; return o;
}
function buildTerrain() {
  const w = Math.ceil(W * TS), h = Math.ceil(H * TS);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'), img = g.createImageData(w, h), d = img.data, o = [0, 0, 0];
  for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) {
    groundColor(px / TS, py / TS, o);
    const i = (py * w + px) * 4; d[i] = o[0]; d[i + 1] = o[1]; d[i + 2] = o[2]; d[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  terrainCanvas = c;
}

// ===== Objekte =====
const OB = { trees: [], bushes: [], rocks: [], flats: [], rects: [], herbs: [], houses: [], camps: [] };
const colGrid = new Map(), bushGrid = new Map();
const gkey = (i, j) => i * 4096 + j;
function gridAdd(grid, o, r) {
  const i0 = Math.floor((o.x - r) / CELL), i1 = Math.floor((o.x + r) / CELL), j0 = Math.floor((o.y - r) / CELL), j1 = Math.floor((o.y + r) / CELL);
  for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) { const k = gkey(i, j); let a = grid.get(k); if (!a) grid.set(k, a = []); a.push(o); }
}
function addCol(x, y, r) { gridAdd(colGrid, { x, y, r }, r); }
function addRect(x, y, w, h, kind) { OB.rects.push({ x, y, w, h, kind }); }
function nearLM(x, y, pad) {
  for (const k in LM) { if (k === 'donnerweg') continue; const l = LM[k]; if (dist(x, y, l.x, l.y) < l.r + pad) return true; }
  return false;
}
function rockShape(R, r) { const pts = []; const n = 7 + Math.floor(R() * 4); for (let i = 0; i < n; i++) { const a = i / n * TAU; pts.push([Math.cos(a) * r * (0.75 + R() * 0.3), Math.sin(a) * r * (0.75 + R() * 0.3)]); } return pts; }
function addRock(R, x, y, r, collide = true, col) {
  OB.rocks.push({ x, y, r, pts: rockShape(R, r), col: col || (140 + R() * 30 | 0) });
  if (collide) addCol(x, y, r * 0.85);
}
function addTree(R, x, y, kind, big) {
  const r = big ? big : (kind === 'pine' ? 30 + R() * 16 : 36 + R() * 26);
  const t = { x, y, r, tr: big ? 26 : 7 + R() * 4, k: kind, c: R() };
  OB.trees.push(t); addCol(x, y, t.tr);
}
function addBush(x, y, r, k) { const b = { x, y, r, k }; OB.bushes.push(b); gridAdd(bushGrid, b, r); }

const DENS = { hochstein: [0, -165], anfuehrer: [75, -178], heiler: [-178, -85], krieger: [152, -78], schueler: [160, 92], kinder: [-162, 88], aeltest: [-92, 172], pile: [48, 18] };
function denPos(key) { const d = DENS[key]; return { x: LM.lager.x + d[0], y: LM.lager.y + d[1] }; }

function makeCamp(lm, gap, clan) {
  const ring = lm.r + 4, step = 40 / ring;
  for (let a = 0; a < TAU; a += step) {
    if (Math.abs(angDiff(a, gap)) < 0.2) continue;
    const x = lm.x + Math.cos(a) * ring, y = lm.y + Math.sin(a) * ring;
    addBush(x, y, 30, 'wall'); addCol(x, y, 24);
  }
  OB.camps.push({ lm, gap, clan });
}

function buildObjects() {
  const R = mulberry32(777);
  // --- Zweibeinerort: Gärten, Zäune, Häuser ---
  for (let i = 0; i < 6; i++) {
    const x0 = 1100 + i * 400;
    if (i === 2) { addRect(x0, 3476, 178, 8, 'fence'); addRect(x0 + 232, 3476, 168, 8, 'fence'); }
    else addRect(x0, 3476, 400, 8, 'fence');
    if (i === 3) { addRect(x0 - 4, 3476, 8, 200, 'fence'); addRect(x0 - 4, 3740, 8, 196, 'fence'); }
    else addRect(x0 - 4, 3476, 8, 460, 'fence');
    const roof = ['#8a3b2e', '#6e4a3a', '#5a5f6e', '#7a3030', '#6a5040', '#4e5a4a'][i];
    OB.houses.push({ x: x0 + 90, y: 3960, w: 220, h: 170, roof }); addRect(x0 + 90, 3960, 220, 170, 'house');
  }
  addRect(3496, 3476, 8, 460, 'fence');
  for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) {
    const x = 3620 + i * 380, y = 3530 + j * 330;
    OB.houses.push({ x, y, w: 240, h: 190, roof: ['#6e4a3a', '#5a5f6e', '#7a3030', '#8a3b2e'][(i + j) % 4] }); addRect(x, y, 240, 190, 'house');
  }
  OB.flats.push({ k: 'bed', x: 2100, y: 3890 });
  // --- Lager ---
  makeCamp(LM.lager, Math.PI / 2, 'donner');
  makeCamp(LM.schattenlager, Math.PI / 2, 'schatten');
  makeCamp(LM.flusslager, 0, 'fluss');
  makeCamp(LM.windlager, Math.PI, 'wind');
  const hs = denPos('hochstein');
  addRock(R, hs.x, hs.y, 38, true, 150);
  // --- Sonnenfelsen ---
  for (let i = 0; i < 7; i++) { const a = R() * TAU, d = R() * 120; OB.flats.push({ k: 'slab', x: LM.sonnenfelsen.x + Math.cos(a) * d, y: LM.sonnenfelsen.y + Math.sin(a) * d, r: 40 + R() * 35, pts: rockShape(R, 1) }); }
  // --- Baumgeviert ---
  for (const [dx, dy] of [[-125, -125], [125, -125], [-125, 125], [125, 125]]) addTree(R, LM.baumgeviert.x + dx, LM.baumgeviert.y + dy, 'oak', 110);
  OB.flats.push({ k: 'slab', x: LM.baumgeviert.x, y: LM.baumgeviert.y, r: 55, pts: rockShape(R, 1), big: true });
  // --- besondere Bäume ---
  addTree(R, LM.eulenbaum.x, LM.eulenbaum.y, 'oak', 115);
  addTree(R, LM.platane.x, LM.platane.y, 'oak', 125);
  // --- Schlangenfelsen ---
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + R(), d = 50 + R() * 70; addRock(R, LM.schlangenfelsen.x + Math.cos(a) * d, LM.schlangenfelsen.y + Math.sin(a) * d, 18 + R() * 20); }
  // --- Schlucht ---
  addRect(3385, 2560, 90, 390, 'gorge');
  // --- Hochfelsen ---
  for (let i = 0; i < 12; i++) { const a = R() * TAU, d = R() * 170; addRock(R, 4750 + Math.cos(a) * d, 300 + Math.sin(a) * d * 0.7, 55 + R() * 45, true, 110 + R() * 30 | 0); }
  OB.flats.push({ k: 'cave', x: LM.mondstein.x, y: LM.mondstein.y - 20 });
  // --- Scheune ---
  addRect(4070, 640, 200, 150, 'barn'); OB.houses.push({ x: 4070, y: 640, w: 200, h: 150, roof: '#8a4a2a', barn: true });
  // --- Wald, Moor, Sumpf ---
  for (let gy = 30; gy < H; gy += 60) for (let gx = 30; gx < W; gx += 60) {
    const x = gx + (R() - 0.5) * 48, y = gy + (R() - 0.5) * 48, rr = R(), t = territoryAt(x, y);
    if (inRoad(x, y) || (x < ROAD_X1 + 60 && Math.abs(y - roadY(Math.min(x, ROAD_X1))) < 90) || (Math.abs(x - ROAD_X1) < 90 && y < roadY(ROAD_X1))) continue;
    if (y < 3440 && Math.abs(x - riverX(y)) < 85) { if (rr < 0.28 && Math.abs(x - riverX(y)) > 58) addBush(x, y, 18 + R() * 8, 'reed'); continue; }
    if (nearLM(x, y, 40)) continue;
    if (x > 3360 && x < 3500 && y > 2540 && y < 2970) continue;
    if (t === 'donner') {
      if (rr < 0.2) addTree(R, x, y, R() < 0.2 ? 'birch' : 'oak');
      else if (rr < 0.43) addBush(x, y, 20 + R() * 14, R() < 0.65 ? 'fern' : 'bramble');
    } else if (t === 'schatten') {
      if (marshPool(x, y)) { if (rr < 0.1) addBush(x, y, 16, 'reed'); continue; }
      if (rr < 0.27) addTree(R, x, y, 'pine');
      else if (rr < 0.37) addBush(x, y, 18 + R() * 10, R() < 0.5 ? 'reed' : 'fern');
    } else if (t === 'fluss') {
      if (rr < 0.08) addTree(R, x, y, 'willow');
      else if (rr < 0.2) addBush(x, y, 18 + R() * 10, R() < 0.5 ? 'reed' : 'fern');
    } else if (t === 'wind') {
      if (rr < 0.012) addTree(R, x, y, 'oak');
      else if (rr < 0.2) addBush(x, y, 16 + R() * 12, 'heather');
      else if (rr < 0.222) addRock(R, x, y, 14 + R() * 18);
    } else if (t === 'hochland') {
      if (rr < 0.05) addRock(R, x, y, 16 + R() * 26);
      else if (rr < 0.12) addBush(x, y, 16, 'heather');
    } else if (t === 'zweibeiner') {
      if (y < 3920 && y > 3500 && x > 1110 && x < 3490 && rr < 0.06) addBush(x, y, 16 + R() * 8, 'garden');
    }
  }
  // --- Kräuter ---
  const kinds = ['ringelblume', 'ringelblume', 'ringelblume', 'spinnweben', 'spinnweben', 'schafgarbe', 'mohn'];
  let tries = 0;
  while (OB.herbs.length < 70 && tries++ < 5000) {
    const x = 1250 + R() * 2300, y = 1500 + R() * 1900;
    if (territoryAt(x, y) !== 'donner' || nearLM(x, y, 20) || isWater(x, y)) continue;
    OB.herbs.push({ x, y, k: pick(kinds) });
  }
  for (let i = 0; i < 7; i++) OB.herbs.push({ x: 1500 + i * 280 + R() * 80, y: 3380 + R() * 60, k: 'katzenminze' });
  for (let i = 0; i < 6; i++) OB.herbs.push({ x: 3700 + R() * 1200, y: 1300 + R() * 1800, k: pick(['schafgarbe', 'mohn']) });
}

const HERBS = {
  ringelblume: { n: 'Ringelblume', col: '#f5a623', heal: 25 },
  spinnweben: { n: 'Spinnweben', col: '#eef0ff', heal: 15 },
  schafgarbe: { n: 'Schafgarbe', col: '#fffbe0', heal: 20 },
  mohn: { n: 'Mohnsamen', col: '#d23a2b', heal: 10 },
  katzenminze: { n: 'Katzenminze', col: '#7fd6a0', heal: 35 },
};
function herbAvailable(i) { return !(G.herbsTaken[i] > day()); }

// ===== Kollision =====
function collide(e, r) {
  const ci = Math.floor(e.x / CELL), cj = Math.floor(e.y / CELL);
  for (let i = ci - 1; i <= ci + 1; i++) for (let j = cj - 1; j <= cj + 1; j++) {
    const a = colGrid.get(gkey(i, j)); if (!a) continue;
    for (const o of a) {
      const dx = e.x - o.x, dy = e.y - o.y, d = Math.hypot(dx, dy), m = o.r + r;
      if (d < m && d > 0.001) { const k = (m - d) / d; e.x += dx * k; e.y += dy * k; }
    }
  }
  for (const R of OB.rects) {
    if (e.x + r > R.x && e.x - r < R.x + R.w && e.y + r > R.y && e.y - r < R.y + R.h) {
      const l = e.x + r - R.x, rr = R.x + R.w - (e.x - r), t = e.y + r - R.y, b = R.y + R.h - (e.y - r);
      const m = Math.min(l, rr, t, b);
      if (m === l) e.x -= l; else if (m === rr) e.x += rr; else if (m === t) e.y -= t; else e.y += b;
    }
  }
  e.x = clamp(e.x, r, W - r); e.y = clamp(e.y, r, H - r);
}
function inBush(x, y) {
  const a = bushGrid.get(gkey(Math.floor(x / CELL), Math.floor(y / CELL))); if (!a) return false;
  for (const b of a) if (b.k !== 'wall' && dist(x, y, b.x, b.y) < b.r * 0.85) return true;
  return false;
}

// ===== Zeichnen der Welt =====
const SEASON_TREE = [['#5fa83e', '#7cc454'], ['#2f7a2a', '#3f9434'], ['#c7702a', '#d9a23a'], ['#9aa0a0', '#c9cfd2']];
function drawGround(ctx, v) {
  const sx = Math.max(0, v.x0 * TS), sy = Math.max(0, v.y0 * TS);
  const sw = Math.min(terrainCanvas.width - sx, (v.x1 - v.x0) * TS + 2), sh = Math.min(terrainCanvas.height - sy, (v.y1 - v.y0) * TS + 2);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(terrainCanvas, sx, sy, sw, sh, sx / TS, sy / TS, sw / TS, sh / TS);
  const s = season();
  if (s === 3) { ctx.fillStyle = 'rgba(235,242,250,0.38)'; ctx.fillRect(v.x0, v.y0, v.x1 - v.x0, v.y1 - v.y0); }
  else if (s === 2) { ctx.fillStyle = 'rgba(200,120,40,0.10)'; ctx.fillRect(v.x0, v.y0, v.x1 - v.x0, v.y1 - v.y0); }
  else if (s === 0) { ctx.fillStyle = 'rgba(160,230,120,0.06)'; ctx.fillRect(v.x0, v.y0, v.x1 - v.x0, v.y1 - v.y0); }
}
const vis = (o, v, r) => o.x + r > v.x0 && o.x - r < v.x1 && o.y + r > v.y0 && o.y - r < v.y1;
function polyPath(ctx, pts, x, y, s) { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(x + p[0] * s, y + p[1] * s) : ctx.moveTo(x + p[0] * s, y + p[1] * s)); ctx.closePath(); }

function drawLow(ctx, v, t) {
  // Schlucht
  if (vis({ x: 3430, y: 2755 }, v, 260)) {
    ctx.fillStyle = '#2a2420'; ctx.fillRect(3385, 2560, 90, 390);
    ctx.fillStyle = '#2d5d86'; ctx.fillRect(3412, 2560, 36, 390);
    ctx.strokeStyle = '#6a5a48'; ctx.lineWidth = 6; ctx.strokeRect(3385, 2560, 90, 390);
  }
  // flache Steine, Höhle, Körbchen
  for (const f of OB.flats) {
    if (!vis(f, v, 120)) continue;
    if (f.k === 'slab') { ctx.fillStyle = f.big ? '#8d8a84' : '#9a958c'; polyPath(ctx, f.pts, f.x, f.y, f.r); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 2; ctx.stroke(); }
    else if (f.k === 'cave') { ctx.fillStyle = '#121016'; ctx.beginPath(); ctx.ellipse(f.x, f.y, 34, 22, 0, 0, TAU); ctx.fill(); }
    else if (f.k === 'bed') { ctx.fillStyle = '#b44'; ctx.beginPath(); ctx.ellipse(f.x, f.y, 22, 15, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#e8d8c0'; ctx.beginPath(); ctx.ellipse(f.x, f.y, 15, 9, 0, 0, TAU); ctx.fill(); }
  }
  // Lager-Baue
  if (vis(LM.lager, v, 320)) drawCampDens(ctx);
  for (const cp of OB.camps) if (cp.clan !== 'donner' && vis(cp.lm, v, 260)) {
    ctx.fillStyle = 'rgba(40,30,20,.25)'; ctx.beginPath(); ctx.arc(cp.lm.x, cp.lm.y, cp.lm.r - 20, 0, TAU); ctx.fill();
    for (let i = 0; i < 4; i++) { const a = i * 1.6 + 0.4; drawDen(ctx, cp.lm.x + Math.cos(a) * 110, cp.lm.y + Math.sin(a) * 110, 34, '#35502e'); }
  }
  // Büsche
  const s = season();
  for (const b of OB.bushes) {
    if (!vis(b, v, b.r + 4)) continue;
    drawBush(ctx, b, s);
  }
  // Kräuter
  const st = typeof Story !== 'undefined' ? Story.herbHighlight() : null;
  OB.herbs.forEach((h, i) => {
    if (!vis(h, v, 20) || !herbAvailable(i)) return;
    const info = HERBS[h.k];
    if (st && (st === h.k || st === 'any')) { ctx.strokeStyle = `rgba(255,230,120,${0.5 + Math.sin(t * 4) * 0.3})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(h.x, h.y, 13, 0, TAU); ctx.stroke(); }
    ctx.fillStyle = '#3d6b2a'; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.ellipse(h.x + Math.cos(k * 1.6) * 5, h.y + Math.sin(k * 1.6) * 5, 5, 2.5, k * 1.6, 0, TAU); ctx.fill(); }
    ctx.fillStyle = info.col;
    if (h.k === 'spinnweben') { ctx.strokeStyle = 'rgba(240,240,255,.8)'; ctx.lineWidth = 1; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(h.x, h.y, 3 + k * 3, 0, TAU); ctx.stroke(); } }
    else { for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(h.x + Math.cos(k * 2.1) * 4, h.y + Math.sin(k * 2.1) * 4, 2.6, 0, TAU); ctx.fill(); } }
  });
  // Felsen
  for (const r of OB.rocks) {
    if (!vis(r, v, r.r + 5)) continue;
    ctx.fillStyle = 'rgba(0,0,0,.25)'; polyPath(ctx, r.pts, r.x + 4, r.y + 5, 1); ctx.fill();
    const c = r.col + (s === 3 ? 40 : 0);
    ctx.fillStyle = `rgb(${c},${c - 4},${c - 12})`; polyPath(ctx, r.pts, r.x, r.y, 1); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.12)'; polyPath(ctx, r.pts, r.x - r.r * 0.15, r.y - r.r * 0.2, 0.55); ctx.fill();
  }
  // Zäune
  for (const R of OB.rects) {
    if (R.kind !== 'fence' || !vis({ x: R.x + R.w / 2, y: R.y + R.h / 2 }, v, Math.max(R.w, R.h))) continue;
    ctx.fillStyle = '#8a6a44'; ctx.fillRect(R.x, R.y, R.w, R.h);
    ctx.fillStyle = '#6a4e30';
    if (R.w > R.h) for (let x = R.x; x < R.x + R.w; x += 22) ctx.fillRect(x, R.y - 2, 4, R.h + 4);
    else for (let y = R.y; y < R.y + R.h; y += 22) ctx.fillRect(R.x - 2, y, R.w + 4, 4);
  }
}
function drawDen(ctx, x, y, r, col) {
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(x + 3, y + 5, r, r * 0.8, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.8, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.beginPath(); ctx.ellipse(x - r * 0.25, y - r * 0.25, r * 0.5, r * 0.35, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#1a140e'; ctx.beginPath(); ctx.ellipse(x, y + r * 0.55, r * 0.35, r * 0.2, 0, 0, TAU); ctx.fill();
}
const DEN_LABELS = { anfuehrer: 'Anführerbau', heiler: 'Heilerbau', krieger: 'Kriegerbau', schueler: 'Schülerbau', kinder: 'Kinderstube', aeltest: 'Ältestenbau' };
function drawCampDens(ctx) {
  const s = season();
  const col = s === 3 ? '#6f8078' : s === 2 ? '#6a5a2a' : '#3f6a30';
  for (const k of ['heiler', 'krieger', 'schueler', 'kinder', 'aeltest']) { const p = denPos(k); drawDen(ctx, p.x, p.y, k === 'krieger' ? 46 : 38, col); }
  const a = denPos('anfuehrer'); drawDen(ctx, a.x, a.y, 30, '#6d6760');
  // Frischbeutehaufen
  const p = denPos('pile'), n = Math.min(12, Math.ceil(G.clan.pile / 4));
  ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(p.x, p.y + 3, 24, 14, 0, 0, TAU); ctx.fill();
  for (let i = 0; i < n; i++) { const an = i * 2.4, d = 4 + i * 1.3; drawPreyShape(ctx, ['maus', 'amsel', 'wuehlmaus', 'eichhoernchen'][i % 4], p.x + Math.cos(an) * d, p.y + Math.sin(an) * d * 0.6, an, true); }
}
function drawBush(ctx, b, s) {
  const x = b.x, y = b.y, r = b.r;
  if (b.k === 'wall') {
    ctx.fillStyle = s === 3 ? '#4d5a4f' : '#2d4424'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#5a3a2a'; ctx.lineWidth = 2; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(x + (i - 1) * 7, y, r * 0.6, i, i + 2); ctx.stroke(); }
    return;
  }
  const cols = { fern: s === 2 ? '#8a6a2a' : s === 3 ? '#6a7060' : '#3e7a32', bramble: '#2f4e28', heather: s === 3 ? '#8a8090' : '#7a4f7e', reed: s === 3 ? '#a09a80' : '#7a8a4a', garden: '#3a7a3a' };
  ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(x + 3, y + 4, r, r * 0.8, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = cols[b.k] || '#3a6a2a';
  if (b.k === 'fern' || b.k === 'reed') {
    for (let i = 0; i < 7; i++) { const a = i / 7 * TAU + x; ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * r * 0.45, y + Math.sin(a) * r * 0.45, r * 0.6, r * 0.18, a, 0, TAU); ctx.fill(); }
  } else {
    ctx.beginPath(); ctx.arc(x, y, r * 0.8, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(x - r * 0.4, y - r * 0.2, r * 0.5, 0, TAU); ctx.arc(x + r * 0.4, y + r * 0.1, r * 0.5, 0, TAU); ctx.fill();
    if (b.k === 'bramble' && s === 1) { ctx.fillStyle = '#5a1030'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(x + Math.cos(i * 2 + x) * r * 0.5, y + Math.sin(i * 2 + y) * r * 0.5, 2.2, 0, TAU); ctx.fill(); } }
    if (b.k === 'garden') { ctx.fillStyle = ['#e85a8a', '#f5d03a', '#fff'][Math.floor(x) % 3]; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(x + Math.cos(i * 1.3) * r * 0.5, y + Math.sin(i * 1.3) * r * 0.5, 2.2, 0, TAU); ctx.fill(); } }
  }
}
function drawHigh(ctx, v, px, py, t) {
  const s = season();
  for (const tr of OB.trees) {
    if (!vis(tr, v, tr.r + 10)) continue;
    const near = dist(px, py, tr.x, tr.y) < tr.r + 6;
    ctx.globalAlpha = near ? 0.3 : 0.93;
    if (tr.k === 'pine') {
      ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.arc(tr.x + 8, tr.y + 10, tr.r, 0, TAU); ctx.fill();
      const layers = [['#1f3d24', 1], ['#28512c', 0.72], ['#33653a', 0.45]];
      for (const [c, f] of layers) {
        ctx.fillStyle = s === 3 && f < 0.5 ? '#d8e2e6' : c; ctx.beginPath();
        for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, rr = tr.r * f * (i % 2 ? 0.72 : 1); i ? ctx.lineTo(tr.x + Math.cos(a) * rr, tr.y + Math.sin(a) * rr) : ctx.moveTo(tr.x + rr, tr.y); }
        ctx.closePath(); ctx.fill();
      }
    } else {
      const bare = s === 3 && tr.k !== 'willow';
      ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.arc(tr.x + 10, tr.y + 12, tr.r * (bare ? 0.5 : 1), 0, TAU); ctx.fill();
      if (bare) {
        ctx.strokeStyle = '#5a4a3a'; ctx.lineWidth = 3;
        for (let i = 0; i < 6; i++) { const a = i + tr.c * 6; ctx.beginPath(); ctx.moveTo(tr.x, tr.y); ctx.lineTo(tr.x + Math.cos(a) * tr.r * 0.8, tr.y + Math.sin(a) * tr.r * 0.8); ctx.stroke(); }
        ctx.fillStyle = 'rgba(240,245,250,.5)'; ctx.beginPath(); ctx.arc(tr.x, tr.y, tr.r * 0.35, 0, TAU); ctx.fill();
      } else {
        let [c1, c2] = SEASON_TREE[s];
        if (tr.k === 'willow') { c1 = '#5a8a3a'; c2 = '#7aa84a'; }
        if (tr.k === 'birch' && s < 2) { c1 = '#6aa84a'; c2 = '#8cc86a'; }
        if (s === 2 && tr.c > 0.6) { c1 = '#a8402a'; c2 = '#c8603a'; }
        ctx.fillStyle = c1; ctx.beginPath();
        for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + tr.c * 3; ctx.moveTo(tr.x + Math.cos(a) * tr.r * 0.4 + tr.r * 0.6, tr.y + Math.sin(a) * tr.r * 0.4); ctx.arc(tr.x + Math.cos(a) * tr.r * 0.4, tr.y + Math.sin(a) * tr.r * 0.4, tr.r * 0.6, 0, TAU); }
        ctx.fill();
        ctx.fillStyle = c2; ctx.beginPath(); ctx.arc(tr.x - tr.r * 0.2, tr.y - tr.r * 0.22, tr.r * 0.45, 0, TAU); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }
  // Häuser (Dächer)
  for (const h of OB.houses) {
    if (!vis({ x: h.x + h.w / 2, y: h.y + h.h / 2 }, v, 200)) continue;
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(h.x + 10, h.y + 12, h.w, h.h);
    ctx.fillStyle = h.roof; ctx.fillRect(h.x, h.y, h.w, h.h);
    ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(h.x, h.y, h.w, h.h / 2);
    ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(h.x, h.y + h.h / 2); ctx.lineTo(h.x + h.w, h.y + h.h / 2); ctx.stroke();
    if (s === 3) { ctx.fillStyle = 'rgba(240,245,255,.6)'; ctx.fillRect(h.x, h.y, h.w, h.h / 2); }
    if (!h.barn) { ctx.fillStyle = '#7a6a5a'; ctx.fillRect(h.x + h.w * 0.7, h.y + 15, 22, 22); }
  }
}
