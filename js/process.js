
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


// Global variable
var price_data;

// Load price data initialize chart
$(document).ready(function() {

    // Set datatable
    $('#example').DataTable({
        info: true,
        searching: false,
        scrollY: 300,
        paging: false
    });

    // Load in price data
    $.getJSON("price_data.json", function(json) {

        // Set to global variable
        price_data = json;

        // Process search parameters
        search();
    });
});

// Callback when parameters are changed
$('.parameter').on('change', function() {

    // Perform search
    search();
});

function search() {

    // Grab parameter values
    product = $('#product').val();
    change = (100 + parseFloat($('#change').val())) / 100.;
    change_class = change > 1 ? 'positive' : 'negative'; 
    console.log(change);
    console.log(change_class);
    time = parseInt($('#time').val());

    // Copy selected product data 
    var data = jQuery.extend(true, [], price_data[product]);

    // Calulate dates that meet parameter search
    dates = calculateDates(data, change, time);

    // Update table
    updateTable(dates, change_class);

    // Update chart
    updateChart(data, dates);
}


// Return the price date info that meet input criteria
function calculateDates(data, change, time) {

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
                var valid = span[j]['price'] > span[0]['price'] * change;
            } else {
                var valid = span[j]['price'] < span[0]['price'] * change;
            } 

            if (valid) {
                changed = true;
                break;
            }
        }

        // Update output
        if (changed) {
            dates.push({
                'date_start': span[0]['date'],
                'price_start': span[0]['price'].toFixed(2),
                'date_end': span[j]['date'],
                'price_end': span[j]['price'].toFixed(2),
                'days': j,
                'change': (span[j]['price'] - span[0]['price']) / span[0]['price'] * 100.
            });
        }
    }

    return dates;
}

// Update table of dates
function updateTable(dates, change_class) {
    console.log('update table');

    // Clear table
    var t = $('#example').DataTable();
    t.clear().draw();

    // Initialize data
    data = [];

    // Loop through dates info
    dates.forEach( function(date) {

        // Add to data array 
        data.push( [
          date['date_start'],
          date['price_start'],
          date['date_end'],
          date['price_end'],
          date['days'],
          date['change'].toFixed(2) + '%'
        ]);
    });

    // Update table with data 
    t.rows.add(data);
    t.draw();

    // Update column class
    if (data.length > 0) {
        $('#example tr').each(function(){
            $(this).find('td:last').addClass(change_class);
        });
    }
}

// Draw line graph on chart with selected data
function updateChart(data, dates) {
  
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