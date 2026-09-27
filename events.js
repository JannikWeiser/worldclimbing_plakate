// Shared event list used by both the event picker (index.html) and the
// poster generator (generator.html). Each event drives which colour
// scheme, city title and dates get baked into the poster.
//
// discipline must be one of: "boulder", "lead", "speed"
//   (this picks assets/images/accents-<discipline>.png)
// cityTitle is what gets drawn on the poster itself - keep it ASCII only,
//   the poster font has no accented characters.
// dateLines is exactly two lines as they appear on the poster
//   (e.g. ["June", "17th - 21st"]).
//
// Source: 2026 World Climbing Series calendar (Wikipedia). Update this
// list once the next season's calendar is announced.
const EVENTS = [
  { id: "keqiao-boulder", city: "Keqiao", country: "China", cityTitle: "KEQIAO", discipline: "boulder", dateLines: ["May", "1st - 3rd"] },
  { id: "wujiang-lead", city: "Wujiang", country: "China", cityTitle: "WUJIANG", discipline: "lead", dateLines: ["May", "8th - 10th"] },
  { id: "wujiang-speed", city: "Wujiang", country: "China", cityTitle: "WUJIANG", discipline: "speed", dateLines: ["May", "8th - 10th"] },
  { id: "bern-boulder", city: "Bern", country: "Switzerland", cityTitle: "BERN", discipline: "boulder", dateLines: ["May", "22nd - 24th"] },
  { id: "madrid-boulder", city: "Madrid", country: "Spain", cityTitle: "MADRID", discipline: "boulder", dateLines: ["May", "28th - 31st"] },
  { id: "madrid-speed", city: "Madrid", country: "Spain", cityTitle: "MADRID", discipline: "speed", dateLines: ["May", "28th - 31st"] },
  { id: "prague-boulder", city: "Prague", country: "Czechia", cityTitle: "PRAGUE", discipline: "boulder", dateLines: ["June", "3rd - 7th"] },
  { id: "prague-lead", city: "Prague", country: "Czechia", cityTitle: "PRAGUE", discipline: "lead", dateLines: ["June", "3rd - 7th"] },
  { id: "innsbruck-boulder", city: "Innsbruck", country: "Austria", cityTitle: "INNSBRUCK", discipline: "boulder", dateLines: ["June", "17th - 21st"] },
  { id: "innsbruck-lead", city: "Innsbruck", country: "Austria", cityTitle: "INNSBRUCK", discipline: "lead", dateLines: ["June", "17th - 21st"] },
  { id: "krakow-speed", city: "Kraków", country: "Poland", cityTitle: "KRAKOW", discipline: "speed", dateLines: ["July", "3rd - 5th"] },
  { id: "chamonix-speed", city: "Chamonix", country: "France", cityTitle: "CHAMONIX", discipline: "speed", dateLines: ["July", "10th - 12th"] },
  { id: "chamonix-lead", city: "Chamonix", country: "France", cityTitle: "CHAMONIX", discipline: "lead", dateLines: ["July", "10th - 12th"] },
  { id: "koper-lead", city: "Koper", country: "Slovenia", cityTitle: "KOPER", discipline: "lead", dateLines: ["September", "4th - 5th"] },
  { id: "guiyang-speed", city: "Guiyang", country: "China", cityTitle: "GUIYANG", discipline: "speed", dateLines: ["September", "11th - 13th"] },
  { id: "chongqing-speed", city: "Chongqing", country: "China", cityTitle: "CHONGQING", discipline: "speed", dateLines: ["September", "18th - 20th"] },
  { id: "saltlakecity-boulder", city: "Salt Lake City", country: "USA", cityTitle: "SALT LAKE CITY", discipline: "boulder", dateLines: ["October", "16th - 18th"] },
  { id: "santiago-speed", city: "Santiago", country: "Chile", cityTitle: "SANTIAGO", discipline: "speed", dateLines: ["October", "23rd - 25th"] },
  { id: "santiago-lead", city: "Santiago", country: "Chile", cityTitle: "SANTIAGO", discipline: "lead", dateLines: ["October", "23rd - 25th"] },
];

function getEventById(id) {
  return EVENTS.find((e) => e.id === id) || null;
}
