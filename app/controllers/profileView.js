// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var utility = require("utility");
var userInfo = Ti.App.Properties.getObject("user",{});
var otherUserInfo;
if(args.otherUser == true){
	otherUserInfo = args.record;
	$.backBtn.width = 80;
	$.editBtn.visible = false;
	$.searchBtn.visible = false;
	$.settingBtn.visible = false;
	$.search.visible = false;
	$.followBtn.height = 40;
	$.tabbar.labels =['Events', 'Friends'];
	$.posts.height = 0;

	$.avatar.image = otherUserInfo.user_avatar;
	$.userFullname.text = otherUserInfo.first_name + " " + otherUserInfo.last_name;
	$.followBtn.text = otherUserInfo.association_type;
	if(otherUserInfo.association_type==0){
		$.followBtn.text= "Follow";
	}else if(otherUserInfo.association_type.toLowerCase()=="follow"){
		$.followBtn.opacity="0.5";
		$.followBtn.text= "Unfollow";
	}
}
function setFollow(){
	$.followBtn.text = otherUserInfo.association_type;

	if(otherUserInfo.association_type==0){
		$.followBtn.text= "Follow";
	}else if(otherUserInfo.association_type.toLowerCase()=="follow"){
		$.followBtn.opacity="0.5";
		$.followBtn.text= "Unfollow";
	}
}
$.followBtn.addEventListener("click", function(e){
	addFollow(otherUserInfo);
});

$.backBtn.addEventListener("click", function(e){
	$.profileView.close();
});
		
Ti.API.info("userInfo" + JSON.stringify(userInfo));

$.refresh = function(){
	setTimeout(function(){
		if(args.otherUser != true){
			$.photogrid.setData([]);
			$.friends.setData([]);
			getUserPost();
			getUsers();
		}
	},100);
};

setTimeout(function(){
	$.eventsTableViewRecords.setData([]);
	$.friends.setData([]);
	downloadAll();
	$.refreshCtrl.addEventListener('refreshstart',getUserEvents);
},100);

$.profileView.addEventListener("click",function(e){
	$.search.blur();
});

Ti.App.addEventListener("refreshProfile",getUserProfile);
Ti.App.addEventListener("refreshAll",downloadAll);
function downloadAll(){
	getUserProfile();
	getUserEvents(false);
	getUsers();
}
$.tabbar.addEventListener("click",function(e){
	var index = e.index;
	if(args.otherUser == true)index++;
	
	if(index == 0){
		$.posts.height = Ti.UI.FILL;
		$.eventsTableViewRecords.height = 0;
		$.friends.height = 0;
		if($.callBack != undefined){
			$.callBack(1);
		}
	}else if(index == 1){
		$.posts.height = 0;
		$.eventsTableViewRecords.height = Ti.UI.FILL;
		$.friends.height = 0;
		if($.callBack != undefined){
			$.callBack(0);
		}
	}else if(index== 2){
		$.posts.height = 0;
		$.eventsTableViewRecords.height = 0; 
		$.friends.height = Ti.UI.FILL; 
		$.friends.bottom= 0;
		if($.callBack != undefined){
			$.callBack(2);
		}
	}
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
	var wind=Alloy.createController('searchUsers',{searchText:$.search.value}).getView();
	Alloy.Globals.tabGroup.activeTab.open(wind);
});
function getUserProfile(){
	try{
		if(Titanium.Network.online == false){
			utility.customAlert("Your device is not online. Please check connectivity.", "Connection");
			return;
		}
		
	    Alloy.Globals.loading.show(' ', false);
	    var userid = userInfo.user_id;
		if(args.otherUser == true){
			userid = otherUserInfo.user_id;
		}
		var httpparams = {
				data:{
					userid:userid,
					calledbyUserID:userInfo.user_id
				}
	
		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("getUserProfile",httpparams,myCallback);
		  
	}catch(ex){
		Alloy.Globals.displayError("getUserProfile " + JSON.stringify(ex));
	}			
	
}

function myCallback(data){
	try{
		Alloy.Globals.loading.hide();
		var response = JSON.parse(data);
		
		if(response.success != 1){
			return;
		}
		
		var record = response.userInfo;
		
		$.avatar.image = record.avatar;
		//$.tempoRating.text = Math.floor(record.tempoRating);
		var rate  =  Math.floor(record.tempoRating);
		$.tempoRating.text =(rate>999?999:rate);

		$.eventCount.text = record.events;
		$.userFullname.text = record.name;
	}catch(ex){
		Alloy.Globals.displayError("myCallback exception " + ex.toString());
	}
}

function getUsers(text){
	try{
		if(Titanium.Network.online == false){
			utility.customAlert("Your device is not online. Please check connectivity.", "Connection");
			return;
		}
		//if(text == undefined || text == null) text =" ";
		
	    Alloy.Globals.loading.show(' ', false);
		
		var userid = userInfo.user_id;
		if(args.otherUser == true){
			userid = otherUserInfo.user_id;
		}
		var httpparams = {
				data:{
					userid:userid,
				}
		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("getMyFollows",httpparams,getUsersCallback);
		 
	}catch(ex){
		Alloy.Globals.displayError("getMyFollows " + JSON.stringify(ex));
	}			
	
}

function getUsersCallback(data){
	try{
		Alloy.Globals.loading.hide();
		var response = JSON.parse(data);

		var sections = [];
		var myFollowers = Ti.UI.createTableViewSection({
			headerTitle:"Followers"
		});
		var myFollowing = Ti.UI.createTableViewSection({
			headerTitle:"Following"
		});		
		if(response.success != 1){
			//utility.customAlert(response.message,"Login");
			return;
		}
		
		var records = response.myFollowing;
		var size = records.length;
		
		for(var i=0;i<size;i++){
			var item = records[i];
			
			var row = createUserRow(item);
			row.record = item;
			myFollowing.add(row);
		}
		records = response.myFollowers;
		size = records.length;
		
		for(var i=0;i<size;i++){
			var item = records[i];
			var row = createUserRow(item);
			row.record = item;
			myFollowers.add(row);
		}
		sections.push(myFollowing);
		sections.push(myFollowers);
		
		$.friends.sections = sections;
	}catch(ex){
		Alloy.Globals.displayError("searchUser exception " + ex.toString());
	}
}
$.friends.addEventListener('click',function(e){
try{
		var selectedItem;
		
		if(OS_ANDROID){
			selectedItem =  e.row.record;	
		}else if(OS_IOS){
			selectedItem =  e.rowData.record;
		}
		Ti.API.info("selectedItem  " + JSON.stringify(selectedItem));
		
		if(e.source.id == "userAvatarImg"){
			var wind=Alloy.createController('profileView',{record:selectedItem,otherUser:true}).getView();
			Alloy.Globals.tabGroup.activeTab.open(wind);
		}else if(e.source.id == "followBtn"){
			addFollow(selectedItem,e.index);
		}
	}catch(ex){
		Ti.API.info("tableViewRecords click" + ex.toString());
	}	
});

function getUserPost(){
	try{
		if(Titanium.Network.online == false){
			utility.customAlert("Your device is not online. Please check connectivity.", "Connection");
			return;
		}
		
	    Alloy.Globals.loading.show(' ', false);
		
		var httpparams = {
				data:{
					userid:userInfo.user_id,
					calledbyUserID:userInfo.user_id,
					type:1,
					min:0,
					max:0
				}
	
		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("getUserPostEventFriend",httpparams,myPostCallback);
		  
	}catch(ex){
		Alloy.Globals.displayError("getUserPost " + JSON.stringify(ex));
	}			
	
}

function myPostCallback(data){
	try{
		Alloy.Globals.loading.hide();
		var response = JSON.parse(data);
		
		if(response.success != 1){			
			return;
		}
		var allRecords = [];
		if( response.posts != undefined){
			var records = response.posts;
			var size = records.length;			
			for(var i=size-1;i>=0;i--){
				allRecords.push(records[i]);
			}
		}	
		
		// if(response.eventposts != undefined){
			// var records = response.eventposts;
			// var size = records.length;
			// for(var i=size-1;i>=0;i--){
				// allRecords.push(records[i]);
			// }
		// }	
		
		Ti.API.info(" allRecords " + allRecords.length);	
		
		allRecords.sort(function(a, b) {
			try{
				//Ti.API.info(" a.created_at " + a.created_at);
				//Ti.API.info(" b.created_at " + b.created_at);
				var aDate = a.created_at;
				var bDate = b.created_at;
				
				var datea = (new Date(aDate)).getTime();
				var dateb = (new Date(bDate)).getTime();
				return datea - dateb;
			}catch(ex){
				Ti.API.error("sort by created_at date " + ex.toString());
			}
		    return 0;
		});
		
		Ti.API.info(" allRecords " + allRecords.length);	
				
		var data = [];

		size = allRecords.length;
		
		for(var i=size-1;i>=0;i--){
			var rec = allRecords[i]; 
			var imgURL ="/images/eventPlaceHolder.png";
			if(rec.user_post_type =="video"){
				if(rec.user_post_thumb != undefined)
					imgURL = rec.user_post_thumb;
			}else{
				imgURL = rec.user_post_data;
			}
			
			var item = {
				  image:imgURL,
				  thumb:imgURL,
				  title: '',
				  type : 'button',
				  space:2,
				  record:rec,
				  callback: function(e){
				  	Ti.API.info("callback " + JSON.stringify(e));
				  	var selectedItem = e.source.record;
				  	var ctrl = Alloy.createController('postReview',{record:selectedItem,otherUser:args.otherUser,type:"userpost"});
				  	ctrl.myCallback = function(){
				  		getUserPost();
				  	};
				  	var wind = ctrl.getView();
					wind.open();
				  }
			};
			data.push(item);
		}
		
		$.photogrid.init();
		$.photogrid.setData(data);
	}catch(ex){
		Alloy.Globals.displayError("myPostCallback exception " + ex.toString());
	}
}
function createUserRow(item){
	var row = Alloy.createController("userRowView",{record:item}).getView();
	row.record = item;
	return row;
}

$.editBtn.addEventListener("click",function(e){
	var wind=Alloy.createController('editProfile').getView();
	wind.open();
	//Alloy.Globals.tabGroup.activeTab.open(wind);
});

// $.picOne.addEventListener("click",function(e){
			// var wind=Alloy.createController('deleteEvent').getView();
			// wind.open();
// });

$.settingBtn.addEventListener("click",function(e){
	var wind=Alloy.createController('settings').getView();
	wind.open(wind);
});


function getUserEvents(reload){
	try{
		if(Titanium.Network.online == false){
			utility.customAlert("Your device is not online. Please check connectivity.", "Connection");
			return;
		}
		
	    if(reload == false) Alloy.Globals.loading.show(' ', false);
		
		var userid = userInfo.user_id;
		if(args.otherUser == true){
			userid = otherUserInfo.user_id;
		}
		var httpparams = {
				data:{
					userid:userid,
					calledbyUserID:userInfo.user_id,
					type:2,
					min:0,
					max:0
				}
	
		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("getUserPostEventFriend",httpparams,myEventsCallback);
		  
	}catch(ex){
		Alloy.Globals.displayError("getUserEvents " + JSON.stringify(ex));
	}			
	
}

function myEventsCallback(data){
	try{
		Alloy.Globals.loading.hide();
		var response = JSON.parse(data);
		
		if(response.success != 1){
			
			return;
		}
		$.eventsTableViewRecords.setData([]);
		var records = response.events;
		
		var size = records.length; 
		var rowItems=[];
		Ti.API.info("size " +size);
		$.eventCount.text = size;
		for(var i=0;i<size;i++){
			var item = records[i];
			rowItems.push(item);
			
			if(rowItems.length ==2){
				var row = createEventView(rowItems);
				$.eventsTableViewRecords.appendRow(row);
				rowItems = [];	
			}
			
		}
		Ti.API.info("rowItems.length " + rowItems.length);
		
		if(rowItems.length>0){
			var row = createEventView(rowItems);
			Ti.API.info("rowItems " + rowItems.length);
			$.eventsTableViewRecords.appendRow(row);
			rowItems = [];	
		}
	}catch(ex){
		Alloy.Globals.displayError("myEventsCallback exception " + ex.toString());
	}finally{
		$.refreshCtrl.endRefreshing();
	}
}

function createEventView(item){
	var row = Alloy.createController("seeMoreRow",{record:item}).getView();
	row.record = item;
	return row;
}

function addFollow(record,index){
	try{
		if(record.association_type=="Requested") return;
		if(Titanium.Network.online == false){
			utility.customAlert("Your device is not online. Please check connectivity.", "Connection");
			return;
		}
	
	    Alloy.Globals.loading.show(' ', false);
	    Ti.API.info("add follow " + JSON.stringify(userInfo));
		var httpparams = {
				data:{
					primaryuserid:userInfo.user_id,
					networkuserid:record.user_id,
					associationtype:(record.association_type==0? 'follow':'unfollow')
				}
	
		};
		 Ti.API.info("add follow  httpparams " + JSON.stringify(httpparams));
		 
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("addFollow",httpparams,function(data){
	 		try{
				var response = JSON.parse(data);
				
				var httphelper = require("HttpHelper");
				// 0 -- Not following
				//Follow -- following
				//
				if(record.association_type==0){
					httphelper.changeFollowStatus(record.user_id,userInfo.user_id,function(rdata){
						Alloy.Globals.loading.hide();
						if(response.success == 1){
							if (record.association_type==0){
								record.association_type = "Follow";
							}else if (record.association_type.toLowerCase()=="follow"){
								record.association_type = 0;
							}
							if(index != undefined){
								row = createUserRow(record);
								Ti.API.error("Updating row after follow " + index + "  record.association_type " + record.association_type);
								$.friends.updateRow(index,row);	
							}else{
								otherUserInfo = record;
								setFollow();
							}
						}
					});
				}else{
					Alloy.Globals.loading.hide();
					if(response.success == 1){
							if (record.association_type==0){
								record.association_type = "Follow";
							}else if (record.association_type.toLowerCase()=="follow"){
								record.association_type = 0;
							}
							if(index != undefined){
								row = createUserRow(record);
								Ti.API.error("Updating row after UNFOLLW  " + index + "  record.association_type " + record.association_type);
								$.friends.updateRow(index,row);
							}else{
								otherUserInfo = record;
								setFollow();
							}		
						}
					
				}
		
			}catch(ex){
				Alloy.Globals.displayError("searchUser exception " + ex.toString());
			}
	 	});
		 
	}catch(ex){
		Alloy.Globals.displayError("addFollow " + JSON.stringify(ex));
	}			
	
}
$.eventsTableViewRecords.addEventListener('click',function(e){
	try{
		var selectedItem;
		Ti.API.info(e.source.id  +" e.source.row " + e.source.record);
		selectedItem = e.source.record;
		if(selectedItem != undefined){
			Ti.API.info("selectedItem " + JSON.stringify(selectedItem));
			var wind=Alloy.createController('exploreEvent',{record:selectedItem,type:"eventPost"}).getView();
			wind.open();
		}
	}catch(ex){
		Alloy.Globals.displayError("eventsTableViewRecords " + JSON.stringify(ex));
	}
});
