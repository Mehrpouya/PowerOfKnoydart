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
var url = "http://www.powerofknoydart.org/getReading.php?type=";

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
    ylabel: "Power Demanded (kW)",
    asideTitle: "Power Demand",
    asideText: "This chart shows the community's total power usage in real time. If you switch on your kettle and wait 10 seconds for the chart to update you will see an increase in the community's consumption. <br/> <br/>Currently, the maximum power output of the hydro system is 180kW. If our power demand goes above this level the system will shutdown. Our peak power times are between 5pm and 8pm on winter and holiday nights - please keep an eye on this chart during these times and act according to the live message updates. Thank you!"
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
    ylabel: "Dam Level (mm) + Rainfall (mm)",
    asideTitle: "Rainfall & Dam Level",
    asideText: "The Knoydart hydro dam stores enough water to power the community for almost two months without a single drop of rain. Most of the time there is plenty of water in the dam but sometimes we may ask you to conserve energy until water levels are restored in the loch."
  },
  production: {
    name: "production",
    lines: [],
    bars: [{
            section: "elster",
            field: "average_elster"
          }],
    yBounds: "average_elster",
    ylabel: "Energy Production (kWh)",
    asideTitle: "Energy Production",
    asideText: "This chart shows the amount of energy produced each hour and day. Units of energy are measured in kilowatt hours and Knoydart Renewables currently charges 14p/kWh for the standard tariff - which is cheaper than the mainland! <br/><br/>This money is used to help maintain one of the remotest hydro power sites in the UK and provide you with reliable electricity."
  }
};

var chartIntervals = {
  lastHour: {
    name: "lastHour",
    xFormat: "%H:%M",
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

var chartAlertStrings = {
  over_power: "WARNING – We are using too much power! Please switch off all unnecessary appliances immediately!",
  high_power: "Our power usage is currently HIGH please refrain from switching on unnecessary electrical appliances.",
  normal_power: "Our power usage is just right, feel free to do whatever you want!",
  spare_power: "Hey! We have loads of spare power available. Why don’t you do some laundry, use your power tools, cook tomorrow’s meal or switch the heating on.",
  dam_low: "We are currently experiencing a dry spell and the dam depth is lower than normal. Please be considerate when consuming electricity.",
  power_off: "We are currently using the diesel generator to provide electricity. Please conserve your energy usage until this message changes."
};

var chartDataCache = {};

var currentChartType = chartTypes.demand;
var currentChartInterval = chartIntervals.lastHour;

var parseDate = d3.time.format("%Y-%m-%d %X").parse;

var ISODate = d3.time.format("%Y-%m-%d %X");

/* END CHART CONSTANTS */

function cleard3() {
  $('svg g').remove();
  workingData = "";
}

d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};


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
  var svg;

  // Make any lines if chart type calls for it
  for (var i=0; i<dataType.lines.length; i++){

    var dataNamed = dataType.lines[i];

    var aLine = createLine ( dataNamed, x, y );

    svgLines.push(aLine);
  }


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

    var yMax;
    
    if(dataType.lines.length > dataType.bars.length)
    {
      x.domain(d3.extent(workingData[dataType.lines[0].section], function(d) { return d.time_created; }));

      yMax = d3.max(workingData[dataType.lines[0].section], function(d) {
        return +d[dataType.yBounds];
      });
    }
    else
    {
      x.domain(d3.extent(workingData[dataType.bars[0].section], function(d) { return d.time_created; }));

      yMax = d3.max(workingData[dataType.bars[0].section], function(d) {
        return +d[dataType.yBounds];
      });
    }
    

    y.domain([0, (yMax*1.2)]);

    if( currentChartType.name === "demand" )
    {
      y.domain([0, 200]);
    }

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

    if(currentChartType.name === "demand")
    {
      svg.append("line")
        .style("stroke", "red")
        .style("stroke-dasharray", ("3, 2"))
        .attr("x1", 0)
        .attr("y1", y(180))
        .attr("x2", width)
        .attr("y2", y(180));
    }

    svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("y", 6)
    .attr("x", 170)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text(dataType.ylabel);

    if(dataType.bars.length > 0)
      {
        // console.log(workingData['elster']);
        svg.selectAll("rect")
          .data(workingData['elster'])
          .enter()
          .append("rect")
          .attr("x", function(d, i) {
            return (i * (width / workingData['elster'].length));
          })
          .attr("y", function (d) {
            return height - d.average_elster;
            // return y(d.y1);
          })
          .attr("width", (width / workingData['elster'].length) - 1)
          .attr("height", function(d, i) {
            // console.log(d);
            return d.average_elster;
          })
          .attr('class', 'chartBar');
      }




    updateAlert();
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

      updateAlert();

      var yMax;

      if( dataType.bars.length > dataType.lines.length ){
        // use the extent helper function to find the bounds of each axis
        x.domain(d3.extent(workingData[dataType.bars[0].section], function(d) { return d.time_created; }));

        yMax = d3.max(workingData[dataType.bars[0].section], function(d) {
          return +d[dataType.yBounds];
        });
      }
      else
      {
        x.domain(d3.extent(workingData[dataType.lines[0].section], function(d) { return d.time_created; }));

        yMax = d3.max(workingData[dataType.lines[0].section], function(d) {
          return +d[dataType.yBounds];
        });
      }

      y.domain([0, (yMax*1.2)]);

      if( currentChartType.name === "demand" )
      {
        y.domain([0, 200]);
      }

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

      if(currentChartType.name === "demand")
      {
        svg.append("line")
          .style("stroke", "red")
          .style("stroke-dasharray", ("3, 2"))
          .attr("x1", 0)
          .attr("y1", y(180))
          .attr("x2", width)
          .attr("y2", y(180));
      }

      svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("x", 150)
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text(dataType.ylabel);


      if(dataType.bars.length > 0)
      {
        // console.log(workingData['elster']);
        svg.selectAll("rect")
          .data(workingData['elster'])
          .enter()
          .append("rect")
          .attr("x", function(d, i) {
            return (i * (width / workingData['elster'].length));
          })
          .attr("y", function (d) {
            return (height - d.average_elster)-1;
            // return y(d.y1);
          })
          .attr("width", (width / workingData['elster'].length) - 1)
          .attr("height", function(d, i) {
            // console.log(d);
            return d.average_elster;
          })
          .attr('class', 'chartBar');
      }

  });
}

    var focus = svg.append("g")
        .attr("class", "focus")
        .style("display", "none");

        focus.append("circle")
        .attr("r", 4.5);

        focus.append("text")
        .attr("x", 9)
        .attr("dy", ".35em")
        .style("color", "red");

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

        focus.moveToFront();


        var s;

        if(currentChartType.name === 'production')
        {
          s = dataType.bars[0].section;
          focus.attr('display', 'none');
        }
        else
        {
          focus.attr('display', 'inline');
          s = dataType.lines[0].section;
        }

        var x0 = x.invert(d3.mouse(this)[0]),
            i = bisectDate(workingData[s], x0, 1),
            d0 = workingData[s][i - 1],
            d1 = workingData[s][i],
            d = x0 - d0.time_created > d1.time_created - x0 ? d1 : d0;

        
        

        if(currentChartType.name === 'production')
        {
          focus.attr("transform", "translate(" + x(d.time_created) + "," + y(d[dataType.bars[0].field]) + ")");
          focus.select("text").text(d[dataType.bars[0].field]);
        }
        else
        {
          focus.attr("transform", "translate(" + x(d.time_created) + "," + y(d[dataType.lines[0].field]) + ")");
          focus.select("text").text(d[dataType.lines[0].field]);
        }
    }

}



function chartAutoUpdate()
{

  if(currentChartType.name !== 'demand')
  {
    return;
  }

  var cacheReadingsLength = chartDataCache[currentChartInterval.name].readings.length -1;
  var lastTime = ISODate( chartDataCache[currentChartInterval.name].readings[cacheReadingsLength].time_created );

  $.getJSON( url+"since&since="+lastTime , function( data ) {

    for (var key in workingData)
    {

      if (workingData.hasOwnProperty(key) && key !== 'elster')
      {
        for(var i=0; i<data[key].length -1; i++)
        {
          for (var val in data[key][i] )
          {
            if (data[key][i].hasOwnProperty(val))
            {
              data[key][i][val] = parseValues(data[key][i], val);
              // workingData[key].push( parseValues(data[key][0], val) );
            }
          }
          workingData[key].push( data[key][i] );
        }
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


function updateAlert()
{
  var alertString = "";

  for (var key in workingData)
  {
    console.log(key);
    if (workingData.hasOwnProperty(key))
    {
      var length = workingData[key].length;
      var active_power, dam;

      if(key === 'readings')
      {
        active_power = workingData[key][length-1]['active_power'];

        if(active_power >= 170.0)
        {
          alertString = chartAlertStrings.over_power;
        }
        else if(active_power >= 150.0 && active_power < 170.0)
        {
          alertString = chartAlertStrings.high_power;
        }
        else if(active_power >= 100.0 && active_power < 150.0)
        {
          alertString = chartAlertStrings.normal_power;
        }
        else if(active_power < 100.0)
        {
          alertString = chartAlertStrings.spare_power;
        }
        else if(active_power < 10.0)
        {
          alertString = chartAlertStrings.power_off;
        }
      }
      else if(key === 'levels')
      {
        if(length < 1)
        {
          return;
        }

        dam = workingData[key][length-1]['dam_level'];
        if(dam < 1400.0 && active_power < 170.0)
        {
          alertString = chartAlertStrings.dam_low;
        }
        else if(dam < 1400.0 && active_power >= 170.0)
        {
          alertString = chartAlertStrings.over_power;
        }
      }

      $('.systemAlert').text(alertString);
    }
  }
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

  if(buttonClicked === "rainfall" || buttonClicked === "production")
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

  $('#dynamic_text').html(currentChartType.asideText);
  $('#dynamic_title').html(currentChartType.asideTitle);
  cleard3();
  initd3(currentChartType, currentChartInterval);
});
