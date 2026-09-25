import {
  DIMS,
  defaultOntology,
  createWorld,
  tickYear,
  beliefColor,
  applyDetermination
} from "./sim.js";
import { discoveryById } from "./discoveries.js";

let world = createWorld(defaultOntology());
let selected = null;
let running = true;
let acc = 0;
let lastPending = null;

const $ = (id) => document.getElementById(id);

function renderDims() {
  const root = $("dims");
  root.innerHTML = "";
  for (const d of DIMS) {
    const sl = world.onto[d.id];
    const settled = 1 - sl.spread;
    const el = document.createElement("div");
    el.className = "dim";
    el.innerHTML = `
      <div class="row"><span class="name">${d.name}</span>
        <span>${settled > 0.45 ? "bepaalder" : "onbepaald"}</span></div>
      <div class="poles"><span>${d.a}</span><span>${d.b}</span></div>
      <div class="gap">
        <i class="bar-true" style="left:${sl.value * 100}%"></i>
        <i class="spread" style="left:${Math.max(0, sl.value - sl.spread * 0.35) * 100}%;width:${sl.spread * 70}%"></i>
      </div>
    `;
    root.appendChild(el);
  }
}

function renderDialogue() {
  const box = $("dialogue");
  if (!world.pending) {
    const nextHint =
      world.path.length === 0
        ? "Wacht tot de eerste doden een vraag maken."
        : "De wereld draait. Een volgende vraag rijpt uit ervaring.";
    box.innerHTML = `<h2>Samenspraak</h2>
      <p class="tag">${nextHint}</p>
      <ol class="path">${world.path
        .map((p) => `<li><span class="y">${p.year}</span> ${p.title} — ${p.choice}</li>`)
        .join("")}</ol>`;
    return;
  }
  const card = discoveryById(world.pending);
  box.innerHTML = `<h2>Ontdekking</h2>
    <h3>${card.title}</h3>
    <p>${card.prompt}</p>
    <div class="choices"></div>`;
  const wrap = box.querySelector(".choices");
  for (const opt of card.options) {
    const b = document.createElement("button");
    b.className = "choice";
    b.textContent = opt.label;
    b.onclick = () => {
      applyDetermination(world, opt.id);
      running = true;
      $("btn-pause").textContent = "Pauze";
      renderDialogue();
      renderDims();
      renderFaith();
      renderLog();
    };
    wrap.appendChild(b);
  }
}

function renderFaith() {
  const root = $("faith-bars");
  const alive = world.people.filter((p) => p.alive);
  root.innerHTML = "";
  for (const d of DIMS) {
    const mean = alive.reduce((s, p) => s + p.belief[d.id], 0) / (alive.length || 1);
    const el = document.createElement("div");
    el.innerHTML = `<div class="row"><span>${d.name}</span><span>kloof ${Math.abs(mean - world.onto[d.id].value).toFixed(2)}</span></div>
      <div class="gap"><i class="bar-true" style="left:${world.onto[d.id].value * 100}%"></i>
      <i class="bar-belief" style="left:${mean * 100}%"></i></div>`;
    root.appendChild(el);
  }
  const ul = $("streams");
  ul.innerHTML =
    world.activeStreams
      .map(
        (s) =>
          `<li class="${s.strength === "strong" ? "" : "weak"}">${s.label} · ${s.size} zielen</li>`
      )
      .join("") || "<li class='weak'>Nog geen herkende stromingen.</li>";
}

function renderLog() {
  $("log").innerHTML = world.log
    .slice(0, 40)
    .map((e) => `<div class="log"><span class="y">${e.year}</span><span class="${e.kind}">${e.text}</span></div>`)
    .join("");
  const a = $("arch");
  const streams = Object.entries(world.archive.streams);
  const sch = Object.values(world.archive.schisms);
  const mom = Object.entries(world.archive.moments);
  a.innerHTML = `
    <p class="tag">${world.path.length} bepalingen · ${streams.length} stromingen · ${sch.length} schisma's · ${mom.length} momenten</p>
    ${world.path.map((p) => `<div class="log"><span class="y">${p.year}</span>${p.choice}</div>`).join("")}
    ${streams.map(([n, v]) => `<div class="log"><span class="y">${v.year}</span>${n} <span class="weak">(${v.traditie})</span></div>`).join("")}
    ${sch.map((v) => `<div class="log"><span class="y">${v.year}</span>Schisma: ${v.name} in ${v.village}</div>`).join("")}
    ${mom.map(([n, v]) => `<div class="log moment"><span class="y">${v.year}</span>${n}</div>`).join("")}
  `;
}

function drawMap() {
  const c = $("map");
  const ctx = c.getContext("2d");
  const w = (c.width = c.clientWidth * devicePixelRatio);
  const h = (c.height = Math.max(200, c.clientHeight) * devicePixelRatio);
  ctx.clearRect(0, 0, w, h);
  const fog = Object.values(world.onto).reduce((s, d) => s + d.spread, 0) / 10;
  ctx.fillStyle = `rgba(180,160,120,${0.04 + fog * 0.08})`;
  ctx.fillRect(0, 0, w, h);
  for (const v of world.villages) {
    ctx.strokeStyle = "#3a3228";
    ctx.beginPath();
    ctx.arc(v.x * w, v.y * h, 28 * devicePixelRatio, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#9a8e7a";
    ctx.font = `${11 * devicePixelRatio}px Georgia`;
    ctx.fillText(v.name, v.x * w - 16, v.y * h - 32 * devicePixelRatio);
  }
  for (const p of world.people) {
    if (!p.alive) continue;
    ctx.fillStyle = beliefColor(p);
    const r = (p.teacher ? 3.4 : 2.1) * devicePixelRatio;
    ctx.beginPath();
    ctx.arc(p.x * w, p.y * h, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function inspect(p) {
  selected = p;
  const box = $("inspector");
  if (!p) {
    box.style.display = "none";
    return;
  }
  box.style.display = "block";
  const rows = DIMS.map(
    (d) => `${d.name}: ${(p.belief[d.id] * 100) | 0}% (±${(p.conf[d.id] * 100) | 0}%)`
  ).join("<br>");
  box.innerHTML = `<h3>${p.name}</h3>
    <div>${world.villages[p.village].name} · ${p.age | 0} jaar ${p.teacher ? "· leraar" : ""}</div>
    <div style="margin-top:.4rem">${rows}</div>
    <div style="margin-top:.4rem;color:#9a8e7a">${p.memories.slice(-3).join(" · ") || "geen bijzondere herinneringen"}</div>`;
}

function bindMap() {
  const c = $("map");
  c.addEventListener("click", (ev) => {
    const r = c.getBoundingClientRect();
    const x = (ev.clientX - r.left) / r.width;
    const y = (ev.clientY - r.top) / r.height;
    let best = null, bd = 0.04;
    for (const p of world.people) {
      if (!p.alive) continue;
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < bd) { bd = d; best = p; }
    }
    inspect(best);
  });
}

function stats() {
  $("year").textContent = "Jaar " + world.year;
  $("pop").textContent = world.people.filter((p) => p.alive).length + " inwoners";
}

function loop() {
  requestAnimationFrame(loop);
  if (world.pending && world.pending !== lastPending) {
    lastPending = world.pending;
    running = false;
    $("btn-pause").textContent = "Hervat";
    renderDialogue();
  }
  if (!world.pending) lastPending = null;
  if (!running) { drawMap(); return; }
  acc += world.speed;
  while (acc >= 1) { tickYear(world); acc -= 1; }
  renderFaith();
  renderLog();
  renderDims();
  stats();
  drawMap();
}

export function boot() {
  renderDims();
  renderFaith();
  renderLog();
  renderDialogue();
  bindMap();
  $("btn-pause").onclick = () => {
    running = !running;
    $("btn-pause").textContent = running ? "Pauze" : "Hervat";
  };
  $("speed").onchange = (e) => { world.speed = +e.target.value; };
  $("btn-reset").onclick = () => {
    world = createWorld(defaultOntology());
    lastPending = null;
    running = true;
    $("btn-pause").textContent = "Pauze";
    renderDims();
    renderFaith();
    renderLog();
    renderDialogue();
    inspect(null);
  };
  requestAnimationFrame(loop);
}
