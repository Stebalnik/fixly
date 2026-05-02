import fs from "fs";
import path from "path";

const ROOT = process.cwd();

const INPUT_FILE = path.join(ROOT, "_data/raw/uscities.csv");
const OUTPUT_FILE = path.join(ROOT, "src/lib/geo/data/us-cities.seed.json");

const TARGET_STATES = new Set([
  "GA",
  "FL",
  "TX",
  "AL",
  "OR",
  "MO",
  "NC",
  "NY",
  "CO",
  "AR",
  "OH",
  "WI",
  "IL",
  "NE",
]);

const STATE_FULL = {
  GA: "Georgia",
  FL: "Florida",
  TX: "Texas",
  AL: "Alabama",
  OR: "Oregon",
  MO: "Missouri",
  NC: "North Carolina",
  NY: "New York",
  CO: "Colorado",
  AR: "Arkansas",
  OH: "Ohio",
  WI: "Wisconsin",
  IL: "Illinois",
  NE: "Nebraska",
};

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      value += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (value || row.length > 0) {
        row.push(value);
        rows.push(row);
        row = [];
        value = "";
      }
      if (char === "\r" && next === "\n") i += 1;
      continue;
    }

    value += char;
  }

  if (value || row.length > 0) {
    row.push(value);
    rows.push(row);
  }

  const [headers, ...dataRows] = rows;
  return dataRows.map((cells) => {
    const item = {};
    headers.forEach((header, index) => {
      item[header] = cells[index] ?? "";
    });
    return item;
  });
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function distanceMiles(a, b) {
  const earthRadius = 3958.8;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);

  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * earthRadius * Math.asin(Math.sqrt(h));
}

function toRad(value) {
  return (value * Math.PI) / 180;
}

function getSeoTier(row) {
  const population = Number(row.population || row.population_proper || 0);
  const ranking = Number(row.ranking || 5);

  if (ranking <= 2 || population >= 100000) return "primary";
  if (ranking <= 4 || population >= 20000) return "secondary";
  return "long-tail";
}

function getNearby(city, allCities) {
  return allCities
    .filter((item) => item.key !== city.key)
    .map((item) => ({
      city: item.city,
      distance: distanceMiles(city, item),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 6)
    .map((item) => item.city);
}

function main() {
  if (!fs.existsSync(INPUT_FILE)) {
    throw new Error(`Missing CSV file: ${INPUT_FILE}`);
  }

  const csv = fs.readFileSync(INPUT_FILE, "utf8");
  const rows = parseCsv(csv);

  const baseCities = rows
    .filter((row) => TARGET_STATES.has(row.state_id))
    .map((row) => {
      const state = row.state_id;
      const city = row.city_ascii || row.city;
      const key = slugify(city);

      return {
        key,
        city,
        state,
        stateFull: row.state_name || STATE_FULL[state],
        county: row.county_name ? `${row.county_name} County` : "",
        zip: row.zips ? row.zips.split(" ").filter(Boolean).slice(0, 12) : [],
        nearby: [],
        lat: Number(row.lat),
        lng: Number(row.lng),
        seoTier: getSeoTier(row),
      };
    })
    .filter((item) => {
      return (
        item.key &&
        item.city &&
        item.state &&
        item.stateFull &&
        Number.isFinite(item.lat) &&
        Number.isFinite(item.lng)
      );
    });

  const deduped = Array.from(
    new Map(
      baseCities.map((item) => [`${item.key}-${item.state}`, item])
    ).values()
  );

  const withNearby = deduped.map((city) => ({
    ...city,
    nearby: getNearby(city, deduped),
  }));

  withNearby.sort((a, b) => {
    if (a.state !== b.state) return a.state.localeCompare(b.state);
    return a.city.localeCompare(b.city);
  });

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(withNearby, null, 2));

  console.log(`Generated ${withNearby.length} city markets`);
  console.log(`Output: ${OUTPUT_FILE}`);
}

main();