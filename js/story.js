'use strict';
// ===== Die Geschichte: von Sammy bis Feuerstern =====
function place(id, x, y, m = 'hold') { const c = catById(id); if (!c) return; c.hidden = false; c.x = x; c.y = y; c.ai = { m }; c.hurt = false; return c; }
function follow(id) { const c = catById(id); if (c && c.alive) { c.hidden = false; c.ai = { m: 'follow' }; } }
function goHome(id) { const c = catById(id); if (c && c.alive) c.ai = { m: 'home' }; }
function nearPlayer(d = 120) { const pc = P(), a = pc.dir + Math.PI + rand(-0.8, 0.8); return { x: pc.x + Math.cos(a) * d, y: pc.y + Math.sin(a) * d }; }
function spar(id, lvl) { const c = catById(id); const p = nearPlayer(110); place(id, p.x, p.y); c.spar = true; c.group = id; c.hp = c.maxHp; c.atkCd = 1.2; if (lvl) c.sparAtk = lvl; return c; }
function renamePlayer(rank, suf) { const pc = P(); delete pc.fixed; pc.clan = 'donner'; if (suf) pc.suf = suf; setRank(pc, rank); pc.hp = pc.maxHp; }
function setStage(k) { G.stage = k; const pc = P(); G.stages[k] = { moon: moon(), name: catName(pc), look: JSON.parse(JSON.stringify(pc.look)), size: catSize(pc), rank: rankName(pc) }; }
function storyFoes(group, team, n, at, o = {}) {
  for (let i = 0; i < n; i++) { const a = i / n * TAU; spawnClanCat(team, at.x + Math.cos(a) * 90 + rand(-30, 30), at.y + Math.sin(a) * 90 + rand(-30, 30), Object.assign({ group, story: true, lv: 1 }, o)); }
}
const lagerIn = () => ({ x: LM.lager.x, y: LM.lager.y, r: 200, name: 'DonnerClan-Lager' });

const QUESTS = [
  // ---------------- KAPITEL 1: HAUSKÄTZCHEN ----------------
  {
    ch: 1, title: 'Das Leben im Garten', steps: [
      {
        t: 'scene', dlg: () => [
          ['erz', 'Du bist Sammy, ein junger roter Kater. Du lebst bei deinen Zweibeinern am Rand eines großen Waldes.'],
          ['erz', 'Steuerung: WASD oder Pfeiltasten = laufen · Shift = rennen · Q = schleichen · Leertaste = springen/angreifen · E = sprechen/benutzen'],
          ['player', 'Jede Nacht träume ich vom Wald hinter dem Zaun … von Mäusen, die im Mondlicht huschen.'],
        ]
      },
      {
        t: 'talk', who: 'wulle', text: 'Besuche Wulle im Nachbargarten (durch die Lücke im Zaun)', dlg: () => [
          ['wulle', 'Hallo Sammy! Hast du heute schon gefressen? Es gab Fisch aus der Dose!'],
          ['player', 'Wulle … warst du schon mal im Wald?'],
          ['wulle', 'Im Wald?! Bist du verrückt? Dort leben wilde Katzen. Die fressen Knochen und kämpfen die ganze Nacht!'],
          ['wulle', 'Hinter dem Zaun ist es gefährlich. Bleib lieber hier, wo es warm ist.'],
          { who: 'player', text: 'Was denkst du?', choices: [{ t: '„Ich will ihn trotzdem sehen.“', fn: () => { G.flags.mutig = 1; } }, { t: '„Vielleicht hast du recht …“' }] },
        ]
      },
      {
        t: 'goto', at: 'waldrand', text: 'Schlüpf durch das Loch im Zaun und geh zum Waldrand', dlg: () => [
          ['player', 'Der Wald … er riecht nach Moos, Erde und Abenteuer.'],
          ['erz', 'Tipp: Drücke Q, um zu schleichen – dann hört dich die Beute kaum. Mit der Leertaste springst du sie an. Ein „!“ bedeutet: Die Beute wird misstrauisch.'],
        ]
      },
      { t: 'catch', n: 1, text: 'Fang deine erste Beute', dlg: () => [['player', 'Ich hab sie! Meine erste eigene Beute!'], ['erz', 'Plötzlich raschelt es im Farn hinter dir …']] },
      {
        t: 'defeat', group: 'graupfote', text: 'Ein fremder Kater greift an! Wehr dich (Leertaste)', enter() { spar('graupfote'); say(catById('graupfote'), 'Das ist DonnerClan-Territorium!'); },
        dlg: () => [
          ['graupfote', 'Uff! Schon gut, schon gut, ich gebe auf! Du kämpfst ziemlich gut … für ein Hauskätzchen!'],
          ['graupfote', 'Ich bin Graupfote, Schüler im DonnerClan. Das hier ist unser Territorium.'],
          { do: () => { const p = nearPlayer(90); place('blaustern', p.x, p.y); place('loewenherz', p.x + 40, p.y + 20); } },
          ['erz', 'Zwei große Katzen treten aus dem Farn: eine blaugraue Kätzin und ein goldener Kater.'],
          ['loewenherz', 'Graupfote, du hast gegen ein Hauskätzchen verloren? Ich bin Löwenherz. Und das ist Blaustern, die Anführerin des DonnerClans.'],
          ['blaustern', 'Wir haben dich beobachtet, junger Kater. Du hast Mut – und Kraft.'],
          ['blaustern', 'Der DonnerClan braucht mehr Krieger. Möchtest du mit uns kommen und als Schüler ausgebildet werden?'],
          {
            who: 'player', text: 'Was antwortest du?', choices: [
              { t: '„Ja! Ich will ein Clan-Krieger werden!“' },
              { t: '„Ich … muss darüber nachdenken.“', fn: () => [['blaustern', 'Denk nicht zu lange nach. Das Leben im Clan ist hart – aber du wirst frei sein.'], ['player', '… Frei sein. Das ist es, was ich immer wollte. Ich komme mit!']] }
            ]
          },
          ['blaustern', 'Dann folge uns ins Lager. Wenn du jetzt gehst, gibt es kein Zurück.'],
        ]
      },
      {
        t: 'goto', at: 'lager', text: 'Geh mit Blaustern und Löwenherz ins DonnerClan-Lager', enter() { follow('blaustern'); follow('loewenherz'); follow('graupfote'); }, dlg: () => [
          ['erz', 'Die Katzen des DonnerClans versammeln sich unter dem Hochstein und starren dich an.'],
          ['blaustern', 'Katzen des DonnerClans! Dieses Hauskätzchen wird bei uns als Schüler ausgebildet.'],
          ['langschweif', 'Ein Hauskätzchen? Er stinkt nach Zweibeinern! Er wird nie ein echter Krieger!'],
          ['blaustern', 'Sammy, von diesem Tag an, bis du deinen Kriegernamen erhältst, heißt du Feuerpfote – denn dein Fell leuchtet wie eine Flamme.'],
          { do: () => { renamePlayer('schueler'); P().mentor = 'blaustern'; setStage('schueler'); chron('Sammy verlässt die Zweibeiner und wird Feuerpfote, Schüler im DonnerClan.'); ['blaustern', 'loewenherz'].forEach(goHome); } },
          ['alle', 'Feuerpfote! Feuerpfote!'],
          ['langschweif', 'Pah! Zeig mir erst mal, was du kannst, Hauskätzchen!'],
        ]
      },
      {
        t: 'defeat', group: 'langschweif', text: 'Langschweif fordert dich heraus! Zeig ihm, was in dir steckt', enter() { spar('langschweif'); },
        dlg: () => [['langschweif', 'Grr … Na gut. Vielleicht bist du doch nicht ganz so weich, Hauskätzchen.'], ['graupfote', 'Wow, Feuerpfote! Komm, ich zeig dir den Schülerbau. Da schläfst du ab jetzt.'], ['erz', 'Tipp: Mit K öffnest du den Clan-Bildschirm, mit M die Karte und mit J deinen Lebensweg.']],
        done() { goHome('langschweif'); goHome('graupfote'); }
      },
    ]
  },
  // ---------------- KAPITEL 2: SCHÜLER ----------------
  {
    ch: 2, title: 'Das Territorium', steps: [
      { t: 'talk', who: 'blaustern', text: 'Sprich mit deiner Mentorin Blaustern', dlg: () => [['blaustern', 'Heute zeige ich dir unser Territorium. Merk dir die Grenzen gut – und die Gerüche der anderen Clans. Geh voraus, ich folge dir.']], done() { follow('blaustern'); } },
      { t: 'goto', at: 'sonnenfelsen', text: 'Erkunde die Sonnenfelsen (Westen)', enter() { follow('blaustern'); }, dlg: () => [['blaustern', 'Die Sonnenfelsen. Hier wärmen wir uns in der Blattgrüne. Der FlussClan will sie uns seit vielen Monden stehlen. Hinter dem Fluss beginnt sein Territorium.']] },
      { t: 'goto', at: 'eulenbaum', text: 'Geh zum Eulenbaum', enter() { follow('blaustern'); }, dlg: () => [['blaustern', 'Der Eulenbaum. Hier jagt nachts eine Eule. Pass auf, solange du noch klein bist.']] },
      { t: 'goto', at: 'donnerweg', text: 'Geh zum Donnerweg (Norden) – Vorsicht vor Monstern!', enter() { follow('blaustern'); }, dlg: () => [['blaustern', 'Der Donnerweg. Die Monster der Zweibeiner rasen hier entlang. Überquere ihn nie, ohne zu schauen! Dahinter liegt das Territorium des SchattenClans.']] },
      { t: 'goto', at: 'schlangenfelsen', text: 'Geh zu den Schlangenfelsen', enter() { follow('blaustern'); }, dlg: () => [['blaustern', 'Die Schlangenfelsen. Hier leben Kreuzottern. Ein Biss kann tödlich sein. Halte dich fern.']] },
      { t: 'goto', at: 'baumgeviert', text: 'Geh zum Baumgeviert (Nordosten)', enter() { follow('blaustern'); }, dlg: () => [['blaustern', 'Das Baumgeviert. Bei jedem Vollmond treffen sich hier alle vier Clans zur Großen Versammlung. Dann herrscht Waffenstillstand.'], ['blaustern', 'Östlich von hier liegt das Hochmoor des WindClans. Dort jagen sie Kaninchen.']] },
      { t: 'goto', at: 'lager', text: 'Kehre ins Lager zurück', enter() { follow('blaustern'); }, dlg: () => [['blaustern', 'Gut gemacht, Feuerpfote. Jetzt kennst du unser Territorium.']], done() { goHome('blaustern'); gainXp(P(), 40); } },
    ]
  },
  {
    ch: 2, title: 'Jagen für den Clan', steps: [
      { t: 'talk', who: 'loewenherz', text: 'Sprich mit Löwenherz, dem Zweiten Anführer', dlg: () => [['loewenherz', 'Ein Schüler versorgt zuerst den Clan. Bring drei Stück Beute zum Frischbeutehaufen in der Mitte des Lagers.'], ['loewenherz', 'Und denk an das Gesetz der Krieger: Erst wird der Clan gefüttert – dann du selbst.']] },
      { t: 'deliver', n: 3, text: 'Bring 3 Beute zum Frischbeutehaufen (E am Haufen)' },
      { t: 'talk', who: 'kleinohr', need: 'prey', text: 'Bring Kleinohr im Ältestenbau etwas zu fressen', dlg: () => [['kleinohr', 'Ah, eine fette Beute! Danke, junger Feuerpfote. Du hast Respekt vor den Älteren – das gefällt mir.'], ['kleinohr', 'Weißt du, wer der SternenClan ist? Das sind unsere Ahnen. Sie wachen vom Silbervlies über uns – den Sternen am Nachthimmel.'], ['kleinohr', 'Eines Tages jagen wir alle dort oben mit ihnen.']], done() { G.player.carry.shift(); applyFx({ rep: 4 }); } },
    ]
  },
  {
    ch: 2, title: 'Kampftraining', steps: [
      { t: 'goto', at: 'sandkuhle', text: 'Geh zur Sandkuhle zum Kampftraining', enter() { const s = LM.sandkuhle; place('tigerkralle', s.x + 60, s.y - 40); place('sandpfote', s.x - 50, s.y + 20); place('graupfote', s.x - 60, s.y - 50); }, dlg: () => [['tigerkralle', 'Ein Hauskätzchen im Training. Zeig mir, dass du mehr kannst als an einem Futternapf zu sitzen.'], ['tigerkralle', 'Sandpfote! Greif an.'], ['sandpfote', 'Mit Vergnügen!']] },
      { t: 'defeat', group: 'sandpfote', text: 'Besiege Sandpfote im Übungskampf', enter() { spar('sandpfote'); }, dlg: () => [['sandpfote', 'Na gut … du hast gewonnen. Aber nächstes Mal nicht!'], ['tigerkralle', 'Hm. Nicht schlecht. Aber ein echter Kampf ist kein Spiel, Feuerpfote.']], done() { ['tigerkralle', 'sandpfote', 'graupfote'].forEach(goHome); const s = catById('sandpfote'); s.rel += 10; } },
    ]
  },
  {
    ch: 2, title: 'Die Heilerin', steps: [
      { t: 'talk', who: 'tuepfelblatt', text: 'Sprich mit Tüpfelblatt im Heilerbau', dlg: () => [['tuepfelblatt', 'Hallo Feuerpfote. Mir gehen die Kräuter aus. Bringst du mir drei Ringelblumen? Sie wachsen im Wald – kleine orange Blüten.'], ['tuepfelblatt', 'Ringelblumen verhindern, dass Wunden sich entzünden. (Mit H kannst du selbst gesammelte Kräuter benutzen, um dich zu heilen.)']] },
      { t: 'herb', kind: 'ringelblume', n: 3, text: 'Sammle 3 Ringelblumen (E) – sie leuchten golden' },
      {
        t: 'talk', who: 'tuepfelblatt', text: 'Bring die Ringelblumen zu Tüpfelblatt', dlg: () => [
          ['tuepfelblatt', 'Danke, Feuerpfote! Du hast ein gutes Auge.'],
          ['tuepfelblatt', 'Weißt du … der SternenClan hat mir eine Botschaft geschickt. „Feuer wird den Clan retten.“'],
          ['player', 'Feuer? Aber … Feuer ist doch das, was der Clan am meisten fürchtet?'],
          ['tuepfelblatt', 'Ja. Und doch … vielleicht meinen die Sterne etwas ganz anderes.'],
        ], done() { G.player.herbs.ringelblume = Math.max(0, (G.player.herbs.ringelblume || 0) - 3); G.prophecies.push('„Feuer wird den Clan retten.“'); chron('Tüpfelblatt empfängt die Prophezeiung: „Feuer wird den Clan retten.“'); applyFx({ health: 8 }); }
      },
    ]
  },
  {
    ch: 2, title: 'Eindringlinge!', steps: [
      { t: 'talk', who: 'loewenherz', text: 'Löwenherz ruft dich zu sich', dlg: () => [['loewenherz', 'Feuerpfote! Eine Patrouille hat frischen SchattenClan-Geruch am Donnerweg gefunden. Komm mit, wir vertreiben die Eindringlinge!']], done() { follow('loewenherz'); follow('graupfote'); } },
      {
        t: 'defeat', group: 'schatten1', n: 3, text: 'Vertreibe die SchattenClan-Krieger südlich des Donnerwegs', at: 'donnerweg', spawnNear: 600,
        enter() { follow('loewenherz'); follow('graupfote'); }, spawn() { storyFoes('schatten1', 'schatten', 3, { x: LM.donnerweg.x, y: LM.donnerweg.y + 80 }); },
        dlg: () => [['loewenherz', 'Sie fliehen über den Donnerweg! Gut gekämpft, Feuerpfote. So verteidigt man sein Territorium.']], done() { applyFx({ rel: { schatten: -10 }, terr: 5 }); }
      },
      { t: 'goto', at: 'lager', text: 'Kehre ins Lager zurück', enter() { follow('loewenherz'); follow('graupfote'); }, done() { goHome('loewenherz'); goHome('graupfote'); } },
    ]
  },
  {
    ch: 2, title: 'Die Große Versammlung', steps: [
      { t: 'talk', who: 'blaustern', text: 'Sprich mit Blaustern', dlg: () => [['blaustern', 'Heute Nacht ist Vollmond. Du darfst zum ersten Mal mit zur Großen Versammlung am Baumgeviert.'], ['blaustern', 'Ruh dich bis zum Abend im Schülerbau aus (E am Schülerbau) und komm dann zum Baumgeviert.']] },
      { t: 'night', text: 'Warte bis es Nacht ist (E am Schülerbau: ausruhen)' },
      {
        t: 'goto', at: 'baumgeviert', text: 'Geh in der Nacht zum Baumgeviert', enter() { spawnGathering(); const b = LM.baumgeviert; place('blaustern', b.x, b.y - 20); place('loewenherz', b.x + 60, b.y + 60); place('tigerkralle', b.x - 60, b.y + 70); }, dlg: () => [
          ['erz', 'Katzen aus allen vier Clans sitzen unter den mächtigen Eichen. Heute Nacht herrscht Frieden.'],
          ['leader_schatten', 'Der SchattenClan ist stark! Wir brauchen mehr Jagdgebiet. Vielleicht nehmen wir es uns einfach.'],
          ['leader_wind', 'Der WindClan jagt auf seinem Moor. Wir wollen keinen Ärger, Braunstern.'],
          ['leader_fluss', 'Die Fische im Fluss sind fett. Der FlussClan ist zufrieden.'],
          ['blaustern', 'Der DonnerClan hat einen neuen Schüler: Feuerpfote.'],
          ['leader_schatten', 'Ein Hauskätzchen?! Der DonnerClan muss wirklich verzweifelt sein.'],
          { who: 'player', text: 'Alle Augen sind auf dich gerichtet …', choices: [{ t: 'Stolz den Kopf heben und schweigen', fn: () => applyFx({ rep: 5 }) }, { t: '„Ich bin ein DonnerClan-Schüler!“', fn: () => applyFx({ rep: 3, rel: { schatten: -5 } }) }] },
          ['erz', 'Viele Katzen murmeln anerkennend. Nur Braunstern kneift die Augen zusammen.'],
        ], done() { for (const e of ENTS) if (e.gathering) e.fleeing = true; chron('Feuerpfote besucht seine erste Große Versammlung.'); }
      },
      { t: 'goto', at: 'lager', text: 'Kehre ins Lager zurück', enter() { follow('blaustern'); }, done() { goHome('blaustern'); goHome('loewenherz'); goHome('tigerkralle'); } },
    ]
  },
  {
    ch: 2, title: 'Die Kriegerzeremonie', steps: [
      { t: 'talk', who: 'blaustern', text: 'Sprich mit Blaustern', dlg: () => [['blaustern', 'Feuerpfote, es ist Zeit für deine Prüfung. Jage zwei Beutestücke und bring sie zum Frischbeutehaufen. Ich werde dich beobachten.']] },
      { t: 'deliver', n: 2, text: 'Prüfung: Bring 2 Beute zum Frischbeutehaufen' },
      {
        t: 'scene', dlg: () => [
          ['erz', 'Blaustern springt auf den Hochstein. „Alle Katzen, die alt genug sind, ihre eigene Beute zu jagen, sollen sich hier versammeln!“'],
          ['blaustern', 'Ich, Blaustern, Anführerin des DonnerClans, rufe meine Kriegerahnen an, auf diese Schüler herabzublicken. Sie haben hart trainiert, um euer edles Gesetz zu verstehen.'],
          ['blaustern', 'Feuerpfote, Graupfote – versprecht ihr, das Gesetz der Krieger zu achten und den Clan zu beschützen, selbst wenn es euer Leben kostet?'],
          { who: 'player', text: 'Deine Antwort:', choices: [{ t: '„Ich verspreche es.“' }] },
          ['graupfote', 'Ich verspreche es!'],
          ['blaustern', 'Dann gebe ich euch mit der Kraft des SternenClans eure Kriegernamen. Feuerpfote, von diesem Moment an heißt du Feuerherz. Der SternenClan ehrt deinen Mut und deine Stärke.'],
          { do: () => { renamePlayer('krieger', 'herz'); const g = catById('graupfote'); setRank(g, 'krieger'); g.storyLock = false; setStage('krieger'); chron('Feuerpfote wird Krieger: Feuerherz! Graupfote wird zu Graustreif.'); gainXp(P(), 60); } },
          ['blaustern', 'Graupfote, von diesem Moment an heißt du Graustreif.'],
          ['alle', 'Feuerherz! Graustreif! Feuerherz! Graustreif!'],
          ['graupfote', 'Wir sind Krieger, Feuerherz! Wir beide!'],
          ['erz', 'Als Krieger kannst du jetzt beim Zweiten Anführer nach Aufträgen fragen (E). Im Clan-Bildschirm (K) siehst du Nahrung, Moral und die Beziehungen zu den anderen Clans.'],
        ]
      },
    ]
  },
  // ---------------- KAPITEL 3: KRIEGER ----------------
  {
    ch: 3, title: 'Die fremde Kätzin', steps: [
      { t: 'goto', who: 'gelbzahn', text: 'Du riechst eine fremde Katze nahe der Großen Platane. Finde sie!', enter() { const c = place('gelbzahn', LM.platane.x + 140, LM.platane.y - 60); c.hp = 20; }, near: 80, dlg: () => [
        ['gelbzahn', 'Komm nur näher, Kleiner, und ich zerkratze dir die Ohren! … Ach, verflixt. Mein Bein …'],
        ['gelbzahn', 'Ich bin Gelbzahn. Früher war ich die Heilerin des SchattenClans. Braunstern hat mich verjagt. Er ist grausam … er schickt Junge in den Kampf.'],
        { who: 'player', text: 'Was tust du?', choices: [{ t: 'Ihr helfen und Beute bringen', fn: () => { G.flags.gelbzahn = 1; } }, { t: 'Sie aus dem Territorium verjagen', fn: () => { G.flags.gelbzahn = 0; return [['gelbzahn', 'Pah! Ich hätte es wissen müssen. Ihr DonnerClan-Katzen seid alle gleich.'], { do: () => { catById('gelbzahn').hidden = true; } }, ['erz', 'Gelbzahn humpelt davon und verschwindet im Unterholz.']]; } }] },
      ]
      },
      { t: 'talk', who: 'gelbzahn', need: 'prey', skip: () => !G.flags.gelbzahn, text: 'Bring Gelbzahn eine Beute', dlg: () => [['gelbzahn', 'Hm. Nicht schlecht für einen Hauskätzchen-Krieger. Danke.'], ['gelbzahn', 'Bring mich zu deiner Anführerin. Ich will um Schutz bitten.']], done() { G.player.carry.shift(); follow('gelbzahn'); catById('gelbzahn').slow = true; } },
      {
        t: 'goto', at: 'lager', skip: () => !G.flags.gelbzahn, text: 'Bring Gelbzahn ins Lager', enter() { follow('gelbzahn'); }, dlg: () => [
          ['blaustern', 'Eine SchattenClan-Katze in unserem Lager? … Feuerherz, du hast ein großes Herz.'],
          ['blaustern', 'Gelbzahn darf bleiben, bis ihr Bein geheilt ist. Du bist für sie verantwortlich.'],
          ['gelbzahn', 'Danke, Blaustern. Ich werde mich nützlich machen. Ich kenne mich mit Kräutern aus.'],
        ], done() { const g = catById('gelbzahn'); g.clan = 'donner'; setRank(g, 'aeltester'); g.slow = false; g.ai = { m: 'home' }; chron('Feuerherz rettet Gelbzahn, die verbannte Heilerin des SchattenClans.'); }
      },
    ]
  },
  {
    ch: 3, title: 'Kampf an den Sonnenfelsen', steps: [
      { t: 'talk', who: 'loewenherz', text: 'Löwenherz braucht dich!', dlg: () => [['loewenherz', 'Der FlussClan hat die Sonnenfelsen besetzt! Wir greifen an. Folge mir, Feuerherz!']], done() { ['loewenherz', 'tigerkralle', 'weisspelz', 'graupfote', 'rabenpfote'].forEach(follow); } },
      {
        t: 'defeat', group: 'fluss1', n: 4, at: 'sonnenfelsen', spawnNear: 550, text: 'Erobere die Sonnenfelsen vom FlussClan zurück', enter() { ['loewenherz', 'tigerkralle', 'weisspelz', 'graupfote', 'rabenpfote'].forEach(follow); },
        spawn() { storyFoes('fluss1', 'fluss', 4, LM.sonnenfelsen, { lv: 2 }); },
        dlg: () => [
          ['erz', 'Die FlussClan-Krieger fliehen über den Fluss. Die Sonnenfelsen gehören wieder dem DonnerClan!'],
          { do: () => { const l = catById('loewenherz'), t = catById('tigerkralle'), p = nearPlayer(70); l.x = p.x; l.y = p.y; l.ai = { m: 'script', x: p.x, y: p.y }; t.x = p.x + 60; t.y = p.y - 30; t.ai = { m: 'hold' }; } },
          ['erz', 'Doch dann siehst du Löwenherz. Er liegt zwischen den Felsen … und Tigerkralle steht über ihm.'],
          ['loewenherz', 'Feuerherz … beschütze … den Clan … der SternenClan … ruft mich …'],
          { do: () => { killCat(catById('loewenherz')); } },
          ['erz', 'Löwenherz ist tot. Rabenpfote starrt Tigerkralle mit weit aufgerissenen Augen an.'],
        ], done() { applyFx({ rel: { fluss: -15 }, terr: 10 }); chron('Kampf an den Sonnenfelsen. Löwenherz stirbt.'); ['tigerkralle', 'weisspelz', 'graupfote', 'rabenpfote'].forEach(goHome); }
      },
      {
        t: 'goto', at: 'lager', text: 'Kehre ins Lager zurück', dlg: () => [
          ['blaustern', 'Löwenherz ist zum SternenClan gegangen. Ich sage diese Worte vor dem SternenClan, damit sein Geist mich hört: Tigerkralle wird der neue Zweite Anführer des DonnerClans.'],
          { do: () => { setRank(catById('tigerkralle'), 'zweiter'); chron('Tigerkralle wird Zweiter Anführer.'); } },
          ['tigerkralle', 'Ich werde dem Clan dienen, wie es sich gehört.'],
          ['rabenpfote', '(flüsternd) Feuerherz … ich muss dir etwas sagen. Aber nicht hier. Nicht jetzt.'],
        ]
      },
    ]
  },
  {
    ch: 3, title: 'Dein erster Schüler', steps: [
      {
        t: 'talk', who: 'blaustern', text: 'Blaustern will dich sprechen', dlg: () => [
          ['blaustern', 'Feuerherz, du bist bereit, einen eigenen Schüler auszubilden. Aschenjunges ist alt genug geworden.'],
          { do: () => { const a = catById('aschenjunges'); a.age = Math.max(6, a.age); setRank(a, 'schueler'); a.mentor = P().id; follow('aschenjunges'); chron('Feuerherz wird Mentor von Aschenpfote.'); } },
          ['blaustern', 'Aschenjunges, von diesem Tag an heißt du Aschenpfote. Feuerherz wird dein Mentor sein.'],
          ['aschenjunges', 'Ich werde die beste Kriegerin im ganzen Wald! Wann fangen wir an?'],
        ]
      },
      { t: 'goto', at: 'sandkuhle', text: 'Trainiere mit Aschenpfote in der Sandkuhle', enter() { follow('aschenjunges'); }, dlg: () => [['erz', 'Aschenpfote übt den Jagdkauer … und stolpert über ihren eigenen Schwanz. Du zeigst es ihr noch einmal – und diesmal klappt es!'], ['aschenjunges', 'Hast du das gesehen?! Ich bin ein Naturtalent!']], done() { gainXp(catById('aschenjunges'), 50); } },
      { t: 'catch', n: 2, text: 'Jagt gemeinsam: Fang 2 Beute, während Aschenpfote zuschaut', enter() { follow('aschenjunges'); } },
      {
        t: 'goto', at: 'donnerweg', text: 'Aschenpfote ist allein zum Donnerweg gerannt! Hol sie zurück!', enter() { const a = catById('aschenjunges'); a.ai = { m: 'script', x: LM.donnerweg.x + 40, y: LM.donnerweg.y - 30, sp: 160 }; say(a, 'Ich will die Monster sehen!'); },
        dlg: () => [['erz', 'Ein Monster rast vorbei! Aschenpfote liegt am Rand des Donnerwegs. Ihr Bein ist verletzt.'], ['aschenjunges', 'Feuerherz … es tut so weh …']],
        done() { const a = catById('aschenjunges'); a.ai = { m: 'follow' }; a.slow = true; }
      },
      {
        t: 'goto', at: 'lager', text: 'Bring Aschenpfote vorsichtig ins Lager', enter() { const a = catById('aschenjunges'); a.ai = { m: 'follow' }; a.slow = true; }, dlg: () => [
          [G.flags.gelbzahn ? 'gelbzahn' : 'tuepfelblatt', 'Ihr Bein wird heilen … aber sie wird nie wieder schnell rennen können. Eine Kriegerin wird sie nicht mehr.'],
          ['aschenjunges', '… Dann will ich Heilerin werden. Ich will Katzen helfen, so wie mir jetzt geholfen wird.'],
          { do: () => { const a = catById('aschenjunges'); a.slow = false; setRank(a, 'heilerschueler'); a.mentor = 'tuepfelblatt'; a.ai = { m: 'home' }; chron('Aschenpfote wird am Donnerweg verletzt und beschließt, Heilerin zu werden.'); } },
        ]
      },
    ]
  },
  {
    ch: 3, title: 'Rabenpfotes Geheimnis', steps: [
      {
        t: 'talk', who: 'rabenpfote', text: 'Sprich heimlich mit Rabenpfote', dlg: () => [
          ['rabenpfote', 'Feuerherz … an den Sonnenfelsen … ich habe gesehen, wie Löwenherz starb. Es war kein FlussClan-Krieger.'],
          ['rabenpfote', 'Es war Tigerkralle. Er hat Löwenherz getötet, um Zweiter Anführer zu werden!'],
          ['rabenpfote', 'Wenn er erfährt, dass ich es weiß, bringt er mich um. Ich muss fort!'],
          ['graupfote', 'Wir bringen dich weg, Rabenpfote. Zur Scheune hinter dem WindClan-Moor – dort lebt ein Einzelläufer namens Mikusch.'],
        ], done() { follow('rabenpfote'); follow('graupfote'); }
      },
      {
        t: 'goto', at: 'scheune', text: 'Bring Rabenpfote heimlich zur Scheune (weit im Nordosten, hinter dem Moor)', enter() { follow('rabenpfote'); follow('graupfote'); place('mikusch', LM.scheune.x + 30, LM.scheune.y + 10, 'home'); }, dlg: () => [
          ['mikusch', 'Willkommen. Hier gibt es Mäuse genug für zwei. Niemand wird dir etwas tun, Rabenpfote.'],
          ['rabenpfote', 'Danke, Feuerherz. Du bist ein wahrer Freund. Sei vorsichtig mit Tigerkralle!'],
        ], done() { const r = catById('rabenpfote'); r.clan = 'einzel'; r.fixed = 'Rabenpfote'; r.rank = 'einzel'; r.home = 'scheune'; r.ai = { m: 'home' }; r.storyLock = false; chron('Rabenpfote flieht vor Tigerkralle und lebt nun bei Mikusch in der Scheune.'); }
      },
      {
        t: 'goto', at: 'lager', text: 'Kehre ins Lager zurück', enter() { follow('graupfote'); }, dlg: () => [
          ['blaustern', 'Wo warst du so lange? … Rabenpfote ist fort? Tigerkralle sagt, er sei zu den Zweibeinern gelaufen.'],
          ['erz', 'Du schweigst. Noch hast du keine Beweise. Aber du wirst Tigerkralle im Auge behalten.'],
          ['erz', 'In derselben Nacht wird Tüpfelblatt tot im Heilerbau gefunden. Ein fremder Kater mit zerfetztem Gesicht wurde an der Grenze gesehen.'],
          { do: () => { killCat(catById('tuepfelblatt')); const a = catById('aschenjunges'); if (G.flags.gelbzahn) { const g = catById('gelbzahn'); setRank(g, 'heiler'); a.mentor = 'gelbzahn'; chron('Tüpfelblatt stirbt. Gelbzahn wird Heilerin des DonnerClans.'); } else { setRank(a, 'heiler'); chron('Tüpfelblatt stirbt. Aschenpelz wird Heilerin des DonnerClans.'); } goHome('graupfote'); } },
          [G.flags.gelbzahn ? 'gelbzahn' : 'aschenjunges', 'Ich werde mich jetzt um den Clan kümmern. Kommt zu mir, wenn ihr verletzt seid.'],
        ]
      },
    ]
  },
  {
    ch: 3, title: 'Tigerkralles Verrat', steps: [
      { t: 'night', text: 'Etwas stimmt nicht. Bleib wachsam … (warte bis zur Nacht – E an deinem Bau)' },
      {
        t: 'defeat', group: 'verrat', n: 4, text: 'Schreie aus dem Lager! Beschütze Blaustern am Hochstein!', at: 'lager', spawnNear: 900,
        spawn() {
          const a = denPos('anfuehrer'); storyFoes('verrat', 'einzel', 3, { x: a.x, y: a.y + 60 }, { lv: 2 });
          const t = catById('tigerkralle'); t.hidden = true;
          spawnClanCat('einzel', a.x + 20, a.y + 20, { group: 'verrat', story: true, name: 'Tigerkralle', look: t.look, hp: 170, atk: 14, lv: 4, fleeAt: 0.2, r: 12 });
          const b = catById('blaustern'); b.x = a.x; b.y = a.y + 10; b.ai = { m: 'hold' };
        },
        dlg: () => [
          ['tigerkralle', 'Du! Immer wieder du, Hauskätzchen!'],
          ['blaustern', 'Tigerkralle … du wolltest mich töten? Du, dem ich mehr vertraut habe als jedem anderen?'],
          ['player', 'Er hat auch Löwenherz getötet, Blaustern. Rabenpfote hat es gesehen.'],
          ['blaustern', 'Tigerkralle, du bist aus dem DonnerClan verbannt. Wenn wir dich nach Sonnenaufgang in unserem Territorium finden, werden wir dich töten.'],
          ['tigerkralle', 'Ihr werdet mich wiedersehen. Das schwöre ich euch!'],
          { do: () => { const t = catById('tigerkralle'); t.clan = 'einzel'; t.rank = 'einzel'; t.hidden = true; t.storyLock = true; G.flags.tigerVerbannt = moon(); chron('Tigerkralle versucht, Blaustern zu töten, und wird verbannt.'); } },
        ], done() { goHome('blaustern'); }
      },
      {
        t: 'scene', dlg: () => [
          ['blaustern', 'Der Clan braucht einen neuen Zweiten Anführer. Ich sage diese Worte vor dem SternenClan: Feuerherz wird der neue Zweite Anführer des DonnerClans.'],
          { do: () => { setRank(P(), 'zweiter'); setStage('zweiter'); chron('Feuerherz wird Zweiter Anführer des DonnerClans.'); gainXp(P(), 80); } },
          ['alle', 'Feuerherz! Feuerherz!'],
          ['graupfote', 'Vom Hauskätzchen zum Zweiten Anführer … Ich hab immer gewusst, dass du etwas Besonderes bist!'],
        ]
      },
    ]
  },
  // ---------------- KAPITEL 4: ZWEITER ANFÜHRER ----------------
  {
    ch: 4, title: 'Die Pflichten des Zweiten Anführers', steps: [
      { t: 'custom', text: 'Teile die Krieger ein: Clan-Bildschirm (K) → „Patrouillen“', check: () => G.flags.dutySet, dlg: () => [['blaustern', 'Gut. Ein Zweiter Anführer sorgt dafür, dass der Clan gefüttert und die Grenzen bewacht sind.']] },
      { t: 'goto', at: 'schlucht', text: 'Führe eine Grenzpatrouille zur Schlucht an der WindClan-Grenze', enter() { follow('graupfote'); follow('sandpfote'); }, dlg: () => [['erz', 'An der Schlucht riecht ihr Hund … viele Hunde. Und frisches Blut.'], ['graupfote', 'Eine Hundemeute! Sie haben sich bei den Schlangenfelsen eingenistet!'], ['sandpfote', 'Wir müssen Blaustern warnen!']] },
      { t: 'goto', at: 'lager', text: 'Warne Blaustern im Lager', enter() { follow('graupfote'); follow('sandpfote'); }, dlg: () => [['blaustern', 'Eine Meute … Der SternenClan hat sich von uns abgewandt.'], ['player', 'Nein, Blaustern. Wir kämpfen. Ich habe einen Plan: Ich locke die Hunde zur Schlucht. Dort stürzen sie hinab.'], ['blaustern', '… Du bist mutig, Feuerherz. Möge der SternenClan dich beschützen.']], done() { goHome('graupfote'); goHome('sandpfote'); } },
    ]
  },
  {
    ch: 4, title: 'Meute, Meute!', steps: [
      { t: 'goto', at: 'schlangenfelsen', text: 'Geh zu den Schlangenfelsen und locke den Anführer der Meute heraus' },
      {
        t: 'custom', text: 'LAUF zur Schlucht! Der Hund darf dich nicht erwischen!', at: 'schlucht', noPatrol: true,
        enter() { for (const e of ENTS) if (e.meute) e.gone = true; const s = LM.schlangenfelsen; spawnBeast('meute', s.x + 60, s.y - 40, { chase: true, story: true, meute: true, boss: true }); spawnBeast('hund', s.x - 70, s.y - 60, { story: true, meute: true, group: 'hunde' }); toast('Der Anführer der Meute hat dich gewittert! Lauf!'); },
        check: () => { const d = ENTS.find(e => e.kind === 'meute'); return d && dist(d.x, d.y, LM.schlucht.x, LM.schlucht.y) < 170 && dist(P().x, P().y, LM.schlucht.x, LM.schlucht.y) < 170; },
        dlg: () => [
          ['erz', 'Du rennst zum Rand der Schlucht. Der riesige Hund ist direkt hinter dir –'],
          { do: () => { const b = catById('blaustern'), p = nearPlayer(50); b.hidden = false; b.x = p.x; b.y = p.y; } },
          ['erz', 'Da springt eine blaugraue Gestalt aus dem Farn! Blaustern stürzt sich auf den Hund – und beide fallen in die Schlucht!'],
          { do: () => { for (const e of ENTS) if (e.meute) e.gone = true; } },
          ['erz', 'Du springst hinterher in den reißenden Fluss und ziehst Blaustern ans Ufer.'],
          ['blaustern', 'Feuerherz … ich habe keine Leben mehr … Du … du bist das Feuer, das den Clan retten wird …'],
          ['blaustern', 'Führe sie gut … mein Krieger …'],
          { do: () => { killCat(catById('blaustern')); chron('Blaustern opfert sich, um die Hundemeute zu besiegen. Sie stirbt in den Pfoten von Feuerherz.'); } },
          ['erz', 'Blaustern ist tot. Der Anführer der Meute ist in der Schlucht verschwunden. Die übrigen Hunde fliehen aus dem Wald.'],
        ]
      },
      {
        t: 'goto', at: 'lager', text: 'Kehre ins Lager zurück', dlg: () => [
          ['erz', 'Der Clan trauert um Blaustern. Doch ein Clan braucht einen Anführer.'],
          [G.flags.gelbzahn ? 'gelbzahn' : 'aschenjunges', `${catName(P())}, du musst zum Mondstein reisen, um deine neun Leben vom SternenClan zu empfangen. Geh bei Nacht zu den Hochfelsen – weit im Nordosten.`],
        ]
      },
    ]
  },
  {
    ch: 4, title: 'Neun Leben', steps: [
      { t: 'night', text: 'Warte bis zur Nacht (E an deinem Bau)' },
      {
        t: 'goto', at: 'mondstein', text: 'Reise zum Mondstein in den Hochfelsen (ganz im Nordosten)', dlg: () => [
          ['erz', 'Tief im Berg glänzt der Mondstein wie ein gefrorener Stern. Du legst dich hin und berührst ihn mit der Nase …'],
          ['erz', 'Der Himmel füllt sich mit Katzen aus Sternenlicht. Der SternenClan ist gekommen.'],
          ['loewenherz', 'Mit diesem Leben gebe ich dir Mut. Nutze ihn, um deinen Clan zu verteidigen.'],
          ['tuepfelblatt', 'Mit diesem Leben gebe ich dir Liebe – für alle Katzen deines Clans, besonders die Jungen und Schwachen.'],
          ['rotschweif', 'Mit diesem Leben gebe ich dir Gerechtigkeit. Urteile weise.'],
          ['erz', 'Fünf weitere Katzen aus Sternenlicht schenken dir Leben: Treue, Ausdauer, Weisheit, Humor und Hoffnung.'],
          ['blaustern', 'Und mit meinem Leben gebe ich dir Stolz auf deinen Clan. Du warst immer das Feuer, das den Clan retten würde.'],
          ['blaustern', 'Ich grüße dich bei deinem neuen Namen: Feuerstern. Dein altes Leben ist vorbei. Du hast neun Leben, um deinen Clan zu führen.'],
          { do: () => { const pc = P(); setRank(pc, 'anfuehrer'); pc.hp = pc.maxHp; G.player.lives = 9; setStage('anfuehrer'); chron('Am Mondstein erhält Feuerherz neun Leben und wird Feuerstern, Anführer des DonnerClans.'); gainXp(pc, 120); } },
        ]
      },
      { t: 'goto', at: 'lager', text: 'Kehre als Feuerstern ins Lager zurück', dlg: () => [['erz', 'Als du ins Lager zurückkehrst, rufen alle Katzen deinen Namen.'], ['alle', 'Feuerstern! Feuerstern!']] },
      {
        t: 'scene', dlg: () => {
          const opts = clanCats().filter(c => c.rank === 'krieger').sort((a, b) => (b.id === 'graupfote') - (a.id === 'graupfote') || b.rel - a.rel).slice(0, 4);
          return [['erz', 'Vor Mondhoch muss der neue Anführer einen Zweiten Anführer ernennen.'], { who: 'player', text: 'Wen ernennst du zum Zweiten Anführer?', choices: opts.map(c => ({ t: `${catName(c)} (Freundschaft ${Math.round(c.rel)})`, fn: () => { setRank(c, 'zweiter'); c.storyLock = true; chron(`${catName(c)} wird Zweiter Anführer.`); return [[c.id, 'Ich werde dich nicht enttäuschen, Feuerstern.']]; } })) }];
        }
      },
      {
        t: 'scene', dlg: () => [
          ['erz', 'Du bist jetzt der Anführer des DonnerClans. Doch die Geschichte ist nicht vorbei – sie fängt gerade erst an.'],
          ['erz', 'Jeden Mond geschieht etwas Neues: Junge werden geboren, Schüler werden Krieger, Krieger werden alt, Freunde sterben, neue Feinde tauchen auf. Du triffst die Entscheidungen.'],
          ['erz', 'Tipp: Im Clan-Bildschirm (K) kannst du deinen Clan verwalten – und auch andere Katzen deines Clans spielen. Mit J blickst du auf deinen Lebensweg zurück.'],
          { do: () => { G.freeplay = true; for (const c of G.cats) if (c.id !== 'tigerkralle' && c.id !== 'gelbzahn') c.storyLock = c.rank === 'zweiter' ? true : false; const g = catById('gelbzahn'); if (g) g.storyLock = false; } },
        ]
      },
    ]
  },
];

// ===== Story-Steuerung =====
const Story = {
  step() { const q = QUESTS[G.story.q]; return q ? q.steps[G.story.s] : null; },
  quest() { return QUESTS[G.story.q]; },
  done() { return G.story.q >= QUESTS.length; },
  text() { const st = this.step(); if (!st) return null; let t = typeof st.text === 'function' ? st.text() : st.text; if (st.n > 1) t += ` (${G.story.prog}/${st.n})`; return t; },
  enter(isLoad) {
    const st = this.step(); if (!st) return;
    if (st.skip && st.skip()) { this.advance(true); return; }
    G.story.spawned = false;
    if (st.enter) st.enter(isLoad);
    if (st.t === 'scene') this.finish();
  },
  resetStep() {
    const st = this.step(); if (!st) return;
    for (const e of ENTS) if (e.story) e.gone = true;
    for (const c of G.cats) if (c.spar) { c.spar = false; c.ai = { m: 'home' }; }
    if (st.t === 'defeat' || st.t === 'custom') { G.story.prog = 0; this.enter(true); }
  },
  keepsFollower() { return false; },
  noPatrols() { const st = this.step(); return !!(st && (st.noPatrol || st.t === 'defeat' && st.spawnNear)); },
  herbHighlight() { const st = this.step(); if (st && st.t === 'herb') return st.kind; const m = G.missions && G.missions.find(m => m.type === 'herbs' && m.prog < m.n); return m ? m.kind : null; },
  finish() {
    const st = this.step(); if (!st || this.finishing) return;
    this.finishing = true;
    const lines = st.dlg ? st.dlg() : null;
    const end = () => { this.finishing = false; if (st.done) st.done(); this.advance(); };
    if (lines && lines.length) Dlg.show(lines, end); else end();
  },
  advance(silent) {
    G.story.s++; G.story.prog = 0;
    const q = this.quest();
    if (q && G.story.s >= q.steps.length) {
      G.story.q++; G.story.s = 0;
      if (!silent) toast(`✔ Kapitel abgeschlossen: ${q.title}`);
      const nq = this.quest();
      if (nq) { setTimeout(() => toast(`📖 Neue Geschichte: ${nq.title}`), 1500); }
      saveGame();
    }
    this.enter();
  },
  event(type, d) {
    const st = this.step(); if (!st || this.finishing) return;
    const hit = (type === 'catch' && st.t === 'catch') || (type === 'deliver' && st.t === 'deliver') || (type === 'defeat' && st.t === 'defeat' && d.group === st.group) || (type === 'herb' && st.t === 'herb' && d.kind === st.kind);
    if (!hit) return;
    G.story.prog++;
    if (G.story.prog >= (st.n || 1)) this.finish();
  },
  talk(c) { // true, wenn die Geschichte das Gespräch übernimmt
    const st = this.step(); if (!st || st.t !== 'talk' || st.who !== c.id || this.finishing) return false;
    if (st.need === 'prey' && !G.player.carry.length) { Dlg.show([[c.id, 'Hast du mir nichts mitgebracht? Ich habe Hunger …']]); return true; }
    this.finish(); return true;
  },
  target() {
    const st = this.step(); if (!st) return null;
    if (st.who) { const c = catById(st.who); return c && !c.hidden ? c : null; }
    if (st.at) return LM[st.at];
    if (st.t === 'deliver' || (st.t === 'catch' && G.player.carry.length && st.t === 'deliver')) return G.player.carry.length ? denPos('pile') : null;
    if (st.t === 'herb') return nearestHerb(st.kind, P());
    if (st.t === 'night') return P().clan === 'donner' ? denPos(denKeyOf(P())) : null;
    return null;
  },
  update(dt) {
    const st = this.step(); if (!st || this.finishing || Dlg.open) return;
    const pc = P();
    if (st.t === 'goto') {
      const tg = st.who ? catById(st.who) : LM[st.at];
      if (tg && dist(pc.x, pc.y, tg.x, tg.y) < (st.near || tg.r || 80)) this.finish();
    } else if (st.t === 'night') { if (isNight()) this.finish(); }
    else if (st.t === 'custom') { if (st.check()) this.finish(); }
    if (st.t === 'defeat' && st.spawn && !G.story.spawned) {
      const at = LM[st.at];
      if (!at || dist(pc.x, pc.y, at.x, at.y) < (st.spawnNear || 600)) { G.story.spawned = true; st.spawn(); toast('Feinde!'); }
    }
  }
};
