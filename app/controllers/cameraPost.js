// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
Ti.API.info("args " + JSON.stringify(args));
var utility = require("utility");
var selectedEvents = new Object();
var selectedUsers = new Object();
var allUserRecords;
var allEventRecords;
var videoThumbnail = args.videoThumbnail;

setTimeout(function(){
	getFeeds();
	getUsers();
	
},100);

$.bckLbl.addEventListener("click",function(e){
	$.cameraPost.close();
});

function getFeeds(){
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
					categoryid:1
				}
	
		};
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
			//utility.customAlert(response.message,"Post");
			return;
		}
		
		var records = response.myevent;
		var userInfo = Ti.App.Properties.getObject("user",{});
		var size = records.length; 
		for(var i=0;i<size;i++){
			var startdt = new Date(records[i].event_start_datetime);
			var enddt = new Date(records[i].event_end_datetime);
			var currentdt = new Date();
			if((currentdt>=startdt && currentdt<=enddt) 
				|| (records[i].created_by_user == userInfo.user_id && currentdt<=enddt)){
				records[i].isSelected = false;
				var item = records[i];
				var row = createView(item);
				$.myEventsScrollView.add(row);	
			}
			
		}
		allEventRecords = records;
	}catch(ex){
		Alloy.Globals.displayError("getFeeds exception " + ex.toString());
	}
}

function createView(item){
	var row = Alloy.createController("eventRowView",{record:item});
	row.myCallback = function(record,isSelected){
		if(isSelected == false){
			if(record.event_id in selectedEvents) delete selectedEvents[record.event_id];
		}else if(isSelected){
			selectedEvents[record.event_id] = record.event_id;
			resetEventSelection(record.event_id);
			
		}
		Ti.API.info("selected " + JSON.stringify(selectedEvents));
	};
	var rowView = row.getView();
	row.record = item;
	return rowView;
}
function resetEventSelection(eventid){
	var size = allEventRecords.length; 
	
	for(var i=0;i<size;i++){
		var item = allEventRecords[i];
		if(item.event_id == eventid){
			item.isSelected = true;
		}else if(item.isSelected == true){
			item.isSelected = false;
			var row = createView(item);
			$.myEventsScrollView.replaceAt({view:row,position:i});	
			if(item.event_id in selectedEvents) delete selectedEvents[item.event_id];
		}
		
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
		
		var userInfo = Ti.App.Properties.getObject("user",{});
		Ti.API.info("userInfo" + JSON.stringify(userInfo));
		var httpparams = {
				data:{
					userid:userInfo.user_id
					
				}
	
		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("getMyFollows",httpparams,getUsersCallback);
		 
	}catch(ex){
		Alloy.Globals.displayError("searchUser " + JSON.stringify(ex));
	}			
	
}

function getUsersCallback(data){
	try{
		Alloy.Globals.loading.hide();
		var response = JSON.parse(data);
		
		if(response.success != 1){
			//utility.customAlert(response.message,"Post");
			return;
		}
		var records = response.myFollowers;
		allUserRecords = records;
		var size = records.length;
		$.tableViewRecords.setData([]);
		for(var i=0;i<size;i++){
			var item = records[i];
			
			var row = createUserRow(item);
			row.record = item;
			$.tableViewRecords.appendRow(row);
		}
		
	}catch(ex){
		Alloy.Globals.displayError("searchUser exception " + ex.toString());
	}
}

function createUserRow(item){
	var row = Alloy.createController('eventUserRow',{record:item});
	row.myCallback = function(record,isSelected){
		if(isSelected == false){
			if(record.user_id in selectedUsers) delete selectedUsers[record.user_id];
		}else if(isSelected){
			selectedUsers[record.user_id] = record.user_id;
		}
		Ti.API.info("selectedUsers " + JSON.stringify(selectedUsers));
	};
	var rowView = row.getView();
	rowView.record = item;	
	return rowView;
}


$.postBtn.addEventListener("click",function(e){
	if($.args.mediaType=="image"){
		postMedia();
	}else{
		processiOSVideo();
	}
	
});

function postMedia(videoURL){
		try{
		if(Titanium.Network.online == false){
			utility.customAlert("Your device is not online. Please check connectivity.", "Connection");
			return;
		}
		 Alloy.Globals.loading.show(' ', false);
		var userInfo = Ti.App.Properties.getObject("user",{});
		
		var users="";
		for(var key in selectedUsers){
			if(users != "") users+=",";
			users+=key;
		}
		var events="";
		for(var key in selectedEvents){
			if(events != "") events+=",";
			events+=key;
		}
		var media;
		media = args.media;
		if(args.mediaType == "video"){
			var filename = videoURL;
	  		var videofile = Titanium.Filesystem.getFile(filename);
	  		media = videofile.read();
		}
		var httpparams = {
					'userid':userInfo.user_id,
					'posttype':args.mediaType,
					'postdata':media,
					'postedtouserid':users,
					'eventid':events	
		};		
		
	 	var httpClient = require("HttpConnection");
	 	httpClient.updateMedia("postTo",httpparams,postMediaCallback);
		 
	}catch(ex){
		Alloy.Globals.displayError("postMedia " + JSON.stringify(ex));
	}finally{
		
	}	
}
 
function postMediaCallback(data){
	try{
		Alloy.Globals.closeCameraFlow();
		Alloy.Globals.loading.hide();
		var response = JSON.parse(data);
		
		if(response.success != 1){
			utility.customAlert("Due to network issue, we are unable to post at this time, please try again.","Post");
			return;
		}
		if($.args.mediaType=="video" && response.user_post_id != undefined){
			uploadVideoThumbnail(response.user_post_id);
		}else{
			Alloy.Globals.tabGroup.setActiveTab(Alloy.Globals.FEEDS_TAB);
			Alloy.Globals.FEEDS_TAB.setActive(true);
		}
		
	}catch(ex){
		Alloy.Globals.displayError("postMediaCallback exception " + ex.toString());
	}
}

//radio button  on/off actions
var setButtonOn = function(source) {
    source.backgroundColor = '#328bd1';
    source.title='\u2713';
    source.value = true;
   
};

var setButtonOff = function(source) {
    source.backgroundColor = '#f1f1f1';
    source.title='';
    source.value = false;
};

$.radioBtn.addEventListener('click', function(e) {
    if(e.source.value == true) {
        setButtonOff($.radioBtn);
    } else {
        setButtonOn($.radioBtn);
    }
	 selectUnselectUsers(e.source.value);
});

function selectUnselectUsers(isSelected){
	try{

		var records = allUserRecords;

		var size = records.length;
		$.tableViewRecords.setData([]);
		for(var i=0;i<size;i++){
			var item = records[i];
			item.isSelected = isSelected;
			
			var row = createUserRow(item);
			row.record = item;
			$.tableViewRecords.appendRow(row);
			
			if(isSelected == false){
				if(item.user_id in selectedUsers) delete selectedUsers[item.user_id];
			}else if(isSelected){
				selectedUsers[item.user_id] = item.user_id;
			}
		}
		Ti.API.info("selectedUsers " + JSON.stringify(selectedUsers));
	}catch(ex){
		Alloy.Globals.displayError("selectUnselectUsers exception " + ex.toString());
	}

}


function processiOSVideo(){
	try{	
		var savedFile = Ti.Filesystem.getFile(args.media);
		
		var vidmedia = savedFile.read();
		var trimmer = require('ti.ios.trim');
		
     	var timestamp = (new Date()).getTime();
  	 	var filename = Titanium.Filesystem.tempDirectory + timestamp + 'videofile.mov';
	  	var movieFile = Titanium.Filesystem.getFile(filename);
        
        Ti.API.info("movieFile " + movieFile.exists() + "  " + movieFile.nativePath);
               
        movieFile.write(vidmedia);
        movieFile.setRemoteBackup(false);
 		trimmer.trimVideo({
		    input: movieFile.resolve(),
		    quality: 2,
		    success: function(e) {
		        Ti.API.info('SUCCESS:');
		        Ti.API.info('path to trimmed file: '+ e.videoURL);
		        
		        Ti.API.info(" e.videoURL " + e.videoURL);
		       
		      	videoURL = e.videoURL;
		      	
		      	if(movieFile.exists()){
		      		movieFile.deleteFile();
					Ti.API.info(movieFile.nativePath+ " file deleted");
		      	}
				postMedia(videoURL);
		    },
		    error: function(e) {
		        Ti.API.error('ERROR:');
		        Ti.API.info(JSON.stringify(e));
		    }
		});
		
		
	}catch(ex){
		Ti.API.error("processiOSVideo " +ex);
	}
		
}


function uploadVideoThumbnail(mediaid){
		try{
		
	    
	    if(Titanium.Network.online == false){
			utility.customAlert("Your device is not online. Please check connectivity.", "Connection");
			return;
		}
	    
	    //Alloy.Globals.loading.show('Uploading ', false);
		var httpparams = {
			'mediaid':mediaid,
			'videothumbnail': videoThumbnail
		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.updateMedia("UploadVideoThumbnail",httpparams,videoThumCallback);
		 
	}catch(ex){
		Alloy.Globals.displayError("uploadVideoThumbnail " + JSON.stringify(ex));
	}			
	
}

function videoThumCallback(data){
	Alloy.Globals.tabGroup.setActiveTab(Alloy.Globals.FEEDS_TAB);
	Alloy.Globals.FEEDS_TAB.setActive(true);
}