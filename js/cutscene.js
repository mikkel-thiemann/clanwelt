'use strict';
// ===== Filmszenen: Katzen laufen wirklich, die Kamera schaut zu – der Dialog wartet so lange =====
// In einem Dialog: ACT({ cap: 'Blaustern geht ins Ahnentor …', moves: [['blaustern', 'hoehle', { hide: true }]] })
// moves: [wer, wohin, { sp, from, hide, sleep, delay, dx, dy, say, face }]
//   wer:   Katzen-ID, 'player' oder ID eines Wesens (ENTS)
//   wohin: Ortsname (LM), 'hoehle' (Eingang zum Mondstein), 'den:heiler', 'player', eine Katzen-ID, {x,y} oder eine Funktion
// weitere Optionen: cam (wen die Kamera zeigt), dist, pitch, wait (Sekunden danach), max, pass (Minuten, die vergehen),
//   glow ({x,y} oder Ort: Sternenglitzern), start(), tick(dt, t), end(), shake
function ACT(o) { return { act: o }; }
function actor(id) {
  if (id === 'player') return P();
  if (typeof id === 'object') return id;
  return catById(id) || ENTS.find(e => e.id === id && !e.gone) || null;
}
function actPt(to, e) {
  if (typeof to === 'function') return to(e);
  if (typeof to === 'object' && to) return to;
  if (to === 'hoehle') return { x: LM.mondstein.x, y: LM.mondstein.y - 40 };
  if (typeof to === 'string' && to.startsWith('den:')) return denPos(to.slice(4));
  if (LM[to]) return LM[to];
  const a = actor(to); if (a) return { x: a.x, y: a.y };
  return { x: e.x, y: e.y };
}
const Cut = {
  cur: null,
  start(o) {
    const c = { o, t: 0, movers: [], doneT: 0, wait: o.wait !== undefined ? o.wait : 1.2, max: o.max || 16, glowT: 0 };
    if (o.start) o.start();
    for (const [id, to, opt0] of o.moves || []) {
      const opt = opt0 || {}, e = actor(id); if (!e) continue;
      if (opt.from) { const f = actPt(opt.from, e); e.x = f.x + (opt.fdx || 0); e.y = f.y + (opt.fdy || 0); if (typeof FX3 !== 'undefined' && FX3.sysN && opt.hideStart) FX3.dust(e.x, e.y, 6); }
      if (!opt.keepHidden) e.hidden = false;
      e.sleep = false;
      const p = actPt(to, e);
      const m0 = { e, x: p.x + (opt.dx || 0), y: p.y + (opt.dy || 0), sp: opt.sp || 120, opt, arrived: false }; c.movers.push(m0);
      const cat = G.cats.includes(e) && e !== P(); if (cat) { m0.prevAi = e.ai; e.ai = { m: 'hold' }; }
    }
    const f = o.cam ? actor(o.cam) || actPt(o.cam, P()) : (c.movers[0] ? c.movers[0].e : P());
    c.focus = f; c.fx = f.x; c.fy = f.y;
    c.yaw = CAMS.cy !== undefined ? CAMS.cy : CAMS.yaw;
    this.cur = c;
    $('dialog').classList.add('hidden');
    const cap = $('cutcap'); if (cap) { cap.textContent = o.cap || ''; cap.classList.toggle('show', !!o.cap); }
    if (o.shake) CAMS.shake = o.shake;
  },
  focusPt() {
    const c = this.cur, f = c.focus;
    if (f && !f.hidden && f.x !== undefined) { c.fx = lerp(c.fx, f.x, 0.15); c.fy = lerp(c.fy, f.y, 0.15); }
    return { x: c.fx, y: c.fy };
  },
  arrive(m) {
    m.arrived = true;
    const e = m.e, o = m.opt;
    if (o.hide) { e.hidden = true; if (typeof FX3 !== 'undefined' && FX3.sysN) FX3.dust(e.x, e.y, 6); }
    if (o.sleep) e.sleep = true;
    if (o.face !== undefined) e.dir = typeof o.face === 'number' ? o.face : (() => { const p = actPt(o.face, e); return Math.atan2(p.y - e.y, p.x - e.x); })();
    if (o.arriveSay) say(e, o.arriveSay, 4);
  },
  tick(dt) {
    const c = this.cur; if (!c) return;
    c.t += dt;
    for (const m of c.movers) {
      const e = m.e;
      if (e.sayT > 0 && e !== P() && !e.kind) e.sayT -= dt;
      if (m.arrived || c.t < (m.opt.delay || 0)) { if (!m.arrived) continue; if (!e.hidden) { moveEnt(e, 0, 0, dt); if (m.opt.sleep) e.sleep = true; } continue; }
      if (m.opt.say && !m.said) { m.said = true; say(e, m.opt.say, 4); }
      if (steer(e, m.x, m.y, m.sp, dt, 8)) this.arrive(m);
      else if (c.t > c.max * 0.85) { e.x = m.x; e.y = m.y; this.arrive(m); }
    }
    // Begleiter laufen mit, damit die Szene lebendig bleibt
    for (const k of G.cats) if (k.alive && !k.hidden && k !== P() && k.ai && k.ai.m === 'follow' && !c.movers.some(m => m.e === k)) updateCat(k, dt, gameT);
    if (c.o.pass) G.time += c.o.pass * dt / Math.max(2, c.o.passT || 4);
    if (c.o.glow && typeof FX3 !== 'undefined' && FX3.sysN) { c.glowT -= dt; if (c.glowT <= 0) { c.glowT = 0.25; const g = actPt(c.o.glow, P()); FX3.sparkle(g.x + rand(-20, 20), surfaceY(g.x, g.y) + rand(6, 30), g.y + rand(-20, 20), c.o.glowCol || '#cfe4ff', 6); } }
    if (c.o.tick) c.o.tick(dt, c.t);
    if (c.movers.every(m => m.arrived)) c.doneT += dt;
    if (c.doneT >= c.wait || c.t > c.max) this.end();
  },
  skip() {
    const c = this.cur; if (!c || c.t < 0.8) return;
    for (const m of c.movers) if (!m.arrived) { m.e.x = m.x; m.e.y = m.y; this.arrive(m); }
    if (c.o.pass) G.time += c.o.pass * Math.max(0, 1 - c.t / Math.max(2, c.o.passT || 4));
    this.end();
  },
  end() {
    const c = this.cur; if (!c) return;
    this.cur = null;
    for (const m of c.movers) if (m.prevAi && m.e.ai && m.e.ai.m === 'hold') m.e.ai = m.prevAi;
    if (c.o.end) c.o.end();
    const cap = $('cutcap'); if (cap) cap.classList.remove('show');
    if (Dlg.open) { $('dialog').classList.remove('hidden'); Dlg.next(); }
  }
};
