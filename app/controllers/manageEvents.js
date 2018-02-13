// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var utility = require("utility");

setTimeout(getFeeds,100);

$.addBtn.addEventListener("click",function(e){
	var wind=Alloy.createController('createEventView').getView();
	wind.open(wind);
	
});

$.notifyIcon.addEventListener("click",function(e){
	var wind=Alloy.createController('messageView').getView();
	Alloy.Globals.tabGroup.activeTab.open(wind);
}); 

function refresh(e){
	getFeeds(false);	
}; 

Ti.App.addEventListener("refreshFeed",refresh);
$.refreshCtrl.addEventListener('refreshstart',refresh);

function getFeeds(showLoader){
	try{
		if(Titanium.Network.online == false){
			utility.customAlert("Your device is not online. Please check connectivity.", "Connection");
			return;
		}
		
	    if(showLoader!=false) Alloy.Globals.loading.show(' ', false);

		
		var userInfo = Ti.App.Properties.getObject("user",{});
		Ti.API.info("userInfo" + JSON.stringify(userInfo));
		var httpparams = {
				data:{
					userid:userInfo.user_id
				}
	
		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("getmyevents",httpparams,myCallback);
		 
	}catch(ex){
		Alloy.Globals.displayError("getFeeds " + JSON.stringify(ex));
	}			
	
}

function myCallback(data){
	try{
		Alloy.Globals.loading.hide();
		var response = JSON.parse(data);
		
		if(response.success != 1){
			
			return;
		}
		$.tableViewRecords.setData([]);
		var records = response.myevent;
		
		var size = records.length; 
		var rowItems=[];
		Ti.API.info("size " +size);
		for(var i=size-1;i>=0;i--){
			var item = records[i];
			rowItems.push(item);
			
			if(rowItems.length ==2){
				var row = createView(rowItems);
				$.tableViewRecords.appendRow(row);
				rowItems = [];	
			}
			
		}
		Ti.API.info("rowItems.length " + rowItems.length);
		
		if(rowItems.length>0){
			var row = createView(rowItems);
			Ti.API.info("rowItems " + rowItems.length);
			$.tableViewRecords.appendRow(row);
			rowItems = [];	
		}
		
	}catch(ex){
		Alloy.Globals.displayError("getFeeds exception " + ex.toString());
	}finally{
		$.refreshCtrl.endRefreshing();
	}
}
function createView(item){
	var row = Alloy.createController("seeMoreRow",{record:item}).getView();
	//row.record = item;
	return row;
}

$.tableViewRecords.addEventListener('click',function(e){
	var selectedItem;
	Ti.API.info(e.source.id  +" e.source.row " + e.source.record);
	selectedItem = e.source.record;
	Ti.API.info(e.source.id  +" e.source.row " + e.source.record);
	if(selectedItem != undefined){
		Ti.API.info("selectedItem " + JSON.stringify(selectedItem));
		var wind=Alloy.createController('createEventView',{record:selectedItem}).getView();
		wind.open();
	}
});