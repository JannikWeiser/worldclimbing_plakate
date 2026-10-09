// Timetable (Story 9:16 oder Post 3:4, per ?format=story|post): gleiche Optik
// wie das Foto-Poster (app.js / post.js), aber statt Foto-Blob steht ein vom
// Nutzer eingetragener Zeitplan auf dem Poster. Optional kann ein Foto in einem
// kleineren Blob daneben stehen (dann wird der Zeitplan schmaler).
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
// ---- Format: Story (1080x1920) oder Post (1080x1440) ----
// Positionen der Story stammen aus app.js, die des Posts aus post.js /
// Continents_Digital_Banner_template_3-4.psd; Timetable-Bereich (TT) ist
// jeweils ein eigener Entwurf.
const FORMATS = {
  story: {
    label: "Story",
    w: 1080,
    h: 1920,
    accentsPrefix: "accents",
    bg: "assets/images/bg-base.png",
    logoBox: { right: 1043, top: 35, maxW: 340, maxH: 210 },
    title: { x: 230, y: 430, size: 100 },
    date: { x: 40, y: 1560, size: 65, lineHeight: 80 },
    name: { x: 40, y: 1760, size: 65 },
    domain: { x: 44, yBottom: 1420, size: 26 },
    tt: { x: 100, right: 1020, headingY: 570, headingSize: 64, top: 630, bottom: 1490 },
    // Foto-Blob rechts neben dem Zeitplan; bis narrowUntil ist der Zeitplan nur bis narrowRight breit
    photo: { dest: { x: 650, y: 560, w: 400, h: 478 }, narrowRight: 610, narrowUntil: 1060 },
  },
  // Series-Design (Series_Social_Media_template_3-4.psd, 1080x1350 = 4:5).
  // Gross-Headline unten, Datum rechtsbuendig rechts, Zeitplan oben links.
  post: {
    label: "Post",
    w: 1080,
    h: 1350,
    accentsPrefix: "accent-series-post",
    bg: "assets/images/bg-series-post.png",
    logoBox: { right: 1043, top: 29, maxW: 300, maxH: 185 },
    title: { centerX: 540, y: 1189, size: 244, maxW: 1026 },
    date: { right: 1043, y: 903, size: 56, lineHeight: 62, maxW: 330 },
    name: { x: 40, y: 1285, size: 56, maxW: 520 },
    domain: { x: 40, y: 1332, size: 26, rotate: false },
    tt: { x: 60, right: 1020, headingY: 135, headingSize: 64, top: 235, bottom: 1000, rightLow: { y: 830, x: 710 } },
    photo: { dest: { x: 660, y: 240, w: 380, h: 454 }, narrowRight: 630, narrowUntil: 710 },
  },
};
const formatParam = new URLSearchParams(location.search).get("format");
const FORMAT_KEY = formatParam === "post" ? "post" : "story";
const FMT = FORMATS[FORMAT_KEY];
const PHOTO = FMT.photo;

// Vollstaendiger Blob aus dem Event-Poster (.ai), siehe eventposter.js;
// tatsaechliche Ausdehnung ca. x 96.8-864.1, y -26.0-891.1
const BLOB_PATH =
  "M754.20 732.26 C719.37 801.71 690.04 861.81 655.14 882.96 L653.88 883.70 C555.97 947.73 316.00 577.86 260.23 499.80 C185.41 378.91 7.40 135.40 151.29 15.36 C216.21 -34.19 338.04 -35.32 448.74 -8.65 C597.08 26.37 741.92 110.90 818.33 246.23 C919.09 418.98 833.43 573.52 754.20 732.26 Z";
const BLOB_BBOX = { x: 96.8, y: -26.0, w: 767.3, h: 917.1 };

const ACCENTS_FILE = `assets/images/${FMT.accentsPrefix}-${DISCIPLINE}.png`;
const DOMAIN_TEXT = "worldclimbing.com";
const TEXT_COLOR = "#03111F";
// Gleiche Farben wie die Disziplin-Punkte auf der Eventliste (style.css).
const DISCIPLINE_COLORS = { boulder: "#e8a020", lead: "#12777a", speed: "#e8134b" };
const ACCENT_COLOR = DISCIPLINE_COLORS[DISCIPLINE] || DISCIPLINE_COLORS.lead;

const CANVAS_W = FMT.w;
const CANVAS_H = FMT.h;

const LOGO_BOX = FMT.logoBox;
const TITLE_POS = FMT.title;
const DATE_POS = FMT.date;
const NAME_POS = FMT.name;
const DOMAIN_POS = FMT.domain;

// Timetable-Bereich: unter dem Titel, ueber dem Datum
const TT = FMT.tt;
const MAX_ROWS = 10;

const FONT_FAMILY = "WorldClimbingBold"; // nur Buchstaben, keine Ziffern/Satzzeichen
const DATA_FONT_FAMILY = "AntarcticanMono"; // vollstaendiger Zeichensatz

// Startklassen (Vorgabe des Nutzers): Men, Women sowie U17/U19/U21 jeweils
// fuer Men, Women und Women and Men. Der Text wird 1:1 aufs Plakat gesetzt.
const START_CLASSES = [
  { label: "Elite", options: ["Men", "Women"] },
  ...["U17", "U19", "U21"].map((u) => ({
    label: u,
    options: [`${u} Men`, `${u} Women`, `${u} Women and Men`],
  })),
];

// ---- Setup ----
const canvas = document.getElementById("previewCanvas");
const ctx = canvas.getContext("2d");
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;
document.getElementById("stage").style.aspectRatio = `${CANVAS_W} / ${CANVAS_H}`;
const stageHint = document.getElementById("stageHint");
const nameInput = document.getElementById("nameInput");
const rowsEl = document.getElementById("rows");
const addRowBtn = document.getElementById("addRowBtn");
const stage = document.getElementById("stage");
const photoInput = document.getElementById("photoInput");
const photoControls = document.getElementById("photoControls");
const zoomRange = document.getElementById("zoomRange");
const removePhotoBtn = document.getElementById("removePhotoBtn");
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
let userImg = null;
let userImgNatural = { w: 0, h: 0 };
const photoState = { zoom: 1, panX: 0, panY: 0 };
let baseScale = 1;

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
  const none = document.createElement("option");
  none.value = "";
  none.textContent = "–";
  cat.appendChild(none);
  START_CLASSES.forEach((g) => {
    const og = document.createElement("optgroup");
    og.label = g.label;
    g.options.forEach((name) => {
      const o = document.createElement("option");
      o.value = name;
      o.textContent = name;
      og.appendChild(o);
    });
    cat.appendChild(og);
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
    mk("tt-field--cat", "Start class", cat),
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
  // Mit Foto ist der Zeitplan schmaler: Zeitspalte hoechstens 40 % der Breite.
const narrowW = userImg ? PHOTO.narrowRight - TT.x : TT.right - TT.x;
  const timeColW = Math.min(widest, 410 * s, narrowW * 0.4);
  // Alle Zeiten gleich gross: ist die breiteste zu breit, schrumpfen alle gemeinsam.
  const timeSize = widest > timeColW ? 52 * s * (timeColW / widest) : 52 * s;
  const sessionX = TT.x + (timeColW > 0 ? timeColW + 40 * s : 0);

  // Rechter Rand je Hoehe: Beim Post (Series) stehen unten rechts Datum und
  // Akzent-Blob - ab TT.rightLow.y rueckt der Zeitplan deshalb nach links.
  const rightEdgeAt = (yy) => {
    if (userImg && yy < PHOTO.narrowUntil) return PHOTO.narrowRight;
    return TT.rightLow && yy >= TT.rightLow.y ? TT.rightLow.x : TT.right;
  };

  let y = TT.top;
  ctx.textBaseline = "alphabetic";
  blocks.forEach((b) => {
    if (b.type === "day") {
      ctx.fillStyle = TEXT_COLOR;
      ctx.font = `${44 * s}px "${DATA_FONT_FAMILY}"`;
      ctx.fillText(fitText(b.text.toUpperCase(), rightEdgeAt(y + 44 * s) - TT.x), TT.x, y + 44 * s);
      ctx.fillStyle = ACCENT_COLOR;
      ctx.fillRect(TT.x, y + 60 * s, 90 * s, 7 * s);
      y += DAY_BLOCK_H * s;
      return;
    }
    const e = b.entry;
    const sessionMaxW = rightEdgeAt(y + 82 * s) - sessionX;
    ctx.fillStyle = TEXT_COLOR;
    if (e.time) {
      ctx.font = `${timeSize}px "${DATA_FONT_FAMILY}"`;
      ctx.fillText(e.time, TT.x, y + 48 * s);
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

// Setzt ctx.font so, dass text in maxW passt (nur verkleinern); ohne maxW unveraendert.
function fitFont(text, family, size, maxW) {
  ctx.font = `${size}px "${family}"`;
  if (!maxW) return size;
  const w = ctx.measureText(text).width;
  if (w > maxW) {
    size = Math.max(10, Math.floor(size * (maxW / w)));
    ctx.font = `${size}px "${family}"`;
  }
  return size;
}

function drawTexts() {
  ctx.fillStyle = TEXT_COLOR;
  ctx.textBaseline = "alphabetic";

  // Titel: Story links oben (x/y), Post (Series) zentrierte Gross-Headline.
  if (TITLE_POS.centerX !== undefined) {
    ctx.textAlign = "center";
    fitFont(TITLE_TEXT, FONT_FAMILY, TITLE_POS.size, TITLE_POS.maxW);
    ctx.fillText(TITLE_TEXT, TITLE_POS.centerX, TITLE_POS.y);
  } else {
    ctx.textAlign = "left";
    fitFont(TITLE_TEXT, FONT_FAMILY, TITLE_POS.size, CANVAS_W - TITLE_POS.x - 40);
    ctx.fillText(TITLE_TEXT, TITLE_POS.x, TITLE_POS.y);
  }

  ctx.textAlign = "left";
  ctx.font = `${TT.headingSize}px "${FONT_FAMILY}"`;
  ctx.fillText("TIMETABLE", TT.x, TT.headingY);

  // Datum: Story linksbuendig, Post rechtsbuendig (x = DATE_POS.right)
  const dateRight = DATE_POS.right !== undefined;
  ctx.textAlign = dateRight ? "right" : "left";
  DATE_LINES.forEach((line, i) => {
    fitFont(line, DATA_FONT_FAMILY, DATE_POS.size, DATE_POS.maxW);
    ctx.fillText(line, dateRight ? DATE_POS.right : DATE_POS.x, DATE_POS.y + i * DATE_POS.lineHeight);
  });
  ctx.textAlign = "left";

  const name = nameInput.value.trim();
  if (name) {
    fitFont(name, FONT_FAMILY, NAME_POS.size, NAME_POS.maxW);
    ctx.fillText(name, NAME_POS.x, NAME_POS.y);
  }

  if (DOMAIN_POS.rotate === false) {
    ctx.font = `${DOMAIN_POS.size}px "${FONT_FAMILY}"`;
    ctx.fillText(DOMAIN_TEXT, DOMAIN_POS.x, DOMAIN_POS.y);
  } else {
    ctx.save();
    ctx.translate(DOMAIN_POS.x, DOMAIN_POS.yBottom);
    ctx.rotate(-Math.PI / 2);
    ctx.font = `${DOMAIN_POS.size}px "${FONT_FAMILY}"`;
    ctx.fillText(DOMAIN_TEXT, 0, 0);
    ctx.restore();
  }
}

function render() {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  if (assets.bg) ctx.drawImage(assets.bg, 0, 0, CANVAS_W, CANVAS_H);
  // Kein Chalk-Blob: der gehoert zum Foto-Poster, hier steht der Zeitplan.
  drawPhotoBlob();
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

// ---- Optionales Foto im kleinen Blob ----
function computeBaseScale() {
  if (!userImg) return 1;
  return Math.max(PHOTO.dest.w / userImgNatural.w, PHOTO.dest.h / userImgNatural.h);
}

function drawPhotoBlob() {
  if (!userImg) return;
  const d = PHOTO.dest;
  const sc = d.w / BLOB_BBOX.w;
  ctx.save();
  ctx.translate(d.x - BLOB_BBOX.x * sc, d.y - BLOB_BBOX.y * sc);
  ctx.scale(sc, sc);
  ctx.clip(new Path2D(BLOB_PATH));
  // Clip bleibt im Geraeteraum bestehen - ab hier in Canvas-Koordinaten zeichnen
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const scale = baseScale * photoState.zoom;
  const w = userImgNatural.w * scale;
  const h = userImgNatural.h * scale;
  const cx = d.x + d.w / 2 + photoState.panX;
  const cy = d.y + d.h / 2 + photoState.panY;
  ctx.drawImage(userImg, cx - w / 2, cy - h / 2, w, h);
  ctx.restore();
}

// Ziehen: Maus mit einem Klick, Touch mit zwei Fingern (ein Finger scrollt die Seite)
let dragging = false;
let dragStart = { x: 0, y: 0 };
let panStart = { x: 0, y: 0 };
const activeTouches = new Map();

function pointerPos(evt) {
  return { x: evt.clientX, y: evt.clientY };
}
function touchCentroid() {
  const pts = [...activeTouches.values()];
  const sum = pts.reduce((a, p) => ({ x: a.x + p.x, y: a.y + p.y }), { x: 0, y: 0 });
  return { x: sum.x / pts.length, y: sum.y / pts.length };
}
function startDrag(pos) {
  dragging = true;
  dragStart = pos;
  panStart = { x: photoState.panX, y: photoState.panY };
}
function tryCapture(pointerId) {
  try {
    stage.setPointerCapture(pointerId);
  } catch (e) {
    // nice to have - Verschieben soll auch ohne Capture funktionieren
  }
}

stage.addEventListener("pointerdown", (evt) => {
  if (!userImg) return;
  if (evt.pointerType === "touch") {
    activeTouches.set(evt.pointerId, pointerPos(evt));
    if (activeTouches.size === 2) {
      tryCapture(evt.pointerId);
      startDrag(touchCentroid());
    }
    return;
  }
  tryCapture(evt.pointerId);
  startDrag(pointerPos(evt));
});

stage.addEventListener("pointermove", (evt) => {
  if (evt.pointerType === "touch") {
    if (!activeTouches.has(evt.pointerId)) return;
    activeTouches.set(evt.pointerId, pointerPos(evt));
    if (activeTouches.size < 2 || !dragging) return;
    evt.preventDefault();
  }
  if (!dragging) return;
  const p = evt.pointerType === "touch" ? touchCentroid() : pointerPos(evt);
  const f = CANVAS_W / stage.getBoundingClientRect().width;
  photoState.panX = panStart.x + (p.x - dragStart.x) * f;
  photoState.panY = panStart.y + (p.y - dragStart.y) * f;
  render();
});

function endDrag(evt) {
  if (evt.pointerType === "touch") {
    activeTouches.delete(evt.pointerId);
    if (activeTouches.size < 2) dragging = false;
    return;
  }
  dragging = false;
}
stage.addEventListener("pointerup", endDrag);
stage.addEventListener("pointercancel", endDrag);
stage.addEventListener("pointerleave", endDrag);

zoomRange.addEventListener("input", () => {
  photoState.zoom = parseFloat(zoomRange.value);
  render();
});

photoInput.addEventListener("change", async () => {
  const file = photoInput.files[0];
  if (!file) return;
  const dataUrl = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
  const img = dataUrl && (await loadImage(dataUrl));
  if (!img) return;

  userImg = img;
  userImgNatural = { w: img.naturalWidth, h: img.naturalHeight };
  baseScale = computeBaseScale();
  photoState.zoom = 1;
  photoState.panX = 0;
  photoState.panY = 0;
  zoomRange.value = "1";
  photoControls.hidden = false;
  render();
});

removePhotoBtn.addEventListener("click", () => {
  userImg = null;
  photoInput.value = "";
  photoControls.hidden = true;
  render();
});

// ---- Download (wie in app.js) ----
function exportFileName() {
  const fallbackName = CURRENT_EVENT ? CURRENT_EVENT.cityTitle.replace(/\s+/g, "_") : "World_Climbing";
  const namePart = nameInput.value.trim().replace(/\s+/g, "_") || fallbackName;
  return `${namePart}_Timetable_${FMT.label}.png`;
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
    loadImage(FMT.bg),
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
  if (pageTitleEl) pageTitleEl.textContent = `${label} – ${FMT.label} Timetable`;
  document.title = `${label} ${FMT.label} Timetable`;

  const back = document.getElementById("backLink");
  back.href = `event.html?event=${encodeURIComponent(CURRENT_EVENT.id)}`;
  back.textContent = "← Back to event";
}

addRow();
init();
