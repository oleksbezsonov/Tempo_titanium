var HttpHelper = {};
HttpHelper.updateNotificationFlag = function (value,myCallback){
	try{
		var userInfo = Ti.App.Properties.getObject("user",{});
		var httpparams = {
				data:{
					userid:userInfo.user_id,
					isNotify:(value?1:0)
				}
	
		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("updateOneSignalNotifyFlag",httpparams,function(data){
	 		try{
				if(myCallback != undefined)
					myCallback(data);
		
			}catch(ex){
				Alloy.Globals.displayError("updateOneSignalNotifyFlag exception " + ex.toString());
			}
	 	});
		 
	}catch(ex){
		Alloy.Globals.displayError("updateOneSignalNotifyFlag " + JSON.stringify(ex));
	}			
	
};
HttpHelper.deleteGeneralNotification = function (record,myCallback){
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
					user_notification_id:record.user_notification_id
				}
	
		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("deleteNotification",httpparams,function(data){
	 		try{
				Alloy.Globals.loading.hide();
				
				myCallback(data);
		
			}catch(ex){
				Alloy.Globals.displayError("deleteGeneralNotification exception " + ex.toString());
			}
	 	});
		 
	}catch(ex){
		Alloy.Globals.displayError("deleteGeneralNotification " + JSON.stringify(ex));
	}			
	
};

HttpHelper.addDevice = function(myCallback){
	try{	
		var userInfo = Ti.App.Properties.getObject("user",undefined);
		var deviceToken = Ti.App.Properties.getString("device_token");
		var one_signal_userid = Ti.App.Properties.getString("one_signal_userid"); 
	
		Alloy.Globals.displayLog("userInfo " + JSON.stringify(userInfo));
		
		if(userInfo == null || userInfo == undefined || userInfo.user_id ==""){
			Alloy.Globals.displayError("User not logged in");
			return;
		}
		if(deviceToken == undefined || deviceToken ==""){
			Alloy.Globals.displayError("Device token empty");
			return;
		}
		if(one_signal_userid == undefined || one_signal_userid ==""){
			Alloy.Globals.displayError("one_signal_userid  empty");
			return;
		}
		
		var httpparams = {
				data:{
				userid:userInfo.user_id,
				devicetype:'ios',
				devicepushtoken:deviceToken,
				one_signal_userid:one_signal_userid
			}
		};
		
		var responseData;
	 	var httpClient = require("HttpConnection");
	 	
	 	httpClient.callPostAPI("addUserDevice",httpparams,function(data){	
	 		try{
	 			responseData = data;
	 			var response = JSON.parse(data);
				
	 		}catch(ex1){
	 			Alloy.Globals.displayError("addDevice inside " + JSON.stringify(ex1));
	 		}
	 		
	 	});
		 
	}catch(ex){
		Alloy.Globals.displayError("addDevice " + JSON.stringify(ex));
	}finally{
		
	}	
};

HttpHelper.removeDevice = function(myCallback){
	try{	
		var userInfo = Ti.App.Properties.getObject("user",undefined);
		var deviceToken = Ti.App.Properties.getString("device_token");
		var one_signal_userid = Ti.App.Properties.getString("one_signal_userid"); 
	
		Alloy.Globals.displayLog("userInfo " + JSON.stringify(userInfo));
		
		if(userInfo == null || userInfo == undefined || userInfo.user_id ==""){
			Alloy.Globals.displayError("User not logged in");
			return;
		}
		if(deviceToken == undefined || deviceToken ==""){
			Alloy.Globals.displayError("Device token empty");
			return;
		}
		if(one_signal_userid == undefined || one_signal_userid ==""){
			Alloy.Globals.displayError("one_signal_userid  empty");
			return;
		}
		
		var httpparams = {
				data:{
				userid:userInfo.user_id,
				devicetype:'ios',
				devicepushtoken:deviceToken,
				one_signal_userid:one_signal_userid
			}
		};
		
		var responseData;
	 	var httpClient = require("HttpConnection");
	 	
	 	httpClient.callPostAPI("removeUserDevice",httpparams,function(data){	
	 		try{
	 			myCallback(data);
	 			
	 		}catch(ex1){
	 			Alloy.Globals.displayError("removeDevice inside " + JSON.stringify(ex1));
	 		}
	 		
	 	});
		 
	}catch(ex){
		Alloy.Globals.displayError("removeDevice " + JSON.stringify(ex));
	}finally{
		
	}	
};


HttpHelper.changeFollowStatus = function(acceptUserID,requestUserID,myCallback){
	try{
		
	   
		var httpparams = {
				data:{
					primaryuserid:acceptUserID,
					networkuserid:requestUserID,
					status:2
				}
	
		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("changeFollowStatus",httpparams,function(data){
	 		try{
				myCallback(data);
				
			}catch(ex){
				Alloy.Globals.displayError("changeFollowStatus exception " + ex.toString());
			}
	 	});
		 
	}catch(ex){
		Alloy.Globals.displayError("changeFollowStatus " + JSON.stringify(ex));
	}			
	
};

HttpHelper.getLatestFeed = function(){
	try{
		
		var userInfo = Ti.App.Properties.getObject("user",{});
		Ti.API.info("userInfo" + JSON.stringify(userInfo));
		var longitude = Titanium.App.Properties.getDouble('longitude',0);
		var latitude = Titanium.App.Properties.getDouble('latitude',0);
		
		var httpparams = {
				data:{
					userid:userInfo.user_id,
					city:Alloy.Globals.MY_ADDRESS.city,
					latitude:latitude,
					longitude:longitude
				}
	
		};
	 	var httpClient = require("HttpConnection");
	 	var feedIds=[];
	 	httpClient.callPostAPI("getFeedList",httpparams,function(data){
	 			var response = JSON.parse(data);
				
				if(response.success == 1){
					if(response.myevent!= undefined){
						var records = response.myevent;
						var size = records.length; 
						for(var i=0;i<size;i++){
							var item = records[i];
							feedIds.push(item.event_id);
						}
					}
					if(response.trendingincity!= undefined){
						var records = response.trendingincity;
						var size = records.length; 
						for(var i=0;i<size;i++){
							var item = records[i];
							feedIds.push(item.event_id);
						}
					}
					if(response.upcoming_events!= undefined){
						var records = response.upcoming_events;
						var size = records.length; 
						for(var i=0;i<size;i++){
							var item = records[i];
							feedIds.push(item.event_id);
						}
					}
				 
					if(response.nearby_events!= undefined){
						records = response.nearby_events;
						var size = records.length; 
						for(var i=0;i<size;i++){
							var item = records[i];
							feedIds.push(item.event_id);
						}
					}
				}
				
				Ti.App.Properties.setObject("feedIds",feedIds);
				HttpHelper.getFeedRecords(0);
	 	});
	}catch(ex){
		Alloy.Globals.displayError("getLatestFeed " + JSON.stringify(ex));
	}			
	
};
HttpHelper.getFeedRecords = function(index){
	try{
		var feedIds = Ti.App.Properties.getObject("feedIds",[]);
		Ti.API.info("feedIds " + JSON.stringify(feedIds));
		if(index >= feedIds.length) {
			Ti.API.error("All Feed post URL Collected");
			HttpHelper.getLatestFriends();
			return;
		}
		var event_id = feedIds[index++];
		
		var userInfo = Ti.App.Properties.getObject("user",{});
		Ti.API.info("userInfo" + JSON.stringify(userInfo));
		var httpparams = {
				data:{
					userid:userInfo.user_id,
					eventid:event_id
				}
	
		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("GetEventRecords",httpparams,function(data){
	 		var response = JSON.parse(data);
			var allMediaURLs = Ti.App.Properties.getObject("allMediaURLs",[]);
			if(response.success == 1){
			
				var mediaRecords = response.eventRecords;
				var size = mediaRecords.length; 
				var utility = require("utility");	
				for(var i=0;i<size;i++){
					var item = mediaRecords[i];
					var exists = utility.isMediaExists({ 
					    media: item.postData,		    
					}); 
					if(!exists){
						allMediaURLs.push(item.postData);
					}	
				}	
				Ti.App.Properties.setObject("allMediaURLs",allMediaURLs);
	 		}
	 		HttpHelper.getFeedRecords(index);
	 	});
	}catch(ex){
		Alloy.Globals.displayError("getFeedRecords " + JSON.stringify(ex));
	}			
	
};
HttpHelper.getLatestFriends = function(){
	try{
		var userInfo = Ti.App.Properties.getObject("user",{});
		
		var httpparams = {
			data:{
				userid:userInfo.user_id,
				maxid:0,
				minid:0
			}
	
		};
	 	var httpClient = require("HttpConnection");
	 	var friends = [];
	 	httpClient.callPostAPI("GetFriendsLatestPosts",httpparams,function(data){
				var response = JSON.parse(data);
				
				if(response.success == 1){		
					var records = response.posts;
					var size = records.length;
					for(var i=size-1;i>=0;i--){
						var item = records[i];
						friends.push(item.user_id);
					}
				}
				
				Ti.App.Properties.setObject("friends",friends);
				HttpHelper.getFriendsRecords(0);
	 	});
	}catch(ex){
		Alloy.Globals.displayError("getLatestFriends " + JSON.stringify(ex));
	}			
	
};

HttpHelper.getFriendsRecords = function(index){
	try{
		var friends = Ti.App.Properties.getObject("friends",[]);
		if(index >= friends.length){
			Ti.API.error("All friends post URL Collected PROCESS COMPLETED");
			
			Alloy.Globals.urlSession = require("com.appcelerator.urlSession");
			Alloy.Globals.sessionConfig = Alloy.Globals.urlSession.createSessionConfiguration({
			    identifier: 'com.tempoalive.tempo.backgroundfetch'
			});
				// Create a URL session object based on the 
			Alloy.Globals.session = Alloy.Globals.urlSession.createSession({
			    configuration: Alloy.Globals.sessionConfig
			});
			
			HttpHelper.backgroundMediaDownload(0);
			return;
			//Completed
		} 
		var user_id = friends[index++];
		
		var userInfo = Ti.App.Properties.getObject("user",{});
		Ti.API.info("userInfo" + JSON.stringify(userInfo));
		var httpparams = {
				data:{
					userid:userInfo.user_id,
					friendUserID:user_id
				}
	
		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("GetFriendPost",httpparams,function(data){
	 		var response = JSON.parse(data);
			var allMediaURLs = Ti.App.Properties.getObject("allMediaURLs",[]);
			if(response.success == 1){
			
				var mediaRecords = response.posts;
				var size = mediaRecords.length; 
				var utility = require("utility");
				for(var i=0;i<size;i++){
					var item = mediaRecords[i];
					
					var exists = utility.isMediaExists({ 
					    media: item.user_post_data,		    
					}); 
					if(!exists){
						allMediaURLs.push(item.user_post_data);	
					}	
				}	
				Ti.App.Properties.setObject("allMediaURLs",allMediaURLs);
	 		}
	 		HttpHelper.getFriendsRecords(index);
	 	});
	}catch(ex){
		Alloy.Globals.displayError("getFriendsRecords " + JSON.stringify(ex));
	}			
	
};

HttpHelper.backgroundMediaDownload = function(index){
	try{
		
		var allMediaURLs = Ti.App.Properties.getObject("allMediaURLs",[]);
		if(index >= allMediaURLs.length){
			// Invalidate the session and cancel current session tasks
    		Alloy.Globals.urlSession.invalidateAndCancel();
 
		} 
		
		var utility = require("utility");	
		index++;
		if(index<allMediaURLs.length){
			Alloy.Globals.mediaUrlInSession = allMediaURLs[index];
			Alloy.Globals.mediaUrlInSessionIndex = index;
			var exists = utility.isMediaExists({ 
			    media: Alloy.Globals.mediaUrlInSession,		    
			}); 
			if(!exists){
				Alloy.Globals.urlSession.backgroundDownloadTaskWithURL(Alloy.Globals.session, Alloy.Globals.mediaUrlInSession);
		 	}else{
		 		HttpHelper.backgroundMediaDownload(index);
		 	}   
		}
	}catch(ex){
		Alloy.Globals.displayError("backgroundMediaDownload " + JSON.stringify(ex));
	}			
	
};

Ti.App.iOS.addEventListener('downloadcompleted', function(e) {
    Ti.API.info('Download completed: ' + JSON.stringify(e));
 	var utility = require("utility");	
 
	utility.cacheMedia({
	    media: Alloy.Globals.mediaUrlInSession,
	    mediaData:e.data,
	    callback:function(filepath){
	    	HttpHelper.backgroundMediaDownload(Alloy.Globals.mediaUrlInSessionIndex);
	    }
	}); 
    
});
module.exports = HttpHelper;

