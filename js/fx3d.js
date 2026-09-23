'use strict';
// ===== Effekte: Partikel, Krallenspuren, Umgebung (Blätter, Glühwürmchen, Schmetterlinge) =====
const FX3 = {
  max: 1500, parts: [], sysN: null, sysA: null, slashes: [], ambT: 0,
  init() {
    const make = additive => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(this.max * 3), 3));
      g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(this.max * 3), 3));
      g.setAttribute('size', new THREE.BufferAttribute(new Float32Array(this.max), 1));
      g.setAttribute('alpha', new THREE.BufferAttribute(new Float32Array(this.max), 1));
      const m = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
        vertexShader: `attribute float size; attribute float alpha; varying vec3 vC; varying float vA;
          void main(){ vC = color; vA = alpha; vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = size * (420.0 / -mv.z); gl_Position = projectionMatrix * mv; }`,
        fragmentShader: `varying vec3 vC; varying float vA;
          void main(){ vec2 d = gl_PointCoord - 0.5; float r = length(d); if (r > 0.5) discard; float a = smoothstep(0.5, 0.1, r) * vA; gl_FragColor = vec4(vC, a); }`,
        vertexColors: true
      });
      const p = new THREE.Points(g, m); p.frustumCulled = false; SC.add(p); return p;
    };
    this.sysN = make(false); this.sysA = make(true);
    // Krallenspur-Textur
    const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
    x.strokeStyle = '#fff'; x.lineCap = 'round';
    for (let i = 0; i < 3; i++) { x.lineWidth = 7 - i; x.beginPath(); x.arc(20 + i * 10, 118 - i * 4, 90, -1.2, -0.25); x.stroke(); }
    const tex = new THREE.CanvasTexture(c);
    for (let i = 0; i < 6; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: 0xffffff, transparent: true, depthTest: false, opacity: 0 }));
      s.scale.set(26, 26, 1); s.visible = false; SC.add(s); this.slashes.push({ s, t: 0 });
    }
  },
  add(o) {
    if (this.parts.length > this.max * 2 - 10) return;
    this.parts.push(Object.assign({ vx: 0, vy: 0, vz: 0, life: 1, t: 0, size: 3, col: [1, 1, 1], grav: 0, drag: 1, add: false, wob: 0, fade: 1 }, o));
  },
  burst(x, y, z, n, o) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU, sp = (o.speed || 40) * (0.4 + Math.random() * 0.8);
      this.add(Object.assign({}, o, { x: x + rand(-2, 2), y: y + rand(-2, 2), z: z + rand(-2, 2), vx: Math.cos(a) * sp, vz: Math.sin(a) * sp, vy: (o.up || 30) * (0.5 + Math.random()), life: (o.life || 0.8) * (0.6 + Math.random() * 0.6) }));
    }
  },
  col(hex) { _c.set(hex); return [_c.r, _c.g, _c.b]; },
  // --- fertige Effekte ---
  dust(x, z, n = 3) { const y = surfaceY(x, z) + 1; const c = season() === 3 ? [0.95, 0.97, 1] : [0.55, 0.46, 0.34]; this.burst(x, y, z, n, { col: c, size: 5, speed: 18, up: 10, life: 0.6, grav: -4, drag: 0.9 }); },
  splash(x, z) { this.burst(x, waterLevel(z) + 1, z, 8, { col: [0.75, 0.88, 1], size: 3, speed: 30, up: 45, life: 0.6, grav: 120 }); },
  sparkle(x, y, z, hex = '#ffe070', n = 18) { this.burst(x, y, z, n, { col: this.col(hex), size: 3.5, speed: 30, up: 40, life: 1, grav: 20, add: true }); },
  levelUp(x, y, z) { for (let i = 0; i < 40; i++) { const a = i / 40 * TAU * 3; this.add({ x: x + Math.cos(a) * 18, y: y + i * 0.8, z: z + Math.sin(a) * 18, vy: 30, life: 1.4, size: 4, col: this.col(i % 2 ? '#ffe070' : '#ffffff'), add: true }); } },
  hit(t, src) {
    const y = surfaceY(t.x, t.y) + 16;
    const look = t.look || { base: t.beast ? (BEASTS[t.kind] || {}).col || '#777' : '#888' };
    this.burst(t.x, y, t.y, 7, { col: this.col(look.base || '#888'), size: 3, speed: 35, up: 25, life: 0.7, grav: 40, drag: 0.85 });
    const sl = this.slashes.find(s => s.t <= 0) || this.slashes[0];
    sl.t = 0.28; sl.s.visible = true; sl.s.position.set(t.x, y + 4, t.y); sl.s.material.rotation = rand(-0.6, 0.6); sl.s.material.color.set(t === P() ? '#ff7070' : '#ffffff');
  },
  // --- Umgebung rund um die Kamera ---
  ambient(dt, t) {
    this.ambT -= dt; if (this.ambT > 0) return; this.ambT = 0.05;
    const pc = P(), s = season(), night = isNight(), f = dayFactor();
    const rx = () => pc.x + rand(-450, 450), rz = () => pc.y + rand(-450, 450);
    if (s === 2 && Math.random() < 0.6) { const x = rx(), z = rz(); this.add({ x, y: surfaceY(x, z) + rand(60, 120), z, vy: -12, vx: rand(-8, 8), vz: rand(-8, 8), life: 7, size: 3.5, col: this.col(pick(['#d9782b', '#c0402a', '#e8b030', '#a86a2a'])), wob: 1.5 }); }
    if (s === 0 && Math.random() < 0.25) { const x = rx(), z = rz(); this.add({ x, y: surfaceY(x, z) + rand(50, 100), z, vy: -8, life: 7, size: 2.5, col: this.col('#ffd8e8'), wob: 1.2 }); }
    if (night && (s === 0 || s === 1) && Math.random() < 0.5 && territoryAt(pc.x, pc.y) !== 'zweibeiner') { const x = rx(), z = rz(); this.add({ x, y: surfaceY(x, z) + rand(5, 30), z, life: 4, size: 4, col: this.col('#e8ff80'), add: true, wob: 2.5, blink: true }); }
    if (!night && f > 0.9 && s === 1 && Math.random() < 0.08) { const x = rx(), z = rz(); this.add({ x, y: surfaceY(x, z) + rand(8, 25), z, life: 6, size: 1.8, col: this.col(pick(['#ffffff', '#ffd84a', '#9ad0ff', '#ff9ad0'])), wob: 3, flutter: true }); }
    if (G.fire && Math.random() < 0.9) for (let i = 0; i < 3; i++) { const a = Math.random() * TAU, d = Math.sqrt(Math.random()) * G.fire.r, x = G.fire.x + Math.cos(a) * d, z = G.fire.y + Math.sin(a) * d; this.add({ x, y: heightAt(x, z) + 20, z, vy: rand(40, 90), vx: rand(-10, 10), vz: rand(-10, 10), life: 1.6, size: 2.5, col: this.col('#ffb040'), add: true, wob: 1 }); }
    // Schwebende Lichtpunkte: tagsüber goldene Funken im Wald, nachts blaue Sternenfunken
    if (PAINT.on && Math.random() < 0.55) {
      const x = pc.x + rand(-350, 350), z = pc.y + rand(-350, 350), y = surfaceY(x, z) + rand(5, 70);
      if (f > 0.4) this.add({ x, y, z, vy: rand(-2, 4), life: rand(4, 7), size: rand(4, 8), col: this.col(pick(['#fff2b0', '#e8ffb0', '#ffe8a0'])), add: true, wob: 0.6, blink: true });
      else for (let q = 0; q < 3; q++) this.add({ x: x + rand(-80, 80), y: y + rand(0, 90), z: z + rand(-80, 80), vy: rand(-1, 3), life: rand(3, 6), size: rand(2.5, 6), col: this.col(pick(['#bfe0ff', '#ffffff', '#9fc8ff'])), add: true, wob: 0.4, blink: true });
    }
    for (const e of ENTS) if (e.star && Math.random() < 0.5) this.add({ x: e.x + rand(-10, 10), y: surfaceY(e.x, e.y) + rand(5, 25), z: e.y + rand(-10, 10), vy: 12, life: 1.2, size: 2.5, col: this.col('#bfe3ff'), add: true });
  },
  update(dt, t) {
    const N = this.sysN.geometry.attributes, A = this.sysA.geometry.attributes;
    let n = 0, a = 0;
    for (let i = this.parts.length - 1; i >= 0; i--) {
      const p = this.parts[i];
      p.t += dt; if (p.t >= p.life) { this.parts.splice(i, 1); continue; }
      p.vy -= p.grav * dt; const d = Math.pow(p.drag, dt * 60); p.vx *= d; p.vz *= d;
      if (p.wob) { p.vx += Math.sin(t * p.wob * 2 + i) * dt * 20; p.vz += Math.cos(t * p.wob * 1.7 + i) * dt * 20; if (p.flutter) p.vy = Math.sin(t * 9 + i) * 15; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      const k = p.t / p.life; let al = k < 0.15 ? k / 0.15 : 1 - Math.max(0, (k - 0.6) / 0.4);
      if (p.blink) al *= 0.5 + 0.5 * Math.sin(t * 6 + i);
      const S = p.add ? A : N, j = p.add ? a++ : n++;
      if (j >= this.max) continue;
      S.position.setXYZ(j, p.x, p.y, p.z); S.color.setXYZ(j, p.col[0], p.col[1], p.col[2]); S.size.setX(j, p.size); S.alpha.setX(j, al);
    }
    for (const [S, c] of [[N, n], [A, a]]) { const m = Math.min(c, this.max); for (const k of ['position', 'color', 'size', 'alpha']) S[k].needsUpdate = true; S.position.count; }
    this.sysN.geometry.setDrawRange(0, Math.min(n, this.max)); this.sysA.geometry.setDrawRange(0, Math.min(a, this.max));
    for (const sl of this.slashes) if (sl.t > 0) { sl.t -= dt; const k = 1 - sl.t / 0.28; sl.s.material.opacity = 1 - k; sl.s.scale.setScalar(18 + k * 16); if (sl.t <= 0) sl.s.visible = false; }
  }
};
