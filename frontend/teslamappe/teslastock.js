// Globale variabler
let x, y, line, staticPath, animatedPath, g;
let fullData;

// Data over store fald
const majorDrops = [
  { date: "2020-03-16", drop: -34.61, reason: "Markedets bund under COVID-19-krakket. Investorerne solgte bredt ud af alle risikofyldte aktiver" },
  { date: "2020-09-08", drop: -21.06, reason: "Tesla blev ikke inkluderet i S&P 500, hvilket skuffede investorer og førte til stort fald" },
   {date: "2021-03-08", drop: -13.0, reason: "Stigende obligationsrenter fik investorer til at flytte penge ud af tech-aktier. Tesla faldt kraftigt i den periode – et bredt tech-selloff"},
  { date: "2021-11-09", drop: -11.99, reason: "Elon Musk annoncerede, at han ville sælge 10% af sine Tesla-aktier via Twitter-afstemning" },
 { date: "2022-01-27", drop: -11.55, reason: "Tesla leverede skuffende guidance for fremtiden, hvilket skabte usikkerhed blandt investorer og førte til et markant kursfald" },
{ date: "2022-04-26", drop: -12.18, reason: "Markedet reagerede negativt på Elons planer om at købe Twitter, da investorer frygtede det ville distrahere fra Tesla og belaste hans finansielle forpligtelser" },
{ date: "2022-12-27", drop: -11.41, reason: "Investorer udtrykte bekymring over Elons stærke fokus på Twitter frem for Tesla, hvilket rejste spørgsmål om hans prioriteringer" },
{ date: "2023-04-20", drop: -9.75, reason: "Tesla leverede et skuffende Q1-regnskab. Marginskrumpning og bekymring over lavere elbilsalg i et mere konkurrencepræget marked" },
{ date: "2023-10-30", drop: -9.30, reason: "Q3 2023-resultaterne skuffede, især på marginer og leverancer. Musk udtrykte samtidig bekymring for makroøkonomien" },
{ date: "2024-01-25", drop: -12.13, reason: "Tesla præsenterede en svag fremtidsudsigtsrapport, hvor de varslede lavere vækst og marginpres – det fik aktien til at dykke" },
{ date: "2024-07-24", drop: -12.33, reason: "Kvartalsregnskabet for Q2 2024 skuffede markedet med lavere end ventet indtjening og leveringstal, hvilket udløste bredt salg" },

];

// Konverter datoer i majorDrops til Date-objekter
majorDrops.forEach(d => {
  d.date = new Date(d.date);
});

// Vælger SVG
const stockSvg = d3.select("#stock-chart svg");
const margin = { top: 20, right: 30, bottom: 40, left: 60 };
const chartWidth = +stockSvg.attr("width") - margin.left - margin.right;
const chartHeight = +stockSvg.attr("height") - margin.top - margin.bottom;

g = stockSvg.append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Indlæser CSV
d3.csv("teslamappe/tesla_stock.csv").then((data) => {
  data.forEach((d) => {
    const cleanDate = d.date.split(" ")[0];
    d.date = new Date(cleanDate);
    d.close = +d.close;
  });

  fullData = data;
  const initialData = fullData.filter((d) => d.date.getFullYear() <= 2024);
  setupGraph(initialData);
});

function setupGraph(data) {
  // Skalaer
  x = d3.scaleTime()
    .domain(d3.extent(fullData, d => d.date))
    .range([0, chartWidth]);

  y = d3.scaleLinear()
    .domain([0, d3.max(fullData, d => d.close)])
    .range([chartHeight, 0]);

  // Linjefunktion
  line = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.close));

  // Akselinjer
  g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(d3.axisBottom(x).ticks(8).tickFormat(d3.timeFormat("%Y")));

  g.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(y).ticks(6).tickFormat(d => `$${d.toFixed(2)}`));

  // Split data
  const baseData = data.filter(d => d.date.getFullYear() < 2025);
  const futureData = data.filter(d => d.date.getFullYear() === 2025);

  // 2019–2024 graf
  staticPath = g.append("path")
    .datum(baseData)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", line);

  // 2025 skjult graf
  animatedPath = g.append("path")
    .datum(futureData)
    .attr("fill", "none")
    .attr("stroke", "orange")
    .attr("stroke-width", 1.5)
    .attr("d", line)
    .attr("stroke-dasharray", "0 0")
    .attr("stroke-dashoffset", "0");

  // Tooltip
const tooltip = d3.select("body").append("div")
  .attr("class", "stock-tooltip")
  .style("position", "absolute")
  .style("opacity", 0)
  .style("background-color", "white")
  .style("padding", "6px")
  .style("border", "1px solid #ccc")
  .style("border-radius", "4px")
  .style("pointer-events", "none")
  .style("font-size", "12px")
  .style("z-index", "9999");


  // Røde prikker på store fald
  g.selectAll(".drop-circle")
    .data(majorDrops)
    .enter()
    .append("circle")
    .attr("class", "drop-circle")
    .attr("cx", d => x(d.date))
    .attr("cy", d => {
      const formattedDate = d.date.toISOString().slice(0, 10);
      const point = fullData.find(p => p.date.toISOString().slice(0, 10) === formattedDate);
      return y(point?.close || 0);
    })
    .attr("r", 4)
    .attr("fill", "black")
   .on("mouseover", function (event, d) {
  d3.select(this).transition().attr("r", 6);

  tooltip
    .style("opacity", 1)
    .html(`<strong>${d.date}</strong><br>Fald: ${d.drop}%<br>${d.reason}`)
    .style("left", (event.pageX + 10) + "px")
    .style("top", (event.pageY - 28) + "px");
})

    .on("mouseout", function () {
      d3.select(this).transition().attr("r", 4);
      tooltip.style("opacity", 0);
    });
}

// Opdaterer 2025 graf
function updateGraph(newData) {
  animatedPath.style("opacity", 1);
  const futureData = newData.filter(d => d.date.getFullYear() === 2025);
  animatedPath.datum(futureData).attr("d", line);

  const totalLength = animatedPath.node().getTotalLength();

  animatedPath
    .attr("stroke-dasharray", totalLength + " " + totalLength)
    .attr("stroke-dashoffset", totalLength)
    .transition()
    .duration(1800)
    .ease(d3.easeLinear)
    .attr("stroke-dashoffset", 0);
}

// Toggle Elon
document.getElementById("elon-toggle").addEventListener("change", function () {
  if (this.checked) {
    const extendedData = fullData.filter(d => d.date.getFullYear() <= 2025);
    updateGraph(extendedData);
  } else {
    animatedPath
      .transition()
      .duration(500)
      .style("opacity", 0)
      .on("end", () => {
        animatedPath.attr("d", "");
      });
  }
});
