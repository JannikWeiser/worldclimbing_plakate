# AGENTS.md — worldclimbing_plakate

Reference doc for picking this project back up cold. If you only have this
file, you should be able to keep working without re-reading the whole repo
or git history first.

## What this is

A client-side (no backend) poster generator for World Climbing World Cup
events. Visitor picks an event from a list → uploads a photo → gets a
1080×1920 Instagram-Story PNG with their photo masked into a branded
template, in the event's discipline colour, with the right city/date baked
in. Nothing is ever uploaded anywhere — the whole image is composited in
the browser with `<canvas>` and downloaded locally.

**This is a sibling/fork of a separate, still-live project** —
`JannikWeiser/Plakatgenerator_EYCH_Augsburg` (local folder
`/Users/jannikweiser/Desktop/Claude/EYCH Plakat Generator`, live at
`plakatgenerator.comptools.cloud`). That one is a single-event, DE/EN
version for one specific event (EYCH Augsburg) and must be left alone —
it's a separate repo, separate deployment, separate git history. Changes
here never touch it and vice versa.

## Repo / deployment

- GitHub: `JannikWeiser/worldclimbing_plakate`, branch `main`, GitHub
  Pages serving from `main` root (legacy Jekyll-build Pages, not Actions).
- Live: https://jannikweiser.github.io/worldclimbing_plakate/ — no custom
  domain set up for this one (deliberately skipped so far; ask before
  adding one, see "Custom domain" note below if that changes).
- `gh repo create ... --push` sometimes gets blocked by an auto-mode
  safety classifier in this environment; if so, hand the exact command to
  the user to run themselves rather than retrying it yourself. Plain
  `git push` to an already-existing repo has generally gone through fine.
- Enabling/editing Pages settings works via `gh api` (e.g.
  `gh api -X POST repos/JannikWeiser/worldclimbing_plakate/pages -f "source[branch]=main" -f "source[path]=/"`),
  not blocked in past sessions.
- `.gitignore` excludes `*.psd`, `*.afpub`, `.DS_Store`, `.claude/` — the
  huge source design files (`Continents_Digital_Banner_template_9-16.psd`,
  `WC Storys.afpub`) live in the working directory for reference/re-export
  but are never committed.

## File map

| File | Purpose |
|---|---|
| `index.html` | Landing page: 3-step "how it works" guide + discipline filter chips + the event list. All the event-card HTML is generated client-side from `events.js`. |
| `generator.html` | The actual poster editor (photo upload, zoom/pan, text field, download). Reads `?event=<id>` from the URL. |
| `events.js` | The single source of truth for what events exist — `EVENTS` array + `getEventById()`. Loaded by both HTML pages. **This is the file to edit to add/change events.** |
| `app.js` | All canvas rendering + interaction logic for `generator.html`. Also reads `CURRENT_EVENT` from `events.js`/URL at the top. |
| `style.css` | Shared by all pages. Written mobile-first (see below). |
| `impressum.html`, `datenschutz.html` | Legal pages — **still say DAV Kletterzentrum Augsburg / EYCH-specific things, not yet genericised for this multi-event tool.** Known gap, see TODOs. |
| `assets/images/` | `bg-base.png` (white background + dot grid), `photo-mask.png` (alpha mask defining the blob the photo gets clipped into), `chalk-texture.png` (grunge overlay drawn on top of the masked photo), `accents-boulder.png` / `accents-lead.png` / `accents-speed.png` / `accents-generic.png` (the corner-blob colour accents, one per discipline — swapped at render time), `logo-generic.png` (cropped "WORLD CLIMBING" wordmark + icon only, no event-specific subtext). All 1080×1920, pre-rendered from the source PSD (see "Asset pipeline" below). |
| `assets/fonts/` | `WorldClimbing-Bold.otf`, `AntarcticanMono-Book.ttf` — see font quirk below, it's not optional which one is used where. |
| `.claude/launch.json` | Local dev server config (see "Local testing"). |

## How a poster gets rendered (`app.js`)

`render()` draws these layers onto the 1080×1920 canvas **in this order**
(later = on top):

1. `bg-base.png` (white + dot grid, full canvas)
2. The user's uploaded photo, clipped to `photo-mask.png`'s alpha shape
   (done via an offscreen canvas: draw the mask, then
   `globalCompositeOperation = "source-in"`, then draw the photo — this
   composites the photo only where the mask has alpha)
3. `chalk-texture.png` (grunge texture over the photo)
4. `accents-<discipline>.png` (the colour corner blobs — this is what
   makes Boulder gold / Lead teal / Speed red; it's drawn **after** the
   photo layer specifically because the bottom-right accent blob visually
   overlaps the bottom of the photo blob in the original design)
5. Logo (`logo-generic.png`, top-right, aspect-fit into `LOGO_BOX`)
6. Text: title (city), date (two lines), user's name/text field, and the
   rotated domain text on the left edge

### Coordinate reference (all in 1080×1920 canvas space)

These were reverse-engineered from the source PSD by sampling where the
mask/accent layers have alpha, to find clear space for text. If you move
text positions, re-check against the mask — see method below.

- `PHOTO_BOX = {x:100, y:409, w:980, h:1511}` — bounding box used for
  "cover"-fit scaling of the uploaded photo before masking (not the mask
  shape itself, just a rectangle to compute a sensible default zoom).
- `LOGO_BOX = {right:1043, top:35, maxW:340, maxH:210}` — logo is
  right/top-aligned and aspect-fit inside this box.
- `TITLE_POS = {x:230, y:430, size:100}` — city title. x=230 clears the
  top-left decorative corner blob (which only reaches x≈244 at its
  widest, around y=280). The photo mask itself doesn't start until
  y≈440, so there's effectively no width constraint from the photo —
  only from that corner blob. `drawTexts()` auto-shrinks the font size
  via `ctx.measureText` if the city name would run past
  `CANVAS_W - TITLE_POS.x - 40` (added for long names like "Salt Lake
  City" — see `events.js` entries with multi-word cities).
- `DATE_POS = {x:40, y:1560, size:65, lineHeight:80}` — two lines, drawn
  at `y` and `y + lineHeight`.
- `NAME_POS = {x:40, y:1760, size:65}` — user's own text field. Only
  drawn if non-empty.
- `DOMAIN_POS = {x:44, yBottom:1420, size:26}` — rotated -90° (reads
  bottom-to-top) via `ctx.translate` + `ctx.rotate(-Math.PI/2)`. Sits in
  a vertical gutter between the title and the date block. Both x=40
  column text (title's left margin) and this domain text share that
  left-edge gutter because the photo mask curves away from the left edge
  in the lower two-thirds of the canvas — confirmed by sampling mask
  alpha at various y values; mask's left edge doesn't reach x=40 until
  around y>1800.
- Mask/accent clearance was checked with a quick PIL script sampling
  `img.load()[x, y][3]` (alpha) at various points — if you need to move
  a text element, that's the fastest way to check it won't sit on top of
  the photo or a corner blob rather than guessing from screenshots.

### Font quirk that matters

`WorldClimbingBold` (`assets/fonts/WorldClimbing-Bold.otf`) **has no
digit glyphs and no `&`** — confirmed via `fontTools.ttLib` cmap
inspection. If you render digits in that font, the browser silently
falls back to a system font for just those characters, producing
visibly inconsistent stroke weight (this was a real bug, reported and
fixed in the sibling EYCH project's history). That's why dates use
`AntarcticanMono-Book.ttf` (`DATE_FONT_FAMILY`) instead — it has full
glyph coverage. **Don't render numbers in `FONT_FAMILY` /
`WorldClimbingBold`.** City titles and the name field are fine in it
(letters only, and lowercase maps to the same glyphs as uppercase — it's
effectively a caps-only display font).

## Event data model (`events.js`)

```js
{ id, city, country, cityTitle, discipline, dateLines }
```

- `id`: URL slug, e.g. `innsbruck-lead`. Referenced as `generator.html?event=<id>`.
- `discipline`: must be exactly `"boulder"`, `"lead"`, or `"speed"` — this
  is used to build the accents filename (`accents-${discipline}.png`) and
  the CSS class for the coloured dot on the event card
  (`event-card__dot--${discipline}`). A typo here silently breaks the
  colour (image 404s → that layer just doesn't draw, rest of the poster
  still renders).
- `cityTitle`: what's baked into the poster canvas. **Must be ASCII** —
  the poster font's glyph coverage for accented characters is unverified,
  so e.g. Kraków is `"KRAKOW"` here even though the event list UI (plain
  HTML, not canvas) shows `city: "Kraków"` correctly.
- `dateLines`: exactly two strings, rendered as two lines on the poster.
- One real-world event with multiple disciplines (e.g. Innsbruck has both
  Boulder and Lead) becomes **two separate entries** with different
  `id`/`discipline`, sharing the same city/dates.

Current list is the real **2026** World Climbing Series calendar
(sourced from Wikipedia in-session). By the time you're reading this,
most or all of it is in the past — the 2027 calendar wasn't published as
of this writing. **To add next season: just add more objects to the
`EVENTS` array, following the same shape.** Nothing else needs to change
(no other file hardcodes event data).

## Mobile-first CSS (`style.css`)

Rewritten mobile-first on request: base rules (no media query) target
narrow screens, enhancements for wider screens go in
`@media (min-width: 700px)` or `(min-width: 720px)` (not
`max-width` overrides — that was the pre-mobile-first approach and got
fully replaced).

**Real bug fixed in that pass, worth remembering:** the `.layout` CSS
Grid on `generator.html` overflowed horizontally on real phones because
a grid item's default `min-width: auto` uses its content's *intrinsic*
minimum size — and a `<canvas width="1080" height="1920">` has an
intrinsic width of 1080px regardless of any CSS `width: 100%` on it. Grid
doesn't let the column shrink below that unless you explicitly override
it. Fix: `min-width: 0` on `.editor` and `.form` (the grid children).
**If you add another grid/flex container wrapping the canvas, remember
this or it'll silently overflow on mobile only** — desktop testing won't
catch it since desktop viewports are wider than 1080 logical px worth of
column space isn't usually hit.

Other mobile-specific pieces:
- `.howto` (the 3-step guide) is a horizontally-scrollable pill row on
  mobile, becomes the 3-card grid at ≥700px. `.howto__desc` (the longer
  description text) is `display:none` on mobile, shown at ≥700px — the
  guide is icon+title only on phones to avoid pushing the event list
  below the fold.
- `.filter-bar` (All/Boulder/Lead/Speed chips) on `index.html` — pure
  client-side filtering by toggling `hidden` on `.event-card` elements
  based on `data-discipline`. Added specifically so mobile users don't
  have to scroll through all ~18 events to find their discipline.

## Instagram in-app-browser handling

Instagram's in-app WebView blocks real file downloads (`a[download]` /
blob URLs silently do nothing). History of what was tried, in case this
needs revisiting:

1. First attempt: detect Instagram via UA, show the finished image
   full-screen in a fixed-position overlay with a close button, for
   long-press-to-save. **The close button didn't reliably work inside
   real Instagram** (reported by user) — reverted.
2. Second attempt: try `navigator.share()` with the PNG as a `File`
   first (opens native share sheet), fall back to the same inline-image
   approach but in normal document flow (no `position:fixed`) if Web
   Share fails or isn't supported. Tested thoroughly (share success,
   share abort, share failure, hide button, both normal + Instagram UA)
   and worked in automated testing — but the user reported it **still
   didn't actually work when tested live in real Instagram**.
3. **Current approach (kept, don't re-add the above):** just detect
   Instagram/Facebook in-app browsers via `isInAppBrowser()` (checks UA
   for `Instagram|FBAN|FBAV|FB_IAB|Line/`) and show a static, always-
   in-normal-flow warning (`#appBrowserNote` in `generator.html`) telling
   the user to tap ⋯ → "Open in Browser". No special download-button
   behavior, no overlay, nothing that can get stuck. This is a real
   limitation of Instagram's WebView, not something fixable from inside
   the page — don't spend more time trying to route around it without
   new information (e.g. if Instagram changes their WebView policy).

## Known gaps / open TODOs

- **Impressum/Datenschutz are unchanged from the EYCH Augsburg project**
  — still list the DAV Kletterzentrum Augsburg address and mention "the
  Jugend-Europameisterschaft" specifically. Inaccurate for this
  multi-event tool. Not touched yet because it wasn't asked for; flag to
  user before assuming it's fine to ship as-is.
- **No per-event logo.** All events use the same generic "WORLD
  CLIMBING" logo (icon + wordmark, cropped from the EYCH Augsburg asset
  by dropping the bottom two lines of event-specific subtext). If a
  future request wants event- or sponsor-specific logos, that needs a
  `logo` field added per event in `events.js` plus a per-event asset.
- **Event list is mostly past-dated** (see calendar note above) —
  cosmetic/content issue, not a code issue, until 2027 calendar exists.
- **No custom domain** for this project (unlike the sibling project's
  `plakatgenerator.comptools.cloud`) — intentional, ask before setting
  one up.
- English-only, no language switcher (removed on purpose per explicit
  request — don't re-add DE without being asked).

## Local testing

`.claude/launch.json` here defines `worldclimbing-static` (port 8124).
Note: this repo's own `.claude/launch.json` config may not always be
picked up depending on which directory is the *primary* working
directory of the session — if `preview_start` with that name doesn't
serve the right files, check/add an equivalent entry in the **primary**
project's `.claude/launch.json` using
`python3 -m http.server <port> --directory "<absolute path to this folder>"`
(this is what worked in practice when this project was a secondary/
additional working directory in a session rooted at the EYCH Augsburg
folder).

When testing responsive/mobile behavior, actually resize the browser
pane to a real mobile width (e.g. 375px) rather than trusting desktop-
width testing — the grid overflow bug above was invisible until tested
at real mobile width.

## Asset pipeline (regenerating from the source PSD)

The `.psd` in this folder (`Continents_Digital_Banner_template_9-16.psd`)
is the design source (Photoshop, ~238MB, git-ignored). If assets ever
need re-exporting (e.g. a new discipline colour, a template change):

1. `python3 -m venv` + `pip install psd-tools` in a scratch dir.
2. The colour variants live in a layer group called
   `SELECT THE RIGHT COULOUR` (sic — typo in the original PSD) with
   sub-layers `Generic post`, `Boulder`, `Speed`, `Lead` — toggle
   `.visible` on exactly one, then `.composite(viewport=(0,0,1080,1920))`
   the parent group to get one `accents-<name>.png`.
3. Other layers of interest: `Background` (→ `bg-base.png`),
   `PLACE IMAGE HERE` (→ `photo-mask.png`, a shape layer used purely for
   its alpha as the clip mask), `Pic chalk` (→ `chalk-texture.png`).
4. The logo was cropped from a separately-supplied PNG
   (`Logo_WC_EYCH_Augsburg.png`, git-ignored... actually check: currently
   *not* gitignored, it's a flat asset in the repo root) using ImageMagick
   (`magick logo.png -gravity North -crop <W>x<H>+0+0 +repage -trim +repage out.png`)
   to keep just the icon + "WORLD CLIMBING" line and drop the
   event-specific subtext lines below it.
