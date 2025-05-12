const width = window.innerWidth;
const height = window.innerHeight;

const svg = d3
  .select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Hent og tegn verdenskort
async function prepareWorldMapData(width, height) {
  const world = await d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");

  const countries = topojson.feature(world, world.objects.countries).features;

  // Filter out Antarctica safely
  const filteredCountries = countries.filter(country => country.properties.name !== "Antarctica");

  // Set up projection
  const projection = d3.geoNaturalEarth1()
    .scale(width / 6.5)
    .translate([width / 2, height / 2]);

  // Apply fitSize to automatically adjust the projection
  projection.fitSize([width, height], {
    type: "FeatureCollection",
    features: filteredCountries
  });

  const path = d3.geoPath().projection(projection);

  return { filteredCountries, projection, path };
};



let a = true
   // Tegn landene

let worldmap1 = ".land"
let worldmap2 = ".land2"
let worldmap3 = ".land3"
let worldmap4 = ".land4"



let worldmapstate2 = "land2"
prepareWorldMapData(width, height).then(({ filteredCountries, path, worldmapstate2}) => {

 svg.selectAll("." + worldmapstate2)
     .data(filteredCountries)
     .enter()
     .append("path")
     .attr("class", worldmapstate2)
     .attr("d", path);
     
// Tooltip
const tooltip = d3.select(".tooltip");

// Hover over tooltip FUNGERER KUN EFTER "Tegn landene"
svg
.selectAll(worldmapstate2)
.data(filteredCountries)
.on("mouseover", (event, d) => {
  tooltip
    .style("display", "block")
    .html("Country: " + (d.properties.name || "Unknown") + d.id);
})
.on("mousemove", (event) => {
  tooltip
    .style("left", event.pageX + 10 + "px")
    .style("top", event.pageY - 20 + "px");
})
.on("mouseout", () => {
  tooltip.style("display", "none");
});



// Tilføj pil-definition én gang
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
  .attr("fill", "red"); // Sort pil


   // Tegn pil fra USA til Beijing
   const from = [filteredCountries[4].geometry.coordinates[0][0][0][0], filteredCountries[4].geometry.coordinates[0][0][0][1]]

   console.log(from)
   const to = [116.4, 39.9];    // Beijing
 
   const line = {
     type: "LineString",
     coordinates: [from, to],
   };
 
   svg.append("path")
     .datum(line)
     .attr("fill", "none")
     .attr("stroke", "red")
     .attr("stroke-width", 2)
     .attr("d", path)
     .attr("marker-end", "url(#arrow)");
});

let worldmapstate = "land"
prepareWorldMapData(width, height).then(({ filteredCountries, path, worldmapstate}) => {

  
svg.selectAll(".land2").remove();

 svg.selectAll("." + worldmapstate)
     .data(filteredCountries)
     .enter()
     .append("path")
     .attr("class", worldmapstate)
     .attr("d", path);

// Tooltip
const tooltip = d3.select(".tooltip");

// Hover over tooltip FUNGERER KUN EFTER "Tegn landene"
svg
.selectAll(worldmapstate)
.data(filteredCountries)
.on("mouseover", (event, d) => {
  tooltip
    .style("display", "block")
    .html("Country: " + (d.properties.name || "Unknown") + d.id);
})
.on("mousemove", (event) => {
  tooltip
    .style("left", event.pageX + 10 + "px")
    .style("top", event.pageY - 20 + "px");
})
.on("mouseout", () => {
  tooltip.style("display", "none");
});



// Tilføj pil-definition én gang
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
  .attr("fill", "red"); // Sort pil


   // Tegn pil fra USA til Beijing
   const from = [filteredCountries[4].geometry.coordinates[0][0][0][0], filteredCountries[4].geometry.coordinates[0][0][0][1]]

   console.log(from)
   const to = [116.4, 39.9];    // Beijing
 
   const line = {
     type: "LineString",
     coordinates: [from, to],
   };
 
   svg.append("path")
     .datum(line)
     .attr("fill", "none")
     .attr("stroke", "red")
     .attr("stroke-width", 2)
     .attr("d", path)
     .attr("marker-end", "url(#arrow)");
});
