'use strict';
// ===== Die Welt: Territorien, Landschaft, Hindernisse =====
// Welt: alter Wald (x < OLD_W), Fremdland (bis FREMD_E), Berge, See und Küste im Osten
const W = 12000, H = 4200, CELL = 128, OLD_W = 5300, FREMD_E = 9040, EAST = 3800;

const LM = {
  garten: { x: 2100, y: 3700, r: 170, name: 'Sammys Garten' },
  wulle: { x: 2500, y: 3700, r: 150, name: 'Wulles Garten' },
  waldrand: { x: 2100, y: 3300, r: 140, name: 'Waldrand' },
  lager: { x: 2300, y: 2450, r: 260, name: 'DonnerClan-Lager' },
  sandkuhle: { x: 1850, y: 2870, r: 120, name: 'Sandkuhle' },
  platane: { x: 2980, y: 2250, r: 110, name: 'Große Platane' },
  eulenbaum: { x: 1750, y: 1950, r: 110, name: 'Eulenbaum' },
  sonnenfelsen: { x: 1420, y: 2300, r: 170, name: 'Sonnenfelsen' },
  schlangenfelsen: { x: 3700, y: 2350, r: 150, name: 'Schlangenfelsen' },
  schlucht: { x: 3570, y: 2760, r: 110, name: 'Schlucht' },
  donnerweg: { x: 2300, y: 1560, r: 110, name: 'Donnerweg' },
  baumgeviert: { x: 1450, y: 1700, r: 190, name: 'Baumgeviert' },
  schattenlager: { x: 3250, y: 650, r: 200, name: 'SchattenClan-Lager' },
  flusslager: { x: 560, y: 2350, r: 200, name: 'FlussClan-Lager' },
  windlager: { x: 620, y: 1250, r: 200, name: 'WindClan-Lager' },
  scheune: { x: 380, y: 340, r: 120, name: 'Mikuschs Hof' },
  mondstein: { x: 1000, y: 420, r: 70, name: 'Mondstein (Hochfelsen)' },
  prinzessin: { x: 1700, y: 3700, r: 120, name: 'Prinzessins Garten' },
  tunnel: { x: 1760, y: 330, r: 110, name: 'Tunnel am Donnerweg' },
  kraehenort: { x: 2500, y: 260, r: 150, name: 'Krähenort' },
  hochkiefern: { x: 3350, y: 3150, r: 120, name: 'Hochkiefern' },
  baumsaege: { x: 3300, y: 3720, r: 150, name: 'Baumsägeort' },
  wasserfall: { x: 1090, y: 1700, r: 70, name: 'Wasserfall' },
  trittsteine: { x: 1160, y: 2760, r: 90, name: 'Trittsteine' },
  korb: { x: 2100, y: 3890, r: 40, name: 'Dein Körbchen' },
  kaefige: { x: 2650, y: 2150, r: 70, name: 'Zweibeiner-Käfige' },
  // --- Staffel 2: Berge, Küste, See ---
  stamm: { x: 9600, y: 1650, r: 110, name: 'Höhle des Stammes' },
  dachsbau: { x: 10800, y: 1150, r: 90, name: 'Mitternachts Bau' },
  wassernest: { x: 11220, y: 800, r: 140, name: 'Wassernest der Sonne' },
  steinmulde: { x: 10270, y: 3120, r: 215, name: 'DonnerClan-Lager (Steinmulde)' },
  schatten2: { x: 11050, y: 2380, r: 190, name: 'SchattenClan-Lager' },
  fluss2: { x: 11100, y: 3780, r: 190, name: 'FlussClan-Lager' },
  wind2: { x: 11680, y: 3080, r: 190, name: 'WindClan-Lager' },
  insel: { x: 11050, y: 3060, r: 100, name: 'Die Insel' },
  mondsee: { x: 11600, y: 2060, r: 70, name: 'Mondsee' },
  zweibeinernest: { x: 10250, y: 3600, r: 110, name: 'Verlassenes Zweibeinernest' },
  buchenhain: { x: 10280, y: 2780, r: 110, name: 'Buchenhain' },
  seeufer: { x: 10680, y: 3440, r: 90, name: 'Seeufer' },
  purdy: { x: 6750, y: 1560, r: 110, name: 'Purdys Garten' },
  fremdstadt: { x: 6700, y: 1150, r: 200, name: 'Zweibeinerort im Fremdland' },
  bauernhof: { x: 8250, y: 2950, r: 160, name: 'Bauernhof' },
  fremdgrenze: { x: 5450, y: 1500, r: 150, name: 'Grenze der Clan-Territorien' },
  bergpass: { x: 9560, y: 1080, r: 120, name: 'Bergpass' },
  tunnelein: { x: 10180, y: 2700, r: 80, name: 'Eingang zu den Tunneln' },
  tunnelaus: { x: 11820, y: 3300, r: 80, name: 'Tunnel-Ausgang (WindClan)' },
};
// Unveränderte Kopie der Orte (für Höhen und Bodenfarben); LM selbst wird beim Umzug an den See verändert
const LM0 = JSON.parse(JSON.stringify(LM));
const RELOC = { lager: 'steinmulde', schattenlager: 'schatten2', flusslager: 'fluss2', windlager: 'wind2', baumgeviert: 'insel', mondstein: 'mondsee' };
function applyRelocation(on) {
  for (const k in RELOC) { const src = on ? LM0[RELOC[k]] : LM0[k]; Object.assign(LM[k], { x: src.x, y: src.y, r: src.r, name: on && k === 'lager' ? 'DonnerClan-Lager (Steinmulde)' : src.name }); }
}
// ----- See, Meer -----
const LAKE = { x: 11050, y: 3060 };
const lakeR = a => 420 + Math.sin(a * 3) * 40 + Math.sin(a * 5 + 1) * 25;
function lakeDist(x, y) { const a = Math.atan2(y - LAKE.y, x - LAKE.x); return dist(x, y, LAKE.x, LAKE.y) / lakeR(a); }
function inLake(x, y) { return x > 10300 && lakeDist(x, y) < 1 && dist(x, y, LM0.insel.x, LM0.insel.y) > 95; }
const oceanEdge = y => 11320 + Math.sin(y / 260) * 70;
function inOcean(x, y) { return y < 1650 && x > oceanEdge(y); }
const TERR_NAMES = {
  donner: 'DonnerClan-Territorium', schatten: 'SchattenClan-Territorium', fluss: 'FlussClan-Territorium',
  wind: 'WindClan-Territorium', zweibeiner: 'Zweibeinerort', donnerweg: 'Donnerweg', baumgeviert: 'Baumgeviert', hochland: 'Hochland',
  berge: 'Die Berge', fremdland: 'Fremdland (außerhalb der Clan-Territorien)', kueste: 'Küste (Wassernest der Sonne)', see: 'Der See', verlassen: 'Der alte Wald (zerstört)'
};
const CLAN_NAMES = { donner: 'DonnerClan', schatten: 'SchattenClan', fluss: 'FlussClan', wind: 'WindClan', einzel: 'Einzelläufer', haus: 'Hauskätzchen' };
const CLAN_COLORS = { donner: '#e0a040', schatten: '#7a6aa8', fluss: '#4fa3d9', wind: '#c9c070' };

function roadY(x) { return 1400 + Math.sin(x / 600) * 60; }
function riverX(y) { return 1120 + Math.sin(y / 520) * 90 + Math.sin(y / 170 + 1) * 22; }
// Hochland des WindClans: Südrand (Klippe zum FlussClan) und Ostrand (Richtung Baumgeviert)
function windS(x) { return 1740 + Math.sin(x / 260 + 1) * 35; }
function windE(y) { return 1380 + Math.sin(y / 300) * 40; }
const RIVER_TOP = windS(riverX(1740)) + 8;
// ----- Donnerweg: Linienzüge wie auf der Karte -----
// Hauptweg von Mikuschs Hof (Nordwesten) am Baumgeviert vorbei nach Osten, dann nach Süden zum Zweibeinerort;
// Abzweig nach Norden zwischen Hochfelsen und SchattenClan
const ROAD_J = 1650, ROAD_BEND = 4150;
// Der große Donnerweg im Fremdland (von Norden nach Süden)
const hwX = y => 7750 + Math.sin(y / 500) * 80;
function diagY(x) { const t = (x + 40) / (ROAD_J + 40); return 330 + t * (roadY(ROAD_J) - 330) + Math.sin(t * Math.PI) * 40; }
function branchX(y) { const b0 = 1800, by = roadY(b0), t = (by - y) / (by + 40); return b0 + t * 280 + Math.sin(t * 5) * 25; }
const ROADS = (() => {
  const main = [], br = [];
  for (let x = -40; x < ROAD_J; x += 30) main.push([x, diagY(x)]);
  for (let x = ROAD_J; x <= ROAD_BEND - 150; x += 30) main.push([x, roadY(x)]);
  const ay = roadY(ROAD_BEND - 150);
  for (let a = -Math.PI / 2 + 0.15; a <= 0.001; a += 0.15) main.push([ROAD_BEND - 150 + Math.cos(a) * 150, ay + 150 + Math.sin(a) * 150]);
  for (let y = ay + 180; y <= H + 40; y += 30) main.push([ROAD_BEND, y]);
  const by = roadY(1800);
  for (let y = by; y >= -40; y -= 30) br.push([branchX(y), y]);
  const hw = []; for (let y = -40; y <= H + 40; y += 30) hw.push([hwX(y), y]);
  return [main, br, hw].map(pts => { const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + dist(pts[i][0], pts[i][1], pts[i - 1][0], pts[i - 1][1])); return { pts, cum, len: cum[cum.length - 1] }; });
})();
const roadGrid = new Map();
for (const rd of ROADS) for (let i = 1; i < rd.pts.length; i++) {
  const [ax, ay] = rd.pts[i - 1], [bx, by] = rd.pts[i], sg = { ax, ay, bx, by, c0: rd.cum[i - 1], l: rd.cum[i] - rd.cum[i - 1] };
  const i0 = Math.floor((Math.min(ax, bx) - 330) / CELL), i1 = Math.floor((Math.max(ax, bx) + 330) / CELL), j0 = Math.floor((Math.min(ay, by) - 330) / CELL), j1 = Math.floor((Math.max(ay, by) + 330) / CELL);
  for (let p = i0; p <= i1; p++) for (let q = j0; q <= j1; q++) { const k = p * 4096 + q; let arr = roadGrid.get(k); if (!arr) roadGrid.set(k, arr = []); arr.push(sg); }
}
// Abstand zum nächsten Donnerweg; setzt RD.x/RD.y (nächster Punkt auf der Straße) und RD.along (Weglänge)
const RD = { d: 1e9, x: 0, y: 0, along: 0 };
function roadDist(x, y) {
  RD.d = 1e9; const a = roadGrid.get(Math.floor(x / CELL) * 4096 + Math.floor(y / CELL)); if (!a) return 1e9;
  for (const sg of a) {
    const dx = sg.bx - sg.ax, dy = sg.by - sg.ay, t = clamp(((x - sg.ax) * dx + (y - sg.ay) * dy) / (dx * dx + dy * dy), 0, 1), px = sg.ax + dx * t, py = sg.ay + dy * t, d = Math.hypot(x - px, y - py);
    if (d < RD.d) { RD.d = d; RD.x = px; RD.y = py; RD.along = sg.c0 + sg.l * t; }
  }
  return RD.d;
}
const ROAD_HW = 140; // halbe Straßenbreite
function inRoad(x, y) { return roadDist(x, y) < ROAD_HW; }
// Fremdland: Stadt, Felder, Wälder, Wiesen
const FREMD_TOWN = { x0: 6150, x1: 7300, y0: 650, y1: 1700 };
function fremdBiome(x, y) {
  if (x > FREMD_TOWN.x0 && x < FREMD_TOWN.x1 && y > FREMD_TOWN.y0 && y < FREMD_TOWN.y1) return 'stadt';
  if ((x > 7950 && x < 8750 && y > 2350 && y < 3650) || (x > 5750 && x < 6800 && y > 2100 && y < 3200)) return 'feld';
  if (NOISE(x / 650 + 11, y / 650 + 5) > 0.57) return 'wald';
  return 'wiese';
}
// Liegt der Punkt nördlich des Hauptwegs (Hochfelsen-/SchattenClan-Seite)?
function northOfRoad(x, y) {
  if (x < ROAD_J) return y < diagY(x);
  return y < roadY(Math.min(x, ROAD_BEND - 150)) + (x > ROAD_BEND - 150 ? 150 : 0);
}
function riverOn(y) { return y > RIVER_TOP && y < 3440; }
const RIVER_HW = 115; // halbe Flussbreite
function inRiver(x, y) { return riverOn(y) && Math.abs(x - riverX(y)) < RIVER_HW && !inRoad(x, y); }
function marshPool(x, y) { return y < 1150 && x > 2350 && x < 4300 && NOISE(x / 260 + 50, y / 260 + 50) > 0.7; }
function isWater(x, y) { return inRiver(x, y) || marshPool(x, y) || inLake(x, y) || inOcean(x, y); }
function territoryAt(x, y, raw) {
  if (x > OLD_W) {
    if (inLake(x, y)) return 'see';
    if (x > 10050 && lakeDist(x, y) < 2.45) {
      if (dist(x, y, LM0.insel.x, LM0.insel.y) < 110) return raw || !G || !G.flags || !G.flags.see ? 'see' : 'baumgeviert';
      const a = Math.atan2(y - LAKE.y, x - LAKE.x) * 180 / Math.PI;
      return a > 135 || a < -150 ? 'donner' : a < -45 ? 'schatten' : a < 45 ? 'wind' : a < 135 ? 'fluss' : 'donner';
    }
    if (x > 10100 && y < 1800) return 'kueste';
    if (x < FREMD_E) return 'fremdland';
    if (x < 10150) return 'berge';
    return 'hochland';
  }
  if (!raw && typeof G !== 'undefined' && G && G.flags && G.flags.see && !(y > 3440 && x > 1060)) return 'verlassen';
  if (y > 3440 && x > 1060) return 'zweibeiner';
  const bg = raw ? LM0.baumgeviert : LM.baumgeviert;
  if (dist(x, y, bg.x, bg.y) < bg.r + 30) return 'baumgeviert';
  if (inRoad(x, y)) return 'donnerweg';
  // Wie auf der Karte aus den Büchern: WindClan im Nordwesten, Hochfelsen im Norden, SchattenClan im Nordosten,
  // FlussClan im Südwesten, DonnerClan im Südosten – alle treffen sich am Baumgeviert
  if (northOfRoad(x, y)) return x < branchX(y) || x > 4500 ? 'hochland' : 'schatten';
  if (x > ROAD_BEND) return 'hochland';
  if (y < windS(x) && x < windE(y)) return 'wind';
  if (x < riverX(y) + RIVER_HW) return 'fluss';
  return 'donner';
}

// ===== Boden vorberechnen =====
const TS = 0.2;
let terrainCanvas = null;
function groundColor(x, y, o) {
  const n = NOISE(x / 220, y / 220), m = NOISE(x / 35 + 300, y / 35 + 300), j = (m - 0.5) * 18;
  let r, g, b;
  if (roadDist(x, y) < ROAD_HW) {
    const dy = RD.d, along = RD.along;
    if (dy < 5 && Math.floor(along / 200) % 2 === 0) { r = 215; g = 210; b = 180; }
    else if (dy > ROAD_HW - 10) { r = 95; g = 92; b = 84; }
    else { r = 58; g = 58; b = 62; }
    o[0] = r + j * .4; o[1] = g + j * .4; o[2] = b + j * .4; return o;
  }
  const rd = Math.abs(x - riverX(y));
  if (riverOn(y) && rd < RIVER_HW) { const t = rd / RIVER_HW; o[0] = 35 + t * 25 + j * .5; o[1] = 88 + t * 30 + j * .5; o[2] = 145 - t * 10 + (m > 0.62 ? 20 : 0); return o; }
  if (riverOn(y) && rd < RIVER_HW + 22) { o[0] = 140 + j; o[1] = 128 + j; o[2] = 92 + j; return o; }
  if (inOcean(x, y)) { const d = x - oceanEdge(y); o[0] = 40 + j * .4; o[1] = 90 - Math.min(40, d / 8) + j * .4; o[2] = 150 - Math.min(30, d / 10); return o; }
  if (inLake(x, y)) { const d = 1 - lakeDist(x, y); o[0] = 35 + j * .4; o[1] = 90 - d * 30; o[2] = 140 - d * 20; return o; }
  const t = territoryAt(x, y, true);
  const dl = dist(x, y, LM0.lager.x, LM0.lager.y), dsm = dist(x, y, LM0.steinmulde.x, LM0.steinmulde.y);
  if (dsm < LM0.steinmulde.r) { o[0] = 150 + j; o[1] = 140 + j; o[2] = 120 + j; return o; }
  if (x > 10050 && y > 1800 && lakeDist(x, y) < 1.1) { o[0] = 176 + j; o[1] = 160 + j; o[2] = 118 + j; return o; }
  if (t === 'kueste') { const d = oceanEdge(y) - x; if (d < 170) { o[0] = 220 + j; o[1] = 200 + j; o[2] = 150 + j; return o; } o[0] = lerp(160, 120, n) + j; o[1] = lerp(150, 140, n) + j; o[2] = 100 + j; return o; }
  if (t === 'fremdland') {
    const b = fremdBiome(x, y);
    if (b === 'stadt') { const st = (Math.abs((x - FREMD_TOWN.x0) % 330 - 165) < 26) || (Math.abs((y - FREMD_TOWN.y0) % 350 - 175) < 26); if (st) { o[0] = 70 + j * .3; o[1] = 70 + j * .3; o[2] = 74; return o; } o[0] = 96 + n * 20; o[1] = 150 + n * 25; o[2] = 64; return o; }
    if (b === 'feld') { const s2 = Math.floor((x + y * 0.3) / 60) % 2; o[0] = (s2 ? 190 : 168) + j; o[1] = (s2 ? 168 : 150) + j; o[2] = (s2 ? 92 : 80) + j; return o; }
    if (b === 'wald') { o[0] = lerp(52, 88, n) + j; o[1] = lerp(92, 80, n) + j; o[2] = lerp(40, 44, n) + j; return o; }
    o[0] = lerp(118, 140, n) + j; o[1] = lerp(150, 138, n) + j; o[2] = lerp(74, 70, n) + j; return o;
  }
  if (t === 'berge') { const hh = clamp((heightAt(x, y) - 60) / 180, 0, 1); o[0] = lerp(96, 150, hh) + j; o[1] = lerp(108, 146, hh) + j; o[2] = lerp(80, 140, hh) + j; if (hh > 0.8) { o[0] = o[1] = o[2] = 225 + j; } return o; }
  if (dl < 250) { const k = clamp((dl - 200) / 50, 0, 1); r = lerp(152, 70, k); g = lerp(128, 95, k); b = lerp(88, 45, k); }
  else if (dist(x, y, LM0.sandkuhle.x, LM0.sandkuhle.y) < LM0.sandkuhle.r) { r = 205; g = 180; b = 120; }
  else if (t === 'zweibeiner') {
    if (y > 3940 || x < 1100 || x > 3500) { r = 122; g = 120; b = 114; if (Math.floor(x / 40) % 2 === Math.floor(y / 40) % 2) { r += 6; g += 6; b += 6; } }
    else { r = 88 + n * 20; g = 152 + n * 25; b = 62; }
  }
  else if (t === 'donner') { r = lerp(50, 98, n); g = lerp(94, 78, n); b = lerp(38, 42, n); }
  else if (t === 'schatten') {
    const mp = NOISE(x / 260 + 50, y / 260 + 50);
    if (marshPool(x, y)) { r = 48; g = 74; b = 82; }
    else if (y < 1250 && mp > 0.6) { r = 74; g = 90; b = 58; }
    else { r = lerp(40, 70, n); g = lerp(66, 58, n); b = lerp(38, 34, n); }
  }
  else if (t === 'fluss') { r = lerp(62, 92, n); g = lerp(130, 118, n); b = lerp(50, 60, n); }
  else if (t === 'wind' && windS(x) - y < 45 && x < windE(y) - 60) { r = 128 + n * 20; g = 112 + n * 16; b = 86; }
  else if (t === 'wind') { r = lerp(145, 112, n); g = lerp(148, 126, n); b = lerp(80, 70, n); if (m > 0.74) { r = 128; g = 92; b = 122; } }
  else if (t === 'hochland') { r = lerp(122, 96, n); g = lerp(116, 100, n); b = lerp(96, 80, n); }
  else if (t === 'baumgeviert') { const d = dist(x, y, LM0.baumgeviert.x, LM0.baumgeviert.y) / 220; r = lerp(52, 70, d); g = lerp(92, 105, d); b = 44; }
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
  for (const k in LM0) { if (k === 'donnerweg') continue; const l = LM0[k]; if (dist(x, y, l.x, l.y) < l.r + pad) return true; }
  return false;
}
function rockShape(R, r) { const pts = []; const n = 7 + Math.floor(R() * 4); for (let i = 0; i < n; i++) { const a = i / n * TAU; pts.push([Math.cos(a) * r * (0.75 + R() * 0.3), Math.sin(a) * r * (0.75 + R() * 0.3)]); } return pts; }
function addRock(R, x, y, r, collide = true, col) {
  OB.rocks.push({ x, y, r, pts: rockShape(R, r), col: col || (140 + R() * 30 | 0) });
  if (collide) addCol(x, y, r * 0.85);
}
function addTree(R, x, y, kind, big) {
  const r = big ? big * 1.5 : (kind === 'pine' ? 60 + R() * 28 : 90 + R() * 65);
  const t = { x, y, r, tr: big ? 55 : (kind === 'pine' ? 15 + R() * 8 : 18 + R() * 16), k: kind, c: R() };
  OB.trees.push(t); addCol(x, y, t.tr);
}
function addBush(x, y, r, k) { const b = { x, y, r, k }; OB.bushes.push(b); gridAdd(bushGrid, b, r); }

const DENS = { hochstein: [0, -165], anfuehrer: [30, -112], heiler: [-178, -85], krieger: [152, -78], schueler: [160, 92], kinder: [-162, 88], aeltest: [-92, 172], pile: [48, 18] };
function denPos(key, base) { const d = DENS[key], l = base || LM.lager; return { x: l.x + d[0], y: l.y + d[1] }; }

function makeCamp(lm0, gap, clan, opt = {}) {
  const lm = Object.assign({}, lm0), ring = lm.r + 4, step = 40 / ring;
  for (let a = 0; a < TAU; a += step) {
    if (Math.abs(angDiff(a, gap)) < 0.2) continue;
    const x = lm.x + Math.cos(a) * ring, y = lm.y + Math.sin(a) * ring;
    if (opt.rock) { if (Math.floor(a / step) % 2 === 0) addRock(opt.R, x, y, 34, true, 150 + (opt.R() * 20 | 0)); else addCol(x, y, 24); }
    else { addBush(x, y, 30, 'wall'); addCol(x, y, 24); }
  }
  OB.camps.push({ lm, gap, clan, lake: !!opt.lake });
}

function buildObjects() {
  const R = mulberry32(777);
  // --- Zweibeinerort: Gärten, Zäune, Häuser ---
  for (let i = 0; i < 6; i++) {
    const x0 = 1100 + i * 400;
    if (i === 5) { // Baumsägeort statt Garten
      addRect(x0, 3476, 400, 8, 'fence'); addRect(x0 - 4, 3476, 8, 460, 'fence');
      OB.houses.push({ x: x0 + 120, y: 3700, w: 220, h: 150, roof: '#5a4a3a', barn: true }); addRect(x0 + 120, 3700, 220, 150, 'house');
      continue;
    }
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
    if (Math.abs(x + 120 - ROAD_BEND) < 330) continue;
    OB.houses.push({ x, y, w: 240, h: 190, roof: ['#6e4a3a', '#5a5f6e', '#7a3030', '#8a3b2e'][(i + j) % 4] }); addRect(x, y, 240, 190, 'house');
  }
  OB.flats.push({ k: 'bed', x: 2100, y: 3890 });
  // --- Lager ---
  makeCamp(LM0.lager, Math.PI / 2, 'donner');
  makeCamp(LM0.schattenlager, Math.PI / 2, 'schatten');
  makeCamp(LM0.flusslager, 0, 'fluss');
  makeCamp(LM0.windlager, Math.PI, 'wind');
  makeCamp(LM0.steinmulde, 0, 'donner', { lake: true, rock: true, R });
  makeCamp(LM0.schatten2, Math.PI / 2, 'schatten', { lake: true });
  makeCamp(LM0.fluss2, -Math.PI / 2, 'fluss', { lake: true });
  makeCamp(LM0.wind2, Math.PI, 'wind', { lake: true });
  const hs = denPos('hochstein', LM0.lager);
  addRock(R, hs.x, hs.y, 50, true, 150);
  const hs2 = denPos('hochstein', LM0.steinmulde);
  addRock(R, hs2.x, hs2.y, 44, true, 160);
  // Die Insel mit dem Großen Baum, Stammeshöhle, Dachsbau
  addTree(R, LM0.insel.x + 10, LM0.insel.y - 10, 'oak', 120);
  for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; addRock(R, LM0.stamm.x + Math.cos(a) * 140, LM0.stamm.y - 60 + Math.sin(a) * 60 - 60, 50 + R() * 30, true, 120); }
  OB.flats.push({ k: 'cave', x: LM0.stamm.x, y: LM0.stamm.y - 40 });
  for (let i = 0; i < 5; i++) addRock(R, LM0.dachsbau.x + rand(-90, 90), LM0.dachsbau.y - 60 + rand(-30, 20), 16 + R() * 14);
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
  for (let i = 0; i < 12; i++) { const a = R() * TAU, d = R() * 170; addRock(R, HOCH.x + Math.cos(a) * d, HOCH.y + 20 + Math.sin(a) * d * 0.7, 55 + R() * 45, true, 110 + R() * 30 | 0); }
  OB.flats.push({ k: 'cave', x: LM.mondstein.x, y: LM.mondstein.y - 20 });
  // --- Mikuschs Hof: Scheune und Haus ---
  { const sx = LM0.scheune.x - 100, sy = LM0.scheune.y - 210; addRect(sx, sy, 200, 150, 'barn'); OB.houses.push({ x: sx, y: sy, w: 200, h: 150, roof: '#8a4a2a', barn: true });
    OB.houses.push({ x: sx - 250, y: sy + 10, w: 170, h: 140, roof: '#5a4030' }); addRect(sx - 250, sy + 10, 170, 140, 'house'); }
  // --- Zweibeinerort im Fremdland: Häuser mit Gärten, dazwischen Wege ---
  for (let gx = FREMD_TOWN.x0 + 40; gx < FREMD_TOWN.x1 - 200; gx += 330) for (let gy = FREMD_TOWN.y0 + 40; gy < FREMD_TOWN.y1 - 200; gy += 350) {
    if (R() < 0.18) continue;
    const roofs = ['#8a3b2e', '#6e4a3a', '#5a5f6e', '#7a3030', '#6a5040']; OB.houses.push({ x: gx + 40, y: gy + 30, w: 190, h: 150, roof: roofs[(R() * 5) | 0] }); addRect(gx + 40, gy + 30, 190, 150, 'house');
    addRect(gx + 20, gy + 250, 150, 8, 'fence');
  }
  // --- Bauernhof mit Scheune ---
  { const f = LM0.bauernhof; OB.houses.push({ x: f.x - 250, y: f.y - 120, w: 230, h: 170, roof: '#8a4a2a', barn: true }); addRect(f.x - 250, f.y - 120, 230, 170, 'barn'); OB.houses.push({ x: f.x + 60, y: f.y - 100, w: 170, h: 140, roof: '#6e4a3a' }); addRect(f.x + 60, f.y - 100, 170, 140, 'house'); addRect(f.x - 300, f.y + 120, 560, 8, 'fence'); }
  // --- Tunneleingänge: Felsen rund um die dunklen Löcher ---
  for (const k of ['tunnelein', 'tunnelaus']) { const t = LM0[k]; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.55; addRock(R, t.x + Math.cos(a) * 60, t.y + Math.sin(a) * 45, 22 + R() * 12, true, 120); } OB.flats.push({ k: 'cave', x: t.x, y: t.y - 30 }); }
  // --- Krähenort: Müllplatz der Zweibeiner mit Zaun ---
  { const k = LM0.kraehenort; addRect(k.x - 150, k.y - 110, 300, 8, 'fence'); addRect(k.x + 146, k.y - 110, 8, 224, 'fence'); addRect(k.x - 154, k.y - 110, 8, 224, 'fence');
    for (let i = 0; i < 9; i++) addRock(R, k.x + (R() - 0.5) * 220, k.y + (R() - 0.5) * 160, 12 + R() * 14, true, 95 + R() * 40 | 0); }
  // --- Hochkiefern ---
  for (let i = 0; i < 16; i++) { const a = R() * TAU, d = 40 + R() * 200; addTree(R, LM0.hochkiefern.x + Math.cos(a) * d, LM0.hochkiefern.y + Math.sin(a) * d * 0.7, 'pine'); }
  // --- Wasserfall: Felsen an der Klippe ---
  for (let i = 0; i < 6; i++) addRock(R, riverX(RIVER_TOP) + (i < 3 ? -1 : 1) * (75 + R() * 40), RIVER_TOP - 25 - R() * 40, 20 + R() * 16, true, 125);
  // --- Wald, Moor, Sumpf ---
  for (let gy = 30; gy < H; gy += 60) for (let gx = 30; gx < W; gx += 60) {
    const x = gx + (R() - 0.5) * 48, y = gy + (R() - 0.5) * 48, rr = R(), t = territoryAt(x, y, true);
    if (roadDist(x, y) < ROAD_HW + 60) continue;
    if (isWater(x, y) && !marshPool(x, y)) continue;
    if (x > 10050 && y > 1800 && lakeDist(x, y) < 1.12) { if (rr < 0.3 && lakeDist(x, y) > 1.02) addBush(x, y, 18 + R() * 8, 'reed'); continue; }
    if (t === 'fremdland') {
      const b = fremdBiome(x, y);
      if (b === 'stadt' || nearLM(x, y, 40)) continue;
      if (b === 'wald') { if (rr < 0.07) addTree(R, x, y, R() < 0.25 ? 'birch' : 'oak'); else if (rr < 0.3) addBush(x, y, 26 + R() * 20, R() < 0.7 ? 'fern' : 'bramble'); }
      else if (b === 'wiese') { if (rr < 0.008) addTree(R, x, y, 'oak'); else if (rr < 0.06) addBush(x, y, 20 + R() * 14, R() < 0.5 ? 'bramble' : 'heather'); else if (rr < 0.066) addRock(R, x, y, 14 + R() * 18); }
      else if (b === 'feld' && rr < 0.01) addBush(x, y, 18, 'bramble');
      continue;
    }
    if (t === 'berge') { if (rr < 0.09) addRock(R, x, y, 20 + R() * 45, true, 115 + R() * 30 | 0); else if (rr < 0.11) addTree(R, x, y, 'pine'); continue; }
    if (t === 'kueste') { if (x > oceanEdge(y) - 180) continue; if (rr < 0.06) addBush(x, y, 16 + R() * 10, R() < 0.5 ? 'heather' : 'reed'); else if (rr < 0.07) addRock(R, x, y, 14 + R() * 16); continue; }
    if (riverOn(y) && Math.abs(x - riverX(y)) < RIVER_HW + 45 && x < OLD_W) { if (rr < 0.35 && Math.abs(x - riverX(y)) > RIVER_HW + 8) addBush(x, y, 20 + R() * 10, 'reed'); continue; }
    if (nearLM(x, y, 40)) continue;
    if (x > 3360 && x < 3500 && y > 2540 && y < 2970) continue;
    if (dist(x, y, HOCH.x, HOCH.y) < 260 || dist(x, y, LM0.kraehenort.x, LM0.kraehenort.y) < 190) { if (rr < 0.04) addRock(R, x, y, 14 + R() * 20); continue; }
    if (t === 'zweibeiner' && x > 3110 && x < 3490 && y < 3940 && y > 3500) { if (rr < 0.08 && (x < 3230 || y < 3680)) addTree(R, x, y, 'pine'); continue; }
    if (dist(x, y, LM0.steinmulde.x, LM0.steinmulde.y) < LM0.steinmulde.r + 30) continue;
    if (t === 'donner') {
      if (rr < 0.075) addTree(R, x, y, R() < 0.15 ? 'birch' : 'oak');
      else if (rr < 0.36) addBush(x, y, 26 + R() * 22, R() < 0.7 ? 'fern' : 'bramble');
    } else if (t === 'schatten') {
      if (marshPool(x, y)) { if (rr < 0.1) addBush(x, y, 16, 'reed'); continue; }
      if (rr < 0.1) addTree(R, x, y, 'pine');
      else if (rr < 0.16) addBush(x, y, 22 + R() * 14, R() < 0.5 ? 'reed' : 'fern');
    } else if (t === 'fluss') {
      if (rr < 0.035) addTree(R, x, y, 'willow');
      else if (rr < 0.2) addBush(x, y, 18 + R() * 10, R() < 0.5 ? 'reed' : 'fern');
    } else if (t === 'wind') {
      if (rr < 0.012) addTree(R, x, y, 'oak');
      else if (rr < 0.2) addBush(x, y, 16 + R() * 12, 'heather');
      else if (rr < 0.222) addRock(R, x, y, 14 + R() * 18);
    } else if (t === 'hochland') {
      if (rr < 0.05) addRock(R, x, y, 16 + R() * 26);
      else if (rr < 0.12) addBush(x, y, 16, 'heather');
      else if (rr < 0.126 && x > ROAD_BEND) addTree(R, x, y, 'pine');
    } else if (t === 'zweibeiner') {
      if (y < 3920 && y > 3500 && x > 1110 && x < 3490 && rr < 0.06) addBush(x, y, 16 + R() * 8, 'garden');
    }
  }
  // --- Kräuter ---
  const kinds = ['ringelblume', 'ringelblume', 'ringelblume', 'spinnweben', 'spinnweben', 'schafgarbe', 'mohn'];
  let tries = 0;
  while (OB.herbs.length < 70 && tries++ < 5000) {
    const x = 1250 + R() * 2300, y = 1500 + R() * 1900;
    if (territoryAt(x, y, true) !== 'donner' || nearLM(x, y, 20) || isWater(x, y)) continue;
    OB.herbs.push({ x, y, k: pick(kinds) });
  }
  for (let i = 0; i < 7; i++) OB.herbs.push({ x: 1500 + i * 280 + R() * 80, y: 3380 + R() * 60, k: 'katzenminze' });
  for (let i = 0; i < 6; i++) OB.herbs.push({ x: 150 + R() * 1100, y: 1000 + R() * 600, k: pick(['schafgarbe', 'mohn']) });
  for (let i = 0; i < 25; i++) { const x = 10100 + R() * 700, y = 2500 + R() * 1400; if (territoryAt(x, y, true) === 'donner' && !isWater(x, y) && !nearLM(x, y, 20)) OB.herbs.push({ x, y, k: pick(kinds) }); }
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


// ===== Höhen (nur für die 3D-Darstellung) =====
function baseH(x, y) { return (NOISE(x / 650 + 7, y / 650 + 3) - 0.5) * 70 + (NOISE(x / 180 + 40, y / 180 + 9) - 0.5) * 10; }
function flatTo(h, x, y, cx, cy, r, level, edge = 90) {
  const d = dist(x, y, cx, cy); if (d > r + edge) return h;
  const k = clamp((d - r) / edge, 0, 1), s = k * k * (3 - 2 * k); return lerp(level, h, s);
}
function roadLevel(x, y) { roadDist(x, y); return baseH(RD.x, RD.y) + 1.5; }
const HOCH = { x: 1000, y: 190 };
// WindClan-Hochland: steile Klippe im Süden (mit Wasserfall), sanfter Anstieg im Osten
function windRaise(x, y) {
  if (x > 1700 || y > 1900) return 0;
  const ks = clamp((windS(x) - y) / 55, 0, 1), ke = clamp((windE(y) - x + 60) / 260, 0, 1), s = Math.min(ks * ks * (3 - 2 * ks), ke * ke * (3 - 2 * ke));
  return s * (48 + (NOISE(x / 200 + 3, y / 200) - 0.5) * 20);
}
function waterLevel(y) { return baseH(riverX(y), y) - 7; }
function heightAt(x, y) {
  let h = baseH(x, y);
  if (x > OLD_W - 200) return heightNew(x, y, h);
  h = flatTo(h, x, y, LM0.lager.x, LM0.lager.y, LM0.lager.r - 20, baseH(LM0.lager.x, LM0.lager.y) - 16, 60);
  h += windRaise(x, y);
  for (const k of ['schattenlager', 'flusslager', 'windlager', 'sonnenfelsen', 'scheune', 'kraehenort']) { const l = LM0[k]; h = flatTo(h, x, y, l.x, l.y, l.r, baseH(l.x, l.y) + windRaise(l.x, l.y) + (k === 'sonnenfelsen' ? 5 : 0)); }
  h = flatTo(h, x, y, LM0.baumgeviert.x, LM0.baumgeviert.y, LM0.baumgeviert.r - 20, baseH(LM0.baumgeviert.x, LM0.baumgeviert.y) - 22, 70);
  h = flatTo(h, x, y, LM0.sandkuhle.x, LM0.sandkuhle.y, LM0.sandkuhle.r - 20, baseH(LM0.sandkuhle.x, LM0.sandkuhle.y) - 7, 40);
  if (y > 3300) h = lerp(h, 0, clamp((y - 3300) / 150, 0, 1));
  // Straße
  const rd = roadDist(x, y);
  if (rd < ROAD_HW + 150) { const k = clamp((rd - ROAD_HW - 10) / 140, 0, 1), s = k * k * (3 - 2 * k); h = lerp(roadLevel(x, y) - 1.5, h, s); }
  // Fluss
  if (y < 3460 && y > RIVER_TOP - 10) { const d = Math.abs(x - riverX(y)); if (d < RIVER_HW + 40) { const k = clamp((d - RIVER_HW + 15) / 55, 0, 1), s = k * k * (3 - 2 * k); h = lerp(baseH(riverX(y), y) - 17, h, s); } }
  if (marshPool(x, y)) h -= 5;
  // Schlucht
  if (x > 3360 && x < 3500 && y > 2540 && y < 2970) { const k = Math.min(x - 3360, 3500 - x, y - 2540, 2970 - y); h = lerp(h, -70, clamp(k / 25, 0, 1)); }
  // Hochfelsen
  const hd = dist(x, y, HOCH.x, HOCH.y); if (hd < 420) h += 110 * Math.pow(1 - hd / 420, 1.6);
  return h;
}
const LAKE_LEVEL = baseH(11050, 3060) - 6, OCEAN_LEVEL = -12;
const bumpY = (v, c, w) => clamp(1 - Math.abs(v - c) / w, 0, 1);
function heightNew(x, y, h) {
  // Berge mit zwei Pässen
  const mb = clamp(1 - Math.abs(x - 9600) / 560, 0, 1);
  if (mb > 0) { const pass = Math.max(bumpY(y, 1650, 280), bumpY(y, 3150, 320)); h += Math.pow(mb, 1.4) * (140 + NOISE(x / 300, y / 300) * 170) * (1 - 0.7 * pass); }
  if (x < OLD_W) h = lerp(h, baseH(x, y), clamp((OLD_W - x) / 200, 0, 1));
  // Küste und Meer
  if (y < 1800 && x > 10100) { const d = oceanEdge(y) - x; h = lerp(h, h * 0.3, 0.6); if (d < 250) h = lerp(OCEAN_LEVEL - 18, h * 0.3, clamp(d / 250, 0, 1)); }
  // See, Insel, Lager
  if (x > 10050 && y > 1800) {
    const ld = lakeDist(x, y);
    if (ld < 1.35) { const k = clamp((ld - 0.8) / 0.55, 0, 1), s = k * k * (3 - 2 * k); h = lerp(LAKE_LEVEL - 16, h, s); }
    h = flatTo(h, x, y, LM0.insel.x, LM0.insel.y, 70, LAKE_LEVEL + 7, 40);
    h = flatTo(h, x, y, LM0.steinmulde.x, LM0.steinmulde.y, LM0.steinmulde.r - 30, baseH(LM0.steinmulde.x, LM0.steinmulde.y) - 16, 70);
    for (const k of ['schatten2', 'fluss2', 'wind2']) { const l = LM0[k]; h = flatTo(h, x, y, l.x, l.y, l.r, baseH(l.x, l.y)); }
    const md = dist(x, y, LM0.mondsee.x, LM0.mondsee.y); if (md < 420) h += 70 * Math.pow(1 - md / 420, 1.3); if (md < 45) h -= 6;
  }
  h = flatTo(h, x, y, LM0.stamm.x, LM0.stamm.y + 40, 60, heightAtRaw(LM0.stamm.x, LM0.stamm.y + 40), 60);
  return h;
}
function heightAtRaw(x, y) { const mb = clamp(1 - Math.abs(x - 9600) / 560, 0, 1); return baseH(x, y) + Math.pow(mb, 1.4) * (140 + NOISE(x / 300, y / 300) * 170) * (1 - 0.7 * Math.max(bumpY(y, 1650, 280), bumpY(y, 3150, 320))); }
function surfaceY(x, y) {
  if (inLake(x, y)) return Math.max(heightAt(x, y), LAKE_LEVEL - 5);
  if (inOcean(x, y)) return Math.max(heightAt(x, y), OCEAN_LEVEL - 5);
  if (inRoad(x, y)) return roadLevel(x, y);
  if (inRiver(x, y)) return Math.max(heightAt(x, y), waterLevel(y) - 5);
  return heightAt(x, y);
}
