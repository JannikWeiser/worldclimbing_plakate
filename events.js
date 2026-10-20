// Shared event list used by the event picker (index.html), the format page
// (event.html) and all poster generators. Each event drives which colour
// scheme, city title and dates get baked into the poster.
//
// id          unique, used in ?event=<id>
// series      competition name WITHOUT "World Climbing" and the year, as on
//             ifsc.results.info (e.g. "Europe Youth Series")
// city        display name (diacritics fine, used in HTML only)
// country     shown on the poster (letters only - drawn in the poster font)
// year        season year (cards show it)
// discipline  one of "boulder" | "lead" | "speed"
//             (this picks assets/images/accents-<discipline>.png etc.)
//             Stops with two disciplines are two entries (same city/dates,
//             ids ending in -lead / -speed) so each gets its own colours.
// cityTitle   what gets drawn on the poster itself - ASCII letters and
//             spaces ONLY: the poster font has no digits, punctuation or
//             accented characters (so "St. Pölten" -> "ST POLTEN").
// dateLines   exactly two lines as printed on the poster,
//             e.g. ["June", "17th - 21st"] or ["June", "13th"].
//
// Source: ifsc.results.info (season 2027 selected, read 2026-10-20).
// Rule from the user: only events FOR Europe (European competitions:
// Europe Series, Europe Youth Series, Europe Championships, Europe Youth
// Championships, European Para Championship) - NOT events that merely take
// place in Europe (World Climbing Series / Para Series stops, World
// Championships such as Brno). As of the source date that is three Europe
// Youth Series stops + the European Para Championship Geneva; add Europe
// Series / Championships here when they appear. Older lists are in git history.
const EVENTS = [
  { id: "lleida-youth-series-boulder", series: "Europe Youth Series", city: "Lleida", country: "Spain", year: 2027, cityTitle: "LLEIDA", discipline: "boulder", dateLines: ["April", "3rd - 4th"] },
  { id: "soure-youth-series-boulder", series: "Europe Youth Series", city: "Soure", country: "Portugal", year: 2027, cityTitle: "SOURE", discipline: "boulder", dateLines: ["April", "17th - 18th"] },
  { id: "mezzalombardo-youth-series-speed", series: "Europe Youth Series", city: "Mezzalombardo", country: "Italy", year: 2027, cityTitle: "MEZZALOMBARDO", discipline: "speed", dateLines: ["April", "24th"] },
  { id: "geneva-para-championship-lead", series: "European Para Championship", city: "Geneva", country: "Switzerland", year: 2027, cityTitle: "GENEVA", discipline: "lead", dateLines: ["August", "2nd - 4th"] },
];

function getEventById(id) {
  return EVENTS.find((e) => e.id === id) || null;
}

// "Europe Youth Series Soure – Boulder" (headings / page titles)
function eventLabel(e) {
  const d = e.discipline[0].toUpperCase() + e.discipline.slice(1);
  return `${e.series} ${e.city} – ${d}`;
}
