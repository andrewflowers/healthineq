var input = document.getElementById("myinput");
      var awesomplete = new Awesomplete(input, {
        minChars: 1,
        maxItems: 15,
        autoFirst: true
      });

d3.csv("data/cz_names_and_states.csv", function(data) {
  var cz_and_state_names = data.map(function(cz) { return cz['cz_and_state'];});

  awesomplete.list = cz_and_state_names;
});

$('input').on('awesomplete-selectcomplete', function(){
  dehighlight_cz_selection();

  update_current_selection(this.value); 
  update_cz(current_selection.split(", ")[0]);
  update_state(current_selection.split(", ")[1]);

  geocode_from_CZ_and_update_map();

  update_table();
  update_chart();
  
  update_selection_text();
  highlight_cz_selection();

});