// Table 

// Global variables and helper functions
var health_data, selected_health_data, subset_health_data, 
    table, similarity_scores, heatmap_color, num_cz_table = 21;

function get_selected_data(selected_location) {
    return health_data.filter(function(d) { 
        return d.location == selected_location;
    })
}

function calc_similarity() {
    var selected_data = get_selected_data(current_selection);
    
    return health_data.map(function(d, i) {
        return Math.pow((selected_data[0].asian - d.asian), 2) +
            Math.pow((selected_data[0].black - d.black), 2) +
            Math.pow((selected_data[0].white - d.white), 2) +
            Math.pow((selected_data[0].hispanic - d.hispanic), 2) +
            Math.pow((selected_data[0].male - d.male), 2) +
            Math.pow((selected_data[0].age_0_to_19 - d.age_0_to_19), 2) +
            Math.pow((selected_data[0].age_20_to_39 - d.age_20_to_39), 2) +
            Math.pow((selected_data[0].age_40_to_64 - d.age_40_to_64), 2) +
            Math.pow((selected_data[0].age_over_64 - d.age_over_64), 2);
    })
}

// Table column headers
var columns = [
    { head: 'Location', cl: 'title', html: ƒ('location'), var: 'location' },
    { head: 'Life expectancy', cl: 'num', html: ƒ(current_le_selection, d3.format('.1f')), var: current_le_selection, raw: ƒ(current_le_selection) },
    { head: 'Uninsured', cl: 'num', html: ƒ('puninsured2010', d3.format('.1%')), var: "puninsured2010", raw: ƒ('puninsured2010', d3.format('.5f'))},
    { head: 'Smoking', cl: 'num', html: ƒ('cur_smoke_q1', d3.format('.1%')), var: "cur_smoke_q1", raw: ƒ('cur_smoke_q1', d3.format('.5f'))},
    { head: 'Obesity', cl: 'num', html: ƒ('bmi_obese_q1', d3.format('.1%')), var:  "bmi_obese_q1", raw: ƒ('bmi_obese_q1', d3.format('.5f'))},
    { head: 'Exercised', cl: 'num', html: ƒ('exercise_any_q1', d3.format('.1%')), var: "exercise_any_q1", raw: ƒ('exercise_any_q1', d3.format('.5f'))},
    { head: 'Poverty Rate', cl: 'num', html: ƒ('poor_share', d3.format('.1%')), var: "poor_share", raw: ƒ('poor_share', d3.format('.5f'))},
    //{ head: 'Similarity Score', cl: 'num', html: ƒ('similarity', d3.format('.3f')) }
];

function update_table_columns() {

    columns = [
    { head: 'Location', cl: 'title', html: ƒ('location'), var: 'location' },
    { head: 'Life expectancy', cl: 'num', html: ƒ(current_le_selection, d3.format('.1f')), var: current_le_selection, raw: ƒ(current_le_selection) },
    { head: 'Uninsured', cl: 'num', html: ƒ('puninsured2010', d3.format('.1%')), var: "puninsured2010", raw: ƒ('puninsured2010', d3.format('.5f'))},
    { head: 'Smoking', cl: 'num', html: ƒ('cur_smoke_q1', d3.format('.1%')), var: "cur_smoke_q1", raw: ƒ('cur_smoke_q1', d3.format('.5f'))},
    { head: 'Obesity', cl: 'num', html: ƒ('bmi_obese_q1', d3.format('.1%')), var:  "bmi_obese_q1", raw: ƒ('bmi_obese_q1', d3.format('.5f'))},
    { head: 'Exercised', cl: 'num', html: ƒ('exercise_any_q1', d3.format('.1%')), var: "exercise_any_q1", raw: ƒ('exercise_any_q1', d3.format('.5f'))},
    { head: 'Poverty Rate', cl: 'num', html: ƒ('poor_share', d3.format('.1%')), var: "poor_share", raw: ƒ('poor_share', d3.format('.5f'))},
    //{ head: 'Similarity Score', cl: 'num', html: ƒ('similarity', d3.format('.3f')) }
    ];
}

// Heatmap color scale
heatmap_color = d3.scale.linear()
    .range(["#FFFFDD","#AAF191","#80D385","#61B385","#3E9583","#217681","#285285","#1F2D86","#000086"])
    .interpolate(d3.interpolateHcl);

// Create table
d3.csv("data/cz_health_demo_le_data.csv", function(data) {
    
    health_data = data;

    similarity_scores = calc_similarity();

    health_data.forEach(function(cz, i) {
        cz.similarity = similarity_scores[i];
    })

    selected_health_data = get_selected_data(current_selection)[0];

    subset_health_data = health_data.sort(function(a, b){
            return a.similarity - b.similarity;
        }).filter(function(d, i) {
          return i < num_cz_table;  
        });

    d3.select("body").append("div")
        .attr("id", "container");

    d3.select("#container").append("div")
      .attr("id", "FilterableTable");

    table = d3.select("#FilterableTable").append("table"); 

    table.append('thead').append('tr')
        .selectAll('th')
        .data(columns).enter()
        .append('th')
        .attr('class', ƒ('cl'))
        .text(ƒ('head'));

    table.append('tbody')
        .append('tr')
            .attr('id', 'selected_tr')
        .data(selected_health_data)
        .enter()
        .append('tr');

    table.select("#selected_tr")
        .append("td")
            .attr("class", "title")
            .html(selected_health_data.location);

    table.select("#selected_tr")
        .append("td")
            .attr("class", "num le")
            .html(d3.format(".1f")(selected_health_data[current_le_selection]));

    table.select("#selected_tr")
        .append("td")
            .attr("class", "num ins")
            .html(d3.format(".1%")(selected_health_data.puninsured2010));

    table.select("#selected_tr")
        .append("td")
            .attr("class", "num smo")
            .html(d3.format(".1%")(selected_health_data.cur_smoke_q1));

    table.select("#selected_tr")
        .append("td")
            .attr("class", "num bmi")
            .html(d3.format(".1%")(selected_health_data.bmi_obese_q1));

    table.select("#selected_tr")
        .append("td")
            .attr("class", "num ex")
            .html(d3.format(".1%")(selected_health_data.exercise_any_q1));

    table.select("#selected_tr")
        .append("td")
            .attr("class", "num poor")
            .html(d3.format(".1%")(selected_health_data.poor_share));

    table.select('tbody')
        .selectAll('tr')
        .data(subset_health_data)
        .enter()
        .append('tr')
        .selectAll('td')
        .data(function(row, i) {
            return columns.map(function(c) {
                // compute cell values for this specific row
                var cell = {};
                d3.keys(c).forEach(function(k) {
                    cell[k] = typeof c[k] == 'function' ? c[k](row,i) : c[k];
                });
                return cell;
            });
        }).enter()
        .append('td')
        .attr("bgcolor", function(d,i){ 
            var column_vars = columns.map(function(d) { return d.var;});

            for (i = 2; i < column_vars.length; i++) {
                //var column_var = "poor_share";
                var column_var = column_vars[i];

                if(d.var == column_var){
                    heatmap_color.domain(d3.extent(subset_health_data.map(function(d){return d[column_var];}).map(Number)));
                    
                    if (typeof d.raw != "undefined"){
                        return heatmap_color(d.raw);    
                    }
                    
                } 
            }
        })
        .html(ƒ('html'))
        .attr('class', ƒ('cl'));
});

function update_table() {

    update_table_columns();

    similarity_scores = calc_similarity();

    health_data.forEach(function(cz, i) {
        cz.similarity = similarity_scores[i];
    }) 

    subset_health_data = health_data.sort(function(a, b){
        return a.similarity - b.similarity;
    }).filter(function(d, i) {
      return i < num_cz_table;  
    });

    selected_health_data = get_selected_data(current_selection)[0];

    // Update table body
    table.selectAll('tr:not(#selected_tr)')
        .data(subset_health_data)
        .selectAll('td')
        .data(function(row, i) {
            return columns.map(function(c) {
                // compute cell values for this specific row
                var cell = {};
                d3.keys(c).forEach(function(k) {
                    cell[k] = typeof c[k] == 'function' ? c[k](row,i) : c[k];
                });
                return cell;
            });
        })
        .attr("bgcolor", function(d,i){ 
            var column_vars = columns.map(function(d) { return d.var;});

            for (i = 2; i < column_vars.length; i++) {
                //var column_var = "poor_share";
                var column_var = column_vars[i];

                if(d.var == column_var){
                    heatmap_color.domain(d3.extent(subset_health_data.map(function(d){return d[column_var];}).map(Number)));
                    return heatmap_color(d.raw);
                } 
            }
        })
        .html(ƒ('html'))
        .attr('class', ƒ('cl'));

    // Update selected row

    table.select("#selected_tr .title")
        .html(selected_health_data.location);

    table.select("#selected_tr .le")
        .html(d3.format(".1f")(selected_health_data[current_le_selection]));

    table.select("#selected_tr .ins")
        .html(d3.format(".1%")(selected_health_data.puninsured2010));

    table.select("#selected_tr .smo")
        .html(d3.format(".1%")(selected_health_data.cur_smoke_q1));

    table.select("#selected_tr .bmi")
        .html(d3.format(".1%")(selected_health_data.bmi_obese_q1));

    table.select("#selected_tr .ex")
        .html(d3.format(".1%")(selected_health_data.exercise_any_q1));

    table.select("#selected_tr .poor")
        .html(d3.format(".1%")(selected_health_data.poor_share));

}