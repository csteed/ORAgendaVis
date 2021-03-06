var timelineChart = function () {
  let margin = {top:20, right:20, bottom: 20, left: 20};
  let width = 900 - margin.left - margin.right;
  let height = 400 - margin.top - margin.bottom;

  let chartData;
  let chartDiv;

  const orders = ({
    Start: (a, b) => d3.ascending(a.start, b.start),
    End: (a, b) => d3.ascending(a.end || today, b.end || today) || d3.ascending(a.start, b.start),
    Duration: (a, b) => d3.descending((a.end || today) - a.start, (b.end || today) - b.start)
  });
  // const today = new Date(Date.UTC(2021, 0, 1));
  // let endDate = new Date(Date.UTC(2021, 0));
  let endDate;

  function chart(selection, data) {
    // chartData = data.slice().sort(orders.Start);
    endDate = d3.max(data, d => d.end);
    console.log(endDate);
    chartData = data.slice();
    chartDiv = selection;
    drawChart();
  }

  var count = 0;
  function getID(name) {
    const id = "0-" + (name === null ? "" : name + "-") + ++count;
    console.log(id);
    return id;
    // return "0-" + (name === null ? "" : name + "-") + ++count;
  }

  function drawChart() {
    if (chartData) {
      chartDiv.selectAll('*').remove();
      if (chartData) {      
        console.log(endDate);

        const svg = chartDiv.append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom);

        const g = svg.append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`);

        const x = d3.scaleUtc()
          .domain([d3.min(chartData, d => d.start), endDate])
          .rangeRound([0, width]);
        console.log(x.domain());
        // console.log(x.rangeRound());

        const y = d3.scalePoint()
          .domain(chartData.map(d => d.name))
          .rangeRound([0, height])
          .padding(1);
        console.log(y.domain());
        
        const xAxis = g => g
          .call(d3.axisTop(x).ticks(width / 80))
          .call(g => g.select(".domain").remove())
          .call(g => g.append("g")
              .attr("stroke", "white")
              .attr("stroke-width", 2)
            .selectAll("line")
            .data(x.ticks(d3.timeYear.every(1)))
            .join("line")
              .attr("x1", d => 0.5 + x(d))
              .attr("x2", d => 0.5 + x(d))
              .attr("y2", height))
          .call(g => g.selectAll(".tick text")
            .attr("font-size", 12));
        
        g.append("defs")
          .selectAll("linearGradient")
          .data(chartData.filter(d => d.end !== null))
          .join("linearGradient")
            .attr("id", getID("gradient"))
            // .attr("id", d => (d.gradientId = DOM.uid("gradient")).id)
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", d => x(d.start))
            .attr("x2", d => x(d.end))
            .call(g => g.append("stop").attr("stop-color", "currentColor"))
            .call(g => g.append("stop").attr("offset", "100%").attr("stop-color", "#ccc"));
        
        // console.log(d3.merge(chartData.map(d => d.spans)));

        const gapLines = g.append("g")
            .attr("stroke-width", 1)
            .attr("stroke-linecap", "round")
            .attr("stroke-linejoin", "round")
            .attr("stroke-dasharray", "2,2")
          .selectAll("line")
          .data(d3.merge(chartData.map(d => d.gaps)))
          .join("line")
            .attr("stroke", "#444")
            .attr("x1", d => x(d.start))
            .attr("x2", d => x(d.end || x.domain()[1]))
            .attr("y1", d => y(d.name) + 0.5)
            .attr("y2", d => y(d.name) + 0.5);

        const line = g.append("g")
            .attr("stroke-width", 2)
            .attr("stroke-linecap", "round")
            .attr("stroke-linejoin", "round")
          .selectAll("line")
          // .data(chartData)
          .data(d3.merge(chartData.map(d => d.spans)))
          .join("line")
            .attr("stroke", "black")
            .attr("x1", d => x(d.start))
            .attr("x2", d => x(d.end || x.domain()[1]))
            .attr("y1", d => y(d.name) + 0.5)
            .attr("y2", d => y(d.name) + 0.5);

        g.append("g")
          .call(xAxis);

        const label = g.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 14)
            .attr("text-anchor", "end")
          .selectAll("text")
          .data(chartData)
          .join("text")
            .attr("x", d => x(d.start) - 6)
            .attr("y", d => y(d.name))
            .attr("dy", "0.35em")
            .attr("fill-opacity", d => {
              // console.log(d.end.getFullYear());
              // console.log(x.domain()[1].getFullYear());
              return d.end.getFullYear() === x.domain()[1].getFullYear() ? null : 0.6
            })
            .attr("font-weight", d => d.end.getFullYear() === x.domain()[1].getFullYear() ? "bold" : null)
            // .attr("fill-opacity", d => d.end === null ? null : 0.6)
            .text(d => d.name);

        // const dot = g.append("g")
        //     .attr("fill", "black")
        //   .selectAll("circle")
        //   .data(chartData.filter(d => d.end != null))
        //   .join("circle")
        //     .attr("cx", d => x(d.end))
        //     .attr("cy", d => y(d.name) + 0.5)
        //     .attr("r", 2);

        

      }
    }
  };

  chart.margin = function(value) {
    if (!arguments.length) {
      return margin;
    }
    oldChartWidth = width + margin.left + margin.right;
    oldChartHeight = height + margin.top + margin.bottom;
    margin = value;
    width = oldChartWidth - margin.left - margin.right;
    height = oldChartHeight - margin.top - margin.bottom;
    return chart;
  };

  chart.width = function(value) {
    if (!arguments.length) {
      return width;
    }
    width = value - margin.left - margin.right;
    return chart;
  };

  chart.height = function(value) {
    if (!arguments.length) {
      return height;
    }
    height = value - margin.top - margin.bottom;
    drawChart();
    return chart;
  };

  return chart;
}