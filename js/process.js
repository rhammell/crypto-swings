
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
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.price); });

svg.append("path")
    .attr("class", "line")


// price data held in global 
var price_data;

// Load price data initialize chart
$(document).ready(function() {
  
    // Load in price data
    $.getJSON("price_data.json", function(json) {

        // Set to global variable
        price_data = json;

        // Process search parameters
        process();
    });
});

// Callback when parameters are changed
$('.parameter').on('change', function() {

    // Process search paramters
    process();
});

function process() {

    // Grab parameter values
    product = $('#product').val();
    change = parseFloat($('#change').val());
    change = (100 + change) / 100.
    time = parseInt($('#time').val());

    // Copy selected product data 
    var data = jQuery.extend(true, [], price_data[product]);

    // Calulate dates that meet parameter search
    dates = calculatedates(data, change, time);
    console.log('Num dates: ' + dates.length.toString());
    for (i in dates) {
        console.log(dates[i]);
    }

    // Update table
    updateTable(dates);

    // Update chart
    updateChart(data);
}

// Return the price dates that meet input criteria
function calculatedates(data, change, time) {

    // Set output
    var dates = [];

    // Loop through price history 
    for (i=0; i < data.length-1; i++) {

        // Subset data for selected time span
        span = data.slice(i,i+time+1);

        // Set change flag
        var changed = false;

        // Determine if price change occured within span
        for (j=1; j < span.length; j++) {
            if (change > 1.0) {
                if (span[j].price > span[0].price * change) {
                    changed = true;
                    break;
                }
            } else {
                if (span[j].price < span[0].price * change) {
                    changed = true;
                    break;
                }
            }
        }

        // Update output
        if (changed) {
            dates.push({'date_start': span[0].date,
                        'price_start': span[0].price,
                        'date_end': span[j].date,
                        'price_end': span[j].price,
                        'difference': span[j].price / span[0].price});
        }
    }

    return dates;
}

// Update table of dates
function updateTable(dates) {
    console.log('update table');
}

// Draw line graph on chart with selected data
function updateChart(data) {
  
    // Format the data
    data.forEach(function(d) {
        d.date = parseTime(d.date);
    });

    // Update x & y domains
    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([0, d3.max(data, function(d) { return d.price; })]);

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