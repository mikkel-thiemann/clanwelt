'use strict';
// ===== Die Geschichte – nach der ersten Staffel „Warrior Cats“ (Buch 1–6) =====
function place(id, x, y, m = 'hold') { const c = catById(id); if (!c) return; c.hidden = false; c.x = x; c.y = y; c.ai = { m }; c.hurt = false; return c; }
function follow(id) { const c = catById(id); if (c && c.alive) { c.hidden = false; c.ai = { m: 'follow' }; } }
function goHome(id) { const c = catById(id); if (c && c.alive) c.ai = { m: 'home' }; }
function nearPlayer(d = 120) { const pc = P(), a = pc.dir + Math.PI + rand(-0.8, 0.8); return { x: pc.x + Math.cos(a) * d, y: pc.y + Math.sin(a) * d }; }
function spar(id) { const c = catById(id); const p = nearPlayer(110); place(id, p.x, p.y); c.spar = true; c.group = id; c.hp = c.maxHp; c.atkCd = 1.2; return c; }
function renamePlayer(rank, suf) { const pc = P(); delete pc.fixed; pc.clan = 'donner'; if (suf) pc.suf = suf; setRank(pc, rank); pc.hp = pc.maxHp; }
function setStage(k) { G.stage = k; const pc = P(); G.stages[k] = { moon: moon(), name: catName(pc), look: JSON.parse(JSON.stringify(pc.look)), size: catSize(pc), rank: rankName(pc) }; }
function storyFoes(group, team, n, at, o = {}) {
  for (let i = 0; i < n; i++) { const a = i / n * TAU; spawnClanCat(team, at.x + Math.cos(a) * 90 + rand(-30, 30), at.y + Math.sin(a) * 90 + rand(-30, 30), Object.assign({ group, story: true, lv: 1 }, o)); }
}
function clearStoryEnts() { for (const e of ENTS) if (e.story) e.gone = true; }
function ensureCat(id, o) { let c = catById(id); if (!c) { c = makeCat(Object.assign({ id }, o)); G.cats.push(c); placeAtHome(c); } return c; }
function ghosts(ids) {
  const pc = P();
  ids.forEach((id, i) => {
    const c = catById(id); if (!c) return;
    const a = i / ids.length * TAU;
    spawnClanCat('sternen', pc.x + Math.cos(a) * 80, pc.y + Math.sin(a) * 80, { id: 'geist_' + id, name: catName(c), look: c.look, star: true, hostile: false, truce: true, story: true, ai: 'leader' });
  });
}
function allTo(at, except = []) {
  for (const c of clanCats()) if (c !== P() && !except.includes(c.id)) c.ai = { m: 'goto', x: at.x + rand(-110, 110), y: at.y + rand(-90, 90), sp: 170, then: 'hold' };
}
const BLAUSTERN_LOOK = () => catById('blaustern').look;
// Filmszene: SternenClan-Geister schreiten von allen Seiten auf dich zu
function ghostWalk(ids, cap) {
  return ACT({
    cap: cap || 'Aus dem Sternenlicht treten Katzen hervor und kommen langsam auf dich zu.', cam: 'player', glow: 'player', dist: 230, pitch: 0.45, orbit: 0.15, wait: 1.5,
    moves: ids.map((id, i) => { const a = i / ids.length * TAU; return ['geist_' + id, 'player', { from: () => { const p = P(); return { x: p.x + Math.cos(a) * 230, y: p.y + Math.sin(a) * 230 }; }, dx: Math.cos(a) * 70, dy: Math.sin(a) * 70, sp: 70, delay: i * 0.25 }]; })
  });
}
// Filmszene: mehrere Katzen laufen zu jemandem hin
function gatherTo(who, ids, cap, o = {}) { return ACT(Object.assign({ cap, cam: who, moves: ids.map((id, i) => { const a = i / ids.length * TAU; return [id, who, { dx: Math.cos(a) * 50, dy: Math.sin(a) * 50, sp: 130, delay: i * 0.2 }]; }) }, o)); }

// ----- Helfer für Staffel 2 -----
const JOURNEY = ['eichhornjunges', 'bernsteinjunges', 'kraehenpfote', 'federschweif', 'sturmpelz'];
function startStaffel2() {
  const b = ensureCat('brombeerjunges', { pre: 'Brombeer', suf: 'kralle', rank: 'junges', sex: 'm', look: L('#5a3e26', '#24160c', 0, '#e8b923') });
  b.suf = 'kralle'; b.clan = 'donner'; b.age = Math.max(b.age, 24); setRank(b, 'krieger'); b.hidden = false; b.storyLock = true; b.look.size = 1.12;
  const t = ensureCat('bernsteinjunges', { pre: 'Bernstein', suf: 'pelz', rank: 'junges', sex: 'w', look: L('#8a5a30', null, 0, '#7bc043', { patch: '#2b2220' }) });
  t.suf = 'pelz'; t.clan = 'schatten'; t.age = Math.max(t.age, 24); setRank(t, 'krieger'); t.hidden = true; t.storyLock = true;
  const e = ensureCat('eichhornjunges', { pre: 'Eichhorn', suf: 'schweif', rank: 'schueler', sex: 'w', age: 8, mother: 'sandpfote', look: L('#c0501e', null, 0.35, '#6fc23a') });
  e.age = Math.max(e.age, 8); setRank(e, 'schueler'); e.storyLock = true; e.hidden = false; e.rel = 60;
  const l = ensureCat('blattjunges', { pre: 'Blatt', suf: 'see', rank: 'heilerschueler', sex: 'w', age: 8, mother: 'sandpfote', look: L('#a8845a', '#6a4a2a', 0.4, '#e8b923') });
  l.age = Math.max(l.age, 8); setRank(l, 'heilerschueler'); l.mentor = 'aschenjunges'; l.storyLock = true; l.hidden = false;
  ensureCat('kraehenpfote', { pre: 'Krähen', suf: 'feder', rank: 'schueler', clan: 'wind', sex: 'm', age: 9, look: L('#2e2e34', null, 0, '#5ab0e8'), hidden: true, storyLock: true });
  ensureCat('federschweif', { pre: 'Feder', suf: 'schweif', rank: 'krieger', clan: 'fluss', sex: 'w', age: 20, look: L('#b8bec8', '#7a808a', 0, '#5ab0e8'), hidden: true, storyLock: true });
  ensureCat('sturmpelz', { pre: 'Sturm', suf: 'pelz', rank: 'krieger', clan: 'fluss', sex: 'm', age: 20, look: L('#5a5a62', null, 0, '#e8b923', { long: true }), hidden: true, storyLock: true });
  for (const id of JOURNEY.concat(['kraehenpfote'])) { const c = catById(id); c.hidden = id === 'eichhornjunges' ? false : true; }
  const pc = P(); if (pc.alive) pc.lives = G.player.lives;
  switchPlayer(b); setStage('staffel2');
  const pos = denPos('krieger'); b.x = pos.x; b.y = pos.y + 30;
  G.time = (day() + 3) * 1440 + 9 * 60;
  titleCard('Staffel 2', 'Die neue Prophezeiung');
  chron('— Staffel 2: Die neue Prophezeiung — Brombeerkralle, Sohn von Tigerstern, ist jetzt ein Krieger des DonnerClans.');
}
function placeJourney(x, y) {
  JOURNEY.forEach((id, i) => { const c = catById(id); if (!c || !c.alive || id === 'eichhornjunges') return; c.hidden = false; const a = i / 5 * TAU; c.x = x + Math.cos(a) * 60; c.y = y + Math.sin(a) * 60; c.ai = { m: 'hold' }; });
}
function journeyFollow() { for (const id of JOURNEY) { const c = catById(id); if (c && c.alive && !(id === 'sturmpelz' && G.flags.sturmBleibt)) { c.hidden = false; c.ai = { m: 'follow' }; } } }
function journeyHome() { for (const id of JOURNEY) { const c = catById(id); if (!c || !c.alive) continue; if (c.clan === 'donner') c.ai = { m: 'home' }; else { c.hidden = true; c.ai = { m: 'home' }; } } }
function spawnBulldozers() {
  for (const e of ENTS) if (e.kind === 'bagger') e.gone = true;
  const paths = [[{ x: 2500, y: 2050 }, { x: 2950, y: 2250 }], [{ x: 1700, y: 2600 }, { x: 1600, y: 3050 }], [{ x: 2800, y: 2700 }, { x: 3150, y: 2500 }], [{ x: 2000, y: 1700 }, { x: 2500, y: 1650 }]];
  for (const [a, b] of paths) ENTS.push({ kind: 'bagger', name: 'Monster der Zweibeiner', x: a.x, y: a.y, a, b, dir: 0, r: 40, team: 'zweibeiner', hostile: false, story: false, persistent: true });
}
function startMigration() {
  for (const c of clanCats()) if (c !== P()) { c.ai = { m: 'follow' }; c.hidden = false; c.slow = c.rank === 'junges' || c.rank === 'aeltester'; }
  const pc = P();
  ['schatten', 'fluss', 'wind'].forEach((k, j) => { for (let i = 0; i < 4; i++) spawnClanCat(k, pc.x + rand(-120, 120), pc.y + rand(-120, 120), { hostile: false, truce: true, story: true, followP: true, slot: (j * 4 + i - 6) * 0.25 }); });
  toast('Alle Clans folgen dir. Der See liegt hinter den Bergen im Osten.');
}
function arriveAtLake() {
  G.flags.see = true; G.flags.zerstoert = 1; applyRelocation(true);
  for (const e of ENTS) if (e.kind === 'bagger' || e.story) e.gone = true;
  for (const c of G.cats) if (c.alive && c.clan === 'donner') { c.slow = false; if (c !== P()) placeAtHome(c); }
  G.clan.pile = clanCats().length * 1.2; G.clan.terr = 60;
  for (const k in G.others) G.others[k].rel = clamp(G.others[k].rel + 20, 0, 100);
  chron('Die vier Clans erreichen den großen See und finden eine neue Heimat. Riesenstern stirbt.');
}
const LOOK = {
  braunstern: () => L('#5a4030', '#2a1a10', 0, '#d98b2b', { size: 1.15 }),
  klauengesicht: () => L('#6a5a4a', '#3a2a1a', 0, '#e8b923', { size: 1.1 }),
  geissel: () => L('#141416', null, 0.2, '#6ab4ff', { size: 0.78 }),
  knochen: () => L('#1e1e1e', null, 0.7, '#e8b923', { size: 1.3 }),
  riesenstern: () => L('#1e1e20', null, 0.55, '#e8b923', { size: 1.15 }),
  nebelfuss: () => L('#8a9aab', null, 0.2, '#4fa3d9'),
};

const QUESTS = [
  // ================= BUCH 1: IN DIE WILDNIS =================
  {
    ch: 1, title: 'Prolog: Ein Hauskätzchen träumt', steps: [
      {
        t: 'scene', dlg: () => [
          ['erz', 'Vor vielen Monden, in einer stürmischen Nacht, kämpfen DonnerClan und FlussClan an den Sonnenfelsen. Rotschweif, der Zweite Anführer des DonnerClans, kehrt nicht zurück.'],
          ['tuepfelblatt', '(Die Heilerin blickt zu den Sternen) Blaustern … der SternenClan hat zu mir gesprochen: „Feuer allein kann unseren Clan retten.“'],
          ['blaustern', 'Feuer? Aber Feuer ist der Feind aller Clans … Was kann das bedeuten?'],
          ['erz', 'Zur selben Zeit, am Rand des Waldes, lebt ein kleiner roter Kater bei seinen Zweibeinern. Sein Name ist Sammy.'],
          ACT({ cap: 'Sammy schleicht zum Gartenzaun und schaut hinüber zum dunklen Wald.', moves: [['player', { x: 2105, y: 3540 }, { sp: 80, face: 'waldrand' }]], cam: 'player', wait: 1.8, dist: 140 }),
          ['erz', 'Steuerung: WASD = laufen (in Blickrichtung) · Maus ziehen = Kamera drehen · Mausrad = Zoom · Shift = rennen · Q = schleichen · Leertaste = springen · R = Pfotenhieb · Klick ins Bild = Maus zum Umsehen · E = sprechen'],
          ['player', 'Schon wieder dieser Traum … eine Maus im Mondlicht, und ich jage sie durch den Wald …'],
        ]
      },
      {
        t: 'talk', who: 'wulle', text: 'Besuche Wulle im Nachbargarten (durch die Lücke im Zaun)', dlg: () => [
          ['wulle', 'Hallo Sammy! Hast du heute schon gefressen? Es gab Fisch aus der Dose!'],
          ['player', 'Wulle … ich gehe heute Abend in den Wald. Ich will richtig jagen.'],
          ['wulle', 'In den Wald?! Da leben wilde Katzen! Sie fressen Kaninchen und Knochen und kämpfen die ganze Nacht. Sie haben keine Zweibeiner, die sie füttern.'],
          ['wulle', 'Tigerkralle heißt einer, habe ich gehört – groß wie ein Fuchs!'],
          { who: 'player', text: 'Was denkst du?', choices: [{ t: '„Ich will ihn trotzdem sehen.“', fn: () => { G.flags.mutig = 1; } }, { t: '„Nur einmal schauen …“' }] },
        ]
      },
      { t: 'goto', at: 'waldrand', text: 'Schlüpf durch die Lücke im Zaun und geh zum Waldrand', dlg: () => [['player', 'Der Wald … er riecht nach Moos, nach Erde … und nach Beute.'], ['erz', 'Tipp: Q = schleichen. Die Beute hört dich dann kaum. Mit der Leertaste springst du sie an. Ein „!“ heißt: Die Beute wird misstrauisch.']] },
      { t: 'catch', n: 1, text: 'Fang deine erste Maus', dlg: () => [['player', 'Ich hab sie! Meine erste eigene Beute!'], ['erz', 'Plötzlich springt dich etwas Graues aus dem Farn an!']] },
      {
        t: 'defeat', group: 'graupfote', text: 'Ein fremder Kater greift an! Wehr dich (R = Hieb, Leertaste = Sprung)', enter() { spar('graupfote'); say(catById('graupfote'), 'Das ist DonnerClan-Territorium!'); },
        dlg: () => [
          ['graupfote', 'Uff! Schon gut, schon gut! Du bist stark … für ein Hauskätzchen. Ich bin Graupfote, Schüler im DonnerClan.'],
          ACT({ cap: 'Eine blaugraue Kätzin und ein goldener Kater treten aus dem Farn.', moves: [['blaustern', 'player', { from: () => nearPlayer(260), dx: 45, dy: -10, sp: 80 }], ['loewenherz', 'player', { from: () => nearPlayer(280), dx: -40, dy: 30, sp: 85, delay: 0.5 }]], cam: 'blaustern' }),
          ['loewenherz', 'Graupfote! Du hast mit einem Hauskätzchen gekämpft?'],
          ['blaustern', 'Ich bin Blaustern, die Anführerin des DonnerClans. Und das ist Löwenherz. Du hast Mut, junger Kater.'],
          ['blaustern', 'Der DonnerClan braucht mehr Krieger. Möchtest du mit uns kommen und als Schüler ausgebildet werden?'],
          ['player', 'Ich … ich weiß nicht. Mein Zuhause ist bei den Zweibeinern.'],
          ['blaustern', 'Dann denk darüber nach. Wenn du dich entschieden hast, komm morgen um Sonnenhoch wieder hierher. Löwenherz wird auf dich warten.'],
          { do: () => { ['blaustern', 'loewenherz', 'graupfote'].forEach(goHome); } },
        ]
      },
      { t: 'goto', at: 'korb', text: 'Geh nach Hause in dein Körbchen und schlaf darüber', dlg: () => [['erz', 'Du liegst lange wach. Das Trockenfutter schmeckt nach nichts. Durch das Fenster siehst du die Sterne über dem Wald.'], ['player', 'Frei sein … jagen … Ich habe mich entschieden.'], { do: () => { G.time = (day() + 1) * 1440 + 11 * 60; restHeal(1); } }, ['erz', 'Am nächsten Morgen …'], ['wulle', '(ruft über den Zaun) Sammy! Geh nicht! Du wirst nie wiederkommen!']] },
      { t: 'goto', at: 'waldrand', text: 'Geh um Sonnenhoch zum Waldrand', enter() { place('loewenherz', LM.waldrand.x + 30, LM.waldrand.y - 40); place('graupfote', LM.waldrand.x - 40, LM.waldrand.y - 30); }, dlg: () => [['loewenherz', 'Du bist gekommen. Gut. Folge uns ins Lager.'], ['graupfote', 'Juhu! Ich wusste, dass du kommst!']] },
      { t: 'goto', at: 'lager', guide: 'loewenherz', guideSay: 'Folge mir. Unser Lager ist nicht weit.', text: 'Folge Löwenherz ins DonnerClan-Lager', enter() { follow('loewenherz'); follow('graupfote'); }, dlg: () => [['erz', 'Die Katzen des DonnerClans starren dich an. Ein cremefarbener Kater mit schwarzen Streifen tritt vor.'], ['langschweif', 'Ein Hauskätzchen? Er stinkt nach Zweibeinern! Er trägt sogar ein Halsband!']] },
      {
        t: 'defeat', group: 'langschweif', text: 'Langschweif greift dich an! Zeig ihm, was in dir steckt', enter() { spar('langschweif'); },
        dlg: () => [
          ['erz', 'Im Kampf reißt Langschweif dir das Halsband vom Hals. Es liegt zerfetzt im Staub.'],
          ['blaustern', 'Genug! Das Halsband ist fort. Der SternenClan hat gesprochen: Dein altes Leben ist vorbei.'],
          CEREMONY('blaustern', []),
          ['erz', 'Blaustern springt auf den Hochstein. Der ganze Clan versammelt sich darunter.'],
          ['blaustern', 'Von diesem Tag an, bis du deinen Kriegernamen erhältst, heißt du Feuerpfote – denn dein Fell leuchtet wie eine Flamme. Ich selbst werde deine Mentorin sein.'],
          { do: () => { renamePlayer('schueler'); P().mentor = 'blaustern'; setStage('schueler'); goHome('langschweif'); chron('Sammy verlässt die Zweibeiner und wird Feuerpfote, Schüler im DonnerClan. Blaustern ist seine Mentorin.'); } },
          ['alle', 'Feuerpfote! Feuerpfote!'],
          ACT({ cap: 'Da stürmt Tigerkralle durch den Ginstertunnel ins Lager. Hinter ihm humpelt sein Schüler Rabenpfote – er blutet an der Schulter.', moves: [['tigerkralle', 'player', { from: () => ({ x: LM.lager.x, y: LM.lager.y + LM.lager.r + 40 }), dx: 45, dy: 40, sp: 150 }], ['rabenpfote', 'player', { from: () => ({ x: LM.lager.x + 20, y: LM.lager.y + LM.lager.r + 70 }), dx: 80, dy: 60, sp: 55, delay: 0.7 }]], cam: 'tigerkralle', end() { catById('rabenpfote').hurt = true; } }),
          ['tigerkralle', 'Blaustern. Wir haben an den Sonnenfelsen gegen den FlussClan gekämpft. Rotschweif ist tot. Er hat Eichenherz getötet, bevor er fiel.'],
          ['blaustern', 'Rotschweif … Ich sage diese Worte vor dem SternenClan, damit sein Geist mich hört: Löwenherz wird der neue Zweite Anführer des DonnerClans.'],
          { do: () => { setRank(catById('loewenherz'), 'zweiter'); endCeremony(); goHome('tigerkralle'); goHome('loewenherz'); goHome('blaustern'); chron('Rotschweif stirbt an den Sonnenfelsen. Löwenherz wird Zweiter Anführer.'); } },
          ['graupfote', 'Komm, Feuerpfote. Ich zeig dir das Lager!'],
        ]
      },
      { t: 'goto', pos: () => Object.assign(denPos('schueler'), { r: 50 }), guide: 'graupfote', guideSay: 'Hier entlang – zum Schülerbau!', text: 'Folge Graupfote – er zeigt dir den Schülerbau', dlg: () => [['graupfote', 'Hier schlafen wir Schüler. Jeden Morgen holen wir frisches Moos für die Nester. Und pass auf – Staubpfote schnarcht!']] },
      { t: 'goto', pos: () => Object.assign(denPos('pile'), { r: 45 }), guide: 'graupfote', guideSay: 'Und jetzt das Wichtigste: das Essen!', text: 'Graupfote zeigt dir den Frischbeutehaufen', dlg: () => [['graupfote', 'Der Frischbeutehaufen. Hier legen die Jäger ihre Beute ab. Die Ältesten und die Königinnen fressen zuerst – so will es das Gesetz der Krieger.']] },
      { t: 'goto', pos: () => Object.assign(denPos('hochstein'), { r: 70 }), guide: 'graupfote', text: 'Graupfote zeigt dir den Hochstein', dlg: () => [['graupfote', 'Das ist der Hochstein. Von hier oben spricht Blaustern zum Clan. Ihr Bau ist die Höhle darunter.'], ['graupfote', 'Tipp: K = Clan, M = Karte, J = Lebensweg. Und jetzt ruh dich aus – morgen geht das Training los!']], done() { goHome('graupfote'); } },
    ]
  },
  {
    ch: 1, title: 'Die Grenzen des Territoriums', steps: [
      { t: 'talk', who: 'loewenherz', text: 'Sprich mit Löwenherz', dlg: () => [['loewenherz', 'Heute zeigen Tigerkralle und ich euch Schülern die Grenzen des Territoriums. Geh voraus, wir folgen.']], done() { follow('loewenherz'); follow('tigerkralle'); follow('graupfote'); } },
      { t: 'goto', at: 'sonnenfelsen', guide: 'loewenherz', text: 'Folge Löwenherz zu den Sonnenfelsen', enter() { follow('loewenherz'); follow('tigerkralle'); follow('graupfote'); }, dlg: () => [['loewenherz', 'Die Sonnenfelsen. Hier ist Rotschweif gestorben. Der FlussClan will sie uns seit Generationen stehlen.'], ['tigerkralle', 'Und sie werden sie nie bekommen. Nicht solange ich lebe.']] },
      { t: 'goto', at: 'eulenbaum', guide: 'loewenherz', text: 'Folge Löwenherz zum Eulenbaum', enter() { follow('loewenherz'); follow('tigerkralle'); follow('graupfote'); }, dlg: () => [['graupfote', 'Der Eulenbaum! Hier jagt nachts eine Eule. Sie hat schon mal ein Junges geholt.']] },
      { t: 'goto', at: 'donnerweg', guide: 'loewenherz', text: 'Folge Löwenherz zum Donnerweg – Vorsicht vor Monstern!', enter() { follow('loewenherz'); follow('tigerkralle'); follow('graupfote'); }, dlg: () => [['loewenherz', 'Der Donnerweg. Riechst du das? Dahinter liegt das Territorium des SchattenClans. Ihr Anführer Braunstern ist grausam.'], ['tigerkralle', 'Überquert ihn nie, wenn ein Monster kommt.']] },
      { t: 'goto', at: 'schlangenfelsen', guide: 'loewenherz', text: 'Folge Löwenherz zu den Schlangenfelsen', enter() { follow('loewenherz'); follow('tigerkralle'); follow('graupfote'); }, dlg: () => [['loewenherz', 'Die Schlangenfelsen. Hier leben Kreuzottern. Ein Biss kann einen Krieger töten.']] },
      { t: 'goto', at: 'baumgeviert', guide: 'loewenherz', text: 'Folge Löwenherz zum Baumgeviert', enter() { follow('loewenherz'); follow('tigerkralle'); follow('graupfote'); }, dlg: () => [['loewenherz', 'Das Baumgeviert. Bei jedem Vollmond treffen sich die Clans hier zur Großen Versammlung. Dann herrscht Frieden.'], ['graupfote', 'Hinter dem Baumgeviert liegt das Moor des WindClans. Aber … seltsam. Seit Monden riecht man dort keinen WindClan mehr.'], ['tigerkralle', 'Genug geredet. Zurück ins Lager.']] },
      { t: 'goto', at: 'lager', guide: 'loewenherz', guideSay: 'Genug für heute. Zurück ins Lager!', text: 'Folge Löwenherz zurück ins Lager', enter() { follow('loewenherz'); follow('tigerkralle'); follow('graupfote'); }, done() { ['loewenherz', 'tigerkralle', 'graupfote'].forEach(goHome); gainXp(P(), 40); } },
    ]
  },
  {
    ch: 1, title: 'Schülerpflichten', steps: [
      { t: 'talk', who: 'tigerkralle', text: 'Tigerkralle hat Arbeit für dich', dlg: () => [['tigerkralle', 'Du willst ein Krieger werden, Hauskätzchen? Dann arbeite wie einer. Die Ältesten haben Hunger – und ihre Nester sind voller Flöhe.'], ['tigerkralle', 'Jag zwei Beutestücke für den Frischbeutehaufen. Danach kümmerst du dich um Kleinohr.'], ['erz', 'Tigerkralles bernsteinfarbene Augen folgen dir, als du gehst.']] },
      { t: 'catch', n: 2, text: 'Jage 2 Beutestücke für den Clan', dlg: () => [['player', 'Zwei! Da wird Tigerkralle staunen.']] },
      { t: 'deliver', n: 2, text: 'Bring die Beute zum Frischbeutehaufen' },
      {
        t: 'goto', pos: () => Object.assign(denPos('aeltest'), { r: 70 }), guide: 'graupfote', guideSay: 'Ich helfe dir! Der Ältestenbau ist im umgestürzten Baum.', text: 'Geh mit Graupfote zum Ältestenbau', enter() { follow('graupfote'); }, dlg: () => [
          ACT({ cap: 'Kleinohr kriecht aus dem Ältestenbau und streckt sich in der Sonne.', moves: [['kleinohr', 'player', { from: () => denPos('aeltest'), dx: 30, dy: -25, sp: 45 }]], cam: 'kleinohr', dist: 130 }),
          ['kleinohr', 'Ah, der neue Schüler. Hast du Mäusegalle dabei? Mein Rücken juckt fürchterlich.'],
          ['graupfote', '(flüstert) Mäusegalle stinkt wie nichts sonst. Viel Glück!'],
          ['kleinohr', 'Und während du arbeitest, erzähle ich dir von früher. Damals, als der Donnerweg noch ein schmaler Pfad war …'],
          ACT({ cap: 'Die Sonne wandert über den Himmel. Kleinohrs Geschichten hören nicht auf – aber du lernst viel über die Geschichte des Clans.', moves: [], cam: 'kleinohr', pass: 180, passT: 4, wait: 3.5, orbit: 0.15, dist: 150 }),
          { do: () => { gainXp(P(), 30); applyFx({ morale: 3 }, true); } },
        ], done() { goHome('graupfote'); goHome('kleinohr'); }
      },
    ]
  },
  {
    ch: 1, title: 'Kampftraining', steps: [
      {
        t: 'goto', at: 'sandkuhle', guide: 'graupfote', guideSay: 'Komm! In der Sandkuhle üben wir kämpfen.', text: 'Folge Graupfote zur Sandkuhle', enter() { follow('graupfote'); }, dlg: () => [
          ACT({ cap: 'Blaustern und Tigerkralle warten schon in der Sandkuhle.', moves: [['blaustern', 'sandkuhle', { from: () => ({ x: LM.sandkuhle.x - 220, y: LM.sandkuhle.y - 120 }), dx: -45, sp: 110 }], ['tigerkralle', 'sandkuhle', { from: () => ({ x: LM.sandkuhle.x + 230, y: LM.sandkuhle.y - 100 }), dx: 50, sp: 110, delay: 0.4 }]], cam: 'blaustern' }),
          ['blaustern', 'Ein Krieger kämpft nicht nur mit Kraft, sondern mit Köpfchen. Spring nicht blind los – schlag zu, wenn der Gegner sich öffnet.'],
          ['tigerkralle', 'Graupfote, zeig dem Hauskätzchen, wie sich ein echter Clan-Kater wehrt. Krallen eingezogen!'],
        ]
      },
      { t: 'defeat', group: 'graupfote', text: 'Übungskampf gegen Graupfote (R = Hieb, Leertaste = Sprung)', enter() { spar('graupfote'); }, dlg: () => [['graupfote', 'Uff! Du lernst schnell!'], ['blaustern', 'Gut gemacht, Feuerpfote. Du hast im richtigen Moment zugeschlagen.'], ['tigerkralle', 'Hmpf. Glück gehabt.'], { do: () => { gainXp(P(), 40); ['blaustern', 'tigerkralle', 'graupfote'].forEach(goHome); } }] },
    ]
  },
  {
    ch: 1, title: 'Die Jagdprüfung', steps: [
      { t: 'talk', who: 'blaustern', text: 'Sprich mit Blaustern', dlg: () => [['blaustern', 'Heute ist deine Jagdprüfung, Feuerpfote. Jage allein, so gut du kannst. Ich werde dich beobachten, ohne dass du mich siehst.']] },
      { t: 'catch', n: 1, text: 'Jagdprüfung: Fang eine Beute', dlg: () => [['erz', 'Da riechst du etwas Fremdes: SchattenClan … und Krankheit. Eine alte, verfilzte Kätzin schleicht auf deine Beute zu!']] },
      { t: 'defeat', group: 'gelbzahn', text: 'Eine fremde Kätzin will deine Beute! Kämpfe', enter() { const g = spar('gelbzahn'); g.clan = 'einzel'; say(g, 'Gib mir die Maus, Kleiner!'); }, dlg: () => [
        ['gelbzahn', 'Hrrr … Du kämpfst wie ein DonnerClan-Krieger. Na los, töte mich doch. Ich bin zu alt und zu hungrig, um wegzulaufen.'],
        ['player', 'Wer bist du?'],
        ['gelbzahn', 'Gelbzahn. Einst Heilerin des SchattenClans. Mein eigener Clan hat mich vertrieben.'],
        { who: 'player', text: 'Sie ist abgemagert und verletzt …', choices: [{ t: 'Ihr deine Beute geben', fn: () => { G.player.carry.shift(); G.flags.gelbzahnGefuettert = 1; return [['erz', 'Gelbzahn verschlingt die Maus. Das Gesetz der Krieger sagt: Erst wird der Clan gefüttert … aber du konntest nicht anders.']]; } }, { t: 'Sie verjagen wollen', fn: () => [['gelbzahn', 'Mit meinem verletzten Bein komme ich nicht weit, Kleiner.']] }] },
        { do: () => { const p = nearPlayer(70); place('blaustern', p.x, p.y); place('tigerkralle', p.x + 40, p.y + 30); } },
        ['blaustern', 'Feuerpfote. Ich habe alles gesehen.'],
        ['tigerkralle', 'Eine SchattenClan-Katze in unserem Territorium! Sollen wir sie töten, Blaustern?'],
        ['blaustern', 'Nein. Gelbzahn kommt als Gefangene mit ins Lager. Und Feuerpfote wird für sie sorgen – ihr Beute bringen und ihre Zecken mit Mäusegalle entfernen.'],
        ['graupfote', '(leise) Mäusegalle! Iiih! Du Armer …'],
      ], done() { const g = catById('gelbzahn'); g.clan = 'donner'; g.rank = 'einzel'; g.den = 'heiler'; g.ai = { m: 'follow' }; follow('blaustern'); follow('tigerkralle'); }
      },
      { t: 'goto', at: 'lager', guide: 'blaustern', text: 'Folge Blaustern und bring Gelbzahn als Gefangene ins Lager', enter() { follow('gelbzahn'); catById('gelbzahn').slow = true; }, done() { ['gelbzahn', 'blaustern', 'tigerkralle'].forEach(goHome); catById('gelbzahn').slow = false; chron('Feuerpfote findet Gelbzahn, die verbannte Heilerin des SchattenClans. Sie wird Gefangene im DonnerClan.'); } },
      { t: 'deliver', n: 2, text: 'Beende die Prüfung: Bring 2 Beute zum Frischbeutehaufen' },
      {
        t: 'talk', who: 'gelbzahn', need: 'prey', text: 'Bring Gelbzahn eine Beute (Heilerbau)', dlg: () => [
          ['gelbzahn', 'Schon wieder du. Na, immerhin bringst du was Ordentliches.'],
          ['gelbzahn', 'Weißt du, warum ich den SchattenClan verlassen musste? Braunstern ist grausam. Er schickt Junge in den Kampf, bevor sie sechs Monde alt sind.'],
          ['gelbzahn', 'Und er hat den WindClan aus seinem Territorium gejagt. Deshalb riecht ihr dort keinen WindClan mehr.'],
          ['player', 'Braunstern hat einen ganzen Clan vertrieben?!'],
        ], done() { G.player.carry.shift(); G.flags.windExil = true; }
      },
    ]
  },
  {
    ch: 1, title: 'Rabenpfotes Geheimnis', steps: [
      {
        t: 'talk', who: 'rabenpfote', text: 'Rabenpfote wirkt verängstigt. Sprich mit ihm', dlg: () => [
          ['rabenpfote', 'Feuerpfote … an den Sonnenfelsen … ich habe gesehen, wie Rotschweif starb.'],
          ['rabenpfote', 'Rotschweif hat Eichenherz nicht getötet. Eichenherz wurde von Felsen erschlagen. Und dann … dann hat Tigerkralle Rotschweif angegriffen.'],
          ['player', 'Tigerkralle hat seinen eigenen Zweiten Anführer getötet?!'],
          ['rabenpfote', 'Er wollte selbst Zweiter Anführer werden. Bitte, sag es niemandem. Wenn er erfährt, dass ich es weiß …'],
          ['graupfote', 'Wir halten zu dir, Rabenpfote. Aber wir brauchen Beweise.'],
        ], done() { chron('Rabenpfote verrät Feuerpfote: Tigerkralle hat Rotschweif getötet.'); }
      },
    ]
  },
  {
    ch: 1, title: 'Die Reise zu den Hochfelsen', steps: [
      { t: 'talk', who: 'blaustern', text: 'Blaustern will mit dir sprechen', dlg: () => [['blaustern', 'Ich reise zum Mondstein in den Hochfelsen, um mit dem SternenClan die Zungen zu teilen. Feuerpfote, Graupfote und Rabenpfote – ihr begleitet mich. Tigerkralle auch.']], done() { ['blaustern', 'graupfote', 'rabenpfote', 'tigerkralle'].forEach(follow); } },
      { t: 'goto', at: 'windlager', guide: 'blaustern', guideSay: 'Folgt mir. Der Weg führt über das Moor.', text: 'Folge Blaustern über das Moor des WindClans', enter() { ['blaustern', 'graupfote', 'rabenpfote', 'tigerkralle'].forEach(follow); }, dlg: () => [['erz', 'Das WindClan-Lager ist verlassen. Nur noch alter, schwacher Geruch.'], ['blaustern', 'Gelbzahn hatte recht. Braunstern hat den WindClan wirklich vertrieben. Ohne vier Clans ist der Wald nicht im Gleichgewicht.']] },
      { t: 'goto', at: 'scheune', guide: 'blaustern', text: 'Folge Blaustern zur Scheune der Zweibeiner', enter() { ['blaustern', 'graupfote', 'rabenpfote', 'tigerkralle'].forEach(follow); place('mikusch', LM.scheune.x + 30, LM.scheune.y + 10, 'home'); }, dlg: () => [['mikusch', 'Ich bin Mikusch. Ruht euch aus, Clan-Katzen – aber passt auf die Ratten auf.'], ['erz', 'Da quieken sie schon: Ratten stürzen sich aus dem Stroh auf Blaustern!']] },
      { t: 'defeat', group: 'ratten', n: 4, text: 'Vertreibe die Ratten!', spawn() { for (let i = 0; i < 4; i++) spawnBeast('ratte', LM.scheune.x + rand(-80, 80), LM.scheune.y + rand(-40, 60), { group: 'ratten', story: true }); }, dlg: () => [ACT({ cap: 'Die Ratten fliehen. Aber Blaustern taumelt … und bricht im Stroh zusammen.', moves: [['blaustern', 'scheune', { dx: 10, dy: 30, sp: 60, sleep: true }]], cam: 'blaustern', dist: 120, wait: 2.5 }), ['graupfote', 'Blaustern! Blaustern, wach auf!'], ACT({ cap: '… dann öffnet sie langsam die Augen und steht mühsam auf.', moves: [['blaustern', 'player', { dx: 40, sp: 40 }]], cam: 'blaustern', dist: 120 }), ['blaustern', 'Ich habe ein Leben verloren. Der SternenClan hat mich zurückgeschickt. Es bleiben mir nur noch wenige.'], ['rabenpfote', '(leise zu dir) Hier bei Mikusch … hier wäre ich sicher vor Tigerkralle.']] },
      { t: 'night', text: 'Wartet bis zur Nacht (E an einem Ort ausruhen oder warten)', enter() { ['blaustern', 'graupfote', 'rabenpfote', 'tigerkralle'].forEach(follow); } },
      { t: 'goto', at: 'mondstein', guide: 'blaustern', guideSay: 'Die Hochfelsen. Folgt mir zum Ahnentor.', text: 'Folge Blaustern zum Mondstein in den Hochfelsen', enter() { ['blaustern', 'graupfote', 'rabenpfote', 'tigerkralle'].forEach(follow); }, dlg: () => [
        ACT({ cap: 'Im Mondlicht führt Blaustern euch zum Ahnentor – einem dunklen Loch tief im Felsen.', moves: [['blaustern', 'hoehle', { dy: 45, sp: 90 }]], cam: 'blaustern', wait: 0.6 }),
        ['blaustern', 'Wartet hier. Nur Anführer und Heiler dürfen den Mondstein berühren.'],
        ACT({ cap: 'Blaustern verschwindet in der Dunkelheit. Ihr wartet … die Sterne ziehen über den Himmel. Aus der Höhle schimmert ein silbernes Licht.', moves: [['blaustern', 'hoehle', { sp: 60, hide: true }]], cam: 'hoehle', glow: 'hoehle', pass: 120, passT: 5, wait: 4, orbit: 0.1, dist: 210, pitch: 0.35 }),
        ACT({ cap: 'Endlich tritt Blaustern wieder aus dem Ahnentor. Ihre Augen sind dunkel vor Sorge.', moves: [['blaustern', 'player', { from: 'hoehle', dx: 40, sp: 75 }]], cam: 'blaustern' }),
        ['blaustern', 'Der SternenClan hat mir Gefahr gezeigt. Wir müssen sofort nach Hause!']] },
      { t: 'goto', at: 'lager', guide: 'blaustern', guideSay: 'Schnell! Nach Hause!', text: 'Folge Blaustern – schnell zurück ins Lager!', enter() { ['blaustern', 'graupfote', 'rabenpfote', 'tigerkralle'].forEach(follow); }, done() { ['blaustern', 'graupfote', 'rabenpfote', 'tigerkralle'].forEach(goHome); chron('Blaustern reist zum Mondstein und verliert an der Scheune ein Leben an die Ratten.'); } },
    ]
  },
  {
    ch: 1, title: 'Der Überfall', gap: 2, steps: [
      {
        t: 'defeat', group: 'ueberfall', n: 4, at: 'lager', spawnNear: 900, text: 'SchattenClan greift das Lager an! Verteidige den Clan', spawn() { storyFoes('ueberfall', 'schatten', 4, { x: LM.lager.x, y: LM.lager.y - 40 }, { lv: 2 }); },
        dlg: () => [
          ACT({ cap: 'Die SchattenClan-Krieger fliehen. Doch Löwenherz schleppt sich noch ein paar Schritte … dann bricht er zusammen. Sein goldenes Fell ist voller Blut.', moves: [['loewenherz', 'player', { from: () => nearPlayer(110), dx: 35, sp: 35, sleep: true }]], cam: 'loewenherz', dist: 120, wait: 2 }),
          ['loewenherz', 'Feuerpfote … du wirst ein großer Krieger … Beschütze … den Clan …'],
          { do: () => { killCat(catById('loewenherz')); } },
          ['blaustern', 'Löwenherz ist zum SternenClan gegangen. Tigerkralle, du wirst der neue Zweite Anführer.'],
          { do: () => { setRank(catById('tigerkralle'), 'zweiter'); chron('SchattenClan überfällt das Lager. Löwenherz stirbt, Tigerkralle wird Zweiter Anführer.'); applyFx({ rel: { schatten: -15 } }, true); } },
          ['tigerkralle', 'Ich werde dem Clan dienen. So, wie es sich gehört.'],
          ['rabenpfote', '(zitternd) Er … er hat bekommen, was er wollte.'],
        ]
      },
    ]
  },
  {
    ch: 1, title: 'Gestohlene Junge', gap: 1, tasks: 0, steps: [
      {
        t: 'scene', dlg: () => [
          ACT({ cap: 'Am nächsten Morgen: Schreie aus der Kinderstube!', moves: [['frostfell', 'den:kinder', { dy: 35, sp: 200, say: 'Meine Jungen! Wo sind meine Jungen?!' }], ['player', 'den:kinder', { dx: 60, dy: 70, sp: 170 }]], cam: 'frostfell' }),
          ['erz', 'Frostfells Junge sind verschwunden.'],
          ['erz', 'Und im Heilerbau liegt Tüpfelblatt – tot. Der Geruch eines SchattenClan-Kriegers hängt in der Luft.'],
          { do: () => { killCat(catById('tuepfelblatt')); ['aschenjunges', 'farnjunges', 'dornenjunges'].forEach(id => { const k = catById(id); if (k) k.hidden = true; }); catById('gelbzahn').hidden = true; } },
          ['tigerkralle', 'Gelbzahn ist auch weg! Diese Verräterin hat Tüpfelblatt getötet und die Jungen gestohlen!'],
          ['player', '(leise zu Graupfote) Das glaube ich nicht. Wir müssen Gelbzahn finden!'],
          { do: () => { chron('Tüpfelblatt wird ermordet, Frostfells Junge werden gestohlen.'); } },
        ]
      },
      { t: 'goto', who: 'gelbzahn', near: 70, text: 'Folge Gelbzahns Spur Richtung Donnerweg', enter() { place('gelbzahn', 2550, 1580); follow('graupfote'); }, dlg: () => [['gelbzahn', 'Ihr beiden? Ich habe Tüpfelblatt nicht getötet! Es war Klauengesicht, einer von Braunsterns Kriegern.'], ['gelbzahn', 'Und Braunstern … Braunstern ist mein Sohn. Ich schäme mich für alles, was er tut. Die Jungen sind im SchattenClan-Lager.'], ['player', 'Dann holen wir sie zurück. Graupfote, lauf zu Blaustern!'], { do: () => { ['blaustern', 'tigerkralle', 'weisspelz', 'dunkelstreif'].forEach(id => { const c = catById(id), p = nearPlayer(90); c.x = p.x + rand(-40, 40); c.y = p.y + rand(-40, 40); follow(id); }); follow('gelbzahn'); } }, ['blaustern', 'Gelbzahn, wenn du die Wahrheit sagst, kämpfe an unserer Seite. Auf zum SchattenClan-Lager!']] },
      {
        t: 'defeat', group: 'schattenlager', n: 5, at: 'schattenlager', spawnNear: 650, noPatrol: true, guide: 'gelbzahn', guideSay: 'Ich kenne den Weg ins SchattenClan-Lager. Folgt mir!', text: 'Folgt Gelbzahn ins SchattenClan-Lager und rettet die Jungen!', enter() { ['blaustern', 'tigerkralle', 'weisspelz', 'dunkelstreif', 'gelbzahn', 'graupfote'].forEach(follow); },
        spawn() { const s = LM.schattenlager; storyFoes('schattenlager', 'schatten', 3, s, { lv: 2 }); spawnClanCat('schatten', s.x + 30, s.y - 20, { group: 'schattenlager', story: true, name: 'Klauengesicht', look: LOOK.klauengesicht(), lv: 3, hp: 150 }); spawnClanCat('schatten', s.x - 30, s.y - 40, { group: 'schattenlager', story: true, name: 'Braunstern', rank: 'anfuehrer', look: LOOK.braunstern(), lv: 4, hp: 170 }); ['aschenjunges', 'farnjunges', 'dornenjunges'].forEach((id, i) => { const k = catById(id); if (k) { k.hidden = false; k.x = s.x - 60 + i * 30; k.y = s.y + 60; k.ai = { m: 'hold' }; } }); },
        dlg: () => [['erz', 'Die SchattenClan-Ältesten treten vor. Sie haben genug von Braunsterns Grausamkeit.'], ['erz', 'Braunstern und seine treuesten Krieger fliehen in die Nacht. Der SchattenClan ist frei – und Frostfells Junge sind gerettet!'], ['blaustern', 'Gelbzahn, du hast uns geholfen. Wenn du willst, bist du im DonnerClan willkommen – als unsere neue Heilerin.'], ['gelbzahn', 'Ich … danke, Blaustern. Ja. Das will ich.']],
        done() { const g = catById('gelbzahn'); setRank(g, 'heiler'); g.den = null; G.others.schatten.leader = 'Nacht'; G.others.schatten.lives = 9; chron('DonnerClan befreit die gestohlenen Jungen. Braunstern wird vertrieben, Gelbzahn wird Heilerin des DonnerClans.'); }
      },
      { t: 'custom', text: 'Bring die Jungen sicher nach Hause ins Lager', at: 'lager', enter() { ['aschenjunges', 'farnjunges', 'dornenjunges'].forEach(id => { const k = catById(id); if (k) { k.hidden = false; k.ai = { m: 'follow' }; k.slow = true; } }); }, check: () => ['aschenjunges', 'farnjunges', 'dornenjunges'].every(id => { const k = catById(id); return !k || dist(k.x, k.y, LM.lager.x, LM.lager.y) < 230; }), dlg: () => [['frostfell', 'Meine Jungen! Danke, Feuerpfote. Danke!']], done() { ['aschenjunges', 'farnjunges', 'dornenjunges', 'blaustern', 'tigerkralle', 'weisspelz', 'dunkelstreif', 'gelbzahn', 'graupfote'].forEach(id => { const k = catById(id); if (k) { k.slow = false; goHome(id); } }); applyFx({ morale: 10, rep: 10 }); } },
    ]
  },
  {
    ch: 1, title: 'Flucht zur Scheune', steps: [
      { t: 'talk', who: 'rabenpfote', text: 'Rabenpfote ist in Gefahr – sprich mit ihm', dlg: () => [['rabenpfote', 'Tigerkralle erzählt allen, ich sei ein Verräter. Er will mich loswerden, Feuerpfote. Ich habe solche Angst.'], ['player', 'Dann bringen wir dich zu Mikusch in die Scheune. Dort findet er dich nicht.'], ['graupfote', 'Wir gehen heimlich, bevor jemand etwas merkt.']], done() { follow('rabenpfote'); follow('graupfote'); } },
      { t: 'goto', at: 'scheune', text: 'Bring Rabenpfote heimlich zur Scheune', enter() { follow('rabenpfote'); follow('graupfote'); place('mikusch', LM.scheune.x + 30, LM.scheune.y + 10, 'home'); }, dlg: () => [['mikusch', 'Rabenpfote! Hier gibt es Mäuse genug für zwei. Bleib, solange du willst.'], ['rabenpfote', 'Danke, Feuerpfote. Du bist ein wahrer Freund. Sei vorsichtig mit Tigerkralle – er vergisst nichts.'], ACT({ cap: 'Rabenpfote folgt Mikusch in die warme Scheune. An der Tür dreht er sich noch einmal um.', moves: [['mikusch', { x: LM.scheune.x, y: LM.scheune.y - 55 }, { sp: 70, hide: true }], ['rabenpfote', { x: LM.scheune.x, y: LM.scheune.y - 50 }, { sp: 60, hide: true, delay: 0.8 }]], cam: 'rabenpfote' })], done() { const r = catById('rabenpfote'); r.clan = 'einzel'; r.fixed = 'Rabenpfote'; r.rank = 'einzel'; r.home = 'scheune'; r.ai = { m: 'home' }; r.storyLock = false; chron('Rabenpfote flieht vor Tigerkralle und lebt nun bei Mikusch in der Scheune.'); } },
      { t: 'goto', at: 'lager', text: 'Kehrt ins Lager zurück', enter() { follow('graupfote'); }, done() { goHome('graupfote'); } },
    ]
  },
  {
    ch: 1, title: 'Feuerherz', gap: 3, tasks: 3, steps: [
      {
        t: 'scene', dlg: () => [
          CEREMONY('blaustern', ['graupfote']),
          ['erz', 'Blaustern springt auf den Hochstein. „Alle Katzen, die alt genug sind, ihre eigene Beute zu jagen, sollen sich hier versammeln!“'],
          ['blaustern', 'Ich, Blaustern, Anführerin des DonnerClans, rufe meine Kriegerahnen an, auf diese beiden Schüler herabzublicken. Sie haben hart trainiert, um euer edles Gesetz zu verstehen.'],
          ['blaustern', 'Feuerpfote, Graupfote – versprecht ihr, das Gesetz der Krieger zu achten und euren Clan zu beschützen, selbst wenn es euer Leben kostet?'],
          { who: 'player', text: 'Deine Antwort:', choices: [{ t: '„Ich verspreche es.“' }] },
          ['graupfote', 'Ich verspreche es!'],
          ['blaustern', 'Feuerpfote, von diesem Moment an heißt du Feuerherz. Der SternenClan ehrt deinen Mut und deine Stärke. Graupfote, du heißt von nun an Graustreif.'],
          { do: () => { renamePlayer('krieger', 'herz'); const g = catById('graupfote'); setRank(g, 'krieger'); setStage('krieger'); chron('Feuerpfote wird Krieger: Feuerherz! Graupfote heißt nun Graustreif. (Ende von Buch 1)'); gainXp(P(), 60); } },
          ['alle', 'Feuerherz! Graustreif! Feuerherz! Graustreif!'],
          CEREMONY_END,
          ACT({ cap: 'In der Nacht haltet ihr schweigend Wache über das Lager – so will es die Tradition. Die Sterne ziehen langsam über den Himmel.', moves: [['player', { x: LM.lager.x, y: LM.lager.y + 70 }, { sp: 90 }], ['graupfote', { x: LM.lager.x + 35, y: LM.lager.y + 75 }, { sp: 90 }]], cam: 'player', start() { G.time = Math.floor(G.time / 1440) * 1440 + 22 * 60; }, pass: 360, passT: 5, wait: 4, pitch: 0.5, dist: 220, orbit: 0.12 }),
          ['erz', '— Ende von Buch 1: In die Wildnis —'],
        ]
      },
    ]
  },
  // ================= BUCH 2: FEUER UND EIS =================
  {
    ch: 2, title: 'Aschenpfote', steps: [
      {
        t: 'scene', dlg: () => [
          CEREMONY('blaustern', ['aschenjunges', 'farnjunges']),
          ['blaustern', 'Frostfells Junge sind sechs Monde alt. Aschenjunges, von heute an heißt du Aschenpfote. Feuerherz wird dein Mentor.'],
          { do: () => { const a = catById('aschenjunges'); a.age = Math.max(6, a.age); setRank(a, 'schueler'); a.mentor = P().id; const f = catById('farnjunges'); if (f) { f.age = Math.max(6, f.age); setRank(f, 'schueler'); f.mentor = 'graupfote'; f.storyLock = false; } const d = catById('dornenjunges'); if (d) { d.age = Math.max(6, d.age); setRank(d, 'schueler'); d.mentor = 'mausefell'; d.storyLock = false; } ['sandpfote', 'staubpfote'].forEach(id => { const c = catById(id); if (c && c.rank === 'schueler') { setRank(c, 'krieger'); c.storyLock = false; } }); chron('Feuerherz wird Mentor von Aschenpfote, Graustreif von Farnpfote.'); } },
          ['blaustern', 'Farnjunges, du heißt Farnpfote. Graustreif wird dein Mentor.'],
          ['aschenjunges', 'Ich werde die beste Kriegerin im ganzen Wald! Wann fangen wir an, Feuerherz?'],
          CEREMONY_END,
        ]
      },
      { t: 'goto', at: 'sandkuhle', text: 'Trainiere mit Aschenpfote in der Sandkuhle', enter() { follow('aschenjunges'); }, dlg: () => [['erz', 'Aschenpfote übt den Jagdkauer – und stolpert über ihren eigenen Schwanz. Beim dritten Versuch klappt es!'], ['aschenjunges', 'Hast du das gesehen?! Ich bin ein Naturtalent!']], done() { gainXp(catById('aschenjunges'), 50); } },
      { t: 'catch', n: 1, text: 'Zeig Aschenpfote, wie man jagt: Fang eine Beute', enter() { follow('aschenjunges'); }, done() { goHome('aschenjunges'); } },
    ]
  },
  {
    ch: 2, title: 'Kampf um die Sonnenfelsen', steps: [
      {
        t: 'goto', at: 'sonnenfelsen', guide: 'weisspelz', guideSay: 'Patrouille zu den Sonnenfelsen. Bleibt dicht bei mir.', text: 'Geh mit Weißpelz auf Patrouille zu den Sonnenfelsen', enter() { follow('weisspelz'); follow('graupfote'); }, dlg: () => [
          { do: () => { const x = riverX(LM.sonnenfelsen.y) - 180; spawnClanCat('fluss', x, LM.sonnenfelsen.y, { id: 'leopard_i', name: 'Leopardenfell', look: L('#d8a040', '#3a2a10', 0, '#e8b923'), hostile: false, truce: true, story: true, group: 'sonnen_i' }); for (let i = 0; i < 2; i++) spawnClanCat('fluss', x - 30, LM.sonnenfelsen.y + 40 + i * 40, { id: 'flussk_i' + i, hostile: false, truce: true, story: true, group: 'sonnen_i' }); } },
          ACT({ cap: 'FlussClan-Krieger springen über die Trittsteine und klettern auf die Sonnenfelsen!', moves: [['leopard_i', 'sonnenfelsen', { dx: -40, sp: 170 }], ['flussk_i0', 'sonnenfelsen', { dx: -80, dy: 40, sp: 160, delay: 0.3 }], ['flussk_i1', 'sonnenfelsen', { dx: -70, dy: -40, sp: 160, delay: 0.5 }]], cam: 'leopard_i' }),
          ['leopard_i', 'Die Sonnenfelsen gehören dem FlussClan! Verschwindet, DonnerClan!'],
          ['weisspelz', 'Niemals! DonnerClan, greift an!'],
        ], done() { for (const e of ENTS) if (e.group === 'sonnen_i') e.gone = true; }
      },
      {
        t: 'defeat', group: 'sonnen', n: 3, at: 'sonnenfelsen', spawnNear: 900, noPatrol: true, text: 'Verteidige die Sonnenfelsen gegen den FlussClan!', enter() { follow('weisspelz'); follow('graupfote'); },
        spawn() { const s = LM.sonnenfelsen; spawnClanCat('fluss', s.x - 40, s.y, { group: 'sonnen', story: true, name: 'Leopardenfell', look: L('#d8a040', '#3a2a10', 0, '#e8b923'), lv: 3, hp: 130 }); storyFoes('sonnen', 'fluss', 2, { x: s.x - 60, y: s.y + 20 }, { lv: 2 }); },
        dlg: () => [ACT({ cap: 'Die FlussClan-Krieger fliehen zurück über den Fluss.', moves: [], cam: 'player', wait: 1.5 }), ['weisspelz', 'Die Sonnenfelsen bleiben DonnerClan-Territorium! Gut gekämpft, Feuerherz.'], ['graupfote', '(schaut nachdenklich über den Fluss)'], { do: () => { applyFx({ terr: 8, rep: 6, rel: { fluss: -10 } }); gainXp(P(), 50); ['weisspelz', 'graupfote'].forEach(goHome); chron('Der DonnerClan verteidigt die Sonnenfelsen gegen den FlussClan.'); } }]
      },
    ]
  },
  {
    ch: 2, title: 'Die Heimkehr des WindClans', steps: [
      { t: 'talk', who: 'blaustern', text: 'Blaustern hat eine wichtige Aufgabe', dlg: () => [['blaustern', 'Feuerherz, der Wald braucht vier Clans. Du und Graustreif, ihr sollt den WindClan finden und nach Hause bringen.'], ['tigerkralle', 'Den WindClan zurückholen? Mehr Konkurrenz um Beute? Unsinn!'], ['blaustern', 'Es ist entschieden. Frag Rabenpfote bei der Scheune – vielleicht hat er etwas gesehen.']], done() { follow('graupfote'); } },
      { t: 'talk', who: 'rabenpfote', text: 'Frag Rabenpfote bei der Scheune nach dem WindClan', enter() { follow('graupfote'); const r = catById('rabenpfote'); r.hidden = false; }, dlg: () => [['rabenpfote', 'Der WindClan? Ja! Ich habe magere Katzen gesehen, die im Tunnel unter dem Donnerweg leben – dort im Nordwesten, wo die Monster in den Norden fahren.']] },
      { t: 'goto', at: 'tunnel', text: 'Finde den WindClan am Tunnel unter dem Donnerweg', enter() { follow('graupfote'); const t = LM.tunnel; spawnClanCat('wind', t.x, t.y, { id: 'riesenstern_e', name: 'Riesenstern', rank: 'anfuehrer', look: LOOK.riesenstern(), hostile: false, story: true, group: 'windheim', slot: 0 }); for (let i = 0; i < 6; i++) spawnClanCat('wind', t.x + rand(-60, 60), t.y + rand(-40, 60), { hostile: false, story: true, group: 'windheim', slot: (i - 2.5) * 0.35 }); }, dlg: () => [ACT({ cap: 'Aus dem dunklen Tunnel unter dem Donnerweg treten magere, zerzauste Katzen. Ein großer schwarz-weißer Kater führt sie an.', moves: [['riesenstern_e', 'player', { from: 'tunnel', fdy: -30, dx: 50, sp: 60 }]], cam: 'riesenstern_e' }), ['riesenstern_e', 'DonnerClan-Krieger? Seid ihr gekommen, um uns zu verjagen? Hier gibt es nur Zweibeiner-Abfall und Ratten.'], ['player', 'Nein, Riesenstern. Blaustern schickt uns. Der WindClan soll nach Hause kommen – ins Moor.'], ['riesenstern_e', '… Nach Hause. Der SternenClan hat euch geschickt. Führt uns, Feuerherz!']], done() { for (const e of ENTS) if (e.group === 'windheim') e.followP = true; } },
      { t: 'custom', at: 'windlager', noPatrol: true, text: 'Führe den WindClan zurück in sein Lager im Moor (Vorsicht am Donnerweg!)', enter() { follow('graupfote'); for (const e of ENTS) if (e.group === 'windheim') e.followP = true; if (!ENTS.some(e => e.group === 'windheim')) { const pc = P(); spawnClanCat('wind', pc.x - 40, pc.y, { id: 'riesenstern_e', name: 'Riesenstern', rank: 'anfuehrer', look: LOOK.riesenstern(), hostile: false, story: true, group: 'windheim', followP: true }); for (let i = 0; i < 6; i++) spawnClanCat('wind', pc.x + rand(-60, 60), pc.y + rand(-60, 60), { hostile: false, story: true, group: 'windheim', followP: true, slot: (i - 2.5) * 0.35 }); } }, check: () => ENTS.filter(e => e.group === 'windheim' && dist(e.x, e.y, LM.windlager.x, LM.windlager.y) < 280).length >= 4, dlg: () => [ACT({ cap: 'Die WindClan-Katzen rennen über das Moor – nach Hause!', moves: [['riesenstern_e', 'windlager', { sp: 170, say: 'Zu Hause! Wir sind zu Hause!' }]], cam: 'riesenstern_e', dist: 220 }), ['riesenstern_e', 'Das Moor … unser Moor. Feuerherz, der WindClan wird nie vergessen, was du heute getan hast.'], { do: () => { G.flags.windExil = false; for (const e of ENTS) if (e.group === 'windheim') { e.followP = false; e.wander = { x: LM.windlager.x, y: LM.windlager.y, r: 140 }; e.story = false; } applyFx({ rel: { wind: 35 }, rep: 10 }); chron('Feuerherz und Graustreif bringen den WindClan nach Hause.'); } }], done() { goHome('graupfote'); } },
    ]
  },
  {
    ch: 2, title: 'Silberfluss', gap: 2, steps: [
      { t: 'goto', at: 'trittsteine', guide: 'graupfote', guideSay: 'Komm, ich kenne eine Stelle am Fluss!', text: 'Folge Graustreif zu den Trittsteinen am Fluss', enter() { follow('graupfote'); }, dlg: () => [
        ACT({ cap: 'Graustreif balanciert über die nassen Trittsteine …', moves: [['graupfote', () => ({ x: riverX(LM.trittsteine.y), y: LM.trittsteine.y }), { sp: 80 }]], cam: 'graupfote', wait: 0.3 }),
        ACT({ cap: '… rutscht aus und stürzt in den eiskalten Fluss! Die Strömung reißt ihn fort.', moves: [['graupfote', () => ({ x: riverX(LM.trittsteine.y + 170), y: LM.trittsteine.y + 170 }), { sp: 130, say: 'Hilfe! Ich kann nicht schwimmen!' }]], cam: 'graupfote', wait: 0.3, shake: 2 }),
        { do: () => { const s = ensureCat('silberfluss', { pre: 'Silber', suf: 'fluss', rank: 'krieger', clan: 'fluss', sex: 'w', age: 22, look: L('#b8bec8', '#6a707a', 0, '#4fa3d9') }); s.hidden = false; s.x = riverX(LM.trittsteine.y + 150) - 170; s.y = LM.trittsteine.y + 150; s.ai = { m: 'hold' }; } },
        ACT({ cap: 'Da springt eine silbergraue Kätzin ins Wasser, packt ihn am Nackenfell und zieht ihn ans Ufer.', moves: [['silberfluss', () => ({ x: riverX(LM.trittsteine.y + 170) + 70, y: LM.trittsteine.y + 180 }), { sp: 150 }], ['graupfote', () => ({ x: riverX(LM.trittsteine.y + 170) + 100, y: LM.trittsteine.y + 150 }), { sp: 70, delay: 1.2 }]], cam: 'silberfluss' }),
        ['silberfluss', 'Ein DonnerClan-Kater, der nicht schwimmen kann! Ich bin Silberfluss vom FlussClan. Du hast Glück gehabt.'],
        ['graupfote', '(starrt sie an) Silberfluss … was für ein schöner Name.'],
        { do: () => { catById('silberfluss').hidden = true; } },
        ['erz', 'Von diesem Tag an schleicht Graustreif immer wieder heimlich zum Fluss.'],
        { who: 'player', text: 'Graustreif trifft sich mit einer Katze aus einem anderen Clan. Das verbietet das Gesetz der Krieger …', choices: [{ t: 'Sein Geheimnis bewahren – er ist mein bester Freund', fn: () => { catById('graupfote').rel += 10; } }, { t: 'Ihn warnen: „Das bringt dich in Gefahr!“', fn: () => [['graupfote', 'Ich weiß, Feuerherz. Aber ich kann nicht anders.']] }] },
      ], done() { goHome('graupfote'); chron('Graustreif verliebt sich in Silberfluss vom FlussClan.'); } },
    ]
  },
  {
    ch: 2, title: 'Die Falle am Donnerweg', steps: [
      { t: 'talk', who: 'tigerkralle', text: 'Tigerkralle hat einen Auftrag', dlg: () => [['tigerkralle', 'Blaustern will morgen allein zu den Schlangenfelsen gehen. Sag ihr, sie soll den Weg am Donnerweg nehmen.'], ['erz', 'Irgendetwas an seinem Blick gefällt dir nicht.']] },
      { t: 'goto', at: 'donnerweg', text: 'Aschenpfote ist Blausterns Weg allein gelaufen! Lauf zum Donnerweg!', enter() { const a = catById('aschenjunges'); a.x = LM.lager.x; a.y = LM.lager.y + 250; a.ai = { m: 'script', x: LM.donnerweg.x + 40, y: LM.donnerweg.y - 30, sp: 170 }; say(a, 'Ich bringe Blaustern die Nachricht!'); }, dlg: () => [['erz', 'Zu spät. Ein Monster rast vorbei. Aschenpfote liegt am Rand des Donnerwegs, ihr Hinterbein ist verdreht.'], ['aschenjunges', 'Feuerherz … es tut so weh …'], ['erz', 'Hier wartete eine Falle – und sie war für Blaustern bestimmt.']], done() { const a = catById('aschenjunges'); a.ai = { m: 'follow' }; a.slow = true; } },
      { t: 'goto', at: 'lager', text: 'Bring Aschenpfote vorsichtig zu Gelbzahn', enter() { const a = catById('aschenjunges'); a.ai = { m: 'follow' }; a.slow = true; }, dlg: () => [['gelbzahn', 'Ihr Bein wird heilen … aber sie wird nie mehr schnell rennen. Eine Kriegerin wird sie nicht.'], ['aschenjunges', 'Dann … dann will ich Heilerin werden. Wie du, Gelbzahn.'], ['gelbzahn', 'Hmpf. Du redest zu viel. … Na gut. Ich bilde dich aus.'], { do: () => { const a = catById('aschenjunges'); a.slow = false; setRank(a, 'heilerschueler'); a.mentor = 'gelbzahn'; a.ai = { m: 'home' }; chron('Aschenpfote wird am Donnerweg verletzt und wird Heilerschülerin bei Gelbzahn.'); } }] },
      { t: 'defeat', group: 'streuner', n: 4, at: 'lager', spawnNear: 900, text: 'Braunstern greift mit Einzelläufern das Lager an!', spawn() { storyFoes('streuner', 'einzel', 3, { x: LM.lager.x, y: LM.lager.y + 120 }, { lv: 2 }); spawnClanCat('einzel', LM.lager.x, LM.lager.y + 60, { group: 'streuner', story: true, name: 'Braunstern', look: LOOK.braunstern(), lv: 4, hp: 160 }); }, dlg: () => [['erz', 'Die Einzelläufer fliehen. Braunstern bleibt verwundet zurück – Gelbzahn hat ihm im Kampf die Augen zerkratzt. Er ist blind.'], ['blaustern', 'Braunstern bleibt als Gefangener bei uns. Gelbzahn wird ihn versorgen.'], ['erz', '— Ende von Buch 2: Feuer und Eis —']], done() { chron('Braunstern greift mit Einzelläufern an, wird blind und Gefangener des DonnerClans. (Ende von Buch 2)'); } },
    ]
  },
  // ================= BUCH 3: GEHEIMNISSE DES WALDES =================
  {
    ch: 3, title: 'Die Flut', steps: [
      { t: 'scene', dlg: () => [['erz', 'Blattfrische. Tagelang regnet es. Der Fluss schwillt an und überflutet das FlussClan-Lager.'], ['graupfote', 'Feuerherz! FlussClan-Junge treiben im Fluss! Schnell!']] },
      {
        t: 'custom', at: 'trittsteine', noPatrol: true, text: 'Rette die FlussClan-Jungen aus dem Fluss und bring sie zu Nebelfuß ans Westufer',
        enter() { G.weather = 'regen'; follow('graupfote'); for (const e of ENTS) if (e.group === 'flut') e.gone = true; const t = LM.trittsteine; [[-40, -120], [10, 90]].forEach(([dx, dy], i) => spawnClanCat('fluss', riverX(t.y + dy) + dx * 0.3, t.y + dy, { name: 'FlussClan-Junges', kit: true, hostile: false, story: true, group: 'flut', slot: i ? 0.5 : -0.5 })); spawnClanCat('fluss', riverX(t.y) - 150, t.y, { id: 'nebelfuss_e', name: 'Nebelfuß', look: LOOK.nebelfuss(), hostile: false, story: true, group: 'flutm' }); },
        tick() { const pc = P(), n = ENTS.find(e => e.id === 'nebelfuss_e'); for (const k of ENTS) if (k.group === 'flut' && !k.saved) { if (!k.followP && dist(k.x, k.y, pc.x, pc.y) < 50) { k.followP = true; say(k, 'Hilfe!'); } if (n && dist(k.x, k.y, n.x, n.y) < 110) { k.saved = true; k.followP = false; say(n, 'Mein Junges!'); } } },
        check: () => ENTS.filter(e => e.group === 'flut' && e.saved).length >= 2,
        target: () => { const k = ENTS.find(e => e.group === 'flut' && !e.saved && !e.followP); return k || ENTS.find(e => e.id === 'nebelfuss_e'); },
        dlg: () => [['nebelfuss_e', 'Ihr habt meine Jungen gerettet – obwohl ihr DonnerClan-Katzen seid. Das wird der FlussClan nicht vergessen.'], { do: () => { applyFx({ rel: { fluss: 25 }, rep: 8 }); clearStoryEnts(); chron('Feuerherz und Graustreif retten FlussClan-Junge aus der Flut.'); } }], done() { goHome('graupfote'); }
      },
    ]
  },
  {
    ch: 3, title: 'Silberflusses Junge', gap: 4, tasks: 3, steps: [
      {
        t: 'goto', at: 'trittsteine', text: 'Graustreif ruft verzweifelt von den Trittsteinen!', enter() { const g = catById('graupfote'); g.x = LM.trittsteine.x + 30; g.y = LM.trittsteine.y; g.ai = { m: 'hold' }; }, dlg: () => [
          { do: () => { const s = catById('silberfluss'); if (s) { s.hidden = false; const p = nearPlayer(50); s.x = p.x; s.y = p.y; s.sleep = true; s.ai = { m: 'hold' }; } } },
          ['erz', 'Silberfluss liegt am Ufer. Sie bekommt ihre Jungen – aber etwas stimmt nicht.'],
          ['silberfluss', 'Graustreif … es sind zwei … Pass gut auf sie auf …'],
          ['erz', 'Zwei kleine Junge maunzen im Gras. Silberfluss schließt die Augen und atmet nicht mehr.'],
          { do: () => { const s = catById('silberfluss'); killCat(s); } },
          ['graupfote', 'Nein … NEIN! Silberfluss!'],
          ['erz', 'Der FlussClan beansprucht die Jungen für sich. Und Graustreif trifft eine schwere Entscheidung.'],
          ['graupfote', 'Feuerherz … ich gehe mit meinen Jungen zum FlussClan. Ich kann sie nicht verlassen. Verzeih mir, mein Freund.'],
          ACT({ cap: 'Graustreif trägt seine Jungen über den Fluss. Er schaut nicht zurück.', moves: [['graupfote', () => ({ x: riverX(LM.trittsteine.y) - 260, y: LM.trittsteine.y - 30 }), { sp: 60, hide: true }]], cam: 'graupfote', dist: 200, wait: 1.5 }),
          { do: () => { const g = catById('graupfote'); g.clan = 'fluss'; g.hidden = true; g.ai = { m: 'home' }; chron('Silberfluss stirbt bei der Geburt ihrer Jungen. Graustreif verlässt den DonnerClan und geht zum FlussClan.'); } },
        ]
      },
    ]
  },
  {
    ch: 3, title: 'Kräuter für Gelbzahn', steps: [
      { t: 'talk', who: 'gelbzahn', text: 'Gelbzahn braucht Hilfe im Heilerbau', dlg: () => [['gelbzahn', 'Feuerherz! Dunkelstreif hat sich an einem Dorn aufgerissen, und Aschenpfote kann mit ihrem Bein nicht weit laufen.'], ['gelbzahn', 'Du sammelst für mich Ringelblumen. Drei Stück. Und trödel nicht!'], ['aschenjunges', 'Ringelblumen sind orange und leuchten wie kleine Sonnen. Du kannst sie nicht verfehlen!']] },
      { t: 'herb', kind: 'ringelblume', n: 3, text: 'Sammle 3 Ringelblumen (sie leuchten orange)' },
      {
        t: 'talk', who: 'gelbzahn', text: 'Bring Gelbzahn die Ringelblumen', dlg: () => [
          ACT({ cap: 'Gelbzahn kaut die Blüten zu einem Brei. Aschenpfote schaut ganz genau zu.', moves: [['gelbzahn', 'den:heiler', { dy: 35, sp: 60 }], ['aschenjunges', 'den:heiler', { dx: 40, dy: 45, sp: 45 }]], cam: 'gelbzahn', wait: 2.5, dist: 130 }),
          ['gelbzahn', 'Gut. Die Wunde wird sich nicht entzünden. Du bist doch zu etwas nütze, Feuerherz.'],
          ['aschenjunges', 'Siehst du? Heilen ist auch eine Art zu kämpfen!'],
          { do: () => { gainXp(P(), 40); applyFx({ health: 8 }, true); } },
        ], done() { goHome('gelbzahn'); goHome('aschenjunges'); }
      },
    ]
  },
  {
    ch: 3, title: 'Die Große Versammlung', steps: [
      { t: 'night', text: 'Heute ist Vollmond – warte bis zur Nacht' },
      {
        t: 'goto', at: 'baumgeviert', guide: 'blaustern', guideSay: 'Vollmond. Die Versammlung wartet. Folgt mir!', text: 'Folge Blaustern zur Großen Versammlung', enter() { spawnGathering(); follow('blaustern'); }, dlg: () => [
          ACT({ cap: 'Unter den vier großen Eichen versammeln sich die Katzen aller vier Clans. Blaustern springt auf den Großfelsen.', moves: [['blaustern', 'baumgeviert', { dx: 25, dy: 30, sp: 100 }]], cam: 'baumgeviert', dist: 280, pitch: 0.45, orbit: 0.12, wait: 1.5 }),
          ['leader_wind', 'Der WindClan ist wieder zu Hause im Moor. Das verdanken wir dem DonnerClan.'],
          ['leader_fluss', 'Die Flut hat dem FlussClan viel genommen. Aber wir vergessen nicht, wer unsere Jungen gerettet hat.'],
          ['blaustern', 'Der DonnerClan ist stark. Die Beute läuft gut, und unsere Schüler werden bald Krieger.'],
          ['erz', 'Über dem Baumgeviert leuchtet der Vollmond. Heute Nacht herrscht Frieden zwischen allen Clans.'],
        ], done() { for (const e of ENTS) if (e.gathering) e.gone = true; goHome('blaustern'); applyFx({ rep: 5 }); }
      },
    ]
  },
  {
    ch: 3, title: 'Wolkenjunges', gap: 2, steps: [
      { t: 'talk', who: 'prinzessin', text: 'Besuche deine Schwester Prinzessin im Zweibeinerort (Garten links von deinem alten Zuhause)', enter() { const p = catById('prinzessin'); p.hidden = false; }, dlg: () => [['prinzessin', 'Bruder! Du riechst nach Wald. Ich habe Junge bekommen. Und ich möchte, dass mein Erstgeborener ein Krieger wird – so wie du.'], ['prinzessin', 'Nimm ihn mit. Er heißt Wolke … Er ist stark, und er ist mutig.'], { do: () => { const w = ensureCat('wolkenjunges', { pre: 'Wolken', suf: 'schweif', rank: 'junges', age: 3, sex: 'm', look: L('#f4f4f2', null, 0, '#4fa3d9', { long: true }), mother: 'goldbluete' }); const p = nearPlayer(40); w.x = p.x; w.y = p.y; w.hidden = false; w.ai = { m: 'follow' }; w.slow = true; } }] },
      { t: 'goto', at: 'lager', text: 'Bring Wolkenjunges ins Lager', enter() { const w = catById('wolkenjunges'); if (w) { w.ai = { m: 'follow' }; w.slow = true; } }, dlg: () => [['langschweif', 'Noch ein Hauskätzchen?! Feuerherz, willst du den Clan mit Zweibeiner-Katzen füllen?'], ['blaustern', 'Genug, Langschweif. Goldblüte wird ihn in der Kinderstube säugen. Wolkenjunges gehört jetzt zum DonnerClan.']], done() { const w = catById('wolkenjunges'); w.slow = false; w.ai = { m: 'home' }; chron('Feuerherz bringt Wolkenjunges, das Junge seiner Schwester Prinzessin, in den Clan.'); } },
    ]
  },
  {
    ch: 3, title: 'Tigerkralles Verrat', steps: [
      { t: 'scene', dlg: () => [['erz', 'Gelbzahn hat Braunstern Todesbeeren gegeben. Der blinde Kater ist gestorben – durch die Pfoten seiner eigenen Mutter.'], ['gelbzahn', 'Er war mein Sohn. Ich habe ihn in diese Welt gebracht … und ich musste ihn aus ihr nehmen.'], { do: () => chron('Gelbzahn vergiftet ihren Sohn Braunstern mit Todesbeeren.') }] },
      { t: 'night', text: 'Etwas stimmt nicht. Bleib wachsam … (warte bis zur Nacht – E an deinem Bau)' },
      {
        t: 'defeat', group: 'verrat', n: 4, text: 'Schreie aus Blausterns Bau! Beschütze die Anführerin!', at: 'lager', spawnNear: 900,
        spawn() { const a = denPos('anfuehrer'); storyFoes('verrat', 'einzel', 3, { x: a.x, y: a.y + 70 }, { lv: 2 }); const t = catById('tigerkralle'); t.hidden = true; spawnClanCat('einzel', a.x + 20, a.y + 20, { id: 'tiger_e', group: 'verrat', story: true, name: 'Tigerkralle', look: t.look, hp: 180, atk: 14, lv: 4, fleeAt: 0.2, r: 12 }); const b = catById('blaustern'); b.x = a.x; b.y = a.y + 10; b.ai = { m: 'hold' }; },
        dlg: () => [
          ['tigerkralle', 'Du! Immer wieder du, Hauskätzchen!'],
          ['blaustern', 'Tigerkralle … du wolltest mich töten? Dich, dem ich mehr vertraut habe als jedem anderen?'],
          ['player', 'Er hat auch Rotschweif getötet, Blaustern. Rabenpfote hat es gesehen. Und die Falle am Donnerweg war für dich.'],
          ['blaustern', 'Tigerkralle, du bist verbannt. Wenn wir dich nach Sonnenaufgang in unserem Territorium finden, werden wir dich töten.'],
          ['tigerkralle', 'Ihr werdet mich wiedersehen. Das schwöre ich euch!'],
          ACT({ cap: 'Tigerkralle rennt aus dem Lager – hinaus in die Dunkelheit.', moves: [['tiger_e', () => ({ x: LM.lager.x, y: LM.lager.y + LM.lager.r + 260 }), { sp: 230 }]], cam: 'tiger_e', dist: 200, end() { const t = ENTS.find(e => e.id === 'tiger_e'); if (t) t.gone = true; } }),
          { do: () => { const t = catById('tigerkralle'); t.clan = 'einzel'; t.rank = 'einzel'; t.hidden = true; G.flags.tigerVerbannt = moon(); chron('Tigerkralle versucht, Blaustern zu töten, und wird verbannt.'); } },
          CEREMONY('blaustern', []),
          ['blaustern', 'Der Clan braucht einen neuen Zweiten Anführer. Ich sage diese Worte vor dem SternenClan: Feuerherz wird der neue Zweite Anführer des DonnerClans.'],
          { do: () => { setRank(P(), 'zweiter'); setStage('zweiter'); chron('Feuerherz wird Zweiter Anführer. (Ende von Buch 3)'); gainXp(P(), 80); } },
          ['alle', 'Feuerherz! Feuerherz!'],
          CEREMONY_END,
          ['erz', '— Ende von Buch 3: Geheimnisse des Waldes —'],
        ], done() { goHome('blaustern'); }
      },
    ]
  },
  // ================= BUCH 4: VOR DEM STURM =================
  {
    ch: 4, title: 'Tigerstern', steps: [
      { t: 'custom', text: 'Als Zweiter Anführer teilst du die Patrouillen ein: Clan-Bildschirm (K) → „Patrouillen“', check: () => G.flags.dutySet, dlg: () => [['blaustern', 'Gut, Feuerherz. Der Clan muss gefüttert und die Grenzen bewacht werden.']] },
      { t: 'night', text: 'Heute Nacht ist Große Versammlung. Warte bis zur Nacht' },
      {
        t: 'goto', at: 'baumgeviert', guide: 'blaustern', text: 'Folge Blaustern zur Großen Versammlung am Baumgeviert', enter() { spawnGathering(); follow('blaustern'); G.others.schatten.leader = 'Tiger'; const l = ENTS.find(e => e.id === 'leader_schatten'); if (l) { l.name = 'Tigerstern'; l.look = catById('tigerkralle').look; } }, dlg: () => [
          ACT({ cap: 'Ein riesiger dunkelbrauner Tigerkater springt auf den Großfelsen. Die Katzen verstummen.', moves: [['leader_schatten', 'baumgeviert', { dy: -5, sp: 70 }]], cam: 'leader_schatten', dist: 150, pitch: 0.2 }),
          ['leader_schatten', 'Nachtstern ist an einer Krankheit gestorben. Der SternenClan hat mir neun Leben gegeben. Ich bin Tigerstern, Anführer des SchattenClans.'],
          ['blaustern', '(flüsternd) Tigerkralle … Anführer … Der SternenClan hat sich gegen uns gewandt.'],
          ['player', 'Blaustern, bleib stark. Der Clan braucht dich.'],
        ], done() { for (const e of ENTS) if (e.gathering) e.fleeing = true; goHome('blaustern'); G.others.schatten.lives = 9; G.others.schatten.rel = 15; chron('Tigerkralle wird Tigerstern, Anführer des SchattenClans.'); }
      },
    ]
  },
  {
    ch: 4, title: 'Jagd mit Sandsturm', steps: [
      { t: 'talk', who: 'sandpfote', text: 'Sandsturm will mit dir jagen gehen', dlg: () => [['sandpfote', 'Feuerherz! Der Frischbeutehaufen ist fast leer. Wetten, dass ich mehr fange als du?'], ['player', 'Die Wette gilt!']], done() { follow('sandpfote'); } },
      { t: 'catch', n: 3, text: 'Jage mit Sandsturm: Fang 3 Beutestücke', enter() { follow('sandpfote'); }, dlg: () => [['sandpfote', 'Drei? Ich habe vier! … Na gut, eins davon war eine sehr kleine Maus.']] },
      { t: 'deliver', n: 3, text: 'Bringt die Beute zum Frischbeutehaufen', enter() { follow('sandpfote'); }, dlg: () => [gatherTo('player', ['kleinohr', 'einauge'], 'Die Ältesten kommen sofort herbei, als sie die frische Beute riechen.'), ['kleinohr', 'Endlich ein ordentliches Kaninchen! Die jungen Krieger von heute …'], ['sandpfote', '(lacht) Gut gejagt, Feuerherz.']], done() { goHome('sandpfote'); ['kleinohr', 'einauge'].forEach(goHome); applyFx({ food: 10 }, true); } },
    ]
  },
  {
    ch: 4, title: 'Wolkenpfote und die Zweibeiner', steps: [
      {
        t: 'scene', dlg: () => [
          { do: () => { const w = catById('wolkenjunges'); if (w && w.rank === 'junges') { w.age = Math.max(6, w.age); setRank(w, 'schueler'); w.mentor = P().id; } } },
          ['erz', 'Wolkenpfote, dein Schüler, schleicht sich immer wieder zu den Zweibeinern. Dort bekommt er Futter – und er liebt es.'],
          ['sandpfote', 'Feuerherz! Wolkenpfote ist verschwunden. Ich habe gesehen, wie Zweibeiner ihn in ein Monster gesetzt haben!'],
          ['player', 'Dann holen wir ihn zurück. Kommst du mit, Sandsturm?'],
          ['sandpfote', 'Natürlich. Allein würdest du dich im Zweibeinerort sowieso verlaufen.'],
          { do: () => { follow('sandpfote'); const w = catById('wolkenjunges'); w.hidden = false; w.x = 3740; w.y = 3480; w.ai = { m: 'hold' }; } },
        ]
      },
      { t: 'goto', who: 'wolkenjunges', near: 60, noPatrol: true, guide: 'sandpfote', guideSay: 'Ich habe gesehen, wohin das Monster gefahren ist. Komm!', text: 'Folge Sandsturm – sie weiß, wohin das Monster fuhr', enter() { follow('sandpfote'); }, dlg: () => [['wolkenjunges', 'Feuerherz! Sandsturm! Die Zweibeiner haben mich eingesperrt … Ich will nach Hause – in den Clan! Ich will ein echter Krieger sein!'], ['player', 'Dann komm. Und diesmal bleibst du im Wald.']], done() { follow('wolkenjunges'); follow('sandpfote'); } },
      {
        t: 'goto', at: 'lager', text: 'Bringt Wolkenpfote zurück ins Lager', enter() { follow('wolkenjunges'); follow('sandpfote'); }, dlg: () => [
          ['sandpfote', 'Feuerherz … auf dem Weg habe ich gemerkt, wie gern ich mit dir unterwegs bin.'],
          { who: 'player', text: 'Was sagst du zu Sandsturm?', choices: [{ t: '„Ich auch, Sandsturm. Sehr gern.“' }, { t: 'Deine Nase an ihre drücken', fn: () => [['erz', 'Sandsturm schnurrt leise.']] }] },
          { do: () => { G.flags.sandsturm = 1; catById('sandpfote').rel = 95; chron('Feuerherz und Sandsturm holen Wolkenpfote von den Zweibeinern zurück – und werden Gefährten.'); } },
        ], done() { goHome('wolkenjunges'); goHome('sandpfote'); }
      },
    ]
  },
  {
    ch: 4, title: 'Feuer!', gap: 3, tasks: 3, steps: [
      { t: 'scene', dlg: () => [['erz', 'Blattgrüne. Seit Monden hat es nicht geregnet. Der Wald ist trocken wie Stroh.'], ['erz', 'Da riechst du Rauch! Am Donnerweg haben Zweibeiner etwas Brennendes weggeworfen – und der Wind treibt das Feuer auf das Lager zu!'], ACT({ cap: 'Dichter Rauch quillt vom Donnerweg her. Flammen springen von Baum zu Baum!', moves: [], cam: { x: LM.lager.x + 60, y: LM.lager.y - 380 }, start() { G.fire = { x: LM.lager.x + 60, y: LM.lager.y - 380, r: 90, max: 460 }; }, tick(dt) { G.fire.r += dt * 30; }, dist: 280, pitch: 0.4, wait: 3 }), ['player', 'FEUER! Alle raus aus dem Lager! Zu den Sonnenfelsen, zum Fluss!']] },
      {
        t: 'custom', at: 'sonnenfelsen', noPatrol: true, text: 'Das Lager brennt! Rette Goldblütes Junge (Kinderstube) und bring sie zu den Sonnenfelsen',
        enter() {
          G.weather = null; G.fire = { x: LM.lager.x + 60, y: LM.lager.y - 80, r: 80, max: 460 };
          const kb = ensureCat('brombeerjunges', { pre: 'Brombeer', suf: 'kralle', rank: 'junges', age: 3, sex: 'm', mother: 'goldbluete', look: L('#5a3e26', '#24160c', 0, '#e8b923') });
          const kt = ensureCat('bernsteinjunges', { pre: 'Bernstein', suf: 'pelz', rank: 'junges', age: 3, sex: 'w', mother: 'goldbluete', look: L('#8a5a30', null, 0, '#7bc043', { patch: '#2b2220' }) });
          const k = denPos('kinder'); [kb, kt].forEach((c, i) => { c.hidden = false; c.x = k.x + i * 20; c.y = k.y + 30; c.ai = { m: 'hold' }; });
          const g = catById('gelbzahn'), h = denPos('heiler'); g.x = h.x; g.y = h.y + 25; g.ai = { m: 'hold' }; g.sleep = true;
          allTo(LM.sonnenfelsen, ['brombeerjunges', 'bernsteinjunges', 'gelbzahn']);
        },
        tick() { const pc = P(); for (const id of ['brombeerjunges', 'bernsteinjunges']) { const c = catById(id); if (c.ai.m === 'hold' && dist(c.x, c.y, pc.x, pc.y) < 50) { c.ai = { m: 'follow' }; c.slow = true; say(c, 'Hilfe! Es brennt!'); } } },
        target: () => { const c = ['brombeerjunges', 'bernsteinjunges'].map(catById).find(c => c.ai.m === 'hold'); return c || LM.sonnenfelsen; },
        check: () => ['brombeerjunges', 'bernsteinjunges'].every(id => { const c = catById(id); return dist(c.x, c.y, LM.sonnenfelsen.x, LM.sonnenfelsen.y) < 230; }),
        dlg: () => [['goldbluete', 'Meine Jungen! Du hast Tigerkralles Junge gerettet … obwohl du ihn so hasst.'], ['player', 'Sie sind nicht ihr Vater, Goldblüte. Sie sind DonnerClan-Junge.'], ['erz', 'Da fällt dir etwas ein: Gelbzahn! Sie ist nicht bei den anderen!']]
      },
      { t: 'goto', who: 'gelbzahn', near: 60, text: 'Gelbzahn ist noch im brennenden Heilerbau! Lauf!', dlg: () => [
        ['gelbzahn', '(hustet) Feuerherz … Du Dummkopf … Du hättest nicht zurückkommen sollen …'],
        ['gelbzahn', 'Ich habe Halbschweif gesucht … zu spät. Hör zu. Ich bin stolz auf dich. Du warst mir … mehr ein Sohn als Braunstern je war.'],
        ['gelbzahn', 'Aschenpelz wird eine gute Heilerin. Sag ihr … dass ich …'],
        ['erz', 'Gelbzahn schließt die Augen. Die alte Heilerin ist zum SternenClan gegangen.'],
        { do: () => { killCat(catById('gelbzahn')); const h = catById('halbschweif'); if (h && h.alive) killCat(h); const a = catById('aschenjunges'); setRank(a, 'heiler'); a.mentor = null; chron('Ein Feuer zerstört das Lager. Feuerherz rettet Brombeerjunges und Bernsteinjunges. Gelbzahn und Halbschweif sterben. Aschenpelz wird Heilerin.'); } },
      ] },
      { t: 'scene', dlg: () => [ACT({ cap: 'Endlich fallen die ersten Tropfen. Dann prasselt der Regen herab.', moves: [], cam: 'player', start() { G.weather = 'regen'; }, tick(dt) { if (G.fire) G.fire.r = Math.max(0, G.fire.r - dt * 90); }, wait: 3, dist: 200, pitch: 0.4 }), ['erz', 'Die Flammen zischen und sterben. Das Lager ist schwarz und verkohlt – aber es wird wieder wachsen.'], { do: () => { G.fire = null; G.weather = 'regen'; for (const c of clanCats()) if (c !== P()) { c.ai = { m: 'home' }; c.slow = false; } applyFx({ morale: -10, food: -20, health: -10 }); } }, ['erz', '— Ende von Buch 4: Vor dem Sturm —']] },
    ]
  },
  // ================= BUCH 5: PFAD DER GEFAHR =================
  {
    ch: 5, title: 'Graustreifs Rückkehr', steps: [
      { t: 'talk', who: 'graupfote', text: 'Ein vertrauter Geruch am Fluss … Geh zu den Sonnenfelsen', enter() { const g = catById('graupfote'); g.hidden = false; g.clan = 'fluss'; g.x = LM.sonnenfelsen.x - 60; g.y = LM.sonnenfelsen.y + 40; g.ai = { m: 'hold' }; }, dlg: () => [['graupfote', 'Feuerherz … Der FlussClan hat mich fortgeschickt. Leopardenfell sagt, ich werde dort nie wirklich dazugehören.'], ['graupfote', 'Meine Jungen sind beim FlussClan gut aufgehoben. Aber mein Herz … mein Herz war immer im DonnerClan.'], ['player', 'Willkommen zu Hause, alter Freund.']], done() { const g = catById('graupfote'); g.clan = 'donner'; g.ai = { m: 'follow' }; chron('Graustreif kehrt zum DonnerClan zurück.'); } },
      { t: 'goto', at: 'lager', text: 'Bring Graustreif nach Hause ins Lager', enter() { follow('graupfote'); }, dlg: () => [gatherTo('graupfote', ['sandpfote', 'mausefell', 'weisspelz', 'farnjunges'], 'Die Katzen des DonnerClans drängen sich um Graustreif.'), ['sandpfote', 'Graustreif! Du bist wirklich zurück!'], ['mausefell', 'Hmpf. Hoffentlich riechst du bald nicht mehr nach Fisch.'], ['graupfote', '(schnurrt) Ich bin zu Hause.']], done() { ['graupfote', 'sandpfote', 'mausefell', 'weisspelz', 'farnjunges'].forEach(goHome); } },
    ]
  },
  {
    ch: 5, title: 'Hundegeruch', steps: [
      { t: 'talk', who: 'sandpfote', text: 'Sandsturm hat etwas Seltsames gerochen', dlg: () => [['sandpfote', 'Feuerherz, bei den Schlangenfelsen stinkt es nach Hund. Nicht nach einem – nach vielen.'], ['player', 'Zeig es mir.']], done() { follow('sandpfote'); } },
      {
        t: 'goto', at: 'schlangenfelsen', guide: 'sandpfote', guideSay: 'Leise! Hier entlang.', text: 'Folge Sandsturm leise zu den Schlangenfelsen', enter() { follow('sandpfote'); }, dlg: () => [
          ACT({ cap: 'Ein Knurren zwischen den Felsen. Dann jagt ein riesiger Hund an euch vorbei!', start() { const s = LM.schlangenfelsen; spawnBeast('hund', s.x + 220, s.y - 120, { id: 'hund_e', story: true, tame: true, hostile: false }); }, moves: [['hund_e', () => ({ x: LM.schlangenfelsen.x - 280, y: LM.schlangenfelsen.y + 60 }), { sp: 230 }]], cam: 'hund_e', shake: 3, dist: 170, end() { const h = ENTS.find(e => e.id === 'hund_e'); if (h) h.gone = true; } }),
          ['sandpfote', '(zitternd) Hast du das gesehen? Die leben in den Felsen – ein ganzes Rudel!'],
          ['player', 'Wir müssen Blaustern warnen.'],
        ]
      },
      { t: 'talk', who: 'blaustern', text: 'Warne Blaustern vor den Hunden', enter() { follow('sandpfote'); }, dlg: () => [['blaustern', 'Hunde? Im Wald? … Vielleicht hat der SternenClan sie geschickt, um uns zu bestrafen.'], ['player', 'Blaustern, der SternenClan hat sich nicht gegen uns gewandt. Aber wir müssen vorsichtig sein.'], ['blaustern', 'Dann meidet die Schlangenfelsen. Niemand jagt dort mehr allein.']], done() { goHome('sandpfote'); } },
    ]
  },
  {
    ch: 5, title: 'Meute, Meute!', gap: 1, tasks: 1, steps: [
      { t: 'goto', at: 'schlangenfelsen', guide: 'graupfote', guideSay: 'Da! Noch ein totes Kaninchen! Die Spur führt hier entlang!', text: 'Tote Kaninchen im Wald … Folge Graustreif auf der Spur', enter() { follow('graupfote'); }, dlg: () => [['erz', 'Eine Spur aus toten Kaninchen – sie führt von den Schlangenfelsen direkt zum DonnerClan-Lager. Tigerstern hat sie gelegt!'], ['erz', 'Am Ende der Spur liegt Buntgesicht. Tot. Sie war der Köder.'], { do: () => { const b = catById('buntgesicht'); if (b && b.alive) killCat(b); } }, ['graupfote', 'Tigerstern will die Hunde zu unserem Lager locken! Ein ganzer Clan … als Futter für Hunde!'], ['player', 'Dann locken wir die Meute zur Schlucht. Ich laufe vorne.']], done() { goHome('graupfote'); } },
      {
        t: 'custom', text: 'LAUF zur Schlucht! Der Anführer der Meute darf dich nicht erwischen!', at: 'schlucht', noPatrol: true,
        enter() { for (const e of ENTS) if (e.meute) e.gone = true; const s = LM.schlangenfelsen; spawnBeast('meute', s.x + 60, s.y - 40, { chase: true, story: true, meute: true, boss: true }); for (let i = 0; i < 2; i++) spawnBeast('hund', s.x - 70 + i * 40, s.y - 60, { story: true, meute: true, group: 'hunde' }); toast('„Meute, Meute! Töten, töten!“ – Lauf!'); },
        check: () => { const d = ENTS.find(e => e.kind === 'meute'); return d && dist(d.x, d.y, LM.schlucht.x, LM.schlucht.y) < 170 && dist(P().x, P().y, LM.schlucht.x, LM.schlucht.y) < 170; },
        dlg: () => [
          ['erz', 'Du rennst zum Rand der Schlucht. Der riesige Hund ist direkt hinter dir. Seine Zähne schnappen nach deinem Schwanz –'],
          ACT({ cap: 'Da springt eine blaugraue Gestalt aus dem Farn! Blaustern stürzt sich auf den Hund – und beide fallen in die Schlucht!', moves: [['blaustern', 'schlucht', { from: () => nearPlayer(200), sp: 280, hide: true }], [ENTS.find(e => e.kind === 'meute'), 'schlucht', { sp: 200, delay: 0.5 }]], cam: 'blaustern', shake: 4, dist: 160, end() { for (const e of ENTS) if (e.meute) e.gone = true; } }),
          ACT({ cap: 'Du springst hinterher in den reißenden Fluss. Zwei FlussClan-Krieger – Nebelfuß und Steinfell – helfen dir, Blaustern ans Ufer zu ziehen.', moves: [['player', 'schlucht', { sp: 200 }], ['blaustern', 'player', { from: () => ({ x: LM.schlucht.x - 60, y: LM.schlucht.y + 40 }), dx: 30, sp: 40, sleep: true, delay: 1 }]], cam: 'player', dist: 150, wait: 2 }),
          ['blaustern', 'Nebelfuß … Steinfell … meine Jungen. Vergebt mir, dass ich euch damals weggegeben habe …'],
          ['blaustern', 'Feuerherz … du bist das Feuer, das den Clan retten wird. Das hat Tüpfelblatt gesehen … Führe sie gut, mein Krieger …'],
          { do: () => { killCat(catById('blaustern')); chron('Blaustern opfert ihr letztes Leben und stürzt mit dem Anführer der Meute in die Schlucht. (Ende von Buch 5)'); } },
          ['erz', 'Blaustern ist tot. Die übrigen Hunde fliehen aus dem Wald.'],
          ['erz', '— Ende von Buch 5: Pfad der Gefahr —'],
        ]
      },
      { t: 'goto', at: 'lager', text: 'Kehre ins Lager zurück', dlg: () => [['erz', 'Der Clan hält Totenwache für Blaustern.'], ['aschenjunges', 'Feuerherz, du musst zum Mondstein, um deine neun Leben zu empfangen. Ich begleite dich – so ist es Brauch.']] },
    ]
  },
  // ================= BUCH 6: STUNDE DER FINSTERNIS =================
  {
    ch: 6, title: 'Neun Leben', steps: [
      { t: 'night', text: 'Warte bis zur Nacht (E an deinem Bau)' },
      {
        t: 'goto', at: 'mondstein', dream: 'stern', guide: 'aschenjunges', guideSay: 'Ich kenne den Weg zum Mondstein. Folge mir, Feuerherz.', text: 'Folge Aschenpelz zum Mondstein', enter() { follow('aschenjunges'); }, dlg: () => [
          ACT({ cap: 'Aschenpelz führt dich durch den dunklen Tunnel. Tief im Berg glänzt der Mondstein wie ein gefrorener Stern.', moves: [['player', 'hoehle', { sp: 70 }], ['aschenjunges', 'hoehle', { dx: 50, dy: 40, sp: 70 }]], cam: 'player', glow: 'hoehle', dist: 150, wait: 1.5 }),
          ['erz', 'Du legst dich hin und berührst den Stein mit der Nase … Alles wird kalt und hell.'],
          { do: () => ghosts(['rotschweif', 'loewenherz', 'tuepfelblatt', 'gelbzahn', 'buntgesicht', 'silberfluss', 'blaustern']) },
          ghostWalk(['rotschweif', 'loewenherz', 'tuepfelblatt', 'gelbzahn', 'buntgesicht', 'silberfluss', 'blaustern'], 'Katzen aus Sternenlicht kommen von allen Seiten auf dich zu. Der SternenClan ist gekommen.'),
          ['rotschweif', 'Mit diesem Leben gebe ich dir Gerechtigkeit. Urteile fair über alle Katzen.'],
          ['loewenherz', 'Mit diesem Leben gebe ich dir Mut. Nutze ihn, um deinen Clan zu verteidigen.'],
          ['tuepfelblatt', 'Mit diesem Leben gebe ich dir Liebe. Nutze sie für alle Katzen deines Clans – besonders für die Jungen und Schwachen.'],
          ['gelbzahn', 'Mit diesem Leben gebe ich dir Mitgefühl. Auch für die Ältesten, die Kranken … und deine Feinde.'],
          ['buntgesicht', 'Mit diesem Leben gebe ich dir Schutz – so wie eine Mutter ihre Jungen beschützt.'],
          ['silberfluss', 'Mit diesem Leben gebe ich dir Treue zu dem, was du für richtig hältst.'],
          ['erz', 'Zwei weitere Krieger schenken dir die Leben der Ausdauer und des Mentorenseins.'],
          ['blaustern', 'Mit meinem Leben gebe ich dir Adel, Gewissheit und Vertrauen. Du warst immer das Feuer, das den Clan retten würde.'],
          ['blaustern', 'Ich grüße dich bei deinem neuen Namen: Feuerstern. Dein altes Leben ist vorbei. Nimm diese neun Leben und führe deinen Clan.'],
          { do: () => { clearStoryEnts(); const pc = P(); setRank(pc, 'anfuehrer'); pc.hp = pc.maxHp; G.player.lives = 9; setStage('anfuehrer'); chron('Am Mondstein erhält Feuerherz neun Leben vom SternenClan und wird Feuerstern.'); gainXp(pc, 120); } },
        ]
      },
      {
        t: 'goto', at: 'lager', text: 'Kehre als Feuerstern ins Lager zurück', enter() { follow('aschenjunges'); }, dlg: () => [CEREMONY('sammy', []), ['erz', 'Du springst auf den Hochstein. Zum ersten Mal blickst du als Anführer auf deinen Clan hinab.'], ['alle', 'Feuerstern! Feuerstern!'], {
          who: 'player', text: 'Du ernennst deinen Zweiten Anführer:', choices: clanCats().filter(c => c.rank === 'krieger' && c !== P()).sort((a, b) => (b.id === 'weisspelz') - (a.id === 'weisspelz') || (b.id === 'graupfote') - (a.id === 'graupfote')).slice(0, 3).map(c => ({ t: catName(c) + (c.id === 'weisspelz' ? ' (wie im Buch)' : ''), fn: () => { setRank(c, 'zweiter'); chron(`${catName(c)} wird Zweiter Anführer.`); return [[c.id, 'Ich werde dich nicht enttäuschen, Feuerstern.'], CEREMONY_END]; } }))
        }], done() { goHome('aschenjunges'); }
      },
    ]
  },
  {
    ch: 6, title: 'Der BlutClan', steps: [
      { t: 'night', text: 'Große Versammlung heute Nacht. Warte bis es dunkel ist' },
      {
        t: 'goto', at: 'baumgeviert', text: 'Geh zur Großen Versammlung am Baumgeviert', enter() { spawnGathering(); G.others.fluss.leader = 'Leoparden'; const b = LM.baumgeviert; const l = ENTS.find(e => e.id === 'leader_schatten'); if (l) { l.name = 'Tigerstern'; l.look = catById('tigerkralle').look; } spawnClanCat('blut', b.x + 70, b.y - 60, { id: 'geissel_e', name: 'Geißel', look: LOOK.geissel(), hostile: false, truce: true, story: true, ai: 'leader', collar: '#d8d0c0' }); for (let i = 0; i < 5; i++) spawnClanCat('blut', b.x + 120 + i * 25, b.y - 120 + i * 20, { hostile: false, truce: true, story: true, gathering: true, look: randomLook(true), collar: '#8a7a6a', wander: { x: b.x + 140, y: b.y - 100, r: 40 } }); },
        dlg: () => [
          ['leader_schatten', 'SchattenClan und FlussClan sind jetzt ein Clan: der TigerClan! Und ich habe Verbündete mitgebracht – den BlutClan aus dem Zweibeinerort.'],
          ['geissel_e', 'Ich bin Geißel. Der Wald gehört jetzt uns. Und du, Tigerstern … wir brauchen dich nicht mehr.'],
          ACT({ cap: 'Der kleine schwarze Kater geht langsam auf Tigerstern zu. Seine Krallen klicken auf dem Stein …', moves: [['geissel_e', 'leader_schatten', { dx: -28, sp: 60 }]], cam: 'geissel_e', dist: 130, pitch: 0.18, wait: 0.8 }),
          ['erz', 'Blitzschnell schlägt der kleine schwarze Kater zu. Seine Krallen sind mit Hundezähnen verstärkt. Tigerstern stürzt zu Boden …'],
          ['erz', '… und verliert alle neun Leben auf einmal. Ein Jaulen, das nicht aufhören will. Dann ist es still.'],
          { do: () => { const l = ENTS.find(e => e.id === 'leader_schatten'); if (l) l.gone = true; const t = catById('tigerkralle'); t.alive = false; t.deathMoon = moon(); G.others.schatten.leader = 'Schwarz'; G.others.schatten.lives = 9; chron('Geißel, Anführer des BlutClans, tötet Tigerstern mit einem Schlag.'); } },
          ['geissel_e', 'Ihr habt drei Tage. Verlasst den Wald – oder sterbt.'],
        ], done() { clearStoryEnts(); for (const e of ENTS) if (e.gathering) e.gone = true; }
      },
      { t: 'talk', who: 'riesenstern', text: 'Geh zum WindClan-Lager und sprich mit Riesenstern', enter() { const r = ensureCat('riesenstern', { fixed: 'Riesenstern', pre: 'Riesen', suf: 'stern', rank: 'anfuehrer', clan: 'wind', age: 120, sex: 'm', look: LOOK.riesenstern(), homePos: { x: LM.windlager.x, y: LM.windlager.y + 30 } }); r.hidden = false; r.x = LM.windlager.x; r.y = LM.windlager.y + 30; r.ai = { m: 'hold' }; }, dlg: () => [['riesenstern', 'Feuerstern. Der WindClan steht in deiner Schuld – du hast uns nach Hause gebracht.'], ['player', 'Dann kämpfe mit uns. DonnerClan und WindClan als ein Clan: der LöwenClan! Wie die großen Katzen aus den alten Geschichten.'], ['riesenstern', 'Der LöwenClan. So sei es. Und Leopardenstern und Schwarzstern werden sich anschließen – der BlutClan ist unser aller Feind.']], done() { const r = catById('riesenstern'); r.hidden = true; applyFx({ rel: { wind: 20, fluss: 15, schatten: 15 } }); chron('DonnerClan, WindClan, FlussClan und SchattenClan vereinen sich zum LöwenClan.'); } },
    ]
  },
  {
    ch: 6, title: 'Vorbereitung auf die Schlacht', steps: [
      { t: 'talk', who: 'aschenjunges', text: 'Aschenpelz bereitet den Clan auf den Kampf vor', dlg: () => [['aschenjunges', 'Feuerstern, wenn der BlutClan kommt, wird es viele Wunden geben. Ich brauche Spinnweben, um Blutungen zu stillen. Viele Spinnweben.']] },
      { t: 'herb', kind: 'spinnweben', n: 3, text: 'Sammle 3 Spinnweben für Aschenpelz' },
      { t: 'talk', who: 'aschenjunges', text: 'Bring Aschenpelz die Spinnweben', dlg: () => [['aschenjunges', 'Danke. Jetzt sind wir so bereit, wie wir sein können.']] },
      { t: 'goto', at: 'sandkuhle', guide: 'graupfote', guideSay: 'Ein letztes Training. Komm!', text: 'Trainiere mit Graustreif in der Sandkuhle', enter() { follow('graupfote'); }, dlg: () => [gatherTo('player', ['sandpfote', 'farnjunges', 'dornenjunges', 'mausefell'], 'Die Krieger des DonnerClans versammeln sich in der Sandkuhle.'), ['graupfote', 'Geißel ist klein, aber schnell. Du musst schneller sein.']] },
      { t: 'defeat', group: 'graupfote', text: 'Übungskampf gegen Graustreif', enter() { spar('graupfote'); }, dlg: () => [['graupfote', 'Uff! Wenn du so gegen Geißel kämpfst, hat er keine Chance.'], ['erz', 'In der Nacht schläft kaum eine Katze. Morgen entscheidet sich das Schicksal des Waldes.'], { do: () => { ['graupfote', 'sandpfote', 'farnjunges', 'dornenjunges', 'mausefell'].forEach(goHome); gainXp(P(), 60); } }] },
    ]
  },
  {
    ch: 6, title: 'Die letzte Schlacht', gap: 1, tasks: 0, steps: [
      {
        t: 'defeat', group: 'blut', n: 7, at: 'platane', spawnNear: 700, noPatrol: true, text: 'Der LöwenClan stellt sich dem BlutClan an der Großen Platane!',
        enter() { clanCats().filter(c => (c.rank === 'krieger' || c.rank === 'zweiter') && c !== P()).slice(0, 6).forEach(c => { c.ai = { m: 'follow' }; }); const pc = P(); for (let i = 0; i < 4; i++) spawnClanCat(['wind', 'fluss', 'schatten', 'wind'][i], pc.x + rand(-80, 80), pc.y + rand(-80, 80), { ally: true, hostile: false, story: true, followP: false, lv: 2 }); },
        spawn() { const p = LM.platane; storyFoes('blut', 'blut', 6, p, { lv: 3, look: randomLook(true), collar: '#8a7a6a' }); spawnClanCat('blut', p.x, p.y - 40, { group: 'blut', story: true, name: 'Knochen', look: LOOK.knochen(), hp: 200, atk: 15, lv: 5, collar: '#d8d0c0' }); for (const e of ENTS) if (e.group === 'blut') e.collar = '#8a7a6a'; },
        dlg: () => [['erz', 'Der Kampf tobt. Knochen, Geißels riesiger Stellvertreter, hat Weißpelz tödlich verwundet – doch dann stürzen sich die DonnerClan-Schüler gemeinsam auf ihn.'], { do: () => { const w = catById('weisspelz'); if (w && w.alive && w !== P()) killCat(w, 'Weißpelz stirbt im Kampf gegen Knochen.'); const g = catById('graupfote'); if (g && g.alive && !deputyCat()) { setRank(g, 'zweiter'); } } }, ['graupfote', 'Feuerstern! Da drüben – Geißel!']]
      },
      {
        t: 'custom', text: 'Besiege Geißel, den Anführer des BlutClans!', at: 'platane', noPatrol: true,
        enter() { const p = LM.platane, pc = P(); if (!ENTS.some(e => e.id === 'geissel_boss')) spawnClanCat('blut', pc.x + 60, pc.y - 30, { id: 'geissel_boss', group: 'geissel', story: true, boss: true, name: 'Geißel', look: LOOK.geissel(), hp: 320, atk: 16, lv: 6, fleeAt: 0, collar: '#d8d0c0', speed: 215 }); },
        tick() {
          const g = ENTS.find(e => e.id === 'geissel_boss'); if (!g || Dlg.open) return;
          if (!G.story.bossLife && g.hp < g.maxHp * 0.55) {
            G.story.bossLife = 1;
            Dlg.show([['erz', 'Geißels Hundezahn-Krallen reißen dir die Kehle auf. Alles wird schwarz …'], ['erz', 'Sternenlicht. Du siehst Blaustern, Löwenherz, Tüpfelblatt. „Noch ist es nicht Zeit, Feuerstern.“'], ['erz', 'Du öffnest die Augen. Du hast ein Leben verloren – aber du lebst! Geißel starrt dich entsetzt an.'], ['geissel_e', 'Unmöglich … Wie kannst du noch leben?!'], ['player', 'Ich bin Feuerstern. Und der SternenClan kämpft an meiner Seite!']]);
            G.player.lives = Math.max(1, G.player.lives - 1); P().hp = P().maxHp;
          }
        },
        check: () => { const g = ENTS.find(e => e.id === 'geissel_boss'); return g && g.hp <= 1; },
        target: () => ENTS.find(e => e.id === 'geissel_boss'),
        dlg: () => [['erz', 'Mit einem letzten Schlag besiegst du Geißel. Der Anführer des BlutClans fällt – und seine Krieger fliehen zurück in den Zweibeinerort.'], { do: () => { clearStoryEnts(); for (const c of clanCats()) if (c !== P()) c.ai = { m: 'home' }; applyFx({ morale: 25, terr: 15, rep: 20 }); chron('Der LöwenClan besiegt den BlutClan. Feuerstern tötet Geißel und verliert dabei ein Leben.'); } }, ['graupfote', 'Wir haben es geschafft, Feuerstern. Der Wald ist frei.'], ['erz', 'Die vier Clans trennen sich wieder – jeder in sein Territorium. Der Wald ist im Gleichgewicht.'], ['erz', '— Ende von Buch 6: Stunde der Finsternis —']]
      },
      {
        t: 'scene', dlg: () => [
          ['erz', 'Du hast die erste Staffel erlebt – vom Hauskätzchen Sammy bis zu Feuerstern, dem Anführer des DonnerClans.'],
          { do: () => { G.flags.tigerstern = true; const s = catById('sandpfote'); if (s && s.alive) { setRank(s, 'koenigin'); const o = { mother: 'sandpfote', rank: 'junges', age: 0 }; ensureCat('eichhornjunges', Object.assign({ pre: 'Eichhorn', suf: 'schweif', sex: 'w', look: L('#c0501e', null, 0.35, '#6fc23a'), storyLock: true }, o)); ensureCat('blattjunges', Object.assign({ pre: 'Blatt', suf: 'see', sex: 'w', look: L('#a8845a', '#6a4a2a', 0.4, '#e8b923'), storyLock: true }, o)); chron('Sandsturm bekommt zwei Junge: Eichhornjunges und Blattjunges.'); } } },
          ['erz', 'Ein Mond später: Sandsturm bekommt zwei Töchter – Eichhornjunges mit feuerrotem Fell wie ihr Vater, und die sanfte Blattjunges.'],
          ['erz', 'Doch die Geschichte ist noch nicht zu Ende. Eine neue Prophezeiung wartet …'],
        ]
      },
    ]
  },
  // ================= STAFFEL 2 – DIE NEUE PROPHEZEIUNG =================
  // ---------------- BUCH 7: MITTERNACHT ----------------
  {
    ch: 7, title: 'Ein Traum vom SternenClan', steps: [
      {
        t: 'scene', dlg: () => [
          { do: () => { startStaffel2(); } },
          ['erz', 'Viele Monde sind vergangen. Feuerstern führt den DonnerClan, und der Wald lebt in Frieden.'],
          ['erz', 'Doch diese Geschichte erzählt ein anderer: Brombeerkralle, der Sohn von Tigerstern. Viele Katzen misstrauen ihm – wegen seines Vaters.'],
          ['player', 'Ich bin nicht mein Vater. Ich werde es allen beweisen.'],
          ['erz', 'Du spielst jetzt Brombeerkralle. Feuerstern ist dein Anführer.'],
        ]
      },
      { t: 'night', text: 'Leg dich im Kriegerbau schlafen (warte bis zur Nacht)' },
      {
        t: 'scene', dream: 'stern', dlg: () => [
          { do: () => ghosts(['blaustern']) },
          ghostWalk(['blaustern'], 'Im Traum stehst du in einem Wald aus Sternenlicht. Eine blaugraue Kätzin tritt auf dich zu.'),
          ['blaustern', 'Brombeerkralle. Ein großes Unheil kommt über den Wald. Eine Katze aus jedem Clan muss aufbrechen.'],
          ['blaustern', 'Reist dorthin, wo die Sonne im Wasser ertrinkt. Dort wird Mitternacht euch sagen, was ihr tun müsst.'],
          ['player', 'Mitternacht? Wer ist Mitternacht? Blaustern, warte!'],
          { do: () => { clearStoryEnts(); chron('Brombeerkralle träumt von Blaustern: Eine Katze aus jedem Clan soll zum Wassernest der Sonne reisen.'); } },
          ['erz', 'Du wachst auf. Dein Herz klopft wie wild.'],
        ]
      },
      {
        t: 'talk', who: 'eichhornjunges', text: 'Eichhornpfote hat dich beobachtet – sprich mit ihr', dlg: () => [
          ['eichhornjunges', 'Du hast im Schlaf gesprochen, Brombeerkralle! Was hast du geträumt? Sag schon!'],
          ['player', 'Blaustern hat mir eine Reise befohlen. Zum Wassernest der Sonne. Du darfst niemandem etwas sagen!'],
          ['eichhornjunges', 'Sagen? Ich komme mit! Und versuch gar nicht erst, mich aufzuhalten. Ich bin Feuersterns Tochter – ich bin mutiger als du denkst.'],
          { who: 'player', text: 'Was antwortest du?', choices: [{ t: '„Na gut. Aber du hörst auf mich.“' }, { t: '„Du bist nur eine Schülerin!“', fn: () => [['eichhornjunges', 'Und du bist nur ein mürrischer Krieger. Ich komme trotzdem mit!']] }] },
        ], done() { follow('eichhornjunges'); }
      },
      {
        t: 'goto', at: 'baumgeviert', text: 'Triff die anderen Auserwählten heimlich am Baumgeviert', enter() { follow('eichhornjunges'); const b = LM.baumgeviert; placeJourney(b.x, b.y, 'hold'); }, dlg: () => [
          gatherTo('player', ['bernsteinjunges', 'kraehenpfote', 'federschweif', 'sturmpelz'], 'Im Schatten der vier Eichen warten Katzen aus allen Clans.'),
          ['bernsteinjunges', 'Brombeerkralle! Mein Bruder! Ich hatte denselben Traum. Ich bin jetzt im SchattenClan – aber das ist wichtiger als Clangrenzen.'],
          ['kraehenpfote', 'Ich bin Krähenpfote vom WindClan. Und ich habe keine Lust, mit DonnerClan-Katzen durch die Gegend zu laufen. Aber der SternenClan hat gesprochen.'],
          ['federschweif', 'Ich bin Federschweif vom FlussClan. Das ist mein Bruder Sturmpelz. Unser Vater ist Graustreif – er hat viel von euch erzählt.'],
          ['sturmpelz', 'Eigentlich war nur Federschweif auserwählt. Aber ich lasse meine Schwester nicht allein gehen.'],
          ['player', 'Dann gehen wir zusammen. Nach Nordosten, über die Berge, bis dorthin, wo die Sonne ertrinkt.'],
        ], done() { journeyFollow(); chron('Brombeerkralle, Eichhornpfote, Bernsteinpelz, Krähenpfote, Federschweif und Sturmpelz brechen zur großen Reise auf.'); }
      },
      { t: 'goto', at: 'scheune', noPatrol: true, text: 'Rastet in der Scheune bei Mikusch und Rabenpfote', enter() { journeyFollow(); place('mikusch', LM.scheune.x + 30, LM.scheune.y + 10, 'home'); const r = catById('rabenpfote'); if (r) { r.hidden = false; r.x = LM.scheune.x - 30; r.y = LM.scheune.y + 20; r.ai = { m: 'home' }; } }, dlg: () => [['rabenpfote', 'Katzen aus allen vier Clans? Zusammen? Das habe ich noch nie gesehen. Die Sonne geht hinter den Bergen unter – folgt ihr, dann findet ihr das Wasser.'], ['mikusch', 'Nehmt euch Mäuse, so viele ihr wollt. Die Berge sind gefährlich.']] },
      { t: 'catch', n: 1, noPatrol: true, text: 'Alle haben Hunger. Jag etwas für die Gruppe', enter() { journeyFollow(); }, dlg: () => [['kraehenpfote', 'Nicht schlecht … für einen DonnerClan-Kater.'], ['eichhornjunges', 'Teilt! Jeder bekommt einen Bissen. So machen es Clan-Katzen.']] },
      { t: 'goto', at: 'wassernest', noPatrol: true, text: 'Überquert die Berge bis zum Wassernest der Sonne (ganz im Nordosten)', enter() { journeyFollow(); }, dlg: () => [{ do: () => { G.time = Math.floor(G.time / 1440) * 1440 + 18 * 60; } }, ACT({ cap: 'Hinter den Dünen breitet sich ein Wasser aus, so groß, dass es kein Ende hat. Es riecht nach Salz.', moves: [['player', () => ({ x: oceanEdge(LM.wassernest.y) - 90, y: LM.wassernest.y }), { sp: 90 }], ['eichhornjunges', () => ({ x: oceanEdge(LM.wassernest.y) - 100, y: LM.wassernest.y + 40 }), { sp: 95 }]], cam: 'player', pass: 90, passT: 5, dist: 240, pitch: 0.25, orbit: 0.1, wait: 2 }), ['eichhornjunges', 'Seht nur! Die Sonne versinkt im Wasser! Das Wassernest der Sonne!'], ['kraehenpfote', '… Das ist … wirklich schön.'], { do: () => { G.time = Math.floor(G.time / 1440) * 1440 + 19.5 * 60; } }] },
      { t: 'night', text: 'Wartet am Strand, bis es Nacht ist' },
      {
        t: 'goto', at: 'dachsbau', noPatrol: true, text: 'Folgt dem Geruch in den Dünen zu einem Bau – Mitternacht?', enter() { journeyFollow(); spawnBeast('dachs', LM.dachsbau.x, LM.dachsbau.y, { id: 'mitternacht_e', name: 'Mitternacht', hostile: false, tame: true, story: true, ai: 'leader' }); }, dlg: () => [
          ACT({ cap: 'Aus dem Bau tritt – ein Dachs! Die Katzen fauchen und sträuben das Fell.', moves: [['mitternacht_e', 'player', { from: 'dachsbau', fdy: -40, dx: 60, sp: 50 }]], cam: 'mitternacht_e', dist: 150 }),
          ['mitternacht_e', 'Keine Angst, kleine Krieger. Ich bin Mitternacht. Ich habe euch erwartet. Der SternenClan und ich – wir sprechen miteinander.'],
          ['mitternacht_e', 'Hört gut zu. Die Zweibeiner werden euren Wald zerstören. Ihre Monster werden die Bäume fällen und die Beute vertreiben.'],
          ['mitternacht_e', 'Die Clans müssen gehen. Alle vier. Zusammen. Ein sterbender Krieger wird euch den Weg zu eurer neuen Heimat zeigen – zu einem großen See unter dem Silbervlies.'],
          ['player', 'Unseren Wald verlassen? Das wird niemand glauben!'],
          ['mitternacht_e', 'Dann müsst ihr sie überzeugen. Geht jetzt. Die Zeit ist knapp.'],
        ], done() { chron('Die Auserwählten treffen den Dachs Mitternacht. Die Clans müssen den Wald verlassen.'); for (const e of ENTS) if (e.id === 'mitternacht_e') e.gone = true; }
      },
    ]
  },
  // ---------------- BUCH 8: MONDSCHEIN ----------------
  {
    ch: 8, title: 'Der Stamm des eilenden Wassers', gap: 0, steps: [
      {
        t: 'goto', at: 'stamm', noPatrol: true, text: 'Auf dem Rückweg: Findet Schutz in den Bergen (Höhle am Wasserfall)', enter() { journeyFollow(); const s = LM.stamm; spawnClanCat('stamm', s.x, s.y + 10, { id: 'steinsager_e', name: 'Steinsager', look: L('#6a5a4a', null, 0, '#e8b923', { long: true }), hostile: false, story: true, ai: 'leader' }); for (let i = 0; i < 5; i++) spawnClanCat('stamm', s.x + rand(-110, 110), s.y + rand(20, 90), { name: pick(['Adler, der über Felsen kreist', 'Bach, wo kleine Fische schwimmen', 'Nacht ohne Mond', 'Stein, der im Wasser liegt']), look: L(pick(['#7a6a5a', '#5a4a3a', '#8a7a6a']), null, 0, '#e8b923'), hostile: false, story: true, wander: { x: s.x, y: s.y + 60, r: 100 } }); },
        dlg: () => [
          ['steinsager_e', 'Fremde Katzen. Ihr seid in der Höhle des Stammes des eilenden Wassers. Ich bin Steinsager, der Heiler-Anführer.'],
          ['steinsager_e', 'Unsere Ahnen haben uns eine Prophezeiung gegeben: Eine silberne Katze wird kommen und uns von Scharfzahn befreien.'],
          ['sturmpelz', 'Scharfzahn? Wer ist das?'],
          ['steinsager_e', 'Eine riesige Berglöwin. Sie hat viele von uns getötet. Ihr seid die Silbernen – ihr müsst uns helfen!'],
          ['federschweif', '(leise) Silbern … Sturmpelz ist grau. Aber ich … ich bin silbern.'],
        ]
      },
      {
        t: 'custom', at: 'stamm', noPatrol: true, text: 'Scharfzahn greift die Höhle an! Kämpft!',
        enter() { journeyFollow(); for (const e of ENTS) if (e.kind === 'scharfzahn') e.gone = true; const s = LM.stamm; spawnBeast('scharfzahn', s.x + 150, s.y + 60, { id: 'scharfzahn_e', story: true, boss: true, fleeAt: 0 }); toast('Scharfzahn!'); },
        check: () => { const b = ENTS.find(e => e.id === 'scharfzahn_e'); return b && b.hp < b.maxHp * 0.35; },
        target: () => ENTS.find(e => e.id === 'scharfzahn_e'),
        dlg: () => [
          ['erz', 'Scharfzahn stellt sich auf die Hinterbeine – da springt Federschweif auf einen Felsvorsprung über der Höhle.'],
          ACT({ cap: 'Federschweif stürzt sich mit dem Felszapfen hinab!', moves: [['federschweif', 'scharfzahn_e', { sp: 260 }]], cam: 'federschweif', shake: 6, dist: 140 }),
          ['erz', 'Sie reißt einen spitzen Felszapfen von der Decke. Katze und Stein stürzen gemeinsam auf Scharfzahn herab.'],
          { do: () => { for (const e of ENTS) if (e.id === 'scharfzahn_e') e.gone = true; } },
          ['erz', 'Scharfzahn ist tot. Doch Federschweif liegt reglos am Boden.'],
          ['federschweif', 'Sturmpelz … ich war … die silberne Katze … Es ist gut so …'],
          { do: () => { killCat(catById('federschweif')); chron('Federschweif opfert sich und tötet Scharfzahn, um den Stamm des eilenden Wassers zu retten.'); } },
          ['sturmpelz', 'Federschweif! NEIN!'],
          ['steinsager_e', 'Sie wird bei unseren Ahnen jagen. Der Stamm wird ihren Namen nie vergessen.'],
          ['sturmpelz', 'Ich … ich bleibe noch eine Weile hier. Bei ihr. Geht ohne mich nach Hause.'],
          { do: () => { const s = catById('sturmpelz'); s.hidden = true; s.ai = { m: 'home' }; G.flags.sturmBleibt = 1; clearStoryEnts(); } },
        ]
      },
      {
        t: 'goto', at: 'lager', noPatrol: true, text: 'Kehrt nach Hause zurück', enter() { journeyFollow(); }, dlg: () => [
          { do: () => { G.flags.zerstoert = 0.35; spawnBulldozers(); } },
          ACT({ cap: 'Als ihr zurückkehrt, erkennst du den Wald kaum wieder. Riesige gelbe Monster reißen Bäume aus dem Boden.', moves: [], cam: { x: 2500, y: 2050 }, dist: 320, pitch: 0.35, orbit: 0.08, wait: 3.5, shake: 1.5 }),
          ['erz', 'Wo einst Farn wuchs, ist nackte Erde.'],
          ['eichhornjunges', 'Mitternacht hatte recht … Es fängt schon an.'],
          { do: () => { journeyHome(); chron('Die Auserwählten kehren zurück. Die Zweibeiner beginnen, den Wald zu zerstören.'); } },
        ]
      },
    ]
  },
  // ---------------- BUCH 9: MORGENRÖTE ----------------
  {
    ch: 9, title: 'Der sterbende Wald', steps: [
      { t: 'talk', who: 'sammy', text: 'Berichte Feuerstern von Mitternachts Botschaft', dlg: () => [['sammy', 'Ihr seid einfach davongelaufen! Eichhornpfote, du hättest sterben können!'], ['player', 'Feuerstern, hör mir zu. Mitternacht hat gesagt: Alle vier Clans müssen den Wald verlassen. Die Zweibeiner werden alles zerstören.'], ['sammy', '… Ich sehe die Monster jeden Tag. Die Beute ist fast verschwunden. Vielleicht … vielleicht hast du recht, Brombeerkralle.'], { do: () => { G.flags.zerstoert = 0.55; applyFx({ food: -25, morale: -10 }, true); } }] },
      { t: 'scene', dlg: () => [['erz', 'Am nächsten Tag kehrt eine Patrouille verstört zurück.'], ['sandpfote', 'Graustreif! Die Zweibeiner haben Graustreif gefangen und in ein Monster gesperrt! Er ist fort!'], { do: () => { const g = catById('graupfote'); if (g && g.alive) { g.hidden = true; g.clan = 'verschollen'; if (g.rank === 'zweiter') setRank(g, 'krieger'); } chron('Graustreif wird von Zweibeinern gefangen und fortgebracht.'); } }, ['sammy', 'Mein bester Freund … Nein. Ich darf jetzt nicht aufgeben. Der Clan braucht mich.'], ['erz', 'Und dann: Blattpfote ist auch verschwunden! Krähenpfote hat sie bei den Zweibeiner-Käfigen gesehen.']] },
      { t: 'goto', who: 'blattjunges', near: 55, noPatrol: true, text: 'Rette Blattpfote aus den Käfigen der Zweibeiner', enter() { const b = catById('blattjunges'); b.hidden = false; b.x = LM.kaefige.x; b.y = LM.kaefige.y; b.ai = { m: 'hold' }; const k = catById('kraehenpfote'); k.hidden = false; k.x = LM.kaefige.x + 70; k.y = LM.kaefige.y + 40; k.ai = { m: 'hold' }; }, dlg: () => [['erz', 'In einem Drahtkäfig sitzt Blattpfote. Krähenpfote zerrt verzweifelt am Riegel.'], ['kraehenpfote', 'Hilf mir! Zusammen schaffen wir es!'], ACT({ cap: 'Ihr beißt und zerrt am Riegel … da springt er auf!', moves: [['player', 'kaefige', { dx: 20, sp: 80 }], ['kraehenpfote', 'kaefige', { dx: -20, dy: 10, sp: 80 }]], cam: 'kaefige', dist: 120, wait: 1.5, shake: 1.5 }), ACT({ moves: [['blattjunges', 'player', { dx: 30, dy: 30, sp: 120 }]], cam: 'blattjunges', dist: 120 }), ['blattjunges', 'Danke … Krähenpfote. Und dir auch, Brombeerkralle. Schnell weg, bevor die Zweibeiner zurückkommen!']], done() { follow('blattjunges'); const k = catById('kraehenpfote'); k.ai = { m: 'home' }; k.hidden = true; } },
      { t: 'goto', at: 'lager', text: 'Bring Blattpfote ins Lager', enter() { follow('blattjunges'); }, done() { goHome('blattjunges'); } },
      { t: 'catch', n: 2, text: 'Die Beute wird knapp. Jag im sterbenden Wald, was du noch finden kannst', dlg: () => [['player', 'Früher gab es hier überall Mäuse … jetzt muss ich lange suchen.']] },
      { t: 'deliver', n: 2, text: 'Bring die Beute zum Frischbeutehaufen – für die Jungen und Ältesten', dlg: () => [gatherTo('player', ['kleinohr', 'goldbluete'], 'Die hungrigen Ältesten und Königinnen kommen herbei.'), ['goldbluete', 'Danke, Brombeerkralle. Die Jungen haben seit zwei Tagen nichts gegessen.']], done() { ['kleinohr', 'goldbluete'].forEach(goHome); } },
      { t: 'night', text: 'Große Versammlung heute Nacht – warte bis es dunkel ist' },
      {
        t: 'goto', at: 'baumgeviert', guide: 'sammy', text: 'Folge Feuerstern zur letzten Versammlung am Baumgeviert', enter() { spawnGathering(); follow('sammy'); }, dlg: () => [
          ['sammy', 'Katzen aller Clans! Unser Wald stirbt. Die Beute ist fort. Wir müssen gehen – alle zusammen.'],
          ['leader_schatten', 'Der SchattenClan hungert. Wir kommen mit.'],
          ['leader_fluss', 'Die Zweibeiner haben unseren Fluss vergiftet. Auch der FlussClan geht.'],
          ['leader_wind', 'Ich bin alt und müde … aber der WindClan folgt euch. Führt uns, junge Krieger.'],
          ['erz', 'Zum ersten Mal in der Geschichte der Clans ziehen alle vier gemeinsam los.'],
        ], done() { for (const e of ENTS) if (e.gathering) e.gone = true; goHome('sammy'); G.flags.zerstoert = 0.85; chron('Alle vier Clans beschließen, den Wald gemeinsam zu verlassen.'); }
      },
      {
        t: 'custom', noPatrol: true, text: 'Die große Wanderung: Führe alle Clans über die Berge nach Osten zum großen See',
        enter() { startMigration(); },
        target: () => ({ x: 6760, y: 2980 }),
        check: () => { const pc = P(); if (dist(pc.x, pc.y, 6760, 2980) > 380) return false; const cs = clanCats().filter(c => c !== pc && !c.hidden); return cs.filter(c => dist(c.x, c.y, pc.x, pc.y) < 900).length >= cs.length * 0.6; },
        dlg: () => [
          ACT({ cap: 'Nach vielen Tagen erreicht ihr einen Hügel. Unter euch glitzert ein riesiger See.', moves: [], cam: { x: LAKE.x, y: LAKE.y }, start() { G.time = Math.floor(G.time / 1440) * 1440 + 19 * 60; }, pass: 150, passT: 5, dist: 900, pitch: 0.35, orbit: 0.05, wait: 4.5 }),
          ['erz', 'Unter euch liegt der See. In der Nacht spiegelt sich das Silbervlies darin – als würde der SternenClan selbst im Wasser leuchten.'],
          ['erz', 'Da bricht Riesenstern, der alte Anführer des WindClans, zusammen. Er ist der sterbende Krieger aus Mitternachts Botschaft.'],
          [{ name: 'Riesenstern', look: LOOK.riesenstern() }, 'Ich habe … euch … hierher gebracht. Hier … ist eure Heimat …'],
          { do: () => { G.others.wind.leader = 'Kurz'; G.others.wind.lives = 9; arriveAtLake(); } },
          ['sammy', 'Hier werden wir leben. Katzen des DonnerClans – unser neues Lager ist eine Steinmulde im Wald am Westufer.'],
          ['erz', '— Ende von Buch 9: Morgenröte —'],
        ]
      },
    ]
  },
  // ---------------- BUCH 10: STERNENGLANZ ----------------
  {
    ch: 10, title: 'Die neue Heimat', steps: [
      { t: 'goto', at: 'lager', guide: 'sammy', guideSay: 'Folgt mir! Ich habe einen Ort für unser Lager gefunden.', text: 'Folge Feuerstern zur Steinmulde – dem neuen Lager', done() { goHome('sammy'); }, dlg: () => [['sammy', 'Felswände schützen uns, und es gibt Platz für alle Baue. Das ist gut. Brombeerkralle, erkunde mit einer Patrouille unser Territorium.']] },
      { t: 'goto', at: 'buchenhain', guide: 'sandpfote', guideSay: 'Ich führe die Patrouille. Hier entlang!', text: 'Folge Sandsturms Patrouille zum Buchenhain', dlg: () => [['erz', 'Hohe Buchen, raschelndes Laub – und es riecht nach Eichhörnchen. Gute Jagdgründe!']] },
      { t: 'goto', at: 'zweibeinernest', guide: 'sandpfote', text: 'Folge Sandsturm zum verlassenen Zweibeinernest', done() { goHome('sandpfote'); }, dlg: () => [['erz', 'Ein altes, halb verfallenes Zweibeinernest. Zwischen den Steinen wachsen Katzenminze und andere Kräuter. Blattpfote wird sich freuen.']] },
      { t: 'talk', who: 'blattjunges', text: 'Blattpfote hat etwas gespürt – sprich mit ihr', dlg: () => [['blattjunges', 'Brombeerkralle … ich habe geträumt. Oben in den Hügeln gibt es einen Teich, in dem die Sterne leuchten. Dort können Heiler mit dem SternenClan sprechen. Kommst du mit?']], done() { follow('blattjunges'); } },
      {
        t: 'goto', at: 'mondstein', dream: 'stern', guide: 'blattjunges', guideSay: 'Hier hinauf! Ich spüre es – es ist ganz nah!', text: 'Folge Blattpfote hinauf in die Hügel', enter() { follow('blattjunges'); }, dlg: () => [
          ACT({ cap: 'Ganz oben in den Hügeln plätschert ein Wasserfall in einen kleinen Teich. Blattpfote läuft ans Ufer.', moves: [['blattjunges', 'mondsee', { dx: -30, dy: 40, sp: 90 }]], cam: 'mondsee', glow: 'mondsee', dist: 220, pitch: 0.4, wait: 1.5, start() { G.time = Math.floor(G.time / 1440) * 1440 + 23 * 60; } }),
          { do: () => ghosts(['blaustern', 'tuepfelblatt', 'gelbzahn', 'loewenherz']) },
          ghostWalk(['blaustern', 'tuepfelblatt', 'gelbzahn', 'loewenherz']),
          ['erz', 'Ein Wasserfall plätschert in einen kleinen Teich. Das Wasser glänzt silbern im Mondlicht – und um ihn herum erscheinen Katzen aus Sternenlicht.'],
          ['tuepfelblatt', 'Willkommen, Blattpfote. Dies ist der Mondsee. Hier werdet ihr uns von nun an finden.'],
          ['blaustern', 'Ihr habt euren Weg gefunden. Der SternenClan ist euch gefolgt.'],
          ['blattjunges', 'Der Mondsee … Brombeerkralle, wir haben es geschafft!'],
          { do: () => { clearStoryEnts(); chron('Blattpfote findet den Mondsee. Der SternenClan ist den Clans an den See gefolgt.'); } },
        ], done() { goHome('blattjunges'); }
      },
      { t: 'night', text: 'Erste Versammlung auf der Insel heute Nacht – warte bis es dunkel ist' },
      {
        t: 'goto', at: 'baumgeviert', guide: 'sammy', guideSay: 'Zur Insel! Folgt mir durchs Wasser.', text: 'Folge Feuerstern zur Großen Versammlung auf der Insel', enter() { spawnGathering(); const h = ensureCat('habichtfrost', { pre: 'Habicht', suf: 'frost', rank: 'krieger', clan: 'fluss', sex: 'm', age: 30, look: L('#5a3e26', '#24160c', 0.3, '#9fe0ff', { size: 1.12 }) }); h.hidden = false; h.x = LM.baumgeviert.x + 60; h.y = LM.baumgeviert.y + 30; h.ai = { m: 'hold' }; }, dlg: () => [
          ['erz', 'Auf der Insel steht ein riesiger Baum. Die Anführer sitzen in seinen Ästen – so, wie früher auf dem Großfelsen.'],
          ACT({ cap: 'Ein großer dunkelbrauner Kater mit eisblauen Augen kommt auf dich zu.', moves: [['habichtfrost', 'player', { dx: 45, sp: 70 }]], cam: 'habichtfrost', dist: 130 }),
          ['habichtfrost', 'Du bist Brombeerkralle? Ich bin Habichtfrost vom FlussClan. Wir haben denselben Vater, du und ich: Tigerstern.'],
          ['habichtfrost', 'Wir sind stark, Bruder. Eines Tages werden wir beide Anführer sein. Das ist unser Schicksal.'],
          { who: 'player', text: 'Was sagst du?', choices: [{ t: '„Mein Schicksal bestimme ich selbst.“', fn: () => { G.flags.habicht = 0; } }, { t: '„Vielleicht hast du recht …“', fn: () => { G.flags.habicht = 1; return [['habichtfrost', 'Ich wusste, dass du mich verstehst.']]; } }] },
        ], done() { for (const e of ENTS) if (e.gathering) e.gone = true; goHome('sammy'); const h = catById('habichtfrost'); h.hidden = true; chron('Brombeerkralle trifft seinen Halbbruder Habichtfrost.'); }
      },
    ]
  },
  // ---------------- BUCH 11: DÄMMERUNG ----------------
  {
    ch: 11, title: 'Grenzen am See', steps: [
      { t: 'talk', who: 'sammy', text: 'Feuerstern hat einen Auftrag für dich', dlg: () => [['sammy', 'Brombeerkralle, unsere Grenzen am See sind noch nicht überall markiert. Nimm Eichhornschweif mit und setzt Duftmarken bis zum Buchenhain.']], done() { follow('eichhornjunges'); } },
      { t: 'goto', at: 'buchenhain', guide: 'eichhornjunges', guideSay: 'Ich weiß, wo die Grenze verläuft. Komm!', text: 'Folge Eichhornschweif zum Buchenhain', enter() { follow('eichhornjunges'); }, dlg: () => [['eichhornjunges', 'Hier. Dahinter riecht es nach SchattenClan. Setz deine Duftmarke!'], ACT({ cap: 'Ihr markiert die Grenze an jedem dritten Baum. Die Sonne sinkt tiefer.', moves: [['player', { x: LM.buchenhain.x + 80, y: LM.buchenhain.y - 90 }, { sp: 90 }], ['eichhornjunges', { x: LM.buchenhain.x + 110, y: LM.buchenhain.y - 60 }, { sp: 90 }]], cam: 'player', pass: 90, passT: 4, wait: 1.5 })] },
      { t: 'catch', n: 2, text: 'Jagt auf dem Rückweg im neuen Territorium', enter() { follow('eichhornjunges'); }, dlg: () => [['eichhornjunges', 'Die Beute hier am See ist fett und dumm. Hier werden wir nie hungern!']] },
      { t: 'deliver', n: 2, text: 'Bringt die Beute in die Steinmulde', dlg: () => [['sammy', 'Gute Arbeit, ihr beiden. Die Grenzen stehen, und der Clan ist satt.']], done() { goHome('eichhornjunges'); applyFx({ terr: 8, food: 8 }, true); } },
    ]
  },
  {
    ch: 11, title: 'Die Dachse', steps: [
      { t: 'night', text: 'Du bist müde … schlafe (warte bis zur Nacht)' },
      {
        t: 'scene', dream: 'finster', dlg: () => [
          { do: () => { const t = catById('tigerkralle'); const pc = P(); spawnClanCat('sternen', pc.x + 60, pc.y, { id: 'tigergeist', name: 'Tigerstern', look: Object.assign({}, t.look, { base: '#3a2818' }), star: true, hostile: false, truce: true, story: true, ai: 'leader' }); } },
          ['erz', 'Im Traum stehst du in einem dunklen Wald ohne Sterne. Ein riesiger Tigerkater wartet auf dich.'],
          ['tigergeist', 'Mein Sohn. Ich kann dich lehren, der stärkste Krieger aller Clans zu werden. Stärker als Feuerstern.'],
          { who: 'player', text: 'Was antwortest du deinem Vater?', choices: [{ t: '„Ich will stark sein – aber auf meine Art.“', fn: () => { G.flags.tigerTraining = 0; } }, { t: '„Zeig es mir.“', fn: () => { G.flags.tigerTraining = 1; return [['tigergeist', 'Gut. Sehr gut. Wir sehen uns wieder, Brombeerkralle.']]; } }] },
          { do: () => clearStoryEnts() },
          ['erz', 'Du wachst auf – von Kampfgeschrei! Etwas Großes bricht durch die Felswände der Steinmulde!'],
        ]
      },
      {
        t: 'defeat', group: 'dachse', n: 4, at: 'lager', spawnNear: 900, text: 'Dachse greifen das Lager an! Beschütze die Kinderstube!',
        spawn() { const k = denPos('kinder'); for (let i = 0; i < 4; i++) spawnBeast('dachs', k.x + rand(-60, 60), k.y + rand(-30, 60), { group: 'dachse', story: true }); const pc = P(); for (let i = 0; i < 3; i++) spawnClanCat('wind', LM.lager.x + rand(-40, 40), LM.lager.y - 120, { ally: true, hostile: false, story: true, lv: 2 }); spawnBeast('dachs', LM.lager.x, LM.lager.y - 150, { id: 'mitternacht_e', name: 'Mitternacht', hostile: false, tame: true, story: true, ai: 'leader' }); },
        dlg: () => [
          ACT({ cap: 'Mitternacht ist gekommen – mit WindClan-Kriegern! Gemeinsam treibt ihr die Dachse aus dem Lager.', moves: [['mitternacht_e', 'player', { dx: 60, sp: 80 }]], cam: 'mitternacht_e', dist: 170 }),
          ['mitternacht_e', 'Ich habe versucht, meine Verwandten aufzuhalten. Sie hörten nicht. Es tut mir leid.'],
          ['erz', 'Doch in der Kinderstube liegt Aschenpelz. Sie hat die Jungen beschützt – mit ihrem Leben.'],
          { do: () => { const a = catById('aschenjunges'); if (a && a.alive) killCat(a); const b = catById('blattjunges'); b.suf = 'see'; setRank(b, 'heiler'); b.storyLock = true; chron('Dachse überfallen die Steinmulde. Aschenpelz stirbt. Blattsee wird Heilerin des DonnerClans.'); clearStoryEnts(); } },
          ['blattjunges', 'Aschenpelz … meine Mentorin … Ich werde ihre Arbeit fortführen. Ich werde Blattsee heißen – so hat sie es sich gewünscht.'],
          ['erz', '— Ende von Buch 11: Dämmerung —'],
        ]
      },
    ]
  },
  // ---------------- BUCH 12: SONNENUNTERGANG ----------------
  {
    ch: 12, title: 'Sonnenuntergang', gap: 4, tasks: 3, steps: [
      { t: 'scene', dlg: () => [['blattjunges', 'Brombeerkralle! Ich hatte eine Vision vom SternenClan: „Bevor Frieden kommt, wird Blut Blut vergießen, und der See wird rot sein.“'], ['player', 'Blut wird Blut vergießen … Was soll das bedeuten?'], ['erz', 'Am Abend kehrt Feuerstern nicht von seiner Patrouille am Seeufer zurück.']] },
      {
        t: 'goto', who: 'sammy', near: 70, noPatrol: true, text: 'Suche Feuerstern am Seeufer', enter() { const f = catById('sammy'); f.x = LM.seeufer.x; f.y = LM.seeufer.y; f.ai = { m: 'hold' }; f.sleep = true; say(f, 'Hilfe … eine Falle!', 8); const h = catById('habichtfrost'); h.hidden = false; h.x = LM.seeufer.x + 50; h.y = LM.seeufer.y - 30; h.ai = { m: 'hold' }; }, dlg: () => [
          ['erz', 'Feuerstern hängt in einer Fuchsfalle der Zweibeiner. Der Draht schnürt ihm die Kehle zu. Neben ihm steht Habichtfrost.'],
          ['habichtfrost', 'Brombeerkralle. Endlich. Sieh ihn dir an – hilflos. Töte ihn! Dann wirst du Anführer des DonnerClans, und ich des FlussClans. So wie unser Vater es wollte.'],
          ['sammy', '(würgend) Brombeer…kralle …'],
          { who: 'player', text: 'Die Entscheidung deines Lebens:', choices: [{ t: 'Feuerstern befreien!', fn: () => { G.flags.treu = 1; } }, { t: 'Zögern …', fn: () => [['erz', 'Einen Herzschlag lang hörst du Tigersterns Stimme. Dann siehst du Eichhornpfotes Gesicht vor dir.'], ['player', 'NEIN! Ich bin nicht mein Vater!']] }] },
          ['habichtfrost', 'Du Narr! Dann stirb mit ihm!'],
        ]
      },
      {
        t: 'defeat', group: 'habichtfrost', noPatrol: true, text: 'Kämpfe gegen Habichtfrost!', enter() { spar('habichtfrost'); const h = catById('habichtfrost'); h.hp = h.maxHp = 180; },
        dlg: () => [
          ACT({ cap: 'Habichtfrost stolpert rückwärts – direkt auf einen spitzen Ast der Falle.', moves: [['habichtfrost', () => ({ x: LM.seeufer.x + 70, y: LM.seeufer.y + 60 }), { sp: 60, sleep: true }]], cam: 'habichtfrost', dist: 120, shake: 2, wait: 2 }),
          ['erz', 'Blut färbt das Wasser am Ufer rot.'],
          ['habichtfrost', 'Tigerstern … hat … gesagt …'],
          { do: () => { killCat(catById('habichtfrost')); chron('Habichtfrost stellt Feuerstern eine Falle. Brombeerkralle rettet Feuerstern; Habichtfrost stirbt.'); } },
          ['erz', 'Blut hat Blut vergossen. Die Prophezeiung hat sich erfüllt. Du befreist Feuerstern aus der Falle.'],
          ['sammy', 'Brombeerkralle … du hast mir das Leben gerettet. Ich habe dir zu lange misstraut. Du bist nicht dein Vater.'],
          { do: () => { const f = catById('sammy'); f.sleep = false; f.ai = { m: 'home' }; setRank(P(), 'zweiter'); setStage('staffel2b'); } },
          ['sammy', 'Ich sage diese Worte vor dem SternenClan: Brombeerkralle wird der neue Zweite Anführer des DonnerClans.'],
          ['eichhornjunges', 'Ich wusste es immer. Ich bin stolz auf dich, Brombeerkralle.'],
          ['erz', '— Ende von Buch 12: Sonnenuntergang —'],
        ]
      },
      {
        t: 'scene', dlg: () => [
          ['erz', 'Du hast die zweite Staffel erlebt: die große Reise, die Zerstörung des Waldes und die neue Heimat am See.'],
          ['erz', 'Das Leben am See geht weiter. Du bist Zweiter Anführer. Im Clan-Bildschirm (K) kannst du jetzt auch andere Katzen spielen – zum Beispiel Feuerstern.'],
          { do: () => { G.freeplay = true; chron('Brombeerkralle wird Zweiter Anführer. Die Clans leben am See. (Ende der 2. Staffel)'); for (const c of G.cats) c.storyLock = c.rank === 'zweiter'; } },
        ]
      },
    ]
  },
];

// ===== Story-Steuerung =====
// Zwischen den Kapiteln vergeht Zeit: Das Clanleben geht weiter, bevor das nächste große Ereignis kommt.
// gap = Tage bis zum nächsten Kapitel (Standard: 1, neues Buch: 2), tasks = Clan-Aufgaben in dieser Zeit
const PAUSE_TIPS = ['Jage für den Frischbeutehaufen', 'Bring Beute ins Lager', 'Sammle Kräuter für den Heiler', 'Vertreibe Eindringlinge an der Grenze'];
const Story = {
  paused() { return !!(G.story && G.story.pause); },
  step() { if (this.paused()) return null; const q = QUESTS[G.story.q]; return q ? q.steps[G.story.s] : null; },
  quest() { return QUESTS[G.story.q]; },
  done() { return G.story.q >= QUESTS.length; },
  text() {
    const pz = G.story.pause;
    if (pz) {
      const left = Math.max(0, Math.ceil((pz.until - G.time) / 1440));
      if (pz.prog < pz.need) return `Das Leben im Clan geht weiter: Hilf deinem Clan (${pz.prog}/${pz.need}) – ${PAUSE_TIPS[pz.prog % PAUSE_TIPS.length]}`;
      return left > 0 ? `Du hast deinem Clan gut geholfen. Ruh dich aus (E an deinem Bau) – noch ${left} ${left === 1 ? 'Tag' : 'Tage'}` : 'Ein neuer Morgen bricht an …';
    }
    const st = this.step(); if (!st) return null; let t = typeof st.text === 'function' ? st.text() : st.text; if (st.n > 1) t += ` (${G.story.prog}/${st.n})`; return t; },
  enter(isLoad) {
    const st = this.step(); if (!st) return;
    if (st.skip && st.skip()) { this.advance(true); return; }
    G.story.spawned = false;
    if (st.enter) st.enter(isLoad);
    if (st.guide) this.startGuide(st);
    if (st.t === 'scene') this.finish();
  },
  dest(st) { return st.pos ? st.pos() : st.who ? catById(st.who) : LM[st.at]; },
  startGuide(st) {
    const g = catById(st.guide), d = this.dest(st), pc = P(); if (!g || !g.alive || !d) return;
    g.hidden = false;
    if (dist(g.x, g.y, pc.x, pc.y) > 400) { const a = Math.atan2(d.y - pc.y, d.x - pc.x); g.x = pc.x + Math.cos(a) * 70; g.y = pc.y + Math.sin(a) * 70; }
    g.ai = { m: 'lead', x: d.x, y: d.y };
    say(g, st.guideSay || pick(['Folge mir!', 'Komm mit, ich zeig es dir!', 'Hier entlang!']), 3);
  },
  resetStep() {
    const st = this.step(); if (!st) return;
    clearStoryEnts();
    for (const c of G.cats) if (c.spar) { c.spar = false; c.ai = { m: 'home' }; }
    if (st.t === 'defeat' || st.t === 'custom') { G.story.prog = 0; G.story.bossLife = 0; this.enter(true); }
  },
  keepsFollower() { return false; },
  noPatrols() { const st = this.step(); return !!(st && (st.noPatrol || st.t === 'defeat' && st.spawnNear)); },
  herbHighlight() { const st = this.step(); if (st && st.t === 'herb') return st.kind; const m = G.missions && G.missions.find(m => m.type === 'herbs' && m.prog < m.n); return m ? m.kind : null; },
  finish() {
    const st = this.step(); if (!st || this.finishing) return;
    this.finishing = true;
    const lines = st.dlg ? st.dlg() : null;
    const end = () => { this.finishing = false; if (st.done) st.done(); this.advance(); };
    if (lines && lines.length) Dlg.show(lines, end, { cine: true }); else end();
  },
  advance(silent) {
    const prev = this.step();
    if (prev && prev.guide) { const g = catById(prev.guide); if (g && g.ai && g.ai.m === 'lead') g.ai = { m: 'follow' }; }
    G.story.s++; G.story.prog = 0; G.story.bossLife = 0;
    const q = this.quest();
    if (q && G.story.s >= q.steps.length) {
      G.story.q++; G.story.s = 0;
      if (!silent) toast(`✔ Abgeschlossen: ${q.title}`);
      const nq = this.quest();
      if (nq) {
        const newBook = nq.ch !== q.ch, gap = nq.gap !== undefined ? nq.gap : (newBook ? 2 : 1);
        if (gap > 0) {
          const need = nq.tasks !== undefined ? nq.tasks : (newBook ? 3 : 2);
          G.story.pause = { until: (day() + gap) * 1440 + 6 * 60, need, prog: 0, newBook };
          saveGame();
          setTimeout(() => toast(need ? '🌿 Die Zeit vergeht. Hilf deinem Clan, bis das nächste Abenteuer beginnt.' : '🌙 Ruh dich aus. Morgen geht es weiter.'), 1500);
          return;
        }
        this.announce(q, nq);
      }
      saveGame();
    }
    this.enter();
  },
  announce(q, nq) { if (!q || nq.ch !== q.ch) setTimeout(() => titleCard((nq.ch > 6 ? 'Staffel 2 · ' : '') + 'Buch ' + nq.ch, BOOKS[nq.ch], RECAP[nq.ch]), 600); else setTimeout(() => toast(`📖 ${nq.title}`), 1200); },
  endPause() {
    const pz = G.story.pause; G.story.pause = null;
    const nq = this.quest(); if (nq) this.announce(pz.newBook ? null : nq, nq);
    saveGame(); this.enter();
  },
  event(type, d) {
    const pz = G.story.pause;
    if (pz) { if (['catch', 'deliver', 'herb', 'defeat'].includes(type) && pz.prog < pz.need) { pz.prog++; if (pz.prog >= pz.need) toast('✔ Du hast deinem Clan gut geholfen.'); } return; }
    const st = this.step(); if (!st || this.finishing) return;
    const hit = (type === 'catch' && st.t === 'catch') || (type === 'deliver' && st.t === 'deliver') || (type === 'defeat' && st.t === 'defeat' && d.group === st.group) || (type === 'herb' && st.t === 'herb' && d.kind === st.kind);
    if (!hit) return;
    G.story.prog++;
    if (G.story.prog >= (st.n || 1)) this.finish();
  },
  talk(c) {
    const st = this.step(); if (!st || st.t !== 'talk' || st.who !== c.id || this.finishing) return false;
    if (st.need === 'prey' && !G.player.carry.length) { Dlg.show([[c.id, 'Hast du mir nichts mitgebracht? Ich habe Hunger …']]); return true; }
    this.finish(); return true;
  },
  target() {
    const st = this.step(); if (!st) return null;
    if (st.target) return st.target();
    if (st.guide) { const g = catById(st.guide), d = this.dest(st), pc = P(); if (g && !g.hidden && d && dist(g.x, g.y, pc.x, pc.y) > 170 && dist(g.x, g.y, d.x, d.y) > 60) return g; }
    if (st.pos) return st.pos();
    if (st.who) { const c = catById(st.who); return c && !c.hidden ? c : null; }
    if (st.at) return LM[st.at];
    if (st.t === 'deliver') return G.player.carry.length ? denPos('pile') : null;
    if (st.t === 'herb') return nearestHerb(st.kind, P());
    if (st.t === 'night') return P().clan === 'donner' ? denPos(denKeyOf(P())) : null;
    return null;
  },
  update(dt) {
    const pz = G.story.pause;
    if (pz) { if (!Dlg.open && pz.prog >= pz.need && G.time >= pz.until) this.endPause(); return; }
    const st = this.step(); if (!st || this.finishing || Dlg.open) return;
    const pc = P();
    if (st.tick) st.tick(dt);
    if (Dlg.open) return;
    if (st.t === 'goto') {
      const tg = this.dest(st);
      if (tg && !tg.hidden && dist(pc.x, pc.y, tg.x, tg.y) < (st.near || tg.r || 80)) this.finish();
    } else if (st.t === 'night') { if (isNight()) this.finish(); }
    else if (st.t === 'custom') { if (st.check()) this.finish(); }
    if (st.t === 'defeat' && st.spawn && !G.story.spawned) {
      const at = LM[st.at];
      if (!at || dist(pc.x, pc.y, at.x, at.y) < (st.spawnNear || 600)) { G.story.spawned = true; st.spawn(); toast('Feinde!'); }
    }
    // Feuer breitet sich aus und verbrennt
    if (G.fire) {
      if (G.fire.r < G.fire.max) G.fire.r += dt * 16;
      if (dist(pc.x, pc.y, G.fire.x, G.fire.y) < G.fire.r && !inRiver(pc.x, pc.y)) { pc.hp -= dt * 4; pc.flash = 0.1; if (pc.hp <= 0) playerDown(pc); if (Math.random() < dt / 3) toast('Der Rauch brennt in deinen Augen! Raus aus dem Feuer!'); }
    }
  }
};
