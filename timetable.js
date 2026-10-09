// Story-Timetable: gleiche Optik wie das Story-Poster (app.js), aber statt
// Foto-Blob steht ein vom Nutzer eingetragener Zeitplan auf dem Poster.
// Bewusst eigene Datei: app.js (Story mit Foto, Download, Share) bleibt
// unveraendert; Download/Share-Logik ist hier 1:1 nachgebaut.

// ---- Event: welches Poster wird gebaut? ----
const selectedEventId = new URLSearchParams(location.search).get("event");
const CURRENT_EVENT =
  (typeof getEventById === "function" && getEventById(selectedEventId)) ||
  (typeof EVENTS !== "undefined" ? EVENTS[0] : null);

const TITLE_TEXT = CURRENT_EVENT ? CURRENT_EVENT.cityTitle : "WORLD CLIMBING";
const DATE_LINES = CURRENT_EVENT ? CURRENT_EVENT.dateLines : ["", ""];
const DISCIPLINE = CURRENT_EVENT ? CURRENT_EVENT.discipline : "lead";
const ACCENTS_FILE = `assets/images/accents-${DISCIPLINE}.png`;
const DOMAIN_TEXT = "worldclimbing.com";
const TEXT_COLOR = "#03111F";
// Gleiche Farben wie die Disziplin-Punkte auf der Eventliste (style.css).
const DISCIPLINE_COLORS = { boulder: "#e8a020", lead: "#12777a", speed: "#e8134b" };
const ACCENT_COLOR = DISCIPLINE_COLORS[DISCIPLINE] || DISCIPLINE_COLORS.lead;

const CANVAS_W = 1080;
const CANVAS_H = 1920;

// Positionen, die vom Story-Poster uebernommen sind (siehe app.js)
const LOGO_BOX = { right: 1043, top: 35, maxW: 340, maxH: 210 };
const TITLE_POS = { x: 230, y: 430, size: 100 };
const DATE_POS = { x: 40, y: 1560, size: 65, lineHeight: 80 };
const NAME_POS = { x: 40, y: 1760, size: 65 };
const DOMAIN_POS = { x: 44, yBottom: 1420, size: 26 };

// Timetable-Bereich: unter dem Titel, ueber dem Datum
const TT = {
  x: 100, // linker Rand (rechts neben dem gedrehten Domain-Text)
  right: 1020,
  headingY: 570, // Baseline "TIMETABLE"
  headingSize: 64,
  top: 630,
  bottom: 1490,
};
const MAX_ROWS = 10;

const FONT_FAMILY = "WorldClimbingBold"; // nur Buchstaben, keine Ziffern/Satzzeichen
const DATA_FONT_FAMILY = "AntarcticanMono"; // vollstaendiger Zeichensatz

const CATEGORIES = ["", "Men", "Women", "Men & Women"];

// ---- Setup ----
const canvas = document.getElementById("previewCanvas");
const ctx = canvas.getContext("2d");
const stageHint = document.getElementById("stageHint");
const nameInput = document.getElementById("nameInput");
const rowsEl = document.getElementById("rows");
const addRowBtn = document.getElementById("addRowBtn");
const downloadBtn = document.getElementById("downloadBtn");
const shareBtn = document.getElementById("shareBtn");
const shareStatus = document.getElementById("shareStatus");
const appBrowserNote = document.getElementById("appBrowserNote");

function isInAppBrowser() {
  return /Instagram|FBAN|FBAV|FB_IAB|Line\//i.test(navigator.userAgent);
}

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

const assets = {};

// ---- Formular: Zeilen ----
function addRow(values) {
  if (rowsEl.children.length >= MAX_ROWS) return;
  const v = values || {};
  const row = document.createElement("div");
  row.className = "tt-row";

  const mk = (cls, label, el) => {
    const wrap = document.createElement("label");
    wrap.className = `tt-field ${cls}`;
    const span = document.createElement("span");
    span.textContent = label;
    wrap.append(span, el);
    return wrap;
  };

  const day = document.createElement("input");
  day.type = "text";
  day.maxLength = 20;
  day.placeholder = "e.g. Fri, May 1";
  day.dataset.key = "day";
  day.value = v.day || "";

  const time = document.createElement("input");
  time.type = "text";
  time.maxLength = 13;
  time.placeholder = "e.g. 10:00";
  time.dataset.key = "time";
  time.value = v.time || "";

  const session = document.createElement("input");
  session.type = "text";
  session.maxLength = 28;
  session.placeholder = "e.g. Qualification";
  session.dataset.key = "session";
  session.value = v.session || "";

  const cat = document.createElement("select");
  cat.dataset.key = "category";
  CATEGORIES.forEach((c) => {
    const o = document.createElement("option");
    o.value = c;
    o.textContent = c || "–";
    cat.appendChild(o);
  });
  cat.value = v.category || "";

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "tt-remove";
  remove.textContent = "Remove";
  remove.addEventListener("click", () => {
    row.remove();
    afterRowsChanged();
  });

  row.append(
    mk("tt-field--day", "Day", day),
    mk("tt-field--time", "Time", time),
    mk("tt-field--session", "Session", session),
    mk("tt-field--cat", "Category", cat),
    remove
  );
  rowsEl.appendChild(row);
  afterRowsChanged();
}

function afterRowsChanged() {
  // Mindestens eine Zeile bleibt immer stehen.
  if (rowsEl.children.length === 0) {
    addRow();
    return;
  }
  addRowBtn.disabled = rowsEl.children.length >= MAX_ROWS;
  rowsEl.querySelectorAll(".tt-remove").forEach((b) => {
    b.hidden = rowsEl.children.length === 1;
  });
  render();
}

// Liest die Formularzeilen; Zeilen ohne Zeit UND Session werden ignoriert.
function getEntries() {
  const entries = [];
  rowsEl.querySelectorAll(".tt-row").forEach((row) => {
    const get = (k) => row.querySelector(`[data-key="${k}"]`).value.trim();
    const e = { day: get("day"), time: get("time"), session: get("session"), category: get("category") };
    if (e.time || e.session) entries.push(e);
  });
  return entries;
}

rowsEl.addEventListener("input", render);
rowsEl.addEventListener("change", render);
addRowBtn.addEventListener("click", () => addRow());
nameInput.addEventListener("input", render);

// ---- Zeichnen ----
function drawLogo() {
  const logo = assets.logo;
  if (!logo) return;
  const scale = Math.min(LOGO_BOX.maxW / logo.width, LOGO_BOX.maxH / logo.height);
  const w = logo.width * scale;
  const h = logo.height * scale;
  ctx.drawImage(logo, LOGO_BOX.right - w, LOGO_BOX.top, w, h);
}

// Gruppiert die Eintraege nach Tag (in Eingabe-Reihenfolge). Ein Tagesname
// wird nur ausgegeben, wenn er sich zur vorherigen Zeile aendert.
function buildBlocks(entries) {
  const blocks = [];
  let lastDay = null;
  entries.forEach((e) => {
    const dayKey = e.day.toLowerCase();
    if (e.day && dayKey !== lastDay) {
      blocks.push({ type: "day", text: e.day });
      lastDay = dayKey;
    }
    blocks.push({ type: "row", entry: e });
  });
  return blocks;
}

// Hoehen bei Skalierung 1
const DAY_BLOCK_H = 96;
const ROW_H = 70;
const ROW_H_WITH_CAT = 106;
const ROW_GAP = 14;

function blockHeight(b) {
  if (b.type === "day") return DAY_BLOCK_H;
  return (b.entry.category ? ROW_H_WITH_CAT : ROW_H) + ROW_GAP;
}

function drawTimetable(entries) {
  const blocks = buildBlocks(entries);
  const totalH = blocks.reduce((sum, b) => sum + blockHeight(b), 0);
  const avail = TT.bottom - TT.top;
  // Passt der Zeitplan nicht in die Flaeche, wird alles gleichmaessig
  // verkleinert - nichts laeuft ueber das Datum unten hinaus.
  const s = totalH > avail ? avail / totalH : 1;

  // Zeitspalte so breit wie die breiteste Zeit (max. 410px = 13 Zeichen), Session rechts daneben.
  ctx.font = `${52 * s}px "${DATA_FONT_FAMILY}"`;
  const widest = entries.reduce((m, e) => Math.max(m, ctx.measureText(e.time).width), 0);
  const timeColW = Math.min(widest, 410 * s);
  const sessionX = TT.x + (timeColW > 0 ? timeColW + 40 * s : 0);
  const sessionMaxW = TT.right - sessionX;

  let y = TT.top;
  ctx.textBaseline = "alphabetic";
  blocks.forEach((b) => {
    if (b.type === "day") {
      ctx.fillStyle = TEXT_COLOR;
      ctx.font = `${44 * s}px "${DATA_FONT_FAMILY}"`;
      ctx.fillText(fitText(b.text.toUpperCase(), TT.right - TT.x), TT.x, y + 44 * s);
      ctx.fillStyle = ACCENT_COLOR;
      ctx.fillRect(TT.x, y + 60 * s, 90 * s, 7 * s);
      y += DAY_BLOCK_H * s;
      return;
    }
    const e = b.entry;
    ctx.fillStyle = TEXT_COLOR;
    if (e.time) {
      drawFitted(e.time, TT.x, y + 48 * s, 52 * s, timeColW);
    }
    if (e.session) {
      drawFitted(e.session.toUpperCase(), sessionX, y + 42 * s, 40 * s, sessionMaxW);
    }
    if (e.category) {
      ctx.fillStyle = ACCENT_COLOR;
      drawFitted(e.category.toUpperCase(), sessionX, y + 82 * s, 30 * s, sessionMaxW);
    }
    y += blockHeight(b) * s;
  });
}

// Setzt ctx.font passend und kuerzt NICHT; verkleinert die Schrift, bis der
// Text in maxW passt (Untergrenze 40 % - darunter wird abgeschnitten).
function drawFitted(text, x, y, size, maxW) {
  let px = size;
  ctx.font = `${px}px "${DATA_FONT_FAMILY}"`;
  const w = ctx.measureText(text).width;
  if (w > maxW && maxW > 0) {
    px = Math.max(size * 0.4, size * (maxW / w));
    ctx.font = `${px}px "${DATA_FONT_FAMILY}"`;
  }
  ctx.fillText(text, x, y);
}

// Fuer Zeit-/Tagestexte: liefert den Text selbst (Schrift ist bereits gesetzt),
// kuerzt mit "..." falls er breiter als maxW waere.
function fitText(text, maxW) {
  if (maxW <= 0 || ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + "...").width > maxW) t = t.slice(0, -1);
  return t + "...";
}

function drawTexts() {
  ctx.fillStyle = TEXT_COLOR;
  ctx.textBaseline = "alphabetic";

  const maxTitleWidth = CANVAS_W - TITLE_POS.x - 40;
  let titleSize = TITLE_POS.size;
  ctx.font = `${titleSize}px "${FONT_FAMILY}"`;
  const titleWidth = ctx.measureText(TITLE_TEXT).width;
  if (titleWidth > maxTitleWidth) {
    titleSize = Math.floor(titleSize * (maxTitleWidth / titleWidth));
    ctx.font = `${titleSize}px "${FONT_FAMILY}"`;
  }
  ctx.fillText(TITLE_TEXT, TITLE_POS.x, TITLE_POS.y);

  ctx.font = `${TT.headingSize}px "${FONT_FAMILY}"`;
  ctx.fillText("TIMETABLE", TT.x, TT.headingY);

  ctx.fillStyle = TEXT_COLOR;
  ctx.font = `${DATE_POS.size}px "${DATA_FONT_FAMILY}"`;
  DATE_LINES.forEach((line, i) => {
    ctx.fillText(line, DATE_POS.x, DATE_POS.y + i * DATE_POS.lineHeight);
  });

  const name = nameInput.value.trim();
  if (name) {
    ctx.font = `${NAME_POS.size}px "${FONT_FAMILY}"`;
    ctx.fillText(name, NAME_POS.x, NAME_POS.y);
  }

  ctx.save();
  ctx.translate(DOMAIN_POS.x, DOMAIN_POS.yBottom);
  ctx.rotate(-Math.PI / 2);
  ctx.font = `${DOMAIN_POS.size}px "${FONT_FAMILY}"`;
  ctx.fillText(DOMAIN_TEXT, 0, 0);
  ctx.restore();
}

function render() {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  if (assets.bg) ctx.drawImage(assets.bg, 0, 0, CANVAS_W, CANVAS_H);
  // Kein Chalk-Blob: der gehoert zum Foto-Poster, hier steht der Zeitplan.
  if (assets.accents) ctx.drawImage(assets.accents, 0, 0, CANVAS_W, CANVAS_H);

  drawLogo();
  drawTexts();

  const entries = getEntries();
  if (entries.length) drawTimetable(entries);

  const hasEntries = entries.length > 0;
  stageHint.hidden = hasEntries;
  downloadBtn.disabled = !hasEntries;
  shareBtn.disabled = !hasEntries;
}

// ---- Download (wie in app.js) ----
function exportFileName() {
  const fallbackName = CURRENT_EVENT ? CURRENT_EVENT.cityTitle.replace(/\s+/g, "_") : "World_Climbing";
  const namePart = nameInput.value.trim().replace(/\s+/g, "_") || fallbackName;
  return `${namePart}_Timetable_Story.png`;
}

downloadBtn.addEventListener("click", () => {
  render();
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = exportFileName();
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, "image/png");
});

// ---- Share (Web Share API, wie in app.js) ----
function canShareFiles() {
  if (!navigator.share || !navigator.canShare) return false;
  try {
    const probe = new File([new Blob([""], { type: "image/png" })], "probe.png", { type: "image/png" });
    return navigator.canShare({ files: [probe] });
  } catch (e) {
    return false;
  }
}

function showShareStatus(msg) {
  shareStatus.textContent = msg;
  shareStatus.hidden = !msg;
}

if (canShareFiles()) {
  shareBtn.hidden = false;
}

shareBtn.addEventListener("click", () => {
  showShareStatus("");
  render();
  canvas.toBlob(async (blob) => {
    if (!blob) {
      showShareStatus("Could not create the image. Please try again.");
      return;
    }
    const file = new File([blob], exportFileName(), { type: "image/png" });
    try {
      await navigator.share({ files: [file] });
    } catch (e) {
      if (e && e.name === "AbortError") return;
      showShareStatus("Sharing isn't available here. Please use \"Download image\" or open this page in your browser.");
    }
  }, "image/png");
});

// ---- Init ----
async function init() {
  const [bg, accents, logo] = await Promise.all([
    loadImage("assets/images/bg-base.png"),
    loadImage(ACCENTS_FILE),
    loadImage("assets/images/logo-generic.png"),
  ]);
  assets.bg = bg;
  assets.accents = accents;
  assets.logo = logo;

  try {
    const [titleFace, dataFace] = await Promise.all([
      new FontFace(FONT_FAMILY, `url(assets/fonts/WorldClimbing-Bold.otf)`).load(),
      new FontFace(DATA_FONT_FAMILY, `url(assets/fonts/AntarcticanMono-Book.ttf)`).load(),
    ]);
    document.fonts.add(titleFace);
    document.fonts.add(dataFace);
  } catch (e) {
    console.warn("Font konnte nicht geladen werden, Fallback wird genutzt.", e);
  }

  render();
}

if (isInAppBrowser()) {
  appBrowserNote.hidden = false;
}

if (CURRENT_EVENT) {
  const pageTitleEl = document.getElementById("pageTitle");
  const label = `${CURRENT_EVENT.city} World Cup – ${CURRENT_EVENT.discipline[0].toUpperCase()}${CURRENT_EVENT.discipline.slice(1)}`;
  if (pageTitleEl) pageTitleEl.textContent = `${label} – Story Timetable`;
  document.title = `${label} Story Timetable`;

  const back = document.getElementById("backLink");
  back.href = `event.html?event=${encodeURIComponent(CURRENT_EVENT.id)}`;
  back.textContent = "← Back to event";
}

addRow();
init();
