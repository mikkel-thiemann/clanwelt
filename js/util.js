'use strict';
// ===== Hilfsfunktionen =====
const TAU = Math.PI * 2;
const clamp = (v, a, b) => v < a ? a : (v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
const rand = (a, b) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const chance = p => Math.random() < p;
function angDiff(a, b) { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; }
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; }

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function makeNoise(seed) {
  const r = mulberry32(seed), N = 256, v = new Float32Array(N * N);
  for (let i = 0; i < v.length; i++) v[i] = r();
  const sm = t => t * t * (3 - 2 * t);
  function n(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y), xf = sm(x - xi), yf = sm(y - yi);
    const X = xi & 255, Y = yi & 255, X1 = (X + 1) & 255, Y1 = (Y + 1) & 255;
    const a = v[Y * N + X], b = v[Y * N + X1], c = v[Y1 * N + X], d = v[Y1 * N + X1];
    return lerp(lerp(a, b, xf), lerp(c, d, xf), yf);
  }
  return (x, y) => n(x, y) * 0.55 + n(x * 2.1 + 17, y * 2.1 + 9) * 0.3 + n(x * 4.3 + 3, y * 4.3 + 41) * 0.15;
}
const NOISE = makeNoise(1337);

// ===== Namen =====
const PREFIXES = ['Farn', 'Dorn', 'Hasel', 'Birken', 'Regen', 'Licht', 'Schnee', 'Moos', 'Nebel', 'Rost', 'Eichen', 'Weiden',
  'Brombeer', 'Frost', 'Kiesel', 'Sturm', 'Tau', 'Honig', 'Rauch', 'Stein', 'Blüten', 'Laub', 'Mohn', 'Buchen', 'Distel',
  'Kurz', 'Spinnen', 'Wachtel', 'Amsel', 'Lerchen', 'Minzen', 'Beeren', 'Wolken', 'Hell', 'Flink', 'Sonnen', 'Mond',
  'Eis', 'Glut', 'Salbei', 'Rosen', 'Kastanien', 'Efeu', 'Specht', 'Bernstein', 'Fuchs', 'Eulen', 'Schlehen', 'Tannen', 'Wiesel'];
const SUFFIXES = ['fell', 'pelz', 'kralle', 'herz', 'schweif', 'bart', 'streif', 'sprung', 'flug', 'blatt', 'feder', 'wind',
  'nase', 'fang', 'gesicht', 'licht', 'wolke', 'fluss', 'schatten', 'tatze', 'sturm', 'blüte', 'ohr', 'auge', 'glanz', 'seele', 'pfad'];

const FUR = [['#d9782b', '#9c4a12'], ['#8a8f96', '#5b5f66'], ['#2b2b2e', null], ['#f1efe9', null], ['#a07850', '#6b4a2a'],
  ['#c9b48a', '#8f7a50'], ['#6e5a4a', '#3e3028'], ['#b8b8b8', '#7a7a7a'], ['#e8c27a', '#b98a3a'], ['#4a4038', '#2a241f'], ['#7d6f66', '#4d423b']];
const EYES = ['#7bc043', '#e8b923', '#4fa3d9', '#d98b2b', '#9ccf5a'];
function randomLook(dark) {
  let f = pick(FUR);
  if (dark && chance(0.6)) f = pick([FUR[2], FUR[6], FUR[9], FUR[10], FUR[1]]);
  return {
    base: f[0], stripe: (f[1] && chance(0.55)) ? f[1] : null, white: chance(0.4) ? rand(0.2, 0.7) : 0,
    eye: pick(EYES), long: chance(0.25), patch: chance(0.08) ? pick(['#2b2220', '#d9782b']) : null, size: rand(0.92, 1.08)
  };
}
function darker(hex, f = 0.7) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.floor(((n >> 16) & 255) * f), g = Math.floor(((n >> 8) & 255) * f), b = Math.floor((n & 255) * f);
  return `rgb(${r},${g},${b})`;
}
