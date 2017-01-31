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

		// For each marker in the for loop, set it as its own identity of the marker variable above.
		coffeeShopLocations[i].marker = marker;

		marker.addListener('click', function() {
			// populateInfoWindow(this, infoWindow);
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

	self.list = ko.observableArray([]);

	// Push data in listView to observableArray "list".
	coffeeShopLocations.forEach(function(item) {
		self.list.push(new listView(item));
	});

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
        } 
    });
}