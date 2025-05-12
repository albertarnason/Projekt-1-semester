(() => {
  const stockSvg = d3.select("#stock-chart svg");
  const margin = { top: 20, right: 30, bottom: 40, left: 60 };
  const width = +stockSvg.attr("width") - margin.left - margin.right;
  const height = +stockSvg.attr("height") - margin.top - margin.bottom;

  const g = stockSvg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  d3.csv("data/tesla_stock.csv").then((data) => {
    data.forEach((d) => {
      const cleanDate = d.date.split(" ")[0];
      d.date = new Date(cleanDate);
      d.close = +d.close;
    });

    const x = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.date))
      .range([0, width])
      .nice();

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.close)])
      .range([height, 0])
      .nice();

    const line = d3
      .line()
      .x((d) => x(d.date))
      .y((d) => y(d.close));

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(8).tickFormat(d3.timeFormat("%Y")));

    g.append("g").call(
      d3
        .axisLeft(y)
        .ticks(6)
        .tickFormat((d) => `$${d.toFixed(2)}`)
    );

    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", line);
  });
})();
