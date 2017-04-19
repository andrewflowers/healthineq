var lat, lng, geocoder, google_map, google_map_marker, center;

// Create the Google Map
// Remove &callback=initMap
function initMap(lat = 42.143399599999995, lng = -71.2528944) {
  
  var map_center = {lat: lat, lng: lng};
  
  google_map = new google.maps.Map(document.getElementById('google-map'), {
    zoom: 8,
    center: map_center
  });
  
  google_map_marker = new google.maps.Marker({
    position: map_center,
    map: google_map
  });
}

initMap();

// Geolocation of selected CZ

function geocode_from_CZ_and_update_map() {
    geocoder =  new google.maps.Geocoder()

    geocoder.geocode( { 'address': current_cz_selection + ', ' + current_state_selection}, function(results, status) {
          
          if (status == google.maps.GeocoderStatus.OK) {
            center = results[0].geometry.location;
            lat = results[0].geometry.location.lat();
            lng = results[0].geometry.location.lng();

            google_map.setCenter(center);
            google_map_marker.setPosition(center);
            console.log({lat, lng});

          } else {
            alert("Something got wrong " + status);
          }
        });
}