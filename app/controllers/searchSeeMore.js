// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var utility = require("utility");
$.titleLbl.text = "Searched for " + args.searchText;
$.search.value = args.searchText;
setTimeout(function(){
	getFeeds(args.searchText);
	getUsers(args.searchText);
},100);
$.back.addEventListener("click",function(e){
	$.searchSeeMore.close();
});
$.search.addEventListener("return",function(e){
	if($.search.value =="") return;
	
	getFeeds($.search.value);
	getUsers($.search.value);
});
$.cancelBtn.addEventListener("return",function(e){
	$.search.blur();
});
$.tabbar.addEventListener("click",function(e){
	var index = e.index;
	if(args.otherUser == true)index++;
	
	if(index == 0){
		$.tableViewRecordsEvents.height = Ti.UI.FILL;
		$.tableViewRecordsUsers.height = 0;
		// if($.callBack != undefined){
			// $.callBack(1);
		// }
	}else if(index == 1){
		$.tableViewRecordsEvents.height = 0;
		$.tableViewRecordsUsers.height = Ti.UI.FILL;
		
		// if($.callBack != undefined){
			// $.callBack(0);
		// }
	}
}); 

// ----- Events----

function getFeeds(text){
	try{
		if(Titanium.Network.online == false){
			utility.customAlert("Your device is not online. Please check connectivity.", "Connection");
			return;
		}
		//if(text == undefined || text == null) text =" ";
		
	    Alloy.Globals.loading.show(' ', false);
		var longitude = Titanium.App.Properties.getDouble('longitude',0);
		var latitude = Titanium.App.Properties.getDouble('latitude',0);
		
		var userInfo = Ti.App.Properties.getObject("user",{});
		Ti.API.info("userInfo" + JSON.stringify(userInfo));
		var httpparams = {
				data:{
					userid:userInfo.user_id,
					search:text
				}
	
		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("getFeedListFilter",httpparams,myEventsCallback);
		 
	}catch(ex){
		Alloy.Globals.displayError("getFeeds " + JSON.stringify(ex));
	}			
	
}
// ---------

// ----- Users----

function createUserView(item){
	var row = Alloy.createController("userRowView",{record:item}).getView();
	row.record = item;
	return row;
}
 
function getUsers(searchText){
	try{
		if(Titanium.Network.online == false){
			utility.customAlert("Your device is not online. Please check connectivity.", "Connection");
			return;
		}
		//if(text == undefined || text == null) text =" ";
	 
	    Alloy.Globals.loading.show(' ', false);
		
		var userInfo = Ti.App.Properties.getObject("user",{});
		Ti.API.info("userInfo" + JSON.stringify(userInfo));
		var httpparams = {
				data:{
					userid:userInfo.user_id,
					search:searchText,
					searchscope:2
				}
	 
		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("searchUser",httpparams,myUserCallback);
		 
	}catch(ex){
		Alloy.Globals.displayError("searchUser " + JSON.stringify(ex));
	}			
}

// ---------

function myEventsCallback(data){
	try{
		Alloy.Globals.loading.hide();
		var response = JSON.parse(data);
		$.tableViewRecordsEvents.setData([]);
		if(response.success != 1){
			//utility.customAlert(response.message,"Login");
			return;
		}
		
		var records;
		records = response.searchevent;
		
		var size = records.length; 
		var rowItems=[];
		Ti.API.info("size " +size);
		for(var i=0;i<size;i++){
			var item = records[i];
			rowItems.push(item);
			
			if(rowItems.length ==2){
				var row = createView(rowItems);
				$.tableViewRecordsEvents.appendRow(row);
				rowItems = [];	
			}
			
		}
		if(rowItems.length>0){
			var row = createView(rowItems);
			Ti.API.info("rowItems " + rowItems.length);
			$.tableViewRecordsEvents.appendRow(row);
			rowItems = [];	
		}
		
	}catch(ex){
		Alloy.Globals.displayError("getFeeds exception " + ex.toString());
	}
}

function myUserCallback(data){
	try{
		Alloy.Globals.loading.hide();
		var response = JSON.parse(data);
		$.tableViewRecordsUsers.setData([]);
		if(response.success != 1){
			//utility.customAlert(response.message,"Login");
			return;
		}
		var records = response.userinfo;
		var size = records.length;
		
		for(var i=0;i<size;i++){
			var item = records[i];
			
			var row = createUserView(item);
			row.record = item;
			$.tableViewRecordsUsers.appendRow(row);
		}
	
	}catch(ex){
		Alloy.Globals.displayError("searchUser exception " + ex.toString());
	}
}

function createView(item){
	var row = Alloy.createController("seeMoreRow",{record:item}).getView();
	row.record = item;
	return row;
}

$.tableViewRecordsEvents.addEventListener('click',function(e){
	var selectedItem;
	Ti.API.info(e.source.id  +" e.source.row " + e.source.record);
	selectedItem = e.source.record;
	if(selectedItem != undefined){
		Ti.API.info("selectedItem " + JSON.stringify(selectedItem));
		var wind=Alloy.createController('exploreEvent',{record:selectedItem,type:"eventPost"}).getView();
		wind.open();
	}
		
});

$.tableViewRecordsUsers.addEventListener('click',function(e){
	Ti.API.info("e.source.id  " + e.source.id);
	try{
		var selectedItem;
		
		if(OS_ANDROID){
			selectedItem =  e.row.record;	
		}else if(OS_IOS){
			selectedItem =  e.rowData.record;
		}
		Ti.API.info("selectedItem  " + JSON.stringify(selectedItem));
		
		if(e.source.id == "followBtn"){
			addFollow(selectedItem);
		}else if(e.source.id == "userAvatarImg"){
			var wind=Alloy.createController('profileView',{record:selectedItem,otherUser:true}).getView();
			Alloy.Globals.tabGroup.activeTab.open(wind);
		}
	}catch(ex){
		Ti.API.info("tableViewRecords click" + ex.toString());
	}			
});

function addFollow(record){
	try{
		if(record.association_type=="Requested") return;
		if(Titanium.Network.online == false){
			utility.customAlert("Your device is not online. Please check connectivity.", "Connection");
			return;
		}
	
	    Alloy.Globals.loading.show(' ', false);
		
		var userInfo = Ti.App.Properties.getObject("user",{});
		var httpparams = {
				data:{
					primaryuserid:userInfo.user_id,
					networkuserid:record.user_id,
					associationtype:(record.association_type==0? 'follow':'unfollow')
				}
	
		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("addFollow",httpparams,function(data){
	 		try{
				var response = JSON.parse(data);
				
				var httphelper = require("HttpHelper");
				// 0 -- Not following
				//Follow -- following
				//
				httphelper.changeFollowStatus(record.user_id,userInfo.user_id,function(rdata){
					Alloy.Globals.loading.hide();
					if(response.success == 1){
						if (record.association_type==0){
							record.association_type = "Follow";
						}else if (record.association_type.toLowerCase()=="follow"){
							record.association_type = 0;
						}
					
						updateRecord(record,'update');
						Ti.App.fireEvent("refreshAll");
					}
				});
				
		
			}catch(ex){
				Alloy.Globals.displayError("searchUser exception " + ex.toString());
			}
	 	});
		 
	}catch(ex){
		Alloy.Globals.displayError("addFollow " + JSON.stringify(ex));
	}			
	
}
function updateRecord(record,action){
	try{
		var row;
		if(action=="update"){	
			row = createUserView(record);
		}
		var sections = $.tableViewRecordsUsers.data; // grab the array of sections
		var section = sections[0]; // use just the first section
		
		for(var x=0,y=section.rowCount;x < y;x++) {
			if(section.rows[x].record.user_id == record.user_id){
				if(action=="update"){		
					$.tableViewRecordsUsers.updateRow(x,row);	
				}else if(action=="delete"){
					$.tableViewRecordsUsers.deleteRow(x);
				}	
				break;
			}
		}

	}catch(ex){
		Ti.API.error("updateFeed exception " + ex.toString());
	}
}