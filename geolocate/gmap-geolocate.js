geoLocate = function() {
	var myLocation;
	var locationIcon = new google.maps.MarkerImage("/img/marker-location.png", new google.maps.Size(40, 40), new google.maps.Point(0, 0), new google.maps.Point(20, 20), new google.maps.Size(40, 40));

	var browserSupportFlag = new Boolean();
	var queryDevice = function(callback) {
			if (navigator.geolocation) {
				// Try W3C Geolocation (Preferred)
				browserSupportFlag = true;
				navigator.geolocation.getCurrentPosition(function(position) {
					myLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
					$.ajax({
						type: 'post',
						url: '/script/process-request.php',
						data: {
							lat: position.coords.latitude,
							lng: position.coords.longitude
						},
						success: function(data) {
							//							console.log(data);
						}
					});
					callback(myLocation);
				}, function() {
					loading.done("Couldn't find you, try again.");
					myLocation = "Unknown";
				});
			} else {
				// Browser doesn't support Geolocation
				browserSupportFlag = false;
				if (browserSupportFlag == true) {
					loading.done("Couldn't find you, try again.");
					myLocation = "Unknown";
				} else {
					loading.done("Your device doesn't support geolocation.");
					myLocation = "Unknown";
				}
			}
			return myLocation;
		};

	var radiusOverlay = new google.maps.Circle({
		strokeColor: "#0dccd8",
		strokeOpacity: 0.5,
		strokeWeight: 1,
		fillColor: "#0dccd8",
		fillOpacity: 0.2,
		//		map: map,
		center: new google.maps.LatLng('44.967', '-103.767'),
		radius: 2000,
		zIndex: 1,
		clickable: false
	});

	var plotLocationOnMap = function(map, newCenter, myradii) {
			//			var newCenter = new google.maps.LatLng(mylat, mylng);
			var radii = myradii;
			if (typeof myradii === 'undefined') {
				radii = 2000
			};
			radiusOverlay.setRadius(radii);
			radiusOverlay.setCenter(newCenter);
			radiusOverlay.setMap(map);

			if (geoLocate.tracking.locationMarker) {
				geoLocate.tracking.locationMarker.setOptions({
					position: newCenter
				});
			} else {
				geoLocate.tracking.locationMarker = new google.maps.Marker({
					position: newCenter,
					map: map,
					animation: google.maps.Animation.DROP,
					icon: locationIcon,
					clickable: false
				});
			};
		};

	var closeCircle = function() {
			var interval = 35;
			var animation = setInterval(shrinkCircle, interval);
			var reduction = radiusOverlay.getRadius() / interval;

			function shrinkCircle() {
				radiusOverlay.setRadius(radiusOverlay.getRadius() - reduction);
				if (radiusOverlay.getRadius() <= 0) {
					radiusOverlay.setRadius(0);
					radiusOverlay.setMap(null);
					clearInterval(animation);
					delete animation;
				}
			}
		};

	return {
		tracking: {},
		getGLatLng: queryDevice,
		plotMapStart: plotLocationOnMap,
		plotMapComplete: closeCircle
	}

}();
