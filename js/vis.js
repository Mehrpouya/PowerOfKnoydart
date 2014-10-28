// canvas drawing context
var ctx;
var graphObject;

// place to store our raw datas
var rawJSON;

// cache all downloaded
var datasets = {};

var randomScalingFactor = function() {
    return Math.round(Math.random() * 100)
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
  color: '#000', // #rgb or #rrggbb or array of colors
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