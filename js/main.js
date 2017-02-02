var map;
var markers = [];
var marker;
var london = {lat: 42.984938, lng: -81.245313};

function initMap() {
	// First we will create the map and center it to the location we want. 
	var map = new google.maps.Map(document.getElementById('map'), {
		zoom: 16,
		center: london,
		mapTypeControl: false
	});
	
	var currentMarker = null;
	var infoWindow = new google.maps.InfoWindow();	

	// We're going to create a for loop to loop through all the data in the locationData.js file.
	for (var i = 0; i < coffeeShopLocations.length; i++) {
		// Create a marker for each location in the list.
		marker = new google.maps.Marker({
			position: new google.maps.LatLng(coffeeShopLocations[i].location),
			map: map,
			title: coffeeShopLocations[i].title,
			address: coffeeShopLocations[i].address,
			phone: coffeeShopLocations[i].phone,
			id: coffeeShopLocations[i].fourSquareVenueID,
			animation: google.maps.Animation.DROP
		});

		// For each marker in the for loop, set it as its own identity of the marker variable above.
		coffeeShopLocations[i].marker = marker;

		/*Populates the markers array with each marker*/
        markers.push(marker);

		marker.addListener('click', function() {
			populateInfoWindow(this, infoWindow);
			//toggleBounce(this, marker)
		});
	}
	ko.applyBindings(new myViewModel());
}

// Handles the data to be set into the observableArray.
var listView = function(data) {
	this.title = data.title;
	this.location = data.location;
	this.address = data.address;
	this.phone = data.phone;
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
		//toggleBounce(this.marker);
	}

	self.filter = ko.observable('');

	// By using the ko.computed function, we can allow knockout.js to update itself every time the search has changed. The filter will come shortly once we get the list working as intended.
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
var populateInfoWindow = function (marker, infoWindow) {
		var apiURL = 'https://api.foursquare.com/v2/venues/';
		var foursquareClientID = '2KCAL0D3NEY35MSUQZHZUW2OHI0QXNV3VH0G2F231EDKWNJU'
		var foursquareSecret ='4L4ML34GJ3BAHSMOBWKH1R4UX30EDUXF5Q3GL3ERWFSEGOFN';
		var foursquareVersion = '20170115';
		var venueFoursquareID = marker.id;
		var foursquareURL = apiURL + venueFoursquareID + '?client_id=' + foursquareClientID +  '&client_secret=' + foursquareSecret +'&v=' + foursquareVersion;
		//var infoWindow = new google.maps.InfoWindow();
		
		if(infoWindow.marker != marker) {
			infoWindow.setContent('');
			infoWindow.marker = marker;
			// Clear the marker property when the window closes.
			infoWindow.addListener('closeClick', function() {
				infoWindow.marker = null;
			});
		
			/*async request for the FourSquare api data*/
			$.ajax({
				url: foursquareURL,
				success: function(data) {
					console.log(data);
				
					var name =  data.response.venue.name;
					var phone = data.response.venue.contact.phone;
					var location = data.response.venue.location.address;
					var rating = data.response.venue.rating;

					/*The infowindow is udpdated with the FourSquare api data and the infowindow is opened immediately afterwards*/
					infoWindow.setContent(
						'<h3>' + name + '</h3>' +
						'<ul class="list"><li>' + location + '</li>' +
						'<li>' + phone + '</li>' +
						'<li>' + rating.toString() + '</li></ul>' +
						'<br>' +
						'<div id="panorama"></div>' +
						'<br>Powered by Foursquare and Google Maps'
					);
					infoWindow.open(map, marker);
				},
				/*Foursquare api error handling*/
				error: function(error) {
					alert("Sorry, could not retrieve Foursquare API.")
				}
			});
		}
}

function googleError() {
	alert("Sorry, we were unable to load Google Maps.");
}
