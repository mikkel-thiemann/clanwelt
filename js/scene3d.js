'use strict';
// ===== 3D-Welt mit Three.js =====
let R3, SC, CAMERA, SUN, HEMI, PLIGHT, FIRELIGHT;
const CAMS = { yaw: -Math.PI / 2, pitch: 0.34, dist: 105, drag: false, dragT: 9, x: 0, y: 0, z: 0, snap: true };
const W3 = { inst: {}, models: new Map(), frame: 0, season: -1, herbState: '', pileN: -1 };
const GFX = { hoch: (() => { try { const v = localStorage.getItem('clanwelt_gfx'); return v ? v === 'hoch' : !matchMedia('(pointer: coarse)').matches; } catch (e) { return true; } })() };
const U_TIME = { value: 0 };
// Wind: Gras und Baumkronen wiegen sich (Shader-Erweiterung)
function windy(mat, amount, byHeight) {
  mat.onBeforeCompile = sh => {
    sh.uniforms.uTime = U_TIME;
    sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      #ifdef USE_INSTANCING
        vec3 wp = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
      #else
        vec3 wp = vec3(0.0);
      #endif
      float hh = ${byHeight ? 'max(position.y, 0.0)' : '(position.y + 1.0) * 0.5'};
      transformed.x += sin(uTime * 1.9 + wp.x * 0.013 + wp.z * 0.007) * ${amount.toFixed(3)} * hh;
      transformed.z += cos(uTime * 1.5 + wp.z * 0.011) * ${(amount * 0.6).toFixed(3)} * hh;`);
  };
  return mat;
}
const _o = new THREE.Object3D(), _c = new THREE.Color();
const srgb = (r, g, b) => _c.setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace);

function init3D() {
  R3 = new THREE.WebGLRenderer({ canvas: $('game'), antialias: true });
  R3.setPixelRatio(Math.min(1.75, devicePixelRatio || 1));
  R3.shadowMap.enabled = GFX.hoch; R3.shadowMap.type = THREE.PCFSoftShadowMap;
  R3.toneMapping = THREE.ACESFilmicToneMapping; R3.toneMappingExposure = 1.15;
  if (!GFX.hoch) R3.setPixelRatio(1);
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
  buildTerrain3D(); buildWater(); buildRoad(); buildTrees(); buildBushes(); buildGrass(); buildDebris(); buildRocks(); buildHouses(); buildCamps(); buildHerbs(); buildSky(); buildWeather(); buildFire(); buildMarkers();
  FX3.init();
  initBloom();
  resize3D();
}
function resize3D() {
  if (!R3) return; R3.setSize(innerWidth, innerHeight, false); CAMERA.aspect = innerWidth / innerHeight; CAMERA.updateProjectionMatrix();
  if (W3.composer) { W3.composer.setSize(innerWidth, innerHeight); W3.bloom.resolution.set(innerWidth / 2, innerHeight / 2); }
}
function initBloom() {
  const A = window.THREE_ADDONS; if (!A) return;
  W3.composer = new A.EffectComposer(R3);
  W3.composer.addPass(new A.RenderPass(SC, CAMERA));
  W3.bloom = new A.UnrealBloomPass(new THREE.Vector2(innerWidth / 2, innerHeight / 2), 0.45, 0.55, 0.88);
  W3.composer.addPass(W3.bloom);
  W3.composer.addPass(new A.OutputPass());
}
function setGfx(hoch) {
  GFX.hoch = hoch; try { localStorage.setItem('clanwelt_gfx', hoch ? 'hoch' : 'niedrig'); } catch (e) { }
  R3.shadowMap.enabled = hoch; R3.setPixelRatio(hoch ? Math.min(1.75, devicePixelRatio || 1) : 1);
  if (W3.grass) W3.grass.count = hoch ? W3.grassN : Math.floor(W3.grassN / 3);
  SC.traverse(o => { if (o.material) { const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach(m => m.needsUpdate = true); } });
  resize3D();
}

// ---------- Boden ----------
function detailTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  g.fillStyle = '#e8e8e8'; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 1400; i++) { const v = 180 + Math.random() * 75 | 0; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(Math.random() * 128, Math.random() * 128, 1 + Math.random() * 2, 2 + Math.random() * 4); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
function buildTerrain3D() {
  const geo = new THREE.PlaneGeometry(W, H, Math.round(W / 20), 210); geo.rotateX(-Math.PI / 2); geo.translate(W / 2, 0, H / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setY(i, heightAt(pos.getX(i), pos.getZ(i)));
  geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(pos.count * 3), 3));
  geo.computeVertexNormals();
  const tex = detailTexture(); tex.repeat.set(W / 70, H / 70);
  const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true, map: tex }));
  m.receiveShadow = true; SC.add(m); W3.terrain = m;
}
let _shadeGrid = null;
function canopyShade(x, z) {
  if (!_shadeGrid) { _shadeGrid = new Map(); for (const t of OB.trees) gridAdd(_shadeGrid, { x: t.x, y: t.y, r: t.r }, t.r); }
  const a = _shadeGrid.get(gkey(Math.floor(x / CELL), Math.floor(z / CELL))); if (!a) return 0;
  let s = 0; for (const t of a) { if (felled(t)) continue; const d = dist(x, z, t.x, t.y); if (d < t.r * 1.1) s += 1 - d / (t.r * 1.1); }
  return Math.min(1, s);
}
function recolorTerrain(s) {
  const geo = W3.terrain.geometry, pos = geo.attributes.position, col = geo.attributes.color, o = [0, 0, 0];
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    groundColor(x, z, o);
    const special = inRoad(x, z) || inRiver(x, z);
    const zz = (G && G.flags && G.flags.zerstoert) || 0;
    if (zz && x < OLD_W && z < 3440 && !special) { const k = zz * 0.75 * clamp(NOISE(x / 300 + 9, z / 300) * 1.6, 0, 1); o[0] = lerp(o[0], 118, k); o[1] = lerp(o[1], 92, k); o[2] = lerp(o[2], 64, k); }
    if (!special) {
      if (s === 3) { o[0] = lerp(o[0], 236, 0.6); o[1] = lerp(o[1], 240, 0.6); o[2] = lerp(o[2], 246, 0.6); }
      else if (s === 2) { o[0] = lerp(o[0], 150, 0.22); o[1] = lerp(o[1], 110, 0.15); o[2] = lerp(o[2], 40, 0.1); }
      else if (s === 0) { o[1] = lerp(o[1], 170, 0.1); }
    }
    if (!special) { const sh = canopyShade(x, z); if (sh) { o[0] *= 1 - sh * 0.3; o[1] *= 1 - sh * 0.24; o[2] *= 1 - sh * 0.3; } }
    srgb(o[0], o[1], o[2]); col.setXYZ(i, _c.r, _c.g, _c.b);
  }
  col.needsUpdate = true;
}
function buildWater() {
  const v = [], idx = [];
  let n = 0;
  for (let y = -20; y <= 3470; y += 20) { const yy = Math.min(y, 3440), cx = riverX(yy), wl = waterLevel(yy); v.push(cx - 66, wl, y, cx + 66, wl, y); W3.wuv = W3.wuv || []; W3.wuv.push(0, y / 130, 1, y / 130); if (n) idx.push(n * 2 - 2, n * 2, n * 2 - 1, n * 2 - 1, n * 2, n * 2 + 1); n++; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(W3.wuv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
  const wc = document.createElement('canvas'); wc.width = wc.height = 128; const wg = wc.getContext('2d');
  wg.fillStyle = '#9ab8d8'; wg.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 160; i++) { wg.fillStyle = `rgba(255,255,255,${Math.random() * 0.35})`; wg.beginPath(); wg.ellipse(Math.random() * 128, Math.random() * 128, 6 + Math.random() * 14, 1 + Math.random() * 1.5, 0, 0, TAU); wg.fill(); }
  const wt = new THREE.CanvasTexture(wc); wt.wrapS = wt.wrapT = THREE.RepeatWrapping; wt.colorSpace = THREE.SRGBColorSpace; wt.repeat.set(1, 3);
  W3.waterTex = wt;
  const mat = new THREE.MeshPhongMaterial({ color: 0x3a78b0, map: wt, transparent: true, opacity: 0.84, shininess: 90, specular: 0x9fc4e8 });
  W3.water = new THREE.Mesh(geo, mat); SC.add(W3.water);
  const gorge = new THREE.Mesh(new THREE.PlaneGeometry(140, 430).rotateX(-Math.PI / 2), mat); gorge.position.set(3430, -58, 2755); SC.add(gorge);
  // See (unregelmäßiger Rand)
  const lv = [0, 0, 0], li = [], N = 96;
  for (let i = 0; i <= N; i++) { const a = i / N * TAU, r = lakeR(a) + 12; lv.push(Math.cos(a) * r, 0, Math.sin(a) * r); if (i) li.push(0, i + 1, i); }
  const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(lv, 3)); lg.setIndex(li); lg.computeVertexNormals();
  const luv = []; for (let i = 0; i < lv.length; i += 3) luv.push(lv[i] / 130, lv[i + 2] / 130); lg.setAttribute('uv', new THREE.Float32BufferAttribute(luv, 2));
  const lake = new THREE.Mesh(lg, mat); lake.position.set(LAKE.x, LAKE_LEVEL, LAKE.y); SC.add(lake);
  const oc = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1900).rotateX(-Math.PI / 2), mat); oc.position.set(8200, OCEAN_LEVEL, 850); SC.add(oc);
  const moon = new THREE.Mesh(new THREE.CircleGeometry(48, 32).rotateX(-Math.PI / 2), new THREE.MeshPhongMaterial({ color: 0x9fc8ff, emissive: 0x3a5a9a, shininess: 120, transparent: true, opacity: 0.9 }));
  moon.position.set(LM0.mondsee.x, heightAt(LM0.mondsee.x, LM0.mondsee.y) + 3, LM0.mondsee.y); SC.add(moon); W3.mondsee = moon;
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
  const blob = leafBlob(), lt = leafTexture();
  const leafMat = () => windy(new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true, map: lt }), 0.05, false);
  const cA = inst(blob, dec.length, true, leafMat()), cB = inst(blob, dec.length, true, leafMat()), cC = inst(blob, dec.length, true, leafMat());
  const cD = inst(blob, dec.length, true, leafMat()), cE = inst(blob, dec.length, true, leafMat());
  const cone = new THREE.ConeGeometry(1, 1, 9).translate(0, 0.5, 0), pL = inst(cone, pin.length * 3, true, windy(new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true }), 0.04, true));
  W3.inst.trees = { dec, pin, cA, cB, cC, cD, cE, pL, trunk, all: T };
  placeCanopies(1);
}
const felled = t => G && G.flags && G.flags.zerstoert && t.x < OLD_W && t.y < 3440 && hashStr(t.x + ':' + t.y) < G.flags.zerstoert && t.tr < 20;
function placeTrunks() {
  const { all, trunk } = W3.inst.trees;
  all.forEach((t, i) => { const g = heightAt(t.x, t.y), h = felled(t) ? 5 : treeH(t) + (t.k === 'pine' ? 0 : 10); _o.position.set(t.x, g - 2, t.y); _o.rotation.set(0, t.c * 6, 0); _o.scale.set(t.tr, h, t.tr); _o.updateMatrix(); trunk.setMatrixAt(i, _o.matrix); });
  trunk.instanceMatrix.needsUpdate = true;
}
function placeCanopies(s) {
  const { dec, pin, cA, cB, cC, cD, cE, pL } = W3.inst.trees;
  const bare = s === 3;
  dec.forEach((t, i) => {
    const g = heightAt(t.x, t.y), top = g + treeH(t) + 10, r = t.r * (bare && t.k !== 'willow' ? 0.55 : 1);
    const gone = felled(t) ? 0.0001 : 1;
    const set = (m, dx, dy, dz, k) => { _o.position.set(t.x + dx * r, top + dy * r, t.y + dz * r); _o.rotation.set(t.c, t.c * 4, 0); _o.scale.set(r * k * gone, r * k * gone * (t.k === 'willow' ? 1 : 0.72), r * k * gone); _o.updateMatrix(); m.setMatrixAt(i, _o.matrix); };
    set(cA, 0, 0.05, 0, 0.9); set(cB, 0.5, 0.25, -0.35, 0.68); set(cC, -0.45, 0.2, 0.4, 0.66); set(cD, 0.1, 0.55, 0.3, 0.6); set(cE, -0.3, -0.15, -0.45, 0.62);
    let [c1, c2] = SEASON_TREE[s];
    if (t.k === 'willow') { c1 = s === 3 ? '#a8b0a0' : '#6a9a44'; c2 = s === 3 ? '#c8d0c8' : '#8ab85a'; }
    if (t.k === 'birch' && s < 2) { c1 = '#7ab854'; c2 = '#9cd070'; }
    if (s === 2 && t.c > 0.6) { c1 = '#b8482a'; c2 = '#d8703a'; }
    const v = 0.85 + t.c * 0.3;
    cA.setColorAt(i, _c.set(c1).multiplyScalar(v)); cB.setColorAt(i, _c.set(c2).multiplyScalar(v)); cC.setColorAt(i, _c.set(c1).multiplyScalar(v * 1.05)); cD.setColorAt(i, _c.set(c2).multiplyScalar(v * 1.08)); cE.setColorAt(i, _c.set(c1).multiplyScalar(v * 0.9));
  });
  pin.forEach((t, i) => {
    const g = heightAt(t.x, t.y);
    for (let k = 0; k < 3; k++) {
      _o.position.set(t.x, g + 16 + k * 24, t.y); _o.rotation.set(0, t.c * 5 + k, 0); const r = t.r * (1 - k * 0.24) * (felled(t) ? 0.0001 : 1); _o.scale.set(r, 52 - k * 8, r); _o.updateMatrix();
      pL.setMatrixAt(i * 3 + k, _o.matrix); pL.setColorAt(i * 3 + k, _c.set(s === 3 && k === 2 ? '#dfe8ea' : ['#1f4326', '#28552e', '#336638'][k]).multiplyScalar(0.9 + t.c * 0.2));
    }
  });
  for (const m of [cA, cB, cC, cD, cE, pL]) { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; }
}
const SEASON_TREE = [['#6aa04a', '#86b85a'], ['#3e6e2e', '#4f8238'], ['#b8652a', '#cf9a3a'], ['#9aa0a0', '#dfe6ea']];
// Baumkrone: unregelmäßig ausgebeulte Kugel, unten dunkler (wie echter Schatten im Laub)
function leafBlob() {
  const g = new THREE.IcosahedronGeometry(1, 3), p = g.attributes.position, R = mulberry32(5), col = [];
  const map = new Map();
  for (let i = 0; i < p.count; i++) {
    const k = p.getX(i).toFixed(3) + p.getY(i).toFixed(3) + p.getZ(i).toFixed(3);
    if (!map.has(k)) map.set(k, 0.82 + R() * 0.3 + NOISE(p.getX(i) * 3 + 5, p.getZ(i) * 3 + p.getY(i) * 2) * 0.2);
    const f = map.get(k); p.setXYZ(i, p.getX(i) * f, p.getY(i) * f * 0.95, p.getZ(i) * f);
    const shade = 0.55 + 0.45 * clamp((p.getY(i) + 0.7) / 1.5, 0, 1); col.push(shade, shade, shade);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  const nrm = g.attributes.normal; for (let i = 0; i < p.count; i++) { _v3.set(p.getX(i), p.getY(i) * 1.1, p.getZ(i)).normalize(); nrm.setXYZ(i, _v3.x, _v3.y, _v3.z); } nrm.needsUpdate = true;
  return g;
}
const _v3 = new THREE.Vector3();
function leafTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  x.fillStyle = '#d0d0d0'; x.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 700; i++) { const v = 150 + Math.random() * 105 | 0; x.fillStyle = `rgb(${v},${v},${v})`; x.beginPath(); x.ellipse(Math.random() * 128, Math.random() * 128, 2 + Math.random() * 3, 1 + Math.random() * 1.5, Math.random() * 3, 0, TAU); x.fill(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); t.colorSpace = THREE.SRGBColorSpace; return t;
}

// ---------- Büsche ----------
function buildBushes() {
  const kinds = { wall: [], fern: [], bramble: [], heather: [], reed: [], garden: [] };
  for (const b of OB.bushes) (kinds[b.k] || kinds.fern).push(b);
  const ico1 = new THREE.IcosahedronGeometry(1, 1), reed = frondGeo(9, 0.05, 1.0, 0.15, true), fern = frondGeo(9, 0.2, 0.55, 1, false), heath = frondGeo(14, 0.07, 0.6, 0.55, true);
  W3.inst.bush = {};
  for (const k in kinds) {
    const arr = kinds[k], leafy = k === 'fern' || k === 'reed' || k === 'heather';
    const geo = k === 'reed' ? reed : k === 'fern' ? fern : k === 'heather' ? heath : ico1;
    const mat = leafy ? windy(new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true, side: THREE.DoubleSide }), k === 'reed' ? 0.12 : 0.08, true) : new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true });
    const m = inst(geo, arr.length, k === 'wall' || k === 'bramble' || k === 'fern', mat);
    arr.forEach((b, i) => {
      const g = heightAt(b.x, b.y);
      const sc = { wall: [1.05, 0.95, 1.05], fern: [1, 0.5, 1], bramble: [1, 0.7, 1], heather: [0.9, 0.42, 0.9], garden: [0.9, 0.8, 0.9] }[k];
      if (k === 'reed') { _o.position.set(b.x, g - 1, b.y); _o.scale.set(b.r * 0.8, 28 + (b.x % 10), b.r * 0.8); }
      else if (k === 'fern') { _o.position.set(b.x, g - 1, b.y); _o.scale.set(b.r * 1.3, b.r * 1.1, b.r * 1.3); }
      else if (k === 'heather') { _o.position.set(b.x, g - 1, b.y); _o.scale.set(b.r * 0.9, b.r * 0.9, b.r * 0.9); }
      else { _o.position.set(b.x, g + b.r * sc[1] * 0.45, b.y); _o.scale.set(b.r * sc[0], b.r * sc[1], b.r * sc[2]); }
      _o.rotation.set(0, (b.x * 7 + b.y) % 6, 0); _o.updateMatrix(); m.setMatrixAt(i, _o.matrix);
    });
    W3.inst.bush[k] = { m, arr };
  }
}
// Farnwedel / Schilf / Heide: Blätter, die vom Boden aus gebogen nach außen wachsen
function frondGeo(n, width, height, spread, straight) {
  const pos = [], col = [];
  for (let k = 0; k < n; k++) {
    const a = k / n * TAU + Math.random() * 0.5, ca = Math.cos(a), sa = Math.sin(a), px = -sa * width, pz = ca * width;
    const reach = spread * (0.7 + Math.random() * 0.4), h = height * (0.75 + Math.random() * 0.5);
    const mx = ca * reach * 0.55, mz = sa * reach * 0.55, my = h, tx = ca * reach, tz = sa * reach, ty = straight ? h * 1.25 : h * 0.45;
    pos.push(0, 0, 0, mx + px, my, mz + pz, tx, ty, tz, 0, 0, 0, tx, ty, tz, mx - px, my, mz - pz);
    col.push(0.5, 0.5, 0.5, 1, 1, 1, 1.25, 1.25, 1.2, 0.5, 0.5, 0.5, 1.25, 1.25, 1.2, 1, 1, 1);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals(); return g;
}
function colorBushes(s) {
  const cols = { wall: s === 3 ? '#56665a' : '#2d4a26', fern: s === 2 ? '#9a7a2a' : s === 3 ? '#8a9488' : '#3f8a34', bramble: '#2f5228', heather: s === 3 ? '#9a90a0' : s === 1 ? '#8a4f90' : '#6a5a6e', reed: s === 3 ? '#b0aa90' : s === 2 ? '#a89a50' : '#7a9a4a', garden: '#3a8a3a' };
  for (const k in W3.inst.bush) {
    const { m, arr } = W3.inst.bush[k];
    arr.forEach((b, i) => m.setColorAt(i, _c.set(k === 'garden' && i % 3 === 0 ? '#e0609a' : cols[k]).multiplyScalar(0.85 + ((b.x * 13) % 10) / 30)));
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }
}

// ---------- Totholz, Pilze, kleine Steine ----------
function buildDebris() {
  const R = mulberry32(4242), logs = [], shrooms = [], pebbles = [];
  for (let i = 0; i < 6000 && (logs.length < 110 || shrooms.length < 400); i++) {
    const x = R() * W, y = R() * H, t = territoryAt(x, y, true);
    if (!['donner', 'schatten', 'fluss'].includes(t) || isWater(x, y) || nearLM(x, y, 30) || inRoad(x, y)) continue;
    const r = R();
    if (r < 0.2 && logs.length < 110) logs.push([x, y, R() * TAU, 40 + R() * 60, 5 + R() * 4]);
    else if (r < 0.8) shrooms.push([x, y, R()]); else pebbles.push([x, y, 2 + R() * 4]);
  }
  const lm = inst(new THREE.CylinderGeometry(1, 1.1, 1, 9).rotateZ(Math.PI / 2), logs.length, true, new THREE.MeshLambertMaterial({ color: 0xffffff }));
  logs.forEach(([x, y, a, l, r], i) => { _o.position.set(x, heightAt(x, y) + r * 0.6, y); _o.rotation.set(0, a, 0); _o.scale.set(l, r, r); _o.updateMatrix(); lm.setMatrixAt(i, _o.matrix); lm.setColorAt(i, _c.set(i % 3 ? '#5a4632' : '#6a5a44')); });
  const cap = new THREE.SphereGeometry(1, 8, 5, 0, TAU, 0, Math.PI / 2), sm = inst(cap, shrooms.length * 3, false), stem = inst(new THREE.CylinderGeometry(0.3, 0.35, 1, 5).translate(0, 0.5, 0), shrooms.length * 3, false);
  shrooms.forEach(([x, y, v], i) => { for (let k = 0; k < 3; k++) { const xx = x + Math.cos(k * 2.1 + v * 6) * 5, yy = y + Math.sin(k * 2.1 + v * 6) * 5, g = heightAt(xx, yy), s = 1.8 + ((v * 10 + k) % 1) * 1.8;
    _o.position.set(xx, g + s * 1.2, yy); _o.rotation.set(0, 0, 0); _o.scale.set(s, s * 0.7, s); _o.updateMatrix(); sm.setMatrixAt(i * 3 + k, _o.matrix); sm.setColorAt(i * 3 + k, _c.set(v < 0.15 ? '#c0302a' : v < 0.6 ? '#b89060' : '#e0d8c8'));
    _o.position.set(xx, g, yy); _o.scale.set(s, s * 1.2, s); _o.updateMatrix(); stem.setMatrixAt(i * 3 + k, _o.matrix); stem.setColorAt(i * 3 + k, _c.set('#eee6d8')); } });
  const pm = inst(new THREE.DodecahedronGeometry(1, 0), pebbles.length, false);
  pebbles.forEach(([x, y, r], i) => { _o.position.set(x, heightAt(x, y), y); _o.rotation.set(r, r * 2, 0); _o.scale.set(r, r * 0.6, r); _o.updateMatrix(); pm.setMatrixAt(i, _o.matrix); pm.setColorAt(i, _c.set('#8a867c')); });
}

// ---------- Gras ----------
function buildGrass() {
  // Grasbüschel aus mehreren schmalen Halmen
  const pos = [], col = [];
  for (let k = 0; k < 8; k++) {
    const a = k / 8 * Math.PI + Math.random() * 0.4, w = 0.075, lean = (Math.random() - 0.5) * 0.7, h = 0.55 + Math.random() * 0.45;
    const cx = Math.cos(a) * w, cz = Math.sin(a) * w, ox = (Math.random() - 0.5) * 0.5, oz = (Math.random() - 0.5) * 0.5;
    pos.push(ox - cx, 0, oz - cz, ox + cx, 0, oz + cz, ox + lean, h, oz + lean * 0.5);
    col.push(0.62, 0.62, 0.62, 0.62, 0.62, 0.62, 1.35, 1.35, 1.3);
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); geo.computeVertexNormals();
  const mat = windy(new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }), 0.35, true);
  const R = mulberry32(99), spots = [];
  let tries = 0;
  while (spots.length < 36000 && tries++ < 150000) {
    const x = R() * W, y = R() * H, t = territoryAt(x, y, true);
    if (inRoad(x, y) || isWater(x, y) || (y < 3460 && Math.abs(x - riverX(y)) < 62)) continue;
    const dens = { donner: 0.55, fluss: 1, wind: 0.8, zweibeiner: 0.35, schatten: 0.3, baumgeviert: 1, hochland: 0.3, donnerweg: 0, berge: 0.2, kueste: 0.3 }[t] || 0;
    if (R() > dens) continue;
    let bad = false; for (const cp of OB.camps) if (dist(x, y, cp.lm.x, cp.lm.y) < cp.lm.r - 30) { bad = true; break; }
    if (bad || (y > 3940 && y < 4140) || dist(x, y, LM.sandkuhle.x, LM.sandkuhle.y) < LM.sandkuhle.r) continue;
    spots.push([x, y, t]);
  }
  const m = new THREE.InstancedMesh(geo, mat, spots.length); m.frustumCulled = false; m.receiveShadow = true; SC.add(m);
  spots.forEach(([x, y], i) => { const s = 7 + R() * 7; _o.position.set(x, heightAt(x, y) - 0.5, y); _o.rotation.set(0, R() * 6.3, 0); _o.scale.set(s * 1.3, s, s * 1.3); _o.updateMatrix(); m.setMatrixAt(i, _o.matrix); });
  W3.grass = m; W3.grassSpots = spots; W3.grassN = spots.length;
  if (!GFX.hoch) m.count = Math.floor(spots.length / 3);
}
function destroyGrass(z) {
  const m = W3.grass;
  W3.grassSpots.forEach(([x, y], i) => {
    if (x >= OLD_W || y > 3440 || hashStr(x + '/' + y) > z * 0.9) return;
    m.getMatrixAt(i, _o.matrix); _o.matrix.decompose(_o.position, _o.quaternion, _o.scale); _o.scale.setScalar(0.001); _o.updateMatrix(); m.setMatrixAt(i, _o.matrix);
  });
  m.instanceMatrix.needsUpdate = true;
}
function colorGrass(s) {
  const m = W3.grass, o = [0, 0, 0];
  W3.grassSpots.forEach(([x, y, t], i) => {
    groundColor(x, y, o);
    let [r, g, b] = [o[0] * 1.05 + 10, o[1] * 1.3 + 18, o[2] * 0.9];
    if (t === 'wind' || t === 'hochland') { r = lerp(r, 150, 0.3); g = lerp(g, 140, 0.2); }
    if (s === 2) { r = lerp(r, 175, 0.45); g = lerp(g, 140, 0.35); b = lerp(b, 60, 0.3); }
    if (s === 3) { r = lerp(r, 225, 0.65); g = lerp(g, 230, 0.65); b = lerp(b, 238, 0.65); }
    if (s === 0) { g = lerp(g, 190, 0.2); }
    m.setColorAt(i, srgb(clamp(r, 0, 255), clamp(g, 0, 255), clamp(b, 0, 255)));
  });
  m.instanceColor.needsUpdate = true;
}

// ---------- Felsen ----------
function buildRocks() {
  const geo = new THREE.DodecahedronGeometry(1, 0), hs = denPos('hochstein');
  const m = inst(geo, OB.rocks.length);
  OB.rocks.forEach((r, i) => {
    const g = heightAt(r.x, r.y), hoch = dist(r.x, r.y, hs.x, hs.y) < 5, big = r.r > 50;
    const hoch2 = dist(r.x, r.y, denPos('hochstein', LM0.steinmulde).x, denPos('hochstein', LM0.steinmulde).y) < 5;
    const hy = hoch || hoch2 ? r.r * 1.9 : big ? r.r * 1.3 : r.r * 0.65;
    if (hoch || hoch2) (W3.rockTops = W3.rockTops || []).push({ x: r.x, y: r.y, top: g + hy * 0.35 + hy * 0.72 });
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
  buildThunderCamp(addDen, dome);
  for (const k of ['heiler', 'krieger', 'schueler', 'kinder', 'aeltest', 'anfuehrer']) { const p = denPos(k, LM0.steinmulde); addDen(p.x, p.y, k === 'krieger' ? 48 : k === 'anfuehrer' ? 32 : 40, LM0.steinmulde.x, LM0.steinmulde.y); }
  for (const cp of OB.camps) if (cp.clan !== 'donner') for (let i = 0; i < 4; i++) { const a = i * 1.6 + 0.4; addDen(cp.lm.x + Math.cos(a) * 110, cp.lm.y + Math.sin(a) * 110, 36, cp.lm.x, cp.lm.y); }
  W3.pile = new THREE.Group(); const p = denPos('pile'); W3.pile.position.set(p.x, heightAt(p.x, p.y), p.y); SC.add(W3.pile);
}
// Das DonnerClan-Lager wie in den Büchern: Senke, Ginstertunnel, Hochstein mit Höhle, Ältestenbau im umgestürzten Baum
function buildThunderCamp(addDen, dome) {
  const L0 = LM0.lager, cp = k => denPos(k, L0);
  let p = cp('krieger'); addDen(p.x, p.y, 50, L0.x, L0.y);
  p = cp('schueler'); addDen(p.x, p.y, 38, L0.x, L0.y);
  p = cp('kinder'); addDen(p.x, p.y, 44, L0.x, L0.y); W3.dens[W3.dens.length - 1].userData.bramble = true;
  // Heilerbau: Farntunnel zu einem gespaltenen Felsen
  p = cp('heiler');
  for (const s of [-1, 1]) { const r = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0), sharedMat('#8a8680')); r.scale.set(26, 34, 20); r.position.set(p.x - 30, heightAt(p.x, p.y) + 12, p.y + s * 24); r.rotation.set(0.2 * s, 0.4, 0.1); r.castShadow = r.receiveShadow = true; SC.add(r); }
  addDen(p.x + 10, p.y, 30, L0.x, L0.y);
  // Ältestenbau: umgestürzter Baum
  p = cp('aeltest');
  const trunkM = new THREE.MeshLambertMaterial({ color: 0x5a4632 });
  const log = new THREE.Mesh(new THREE.CylinderGeometry(15, 18, 150, 10).rotateZ(Math.PI / 2), trunkM); log.position.set(p.x, heightAt(p.x, p.y) + 14, p.y); log.rotation.y = 0.5; log.castShadow = log.receiveShadow = true; SC.add(log);
  for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(3, 4, 40, 6), trunkM); b.position.set(p.x - 50 + i * 30, heightAt(p.x, p.y) + 28, p.y + (i % 2 ? 14 : -14)); b.rotation.set(i % 2 ? 0.7 : -0.7, 0.5, 0.4); SC.add(b); }
  const hole = new THREE.Mesh(new THREE.CircleGeometry(12, 14), sharedMat('#120c08')); hole.position.set(p.x + Math.cos(0.5) * 76, heightAt(p.x, p.y) + 14, p.y - Math.sin(0.5) * 76); hole.rotation.y = 0.5 + Math.PI / 2; SC.add(hole);
  // Anführerhöhle unter dem Hochstein
  const hs = cp('hochstein'), a = Math.atan2(L0.y - hs.y, L0.x - hs.x);
  const cave = new THREE.Mesh(new THREE.CircleGeometry(1, 20, 0, Math.PI), sharedMat('#0c0806')); cave.scale.set(24, 22, 1);
  cave.position.set(hs.x + Math.cos(a) * 64, heightAt(hs.x, hs.y) + 1, hs.y + Math.sin(a) * 64); cave.rotation.y = -a + Math.PI / 2; SC.add(cave);
  // Ginstertunnel am Eingang
  const gm = new THREE.MeshLambertMaterial({ color: 0x3a5a2a }), gap = Math.PI / 2;
  for (let k = 0; k < 4; k++) {
    const d = L0.r - 10 + k * 18, x = L0.x + Math.cos(gap) * d, z = L0.y + Math.sin(gap) * d;
    const arch = new THREE.Mesh(new THREE.TorusGeometry(24, 9, 7, 14, Math.PI), gm); arch.position.set(x, heightAt(x, z) - 2, z); arch.rotation.y = gap + Math.PI / 2; arch.castShadow = true; SC.add(arch);
    for (let f = 0; f < 5; f++) { const fl = new THREE.Mesh(geos().lo, sharedMat('#e8c020')); fl.scale.setScalar(1.6); const aa = f / 4 * Math.PI; fl.position.set(x + Math.cos(gap + Math.PI / 2) * Math.cos(aa) * 30 * (f % 2 ? 1 : -1), heightAt(x, z) + Math.sin(aa) * 30, z); SC.add(fl); }
  }
}
function updatePile() {
  const pp = denPos('pile'); W3.pile.position.set(pp.x, heightAt(pp.x, pp.y), pp.y);
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
  W3.skyU = { top: { value: new THREE.Color(0x4f8fd0) }, hor: { value: new THREE.Color(0xcfe4f4) }, sunDir: { value: new THREE.Vector3(0.3, 0.6, 0.4).normalize() }, sunCol: { value: new THREE.Color(0xfff2c8) }, sunAmt: { value: 1 } };
  W3.sky = new THREE.Mesh(new THREE.SphereGeometry(4200, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false, uniforms: W3.skyU,
    vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform vec3 top; uniform vec3 hor; uniform vec3 sunDir; uniform vec3 sunCol; uniform float sunAmt; varying vec3 vD;
      void main(){ float h = clamp(vD.y, 0.0, 1.0); vec3 c = mix(hor, top, pow(h, 0.55));
        float sd = max(dot(normalize(vD), sunDir), 0.0); c += sunCol * (pow(sd, 900.0) * 3.0 + pow(sd, 12.0) * 0.35) * sunAmt;
        gl_FragColor = vec4(c, 1.0); }`
  }));
  W3.sky.renderOrder = -1; SC.add(W3.sky);
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
  W3.skyU.hor.value.copy(sky); W3.skyU.top.value.copy(SKY_NIGHT).lerp(new THREE.Color(0x3f7fc8), f); if (G.weather) W3.skyU.top.value.lerp(SKY_RAIN, 0.5 * f);
  W3.sky.position.copy(CAMERA.position);
  if (G.weather) sky.lerp(SKY_RAIN, 0.45 * f);
  SC.fog.color.copy(sky);
  SC.fog.near = lerp(260, 600, f) * (G.weather ? 0.7 : 1); SC.fog.far = lerp(1200, 2200, f) * (G.weather ? 0.75 : 1);
  HEMI.intensity = 0.3 + 0.95 * f; HEMI.color.set(f > 0.3 ? 0xdfefff : 0x7f8fcf);
  SUN.intensity = 0.35 + 1.9 * f; SUN.color.set(f > 0.3 ? (dusk > 0.3 ? 0xffc890 : 0xfff0d8) : 0x8fa4e0);
  const ang = (hour() / 24) * TAU - Math.PI / 2;
  const sd = f > 0.05 ? new THREE.Vector3(Math.cos(ang) * 0.6, 0.65 + Math.sin(ang) * 0.3, 0.45) : new THREE.Vector3(-0.4, 0.8, 0.3);
  SUN.position.set(tx + sd.x * 900, sd.y * 900, tz + sd.z * 900); SUN.target.position.set(tx, 0, tz);
  W3.skyU.sunDir.value.set(sd.x, sd.y, sd.z).normalize(); W3.skyU.sunAmt.value = f * (G.weather ? 0.15 : 1); W3.skyU.sunCol.value.set(dusk > 0.3 ? 0xffb070 : 0xfff2c8);
  PLIGHT.intensity = (1 - f) * 1.1; PLIGHT.position.set(tx, surfaceY(tx, tz) + 60, tz);
  W3.stars.position.copy(CAMERA.position); W3.stars.material.opacity = (1 - f) * 0.9 * (G.weather ? 0.2 : 1);
  W3.moon.position.set(CAMERA.position.x - 1500, CAMERA.position.y + 1300, CAMERA.position.z - 2000); W3.moon.material.opacity = 1 - f;
  // Traumszenen: SternenClan (blau, Sterne) oder Wald der Finsternis (rot, dunkel)
  const dm = typeof dreamMode === 'function' ? dreamMode() : null;
  document.body.classList.toggle('dream', dm === 'stern'); document.body.classList.toggle('nightmare', dm === 'finster');
  if (dm === 'stern') { sky.set(0x2a3a8a); W3.skyU.hor.value.set(0x3a4aa0); W3.skyU.top.value.set(0x080c30); W3.skyU.sunAmt.value = 0; SC.fog.color.set(0x2a3478); SC.fog.near = 120; SC.fog.far = 900; W3.stars.material.opacity = 1; HEMI.intensity = 0.7; HEMI.color.set(0x9fb4ff); SUN.intensity = 0.4; SUN.color.set(0xbfd0ff); if (Math.random() < 0.6) FX3.sparkle(tx + rand(-200, 200), surfaceY(tx, tz) + rand(10, 80), tz + rand(-200, 200), '#cfe0ff', 2); }
  if (dm === 'finster') { sky.set(0x2a0808); W3.skyU.hor.value.set(0x4a1010); W3.skyU.top.value.set(0x0a0202); W3.skyU.sunAmt.value = 0; SC.fog.color.set(0x220606); SC.fog.near = 60; SC.fog.far = 500; W3.stars.material.opacity = 0; HEMI.intensity = 0.35; HEMI.color.set(0xff8a7a); SUN.intensity = 0.25; SUN.color.set(0xff6a50); }
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
  const z = (G.flags && G.flags.zerstoert) || 0;
  if (z !== W3.destr) { W3.destr = z; placeTrunks(); placeCanopies(season()); if (z) { recolorTerrain(season()); destroyGrass(z); } }
  const s = season(); if (s === W3.season) return; W3.season = s;
  recolorTerrain(s); placeCanopies(s); colorBushes(s); colorGrass(s);
  for (const d of W3.dens) d.material.color.set(d.userData.bramble ? (s === 3 ? '#6a7870' : '#2e4a24') : s === 3 ? '#8a9890' : s === 2 ? '#7a6a30' : '#3f6a30');
}
function updateCamera(dt, tx, tz, title) {
  if (title) { CAMS.yaw += dt * 0.06; CAMS.pitch = 0.42; CAMS.dist = 420; }
  let yaw = CAMS.yaw, pitch = CAMS.pitch, dst = CAMS.dist, ty = surfaceY(tx, tz) + 16;
  // Gesprächs-Kamera: zwischen die Sprechenden, näher und tiefer
  const sp_ = !title && Dlg.open && Dlg.speaker, pc = P();
  if (sp_ && sp_ !== pc && sp_.x !== undefined && dist(sp_.x, sp_.y, pc.x, pc.y) < 260) {
    const mx = (sp_.x + pc.x) / 2, mz = (sp_.y + pc.y) / 2, a = Math.atan2(sp_.y - pc.y, sp_.x - pc.x);
    tx = mx; tz = mz; ty = surfaceY(mx, mz) + 16;
    const side = angDiff(CAMS.yaw, a + Math.PI / 2) < Math.PI / 2 && angDiff(CAMS.yaw, a + Math.PI / 2) > -Math.PI / 2 ? 1 : -1;
    yaw = a + side * Math.PI / 2; pitch = 0.16; dst = 58 + dist(sp_.x, sp_.y, pc.x, pc.y) * 0.45;
  } else if (!title && Dlg.open) { dst = CAMS.dist * 0.75; pitch = Math.max(0.2, CAMS.pitch - 0.1); }
  // Zeremonie: Blick von hinter dem Clan hinauf zum Hochstein
  if (!title && G.ceremony && Dlg.open && W3.rockTops) {
    const hs = denPos('hochstein'), rt = W3.rockTops.find(t => dist(t.x, t.y, hs.x, hs.y) < 60);
    if (rt) { const a = Math.atan2(hs.y - LM.lager.y, hs.x - LM.lager.x); tx = hs.x - Math.cos(a) * 60; tz = hs.y - Math.sin(a) * 60; ty = rt.top - 30; yaw = a; pitch = 0.05; dst = 300; }
  }
  CAMS.cy = lerp(CAMS.cy === undefined ? yaw : CAMS.cy, CAMS.cy === undefined ? yaw : CAMS.cy + angDiff(CAMS.cy, yaw), 1 - Math.pow(0.02, dt));
  CAMS.cp = lerp(CAMS.cp === undefined ? pitch : CAMS.cp, pitch, 1 - Math.pow(0.02, dt));
  CAMS.cd = lerp(CAMS.cd === undefined ? dst : CAMS.cd, dst, 1 - Math.pow(0.02, dt));
  if (CAMS.snap) { CAMS.cy = yaw; CAMS.cp = pitch; CAMS.cd = dst; }
  yaw = CAMS.cy; pitch = CAMS.cp; dst = CAMS.cd;
  // Kamera rückt näher, wenn ein Baumstamm, Fels oder eine Mauer im Weg ist
  if (!title) {
    const fx = -Math.cos(yaw), fz = -Math.sin(yaw);
    for (let d = 14; d < dst; d += 6) {
      const x = tx + fx * d * Math.cos(pitch), z = tz + fz * d * Math.cos(pitch);
      const a = colGrid.get(gkey(Math.floor(x / CELL), Math.floor(z / CELL)));
      let hit = false;
      if (a) for (const o of a) if (Math.hypot(x - o.x, z - o.y) < o.r * 1.3 + 7) { hit = true; break; }
      if (!hit) for (const R of OB.rects) if (R.kind !== 'fence' && x > R.x - 4 && x < R.x + R.w + 4 && z > R.y - 4 && z < R.y + R.h + 4) { hit = true; break; }
      if (hit) { const nd = Math.max(22, d - 8); CAMS.cd = Math.min(CAMS.cd, nd + 4); dst = nd; break; }
    }
  }
  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  let cx = tx - Math.cos(yaw) * dst * cp, cz = tz - Math.sin(yaw) * dst * cp, cy = ty + dst * sp;
  cy = Math.max(cy, heightAt(cx, cz) + 10);
  const k = CAMS.snap ? 1 : 1 - Math.pow(0.00002, dt); CAMS.snap = false;
  CAMS.x = lerp(CAMS.x, cx, k); CAMS.y = lerp(CAMS.y, cy, k); CAMS.z = lerp(CAMS.z, cz, k);
  CAMS.shake = Math.max(0, (CAMS.shake || 0) - dt * 8);
  const sh = CAMS.shake;
  CAMERA.position.set(CAMS.x + rand(-sh, sh), CAMS.y + rand(-sh, sh), CAMS.z + rand(-sh, sh)); CAMERA.lookAt(tx, ty, tz);
  const fov = !title && pc && pc.running ? 66 : 58; CAMERA.fov = lerp(CAMERA.fov, fov, 1 - Math.pow(0.05, dt)); CAMERA.updateProjectionMatrix();
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
    const spd = entSpeed(m, c, dt);
    animateCat(m, c, t, dt, { speed: spd, sleep: c.sleep && !c.moving, sneak: c === pc && G.player.sneak, player: c === pc, lungeP: c.lungeT > 0 ? 1 - c.lungeT / 0.17 : undefined, wind: c.wind > 0, flash: c.flash, fight: !!c.spar || nearestFoe(c, 180) && isFighterRank(c.rank) });
    footFx(m, c, spd);
  }
  for (const e of ENTS) {
    if (!near(e)) continue;
    if (e.kind === 'bagger') { const m = useModel(e, () => makeBaggerModel()); placeEnt(m, e); m.userData.arm.rotation.z = Math.sin(t * 1.3 + e.x) * 0.3; if (Math.random() < 0.3) FX3.dust(e.x - Math.cos(e.dir) * 30, e.y - Math.sin(e.dir) * 30, 1); continue; }
    if (e.beast) { const m = useModel(e, () => makeBeastModel(e.kind)); placeEnt(m, e); e.speed = entSpeed(m, e, dt); animateBeast(m, e, t); footFx(m, e, e.speed); }
    else {
      const m = useModel(e, () => makeCatModel(e.look, { star: e.star, collar: e.collar })); placeEnt(m, e);
      m.scale.setScalar((e.rank === 'anfuehrer' ? 1.08 : 1) * (e.look.size || 1) * (e.kit ? 0.55 : 1));
      const spd = entSpeed(m, e, dt);
      animateCat(m, e, t, dt, { speed: spd, wind: e.wind > 0, fight: e.hostile && !e.defeated, flash: e.flash, sleep: !!e.corpse });
      if (e.star) m.position.y += 6 + Math.sin(t * 1.5 + e.x) * 3;
      footFx(m, e, spd);
    }
  }
  for (const p of PREY) {
    if (!near(p)) continue;
    const m = useModel(p, () => makePreyModel(p.k));
    const y = p.k === 'fisch' ? waterLevel(p.y) - 3 : surfaceY(p.x, p.y) + (p.z || 0) * 1.6;
    const mv = p.st === 'flee' || p.st === 'wander';
    const hop = p.k === 'kaninchen' && mv ? Math.abs(Math.sin(t * 9 + p.x)) * 6 : p.k === 'amsel' && p.st !== 'fly' ? Math.abs(Math.sin(t * 7 + p.x)) * (Math.sin(t * 0.7 + p.y) > 0.3 ? 2 : 0) : mv ? Math.abs(Math.sin(t * 22 + p.x)) * 0.8 : 0;
    m.position.set(p.x, y + hop, p.y); m.rotation.y = -p.dir;
    if (p.st2 === 'alert' && p.st !== 'flee') m.rotation.z = 0.35; else m.rotation.z = 0;
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
    m.position.set(6, -3.6, 0); m.rotation.set(Math.PI / 2, 0, -0.3); m.scale.setScalar(0.55);
  }
  for (const [k, m] of W3.models) if (m.userData.seen !== W3.frame) { m.parent && m.parent.remove(m); disposeModel(m); W3.models.delete(k); }
}
function entSpeed(m, e, dt) {
  const u = m.userData;
  const d = u.lx === undefined ? 0 : dist(u.lx, u.ly, e.x, e.y);
  u.lx = e.x; u.ly = e.y;
  const v = dt > 0 ? Math.min(d / dt, 600) : 0;
  u.spd = lerp(u.spd || 0, v, 0.25);
  return u.spd;
}
function footFx(m, e, spd) {
  const u = m.userData, ph = e.phase || 0, step = Math.floor(ph / Math.PI);
  if (u.step === undefined) u.step = step;
  if (step !== u.step) {
    u.step = step;
    if (dist(e.x, e.y, CAMERA.position.x, CAMERA.position.z) < 500) {
      if (inRiver(e.x, e.y)) FX3.splash(e.x, e.y);
      else if (spd > 190 || (e.beast && spd > 120)) FX3.dust(e.x - Math.cos(e.dir) * 8, e.y - Math.sin(e.dir) * 8, 2);
    }
  }
  const wet = inRiver(e.x, e.y);
  if (wet && !u.wet && dist(e.x, e.y, CAMERA.position.x, CAMERA.position.z) < 500) { FX3.splash(e.x, e.y); FX3.splash(e.x, e.y); }
  u.wet = wet;
}
function placeEnt(m, e) {
  let y = surfaceY(e.x, e.y);
  if (e.onRock && W3.rockTops) { const t = W3.rockTops.find(t => dist(t.x, t.y, e.x, e.y) < 60); if (t) y = t.top; }
  if ((inRiver(e.x, e.y) && !inRoad(e.x, e.y)) || inLake(e.x, e.y) || inOcean(e.x, e.y)) y -= 4;
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
  U_TIME.value = t;
  if (W3.waterTex) { W3.waterTex.offset.y -= dt * 0.12; W3.waterTex.offset.x = Math.sin(t * 0.3) * 0.05; }
  if (!title && !window.NORENDER_FX) FX3.ambient(dt, t);
  FX3.update(dt, t);
  if (W3.composer && GFX.hoch) { W3.bloom.strength = lerp(0.3, 0.7, 1 - dayFactor()) + (G.fire ? 0.2 : 0); W3.composer.render(dt); }
  else R3.render(SC, CAMERA);
}
