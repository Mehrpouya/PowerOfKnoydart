$(document).ready(function() {
  target = document.getElementById('graphContainer');
  spinner = new Spinner(opts).spin(target);
  spinner.stop();

  initd3(currentChartType, currentChartInterval);
});


/* SPINNER */

var opts = {
  lines: 13, // The number of lines to draw
  length: 4, // The length of each line
  width: 10, // The line thickness
  radius: 4, // The radius of the inner circle
  corners: 1, // Corner roundness (0..1)
  rotate: 0, // The rotation offset
  direction: 1, // 1: clockwise, -1: counterclockwise
  color: ['#ED1C24', '#F9AD81', '#FFF200', '#00A651', '#2E3192'], // #rgb or #rrggbb or array of colors
  speed: 1, // Rounds per second
  trail: 60, // Afterglow percentage
  shadow: false, // Whether to render a shadow
  hwaccel: false, // Whether to use hardware acceleration
  className: 'spinner', // The CSS class to assign to the spinner
  zIndex: 10000, // The z-index (defaults to 2000000000)
  top: '100px', // Top position relative to parent
  left: '50%' // Left position relative to parent
};

var target, spinner, isLoading;


/* END SPINNER *

/* CHART CONSTANTS */

// base url
var url = "http://cyberscot.co.uk/powerofknoydart/getReading.php?type=";
var workingData = [];

// where the graphs go
var chartContainer = d3.select("#graphContainer");

var chartTypes = {
  demand: {
    name: "demand",
    lines: ["pow_act"],
    bars: [],
    yBounds: "pow_act",
    ylabel: "Power Demanded"
  },
  rainfall: {
    name: "rainfall",
    lines: ["dam_lvl", "rain"],
    bars: [],
    yBounds: "dam_lvl",
    ylabel: "Dam Level + Rainfall"
  },
  production: {
    name: "production",
    lines: ["elster"],
    bars: [],
    yBounds: "elster",
    ylabel: "Power Production"
  }
};

var chartIntervals = {
  lastHour: {
    filterEach: 10,
    name: "lastHour",
    xFormat: "%H:%M"
  },
  lastDay: {
    filterEach: 360,
    name: "lastDay",
    xFormat: "%H:%M"
  },
  lastWeek: {
    filterEach: 1,
    name: "lastWeek",
    xFormat: "%a %H:%M"
  },
  lastMonth: {
    filterEach: 1,
    name: "lastMonth",
    xFormat: "%a %d %b"
  }
};

var chartDataCache = {};

var currentChartType = chartTypes.demand;
var currentChartInterval = chartIntervals.lastHour;

/* END CHART CONSTANTS */

function cleard3() {
  $('svg g').remove();
  workingData = [];
}


function initd3(dataType, interval){

  isLoading = true;

  var parentWidth = $('.graphContainer').width();

  var margin = {top:50, right: 20, bottom: 40, left: 50},
  width = parentWidth - margin.left - margin.right,
  height = ((parentWidth/2)) - margin.top - margin.bottom;

  var parseDate = d3.time.format("%Y-%m-%d %X").parse;
  var bisectDate = d3.bisector(function(d) { return d.datetime; }).left;

  var x = d3.time.scale()
  .range([0, width]);

  var y = d3.scale.linear()
  .range([height, 0]);

  var xAxis = d3.svg.axis()
  .scale(x)
  .orient("bottom")
  .tickFormat(d3.time.format(interval.xFormat));

  var yAxis = d3.svg.axis()
  .scale(y)
  .orient("left");

  var svgLines = [];

  for (var i=0; i<dataType.lines.length; i++){

    var dataNamed = dataType.lines[i];

    var aLine = createLine ( dataNamed, x, y );

    svgLines.push(aLine);
  }

  
  var svg;


  if(!d3.select('svg')[0][0])
  {

    svg = chartContainer.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  }else{

    svg = d3.select('svg')
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  }

  if( chartDataCache[currentChartInterval.name] !== undefined )
  {

    // CACHED COPY

    isLoading = false;

    workingData = chartDataCache[currentChartInterval.name];

    // figure out the smallest where we have 2 sets

    // use the extent helper function to find the bounds of each axis
    x.domain(d3.extent(workingData, function(d) { return d.datetime; }));

    var yMax = d3.max(workingData, function(d) { 
      return +d[dataType.yBounds]; 
    });

    y.domain([0, (yMax*1.2)]);

    svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", function(d) {
      return "rotate(-25)";
    });

    svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text(dataType.ylabel);




    for(i=0; i<svgLines.length; i++)
    {

      svg.append("path")
      .datum(workingData)
      .attr("class", "line")
      .attr("d", svgLines[i]);
    }



    // var focus = svg.append("g")
    // .attr("class", "focus")
    // .style("display", "none");

    // focus.append("circle")
    // .attr("r", 4.5);

    // focus.append("text")
    // .attr("x", 9)
    // .attr("dy", ".35em");

    // svg.append("rect")
    // .attr("class", "overlay")
    // .attr("width", width)
    // .attr("height", height)
    // .on("mouseover", function() { focus.style("display", null); })
    // .on("mouseout", function() { focus.style("display", "none"); })
    // .on("mousemove", mousemove);


    /*
    if(dataType.bars.length > 0)
    {
      svg.selectAll("bar")
        .data(workingData)
      .enter().append("rect")
        .style("fill", "steelblue")
        .attr("x", function(d) { return x(d.datetime); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d[dataType.bars[0]]); })
        .attr("height", function(d) { return height - y(d[dataType.bars[0]]); });
    }

    */
  }
  else
  {

    spinner.spin(target);
    isLoading = true;

    d3.json(url+interval.name, function(error, data) {

    // download completion housekeeping
    isLoading = false;
    spinner.stop();

    // strip out garbage we dont want
    var count = 0;

    data.forEach(function(d) {
      count++;

      if(count === interval.filterEach){
        workingData.push(d);
        count = 0;

        
        d.datetime = parseDate(d.datetime);

        for (var i=0; i<dataType.lines.length; i++)
        {
          if(dataType.lines[i] === "rain")
          {
            d[dataType.lines[i]] = +(parseFloat(d[dataType.lines[i]]) * 10);
          }
          else
          {
            d[dataType.lines[i]] = +parseFloat(d[dataType.lines[i]]);
          }
        }

        for (i=0; i<dataType.bars.length; i++)
        {
          d[dataType.bars[i]] = +parseFloat(d[dataType.bars[i]]);
        }

      }
    });

    // no need to download next time yo!
    chartDataCache[currentChartInterval.name] = workingData;

    // use the extent helper function to find the bounds of each axis
    x.domain(d3.extent(workingData, function(d) { return d.datetime; }));

    var yMax = d3.max(workingData, function(d) { 
      return +d[dataType.yBounds]; 
    });

    y.domain([0, (yMax*1.2)]);

    svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", function(d) {
      return "rotate(-25)";
    });

    svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text(dataType.ylabel);


    for(var i=0; i<svgLines.length; i++)
    {

      svg.append("path")
      .datum(workingData)
      .attr("class", "line")
      .attr("d", svgLines[i]);
    }

    /*
    if(dataType.bars.length > 0)
    {
      svg.selectAll("bar")
        .data(workingData)
      .enter().append("rect")
        .style("fill", "steelblue")
        .attr("x", function(d) { return x(d.datetime); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d[dataType.bars[0]]); })
        .attr("height", function(d) { return height - y(d[dataType.bars[0]]); });
    }
    */
   

  });
}

    var focus = svg.append("g")
        .attr("class", "focus")
        .style("display", "none");

        focus.append("circle")
        .attr("r", 4.5);

        focus.append("text")
        .attr("x", 9)
        .attr("dy", ".35em");

        svg.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", mousemove);

    function mousemove() {
        if(isLoading){
            return;
        }

        var x0 = x.invert(d3.mouse(this)[0]),
            i = bisectDate(workingData, x0, 1),
            d0 = workingData[i - 1],
            d1 = workingData[i],
            d = x0 - d0.datetime > d1.datetime - x0 ? d1 : d0;
        focus.attr("transform", "translate(" + x(d.datetime) + "," + y(d[dataType.lines[0]]) + ")");
        focus.select("text").text(d[dataType.lines[0]]);
    }

}



function chartAutoUpdate()
{
  // ajax the latest .php
  // add to workingData for this and all cached
  // cleard3
  // 
}

function createLine(fromData, x, y){
  var line = d3.svg.line()
  .x(function(d)
  {
    return x(d.datetime);
  })
  .y(function(d)
  {
    return y(d[fromData]);
  });
  return line;
}


/* BUTTON EVENTS */

$('button').click(function(event) {
  if(isLoading){
    return;
  }

  var buttonClicked = $(this)[0].id;

  if( currentChartInterval.name === buttonClicked )
  {
    return;
  }

  $('button').removeClass('buttonSelected');
  $(this).addClass('buttonSelected');


  currentChartInterval = chartIntervals[buttonClicked];
  cleard3();
  initd3(currentChartType, currentChartInterval);

});

// Detect clicks across the top nav to change datasets
$('.chartToggle').click(function(event) {

  if(isLoading){
    return;
  }

  var buttonClicked = $(this)[0].id;

  if( currentChartType.name === buttonClicked )
  {
    return;
  }

  $('.chartToggle').removeClass('chartSelected');
  $(this).addClass('chartSelected');


  currentChartType = chartTypes[buttonClicked];
  cleard3();
  initd3(currentChartType, currentChartInterval);
});
