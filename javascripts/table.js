// Table 

    // Default selection
    var selection = "Johnson City, TN"; 

    function update_location(location){
        selection = location;
    }

    var health_data;

    function get_selected_data(selection) {
    
        return health_data.filter(function(d) { 
            return d.location == selection;
        })

    }

    function calcSimilarity(selection) {
    
        var selected_data = get_selected_data(selection);
        
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
        { head: 'Location', cl: 'title', html: ƒ('location') },
        { head: 'Smoking', cl: 'num', html: ƒ('cur_smoke_q1', d3.format('.3f')) },
        { head: 'Obesity', cl: 'num', html: ƒ('bmi_obese_q1', d3.format('.3f')) },
        { head: 'Exercise', cl: 'num', html: ƒ('exercise_any_q1', d3.format('.3f')) },
        { head: 'Poverty', cl: 'num', html: ƒ('poor_share', d3.format('.3f')) },
        { head: 'Similarity Score', cl: 'num', html: ƒ('similarity', d3.format('.3f')) }
    ];

    // Create table
    var table, similarity_scores;

    d3.csv("cz_health_and_demo_data.csv", function(data) {
        
        health_data = data;

        similarity_scores = calcSimilarity(selection);

        health_data.forEach(function(cz, i) {
            cz.similarity = similarity_scores[i];
        })

        // health_data = health_data.slice(0,49);
    
        d3.select("body").append("div")
          .attr("id", "container")

        d3.select("#container").append("div")
          .attr("id", "FilterableTable");

        table = d3.select("#FilterableTable").append("table"); 

        table.append('thead').append('tr')
            .selectAll('th')
            .data(columns).enter()
            .append('th')
            .attr('class', ƒ('cl'))
            .text(ƒ('head'));

        // create table body
        table.append('tbody')
            .selectAll('tr')
            .data(health_data.sort(function(a, b){
                return a.similarity - b.similarity;
            }).filter(function(d, i) {
              return i < 20;  
            }))
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
            .html(ƒ('html'))
            .attr('class', ƒ('cl'));

        d3.select("#search")
            .on("keyup", function() { 
            var text = this.value.trim();
            console.log(text);
        });

    });

    function update_table() {

        similarity_scores = calcSimilarity(selection);

        health_data.forEach(function(cz, i) {
            cz.similarity = similarity_scores[i];
        }) 

        // health_data = health_data.slice(0,49);

        // create heatmap scale
        var similarity_scale = d3.scale.linear()
            .domain([0, d3.max(similarity_scores, function(d) { return d;})])
            .range(["red","steelblue"]);


        // update table body
        table.selectAll('tr')
            .data(health_data.sort(function(a, b){
                return a.similarity - b.similarity;
            }).filter(function(d, i) {
              return i < 20;  
            }))
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
                if(d.head == "Similarity Score"){
                    return similarity_scale(d.html)
                }
            })
            .html(ƒ('html'))
            .attr('class', ƒ('cl'));

    }