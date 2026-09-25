import { DIMS, defaultOntology, createWorld, tickYear, beliefColor } from "./sim.js";

let world = createWorld(defaultOntology());
let selected = null;
let running = true;
let acc = 0;

const $ = (id) => document.getElementById(id);

function renderDims() {
  const root = $("dims");
  root.innerHTML = "";
  for (const d of DIMS) {
    const sl = world.onto[d.id];
    const el = document.createElement("div");
    el.className = "dim";
    el.innerHTML = `
      <div class="row"><span class="name">${d.name}</span><span>${sl.value.toFixed(2)} · spreiding ${sl.spread.toFixed(2)}</span></div>
      <div class="poles"><span>${d.a}</span><span>${d.b}</span></div>
      <input type="range" min="0" max="100" value="${Math.round(sl.value * 100)}" data-k="${d.id}" data-f="value">
      <input type="range" min="8" max="90" value="${Math.round(sl.spread * 100)}" data-k="${d.id}" data-f="spread">
    `;
    root.appendChild(el);
  }
  root.querySelectorAll("input").forEach((inp) => {
    inp.addEventListener("input", () => {
      world.onto[inp.dataset.k][inp.dataset.f] = +inp.value / 100;
      world.log.unshift({
        year: world.year,
        kind: "onto",
        text: `De werkelijkheid verschuift: ${inp.dataset.k} (${inp.dataset.f}).`
      });
      renderFaith();
    });
  });
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
  ul.innerHTML = world.activeStreams
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
    <p class="muted">${streams.length} stromingen · ${sch.length} schisma's · ${mom.length} bestaansmomenten</p>
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
    (d) =>
      `${d.name}: ${(p.belief[d.id] * 100) | 0}% (±${(p.conf[d.id] * 100) | 0}%)`
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
      if (d < bd) {
        bd = d;
        best = p;
      }
    }
    inspect(best);
  });
}

function stats() {
  $("year").textContent = "Jaar " + world.year;
  $("pop").textContent = world.people.filter((p) => p.alive).length + " inwoners";
}

function loop(t) {
  requestAnimationFrame(loop);
  if (!running || world.paused) {
    drawMap();
    return;
  }
  acc += world.speed;
  while (acc >= 1) {
    tickYear(world);
    acc -= 1;
  }
  renderFaith();
  renderLog();
  stats();
  drawMap();
}

function snapshot() {
  return JSON.parse(JSON.stringify(world.onto));
}

export function boot() {
  renderDims();
  renderFaith();
  renderLog();
  bindMap();
  $("btn-pause").onclick = () => {
    running = !running;
    $("btn-pause").textContent = running ? "Pauze" : "Hervat";
  };
  $("speed").onchange = (e) => {
    world.speed = +e.target.value;
  };
  $("btn-reset").onclick = () => {
    world = createWorld(defaultOntology());
    renderDims();
    renderFaith();
    renderLog();
    inspect(null);
  };
  $("btn-split").onclick = () => {
    const onto = snapshot();
    world.log.unshift({
      year: world.year,
      kind: "onto",
      text: "Tijdlijn gesplitst: deze wereld loopt door; verschuif één dimensie om te vergelijken (prototype: zelfde venster)."
    });
    renderLog();
    world.onto = onto;
  };
  requestAnimationFrame(loop);
}
