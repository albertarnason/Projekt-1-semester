const width = window.innerWidth;
const height = window.innerHeight;

const svg = d3
  .select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Hent elementet med id 'toggle' (checkboxen)
const toggle = document.getElementById("toggle");

// Hent elementet med id 'thumbText' (den bevægelige tekst i slideren)
const thumbText = document.getElementById("thumbText");

// Lyt efter ændringer på 'toggle'-input (når checkboxen bliver ændret)
toggle.addEventListener("change", function () {
  // Hvis checkboxen er checked (slideren er til højre eller venstre)
  if (this.checked) {
    thumbText.textContent = "Produktion"; // Sætter teksten i slideren til "Produktion"
    produktion_or_sale = "produktion";
    if (buttonyear == 2024) {
      worldstate = produktion2024;
    } else {
      worldstate = produktion2025;
    }
  } else {
    thumbText.textContent = "Salg"; // Sætter teksten i slideren til "Salg"
    produktion_or_sale = "salg";
    if (buttonyear == 2024) {
      worldstate = salg2024;
    } else {
      worldstate = salg2025;
    }
  }
  updateData(worldstate);
});

const buttons = document.querySelectorAll(".yearButtons button");

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    // Fjern 'active' fra alle knapper
    buttons.forEach((b) => b.classList.remove("active"));
    // Tilføj 'active' til den klikkede
    btn.classList.add("active");

    // Sæt buttonYear til det tal, der står i data-year
    buttonyear = parseInt(btn.dataset.year, 10);
    //console.log('Valgt år:', buttonYear);

    // Her kan du nu viderebehandle buttonYear,
    // f.eks. opdatere en graf, lave et API-kald osv.
    if (buttonyear == 2024 && produktion_or_sale == "salg") {
      worldstate = salg2024;
    } else if (buttonyear == 2025 && produktion_or_sale == "salg") {
      worldstate = salg2025;
    } else if (buttonyear == 2024 && produktion_or_sale == "produktion") {
      worldstate = produktion2024;
    } else {
      worldstate = produktion2025;
    }
    updateData(worldstate);
  });
});

let salg2024 = "land";
worldstate = salg2024;
let salg2025 = "land2";
let produktion2024 = "land3";
let produktion2025 = "land4";
let buttonyear = 2024;
let produktion_or_sale = "salg";

const projection = d3
  .geoNaturalEarth1()
  .scale(width / 6.5)
  .translate([width / 2, height / 2]);

const baseScale = projection.scale();

let countries = null;
let filteredCountries = null;
let path = null;
let points = null;
let miningpoints = null;
let materialpoints = null;
let componentpoints = null;

// Salgsdata for 2024 og 2025
const salesData2024 = {
  840: 170000, // USA
  156: 140000, // China
  276: 25000, // Germany
  752: 4500, // Sweden
  124: 10000, // Canada
  826: 9000, // UK
  36: 6000, // Australia
  528: 4200, // Netherlands
  578: 3800, // Norway
  392: 7000, // Japan
};

const salesData2025 = {
  840: 160000, // USA ↓
  156: 125000, // China ↓
  276: 18000, // Germany ↓
  752: 2200, // Sweden ↓
  124: 8500, // Canada ↓
  826: 7000, // UK ↓
  36: 4500, // Australia ↓
  528: 1500, // Netherlands ↓↓↓
  578: 1200, // Norway ↓↓↓
  392: 2000, // Japan ↓↓↓
};
async function main(worldstate) {
  const world = await d3.json("countries-110m.json");
  console.log(world);
  countries = topojson.feature(world, world.objects.countries).features;

  // Filter out Antarctica safely
  filteredCountries = countries.filter(
    (country) => country.properties.name !== "Antarctica"
  );

  // Set up projection

  // Apply fitSize to automatically adjust the projection
  projection.fitSize([width, height], {
    type: "FeatureCollection",
    features: filteredCountries,
  });

  path = d3.geoPath().projection(projection);

  updateData(worldstate);
}

function updateData(worldstate) {
  cleanup();

  const paths = svg
    .selectAll("." + worldstate)
    .data(filteredCountries)
    .enter()
    .append("path")
    .attr("class", worldstate)
    .attr("d", path)
    .style("fill", (d) => getCountryColor(d.id, worldstate)) // Brug farvefunktion
    .style("stroke", "black") // Kantfarve
    .style("stroke-width", "0.3px"); // Kanttykkelse

  addTooltip(paths);

  if (worldstate === salg2024) {
    salesData(worldstate);
  }

  if (worldstate === salg2025) {
    salesData(worldstate);
  }

  if (worldstate === produktion2024) {
    drawfactories(points, {
      size: 36,
      src: "Images/tesla_gigafactory_logo.png",
    });
    drawmaterials(miningpoints, {
      size: 12,
    });
     drawcomponents(componentpoints, {
      size: 12,
    });
    drawKeys();
  }

  if (worldstate == produktion2025) {
    drawfactories(points, {
      className: "materials-marker",
      lonThreshold: 3, // degrees of longitude
      latThreshold: 3, // degrees of latitude
      size: 36, //
    });
    drawmaterials(miningpoints, {
      size: 12,
    });
    drawcomponents(componentpoints, {
      size: 12,
    });
    drawUSAwalls();
      drawKeys();
  }
}
function getCountryColor(countryId, worldstate) {
  // Tving ID til at være et tal
  countryId = parseInt(countryId, 10);

  // Definer farver for hvert kort
  const colorMaps = {
    land: {
      840: "rgb(166, 63, 63)", // USA
      276: "rgb(166, 63, 63)", // Tyskland
      156: "rgb(166, 63, 63)", // Kina
      752: "rgb(166, 63, 63)", // Sverige
      124: "rgb(166, 63, 63)", // Canada
      826: "rgb(166, 63, 63)", // UK
      36: "rgb(166, 63, 63)", // Australien
      528: "rgb(166, 63, 63)", // Holland
      578: "rgb(166, 63, 63)", // Norge
      392: "rgb(166, 63, 63)", // Japan
      default: "lightgray",
    },
    land2: {
      840: "rgb(185, 88, 88)", // USA
      276: "rgb(227, 135, 135)", // Tyskland
      156: "rgb(185, 88, 88)", // Kina
      752: "rgb(241, 154, 154)", // Sverige
      124: "rgb(213, 134, 134)", // Canada
      826: "rgb(185, 88, 88)", // UK
      36: "rgb(215, 107, 107)", // Australien
      528: "rgb(243, 159, 159)", // Holland
      578: "rgb(207, 139, 139)", // Norge
      392: "rgb(243, 122, 122)", // Japan
      default: "lightgray",
    },
    land3: {
      840: "rgb(173, 49, 49)", // USA
      276: "pink", // Tyskland
      156: "brown", // Kina
      124: "pink", // Canada
      484: "pink", // Mexico
      32: "pink", // argentina
      36: "pink", // Australien
      540: "pink", // New Caledonia
      180: "pink", // Congo

      default: "lightgray",
    },
    land4: {
      840: "rgb(173, 49, 49)", // USA
      276: "pink", // Tyskland
      156: "brown", // Kina
      124: "pink", // Canada
      484: "pink", // Mexico
      32: "pink", // argentina
      36: "pink", // Australien
      540: "pink", // New Caledonia
      180: "pink", // Congo

      default: "lightgray",
    },
  };

  // Vælg farvekort baseret på worldstate
  const colors = colorMaps[worldstate] || colorMaps.land;

  // Returner farve for landet eller standardfarve
  return colors[countryId] || colors.default;
}

function salesData(worldstate) {
  // viser tal for lande ved salg
  if (worldstate == salg2024 || worldstate == salg2025) {
    const salesData = worldstate === "land" ? salesData2024 : salesData2025;

    svg.selectAll(".sales-label").remove(); // Fjern gamle tekster

    svg
      .selectAll(".sales-label")
      .data(filteredCountries)
      .enter()
      .append("text")
      .attr("class", "sales-label")
      .attr("x", (d) => path.centroid(d)[0])
      .attr("y", (d) => path.centroid(d)[1])
      .text((d) => {
        const code = d.id; // ID som landekode
        return salesData[code] !== undefined ? salesData[code] : "";
      })
      .attr("text-anchor", "middle")
      .attr("fill", "black")
      .style("font-size", "12px");
  }
}

function addTooltip(selection) {
  const tooltip = d3.select(".tooltip");

  selection
    .on("mouseover", (event, d) => {
      tooltip
        .style("display", "block")
        .html(`Country: ${d.properties.name || "Unknown"} (ID: ${d.id})`);
    })
    .on("mousemove", (event) => {
      tooltip
        .style("left", event.pageX + 10 + "px") // Position tooltip 10px to the right of the mouse
        .style("top", event.pageY - 20 + "px"); // Position tooltip 20px above the mouse
    })
    .on("mouseout", () => {
      tooltip.style("display", "none");
    });
}

function cleanup() {
  //Ny cleanup funktion, Tilføj teksten samt en kommentar om hvilket element det er der bliver fjernet
  const selectors = [
    "path",                   // all map paths (includes flight‐path)
    "defs marker#arrow",      // the arrow marker
    "image.logo-marker",      // gigafactory logos
    "image.materials-marker", // material icons
    "image.components-marker",// component icons
    "text.material-label",    // material labels
    "text.component-label",   // component labels
    "text.country-value",     // country values
    ".sales-label",           // sales labels
    "wall",                   // wall elements
    "g.legend-key-group"      // the legend background + items
  ];

  svg.selectAll(selectors.join(",")).remove();

  //Hvis det går galt så bare tilføj den gamle funktion over^
}

function linefromUSAtoChina() {
  svg
    .append("defs")
    .append("marker")
    .attr("id", "arrow")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 10)
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", "black"); // Sort pil

  // Tegn pil fra USA til Beijing
  const from = [
    filteredCountries[4].geometry.coordinates[0][0][0][0],
    filteredCountries[4].geometry.coordinates[0][0][0][1],
  ];

  console.log(from);
  const to = [-119.7527, 39.5349]; // gigafactory nevada

  const line = {
    type: "LineString",
    coordinates: [from, to],
  };

  svg
    .append("path")
    .datum(line)
    .attr("class", "flight-path")
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .attr("d", path)
    .attr("marker-end", "url(#arrow)");
}

// ——— factory‐drawing function ———
function drawfactories(coords, opts = {}) {
  const { className = "logo-marker" } = opts;

  // get current projection scale (if you re‐zoom or resize)
  const currentScale = projection.scale();
  const scaleRatio = currentScale / baseScale;

  // sizes & offsets scale with the map
  const gigSize = 32 * scaleRatio;
  const batterySize = 16 * scaleRatio;
  const batteryOffset = {
    x: 8 * scaleRatio,
    y: 10 * scaleRatio,
  };

  const logoMap = {
    "Gigafactory": "Images/tesla_gigafactory_logo.png",
    "Battery Factory": "Images/battery_factory.png",
  };

  // first pass: record longitudes of all Gigafactories
  const gfLons = new Set();
  for (let i = 0; i < coords.length && i < 11; i++) {
    const [lon, , type] = coords[i];
    if (type === "Gigafactory") gfLons.add(lon);
  }

  // second pass: draw only Giga + Battery (offset if overlapping)
  for (let d = 0; d < coords.length && d < 11; d++) {
    const [lon, lat, type] = coords[d];
    const src = logoMap[type];
    if (!src) continue;

    let [x, y] = projection([lon, lat]);
    let size = type === "Gigafactory" ? gigSize : batterySize;

    // if battery at same lon as giga, apply offset
    if (type === "Battery Factory" && gfLons.has(lon)) {
      x += batteryOffset.x;
      y += batteryOffset.y;
    }

    svg
      .append("image")
      .attr("class", className)
      .attr("href", src)
      .attr("width", size)
      .attr("height", size)
      .attr("x", x - size / 2)
      .attr("y", y - size / 2);
  }
}

// ——— factory‐drawing function ———
function drawmaterials(rawCoords, opts = {}) {
  if (!Array.isArray(rawCoords) || rawCoords.length === 0) {
    // no data yet; nothing to draw
    return;
  }

  const {
    className = "materials-marker",
    lonThreshold = 3, // degrees of longitude
    latThreshold = 3, // degrees of latitude
    size = 12, //
  } = opts;

  // get current projection scale (if you re‐zoom or resize)
  const currentScale = projection.scale();
  const scaleRatio = currentScale / baseScale;

  // sizes & offsets scale with the map
  const iconSize = size * scaleRatio;
  const materialOffset = {
    x: 8 * scaleRatio,
    y: 10 * scaleRatio,
  };

  const materialMap = {
    cobalt: "Images/material_icons/cobalt_ingot.png",
    graphite: "Images/material_icons/graphite_ingot.png",
    lithium: "Images/material_icons/lithium_ingot.png",
    manganese: "Images/material_icons/manganese_ingot.png",
    nickel: "Images/material_icons/nickel_ingot.png",
  };

  // collect up to the first 11 points
  const points = rawCoords
    .slice(0, 11)
    .map(([company, materialType, lon, lat]) => {
      // normalize materialType → key (as before)…
      // …
      const m = materialType.toLowerCase();
      let key;
      if (m.includes("lithium")) key = "lithium";
      else if (m.includes("graphite")) key = "graphite";
      else if (m.includes("nickel")) key = "nickel";
      else if (m.includes("cobalt")) key = "cobalt";
      else if (m.includes("manganese")) key = "manganese";
      else return null; // skip anything else

      return { company, lon, lat, key };
    })
    .filter((pt) => pt !== null);

  // now draw each:
  points.forEach((pt, i) => {
    const { company, lon, lat, key } = pt;
    const src = materialMap[key];
    if (!src) return;

    let [x, y] = projection([lon, lat]);

    const overlap = points.some((other, j) => {
      if (i === j) return false;
      return (
        Math.abs(lon - other.lon) <= lonThreshold &&
        Math.abs(lat - other.lat) <= latThreshold
      );
    });
    if (overlap) {
      x += materialOffset.x;
      y += materialOffset.y;
    }

    svg
      .append("image")
      .attr("class", className)
      .attr("href", src)
      .attr("width", iconSize)
      .attr("height", iconSize)
      .attr("x", x - iconSize / 2)
      .attr("y", y - iconSize / 2);

    // draw the label
    svg
      .append("text")
      .attr("class", "material-label")
      // put it just to the right of the icon, vertically centered
      .attr("x", x + iconSize / 2 + 4)
      .attr("y", y + iconSize / 4) // tweak .25 vs .5 of iconSize to best align
      .text(company)
      .style("font-size", `${iconSize * 0.4}px`)
      .style("pointer-events", "none"); // so the text doesn’t block tooltips
  });
}

// ——— component‐drawing function ———
function drawcomponents(componentCoords, opts = {}) {
  if (!Array.isArray(componentCoords) || componentCoords.length === 0) {
    // no data yet; nothing to draw
    return;
  }

  console.log("Drawing materials for components:", componentCoords);

  const {
    className = "components-marker",
    lonThreshold = 1, // degrees of longitude
    latThreshold = 1, // degrees of latitude
    size = 12, //
  } = opts;

  // get current projection scale (if you re‐zoom or resize)
  const currentScale = projection.scale();
  const scaleRatio = currentScale / baseScale;

  // sizes & offsets scale with the map
  const iconSize = size * scaleRatio;
  const componentOffset = {
    x: 8 * scaleRatio,
    y: 10 * scaleRatio,
  };

  const componentMap = {
    batterycell: "Images/component_icons/battery_cell.png",
    ecu: "Images/component_icons/tesla_ecu.png",
    infotainment: "Images/component_icons/tesla_infotainment.png",
    powerelectronics: "Images/component_icons/tesla_powerelectronics.png",
  };

const points = componentCoords
  .slice(0, 62)
  .map(([componentType, supplier, lat, lon]) => {
    const m = componentType.toLowerCase();
    let compkey = null;

    if (m.includes("battery cell"))           compkey = "batterycell";
    else if (m.includes("electronic control unit")) compkey = "ecu";
    else if (m.includes("power electronics")) compkey = "powerelectronics";
    else if (m.includes("infotainment"))      compkey = "infotainment";
    // **no else** → everything else stays key===null

    // only keep the ones we recognized
    if (!compkey) {
        console.log("→ skipping unrecognized componentType:", componentType);
      return null;}
    return { supplier, lon, lat, compkey };
  })
  .filter(pt => pt !== null);
console.log("points", points);
  // now draw each:
  points.forEach((pt, i) => {
    const {  compkey, supplier, lon, lat} = pt;
    const src = componentMap[compkey];
    if (!src) return;

    let [x, y] = projection([lon, lat]);

    const overlap = points.some((other, j) => {
      if (i === j) return false;
      return (
        Math.abs(lon - other.lon) <= lonThreshold &&
        Math.abs(lat - other.lat) <= latThreshold
      );
    });
    if (overlap) {
      x += componentOffset.x;
      y += componentOffset.y;
    }

    svg
      .append("image")
      .attr("class", className)
      .attr("href", src)
      .attr("width", iconSize)
      .attr("height", iconSize)
      .attr("x", x - iconSize / 2)
      .attr("y", y - iconSize / 2);

    // draw the label
    svg
      .append("text")
      .attr("class", "component-label")
      // put it just to the right of the icon, vertically centered
      .attr("x", x + iconSize / 2 + 4)
      .attr("y", y + iconSize / 4) // tweak .25 vs .5 of iconSize to best align
      .text(supplier)
      .style("font-size", `${iconSize * 0.4}px`)
      .style("pointer-events", "none"); // so the text doesn’t block tooltips
  });
}

function drawUSAwalls() {
  // Define the coordinates for the USA border
  const usaBorder = filteredCountries.find((country) => country.id === "840"); // USA's country code is 840

  if (!usaBorder) {
    console.error("USA border not found in the data.");
    return;
  }

  // Draw the wall along the USA border
  svg
    .append("path")
    .datum(usaBorder)
    .attr("class", "wall")
    .attr("d", path)
    .attr("fill", "none")
    .attr("stroke", "red") // Wall color
    .attr("stroke-width", 4) // Wall thickness
    // Solid line for the wall
    .attr("stroke-dasharray", "none");
}

//data fra databasen

function drawKeys(opts = {}) {
  // ——— define your icons & labels here ———
  const items = [
    { src: "Images/material_icons/cobalt_ingot.png",  label: "Cobalt"    },
    { src: "Images/material_icons/graphite_ingot.png", label: "Graphite"  },
    { src: "Images/material_icons/lithium_ingot.png",  label: "Lithium"   },
    { src: "Images/material_icons/manganese_ingot.png", label: "Manganese" },
    { src: "Images/material_icons/nickel_ingot.png",    label: "Nickel"    },
    { src: "Images/component_icons/battery_cell.png",    label: "Battery Cell"    },
    { src: "Images/component_icons/tesla_ecu.png",    label: "ECU"    },
    { src: "Images/component_icons/tesla_infotainment.png",    label: "Infotainment"    },
    { src: "Images/component_icons/tesla_powerelectronics.png",   label: "Power Electronics"    },
    { src: "Images/tesla_gigafactory_logo.png",   label: "Gigafactory"    },
    { src: "Images/battery_factory.png",   label: "Battery Factory"    },

  ]
  // ——— pull defaults for your layout, then allow overrides ———
  const {
    marginx    = 100,
    marginy    = 100,
    iconSize  = 24,
    spacing   = 4,
    fontSize  = 14,
    className = "legend-key",
    bgPadding = 6,    // padding inside the background rect
    bgFill    = "white",
    bgStroke  = "black",
    bgStrokeWidth = 1,
    bgRadius  = 4 
  } = opts;

  // anchor at bottom-left
  const startX = marginx;
  const startY = height - marginy;

  // create a group for the legend
  const legendG = svg.append("g")
    .attr("class", className + "-group");

  // draw icons & labels into the group
  items.forEach((item, i) => {
    const entryY = startY - i * (iconSize + spacing);

    legendG.append("image")
      .attr("href",  item.src)
      .attr("width", iconSize)
      .attr("height", iconSize)
      .attr("x",     startX)
      .attr("y",     entryY - iconSize);

    legendG.append("text")
      .attr("x",     startX + iconSize + spacing)
      .attr("y",     entryY - iconSize / 2)
      .text(item.label)
      .style("font-size", `${fontSize}px`)
      .style("alignment-baseline", "middle");
  });

  // once drawn, measure the group’s bounding box
  const bbox = legendG.node().getBBox();

  // insert a background rect at the very back of the group
  legendG.insert("rect", ":first-child")
    .attr("x",      bbox.x - bgPadding)
    .attr("y",      bbox.y - bgPadding)
    .attr("width",  bbox.width + bgPadding * 2)
    .attr("height", bbox.height + bgPadding * 2)
    .attr("fill",   bgFill)
    .attr("stroke", bgStroke)
    .attr("stroke-width", bgStrokeWidth)
    .attr("rx",     bgRadius)      // rounded corners
    .attr("ry",     bgRadius);     // same radius vertically
}

async function fetchTeslaFactories() {
  // 1) await the fetch → Response
  const response = await fetch("/api/teslaFactories");

  // 2) await the JSON parse → actual data
  const data = await response.json();

  return data;
}

fetchTeslaFactories().then((data) => {
  points = data.map((item) => [item.longitude, item.latitude, item.type]);
  //Returnerer værdierne til variablen points
  return points;
});

async function fetchMiningPartners() {
  // 1) await the fetch → Response
  const response = await fetch("/api/MiningPartners");

  // 2) await the JSON parse → actual data
  const miningdata = await response.json();

  return miningdata;
}

fetchMiningPartners().then((miningdata) => {
  miningpoints = miningdata.map((item) => [
    item.mining_partner,
    item.material,
    item.longitude,
    item.latitude,
  ]);
  //Returnerer værdierne til variablen points
  return miningpoints;
});

async function fetchComponentSuppliers() {
  // 1) await the fetch → Response
  const response = await fetch("/api/componentSuppliers");

  // 2) await the JSON parse → actual data
  const componentdata = await response.json();

  return componentdata;
}

fetchComponentSuppliers().then((componentdata) => {
  componentpoints = componentdata.map((item) => [
    item.component,
    item.supplier,
    item.latitude,
    item.longitude,
  ]);
  console.log(componentpoints);
  //Returnerer værdierne til variablen points
  return componentpoints;
});

main(worldstate);
