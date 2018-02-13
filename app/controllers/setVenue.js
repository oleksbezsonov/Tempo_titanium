// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var newRegion;
var locations = [];
var selectedVenue = args.venue;
var lastSearch = "";
var previousSearchInProgress = false;
var lastSearchOn = "";
var utility = require("utility");

var mapview=Alloy.Globals.Map.createView({
	mapType: Alloy.Globals.Map.NORMAL_TYPE,
	animate:true,
	regionFit:true,
	userLocation:true,
	enableZoomControls:true,
	height:Ti.UI.FILL,
	backgroundColor:"#E4F1FD"	
}); 
   
$.viewOfMap.add(mapview);

if(selectedVenue != undefined && selectedVenue != null && selectedVenue!=""){
	showOnMap();
}
// function setCurrentLocation(){
	// var clongitude = Titanium.App.Properties.getDouble('longitude');
	// var clatitude = Titanium.App.Properties.getDouble('latitude');
// 
	// Titanium.Geolocation.reverseGeocoder( clatitude, clongitude, function(e){
		// try{
			// Ti.API.info("reverseGeocoder " + JSON.stringify(e));
			// Ti.API.info("reverseGeocoder " + e.places);
			// selectedVenue = e.places[0];
			// var address="";
			// if(e.success == true){
				// if(e.places.length>0){
					// address = e.places[0].address;
				// }
			// } 
			// $.locationTxt.text = address;
			// currentLoc = Alloy.Globals.Map.createAnnotation({
			    // latitude:clatitude,
			    // longitude:clongitude,
			    // title:address,
			    // subtitle:'',
			    // myid:99,
			    // animate:true,
			    // pincolor:Alloy.Globals.Map.ANNOTATION_BLUE,
				// rightButton: Titanium.UI.iOS.SystemButton.INFO_DARK	
			// });
// 			
			// locations.push(currentLoc);
// 			
			// mapview.region = {latitude:clatitude, longitude:clongitude,
	        // latitudeDelta:0.02, longitudeDelta:0.02};
// 	        
			// mapview.annotations = locations;
		// }catch(ex){
			// Ti.API.error("exception reverse geo " + ex.toString());
		// }	
	// } );
// }
$.back.addEventListener("click",function(e){
	$.setVenue.close();
});

// function addLocation(){
	// if(newRegion == undefined){
		// alert("Please select a new location on map");
		// return;
	// }
	// Ti.API.info("newRegion " + JSON.stringify(newRegion));
// 
	// var nlongitude = newRegion.longitude;
	// var nlatitude = newRegion.latitude;
// 		
	// Titanium.Geolocation.reverseGeocoder( nlatitude, nlongitude, function(e){
		// Ti.API.info("reverseGeocoder " + JSON.stringify(e));
		// //Ti.API.info("reverseGeocoder " + JSON.stringifye.places);
		// selectedVenue = e.places[0];
		// var address="";
		// if(e.success == true){
			// if(e.places.length>0){
				// address = e.places[0].address;
			// }
		// } 
// 		
		// $.locationTxt.text = address;
		// var newLoc = Alloy.Globals.Map.createAnnotation({
		    // latitude:nlatitude,
		    // longitude:nlongitude,
		    // title:address,
		    // subtitle:'',
		    // myid:1,
		    // animate:true,
		    // pincolor:Alloy.Globals.Map.ANNOTATION_GREEN,
			// rightButton: Titanium.UI.iOS.SystemButton.INFO_DARK	
		// });
// 		
		// locations = [];
		// locations.push(newLoc);
		// mapview.annotations = locations;
// 		
	// } );	
// 	
// };

mapview.addEventListener("regionchanged",function(e){
	//Ti.API.info("mapcenter " + JSON.stringify(e));
	//newRegion = e.source.region;
	//addLocation();
});
$.setEventVenue.addEventListener("click",function(){
	$.myCallback(selectedVenue);
	$.setVenue.close();
});

// $.search.addEventListener("change",function(){
	// var len =$.search.value.length - lastSearch.length;
	// if(len>=3){
		// Titanium.Geolocation.forwardGeocoder($.search.value, function(result){
			// Ti.API.info("result " + JSON.stringify(result));
		// } );
	// }
// 	
// });
//setCurrentLocation();


$.search.addEventListener("change",function(){
	getLocations();
});
$.cancelBtn.addEventListener("click",function(){
	$.search.value = "";
	$.search.blur();
	$.autoCompleteTableView.setData([]);
	$.autoCompleteTableView.visible = false;
});
$.autoCompleteTableView.addEventListener("click",function(e){
	Ti.API.info("e.source.id  " + e.source.id);
	try{
		var selectedItem;
		$.search.blur();
		if(OS_ANDROID){
			selectedItem =  e.row.record;	
		}else if(OS_IOS){
			selectedItem =  e.rowData.record;
		}
		Ti.API.info("selectedItem  " + JSON.stringify(selectedItem));
		$.autoCompleteTableView.visible = false;
		setTimeout(function(){
				var xhr = Ti.Network.createHTTPClient();
				
				xhr.onload = function() {
					try{
							if (xhr.status == 200) {
								previousSearchInProgress = false;
								//Ti.API.error ("xhr.responseData " +xhr.responseData);
								var response = JSON.parse(xhr.responseData);
								var record = response.result;
								var address = record.formatted_address;
								var lat = record.geometry.location.lat;
								var lng = record.geometry.location.lng;
								var addr = utility.parseAddress(address);
							   
							   	Ti.API.error("addr " + JSON.stringify(addr));
							   
							    selectedVenue =	{
										"street": addr.address,
										"city": addr.city,
										"country": addr.country,
										"address": record.name+ ", " +address,
										"zipcode": addr.postalCode,
										"longitude": lng,
										"latitude": lat,
										"state": addr.province
								};
								showOnMap();
							}
						}catch(ex){
								Ti.API.info("autoCompleteTableView click" + ex.toString());
						}				
				};
				
				var url = "https://maps.googleapis.com/maps/api/place/details/json?placeid=" + selectedItem.place_id +"&key=" + Alloy.CFG.GOOGLE_PLACES_API_KEY;
				Ti.API.error ("url " +url);
				xhr.open('GET', url);
				xhr.send();
		},100);		
		
	}catch(ex){
		Ti.API.info("autoCompleteTableView click" + ex.toString());
	}	
});
function getLocations(){
	try{
		var searchText = $.search.value;
		if(searchText == ""  || searchText == undefined || searchText == null){
			$.autoCompleteTableView.setData([]); 
			$.autoCompleteTableView.visible = false;
			return;
		}
		if(searchText == ""  || searchText == undefined || searchText == null 
			|| searchText.length<3 || previousSearchInProgress == true
			|| lastSearchOn == searchText ) {
			Ti.API.error(" search invalid");
			return;
		}
		previousSearchInProgress = true;
		setTimeout(function(){
				var xhr = Ti.Network.createHTTPClient();
				
				xhr.onload = function() {
					if (xhr.status == 200) {
						previousSearchInProgress = false;
						//Ti.API.error ("xhr.responseData " +xhr.responseData);
						var response = JSON.parse(xhr.responseData);
						buildList(response);
					};
				};
				
				var url = "https://maps.googleapis.com/maps/api/place/autocomplete/json?input=" + searchText + "&key=" +Alloy.CFG.GOOGLE_PLACES_API_KEY;
				Ti.API.error ("url " +url);
				xhr.open('GET', url);
				xhr.send();
		},100);
	}catch(ex){
		Ti.API.error("exception getLocations " + ex.toString());
	}
}

function showOnMap(){
	try{
		Ti.API.info("selectedVenue " + JSON.stringify(selectedVenue));
		var newLoc = Alloy.Globals.Map.createAnnotation({
		    latitude:selectedVenue.latitude,
		    longitude:selectedVenue.longitude,
		    title:selectedVenue.address,
		    subtitle:'',
		    myid:1,
		    animate:true,
		    pincolor:Alloy.Globals.Map.ANNOTATION_GREEN,
			rightButton: Titanium.UI.iOS.SystemButton.INFO_DARK	
		});
		
		locations = [];
		locations.push(newLoc);
		mapview.annotations = locations;
		mapview.region = {latitude:selectedVenue.latitude, longitude:selectedVenue.longitude,
	        latitudeDelta:0.02, longitudeDelta:0.02};	
	        
	    $.locationTxt.text = selectedVenue.address;    
	}catch(ex){
		Ti.API.error("exception showOnMap " + ex.toString());
	}	
}
function buildList(resp){
	try{
		$.autoCompleteTableView.setData([]);
		
		var records = resp.predictions;
		var size = records.length;
		for(var i=0;i<size;i++){
			var row = Ti.UI.createTableViewRow({
				title: records[i].description,
				selectionStyle:Titanium.UI.iOS.TableViewCellSelectionStyle.NONE
			});
			row.record = records[i];
			$.autoCompleteTableView.appendRow(row);
		}
		
		
		if(size>0){
			$.autoCompleteTableView.visible = true;
			$.autoCompleteTableView.height = Ti.UI.SIZE;
		}else{
			$.autoCompleteTableView.visible = false;
		}
	}catch(ex){
		Ti.API.error("exception buildList " + ex.toString());
	}
}
