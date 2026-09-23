'use strict';
// ===== 3D-Modelle (Katzen, Tiere, Beute, Autos) =====
const GEO = {};
function geos() {
  if (GEO.s) return GEO;
  GEO.s = new THREE.SphereGeometry(1, 16, 12);
  GEO.sr = GEO.s.clone().rotateZ(Math.PI / 2);   // Pole vorne/hinten → Streifen werden Ringe
  GEO.lo = new THREE.SphereGeometry(1, 8, 6);
  GEO.cone = new THREE.ConeGeometry(1, 1, 5);
  GEO.cyl = new THREE.CylinderGeometry(1, 0.8, 1, 7);
  GEO.box = new THREE.BoxGeometry(1, 1, 1);
  return GEO;
}
const FURTEX = new Map();
function furTexture(look) {
  const key = look.base + '|' + look.stripe + '|' + look.patch;
  if (FURTEX.has(key)) return FURTEX.get(key);
  const c = document.createElement('canvas'); c.width = 64; c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = look.base; g.fillRect(0, 0, 64, 128);
  for (let i = 0; i < 400; i++) { g.fillStyle = Math.random() < 0.5 ? 'rgba(0,0,0,.06)' : 'rgba(255,255,255,.06)'; g.fillRect(Math.random() * 64, Math.random() * 128, 2, 3); }
  if (look.patch) { g.fillStyle = look.patch; for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(Math.random() * 64, 15 + Math.random() * 100, 8 + Math.random() * 10, 6 + Math.random() * 8, Math.random() * 3, 0, TAU); g.fill(); } }
  if (look.stripe) {
    g.strokeStyle = look.stripe; g.lineWidth = 4.5;
    for (let y = 14; y < 120; y += 12) { g.beginPath(); for (let x = 0; x <= 64; x += 4) { const yy = y + Math.sin(x / 64 * TAU * 2 + y) * 2.5; x ? g.lineTo(x, yy) : g.moveTo(x, yy); } g.stroke(); }
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  FURTEX.set(key, t); return t;
}
function mk(geo, mat, sx, sy, sz, x, y, z, parent) {
  const m = new THREE.Mesh(geo, mat); m.scale.set(sx, sy, sz); m.position.set(x, y, z); if (parent) parent.add(m); return m;
}
const MAT = {};
function sharedMat(col) { return MAT[col] || (MAT[col] = new THREE.MeshLambertMaterial({ color: col })); }

// ---------- Katze ----------
function makeCatModel(look, opts = {}) {
  const g = geos(), root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const mFur = new THREE.MeshLambertMaterial({ map: furTexture(look) });
  const mBase = new THREE.MeshLambertMaterial({ color: look.base });
  const mWhite = new THREE.MeshLambertMaterial({ color: 0xf4f1ea });
  const mStripe = look.stripe ? new THREE.MeshLambertMaterial({ color: look.stripe }) : mBase;
  const mats = [mFur, mBase, mWhite, mStripe];
  const W_ = look.white > 0.3;
  const torso = mk(g.sr, mFur, 13, 7.2, 7.6, 0, 12, 0, body); torso.castShadow = true;
  if (look.long) { mk(g.lo, mBase, 7, 8, 8.6, 9, 14, 0, body); mk(g.lo, mBase, 7, 7.6, 8.4, -6, 12.5, 0, body); }
  if (W_) mk(g.s, mWhite, 5, 5.6, 5.6, 9.5, 10.5, 0, body);
  const head = new THREE.Group(); head.position.set(14, 18, 0); body.add(head);
  const skull = mk(g.sr, mFur, 6.2, 5.8, 6.4, 0, 0, 0, head); skull.castShadow = true;
  if (look.long) mk(g.lo, mBase, 4, 5.5, 7.6, -1.5, -1.5, 0, head);
  mk(g.s, look.white > 0.35 ? mWhite : mBase, 3, 2.6, 3.6, 4.6, -1.8, 0, head);
  mk(g.lo, sharedMat('#d97a8a'), 0.9, 0.7, 1.1, 7.5, -0.9, 0, head);
  const eyeM = new THREE.MeshBasicMaterial({ color: look.eye }); mats.push(eyeM);
  for (const s of [-1, 1]) {
    mk(g.lo, eyeM, 1.2, 1.3, 1.2, 4.4, 1.3, s * 2.5, head);
    mk(g.lo, sharedMat('#111'), 0.5, 1.1, 0.5, 5.4, 1.3, s * 2.6, head);
    const ear = mk(g.cone, mBase, 2.6, 5, 2.4, -0.6, 5.4, s * 3.2, head); ear.rotation.x = s * 0.35;
    const inner = mk(g.cone, sharedMat('#e8a0a0'), 1.5, 3.4, 1.1, 0.4, 5.1, s * 3.1, head); inner.rotation.x = s * 0.35;
  }
  const legs = [];
  for (const [lx, lz] of [[7, 4.2], [7, -4.2], [-8, 4.4], [-8, -4.4]]) {
    const pv = new THREE.Group(); pv.position.set(lx, 11, lz); body.add(pv);
    mk(g.cyl, W_ ? mWhite : mBase, 1.9, 11, 1.9, 0, -5.5, 0, pv);
    mk(g.lo, W_ ? mWhite : mBase, 2.4, 1.4, 2.6, 0.8, -11, 0, pv);
    legs.push(pv);
  }
  const tail = [];
  for (let i = 0; i < 12; i++) {
    const r = (look.long ? 2.8 : 2.1) * (1 - i * 0.045);
    const mm = i >= 10 && look.white > 0.55 ? mWhite : (look.stripe && i % 3 === 2 ? mStripe : mBase);
    const s = mk(g.lo, mm, r, r, r, -12 - i * 2.5, 13, 0, body); tail.push(s);
  }
  if (opts.star) for (const m of mats.concat([sharedMat('#111')])) { m.transparent = true; m.opacity = 0.55; if (m.emissive) m.emissive.set('#5a78c8'); }
  if (opts.collar) mk(new THREE.TorusGeometry(1, 0.25, 6, 16), sharedMat(opts.collar), 4.5, 4.5, 4.5, 11, 15.5, 0, body).rotation.y = Math.PI / 2;
  root.userData = { body, head, legs, tail, mats, mFur, mBase };
  return root;
}
function animateCat(m, e, t, o) {
  const u = m.userData, ph = e.phase || 0, mv = o.moving ? 1 : 0;
  const seed = (e.ox || 0) * 0.1;
  if (o.sleep) {
    for (const l of u.legs) l.visible = false;
    u.body.position.y = -6; u.head.position.set(9, 12, 5); u.head.rotation.set(0, 0.9, 0.2);
    u.tail.forEach((s, i) => { const a = 2.2 + i * 0.26; s.position.set(Math.cos(a) * 11, 8, Math.sin(a) * 11); });
    return;
  }
  for (const l of u.legs) l.visible = true;
  const crouch = o.sneak ? -3.5 : 0;
  u.body.position.y = crouch + Math.abs(Math.sin(ph)) * 1.0 * mv;
  u.body.rotation.z = o.lunge ? -0.18 : 0;
  u.head.position.set(14, 18 + crouch * 0.5, 0);
  u.head.rotation.set(0, o.look ? Math.sin(t * 0.7 + seed) * 0.35 : 0, o.sneak ? -0.2 : 0);
  const sw = (o.run ? 0.9 : 0.6) * mv, offs = [0, Math.PI, Math.PI, 0];
  u.legs.forEach((l, i) => { l.rotation.z = Math.sin(ph + offs[i]) * sw; l.scale.y = o.sneak ? 0.75 : 1; });
  const up = o.sneak ? 0.25 : (o.fight ? 1.3 : 1);
  u.tail.forEach((s, i) => { const k = i / 11; s.position.set(-12 - k * 15, 13 + crouch * 0.4 + Math.sin(k * 2.3) * 9 * up, Math.sin(t * (o.fight ? 6 : 2.4) + seed + k * 2) * k * 6); });
  const f = o.flash > 0 ? 1 : 0;
  if (u.mFur.emissive.r !== f * 0.7) { u.mFur.emissive.setRGB(f * 0.7, 0, 0); u.mBase.emissive.setRGB(f * 0.7, 0, 0); }
}

// ---------- Tiere ----------
const BEAST_LOOK = {
  fuchs: { len: 17, h: 7, col: '#c8641e', leg: '#3a2418', snout: 1, ears: 'spitz', tail: 'buschig', tip: '#fff', scale: 1.05 },
  hund: { len: 20, h: 9, col: '#8a6a44', leg: '#6a4e30', snout: 0.8, ears: 'haengend', tail: 'duenn', scale: 1.25 },
  meute: { len: 22, h: 10, col: '#3a2e26', leg: '#2a201a', snout: 0.9, ears: 'spitz', tail: 'duenn', scale: 1.6 },
  dachs: { len: 18, h: 6.5, col: '#5a5a5a', leg: '#222', snout: 0.7, ears: 'klein', tail: 'kurz', head: '#eee', scale: 1.15 },
  ratte: { len: 7, h: 3.4, col: '#6a625a', leg: '#6a625a', snout: 0.8, ears: 'klein', tail: 'lang', scale: 1 },
};
function makeBeastModel(kind) {
  const L = BEAST_LOOK[kind], g = geos(), root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const mB = new THREE.MeshLambertMaterial({ color: L.col }), mL = sharedMat(L.leg), mH = L.head ? sharedMat(L.head) : mB;
  const hy = L.h * 1.7;
  const torso = mk(g.sr, mB, L.len * 0.75, L.h, L.h * 1.05, 0, hy, 0, body); torso.castShadow = true;
  const head = new THREE.Group(); head.position.set(L.len * 0.8, hy + L.h * 0.6, 0); body.add(head);
  mk(g.s, mH, L.h * 0.85, L.h * 0.8, L.h * 0.85, 0, 0, 0, head);
  const sn = mk(g.cone, mH, L.h * 0.45, L.h * 1.3 * L.snout, L.h * 0.45, L.h * 1.1, -L.h * 0.2, 0, head); sn.rotation.z = -Math.PI / 2;
  mk(g.lo, sharedMat('#111'), L.h * 0.18, L.h * 0.18, L.h * 0.18, L.h * 1.75 * L.snout + L.h * 0.3, -L.h * 0.2, 0, head);
  if (kind === 'dachs') for (const s of [-1, 1]) mk(g.box, sharedMat('#111'), L.h * 1.6, L.h * 0.3, L.h * 0.25, L.h * 0.3, L.h * 0.35, s * L.h * 0.35, head);
  const eyeM = sharedMat(kind === 'meute' ? '#ffcc33' : '#221');
  for (const s of [-1, 1]) {
    mk(g.lo, eyeM, L.h * 0.14, L.h * 0.14, L.h * 0.14, L.h * 0.62, L.h * 0.3, s * L.h * 0.42, head);
    if (L.ears === 'spitz') mk(g.cone, mB, L.h * 0.3, L.h * 0.8, L.h * 0.3, -L.h * 0.1, L.h * 0.9, s * L.h * 0.45, head).rotation.x = s * 0.3;
    else if (L.ears === 'haengend') mk(g.lo, mL, L.h * 0.25, L.h * 0.6, L.h * 0.2, -L.h * 0.1, L.h * 0.1, s * L.h * 0.85, head);
    else mk(g.lo, mB, L.h * 0.2, L.h * 0.2, L.h * 0.2, -L.h * 0.2, L.h * 0.7, s * L.h * 0.5, head);
  }
  const legs = [];
  for (const [lx, lz] of [[0.5, 0.55], [0.5, -0.55], [-0.5, 0.55], [-0.5, -0.55]]) {
    const pv = new THREE.Group(); pv.position.set(lx * L.len, hy - L.h * 0.3, lz * L.h); body.add(pv);
    mk(g.cyl, mL, L.h * 0.28, hy, L.h * 0.28, 0, -hy / 2, 0, pv); legs.push(pv);
  }
  const tail = [];
  const n = L.tail === 'kurz' ? 2 : 6;
  for (let i = 0; i < n; i++) {
    let r = L.tail === 'buschig' ? L.h * (0.32 + Math.sin(i / (n - 1) * Math.PI) * 0.18) : L.h * 0.22 * (1 - i * 0.1);
    if (L.tail === 'lang') r = L.h * 0.12;
    const m = mk(g.lo, L.tip && i === n - 1 ? sharedMat(L.tip) : mB, r, r, r, 0, 0, 0, body); tail.push(m);
  }
  root.scale.setScalar(L.scale);
  root.userData = { body, head, legs, tail, mats: [mB], mFur: mB, mBase: mB, beast: L };
  return root;
}
function animateBeast(m, e, t) {
  const u = m.userData, L = u.beast, ph = e.phase || 0, mv = e.moving ? 1 : 0;
  u.body.position.y = Math.abs(Math.sin(ph)) * 1.2 * mv;
  const offs = [0, Math.PI, Math.PI, 0];
  u.legs.forEach((l, i) => l.rotation.z = Math.sin(ph + offs[i]) * 0.7 * mv);
  const hy = L.h * 1.7, n = u.tail.length, seg = L.tail === 'lang' ? L.len * 0.25 : L.h * 0.55;
  u.tail.forEach((s, i) => s.position.set(-L.len * 0.7 - i * seg, hy + (L.tail === 'buschig' ? i * 0.4 : i * 0.6), Math.sin(t * 5 + i) * i * 0.8));
  const f = e.flash > 0 ? 0.7 : 0; u.mFur.emissive.setRGB(f, 0, 0);
}

// ---------- Beute ----------
function makePreyModel(k) {
  const T = PREY_T[k], g = geos(), root = new THREE.Group(), s = T.sz / 5, m = sharedMat(T.col);
  const parts = {};
  if (k === 'amsel') {
    mk(g.s, m, 5, 3.8, 3.4, 0, 5, 0, root); mk(g.s, m, 2.6, 2.6, 2.6, 4.5, 7, 0, root);
    const beak = mk(g.cone, sharedMat('#f0a020'), 0.8, 2.6, 0.8, 7.2, 7, 0, root); beak.rotation.z = -Math.PI / 2;
    parts.w = [mk(g.box, m, 5, 0.5, 6, -1, 6.5, 3.5, root), mk(g.box, m, 5, 0.5, 6, -1, 6.5, -3.5, root)];
    mk(g.box, m, 5, 0.6, 3, -6, 5.5, 0, root);
  } else if (k === 'fisch') {
    mk(g.sr, sharedMat('#a8b8c8'), 7, 2.6, 1.8, 0, 0, 0, root);
    const fin = mk(g.cone, sharedMat('#8898a8'), 2.2, 3, 0.4, -7.5, 0, 0, root); fin.rotation.z = Math.PI / 2;
  } else {
    const h = k === 'kaninchen' ? 6 : k === 'frosch' ? 2.4 : 3.2;
    mk(g.s, m, 5, h, k === 'frosch' ? 4.2 : h, 0, h, 0, root);
    mk(g.s, m, h * 0.7, h * 0.7, h * 0.7, 4.8, h * 1.3, 0, root);
    if (k === 'kaninchen') { for (const z of [-1, 1]) mk(g.lo, m, 1, 4.5, 1.2, 4, h * 2.2, z * 1.4, root); mk(g.lo, sharedMat('#eee'), 1.8, 1.8, 1.8, -5, h * 1.2, 0, root); }
    else if (k === 'eichhoernchen') { const tl = mk(g.s, m, 3, 6, 2.6, -5.5, h * 2.2, 0, root); tl.rotation.z = 0.4; }
    else if (k !== 'frosch') { const tl = mk(g.cyl, m, 0.35, 8, 0.35, -8, h * 0.8, 0, root); tl.rotation.z = Math.PI / 2 + 0.2; for (const z of [-1, 1]) mk(g.lo, m, 1.1, 1.1, 0.5, 4.2, h * 1.9, z * 1.3, root); }
    if (k === 'frosch') for (const z of [-1, 1]) mk(g.lo, sharedMat('#3a6a2a'), 3, 1, 1.2, -3, 1, z * 3.5, root);
    mk(g.lo, sharedMat('#111'), 0.45, 0.45, 0.45, 6.4, h * 1.5, 0.9, root); mk(g.lo, sharedMat('#111'), 0.45, 0.45, 0.45, 6.4, h * 1.5, -0.9, root);
  }
  root.scale.setScalar(s);
  root.userData = parts;
  return root;
}

// ---------- Auto ----------
function makeCarModel(col) {
  const g = geos(), root = new THREE.Group();
  const b = mk(g.box, new THREE.MeshLambertMaterial({ color: col }), 76, 16, 34, 0, 14, 0, root); b.castShadow = true;
  mk(g.box, sharedMat('#2a3440'), 38, 13, 30, -4, 28, 0, root);
  for (const [x, z] of [[24, 16], [24, -16], [-24, 16], [-24, -16]]) { const w = mk(g.cyl, sharedMat('#151515'), 7, 5, 7, x, 7, z, root); w.rotation.x = Math.PI / 2; }
  mk(g.box, sharedMat('#fff6c0'), 2, 4, 8, 38, 16, 10, root); mk(g.box, sharedMat('#fff6c0'), 2, 4, 8, 38, 16, -10, root);
  return root;
}
function disposeModel(m) {
  m.traverse(o => { if (o.isMesh && o.material && !Object.values(MAT).includes(o.material)) o.material.dispose(); });
}
