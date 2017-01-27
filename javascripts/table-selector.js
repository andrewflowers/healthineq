                var select_state, $select_state;
                var select_city, $select_city;
                var current_state, current_city;

                function update_state(state_selection){
                    current_state = state_selection;  
                }

                function update_city(city_selection){
                    current_city = city_selection;  
                }

                d3.csv("cz_names_and_states.csv", function(names) {
                
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
                        onChange: function(city_selection){
                            update_city(city_selection);
                            update_location(current_city + ", " + current_state);
                            if (current_city.length > 0) update_table();
                        }

                    });

                    select_city  = $select_city[0].selectize;
                    select_state = $select_state[0].selectize;

                    select_city.disable();

                });


    var update_selections = function(cz, state) {



    }