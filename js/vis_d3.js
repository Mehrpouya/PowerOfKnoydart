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

var workingData;

var autoUpdateInterval;


/* END SPINNER *

/* CHART CONSTANTS */

// base url
var url = "http://cyberscot.co.uk/powerofknoydart/getReading.php?type=";

// where the graphs go
var chartContainer = d3.select("#graphContainer");

var chartTypes = {
  demand: {
    name: "demand",
    lines: [
        {
          section: "readings",
          field: "active_power"
        }
      ],
    bars: [],
    yBounds: "active_power",
    ylabel: "Power Demanded"
  },
  rainfall: {
    name: "rainfall",
    lines: [
        {
          section: "levels",
          field: "dam_level"
        },
        {
          section:"levels",
          field: "rainfall"
        }
      ],
    bars: [],
    yBounds: "dam_level",
    ylabel: "Dam Level + Rainfall"
  },
  production: {
    name: "production",
    lines: [
        {
          section: "readings",
          field: "reactive_power"
        }
      ],
    bars: [],
    yBounds: "reactive_power",
    ylabel: "Power Production"
  }
};

var chartIntervals = {
  lastHour: {
    name: "lastHour",
    xFormat: "%H:%M"
  },
  lastDay: {
    name: "lastDay",
    xFormat: "%H:%M"
  },
  lastWeek: {
    name: "lastWeek",
    xFormat: "%a %H:%M"
  },
  lastMonth: {
    name: "lastMonth",
    xFormat: "%a %d %b"
  }
};

var chartDataCache = {};

var currentChartType = chartTypes.demand;
var currentChartInterval = chartIntervals.lastHour;

var parseDate = d3.time.format("%Y-%m-%d %X").parse;

/* END CHART CONSTANTS */

function cleard3() {
  $('svg g').remove();
  workingData = "";
}


function initd3(dataType, interval){


  isLoading = true;

  var parentWidth = $('.graphContainer').width();

  var margin = {top:50, right: 20, bottom: 40, left: 50},
  width = parentWidth - margin.left - margin.right,
  height = ((parentWidth/2)) - margin.top - margin.bottom;

  var bisectDate = d3.bisector(function(d) { return d.time_created; }).left;

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

  var area = d3.svg.area()
    .x(function(d) {
      return x(d.time_created);
    })
    .y0(height)
    .y1(function(d) {
      return y(+d[dataType.yBounds]);
    });

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
    x.domain(d3.extent(workingData[dataType.lines[0].section], function(d) { return d.time_created; }));

    var yMax = d3.max(workingData[dataType.lines[0].section], function(d) { 
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

      if(dataType.lines[i].field === dataType.yBounds)
      {
        svg.append("path")
        .datum(workingData[dataType.lines[0].section])
        .attr("class", "area")
        .attr("d", area);
      }


      // console.log(workingData[dataType.lines[0].section]);
      svg.append("path")
      .datum(workingData[dataType.lines[0].section])
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
        .attr("x", function(d) { return x(d.time_created); })
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
    clearInterval(autoUpdateInterval);

    d3.json(url+interval.name, function(error, data) {

      autoUpdateInterval = setInterval(chartAutoUpdate, 10000);

      workingData=data;

      // download completion housekeeping
      isLoading = false;
      spinner.stop();

      for (var key in workingData) {
        if (workingData.hasOwnProperty(key)) {
            
            workingData[key].forEach(function(d) {

              for (var key in d)
              {
                if (d.hasOwnProperty(key))
                {
                  if(key === "time_created")
                  {
                    d.time_created = parseDate(d.time_created);
                  }
                  else if(key === "rainfall")
                  {
                    d[key] = +(parseFloat(d[key]) * 10);
                  }
                  else
                  {
                    d[key] = +parseFloat(d[key]);
                  }
                }
              }

          });
        }
      }

      // no need to download next time yo!
      chartDataCache[currentChartInterval.name] = workingData;

      // use the extent helper function to find the bounds of each axis
      x.domain(d3.extent(workingData[dataType.lines[0].section], function(d) { return d.time_created; }));

      var yMax = d3.max(workingData[dataType.lines[0].section], function(d) { 
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
        if(dataType.lines[i].field === dataType.yBounds)
        {
          svg.append("path")
          .datum(workingData[dataType.lines[0].section])
          .attr("class", "area")
          .attr("d", area);
        }

        svg.append("path")
        .datum(workingData[dataType.lines[0].section])
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
          .attr("x", function(d) { return x(d.time_created); })
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

        var s = dataType.lines[0].section;

        var x0 = x.invert(d3.mouse(this)[0]),
            i = bisectDate(workingData[s], x0, 1),
            d0 = workingData[s][i - 1],
            d1 = workingData[s][i],
            d = x0 - d0.time_created > d1.time_created - x0 ? d1 : d0;
        focus.attr("transform", "translate(" + x(d.time_created) + "," + y(d[dataType.lines[0].field]) + ")");
        focus.select("text").text(d[dataType.lines[0].field]);
    }

}



function chartAutoUpdate()
{
  $.getJSON( url+"lastOne" , function( data ) {
    for (var key in workingData)
    {
      if (workingData.hasOwnProperty(key))
      {
        for (var val in data[key][0] )
        {
          if (data[key][0].hasOwnProperty(val))
          {
            data[key][0][val] = parseValues(data[key][0], val);
            // workingData[key].push( parseValues(data[key][0], val) );
          }
        }
        workingData[key].push( data[key][0] );
      }
    }
    chartDataCache[currentChartInterval.name] = workingData;
    cleard3();
    initd3(currentChartType, currentChartInterval);
  });
}

function parseValues(data, key)
{
  var parsed;

  if(key === "time_created")
  {
    parsed = parseDate(data[key]);
  }
  else if(key === "rainfall")
  {
    parsed  = +(parseFloat(data[key]) * 10);
  }
  else
  {
    parsed  = +parseFloat(data[key]);
  }
  return parsed;
}

function createLine(fromData, x, y){

  var line = d3.svg.line()
  .x(function(d)
  {
    // console.log(d.time_created);
    return x(d.time_created);
  })
  .y(function(d)
  {
    return y(d[fromData.field]);
  });
  return line;
}


/* BUTTON EVENTS */

$('.intervalToggle').click(function(event) {
  if(isLoading){
    return;
  }

  var buttonClicked = $(this)[0].id;

  if( currentChartInterval.name === buttonClicked )
  {
    return;
  }

  $('.intervalToggle').removeClass('buttonSelected');
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

  // console.log(event);

  if( currentChartType.name === buttonClicked )
  {
    return;
  }

  if(buttonClicked === "rainfall")
  {
    $('button#lastHour').hide();
    currentChartInterval = chartIntervals.lastDay;
    $('button').removeClass('buttonSelected');
    $('button#lastDay').addClass('buttonSelected');
  }
  else
  {
    $('button#lastHour').show();
  }

  $('.chartToggle').removeClass('chartSelected');
  $(this).addClass('chartSelected');


  currentChartType = chartTypes[buttonClicked];
  cleard3();
  initd3(currentChartType, currentChartInterval);
});
