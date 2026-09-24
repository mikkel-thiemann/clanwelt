'use strict';
// ===== Erzählen: Gespräche im Lager, Gedanken, Zeremonien, Totenwache, Träume =====
const QI = t => QUESTS.findIndex(q => q.title === t);
// Wo in der Geschichte sind wir gerade?
function phase() {
  if (!G || !G.story) return 'haus';
  const q = G.story.q;
  if (QI('Die Prophezeiung der Drei') >= 0 && q > QI('Die Prophezeiung der Drei')) return 's3';
  if (G.flags.see) return 'see';
  if (G.flags.zerstoert) return 'zerstoert';
  if (q >= QI('Ein Traum vom SternenClan')) return 's2';
  if (q >= QI('Der BlutClan')) return 'blut';
  if (q >= QI('Neun Leben')) return 'feuerstern';
  if (q >= QI('Graustreifs Rückkehr')) return 'meute';
  if (q > QI('Feuer!')) return 'nachfeuer';
  if (q >= QI('Tigerstern')) return 'tigerstern';
  if (q >= QI('Die Flut')) return 'buch3';
  if (q >= QI('Aschenpfote')) return 'buch2';
  if (q > QI('Der Überfall')) return 'nachueberfall';
  if (G.stage !== 'hauskaetzchen') return 'schueler';
  return 'haus';
}

// ---------- Gespräche zwischen Clan-Katzen (Sprechblasen) ----------
const CHATTER = {
  schueler: [
    ['Ein Hauskätzchen im Clan … Blaustern muss verrückt sein.', 'Er hat Langschweif besiegt. Vielleicht hat er Kriegerblut.'],
    ['Ich vermisse Rotschweif. Er war ein guter Zweiter Anführer.', 'Löwenherz wird ihn würdig vertreten.'],
    ['Hast du den SchattenClan-Geruch am Donnerweg bemerkt?', 'Braunstern wird immer dreister.'],
    ['Warum riecht man im Moor keinen WindClan mehr?', 'Niemand weiß es. Es ist unheimlich.'],
    ['Rabenpfote zittert seit der Schlacht an den Sonnenfelsen.', 'Tigerkralle sagt, er sei nur ein Angsthase.'],
  ],
  nachueberfall: [
    ['Löwenherz ist tot … Wer beschützt uns jetzt?', 'Tigerkralle ist stark. Vielleicht ist er der Richtige.'],
    ['Die Kinderstube ist so still ohne Frostfells Junge.', 'Wir haben sie zurückgeholt. Der SternenClan sei gedankt.'],
    ['Eine SchattenClan-Heilerin in unserem Lager!', 'Gelbzahn hat uns geholfen. Ich traue ihr.'],
    ['Wo ist eigentlich Rabenpfote hin?', 'Tigerkralle sagt, zu den Zweibeinern. Seltsam …'],
  ],
  buch2: [
    ['Der WindClan ist wieder im Moor! Feuerherz hat sie heimgebracht.', 'Mehr Katzen, die um Beute kämpfen. Tigerkralle ist nicht begeistert.'],
    ['Graustreif verschwindet ständig. Wohin geht er nur?', 'Er riecht nach Fluss, wenn er zurückkommt …'],
    ['Die arme Aschenpfote. Sie wollte doch Kriegerin werden.', 'Jetzt lernt sie bei Gelbzahn. Sie wird eine gute Heilerin.'],
    ['Braunstern als Gefangener bei uns … ich kann nachts nicht schlafen.', 'Er ist blind. Er kann niemandem mehr schaden.'],
  ],
  buch3: [
    ['Graustreif ist zum FlussClan gegangen. Wegen seiner Jungen.', 'Feuerherz hat seinen besten Freund verloren.'],
    ['Noch ein Hauskätzchen! Wolkenjunges stinkt nach Zweibeinern.', 'Feuerherz war auch ein Hauskätzchen. Sieh, was aus ihm geworden ist.'],
    ['Tigerkralle benimmt sich seltsam. Er trifft sich mit fremden Katzen.', 'Sag das nicht zu laut!'],
  ],
  tigerstern: [
    ['Tigerkralle – Anführer des SchattenClans! Wie ist das möglich?', 'Er hat neun Leben bekommen. Möge der SternenClan uns beistehen.'],
    ['Blaustern verlässt kaum noch ihren Bau.', 'Sie traut niemandem mehr. Seit dem Verrat.'],
    ['Es hat seit Monden nicht geregnet. Der Wald ist trocken wie Stroh.', 'Hoffentlich passiert nichts Schlimmes.'],
  ],
  nachfeuer: [
    ['Das Lager ist schwarz … Überall Asche.', 'Die Blätter wachsen nach. Der Wald ist stärker als das Feuer.'],
    ['Gelbzahn ist im Feuer gestorben. Sie hat bis zuletzt geholfen.', 'Aschenpelz ist jetzt unsere Heilerin. Gelbzahn wäre stolz.'],
    ['Feuerherz hat Tigerkralles Junge gerettet. Obwohl er ihn hasst.', 'Das zeigt, was für ein Krieger er ist.'],
  ],
  meute: [
    ['Graustreif ist zurück! Endlich!', 'Feuerherz sieht so glücklich aus wie seit Monden nicht.'],
    ['Ich habe Hunde bei den Schlangenfelsen gehört …', 'Schweig! Du machst den Jungen Angst.'],
    ['Wer hat nur diese toten Kaninchen in den Wald gelegt?', 'Das riecht nach einer Falle.'],
  ],
  feuerstern: [
    ['Blaustern ist tot … Sie hat Feuerherz das Leben gerettet.', 'Sie hat den ganzen Clan gerettet. Jetzt jagt sie mit dem SternenClan.'],
    ['Feuerstern. Das klingt gut, nicht wahr?', 'Tüpfelblatts Prophezeiung: Feuer wird den Clan retten.'],
  ],
  blut: [
    ['Geißel hat Tigerstern mit einem Schlag getötet. Alle neun Leben!', 'Was für ein Ungeheuer ist dieser BlutClan?'],
    ['Ein LöwenClan aus allen vier Clans … wie in den alten Legenden.', 'Wenn wir zusammen kämpfen, können wir gewinnen.'],
  ],
  s2: [
    ['Brombeerkralle sieht seinem Vater so ähnlich …', 'Er ist nicht Tigerstern. Gib ihm eine Chance.'],
    ['Eichhornpfote hat schon wieder Ärger mit Feuerstern.', 'Sie hat eben das Feuer ihres Vaters im Fell.'],
  ],
  zerstoert: [
    ['Die Monster fressen den Wald. Bald ist nichts mehr übrig.', 'Mitternacht hatte recht. Wir müssen fort.'],
    ['Ich habe seit drei Tagen nichts gefressen.', 'Die Jungen zuerst. So war es immer.'],
    ['Graustreif … gefangen von Zweibeinern. Ob er noch lebt?', 'Er ist stark. Ich glaube daran.'],
  ],
  see: [
    ['Die Steinmulde fühlt sich schon wie zu Hause an.', 'Ich vermisse trotzdem den alten Wald.'],
    ['Hast du den Mondsee gesehen? Blattsee sagt, der SternenClan spricht dort.', 'Der SternenClan ist uns gefolgt. Das gibt mir Hoffnung.'],
    ['Die Beute am See ist fett. Wir werden gut über die Blattleere kommen.', 'Solange die Dachse wegbleiben.'],
    ['Brombeerkralle hat Feuerstern gerettet. Wer hätte das gedacht?', 'Ich. Ich habe immer an ihn geglaubt.'],
  ],
};
const ELDER_TALES = [
  ['Vor langer Zeit gab es fünf Clans – auch einen TigerClan, einen LöwenClan und einen LeopardenClan …', 'Wirklich? Erzähl weiter!'],
  ['Wisst ihr, warum die Katzen des SternenClans im Silbervlies leuchten? Jeder Stern ist ein Krieger.', 'Ist Rotschweif auch da oben?'],
  ['Als ich jung war, habe ich einen Fuchs ganz allein vertrieben!', 'Kleinohr sagt, das war nur ein Eichhörnchen …'],
  ['Das Gesetz der Krieger ist älter als jeder Baum im Wald.', 'Ich kenne es schon auswendig! Fast.'],
];
let chatT = 8;
function campChatter(dt) {
  chatT -= dt; if (chatT > 0) return; chatT = rand(10, 18);
  const pc = P(); if (!pc || Dlg.open || pc.clan !== 'donner' || dist(pc.x, pc.y, LM.lager.x, LM.lager.y) > LM.lager.r + 60) return;
  const near = clanCats().filter(c => c !== pc && !c.sleep && !c.hurt && !c.hidden && dist(c.x, c.y, pc.x, pc.y) < 320 && c.ai && (c.ai.m === 'home' || c.ai.m === 'hold'));
  if (near.length < 2) return;
  const elder = near.find(c => c.rank === 'aeltester'), kit = near.find(c => c.rank === 'junges');
  let a, b, pair;
  if (elder && kit && chance(0.35)) { a = elder; b = kit; pair = pick(ELDER_TALES); }
  else { const list = (CHATTER[phase()] || []).concat(chance(0.2) ? [['Gute Jagd heute?', 'Eine fette Wühlmaus – für die Ältesten.']] : []); if (!list.length) return; pair = pick(list); [a, b] = shuffle(near.filter(c => c.rank !== 'junges')).slice(0, 2); if (!b) return; }
  const face = (x, y) => { x.dir = Math.atan2(y.y - x.y, y.x - x.x); };
  face(a, b); face(b, a);
  say(a, pair[0], 4.5);
  setTimeout(() => { if (b.alive) { face(b, a); say(b, pair[1], 4.5); } }, 3200);
}

// ---------- Was die wichtigen Katzen dir erzählen (je nach Buch) ----------
const CHARLINES = {
  graupfote: {
    schueler: ['Tigerkralle macht mir Angst. Wie er Rabenpfote anschaut …', 'Weißt du was? Ich bin froh, dass du gekommen bist, Hauskätzchen!'],
    nachueberfall: ['Löwenherz war mein Mentor. Ich vermisse ihn so sehr.'],
    buch2: ['Feuerherz … kann ich dir etwas anvertrauen? Silberfluss ist … sie ist wunderbar.', 'Hast du schon was von Aschenpfote gehört? Sie ist so tapfer.'],
    meute: ['Ich bin wieder zu Hause. Das Lager riecht genau wie früher.'],
    feuerstern: ['Feuerstern! Ich kann es kaum glauben. Mein bester Freund ist Anführer!'],
  },
  sandpfote: {
    schueler: ['Glaub bloß nicht, dass du besser jagst als ich, Hauskätzchen.'],
    nachueberfall: ['Du hast die Jungen zurückgeholt … Na gut. Vielleicht bist du doch ganz in Ordnung.'],
    tigerstern: ['Feuerherz, du arbeitest zu viel. Komm, wir jagen zusammen.'],
    s2: ['Eichhornpfote ist genauso stur wie ihr Vater. Ich liebe sie trotzdem.'],
    see: ['Ich vermisse den alten Wald. Aber solange wir zusammen sind, ist überall zu Hause.'],
  },
  langschweif: {
    schueler: ['Hmpf. Hauskätzchen.'],
    buch2: ['Na gut, Feuerherz. Du hast den WindClan zurückgebracht. Das war … nicht schlecht.'],
    buch3: ['Noch ein Hauskätzchen? Du machst den Clan weich.'],
    meute: ['Ich … ich muss dir etwas sagen. Ich hätte dich damals nicht angreifen sollen. Du bist ein echter Krieger.'],
  },
  tigerkralle: {
    schueler: ['Aus dem Weg, Hauskätzchen. Ein Schüler hat mehr zu tun, als herumzustehen.'],
    nachueberfall: ['Ich bin jetzt Zweiter Anführer. Du tust, was ich sage, verstanden?', 'Rabenpfote ist ein Lügner. Glaub ihm kein Wort.'],
    buch2: ['Du bist zu oft bei den Zweibeinern, Feuerherz. Oder beim FlussClan? Ich beobachte dich.'],
  },
  blaustern: {
    schueler: ['Du lernst schnell, Feuerpfote. Der SternenClan hat dich zu uns geführt, da bin ich sicher.'],
    nachueberfall: ['Löwenherz fehlt mir. Aber ein Anführer darf nicht lange trauern.'],
    buch3: ['Du bist ein guter Krieger, Feuerherz. Vielleicht der beste, den ich je ausgebildet habe.'],
    tigerstern: ['Der SternenClan hat mich verlassen … Wem kann ich noch trauen?', 'Nur dir, Feuerherz. Nur dir.'],
  },
  tuepfelblatt: { schueler: ['Feuer wird den Clan retten … Ich frage mich immer noch, was das bedeutet.', 'Komm zu mir, wenn du verletzt bist. Ich habe Ringelblumen.'] },
  gelbzahn: {
    nachueberfall: ['Hmpf. Du schon wieder. Lass mich in Ruhe mit meinen Kräutern arbeiten.', 'Aschenjunges ist ein kluges Ding. Sie stellt zu viele Fragen.'],
    buch2: ['Aschenpfote wird eine bessere Heilerin, als ich es je war. Sag ihr das nicht!'],
    buch3: ['Braunstern … mein Sohn. Ich habe getan, was getan werden musste.'],
  },
  aschenjunges: {
    buch2: ['Ich werde die beste Kriegerin der Welt, Feuerherz! Du wirst sehen!', 'Mein Bein tut nicht mehr so weh. Gelbzahn sagt, ich darf ihr beim Kräutersammeln helfen.'],
    nachfeuer: ['Ich vermisse Gelbzahn. Aber ich höre sie manchmal in meinen Träumen.'],
    see: ['Der Mondsee ist wunderschön. Blattpfote hat ihn gefunden – sie hat eine Gabe.'],
  },
  kleinohr: { schueler: ['Ein Hauskätzchen … na ja. Bring mir eine Maus, dann reden wir.'], nachfeuer: ['Halbschweif … mein alter Freund. Das Feuer hat ihn geholt.'] },
  wulle: { schueler: ['Du siehst dünn aus, Sammy. Die wilden Katzen füttern dich nicht richtig!'], buch3: ['Deine Schwester Prinzessin hat nach dir gefragt.'] },
  weisspelz: { nachueberfall: ['Tigerkralle ist ein großer Krieger. Aber manchmal zu großer Ehrgeiz macht blind.'], feuerstern: ['Es ist mir eine Ehre, dein Zweiter Anführer zu sein, Feuerstern.'] },
  eichhornjunges: { s2: ['Glaubst du, das Wassernest der Sonne ist wirklich so groß?'], zerstoert: ['Ich hab solche Angst um Blattpfote …'], see: ['Du warst echt mutig beim Seeufer, Brombeerkralle. Nur so gesagt.'] },
  blattjunges: { s2: ['Ich spüre, dass etwas Großes auf uns zukommt.'], see: ['Aschenpelz hat mir alles beigebracht. Ich werde sie nie vergessen.'] },
  sammy: { s2: ['Brombeerkralle. Ich … ich will dir vertrauen. Mach mir das nicht schwer.'], zerstoert: ['Graustreif … ich hätte ihn beschützen müssen.'], see: ['Du hast mir das Leben gerettet, Brombeerkralle. Das werde ich nie vergessen.'] },
};
function storyGreet(c) {
  const ln = CHARLINES[c.id]; if (!ln) return null;
  const p = phase(), order = ['haus', 'schueler', 'nachueberfall', 'buch2', 'buch3', 'tigerstern', 'nachfeuer', 'meute', 'feuerstern', 'blut', 's2', 'zerstoert', 'see'];
  for (let i = order.indexOf(p); i >= Math.max(0, order.indexOf(p) - 1); i--) if (ln[order[i]]) return pick(ln[order[i]]);
  return null;
}

// ---------- Gedanken an besonderen Orten ----------
const THOUGHTS = {
  garten: { schueler: 'Mein altes Zuhause. Es kommt mir auf einmal so klein vor.', buch3: 'Hier habe ich früher gelebt. Ein ganz anderes Leben …' },
  sonnenfelsen: { schueler: 'Hier ist Rotschweif gestorben … Und Rabenpfote hat alles gesehen.', feuerstern: 'Die Sonnenfelsen. So viele Kämpfe um ein paar warme Steine.' },
  baumgeviert: { schueler: 'Vier riesige Eichen. Hier sind die Clans seit Anbeginn zusammengekommen.', blut: 'Hier ist Tigerstern gestorben. Durch Geißels Krallen.' },
  donnerweg: { buch2: 'Hier wurde Aschenpfote verletzt … durch eine Falle, die für Blaustern bestimmt war.' },
  schlucht: { feuerstern: 'Hier ist Blaustern gestürzt. Sie hat mir das Leben gerettet.' },
  schlangenfelsen: { feuerstern: 'Hier lebte die Meute. Ich höre noch ihr Bellen …' },
  scheune: { nachueberfall: 'Ob es Rabenpfote gut geht? Hier ist er endlich in Sicherheit.' },
  trittsteine: { buch3: 'Hier ist Silberfluss gestorben. Armer Graustreif …' },
  platane: { blut: 'Hier wird die letzte Schlacht stattfinden. Oder … hier hat sie stattgefunden.' },
  eulenbaum: { schueler: 'Der Eulenbaum. Ob die Eule mich gerade beobachtet?' },
  mondstein: { schueler: 'Die Hochfelsen. Irgendwo da drin leuchtet der Mondstein.', feuerstern: 'Hier habe ich meine neun Leben bekommen.' },
  wassernest: { s2: 'Das Wassernest der Sonne. Ich werde diesen Anblick nie vergessen.' },
  stamm: { s2: 'Federschweif … Du warst die tapferste von uns allen.' },
  kaefige: { zerstoert: 'Hier war Blattpfote gefangen. Ich hasse diese Zweibeiner-Käfige.' },
  insel: { see: 'Der Große Baum auf der Insel. Ein neuer Ort für die Versammlungen.' },
  mondsee: { see: 'Der Mondsee. Die Sterne spiegeln sich darin wie Augen des SternenClans.' },
};
let thoughtT = 0;
function checkThoughts(dt) {
  thoughtT -= dt; if (thoughtT > 0) return; thoughtT = 1;
  const pc = P(); if (!pc || Dlg.open || G.stage === 'generation') return;
  const p = phase(), order = ['haus', 'schueler', 'nachueberfall', 'buch2', 'buch3', 'tigerstern', 'nachfeuer', 'meute', 'feuerstern', 'blut', 's2', 'zerstoert', 'see'];
  G.thoughts = G.thoughts || {};
  for (const k in THOUGHTS) {
    const l = LM0[k] || LM[k]; if (!l || dist(pc.x, pc.y, l.x, l.y) > l.r + 30) continue;
    let text = null, key = null;
    for (let i = order.indexOf(p); i >= 0; i--) if (THOUGHTS[k][order[i]]) { text = THOUGHTS[k][order[i]]; key = k + ':' + order[i]; break; }
    if (text && !G.thoughts[key]) { G.thoughts[key] = 1; say(pc, '💭 ' + text, 6); }
  }
}

// ---------- Zeremonien am Hochstein ----------
function stageCeremony(leaderId, honored = []) {
  const hs = denPos('hochstein'), L0 = LM.lager, a = Math.atan2(L0.y - hs.y, L0.x - hs.x), pc = P();
  const lead = catById(leaderId);
  if (lead) { lead.hidden = false; lead.x = hs.x; lead.y = hs.y; lead.onRock = true; lead.dir = a; if (lead !== pc) lead.ai = { m: 'hold', face: a }; }
  const fx = hs.x + Math.cos(a) * 115, fy = hs.y + Math.sin(a) * 115, px = Math.cos(a + Math.PI / 2), py = Math.sin(a + Math.PI / 2);
  const front = (lead === pc ? [] : [pc]).concat(honored.map(catById).filter(c => c && c.alive && c !== lead));
  front.forEach((c, i) => { const o = (i - (front.length - 1) / 2) * 30; c.x = fx + px * o; c.y = fy + py * o; c.dir = a + Math.PI; c.hidden = false; if (c !== pc) c.ai = { m: 'hold', face: a + Math.PI, staged: true }; });
  const cs = clanCats().filter(c => c !== pc && c !== lead && !front.includes(c) && !c.hidden && !c.hurt);
  cs.forEach((c, i) => {
    const ang = a + (cs.length > 1 ? (i / (cs.length - 1) - 0.5) : 0) * 2.3, R = 185 + (i % 2) * 38;
    c.x = hs.x + Math.cos(ang) * R; c.y = hs.y + Math.sin(ang) * R; c.ai = { m: 'hold', face: ang + Math.PI, staged: true }; c.dir = ang + Math.PI;
  });
  if (lead === pc) { CAMS.yaw = a + Math.PI; }
  G.ceremony = true;
}
function endCeremony() {
  for (const c of G.cats) { if (c.onRock) { c.onRock = false; const hs = denPos('hochstein'), a = Math.atan2(LM.lager.y - hs.y, LM.lager.x - hs.x); c.x = hs.x + Math.cos(a) * 75; c.y = hs.y + Math.sin(a) * 75; if (c !== P()) c.ai = { m: 'home' }; } if (c.ai && c.ai.staged) c.ai = { m: 'home' }; }
  G.ceremony = false;
}
const CEREMONY = (leaderId, honored) => ({ do: () => { stageCeremony(leaderId, honored); CAMS.snap = true; const f = $('fade'); f.style.transition = 'none'; f.classList.add('on'); setTimeout(() => { f.style.transition = ''; f.classList.remove('on'); }, 60); } });
const CEREMONY_END = { do: () => endCeremony() };

// ---------- Totenwache ----------
function addVigil(c) {
  if (!G.vigils) G.vigils = [];
  if (c.clan !== 'donner' || G.vigils.some(v => v.id === c.id)) return;
  G.vigils.push({ id: c.id, until: day() + 1 });
  toast(`Der Clan hält Totenwache für ${catName(c)}.`);
}
let vigilT = 0;
function syncVigils(dt) {
  vigilT -= dt; if (vigilT > 0) return; vigilT = 1;
  if (!G.vigils) return;
  G.vigils = G.vigils.filter(v => v.until >= day() || hour() < 6);
  for (const e of ENTS) if (e.corpse && !G.vigils.some(v => v.id === e.corpse)) e.gone = true;
  G.vigils.forEach((v, i) => {
    if (ENTS.some(e => e.corpse === v.id)) return;
    const c = catById(v.id); if (!c) return;
    const x = LM.lager.x - 40 + i * 45, y = LM.lager.y - 70;
    ENTS.push({ kind: 'cat', corpse: v.id, name: catName(c), look: c.look, x, y, dir: 0.4, r: 8, team: 'donner', hostile: false, truce: true, persistent: true });
    // Trauernde setzen sich dazu
    shuffle(clanCats().filter(k => k !== P() && k.ai && k.ai.m === 'home' && k.rank !== 'junges')).slice(0, 4).forEach((k, j) => {
      const a = j / 4 * TAU + 0.3; k.ai = { m: 'goto', x: x + Math.cos(a) * 34, y: y + Math.sin(a) * 34, then: 'hold', sp: 90 };
      k.mourn = true;
    });
  });
  for (const k of G.cats) if (k.mourn && k.ai && k.ai.m === 'hold' && !k.ai.face) { const v = ENTS.find(e => e.corpse); if (v) k.ai.face = Math.atan2(v.y - k.y, v.x - k.x); else { k.mourn = false; k.ai = { m: 'home' }; } }
  if (!G.vigils.length) for (const k of G.cats) if (k.mourn) { k.mourn = false; k.ai = { m: 'home' }; }
}

// ---------- Was bisher geschah ----------
const RECAP = {
  2: 'Feuerherz ist jetzt ein Krieger. Doch Tigerkralle ist Zweiter Anführer – und nur Feuerherz kennt sein Geheimnis.',
  3: 'Der WindClan ist heimgekehrt. Aschenpfote wurde am Donnerweg verletzt – und Graustreif liebt eine Kätzin aus dem FlussClan.',
  4: 'Tigerkralle wurde verbannt. Feuerherz ist Zweiter Anführer – doch Blaustern hat das Vertrauen in den SternenClan verloren.',
  5: 'Das Feuer hat das Lager zerstört, Gelbzahn ist tot. Und Tigerkralle herrscht als Tigerstern über den SchattenClan.',
  6: 'Blaustern hat ihr letztes Leben für den Clan gegeben. Nun muss Feuerherz Anführer werden – während ein neuer Feind naht.',
  7: 'Viele Monde nach dem Sieg über den BlutClan lebt der Wald in Frieden. Doch ein neuer Traum kündigt Unheil an …',
  8: 'Mitternacht hat gesprochen: Die Zweibeiner werden den Wald zerstören. Jetzt müssen die Auserwählten heim – über die Berge.',
  9: 'Federschweif ist tot. Und zu Hause haben die Monster der Zweibeiner begonnen, den Wald zu fressen.',
  10: 'Die vier Clans haben den großen See erreicht. Hier beginnt ein neues Leben.',
  11: 'Die Clans haben sich am See eingelebt. Doch Habichtfrost hat große Pläne – und Tigersterns Geist ruft nach seinen Söhnen.',
  12: 'Aschenpelz ist tot, Blattsee ist Heilerin. Und eine Vision warnt: Blut wird Blut vergießen.',
};

// ---------- Traumszenen ----------
function dreamMode() { const st = Story.step(); return st && st.dream && (Story.finishing || Dlg.open) ? st.dream : null; }
