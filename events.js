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
// Source: "World Climbing Europe releases 2027 calendar" (worldclimbing.com
// news, 2026-10-27) - Europe Youth Series, Europe Series, Europe Youth
// Championships and the Europe Para Championship; 25 of the announced 26
// events (the Boulder Europe Youth Championship isn't dated yet - add it
// when it is). Notes on the source: some single-day events are written
// "24 - April" in the table (taken as one day); "Liptovsky" and
// "Vendespace" are copied as published; "Toulouse/ Tournefeuille" is shown
// as Toulouse. Older lists are in git history.
const EVENTS = [
  { id: "lleida-youth-series-boulder", series: "Europe Youth Series", city: "Lleida", country: "Spain", year: 2027, cityTitle: "LLEIDA", discipline: "boulder", dateLines: ["April", "3rd - 4th"] },
  { id: "soure-youth-series-boulder", series: "Europe Youth Series", city: "Soure", country: "Portugal", year: 2027, cityTitle: "SOURE", discipline: "boulder", dateLines: ["April", "17th - 18th"] },
  { id: "mezzalombardo-youth-series-speed", series: "Europe Youth Series", city: "Mezzalombardo", country: "Italy", year: 2027, cityTitle: "MEZZALOMBARDO", discipline: "speed", dateLines: ["April", "24th"] },
  { id: "mezzalombardo-series-speed", series: "Europe Series", city: "Mezzalombardo", country: "Italy", year: 2027, cityTitle: "MEZZALOMBARDO", discipline: "speed", dateLines: ["April", "25th"] },
  { id: "gothenburg-series-boulder", series: "Europe Series", city: "Gothenburg", country: "Sweden", year: 2027, cityTitle: "GOTHENBURG", discipline: "boulder", dateLines: ["May", "1st - 2nd"] },
  { id: "nieuwegein-series-lead", series: "Europe Series", city: "Nieuwegein", country: "Netherlands", year: 2027, cityTitle: "NIEUWEGEIN", discipline: "lead", dateLines: ["May", "8th - 9th"] },
  { id: "vienna-series-boulder", series: "Europe Series", city: "Vienna", country: "Austria", year: 2027, cityTitle: "VIENNA", discipline: "boulder", dateLines: ["May", "15th - 16th"] },
  { id: "liptovsky-series-boulder", series: "Europe Series", city: "Liptovský", country: "Slovakia", year: 2027, cityTitle: "LIPTOVSKY", discipline: "boulder", dateLines: ["May", "22nd - 23rd"] },
  { id: "duisburg-youth-series-speed", series: "Europe Youth Series", city: "Duisburg", country: "Germany", year: 2027, cityTitle: "DUISBURG", discipline: "speed", dateLines: ["May", "29th"] },
  { id: "duisburg-series-speed", series: "Europe Series", city: "Duisburg", country: "Germany", year: 2027, cityTitle: "DUISBURG", discipline: "speed", dateLines: ["May", "30th"] },
  { id: "bucharest-youth-series-boulder", series: "Europe Youth Series", city: "Bucharest", country: "Romania", year: 2027, cityTitle: "BUCHAREST", discipline: "boulder", dateLines: ["June", "5th - 6th"] },
  { id: "vendespace-series-boulder", series: "Europe Series", city: "Vendespace", country: "France", year: 2027, cityTitle: "VENDESPACE", discipline: "boulder", dateLines: ["July", "2nd - 3rd"] },
  { id: "bytom-series-speed", series: "Europe Series", city: "Bytom", country: "Poland", year: 2027, cityTitle: "BYTOM", discipline: "speed", dateLines: ["July", "16th - 18th"] },
  { id: "graz-youth-series-lead", series: "Europe Youth Series", city: "Graz", country: "Austria", year: 2027, cityTitle: "GRAZ", discipline: "lead", dateLines: ["July", "17th - 18th"] },
  { id: "geneva-para-championship-lead", series: "Europe Para Championship", city: "Geneva", country: "Switzerland", year: 2027, cityTitle: "GENEVA", discipline: "lead", dateLines: ["August", "2nd - 4th"] },
  { id: "zilina-series-speed", series: "Europe Series", city: "Žilina", country: "Slovakia", year: 2027, cityTitle: "ZILINA", discipline: "speed", dateLines: ["August", "7th"] },
  { id: "zilina-series-lead", series: "Europe Series", city: "Žilina", country: "Slovakia", year: 2027, cityTitle: "ZILINA", discipline: "lead", dateLines: ["August", "7th - 8th"] },
  { id: "ostermundigen-series-lead", series: "Europe Series", city: "Ostermundigen", country: "Switzerland", year: 2027, cityTitle: "OSTERMUNDIGEN", discipline: "lead", dateLines: ["August", "27th - 28th"] },
  { id: "bergen-youth-series-lead", series: "Europe Youth Series", city: "Bergen", country: "Norway", year: 2027, cityTitle: "BERGEN", discipline: "lead", dateLines: ["September", "4th - 5th"] },
  { id: "imst-youth-series-lead", series: "Europe Youth Series", city: "Imst", country: "Austria", year: 2027, cityTitle: "IMST", discipline: "lead", dateLines: ["September", "11th - 12th"] },
  { id: "augsburg-youth-championship-lead", series: "Europe Youth Championship", city: "Augsburg", country: "Germany", year: 2027, cityTitle: "AUGSBURG", discipline: "lead", dateLines: ["September", "25th - 26th"] },
  { id: "slovenska-bistrica-youth-series-speed", series: "Europe Youth Series", city: "Slovenska Bistrica", country: "Slovenia", year: 2027, cityTitle: "SLOVENSKA BISTRICA", discipline: "speed", dateLines: ["September", "25th"] },
  { id: "leipzig-youth-championship-speed", series: "Europe Youth Championship", city: "Leipzig", country: "Germany", year: 2027, cityTitle: "LEIPZIG", discipline: "speed", dateLines: ["October", "2nd - 3rd"] },
  { id: "toulouse-youth-series-speed", series: "Europe Youth Series", city: "Toulouse", country: "France", year: 2027, cityTitle: "TOULOUSE", discipline: "speed", dateLines: ["October", "29th"] },
  { id: "toulouse-series-speed", series: "Europe Series", city: "Toulouse", country: "France", year: 2027, cityTitle: "TOULOUSE", discipline: "speed", dateLines: ["October", "30th"] },
];

function getEventById(id) {
  return EVENTS.find((e) => e.id === id) || null;
}

// "Europe Youth Series Soure – Boulder" (headings / page titles)
function eventLabel(e) {
  const d = e.discipline[0].toUpperCase() + e.discipline.slice(1);
  return `${e.series} ${e.city} – ${d}`;
}
