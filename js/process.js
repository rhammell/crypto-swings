
// Set dimentions of canvas graph
var margin = {top: 20, right:20, bottom: 30, left: 50},
    width = parseInt(d3.select("#chart").style("width")) - margin.left - margin.right,
    height = parseInt(d3.select("#chart").style("height")) - margin.top - margin.bottom;

// Define canvas
var svg = d3.select("#chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");

// Function to format date string into date object
var parseTime = d3.timeParse("%Y-%m-%d");

// Set data ranges
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// Set axes
var x_axis = d3.axisBottom()
    .scale(x);
var y_axis = d3.axisLeft()
    .scale(y);

// Add x axis
svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .attr("class", "x axis")
    .call(x_axis);

// Add y axis
svg.append("g")
    .attr("class", "y axis")
    .call(y_axis);

// Line definiition
var valueline = d3.line()
    .x(function(d) { return x(parseTime(d['date'])); })
    .y(function(d) { return y(d['price']); });

// Add line
svg.append("path")
    .attr("class", "line")

// Create a tooltip
var tooltip = d3.select("body").append("div")    
    .attr("id", "tooltip")                
    .style("opacity", 0);

// Resize function
function resize() {

    // Resize axis
    var width = parseInt(d3.select("#chart").style("width")) - margin.left - margin.right;
    x.range([0, width]);

    // Update chart
    update();
};

// Return positive or negative class string based in input string
function percentClass(s) {
    return (parseInt(s) > 0 ? 'positive' : 'negative')
}

// Update 
function update() {

    // Grab parameter values
    product = $('#product').val();
    change = parseInt($('#change').val());
    time = parseInt($('#time').val());

    // Copy selected product data 
    var data = price_data[product];

    // Calulate dates that meet parameter search
    var results = calculateResults(data, change, time);

    // Update table and chart
    updateTable(results);
    updateChart(data, results);
}

// Return the price date info that meet input criteria
function calculateResults(data, change, time) {

    // Set output
    var results = [];

    // Convert change to percentage
    change = (100 + change) / 100.;

    // Loop through price history 
    for (i=0; i < data.length-1; i++) {

        // Subset data for selected time span
        span = data.slice(i,i+time+1);

        // Determine if price change occured within span
        for (j=1; j < span.length; j++) {
            if (change > 1.0) {
                var valid = span[j]['price'] > span[0]['price'] * change;
            } else {
                var valid = span[j]['price'] < span[0]['price'] * change;
            } 

            if (valid) {

                // Add results to output
                results.push({
                    'date_start': span[0]['date'],
                    'price_start': span[0]['price'].toFixed(2),
                    'date_end': span[j]['date'],
                    'price_end': span[j]['price'].toFixed(2),
                    'days': j,
                    'change': ((span[j]['price'] - span[0]['price']) / span[0]['price'] * 100.).toFixed(2)
                });

                break;
            }
        }
    }

    return results;
}

// Update table of dates
function updateTable(results) {

    // Format results into row data
    row_data = results.map(function(r){
        return [
          r['date_start'],
          r['price_start'],
          r['date_end'],
          r['price_end'],
          r['days'],
          r['change'] + '%'
        ]
    })

    // Update table with row data 
    var t = $('#results').DataTable();
    t.clear();
    t.rows.add(row_data);
    t.draw();

    // Update column class
    if (row_data.length > 0) {
        $('#results tr').find('td:last').each(function(){
            $(this).addClass(percentClass($(this).html()) + '-text');
        });
    }
}

// Draw line graph on chart with selected data
function updateChart(data, results) {
  
    // Update x & y domains
    x.domain(d3.extent(data, function(d) { return parseTime(d['date']); }));
    y.domain([0, d3.max(data, function(d) { return d['price']; })]);

    // Transition x & y axis
    svg.select(".x")
        .transition()
            .call(x_axis);
    svg.select(".y")
        .transition()
            .call(y_axis);

    // Update line
    svg.selectAll(".line")    
        .datum(data)
        .attr("d", valueline);

    // Remove previous vertical lines
    svg.selectAll(".vertical-line")
        .remove()

    // Loop through each result
    results.forEach(function(d) {

        // Vertical line data
        var data = [{'date': d['date_start'], 'price': 0.0}, 
                    {'date': d['date_start'], 'price': d['price_start']}]

        // Add line
        svg.append("path")
            .attr("class", percentClass(d['change']) + "-line vertical-line") 
            .attr("d", valueline(data));
    })

    // Remove previous points
    svg.selectAll("circle")
        .remove();

    // Add new points
    svg.selectAll("circle")
        .data(results)
        .enter()
        .append("circle")  // Add circle svg
        .attr("class", function(d) { return percentClass(d['change']) + "-dot"; })
        .attr("cx", function(d) { return x(parseTime(d['date_start'])); })
        .attr("cy", function(d) { return y(d['price_start']); })
        .attr("r", 3)
        .on("mousemove", function(d) {     
            var matrix = this.getScreenCTM()
                .translate(+ this.getAttribute("cx"), + this.getAttribute("cy")); 

            tooltip
                .html(
                    "<p><span class='" + percentClass(d['change']) + "-text'>" + d['change'] + "%</span> in <strong>" + d['days'] + "</strong> days</p>" + 
                    "<p><small>" + d['date_start'] + ': $' + d['price_start']  + "</small></p>" + 
                    "<p><small>" + d['date_end'] + ': $' + d['price_end']  + "</small></p>"
                ) 
                .style("left", (window.pageXOffset + matrix.e + 2) + "px")
                .style("top", (window.pageYOffset + matrix.f - $("#tooltip").outerHeight() -2) + "px")
                .style("opacity", 1);         
            })  
        .on("mouseout", function(d) {        
            tooltip
                .html("") 
                .style("opacity", 0);         
            })                    
 
}

// Window resize callback
d3.select(window).on('resize', resize);

// Callback when input parameters are changed
$('.parameter').on('change', function() {

    // Update chart
    update();
});

// Load price data initialize chart
$(document).ready(function() {

    // Set datatable
    $('#results').DataTable({
        info: true,
        searching: false,
        scrollY: 400,
        paging: false,
    });

    // Load in price data
    $.getJSON("data/prices.json", function(json) {

        // Set to global variable
        price_data = json;

        // Process search parameters
        update();
    });
});