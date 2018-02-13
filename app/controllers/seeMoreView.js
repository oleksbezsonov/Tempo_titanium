// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var selectedCity = args.city;
var utility = require("utility");

if(args.categoryid == 1){
	$.titleLbl.text = "My Events";
}else if(args.categoryid == 2){
	$.titleLbl.text = "Trending in Events";
}else if(args.categoryid == 3){
	$.titleLbl.text = "Upcoming Events";
}else if(args.categoryid == 4){
	$.titleLbl.text = "Near By Events";
}

setTimeout(getFeeds,100);

$.back.addEventListener("click",function(e){
	$.seeMoreView.close();
});


function getFeeds(text){
	try{
		if(Titanium.Network.online == false){
			utility.customAlert("Your device is not online. Please check connectivity.", "Connection");
			return;
		}
		//if(text == undefined || text == null) text =" ";
		Ti.API.error("selectedCity " + selectedCity);
		Ti.API.error("Alloy.Globals.MY_ADDRESS " + JSON.stringify(Alloy.Globals.MY_ADDRESS));
	    Alloy.Globals.loading.show(' ', false);
		var longitude = Titanium.App.Properties.getDouble('longitude',0);
		var latitude = Titanium.App.Properties.getDouble('latitude',0);
		
		var userInfo = Ti.App.Properties.getObject("user",{});
		Ti.API.info("userInfo" + JSON.stringify(userInfo));
		var httpparams = {
				data:{
					userid:userInfo.user_id,
					search:text,
					categoryid:args.categoryid,
					userdatetime:new Date().toUTCString()
				}
	
		};
		
		if(args.categoryid == 4){
			httpparams.data.latitude = latitude;
			httpparams.data.longitude =longitude;
		}else {	
				httpparams.data.city = selectedCity;
		}
		
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("getFeedListFilter",httpparams,myCallback);
		 
	}catch(ex){
		Alloy.Globals.displayError("getFeeds " + JSON.stringify(ex));
	}			
	
}

function myCallback(data){
	try{
		Alloy.Globals.loading.hide();
		var response = JSON.parse(data);
		
		if(response.success != 1){
			//utility.customAlert(response.message,"Login");
			return;
		}
		
		var records;
		if(args.categoryid == 1){
			records = response.myevent;
		}else if(args.categoryid == 2){
			records = response.trendingincity;
		}else if(args.categoryid == 3){
			records = response.upcoming_events;
		}else if(args.categoryid == 4){
			records = response.nearby_events;
		}
		
		var size = records.length; 
		var rowItems=[];
		Ti.API.info("size " +size);
		for(var i=0;i<size;i++){
			var item = records[i];
			rowItems.push(item);
			
			if(rowItems.length ==2){
				var row = createView(rowItems);
				$.tableViewRecords.appendRow(row);
				rowItems = [];	
			}
			
		}
		if(rowItems.length>0){
			var row = createView(rowItems);
			Ti.API.info("rowItems " + rowItems.length);
			$.tableViewRecords.appendRow(row);
			rowItems = [];	
		}
		
	}catch(ex){
		Alloy.Globals.displayError("getFeeds exception " + ex.toString());
	}
}
function createView(item){
	var row = Alloy.createController("seeMoreRow",{record:item}).getView();
	row.record = item;
	return row;
}

$.tableViewRecords.addEventListener('click',function(e){
	var selectedItem;
	Ti.API.info(e.source.id  +" e.source.row " + e.source.record);
	selectedItem = e.source.record;
	if(selectedItem != undefined){
		Ti.API.info("selectedItem " + JSON.stringify(selectedItem));
		var wind=Alloy.createController('exploreEvent',{record:selectedItem,type:"eventPost"}).getView();
		wind.open();
	}
});