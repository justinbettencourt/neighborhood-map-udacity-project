var map;
var markers = [];
var london = {lat: 42.984938, lng: -81.245313};

// This is the funtion that handles the marker animation.
function toggleBounce(marker) {
	if(marker.getAnimation() !== null) {
		marker.setAnimation(null);
	} else {
		marker.setAnimation(google.maps.Animation.BOUNCE);
		setTimeout(function(){ marker.setAnimation(null); }, 1450);
	}
}

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
		var address = coffeeShopLocations[i].address;
		var phone = coffeeShopLocations[i].phone;
		// Create a marker for each location in the list.
		var marker = new google.maps.Marker({
			position: position,
			map: map,
			title: title,
			address: address,
			phone: phone,
			animation: google.maps.Animation.DROP
		});

		// For each marker in the for loop, set it as its own identity of the marker variable above.
		coffeeShopLocations[i].marker = marker;

		marker.addListener('click', function() {
			populateInfoWindow(this, infoWindow);
			toggleBounce(this, marker)
		});		
	}
	ko.applyBindings(new myViewModel());
}

// Handles the data to be set into the observableArray.
var listView = function(data) {
	this.title = data.title;
	this.location = data.location;
	this.marker = data.marker;
}

/*** VIEW MODEL ***/
var myViewModel = function() {
	var self = this;
	var infoWindow = new google.maps.InfoWindow();
	
	self.list = ko.observableArray([]);

	// Push data in listView to observableArray "list".
	coffeeShopLocations.forEach(function(item) {
		self.list.push(new listView(item));
	});

	self.selectedCoffeeShop = function () {
		populateInfoWindow(this.marker, infoWindow);
		toggleBounce(this.marker);
	}

	self.filter = ko.observable('');

	// By using the ko.computed function, we can allow knockout.js to update itself every time the search has changed. The filter will come shortly once we get the list working as intended.
	self.coffeeShopList = ko.computed(function(){
        var filter = self.filter();
        // If there is no filter, display all the contents on the list.
        if(!filter){
            self.list().forEach(function(item){
            	if (item.marker == true) {
                	item.marker.setVisible(true);
                }
            });
			return self.list();
        } else {
			var filteredArray = ko.utils.arrayFilter(self.list(), function(item) {
				if(item.title.toLowerCase().indexOf(filter) !== -1) {
					item.marker.setVisible(true);
					return true;
				} else { 
					item.marker.setVisible(false);
					return false;
				}
			});

			return filteredArray;
		}
    });
}

// This function gets called above when a marker is clicked. It'll display the information for the location selected inside of an InfoWindow.
function populateInfoWindow(marker, infoWindow) {
	// Check to make sure the infoWindow isn't already open for this marker.
	if(infoWindow.marker != marker) {
		infoWindow.setContent('');
		infoWindow.marker = marker;
		// Clear the marker property when the window closes.
		infoWindow.addListener('closeClick', function() {
			infoWindow.marker = null;
		});

		// Lets add the street view service to the project.
		var streetViewService = new google.maps.StreetViewService();
		var radius = 50;
		
		// Lets get the streetview data we need and create the contents inside the window.
		function getStreetView(data, status) {
			if(status == google.maps.StreetViewStatus.OK) {
				var nearStreetViewLocation = data.location.latLng;
				var heading = google.maps.geometry.spherical.computeHeading(nearStreetViewLocation, marker.position);
				infoWindow.setContent(
						'<h3>' + marker.title + '</h3>' +
						'<ul class="list"><li>' + marker.address + '</li>' +
						'<li>' + marker.phone + '</li></ul>' +
						'<br>' +
						'<div id="panorama"></div>'
					);
				var panoramaOptions = {
					position: nearStreetViewLocation,
					pov: {
						heading: heading,
						pitch: 0
					}
				};

				var panorama = new google.maps.StreetViewPanorama(document.getElementById('panorama'), panoramaOptions);
			} else {
				infoWindow.setContent('<div>' + marker.title + '</div>' + '<div>No Street View Found</div>');
			}
		}

		streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);

		infoWindow.open(map, marker);
	}
}

function googleError() {
	alert("Sorry, we were unable to load Google Maps.");
}
