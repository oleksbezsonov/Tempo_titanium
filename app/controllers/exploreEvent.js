// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var utility = require("utility");
var moment = require("alloy/moment");
var record = args.record;
var mediaRecords = [];
var currentPage=0;
var timer;
var actualCount = 0;

var displayedItems = new Object();
var closeCalled = false;
var currentMediaController;
var currentMediaRecord;

if(args.type == "friendPost"){
	setTimeout(getFriendPost,100);

}else{
	setTimeout(getFeedDetails,100);
	
}
$.exploreEvent.addEventListener("close", function(e){
	try{
		if(currentMediaController != undefined){
			currentMediaController.closePlayback();
		}
		if(timer!= undefined)
			clearInterval(timer);
			
		closeCalled = true;
		Ti.App.removeEventListener("pause",onPause);
		Ti.App.removeEventListener("resume",onResume);
	}catch(ex){
		Ti.API.error("close" + ex.toString());
	}
});
function onPause(){
	Ti.API.info("onPause called ");
	if(timer != undefined){
		Ti.API.info("onPause called timer stopped");
		clearInterval(timer);
		timer = undefined;
	}
}
function onResume(){
	Ti.API.info("onResume called");
	//if(initialLoadComplete == true){
		Ti.API.info("onResume called timer started");
		//timer = setInterval(autoPlay,10000);
	//}	
}
function showCurrentEventPostInfo(item){
	try{
		//Ti.API.info("crrent event post " + item.post_created_at);
		$.eventTitleLbl.text = record.event_name;
	
		if(item.post_created_at != undefined){
			var dt =  new Date(item.post_created_at);
			$.eventDateLbl.text =moment(dt).format("llll");
		}
	}catch(ex){
		Ti.API.error("error showCurrentEventPostInfo " + ex.toString());
	}
}
function showCurrentFriendPostInfo(item){
	try{
		//Ti.API.info("crrent friends post " + JSON.stringify(item));
		
		$.eventTitleLbl.text = item.posted_by;
	
		if(item.post_created_at != undefined){
			var dt =  new Date(item.post_created_at);
			$.eventDateLbl.text =moment(dt).format("llll");
		}
	}catch(ex){
		Ti.API.error("error setting feed record " + ex.toString());
	}
}

function setPostInfo(index){
	try{
		if(index > mediaRecords.length) return;
		var item = mediaRecords[index];
		if(args.type == "friendPost"){
			showCurrentFriendPostInfo(item);
		}else{
			showCurrentEventPostInfo(item);
		}
	}catch(ex){
		Ti.API.error("setPostInfo" + ex.toString());
	}
}
function closeMe(e){
	closeCalled = true;
	$.exploreEvent.close();
};

$.eventRecords.addEventListener("click",function(e){
	autoPlay(true);
});
// Feed posts starts
function getFeedDetails(){
	try{
		if(Titanium.Network.online == false){
			utility.customAlert("Your device is not online. Please check connectivity.", "Connection");
			return;
		}
		
	    Alloy.Globals.loading.show(' ', true);
		
		var userInfo = Ti.App.Properties.getObject("user",{});
		Ti.API.info("userInfo" + JSON.stringify(userInfo));
		var httpparams = {
				data:{
					userid:userInfo.user_id,
					eventid:record.event_id
				}
	
		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("GetEventRecords",httpparams,myCallback);
		  
	}catch(ex){
		Alloy.Globals.displayError("GetEventRecords " + JSON.stringify(ex));
	}			
	
}
$.commentView.addEventListener("click",function(e){
	try{
		if(timer != undefined){
			clearInterval(timer);
			timer = undefined;
		}
		var item = $.commentView.record;
		
		Ti.API.info("item " + JSON.stringify(item));
		if(args.type == "friendPost"){
			var wind=Alloy.createController('userPostCommentView',{record:item,type:args.type}).getView();
			wind.open();
		}else{
			var wind=Alloy.createController('commentView',{record:item,eventRecord:record,type:args.type}).getView();
			wind.open();
		}
		
	}catch(ex){
		Alloy.Globals.displayError("commentView " + JSON.stringify(ex));
	}	
});
function myCallback(data){
	try{
		Alloy.Globals.loading.hide();
		var response = JSON.parse(data);
		
		if(response.success != 1){
			Alloy.Globals.showMessageTimeout("No posts available",1000);
			$.exploreEvent.close();
			return;
		}
		
		Alloy.Globals.loading.show(" ",true);
		mediaRecords = response.eventRecords;
		
		var itemCount =0;
		currentPage = 0;
		size =actualCount= mediaRecords.length;
		var newMediaRecords = [];
		if(size>7){
			while(itemCount<7){
				while(currentPage in displayedItems){
					currentPage = utility.getRandomInt(0,mediaRecords.length -1);
					Ti.API.info("*******generating number  " + currentPage);
				}
				displayedItems[currentPage] =currentPage;
				newMediaRecords.push(mediaRecords[currentPage]);
				itemCount++;
				Ti.API.info("*******itemCount  " + itemCount);
			}
			mediaRecords = newMediaRecords;
		}	
		
		var size = mediaRecords.length; 
		currentPage = size-1;
		
		Ti.API.info("currentPage " + currentPage);
		for(var i=0;i<size;i++){
			var item = mediaRecords[i];
		}
		
		var rec = mediaRecords[currentPage];
		
		var exists = utility.isMediaExists({ 
		    media: rec.postData	    
		}); 
		
		Ti.API.error("exits "+ exists);
		
		if(exists){
			autoPlay();
		}else{
			 setTimeout(autoPlay,10000);
		}
		
		
	}catch(ex){
		Alloy.Globals.displayError("myCallback exception " + ex.toString());
	}
}

function autoPlay(manuelForward,myindex){
	try{
		if(manuelForward == true){
			currentMediaController.myCallback = undefined;
			currentMediaController.closePlayback();
		}
		if(myindex != undefined && myindex > (currentPage+1)){
			Ti.API.error("Already moved to next " + myindex + "  currentPage " + currentPage);
			return;
		}
		if(closeCalled ==true) return;
		Ti.API.info("currentPage " + currentPage);
		
		if(parseInt(currentPage) <0){
			closeCalled = true;
			$.exploreEvent.close();
			return;
		}
		
		Alloy.Globals.loading.hide();	
		Ti.API.info("currentPage " + currentPage);
		$.eventRecords.removeAllChildren();
		if(args.type == "friendPost"){
			currentMediaController = Alloy.createController("friendPostDetailView",{record:mediaRecords[currentPage],eventRecord:record,myIndex:currentPage});
			currentMediaController.myCallback = autoPlay;
		}else{
			currentMediaController = Alloy.createController("eventDetailRow",{record:mediaRecords[currentPage],eventRecord:record,myIndex:currentPage});
			currentMediaController.myCallback = autoPlay;
		}
		currentMediaRecord = mediaRecords[currentPage];
		
		$.commentView.record = mediaRecords[currentPage];
		$.eventRecords.add(currentMediaController.getView());
		setPostInfo(currentPage);
		
		
		if(args.type == "friendPost"){
			markPostRead(mediaRecords[currentPage]);
		}
		var feedNumber = mediaRecords.length - currentPage;
		Ti.API.info("Post: " + feedNumber + "/" + actualCount);
		$.postCounter.text = feedNumber + "/" + actualCount ;
	
		currentPage--;
	}catch(ex){
		Alloy.Globals.displayError("autoPlay " + JSON.stringify(ex));
	}
}


// Feed Posts ends

// Friends Posts starts
function getFriendPost(){
	try{
		if(Titanium.Network.online == false){
			utility.customAlert("Your device is not online. Please check connectivity.", "Connection");
			return;
		}
		
	    Alloy.Globals.loading.show(' ', true);
		
		var userInfo = Ti.App.Properties.getObject("user",{});
		Ti.API.info("userInfo" + JSON.stringify(userInfo));
		var httpparams = {
				data:{
					userid:userInfo.user_id,
					friendUserID:record.user_id
				}
	
		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("GetFriendPost",httpparams,getFriendPostCallback);
		  
	}catch(ex){
		Alloy.Globals.displayError("GetFriendPost " + JSON.stringify(ex));
	}			
	
}

function getFriendPostCallback(data){
	try{
		Alloy.Globals.loading.hide();
		var response = JSON.parse(data);
		
		if(response.success != 1){
			Alloy.Globals.showMessageTimeout("No posts available",1000);
			$.exploreEvent.close();
			return;
		}
		Alloy.Globals.loading.show(' ', true);
		mediaRecords = response.posts;
		var size = mediaRecords.length; 
		actualCount = size;
		currentPage = size -1;
		Ti.API.error("size "+ size);
		var rec = mediaRecords[currentPage];
		var exists = utility.isMediaExists({ 
		    media: rec.user_post_data		    
		}); 
		Ti.API.error("exits "+ exists);
		if(exists){
			autoPlay();
		}else{
			setTimeout(autoPlay,10000);
		}
		
		
	}catch(ex){
		Alloy.Globals.displayError("myCallback exception " + ex.toString());
	}
}
function markPostRead(postRecord){
	try{
		if(Titanium.Network.online == false){
			utility.customAlert("Your device is not online. Please check connectivity.", "Connection");
			return;
		}
		
		var userInfo = Ti.App.Properties.getObject("user",{});
		Ti.API.info("userInfo" + JSON.stringify(userInfo));
		var httpparams = {
				data:{
					userid:userInfo.user_id,
					postid:postRecord.user_post_id
				}
	
		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("markReadOnPost",httpparams,function(response){
	 		
	 	});
		  
	}catch(ex){
		Alloy.Globals.displayError("markReadOnPost " + JSON.stringify(ex));
	}			
	
}

//----- Report Button ----//
function reportButton(){
	var postToReport = currentMediaRecord;
	Ti.API.info("postToReport " + JSON.stringify(postToReport));
	var option;
    option = [ "Report", "Cancel" ];
    var opts = {
        cancel: 1,
        options: option,
        selectedIndex: 1,
        destructive: 0
    };
    var dialog = Ti.UI.createOptionDialog(opts);
    dialog.show();
    dialog.addEventListener("click", function(e) {
        Ti.API.info("e index " + e.index);
        if(e.index == 0){
        	sendReport(postToReport);
        }
       
    });
}

function sendReport(postToReport) {
		var id;
		if(args.type == "friendPost"){
			id = postToReport.user_post_id;
		}else{
			id = postToReport.eventPostId;
		}
		Ti.API.info("postToReport " + JSON.stringify(postToReport));
		
		
		if(postToReport)
        var emailDialog = Ti.UI.createEmailDialog();
        emailDialog.subject = "This post has inappropriate content";
        var htmlEmail = '<html><body style="font-family:arial;font-size:14px">';
        htmlEmail += "Dear Tempo, <br><br>";
        htmlEmail += "The Post # " + id + " is inappropriate. <br><br>";
        htmlEmail += '<span style="color:#919191">Please provide details here of what is inappropriate with the post.</span><br><br><br>';
        htmlEmail += "Thank you,<br>";
        htmlEmail += "</body></html>";
        Ti.API.info("html email " + htmlEmail);
        emailDialog.html = true;
        emailDialog.messageBody = htmlEmail;
        emailDialog.setToRecipients([ "support@tempoevent.com" ]);
        emailDialog.open();
    }

//-------------//

Ti.App.addEventListener("pause",onPause);
Ti.App.addEventListener("resume",onResume);