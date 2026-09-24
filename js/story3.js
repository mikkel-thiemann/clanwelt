'use strict';
// ===== Mehr Geschichte: zusätzliche Kapitel für Staffel 2 und die ganze Staffel 3 „Die Macht der Drei“ =====

// ---------- Helfer ----------
function questIdx(title) { for (let i = QUESTS.length - 1; i >= 0; i--) if (QUESTS[i].title === title) return i; return -1; }
function insertQuestsAfter(title, arr) { const i = questIdx(title); if (i < 0) { QUESTS.push(...arr); return; } QUESTS.splice(i + 1, 0, ...arr); }
function insertQuestsBefore(title, arr) { const i = questIdx(title); if (i < 0) { QUESTS.push(...arr); return; } QUESTS.splice(i, 0, ...arr); }
function insertStepsBefore(title, pred, steps) { const q = QUESTS[questIdx(title)]; if (!q) return; const i = q.steps.findIndex(pred); q.steps.splice(i < 0 ? q.steps.length : i, 0, ...steps); }
function followAll(ids) { ids.forEach(follow); }
function homeAll(ids) { ids.forEach(goHome); }
const lmName = k => (LM[k] ? LM[k].name : k);

// Ein Kapitel Clanleben: Auftrag holen, Patrouille, Jagd, Kräuter, Training, zurückmelden
function duty(ch, title, o) {
  const comp = [o.guide, ...(o.with || [])].filter(Boolean), fol = () => followAll(comp), steps = [];
  steps.push({ t: 'talk', who: o.who, text: o.talkText, dlg: () => o.intro, done: fol });
  for (const at of o.patrol || []) steps.push({ t: 'goto', at, guide: o.guide, text: () => `Patrouille: ${o.guide ? 'Folge ' + catName(catById(o.guide)) + ' ' : 'Geh '}zu „${lmName(at)}“`, enter: fol, dlg: o.at && o.at[at] ? () => o.at[at] : undefined });
  if (o.hunt) { steps.push({ t: 'catch', n: o.hunt, text: `Jage ${o.hunt} Beutestücke für den Clan`, enter: fol, dlg: o.huntDlg ? () => o.huntDlg : undefined }); steps.push({ t: 'deliver', n: o.hunt, text: 'Bring die Beute zum Frischbeutehaufen' }); }
  if (o.herb) steps.push({ t: 'herb', kind: o.herb[0], n: o.herb[1], text: `Sammle ${o.herb[1]} × ${HERBS[o.herb[0]].n}` });
  if (o.spar) steps.push({ t: 'defeat', group: o.spar, text: o.sparText || 'Übungskampf!', enter() { spar(o.spar); }, dlg: o.sparDlg ? () => o.sparDlg : undefined });
  steps.push({ t: 'talk', who: o.who, text: o.endText || (() => `Berichte ${catName(catById(o.who))}, was du erledigt hast`), dlg: () => o.outro, done() { homeAll(comp); gainXp(P(), o.xp || 45); if (o.fx) applyFx(o.fx, true); } });
  return { ch, title, gap: o.gap, tasks: o.tasks, steps };
}
// Durch die dunklen Tunnel auf die andere Seite
function tunnelWalk(to, ids, cap) {
  return ACT({
    cap: cap || 'Ihr kriecht in die Dunkelheit. Die Tunnel sind feucht und eng, irgendwo tropft Wasser …', moves: [['player', 'tunnelein', { dy: -25, sp: 70 }]], cam: 'player', dist: 120, wait: 1.5,
    end() { const d = LM[to], pc = P(); pc.x = d.x + 20; pc.y = d.y + 45; for (const id of ids) { const c = catById(id); if (c && !c.hidden) { c.x = d.x + rand(-40, 40); c.y = d.y + 50 + rand(0, 40); } } CAMS.snap = true; }
  });
}

// ================= STAFFEL 2: zusätzliche Kapitel =================
// Buch 7: Purdy, der Hund und der Bergpass (auf dem Weg zum Wassernest der Sonne)
insertStepsBefore('Ein Traum vom SternenClan', st => st.t === 'catch', [
  {
    t: 'goto', at: 'purdy', noPatrol: true, text: 'Tag 3: Im Fremdland liegt ein Zweibeinerort. Sucht dort nach einem Weg',
    enter() { journeyFollow(); const p = ensureCat('purdy', { fixed: 'Purdy', rank: 'einzel', clan: 'einzel', sex: 'm', age: 150, home: 'purdy', look: L('#8a6a4a', '#4a3020', 0.3, '#e8b923', { long: true }) }); p.home = 'purdy'; p.storyLock = true; p.hidden = true; },
    dlg: () => [
      ACT({ cap: 'Ein alter, zerzauster Kater schlurft aus dem Garten.', moves: [['purdy', 'player', { from: () => ({ x: LM.purdy.x, y: LM.purdy.y - 60 }), dx: 45, sp: 45 }]], cam: 'purdy' }),
      ['purdy', 'Na so was! Waldkatzen! Hab schon ewig keine mehr gesehen. Ich bin Purdy.'],
      ['purdy', 'Ihr wollt über die Berge? Da kenne ich jeden Stein. Na ja … fast jeden. Ich zeig euch den Weg.'],
      ['kraehenpfote', '(leise) Ein Hauskätzchen als Führer. Großartig.'],
      ['eichhornjunges', 'Sei nett, Krähenpfote! Er will uns helfen.'],
    ], done() { follow('purdy'); }
  },
  {
    t: 'defeat', group: 'purdyhund', n: 1, at: 'purdy', spawnNear: 900, noPatrol: true, text: 'Ein Hund stürmt aus dem Garten! Beschütze die Gruppe',
    enter() { journeyFollow(); follow('purdy'); }, spawn() { spawnBeast('hund', LM.purdy.x + 130, LM.purdy.y + 80, { group: 'purdyhund', story: true }); },
    dlg: () => [['purdy', 'Puh! Der Köter hat mich schon immer gehasst.'], ['eichhornjunges', 'Das war knapp! Gut gekämpft, Brombeerkralle.'], ['bernsteinjunges', 'Wir sind ein gutes Team – obwohl wir aus vier Clans kommen.']]
  },
  { t: 'goto', pos: () => ({ x: 7980, y: 1350, r: 110 }), noPatrol: true, text: 'Tag 3: Überquert den großen Donnerweg – hier rasen viele Monster!', enter() { journeyFollow(); follow('purdy'); }, dlg: () => [['purdy', 'Puh! Jedes Mal denke ich, diesmal erwischt es mich. Weiter, weiter!']] },
  { t: 'night', camp: true, noPatrol: true, text: 'Es wird Abend. Rastet am Waldrand im Fremdland (E: ausruhen)', enter() { journeyFollow(); follow('purdy'); }, dlg: () => [['purdy', 'Früher bin ich jeden Tag so weit gelaufen. Na ja … fast jeden Tag.'], ['eichhornjunges', '(flüstert) Er schnarcht lauter als Kleinohr.']] },
  morningStep('Tag 4: Schlaft bis zum Morgen (E: ausruhen)'),
  {
    t: 'goto', at: 'bergpass', noPatrol: true, guide: 'purdy', guideSay: 'Hier hinauf, meine Lieben. Und nicht nach unten schauen!', text: 'Folgt Purdy hinauf zum Bergpass', enter() { journeyFollow(); follow('purdy'); },
    dlg: () => [
      ACT({ cap: 'Oben am Pass pfeift ein eisiger Wind. Unter euch liegen Wälder und Wiesen – und ganz weit hinten glitzert etwas.', moves: [], cam: 'player', dist: 330, pitch: 0.4, orbit: 0.12, wait: 3 }),
      ['purdy', 'Von hier aus schafft ihr es allein. Immer der Sonne nach, bis sie im Wasser verschwindet.'],
      ['player', 'Danke, Purdy. Ohne dich hätten wir uns verlaufen.'],
      ['purdy', 'Ach was. Grüßt das große Wasser von mir!'],
      ACT({ cap: 'Purdy macht sich gemächlich auf den Heimweg.', moves: [['purdy', 'purdy', { sp: 90, hide: true }]], cam: 'purdy', max: 4, wait: 0.3 }),
    ], done() { const p = catById('purdy'); p.hidden = true; p.ai = { m: 'home' }; chron('Der alte Hauskater Purdy führt die Auserwählten zum Bergpass.'); }
  },
]);

// Buch 7: Die lange Reise – Tag und Nacht, Gefahren, Hunger und Streit (wie im Buch)
function morningStep(text) { return { t: 'custom', camp: true, noPatrol: true, text: text || 'Schlaft bis zum Morgen (E: ausruhen)', enter() { journeyFollow(); }, check: () => hour() >= 6 && hour() < 11, dlg: () => [ACT({ cap: 'Die Sonne geht auf. Steif vor Kälte streckt ihr euch und zieht weiter.', moves: [], cam: 'player', dist: 200, pitch: 0.35, orbit: 0.1, wait: 2 })] }; }
function campNight(cap, lines) {
  return { t: 'night', camp: true, noPatrol: true, text: 'Es wird Abend. Rastet, bis es Nacht ist (E: ausruhen)', enter() { journeyFollow(); }, dlg: () => [ACT({ cap, moves: JOURNEY.filter(id => id !== 'sturmpelz' || !G.flags.sturmBleibt).map((id, i) => [id, 'player', { dx: Math.cos(i * 1.3) * 40, dy: Math.sin(i * 1.3) * 40, sp: 60, sleep: true }]), cam: 'player', dist: 170, pitch: 0.45, orbit: 0.12, wait: 2 }), ...lines] };
}
insertStepsBefore('Ein Traum vom SternenClan', st => st.at === 'purdy', [
  { t: 'goto', pos: () => ({ x: 1300, y: 640, r: 90 }), noPatrol: true, text: 'Tag 1: Zieht vorbei an den Hochfelsen nach Osten', enter() { journeyFollow(); }, dlg: () => [ACT({ cap: 'Die Hochfelsen ragen über euch auf. Irgendwo darin liegt der Mondstein.', moves: [], cam: { x: 1000, y: 300 }, dist: 380, pitch: 0.3, orbit: 0.08, wait: 2.5 }), ['bernsteinjunges', 'Weiter als bis hierher war noch keiner von uns.'], ['kraehenpfote', 'Ich war schon am Mondstein. Mit meinem Mentor. Das ist nichts Besonderes.'], ['eichhornjunges', 'Angeber.']] },
  { t: 'goto', pos: () => ({ x: 2330, y: 760, r: 80 }), noPatrol: true, text: 'Überquert vorsichtig den Donnerweg – Monster!', enter() { journeyFollow(); }, dlg: () => [['erz', 'Ein Monster donnert vorbei, so nah, dass der Wind euch das Fell zerzaust. Dann seid ihr alle drüben.'], ['sturmpelz', 'Alle da? … Gut. Ich hasse Donnerwege.']] },
  {
    t: 'defeat', group: 'reiseratten', n: 3, at: 'kraehenort', spawnNear: 700, noPatrol: true, text: 'Am Krähenort stinkt es nach Abfall – Ratten greifen an!', enter() { journeyFollow(); },
    spawn() { for (let i = 0; i < 3; i++) spawnBeast('ratte', LM.kraehenort.x + rand(-90, 90), LM.kraehenort.y + rand(-60, 60), { group: 'reiseratten', story: true }); },
    dlg: () => [['erz', 'Die Ratten fliehen in ihre Löcher. Krähenpfote leckt eine blutende Wunde an seiner Schulter.'], ['kraehenpfote', 'Ist nichts. Nur ein Kratzer.'], ['federschweif', 'Das muss sauber bleiben. Ruh dich aus, wenn wir rasten.']]
  },
  campNight('Ihr rollt euch dicht aneinander unter einem Busch zusammen. Über euch leuchtet das Silbervlies – weit weg von zu Hause.', [['eichhornjunges', '(flüsternd) Brombeerkralle? Bist du noch wach? Ich vermisse die Kinderstube. Nur ein bisschen.'], ['player', 'Ich vermisse den Kriegerbau auch. Schlaf jetzt.']]),
  morningStep('Tag 2: Schlaft bis zum Morgen (E: ausruhen)'),
  { t: 'catch', n: 2, noPatrol: true, text: 'Tag 2: Krähenpfote ist geschwächt. Jag für die ganze Gruppe', enter() { journeyFollow(); }, dlg: () => [['kraehenpfote', '… Danke.'], ['bernsteinjunges', 'Hat Krähenpfote gerade „Danke“ gesagt? Zu einem DonnerClan-Kater?']] },
  {
    t: 'goto', pos: () => ({ x: 3900, y: 620, r: 100 }), noPatrol: true, text: 'Tag 2: Ein Gewitter zieht auf! Sucht Schutz zwischen den Felsen', enter() { journeyFollow(); G.weather = 'regen'; },
    dlg: () => [ACT({ cap: 'Der Himmel wird schwarz. Donner kracht, Regen peitscht über das Land. Ihr drängt euch unter einen Felsvorsprung.', moves: [], cam: 'player', dist: 220, pitch: 0.4, shake: 3, pass: 120, passT: 4, wait: 3 }), ['kraehenpfote', 'Das ist alles deine Schuld, Brombeerkralle! Wegen deines dummen Traums sitzen wir hier im Regen!'], ['eichhornjunges', 'Hör auf zu jammern! Wir haben ALLE denselben Traum gehabt!'], ['federschweif', 'Streiten hilft niemandem. Wir sind jetzt eine Gruppe – ob es euch gefällt oder nicht.']], done() { G.weather = null; }
  },
  campNight('Die zweite Nacht. Nasses Fell, leere Mägen. Niemand redet viel.', [['sturmpelz', 'Wie weit ist es noch bis zum Wassernest der Sonne?'], ['player', 'Ich weiß es nicht. Aber wir kommen an.']]),
  morningStep('Tag 3: Schlaft bis zum Morgen (E: ausruhen)'),
  { t: 'goto', at: 'fremdgrenze', noPatrol: true, text: 'Tag 3: Verlasst die Clan-Territorien nach Osten', enter() { journeyFollow(); }, dlg: () => [ACT({ cap: 'Hinter euch liegt der letzte Grenzstein mit Clan-Geruch. Vor euch: fremdes Land – Felder, Zweibeinernester und Wege, die keine Katze kennt.', moves: [], cam: 'player', dist: 480, pitch: 0.45, orbit: 0.1, wait: 3.5 }), ['bernsteinjunges', 'Hier riecht nichts mehr nach irgendeinem Clan. Nur nach Zweibeinern und Kühen.'], ['kraehenpfote', 'Und nach Hunden. Bleibt dicht zusammen.']] },
]);
insertStepsBefore('Ein Traum vom SternenClan', st => st.at === 'wassernest', [
  campNight('Oben in den Bergen ist die Nacht eisig. Der Wind heult um die Felsen, und ihr kuschelt euch eng zusammen.', [['bernsteinjunges', 'Ich kann meine Pfoten nicht mehr spüren …'], ['eichhornjunges', 'Rück näher. Wärme teilen. So machen es Clan-Katzen.']]),
  morningStep('Tag 5: Schlaft bis zum Morgen (E: ausruhen)'),
  { t: 'goto', pos: () => ({ x: 10450, y: 1300, r: 110 }), noPatrol: true, text: 'Tag 5: Steigt die Berge hinab – immer der Sonne nach', enter() { journeyFollow(); }, dlg: () => [ACT({ cap: 'Der Abstieg ist steil. Steine rollen unter euren Pfoten weg. Dann wird der Boden sandig.', moves: [], cam: 'player', dist: 260, pitch: 0.35, orbit: 0.1, wait: 2.5 }), ['federschweif', 'Riecht ihr das? Salz! Wie Tränen, nur viel stärker.']] },
  { t: 'goto', pos: () => ({ x: 10850, y: 1150, r: 110 }), noPatrol: true, guide: 'federschweif', guideSay: 'Hier entlang! Der Geruch wird stärker!', text: 'Tag 5: Ihr habt euch in den Dünen verlaufen. Folge Federschweifs Nase', enter() { journeyFollow(); }, dlg: () => [['kraehenpfote', 'Überall nur Sand! Wir laufen im Kreis!'], ['federschweif', 'Nein. Hört ihr das Rauschen? Wir sind fast da.']] },
  { t: 'catch', n: 1, noPatrol: true, text: 'Tag 5: Ein letztes Mal jagen, bevor ihr das Wasser erreicht', enter() { journeyFollow(); } },
]);

// Buch 8: Niemand glaubt den Auserwählten
insertQuestsAfter('Der Stamm des eilenden Wassers', [{
  ch: 8, title: 'Niemand glaubt uns', gap: 1, tasks: 2, steps: [
    { t: 'talk', who: 'blattjunges', text: 'Blattpfote hat auf dich gewartet', dlg: () => [['blattjunges', 'Ihr seid zurück! Jede Nacht habe ich von euch geträumt – von Bergen, von einer Berglöwin … und von Federschweif.'], ['player', 'Federschweif ist tot, Blattpfote. Und der Wald … die Zweibeiner werden alles zerstören.'], ['blattjunges', 'Ich weiß. Der SternenClan zeigt mir brennende Bäume, wenn ich schlafe.']] },
    { t: 'night', text: 'Heute Nacht ist Große Versammlung – warte, bis es dunkel ist' },
    {
      t: 'goto', at: 'baumgeviert', guide: 'sammy', text: 'Folge Feuerstern zur Großen Versammlung', enter() { spawnGathering(); follow('sammy'); }, dlg: () => [
        ACT({ cap: 'Die Anführer sitzen auf dem Großfelsen. Unruhe liegt in der Luft.', moves: [['sammy', 'baumgeviert', { dx: 30, dy: 25, sp: 100 }]], cam: 'baumgeviert', dist: 260, pitch: 0.45, wait: 1 }),
        ['leader_schatten', 'Der SchattenClan hat keine Angst vor ein paar Monstern. Die verschwinden wieder.'],
        ['leader_wind', 'Mein Clan hungert … aber das Moor verlassen? Es ist unsere Heimat.'],
        ['player', 'Bitte hört uns zu! Mitternacht hat es gesagt – bald gibt es hier nichts mehr!'],
        ['leader_fluss', 'Ein Dachs? Seit wann hören Clan-Katzen auf Dachse?'],
        ['erz', 'Die Versammlung endet im Streit. Niemand will es glauben – noch nicht.'],
      ], done() { for (const e of ENTS) if (e.gathering) e.gone = true; goHome('sammy'); }
    },
  ]
}]);

// Buch 9: Abschied vom alten Wald (vor der großen Wanderung)
insertStepsBefore('Der sterbende Wald', st => st.t === 'custom' && /Wanderung/.test(st.text), [
  {
    t: 'goto', at: 'sonnenfelsen', text: 'Nimm Abschied vom alten Wald: Geh ein letztes Mal zu den Sonnenfelsen', enter() { follow('eichhornjunges'); }, dlg: () => [
      ACT({ cap: 'Die Sonnenfelsen liegen still in der Abendsonne. Hier haben Generationen von Kriegern gekämpft.', moves: [['player', 'sonnenfelsen', { sp: 70 }], ['eichhornjunges', 'sonnenfelsen', { dx: 40, dy: 20, sp: 70 }]], cam: 'player', dist: 220, pitch: 0.35, orbit: 0.12, wait: 2.5 }),
      ['eichhornjunges', 'Hier hat mein Vater gegen den FlussClan gekämpft. Und jetzt gehört das alles den Monstern.'],
      ['player', 'Wir nehmen die Geschichten mit. Die kann uns niemand wegnehmen.'],
    ]
  },
  {
    t: 'goto', at: 'lager', text: 'Kehrt ins Lager zurück – es ist Zeit zu gehen', enter() { follow('eichhornjunges'); }, dlg: () => [
      gatherTo('sammy', ['kleinohr', 'goldbluete', 'sandpfote', 'mausefell'], 'Der ganze Clan versammelt sich ein letztes Mal im alten Lager.'),
      ['sammy', 'Katzen des DonnerClans! Heute verlassen wir unser Zuhause. Bleibt zusammen. Helft den Alten und den Jungen.'],
      ['kleinohr', 'Ich bin in diesem Lager geboren … und ich dachte, ich sterbe auch hier.'],
      ['erz', 'Langsam, Pfote für Pfote, verlässt der DonnerClan den alten Wald.'],
    ], done() { goHome('eichhornjunges'); }
  },
]);

// Buch 10: Das neue Lager
insertQuestsAfter('Die neue Heimat', [duty(10, 'Das neue Lager', {
  who: 'sammy', talkText: 'Feuerstern verteilt die Arbeit im neuen Lager', guide: 'sandpfote',
  intro: [['sammy', 'Die Steinmulde braucht Baue, und wir müssen unser Territorium kennenlernen. Brombeerkralle, geh mit Sandsturm auf Patrouille – danach jagt ihr.']],
  patrol: ['seeufer', 'zweibeinernest'], at: { seeufer: [['sandpfote', 'Hier beginnt das Gebiet des FlussClans. Riechst du die Fischluft?']], zweibeinernest: [['sandpfote', 'Die Zweibeiner kommen nur in der Blattgrüne hierher. Pass trotzdem auf.']] },
  hunt: 3, outro: [['sammy', 'Gut gemacht. Der Frischbeutehaufen ist voll – zum ersten Mal seit Monden.'], ACT({ cap: 'Nacht für Nacht wächst das neue Lager. Die Krieger flechten Brombeerranken zu Bauen, die Schüler schleppen Moos.', moves: [], cam: 'player', pass: 1440, passT: 6, dist: 260, pitch: 0.45, orbit: 0.15, wait: 5 })], fx: { food: 10, morale: 6 },
})]);

// Buch 11: Blattpfote läuft davon
insertQuestsBefore('Die Dachse', [{
  ch: 11, title: 'Blattpfotes Geheimnis', gap: 2, steps: [
    { t: 'scene', dlg: () => [['erz', 'Eines Morgens ist Blattpfote verschwunden. Und auch aus dem WindClan fehlt eine Katze: Krähenfeder.'], ['eichhornjunges', 'Meine Schwester … mit Krähenfeder?! Brombeerkralle, wir müssen sie finden!']], done() { follow('eichhornjunges'); } },
    {
      t: 'goto', pos: () => ({ x: 9850, y: 2350, r: 90 }), guide: 'eichhornjunges', guideSay: 'Ich rieche ihre Spur! Richtung Berge!', noPatrol: true, text: 'Folge Eichhornschweif auf Blattpfotes Spur in die Hügel',
      enter() { follow('eichhornjunges'); ['blattjunges', 'kraehenpfote'].forEach(id => { const c = catById(id); if (c) { c.hidden = true; c.ai = { m: 'hold' }; } }); },
      dlg: () => [
        ACT({ cap: 'Zwischen den Felsen sitzen zwei Katzen dicht beieinander.', moves: [['blattjunges', 'player', { from: () => ({ x: 9800, y: 2280 }), dx: 50, sp: 50 }], ['kraehenpfote', 'player', { from: () => ({ x: 9760, y: 2300 }), dx: 70, dy: 35, sp: 50 }]], cam: 'blattjunges' }),
        ['blattjunges', 'Eichhornschweif … ich liebe Krähenfeder. Aber eine Heilerin darf keinen Gefährten haben.'],
        ['kraehenpfote', 'Wir wollten ganz neu anfangen. Irgendwo, wo es keine Clans gibt.'],
        ['eichhornjunges', 'Blattpfote, der Clan braucht dich! Rußpelz braucht dich!'],
        ['erz', 'Da trägt der Wind einen Geruch heran: Dachse. Viele Dachse. Und sie ziehen Richtung Steinmulde.'],
        ['blattjunges', '… Ich komme mit. Mein Clan ist in Gefahr.'],
      ], done() { follow('blattjunges'); }
    },
    { t: 'goto', at: 'lager', text: 'Bring Blattpfote schnell zurück ins Lager', enter() { follow('blattjunges'); follow('eichhornjunges'); }, dlg: () => [['blattjunges', 'Ich bin zurück. Und ich bleibe.']], done() { const k = catById('kraehenpfote'); if (k) { k.hidden = true; k.ai = { m: 'home' }; } homeAll(['blattjunges', 'eichhornjunges']); chron('Blattpfote läuft mit Krähenfeder davon – und kehrt zurück, als ihr Clan sie braucht.'); } },
  ]
}]);

// Buch 12: Dunkle Träume
insertQuestsBefore('Sonnenuntergang', [{
  ch: 12, title: 'Dunkle Träume', gap: 2, steps: [
    { t: 'night', text: 'Du bist müde … schlafe (warte bis zur Nacht)' },
    {
      t: 'scene', dream: 'finster', dlg: () => [
        { do: () => { const t = catById('tigerkralle'), pc = P(); spawnClanCat('sternen', pc.x + 200, pc.y, { id: 'tigergeist2', name: 'Tigerstern', look: Object.assign({}, t.look, { base: '#3a2818' }), star: true, hostile: false, truce: true, story: true, ai: 'leader' }); const h = catById('habichtfrost'); if (h) { h.hidden = false; h.x = pc.x - 200; h.y = pc.y + 40; h.ai = { m: 'hold' }; } } },
        ACT({ cap: 'Wieder der dunkle Wald ohne Sterne. Aus dem Nebel treten zwei Gestalten: Tigerstern – und Habichtfrost.', moves: [['tigergeist2', 'player', { dx: 60, sp: 60 }], ['habichtfrost', 'player', { dx: -60, dy: 20, sp: 60 }]], cam: 'player', dist: 200, wait: 1 }),
        ['tigergeist2', 'Meine Söhne. Zusammen werdet ihr über alle Clans herrschen.'],
        ['habichtfrost', 'Hörst du, Bruder? Unser Vater glaubt an uns.'],
        { who: 'player', text: 'Was denkst du?', choices: [{ t: '„Ich trainiere – aber ich folge euch nicht.“' }, { t: 'Schweigen', fn: () => [['tigergeist2', 'Schweigen ist auch eine Antwort, Brombeerkralle.']] }] },
        { do: () => { for (const e of ENTS) if (e.id === 'tigergeist2') e.gone = true; const h = catById('habichtfrost'); if (h) h.hidden = true; } },
        ['erz', 'Du wachst auf. Deine Pfoten schmerzen, als hättest du wirklich gekämpft.'],
      ]
    },
    { t: 'talk', who: 'eichhornjunges', text: 'Eichhornschweif macht sich Sorgen um dich', dlg: () => [['eichhornjunges', 'Du hast im Schlaf geknurrt. Du träumst von Tigerstern, oder?'], ['player', 'Er lässt mich nicht los.'], ['eichhornjunges', 'Dann lass du ihn los. Du bist nicht er, Brombeerkralle. Das weiß ich.']] },
  ]
}]);

// ================= STAFFEL 3: DIE MACHT DER DREI =================
const DREI = ['loewenjunges', 'haeherjunges', 'distelpfote'];
const JOURNEY3 = ['brombeerjunges', 'eichhornjunges', 'haeherjunges', 'distelpfote', 'kraehenpfote', 'sturmpelz', 'bach'];
function startStaffel3() {
  const mk = (id, o) => { const c = ensureCat(id, Object.assign({ clan: 'donner' }, o)); c.storyLock = true; return c; };
  const lo = mk('loewenjunges', { pre: 'Löwen', suf: 'glut', rank: 'junges', sex: 'm', age: 5, mother: 'eichhornjunges', look: L('#d8a040', '#a8701e', 0.1, '#e8b923', { size: 1.05 }) });
  const ha = mk('haeherjunges', { pre: 'Häher', suf: 'feder', rank: 'junges', sex: 'm', age: 5, mother: 'eichhornjunges', look: L('#7a8088', '#4a5058', 0.1, '#b8dcf4') });
  const di = mk('distelpfote', { pre: 'Distel', suf: 'blatt', rank: 'junges', sex: 'w', age: 5, mother: 'eichhornjunges', look: L('#1e1e22', null, 0, '#5fbf4a') });
  mk('aschenfell', { pre: 'Aschen', suf: 'pelz', rank: 'krieger', sex: 'm', age: 40, look: L('#8a8e94', '#5a5e64', 0, '#3a5fa8') });
  [lo, ha, di].forEach(c => { c.clan = 'donner'; c.hidden = false; c.age = Math.max(c.age, 5); setRank(c, 'junges'); });
  const pc = P(); if (pc.alive) pc.lives = G.player.lives;
  const b = catById('brombeerjunges'); if (b) b.storyLock = true;
  switchPlayer(lo); setStage('staffel3');
  const k = denPos('kinder'); lo.x = k.x; lo.y = k.y + 40;
  G.time = (day() + 1) * 1440 + 9 * 60;
  titleCard('Staffel 3', 'Die Macht der Drei');
  chron('— Staffel 3: Die Macht der Drei — Eichhornschweif hat drei Junge: Löwenjunges, Häherjunges und Distelpfote. Du spielst jetzt Löwenjunges.');
}
function journey3Follow() { for (const id of JOURNEY3) { const c = catById(id); if (c && c.alive) { c.hidden = false; c.ai = { m: 'follow' }; } } }
function journey3Home() { for (const id of JOURNEY3) { const c = catById(id); if (!c || !c.alive) continue; if (c.clan === 'donner') c.ai = { m: 'home' }; else { c.hidden = true; c.ai = { m: 'home' }; } } }
function windKatze(id, pre, look, o) { const c = ensureCat(id, Object.assign({ pre, suf: 'pfote', rank: 'schueler', clan: 'wind', sex: 'w', age: 8, look }, o || {})); c.clan = 'wind'; c.storyLock = true; return c; }

QUESTS.push(
  // ---------------- BUCH 13: DER GEHEIME BLICK ----------------
  {
    ch: 13, title: 'Die Prophezeiung der Drei', gap: 3, tasks: 3, steps: [
      {
        t: 'scene', dream: 'stern', dlg: () => [
          ['erz', 'Eine kalte Blattleere-Nacht am See. Feuerstern schläft unruhig in seinem Bau.'],
          { do: () => { const pc = P(); spawnClanCat('sternen', pc.x + 200, pc.y, { id: 'geist_tuepfelblatt', name: 'Tüpfelblatt', look: catById('tuepfelblatt').look, star: true, hostile: false, truce: true, story: true, ai: 'leader' }); } },
          ghostWalk(['tuepfelblatt'], 'Im Traum tritt eine schildpattfarbene Kätzin aus dem Sternenlicht zu Feuerstern.'),
          ['tuepfelblatt', 'Feuerstern. Es werden drei sein, Blut von deinem Blut, die die Macht der Sterne in ihren Pfoten halten.'],
          ['sammy', 'Drei? Tüpfelblatt, was bedeutet das? Warte!'],
          { do: () => { clearStoryEnts(); startStaffel3(); } },
          ['erz', 'Einige Tage später: In der Kinderstube kuscheln sich drei Junge an Eichhornschweif – ein goldener Kater, ein grauer Kater und eine schwarze Kätzin.'],
          ['erz', 'Du bist Löwenjunges. Deine Geschwister heißen Häherjunges und Distelpfote. Häherjunges ist blind – aber er spürt Dinge, die andere nicht spüren.'],
        ]
      },
      { t: 'talk', who: 'haeherjunges', text: 'Sprich mit deinem Bruder Häherjunges', dlg: () => [['haeherjunges', 'Du trampelst wie ein Dachs, Löwenjunges. Ich hab dich schon gehört, bevor du aufgestanden bist.'], ['player', 'Ist doch egal! Morgen werden wir Schüler! Stell dir vor – richtig jagen!'], ['haeherjunges', 'Ich werde ein Krieger. Genau wie du. Egal, was die anderen sagen.']] },
      {
        t: 'goto', pos: () => Object.assign(denPos('hochstein'), { r: 90 }), text: 'Die Zeremonie beginnt! Geh zum Hochstein', dlg: () => [
          CEREMONY('sammy', DREI),
          ['sammy', 'Löwenjunges, von heute an heißt du Löwenpfote. Aschenpelz wird dein Mentor.'],
          ['sammy', 'Häherjunges, du heißt nun Häherpfote. Brombeerkralle wird dich ausbilden. Distelpfote – Sandsturm wird deine Mentorin.'],
          { do: () => { DREI.forEach(id => { const c = catById(id); c.age = Math.max(6, c.age); setRank(c, 'schueler'); }); P().mentor = 'aschenfell'; catById('haeherjunges').mentor = 'brombeerjunges'; catById('distelpfote').mentor = 'sandpfote'; chron('Löwenpfote, Häherpfote und Distelpfote werden Schüler.'); } },
          ['alle', 'Löwenpfote! Häherpfote! Distelpfote!'],
          CEREMONY_END,
          ACT({ cap: 'Aschenpelz, ein grauer Kater mit dunkelblauen Augen, kommt auf dich zu. Sein Blick ist freundlich – und doch irgendwie kalt.', moves: [['aschenfell', 'player', { dx: 45, sp: 70 }]], cam: 'aschenfell', dist: 130 }),
          ['aschenfell', 'Morgen zeige ich dir unser Territorium, Löwenpfote. Ich werde einen großen Krieger aus dir machen.'],
        ]
      },
    ]
  },
  duty(13, 'Das Territorium am See', {
    who: 'aschenfell', talkText: 'Aschenpelz wartet auf dich', guide: 'aschenfell', with: ['distelpfote'],
    intro: [['aschenfell', 'Heute lernst du unsere Grenzen kennen. Distelpfote kommt mit.'], ['distelpfote', 'Ich kenne das Gesetz der Krieger schon auswendig! Die Grenzen sind das Wichtigste.']],
    patrol: ['buchenhain', 'seeufer', 'zweibeinernest'],
    at: { buchenhain: [['aschenfell', 'Dahinter beginnt der SchattenClan. Die markieren ihre Grenze jeden Tag doppelt.']], seeufer: [['aschenfell', 'Der See. Hier endet unser Gebiet, dahinter liegt der FlussClan.'], ['distelpfote', 'Und die Insel? Da ist die Große Versammlung, oder?']], zweibeinernest: [['aschenfell', 'Das alte Zweibeinernest. Blattsee holt hier Katzenminze.']] },
    hunt: 2, huntDlg: [['aschenfell', 'Nicht schlecht für den ersten Tag.']],
    outro: [['aschenfell', 'Du lernst schnell, Löwenpfote. Schneller als die anderen.'], ['erz', 'Irgendetwas an der Art, wie Aschenpelz Eichhornschweif ansieht, ist seltsam.']],
  }),
  {
    ch: 13, title: 'Häherpfotes Weg', steps: [
      { t: 'scene', dlg: () => [['erz', 'Häherpfote trainiert hart. Doch bei der Jagd stolpert er über Wurzeln, und im Kampftraining weiß er nie, von wo der Gegner kommt.'], ['brombeerjunges', 'Häherpfote … ich glaube, der SternenClan hat einen anderen Weg für dich.'], ['haeherjunges', 'Weil ich blind bin?! Ich kann alles, was die anderen können!']] },
      { t: 'talk', who: 'haeherjunges', text: 'Häherpfote ist wütend. Tröste deinen Bruder', dlg: () => [['haeherjunges', 'Alle behandeln mich wie ein Junges. Nur weil ich nichts sehe.'], ['player', 'Du hörst und riechst mehr als wir alle zusammen. Vielleicht ist das deine Gabe.'], ['haeherjunges', '… Blattsee hat gefragt, ob ich ihr Schüler werden will. Heiler.'], ['player', 'Und?'], ['haeherjunges', 'Ich hab Nein gesagt. Aber … vielleicht sage ich morgen Ja.']] },
      { t: 'herb', kind: 'ringelblume', n: 2, text: 'Hilf Häherpfote: Sammle 2 Ringelblumen für Blattsee' },
      { t: 'talk', who: 'blattjunges', text: 'Bring die Ringelblumen zu Blattsee', dlg: () => [ACT({ cap: 'Im Heilerbau sortiert Häherpfote schon Kräuter – nur nach dem Geruch.', moves: [['haeherjunges', 'den:heiler', { dy: 30, sp: 60 }]], cam: 'haeherjunges', dist: 120 }), ['blattjunges', 'Häherpfote ist jetzt mein Schüler. Er erkennt jedes Kraut am Duft. So etwas habe ich noch nie erlebt.'], ['haeherjunges', 'Ringelblume. Frisch. Gut gepflückt, Löwenpfote.'], { do: () => { const h = catById('haeherjunges'); setRank(h, 'heilerschueler'); h.mentor = 'blattjunges'; chron('Häherpfote wird Heilerschüler bei Blattsee.'); } }], done() { goHome('haeherjunges'); } },
    ]
  },
  {
    ch: 13, title: 'Der dunkle Wald', gap: 2, steps: [
      { t: 'night', text: 'Schlafe im Schülerbau (warte bis zur Nacht)' },
      {
        t: 'defeat', group: 'traumkampf', n: 1, noPatrol: true, dream: 'finster', text: 'Im Traum: Ein riesiger Tigerkater fordert dich heraus! Kämpfe',
        enter() { const pc = P(), t = catById('tigerkralle'); spawnClanCat('sternen', pc.x + 70, pc.y, { id: 'tigertraum', group: 'traumkampf', name: 'Tigerstern', look: Object.assign({}, t.look, { base: '#3a2818' }), hostile: true, story: true, hp: 120, atk: 6, lv: 3, fleeAt: 0 }); say(ENTS.find(e => e.id === 'tigertraum'), 'Zeig mir, was du kannst!'); G.weather = null; },
        dlg: () => [['tigertraum', 'Gut. Sehr gut. Du hast die Kraft eines echten Kriegers, Löwenpfote.'], ['player', 'Wer bist du?'], ['tigertraum', 'Ich bin Tigerstern. Brombeerkralles Vater. Ich kann dich lehren, der Stärkste aller Clans zu werden.'], { who: 'player', text: 'Was antwortest du?', choices: [{ t: '„Bring es mir bei.“', fn: () => { G.flags.loewenTiger = 1; } }, { t: '„Ich weiß nicht …“', fn: () => { G.flags.loewenTiger = 0; return [['tigertraum', 'Du wirst wiederkommen. Alle kommen wieder.']]; } }] }, { do: () => clearStoryEnts() }, ['erz', 'Du wachst auf. Auf deinem Bein ist ein Kratzer – genau dort, wo Tigerstern dich getroffen hat.']]
      },
    ]
  },
  {
    ch: 13, title: 'Graustreif kehrt heim', steps: [
      {
        t: 'goto', at: 'lager', text: 'Aufregung am Lagereingang! Geh ins Lager', enter() { const g = catById('graupfote'); if (g) { g.alive = true; g.hidden = true; g.clan = 'donner'; } ensureCat('millie', { fixed: 'Millie', rank: 'krieger', clan: 'donner', sex: 'w', age: 30, look: L('#b8bec8', '#6a707a', 0, '#5ab0e8') }).hidden = true; },
        dlg: () => [
          ACT({ cap: 'Zwei staubige Katzen humpeln durch den Eingang: ein grauer Kater – und eine silberne Hauskätzin.', moves: [['graupfote', 'den:pile', { from: () => ({ x: LM.lager.x + LM.lager.r + 40, y: LM.lager.y }), sp: 70 }], ['millie', 'den:pile', { from: () => ({ x: LM.lager.x + LM.lager.r + 70, y: LM.lager.y + 30 }), dx: 30, dy: 20, sp: 70, delay: 0.4 }]], cam: 'graupfote', dist: 170 }),
          gatherTo('graupfote', ['sammy', 'sandpfote', 'brombeerjunges'], 'Der ganze Clan stürmt heran.'),
          ['sammy', 'Graustreif?! Du lebst! Wir dachten, die Zweibeiner hätten dich …'],
          ['graupfote', 'Ich habe euch gesucht, Feuerstern. Den ganzen Weg vom alten Wald bis hierher. Millie hat mir geholfen.'],
          ['millie', 'Hallo zusammen. Ich … ich möchte lernen, wie eine Clan-Katze zu leben.'],
          { do: () => { const g = catById('graupfote'); g.hidden = false; g.ai = { m: 'home' }; const m = catById('millie'); m.hidden = false; m.ai = { m: 'home' }; chron('Graustreif kehrt mit der Hauskätzin Millie zum DonnerClan zurück.'); } },
        ]
      },
    ]
  },
  {
    ch: 13, title: 'Die Versammlung auf der Insel', steps: [
      { t: 'night', text: 'Heute ist Vollmond – deine erste Große Versammlung! Warte bis zur Nacht' },
      {
        t: 'goto', at: 'baumgeviert', guide: 'aschenfell', text: 'Folge Aschenpelz zur Insel', enter() { spawnGathering(); follow('aschenfell'); follow('distelpfote'); windKatze('heidepfote', 'Heide', L('#b08a60', '#6a5030', 0.1, '#5ab0e8')).hidden = true; },
        dlg: () => [
          ACT({ cap: 'Auf der Insel wimmelt es von Katzen. Eine hellbraune WindClan-Schülerin mit blauen Augen kommt direkt auf dich zu.', moves: [['heidepfote', 'player', { from: () => ({ x: LM.baumgeviert.x + 150, y: LM.baumgeviert.y - 80 }), dx: 40, sp: 80 }]], cam: 'heidepfote', dist: 140 }),
          ['heidepfote', 'Du bist neu hier, oder? Ich bin Heidepfote vom WindClan. Wollen wir … zusammen sitzen?'],
          ['player', 'Äh … klar! Ich bin Löwenpfote.'],
          ['distelpfote', '(zischt) Löwenpfote! Sie ist aus einem anderen Clan! Denk an das Gesetz der Krieger!'],
          ['erz', 'Den ganzen Abend redet ihr über Jagdtricks, Mentoren und die Sterne. Du merkst gar nicht, wie die Zeit vergeht.'],
        ], done() { for (const e of ENTS) if (e.gathering) e.gone = true; catById('heidepfote').hidden = true; homeAll(['aschenfell', 'distelpfote']); }
      },
    ]
  },
  {
    ch: 13, title: 'Das Geheimnis der Drei', steps: [
      {
        t: 'talk', who: 'haeherjunges', text: 'Häherpfote will dir etwas Wichtiges sagen', dlg: () => [
          ['haeherjunges', 'Löwenpfote. Ich kann in die Träume anderer Katzen gehen. Letzte Nacht war ich in Feuersterns Traum.'],
          ['player', 'Du hast WAS?!'],
          ['haeherjunges', 'Ich habe die Prophezeiung gehört. „Es werden drei sein, Blut von deinem Blut, die die Macht der Sterne in ihren Pfoten halten.“'],
          ['haeherjunges', 'Feuerstern ist unser Großvater. Wir sind drei. Wir sind es, Löwenpfote. Du, Distelpfote und ich.'],
          ['player', 'Die Macht der Sterne … Aber was für eine Macht?'],
          ['haeherjunges', 'Das müssen wir herausfinden. Und niemand darf es erfahren.'],
          ['erz', '— Ende von Buch 13: Der geheime Blick —'],
        ], done() { chron('Häherpfote erfährt die Prophezeiung: Die drei Geschwister halten die Macht der Sterne in ihren Pfoten. (Ende von Buch 13)'); }
      },
    ]
  },
  // ---------------- BUCH 14: FLUSS DER FINSTERNIS ----------------
  {
    ch: 14, title: 'Die Tunnel', steps: [
      { t: 'talk', who: 'distelpfote', text: 'Distelpfote hat etwas entdeckt', dlg: () => [['distelpfote', 'Löwenpfote, bei den Felsen am Hang gibt es ein Loch im Boden. Es riecht nach WindClan! Das ist bestimmt ein Tunnel unter der Grenze.'], ['player', 'Ich schaue es mir an. Allein.']] },
      { t: 'night', text: 'Warte bis zur Nacht – dann schleichst du dich heimlich hinaus' },
      {
        t: 'goto', at: 'tunnelein', noPatrol: true, text: 'Schleich dich zum Tunneleingang am Hang', enter() { windKatze('heidepfote', 'Heide', L('#b08a60', '#6a5030', 0.1, '#5ab0e8')).hidden = true; },
        dlg: () => [
          tunnelWalk('tunnelein', [], 'Du kriechst in den Tunnel. Tief unter der Erde öffnet sich eine riesige Höhle, durch die ein unterirdischer Fluss rauscht.'),
          ACT({ cap: 'Plötzlich raschelt es: Heidepfote kommt aus einem anderen Gang!', moves: [['heidepfote', 'player', { from: () => ({ x: LM.tunnelein.x + 120, y: LM.tunnelein.y + 60 }), dx: 40, sp: 70 }]], cam: 'heidepfote', dist: 120 }),
          ['heidepfote', 'Löwenpfote! Diese Tunnel führen bis ins WindClan-Gebiet. Hier unten gibt es keine Grenzen …'],
          ['heidepfote', 'Lass uns hier treffen. Jede Nacht. Nur wir zwei. Ein Geheimnis.'],
          { who: 'player', text: 'Was sagst du?', choices: [{ t: '„Ja. Jede Nacht.“', fn: () => { G.flags.heide = 1; } }, { t: '„Das ist gegen das Gesetz der Krieger …“', fn: () => [['heidepfote', 'Hier unten sieht uns der SternenClan nicht. Bitte, Löwenpfote.']] }] },
        ], done() { catById('heidepfote').hidden = true; chron('Löwenpfote trifft sich heimlich mit Heidepfote vom WindClan in den Tunneln.'); }
      },
    ]
  },
  duty(14, 'Doppeltes Leben', {
    who: 'aschenfell', talkText: 'Aschenpelz ist unzufrieden mit dir', guide: 'aschenfell',
    intro: [['aschenfell', 'Du gähnst schon wieder, Löwenpfote. Was machst du nachts? Heute trainieren wir, bis du umfällst.']],
    spar: 'aschenfell', sparText: 'Kampftraining mit Aschenpelz', sparDlg: [['aschenfell', 'Hm. Du kämpfst gut – aber du siehst aus, als hättest du die ganze Nacht nicht geschlafen.']],
    hunt: 2, outro: [['aschenfell', 'Konzentrier dich, Löwenpfote. Ein Krieger mit zwei Herzen ist nur ein halber Krieger.'], ['erz', 'Nacht für Nacht schleichst du in die Tunnel. Tagsüber bist du müde – und Distelpfote wird misstrauisch.']],
  }),
  {
    ch: 14, title: 'Der Stock mit den Kratzern', steps: [
      {
        t: 'goto', at: 'seeufer', guide: 'haeherjunges', guideSay: 'Komm mit. Ich will dir etwas zeigen.', text: 'Folge Häherpfote ans Seeufer', enter() { follow('haeherjunges'); }, dlg: () => [
          ACT({ cap: 'Zwischen den Wurzeln einer alten Weide zieht Häherpfote einen verwitterten Stock hervor. Er ist voller Kratzer.', moves: [['haeherjunges', 'seeufer', { dx: -20, dy: -30, sp: 60 }]], cam: 'haeherjunges', dist: 110, wait: 2 }),
          ['haeherjunges', 'Jeder Kratzer ist eine Katze. Katzen, die lange vor den Clans hier gelebt haben. Wenn ich den Stock berühre, höre ich ihre Stimmen.'],
          ['haeherjunges', 'Einer von ihnen heißt Fels. Er ist sehr alt … und er weiß etwas über uns Drei.'],
          ['player', 'Das ist unheimlich, Häherpfote.'],
          ['haeherjunges', 'Das ist wichtig, Löwenpfote.'],
        ], done() { goHome('haeherjunges'); chron('Häherpfote findet einen alten Stock mit den Zeichen der Ahnen am See.'); }
      },
    ]
  },
  {
    ch: 14, title: 'Verschwundene Junge', steps: [
      {
        t: 'defeat', group: 'windvorwurf', n: 3, at: 'seeufer', spawnNear: 800, noPatrol: true, text: 'Eine wütende WindClan-Patrouille greift am Ufer an!',
        spawn() { storyFoes('windvorwurf', 'wind', 3, LM.seeufer, { lv: 3 }); },
        dlg: () => [['erz', 'Die WindClan-Krieger ziehen sich zurück. Einer ruft noch:'], [{ name: 'WindClan-Krieger', look: L('#8a7a6a', null, 0.2, '#e8b923') }, 'Ihr habt unsere Jungen gestohlen! Zwei sind verschwunden – und es riecht nach DonnerClan!'], ['player', '(leise) Die Tunnel … Die Jungen haben sich bestimmt in den Tunneln verlaufen!']]
      },
      {
        t: 'custom', noPatrol: true, at: 'tunnelaus', text: 'Such die WindClan-Jungen in den Tunneln und bring sie zum Ausgang im WindClan-Gebiet',
        enter() { for (const e of ENTS) if (e.group === 'windkits') e.gone = true; const t = LM.tunnelein; [0, 1].forEach(i => spawnClanCat('wind', t.x + 100 + i * 30, t.y + 90, { name: 'WindClan-Junges', kit: true, hostile: false, story: true, group: 'windkits', slot: i ? 0.5 : -0.5 })); },
        tick() { const pc = P(); for (const k of ENTS) if (k.group === 'windkits' && !k.followP && dist(k.x, k.y, pc.x, pc.y) < 55) { k.followP = true; say(k, 'Wir haben uns verlaufen!'); } if (ENTS.some(k => k.group === 'windkits' && k.followP) && dist(pc.x, pc.y, LM.tunnelein.x, LM.tunnelein.y) < 60 && !G.story.tunnelDone) { G.story.tunnelDone = 1; Dlg.show([tunnelWalk('tunnelaus', [], 'Mit den Jungen dicht hinter dir kriechst du durch die dunklen Gänge – immer dem WindClan-Geruch nach.')]); } },
        target: () => { const k = ENTS.find(e => e.group === 'windkits' && !e.followP); return k || (G.story.tunnelDone ? LM.tunnelaus : LM.tunnelein); },
        check: () => { const ks = ENTS.filter(e => e.group === 'windkits'); return ks.length && G.story.tunnelDone && ks.every(k => { if (!k.followP) return false; k.x = P().x + rand(-30, 30); k.y = P().y + rand(10, 40); return dist(P().x, P().y, LM.tunnelaus.x, LM.tunnelaus.y) < 150; }); },
        dlg: () => [['erz', 'Am Tunnelausgang wartet eine WindClan-Patrouille. Die Mutter der Jungen stürzt auf sie zu.'], [{ name: 'WindClan-Königin', look: L('#a08a70', null, 0.3, '#e8b923') }, 'Meine Jungen! Du … ein DonnerClan-Schüler hat sie gerettet?'], { do: () => { clearStoryEnts(); G.story.tunnelDone = 0; applyFx({ rel: { wind: 12 } }); chron('Löwenpfote rettet zwei WindClan-Junge aus den Tunneln.'); } }, ['erz', 'Der Frieden hält – vorerst.']]
      },
    ]
  },
  {
    ch: 14, title: 'Der Fluss der Finsternis', steps: [
      { t: 'scene', dlg: () => [['erz', 'Der Regen hört einfach nicht auf. Blattsee und Häherpfote sehen besorgt aus.'], ['haeherjunges', 'Das Wasser in den Tunneln steigt. Ich spüre es in meinen Pfoten. Wenn heute Nacht jemand dort unten ist …'], ['player', 'Heidepfote! Sie wollte mich heute treffen!']], done() { G.weather = 'regen'; } },
      {
        t: 'goto', at: 'tunnelein', noPatrol: true, text: 'Schnell zu den Tunneln – Heidepfote ist in Gefahr!', enter() { G.weather = 'regen'; follow('haeherjunges'); follow('distelpfote'); const h = catById('heidepfote'); h.hidden = true; windKatze('windpfote', 'Wind', L('#1e1e22', null, 0, '#e8b923'), { sex: 'm' }).hidden = true; },
        dlg: () => [
          tunnelWalk('tunnelein', [], 'In der großen Höhle rauscht der unterirdische Fluss, viel höher als sonst. Das Wasser schwappt über die Felsen.'),
          ACT({ cap: 'Da! Heidepfote und ein schwarzer WindClan-Schüler klammern sich an einen Felsen mitten im Wasser!', moves: [['heidepfote', 'player', { from: () => ({ x: LM.tunnelein.x + 160, y: LM.tunnelein.y + 120 }), dx: 90, dy: 50, sp: 25 }], ['windpfote', 'player', { from: () => ({ x: LM.tunnelein.x + 190, y: LM.tunnelein.y + 140 }), dx: 110, dy: 80, sp: 25 }]], cam: 'heidepfote', dist: 150, shake: 2 }),
          ['distelpfote', 'Bildet eine Kette! Ich halte dich fest, Löwenpfote!'],
          ACT({ cap: 'Pfote an Pfote zieht ihr die beiden aus dem reißenden Wasser. Hinter euch stürzt ein Teil der Höhlendecke ein.', moves: [['heidepfote', 'player', { dx: 35, sp: 90 }], ['windpfote', 'player', { dx: -35, dy: 20, sp: 90 }], ['distelpfote', 'player', { dx: 10, dy: 40, sp: 90 }]], cam: 'player', dist: 140, shake: 5, wait: 1.5 }),
          ['heidepfote', 'Du hast uns gerettet … Löwenpfote, ich …'],
          ['windpfote', 'Pah. Wir hätten es auch allein geschafft.'],
          ['distelpfote', 'Das ist das Ende eurer Treffen. Hörst du, Löwenpfote? Das Ende.'],
        ], done() { ['heidepfote', 'windpfote'].forEach(id => { const c = catById(id); c.hidden = true; c.ai = { m: 'home' }; }); homeAll(['haeherjunges', 'distelpfote']); G.weather = null; }
      },
      {
        t: 'defeat', group: 'windschlacht', n: 5, at: 'lager', spawnNear: 900, noPatrol: true, text: 'Der WindClan greift das Lager an – sie glauben, der DonnerClan habe die Tunnel geflutet!',
        spawn() { storyFoes('windschlacht', 'wind', 5, { x: LM.lager.x, y: LM.lager.y + 60 }, { lv: 3 }); },
        dlg: () => [['erz', 'Die WindClan-Krieger fliehen. Auf dem Rückzug schaut Heidepfote dich noch einmal an.'], ['player', '(leise) Es ist vorbei, Heidepfote. Ich bin ein DonnerClan-Krieger. Mein Clan kommt zuerst.'], ['erz', '— Ende von Buch 14: Fluss der Finsternis —']],
        done() { applyFx({ rel: { wind: -20 }, morale: 5 }); chron('Die Tunnel fluten. Löwenpfote rettet Heidepfote und Windpfote – und beendet die geheimen Treffen. (Ende von Buch 14)'); }
      },
    ]
  },
  // ---------------- BUCH 15: VERBANNT ----------------
  {
    ch: 15, title: 'Boten aus den Bergen', steps: [
      {
        t: 'goto', at: 'lager', text: 'Fremde Katzen am Lagereingang! Geh hin', enter() { const s = catById('sturmpelz'); if (s) { s.hidden = true; s.alive = true; } ensureCat('bach', { fixed: 'Bach', rank: 'krieger', clan: 'stamm', sex: 'w', age: 24, look: L('#7a5a3a', '#4a3020', 0, '#e8b923') }).hidden = true; },
        dlg: () => [
          ACT({ cap: 'Zwei erschöpfte Katzen kommen ins Lager: ein grauer Kater mit langem Fell und eine braune Tigerkätzin.', moves: [['sturmpelz', 'den:pile', { from: () => ({ x: LM.lager.x + LM.lager.r + 40, y: LM.lager.y }), sp: 70 }], ['bach', 'den:pile', { from: () => ({ x: LM.lager.x + LM.lager.r + 70, y: LM.lager.y + 30 }), dx: 30, sp: 70, delay: 0.4 }]], cam: 'sturmpelz', dist: 160 }),
          ['sturmpelz', 'Brombeerkralle! Eichhornschweif! Der Stamm des eilenden Wassers braucht eure Hilfe. Fremde Katzen stehlen unsere Beute und besetzen unser Land.'],
          ['bach', 'Steinsager schickt uns. Nur die Katzen, die Federschweif kannten, können uns helfen.'],
          ['brombeerjunges', 'Wir kommen. Feuerstern, ich nehme Eichhornschweif und die drei Schüler mit.'],
          ['sammy', 'Gut. Aber kommt alle zurück.'],
        ], done() { journey3Follow(); }
      },
      {
        t: 'goto', at: 'bergpass', noPatrol: true, guide: 'sturmpelz', guideSay: 'Folgt mir. Ich kenne den Weg über die Berge.', text: 'Die Reise beginnt: Folgt Sturmpelz zum Bergpass', enter() { journey3Follow(); },
        dlg: () => [ACT({ cap: 'Der Wind pfeift über den Pass. Schnee knirscht unter euren Pfoten.', moves: [], cam: 'player', dist: 300, pitch: 0.4, orbit: 0.12, wait: 2.5 }), ['haeherjunges', 'Ich rieche Adler. Und Stein. Und … etwas Uraltes.'], ['kraehenpfote', 'Bleibt zusammen. Die Berge verzeihen keinen Fehler.']]
      },
      { t: 'catch', n: 2, noPatrol: true, text: 'Jagt in den Bergen, bevor ihr weiterzieht', enter() { journey3Follow(); }, dlg: () => [['eichhornjunges', 'Gut gemacht, Löwenpfote. Iss – der Weg ist noch weit.']] },
    ]
  },
  {
    ch: 15, title: 'Der Stamm in Not', steps: [
      {
        t: 'goto', at: 'stamm', noPatrol: true, text: 'Erreicht die Höhle des Stammes hinter dem Wasserfall', enter() { journey3Follow(); const s = LM.stamm; spawnClanCat('stamm', s.x, s.y + 10, { id: 'steinsager3', name: 'Steinsager', look: L('#6a5a4a', null, 0, '#e8b923', { long: true }), hostile: false, story: true, ai: 'leader' }); },
        dlg: () => [
          ACT({ cap: 'Aus der Höhle hinter dem Wasserfall tritt ein alter, langhaariger Kater.', moves: [['steinsager3', 'player', { dx: 50, sp: 40 }]], cam: 'steinsager3', dist: 150 }),
          ['steinsager3', 'Ihr seid gekommen. Die Eindringlinge sind Einzelläufer aus dem Tal. Sie sind viele – und sie haben keine Angst.'],
          ['brombeerjunges', 'Dann bringen wir dem Stamm bei, wie Clan-Katzen kämpfen.'],
        ]
      },
      { t: 'defeat', group: 'stammtraining', n: 1, noPatrol: true, text: 'Zeig den Stammeskatzen einen Kampfgriff: Übungskampf gegen Bach', enter() { const b = catById('bach'); b.clan = 'donner'; spar('bach'); }, dlg: () => [['bach', 'So kämpft ihr? Mit Köpfchen statt mit Kraft … Das lernen wir!'], { do: () => { catById('bach').clan = 'stamm'; follow('bach'); } }] },
      {
        t: 'defeat', group: 'eindringlinge', n: 5, at: 'stamm', spawnNear: 700, noPatrol: true, text: 'Die Eindringlinge greifen an! Verteidigt den Stamm',
        enter() { journey3Follow(); }, spawn() { storyFoes('eindringlinge', 'einzel', 5, { x: LM.stamm.x + 180, y: LM.stamm.y + 160 }, { lv: 3 }); },
        dlg: () => [['erz', 'Die Eindringlinge fliehen zurück ins Tal. Der Stamm jubelt.'], ['steinsager3', 'Die Ahnen haben euch geschickt. Der Stamm wird euch nie vergessen.'], ['haeherjunges', '(leise zu dir) Löwenpfote … du hast gegen fünf gekämpft und hast keinen einzigen Kratzer. Das ist deine Macht. Du kannst nicht verletzt werden.']],
        done() { clearStoryEnts(); chron('Die DonnerClan-Katzen helfen dem Stamm des eilenden Wassers gegen Eindringlinge.'); }
      },
    ]
  },
  {
    ch: 15, title: 'Heimkehr und Kriegernamen', steps: [
      { t: 'scene', dream: 'stern', dlg: () => [['erz', 'In der Nacht träumt Häherpfote von einem uralten Kater mit blinden, hervorquellenden Augen.'], [{ name: 'Fels', look: L('#9a9a9a', null, 0, '#dfe8ee') }, 'Ich warte schon lange auf dich, Häherpfote. Die Drei sind gekommen – so, wie es vorhergesagt wurde.'], ['haeherjunges', 'Wer hat es vorhergesagt? Fels, sag es mir!'], ['erz', 'Doch der alte Kater verblasst im Sternenlicht.']] },
      { t: 'goto', at: 'lager', noPatrol: true, text: 'Kehrt heim an den See', enter() { journey3Follow(); for (const e of ENTS) if (e.id === 'steinsager3') e.gone = true; const s = catById('sturmpelz'); if (s) { s.hidden = true; s.ai = { m: 'home' }; } const b = catById('bach'); if (b) { b.hidden = true; b.ai = { m: 'home' }; } }, dlg: () => [['sammy', 'Ihr seid zurück! Alle! Heute Abend feiern wir – und zwei Schüler bekommen ihre Kriegernamen.']], done() { journey3Home(); } },
      {
        t: 'goto', pos: () => Object.assign(denPos('hochstein'), { r: 90 }), text: 'Geh zum Hochstein – deine Kriegerzeremonie!', dlg: () => [
          CEREMONY('sammy', ['distelpfote']),
          ['sammy', 'Löwenpfote, von diesem Moment an heißt du Löwenglut. Der SternenClan ehrt deinen Mut und deine Kraft.'],
          ['sammy', 'Distelpfote, du heißt von nun an Distelblatt. Der SternenClan ehrt deine Treue zum Gesetz der Krieger.'],
          { do: () => { renamePlayer('krieger', 'glut'); setStage('staffel3b'); const d = catById('distelpfote'); setRank(d, 'krieger'); gainXp(P(), 100); chron('Löwenpfote wird Löwenglut, Distelpfote wird Distelblatt. (Ende von Buch 15)'); } },
          ['alle', 'Löwenglut! Distelblatt! Löwenglut! Distelblatt!'],
          CEREMONY_END,
          ACT({ cap: 'In der Nacht haltet ihr schweigend Wache. Über dem See leuchtet das Silbervlies.', moves: [['player', { x: LM.lager.x, y: LM.lager.y + 70 }, { sp: 80 }], ['distelpfote', { x: LM.lager.x + 35, y: LM.lager.y + 75 }, { sp: 80 }]], cam: 'player', start() { G.time = Math.floor(G.time / 1440) * 1440 + 22 * 60; }, pass: 300, passT: 5, wait: 3.5, pitch: 0.5, dist: 220, orbit: 0.12 }),
          ['erz', '— Ende von Buch 15: Verbannt —'],
        ]
      },
    ]
  },
  // ---------------- BUCH 16: ZEIT DER DUNKELHEIT ----------------
  {
    ch: 16, title: 'Sol', steps: [
      {
        t: 'goto', at: 'lager', text: 'Ein Fremder ist im Lager! Geh hin', enter() { ensureCat('sol', { fixed: 'Sol', rank: 'einzel', clan: 'einzel', sex: 'm', age: 50, look: L('#8a5a30', null, 0.35, '#f0e070', { patch: '#2b2220', long: true }) }).hidden = true; },
        dlg: () => [
          ACT({ cap: 'Ein schildpattfarbener Kater mit hellen gelben Augen spaziert ins Lager, als gehöre es ihm.', moves: [['sol', 'den:pile', { from: () => ({ x: LM.lager.x + LM.lager.r + 40, y: LM.lager.y + 20 }), sp: 55 }]], cam: 'sol', dist: 150 }),
          ['sol', 'Ich bin Sol. Ich bin gekommen, um euch zu warnen: Bald wird die Sonne verschwinden. Und dann wird sich alles ändern.'],
          ['sammy', 'Die Sonne kann nicht verschwinden.'],
          ['sol', 'Wartet es ab, Feuerstern. Wartet es ab.'],
          ['haeherjunges', '(leise) Löwenglut … wie kann er das wissen? Nicht einmal der SternenClan hat uns das gesagt.'],
        ], done() { const s = catById('sol'); s.hidden = false; s.homePos = { x: LM.lager.x + 60, y: LM.lager.y + 120 }; s.ai = { m: 'home' }; chron('Der fremde Kater Sol kommt an den See und sagt voraus, dass die Sonne verschwinden wird.'); }
      },
    ]
  },
  duty(16, 'Löwengluts Kraft', {
    who: 'brombeerjunges', talkText: 'Brombeerkralle teilt die Patrouillen ein', guide: 'distelpfote',
    intro: [['brombeerjunges', 'Löwenglut, Distelblatt – Grenzpatrouille am Buchenhain. Der SchattenClan benimmt sich seltsam, seit Sol bei ihnen war.']],
    patrol: ['buchenhain'], at: { buchenhain: [['distelpfote', 'Riechst du das? Die SchattenClan-Markierungen sind ganz schwach. Als wäre ihnen alles egal.']] },
    spar: 'distelpfote', sparText: 'Übungskampf mit Distelblatt', sparDlg: [['distelpfote', 'Du wirst nie müde. Und du blutest nie. Löwenglut … das ist unheimlich.']],
    hunt: 2, outro: [['brombeerjunges', 'Gute Arbeit. Bleibt wachsam – irgendetwas liegt in der Luft.']],
  }),
  {
    ch: 16, title: 'Die Sonne verschwindet', steps: [
      {
        t: 'defeat', group: 'finsternis', n: 5, at: 'seeufer', spawnNear: 800, noPatrol: true, text: 'WindClan und FlussClan greifen am Seeufer an! Kämpfe',
        spawn() { storyFoes('finsternis', 'wind', 3, LM.seeufer, { lv: 3 }); storyFoes('finsternis', 'fluss', 2, { x: LM.seeufer.x + 60, y: LM.seeufer.y + 40 }, { lv: 3 }); },
        dlg: () => [
          ACT({ cap: 'Mitten im Kampf wird es dunkel. Die Sonne verschwindet hinter einem schwarzen Schatten!', moves: [], cam: 'player', start() { G.flags.vorFinster = G.time; G.time = Math.floor(G.time / 1440) * 1440 + 60; }, dist: 260, pitch: 0.5, orbit: 0.1, wait: 3.5, shake: 1 }),
          ['erz', 'Die Krieger erstarren. Dann fliehen alle in Panik – jeder in sein Territorium.'],
          ACT({ cap: 'Langsam schiebt sich die Sonne wieder hervor.', moves: [], cam: 'player', end() { G.time = (G.flags.vorFinster || G.time) + 30; }, dist: 260, pitch: 0.5, wait: 2 }),
          ['haeherjunges', 'Sol hat es gewusst. Aber woher? Löwenglut, das war kein Zeichen des SternenClans – das war etwas anderes.'],
        ], done() { applyFx({ morale: -8 }); chron('Während einer Schlacht verschwindet die Sonne. Alle Clans sind verängstigt.'); }
      },
      { t: 'night', text: 'Große Versammlung heute Nacht – warte, bis es dunkel ist' },
      {
        t: 'goto', at: 'baumgeviert', guide: 'sammy', text: 'Folge Feuerstern zur Versammlung auf der Insel', enter() { spawnGathering(); follow('sammy'); },
        dlg: () => [
          ACT({ cap: 'Auf der Insel ist es seltsam still. Der Anführer des SchattenClans erhebt sich.', moves: [['leader_schatten', 'baumgeviert', { dy: -5, sp: 60 }]], cam: 'leader_schatten', dist: 150, pitch: 0.2 }),
          ['leader_schatten', 'Der SchattenClan glaubt nicht mehr an den SternenClan. Sol hat uns gezeigt, dass wir unser eigenes Schicksal bestimmen.'],
          ['sammy', 'Schwarzstern! Ohne den SternenClan gibt es keine Clans!'],
          ['erz', 'Ein Raunen geht durch die Versammlung. Zum ersten Mal wendet sich ein ganzer Clan von seinen Ahnen ab.'],
          ['erz', '— Ende von Buch 16: Zeit der Dunkelheit —'],
        ], done() { for (const e of ENTS) if (e.gathering) e.gone = true; goHome('sammy'); applyFx({ rel: { schatten: -15 } }); chron('Der SchattenClan wendet sich unter Sols Einfluss vom SternenClan ab. (Ende von Buch 16)'); }
      },
    ]
  },
  // ---------------- BUCH 17: LANGE SCHATTEN ----------------
  duty(17, 'Unruhige Zeiten', {
    who: 'haeherjunges', talkText: 'Häherpfote braucht Kräuter', gap: 3, tasks: 4,
    intro: [['haeherjunges', 'Im SchattenClan werden Katzen krank, und niemand fragt mehr den SternenClan um Rat. Wir müssen Vorräte anlegen, Löwenglut. Bring mir Schafgarbe.']],
    herb: ['schafgarbe', 2], hunt: 2,
    outro: [['haeherjunges', 'Danke. Ich spüre, dass etwas Schlimmes kommt. Etwas mit Feuer.']],
  }),
  {
    ch: 17, title: 'Feuer in der Steinmulde', steps: [
      { t: 'scene', dlg: () => [['erz', 'Eine trockene Nacht. Plötzlich: Rauch! Ein Feuer der Zweibeiner hat die Brombeerranken am Rand der Steinmulde erfasst!'], ['brombeerjunges', 'Alle raus! Zum See!']] },
      {
        t: 'custom', at: 'seeufer', noPatrol: true, text: 'Rette die Jungen aus der Kinderstube und bring sie ans Seeufer!',
        enter() {
          G.fire = { x: LM.lager.x - 60, y: LM.lager.y - 80, r: 80, max: 380 };
          const ks = [ensureCat('kirschjunges', { pre: 'Kirsch', suf: 'fall', rank: 'junges', age: 2, sex: 'w', look: L('#c86a3a', null, 0.2, '#6fc23a') }), ensureCat('maulwurfjunges', { pre: 'Maulwurf', suf: 'pfote', rank: 'junges', age: 2, sex: 'm', look: L('#8a6a4a', null, 0.3, '#e8b923') })];
          const k = denPos('kinder'); ks.forEach((c, i) => { c.hidden = false; c.x = k.x + i * 20; c.y = k.y + 30; c.ai = { m: 'hold' }; });
          allTo(LM.seeufer, ['kirschjunges', 'maulwurfjunges', 'aschenfell', 'eichhornjunges']);
        },
        tick() { const pc = P(); for (const id of ['kirschjunges', 'maulwurfjunges']) { const c = catById(id); if (c.ai.m === 'hold' && dist(c.x, c.y, pc.x, pc.y) < 50) { c.ai = { m: 'follow' }; c.slow = true; say(c, 'Hilfe! Es brennt!'); } } },
        target: () => { const c = ['kirschjunges', 'maulwurfjunges'].map(catById).find(c => c.ai.m === 'hold'); return c || LM.seeufer; },
        check: () => ['kirschjunges', 'maulwurfjunges'].every(id => { const c = catById(id); return dist(c.x, c.y, LM.seeufer.x, LM.seeufer.y) < 230; }),
        dlg: () => [['erz', 'Die Jungen sind in Sicherheit. Aber Eichhornschweif und Aschenpelz fehlen!']]
      },
      {
        t: 'goto', who: 'aschenfell', near: 70, text: 'Eichhornschweif und Aschenpelz sind noch am Feuer – lauf!', enter() { const a = catById('aschenfell'), e = catById('eichhornjunges'); a.x = LM.lager.x + 20; a.y = LM.lager.y - 140; a.ai = { m: 'hold' }; e.x = LM.lager.x - 20; e.y = LM.lager.y - 150; e.ai = { m: 'hold' }; },
        dlg: () => [
          ['erz', 'Durch den Rauch hörst du Stimmen. Aschenpelz versperrt Eichhornschweif den Weg aus den Flammen.'],
          ['aschenfell', 'Du hast mich damals für Brombeerkralle verlassen, Eichhornschweif. Jetzt sollst du verlieren, was du am meisten liebst.'],
          ['eichhornjunges', 'Lass meine Jungen in Ruhe, Aschenpelz!'],
          ['eichhornjunges', '… Sie sind nicht meine Jungen. Ich habe sie nie geboren. Aber ich liebe sie trotzdem, als wären es meine eigenen.'],
          ['player', '(erstarrt) … Was?!'],
          ['aschenfell', 'Dann wird der ganze Wald dieses Geheimnis bald kennen.'],
          ACT({ cap: 'Mit einem letzten Blick verschwindet Aschenpelz im Rauch. Hinter dir prasselt der Regen herab und löscht die Flammen.', moves: [['aschenfell', () => ({ x: LM.lager.x + 60, y: LM.lager.y - LM.lager.r - 100 }), { sp: 150, hide: true }]], cam: 'aschenfell', start() { G.weather = 'regen'; }, end() { G.fire = null; const a = catById('aschenfell'); a.hidden = false; a.ai = { m: 'home' }; } }),
        ], done() { for (const c of clanCats()) if (c !== P() && c.ai && (c.ai.m === 'hold' || c.ai.m === 'goto')) c.ai = { m: 'home' }; ['kirschjunges', 'maulwurfjunges'].forEach(id => { const c = catById(id); c.slow = false; c.ai = { m: 'home' }; }); chron('Feuer in der Steinmulde. Eichhornschweif gesteht: Sie ist nicht die Mutter der Drei.'); }
      },
    ]
  },
  {
    ch: 17, title: 'Wer sind unsere Eltern?', steps: [
      { t: 'talk', who: 'distelpfote', text: 'Sprich mit Distelblatt über Eichhornschweifs Geständnis', dlg: () => [['distelpfote', 'Wenn Eichhornschweif nicht unsere Mutter ist – wer dann? Und ist Brombeerkralle dann auch nicht unser Vater?'], ['player', 'Ich weiß es nicht, Distelblatt.'], ['distelpfote', 'Das Gesetz der Krieger ist alles, was wir haben. Und jemand hat es gebrochen. Ich werde herausfinden, wer.']] },
      { t: 'talk', who: 'haeherjunges', text: 'Frag Häherpfote, was er spürt', dlg: () => [['haeherjunges', 'Ich habe Blattsee beobachtet. Sie wird traurig, wenn wir in ihrer Nähe sind. Und sie riecht … irgendwie vertraut.'], ['player', 'Du meinst …?'], ['haeherjunges', 'Ich meine gar nichts. Noch nicht.']] },
      {
        t: 'scene', dlg: () => [
          ['erz', 'Im Morgengrauen: Aufregung am Bach an der Grenze. Aschenpelz liegt im Wasser. Tot.'],
          { do: () => { const a = catById('aschenfell'); if (a && a.alive) killCat(a, 'Aschenpelz wird tot im Bach gefunden.'); } },
          ['sammy', 'Wer tut so etwas? Wer tötet einen Clan-Gefährten?'],
          ['distelpfote', '(sehr leise, zitternd) … Er hätte es allen erzählt. Er hätte den Clan zerstört.'],
          ['erz', 'Nur du hast gehört, was Distelblatt gesagt hat.'],
        ]
      },
      {
        t: 'goto', pos: () => Object.assign(denPos('hochstein'), { r: 90 }), text: 'Feuerstern ruft den Clan zusammen', dlg: () => [
          CEREMONY('sammy', ['haeherjunges']),
          ['sammy', 'Blattsee hat mir gesagt, dass Häherpfote bereit ist. Häherpfote, von nun an heißt du Häherfeder – Heiler des DonnerClans.'],
          { do: () => { setRank(catById('haeherjunges'), 'heiler'); chron('Häherpfote erhält seinen Heilernamen: Häherfeder. (Ende von Buch 17)'); } },
          ['alle', 'Häherfeder! Häherfeder!'],
          CEREMONY_END,
          ['haeherjunges', '(zu dir) Die Wahrheit kommt bald ans Licht, Löwenglut. Ich spüre es in meinen Knochen.'],
          ['erz', '— Ende von Buch 17: Lange Schatten —'],
        ]
      },
    ]
  },
  // ---------------- BUCH 18: SONNENAUFGANG ----------------
  duty(18, 'Die Ruhe vor dem Sturm', {
    who: 'brombeerjunges', talkText: 'Brombeerkralle braucht dich für eine Jagdpatrouille', guide: 'graupfote', gap: 3, tasks: 4,
    intro: [['brombeerjunges', 'Löwenglut, jag mit Graustreif. Der Clan ist unruhig seit Aschenpelz’ Tod. Volle Mägen helfen.']],
    patrol: ['zweibeinernest'], at: { zweibeinernest: [['graupfote', 'Weißt du, Löwenglut, Geheimnisse sind wie Dornen im Pelz. Irgendwann muss man sie herausziehen.']] },
    hunt: 3, outro: [['brombeerjunges', 'Danke, Löwenglut. Heute Nacht ist Große Versammlung. Ich habe ein ungutes Gefühl.']],
  }),
  {
    ch: 18, title: 'Die Wahrheit', steps: [
      { t: 'night', text: 'Heute Nacht ist Große Versammlung – warte bis es dunkel ist' },
      {
        t: 'goto', at: 'baumgeviert', guide: 'sammy', text: 'Folge Feuerstern zur Insel', enter() { spawnGathering(); follow('sammy'); follow('distelpfote'); },
        dlg: () => [
          ACT({ cap: 'Mitten in der Versammlung springt Distelblatt auf einen Ast des Großen Baums. Alle Katzen verstummen.', moves: [['distelpfote', 'baumgeviert', { dx: 15, dy: -20, sp: 160 }]], cam: 'distelpfote', dist: 170, pitch: 0.25 }),
          ['distelpfote', 'Hört mich an, alle Clans! Mein Bruder, meine Schwester und ich – wir sind nicht die Jungen von Eichhornschweif und Brombeerkralle!'],
          ['distelpfote', 'Unsere Mutter ist Blattsee, die Heilerin des DonnerClans. Und unser Vater ist Krähenfeder vom WindClan!'],
          ['erz', 'Ein Aufschrei geht durch die Versammlung. Blattsee senkt den Kopf. Krähenfeder starrt euch an, als hätte er euch nie gesehen.'],
          ['player', '(flüsternd) Blattsee … und Krähenfeder … Häherfeder hatte recht.'],
        ], done() { for (const e of ENTS) if (e.gathering) e.gone = true; goHome('sammy'); follow('distelpfote'); chron('Distelblatt enthüllt bei der Großen Versammlung: Blattsee und Krähenfeder sind die Eltern der Drei.'); }
      },
      {
        t: 'goto', at: 'tunnelein', noPatrol: true, text: 'Distelblatt rennt davon – Richtung Tunnel! Folge ihr!', enter() { const d = catById('distelpfote'); d.ai = { m: 'script', x: LM.tunnelein.x, y: LM.tunnelein.y - 20, sp: 200 }; say(d, 'Lasst mich in Ruhe!'); },
        dlg: () => [
          ['distelpfote', 'Ich war es, Löwenglut. Ich habe Aschenpelz getötet. Ich wollte den Clan schützen – und habe selbst das Gesetz gebrochen.'],
          ['player', 'Distelblatt, komm zurück! Wir finden einen Weg!'],
          ACT({ cap: 'Distelblatt dreht sich um und verschwindet im dunklen Tunnel. Dann bebt die Erde – und der Eingang stürzt ein!', moves: [['distelpfote', 'tunnelein', { dy: -35, sp: 140, hide: true }]], cam: 'tunnelein', dist: 150, shake: 7, wait: 2.5 }),
          ['erz', 'Staub und Steine. Dann Stille. Distelblatt ist fort.'],
        ], done() { const d = catById('distelpfote'); d.hidden = true; d.clan = 'verschollen'; d.ai = { m: 'home' }; chron('Distelblatt gesteht, Aschenpelz getötet zu haben, und verschwindet in den einstürzenden Tunneln.'); }
      },
    ]
  },
  {
    ch: 18, title: 'Sonnenaufgang', steps: [
      { t: 'scene', dlg: () => [['erz', 'Tagelang habt ihr gesucht. Von Distelblatt gibt es keine Spur.'], ['blattjunges', 'Feuerstern. Ich habe das Gesetz der Krieger gebrochen. Ich kann nicht länger Heilerin sein. Häherfeder ist bereit.'], ['sammy', 'Blattsee … Der SternenClan wird entscheiden. Aber der Clan wird dich nicht verstoßen.'], { do: () => { const b = catById('blattjunges'); if (b) setRank(b, 'krieger'); } }] },
      {
        t: 'goto', at: 'seeufer', guide: 'haeherjunges', guideSay: 'Komm, Löwenglut. Zum See, bei Sonnenaufgang.', text: 'Geh mit Häherfeder bei Sonnenaufgang ans Seeufer', enter() { follow('haeherjunges'); G.time = Math.floor(G.time / 1440) * 1440 + 1440 + 5 * 60; },
        dlg: () => [
          ACT({ cap: 'Die Sonne geht über dem See auf. Das Wasser glänzt golden.', moves: [['player', 'seeufer', { sp: 60 }], ['haeherjunges', 'seeufer', { dx: 35, dy: 15, sp: 60 }]], cam: 'player', pass: 60, passT: 4, dist: 260, pitch: 0.3, orbit: 0.1, wait: 3 }),
          ['haeherjunges', 'Wir sind nur noch zwei. Aber die Prophezeiung spricht von drei.'],
          ['player', 'Dann ist Distelblatt nicht die Dritte. Oder sie kommt zurück. Irgendwann.'],
          ['haeherjunges', 'Egal wer unsere Eltern sind – wir sind DonnerClan. Und die Macht der Sterne liegt in unseren Pfoten.'],
          ['player', 'Dann werden wir sie nutzen. Für unseren Clan. Für alle Clans.'],
          ['erz', '— Ende von Buch 18: Sonnenaufgang —'],
        ], done() { goHome('haeherjunges'); chron('Löwenglut und Häherfeder schwören, die Macht der Sterne für alle Clans zu nutzen. (Ende von Buch 18)'); }
      },
      {
        t: 'scene', dlg: () => [
          ['erz', 'Du hast die dritte Staffel erlebt: die Prophezeiung der Drei, die Tunnel, die Reise zum Stamm, die verschwundene Sonne – und die Wahrheit über eure Eltern.'],
          ['erz', 'Das Leben am See geht weiter. Im Clan-Bildschirm (K) kannst du jetzt auch andere Katzen spielen – zum Beispiel Feuerstern, Brombeerkralle oder Häherfeder.'],
          { do: () => { G.freeplay = true; chron('Die Macht der Drei: Ende der 3. Staffel.'); for (const c of G.cats) c.storyLock = c.rank === 'zweiter'; } },
        ]
      },
    ]
  },
);


// ================= ZEIT VERGEHT WIRKLICH: Warten, Schlafen, Suchen, mehrtägige Reisen =================
// Tage vergehen (mit Wetter). Man kann jagen, dem Clan helfen oder mit E ausruhen.
function waitDays(n, text, o = {}) {
  return {
    t: 'custom', camp: true, noPatrol: !!o.noPatrol,
    text: () => { const left = Math.max(0, Math.ceil((G.story.waitUntil - G.time) / 1440)); return `${text} – noch ${left} ${left === 1 ? 'Tag' : 'Tage'} (jage, hilf dem Clan oder ruh dich aus mit E)`; },
    enter() { G.story.waitUntil = (day() + n) * 1440 + 7 * 60; if (o.weather !== undefined) G.weather = o.weather; },
    tick() { if (o.weather !== undefined && G.weather !== o.weather) G.weather = o.weather; },
    check: () => G.time >= G.story.waitUntil, dlg: o.dlg,
  };
}
// Eine Nacht durchschlafen (erst wenn mindestens 6 Stunden vergangen sind und es Morgen ist)
function sleepStep(text, lines, fol) {
  return {
    t: 'custom', camp: true, noPatrol: true, text: () => (text || 'Schlaf bis zum Morgen (E: ausruhen)') + (G.time - (G.story.sleepFrom || 0) < 360 && hour() >= 6 && hour() < 17 ? ' – ruh dich erst bis zum Abend aus, dann schlaf' : ''),
    enter() { G.story.sleepFrom = G.time; if (fol) fol(); },
    check: () => G.time - (G.story.sleepFrom || 0) >= 360 && hour() >= 6 && hour() < 11,
    dlg: () => [ACT({ cap: 'Die Sonne geht auf. Ein neuer Tag beginnt.', moves: [], cam: 'player', dist: 200, pitch: 0.35, orbit: 0.1, wait: 2 }), ...(lines || [])],
  };
}
// Nachtlager unterwegs: alle Begleiter rollen sich um dich herum zusammen
function campAt(cap, idsFn, lines, fol) {
  return {
    t: 'night', camp: true, noPatrol: true, text: 'Es wird Abend. Rastet, bis es Nacht ist (E: ausruhen)', enter() { if (fol) fol(); },
    dlg: () => [ACT({ cap, moves: idsFn().map((id, i) => [id, 'player', { dx: Math.cos(i * 1.1) * (40 + i * 6), dy: Math.sin(i * 1.1) * (40 + i * 6), sp: 60, sleep: true }]), cam: 'player', dist: 190, pitch: 0.45, orbit: 0.12, wait: 2 }), ...(lines || [])],
  };
}
// Ein Wegstück einer Reise
function leg(pos, text, lines, fol, o = {}) { return Object.assign({ t: 'goto', noPatrol: true, pos: () => Object.assign({ r: 110 }, pos), text, enter() { if (fol) fol(); }, dlg: lines ? () => lines : undefined }, o); }
const journeyIds = () => JOURNEY.filter(id => { const c = catById(id); return c && c.alive && !c.hidden; });
const journey3Ids = () => JOURNEY3.filter(id => { const c = catById(id); return c && c.alive && !c.hidden; });
const clanNear = () => clanCats().filter(c => c !== P() && !c.hidden && dist(c.x, c.y, P().x, P().y) < 700).slice(0, 10).map(c => c.id);

// --- Buch 1: Die Nacht im Körbchen ---
insertStepsBefore('Prolog: Ein Hauskätzchen träumt', st => st.at === 'waldrand' && st.enter, [
  sleepStep('Schlaf in deinem Körbchen bis zum Morgen (E: ausruhen)', [['wulle', '(ruft über den Zaun) Sammy! Geh nicht! Du wirst nie wiederkommen!'], ['player', 'Doch, Wulle. Ich muss.']]),
]);
// --- Buch 3: Tagelanger Regen vor der Flut ---
insertStepsBefore('Die Flut', st => st.t === 'scene', [waitDays(2, 'Blattfrische: Es regnet und regnet. Der Fluss steigt', { weather: 'regen' })]);
// --- Buch 4: Hitze vor dem Feuer ---
insertStepsBefore('Feuer!', st => st.t === 'scene', [waitDays(2, 'Blattgrüne: Seit Tagen kein Regen. Die Beute versteckt sich vor der Hitze', { weather: null })]);
// --- Buch 6: Sandsturm erwartet Junge ---
insertStepsBefore('Die letzte Schlacht', st => st.t === 'scene', [waitDays(3, 'Der Wald erholt sich vom Kampf. Sandsturm erwartet Junge – versorge die Kinderstube mit Beute')]);
// --- Buch 9: Die Monster kommen näher ---
insertStepsBefore('Der sterbende Wald', st => st.t === 'scene', [waitDays(1, 'Die Monster der Zweibeiner fressen sich durch den Wald. Jage, was du noch findest')]);

// --- Buch 8: Die Heimreise vom Wassernest der Sonne dauert Tage ---
insertStepsBefore('Der Stamm des eilenden Wassers', st => st.at === 'stamm', [
  sleepStep('Schlaft in den Dünen bis zum Morgen (E: ausruhen)', [['eichhornjunges', 'Jetzt müssen wir den ganzen Weg zurück … und schnell. Der Wald ist in Gefahr!']], journeyFollow),
  leg({ x: 10450, y: 1300 }, 'Heimreise Tag 1: Zurück durch die Dünen zu den Bergen', [['kraehenpfote', 'Diesmal verlaufen wir uns nicht. Ich hab mir den Weg gemerkt.']], journeyFollow),
  campAt('Die erste Nacht der Heimreise. Unter euch rauscht irgendwo ein Wasserfall.', journeyIds, [['sturmpelz', 'Hört ihr das? Wasser, das über Felsen stürzt. Dort drüben gibt es bestimmt Schutz.']], journeyFollow),
  sleepStep('Heimreise Tag 2: Schlaft bis zum Morgen (E: ausruhen)', null, journeyFollow),
]);
insertStepsBefore('Der Stamm des eilenden Wassers', st => st.at === 'lager', [
  leg(LM0.bergpass, 'Heimreise Tag 3: Über den Bergpass zurück nach Westen', [['erz', 'Ihr blickt noch einmal zurück zur Höhle des Stammes. Federschweif bleibt für immer in den Bergen.']], journeyFollow),
  campAt('Eine traurige Nacht. Niemand spricht. Einer fehlt.', journeyIds, [['eichhornjunges', '(leise) Sie war so mutig, Brombeerkralle.'], ['player', 'Ja. Wir werden sie nie vergessen.']], journeyFollow),
  sleepStep('Heimreise Tag 4: Schlaft bis zum Morgen (E: ausruhen)', null, journeyFollow),
  leg({ x: 7550, y: 1350 }, 'Heimreise Tag 4: Über den großen Donnerweg im Fremdland', [['sturmpelz', 'Wartet … jetzt! Lauft!']], journeyFollow),
  leg(LM0.purdy, 'Heimreise Tag 4: Durch den Zweibeinerort, vorbei an Purdys Garten', [['erz', 'Purdy sitzt auf seinem Zaun und winkt euch mit dem Schwanz zu.']], journeyFollow),
  leg(LM0.fremdgrenze, 'Heimreise Tag 4: Zurück in die Clan-Territorien', [['eichhornjunges', 'Riecht ihr das? SchattenClan-Grenzmarkierungen! Wir sind fast zu Hause!']], journeyFollow),
  campAt('Die letzte Nacht der Heimreise – schon wieder auf Clan-Gebiet.', journeyIds, null, journeyFollow),
  sleepStep('Heimreise Tag 5: Schlaft bis zum Morgen (E: ausruhen)', null, journeyFollow),
  leg({ x: 2330, y: 760 }, 'Heimreise Tag 5: Über den Donnerweg – fast zu Hause!', null, journeyFollow),
]);

// --- Buch 9: Die große Wanderung dauert viele Tage ---
insertStepsBefore('Der sterbende Wald', st => st.t === 'custom' && st.target && st.target().x === 10350, (() => {
  // Wanderung läuft: alle folgen (auch nach dem Laden eines Spielstands wieder)
  const mig = () => { G.flags.wanderung = 1; startMigration(); };
  const gathered = () => { const pc = P(), cs = clanCats().filter(c => c !== pc && !c.hidden); return [cs.filter(c => dist(c.x, c.y, pc.x, pc.y) < 900).length, cs.length]; };
  const mleg = (pos, text, lines) => ({
    t: 'custom', noPatrol: true, enter: mig, target: () => pos,
    text: () => { const [n, all] = gathered(); return dist(P().x, P().y, pos.x, pos.y) < 260 && n < all * 0.5 ? `Warte, bis alle Clans aufgeholt haben (${n}/${all} DonnerClan-Katzen da)` : text + ' – folge dem gelben Pfeil'; },
    check: () => { const pc = P(); if (dist(pc.x, pc.y, pos.x, pos.y) > 260) return false; const [n, all] = gathered(); return !all || n >= all * 0.5; }, dlg: lines ? () => lines : undefined,
  });
  const bg = () => LM.baumgeviert;
  return [
    {
      t: 'goto', at: 'baumgeviert', noPatrol: true, text: 'Die große Wanderung beginnt: Führe deinen Clan zum Baumgeviert – dort warten die anderen drei Clans',
      enter() { clanFollow(); if (!ENTS.some(e => e.migrant)) spawnMigrants(bg().x, bg().y, false); },
      dlg: () => [
        ACT({ cap: 'Am Baumgeviert warten schon SchattenClan, FlussClan und WindClan – zum ersten Mal ohne Streit, alle vier Clans an einem Ort.', moves: [], cam: 'baumgeviert', dist: 420, pitch: 0.45, orbit: 0.12, wait: 3.5 }),
        ['wander_schatten', 'Der SchattenClan ist bereit. Wir folgen euch.'],
        ['wander_fluss', 'Der FlussClan auch. Unser Fluss ist vergiftet – hier gibt es nichts mehr für uns.'],
        ['wander_wind', 'Ich bin alt … aber der WindClan kommt mit. Führ uns, Brombeerkralle.'],
        ['sammy', 'Dann gehen wir. Vier Clans – ein Weg. Brombeerkralle kennt ihn. Folgt ihm!'],
        { do: () => { G.flags.wanderung = 1; migrantsFollow(); clanFollow(); } },
      ]
    },
    mleg({ x: 1300, y: 700 }, 'Die große Wanderung, Tag 1: Führe alle Clans am Baumgeviert vorbei zu den Hochfelsen', [ACT({ cap: 'Ein langer Zug aus Katzen aller vier Clans schlängelt sich durch das Land. Die Ältesten und die Jungen gehen in der Mitte.', moves: [], cam: 'player', dist: 420, pitch: 0.45, orbit: 0.1, wait: 3 })]),
    campAt('Die erste Nacht fern der Heimat. Katzen aus vier Clans schlafen dicht nebeneinander.', clanNear, [['kleinohr', 'Meine alten Knochen … Aber ich schaffe das. Ich schaffe das.']], mig),
    sleepStep('Die große Wanderung, Tag 2: Schlaft bis zum Morgen (E: ausruhen)', null, mig),
    mleg({ x: 2330, y: 760 }, 'Tag 2: Bringt alle sicher über den Donnerweg', [['erz', 'Krieger stellen sich an den Rand des Donnerwegs. Nur wenn kein Monster kommt, huschen die Jungen hinüber.'], ['sammy', 'Alle drüben? Gut. Weiter!']]),
    { t: 'catch', n: 3, noPatrol: true, text: 'Tag 2: Die Ältesten und Jungen sind erschöpft – jage für die Wanderer', enter: mig, dlg: () => [['goldbluete', 'Danke. Die Jungen hätten keinen Schritt mehr geschafft.']] },
    mleg({ x: 3900, y: 620 }, 'Tag 2: Weiter durch das Hochland nach Osten'),
    campAt('Die zweite Nacht. Irgendwo heult ein Fuchs. Die Krieger halten abwechselnd Wache.', clanNear, null, mig),
    sleepStep('Die große Wanderung, Tag 3: Schlaft bis zum Morgen (E: ausruhen)', null, mig),
    mleg({ x: LM0.fremdgrenze.x, y: LM0.fremdgrenze.y }, 'Tag 3: Führt die Clans aus den Territorien hinaus – nach Osten ins Fremdland', [ACT({ cap: 'Hinter euch liegt der letzte Grenzstein mit Clan-Geruch. Vor euch: fremdes Land – Felder, Zweibeinernester und Wege, die keine Katze kennt.', moves: [], cam: 'player', dist: 480, pitch: 0.45, orbit: 0.1, wait: 3.5 }), ['kleinohr', 'Hier war noch nie eine Clan-Katze. Nicht einmal ich.'], ['wander_wind', 'Kein Clan-Geruch mehr. Von jetzt an sind wir alle Fremde.']]),
    mleg({ x: 6250, y: 2650 }, 'Tag 3: Über die Felder der Zweibeiner', [['erz', 'Die Felder sind riesig und flach. Kein Busch, kein Versteck. Die Katzen laufen geduckt durch die Furchen.']]),
    campAt('Die dritte Nacht – mitten im fremden Land. Irgendwo bellt ein Hund.', clanNear, [['goldbluete', 'Die Jungen fragen, ob wir je wieder ein Zuhause haben.'], ['player', 'Sag ihnen: Ja. Bald.']], mig),
    sleepStep('Die große Wanderung, Tag 4: Schlaft bis zum Morgen (E: ausruhen)', null, mig),
    mleg({ x: 7450, y: 2250 }, 'Tag 4: Zum großen Donnerweg im Fremdland', [['erz', 'Ein Donnerweg, breiter als jeder im alten Wald. Monster rasen in beide Richtungen, ohne Pause.'], ['sammy', 'Wir warten auf eine Lücke. Krieger zuerst, dann Königinnen mit Jungen, dann Älteste. Niemand rennt allein!']]),
    Object.assign(mleg({ x: 8050, y: 2250 }, 'Tag 4: Bringt alle über den großen Donnerweg – jetzt ist er frei!', [['erz', 'Pfote für Pfote huschen die Clans hinüber. Alle schaffen es.']]), { noCars: true }),
    { t: 'catch', n: 2, noPatrol: true, text: 'Tag 4: Jagt im fremden Wald – alle sind hungrig', enter: mig },
    mleg({ x: 8650, y: 1600 }, 'Tag 4: Weiter nach Osten, den Bergen entgegen'),
    campAt('Die vierte Nacht, am Fuß der Berge. Die Gipfel glänzen im Mondlicht.', clanNear, null, mig),
    sleepStep('Die große Wanderung, Tag 5: Schlaft bis zum Morgen (E: ausruhen)', null, mig),
    mleg({ x: LM0.bergpass.x, y: LM0.bergpass.y }, 'Tag 5: Hinauf in die Berge – zum Bergpass', [ACT({ cap: 'Der Weg über die Berge ist steil und kalt. Die Krieger tragen die kleinsten Jungen im Maul.', moves: [], cam: 'player', dist: 380, pitch: 0.4, orbit: 0.1, wait: 3 })]),
    campAt('Eine eisige Nacht in den Bergen. Alle drängen sich eng zusammen.', clanNear, [['erz', 'Riesenstern, der alte Anführer des WindClans, hustet die ganze Nacht.']], mig),
    sleepStep('Die große Wanderung, Tag 6: Schlaft bis zum Morgen (E: ausruhen)', null, mig),
    mleg({ x: 9800, y: 2300 }, 'Steigt die Berge hinab ins Tal – der See ist nah!'),
  ];
})());

// --- Staffel 3, Buch 14: Weitere heimliche Treffen in den Tunneln ---
insertQuestsAfter('Doppeltes Leben', [{
  ch: 14, title: 'Heimliche Treffen', steps: [
    { t: 'night', camp: true, text: 'Wieder ist es Nacht. Schleich dich zu den Tunneln (warte bis zur Nacht)' },
    leg(LM0.tunnelein, 'Schleich dich zum Tunneleingang', [tunnelWalk('tunnelein', []), ACT({ cap: 'Heidepfote wartet schon am unterirdischen Fluss.', moves: [['heidepfote', 'player', { from: () => ({ x: LM.tunnelein.x + 110, y: LM.tunnelein.y + 60 }), dx: 40, sp: 70 }]], cam: 'heidepfote', dist: 120 }), ['heidepfote', 'Heute zeige ich dir, wie WindClan-Katzen Kaninchen jagen: schnell und flach am Boden!'], ['player', 'Und ich zeig dir den DonnerClan-Jagdkauer. Dafür brauchst du viel Geduld.']], null, { done() { catById('heidepfote').hidden = true; } }),
    sleepStep('Schlaf bis zum Morgen im Schülerbau (E: ausruhen)', [['aschenfell', 'Schon wieder so müde, Löwenpfote? Du hast Moos in den Ohren. Wo warst du?'], ['player', '… Nirgends.']]),
    { t: 'night', camp: true, text: 'Die nächste Nacht. Noch ein Treffen (warte bis zur Nacht)' },
    leg(LM0.tunnelein, 'Schleich dich wieder zu den Tunneln', [tunnelWalk('tunnelein', []), ['heidepfote', 'Löwenpfote … manchmal wünschte ich, wir wären im selben Clan.'], ACT({ cap: 'Da raschelt es hinter dir im Gang. Eine schwarze Gestalt steht im Dunkeln.', moves: [['distelpfote', 'player', { from: () => ({ x: LM.tunnelein.x - 20, y: LM.tunnelein.y - 30 }), dx: -40, sp: 60 }]], cam: 'distelpfote', dist: 120 }), ['distelpfote', 'Ich wusste es! Löwenpfote, du triffst dich mit einer WindClan-Katze?!'], ['player', 'Distelpfote, bitte … sag es niemandem.'], ['distelpfote', 'Dieses eine Mal. Aber es muss aufhören.']], null, { done() { catById('heidepfote').hidden = true; goHome('distelpfote'); } }),
  ]
}]);
// --- Staffel 3, Buch 14: Tagelanger Regen ---
insertStepsBefore('Der Fluss der Finsternis', st => st.t === 'scene', [waitDays(2, 'Es regnet seit Tagen. Das Wasser im See steigt', { weather: 'regen' })]);
// --- Staffel 3, Buch 15: Die Reise zum Stamm dauert Tage ---
insertStepsBefore('Boten aus den Bergen', st => st.at === 'bergpass', [
  leg({ x: 9850, y: 2350 }, 'Reise Tag 1: Verlasst das Territorium Richtung Berge', [['bach', 'Die Berge sind weiter, als sie aussehen. Spart eure Kräfte.']], journey3Follow),
  campAt('Die erste Nacht unter freiem Himmel. Häherpfote liegt wach und lauscht dem Wind.', journey3Ids, [['haeherjunges', 'Die Berge flüstern, Löwenpfote. Sie erinnern sich an Katzen, die vor langer Zeit hier waren.']], journey3Follow),
  sleepStep('Reise Tag 2: Schlaft bis zum Morgen (E: ausruhen)', null, journey3Follow),
]);
insertStepsBefore('Boten aus den Bergen', st => st.t === 'catch', [
  campAt('Eine eisige Nacht am Pass. Schnee fällt auf euer Fell.', journey3Ids, null, journey3Follow),
  sleepStep('Reise Tag 3: Schlaft bis zum Morgen (E: ausruhen)', null, journey3Follow),
]);
insertStepsBefore('Heimkehr und Kriegernamen', st => st.at === 'lager', [
  leg(LM0.bergpass, 'Heimreise Tag 1: Zurück über den Bergpass', null, journey3Follow),
  campAt('Die letzte Nacht in den Bergen. Unten im Tal glitzert schon der See.', journey3Ids, null, journey3Follow),
  sleepStep('Heimreise Tag 2: Schlaft bis zum Morgen (E: ausruhen)', null, journey3Follow),
]);
// --- Staffel 3, Buch 17: Die Nacht vor dem Fund am Bach ---
insertStepsBefore('Wer sind unsere Eltern?', st => st.t === 'scene', [sleepStep('Schlaf bis zum Morgen – wenn du kannst (E: ausruhen)')]);
// --- Staffel 3, Buch 18: Die Suche nach Distelblatt ---
insertStepsBefore('Sonnenaufgang', st => st.t === 'scene', [
  leg(LM0.tunnelein, 'Such Distelblatt am eingestürzten Tunnel', [['erz', 'Nur Geröll und Staub. Du gräbst, bis deine Pfoten bluten. Nichts.']], () => follow('graupfote')),
  leg(LM0.tunnelaus, 'Such am Tunnelausgang im WindClan-Gebiet', [['erz', 'Auch hier ist der Gang eingestürzt. Kein Geruch von Distelblatt.'], ['graupfote', 'Komm, Löwenglut. Wir suchen morgen weiter.']], () => follow('graupfote')),
  sleepStep('Schlaf bis zum Morgen (E: ausruhen)', null, () => follow('graupfote')),
  leg(LM0.seeufer, 'Such am Seeufer', [['erz', 'Nur Wellen und Wind. Keine Pfotenabdrücke.']], () => follow('graupfote')),
  leg(LM0.buchenhain, 'Such im Buchenhain', [['graupfote', 'Nichts. Es tut mir leid, Löwenglut.']], () => follow('graupfote'), { done() { goHome('graupfote'); } }),
]);

// ---------- Rückblicke zum Buchanfang ----------
Object.assign(RECAP, {
  13: 'Brombeerkralle hat Feuerstern gerettet und ist Zweiter Anführer. Die Clans leben in Frieden am See – doch eine neue Prophezeiung wartet.',
  14: 'Die Drei kennen ihre Prophezeiung. Häherpfote ist Heilerschüler, und Löwenpfote hat eine Freundin im WindClan: Heidepfote.',
  15: 'Die Tunnel sind geflutet, die Freundschaft mit Heidepfote ist vorbei. Da kommen Boten aus den Bergen …',
  16: 'Löwenglut und Distelblatt sind Krieger. Löwenglut weiß jetzt: Er kann im Kampf nicht verletzt werden.',
  17: 'Die Sonne ist verschwunden, und der SchattenClan hat sich unter Sols Einfluss vom SternenClan abgewandt.',
  18: 'Eichhornschweif ist nicht die Mutter der Drei. Aschenpelz ist tot – und Distelblatt hütet ein schreckliches Geheimnis.',
});
CHATTER.s3 = [
  ['Häherpfote erkennt jedes Kraut am Geruch. Unheimlich.', 'Blattsee sagt, er hat eine besondere Gabe.'],
  ['Löwenglut kämpft wie drei Krieger zusammen.', 'Und er hat nie einen Kratzer. Seltsam, oder?'],
  ['Hast du gehört, was Sol über die Sonne gesagt hat?', 'Ein Einzelläufer, der die Zukunft kennt? Das gefällt mir nicht.'],
  ['Graustreif ist wirklich zurück! Und er hat eine Hauskätzin mitgebracht.', 'Millie lernt schnell. Sie wird eine gute Kriegerin.'],
];
