var select_state, $select_state;
var select_city, $select_city;

d3.csv("data/cz_names_and_states.csv", function(names) {

    $select_state = $('#select-state').selectize({
        create: false,
        persist: false, 
        maxItems: 1,
        maxOptions: null,
        closeAfterSelect: true,
        sortField: {field: 'state'},
        valueField: 'state',
        labelField: 'state',
        searchField: ['state'],

        // Details
        options: names,
        onChange: function(state_selection) {
            if (!state_selection.length) return;
            select_city.disable();
            select_city.clearOptions();
            select_city.load(function(callback) {
                    select_city.enable();
                    //callback(names); // Filter by state 
                    callback(names.filter(function(d) {
                        return d.state == state_selection;
                    }));
            });
            update_state(state_selection);
        }
    });

    $select_city = $('#select-city').selectize({
        create: false,
        persist: false, 
        maxItems: 1,
        maxOptions: null,
        closeAfterSelect: true,
        sortField: {field: 'city'},
        valueField: 'city',
        labelField: 'city',
        searchField: ['city'],   
        
        // Details
        onChange: function(cz_selection){
            update_cz(cz_selection);
            update_current_selection(current_cz_selection + ", " + current_state_selection);
            if (current_cz_selection.length > 0) {
                update_table();
                update_chart();
            }
        }

    });

    select_city  = $select_city[0].selectize;
    select_state = $select_state[0].selectize;

    select_city.disable();

});