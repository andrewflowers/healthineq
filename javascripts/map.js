
// Map controls
d3.selectAll("#sex-controls input[name=sex]").on("change", function() {
  console.log("The sex radio button chaanged to " + this.value);
  change_map_sex(this.value);
});

var width = 1500, // 960
    height = 800; // 500

var projection = d3.geo.albersUsa()
    .scale([1500])
    .translate([width / 2, height / 2]);

var path = d3.geo.path().
  projection(projection);

var svg = d3.select("body")
  .append("svg")
    .attr("width", width)
    .attr("height", height);

var hover = function(d) {
    
    d3.select("#tooltip").classed("hidden", false);

    var div = document.getElementById('tooltip');
    div.style.left = event.pageX -200 +'px';
    div.style.top = event.pageY -200 + 'px';
    if (d.properties.czname) {
      div.innerHTML = 'In the ' + 
            d.properties.czname +
            ' area, life expectancy is ' +
            Math.round(parseFloat(d.properties.le_raceadj_q1_F)*10)/10 + '.' + "\n" +
            'Click for more info.';
          } else {
            div.innerHTML = 'No data';
          }
    
    d3.select(this.parentNode.appendChild(this)).transition().duration(300)
        .style({'stroke-width':'1.3px','stroke':'black'});
  };

var click = function(d) {
    
    var tooltip = d3.select("#tooltip").classed("hidden", false);

    draw_chart(tooltip, d);
    
    var div = document.getElementById('tooltip');
    div.style.left = event.pageX -200 +'px';
    div.style.top = event.pageY -200 + 'px';

    d3.select(this.parentNode.appendChild(this)).transition().duration(300)
        .style({'stroke-width':'1.3px','stroke':'black'});
  };

function draw_chart(tooltip_selection, d) {

    var le_data = [{ quartile: 'Q1', sex: 'f', le: d.properties.le_raceadj_q1_F},
                  { quartile: 'Q2', sex: 'f', le: d.properties.le_raceadj_q2_F},
                  { quartile: 'Q3', sex: 'f', le: d.properties.le_raceadj_q3_F},
                  { quartile: 'Q4', sex: 'f', le: d.properties.le_raceadj_q4_F},
                  { quartile: 'Q1', sex: 'm', le: d.properties.le_raceadj_q1_M},
                  { quartile: 'Q2', sex: 'm', le: d.properties.le_raceadj_q2_M},
                  { quartile: 'Q3', sex: 'm', le: d.properties.le_raceadj_q3_M},
                  { quartile: 'Q4', sex: 'm', le: d.properties.le_raceadj_q4_M}
                  ];

    var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 300 - margin.left - margin.right,
    height = 150 - margin.top - margin.bottom;

    var x0 = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

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

    var svg = tooltip_selection.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x0.domain(["Q1", "Q2", "Q3", "Q4"]);
    y.domain([70, 90]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        //.attr("transform", "rotate(-90)")
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
        .attr("width", 10)
        .attr("x", function(d) { if (d.sex == 'm') {
                    return x0(d.quartile) + 10 ; 
                  } else if (d.sex == 'f'){
                    return x0(d.quartile) + 20; 
                  }
                })
        .attr("y", function(d) { return y(d.le); })
        .attr("height", function(d) { return height - y(d.le); })
        .style("fill", function(d) { return color(d.sex); });

    quartile.append("text")
        .attr("x", function(d) { if (d.sex == 'm') {
                    return x0(d.quartile) - 3; 
                  } else if (d.sex == 'f'){
                    return x0(d.quartile) + 20; 
                  }
                })
        .attr("y", function(d) { return y(d.le) - 2; })
        .style("font-size","11px")
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

d3.json("cz_and_states_data.json", function(error, data) {

  
  if (error) return console.error(error);

  var commuting_zones = topojson.feature(data, data.objects.commuting_zones).features,
      states = topojson.feature(data, data.objects.states);

  var color = d3.scale.quantize()
  .range(["#a50026","#d73027","#f46d43","#fdae61","#fee08b","#ffffbf","#d9ef8b","#a6d96a","#66bd63","#1a9850","#006837"])
  .domain([d3.min(commuting_zones, function(d) { return d.properties.le_raceadj_q1_F}), d3.max(commuting_zones, function(d) { return d.properties.le_raceadj_q1_F})]);

  svg.selectAll("path")
      .data(commuting_zones)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", function(d) { 
            var value = d.properties.le_raceadj_q1_F;

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
      .on("click", click)
      ;

  svg.append("path")
      .data([states])
      .attr("d", path)
      .attr("class", "state");

  // drawing legend --> NEED TO MAKE DYNAMIC
  var legend_labels = ["78", "79", "80", "81", "82",
                        "83", "84", "85", "86"];
  var ls_w = 60, ls_h = 20;

  var legend = svg.selectAll("svg")
    .data(([78, 79, 80, 81, 82, 83, 84, 85, 86]))
    .enter()
    .append("svg")
    .attr("class", "legend");

  legend.append("rect")
    .attr("y", 750)
    .attr("x", function(d, i){ return height - (i*ls_w) + 100;})
    .attr("width", ls_w)
    .attr("height", ls_h)
    .style("fill", function(d, i) { return color(d); })
    .style("opacity", 0.8);

  legend.append("text")
    .attr("y", 790)
    .attr("x", function(d, i){ return height - (i*ls_w) + 120 ;})
    .text(function(d, i){ return legend_labels[i]; });
     
});

function get_le_name(sex_value, quartile_value){
  var sex_code;

  if (sex_value == 'male'){
    sex_code = 'M';
  } else {
    sex_code = 'F';
  }

  var le_name = 'le_raceadj_' + quartile_value + '_' + sex_code;

  console.log('New le_name is ' + le_name);

  return le_name;
}

function change_map_sex(sex_value) {

  var le_name = get_le_name(sex_value, "q1");

  d3.json("cz_and_states_data.json", function(error, data) {
  
  if (error) return console.error(error);

  var commuting_zones = topojson.feature(data, data.objects.commuting_zones).features,
      states = topojson.feature(data, data.objects.states);

  var color = d3.scale.quantize()
    .range(["#a50026","#d73027","#f46d43","#fdae61","#fee08b","#ffffbf","#d9ef8b","#a6d96a","#66bd63","#1a9850","#006837"])
    .domain([d3.min(commuting_zones, function(d) { return d.properties[le_name]}), d3.max(commuting_zones, function(d) { return d.properties[le_name]})]);

  svg.selectAll("path")
      .data(commuting_zones)
      //.enter()
      //.append("path")
      //.attr("d", path)
      .attr("fill", function(d) { 
            var value = d.properties[le_name];
            if (value) {
              return color(value);
            } else {
              return "#f2ebeb";
            }
       })
      /*.attr("class", "cz")
      .on("mouseover", hover)
      .on("mouseout", function() { 
        d3.select("#tooltip").classed("hidden", true);
        d3.select(this).transition().duration(300)
        .style({'stroke-width':'.5px','stroke':'white'})
      })
      .on("click", click);*/


  svg.append("path")
      .data([states])
      .attr("d", path)
      .attr("class", "state");


     
});



}