
var GeoLocationService = {};
GeoLocationService.lastlocation = null ;
GeoLocationService.updateSend = false ;
GeoLocationService.lastUpdateSend = null ;
GeoLocationService.headingCallback = null ;


// GeoLocationService.checkUpdateSend = function() {
	// if(GeoLocationService.updateSend == false && GeoLocationService.lastlocation !=null ){
		// //Ti.API.info("Location Update Resend");
		// GeoLocationService.locationUpdate(GeoLocationService.lastlocation);
	// }
// };

GeoLocationService.getCurrentLocationWithLookup = function(callback){
	
	Titanium.Geolocation.getCurrentPosition(function(e) {
		if (!e.success || e.error) {
			//Ti.API.info("Code translation: " + GeoLocationService.translateErrorCode(e.code));
			return;
		}
		
		if(callback){
			var coords = e.coords ;
			Titanium.Geolocation.reverseGeocoder(e.coords.latitude, e.coords.longitude, function(evt) {
				var reverseGeo = null ;
				if (evt.success) {
					var places = evt.places;
					if (places && places.length) {
						reverseGeo = places[0].address;
						coords.reverseGeo = reverseGeo ;
						callback(coords);
					} else {
						//Ti.API.info("No address found");
						reverseGeo = "No address found";
					}
					Ti.API.debug("reverse geolocation result = " + JSON.stringify(evt));
				} else {
					//Ti.API.info("Code translation: " + GeoLocationService.translateErrorCode(evt.code));
				}
			}); 
		}

	});
};

GeoLocationService.reverseGeocoder = function(latitude,longitude,callback) {
	if(callback){
		Titanium.Geolocation.reverseGeocoder(latitude, longitude, function(evt) {
	        var reverseGeo = null;
	        if (evt.success) {
	            var places = evt.places;
	            callback({error:false,places :places});
	        }else{
	        	callback({error:true,places :places});
	        	//Ti.API.info("Code translation: " + GeoLocationService.translateErrorCode(evt.code));
	        } 
   	 	});
	}
    
};

GeoLocationService.getCurrentLocation = function(callback){
	
	Titanium.Geolocation.getCurrentPosition(function(e) {
		if (!e.success || e.error) {
			//Ti.API.info("Code translation: " + GeoLocationService.translateErrorCode(e.code));
			return;
		}
		
		if(callback){
			callback(e.coords);
		}

		GeoLocationService.locationUpdate(e.coords);

	});
};

GeoLocationService.appPaused = function(){
	//Titanium.Geolocation.removeEventListener('heading', GeoLocationService.headingCallback);
	//Titanium.Geolocation.removeEventListener('location', GeoLocationService.locationCallback);
};

GeoLocationService.appResumed = function(){
	//Titanium.Geolocation.addEventListener('heading', GeoLocationService.headingCallback);
	//Titanium.Geolocation.addEventListener('location', GeoLocationService.locationCallback);
};

GeoLocationService.headingCallback = function(e) {
				
	if (e.error) {
		//Ti.API.info("Code translation: " + translateErrorCode(e.code));
		return;
	}

	var x = e.heading.x;
	var y = e.heading.y;
	var z = e.heading.z;
	var magneticHeading = e.heading.magneticHeading;
	var accuracy = e.heading.accuracy;
	var trueHeading = e.heading.trueHeading;
	var timestamp = e.heading.timestamp;

	Titanium.API.info('geo - heading updated: ' + new Date(timestamp) + ' x ' + x + ' y ' + y + ' z ' + z);
};


GeoLocationService.init = function() {

	//
	//  SHOW CUSTOM ALERT IF DEVICE HAS GEO TURNED OFF
	//
	if (Titanium.Geolocation.locationServicesEnabled === false) {
		Titanium.UI.createAlertDialog({
			title: 'Tempo',
			message: 'Your device has geolocation services turned off - please turn it on.'
		}).show();
	} else {
		if (Titanium.Platform.name != 'android') {

			var authorization = Titanium.Geolocation.locationServicesAuthorization;
			//Ti.API.info('Authorization: ' + authorization);
			if (authorization == Titanium.Geolocation.AUTHORIZATION_DENIED) {
				Ti.UI.createAlertDialog({
					title: 'Tempo',
					message: 'You have disallowed Tempo from running geolocation services.'
				}).show();
			} else if (authorization == Titanium.Geolocation.AUTHORIZATION_RESTRICTED) {
				Ti.UI.createAlertDialog({
					title: 'Tempo',
					message: 'Your system has disallowed Tempo from running geolocation services.'
				}).show();
			}
		}

		//
		// IF WE HAVE COMPASS GET THE HEADING
		//
		if (Titanium.Geolocation.hasCompass) {
			//
			//  TURN OFF ANNOYING COMPASS INTERFERENCE MESSAGE
			//
			Titanium.Geolocation.showCalibration = false;

			//
			// SET THE HEADING FILTER (THIS IS IN DEGREES OF ANGLE CHANGE)
			// EVENT WON'T FIRE UNLESS ANGLE CHANGE EXCEEDS THIS VALUE
			Titanium.Geolocation.headingFilter = 90;

			//
			//  GET CURRENT HEADING - THIS FIRES ONCE
			//
			Ti.Geolocation.getCurrentHeading(function(e) {
				if (e.error) {
					//Ti.API.info("Code translation: " + GeoLocationService.translateErrorCode(e.code));
					return;
				}
				var x = e.heading.x;
				var y = e.heading.y;
				var z = e.heading.z;
				var magneticHeading = e.heading.magneticHeading;
				var accuracy = e.heading.accuracy;
				var trueHeading = e.heading.trueHeading;
				var timestamp = e.heading.timestamp;
				Titanium.API.info('geo - current heading: ' + new Date(timestamp) + ' x ' + x + ' y ' + y + ' z ' + z);
			});

			//
			// EVENT LISTENER FOR COMPASS EVENTS - THIS WILL FIRE REPEATEDLY (BASED ON HEADING FILTER)
			//
			
			//Titanium.Geolocation.addEventListener('heading', GeoLocationService.headingCallback);

		} else {
			Titanium.API.info("No Compass on device");
		}

		//
		//  SET ACCURACY - THE FOLLOWING VALUES ARE SUPPORTED
		//
		// Titanium.Geolocation.ACCURACY_BEST
		// Titanium.Geolocation.ACCURACY_NEAREST_TEN_METERS
		// Titanium.Geolocation.ACCURACY_HUNDRED_METERS
		// Titanium.Geolocation.ACCURACY_KILOMETER
		// Titanium.Geolocation.ACCURACY_THREE_KILOMETERS
		//
		Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_NEAREST_TEN_METERS;

		//
		//  SET DISTANCE FILTER.  THIS DICTATES HOW OFTEN AN EVENT FIRES BASED ON THE DISTANCE THE DEVICE MOVES
		//  THIS VALUE IS IN METERS
		//
		Titanium.Geolocation.distanceFilter = 100;

		Titanium.Geolocation.getCurrentPosition(function(e) {
			if (!e.success || e.error) {
				//Ti.API.info("Code translation: " + GeoLocationService.translateErrorCode(e.code));
				alert('error ' + JSON.stringify(e.error));
				return;
			}

			// removed as being called on register page
			//GeoLocationService.locationUpdate(e.coords);

		});

		
		Titanium.Geolocation.addEventListener('location', GeoLocationService.locationCallback);


	};
};

GeoLocationService.locationCallback = function(e) {
		
	//Mobileweb seems to be not firing window event for some odd reason.
	//Forcing a window open and focus event.

	if (!e.success || e.error) {
		//Ti.API.info("Code translation: " + GeoLocationService.translateErrorCode(e.code));
		return;
	}

	GeoLocationService.locationUpdate(e.coords);
};


GeoLocationService.translateErrorCode = function(code) {
	if (code == null) {
		return null;
	}
	switch (code) {
		case Ti.Geolocation.ERROR_LOCATION_UNKNOWN:
			return "Location unknown";
		case Ti.Geolocation.ERROR_DENIED:
			return "Access denied";
		case Ti.Geolocation.ERROR_NETWORK:
			return "Network error";
		case Ti.Geolocation.ERROR_HEADING_FAILURE:
			return "Failure to detect heading";
		case Ti.Geolocation.ERROR_REGION_MONITORING_DENIED:
			return "Region monitoring access denied";
		case Ti.Geolocation.ERROR_REGION_MONITORING_FAILURE:
			return "Region monitoring access failure";
		case Ti.Geolocation.ERROR_REGION_MONITORING_DELAYED:
			return "Region monitoring setup delayed";
	}
};




GeoLocationService.locationUpdate = function(coords) {
	GeoLocationService.lastlocation = coords ;
	
	var longitude = coords.longitude;
	var latitude = coords.latitude;
	var altitude = coords.altitude;
	var heading = coords.heading;
	var accuracy = coords.accuracy;
	var speed = coords.speed;
	var timestamp = coords.timestamp;
	var altitudeAccuracy = coords.altitudeAccuracy;
	//Ti.API.info('speed ' + speed);
	//Titanium.API.info('geo - current location: ' + new Date(timestamp) + ' long ' + longitude + ' lat ' + latitude + ' accuracy ' + accuracy);

	Titanium.Geolocation.reverseGeocoder(latitude, longitude, function(evt) {
		var reverseGeo = null ;
		if (evt.success) {
			var places = evt.places;
			if (places && places.length) {
				reverseGeo = places[0].address;
				//Ti.API.info(places[0].address);
			} else {
				//Ti.API.info("No address found");
				reverseGeo = "No address found";
			}
			Ti.API.debug("reverse geolocation result = " + JSON.stringify(evt));
		} else {
			// Ti.UI.createAlertDialog({
				// title: 'Reverse geo error',
				// message: evt.error
			// }).show();

			//Ti.API.info("Code translation: " + GeoLocationService.translateErrorCode(evt.code));
		}
	});
};

module.exports = GeoLocationService;