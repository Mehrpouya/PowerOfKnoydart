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

var target;
var spinner;

$(document).ready(function() {
    target = document.getElementById('graphContainer');
    spinner = new Spinner(opts).spin(target);

    initd3(chartTypes.demand, chartIntervals.lastHour);
});

/* END SPINNER */

/* CHART CONSTANTS */

// base url
var url = "http://cyberscot.co.uk/powerofknoydart/getReading.php?type=";
var workingData = [];

// where the graphs go
var chartContainer = d3.select("#graphContainer");

var chartTypes = {
  demand: {
    lines: ["pow_act"],
    yBounds: "pow_act",
    ylabel: "Power Demanded"
  },
  rainfall: {
    lines: ["dam_lvl", "rain"],
    yBounds: "dam_lvl",
    ylabel: "Dam Level vs Rainfall"
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

/* END CHART CONSTANTS */

function cleard3() {
  $('svg g').remove();
  workingData = [];
}


function initd3(dataType, interval){

  var margin = {top: 5, right: 20, bottom: 40, left: 50},
      width = 600 - margin.left - margin.right,
      height = 350 - margin.top - margin.bottom;

  var parseDate = d3.time.format("%Y-%m-%d %X").parse;

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
    console.log('nae svg');

    svg = chartContainer.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  }else{
    console.log('using old svg');

    svg = d3.select('svg')
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  }

  d3.json(url+interval.name, function(error, data) {

    spinner.stop();

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

      }
    });



    // use the extent helper function to find the bounds of each axis
    x.domain(d3.extent(workingData, function(d) { return d.datetime; }));
    y.domain([0, d3.max(workingData, function(d) { return d[dataType.yBounds]; })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                return "rotate(-25)" 
                });;

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
  });
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
