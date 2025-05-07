const width = window.innerWidth;
const height = window.innerHeight;

const svg = d3
  .select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Opsæt projektion og path
const projection = d3.geoNaturalEarth1()
  .scale(width / 6.5)
  .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);
const graticule = d3.geoGraticule();

// Tooltip
const tooltip = d3.select(".tooltip");

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
  .attr("fill", "black"); // Sort pil

// Hent og tegn verdenskort
d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(world => {
  const countries = topojson.feature(world, world.objects.countries).features;

   // Filtrer Antarktis fra baseret på landets navn (sikker metode)
   const filteredCountries = countries.filter(country => country.properties.name !== "Antarctica");

   // Tegn landene
   svg.selectAll(".land")
     .data(filteredCountries)
     .enter()
     .append("path")
     .attr("class", "land")
     .attr("d", path)
     .on("mouseover", (event, d) => {
       tooltip
         .style("display", "block")
         .html("Country: " + (d.properties.name || "Unknown"));
     })
     .on("mousemove", (event) => {
       tooltip
         .style("left", event.pageX + 10 + "px")
         .style("top", event.pageY - 20 + "px");
     })
     .on("mouseout", () => {
       tooltip.style("display", "none");
     });
 
   // Tegn pil fra USA til Beijing
   const from = [-100, 40];     // USA
   const to = [116.4, 39.9];    // Beijing
 
   const line = {
     type: "LineString",
     coordinates: [from, to],
   };
 
   svg.append("path")
     .datum(line)
     .attr("fill", "none")
     .attr("stroke", "black")
     .attr("stroke-width", 2)
     .attr("d", path)
     .attr("marker-end", "url(#arrow)");
    });

