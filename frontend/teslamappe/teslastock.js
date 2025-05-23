// Globale variabler
let x, y, line, staticPath, animatedPath, g; // Elementer til grafen
let fullData; // Al dataen fra csv filen

// vælger svg elementet fra html filen
const stockSvg = d3.select("#stock-chart svg");
const margin = { top: 20, right: 30, bottom: 40, left: 60 };
const chartWidth = +stockSvg.attr("width") - margin.left - margin.right;
const chartHeight = +stockSvg.attr("height") - margin.top - margin.bottom;

// tilføjer en (g) gruppe, som flytter alt ind i margnerne. g-gruppe er basically en container for at holde elementer (linjer, cirkler osv.)
g = stockSvg
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// loader csv og viser 2019-2024 data som default
// d3.csv er en asynkron funktion, så vi venter på at dataen er loaded før vi fortsætter
d3.csv("teslamappe/tesla_stock.csv").then((data) => {
  // konverterer datoen til et Date objekt og lukke prisen til et tal
  // d3.csv loader dataen som strings, så vi skal konvertere dem til de rigtige typer
  data.forEach((d) => {
    const cleanDate = d.date.split(" ")[0]; // fjerner tid fra datoen
    d.date = new Date(cleanDate); // konverterer til Date objekt
    d.close = +d.close; // konverterer til tal
  });

  fullData = data;
  // filtrer så vi kun får år før 2024 data i første visnign
  const initialData = fullData.filter((d) => d.date.getFullYear() <= 2024);
  setupGraph(initialData); // tegner grafen
});
// tegner begge grafer, også 2025 som gemmer sig bag den første
function setupGraph(data) {
  // tidsskala (x-akse)
  x = d3
    .scaleTime()
    .domain(d3.extent(fullData, (d) => d.date)) // hele tidsintervallet
    .range([0, chartWidth]);
  // aktie skala (y-akse)
  y = d3
    .scaleLinear()
    .domain([0, d3.max(fullData, (d) => d.close)]) //maximum værdi af aktien
    .range([chartHeight, 0]);

  // linjefunktion som forbinder punkterne
  line = d3
    .line()
    .x((d) => x(d.date))
    .y((d) => y(d.close));

  // tegner x-aksen nederst
  g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(d3.axisBottom(x).ticks(8).tickFormat(d3.timeFormat("%Y")));
  //tegner y-aksen til venstre
  g.append("g")
    .attr("class", "y-axis")
    .call(
      d3
        .axisLeft(y)
        .ticks(6)
        .tickFormat((d) => `$${d.toFixed(2)}`)
    );

  // data deles i første del (2019-2024) og 2025
  const baseData = data.filter((d) => d.date.getFullYear() < 2025);
  const futureData = data.filter((d) => d.date.getFullYear() === 2025);

  // tegner 2019-2024 dataen
  staticPath = g
    .append("path")
    .datum(baseData)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", line);

  // tegner en skjult 2025 linje
  // som kun vises når elon toggle er tændt
  animatedPath = g
    .append("path")
    .datum(futureData)
    .attr("fill", "none")
    .attr("stroke", "orange") // farveændring på 2025 linjen
    .attr("stroke-width", 1.5)
    .attr("d", line)
    .attr("stroke-dasharray", "0 0") // skjuler linjen
    .attr("stroke-dashoffset", "0");
}

// funktion der kun animerer 2025 linjen
function updateGraph(newData) {
  animatedPath.style("opacity", 1); // sørger for at linjen er synlig, hvis den tidligere blev skult

  // filtrerer dataen så vi kun får 2025 data
  const futureData = newData.filter((d) => d.date.getFullYear() === 2025);

  // opdaterer linjen med den nye data
  animatedPath.datum(futureData).attr("d", line);

  // finder den samlede længde af linjen
  const totalLength = animatedPath.node().getTotalLength();

  // bruger stroke-dasharray og stroke-dashoffset til at animere linjen, så at det ligner den bliver tegnet
  animatedPath
    .attr("stroke-dasharray", totalLength + " " + totalLength)
    .attr("stroke-dashoffset", totalLength)
    .transition()
    .duration(1800)
    .ease(d3.easeLinear)
    .attr("stroke-dashoffset", 0);
}

// håndterer toggle knappen, så når den er tændt, så vises 2025 linjen
// og når den er slukket, så skjules den
document.getElementById("elon-toggle").addEventListener("change", function () {
  if (this.checked) {
    // klik = vis 2025 linjen
    const extendedData = fullData.filter((d) => d.date.getFullYear() <= 2025);
    updateGraph(extendedData);
  } else {
    // klikker igen = skjul 2025 linjen
    animatedPath
      .transition()
      .duration(500)
      .style("opacity", 0) // sindsyg fade ud effekt
      .on("end", () => {
        animatedPath.attr("d", ""); // fjerner linjen helt
      });
  }
});
