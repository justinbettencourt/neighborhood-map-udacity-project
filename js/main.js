var map;
var markers = [];
var london = {lat: 42.984938, lng: -81.245313};

function initMap() {
	// First we will create the map and center it to the location we want. 
	var map = new google.maps.Map(document.getElementById('map'), {
		zoom: 16,
		center: london,
		mapTypeControl: false
	});

	var infoWindow = new google.maps.InfoWindow();

	var bounds = new google.maps.LatLngBounds();

	// We're going to create a for loop to loop through all the data in the locationData.js file.
	for (var i = 0; i < coffeeShopLocations.length; i++) {
		// Set the position data from the coffeeShopLocations array.
		var position = coffeeShopLocations[i].location;
		// Set the title of the location into the title variable.
		var title = coffeeShopLocations[i].title;

		// Create a marker for each location in the list.
		var marker = new google.maps.Marker({
			position: position,
			map: map,
			title: title,
			animation: google.maps.Animation.DROP
		});

		markers.push(marker);

		marker.addListener('click', function() {
			// populateInfoWindow(this, infoWindow);
		});

		bounds.extend(markers[i].position);
	}

}