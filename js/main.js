var markers = [];
var london = {lat: 42.984938, lng: -81.245313};
// This is the funtion that handles the marker animation. This gets called whenever you open an infoWindow.
function toggleBounce(marker) {
	if(marker.getAnimation() !== null) {
		marker.setAnimation(null);
	} else {
		marker.setAnimation(google.maps.Animation.BOUNCE);
		setTimeout(function(){ marker.setAnimation(null); }, 700);
	}
}
// Initialize the map data.
function initMap() {
	// First we will create the map and center it to the location we want. 
	var map = new google.maps.Map(document.getElementById('map'), {
		zoom: 16,
		center: london,
		mapTypeControl: false
	});
	var infoWindow = new google.maps.InfoWindow();	
	// We're going to create a for loop to loop through all the data needed from the locationData.js file.
	for (var i = 0; i < coffeeShopLocations.length; i++) {
		// Create a marker for each location in the list.
		marker = new google.maps.Marker({
			position: new google.maps.LatLng(coffeeShopLocations[i].location),
			map: map,
			title: coffeeShopLocations[i].title,
			id: coffeeShopLocations[i].venueID,
			animation: google.maps.Animation.DROP
		});
		// For each marker in the for loop, set it as its own identity of the marker variable above.
		coffeeShopLocations[i].marker = marker;
        markers.push(marker);
		// When a marker on the map is clicked, open up the infoWindow that corresponds to the marker.
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
	this.marker = data.marker;
}
// This is the view model. It will handle anything that updates the view of the app.
var myViewModel = function() {
	var self = this;
	var infoWindow = new google.maps.InfoWindow();
	self.list = ko.observableArray([]);
	// Push data in listView to observableArray "list".
	coffeeShopLocations.forEach(function(item) {
		self.list.push(new listView(item));
	});
	// This allows the items in the list to be clickable and pop up the infoWindow.
	self.selectedCoffeeShop = function () {
		populateInfoWindow(this.marker, infoWindow);
		toggleBounce(this.marker);
	}
	self.filter = ko.observable('');
	// By using the ko.computed function, we can allow knockout.js to update itself every time the search has changed.
	self.coffeeShopList = ko.computed(function(){
        var filter = self.filter();
        // If there is no filter, display all the contents on the list.
        if(!filter){
            self.list().forEach(function(item){
            	if (item.marker != true) {
                	item.marker.setVisible(true);
                }
            });
			return self.list();
        } else {
			// If there is a character in the filter, begin filtering the items based on the first letter inserted.
			var filteredList = ko.utils.arrayFilter(self.list(), function(item) {
				if(item.title.toLowerCase().indexOf(filter) !== -1) {
					item.marker.setVisible(true);
					return true;
				} else { 
					item.marker.setVisible(false);
					return false;
				}
			});
			return filteredList;
		}
    });
}
// This function gets called above when a marker is clicked. It'll display the information for the location selected inside of an InfoWindow.
var populateInfoWindow = function (marker, infoWindow) {
		// Lets create the variables needed for the Foursquare API. We need the first bit of the url, the venueID carried down from the marker data, the clientID and clientSecret ID's. Then we'll stitch them together and create the full URL ending with the version number so the API knows not to get anything past the data assigned (this will keep it from breaking anything in the future).
		var fsUrl = 'https://api.foursquare.com/v2/venues/';
		var venueID = marker.id;
		var clientID = '2KCAL0D3NEY35MSUQZHZUW2OHI0QXNV3VH0G2F231EDKWNJU'
		var clientSecret ='4L4ML34GJ3BAHSMOBWKH1R4UX30EDUXF5Q3GL3ERWFSEGOFN';
		var URL = fsUrl + venueID + '?client_id=' + clientID +  '&client_secret=' + clientSecret +'&v=20170202';
		// Check to see if there is a marker already open. If so, close it before moving onto opening a new one.
		if(infoWindow.marker != marker) {
			infoWindow.setContent('');
			infoWindow.marker = marker;
			// Clear the marker property when the window closes.
			infoWindow.addListener('closeClick', function() {
				infoWindow.marker = null;
			});
			// This is the AJAX script that will retrieve the data from the Foursquare API.
			$.ajax({
				url: URL,
				success: function(data) {
					//console.log(data);
					// Lets grab the information we want from the API. I need the name of the location, the phone number, location address and rating.
					var name =  data.response.venue.name;
					var location = data.response.venue.location.address;
					var phone = data.response.venue.contact.phone;
					var rating = data.response.venue.rating;
					// We will have the streetview API in the infoWindow as well. We'll set that up now as well as the radius.
					var streetViewService = new google.maps.StreetViewService();
					var radius = 50;
					// First were getting all the information needed for the streetview API. Best to get it set up first before we call the "infoWindow.setContent".
					function getStreetView(data, status) {
						// If the status of the API is "OK", continue. Otherwise, display the alert below. 
						if (status == google.maps.StreetViewStatus.OK) {
							var nearStreetViewLocation = data.location.latLng;
							var heading = google.maps.geometry.spherical.computeHeading(nearStreetViewLocation, marker.position);
								var streetViewOptions = {
									position: nearStreetViewLocation,
									pov: {
										heading: heading,
										pitch: 0
									}
								};
								var streetView = new google.maps.StreetViewPanorama(document.getElementById("panorama"), streetViewOptions);
						} else {
							alert("Sorry, could not retrieve the Google StreetView API.");
						}
					}
					// Display the content in the infoWindow when called. This includes the information required from the Foursquare API and the Google StreetView API.
					infoWindow.setContent(
						'<h2>' + name + '</h2>' +
						'<ul class="list">' +
						'<li><b>Address: </b>' + location + '</li>' +
						'<li><b>Phone: </b>' + phone + '</li>' +
						'<li><b>Rating: </b>' + rating.toString() + '/10</li></ul>' +
						'<br>' +
						'<div id="panorama"></div>' +
						'<br>Powered by Foursquare and Google Maps'
					);
					streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
					infoWindow.open(map, marker);
				},
				error: function(error) {
					alert("Sorry, could not retrieve the Foursquare API.")
				}
			});
		}
}
// If the Google Maps API fails to load the map, display this alert.
function googleError() {
	alert("Sorry, we were unable to load Google Maps.");
}
