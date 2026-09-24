'use strict';
// ===== Oberfläche: Dialoge, HUD, Menüs =====
const $ = id => document.getElementById(id);

// ---------- Dialoge ----------
function whoInfo(who) {
  if (who && typeof who === 'object') return who;
  if (who === 'erz') return { name: '', look: null };
  if (who === 'alle') return { name: 'Der Clan', look: null, all: true };
  if (who === 'player') return P();
  return catById(who) || ENTS.find(e => e.id === who) || { name: who, look: null };
}
const Dlg = {
  open: false, lines: [], pending: [], cb: null, typing: 0, full: '', choosing: false,
  show(lines, cb, opt) {
    if (this.open) { this.pending.push({ lines, cb, opt }); return; }
    this.lines = lines.slice(); this.cb = cb || null; this.open = true; this.cine = !!(opt && opt.cine);
    document.body.classList.toggle('cine', this.cine);
    $('dialog').classList.remove('hidden');
    this.next();
  },
  next() {
    if (Cut.cur) { Cut.skip(); return; }
    if (this.choosing) return;
    if (this.typing < this.full.length) { this.typing = this.full.length; $('dlgText').textContent = this.full; return; }
    let line = this.lines.shift();
    while (line && line.do && !line.text) { line.do(); line = this.lines.shift(); }
    if (line && line.act) { Cut.start(line.act); return; }
    if (!line) {
      this.speaker = null;
      this.open = false; document.body.classList.remove('cine'); $('dialog').classList.add('hidden');
      const cb = this.cb; this.cb = null; if (cb) cb();
      if (!this.open && this.pending.length) { const p = this.pending.shift(); this.show(p.lines, p.cb, p.opt); }
      return;
    }
    if (Array.isArray(line)) line = { who: line[0], text: line[1] };
    const w = whoInfo(line.who);
    const isNarr = line.who === 'erz';
    this.speaker = isNarr || w.all ? this.speaker : w;
    $('dlgName').textContent = isNarr ? '' : (w.all ? w.name : nameOf(w) + (w.rank && RANKS[w.rank] && !w.name ? ' · ' + rankName(w) : ''));
    const pc = $('dlgPortrait'), g = pc.getContext('2d');
    pc.style.display = isNarr || w.all ? 'none' : 'block';
    if (!isNarr && w.look) drawPortrait(g, w.look, 160, 160, { star: w.alive === false });
    $('dialog').classList.toggle('narr', isNarr);
    this.full = line.text || ''; this.typing = 0; $('dlgText').textContent = '';
    const box = $('dlgChoices'); box.innerHTML = '';
    this.choosing = !!line.choices;
    $('dlgNext').style.visibility = line.choices ? 'hidden' : 'visible';
    if (line.choices) {
      this.typing = this.full.length; $('dlgText').textContent = this.full;
      line.choices.forEach((ch, i) => {
        const b = document.createElement('button'); b.className = 'choice'; b.textContent = `${i + 1}. ${ch.t}`;
        b.onclick = e => { e.stopPropagation(); this.choose(ch); };
        box.appendChild(b);
      });
      this.curChoices = line.choices;
    }
  },
  choose(ch) {
    if (!this.choosing) return;
    this.choosing = false; $('dlgChoices').innerHTML = '';
    const r = ch.fn ? ch.fn() : null;
    if (Array.isArray(r)) this.lines.unshift(...r);
    this.next();
  },
  tick(dt) {
    if (Cut.cur) Cut.tick(dt);
    if (!this.open || this.typing >= this.full.length) return;
    this.typing = Math.min(this.full.length, this.typing + dt * 70);
    $('dlgText').textContent = this.full.slice(0, Math.floor(this.typing));
  }
};

// ---------- Große Titel (Buch-Anfang) ----------
const BOOKS = ['', 'In die Wildnis', 'Feuer und Eis', 'Geheimnisse des Waldes', 'Vor dem Sturm', 'Pfad der Gefahr', 'Stunde der Finsternis', 'Mitternacht', 'Mondschein', 'Morgenröte', 'Sternenglanz', 'Dämmerung', 'Sonnenuntergang'];
function titleCard(top, main, sub) {
  const d = $('titlecard'); d.innerHTML = `<div class="tc1">${top}</div><div class="tc2">${main}</div>` + (sub ? `<div class="tc3"><b>Was bisher geschah:</b> ${sub}</div>` : '');
  d.classList.remove('show'); void d.offsetWidth; d.classList.add('show');
}

// ---------- Meldungen ----------
function toast(text) {
  const box = $('toasts'), d = document.createElement('div');
  d.className = 'toast'; d.textContent = text; box.appendChild(d);
  while (box.children.length > 4) box.removeChild(box.firstChild);
  setTimeout(() => { d.classList.add('out'); setTimeout(() => d.remove(), 500); }, 4200);
}
function chron(text) { G.chron.push({ m: moon() + 1, s: SEASONS[season()], t: text }); }

// ---------- HUD ----------
const UI = {
  panel: null, tab: 'uebersicht', hudT: 0,
  hud(dt) {
    this.hudT -= dt; if (this.hudT > 0) return; this.hudT = 0.2;
    const pc = P(); if (!pc) return;
    const img = $('portrait'), u = portraitURL(pc.look, 64);
    if (img.dataset.u !== u) { img.src = u; img.dataset.u = u; }
    $('pName').textContent = catName(pc);
    $('pRank').textContent = `${rankName(pc)} · Stufe ${pc.lvl}` + (G.player.points ? ` · ⭐${G.player.points} (L)` : '');
    setBar('bHp', pc.hp / pc.maxHp, '#e0524a'); setBar('bHunger', G.player.hunger / 100, '#e0a040'); setBar('bSta', G.player.stamina / 100, '#5ab0e0');
    setBar('bXp', pc.xp / xpNeed(pc), '#b48ae8');
    $('lives').textContent = pc.rank === 'anfuehrer' ? '✦'.repeat(G.player.lives) + ` ${G.player.lives} Leben` : '';
    // Aufgaben
    let h = '';
    if (Story.paused()) h += `<div class="ch">🌿 Zwischen den Kapiteln</div><h4>➤ ${Story.text()}</h4>`;
    else if (!Story.done()) { const q = Story.quest(); h += `<div class="ch">${q.ch > 6 ? 'Staffel 2 · ' : ''}Buch ${q.ch} · ${q.title}</div><h4>➤ ${Story.text() || ''}</h4>`; }
    else if (G.freeplay) h += `<div class="ch">Freies Spiel</div><h4>Führe deinen Clan durch die Monde</h4>`;
    if (G.missions.length) h += '<div class="ms">' + G.missions.map(m => `<div>◆ ${m.title}${m.n > 1 && m.type !== 'drive' && m.type !== 'beast' ? ` (${Math.min(m.prog, m.n)}/${m.n})` : ''}${m.type === 'herbs' && m.prog >= m.n ? ' → zum Heiler' : ''}</div>`).join('') + '</div>';
    if (G.eventQ.length && !Dlg.open) h += `<div class="ms">⚠ Eine Entscheidung wartet (weg von Kämpfen)</div>`;
    $('quest').innerHTML = h;
    const hr = hour(), mm = Math.floor(G.time % 60);
    $('clock').innerHTML = `${moonIcon()} ${String(Math.floor(hr)).padStart(2, '0')}:${String(mm).padStart(2, '0')} · Tag ${day() + 1} · Mond ${moon() + 1}<br>${SEASONS[season()]}${G.weather ? ' · ' + (G.weather === 'regen' ? '🌧' : '❄') : ''}<br><b>${TERR_NAMES[territoryAt(pc.x, pc.y)]}</b>`;
    const carry = G.player.carry.map(k => PREY_T[k].n).join(', ');
    const herbs = Object.entries(G.player.herbs).filter(([k, v]) => v > 0).map(([k, v]) => `${HERBS[k].n} ×${v}`).join(', ');
    $('carry').innerHTML = (carry ? `🐭 Beute: ${carry}` : '') + (herbs ? `<br>🌿 ${herbs}` : '') + (G.player.sneak ? '<br>🐾 <b>Schleichen</b>' : '');
    $('carry').style.display = carry || herbs || G.player.sneak ? 'block' : 'none';
    drawMinimap();
  },
};
function setBar(id, f, col) { const e = $(id); e.style.width = clamp(f * 100, 0, 100) + '%'; e.style.background = col; }
function moonIcon() { return ['🌒', '🌕', '🌘'][day() % 3]; }

function drawMinimap() {
  const c = $('minimap'), g = c.getContext('2d'), pc = P();
  const vw = 1700, vh = vw * c.height / c.width, x0 = clamp(pc.x - vw / 2, 0, W - vw), y0 = clamp(pc.y - vh / 2, 0, H - vh);
  g.drawImage(terrainCanvas, x0 * TS, y0 * TS, vw * TS, vh * TS, 0, 0, c.width, c.height);
  const sx = c.width / vw, sy = c.height / vh;
  g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(0, 0, c.width, c.height);
  for (const cp of OB.camps) { g.fillStyle = CLAN_COLORS[cp.clan]; g.beginPath(); g.arc((cp.lm.x - x0) * sx, (cp.lm.y - y0) * sy, 5, 0, TAU); g.fill(); }
  for (const e of ENTS) if (e.hostile) { g.fillStyle = '#ff4040'; g.fillRect((e.x - x0) * sx - 2, (e.y - y0) * sy - 2, 4, 4); }
  for (const t of targets()) { g.fillStyle = t.col; g.beginPath(); g.arc(clamp((t.x - x0) * sx, 4, c.width - 4), clamp((t.y - y0) * sy, 4, c.height - 4), 4, 0, TAU); g.fill(); }
  g.save(); g.translate((pc.x - x0) * sx, (pc.y - y0) * sy); g.rotate(pc.dir); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(6, 0); g.lineTo(-4, -4); g.lineTo(-4, 4); g.fill(); g.restore();
}
function targets() {
  const out = [];
  const st = Story.target(); if (st) out.push({ x: st.x, y: st.y, col: '#ffd24a', main: true });
  for (const m of G.missions) { const t = Missions.target(m); if (t) out.push({ x: t.x, y: t.y, col: '#6ec8ff' }); }
  return out;
}

// ---------- Panels ----------
function openPanel(name) {
  if (Dlg.open) return;
  if (UI.panel === name) { closePanel(); return; }
  UI.panel = name; const p = $('panel'); p.classList.remove('hidden');
  renderPanel();
}
function closePanel() { UI.panel = null; $('panel').classList.add('hidden'); }
function renderPanel() {
  const p = $('panel'), n = UI.panel;
  const head = t => `<div class="phead"><h2>${t}</h2><button class="x" data-act="close">✕</button></div>`;
  if (n === 'clan') p.innerHTML = head('DonnerClan') + clanPanel();
  else if (n === 'chron') p.innerHTML = head('Lebensweg & Chronik') + chronPanel();
  else if (n === 'map') { p.innerHTML = head('Karte des Waldes') + '<canvas id="bigmap"></canvas>'; drawBigMap(); }
  else if (n === 'skills') p.innerHTML = head('Fähigkeiten') + skillsPanel();
  else if (n === 'menu') p.innerHTML = head('Pause') + menuPanel();
  else if (n === 'help') p.innerHTML = head('Steuerung') + HELP_HTML;
}
function bar(label, v, col) { return `<div class="sbar"><span>${label}</span><div class="bar big"><i style="width:${clamp(v, 0, 100)}%;background:${col}"></i></div><b>${Math.round(v)}%</b></div>`; }
function clanPanel() {
  const pc = P(), st = clanStats(), cs = clanCats();
  const canManage = pc.rank === 'zweiter' || pc.rank === 'anfuehrer';
  const tabs = [['uebersicht', 'Übersicht'], ['mitglieder', 'Mitglieder'], ['patrouillen', 'Patrouillen'], ['sternen', 'SternenClan']];
  let h = `<div class="tabs">${tabs.map(([k, t]) => `<button data-tab="${k}" class="${UI.tab === k ? 'on' : ''}">${t}</button>`).join('')}</div>`;
  if (pc.clan !== 'donner') return h + '<p>Du gehörst noch keinem Clan an. Folge deinem Herzen in den Wald …</p>';
  if (UI.tab === 'uebersicht') {
    const counts = {}; cs.forEach(c => counts[c.rank] = (counts[c.rank] || 0) + 1);
    h += `<div class="grid2"><div><h3>Clan-Mitglieder: ${st.n}</h3><table class="cnt">${RANK_ORDER.filter(r => counts[r]).map(r => `<tr><td>${RANKS[r][0]}</td><td>${counts[r]}</td></tr>`).join('')}</table>
      <p class="small">Frischbeute: ${Math.floor(G.clan.pile)} Stück · Dein Ansehen: ${Math.round(G.player.rep)}</p></div>
      <div><h3>Zustand</h3>${bar('Nahrung', st.food, '#e0a040')}${bar('Gesundheit', st.health, '#e0524a')}${bar('Moral', st.morale, '#b48ae8')}${bar('Territorium', st.terr, '#6ab04a')}
      <h3>Andere Clans</h3>${Object.keys(G.others).map(k => `<div class="sbar"><span>${CLAN_NAMES[k]}</span><div class="bar big"><i style="width:${G.others[k].rel}%;background:${CLAN_COLORS[k]}"></i></div><b>${relWord(G.others[k].rel)}</b></div><div class="small">Anführer: ${clanLeaderName(k)} · Stärke ${G.others[k].str} Katzen</div>`).join('')}</div></div>
      ${G.prophecies.length ? `<h3>Prophezeiungen</h3>${G.prophecies.map(p => `<p class="proph">✧ ${p}</p>`).join('')}` : ''}`;
  } else if (UI.tab === 'mitglieder') {
    const sorted = cs.slice().sort((a, b) => RANK_ORDER.indexOf(a.rank) - RANK_ORDER.indexOf(b.rank));
    h += `<p class="small">${G.freeplay ? 'Als Anführer kannst du andere Katzen deines Clans spielen – so erlebst du die Geschichte aus neuen Blickwinkeln.' : ''}</p><div class="members">` + sorted.map(c => {
      const m = c.mentor && catById(c.mentor);
      const btns = [];
      if (c !== pc) {
        if (G.freeplay && c.rank !== 'junges') btns.push(`<button data-play="${c.id}">Spielen</button>`);
        if ((canManage || c.rel > 60) && isFighterRank(c.rank) && G.stage !== 'schueler') btns.push(`<button data-follow="${c.id}">${c.ai && c.ai.m === 'follow' ? 'Heimschicken' : 'Mitnehmen'}</button>`);
        if (pc.rank === 'anfuehrer' && c.rank === 'krieger' && !cs.some(k => k.rank === 'zweiter')) btns.push(`<button data-deputy="${c.id}">Zum Zweiten Anführer</button>`);
      }
      return `<div class="mem ${c === pc ? 'me' : ''}"><img src="${portraitURL(c.look, 48)}"><div><b>${catName(c)}</b> <span class="small">${rankName(c)} · ${c.age} Monde · ${c.sex === 'w' ? '♀' : '♂'} · Stufe ${c.lvl}</span><br><span class="small">${m ? 'Mentor: ' + catName(m) + ' · ' : ''}${c !== pc ? 'Freundschaft: ' + relWord(c.rel) : 'Das bist du'}${c.hurt ? ' · 🩹 verletzt' : ''}</span></div><div class="mb">${btns.join('')}</div></div>`;
    }).join('') + '</div>';
  } else if (UI.tab === 'patrouillen') {
    if (!canManage) return h + '<p>Nur der Zweite Anführer und der Anführer teilen die Patrouillen ein.</p>';
    const f = cs.filter(c => (c.rank === 'krieger' || c.rank === 'schueler' || c.rank === 'zweiter') && c !== pc);
    const cnt = d => f.filter(c => c.duty === d).length;
    h += `<p class="small">Jagdpatrouillen füllen den Frischbeutehaufen. Grenzpatrouillen schützen das Territorium. Katzen im Lager erholen sich (Gesundheit).</p>
      <p><b>Jagd: ${cnt('jagd')}</b> · <b>Grenze: ${cnt('grenze')}</b> · <b>Lager: ${cnt('lager')}</b></p><div class="members">` + f.map(c => `<div class="mem"><img src="${portraitURL(c.look, 48)}"><div><b>${catName(c)}</b><br><span class="small">${rankName(c)}</span></div><div class="mb">${['jagd', 'grenze', 'lager'].map(d => `<button data-duty="${c.id}:${d}" class="${c.duty === d ? 'on' : ''}">${{ jagd: 'Jagd', grenze: 'Grenze', lager: 'Lager' }[d]}</button>`).join('')}</div></div>`).join('') + '</div>';
  } else if (UI.tab === 'sternen') {
    const dead = G.cats.filter(c => !c.alive && (c.clan === 'donner' || c.id === 'rotschweif'));
    h += `<p class="small">Die Katzen, die zum SternenClan gegangen sind, wachen vom Silbervlies über den Clan.</p><div class="members">` + (dead.map(c => `<div class="mem star"><img src="${portraitURL(c.look, 48, true)}"><div><b>${catName(c)}</b><br><span class="small">${rankName(c)}${c.deathMoon !== undefined ? ' · gestorben in Mond ' + (c.deathMoon + 1) : ''}</span></div></div>`).join('') || '<p>Noch niemand.</p>') + '</div>';
  }
  return h;
}
const relWord = r => r < 20 ? 'Feindschaft' : r < 40 ? 'Misstrauen' : r < 60 ? 'Neutral' : r < 80 ? 'Freundlich' : 'Eng verbunden';
const STAGE_ORDER = [['hauskaetzchen', 'Hauskätzchen'], ['schueler', 'Schüler'], ['krieger', 'Krieger'], ['zweiter', 'Zweiter Anführer'], ['anfuehrer', 'Anführer'], ['staffel2', 'Staffel 2'], ['staffel2b', 'Zweiter Anführer'], ['generation', 'Neue Generation']];
function chronPanel() {
  const cards = STAGE_ORDER.filter(([k]) => G.stages[k] || !['generation', 'staffel2', 'staffel2b'].includes(k)).map(([k, t]) => {
    const s = G.stages[k];
    return `<div class="stage ${s ? '' : 'locked'}">${s ? `<img src="${portraitURL(s.look, 72)}" style="width:${Math.round(44 + s.size * 28)}px">` : '<div class="q">?</div>'}<b>${s ? s.name : '???'}</b><span>${t}</span><span class="small">${s ? 'Mond ' + (s.moon + 1) : ''}</span></div>`;
  });
  let h = '<div class="life">' + cards.join('<div class="arr">➜</div>') + '</div><h3>Chronik des DonnerClans</h3><div class="chron">' + G.chron.slice().reverse().map(e => `<p><span class="small">Mond ${e.m} · ${e.s}</span><br>${e.t}</p>`).join('') + '</div>';
  return h;
}
function skillsPanel() {
  const pc = P(), sk = pc.sk, pts = G.player.points || 0;
  const info = { jagd: ['Jagen', 'Leiser schleichen, Beute bemerkt dich später. Ab 3 trägst du 3 Beute.'], kampf: ['Kämpfen', 'Mehr Schaden im Kampf.'], ausdauer: ['Ausdauer', 'Mehr Gesundheit und Kraft zum Rennen.'], tempo: ['Tempo', 'Schneller laufen und rennen.'] };
  return `<p>Freie Punkte: <b>${pts}</b> · Stufe ${pc.lvl} (${Math.floor(pc.xp)}/${xpNeed(pc)} EP)</p>` + Object.keys(info).map(k => `<div class="skill"><div><b>${info[k][0]}: ${sk[k]}</b><br><span class="small">${info[k][1]}</span></div><button data-skill="${k}" ${pts && sk[k] < 8 ? '' : 'disabled'}>+1</button></div>`).join('');
}
function menuPanel() {
  return `<div class="menu"><button data-act="close">▶ Weiterspielen</button><button data-act="save">💾 Speichern</button><button data-act="help">⌨ Steuerung</button><button data-act="gfx">🎨 Grafik: ${GFX.hoch ? 'Schön (hoch)' : 'Schnell (niedrig)'}</button><button data-act="paint">🖌 Malstil: ${PAINT.on ? 'an' : 'aus'}</button><button data-act="title">🏠 Hauptmenü</button><button data-act="new" class="danger">✧ Neues Spiel beginnen</button></div>
  <p class="small">Das Spiel speichert automatisch. Spielzeit: ${Math.floor(G.playTime / 60)} Minuten.</p>`;
}
const HELP_HTML = `<table class="help">
<tr><td>WASD / Pfeiltasten</td><td>Laufen (in Blickrichtung der Kamera)</td></tr><tr><td>Maus ziehen</td><td>Kamera drehen</td></tr><tr><td>Mausrad</td><td>Näher heran / weiter weg zoomen</td></tr><tr><td>Shift</td><td>Rennen (kostet Ausdauer)</td></tr>
<tr><td>Q</td><td>Schleichen an/aus – Beute hört dich kaum</td></tr><tr><td>Leertaste</td><td>Springen: Beute fangen oder angreifen</td></tr><tr><td>R / Linksklick</td><td>Pfotenhieb im Stehen (gleicher Schaden wie der Sprung)</td></tr><tr><td>Klick ins Bild</td><td>Maus einfangen: umsehen ohne Ziehen (Esc = freigeben)</td></tr>
<tr><td>E</td><td>Sprechen, Beute ablegen, Kräuter pflücken, schlafen</td></tr><tr><td>F</td><td>Fressen (getragene Beute oder vom Haufen)</td></tr>
<tr><td>H</td><td>Kräuter benutzen (heilen)</td></tr><tr><td>M</td><td>Karte</td></tr><tr><td>K</td><td>Clan-Bildschirm</td></tr><tr><td>J</td><td>Lebensweg & Chronik</td></tr>
<tr><td>L</td><td>Fähigkeiten verbessern</td></tr><tr><td>Esc</td><td>Pause-Menü</td></tr><tr><td>1–4</td><td>Antwort im Gespräch wählen</td></tr></table>
<p class="small">Tipps: Der goldene Pfeil zeigt dein nächstes Ziel, blaue Pfeile zeigen Aufträge. Das Gesetz der Krieger sagt: Erst wird der Clan gefüttert. Überquere den Donnerweg nur, wenn kein Monster kommt!</p>`;
function drawBigMap() {
  const c = $('bigmap'); if (!c) return;
  const box = $('panel').getBoundingClientRect(), wv = Math.min(box.width - 40, (box.height - 90) * W / H);
  c.width = wv; c.height = wv * H / W;
  const g = c.getContext('2d'), s = c.width / W;
  g.drawImage(terrainCanvas, 0, 0, c.width, c.height);
  g.font = 'bold 14px Trebuchet MS'; g.textAlign = 'center';
  const lab = (t, x, y, col) => { g.fillStyle = 'rgba(0,0,0,.6)'; g.fillText(t, x * s + 1, y * s + 1); g.fillStyle = col; g.fillText(t, x * s, y * s); };
  lab('DonnerClan', 2700, 2000, '#ffd98a'); lab('SchattenClan', 3300, 420, '#c8b8ff'); lab('FlussClan', 520, 2500, '#9fd8ff'); lab('WindClan', 620, 1000, '#fff3a0'); lab('Zweibeinerort', 2300, 4080, '#ddd'); lab('Hochfelsen', 1000, 80, '#ddd'); lab('Hochland', 4750, 2200, '#ddd');
  g.font = '11px Trebuchet MS';
  for (const k in LM) { const l = LM[k]; if (!G.seen[k]) continue; g.fillStyle = '#fff'; g.beginPath(); g.arc(l.x * s, l.y * s, 3, 0, TAU); g.fill(); lab(l.name, l.x, l.y - 40, '#fff'); }
  for (const t of targets()) { g.fillStyle = t.col; g.beginPath(); g.arc(t.x * s, t.y * s, 6, 0, TAU); g.fill(); g.strokeStyle = '#000'; g.stroke(); }
  const pc = P(); g.fillStyle = '#ff5030'; g.beginPath(); g.arc(pc.x * s, pc.y * s, 6, 0, TAU); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke();
}
function panelClick(e) {
  const b = e.target.closest('button'); if (!b) return;
  const d = b.dataset, pc = P();
  if (d.act === 'close') closePanel();
  else if (d.act === 'save') { saveGame(); toast('Spiel gespeichert.'); }
  else if (d.act === 'help') { UI.panel = 'help'; renderPanel(); }
  else if (d.act === 'paint') { setPaint(!PAINT.on); renderPanel(); toast(PAINT.on ? 'Malstil an – die Welt sieht aus wie gemalt.' : 'Malstil aus.'); }
  else if (d.act === 'gfx') { setGfx(!GFX.hoch); renderPanel(); toast(GFX.hoch ? 'Grafik: schön – mit Schatten, Leuchten und viel Gras.' : 'Grafik: schnell – für langsamere Geräte.'); }
  else if (d.act === 'title') { saveGame(); closePanel(); showTitle(); }
  else if (d.act === 'new') { if (confirm('Wirklich ein neues Spiel beginnen? Der alte Spielstand wird überschrieben.')) { closePanel(); newGame(); } }
  else if (d.tab) { UI.tab = d.tab; renderPanel(); }
  else if (d.duty) { const [id, du] = d.duty.split(':'); catById(id).duty = du; G.flags.dutySet = true; renderPanel(); }
  else if (d.play) { const c = catById(d.play); closePanel(); switchPlayer(c); }
  else if (d.follow) { const c = catById(d.follow); c.ai = c.ai && c.ai.m === 'follow' ? { m: 'home' } : { m: 'follow' }; renderPanel(); }
  else if (d.deputy) { const c = catById(d.deputy); setRank(c, 'zweiter'); news(`${catName(c)} ist der neue Zweite Anführer.`); renderPanel(); }
  else if (d.skill) { if (G.player.points > 0) { G.player.points--; pc.sk[d.skill]++; pc.maxHp = maxHpOf(pc); renderPanel(); } }
}
