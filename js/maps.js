function initMap() {
	var home = {lat: 42.958953, lng: -81.270654};
	var map = new google.maps.Map(document.getElementById('map'), {
		zoom: 15,
		center: home
	});
	var marker = new google.maps.Marker({
		position: home,
		map: map
	});
}