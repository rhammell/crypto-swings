
// Set dimentions of canvas graph
var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 600 - margin.left - margin.right,
    height = 350 - margin.top - margin.bottom;

var svg = d3.select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");

// Parse date / time of data
var parseTime = d3.timeParse("%Y-%m-%d");

// Set data ranges
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

var x_axis = d3.axisBottom()
    .scale(x);
var y_axis = d3.axisLeft()
    .scale(y);

svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .attr("class", "x axis")
    .call(x_axis);

svg.append("g")
    .attr("class", "y axis")
    .call(y_axis);

var valueline = d3.line()
    .x(function(d) { return x(d.Date); })
    .y(function(d) { return y(d.Price); });

svg.append("path")
    .attr("class", "line")


// Price data held in global 
var price_data;

// Load price data initialize chart
$(document).ready(function() {
  
    $.getJSON("price_data.json", function(json) {
        price_data = json;

        updateChart();
    });
});

// Callback when parameters are changed
$('.parameter').on('change', function() {
    updateChart();
});

// Display chart based on selected parameters
function updateChart() {

    // Grab parameter values
    product = $('#product').val()

    // Filter

    draw(price_data, product);
}

// Draw line graph on chart with selected data
function draw(data, product) {
  
    // Copy data oject
    var data = data[product];

    // Format the data
    data.forEach(function(d) {
        if (typeof d.Date == 'string') {
            d.Date = parseTime(d.Date);
        }
    });

    // Update x & y domains
    x.domain(d3.extent(data, function(d) { return d.Date; }));
    y.domain([0, d3.max(data, function(d) { return d.Price; })]);

    // Transition x & y axis
    svg.select(".x")
        .transition()
            .call(x_axis);
    svg.select(".y")
        .transition()
            .call(y_axis);

    svg.selectAll(".line")    
        .datum(data)
        .attr("d", valueline)

}