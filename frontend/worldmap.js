  const width = window.innerWidth;
  const height = window.innerHeight;

  const svg = d3
    .select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Hent elementet med id 'toggle' (checkboxen)
  const toggle = document.getElementById('toggle');

  // Hent elementet med id 'thumbText' (den bevægelige tekst i slideren)
  const thumbText = document.getElementById('thumbText');

  // Lyt efter ændringer på 'toggle'-input (når checkboxen bliver ændret)
  toggle.addEventListener('change', function () {
    // Hvis checkboxen er checked (slideren er til højre eller venstre)
    if (this.checked) {
      thumbText.textContent = "Produktion"; // Sætter teksten i slideren til "Produktion"
        produktion_or_sale = "produktion"
        console.log(produktion_or_sale)
      console.log(buttonyear)
      if (buttonyear == 2024){
        worldstate = produktion2024
      
      } else {worldstate = produktion2025}
      
    } else {
      thumbText.textContent = "Salg"; // Sætter teksten i slideren til "Salg"
      produktion_or_sale = "salg"
      console.log(produktion_or_sale)
        if (buttonyear == 2024){
        worldstate = salg2024
      } else {worldstate = salg2025}

      console.log(buttonyear)
    }
     updateData(worldstate);
     
  });

  const buttons = document.querySelectorAll('.yearButtons button');
 
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Fjern 'active' fra alle knapper
      buttons.forEach(b => b.classList.remove('active'));
      // Tilføj 'active' til den klikkede
      btn.classList.add('active');

      // Sæt buttonYear til det tal, der står i data-year
      buttonyear = parseInt(btn.dataset.year, 10);
      //console.log('Valgt år:', buttonYear);

      // Her kan du nu viderebehandle buttonYear,
      // f.eks. opdatere en graf, lave et API-kald osv.
         if (buttonyear == 2024 && produktion_or_sale == "salg"){
        worldstate = salg2024

      } else if (buttonyear == 2025 && produktion_or_sale == "salg") {worldstate = salg2025
  
      }
      else if (buttonyear == 2024 && produktion_or_sale == "produktion") {worldstate = produktion2024
  
      }
      else {worldstate = produktion2025};
          updateData(worldstate);
    });
  });

    let salg2024 = "land"
  worldstate = salg2024
  let salg2025 = "land2"
  let produktion2024 = "land3"
  let produktion2025 = "land4"
  let buttonyear = 2024
  let produktion_or_sale = "salg"


    const projection = d3.geoNaturalEarth1()
      .scale(width / 6.5)
      .translate([width / 2, height / 2]);

    const baseScale = projection.scale();

  let countries = null
  let filteredCountries = null;
  let path = null;
  let points = null;
  let miningpoints = null;

  // Salgsdata for 2024 og 2025
  const salesData2024 = {
    "840": 195000,  // USA
    "276": 27000,  // Tyskland
    "156": 155000,  // Kina
    "752": 5800   // Sverige
  };
  
  const salesData2025 = {
    "840": 160000,
    "276": 12000,
    "156": 125000,
    "752": 2500
  };

  async function main(worldstate) {
    
    const world = await d3.json("countries-110m.json")
    console.log(world)
    countries = topojson.feature(world, world.objects.countries).features;

    // Filter out Antarctica safely
     filteredCountries = countries.filter(country => country.properties.name !== "Antarctica");

    // Set up projection


    // Apply fitSize to automatically adjust the projection
    projection.fitSize([width, height], {
      type: "FeatureCollection",
      features: filteredCountries
    });

    path = d3.geoPath().projection(projection);

  updateData(worldstate);

}
  


function updateData(worldstate) {

cleanup();

  let worldmapstate = worldstate

 const paths = svg.selectAll("." + worldmapstate)
    .data(filteredCountries)
    .enter()
    .append("path")
    .attr("class", worldmapstate)
    .attr("d", path);

  addTooltip(paths);

  linefromUSAtoChina(worldstate);
  

 

  if (worldstate == salg2024){
    salesData(worldstate);

  }

   if (worldstate == salg2025){
    salesData(worldstate);

  }

   if (worldstate == produktion2024){

drawfactories(points, {
  size: 36, // 48×48px icons
  src: "Images/tesla_gigafactory_logo.png"
  
});
 drawmaterials(miningpoints, 
  {
    size :12
  });   

  }

   if (worldstate == produktion2025){
drawfactories(points,   {
    className: "materials-marker",
    lonThreshold: 3,          // degrees of longitude
    latThreshold:3,          // degrees of latitude
    size :36                    // 
  });
 drawmaterials(miningpoints, 
  {
    size :12
  });   

  }
}


function salesData(worldstate){
  // viser tal for lande ved salg
  if (worldstate == salg2024 || worldstate == salg2025) {
    const salesData = (worldstate === "land") ? salesData2024 : salesData2025;
  
    svg.selectAll(".sales-label").remove(); // Fjern gamle tekster
  
    svg.selectAll(".sales-label")
      .data(filteredCountries)
      .enter()
      .append("text")
      .attr("class", "sales-label")
      .attr("x", d => path.centroid(d)[0])
      .attr("y", d => path.centroid(d)[1])
      .text(d => {
        const code = d.id; // ID som landekode 
        return salesData[code] !== undefined ? salesData[code] : "";
      })
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .style("font-size", "12px");
  }
}

function addTooltip(selection) {
  const tooltip = d3.select(".tooltip");

  selection
    .on("mouseover", (event, d) => {
      tooltip
        .style("display", "block")
        .html(`Country: ${(d.properties.name || "Unknown")}.${d.id}`);
      })
    .on("mousemove", (event) => {
      tooltip
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 20 + "px");
    })
    .on("mouseout", () => {
      tooltip.style("display", "none");
    });
}

function cleanup() {
  // 1) Remove _all_ <path> elements
  svg.selectAll("path").remove();

  svg.selectAll("path.flight-path").remove();
  // remove the arrow marker
  svg.select("defs marker#arrow").remove();

  svg.selectAll("image.logo-marker").remove();

  svg.selectAll("image.materials-marker").remove();

  svg.selectAll("text.country-value").remove();

  // Fjern tidligere salgstal
  svg.selectAll(".sales-label").remove();
}

function linefromUSAtoChina(){

svg.append("defs")
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
   const from = [filteredCountries[4].geometry.coordinates[0][0][0][0], filteredCountries[4].geometry.coordinates[0][0][0][1]]

   console.log(from)
   const to = [-119.7527,39.5349];    // gigafactory nevada
 
   const line = {
     type: "LineString",
     coordinates: [from, to],
   };
 
   svg.append("path")
     .datum(line)
     .attr("class", "flight-path")
     .attr("fill", "none")
     .attr("stroke", "black")
     .attr("stroke-width", 2)
     .attr("d", path)
     .attr("marker-end", "url(#arrow)");
  
  };

// ——— factory‐drawing function ———
function drawfactories(coords, opts = {}) {
  const {
    className = "logo-marker"
  } = opts;


  // get current projection scale (if you re‐zoom or resize)
  const currentScale = projection.scale();
  const scaleRatio   = currentScale / baseScale;

  // sizes & offsets scale with the map
  const gigSize     = 32 * scaleRatio;
  const batterySize = 16 * scaleRatio;
  const batteryOffset = {
    x: 8  * scaleRatio,
    y: 10 * scaleRatio
  };

  const logoMap = {
    "Gigafactory":     "Images/tesla_gigafactory_logo.png",
    "Battery Factory": "Images/battery_factory.png"
  };

  // first pass: record longitudes of all Gigafactories
  const gfLons = new Set();
  for (let i = 0; i < coords.length && i < 11; i++) {
    const [lon,,type] = coords[i];
    if (type === "Gigafactory") gfLons.add(lon);
  }

  // second pass: draw only Giga + Battery (offset if overlapping)
  for (let d = 0; d < coords.length && d < 11; d++) {
    const [lon, lat, type] = coords[d];
    const src = logoMap[type];
    if (!src) continue;

    let [x, y] = projection([lon, lat]);
    let size   = (type === "Gigafactory" ? gigSize : batterySize);

    // if battery at same lon as giga, apply offset
    if (type === "Battery Factory" && gfLons.has(lon)) {
      x += batteryOffset.x;
      y += batteryOffset.y;
    }

    svg.append("image")
      .attr("class", className)
      .attr("href",    src)
      .attr("width",   size)
      .attr("height",  size)
      .attr("x",       x - size/2)
      .attr("y",       y - size/2);
  }
}



// ——— factory‐drawing function ———
function drawmaterials(rawCoords, opts = {}) {
  if (!Array.isArray(rawCoords) || rawCoords.length === 0) {
    // no data yet; nothing to draw
    return;
  }

  console.log("Drawing materials for:", rawCoords);

    const {
    className      = "materials-marker",
    lonThreshold   = 3,          // degrees of longitude
    latThreshold   = 3,          // degrees of latitude
    size = 12                    // 
  } = opts;


  // get current projection scale (if you re‐zoom or resize)
  const currentScale = projection.scale();
  const scaleRatio   = currentScale / baseScale;

  // sizes & offsets scale with the map
  const iconSize = size * scaleRatio;
  const materialOffset = {
    x: 8  * scaleRatio,
    y: 10 * scaleRatio
  };

  const materialMap = {
    "cobalt":     "Images/material_icons/cobalt_ingot.png",
    "graphite":     "Images/material_icons/graphite_ingot.png",
    "lithium":     "Images/material_icons/lithium_ingot.png",
    "manganese":     "Images/material_icons/manganese_ingot.png",
    "nickel":     "Images/material_icons/nickel_ingot.png",
  };

   // collect up to the first 11 points
 const points = rawCoords
  .slice(0, 11)
  .map(([company, materialType, lon, lat]) => {
    // normalize materialType → key (as before)…
    // …
      const m = materialType.toLowerCase();
      let key;
      if (m.includes("lithium"))      key = "lithium";
      else if (m.includes("graphite")) key = "graphite";
      else if (m.includes("nickel"))   key = "nickel";
      else if (m.includes("cobalt"))   key = "cobalt";
      else if (m.includes("manganese"))key = "manganese";
      else return null; // skip anything else

    return { company, lon, lat, key };
  })
  .filter(pt => pt !== null);

// now draw each:
points.forEach((pt, i) => {
  const { company, lon, lat, key } = pt;
  const src = materialMap[key];
  if (!src) return;

  let [x, y] = projection([lon, lat]);

  const overlap = points.some((other, j) => {
    if (i === j) return false;
    return Math.abs(lon - other.lon) <= lonThreshold
        && Math.abs(lat - other.lat) <= latThreshold;
  });
  if (overlap) {
    x += materialOffset.x;
    y += materialOffset.y;
  }

    svg.append("image")
      .attr("class", className)
      .attr("href",    src)
      .attr("width",   iconSize)
      .attr("height",  iconSize)
      .attr("x",       x - iconSize/2)
      .attr("y",       y - iconSize/2);

       // draw the label
  svg.append("text")
    .attr("class", "material-label")
    // put it just to the right of the icon, vertically centered
    .attr("x", x + iconSize/2 + 4)
    .attr("y", y + iconSize/4)   // tweak .25 vs .5 of iconSize to best align
    .text(company)
    .style("font-size", `${iconSize * 0.4}px`)
    .style("pointer-events", "none");  // so the text doesn’t block tooltips

  });
}


//data fra databasen

async function fetchTeslaFactories (){
  
  // 1) await the fetch → Response
  const response = await fetch('/api/teslaFactories');

  // 2) await the JSON parse → actual data
  const data = await response.json();

return data;
}

fetchTeslaFactories().then(data => {
console.log(data)
 // console.log([data[0]['latitude'], data[0]['longitude']]);

points = data.map(item => [
  (item.longitude),
  (item.latitude),
  (item.type)
]);
console.log(points)
//Returnerer værdierne til variablen points
  return points;
});

async function fetchMiningPartners (){
  
  // 1) await the fetch → Response
  const response = await fetch('/api/MiningPartners');

  // 2) await the JSON parse → actual data
  const data = await response.json();

return data;
}

fetchMiningPartners().then(data => {
console.log(data)
 // console.log([data[0]['latitude'], data[0]['longitude']]);

miningpoints = data.map(item => [
   (item.mining_partner),
   (item.material),
  (item.longitude),
  (item.latitude)
  
  
]);
console.log(miningpoints)
//Returnerer værdierne til variablen points
  return miningpoints;
});


main(worldstate);