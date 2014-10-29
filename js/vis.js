// canvas drawing context
var ctx;
var graphObject;

// place to store our raw datas
var rawJSON;

// cache all downloaded
var datasets = {};

var randomScalingFactor = function() {
    return Math.round(Math.random() * 100);
};

// what are we showing now?
var currentChart = "demand";
var currentInterval = "lastHour";

// Obj to store our working data for the chart
var chartData = {
    labels: ["Label1", "Label2", "Label3", "Label4", "Label5", "Label6"],
    datasets: [
        {
            label: "demand",
            fillColor: "rgba(220,220,220,0.2)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)",
            data: [randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor()]
        }
    ]

};

// loading indicator
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

// disable controls if we're loading already
var isLoading = true;

$(document).ready(function() {
    bindButtons();

    target = document.getElementById('graphContainer');
    spinner = new Spinner(opts).spin(target);

    initGraph();
});


function bindButtons(){
    // Detect clicks on time intervals
    $('.btn').click(function(event) {
        if(isLoading){
            return;
        }

        var label = $(this)[0].text;
        var intervalFullName = "";


        if (label.indexOf("Hour") >= 0) {
            intervalFullName = "lastHour";
        } else if (label.indexOf("Day") >= 0) {
            intervalFullName = "lastDay";
        } else if (label.indexOf("Week") >= 0) {
            intervalFullName = "lastWeek";
        } else if (label.indexOf("Month") >= 0) {
            intervalFullName = "lastMonth";
        }

        if(intervalFullName === currentInterval){
            return;
        }

        currentInterval = intervalFullName;

        console.log('checking for cached '+currentInterval);
        
        if(datasets[currentInterval]){
            chartData.labels = datasets[currentInterval].labels;
            drawChart();
            return;
        }

        console.log('loading in new interval set');
        resetCanvas();
        downloadDataset(currentInterval);
    });

    // Detect clicks across the top nav to change datasets
    $('.chartToggle').click(function(event) {

        if(isLoading){
            return;
        }

        if(currentChart !== $(this)[0].id){
            currentChart = $(this)[0].id;
            console.log('Changing to '+$(this)[0].id);
            drawChart();
        }
    });
}


function initGraph(){
    downloadDataset(currentInterval);
}

function drawChart(){
    resetCanvas();

    if(currentChart === "demand"){
        formatChartData(false);
        graphObject = new Chart(ctx).Line(chartData, {
            responsive: true,
        });
    }else if (currentChart === "rainfall") {
        formatChartData(true);
        graphObject = new Chart(ctx).MultiAxisLine(chartData, {
            responsive: true,
            drawScale: [0,1],
            drawScaleStroke: [0]
        });
    }else if(currentChart === "production"){
        formatChartData(false);
        // console.log('Context before bar draw: ');
        // console.log(ctx);
        graphObject = new Chart(ctx).Bar(chartData, {
            responsive: true
        });
    }
}

function formatChartData(isLineBar) {
    
    if(currentChart === "rainfall"){
        chartData.datasets[0] = newBlankDataSet(0);
        chartData.datasets[0].data = datasets[currentInterval]['dam_lvl'];
        chartData.datasets[1] = newBlankDataSet(1);
        chartData.datasets[1].data = datasets[currentInterval][currentChart];
    }else{
        chartData.datasets[0] = newBlankDataSet(0);
        chartData.datasets[0].data = datasets[currentInterval][currentChart];
    }
    
}

function resetCanvas(){
  $('#graphCanvas').remove();
  if(graphObject){
    graphObject.destroy();
  }

  chartData.datasets = [];
  
  $('.graphContainer').append('<canvas id="graphCanvas"><canvas>');
  ctx = document.getElementById("graphCanvas").getContext("2d");
  // console.log('Context in resetCanvas: ');
  // console.log(ctx);
  ctx.canvas.clientHeight = $('.graphContainer')[0].clientHeight; // resize to parent width
  ctx.canvas.clientWidth = $('.graphContainer')[0].clientWidth; // resize to parent width
}


function newBlankDataSet(axis_num){
    var obj = {
            label: 'placeholder',
            axis: axis_num,
            fillColor: "rgba(220,220,220,0.2)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)",
            data: [randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor()]
        };
    return obj;
}


function downloadDataset(interval){
    spinner.spin(target);
    isLoading = true;

    var jqxhr = $.getJSON( "http://cyberscot.co.uk/powerofknoydart/getReading.php?type="+interval)
      .done(function(d) {

        // remove spinner and enable buttons
        spinner.stop();
        isLoading = false;

        // keep the json in hand for outside this function
        rawJSON = d;

        console.log(rawJSON);

        // make sure we have a container to use
        if(!datasets[interval]){
            datasets[interval] = {};
        }

        // create cache for this time interval
        datasets[interval].demand = [];
        datasets[interval].rainfall = [];
        datasets[interval].dam_lvl = [];
        datasets[interval].production = [];
        datasets[interval].datetime = [];
        datasets[interval].labels = [];

        // pull out a reasonable number of labels for the buttom (6)
        var nthValue = Math.floor(rawJSON.length / 6);

        // fill the cache
        for (var i = 0; i < rawJSON.length; i++) {

            if (i % nthValue === 0) {
                datasets[interval].labels.push(rawJSON[i].datetime);
            }

            // hadi sucks please remove the garbage extra data in php
            if(currentInterval === "lastHour"){
                if(i % 10 === 0){
                    console.log('keeping this value');
                    datasets[interval].demand.push(rawJSON[i].pow_act);
                    datasets[interval].rainfall.push(rawJSON[i].rain);
                    datasets[interval].dam_lvl.push(rawJSON[i].dam_lvl);
                    datasets[interval].production.push(rawJSON[i].elster);
                    datasets[interval].datetime.push(rawJSON[i].datetime);
                }
            }else if(currentInterval === "lastDay"){
                if(i % 360 === 0){
                    datasets[interval].demand.push(rawJSON[i].pow_act);
                    datasets[interval].rainfall.push(rawJSON[i].rain);
                    datasets[interval].dam_lvl.push(rawJSON[i].dam_lvl);
                    datasets[interval].production.push(rawJSON[i].elster);
                    datasets[interval].datetime.push(rawJSON[i].datetime);
                }
            }else{
                datasets[interval].demand.push(rawJSON[i].pow_act);
                datasets[interval].rainfall.push(rawJSON[i].rain);
                datasets[interval].dam_lvl.push(rawJSON[i].dam_lvl);
                datasets[interval].production.push(rawJSON[i].elster);
                datasets[interval].datetime.push(rawJSON[i].datetime);
            }
            
        }

        chartData.labels = datasets[interval].labels;

        drawChart();

        // clear the raw
        rawJSON = "";
        
      })
      .fail(function() {
        console.log( "error" );
        spinner.stop();
        isLoading = false;
      })
      .always(function() {
        // console.log( "complete" );
      });
}

function refreshChart(){

}
