// Map and chart

// Try to geo-locate based on user later
var default_cz_selection = "Johnson City", 
  default_state_selection = "TN",
  current_cz_selection = default_cz_selection, 
  current_state_selection = default_state_selection,
  current_selection = current_cz_selection + ", " + current_state_selection;

function update_cz(cz_selection){
    current_cz_selection = cz_selection;  
}

function update_state(state_selection){
    current_state_selection = state_selection;  
}

function update_current_selection(selected_location){
    current_selection = selected_location;
    console.log("The selection has been updated to: " + current_selection);
}

var commuting_zones, states, color; // NOTE: need to change color to be map_color

// Life expectancy variables and methods
var default_le_type = "raceadj", default_le_quartile = 1, default_le_sex = "M",
    le_type, le_quartile, le_sex, current_le_selection;

function update_le_selection(param_le_type, param_le_quartile, param_le_sex) {
  le_type = param_le_type;
  le_quartile = param_le_quartile;
  le_sex = param_le_sex;
  current_le_selection = "le_" + le_type + "_q" + le_quartile + "_" + le_sex;
}

update_le_selection(default_le_type, default_le_quartile, default_le_sex);

// Map specifications
var map_width = 1500, map_height = 800,
    chart_width = 500, chart_height = 300; 

var projection = d3.geo.albersUsa()
    .scale([map_width])
    .translate([map_width / 2, map_height / 2]);

var path = d3.geo.path().
  projection(projection);

// Create map svg element
var svg = d3.select("body")
  .append("svg")
    .attr("width", map_width)
    .attr("height", map_height);

// Create life expectancy chart div element
var chart = d3.select("body")
  .append("div")
    .attr("id", "le_chart")
    .attr("width", chart_width)
    .attr("height", chart_height);

// Life expectancy range
var le_min = 70, le_max = 95;

// Bar params
var bar_width = 30;

// Draw life expectancy chart
function draw_chart(selection) {

  var d = commuting_zones.filter(function(d) {
    return d.properties.czname == current_cz_selection & d.properties.stateabbrv == current_state_selection;
  })[0];

  var le_data = [
    { quartile: 'Q1', sex: 'f', le: d.properties['le_' + le_type + "_q1_F"]},
    { quartile: 'Q2', sex: 'f', le: d.properties['le_' + le_type + "_q2_F"]},
    { quartile: 'Q3', sex: 'f', le: d.properties['le_' + le_type + "_q3_F"]},
    { quartile: 'Q4', sex: 'f', le: d.properties['le_' + le_type + "_q4_F"]},
    { quartile: 'Q1', sex: 'm', le: d.properties['le_' + le_type + "_q1_M"]},
    { quartile: 'Q2', sex: 'm', le: d.properties['le_' + le_type + "_q2_M"]},
    { quartile: 'Q3', sex: 'm', le: d.properties['le_' + le_type + "_q3_M"]},
    { quartile: 'Q4', sex: 'm', le: d.properties['le_' + le_type + "_q4_M"]}
                ];

    var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = chart_width - margin.left - margin.right,
    height = chart_height - margin.top - margin.bottom;

    var x0 = d3.scale.ordinal()
        .rangeRoundBands([0, width], 0.5);

    var y = d3.scale.linear()
        .range([height, 0]);

    var color = d3.scale.ordinal()
        .range(['indianred', 'steelblue']);

    var xAxis = d3.svg.axis()
        .scale(x0)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(5);
        //.tickFormat(d3.format(".2s"));

    var svg = selection.append("svg")
        .attr("id", "le_chart_svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x0.domain(["Q1", "Q2", "Q3", "Q4"]);
    y.domain([le_min, le_max]); // NOTE: Should I fix this?

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // FIX: text is not appearing
    svg.append("g")
        .attr("class", "y-axis")
        .call(yAxis)
      .append("text")
        .attr("class", "chart-text")
        .attr("y", -10)
        .attr("x", width * (2/3))
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .style("font-weight", "bold")
        .text("Life expectancy");

    var quartile = svg.selectAll(".quartile")
        .data(le_data)
      .enter().append("g")
        .attr("class", "quartile");

    quartile.selectAll("rect")
        .data(le_data)
      .enter().append("rect")
        .attr("width", bar_width)
        .attr("x", function(d) { if (d.sex == 'm') {
                    return x0(d.quartile) - 10; 
                  } else if (d.sex == 'f'){
                    return x0(d.quartile) + 20; 
                  }
                })
        .attr("y", function(d) { return y(d.le); })
        .attr("height", function(d) { return height - y(d.le); })
        .style("fill", function(d) { return color(d.sex); });

    quartile.append("text")
        .attr("class", "quartile-text")
        .attr("x", function(d) { if (d.sex == 'm') {
                    return x0(d.quartile) - 3; 
                  } else if (d.sex == 'f'){
                    return x0(d.quartile) + 20; 
                  }
                })
        .attr("y", function(d) { return y(d.le) - 2; })
        .style("font-size","15px")
        .style("text-anchor", "middle")
        .text(function(d) { return Math.round(parseFloat(d.le)*10)/10; });

  var legend = svg.selectAll(".legend")
        .data(['F', 'M'])
      .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", width + 5)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", width - 2)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d; });

}

function update_chart() {

  var d = commuting_zones.filter(function(d) {
    return d.properties.czname == current_cz_selection & d.properties.stateabbrv == current_state_selection;
  })[0];

  var le_data = [
    { quartile: 'Q1', sex: 'f', le: d.properties['le_' + le_type + "_q1_F"]},
    { quartile: 'Q2', sex: 'f', le: d.properties['le_' + le_type + "_q2_F"]},
    { quartile: 'Q3', sex: 'f', le: d.properties['le_' + le_type + "_q3_F"]},
    { quartile: 'Q4', sex: 'f', le: d.properties['le_' + le_type + "_q4_F"]},
    { quartile: 'Q1', sex: 'm', le: d.properties['le_' + le_type + "_q1_M"]},
    { quartile: 'Q2', sex: 'm', le: d.properties['le_' + le_type + "_q2_M"]},
    { quartile: 'Q3', sex: 'm', le: d.properties['le_' + le_type + "_q3_M"]},
    { quartile: 'Q4', sex: 'm', le: d.properties['le_' + le_type + "_q4_M"]}
                ];

  var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = chart_width - margin.left - margin.right,
    height = chart_height - margin.top - margin.bottom;

  var x0 = d3.scale.ordinal()
      .rangeRoundBands([0, width], 0.5);

  var y = d3.scale.linear()
      .range([height, 0]);

  var color = d3.scale.ordinal()
      .range(['indianred', 'steelblue']);

  var xAxis = d3.svg.axis()
      .scale(x0)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(5);
      //.tickFormat(d3.format(".2s"));

  x0.domain(["Q1", "Q2", "Q3", "Q4"]);
  y.domain([le_min, le_max]); // NOTE: Should I fix this?
  
  var quartile = d3.select("#le_chart_svg")
    .selectAll(".quartile")
    .data(le_data);

  quartile.selectAll("rect")
      .data(le_data)
      .attr("width", bar_width)
        .attr("x", function(d) { if (d.sex == 'm') {
                    return x0(d.quartile) - 10; 
                  } else if (d.sex == 'f'){
                    return x0(d.quartile) + 20; 
                  }
                })
      .attr("y", function(d) { return y(d.le); })
      .attr("height", function(d) { return height - y(d.le); })
      .style("fill", function(d) { return color(d.sex); });

  d3.selectAll(".quartile-text").remove();

  quartile.append("text")
      .attr("class", "quartile-text")
      .attr("x", function(d) { if (d.sex == 'm') {
                  return x0(d.quartile) - 3; 
                } else if (d.sex == 'f'){
                  return x0(d.quartile) + 20; 
                }
              })
      .attr("y", function(d) { return y(d.le) - 2; })
      .style("font-size","15px")
      .style("text-anchor", "middle")
      .text(function(d) { return Math.round(parseFloat(d.le)*10)/10; });
}

function return_quartile() {
  if (le_quartile == 1) {
    return " bottom ";
  } else if (le_quartile == 2) {
    return " second ";
  } else if (le_quartile == 1) {
    return " third ";
  } else if (le_quartile == 4) {
    return " top ";
  }
}

// Hover and click functions
var hover = function(d) {
    
    d3.select("#tooltip").classed("hidden", false);

    var div = document.getElementById('tooltip');
    div.style.left = event.pageX -200 +'px';
    div.style.top = event.pageY -200 + 'px';
    if (d.properties.czname) {
      div.innerHTML = 'In the ' + 
            d.properties.czname +
            ' area, life expectancy for ' +
            (le_sex == "M" ? ' men ' : ' women ') + ' in the ' +
            return_quartile() +
            ' quartile is ' + Math.round(parseFloat(d.properties[current_le_selection])*10)/10 + '.';
          } else {
            div.innerHTML = 'No data because population is less than 25,000.';
          }
    
    d3.select(this.parentNode.appendChild(this)).transition().duration(300)
        .style({'stroke-width':'1.3px','stroke':'black'});
  };

var click = function(d) {

    update_state(d.properties.stateabbrv);
    update_cz(d.properties.czname);
    update_current_selection(current_cz_selection + ", " + current_state_selection);
    
    if (current_cz_selection.length) {
      update_table();
      update_chart();
    }

    d3.select(this.parentNode.appendChild(this)).transition().duration(300)
        .style({'stroke-width':'3px','stroke':'black'});
  };

// Load geo data and create map
d3.json("data/cz_and_states_data.json", function(error, data) {

  if (error) return console.error(error);

  commuting_zones = topojson.feature(data, data.objects.commuting_zones).features,
    states = topojson.feature(data, data.objects.states);

  // Note: need to make color scale fixed to legend scale
  // Note: color here is a global variable -- should be named more preciesly (e.g., map_color)
  color = d3.scale.quantize()
    .range(["#a50026","#d73027","#f46d43","#fdae61","#fee08b","#ffffbf","#d9ef8b","#a6d96a","#66bd63","#1a9850","#006837"])
    .domain([le_min, le_max]);

  svg.selectAll("path")
      .data(commuting_zones)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", function(d) { 
            var value = d.properties[current_le_selection];

            if (value) {
              return color(value);
            } else {
              return "#f2ebeb";
            }
       })
      .attr("class", "cz")
      .on("mouseover", hover)
      .on("mouseout", function() { 
        d3.select("#tooltip").classed("hidden", true);
        d3.select(this).transition().duration(300)
        .style({'stroke-width':'.5px','stroke':'white'})
      })
      .on("click", click);

  svg.append("path")
      .data([states])
      .attr("d", path)
      .attr("class", "state");

  // Map legend
  // NOTE: fix legend_labels and data() joined to legend svg to NOT be hard-coded
  var legend_labels = ["70", "73", "76", "79", "82",
                        "85", "88", "91", "94"];
  var ls_w = 60, ls_h = 20;

  var legend = svg.selectAll("svg")
    .data(([70, 73, 76, 79, 82, 85, 88, 91, 94]))
    .enter()
    .append("svg")
    .attr("class", "legend");

  legend.append("rect")
    .attr("y", map_height * 0.94)
    .attr("x", function(d, i){ return (map_width / 4) + (i*ls_w);})
    .attr("width", ls_w)
    .attr("height", ls_h)
    .style("fill", function(d, i) { return color(d); })
    .style("opacity", 0.8);

  legend.append("text")
    .attr("y", map_height * 0.98)
    .attr("font-weight", "bold")
    .attr("x", function(d, i){ return (map_width / 4) + (i*ls_w) + 22;})
    .text(function(d, i){ return legend_labels[i]; });
  
  // Initalize chart
  draw_chart(chart);     

});

// Find geolocation of user
navigator.geolocation.getCurrentPosition(function(d) {
    console.log(d);

    svg.append("circle")
    .attr({
      r:7,
      transform: function() {
      var coord = projection([d.coords.longitude,d.coords.latitude])
          return "translate("+coord+")"
      },
      fill:"CornflowerBlue"
    })

  });


// Create map buttons 
var button_width = 80, button_height = 30,
button_vert_gap = 35, button_horz_gap = 5,
sex_quartile_gap = 50;

// Sex buttons
var sex_buttons = svg.append("g")
  .attr("id", "buttons")
.append("g")
  .attr("id", "sex-controls");

sex_buttons.append("rect")
  .attr("class", "button male")
  .attr("x", map_width * .85)
  .attr("y", map_height * .5)
  .classed("selected", true); // NOTE: set because of default_le_sex = "M"

sex_buttons.append("text")
  .attr("class", "button-labels")
  .text("Male")
  .attr("x", (map_width * .85) + button_width * 0.5)
  .attr("y", (map_height * .5) + button_height * 0.5);

sex_buttons.append("rect")
  .attr("class", "button female")
  .attr("x", (map_width * .85) + (button_width + button_horz_gap))
  .attr("y", map_height * .5);

sex_buttons.append("text")
  .attr("class", "button-labels")
  .text("Female")
  .attr("x", (map_width * .85) + (button_width * 1.5 + button_horz_gap))
  .attr("y", (map_height * .5) + button_height * 0.5);

sex_buttons.selectAll(".button")
  .on("click", sex_button_click);

function sex_button_click(d, i) {

    d3.select("#sex-controls")
      .select(".selected")
      .classed("selected", false);

    d3.select(this)
      .classed("selected", true);

    if (d3.select(this).classed("male")) {
      update_le_selection(le_type, le_quartile, "M");
        update_map()
        update_table()
    } else if ((d3.select(this).classed("female"))){
      update_le_selection(le_type, le_quartile, "F");
        update_map()
        update_table()        
    }
  };

// Income quartile buttons
var quartile_buttons = svg.select("#buttons")
.append("g")
  .attr("id", "quartile-controls");

quartile_buttons.append("text")
  .attr("class", "button-headers")
  .attr("x", map_width * .80)
  .attr("y", (map_height * .5) + button_vert_gap)
  //.text("Income \nquartiles:");

// Q1
quartile_buttons.append("rect")
  .attr("class", "button q1")
  .attr("x", map_width * .85)
  .attr("y", (map_height * .5) + button_vert_gap)
  .classed("selected", true); // NOTE: set because of default_le_quartile = 1

quartile_buttons.append("text")
  .attr("class", "button-labels")
  .text("Q1")
  .attr("x", (map_width * .85) + button_width * 0.5)
  .attr("y", (map_height * .5) + (button_vert_gap + button_height * 0.5));

// Q2
quartile_buttons.append("rect")
  .attr("class", "button q2")
  .attr("x", map_width * .85)
  .attr("y", (map_height * .5) + (button_vert_gap * 2));

quartile_buttons.append("text")
  .attr("class", "button-labels")
  .text("Q2")
  .attr("x", (map_width * .85) + button_width * 0.5)
  .attr("y", (map_height * .5) + (button_vert_gap * 2 + button_height * 0.5));

// Q3
quartile_buttons.append("rect")
  .attr("class", "button q3")
  .attr("x", map_width * .85)
  .attr("y", (map_height * .5) + (button_vert_gap * 3));

quartile_buttons.append("text")
  .attr("class", "button-labels")
  .text("Q3")
  .attr("x", (map_width * .85) + button_width * 0.5)
  .attr("y", (map_height * .5) + (button_vert_gap * 3 + button_height * 0.5));

// Q4
quartile_buttons.append("rect")
  .attr("class", "button q4")
  .attr("x", map_width * .85)
  .attr("y", (map_height * .5) + (button_vert_gap * 4));

quartile_buttons.append("text")
  .attr("class", "button-labels")
  .text("Q4")
  .attr("x", (map_width * .85) + button_width * 0.5)
  .attr("y", (map_height * .5) + (button_vert_gap * 4 + button_height * 0.5));

quartile_buttons.selectAll(".button")
  .on("click", quartile_button_click);

function quartile_button_click(d, i) {

    d3.select("#quartile-controls")
      .select(".selected")
      .classed("selected", false);

    d3.select(this)
      .classed("selected", true);

    if (d3.select(this).classed("q1")) {
      update_le_selection(le_type, 1, le_sex);
        update_map()
        update_table()
    } else if ((d3.select(this).classed("q2"))){
      update_le_selection(le_type, 2, le_sex);
        update_map()
        update_table()        
    } else if ((d3.select(this).classed("q3"))){
      update_le_selection(le_type, 3, le_sex);
        update_map()
        update_table()        
    } else if ((d3.select(this).classed("q4"))){
      update_le_selection(le_type, 4, le_sex);
        update_map()
        update_table()        
    }
  };

function update_map() {

  svg.selectAll("path")
    .transition(200)  
    .attr("fill", function(d) { 
          var value = d.properties[current_le_selection];
          console.log("The values being colored are " + value);

          if (value) {
            return color(value);
          } else {
            return "#f2ebeb";
          }
     })

}