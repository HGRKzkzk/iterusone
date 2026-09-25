import { DIMS, PROFILES, SCHISM_NAMES, FIRST, LAST } from "./data.js";
import { DISCOVERIES, discoveryById } from "./discoveries.js";

const N = 180, VILLAGES = 6;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const rnd = (a = 0, b = 1) => a + Math.random() * (b - a);
const pick = (arr) => arr[(Math.random() * arr.length) | 0];

export function defaultOntology() {
  const o = {};
  for (const d of DIMS) o[d.id] = { value: 0.5, spread: 0.78 };
  return o;
}
function sampleWorld(onto, id) {
  const d = onto[id];
  return clamp(d.value + (Math.random() * 2 - 1) * d.spread * 0.55);
}
const namePerson = () => `${pick(FIRST)} ${pick(LAST)}`;

export function createWorld(onto) {
  const villages = [];
  for (let i = 0; i < VILLAGES; i++) {
    const ang = (i / VILLAGES) * Math.PI * 2;
    villages.push({ id: i, name: ["Dal","Heuvel","Haven","Woud","Bron","Steen"][i],
      x: 0.5 + Math.cos(ang) * 0.32, y: 0.5 + Math.sin(ang) * 0.28 });
  }
  const people = [];
  for (let i = 0; i < N; i++) {
    const v = i % VILLAGES, belief = {}, conf = {};
    for (const d of DIMS) { belief[d.id] = rnd(0.25, 0.75); conf[d.id] = rnd(0.15, 0.4); }
    people.push({ id: i, name: namePerson(), village: v,
      x: villages[v].x + rnd(-0.06, 0.06), y: villages[v].y + rnd(-0.06, 0.06),
      age: rnd(12, 55), energy: rnd(0.5, 1), tradition: rnd(0.2, 0.8), curiosity: rnd(0.2, 0.8),
      belief, conf, followers: 0, teacher: false, alive: true, memories: [] });
  }
  return {
    year: 0, onto, people, villages,
    log: [{ year: 0, kind: "start", text: "Niets is vastgelegd. De wereld zal vragen stellen wanneer ervaring rijp is." }],
    archive: { streams: {}, schisms: {}, moments: {} },
    activeStreams: [], schismWatch: {}, flags: {}, paused: false, speed: 1,
    stats: { deaths: 0, actions: 0, noiseEvents: 0, unity: 0, gapMoral: 0 },
    discovered: [], available: [], pending: null, path: []
  };
}

function updateBelief(p, id, observed, weight) {
  const err = observed - p.belief[id];
  const learn = (0.08 + p.curiosity * 0.12) * weight * (1.15 - p.tradition);
  p.belief[id] = clamp(p.belief[id] + err * learn);
  p.conf[id] = clamp(p.conf[id] + ((1 - Math.abs(err)) - 0.5) * 0.08 * weight);
}

function tickPerson(world, p) {
  p.age += 1;
  const risk = 0.012 + p.belief.after * 0.01;
  if (Math.random() < risk || p.age > 78 + rnd(-8, 8)) {
    const survives = sampleWorld(world.onto, "after") > 0.5;
    const place = sampleWorld(world.onto, "place");
    updateBelief(p, "after", survives ? 0.9 : 0.1, 1.4);
    world.stats.deaths += 1;
    p.memories.push(survives ? "iets ging door" : "einde");
    for (const q of world.people) {
      if (!q.alive || q.village !== p.village || q === p || Math.random() > 0.35) continue;
      const noise = sampleWorld(world.onto, "senses") > 0.55 ? rnd(-0.25, 0.25) : 0;
      updateBelief(q, "after", clamp((survives ? 0.85 : 0.15) + noise), 0.35);
      if (survives) updateBelief(q, "place", place, 0.25);
    }
    if (survives && place < 0.5) { p.age = 0; p.name = namePerson(); p.energy = 1; }
    else { p.alive = false; return; }
  }
  world.stats.actions += 1;
  const willT = 1 - sampleWorld(world.onto, "will");
  const orderT = 1 - sampleWorld(world.onto, "order");
  const success = clamp(0.3 + (p.curiosity * 0.5 + rnd(0, 0.5)) * willT + (Math.random() - 0.5) * (1 - orderT));
  updateBelief(p, "will", success > 0.5 ? 0.25 : 0.75, 0.35);
  updateBelief(p, "order", Math.abs(success - 0.5) < 0.15 + orderT * 0.2 ? 0.25 : 0.75, 0.25);
  const senseObs = sampleWorld(world.onto, "senses");
  if (Math.abs(senseObs - world.onto.senses.value) > 0.25) world.stats.noiseEvents += 1;
  updateBelief(p, "senses", senseObs, 0.12);
  updateBelief(p, "flux", sampleWorld(world.onto, "flux"), 0.1);
  if (Math.random() < 0.3) {
    const rewarded = sampleWorld(world.onto, "moral") < 0.5;
    updateBelief(p, "moral", rewarded ? 0.2 : 0.8, 0.3);
  }
  if (Math.random() < 0.04 + (1 - world.onto.ground.value) * 0.06) {
    const real = sampleWorld(world.onto, "ground") < 0.5;
    updateBelief(p, "ground", real ? 0.15 : 0.8, 0.5);
    if (real) { p.memories.push("eenheid"); world.stats.unity += 1; }
  }
  if (Math.random() < 0.15 + p.curiosity * 0.2) {
    const works = sampleWorld(world.onto, "insight") < 0.5;
    if (works) {
      for (const d of DIMS) updateBelief(p, d.id, world.onto[d.id].value, 0.12);
      updateBelief(p, "insight", 0.2, 0.3);
    } else updateBelief(p, "insight", 0.8, 0.25);
  }
  if (sampleWorld(world.onto, "self") > 0.55 && Math.random() < 0.08) {
    const other = pick(world.people.filter((q) => q.alive && q !== p));
    if (other) {
      const k = pick(DIMS).id;
      p.belief[k] = clamp(p.belief[k] * 0.7 + other.belief[k] * 0.3);
      updateBelief(p, "self", 0.8, 0.4);
    }
  }
  if (Math.random() < 0.25 + p.tradition * 0.2) {
    const others = world.people.filter((q) => q.alive && q.village === p.village && q !== p);
    const t = others.sort((a, b) => b.followers - a.followers)[0] || pick(others);
    if (t) {
      const k = pick(DIMS).id;
      const w = 0.15 + p.belief.senses * 0.15 + (t.teacher ? 0.2 : 0);
      p.belief[k] = clamp(p.belief[k] * (1 - w) + t.belief[k] * w);
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
    s += (mean[k] - v) ** 2; n++;
  }
  return Math.sqrt(s / n);
}
function matchStreams(world) {
  const alive = world.people.filter((p) => p.alive);
  const used = new Set(), clusters = [];
  for (const p of alive) {
    if (used.has(p.id)) continue;
    const group = [p]; used.add(p.id);
    for (const q of alive) {
      if (used.has(q.id)) continue;
      let dist = 0;
      for (const d of DIMS) dist += (p.belief[d.id] - q.belief[d.id]) ** 2;
      if (Math.sqrt(dist / DIMS.length) < 0.18) { group.push(q); used.add(q.id); }
    }
    if (group.length >= 8) clusters.push(group);
  }
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
    else { label = mean.after > 0.65 ? "Doorlevers" : "Enders"; strength = "new"; }
    found.push({ label, strength, size: g.length });
    if (strength === "strong" && !world.archive.streams[best.name]) {
      world.archive.streams[best.name] = { year: world.year, traditie: best.traditie };
      world.log.unshift({ year: world.year, kind: "stream", text: `Herkend als ${best.name} (${best.traditie}).` });
    }
  }
  world.activeStreams = found.sort((a, b) => b.size - a.size).slice(0, 8);
}

export function considerDiscoveries(world) {
  const alive = world.people.filter((p) => p.alive);
  world.stats.gapMoral = alive.length
    ? Math.abs(alive.reduce((s, p) => s + p.belief.moral, 0) / alive.length - world.onto.moral.value) : 0;
  if (world.pending) return;
  for (const d of DISCOVERIES) {
    if (world.discovered.includes(d.id) || world.available.includes(d.id)) continue;
    const opened = d.prereq.length === 0 || d.prereq.every((p) => world.discovered.includes(p));
    if (!opened) continue;
    if (d.when(world, world.stats)) world.available.push(d.id);
  }
  if (world.available.length) {
    world.pending = world.available[0];
    const card = discoveryById(world.pending);
    world.log.unshift({ year: world.year, kind: "moment", text: `Ontdekking: ${card.title}. De wereld wacht op een bepaling.` });
  }
}

export function applyDetermination(world, optionId) {
  const card = discoveryById(world.pending);
  if (!card) return;
  const opt = card.options.find((o) => o.id === optionId);
  if (!opt) return;
  const dim = world.onto[card.dim];
  dim.value = clamp(dim.value * 0.45 + opt.toward * 0.55);
  dim.spread = opt.spread != null ? clamp(opt.spread, 0.08, 0.9) : clamp(dim.spread * 0.62, 0.1, 0.9);
  world.discovered.push(card.id);
  world.available = world.available.filter((id) => id !== card.id);
  world.path.push({ year: world.year, discovery: card.id, title: card.title, choice: opt.label, dim: card.dim, echo: opt.echo });
  world.log.unshift({ year: world.year, kind: "onto", text: `${card.title}: ${opt.label}. ${opt.echo}` });
  world.pending = null;
}

function replenish(world) {
  const alive = world.people.filter((p) => p.alive);
  const deadIdx = world.people.map((p, i) => (!p.alive ? i : -1)).filter((i) => i >= 0);
  const need = Math.max(0, Math.floor(N * 0.72) - alive.length);
  for (let k = 0; k < need && deadIdx.length; k++) {
    const i = deadIdx.pop();
    const parent = pick(alive) || world.people[0];
    const belief = {}, conf = {};
    for (const d of DIMS) {
      belief[d.id] = clamp(parent.belief[d.id] + rnd(-0.08, 0.08));
      conf[d.id] = parent.conf[d.id] * 0.6;
    }
    world.people[i] = { id: i, name: namePerson(), village: parent.village,
      x: world.villages[parent.village].x + rnd(-0.06, 0.06),
      y: world.villages[parent.village].y + rnd(-0.06, 0.06),
      age: rnd(0, 8), energy: 1, tradition: clamp(parent.tradition + rnd(-0.1, 0.1)),
      curiosity: clamp(parent.curiosity + rnd(-0.1, 0.1)),
      belief, conf, followers: 0, teacher: false, alive: true, memories: [] };
  }
  alive.sort((a, b) => b.followers - a.followers);
  world.people.forEach((p) => { if (p.alive) p.teacher = p.followers > 1.2; });
}

export function tickYear(world) {
  world.year += 1;
  for (const p of world.people) if (p.alive) tickPerson(world, p);
  replenish(world);
  matchStreams(world);
  considerDiscoveries(world);
  if (world.year % 25 === 0) {
    world.log.unshift({ year: world.year, kind: "onto",
      text: `Kroniek: ${world.people.filter((p) => p.alive).length} zielen.` });
  }
}

export function beliefColor(p) {
  const h = (1 - p.belief.after) * 40 + p.belief.ground * 80 + p.belief.moral * 40;
  return `hsl(${h}deg ${35 + p.conf.after * 25}% ${40 + (1 - p.belief.flux) * 15}%)`;
}
export { DIMS, PROFILES, SCHISM_NAMES };
