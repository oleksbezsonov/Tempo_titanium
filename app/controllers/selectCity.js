// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var utility = require("utility");

setTimeout(getCities,100);

	// try{
		// $.lblDetect.text = "Your are in " + Alloy.Globals.MY_ADDRESS.city + "\nDetect my location";
// 
	// }catch(ex){
		// Ti.API.error("no address ");
	// }

$.locDetect.addEventListener("click",function(e){
		Alloy.Globals.getGeolocation(function(){
		Ti.API.error("Alloy.Globals.MY_ADDRESS " + JSON.stringify(Alloy.Globals.MY_ADDRESS));
		$.myCallback(Alloy.Globals.MY_ADDRESS.city);
		Ti.App.fireEvent("refreshFeed",{city:Alloy.Globals.MY_ADDRESS.city});	
		$.selectCity.close();

	});
	
	
});

$.crossBtn.addEventListener("click",function(e){
	$.selectCity.close();
});


function getCities(){
	try{
		if(Titanium.Network.online == false){
			utility.customAlert("Your device is not online. Please check connectivity.", "Connection");
			return;
		}
		
	    Alloy.Globals.loading.show(' ', false);

		var httpparams = {
			data:{}
		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("getCities",httpparams,myCallback);
		  
	}catch(ex){
		Alloy.Globals.displayError("getcities " + JSON.stringify(ex));
	}			
	
}

function myCallback(data){
	try{
		Alloy.Globals.loading.hide();
		var response = JSON.parse(data);
		
		if(response.success != 1){
			utility.customAlert(response.message,"Login");
			return;
		}
		
		var records = response.cities;
		var size = records.length; 
		var views = [];
		for(var i=0;i<size;i++){
			var item = records[i];
			var row = Ti.UI.createTableViewRow({
				classes:["city"],
				title:item.city_name
			});
			$.tableViewRecords.appendRow(row);
		}
		
	}catch(ex){
		Alloy.Globals.displayError("myCallback exception " + ex.toString());
	}
}

$.tableViewRecords.addEventListener("click",function(e){
	try{
		$.myCallback(e.source.title);
		$.selectCity.close();
		Ti.App.fireEvent("refreshFeed",{city:e.source.title});	
	}catch(ex){
		Alloy.Globals.displayError("myCallback exception " + ex.toString());
	}
});
