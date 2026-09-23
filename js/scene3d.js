'use strict';
// ===== 3D-Welt mit Three.js =====
let R3, SC, CAMERA, SUN, HEMI, PLIGHT, FIRELIGHT;
const CAMS = { yaw: -Math.PI / 2, pitch: 0.34, dist: 105, drag: false, dragT: 9, x: 0, y: 0, z: 0, snap: true };
const W3 = { inst: {}, models: new Map(), frame: 0, season: -1, herbState: '', pileN: -1 };
const _o = new THREE.Object3D(), _c = new THREE.Color();
const srgb = (r, g, b) => _c.setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace);

function init3D() {
  R3 = new THREE.WebGLRenderer({ canvas: $('game'), antialias: true });
  R3.setPixelRatio(Math.min(1.75, devicePixelRatio || 1));
  R3.shadowMap.enabled = true; R3.shadowMap.type = THREE.PCFSoftShadowMap;
  SC = new THREE.Scene();
  SC.background = new THREE.Color(0xa8cce8); SC.fog = new THREE.Fog(0xa8cce8, 600, 2100);
  CAMERA = new THREE.PerspectiveCamera(58, 1, 1, 5000);
  HEMI = new THREE.HemisphereLight(0xdfefff, 0x5a4a30, 1.2); SC.add(HEMI);
  SUN = new THREE.DirectionalLight(0xfff0d8, 2.2); SUN.castShadow = true;
  SUN.shadow.mapSize.set(2048, 2048);
  const sc = SUN.shadow.camera; sc.left = -420; sc.right = 420; sc.top = 420; sc.bottom = -420; sc.near = 10; sc.far = 1800;
  SUN.shadow.bias = -0.0006; SC.add(SUN); SC.add(SUN.target);
  PLIGHT = new THREE.PointLight(0xa8bcff, 0, 420, 0); SC.add(PLIGHT);
  FIRELIGHT = new THREE.PointLight(0xff8a30, 0, 900, 0); SC.add(FIRELIGHT);
  buildTerrain3D(); buildWater(); buildRoad(); buildTrees(); buildBushes(); buildRocks(); buildHouses(); buildCamps(); buildHerbs(); buildSky(); buildWeather(); buildFire(); buildMarkers();
  resize3D();
}
function resize3D() { if (!R3) return; R3.setSize(innerWidth, innerHeight, false); CAMERA.aspect = innerWidth / innerHeight; CAMERA.updateProjectionMatrix(); }

// ---------- Boden ----------
function detailTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  g.fillStyle = '#e8e8e8'; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 1400; i++) { const v = 180 + Math.random() * 75 | 0; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(Math.random() * 128, Math.random() * 128, 1 + Math.random() * 2, 2 + Math.random() * 4); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
function buildTerrain3D() {
  const geo = new THREE.PlaneGeometry(W, H, 260, 210); geo.rotateX(-Math.PI / 2); geo.translate(W / 2, 0, H / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setY(i, heightAt(pos.getX(i), pos.getZ(i)));
  geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(pos.count * 3), 3));
  geo.computeVertexNormals();
  const tex = detailTexture(); tex.repeat.set(W / 70, H / 70);
  const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true, map: tex }));
  m.receiveShadow = true; SC.add(m); W3.terrain = m;
}
function recolorTerrain(s) {
  const geo = W3.terrain.geometry, pos = geo.attributes.position, col = geo.attributes.color, o = [0, 0, 0];
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    groundColor(x, z, o);
    const special = inRoad(x, z) || inRiver(x, z);
    if (!special) {
      if (s === 3) { o[0] = lerp(o[0], 236, 0.6); o[1] = lerp(o[1], 240, 0.6); o[2] = lerp(o[2], 246, 0.6); }
      else if (s === 2) { o[0] = lerp(o[0], 150, 0.22); o[1] = lerp(o[1], 110, 0.15); o[2] = lerp(o[2], 40, 0.1); }
      else if (s === 0) { o[1] = lerp(o[1], 170, 0.1); }
    }
    srgb(o[0], o[1], o[2]); col.setXYZ(i, _c.r, _c.g, _c.b);
  }
  col.needsUpdate = true;
}
function buildWater() {
  const v = [], idx = [];
  let n = 0;
  for (let y = -20; y <= 3470; y += 20) { const yy = Math.min(y, 3440), cx = riverX(yy), wl = waterLevel(yy); v.push(cx - 66, wl, y, cx + 66, wl, y); if (n) idx.push(n * 2 - 2, n * 2, n * 2 - 1, n * 2 - 1, n * 2, n * 2 + 1); n++; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); geo.setIndex(idx); geo.computeVertexNormals();
  const mat = new THREE.MeshLambertMaterial({ color: 0x3f7fb8, transparent: true, opacity: 0.8 });
  W3.water = new THREE.Mesh(geo, mat); SC.add(W3.water);
  const gorge = new THREE.Mesh(new THREE.PlaneGeometry(140, 430).rotateX(-Math.PI / 2), mat); gorge.position.set(3430, -58, 2755); SC.add(gorge);
}
function roadTexture() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 128; const g = c.getContext('2d');
  g.fillStyle = '#3c3c40'; g.fillRect(0, 0, 64, 128);
  for (let i = 0; i < 300; i++) { g.fillStyle = Math.random() < .5 ? 'rgba(0,0,0,.15)' : 'rgba(255,255,255,.06)'; g.fillRect(Math.random() * 64, Math.random() * 128, 2, 2); }
  g.fillStyle = '#6a665e'; g.fillRect(0, 0, 4, 128); g.fillRect(60, 0, 4, 128);
  g.fillStyle = '#ddd8b8'; g.fillRect(30, 0, 4, 64);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; return t;
}
function buildRoad() {
  const v = [], uv = [], idx = []; let n = 0, len = 0, lx = null, ly = null;
  const push = (x, y, nx, ny) => {
    if (lx !== null) len += dist(x, y, lx, ly); lx = x; ly = y;
    const h = roadLevel(x, y) + 0.6;
    v.push(x - nx * 46, h, y - ny * 46, x + nx * 46, h, y + ny * 46); uv.push(0, len / 110, 1, len / 110);
    if (n) idx.push(n * 2 - 2, n * 2 - 1, n * 2, n * 2 - 1, n * 2 + 1, n * 2); n++;
  };
  for (let x = -20; x <= ROAD_X1; x += 20) { const d = (roadY(x + 1) - roadY(x - 1)) / 2, l = Math.hypot(1, d); push(x, roadY(x), -d / l, 1 / l); }
  for (let y = roadY(ROAD_X1) - 40; y >= -20; y -= 20) push(ROAD_X1, y, 1, 0);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: roadTexture(), side: THREE.DoubleSide })); m.receiveShadow = true; SC.add(m);
}

// ---------- Bäume ----------
const treeH = t => t.tr > 20 ? 100 : (t.k === 'pine' ? 26 : 34 + t.c * 24);
function inst(geo, n, shadow = true, mat) {
  const m = new THREE.InstancedMesh(geo, mat || new THREE.MeshLambertMaterial({ color: 0xffffff }), Math.max(1, n));
  m.count = n; m.frustumCulled = false; m.castShadow = shadow; m.receiveShadow = true; SC.add(m); return m;
}
function buildTrees() {
  const T = OB.trees, dec = T.filter(t => t.k !== 'pine'), pin = T.filter(t => t.k === 'pine');
  const trunk = inst(new THREE.CylinderGeometry(0.65, 1, 1, 7).translate(0, 0.5, 0), T.length);
  T.forEach((t, i) => {
    const g = heightAt(t.x, t.y), h = treeH(t) + (t.k === 'pine' ? 0 : 10);
    _o.position.set(t.x, g - 2, t.y); _o.rotation.set(0, t.c * 6, 0); _o.scale.set(t.tr, h, t.tr); _o.updateMatrix(); trunk.setMatrixAt(i, _o.matrix);
    trunk.setColorAt(i, t.k === 'birch' ? _c.set('#ddd8cc') : _c.set(t.k === 'willow' ? '#5a4a36' : '#5e4630'));
  });
  const blob = new THREE.IcosahedronGeometry(1, 1);
  const cA = inst(blob, dec.length), cB = inst(blob, dec.length), cC = inst(blob, dec.length);
  const cone = new THREE.ConeGeometry(1, 1, 8).translate(0, 0.5, 0), pL = inst(cone, pin.length * 3);
  W3.inst.trees = { dec, pin, cA, cB, cC, pL };
  placeCanopies(1);
}
function placeCanopies(s) {
  const { dec, pin, cA, cB, cC, pL } = W3.inst.trees;
  const bare = s === 3;
  dec.forEach((t, i) => {
    const g = heightAt(t.x, t.y), top = g + treeH(t) + 10, r = t.r * (bare && t.k !== 'willow' ? 0.55 : 1);
    const set = (m, dx, dy, dz, k) => { _o.position.set(t.x + dx * r, top + dy * r, t.y + dz * r); _o.rotation.set(t.c, t.c * 4, 0); _o.scale.set(r * k, r * k * (t.k === 'willow' ? 1 : 0.72), r * k); _o.updateMatrix(); m.setMatrixAt(i, _o.matrix); };
    set(cA, 0, 0.1, 0, 1); set(cB, 0.45, 0.35, -0.3, 0.7); set(cC, -0.4, 0.25, 0.35, 0.65);
    let [c1, c2] = SEASON_TREE[s];
    if (t.k === 'willow') { c1 = s === 3 ? '#a8b0a0' : '#6a9a44'; c2 = s === 3 ? '#c8d0c8' : '#8ab85a'; }
    if (t.k === 'birch' && s < 2) { c1 = '#7ab854'; c2 = '#9cd070'; }
    if (s === 2 && t.c > 0.6) { c1 = '#b8482a'; c2 = '#d8703a'; }
    const v = 0.85 + t.c * 0.3;
    cA.setColorAt(i, _c.set(c1).multiplyScalar(v)); cB.setColorAt(i, _c.set(c2).multiplyScalar(v)); cC.setColorAt(i, _c.set(c1).multiplyScalar(v * 1.05));
  });
  pin.forEach((t, i) => {
    const g = heightAt(t.x, t.y);
    for (let k = 0; k < 3; k++) {
      _o.position.set(t.x, g + 16 + k * 24, t.y); _o.rotation.set(0, t.c * 5 + k, 0); const r = t.r * (1 - k * 0.24); _o.scale.set(r, 52 - k * 8, r); _o.updateMatrix();
      pL.setMatrixAt(i * 3 + k, _o.matrix); pL.setColorAt(i * 3 + k, _c.set(s === 3 && k === 2 ? '#dfe8ea' : ['#1f4326', '#28552e', '#336638'][k]).multiplyScalar(0.9 + t.c * 0.2));
    }
  });
  for (const m of [cA, cB, cC, pL]) { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; }
}
const SEASON_TREE = [['#5fa83e', '#7cc454'], ['#2f7a2a', '#3f9434'], ['#c7702a', '#d9a23a'], ['#9aa0a0', '#dfe6ea']];

// ---------- Büsche ----------
function buildBushes() {
  const kinds = { wall: [], fern: [], bramble: [], heather: [], reed: [], garden: [] };
  for (const b of OB.bushes) (kinds[b.k] || kinds.fern).push(b);
  const ico1 = new THREE.IcosahedronGeometry(1, 1), ico0 = new THREE.IcosahedronGeometry(1, 0), reed = new THREE.ConeGeometry(1, 1, 5).translate(0, 0.5, 0);
  W3.inst.bush = {};
  for (const k in kinds) {
    const arr = kinds[k], geo = k === 'reed' ? reed : (k === 'wall' || k === 'bramble' || k === 'garden') ? ico1 : ico0;
    const m = inst(geo, arr.length, k === 'wall' || k === 'bramble');
    arr.forEach((b, i) => {
      const g = heightAt(b.x, b.y);
      const sc = { wall: [1.05, 0.95, 1.05], fern: [1, 0.5, 1], bramble: [1, 0.7, 1], heather: [0.9, 0.42, 0.9], garden: [0.9, 0.8, 0.9] }[k];
      if (k === 'reed') { _o.position.set(b.x, g - 2, b.y); _o.scale.set(b.r * 0.45, 26 + (b.x % 10), b.r * 0.45); }
      else { _o.position.set(b.x, g + b.r * sc[1] * 0.45, b.y); _o.scale.set(b.r * sc[0], b.r * sc[1], b.r * sc[2]); }
      _o.rotation.set(0, (b.x * 7 + b.y) % 6, 0); _o.updateMatrix(); m.setMatrixAt(i, _o.matrix);
    });
    W3.inst.bush[k] = { m, arr };
  }
}
function colorBushes(s) {
  const cols = { wall: s === 3 ? '#56665a' : '#2d4a26', fern: s === 2 ? '#9a7a2a' : s === 3 ? '#8a9488' : '#3f8a34', bramble: '#2f5228', heather: s === 3 ? '#9a90a0' : s === 1 ? '#8a4f90' : '#6a5a6e', reed: s === 3 ? '#b0aa90' : s === 2 ? '#a89a50' : '#7a9a4a', garden: '#3a8a3a' };
  for (const k in W3.inst.bush) {
    const { m, arr } = W3.inst.bush[k];
    arr.forEach((b, i) => m.setColorAt(i, _c.set(k === 'garden' && i % 3 === 0 ? '#e0609a' : cols[k]).multiplyScalar(0.85 + ((b.x * 13) % 10) / 30)));
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }
}

// ---------- Felsen ----------
function buildRocks() {
  const geo = new THREE.DodecahedronGeometry(1, 0), hs = denPos('hochstein');
  const m = inst(geo, OB.rocks.length);
  OB.rocks.forEach((r, i) => {
    const g = heightAt(r.x, r.y), hoch = dist(r.x, r.y, hs.x, hs.y) < 5, big = r.r > 50;
    const hy = hoch ? r.r * 1.5 : big ? r.r * 1.3 : r.r * 0.65;
    _o.position.set(r.x, g + hy * 0.35, r.y); _o.rotation.set((r.x % 3) * 0.3, r.y % 6, (r.y % 5) * 0.1); _o.scale.set(r.r, hy, r.r); _o.updateMatrix();
    m.setMatrixAt(i, _o.matrix); const v = r.col; m.setColorAt(i, srgb(v, v - 4, v - 12));
  });
  const flats = OB.flats.filter(f => f.k === 'slab'), fm = inst(geo, flats.length);
  flats.forEach((f, i) => {
    const g = heightAt(f.x, f.y);
    _o.position.set(f.x, g + (f.big ? 8 : 2), f.y); _o.rotation.set(0, f.x % 6, 0); _o.scale.set(f.r, f.big ? 16 : 7, f.r); _o.updateMatrix();
    fm.setMatrixAt(i, _o.matrix); fm.setColorAt(i, _c.set(f.big ? '#8d8a84' : '#a39e94'));
  });
  // Höhleneingang zum Mondstein
  const cave = new THREE.Mesh(new THREE.CircleGeometry(1, 20), new THREE.MeshBasicMaterial({ color: 0x08060a }));
  cave.scale.set(34, 26, 1); cave.position.set(LM.mondstein.x, heightAt(LM.mondstein.x, LM.mondstein.y - 40) + 18, LM.mondstein.y - 42); SC.add(cave);
}

// ---------- Häuser, Zäune ----------
function buildHouses() {
  const box = new THREE.BoxGeometry(1, 1, 1), roof = new THREE.ConeGeometry(0.7071, 1, 4).rotateY(Math.PI / 4);
  for (const h of OB.houses) {
    const g = heightAt(h.x + h.w / 2, h.y + h.h / 2), cx = h.x + h.w / 2, cz = h.y + h.h / 2, wh = h.barn ? 80 : 62;
    const wall = new THREE.Mesh(box, sharedMat(h.barn ? '#8a3a28' : '#e8dcc4')); wall.scale.set(h.w, wh, h.h); wall.position.set(cx, g + wh / 2, cz); wall.castShadow = wall.receiveShadow = true; SC.add(wall);
    const rf = new THREE.Mesh(roof, sharedMat(h.roof)); rf.scale.set(h.w * 1.12, 48, h.h * 1.12); rf.position.set(cx, g + wh + 24, cz); rf.castShadow = true; SC.add(rf);
    if (!h.barn) {
      for (const dx of [-0.28, 0.28]) { const w = new THREE.Mesh(box, sharedMat('#9cc8e8')); w.scale.set(26, 20, 1); w.position.set(cx + dx * h.w, g + 34, h.y - 0.6); SC.add(w); }
      const d = new THREE.Mesh(box, sharedMat('#6a4a30')); d.scale.set(22, 36, 1); d.position.set(cx, g + 18, h.y + h.h + 0.6); SC.add(d);
    } else { const d = new THREE.Mesh(box, sharedMat('#3a2418')); d.scale.set(50, 56, 1); d.position.set(cx, g + 28, h.y + h.h + 0.6); SC.add(d); }
  }
  const fence = OB.rects.filter(r => r.kind === 'fence'), fm = inst(box, fence.length);
  fence.forEach((r, i) => { const g = heightAt(r.x + r.w / 2, r.y + r.h / 2); _o.position.set(r.x + r.w / 2, g + 13, r.y + r.h / 2); _o.rotation.set(0, 0, 0); _o.scale.set(r.w, 26, r.h); _o.updateMatrix(); fm.setMatrixAt(i, _o.matrix); fm.setColorAt(i, _c.set('#8a6a44')); });
  const bed = new THREE.Mesh(new THREE.TorusGeometry(13, 5, 8, 20), sharedMat('#b04040')); bed.rotation.x = -Math.PI / 2; bed.position.set(2100, heightAt(2100, 3890) + 4, 3890); SC.add(bed);
  const cush = new THREE.Mesh(new THREE.CylinderGeometry(12, 12, 3, 16), sharedMat('#e8d8c0')); cush.position.set(2100, heightAt(2100, 3890) + 2, 3890); SC.add(cush);
}

// ---------- Lager ----------
function buildCamps() {
  const dome = new THREE.SphereGeometry(1, 14, 8, 0, TAU, 0, Math.PI / 2), hole = new THREE.CircleGeometry(1, 14);
  W3.dens = [];
  const addDen = (x, y, r, cx, cy) => {
    const g = heightAt(x, y), m = new THREE.Mesh(dome, new THREE.MeshLambertMaterial({ color: 0x3f6a30 }));
    m.scale.set(r, r * 0.75, r * 0.85); m.position.set(x, g - 2, y); m.castShadow = m.receiveShadow = true; SC.add(m); W3.dens.push(m);
    const a = Math.atan2(cy - y, cx - x), h = new THREE.Mesh(hole, sharedMat('#140e08'));
    h.scale.set(r * 0.35, r * 0.3, 1); h.position.set(x + Math.cos(a) * r * 0.86, g + r * 0.2, y + Math.sin(a) * r * 0.74); h.rotation.y = -a + Math.PI / 2; SC.add(h);
  };
  for (const k of ['heiler', 'krieger', 'schueler', 'kinder', 'aeltest', 'anfuehrer']) { const p = denPos(k); addDen(p.x, p.y, k === 'krieger' ? 48 : k === 'anfuehrer' ? 32 : 40, LM.lager.x, LM.lager.y); }
  for (const cp of OB.camps) if (cp.clan !== 'donner') for (let i = 0; i < 4; i++) { const a = i * 1.6 + 0.4; addDen(cp.lm.x + Math.cos(a) * 110, cp.lm.y + Math.sin(a) * 110, 36, cp.lm.x, cp.lm.y); }
  W3.pile = new THREE.Group(); const p = denPos('pile'); W3.pile.position.set(p.x, heightAt(p.x, p.y), p.y); SC.add(W3.pile);
}
function updatePile() {
  const n = Math.min(14, Math.ceil(G.clan.pile / 3));
  if (n === W3.pileN) return; W3.pileN = n;
  while (W3.pile.children.length) W3.pile.remove(W3.pile.children[0]);
  const ks = ['maus', 'amsel', 'wuehlmaus', 'eichhoernchen', 'kaninchen'];
  for (let i = 0; i < n; i++) { const m = makePreyModel(ks[i % 5]), a = i * 2.4, d = 3 + i * 1.6; m.position.set(Math.cos(a) * d, Math.floor(i / 5) * 4, Math.sin(a) * d); m.rotation.set(0, a, Math.PI / 2 * (i % 2)); W3.pile.add(m); }
}

// ---------- Kräuter ----------
function buildHerbs() {
  const n = OB.herbs.length;
  W3.inst.herbLeaf = inst(new THREE.IcosahedronGeometry(1, 0), n, false);
  W3.inst.herbFlower = inst(new THREE.SphereGeometry(1, 6, 5), n * 3, false);
  W3.rings = [];
  for (let i = 0; i < 6; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(14, 1.2, 6, 24), new THREE.MeshBasicMaterial({ color: 0xffe070, transparent: true, opacity: 0.8 })); r.rotation.x = -Math.PI / 2; r.visible = false; SC.add(r); W3.rings.push(r); }
}
function updateHerbs(t) {
  const st = OB.herbs.map((h, i) => herbAvailable(i) ? 1 : 0).join('');
  if (st !== W3.herbState) {
    W3.herbState = st;
    const L = W3.inst.herbLeaf, F = W3.inst.herbFlower;
    OB.herbs.forEach((h, i) => {
      const on = herbAvailable(i), g = heightAt(h.x, h.y), s = on ? 1 : 0.001;
      _o.position.set(h.x, g + 2, h.y); _o.rotation.set(0, i, 0); _o.scale.set(9 * s, 3 * s, 9 * s); _o.updateMatrix(); L.setMatrixAt(i, _o.matrix); L.setColorAt(i, _c.set('#3d7a2a'));
      for (let k = 0; k < 3; k++) {
        _o.position.set(h.x + Math.cos(k * 2.1 + i) * 4, g + 6 + k, h.y + Math.sin(k * 2.1 + i) * 4); _o.scale.setScalar((h.k === 'spinnweben' ? 3.2 : 2.3) * s); _o.updateMatrix();
        F.setMatrixAt(i * 3 + k, _o.matrix); F.setColorAt(i * 3 + k, _c.set(HERBS[h.k].col));
      }
    });
    for (const m of [L, F]) { m.instanceMatrix.needsUpdate = true; m.instanceColor.needsUpdate = true; }
  }
  const kind = Story.herbHighlight(), pc = P();
  const list = kind ? OB.herbs.map((h, i) => ({ h, i })).filter(o => o.h.k === kind && herbAvailable(o.i)).sort((a, b) => dist(a.h.x, a.h.y, pc.x, pc.y) - dist(b.h.x, b.h.y, pc.x, pc.y)).slice(0, W3.rings.length) : [];
  W3.rings.forEach((r, i) => { const o = list[i]; r.visible = !!o; if (o) { r.position.set(o.h.x, heightAt(o.h.x, o.h.y) + 3 + Math.sin(t * 3) * 1.5, o.h.y); r.material.opacity = 0.5 + Math.sin(t * 4) * 0.3; } });
}

// ---------- Himmel, Wetter, Feuer, Markierungen ----------
let _dot = null;
function dotTexture() {
  if (_dot) return _dot;
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.4, 'rgba(255,255,255,.7)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64); _dot = new THREE.CanvasTexture(c); return _dot;
}
function buildSky() {
  const n = 1400, p = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const a = Math.random() * TAU, b = Math.random() * 0.45 * Math.PI + 0.05; p.set([Math.cos(a) * Math.cos(b) * 3000, Math.sin(b) * 3000, Math.sin(a) * Math.cos(b) * 3000], i * 3); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  W3.stars = new THREE.Points(g, new THREE.PointsMaterial({ map: dotTexture(), color: 0xffffff, size: 3, sizeAttenuation: false, transparent: true, opacity: 0, fog: false }));
  SC.add(W3.stars);
  W3.moon = new THREE.Mesh(new THREE.SphereGeometry(70, 16, 12), new THREE.MeshBasicMaterial({ color: 0xf4f0dc, fog: false, transparent: true })); SC.add(W3.moon);
}
function buildWeather() {
  const n = 1800, p = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) p.set([rand(-500, 500), rand(0, 420), rand(-500, 500)], i * 3);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  W3.rain = new THREE.Points(g, new THREE.PointsMaterial({ map: dotTexture(), color: 0xcfe0ff, size: 2.2, transparent: true, opacity: 0.7, depthWrite: false })); W3.rain.visible = false; W3.rain.frustumCulled = false; SC.add(W3.rain);
}
function buildFire() {
  const n = 900, p = new Float32Array(n * 3), s = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { p.set([0, -999, 0], i * 3); s.set([0, -999, 0], i * 3); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  W3.fire = new THREE.Points(g, new THREE.PointsMaterial({ map: dotTexture(), color: 0xff7a20, size: 22, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false })); W3.fire.frustumCulled = false; SC.add(W3.fire);
  const g2 = new THREE.BufferGeometry(); g2.setAttribute('position', new THREE.BufferAttribute(s, 3));
  W3.smoke = new THREE.Points(g2, new THREE.PointsMaterial({ map: dotTexture(), color: 0x555555, size: 60, transparent: true, opacity: 0.35, depthWrite: false })); W3.smoke.frustumCulled = false; SC.add(W3.smoke);
  W3.fireSeed = Array.from({ length: n }, () => [Math.random(), Math.random(), Math.random()]);
}
function buildMarkers() {
  W3.markers = [];
  for (let i = 0; i < 5; i++) { const m = new THREE.Mesh(new THREE.ConeGeometry(7, 16, 4).rotateX(Math.PI), new THREE.MeshBasicMaterial({ color: i ? 0x6ec8ff : 0xffd24a })); m.visible = false; SC.add(m); W3.markers.push(m); }
}

// ---------- Pro Bild ----------
function dayFactor() { const h = hour(); if (h >= 7.5 && h < 18.5) return 1; if (h >= 21 || h < 5) return 0; if (h < 7.5) return (h - 5) / 2.5; return 1 - (h - 18.5) / 2.5; }
const SKY_DAY = new THREE.Color(0xa8cce8), SKY_DUSK = new THREE.Color(0xe8a070), SKY_NIGHT = new THREE.Color(0x0c1630), SKY_RAIN = new THREE.Color(0x8a96a2);
function updateSky(tx, tz, dt, t) {
  const f = dayFactor(), dusk = f > 0 && f < 1 ? 1 - Math.abs(f - 0.5) * 2 : 0;
  const sky = SC.background; sky.copy(SKY_NIGHT).lerp(SKY_DAY, f); if (dusk) sky.lerp(SKY_DUSK, dusk * 0.6);
  if (G.weather) sky.lerp(SKY_RAIN, 0.45 * f);
  SC.fog.color.copy(sky);
  SC.fog.near = lerp(260, 600, f) * (G.weather ? 0.7 : 1); SC.fog.far = lerp(1200, 2200, f) * (G.weather ? 0.75 : 1);
  HEMI.intensity = 0.3 + 0.95 * f; HEMI.color.set(f > 0.3 ? 0xdfefff : 0x7f8fcf);
  SUN.intensity = 0.35 + 1.9 * f; SUN.color.set(f > 0.3 ? (dusk > 0.3 ? 0xffc890 : 0xfff0d8) : 0x8fa4e0);
  const ang = (hour() / 24) * TAU - Math.PI / 2;
  const sd = f > 0.05 ? new THREE.Vector3(Math.cos(ang) * 0.6, 0.65 + Math.sin(ang) * 0.3, 0.45) : new THREE.Vector3(-0.4, 0.8, 0.3);
  SUN.position.set(tx + sd.x * 900, sd.y * 900, tz + sd.z * 900); SUN.target.position.set(tx, 0, tz);
  PLIGHT.intensity = (1 - f) * 1.1; PLIGHT.position.set(tx, surfaceY(tx, tz) + 60, tz);
  W3.stars.position.copy(CAMERA.position); W3.stars.material.opacity = (1 - f) * 0.9 * (G.weather ? 0.2 : 1);
  W3.moon.position.set(CAMERA.position.x - 1500, CAMERA.position.y + 1300, CAMERA.position.z - 2000); W3.moon.material.opacity = 1 - f;
  // Wetter
  const w = G.weather, r = W3.rain; r.visible = !!w;
  if (w) {
    r.material.size = w === 'schnee' ? 4 : 2.2; r.material.color.set(w === 'schnee' ? 0xffffff : 0xcfe0ff);
    const p = r.geometry.attributes.position, sp = w === 'schnee' ? 40 : 520;
    for (let i = 0; i < p.count; i++) { let y = p.getY(i) - sp * dt; if (y < 0) y += 420; p.setY(i, y); if (w === 'schnee') p.setX(i, p.getX(i) + Math.sin(t + i) * 0.3); }
    p.needsUpdate = true; r.position.set(CAMERA.position.x, surfaceY(tx, tz) - 40, CAMERA.position.z);
  }
}
function updateFire(t) {
  const F = G.fire, p = W3.fire.geometry.attributes.position, s = W3.smoke.geometry.attributes.position;
  if (!F) { if (W3.fireOn) { for (let i = 0; i < p.count; i++) { p.setY(i, -999); s.setY(i, -999); } p.needsUpdate = s.needsUpdate = true; W3.fireOn = false; FIRELIGHT.intensity = 0; } return; }
  W3.fireOn = true;
  for (let i = 0; i < p.count; i++) {
    const [a, b, c] = W3.fireSeed[i], ang = a * TAU, d = Math.sqrt(b) * F.r, x = F.x + Math.cos(ang) * d, z = F.y + Math.sin(ang) * d;
    const life = (t * (0.6 + c) + c * 10) % 1;
    p.setXYZ(i, x + Math.sin(t * 3 + i) * 3, heightAt(x, z) + life * 55, z);
    s.setXYZ(i, x, heightAt(x, z) + 60 + ((t * 0.3 + c) % 1) * 220, z);
  }
  p.needsUpdate = s.needsUpdate = true;
  FIRELIGHT.position.set(F.x, heightAt(F.x, F.y) + 120, F.y); FIRELIGHT.intensity = 2.2 + Math.sin(t * 13) * 0.4;
}
function updateSeason() {
  const s = season(); if (s === W3.season) return; W3.season = s;
  recolorTerrain(s); placeCanopies(s); colorBushes(s);
  for (const d of W3.dens) d.material.color.set(s === 3 ? '#8a9890' : s === 2 ? '#7a6a30' : '#3f6a30');
}
function updateCamera(dt, tx, tz, title) {
  if (title) { CAMS.yaw += dt * 0.06; CAMS.pitch = 0.42; CAMS.dist = 420; }
  const ty = surfaceY(tx, tz) + 16, cp = Math.cos(CAMS.pitch), sp = Math.sin(CAMS.pitch);
  let cx = tx - Math.cos(CAMS.yaw) * CAMS.dist * cp, cz = tz - Math.sin(CAMS.yaw) * CAMS.dist * cp, cy = ty + CAMS.dist * sp;
  cy = Math.max(cy, heightAt(cx, cz) + 10);
  const k = CAMS.snap ? 1 : 1 - Math.pow(0.00002, dt); CAMS.snap = false;
  CAMS.x = lerp(CAMS.x, cx, k); CAMS.y = lerp(CAMS.y, cy, k); CAMS.z = lerp(CAMS.z, cz, k);
  CAMERA.position.set(CAMS.x, CAMS.y, CAMS.z); CAMERA.lookAt(tx, ty, tz);
}
function project(x, y, z) {
  const v = new THREE.Vector3(x, y, z).project(CAMERA);
  return { x: (v.x + 1) / 2 * innerWidth, y: (1 - v.y) / 2 * innerHeight, vis: v.z < 1 && v.z > -1 };
}

// ---------- Modelle synchronisieren ----------
function useModel(key, make) {
  let m = W3.models.get(key);
  if (!m) { m = make(); SC.add(m); W3.models.set(key, m); }
  m.userData.seen = W3.frame; return m;
}
function syncModels(t, dt) {
  W3.frame++;
  const pc = P(), camX = CAMERA.position.x, camZ = CAMERA.position.z, far = 1500;
  const near = e => Math.abs(e.x - camX) < far && Math.abs(e.y - camZ) < far;
  for (const c of G.cats) {
    if (!c.alive || c.hidden || !near(c)) continue;
    const m = useModel(c, () => makeCatModel(c.look, { collar: c.id === 'sammy' && c.clan === 'haus' ? '#c0392b' : (c.collar || null) }));
    placeEnt(m, c); m.scale.setScalar(catSize(c));
    animateCat(m, c, t, { moving: c.moving, sleep: c.sleep && !c.moving, sneak: c === pc && G.player.sneak, run: c.running, lunge: c.lungeT > 0, flash: c.flash, fight: !!c.spar || (c === pc && nearestFoe(pc, 200)), look: !c.moving });
  }
  for (const e of ENTS) {
    if (!near(e)) continue;
    if (e.beast) { const m = useModel(e, () => makeBeastModel(e.kind)); placeEnt(m, e); animateBeast(m, e, t); }
    else { const m = useModel(e, () => makeCatModel(e.look, { star: e.star, collar: e.collar })); placeEnt(m, e); m.scale.setScalar((e.rank === 'anfuehrer' ? 1.08 : 1) * (e.look.size || 1) * (e.kit ? 0.55 : 1)); animateCat(m, e, t, { moving: e.moving, fight: e.hostile, flash: e.flash, look: !e.moving }); }
  }
  for (const p of PREY) {
    if (!near(p)) continue;
    const m = useModel(p, () => makePreyModel(p.k));
    const y = p.k === 'fisch' ? waterLevel(p.y) - 3 : surfaceY(p.x, p.y) + (p.z || 0) * 1.6;
    m.position.set(p.x, y, p.y); m.rotation.y = -p.dir;
    if (m.userData.w) { const f = p.st === 'fly' ? Math.sin(p.flap || 0) * 0.9 : 0; m.userData.w[0].rotation.x = -f; m.userData.w[1].rotation.x = f; }
    m.visible = p.k !== 'fisch' || Math.sin(t * 0.8 + p.x) > -0.3;
  }
  for (const c of CARS) { const m = useModel(c, () => makeCarModel(c.col)); m.position.set(c.x, roadLevel(c.x, c.y), c.y); m.rotation.y = -c.a; }
  // getragene Beute im Maul
  const pm = W3.models.get(pc);
  const ck = G.player.carry[0];
  if (pm && ck) {
    const m = useModel('carry:' + ck, () => makePreyModel(ck));
    if (m.parent !== pm.userData.head) { pm.userData.head.add(m); }
    m.position.set(7, -4, 0); m.rotation.set(Math.PI / 2, 0, -0.3); m.scale.setScalar(0.55);
  }
  for (const [k, m] of W3.models) if (m.userData.seen !== W3.frame) { m.parent && m.parent.remove(m); disposeModel(m); W3.models.delete(k); }
}
function placeEnt(m, e) {
  let y = surfaceY(e.x, e.y);
  if (inRiver(e.x, e.y) && !inRoad(e.x, e.y)) y -= 4;
  m.position.set(e.x, y, e.y);
  m.rotation.y = -e.dir;
}
function updateMarkers(t, tg) {
  W3.markers.forEach((m, i) => {
    const o = tg[i]; m.visible = !!o;
    if (o) { m.material.color.set(o.col); m.position.set(o.x, surfaceY(o.x, o.y) + 55 + Math.sin(t * 3) * 5, o.y); m.rotation.y = t * 2; }
  });
}
function render3D(t, dt, tx, tz, title) {
  updateSeason();
  updateCamera(dt, tx, tz, title);
  updateSky(tx, tz, dt, t);
  updateFire(t);
  updateHerbs(t);
  updatePile();
  syncModels(t, dt);
  updateMarkers(t, title ? [] : targets());
  R3.render(SC, CAMERA);
}
