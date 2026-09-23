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

// ---------- Katze (mit Skelett: Wirbelsäule, Hals, Kopf, Beine mit Knien, Schwanz) ----------
let _whiskerMat = null;
const whiskerMat = () => _whiskerMat || (_whiskerMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 }));
function makeCatModel(look, opts = {}) {
  const g = geos(), root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const mFur = new THREE.MeshLambertMaterial({ map: furTexture(look) });
  const mBase = new THREE.MeshLambertMaterial({ color: look.base });
  const mWhite = new THREE.MeshLambertMaterial({ color: 0xf4f1ea });
  const mStripe = look.stripe ? new THREE.MeshLambertMaterial({ color: look.stripe }) : mBase;
  const W_ = look.white > 0.3, mLeg = W_ ? mWhite : mBase, mFace = look.white > 0.35 ? mWhite : mBase;
  const mats = [mFur, mBase, mWhite, mStripe];
  const spine = new THREE.Group(); spine.position.set(0, 13, 0); body.add(spine);
  const chest = mk(g.sr, mFur, 8.2, 7.2, 7.4, 4.5, 0.6, 0, spine); chest.castShadow = true;
  const hips = mk(g.sr, mFur, 8.4, 6.6, 7, -4.5, 0, 0, spine); hips.castShadow = true;
  if (W_) mk(g.s, mWhite, 4.4, 5, 5, 8.6, -1.6, 0, spine);
  if (look.long) { mk(g.lo, mBase, 6, 7.8, 8.6, 7, 1.5, 0, spine); mk(g.lo, mBase, 6.5, 7.2, 8.2, -4, 0.8, 0, spine); }
  const neck = new THREE.Group(); neck.position.set(10, 2.5, 0); spine.add(neck);
  mk(g.lo, mBase, 3.6, 4.6, 4.2, 0.5, 1.6, 0, neck);
  if (look.long) mk(g.lo, mBase, 4.4, 5.6, 6.4, 0, 1, 0, neck);
  const head = new THREE.Group(); head.position.set(3.2, 4.8, 0); neck.add(head);
  const skull = mk(g.sr, mFur, 5.6, 5.1, 6.0, 0, 0, 0, head); skull.castShadow = true;
  for (const sd of [-1, 1]) mk(g.lo, mFace, 3.1, 2.8, 2.9, 1.7, -1.5, sd * 2.5, head);
  mk(g.s, mFace, 2.7, 2.2, 3.1, 4.3, -1.7, 0, head);
  mk(g.lo, sharedMat('#d97a8a'), 0.85, 0.65, 1.05, 6.8, -0.9, 0, head);
  const eyeM = new THREE.MeshBasicMaterial({ color: look.eye }); mats.push(eyeM);
  const eyes = [];
  for (const sd of [-1, 1]) {
    const eg = new THREE.Group(); eg.position.set(4.0, 1.1, sd * 2.3); head.add(eg);
    mk(g.lo, eyeM, 1.15, 1.25, 1.0, 0, 0, 0, eg);
    mk(g.lo, sharedMat('#0a0a0a'), 0.45, 1.05, 0.5, 0.75, 0, sd * 0.1, eg);
    mk(g.lo, sharedMat('#ffffff'), 0.28, 0.28, 0.28, 0.95, 0.45, sd * 0.25, eg);
    eyes.push(eg);
  }
  const ears = [];
  for (const sd of [-1, 1]) {
    const ep = new THREE.Group(); ep.position.set(-0.8, 3.9, sd * 2.8); head.add(ep);
    mk(g.cone, mBase, 2.5, 4.8, 2.2, 0, 2.2, 0, ep);
    mk(g.cone, sharedMat('#e8a0a0'), 1.4, 3.2, 1.0, 0.7, 2.0, 0, ep);
    ep.userData.s = sd; ears.push(ep);
  }
  const wv = []; for (const sd of [-1, 1]) for (let i = -1; i <= 1; i++) wv.push(5.6, -1.7, sd * 1.6, 7.8, -1.4 + i * 0.9, sd * (7.5 + Math.abs(i)));
  head.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(wv, 3)), whiskerMat()));
  const legs = [];
  for (const [lx, lz, front] of [[7, 3.6, 1], [7, -3.6, 1], [-7, 3.9, 0], [-7, -3.9, 0]]) {
    const up = new THREE.Group(); up.position.set(lx, -1, lz); spine.add(up);
    mk(g.cyl, front ? mBase : mFur, front ? 1.8 : 2.7, 6.6, front ? 1.8 : 2.5, 0, -3.1, 0, up);
    const knee = new THREE.Group(); knee.position.set(0, -6.3, 0); up.add(knee);
    mk(g.cyl, mLeg, 1.55, 5.9, 1.55, 0, -2.9, 0, knee);
    mk(g.lo, mLeg, 2.2, 1.2, 2.4, 0.7, -5.9, 0, knee);
    legs.push({ up, knee, front });
  }
  const tail = [];
  for (let i = 0; i < 14; i++) {
    const r = (look.long ? 2.8 : 2.1) * (1 - i * 0.04);
    const mm = i >= 12 && look.white > 0.55 ? mWhite : (look.stripe && i % 3 === 2 ? mStripe : mBase);
    const tm = mk(g.lo, mm, r, r, r, -11 - i * 2, 1.5, 0, spine); tm.userData.r = r; tail.push(tm);
  }
  if (opts.star) for (const m of mats.concat([sharedMat('#111')])) { m.transparent = true; m.opacity = 0.55; if (m.emissive) m.emissive.set('#5a78c8'); }
  if (opts.collar) mk(new THREE.TorusGeometry(1, 0.25, 6, 16), sharedMat(opts.collar), 4.2, 4.2, 4.2, 0.5, 1.2, 0, neck).rotation.set(0, Math.PI / 2, 0.5);
  root.userData = { body, spine, neck, head, legs, tail, eyes, ears, chest, hips, mats, mFur, mBase, pose: null, st: { blinkT: rand(1, 4), earT: rand(1, 5), earI: 0, still: 0, groomT: 0 } };
  return root;
}
// Zielhaltung je Zustand; die echte Haltung gleitet weich dorthin
function catPoseTarget(state, ph, t, o, st) {
  const T = { y: 0, pitch: 0, neck: 0, headP: 0, headY: 0, up: [0, 0, 0, 0], kn: [0, 0, 0, 0], tLift: 1, tCurl: 0, tSway: 0.35, tFreq: 2.2, fluff: 1, ear: 0 };
  const gait = (A, K, offs) => { for (let i = 0; i < 4; i++) { const p = ph + offs[i], lift = Math.max(0, Math.cos(p)); T.up[i] += Math.sin(p) * A; T.kn[i] += (i < 2 ? -1 : 1) * lift * K; } };
  switch (state) {
    case 'walk': gait(0.55, 0.8, [0, Math.PI, Math.PI, 0]); T.y = Math.abs(Math.sin(ph)) * 0.6; T.headP = Math.sin(ph * 2) * 0.04; T.tLift = 0.9; break;
    case 'run': gait(1.0, 1.3, [0, 0.5, Math.PI, Math.PI + 0.5]); T.pitch = Math.sin(ph) * 0.16; T.y = 1 + Math.sin(ph) * 1.8; T.tLift = 0.25; T.tSway = 0.15; T.ear = 0.3; T.neck = -0.1; break;
    case 'sneak':
      T.y = -3.2; T.up = [0.55, 0.55, -0.7, -0.7]; T.kn = [-1.05, -1.05, 1.2, 1.2]; gait(0.28, 0.4, [0, Math.PI, Math.PI, 0]);
      T.neck = -0.35; T.headP = -0.1; T.tLift = 0.05; T.tSway = 0.12; T.tFreq = 7; break;
    case 'pounce': {
      const p = o.lungeP;
      T.y = Math.sin(p * Math.PI) * 10; T.pitch = lerp(0.35, -0.3, p); T.up = [1.25, 1.1, -1.1, -1.2]; T.kn = [-0.2, -0.3, 0.3, 0.2]; T.tLift = 0.2; T.tSway = 0; T.ear = 0.8; break;
    }
    case 'swipe': T.pitch = 0.45; T.y = 2; T.up = [1.7 + Math.sin(t * 28) * 0.35, 0.5, -0.3, -0.3]; T.kn = [-0.4, -0.6, 0.6, 0.6]; T.ear = 1; T.tLift = 1.6; T.fluff = 1.25; break;
    case 'stance': T.y = 1.2; T.pitch = -0.08; T.up = [0.1, 0.1, -0.15, -0.15]; T.fluff = 1.3; T.tLift = 1.9; T.tCurl = 0.25; T.tSway = 0.2; T.tFreq = 6; T.ear = 1; T.neck = -0.15; break;
    case 'sit':
      T.pitch = 0.55; T.y = -2.8; T.up = [-0.55, -0.55, 1.45, 1.45]; T.kn = [0, 0, -2.4, -2.4]; T.neck = -0.35; T.tLift = -0.2; T.tCurl = 1; T.tSway = 0.08;
      T.headY = Math.sin(t * 0.35 + st.seed) * 0.5;
      if (st.groomT > 0) { T.headY = 0.35; T.headP = 0.55; T.up[0] = 0.4; T.kn[0] = -2.1; T.neck = -0.1; }
      break;
    case 'lie': T.y = -7; T.up = [1.4, 1.4, 1.5, 1.5]; T.kn = [-0.2, -0.2, -1.6, -1.6]; T.headP = 0.1; T.headY = Math.sin(t * 0.3 + st.seed) * 0.4; T.tLift = -0.3; T.tCurl = 0.7; T.tSway = 0.1; break;
    case 'sleep': T.y = -8.5; T.up = [1.5, 1.5, 1.6, 1.6]; T.kn = [-0.3, -0.3, -1.8, -1.8]; T.headY = 1.1; T.headP = 0.55; T.neck = 0.1; T.tLift = -0.4; T.tCurl = 1.4; T.tSway = 0.02; T.ear = 0.3; break;
    default:
      T.headY = Math.sin(t * 0.5 + st.seed) * 0.45; T.headP = Math.sin(t * 0.37 + st.seed) * 0.08; T.tSway = 0.3; T.tFreq = 1.6;
  }
  return T;
}
function animateCat(m, e, t, dt, o) {
  const u = m.userData, st = u.st;
  if (st.seed === undefined) st.seed = (e.ox || Math.random() * 10) * 0.37;
  const spd = o.speed || 0;
  let state;
  if (o.sleep) state = 'sleep'; else if (o.lungeP !== undefined) state = 'pounce'; else if (o.wind) state = 'swipe';
  else if (spd > 10) state = o.sneak ? 'sneak' : spd > 205 ? 'run' : 'walk';
  else if (o.fight) state = 'stance'; else if (o.sneak) state = 'sneak'; else state = 'idle';
  if (state === 'idle') st.still += dt; else st.still = 0;
  if (state === 'idle' && st.still > (o.player ? 6 : 2.5)) state = st.still > 16 && !o.player ? 'lie' : 'sit';
  if (state === 'sit') { st.groomT -= dt; if (st.groomT < -6 && Math.random() < dt * 0.3) st.groomT = rand(2, 4); } else st.groomT = 0;
  const T = catPoseTarget(state, e.phase || 0, t, o, st);
  if (!u.pose) u.pose = JSON.parse(JSON.stringify(T));
  const P = u.pose, k = 1 - Math.exp(-dt * (state === 'run' || state === 'walk' || state === 'pounce' ? 22 : 9));
  for (const key in T) { if (Array.isArray(T[key])) for (let i = 0; i < 4; i++) P[key][i] = lerp(P[key][i], T[key][i], k); else P[key] = lerp(P[key], T[key], k); }
  const breath = 1 + Math.sin(t * (state === 'sleep' ? 1.6 : 2.6) + st.seed) * (state === 'sleep' ? 0.05 : 0.022);
  u.body.position.y = P.y; u.spine.rotation.z = P.pitch + (o.flash > 0 ? 0.25 : 0);
  u.neck.rotation.z = P.neck; u.head.rotation.set(0, P.headY, -P.headP);
  u.chest.scale.set(8.2 * P.fluff, 7.2 * P.fluff * breath, 7.4 * P.fluff * breath); u.hips.scale.set(8.4 * P.fluff, 6.6 * P.fluff, 7 * P.fluff);
  u.legs.forEach((l, i) => { l.up.rotation.z = P.up[i]; l.knee.rotation.z = P.kn[i]; });
  const n = u.tail.length, sway = Math.sin(t * P.tFreq + st.seed);
  u.tail.forEach((s, i) => {
    const q = i / (n - 1), ca = P.tCurl * q * 2.3 + sway * P.tSway * q * 0.9, reach = q * 26;
    s.position.set(-11 - Math.cos(ca) * reach * 0.62, 1.5 + Math.sin(q * 1.9) * 9 * P.tLift - (P.tCurl > 0.5 ? q * 5 : 0), Math.sin(ca) * reach * 0.62);
    s.scale.setScalar(s.userData.r * (1 + (P.fluff - 1) * 1.6));
  });
  st.blinkT -= dt; const closed = state === 'sleep' || st.blinkT < 0.12;
  if (st.blinkT < 0) st.blinkT = rand(2, 5);
  for (const eg of u.eyes) eg.scale.y = closed ? 0.12 : 1;
  st.earT -= dt; if (st.earT < 0) { st.earT = rand(1.5, 6); st.earI = 0.25; } st.earI = Math.max(0, st.earI - dt);
  u.ears.forEach((ep, i) => { const tw = i === 0 && st.earI > 0 ? Math.sin(st.earI * 60) * 0.4 : 0; ep.rotation.set(ep.userData.s * (0.3 + P.ear * 0.7), 0, -P.ear * 0.5 + tw); });
  const f = o.flash > 0 ? 1 : 0;
  if (u.mFur.emissive.r !== f * 0.45) { u.mFur.emissive.setRGB(f * 0.45, f * 0.05, 0); u.mBase.emissive.setRGB(f * 0.45, f * 0.05, 0); }
  return state;
}

// ---------- Tiere ----------
const BEAST_LOOK = {
  fuchs: { len: 17, h: 7, col: '#c8641e', leg: '#3a2418', snout: 1, ears: 'spitz', tail: 'buschig', tip: '#fff', scale: 1.05 },
  hund: { len: 20, h: 9, col: '#8a6a44', leg: '#6a4e30', snout: 0.8, ears: 'haengend', tail: 'duenn', scale: 1.25 },
  meute: { len: 22, h: 10, col: '#3a2e26', leg: '#2a201a', snout: 0.9, ears: 'spitz', tail: 'duenn', scale: 1.6 },
  dachs: { len: 18, h: 6.5, col: '#5a5a5a', leg: '#222', snout: 0.7, ears: 'klein', tail: 'kurz', head: '#eee', scale: 1.15 },
  ratte: { len: 7, h: 3.4, col: '#6a625a', leg: '#6a625a', snout: 0.8, ears: 'klein', tail: 'lang', scale: 1 },
  scharfzahn: { len: 23, h: 9, col: '#b8925a', leg: '#9a7440', snout: 0.55, ears: 'klein', tail: 'lang', scale: 1.8 },
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
  const run = (e.speed || 0) > 160 && mv;
  u.body.position.y = (run ? 1.5 + Math.sin(ph) * 2 : Math.abs(Math.sin(ph)) * 1.2) * mv;
  u.body.rotation.z = run ? Math.sin(ph) * 0.12 : 0;
  u.head.rotation.z = Math.sin(ph * 2) * 0.08 * mv + (e.wind > 0 ? 0.35 : 0);
  const offs = run ? [0, 0.5, Math.PI, Math.PI + 0.5] : [0, Math.PI, Math.PI, 0];
  u.legs.forEach((l, i) => l.rotation.z = Math.sin(ph + offs[i]) * (run ? 0.95 : 0.7) * mv);
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
function makeBaggerModel() {
  const g = geos(), root = new THREE.Group(), y = sharedMat('#e8b020');
  const b = mk(g.box, y, 70, 28, 44, 0, 26, 0, root); b.castShadow = true;
  mk(g.box, sharedMat('#2a3440'), 30, 26, 36, -12, 52, 0, root);
  for (const z of [-24, 24]) mk(g.box, sharedMat('#1a1a1a'), 80, 16, 12, 0, 8, z, root);
  const arm = new THREE.Group(); arm.position.set(34, 34, 0); root.add(arm);
  mk(g.box, y, 46, 8, 10, 22, 0, 0, arm);
  mk(g.box, sharedMat('#6a6a6a'), 10, 26, 46, 46, -12, 0, arm);
  root.userData = { arm }; root.scale.setScalar(1.3);
  return root;
}
function disposeModel(m) {
  m.traverse(o => { if (o.isMesh && o.material && !Object.values(MAT).includes(o.material) && o.material !== _whiskerMat) o.material.dispose(); });
}
