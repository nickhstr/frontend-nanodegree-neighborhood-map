function initMap() {
  var mapDiv = document.getElementById('map');
  var map = new google.maps.Map(mapDiv, {
    center: {lat: 37.7733, lng: -122.4367},
    zoom: 12
  });
}