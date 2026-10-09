// ---- Event: welches Poster wird gebaut? ----
// Kommt als ?event=<id> aus der URL (siehe index.html), id schlägt in
// EVENTS (events.js) nach. Ohne oder mit unbekannter id: erstes Event
// aus der Liste als Fallback, damit die Seite nie leer/kaputt aussieht.
const selectedEventId = new URLSearchParams(location.search).get("event");
const CURRENT_EVENT =
  (typeof getEventById === "function" && getEventById(selectedEventId)) ||
  (typeof EVENTS !== "undefined" ? EVENTS[0] : null);

// ---- Feste Inhalte (hier später einfach anpassen) ----
const TITLE_TEXT = CURRENT_EVENT ? CURRENT_EVENT.cityTitle : "WORLD CLIMBING";
const DATE_LINES = CURRENT_EVENT ? CURRENT_EVENT.dateLines : ["", ""];
const ACCENTS_FILE = `assets/images/accent-series-post-${CURRENT_EVENT ? CURRENT_EVENT.discipline : "lead"}.png`;
const DOMAIN_TEXT = "worldclimbing.com";
const TEXT_COLOR = "#03111F";

const CANVAS_W = 1080;
const CANVAS_H = 1350; // 4:5 Instagram-Post (Series_Social_Media_template_3-4.psd)

// Position der Foto-Fläche (Alpha-Bounding-Box von photo-mask-series-post.png)
const PHOTO_BOX = { x: 0, y: 0, w: 845, h: 1177 };

// Logo-Box: rechts/oben ausgerichtet, Größe passt sich dem Logo-Seitenverhältnis an
const LOGO_BOX = { right: 1043, top: 29, maxW: 300, maxH: 185 };

// Textpositionen (Baseline-y) nach dem PSD-Layout "Series":
// grosse Headline (zentriert) unten, Datum + Land rechtsbuendig rechts
// neben dem Foto, eigener Text + Domain unten links.
const TITLE_POS = { centerX: 540, y: 1189, size: 244, maxW: 1026 };
const DATE_POS = { right: 1043, y: 903, size: 56, lineHeight: 62, maxW: 330 };
const INFO_POS = { right: 1043, y: 624, size: 40, lineHeight: 50, maxW: 270 };
const NAME_POS = { x: 40, y: 1285, size: 56, maxW: 520 };
const DOMAIN_POS = { x: 40, y: 1332, size: 26 };

const FONT_FAMILY = "WorldClimbingBold";
// WorldClimbingBold hat keine Ziffern/&-Zeichen, darum fürs Datum eine
// Schrift mit vollständigem Zeichensatz nutzen, statt browserseitigem
// Fallback (der uneinheitliche Strichstärken verursacht).
const DATE_FONT_FAMILY = "AntarcticanMono";

// ---- Setup ----
const canvas = document.getElementById("previewCanvas");
const ctx = canvas.getContext("2d");
const offCanvas = document.createElement("canvas");
offCanvas.width = CANVAS_W;
offCanvas.height = CANVAS_H;
const offCtx = offCanvas.getContext("2d");

const stage = document.getElementById("stage");
const stageHint = document.getElementById("stageHint");
const photoInput = document.getElementById("photoInput");
const nameInput = document.getElementById("nameInput");
const zoomRange = document.getElementById("zoomRange");
const photoControls = document.getElementById("photoControls");
const downloadBtn = document.getElementById("downloadBtn");
const shareBtn = document.getElementById("shareBtn");
const shareStatus = document.getElementById("shareStatus");
const appBrowserNote = document.getElementById("appBrowserNote");

// Instagrams (und aehnlicher In-App-Browser) blockiert echte Datei-Downloads
// (a[download] / Blob-URLs) - dagegen laesst sich nichts zuverlaessig
// umgehen. Wir zeigen dort nur einen Hinweis, im echten Browser zu oeffnen.
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

const state = {
  zoom: 1, // 1 = passgenau (cover), bis 3 = reingezoomt
  panX: 0,
  panY: 0,
};

let baseScale = 1;

function computeBaseScale() {
  if (!userImg) return 1;
  return Math.max(
    PHOTO_BOX.w / userImgNatural.w,
    PHOTO_BOX.h / userImgNatural.h
  );
}

function computeImageRect() {
  const scale = baseScale * state.zoom;
  const drawW = userImgNatural.w * scale;
  const drawH = userImgNatural.h * scale;
  const cx = PHOTO_BOX.x + PHOTO_BOX.w / 2;
  const cy = PHOTO_BOX.y + PHOTO_BOX.h / 2;
  const drawX = cx - drawW / 2 + state.panX;
  const drawY = cy - drawH / 2 + state.panY;
  return { drawX, drawY, drawW, drawH };
}

function drawLogo() {
  const logo = assets.logo;
  if (!logo) return;
  const scale = Math.min(LOGO_BOX.maxW / logo.width, LOGO_BOX.maxH / logo.height);
  const w = logo.width * scale;
  const h = logo.height * scale;
  const x = LOGO_BOX.right - w;
  const y = LOGO_BOX.top;
  ctx.drawImage(logo, x, y, w, h);
}

// Setzt die Schrift so, dass der Text in maxW passt (nur verkleinern).
function fitFont(text, family, size, maxW) {
  ctx.font = `${size}px "${family}"`;
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

  // Headline: Stadtname gross und zentriert; lange Namen ("SALT LAKE CITY")
  // werden verkleinert, damit nichts ueber den Rand laeuft.
  ctx.textAlign = "center";
  fitFont(TITLE_TEXT, FONT_FAMILY, TITLE_POS.size, TITLE_POS.maxW);
  ctx.fillText(TITLE_TEXT, TITLE_POS.centerX, TITLE_POS.y);

  // Datum + Land rechtsbuendig (Ziffern -> Mono-Schrift, siehe oben)
  ctx.textAlign = "right";
  DATE_LINES.forEach((line, i) => {
    fitFont(line, DATE_FONT_FAMILY, DATE_POS.size, DATE_POS.maxW);
    ctx.fillText(line, DATE_POS.right, DATE_POS.y + i * DATE_POS.lineHeight);
  });

  // Land: bei mehreren Woertern auf zwei Zeilen verteilt (wie "Generic info" im PSD)
  const country = CURRENT_EVENT ? CURRENT_EVENT.country : "";
  if (country) {
    const parts = country.split(" ");
    const lines = parts.length > 1 ? [parts.slice(0, -1).join(" "), parts[parts.length - 1]] : [country];
    // Untere Zeile bleibt bei y=INFO_POS.y + lineHeight; einzeilig steht sie dort.
    const startY = lines.length === 1 ? INFO_POS.y + INFO_POS.lineHeight : INFO_POS.y;
    lines.forEach((line, i) => {
      fitFont(line, DATE_FONT_FAMILY, INFO_POS.size, INFO_POS.maxW);
      ctx.fillText(line, INFO_POS.right, startY + i * INFO_POS.lineHeight);
    });
  }

  ctx.textAlign = "left";
  const name = nameInput.value.trim();
  if (name) {
    fitFont(name, FONT_FAMILY, NAME_POS.size, NAME_POS.maxW);
    ctx.fillText(name, NAME_POS.x, NAME_POS.y);
  }

  ctx.font = `${DOMAIN_POS.size}px "${FONT_FAMILY}"`;
  ctx.fillText(DOMAIN_TEXT, DOMAIN_POS.x, DOMAIN_POS.y);
}

function render() {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

  if (assets.bg) ctx.drawImage(assets.bg, 0, 0, CANVAS_W, CANVAS_H);

  if (userImg && assets.mask) {
    offCtx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    offCtx.globalCompositeOperation = "source-over";
    offCtx.drawImage(assets.mask, 0, 0, CANVAS_W, CANVAS_H);
    offCtx.globalCompositeOperation = "source-in";
    const { drawX, drawY, drawW, drawH } = computeImageRect();
    offCtx.drawImage(userImg, drawX, drawY, drawW, drawH);
    offCtx.globalCompositeOperation = "source-over";
    ctx.drawImage(offCanvas, 0, 0);
  }

  if (assets.accents) ctx.drawImage(assets.accents, 0, 0, CANVAS_W, CANVAS_H);

  drawLogo();
  drawTexts();
}

// ---- Interaktion: Ziehen zum Verschieben ----
// Maus: ein Klick+Ziehen reicht (kein Scroll-Konflikt auf dem Desktop).
// Touch: die Seite soll mit einem Finger weiter scrollbar bleiben, darum
// wird das Foto dort erst mit zwei Fingern verschoben (wie z. B. bei
// eingebetteten Karten üblich).
let dragging = false;
let dragStart = { x: 0, y: 0 };
let panStart = { x: 0, y: 0 };
const activeTouches = new Map(); // pointerId -> {x, y}

function canvasScaleFactor() {
  const rect = stage.getBoundingClientRect();
  return CANVAS_W / rect.width;
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
    // Capture ist nur ein "nice to have" (hält das Dragging auch bei
    // schnellen Bewegungen über den Rand hinaus stabil) - falls es aus
    // irgendeinem Grund fehlschlägt, soll das Verschieben trotzdem
    // funktionieren.
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
  const f = canvasScaleFactor();
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

nameInput.addEventListener("input", render);

photoInput.addEventListener("change", async () => {
  const file = photoInput.files[0];
  if (!file) return;
  const dataUrl = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
  const img = await loadImage(dataUrl);
  if (!img) return;

  userImg = img;
  userImgNatural = { w: img.naturalWidth, h: img.naturalHeight };
  baseScale = computeBaseScale();
  state.zoom = 1;
  state.panX = 0;
  state.panY = 0;
  zoomRange.value = "1";

  stageHint.hidden = true;
  photoControls.hidden = false;
  downloadBtn.disabled = false;
  shareBtn.disabled = false;

  render();
});

downloadBtn.addEventListener("click", () => {
  render();
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const fallbackName = CURRENT_EVENT ? CURRENT_EVENT.cityTitle.replace(/\s+/g, "_") : "World_Climbing";
    const namePart = nameInput.value.trim().replace(/\s+/g, "_") || fallbackName;
    a.href = url;
    a.download = `${namePart}_Post.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, "image/png");
});

// ---- Share (Web Share API) ----
// Zusaetzlicher Button, der den Download-Button NICHT ersetzt. Nur sichtbar,
// wenn der Browser das Teilen von Dateien wirklich unterstuetzt. Kein Overlay,
// kein fixed-Element: Bei Fehlern erscheint nur eine Textzeile.
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
    const fallbackName = CURRENT_EVENT ? CURRENT_EVENT.cityTitle.replace(/\s+/g, "_") : "World_Climbing";
    const namePart = nameInput.value.trim().replace(/\s+/g, "_") || fallbackName;
    const file = new File([blob], `${namePart}_Post.png`, { type: "image/png" });
    try {
      await navigator.share({ files: [file] });
    } catch (e) {
      // AbortError = Nutzer hat das Teilen-Menue selbst geschlossen: kein Fehler.
      if (e && e.name === "AbortError") return;
      showShareStatus("Sharing isn't available here. Please use \"Download image\" or open this page in your browser.");
    }
  }, "image/png");
});

// ---- Init ----
async function init() {
  const [bg, mask, accents, logo] = await Promise.all([
    loadImage("assets/images/bg-series-post.png"),
    loadImage("assets/images/photo-mask-series-post.png"),
    loadImage(ACCENTS_FILE),
    loadImage("assets/images/logo-generic.png"),
  ]);
  assets.bg = bg;
  assets.mask = mask;
  assets.accents = accents;
  assets.logo = logo;

  try {
    const [titleFace, dateFace] = await Promise.all([
      new FontFace(FONT_FAMILY, `url(assets/fonts/WorldClimbing-Bold.otf)`).load(),
      new FontFace(DATE_FONT_FAMILY, `url(assets/fonts/AntarcticanMono-Book.ttf)`).load(),
    ]);
    document.fonts.add(titleFace);
    document.fonts.add(dateFace);
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
  if (pageTitleEl) pageTitleEl.textContent = `${label} – Post`;
  document.title = `${label} Post Generator`;
}

init();
