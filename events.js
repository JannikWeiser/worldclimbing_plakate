// Shared event list used by the event picker (index.html), the format page
// (event.html) and all poster generators. Each event drives which colour
// scheme, city title and dates get baked into the poster.
//
// id          unique, used in ?event=<id>
// series      competition name WITHOUT "World Climbing" and the year, as on
//             worldclimbing.com/calendar (e.g. "Europe Youth Series")
// city        display name (diacritics fine, used in HTML only)
// country     shown on the poster (letters only - drawn in the poster font)
// year        season year (cards show it)
// discipline  one of "boulder" | "lead" | "speed"
//             (this picks assets/images/accents-<discipline>.png etc.)
//             Stops with two disciplines are two entries (e.g. zilina-lead
//             + zilina-speed) so each gets its own colour scheme.
// cityTitle   what gets drawn on the poster itself - ASCII letters and
//             spaces ONLY: the poster font has no digits, punctuation or
//             accented characters (so "St. Pölten" -> "ST POLTEN").
// dateLines   exactly two lines as printed on the poster,
//             e.g. ["June", "17th - 21st"] or ["June", "13th"].
//
// Source: worldclimbing.com/calendar, filter REGION = europe (checked
// 2026-10-20). That is the "World Climbing Europe ..." competitions
// (Series, Youth Series, Championships, Para) - NOT the World Climbing
// Series stops that merely take place in Europe (Bern, Madrid, Prague,
// Innsbruck, Krakow, Chamonix, Koper ...): the site files those under
// region "World". Update this list when the calendar changes.
const EVENTS = [
  { id: "soure-youth-series-boulder", series: "Europe Youth Series", city: "Soure", country: "Portugal", year: 2026, cityTitle: "SOURE", discipline: "boulder", dateLines: ["April", "18th - 19th"] },
  { id: "kaunas-series-boulder", series: "Europe Series", city: "Kaunas", country: "Lithuania", year: 2026, cityTitle: "KAUNAS", discipline: "boulder", dateLines: ["April", "25th - 26th"] },
  { id: "graz-youth-series-boulder", series: "Europe Youth Series", city: "Graz", country: "Austria", year: 2026, cityTitle: "GRAZ", discipline: "boulder", dateLines: ["May", "9th - 10th"] },
  { id: "liptovsky-mikulas-series-boulder", series: "Europe Series", city: "Liptovský Mikuláš", country: "Slovakia", year: 2026, cityTitle: "LIPTOVSKY MIKULAS", discipline: "boulder", dateLines: ["May", "16th - 17th"] },
  { id: "sukoro-youth-championship-boulder", series: "Europe Youth Championship", city: "Sukoró", country: "Hungary", year: 2026, cityTitle: "SUKORO", discipline: "boulder", dateLines: ["June", "11th - 14th"] },
  { id: "zakopane-youth-championship-speed", series: "Europe Youth Championship", city: "Zakopane", country: "Poland", year: 2026, cityTitle: "ZAKOPANE", discipline: "speed", dateLines: ["June", "13th"] },
  { id: "zakopane-series-speed", series: "Europe Series", city: "Zakopane", country: "Poland", year: 2026, cityTitle: "ZAKOPANE", discipline: "speed", dateLines: ["June", "14th"] },
  { id: "dornbirn-youth-series-lead", series: "Europe Youth Series", city: "Dornbirn", country: "Austria", year: 2026, cityTitle: "DORNBIRN", discipline: "lead", dateLines: ["July", "4th - 5th"] },
  { id: "barcelona-championship-boulder", series: "Europe Championship", city: "Barcelona", country: "Spain", year: 2026, cityTitle: "BARCELONA", discipline: "boulder", dateLines: ["July", "17th - 19th"] },
  { id: "barcelona-series-speed", series: "Europe Series", city: "Barcelona", country: "Spain", year: 2026, cityTitle: "BARCELONA", discipline: "speed", dateLines: ["July", "17th"] },
  { id: "st-polten-youth-series-speed", series: "Europe Youth Series", city: "St. Pölten", country: "Austria", year: 2026, cityTitle: "ST POLTEN", discipline: "speed", dateLines: ["August", "1st"] },
  { id: "st-polten-series-speed", series: "Europe Series", city: "St. Pölten", country: "Austria", year: 2026, cityTitle: "ST POLTEN", discipline: "speed", dateLines: ["August", "2nd"] },
  { id: "zilina-series-lead", series: "Europe Series", city: "Žilina", country: "Slovakia", year: 2026, cityTitle: "ZILINA", discipline: "lead", dateLines: ["August", "7th - 9th"] },
  { id: "zilina-series-speed", series: "Europe Series", city: "Žilina", country: "Slovakia", year: 2026, cityTitle: "ZILINA", discipline: "speed", dateLines: ["August", "7th - 9th"] },
  { id: "ostermundigen-series-lead", series: "Europe Series", city: "Ostermundigen", country: "Switzerland", year: 2026, cityTitle: "OSTERMUNDIGEN", discipline: "lead", dateLines: ["August", "21st - 22nd"] },
  { id: "laval-para-championship-lead", series: "Europe Para Championship", city: "Laval", country: "France", year: 2026, cityTitle: "LAVAL", discipline: "lead", dateLines: ["August", "28th - 29th"] },
  { id: "laval-championship-lead", series: "Europe Championship", city: "Laval", country: "France", year: 2026, cityTitle: "LAVAL", discipline: "lead", dateLines: ["August", "29th - 30th"] },
  { id: "laval-championship-speed", series: "Europe Championship", city: "Laval", country: "France", year: 2026, cityTitle: "LAVAL", discipline: "speed", dateLines: ["August", "29th - 30th"] },
  { id: "imst-youth-series-lead", series: "Europe Youth Series", city: "Imst", country: "Austria", year: 2026, cityTitle: "IMST", discipline: "lead", dateLines: ["September", "4th - 6th"] },
  { id: "imst-youth-series-speed", series: "Europe Youth Series", city: "Imst", country: "Austria", year: 2026, cityTitle: "IMST", discipline: "speed", dateLines: ["September", "4th - 6th"] },
  { id: "augsburg-youth-championship-lead", series: "Europe Youth Championship", city: "Augsburg", country: "Germany", year: 2026, cityTitle: "AUGSBURG", discipline: "lead", dateLines: ["September", "19th - 20th"] },
  { id: "leipzig-youth-series-speed", series: "Europe Youth Series", city: "Leipzig", country: "Germany", year: 2026, cityTitle: "LEIPZIG", discipline: "speed", dateLines: ["October", "3rd"] },
  { id: "leipzig-series-speed", series: "Europe Series", city: "Leipzig", country: "Germany", year: 2026, cityTitle: "LEIPZIG", discipline: "speed", dateLines: ["October", "4th"] },
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
