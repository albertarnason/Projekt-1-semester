// Globale variabler
let x, y, line, staticPath, animatedPath, g; // Elementer til grafen
let fullData; // Al dataen fra csv filen

// Data over store fald
const majorDrops = [
  {
    date: "2020-03-16",
    drop: -34.61,
    reason:
      "Markedets bund under COVID-19-krakket. Investorerne solgte bredt ud af alle risikofyldte aktiver",
  },
  {
    date: "2020-09-08",
    drop: -21.06,
    reason:
      "Tesla blev ikke inkluderet i S&P 500, hvilket skuffede investorer og førte til stort fald",
  },
  {
    date: "2021-03-08",
    drop: -13.0,
    reason:
      "Stigende obligationsrenter fik investorer til at flytte penge ud af tech-aktier. Tesla faldt kraftigt i den periode – et bredt tech-selloff",
  },
  {
    date: "2021-11-09",
    drop: -11.99,
    reason:
      "Elon Musk annoncerede, at han ville sælge 10% af sine Tesla-aktier via Twitter-afstemning",
  },
  {
    date: "2022-01-27",
    drop: -11.55,
    reason:
      "Tesla leverede skuffende guidance for fremtiden, hvilket skabte usikkerhed blandt investorer og førte til et markant kursfald",
  },
  {
    date: "2022-04-26",
    drop: -12.18,
    reason:
      "Markedet reagerede negativt på Elons planer om at købe Twitter, da investorer frygtede det ville distrahere fra Tesla og belaste hans finansielle forpligtelser",
  },
  {
    date: "2022-12-27",
    drop: -11.41,
    reason:
      "Investorer udtrykte bekymring over Elons stærke fokus på Twitter frem for Tesla, hvilket rejste spørgsmål om hans prioriteringer",
  },
  {
    date: "2023-04-20",
    drop: -9.75,
    reason:
      "Tesla leverede et skuffende Q1-regnskab. Marginskrumpning og bekymring over lavere elbilsalg i et mere konkurrencepræget marked",
  },
  {
    date: "2023-10-30",
    drop: -9.3,
    reason:
      "Q3 2023-resultaterne skuffede, især på marginer og leverancer. Musk udtrykte samtidig bekymring for makroøkonomien",
  },
  {
    date: "2024-01-25",
    drop: -12.13,
    reason:
      "Tesla præsenterede en svag fremtidsudsigtsrapport, hvor de varslede lavere vækst og marginpres – det fik aktien til at dykke",
  },
  {
    date: "2024-07-24",
    drop: -12.33,
    reason:
      "Kvartalsregnskabet for Q2 2024 skuffede markedet med lavere end ventet indtjening og leveringstal, hvilket udløste bredt salg",
  },
];

// Konverter datoer i majorDrops til Date-objekter
majorDrops.forEach((d) => {
  d.date = new Date(d.date);
});

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
    .domain([0, d3.max(fullData, (d) => d.close)]) // maximum værdi af aktien
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

  // tegner y-aksen til venstre
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

  // tooltip element til hover-effekt
  const tooltip = d3
    .select("body")
    .append("div")
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

  // Tilføjer en cirkel for hvert stort kursfald i majorDrops-arrayet
  g.selectAll(".drop-circle")
    .data(majorDrops) // Binder data om store fald til cirkler
    .enter() // For hvert datapunkt, der ikke har et DOM-element endnu
    .append("circle") // Tilføjer en SVG-cirkel
    .attr("class", "drop-circle") // Giver cirklen en klasse til styling

    // Sætter cirklens x-position ud fra datoen (x-aksen)
    .attr("cx", (d) => x(d.date))

    // Sætter cirklens y-position ud fra aktiekursen på den dato (y-aksen)
    .attr("cy", (d) => {
      const formattedDate = d.date.toISOString().slice(0, 10); // Formaterer datoen
      // Finder det datapunkt i fullData, der matcher datoen
      const point = fullData.find(
        (p) => p.date.toISOString().slice(0, 10) === formattedDate
      );
      return y(point?.close || 0); // Returnerer y-værdien (kursen) eller 0 hvis ikke fundet
    })

    .attr("r", 4) // Sætter radius på cirklen
    .attr("fill", "black") // Sort farve

    // Når musen holdes over cirklen
    .on("mouseover", function (event, d) {
      d3.select(this).transition().attr("r", 6); // Gør cirklen større

      // Viser tooltip med dato, procentfald og forklaring
      tooltip
        .style("opacity", 1)
        .html(
          `<strong>${d.date.toISOString().slice(0, 10)}</strong><br>Fald: ${
            d.drop
          }%<br>${d.reason}`
        )
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
    })

    // Når musen fjernes fra cirklen
    .on("mouseout", function () {
      d3.select(this).transition().attr("r", 4); // Gør cirklen lille igen
      tooltip.style("opacity", 0); // Skjuler tooltip
    });
}

// funktion der kun animerer 2025 linjen
function updateGraph(newData) {
  animatedPath.style("opacity", 1); // sørger for at linjen er synlig, hvis den tidligere blev skjult

  // filtrerer dataen så vi kun får 2025 data
  const futureData = newData.filter((d) => d.date.getFullYear() === 2025);

  // opdaterer linjen med den nye data
  animatedPath.datum(futureData).attr("d", line);

  // finder den samlede længde af linjen
  const totalLength = animatedPath.node().getTotalLength();

  // bruger stroke-dasharray og stroke-dashoffset til at animere linjen, så det ligner den bliver tegnet
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
      .style("opacity", 0) // sindssyg fade ud effekt
      .on("end", () => {
        animatedPath.attr("d", ""); // fjerner linjen helt
      });
  }
});
