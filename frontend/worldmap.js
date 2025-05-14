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


    const projection = d3.geoNaturalEarth1()
      .scale(width / 6.5)
      .translate([width / 2, height / 2]);

  
  let salg2024 = "land"
  worldstate = salg2024
  let salg2025 = "land2"
  let produktion2024 = "land3"
  let produktion2025 = "land4"
  let buttonyear = 2024
  let produktion_or_sale = "salg"
  let countries = null
  let filteredCountries = null;
  let path = null;
  let points = null;

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

  initData(worldstate);

  }

function initData(worldstate) {


  let worldmapstate = worldstate

  const paths = svg.selectAll("." + worldmapstate)
    .data(filteredCountries)
    .enter()
    .append("path")
    .attr("class", worldmapstate)
    .attr("d", path);

  addTooltip(paths); 
    // draw 10×10px red boxes with black stroke:

    linefromUSAtoChina(worldstate);

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

 
  



  if (worldstate == salg2024){
 linefromUSAtoChina(worldstate);

  }

   if (worldstate == salg2025){


  }

   if (worldstate == produktion2024){

addLogos(points, {
  size: 36, // 48×48px icons
  src: "Images/tesla_gigafactory_logo.png"
});
  }

   if (worldstate == produktion2025){
addLogos(points, {
  size: 36, // 48×48px icons
  src: "Images/tesla_gigafactory_logo.png"
});
  }
}

function addTooltip(selection) {
  const tooltip = d3.select(".tooltip");

  selection
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
}

function cleanup() {
  // 1) Remove _all_ <path> elements
  svg.selectAll("path").remove();

  svg.selectAll("path.flight-path").remove();
  // remove the arrow marker
  svg.select("defs marker#arrow").remove();

   svg.selectAll("image.logo-marker").remove();
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

function addLogos(coords, opts = {}) {
  const {
    size = 32,
    className = "logo-marker",
    src = "Images/tesla_gigafactory_logo.png"
  } = opts;

  // data‐join on <image> tags
  const logos = svg.selectAll(`image.${className}`)
    .data(coords);

  // enter
  logos.enter()
    .append("image")
      .attr("class", className)
      // modern browsers support href on <image>; if yours needs xlink, use .attr("xlink:href", src)
      .attr("href", src)
      .attr("width", size)
      .attr("height", size)
      // center the icon over the [lon,lat]
      .attr("x", d => projection(d)[0] - size / 2)
      .attr("y", d => projection(d)[1] - size / 2);

  // update (in case you re-project or re-size)
  logos
      .attr("width", size)
      .attr("height", size)
      .attr("x", d => projection(d)[0] - size / 2)
      .attr("y", d => projection(d)[1] - size / 2);

  // exit
  logos.exit().remove();
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
  (item.latitude)
]);
//Returnerer værdierne til variablen points
  return points;
});

main(worldstate);