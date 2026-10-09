// Event Poster (A3, Series-Design). Alles wird in Punkt-Einheiten (pt) der
// Vorlage Continents_Event_Poster_26_templ_RGB.ai (841.89 x 1190.55 pt = A3)
// gezeichnet; fuer Vorschau und Export wird nur der Skalierungsfaktor
// gewechselt. Alle Formen (Blob, Kreis, Pin, Punkte, Partner-Slots) sind aus
// den Vektordaten der .ai-Datei uebernommen, damit nichts gepixelt ist.
// Bewusst eigene Datei: app.js / post.js / timetable.js bleiben unberuehrt.

// ---- Event ----
const selectedEventId = new URLSearchParams(location.search).get("event");
const CURRENT_EVENT =
  (typeof getEventById === "function" && getEventById(selectedEventId)) ||
  (typeof EVENTS !== "undefined" ? EVENTS[0] : null);

const DISCIPLINE = CURRENT_EVENT ? CURRENT_EVENT.discipline : "lead";
const CITY_TITLE = CURRENT_EVENT ? CURRENT_EVENT.cityTitle : "WORLD CLIMBING";
const COUNTRY = CURRENT_EVENT ? CURRENT_EVENT.country : "";
const DATE_LINES = CURRENT_EVENT ? CURRENT_EVENT.dateLines : ["", ""];

// Farben der Disziplin-Woerter (Boulder/Speed aus der .ai-Datei, Lead = Lead-Teal)
const DISCIPLINE_COLORS = { boulder: "#fca903", lead: "#0395a5", speed: "#ff004a" };
const DISCIPLINE_COLOR = DISCIPLINE_COLORS[DISCIPLINE] || DISCIPLINE_COLORS.lead;
const DISCIPLINE_WORD = DISCIPLINE.toUpperCase();

const INK = "#0b1526";
const FONT_BOLD = "WorldClimbingBold"; // nur Buchstaben
const FONT_MONO = "AntarcticanMono"; // vollstaendiger Zeichensatz

// ---- Geometrie (pt) ----
const PAGE_W = 841.89;
const PAGE_H = 1190.55;

const BLOB_PATH =
  "M754.20 732.26 C719.37 801.71 690.04 861.81 655.14 882.96 L653.88 883.70 C555.97 947.73 316.00 577.86 260.23 499.80 C185.41 378.91 7.40 135.40 151.29 15.36 C216.21 -34.19 338.04 -35.32 448.74 -8.65 C597.08 26.37 741.92 110.90 818.33 246.23 C919.09 418.98 833.43 573.52 754.20 732.26 Z";
// Sichtbarer Teil des Blobs (an die Seite geschnitten) = Flaeche fuers Foto
const PHOTO_BOX = { x: 7.4, y: 0, w: PAGE_W - 7.4, h: 947.7 };

const CIRCLE_PATH =
  "M223.46 912.42 C106.58 932.32 -3.73 839.58 -15.70 724.48 C-33.59 580.42 106.56 526.15 227.82 560.61 C409.34 609.65 422.07 878.17 224.99 912.17 L223.46 912.42 Z";
const CIRCLE_COLOR = "#e2a4ff";

const PIN_PATH =
  "M48.46 614.68 C47.11 614.68 46.02 613.59 46.02 612.23 C46.02 610.89 47.11 609.80 48.46 609.80 C49.81 609.80 50.90 610.89 50.90 612.23 C50.90 613.59 49.81 614.68 48.46 614.68 M48.46 606.89 C45.43 606.89 43.14 609.38 43.14 612.20 C43.14 612.77 43.24 613.36 43.44 613.94 L48.46 628.49 L53.48 613.94 C54.67 610.49 52.11 606.89 48.46 606.89";

// Punktraster im Hintergrund
const DOTS = { x0: 23.2, dx: 27.43, nx: 30, y0: 1.5, dy: 21.99, ny: 55, r: 1.9, color: "#e6e6e6" };

// Disziplin-Wort: um 90 Grad gedreht (liest von oben nach unten), linke Spalte
const DISC_TEXT = { x: 1.1, y: -12, size: 110 };

// Info-Block im lila Kreis
const INFO = {
  pinX: 0, // Pin ist als Pfad bereits an der richtigen Stelle
  countryX: 65.3,
  countryY: 625.3,
  countrySize: 20,
  textX: 42.7,
  textY: 643.8,
  textLeading: 14.4,
  textSize: 11.5,
  textMaxW: 275,
  textMaxLines: 5,
  monthRight: 321.1,
  monthY: 794,
  monthSize: 30,
  daysY: 854,
  daysSize: 60,
  daysMaxW: 255,
};

// Ticketing unten rechts
const TICKET = {
  labelX: 744.4,
  labelY: 956.6,
  labelSize: 12,
  textX: 558.3,
  textY: 1000.4,
  textLeading: 14.4,
  textSize: 11.5,
  textMaxW: 170,
  textMaxLines: 5,
  qr: { x: 739.8, y: 969.4, size: 73.7 },
};

// Logos
const TOP_LOGO = { right: 827, top: 29, maxW: 114, maxH: 101 };
const LOCKUP = { x: 28, y: 932, h: 120, titleX: 160, titleBaseline: 1004, titleMaxW: 300, titleSize: 54 };

// Partner-Streifen
const STRIP = { y: 1071.5, color: "#e0dbc6", labelSize: 8, labelY: 1088.4, rulesY0: 1082.8, rulesY1: 1127.4 };
const BIG = { y: 1093.4, w: 48.2, h: 34 };
const SMALL = { y: 1133.9, w: 42.6, h: 28.3 };
function rowSlots(row, x0, pitch, from, to) {
  const out = [];
  for (let i = from; i <= to; i++) out.push({ x: x0 + pitch * i, y: row.y, w: row.w, h: row.h });
  return out;
}
// Reihenfolge = Reihenfolge der hochgeladenen Logos (erst obere, dann untere Reihe)
const PARTNER_GROUPS = {
  A: {
    label: "WORLD CLIMBING PARTNERS",
    labelX: 28.3,
    labelAlign: "left",
    rule: 25.8,
    slots: [...rowSlots(BIG, 28.5, 53.6, 0, 6), ...rowSlots(SMALL, 28.3, 46.77, 0, 7)],
  },
  B: {
    label: "ORGANISED MAIN PARTNERS",
    labelX: 651.3,
    labelAlign: "right",
    rule: 654.6,
    slots: [...rowSlots(BIG, 443.3, 53.6, 0, 3), ...rowSlots(SMALL, 443.2, 46.77, 0, 4)],
  },
  C: {
    label: "ORGANISER",
    labelX: 812.4,
    labelAlign: "right",
    rule: 815,
    slots: [...rowSlots(BIG, 443.3, 53.6, 4, 6), ...rowSlots(SMALL, 443.2, 46.77, 5, 7)],
  },
};

// ---- Setup ----
const canvas = document.getElementById("previewCanvas");
const ctx = canvas.getContext("2d");
const PREVIEW_K = canvas.width / PAGE_W; // 2

const stage = document.getElementById("stage");
const stageHint = document.getElementById("stageHint");
const photoInput = document.getElementById("photoInput");
const zoomRange = document.getElementById("zoomRange");
const photoControls = document.getElementById("photoControls");
const infoInput = document.getElementById("infoInput");
const ticketTextInput = document.getElementById("ticketTextInput");
const ticketUrlInput = document.getElementById("ticketUrlInput");
const downloadBtn = document.getElementById("downloadBtn");
const shareBtn = document.getElementById("shareBtn");
const shareStatus = document.getElementById("shareStatus");
const appBrowserNote = document.getElementById("appBrowserNote");
const exportInfo = document.getElementById("exportInfo");

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

function readFileAsDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

const assets = {};
let userImg = null;
let userImgNatural = { w: 0, h: 0 };
const state = { zoom: 1, panX: 0, panY: 0 };
let baseScale = 1;
const partnerLogos = { A: [], B: [], C: [] };

// ---- Foto ----
function computeBaseScale() {
  if (!userImg) return 1;
  return Math.max(PHOTO_BOX.w / userImgNatural.w, PHOTO_BOX.h / userImgNatural.h);
}

function computeImageRect() {
  const scale = baseScale * state.zoom;
  const drawW = userImgNatural.w * scale;
  const drawH = userImgNatural.h * scale;
  const cx = PHOTO_BOX.x + PHOTO_BOX.w / 2;
  const cy = PHOTO_BOX.y + PHOTO_BOX.h / 2;
  return { drawX: cx - drawW / 2 + state.panX, drawY: cy - drawH / 2 + state.panY, drawW, drawH };
}

// ---- Zeichnen (alles in pt, c = Zielkontext, k = px pro pt) ----
function fitFontOn(c, text, family, size, maxW) {
  c.font = `${size}px "${family}"`;
  if (!maxW) return size;
  const w = c.measureText(text).width;
  if (w > maxW) {
    size = Math.max(4, size * (maxW / w));
    c.font = `${size}px "${family}"`;
  }
  return size;
}

// Bricht text an Leerzeichen in Zeilen <= maxW (lange Woerter werden hart getrennt).
function wrapLines(c, text, maxW, maxLines) {
  const lines = [];
  text.split(/\r?\n/).forEach((para) => {
    let line = "";
    para.split(/\s+/).filter(Boolean).forEach((word) => {
      let w = word;
      while (c.measureText(w).width > maxW && w.length > 1) {
        // zu langes Wort: so viele Zeichen wie passen
        let n = w.length - 1;
        while (n > 1 && c.measureText(w.slice(0, n)).width > maxW) n--;
        if (line) { lines.push(line); line = ""; }
        lines.push(w.slice(0, n));
        w = w.slice(n);
      }
      const test = line ? `${line} ${w}` : w;
      if (c.measureText(test).width <= maxW) line = test;
      else { lines.push(line); line = w; }
    });
    lines.push(line);
  });
  return lines.filter((l, i) => l !== "" || i < lines.length - 1).slice(0, maxLines);
}

function drawQr(c, url, box) {
  let qr;
  try {
    qr = qrcode(0, "M");
    qr.addData(url);
    qr.make();
  } catch (e) {
    return false; // zu lang / ungueltig - QR einfach weglassen
  }
  const n = qr.getModuleCount();
  const quiet = 2;
  const unit = box.size / (n + quiet * 2);
  c.fillStyle = "#fff";
  c.fillRect(box.x, box.y, box.size, box.size);
  c.fillStyle = INK;
  for (let r = 0; r < n; r++) {
    for (let col = 0; col < n; col++) {
      if (qr.isDark(r, col)) {
        // +0.02 vermeidet haarfeine Fugen zwischen Modulen beim Skalieren
        c.fillRect(box.x + (col + quiet) * unit, box.y + (r + quiet) * unit, unit + 0.02, unit + 0.02);
      }
    }
  }
  return true;
}

function drawContained(c, img, x, y, w, h) {
  const s = Math.min(w / img.width, h / img.height);
  const dw = img.width * s;
  const dh = img.height * s;
  c.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function drawPoster(c, k, opts) {
  c.save();
  c.setTransform(k, 0, 0, k, 0, 0);
  c.clearRect(0, 0, PAGE_W, PAGE_H);
  c.textBaseline = "alphabetic";
  c.textAlign = "left";

  // Hintergrund + Punktraster
  c.fillStyle = "#fff";
  c.fillRect(0, 0, PAGE_W, PAGE_H);
  c.fillStyle = DOTS.color;
  for (let j = 0; j < DOTS.ny; j++) {
    for (let i = 0; i < DOTS.nx; i++) {
      c.beginPath();
      c.arc(DOTS.x0 + i * DOTS.dx, DOTS.y0 + j * DOTS.dy, DOTS.r, 0, Math.PI * 2);
      c.fill();
    }
  }

  // Foto im Blob
  const blob = new Path2D(BLOB_PATH);
  c.save();
  c.clip(blob);
  if (userImg) {
    const { drawX, drawY, drawW, drawH } = computeImageRect();
    c.drawImage(userImg, drawX, drawY, drawW, drawH);
  } else {
    c.fillStyle = "#ececf1";
    c.fill(blob);
  }
  c.restore();

  // Lila Kreis
  c.fillStyle = CIRCLE_COLOR;
  c.fill(new Path2D(CIRCLE_PATH));

  // Disziplin-Wort (gedreht, von oben nach unten)
  c.save();
  c.translate(DISC_TEXT.x, DISC_TEXT.y);
  c.rotate(Math.PI / 2);
  c.fillStyle = DISCIPLINE_COLOR;
  c.font = `${DISC_TEXT.size}px "${FONT_BOLD}"`;
  c.fillText(DISCIPLINE_WORD, 0, 0);
  c.restore();

  // Info im Kreis: Pin, Land, Text, Datum
  c.fillStyle = INK;
  c.fill(new Path2D(PIN_PATH));
  c.font = `${INFO.countrySize}px "${FONT_BOLD}"`;
  if (COUNTRY) c.fillText(COUNTRY.toUpperCase(), INFO.countryX, INFO.countryY);

  const info = infoInput.value.trim();
  if (info) {
    c.font = `${INFO.textSize}px "${FONT_MONO}"`;
    wrapLines(c, info, INFO.textMaxW, INFO.textMaxLines).forEach((line, i) => {
      c.fillText(line, INFO.textX, INFO.textY + i * INFO.textLeading);
    });
  }

  c.textAlign = "right";
  if (DATE_LINES[0]) {
    c.font = `${INFO.monthSize}px "${FONT_MONO}"`;
    c.fillText(DATE_LINES[0].toUpperCase(), INFO.monthRight, INFO.monthY);
  }
  if (DATE_LINES[1]) {
    fitFontOn(c, DATE_LINES[1], FONT_MONO, INFO.daysSize, INFO.daysMaxW);
    c.fillText(DATE_LINES[1], INFO.monthRight, INFO.daysY);
  }
  c.textAlign = "left";

  // Logos: oben rechts + Lockup (Logo + Stadt) unten links
  if (assets.logo) {
    const lg = assets.logo;
    const s = Math.min(TOP_LOGO.maxW / lg.width, TOP_LOGO.maxH / lg.height);
    c.drawImage(lg, TOP_LOGO.right - lg.width * s, TOP_LOGO.top, lg.width * s, lg.height * s);

    const s2 = LOCKUP.h / lg.height;
    c.drawImage(lg, LOCKUP.x, LOCKUP.y, lg.width * s2, LOCKUP.h);
  }
  c.fillStyle = INK;
  fitFontOn(c, CITY_TITLE, FONT_BOLD, LOCKUP.titleSize, LOCKUP.titleMaxW);
  c.fillText(CITY_TITLE, LOCKUP.titleX, LOCKUP.titleBaseline);

  // Ticketing
  const tText = ticketTextInput.value.trim();
  const tUrl = ticketUrlInput.value.trim();
  if (tText || tUrl) {
    c.fillStyle = INK;
    c.font = `${TICKET.labelSize}px "${FONT_MONO}"`;
    c.fillText("TICKETING", TICKET.labelX, TICKET.labelY);
  }
  if (tText) {
    c.font = `${TICKET.textSize}px "${FONT_MONO}"`;
    wrapLines(c, tText, TICKET.textMaxW, TICKET.textMaxLines).forEach((line, i) => {
      c.fillText(line, TICKET.textX, TICKET.textY + i * TICKET.textLeading);
    });
  }
  if (tUrl) drawQr(c, tUrl, TICKET.qr);

  // Partner-Streifen: Hintergrund immer, Slots/Labels nur fuer hochgeladene Logos
  c.fillStyle = STRIP.color;
  c.fillRect(0, STRIP.y, PAGE_W, PAGE_H - STRIP.y);
  Object.keys(PARTNER_GROUPS).forEach((key) => {
    const g = PARTNER_GROUPS[key];
    const logos = partnerLogos[key].slice(0, g.slots.length);
    if (!logos.length) return;
    c.fillStyle = INK;
    c.font = `${STRIP.labelSize}px "${FONT_MONO}"`;
    c.textAlign = g.labelAlign;
    c.fillText(g.label, g.labelX, STRIP.labelY);
    c.textAlign = "left";
    c.strokeStyle = INK;
    c.lineWidth = 0.5;
    c.beginPath();
    c.moveTo(g.rule, STRIP.rulesY0);
    c.lineTo(g.rule, STRIP.rulesY1);
    c.stroke();
    logos.forEach((img, i) => {
      const s = g.slots[i];
      c.fillStyle = "#fff";
      c.fillRect(s.x, s.y, s.w, s.h);
      drawContained(c, img, s.x + 3, s.y + 3, s.w - 6, s.h - 6);
    });
  });

  c.restore();
}

function render() {
  drawPoster(ctx, PREVIEW_K);
  const ready = !!userImg;
  stageHint.hidden = ready;
  downloadBtn.disabled = !ready;
  shareBtn.disabled = !ready;
}

// ---- Interaktion: Ziehen zum Verschieben (wie app.js) ----
let dragging = false;
let dragStart = { x: 0, y: 0 };
let panStart = { x: 0, y: 0 };
const activeTouches = new Map();

function ptPerPx() {
  return PAGE_W / stage.getBoundingClientRect().width;
}
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
  panStart = { x: state.panX, y: state.panY };
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
  const f = ptPerPx();
  state.panX = panStart.x + (p.x - dragStart.x) * f;
  state.panY = panStart.y + (p.y - dragStart.y) * f;
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
  state.zoom = parseFloat(zoomRange.value);
  render();
});

[infoInput, ticketTextInput, ticketUrlInput].forEach((el) => el.addEventListener("input", render));

photoInput.addEventListener("change", async () => {
  const file = photoInput.files[0];
  if (!file) return;
  const dataUrl = await readFileAsDataUrl(file);
  const img = dataUrl && (await loadImage(dataUrl));
  if (!img) return;

  userImg = img;
  userImgNatural = { w: img.naturalWidth, h: img.naturalHeight };
  baseScale = computeBaseScale();
  state.zoom = 1;
  state.panX = 0;
  state.panY = 0;
  zoomRange.value = "1";
  photoControls.hidden = false;
  render();
});

// Partner-Logos: pro Gruppe mehrere Dateien, ueberzaehlige werden ignoriert
Object.keys(PARTNER_GROUPS).forEach((key) => {
  const input = document.getElementById(`partners${key}`);
  input.addEventListener("change", async () => {
    const max = PARTNER_GROUPS[key].slots.length;
    const files = [...input.files].slice(0, max);
    const imgs = await Promise.all(
      files.map(async (f) => {
        const url = await readFileAsDataUrl(f);
        return url ? loadImage(url) : null;
      })
    );
    partnerLogos[key] = imgs.filter(Boolean);
    render();
  });
});

// ---- Export (A3 @ 300 dpi, mit Fallback auf kleinere Groessen) ----
const EXPORT_WIDTHS = [3508, 2480, 1754]; // 300 / ~212 / 150 dpi

// Rendert das Poster in einer Zielbreite; null, wenn der Browser die
// Canvas-Groesse nicht schafft (z. B. iOS-Limit ~16,7 Megapixel).
function renderToBlob(width) {
  return new Promise((resolve) => {
    const k = width / PAGE_W;
    const c = document.createElement("canvas");
    c.width = width;
    c.height = Math.round(PAGE_H * k);
    const cx = c.getContext("2d");
    if (!cx) return resolve(null);
    try {
      cx.fillStyle = "#123456";
      cx.fillRect(0, 0, 1, 1);
      if (cx.getImageData(0, 0, 1, 1).data[2] !== 0x56) return resolve(null);
      drawPoster(cx, k);
      c.toBlob((blob) => resolve(blob && blob.size > 1000 ? { blob, width } : null), "image/png");
    } catch (e) {
      resolve(null);
    }
  });
}

async function exportBlob() {
  for (const w of EXPORT_WIDTHS) {
    const res = await renderToBlob(w);
    if (res) return res;
  }
  return null;
}

function exportFileName() {
  const base = CURRENT_EVENT ? CURRENT_EVENT.cityTitle.replace(/\s+/g, "_") : "World_Climbing";
  return `${base}_Event_Poster.png`;
}

function showExportInfo(width) {
  exportInfo.textContent =
    width === EXPORT_WIDTHS[0]
      ? "Export: A3 print size (3508 × 4961 px, 300 dpi)."
      : `Export: ${width} px wide (A3, reduced because your device can't create a larger canvas).`;
}

downloadBtn.addEventListener("click", async () => {
  downloadBtn.disabled = true;
  const res = await exportBlob();
  downloadBtn.disabled = !userImg;
  if (!res) {
    showShareStatus("Could not create the image on this device. Please try another browser.");
    return;
  }
  showShareStatus("");
  showExportInfo(res.width);
  const url = URL.createObjectURL(res.blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = exportFileName();
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
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

shareBtn.addEventListener("click", async () => {
  showShareStatus("");
  shareBtn.disabled = true;
  const res = await exportBlob();
  shareBtn.disabled = !userImg;
  if (!res) {
    showShareStatus("Could not create the image. Please try again.");
    return;
  }
  showExportInfo(res.width);
  const file = new File([res.blob], exportFileName(), { type: "image/png" });
  try {
    await navigator.share({ files: [file] });
  } catch (e) {
    if (e && e.name === "AbortError") return;
    showShareStatus("Sharing isn't available here. Please use \"Download image\" or open this page in your browser.");
  }
});

// ---- Init ----
async function init() {
  assets.logo = await loadImage("assets/images/logo-generic.png");

  try {
    const [boldFace, monoFace] = await Promise.all([
      new FontFace(FONT_BOLD, `url(assets/fonts/WorldClimbing-Bold.otf)`).load(),
      new FontFace(FONT_MONO, `url(assets/fonts/AntarcticanMono-Book.ttf)`).load(),
    ]);
    document.fonts.add(boldFace);
    document.fonts.add(monoFace);
  } catch (e) {
    console.warn("Font konnte nicht geladen werden, Fallback wird genutzt.", e);
  }

  render();
}

if (isInAppBrowser()) {
  appBrowserNote.hidden = false;
}

if (CURRENT_EVENT) {
  const label = `${CURRENT_EVENT.city} World Cup – ${CURRENT_EVENT.discipline[0].toUpperCase()}${CURRENT_EVENT.discipline.slice(1)}`;
  document.getElementById("pageTitle").textContent = `${label} – Event Poster`;
  document.title = `${label} Event Poster`;
  const back = document.getElementById("backLink");
  back.href = `event.html?event=${encodeURIComponent(CURRENT_EVENT.id)}`;
  back.textContent = "← Back to event";
}

init();
