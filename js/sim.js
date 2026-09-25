import { DIMS, PROFILES, SCHISM_NAMES, FIRST, LAST } from "./data.js";

const N = 220;
const VILLAGES = 6;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const rnd = (a = 0, b = 1) => a + Math.random() * (b - a);
const pick = (arr) => arr[(Math.random() * arr.length) | 0];

export function defaultOntology() {
  const o = {};
  for (const d of DIMS) o[d.id] = { value: 0.5, spread: 0.55 };
  return o;
}

function sampleWorld(onto, id) {
  const d = onto[id];
  return clamp(d.value + (Math.random() * 2 - 1) * d.spread * 0.55);
}

function namePerson() {
  return `${pick(FIRST)} ${pick(LAST)}`;
}

export function createWorld(onto) {
  const villages = [];
  for (let i = 0; i < VILLAGES; i++) {
    const ang = (i / VILLAGES) * Math.PI * 2;
    villages.push({
      id: i,
      name: ["Dal", "Heuvel", "Haven", "Woud", "Bron", "Steen"][i],
      x: 0.5 + Math.cos(ang) * 0.32,
      y: 0.5 + Math.sin(ang) * 0.28
    });
  }
  const people = [];
  for (let i = 0; i < N; i++) {
    const v = i % VILLAGES;
    const bel = {};
    const conf = {};
    for (const d of DIMS) {
      bel[d.id] = rnd(0.25, 0.75);
      conf[d.id] = rnd(0.15, 0.4);
    }
    people.push({
      id: i,
      name: namePerson(),
      village: v,
      x: villages[v].x + rnd(-0.06, 0.06),
      y: villages[v].y + rnd(-0.06, 0.06),
      age: rnd(12, 55),
      energy: rnd(0.5, 1),
      tradition: rnd(0.2, 0.8),
      curiosity: rnd(0.2, 0.8),
      belief: bel,
      conf,
      followers: 0,
      teacher: false,
      alive: true,
      memories: []
    });
  }
  return {
    year: 0,
    onto,
    people,
    villages,
    log: [{ year: 0, kind: "start", text: "De wereld is onbepaald. De bevolking tast in het duister." }],
    archive: { streams: {}, schisms: {}, moments: {} },
    activeStreams: [],
    schismWatch: {},
    flags: {},
    paused: false,
    speed: 1
  };
}

function updateBelief(p, id, observed, weight) {
  const err = observed - p.belief[id];
  const learn = (0.08 + p.curiosity * 0.12) * weight * (1.15 - p.tradition);
  p.belief[id] = clamp(p.belief[id] + err * learn);
  const agree = 1 - Math.abs(err);
  p.conf[id] = clamp(p.conf[id] + (agree - 0.5) * 0.08 * weight);
}

function eventAfterlife(world, p) {
  const survives = sampleWorld(world.onto, "after") > 0.5;
  const place = sampleWorld(world.onto, "place");
  return { survives, place };
}

function tickPerson(world, p) {
  p.age += 1;
  p.energy = clamp(p.energy + rnd(-0.08, 0.06));
  const risk = 0.012 + p.belief.after * 0.01 - p.belief.moral * 0.004;
  if (Math.random() < risk || p.age > 78 + rnd(-8, 8)) {
    const ev = eventAfterlife(world, p);
    updateBelief(p, "after", ev.survives ? 0.9 : 0.1, 1.4);
    p.memories.push(ev.survives ? "iets ging door" : "einde");
    for (const q of world.people) {
      if (!q.alive || q.village !== p.village || q === p) continue;
      if (Math.random() > 0.35) continue;
      const noise = sampleWorld(world.onto, "senses") > 0.55 ? rnd(-0.25, 0.25) : 0;
      const seen = clamp((ev.survives ? 0.85 : 0.15) + noise);
      updateBelief(q, "after", seen, 0.35 * (1 - q.belief.senses * 0.4));
      if (ev.survives) updateBelief(q, "place", ev.place, 0.25);
    }
    if (ev.survives && ev.place < 0.5) {
      p.age = 0;
      p.name = namePerson();
      p.energy = 1;
      p.conf = Object.fromEntries(DIMS.map((d) => [d.id, p.conf[d.id] * 0.4]));
    } else {
      p.alive = false;
      return;
    }
  }
  const effort = p.curiosity * 0.5 + rnd(0, 0.5);
  const willTruth = 1 - sampleWorld(world.onto, "will");
  const orderTruth = 1 - sampleWorld(world.onto, "order");
  const success = clamp(0.3 + effort * willTruth + (Math.random() - 0.5) * (1 - orderTruth));
  updateBelief(p, "will", success > 0.5 ? 0.25 : 0.75, 0.35);
  updateBelief(p, "order", Math.abs(success - 0.5) < 0.15 + orderTruth * 0.2 ? 0.25 : 0.75, 0.25);
  updateBelief(p, "senses", sampleWorld(world.onto, "senses"), 0.12);
  updateBelief(p, "flux", sampleWorld(world.onto, "flux"), 0.1);
  if (Math.random() < 0.3) {
    const rewarded = sampleWorld(world.onto, "moral") < 0.5;
    updateBelief(p, "moral", rewarded ? 0.2 : 0.8, 0.3);
    p.energy = clamp(p.energy + (rewarded ? 0.08 : -0.02));
  }
  if (Math.random() < 0.04 + (1 - world.onto.ground.value) * 0.06) {
    const real = sampleWorld(world.onto, "ground") < 0.5;
    updateBelief(p, "ground", real ? 0.15 : 0.8, 0.5);
    if (real) p.memories.push("eenheid");
  }
  if (Math.random() < 0.15 + p.curiosity * 0.2) {
    const insightWorks = sampleWorld(world.onto, "insight") < 0.5;
    if (insightWorks) {
      for (const d of DIMS) updateBelief(p, d.id, world.onto[d.id].value, 0.12);
      updateBelief(p, "insight", 0.2, 0.3);
    } else {
      updateBelief(p, "insight", 0.8, 0.25);
    }
  }
  if (sampleWorld(world.onto, "self") > 0.55 && Math.random() < 0.08) {
    const other = pick(world.people.filter((q) => q.alive && q !== p));
    if (other) {
      const k = pick(DIMS).id;
      p.belief[k] = clamp(p.belief[k] * 0.7 + other.belief[k] * 0.3);
      updateBelief(p, "self", 0.8, 0.4);
    }
  } else if (Math.random() < 0.05) {
    updateBelief(p, "self", 0.25, 0.2);
  }
  if (Math.random() < 0.25 + p.tradition * 0.2) {
    const others = world.people.filter((q) => q.alive && q.village === p.village && q !== p);
    const t = others.sort((a, b) => b.followers - a.followers)[0] || pick(others);
    if (t) {
      const rely = p.belief.senses;
      const k = pick(DIMS).id;
      const w = 0.15 + rely * 0.15 + (t.teacher ? 0.2 : 0);
      p.belief[k] = clamp(p.belief[k] * (1 - w) + t.belief[k] * w);
      p.conf[k] = clamp(p.conf[k] * 0.95 + t.conf[k] * 0.05);
      t.followers += 0.02;
    }
  }
}

function meanBeliefs(group) {
  const m = {};
  for (const d of DIMS) m[d.id] = group.reduce((s, p) => s + p.belief[d.id], 0) / group.length;
  return m;
}

function profileDistance(mean, profile) {
  let s = 0, n = 0;
  for (const [k, v] of Object.entries(profile)) {
    if (k === "name" || k === "traditie") continue;
    s += (mean[k] - v) ** 2;
    n++;
  }
  return Math.sqrt(s / n);
}

function cluster(people) {
  const alive = people.filter((p) => p.alive);
  const used = new Set();
  const clusters = [];
  for (const p of alive) {
    if (used.has(p.id)) continue;
    const group = [p];
    used.add(p.id);
    for (const q of alive) {
      if (used.has(q.id)) continue;
      let dist = 0;
      for (const d of DIMS) dist += (p.belief[d.id] - q.belief[d.id]) ** 2;
      if (Math.sqrt(dist / DIMS.length) < 0.18) {
        group.push(q);
        used.add(q.id);
      }
    }
    if (group.length >= 8) clusters.push(group);
  }
  return clusters;
}

function generatedName(mean) {
  const parts = [];
  if (mean.after > 0.65) parts.push("Doorlevers");
  else parts.push("Enders");
  if (mean.flux > 0.65) parts.push("van de Stroom");
  else if (mean.order < 0.35) parts.push("van de Wet");
  if (mean.ground < 0.35) parts.push("der Eenheid");
  return parts.slice(0, 2).join(" ") || "Naamlozen";
}

function matchStreams(world) {
  const clusters = cluster(world.people);
  const found = [];
  for (const g of clusters) {
    const mean = meanBeliefs(g);
    let best = null, bestD = 1;
    for (const pr of PROFILES) {
      const d = profileDistance(mean, pr);
      if (d < bestD) { bestD = d; best = pr; }
    }
    let label, strength;
    if (best && bestD < 0.18) { label = best.name; strength = "strong"; }
    else if (best && bestD < 0.28) { label = "verwant aan " + best.name; strength = "weak"; }
    else { label = generatedName(mean); strength = "new"; }
    found.push({ label, strength, size: g.length, mean, profile: best, dist: bestD, members: g });
    if (strength === "strong" && !world.archive.streams[best.name]) {
      world.archive.streams[best.name] = { year: world.year, traditie: best.traditie };
      world.log.unshift({ year: world.year, kind: "stream", text: `Een cluster van ${g.length} inwoners wordt herkend als ${best.name} (${best.traditie}).` });
    }
  }
  world.activeStreams = found.sort((a, b) => b.size - a.size).slice(0, 8);
}

function detectSchisms(world) {
  for (const v of world.villages) {
    const group = world.people.filter((p) => p.alive && p.village === v.id);
    if (group.length < 16) continue;
    for (const d of DIMS) {
      const lows = group.filter((p) => p.belief[d.id] < 0.4).length / group.length;
      const highs = group.filter((p) => p.belief[d.id] > 0.6).length / group.length;
      const key = v.id + ":" + d.id;
      if (lows > 0.3 && highs > 0.3) {
        world.schismWatch[key] = (world.schismWatch[key] || 0) + 1;
        if (world.schismWatch[key] === 10 && !world.archive.schisms[key]) {
          const name = SCHISM_NAMES[d.id] || d.name;
          world.archive.schisms[key] = { year: world.year, name, village: v.name };
          world.log.unshift({ year: world.year, kind: "schism", text: `Schisma in ${v.name}: ${name}.` });
        }
      } else world.schismWatch[key] = 0;
    }
  }
}

function detectMoments(world) {
  const alive = world.people.filter((p) => p.alive);
  if (!alive.length) return;
  const avg = meanBeliefs(alive);
  const avgConfInsight = alive.reduce((s, p) => s + p.conf.insight, 0) / alive.length;
  const avgTrad = alive.reduce((s, p) => s + p.tradition, 0) / alive.length;
  const mark = (id, text) => {
    if (world.archive.moments[id]) return;
    world.archive.moments[id] = { year: world.year };
    world.log.unshift({ year: world.year, kind: "moment", text });
  };
  if (world.year > 20 && avgConfInsight > 0.45 && avg.insight < 0.45)
    mark("mythos-logos", "Van mythos naar logos: vertrouwen in inzicht stijgt boven overlevering.");
  if (world.activeStreams.filter((s) => s.strength === "strong").length >= 3)
    mark("axiaal", "Axiale tijd: meerdere grote, tegengestelde stromingen in dezelfde eeuw.");
  if (avg.senses > 0.7 && avg.self < 0.4)
    mark("cartesisch", "Cartesiaanse twijfel: de zintuigen storten in, het zelf blijft staan.");
  if (world.onto.order.value < 0.35 && avg.order > 0.6)
    mark("hume", "Humes probleem: geloof in wetmatige orde daalt terwijl de wereld wetmatig is.");
  if (avg.moral > 0.7 && world.year > 40)
    mark("dood-god", "De dood van God: geloof in morele orde of grond valt massaal weg.");
  if (avg.moral > 0.65 && world.onto.moral.value > 0.7)
    mark("absurd", "Het absurde: verwachte morele orde in een onverschillig universum.");
  if (avg.insight < 0.4 && avgTrad < 0.4)
    mark("verlichting", "Verlichting: inzicht en maakbaarheid stijgen, traditie daalt.");
  const united = alive.find((p) => {
    let e = 0;
    for (const d of DIMS) e += Math.abs(p.belief[d.id] - world.onto[d.id].value);
    return e / DIMS.length < 0.12 && p.conf.ground > 0.55;
  });
  if (united) mark("nirvana", `${united.name} bereikt een toestand waarin overtuiging en werkelijkheid samenvallen.`);
}

function teachers(world) {
  const alive = world.people.filter((p) => p.alive);
  alive.sort((a, b) => b.followers - a.followers);
  alive.forEach((p, i) => { p.teacher = i < 8 && p.followers > 1.2; });
}

function replenish(world) {
  const alive = world.people.filter((p) => p.alive);
  const deadIdx = world.people.map((p, i) => (!p.alive ? i : -1)).filter((i) => i >= 0);
  const need = Math.max(0, Math.floor(N * 0.72) - alive.length);
  for (let k = 0; k < need && deadIdx.length; k++) {
    const i = deadIdx.pop();
    const parent = pick(alive) || world.people[0];
    const bel = {}, conf = {};
    for (const d of DIMS) {
      bel[d.id] = clamp(parent.belief[d.id] + rnd(-0.08, 0.08));
      conf[d.id] = parent.conf[d.id] * 0.6;
    }
    world.people[i] = {
      id: i, name: namePerson(), village: parent.village,
      x: world.villages[parent.village].x + rnd(-0.06, 0.06),
      y: world.villages[parent.village].y + rnd(-0.06, 0.06),
      age: rnd(0, 8), energy: 1,
      tradition: clamp(parent.tradition + rnd(-0.1, 0.1)),
      curiosity: clamp(parent.curiosity + rnd(-0.1, 0.1)),
      belief: bel, conf, followers: 0, teacher: false, alive: true, memories: []
    };
  }
}

export function tickYear(world) {
  world.year += 1;
  for (const p of world.people) if (p.alive) tickPerson(world, p);
  teachers(world);
  replenish(world);
  matchStreams(world);
  detectSchisms(world);
  detectMoments(world);
  if (world.year % 25 === 0) {
    world.log.unshift({ year: world.year, kind: "onto", text: `Kroniek: ${world.people.filter((p) => p.alive).length} zielen. Onbepaaldheid blijft.` });
  }
}

export function beliefColor(p) {
  const h = (1 - p.belief.after) * 40 + p.belief.ground * 80 + p.belief.moral * 40;
  const s = 35 + p.conf.after * 25;
  const l = 40 + (1 - p.belief.flux) * 15;
  return `hsl(${h}deg ${s}% ${l}%)`;
}

export { DIMS, PROFILES };
