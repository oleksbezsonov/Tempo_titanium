// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var isreFresh = false;
var maxid=0,minid=0;
var messageCount=0;
setTimeout(function(){
	getNotifications();
	getPostNotifications();
	$.refreshCtrl.addEventListener('refreshstart',refresh);
},100);

$.back.addEventListener("click",function(e){
	$.messageView.close();
}); 

// $.infoEvent.addEventListener("click",function(e){
	// var wind=Alloy.createController('eventInfo').getView();
	// Alloy.Globals.tabGroup.activeTab.open(wind);
// });
function refresh(e){
	isreFresh = true;
	getNotifications();
	
}; 
function toggleView(e){
	if($.hideMessage.status == true){
		$.messagesView.height = 0;
		$.notificationsRecords.height='70%';
		$.msgView.bottom=60;
		$.hideMessage.text = "view";
	}else{
		$.messagesView.height = '33%';
		$.notificationsRecords.height='40%';
		$.hideMessage.text = "hide";
	}
	$.hideMessage.status = ! $.hideMessage.status;
	
}; 
function getNotifications(){
	try{
		if(Titanium.Network.online == false){
			utility.customAlert("Your device is not online. Please check connectivity.", "Connection");
			return;
		}
	    Alloy.Globals.loading.show(' ', false);
		
		var userInfo = Ti.App.Properties.getObject("user",{});
		Ti.API.info("userInfo" + JSON.stringify(userInfo));
		var pmax = 0,pmin = 0;
		if(isreFresh){
			pmax=maxid;
			pmin=0;
		}
		var httpparams = {
				data:{
					userid:userInfo.user_id,
					maxid:pmax,
					minid:pmin
				}
	
		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("getnotifications",httpparams,notifyRecordsCallback);
		 
	}catch(ex){
		Alloy.Globals.displayError("getnotifications " + JSON.stringify(ex));
	}			
	
}

function notifyRecordsCallback(data){
	try{
		Alloy.Globals.loading.hide();
		var response = JSON.parse(data);
		
		if(response.success != 1){
			return;
		}
		var records = response.notifications;
		var size = records.length;
		
		for(var i=0;i<size;i++){
			var item = records[i];
			var row = createRow(item);
			$.notificationsRecords.appendRow(row);
		}
		if(size>0){
			maxid =  records[0].user_notification_id;
			minid = records[size-1].user_notification_id;
		}
		
	}catch(ex){
		Alloy.Globals.displayError("searchUser exception " + ex.toString());
	}finally{
		isreFresh = false;
		$.refreshCtrl.endRefreshing();
	}
}

function createRow(item){
	var rowView ;
	if(item.notification_type == "followrequest"){
		rowView = Alloy.createController('followNotificationRow',{record:item}).getView();
	}else if(item.notification_type == "inviteonevent" || item.notification_type =="hostinvitaion"){
		rowView = Alloy.createController('eventNotificationRow',{record:item}).getView();
	}else{
		rowView = Alloy.createController('notificationMsgRow',{record:item}).getView();
	}
	rowView.record = item;
	return rowView;
}

$.notificationsRecords.addEventListener("click", function(e){
	var selectedItem;
	if(OS_ANDROID){
		selectedItem =  e.row.record;	
	}else if(OS_IOS){
		selectedItem =  e.rowData.record;
	}
	Ti.API.info("e.index " + e.index + "  e.source.id " + e.source.id);	
	Ti.API.info("selectedItem  " + JSON.stringify(selectedItem));
	
	if(e.source.id == "acceptBtn" || e.source.id == "rejectBtn"){
		var status = (e.source.id == "acceptBtn"?2:-1);
		if(selectedItem.notification_type == "followrequest"){
			changeFollowStatus(selectedItem,status,e.index);
		}else if(selectedItem.notification_type == "hostinvitaion"){
			 acceptRejectCoHostInvitation(selectedItem,status,e.index);
		}else if(selectedItem.notification_type == "inviteonevent"){
			 acceptRejectInvitation(selectedItem,status,e.index);
		}
	}
});
$.notificationsRecords.addEventListener("delete", function(e){
	var selectedItem;
	if(OS_ANDROID){
		selectedItem =  e.row.record;	
	}else if(OS_IOS){
		selectedItem =  e.rowData.record;
	}
	deleteNotification(selectedItem,e.index,false);
});
function changeFollowStatus(record,statusVal,rowIndex){
	try{
		if(Titanium.Network.online == false){
			utility.customAlert("Your device is not online. Please check connectivity.", "Connection");
			return;
		}
	
	    Alloy.Globals.loading.show(' ', false);
		
		var userInfo = Ti.App.Properties.getObject("user",{});
		var httpparams = {
				data:{
					primaryuserid:userInfo.user_id,
					networkuserid:record.from_user_id,
					status:statusVal
				}
	
		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("changeFollowStatus",httpparams,function(data){
	 		try{
				Alloy.Globals.loading.hide();
				var response = JSON.parse(data);
				
				if(response.success == 1){
					alert(response.message);
				}
				
				deleteNotification(record,rowIndex,true);
				
			}catch(ex){
				Alloy.Globals.displayError("changeFollowStatus exception " + ex.toString());
			}
	 	});
		 
	}catch(ex){
		Alloy.Globals.displayError("changeFollowStatus " + JSON.stringify(ex));
	}			
	
}

function acceptRejectCoHostInvitation(record,statusVal,rowIndex){
	try{
		if(Titanium.Network.online == false){
			utility.customAlert("Your device is not online. Please check connectivity.", "Connection");
			return;
		}
	
	    Alloy.Globals.loading.show(' ', false);
		
		var userInfo = Ti.App.Properties.getObject("user",{});
		var httpparams = {
				data:{
					cohostuserid:userInfo.user_id,
					eventid:record.event_id,
					status:statusVal
				}
	
		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("acceptRejectCoHostInvitation",httpparams,function(data){
	 		try{
				Alloy.Globals.loading.hide();
				var response = JSON.parse(data);
				
				if(response.success == 1){
					alert(response.message);
				}
				
				deleteNotification(record,rowIndex,true);
				
			}catch(ex){
				Alloy.Globals.displayError("acceptRejectCoHostInvitation exception " + ex.toString());
			}
	 	});
		 
	}catch(ex){
		Alloy.Globals.displayError("acceptRejectCoHostInvitation " + JSON.stringify(ex));
	}			
	
}
function acceptRejectInvitation(record,statusVal,rowIndex){
	try{
		if(Titanium.Network.online == false){
			utility.customAlert("Your device is not online. Please check connectivity.", "Connection");
			return;
		}
	
	    Alloy.Globals.loading.show(' ', false);
		
		var userInfo = Ti.App.Properties.getObject("user",{});
		var httpparams = {
				data:{
					userid:userInfo.user_id,
					eventid:record.event_id,
					status:statusVal
				}
	
		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("acceptRejectInvitation",httpparams,function(data){
	 		try{
				Alloy.Globals.loading.hide();
				var response = JSON.parse(data);
				
				if(response.success == 1){
					alert(response.message);
				}
				
				deleteNotification(record,rowIndex,true);
				
			}catch(ex){
				Alloy.Globals.displayError("acceptRejectInvitation exception " + ex.toString());
			}
	 	});
		 
	}catch(ex){
		Alloy.Globals.displayError("acceptRejectInvitation " + JSON.stringify(ex));
	}			
	
}
function deleteNotification(record,rowIndex,removeRow){
	httphelper = require("HttpHelper");
	httphelper.deleteGeneralNotification(record,function(){
		if(removeRow)
			$.notificationsRecords.deleteRow(rowIndex);
	});
}


/// User posts notifications

function getPostNotifications(){
	try{
		if(Titanium.Network.online == false){
			utility.customAlert("Your device is not online. Please check connectivity.", "Connection");
			return;
		}
	    Alloy.Globals.loading.show(' ', false);
		
		var userInfo = Ti.App.Properties.getObject("user",{});
		Ti.API.info("userInfo" + JSON.stringify(userInfo));
		var pmax = 0,pmin = 0;
		if(isreFresh){
			pmax=maxid;
			pmin=0;
		}
		var httpparams = {
				data:{
					userid:userInfo.user_id,
					maxid:pmax,
					minid:pmin
				}
	
		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("getUserPostnotifications",httpparams,postRecordCallback);
		 
	}catch(ex){
		Alloy.Globals.displayError("getUserPostnotifications " + JSON.stringify(ex));
	}			
	
}

function postRecordCallback(data){
	try{
		Alloy.Globals.loading.hide();
		var response = JSON.parse(data);
		
		if(response.success != 1){
			return;
		}
		var records = response.notifications;
		var size = records.length;
		$.messagesView.removeAllChildren();
		for(var i=0;i<size;i++){
			var item = records[i];
			if(item.notification_type == "commentpost"){
				if(item.user_post_url.indexOf("mov")>=0){
					item.user_post_type="video";
				}else{
					item.user_post_type="image";
				}
				rowView = Alloy.createController('commentMessage',{record:item}).getView();
				rowView.record = item;
				$.messagesView.add(rowView);
				messageCount++;
			}
		}	
		$.messageTitle.text = "Messages (" + messageCount + ")"; 
	}catch(ex){
		Alloy.Globals.displayError("postRecordCallback exception " + ex.toString());
	}finally{
		
	}
}

function viewFriendsPosts(e){
	try{
		
		Ti.API.error("viewFriendsPosts " + e.source.id);
		var selectedRecord = e.source.record;
		if(selectedRecord == undefined ) return;
		Ti.API.info("selectedRecord " + JSON.stringify(selectedRecord));
		var ctrl = Alloy.createController('postReview',{record:selectedRecord,type:"userpost"});
		ctrl.myCallback = function(){
			pmax = 0;
			pmin = 0;
			getPostNotifications();
		};
		var wind = ctrl.getView();
		wind.open();
	}catch(ex){
		Ti.API.error("viewFriendsPosts " + ex.toString());
	}
}

$.deleteItem.addEventListener("click",function(e){
	
	 var dialog = Ti.UI.createAlertDialog({
	    	No: 1,
	    	buttonNames: ['Yes', 'No'],
	   	 	message: 'Are you sure you want to delete all notifications ?',
	    	title: 'Delete'
	  });
	  dialog.addEventListener('click', function(e){
	 	if(e.index == 0){  
	 		deleteAllNotificationRecord();
	   	}
	  });
	  dialog.show();
});

function deleteAllNotificationRecord(){
	try{

		if(Titanium.Network.online == false){
			utility.customAlert("Your device is not online. Please check connectivity.", "Connection");
			return;
		}
	
	    Alloy.Globals.loading.show(' ', false);
		var userInfo = Ti.App.Properties.getObject("user",{});
		Ti.API.info("userInfo" + JSON.stringify(userInfo));

		var httpparams = {
				data:{
					userid:userInfo.user_id
				}
	
		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("deleteAllUserNotification",httpparams,function(data){
	 		try{
				Alloy.Globals.loading.hide();
				maxid=0,minid=0;
				$.notificationsRecords.setData([]);
				getNotifications();
				getPostNotifications();
			}catch(ex){
				Alloy.Globals.displayError("deleteAllUserNotification exception " + ex.toString());
			}
	 	});
		 
	}catch(ex){
		Alloy.Globals.displayError("deleteAllUserNotification " + JSON.stringify(ex));
	}			

}
