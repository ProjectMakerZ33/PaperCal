const STORAGE_KEY = "papercal.v1";
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DOW_SHORT = ["S", "M", "T", "W", "T", "F", "S"];

const CATEGORIES = {
  supplements: { name: "Supplements", color: "#e8f5e9", border: "#81c784", accent: "#2e7d32" },
  meds: { name: "Meds", color: "#e3f2fd", border: "#64b5f6", accent: "#1565c0" },
  stimulants: { name: "Stimulants", color: "#ffebee", border: "#ef9a9a", accent: "#c62828" },
  activity: { name: "Activity", color: "#fff3e0", border: "#ffb74d", accent: "#e65100" },
  metrics: { name: "Metrics", color: "#f5f5f5", border: "#bdbdbd", accent: "#424242" }
};

const DEFAULT_ACTIVITY_TAGS = [
  "Warmup", "Walk", "Stretching", "Cardio", "Bike", "Sauna",
  "Legs", "Hips", "Upper body", "Arms", "Shoulders", "Back",
  "Functional", "Calves", "Abs", "Plyometrics", "Sprints"
];

function dailySchedule(start) {
  return { kind: "daily", days: [0,1,2,3,4,5,6], start: start || null, end: null, n: 1 };
}

function makeTracker(partial) {
  return {
    type: "check",
    color: "",
    unit: "",
    min: 0,
    max: 1,
    step: 1,
    group: "",
    slots: [],
    category: "supplements",
    schedule: dailySchedule(),
    sort: 50,
    archived: false,
    ...partial
  };
}

const DEFAULT_TRACKERS = [
  // Supplements
  makeTracker({ id: "vitd", name: "Vitamin D", unit: "IU", category: "supplements", slots: ["Morning"], sort: 10 }),
  makeTracker({ id: "vitk", name: "Vitamin K", unit: "", category: "supplements", slots: ["Morning"], sort: 20 }),
  makeTracker({ id: "berb", name: "Berberine", unit: "mg", category: "supplements", slots: ["Morning"], sort: 30 }),
  makeTracker({ id: "creat", name: "Creatine", unit: "g", category: "supplements", slots: ["Morning"], sort: 40 }),
  makeTracker({ id: "dhea", name: "DHEA", unit: "mg", category: "supplements", slots: ["Morning"], sort: 50 }),
  makeTracker({ id: "cdg", name: "Calcium d-glucarate", unit: "mg", category: "supplements", slots: ["Morning", "Evening"], sort: 60 }),
  makeTracker({ id: "dim", name: "DIM", unit: "mg", category: "supplements", slots: ["Morning", "Evening"], sort: 70 }),
  makeTracker({ id: "preg", name: "Pregnenolone", unit: "mg", category: "supplements", slots: ["Evening"], sort: 80 }),
  makeTracker({ id: "nac", name: "NAC", unit: "mg", category: "supplements", slots: ["Evening"], sort: 90 }),
  makeTracker({ id: "vitc", name: "Vitamin C", unit: "mg", category: "supplements", slots: ["Evening"], sort: 100 }),

  // Meds
  makeTracker({ id: "te", name: "TE", unit: "mg", category: "meds", slots: ["Morning"], sort: 110 }),
  makeTracker({ id: "bp", name: "BP", unit: "mcg", category: "meds", slots: ["Morning"], sort: 120 }),
  makeTracker({ id: "tb", name: "TB", unit: "mcg", category: "meds", slots: ["Morning"], sort: 130 }),
  makeTracker({ id: "ghc", name: "GHC", unit: "mcg", category: "meds", slots: ["Morning"], sort: 140 }),
  makeTracker({ id: "ta", name: "TA", unit: "mg", category: "meds", slots: ["Morning"], sort: 150 }),
  makeTracker({ id: "si", name: "SI", unit: "mg", category: "meds", slots: ["Evening"], sort: 160 }),
  makeTracker({ id: "ne", name: "NE", unit: "mg", category: "meds", slots: ["Evening"], sort: 170 }),
  makeTracker({ id: "re", name: "RE", unit: "mg", category: "meds", slots: ["Evening"], sort: 180 }),
  makeTracker({ id: "ez", name: "EZ", unit: "mg", category: "meds", slots: ["Evening"], sort: 190 }),
  makeTracker({ id: "me", name: "ME", unit: "mg", category: "meds", slots: ["Evening"], sort: 200 }),

  // Stimulants
  makeTracker({ id: "caff", name: "Caffeine", unit: "mg", category: "stimulants", type: "number", min: 0, max: 800, step: 25, sort: 210 }),
  makeTracker({ id: "mo", name: "Mo", unit: "mg", category: "stimulants", type: "number", min: 0, max: 100, step: 5, sort: 220 }),
  makeTracker({ id: "nic", name: "Nic", unit: "mg", category: "stimulants", type: "number", min: 0, max: 50, step: 1, sort: 230 }),

  // Activity
  makeTracker({ id: "acttot", name: "Total activity", unit: "/10", category: "activity", type: "scale", min: 1, max: 10, step: 1, sort: 300 }),

  // Metrics
  makeTracker({ id: "sleep", name: "Sleep", unit: "hrs", category: "metrics", type: "number", min: 0, max: 14, step: 0.1, sort: 400 }),
  makeTracker({ id: "wake", name: "Wakefulness", unit: "/10", category: "metrics", type: "scale", min: 1, max: 10, step: 1, sort: 410 }),
  makeTracker({ id: "vigor", name: "Vigor", unit: "/10", category: "metrics", type: "scale", min: 1, max: 10, step: 1, sort: 420 })
];

function uid() {
  return "t" + Math.random().toString(36).slice(2, 9);
}

function todayISO(d = new Date()) {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
}

function parseISO(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function addDays(iso, n) {
  const d = parseISO(iso);
  d.setDate(d.getDate() + n);
  return todayISO(d);
}

function startOfMonth(iso) {
  const d = parseISO(iso);
  d.setDate(1);
  return todayISO(d);
}

function daysBetween(a, b) {
  return Math.round((parseISO(b) - parseISO(a)) / 86400000);
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (!data.trackers || !data.days) throw new Error("bad");
      return migrate(data);
    }
  } catch (e) {}
  return {
    trackers: DEFAULT_TRACKERS.map((t) => ({ ...t, schedule: { ...t.schedule } })),
    days: {},
    settings: {
      installedHintDismissed: false,
      dayFilter: "all",
      activityTags: [...DEFAULT_ACTIVITY_TAGS]
    }
  };
}

function migrate(data) {
  data.settings = data.settings || {};
  data.settings.dayFilter = data.settings.dayFilter || "all";
  if (!Array.isArray(data.settings.activityTags)) data.settings.activityTags = [...DEFAULT_ACTIVITY_TAGS];
  data.days = data.days || {};
  Object.values(data.days).forEach((day) => {
    if (!Array.isArray(day.activityTags)) day.activityTags = [];
  });
  (data.trackers || []).forEach((t) => {
    if (!t.category) t.category = "supplements";
    if (t.group === undefined) t.group = "";
    if (!Array.isArray(t.slots)) t.slots = [];
    if (!t.schedule) t.schedule = dailySchedule();
    if (t.schedule.n === undefined) t.schedule.n = 1;
  });
  return data;
}

function nowStamp() {
  return Date.now();
}

function save() {
  state.updatedAt = nowStamp();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = load();
let view = "today";
let cursor = todayISO();
let selectedDate = todayISO();
let sheet = null;

function dayRecord(date) {
  if (!state.days[date]) state.days[date] = { notes: "", items: {}, activityTags: [] };
  if (!Array.isArray(state.days[date].activityTags)) state.days[date].activityTags = [];
  return state.days[date];
}

function trackerById(id) {
  return state.trackers.find((t) => t.id === id);
}

function isScheduled(tracker, date) {
  if (tracker.archived) return false;
  const s = tracker.schedule || dailySchedule();
  if (s.start && date < s.start) return false;
  if (s.end && date > s.end) return false;
  const dow = parseISO(date).getDay();
  if (s.kind === "everyN") {
    const start = s.start || "1970-01-01";
    const diff = daysBetween(start, date);
    return diff >= 0 && diff % (s.n || 2) === 0;
  }
  if (s.kind === "weekdays" || (s.days && s.days.length && s.days.length < 7)) {
    return (s.days || []).includes(dow);
  }
  return true;
}

function plannedTrackers(date) {
  const rec = state.days[date];
  const extraIds = rec ? Object.keys(rec.items).filter((id) => rec.items[id] && rec.items[id].oneOff) : [];
  const filter = state.settings.dayFilter || "all";
  const list = state.trackers
    .filter((t) => !t.archived && (isScheduled(t, date) || extraIds.includes(t.id)))
    .filter((t) => filter === "all" || t.category === filter)
    .sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name));
  return list;
}

function itemState(date, trackerId) {
  return (state.days[date] && state.days[date].items[trackerId]) || {};
}

function setItem(date, trackerId, patch) {
  const rec = dayRecord(date);
  rec.updatedAt = nowStamp();
  rec.items[trackerId] = { ...itemState(date, trackerId), ...patch, updatedAt: nowStamp() };
  save();
  render();
}

function slotsOf(tracker) {
  if (!tracker || tracker.type !== "check") return [""];
  const slots = (tracker.slots || []).map((s) => String(s).trim()).filter(Boolean);
  return slots.length ? slots : [""];
}

function slotStatus(date, trackerId, slot) {
  const it = itemState(date, trackerId);
  if (!slot) return it.status || null;
  return (it.slots && it.slots[slot]) || null;
}

function setSlotStatus(date, trackerId, slot, status) {
  if (!slot) {
    setItem(date, trackerId, { status });
    return;
  }
  const slots = { ...(itemState(date, trackerId).slots || {}) };
  slots[slot] = status;
  setItem(date, trackerId, { slots });
}

function cycleCheck(date, tracker, slot) {
  slot = slot || "";
  const cur = slotStatus(date, tracker.id, slot);
  if (!cur || cur === "planned") setSlotStatus(date, tracker.id, slot, "done");
  else if (cur === "done") setSlotStatus(date, tracker.id, slot, "skipped");
  else setSlotStatus(date, tracker.id, slot, null);
}

function checkAllSlot(date, slotName) {
  plannedTrackers(date)
    .filter((t) => t.type === "check")
    .forEach((t) => {
      const slots = slotsOf(t);
      if (slots.includes(slotName)) setSlotStatus(date, t.id, slotName, "done");
    });
}

function toggleActivityTag(date, tag) {
  const rec = dayRecord(date);
  const i = rec.activityTags.indexOf(tag);
  if (i >= 0) rec.activityTags.splice(i, 1);
  else rec.activityTags.push(tag);
  rec.updatedAt = nowStamp();
  save();
  render();
}

function monthCells(monthISO) {
  const start = parseISO(startOfMonth(monthISO));
  const firstDow = start.getDay();
  const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(todayISO(new Date(start.getFullYear(), start.getMonth(), d)));
  }
  return cells;
}

function completionDots(date) {
  const planned = plannedTrackers(date);
  const marks = [];
  for (const t of planned) {
    if (marks.length >= 8) break;
    if (t.type === "check") {
      for (const slot of slotsOf(t)) {
        if (marks.length >= 8) break;
        const st = slotStatus(date, t.id, slot);
        if (st === "done") marks.push("done");
        else if (st === "skipped") marks.push("skip");
        else marks.push("planned");
      }
    } else {
      const st = itemState(date, t.id);
      if (st.value !== undefined && st.value !== null && st.value !== "") marks.push("num");
      else marks.push("planned");
    }
  }
  return marks;
}

function openSheet(html) {
  sheet = document.getElementById("sheetBg");
  sheet.classList.add("open");
  sheet.querySelector(".sheet").innerHTML = html;
}

function closeSheet() {
  document.getElementById("sheetBg").classList.remove("open");
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&", "<": "<", ">": ">", '"': """, "'": "&#39;"
  }[c]));
}

function catStyle(cat) {
  return CATEGORIES[cat] || CATEGORIES.supplements;
}

function renderFilters() {
  const cur = state.settings.dayFilter || "all";
  const chips = [
    ["all", "All"],
    ...Object.entries(CATEGORIES).map(([k, v]) => [k, v.name])
  ];
  return `<div class="filters">${chips.map(([k, label]) => {
    const on = cur === k ? "on" : "";
    const style = k === "all" ? "" : `style="background:${CATEGORIES[k].color};border-color:${CATEGORIES[k].border}"`;
    return `<button class="filter ${on}" ${style} onclick="setFilter('${k}')">${escapeHtml(label)}</button>`;
  }).join("")}</div>`;
}

function renderToday() {
  selectedDate = selectedDate || todayISO();
  const date = selectedDate;
  const d = parseISO(date);
  const pretty = d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  const planned = plannedTrackers(date);
  const checks = planned.filter((t) => t.type === "check");
  const metrics = planned.filter((t) => t.type !== "check");
  const rec = dayRecord(date);

  return `
    <div class="month-head">
      <button class="icon-btn" onclick="shiftDay(-1)">‹</button>
      <div>
        <div class="brand">${date === todayISO() ? "Today" : "Day"}</div>
        <h1 style="margin:0;font-size:20px">${pretty}</h1>
      </div>
      <button class="icon-btn" onclick="shiftDay(1)">›</button>
    </div>
    ${renderFilters()}
    <div class="card" style="border-left:4px solid ${catStyle("supplements").border}">
      <div class="section-title" style="margin-top:0">Checklists</div>
      ${checks.length ? renderSlotSections(date, checks) : `<p class="hint">Nothing planned in this filter.</p>`}
      <div class="fab-row">
        <button class="btn ghost wide" onclick="openAddToDay('${date}')">+ Add for this day only</button>
      </div>
    </div>
    ${renderActivity(date, rec)}
    <div class="card" style="border-left:4px solid ${catStyle("metrics").border}">
      <div class="section-title" style="margin-top:0">Numbers</div>
      ${metrics.map((t) => metricRow(date, t)).join("") || `<p class="hint">No number trackers in this filter.</p>`}
    </div>
    <div class="card">
      <div class="section-title" style="margin-top:0">Notes</div>
      <textarea class="notes" placeholder="Anything worth remembering…" oninput="updateNotes('${date}', this.value)">${escapeHtml(rec.notes)}</textarea>
    </div>
  `;
}

function renderSlotSections(date, checks) {
  const slots = ["Morning", "Evening"];
  let html = "";
  for (const slot of slots) {
    const inSlot = checks.filter((t) => slotsOf(t).includes(slot));
    if (!inSlot.length) continue;
    const byCat = {};
    inSlot.forEach((t) => {
      (byCat[t.category] ||= []).push(t);
    });
    html += `<div class="slot-head"><span>${slot}</span><button type="button" onclick="checkAllSlot('${date}','${slot}')">Check all</button></div>`;
    Object.keys(byCat).forEach((cat) => {
      const c = catStyle(cat);
      html += `<div class="cat-block" style="background:${c.color};border-color:${c.border}">`;
      html += `<div class="cat-label" style="color:${c.accent}">${c.name}</div>`;
      byCat[cat].forEach((t) => { html += checkRow(date, t, slot); });
      html += `</div>`;
    });
  }
  const unslotted = checks.filter((t) => slotsOf(t).length === 1 && !slotsOf(t)[0]);
  if (unslotted.length) {
    html += unslotted.map((t) => checkRow(date, t, "")).join("");
  }
  return html;
}

function checkRow(date, t, slot) {
  slot = slot || "";
  const st = slotStatus(date, t.id, slot);
  const cls = st === "done" ? "done" : st === "skipped" ? "skip" : "";
  const mark = st === "done" ? "✓" : st === "skipped" ? "–" : "";
  const meta = st === "done" ? "taken" : st === "skipped" ? "not today" : "planned";
  const dose = itemState(date, t.id).dose;
  const doseLabel = dose != null ? ` ${dose}${t.unit ? " " + t.unit : ""}` : (t.unit ? ` ${t.unit}` : "");
  const extra = itemState(date, t.id).oneOff ? " · this day only" : "";
  const slotArg = encodeURIComponent(slot);
  return `
    <div class="item">
      <button class="check ${cls}" onclick="cycleCheck('${date}','${t.id}','${slotArg}')">${mark}</button>
      <div>
        <div class="item-name">${escapeHtml(t.name)}${escapeHtml(doseLabel)}</div>
        <div class="item-meta">${meta}${extra}</div>
      </div>
      <button class="menu-btn" onclick="openItemMenu('${date}','${t.id}','${slotArg}')">⋯</button>
    </div>
  `;
}

function renderActivity(date, rec) {
  const tags = state.settings.activityTags || [];
  const selected = new Set(rec.activityTags || []);
  const buttons = tags.map((tag) => {
    const on = selected.has(tag) ? "on" : "";
    return `<button type="button" class="tag ${on}" onclick="toggleActivityTag('${date}','${escapeHtml(tag)}')">${escapeHtml(tag)}</button>`;
  }).join("");
  return `
    <div class="card" style="border-left:4px solid ${catStyle("activity").border}; background:${catStyle("activity").color}">
      <div class="section-title" style="margin-top:0">Activity</div>
      <div class="tag-grid">${buttons}</div>
      <div class="fab-row">
        <button class="btn ghost" onclick="openEditTags()">Edit tags</button>
      </div>
    </div>
  `;
}

function metricRow(date, t) {
  const val = itemState(date, t.id).value;
  if (t.type === "scale") {
    const buttons = [];
    for (let i = t.min; i <= t.max; i += t.step) {
      const on = Number(val) === i ? "on" : "";
      buttons.push(`<button class="${on}" onclick="setItem('${date}','${t.id}',{value:${i}})">${i}</button>`);
    }
    return `
      <div class="metric">
        <div>
          <div class="item-name">${escapeHtml(t.name)}</div>
          <div class="item-meta">${t.unit || ""}</div>
        </div>
        <div class="scale">${buttons.join("")}</div>
      </div>`;
  }
  const shown = val === undefined || val === null ? "" : val;
  return `
    <div class="metric">
      <div>
        <div class="item-name">${escapeHtml(t.name)}</div>
        <div class="item-meta">${t.unit || ""}</div>
      </div>
      <div class="stepper">
        <button onclick="nudge('${date}','${t.id}',-1)">−</button>
        <input inputmode="decimal" value="${shown}" onchange="setNumber('${date}','${t.id}', this.value)">
        <button onclick="nudge('${date}','${t.id}',1)">+</button>
      </div>
    </div>`;
}

function nudge(date, id, dir) {
  const t = trackerById(id);
  const cur = Number(itemState(date, id).value);
  const base = Number.isFinite(cur) ? cur : (dir > 0 ? t.min : t.min);
  const next = Math.min(t.max, Math.max(t.min, +(base + dir * t.step).toFixed(4)));
  setItem(date, id, { value: next });
}

function setNumber(date, id, raw) {
  if (raw === "") {
    setItem(date, id, { value: null });
    return;
  }
  const t = trackerById(id);
  let n = Number(raw);
  if (!Number.isFinite(n)) return;
  n = Math.min(t.max, Math.max(t.min, n));
  setItem(date, id, { value: n });
}

function updateNotes(date, text) {
  dayRecord(date).notes = text;
  save();
}

function shiftDay(n) {
  selectedDate = addDays(selectedDate, n);
  render();
}

function setFilter(k) {
  state.settings.dayFilter = k;
  save();
  render();
}

function renderMonth() {
  const monthStart = startOfMonth(cursor);
  const d = parseISO(monthStart);
  const title = d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const cells = monthCells(monthStart);
  return `
    <div class="month-head">
      <button class="icon-btn" onclick="shiftMonth(-1)">‹</button>
      <h1>${title}</h1>
      <button class="icon-btn" onclick="shiftMonth(1)">›</button>
    </div>
    <div class="card">
      <div class="month-grid">
        ${DOW_SHORT.map((x) => `<div class="dow">${x}</div>`).join("")}
        ${cells.map((iso) => {
          if (!iso) return `<div class="day-cell empty"></div>`;
          const dots = completionDots(iso).map((c) => `<span class="dot ${c}"></span>`).join("");
          const cls = [
            iso === todayISO() ? "today" : "",
            iso === selectedDate ? "selected" : ""
          ].join(" ");
          return `<button class="day-cell ${cls}" onclick="openDate('${iso}')">
            <span class="day-num">${parseISO(iso).getDate()}</span>
            <div class="dots">${dots}</div>
          </button>`;
        }).join("")}
      </div>
    </div>
    <p class="hint">Green = taken. Tan = still planned. Orange square = a number logged. Dash-colored = cleared for that day. Blank cells are not zeros.</p>
  `;
}

function shiftMonth(n) {
  const d = parseISO(startOfMonth(cursor));
  d.setMonth(d.getMonth() + n);
  cursor = todayISO(d);
  render();
}

function openDate(iso) {
  selectedDate = iso;
  cursor = iso;
  view = "today";
  render();
}

function renderWeek() {
  const d = parseISO(selectedDate);
  const start = new Date(d);
  start.setDate(d.getDate() - d.getDay());
  const days = Array.from({ length: 7 }, (_, i) => todayISO(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)));
  const label = parseISO(days[0]).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    + " – " + parseISO(days[6]).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return `
    <div class="month-head">
      <button class="icon-btn" onclick="shiftWeek(-1)">‹</button>
      <h1 style="font-size:20px">${label}</h1>
      <button class="icon-btn" onclick="shiftWeek(1)">›</button>
    </div>
    ${days.map((iso) => {
      const planned = plannedTrackers(iso);
      const chips = planned.slice(0, 8).flatMap((t) => {
        if (t.type === "check") {
          return slotsOf(t).map((slot) => {
            const st = slotStatus(iso, t.id, slot);
            const cls = st === "done" ? "done" : st === "skipped" ? "skip" : "";
            const label = slot ? `${t.name.split(" ")[0]} ${slot[0]}` : t.name.split(" ")[0];
            return `<span class="chip ${cls}" style="border-color:${catStyle(t.category).border}">${escapeHtml(label)}</span>`;
          });
        }
        const st = itemState(iso, t.id);
        if (st.value !== undefined && st.value !== null && st.value !== "") {
          return [`<span class="chip num">${escapeHtml(t.name.split(" ")[0])} ${st.value}</span>`];
        }
        return [];
      }).join("");
      const tags = (state.days[iso] && state.days[iso].activityTags || []).slice(0, 3).map((tag) => `<span class="chip">${escapeHtml(tag)}</span>`).join("");
      const dd = parseISO(iso);
      return `<div class="week-row">
        <button class="week-date ${iso === todayISO() ? "today" : ""}" onclick="openDate('${iso}')">
          <span>${DOW[dd.getDay()]}</span>
          <b>${dd.getDate()}</b>
        </button>
        <div class="week-items">${chips}${tags || ""}</div>
      </div>`;
    }).join("")}
  `;
}

function shiftWeek(n) {
  selectedDate = addDays(selectedDate, n * 7);
  cursor = selectedDate;
  render();
}

function renderTrackers() {
  const active = state.trackers.filter((t) => !t.archived).sort((a,b) => a.sort - b.sort);
  const archived = state.trackers.filter((t) => t.archived);
  const byCat = {};
  active.forEach((t) => { (byCat[t.category] ||= []).push(t); });
  let body = "";
  Object.keys(CATEGORIES).forEach((cat) => {
    const items = byCat[cat] || [];
    if (!items.length) return;
    const c = catStyle(cat);
    body += `<div class="section-title">${c.name}</div><div class="card" style="border-left:4px solid ${c.border}">`;
    items.forEach((t) => {
      body += `
        <div class="tracker-row">
          <div>
            <div class="item-name">${escapeHtml(t.name)}${t.unit ? " · " + escapeHtml(t.unit) : ""}</div>
            <div class="item-meta">${labelType(t)} · ${labelSchedule(t)}${slotsOf(t)[0] ? " · " + slotsOf(t).join("/") : ""}</div>
          </div>
          <button class="btn ghost" onclick="openTrackerEditor('${t.id}')">Edit</button>
        </div>`;
    });
    body += `</div>`;
  });
  return `
    <div class="month-head">
      <h1>Trackers</h1>
      <button class="icon-btn" onclick="openTrackerEditor()">+</button>
    </div>
    <p class="hint">These print onto future days automatically. Stopping a tracker only affects today forward — past days stay in the log. Categories travel with the export.</p>
    ${body}
    ${archived.length ? `<div class="section-title">Stopped</div><div class="card">${archived.map((t) => `
      <div class="tracker-row">
        <div class="item-name">${escapeHtml(t.name)}</div>
        <button class="btn ghost" onclick="restoreTracker('${t.id}')">Restore</button>
      </div>`).join("")}</div>` : ""}
  `;
}

function labelType(t) {
  return t.type === "check" ? "checklist" : t.type === "scale" ? "scale" : "number";
}

function labelSchedule(t) {
  const s = t.schedule || {};
  if (s.end && s.end < todayISO()) return "ended " + s.end;
  if (s.kind === "everyN") return `every ${s.n || 2} days`;
  if (s.days && s.days.length && s.days.length < 7) return s.days.map((i) => DOW_SHORT[i]).join("");
  return "every day";
}

function renderMore() {
  const nDays = Object.keys(state.days).length;
  const nTrackers = state.trackers.filter((t) => !t.archived).length;
  return `
    <div class="month-head"><h1>Data</h1></div>
    <div class="card">
      <p class="hint">${nTrackers} active trackers · ${nDays} days with notes or check-ins stored on this device.</p>
      <div class="fab-row">
        <button class="btn wide" onclick="exportJSON()">Export JSON</button>
        <button class="btn ghost wide" onclick="exportCSV()">Export CSV</button>
      </div>
      <div class="fab-row">
        <button class="btn ghost wide" onclick="document.getElementById('importFile').click()">Replace from JSON</button>
        <button class="btn ghost wide" onclick="document.getElementById('mergeFile').click()">Merge from JSON</button>
        <input id="importFile" type="file" accept="application/json" style="display:none" onchange="importJSON(event, 'replace')">
        <input id="mergeFile" type="file" accept="application/json" style="display:none" onchange="importJSON(event, 'merge')">
      </div>
    </div>
    <div class="card">
      <div class="section-title" style="margin-top:0">Find last time</div>
      <input id="searchQ" placeholder="e.g. Huperzine A" style="width:100%;padding:10px;border:1px solid var(--line);border-radius:12px;margin-bottom:8px" oninput="searchHistory(this.value)">
      <div id="searchResults" class="hint"></div>
    </div>
    <div class="card">
      <div class="section-title" style="margin-top:0">Where the data lives</div>
      <p class="hint">Everything is stored only in this browser on this device. Your iPhone and iPad do not share a log automatically. Pick one device as home base (usually the phone). If you log on the iPad, Export JSON there, AirDrop the file, then Merge from JSON on the phone. Same file can go to the Windows PC for analysis.</p>
      <p class="hint">Blank cells are not zeros. Only an explicit “not today” or a typed 0 becomes a zero in the export.</p>
    </div>
    <div class="card">
      <button class="btn warn wide" onclick="resetDemo()">Reset to sample trackers</button>
    </div>
  `;
}

function searchHistory(q) {
  const box = document.getElementById("searchResults");
  if (!box) return;
  q = (q || "").trim().toLowerCase();
  if (!q) { box.innerHTML = ""; return; }
  const matches = state.trackers.filter((t) => t.name.toLowerCase().includes(q));
  if (!matches.length) { box.innerHTML = "No matching trackers."; return; }
  let html = "";
  matches.slice(0, 5).forEach((t) => {
    const dates = Object.keys(state.days).filter((date) => {
      const it = itemState(date, t.id);
      if (t.type === "check") {
        return Object.values(it.slots || {}).includes("done") || it.status === "done";
      }
      return it.value != null && it.value !== "";
    }).sort().reverse();
    html += `<div style="margin:8px 0"><b>${escapeHtml(t.name)}</b> · ${dates.length} logged days<br>`;
    html += dates.slice(0, 8).map((d) => `<button class="btn ghost" style="margin:2px" onclick="openDate('${d}')">${d}</button>`).join("");
    html += `</div>`;
  });
  box.innerHTML = html;
}

function openItemMenu(date, id, slotEnc) {
  const t = trackerById(id);
  const slot = decodeURIComponent(slotEnc || "");
  const title = slot ? `${t.name} · ${slot}` : t.name;
  const curDose = itemState(date, id).dose ?? "";
  openSheet(`
    <h2>${escapeHtml(title)}</h2>
    <div class="field"><label>Dose for this day (${escapeHtml(t.unit || "no unit")})</label><input id="doseInput" type="number" step="any" value="${curDose}" placeholder="optional"></div>
    <button class="btn wide" onclick="saveDose('${date}','${id}')">Save dose</button>
    <div class="action-list" style="margin-top:12px">
      <button onclick="markStatus('${date}','${id}','done','${encodeURIComponent(slot)}');closeSheet()">Mark taken</button>
      <button onclick="markStatus('${date}','${id}','skipped','${encodeURIComponent(slot)}');closeSheet()">Clear for this day only</button>
      <button onclick="markStatus('${date}','${id}',null,'${encodeURIComponent(slot)}');closeSheet()">Put back as planned</button>
      <button onclick="stopFuture('${id}');closeSheet()">Remove from all future days</button>
      <button onclick="startFuture('${id}');closeSheet()">Add to all future days</button>
      <button class="danger" onclick="closeSheet()">Cancel</button>
    </div>
    <p class="hint">Blank is not zero. Only “not today” or a typed number becomes data for analysis.</p>
  `);
}

function saveDose(date, id) {
  const raw = document.getElementById("doseInput").value;
  const dose = raw === "" ? null : Number(raw);
  setItem(date, id, { dose });
  closeSheet();
}

function markStatus(date, id, status, slotEnc) {
  setSlotStatus(date, id, decodeURIComponent(slotEnc || ""), status);
}

function stopFuture(id) {
  const t = trackerById(id);
  t.schedule = t.schedule || dailySchedule();
  t.schedule.end = todayISO();
  save();
  render();
}

function startFuture(id) {
  const t = trackerById(id);
  t.archived = false;
  t.schedule = t.schedule || dailySchedule();
  t.schedule.start = todayISO();
  t.schedule.end = null;
  save();
  render();
}

function restoreTracker(id) {
  startFuture(id);
}

function openAddToDay(date) {
  const options = state.trackers
    .filter((t) => !t.archived)
    .map((t) => `<option value="${t.id}">${escapeHtml(t.name)} (${CATEGORIES[t.category]?.name || ""})</option>`)
    .join("");
  openSheet(`
    <h2>Add to ${date}</h2>
    <div class="field">
      <label>Existing tracker</label>
      <select id="addExisting">${options}</select>
    </div>
    <button class="btn wide" onclick="addExistingToDay('${date}')">Add for this day only</button>
    <p class="hint" style="margin-top:14px">Or create something new and optionally make it a future default.</p>
    <div class="field"><label>New name</label><input id="newName" placeholder="Magnesium"></div>
    <div class="field"><label>Category</label>
      <select id="newCat">${Object.entries(CATEGORIES).map(([k,v]) => `<option value="${k}">${v.name}</option>`).join("")}</select>
    </div>
    <div class="field"><label>Unit</label><input id="newUnit" placeholder="mg"></div>
    <div class="fab-row">
      <button class="btn ghost wide" onclick="createAndAdd('${date}', false)">Only this day</button>
      <button class="btn wide" onclick="createAndAdd('${date}', true)">This day + future</button>
    </div>
  `);
}

function addExistingToDay(date) {
  const id = document.getElementById("addExisting").value;
  setItem(date, id, { oneOff: true, status: null });
  closeSheet();
}

function createAndAdd(date, future) {
  const name = (document.getElementById("newName").value || "").trim();
  if (!name) return;
  const t = makeTracker({
    id: uid(),
    name,
    unit: document.getElementById("newUnit").value.trim(),
    category: document.getElementById("newCat").value,
    schedule: future ? dailySchedule(date) : dailySchedule("9999-12-31"),
    sort: 50
  });
  if (!future) t.schedule.end = date;
  state.trackers.push(t);
  setItem(date, t.id, { oneOff: !future, status: null });
  closeSheet();
}

function openTrackerEditor(id) {
  const t = id ? trackerById(id) : makeTracker({ id: uid(), name: "", schedule: dailySchedule(todayISO()) });
  const days = (t.schedule && t.schedule.days) || [0,1,2,3,4,5,6];
  const kind = t.schedule?.kind || "daily";
  openSheet(`
    <h2>${id ? "Edit tracker" : "New tracker"}</h2>
    <div class="field"><label>Name</label><input id="tName" value="${escapeHtml(t.name)}" placeholder="Vitamin C"></div>
    <div class="field"><label>Category</label>
      <select id="tCat">${Object.entries(CATEGORIES).map(([k,v]) => `<option value="${k}" ${t.category===k?"selected":""}>${v.name}</option>`).join("")}</select>
    </div>
    <div class="field"><label>Type</label>
      <select id="tType">
        <option value="check" ${t.type==="check"?"selected":""}>Checklist item</option>
        <option value="number" ${t.type==="number"?"selected":""}>Number</option>
        <option value="scale" ${t.type==="scale"?"selected":""}>Scale</option>
      </select>
    </div>
    <div class="field"><label>Unit</label><input id="tUnit" value="${escapeHtml(t.unit)}" placeholder="mg, IU, hrs, /10"></div>
    <div class="field"><label>Min / max / step</label>
      <div class="fab-row">
        <input id="tMin" value="${t.min}" inputmode="decimal">
        <input id="tMax" value="${t.max}" inputmode="decimal">
        <input id="tStep" value="${t.step}" inputmode="decimal">
      </div>
    </div>
    <div class="field"><label>Times on one day</label><input id="tSlots" value="${escapeHtml((t.slots || []).join(", "))}" placeholder="Morning, Evening or blank"></div>
    <div class="field"><label>Schedule</label>
      <select id="tKind" onchange="document.getElementById('everyNWrap').style.display=this.value==='everyN'?'block':'none'">
        <option value="daily" ${kind==="daily"?"selected":""}>Every day</option>
        <option value="weekdays" ${kind==="weekdays"?"selected":""}>Specific weekdays</option>
        <option value="everyN" ${kind==="everyN"?"selected":""}>Every N days</option>
      </select>
    </div>
    <div id="everyNWrap" class="field" style="display:${kind==="everyN"?"block":"none"}"><label>Every</label><input id="tN" type="number" min="1" value="${t.schedule?.n || 2}"></div>
    <div class="field"><label>Print on these days</label>
      <div class="dow-picks" id="tDays">
        ${DOW_SHORT.map((label, i) => `<button type="button" class="${days.includes(i)?"on":""}" data-d="${i}" onclick="toggleDow(this)">${label}</button>`).join("")}
      </div>
    </div>
    <div class="field"><label>Start printing</label><input id="tStart" type="date" value="${t.schedule?.start || ""}"></div>
    <div class="field"><label>Stop after</label><input id="tEnd" type="date" value="${t.schedule?.end || ""}"></div>
    <div class="fab-row">
      <button class="btn wide" onclick="saveTracker('${t.id}')">Save</button>
      ${id ? `<button class="btn ghost wide" onclick="archiveTracker('${t.id}')">Stop future days</button>` : ""}
    </div>
  `);
}

function toggleDow(btn) {
  btn.classList.toggle("on");
}

function saveTracker(id) {
  const days = [...document.querySelectorAll("#tDays button.on")].map((b) => Number(b.dataset.d));
  const kind = document.getElementById("tKind").value;
  const next = {
    id,
    name: document.getElementById("tName").value.trim() || "Untitled",
    category: document.getElementById("tCat").value,
    type: document.getElementById("tType").value,
    unit: document.getElementById("tUnit").value.trim(),
    min: Number(document.getElementById("tMin").value) || 0,
    max: Number(document.getElementById("tMax").value) || 10,
    step: Number(document.getElementById("tStep").value) || 1,
    color: (trackerById(id) && trackerById(id).color) || "",
    sort: (trackerById(id) && trackerById(id).sort) || 40,
    group: "",
    slots: (document.getElementById("tSlots").value || "").split(",").map((s) => s.trim()).filter(Boolean),
    archived: false,
    schedule: {
      kind,
      days,
      n: Number(document.getElementById("tN")?.value) || 2,
      start: document.getElementById("tStart").value || null,
      end: document.getElementById("tEnd").value || null
    }
  };
  const i = state.trackers.findIndex((t) => t.id === id);
  if (i >= 0) state.trackers[i] = { ...state.trackers[i], ...next };
  else state.trackers.push(next);
  save();
  closeSheet();
  render();
}

function archiveTracker(id) {
  stopFuture(id);
  closeSheet();
}

function openEditTags() {
  const tags = (state.settings.activityTags || []).join(", ");
  openSheet(`
    <h2>Activity tags</h2>
    <div class="field"><label>Tags (comma separated)</label><textarea id="tagList" style="min-height:120px">${escapeHtml(tags)}</textarea></div>
    <button class="btn wide" onclick="saveTags()">Save tags</button>
  `);
}

function saveTags() {
  const raw = document.getElementById("tagList").value || "";
  state.settings.activityTags = raw.split(",").map((s) => s.trim()).filter(Boolean);
  save();
  closeSheet();
  render();
}

function exportJSON() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  download(blob, `papercal-${todayISO()}.json`);
}

function exportCSV() {
  const dates = new Set(Object.keys(state.days));
  let d = addDays(todayISO(), -60);
  for (let i = 0; i < 90; i++) { dates.add(d); d = addDays(d, 1); }
  const ordered = [...dates].sort();
  const trackers = state.trackers.filter((t) => !t.archived || ordered.some((day) => {
    const it = itemState(day, t.id);
    return it.status || it.value != null || (it.slots && Object.keys(it.slots).length);
  }));
  const cols = [];
  trackers.forEach((t) => {
    if (t.type === "check") {
      slotsOf(t).forEach((slot) => cols.push({ t, slot, name: slot ? `${t.name} (${slot})` : t.name }));
    } else {
      cols.push({ t, slot: "", name: t.name });
    }
  });
  const headers = ["date", "notes", "activity_tags", ...cols.map((c) => `${c.name} [${CATEGORIES[c.t.category]?.name || ""}]`)];
  const rows = [headers.join(",")];
  for (const date of ordered) {
    const rec = state.days[date] || { notes: "", items: {}, activityTags: [] };
    const cells = cols.map(({ t, slot }) => {
      if (t.type === "check") {
        const st = slotStatus(date, t.id, slot);
        if (st === "done") return "1";
        if (st === "skipped") return "0";
        return "";
      }
      const it = rec.items[t.id] || {};
      return it.value === undefined || it.value === null ? "" : it.value;
    });
    rows.push([date, csvEscape(rec.notes || ""), csvEscape((rec.activityTags || []).join("; ")), ...cells].join(","));
  }
  download(new Blob([rows.join("\n")], { type: "text/csv" }), `papercal-${todayISO()}.csv`);
}

function csvEscape(s) {
  if (/[",\n]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
  return s;
}

function download(blob, name) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

function importJSON(ev, mode) {
  const file = ev.target.files[0];
  ev.target.value = "";
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = migrate(JSON.parse(reader.result));
      if (!data.trackers || !data.days) throw new Error("Not a Papercal file");
      if (mode === "merge") {
        if (!confirm("Merge this file into the log on this device? Existing checkmarks are kept unless the file is newer.")) return;
        mergeState(data);
      } else {
        if (!confirm("Replace current data with this file?")) return;
        state = data;
      }
      save();
      render();
    } catch (e) {
      alert("Could not import: " + e.message);
    }
  };
  reader.readAsText(file);
}

function mergeItem(local, incoming) {
  const out = { ...local };
  const incomingNewer = (incoming.updatedAt || 0) >= (local.updatedAt || 0);
  if (incoming.status && (!local.status || incomingNewer)) out.status = incoming.status;
  if (incoming.value != null && (local.value == null || incomingNewer)) out.value = incoming.value;
  if (incoming.dose != null && (local.dose == null || incomingNewer)) out.dose = incoming.dose;
  if (incoming.oneOff) out.oneOff = true;
  if (incoming.slots) {
    out.slots = { ...(local.slots || {}) };
    Object.entries(incoming.slots).forEach(([k, v]) => {
      if (!out.slots[k] || incomingNewer) out.slots[k] = v;
    });
  }
  if (incomingNewer) out.updatedAt = incoming.updatedAt;
  return out;
}

function mergeState(incoming) {
  incoming.trackers.forEach((t) => {
    const i = state.trackers.findIndex((x) => x.id === t.id);
    if (i < 0) state.trackers.push(t);
    else state.trackers[i] = { ...state.trackers[i], ...t };
  });
  Object.entries(incoming.days || {}).forEach(([date, day]) => {
    const local = state.days[date];
    if (!local) {
      state.days[date] = day;
      return;
    }
    if (day.notes && (!local.notes || (day.updatedAt || 0) >= (local.updatedAt || 0))) {
      local.notes = day.notes;
    }
    if (day.activityTags && day.activityTags.length) {
      local.activityTags = [...new Set([...(local.activityTags || []), ...day.activityTags])];
    }
    local.items = local.items || {};
    Object.entries(day.items || {}).forEach(([id, item]) => {
      local.items[id] = local.items[id] ? mergeItem(local.items[id], item) : item;
    });
    local.updatedAt = Math.max(local.updatedAt || 0, day.updatedAt || 0);
  });
  if (incoming.settings?.activityTags) {
    state.settings.activityTags = [...new Set([...(state.settings.activityTags || []), ...incoming.settings.activityTags])];
  }
}

function resetDemo() {
  if (!confirm("This clears logged days on this device and restores the current default trackers.")) return;
  state = {
    trackers: DEFAULT_TRACKERS.map((t) => ({ ...t, schedule: { ...t.schedule } })),
    days: {},
    settings: {
      installedHintDismissed: state.settings.installedHintDismissed,
      dayFilter: "all",
      activityTags: [...DEFAULT_ACTIVITY_TAGS]
    }
  };
  save();
  render();
}

function render() {
  const root = document.getElementById("view");
  const title = document.getElementById("pageTitle");
  document.querySelectorAll(".nav button").forEach((b) => b.classList.toggle("active", b.dataset.view === view));
  if (view === "today") { title.textContent = "Day"; root.innerHTML = renderToday(); }
  if (view === "week") { title.textContent = "Week"; root.innerHTML = renderWeek(); }
  if (view === "month") { title.textContent = "Month"; root.innerHTML = renderMonth(); }
  if (view === "trackers") { title.textContent = "Trackers"; root.innerHTML = renderTrackers(); }
  if (view === "more") { title.textContent = "Data"; root.innerHTML = renderMore(); }
  const banner = document.getElementById("installBanner");
  const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
  if (banner) banner.style.display = (!standalone && !state.settings.installedHintDismissed && view === "today") ? "block" : "none";
}

function setView(v) {
  view = v;
  if (v === "today") selectedDate = selectedDate || todayISO();
  render();
}

function dismissInstall() {
  state.settings.installedHintDismissed = true;
  save();
  render();
}

window.cycleCheck = (date, id, slotEnc) => cycleCheck(date, trackerById(id), decodeURIComponent(slotEnc || ""));
window.checkAllSlot = checkAllSlot;
window.toggleActivityTag = toggleActivityTag;
window.shiftDay = shiftDay;
window.shiftMonth = shiftMonth;
window.shiftWeek = shiftWeek;
window.openDate = openDate;
window.openItemMenu = openItemMenu;
window.markStatus = markStatus;
window.saveDose = saveDose;
window.stopFuture = stopFuture;
window.startFuture = startFuture;
window.closeSheet = closeSheet;
window.openAddToDay = openAddToDay;
window.addExistingToDay = addExistingToDay;
window.createAndAdd = createAndAdd;
window.openTrackerEditor = openTrackerEditor;
window.toggleDow = toggleDow;
window.saveTracker = saveTracker;
window.archiveTracker = archiveTracker;
window.restoreTracker = restoreTracker;
window.updateNotes = updateNotes;
window.setItem = setItem;
window.nudge = nudge;
window.setNumber = setNumber;
window.exportJSON = exportJSON;
window.exportCSV = exportCSV;
window.importJSON = importJSON;
window.resetDemo = resetDemo;
window.setView = setView;
window.dismissInstall = dismissInstall;
window.setFilter = setFilter;
window.openEditTags = openEditTags;
window.saveTags = saveTags;
window.searchHistory = searchHistory;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("sheetBg").addEventListener("click", (e) => {
    if (e.target.id === "sheetBg") closeSheet();
  });
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
  render();
});
