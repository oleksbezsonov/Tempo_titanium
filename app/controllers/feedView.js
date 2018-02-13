// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var utility = require("utility");
var selectedCity;
var fp_maxid = 0,fb_minid = 0;
var isreFresh=false;
var defaultCity = "Houston";
function init(){
	try{
	Alloy.Globals.loading.show(' ', true);
	Alloy.Globals.MY_ADDRESS.city = undefined;
	if(Alloy.Globals.MY_ADDRESS.city != undefined){
		Ti.API.error("Alloy.Globals.MY_ADDRESS " + Alloy.Globals.MY_ADDRESS.city );
		$.centrTitle.text = Alloy.Globals.MY_ADDRESS.city;
		$.trendingLbl.text = "Trending in "+  Alloy.Globals.MY_ADDRESS.city;
		selectedCity = Alloy.Globals.MY_ADDRESS.city;
		
		if(selectedCity == undefined || selectedCity ==""){
			selectedCity = defaultCity;
			$.centrTitle.text = selectedCity;
		}
		setTimeout(getFeeds,100);
	}else{
		Alloy.Globals.getGeolocation(function(){
			$.centrTitle.text = Alloy.Globals.MY_ADDRESS.city;
			$.trendingLbl.text = "Trending in "+  Alloy.Globals.MY_ADDRESS.city;
			Ti.API.error("Alloy.Globals.MY_ADDRESS " + JSON.stringify(Alloy.Globals.MY_ADDRESS));
			selectedCity = Alloy.Globals.MY_ADDRESS.city;
			
			if(selectedCity == undefined || selectedCity ==""){
				selectedCity = defaultCity;
				$.centrTitle.text = selectedCity;
			}
			getFeeds();
		});
		
	}
	Ti.App.addEventListener("refreshFeed",refresh);
	$.refreshCtrl.addEventListener('refreshstart',pullRefresh);

	}catch(ex){
		Ti.API.error("no address ");
	}
}


function refresh(e){
	
	$.myEventsScrollView.removeAllChildren();
	$.myTrendingScrollView.removeAllChildren();
	$.myUpcomingScrollView.removeAllChildren();
	$.myNearbyScrollView.removeAllChildren();
	
	isreFresh = true;
	getFeeds();
}; 
function pullRefresh(e){
	
	$.myEventsScrollView.removeAllChildren();
	$.myTrendingScrollView.removeAllChildren();
	$.myUpcomingScrollView.removeAllChildren();
	$.myNearbyScrollView.removeAllChildren();
	
	Alloy.Globals.getGeolocation(function(){
		$.centrTitle.text = Alloy.Globals.MY_ADDRESS.city;
		$.trendingLbl.text = "Trending in "+  Alloy.Globals.MY_ADDRESS.city;
		Ti.API.error("Alloy.Globals.MY_ADDRESS " + JSON.stringify(Alloy.Globals.MY_ADDRESS));
		selectedCity = Alloy.Globals.MY_ADDRESS.city;
		
		if(selectedCity == undefined || selectedCity ==""){
			selectedCity = defaultCity;
			$.centrTitle.text = selectedCity;
		}
		isreFresh = true;
		getFeeds();
	});
	

	
}; 

$.feedView.addEventListener("click",function(e){
	$.search.blur();
}); 

$.addBtn.addEventListener("click",function(e){
	var wind=Alloy.createController('createEventView').getView();
	wind.open(wind);
	
}); 

$.notifyIcon.addEventListener("click",function(e){
	var wind=Alloy.createController('messageView').getView();
	Alloy.Globals.tabGroup.activeTab.open(wind);
}); 

$.selectCityLbl.addEventListener("click",function(e){
	var ctrl=Alloy.createController('selectCity');
	ctrl.myCallback = function(newCity){
		if(newCity!= undefined){
			selectedCity = newCity;
			$.centrTitle.text = newCity;
			$.trendingLbl.text = "Trending in "+ newCity;
			
		}
	};
	var wind = ctrl.getView();
	wind.open();
});

$.searchBtn.addEventListener("click",function(e){
	$.search.visible = true;
	$.search.focus();
});

$.search.addEventListener("cancel",function(e){
	$.search.visible = false;
	$.search.blur();
});
 
$.search.addEventListener("return",function(e){
	$.search.blur();
	if($.search.value == "") return;
	var wind=Alloy.createController('searchSeeMore',{searchText:$.search.value}).getView();
	wind.open();
});

function seeMoreFeeds(e){
	var wind=Alloy.createController('seeMoreView',{categoryid:e.source.categoryid,city:selectedCity}).getView();
	Alloy.Globals.tabGroup.activeTab.open(wind);
	
}

function getFeeds(){
	try{
		if(Titanium.Network.online == false){
			utility.customAlert("Your device is not online. Please check connectivity.", "Connection");
			return;
		}
		//if(text == undefined || text == null) text =" ";
		Ti.API.error("selectedCity " + selectedCity);
		Ti.API.error("Alloy.Globals.MY_ADDRESS " + JSON.stringify(Alloy.Globals.MY_ADDRESS));
	    if(isreFresh != true) Alloy.Globals.loading.show(' ', false);
		var longitude = Titanium.App.Properties.getDouble('longitude',0);
		var latitude = Titanium.App.Properties.getDouble('latitude',0);
		
		var userInfo = Ti.App.Properties.getObject("user",{});
		Ti.API.info("userInfo" + JSON.stringify(userInfo));
		var httpparams = {
				data:{
					userid:userInfo.user_id,
					latitude : latitude,
					longitude : longitude,
					city: selectedCity,
					userdatetime:new Date().toUTCString()
				}
	
		};
// 		
		// if(selectedCity != undefined && selectedCity!= null
			// && selectedCity == Alloy.Globals.MY_ADDRESS.city){
			// httpparams.data.latitude = latitude;
			// httpparams.data.longitude =longitude;
			// httpparams.data.city = selectedCity;
		// }else {	
				// httpparams.data.city = selectedCity;
		// }
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("getFeedList",httpparams,myCallback);
		 
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
		
		if(response.myevent!= undefined){
			var records = response.myevent;
			var size = records.length; 
			for(var i=size-1;i>=0;i--){
				var item = records[i];
				var row = createView(item);
				$.myEventsScrollView.add(row);	
			}
		}
		if(response.trendingincity!= undefined){
			var records = response.trendingincity;
			var size = records.length; 
			for(var i=0;i<size;i++){
				var item = records[i];
				var row = createView(item);
				$.myTrendingScrollView.add(row);	
			}
		}
		if(response.upcoming_events!= undefined){
			var records = response.upcoming_events;
			var size = records.length; 
			for(var i=0;i<size;i++){
				var item = records[i];
				var row = createView(item);
				$.myUpcomingScrollView.add(row);	
			}
		}
	 
		if(response.nearby_events!= undefined){
			records = response.nearby_events;
			var size = records.length; 
			for(var i=0;i<size;i++){
				var item = records[i];
				var row = createView(item);
				$.myNearbyScrollView.add(row);	
			}
		}
		
		getFriendsPosts();
	}catch(ex){
		Alloy.Globals.displayError("getFeeds exception " + ex.toString());
	}
}

function createView(item){
	var row = Alloy.createController("feedViewRow",{record:item}).getView();
	row.record = item;
	return row;
}

function viewEvent(e){
	try{
		Ti.API.error("viewEvent " + e.source.id);
		var selectedRecord = e.source.record;
		if(selectedRecord == undefined ) return;
		Ti.API.info("selectedRecord " + JSON.stringify(selectedRecord));
		var wind=Alloy.createController('exploreEvent',{record:selectedRecord,type:"eventPost"}).getView();
		wind.open();
	}catch(ex){
		Ti.API.error("viewEvent " + ex.toString());
	}
}


function getFriendsPosts(){
	try{
		if(Titanium.Network.online == false){
			utility.customAlert("Your device is not online. Please check connectivity.", "Connection");
			return;
		}
		//if(text == undefined || text == null) text =" ";
		
	    if(isreFresh != true) Alloy.Globals.loading.show(' ', false);
		
		var userInfo = Ti.App.Properties.getObject("user",{});
		Ti.API.info("userInfo" + JSON.stringify(userInfo));
		var httpparams = {
				data:{
					userid:userInfo.user_id,
					maxid:fp_maxid,
					minid:fb_minid
				}
	
		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("GetFriendsLatestPosts",httpparams,myFriendsPostsCallback);
		 
	}catch(ex){
		Alloy.Globals.displayError("GetFriendsLatestPosts " + JSON.stringify(ex));
	}			
	
}

function myFriendsPostsCallback(data){
	try{
		Alloy.Globals.loading.hide();
		var response = JSON.parse(data);
		
		if(response.success != 1){		
			return;
		}
		
		var records = response.posts;
		var size = records.length; 
		var rowItems=[];
		Ti.API.info("size " +size);
		$.familyAndFriends.removeAllChildren();
		for(var i=0;i<size;i++){
			var item = records[i];
			rowItems.push(item);
			
			if(rowItems.length == 4){
				var row = createPostView(rowItems);
				$.familyAndFriends.add(row);
				rowItems = [];	
			}
			
		}
		if(rowItems.length>0){
			var row = createPostView(rowItems);
			Ti.API.info("rowItems " + rowItems.length);
			$.familyAndFriends.add(row);
			rowItems = [];	
		}

	}catch(ex){
		Alloy.Globals.displayError("getFeeds exception " + ex.toString());
	}finally{
		isreFresh = false;
		$.refreshCtrl.endRefreshing();
	}
}
function createPostView(item){
	var row = Alloy.createController("friendsPostRow",{record:item}).getView();
	row.record = item;
	return row;
}

function viewFriendsPosts(e){
	try{
		Ti.API.error("viewFriendsPosts " + e.source.id);
		var selectedRecord = e.source.record;
		if(selectedRecord == undefined ) return;
		Ti.API.info("selectedRecord " + JSON.stringify(selectedRecord));
		var wind=Alloy.createController('exploreEvent',{record:selectedRecord,type:"friendPost"}).getView();
		wind.open();
	}catch(ex){
		Ti.API.error("viewFriendsPosts " + ex.toString());
	}
}
setTimeout(init,100);
