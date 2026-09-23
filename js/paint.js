'use strict';
// ===== Malstil: Pinsel-Filter, Farbstimmung, Leinwand, Lichtstrahlen, Lichtsaum =====
const PAINT = { on: (() => { try { const v = localStorage.getItem('clanwelt_paint'); return v ? v === 'an' : GFX.hoch; } catch (e) { return true; } })() };
const U_RIM = { value: new THREE.Color(0.35, 0.3, 0.22) };

// Lichtsaum an den Rändern der Katzen (wie Gegenlicht in den Bildern)
function addRim(mat) {
  mat.onBeforeCompile = sh => {
    sh.uniforms.uRim = U_RIM;
    sh.fragmentShader = 'uniform vec3 uRim;\n' + sh.fragmentShader.replace('#include <opaque_fragment>',
      'float rimF = pow(1.0 - clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0), 2.6);\n  outgoingLight += uRim * rimF;\n  #include <opaque_fragment>');
  };
  mat.customProgramCacheKey = () => 'rim';
  return mat;
}

// Pinsel-Filter (Kuwahara): glättet Flächen und erhält Kanten – wirkt wie gemalt
const KuwaharaShader = {
  uniforms: { tDiffuse: { value: null }, res: { value: new THREE.Vector2(1280, 720) } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform vec2 res; varying vec2 vUv;
    #define R 4
    void main(){
      vec2 px = 1.0 / res;
      vec3 m0=vec3(0.),m1=vec3(0.),m2=vec3(0.),m3=vec3(0.),s0=vec3(0.),s1=vec3(0.),s2=vec3(0.),s3=vec3(0.);
      for (int j = -R; j <= 0; j++) for (int i = -R; i <= 0; i++) { vec3 c = texture2D(tDiffuse, vUv + vec2(i, j) * px).rgb; m0 += c; s0 += c * c; }
      for (int j = -R; j <= 0; j++) for (int i = 0; i <= R; i++) { vec3 c = texture2D(tDiffuse, vUv + vec2(i, j) * px).rgb; m1 += c; s1 += c * c; }
      for (int j = 0; j <= R; j++) for (int i = 0; i <= R; i++) { vec3 c = texture2D(tDiffuse, vUv + vec2(i, j) * px).rgb; m2 += c; s2 += c * c; }
      for (int j = 0; j <= R; j++) for (int i = -R; i <= 0; i++) { vec3 c = texture2D(tDiffuse, vUv + vec2(i, j) * px).rgb; m3 += c; s3 += c * c; }
      float n = float((R + 1) * (R + 1));
      m0 /= n; m1 /= n; m2 /= n; m3 /= n;
      float v0 = dot(abs(s0 / n - m0 * m0), vec3(1.)), v1 = dot(abs(s1 / n - m1 * m1), vec3(1.)), v2 = dot(abs(s2 / n - m2 * m2), vec3(1.)), v3 = dot(abs(s3 / n - m3 * m3), vec3(1.));
      vec3 c = m0; float mv = v0;
      if (v1 < mv) { mv = v1; c = m1; } if (v2 < mv) { mv = v2; c = m2; } if (v3 < mv) { c = m3; }
      gl_FragColor = vec4(c, 1.0);
    }`
};
// Farbstimmung, Vignette, Leinwandstruktur
const GradeShader = {
  uniforms: { tDiffuse: { value: null }, tint: { value: new THREE.Color(1, 1, 1) }, lift: { value: new THREE.Color(0, 0, 0) }, sat: { value: 1.15 }, vig: { value: 0.45 }, res: { value: new THREE.Vector2(1280, 720) }, grain: { value: 0.05 }, ink: { value: 0.75 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform vec3 tint; uniform vec3 lift; uniform float sat; uniform float vig; uniform vec2 res; uniform float grain; uniform float ink; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main(){
      vec3 c = texture2D(tDiffuse, vUv).rgb;
      vec2 px = 1.0 / res;
      float lN = dot(texture2D(tDiffuse, vUv + vec2(0., px.y)).rgb, vec3(.299,.587,.114)), lS = dot(texture2D(tDiffuse, vUv - vec2(0., px.y)).rgb, vec3(.299,.587,.114));
      float lE = dot(texture2D(tDiffuse, vUv + vec2(px.x, 0.)).rgb, vec3(.299,.587,.114)), lW = dot(texture2D(tDiffuse, vUv - vec2(px.x, 0.)).rgb, vec3(.299,.587,.114));
      float edge = length(vec2(lE - lW, lN - lS));
      c *= 1.0 - smoothstep(0.035, 0.12, edge) * ink;
      float l = dot(c, vec3(0.299, 0.587, 0.114));
      c = mix(vec3(l), c, sat) * tint + lift * (1.0 - l);
      vec2 d = vUv - 0.5; c *= 1.0 - vig * smoothstep(0.25, 0.85, length(d * vec2(1.25, 1.0)));
      vec2 p = vUv * res;
      float canvas = (h(floor(p / 2.0)) - 0.5) * 0.6 + (sin(p.x * 0.9) * sin(p.y * 0.9)) * 0.4;
      c *= 1.0 + canvas * grain;
      gl_FragColor = vec4(c, 1.0);
    }`
};
function initPaint() {
  const A = window.THREE_ADDONS; if (!A || !A.ShaderPass || !W3.composer) return;
  const passes = W3.composer.passes;
  W3.kuwa = new A.ShaderPass(KuwaharaShader);
  W3.grade = new A.ShaderPass(GradeShader);
  W3.composer.insertPass(W3.kuwa, 1);                       // nach dem Rendern
  W3.composer.insertPass(W3.grade, passes.length - 1);      // vor der Ausgabe
  applyPaint();
}
function applyPaint() {
  if (W3.kuwa) W3.kuwa.enabled = PAINT.on;
  if (W3.grade) W3.grade.enabled = PAINT.on;
  document.body.classList.toggle('paint', PAINT.on);
}
function setPaint(on) { PAINT.on = on; try { localStorage.setItem('clanwelt_paint', on ? 'an' : 'aus'); } catch (e) { } applyPaint(); }
function resizePaint(w, h) {
  const pr = R3.getPixelRatio();
  if (W3.kuwa) W3.kuwa.uniforms.res.value.set(w * pr, h * pr);
  if (W3.grade) W3.grade.uniforms.res.value.set(w * pr, h * pr);
}

// Lichtstrahlen, die durch die Baumkronen fallen
function buildShafts() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 256; const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(0.7, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 256);
  const side = g.createLinearGradient(0, 0, 64, 0); side.addColorStop(0, 'rgba(0,0,0,1)'); side.addColorStop(0.5, 'rgba(0,0,0,0)'); side.addColorStop(1, 'rgba(0,0,0,1)');
  g.globalCompositeOperation = 'destination-out'; g.fillStyle = side; g.fillRect(0, 0, 64, 256);
  const tex = new THREE.CanvasTexture(c);
  W3.shafts = [];
  for (let i = 0; i < 10; i++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).translate(0, -0.5, 0), new THREE.MeshBasicMaterial({ map: tex, color: 0xfff0b0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    m.visible = false; SC.add(m); W3.shafts.push({ m, x: 0, z: 0, ph: Math.random() * 10 });
  }
}
function updateShafts(t, tx, tz) {
  if (!W3.shafts) return;
  const f = dayFactor(), terr = territoryAt(tx, tz), forest = ['donner', 'schatten', 'fluss', 'baumgeviert', 'verlassen'].includes(terr);
  const want = PAINT.on && f > 0.4 && forest && !G.weather && !(G.flags && G.flags.zerstoert && tx < OLD_W);
  const ang = (hour() / 24) * TAU - Math.PI / 2, lx = Math.cos(ang) * 0.5, lz = 0.35;
  for (const s of W3.shafts) {
    if (!want) { s.m.visible = false; continue; }
    if (!s.m.visible || dist(s.x, s.z, tx, tz) > 420) { const a = Math.random() * TAU, d = rand(80, 380); s.x = tx + Math.cos(a) * d; s.z = tz + Math.sin(a) * d; s.w = rand(18, 45); s.ph = Math.random() * 10; }
    s.m.visible = true;
    const top = surfaceY(s.x, s.z) + 230;
    s.m.position.set(s.x, top, s.z); s.m.scale.set(s.w, 270, 1);
    s.m.lookAt(CAMERA.position.x, top, CAMERA.position.z); s.m.rotateZ(lx * 0.6); s.m.rotateX(-lz * 0.3);
    s.m.material.opacity = (0.08 + 0.07 * Math.sin(t * 0.4 + s.ph)) * f;
  }
}

// Stimmung je nach Tageszeit, Ort und Traum
function updateGrade(tx, tz) {
  const f = dayFactor(), dm = typeof dreamMode === 'function' ? dreamMode() : null;
  const forest = ['donner', 'schatten', 'fluss', 'baumgeviert'].includes(territoryAt(tx, tz));
  if (!W3.grade) { U_RIM.value.setRGB(0.3, 0.26, 0.2); return; }
  const G_ = W3.grade.uniforms;
  // Tag: warm-grün, Nacht: tiefblau (wie im SternenClan-Bild)
  const day = forest ? [1.02, 1.04, 0.92] : [1.05, 1.0, 0.95], night = [0.72, 0.9, 1.35];
  G_.tint.value.setRGB(lerp(night[0], day[0], f), lerp(night[1], day[1], f), lerp(night[2], day[2], f));
  G_.lift.value.setRGB(lerp(0.0, 0.02, f), lerp(0.03, 0.03, f), lerp(0.1, 0.0, f));
  G_.sat.value = lerp(1.35, 1.32, f); G_.vig.value = lerp(0.6, 0.42, f);
  U_RIM.value.setRGB(lerp(0.25, 0.42, f), lerp(0.4, 0.34, f), lerp(0.9, 0.22, f));
  if (dm === 'stern') { G_.tint.value.setRGB(0.75, 0.95, 1.5); U_RIM.value.setRGB(0.4, 0.6, 1.3); G_.vig.value = 0.7; }
  if (dm === 'finster') { G_.tint.value.setRGB(1.4, 0.7, 0.6); U_RIM.value.setRGB(0.8, 0.15, 0.05); G_.vig.value = 0.85; }
}

// Leinwand-Struktur als Überlagerung
function buildCanvasOverlay() {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  g.fillStyle = '#808080'; g.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 2) for (let x = 0; x < 256; x += 2) { const v = 128 + (Math.sin(x * 1.3) * Math.sin(y * 1.3)) * 18 + (Math.random() - 0.5) * 30 | 0; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(x, y, 2, 2); }
  const d = document.createElement('div'); d.id = 'paper'; d.style.backgroundImage = `url(${c.toDataURL()})`; document.body.appendChild(d);
}
