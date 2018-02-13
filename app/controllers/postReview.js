// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var moment = require("alloy/moment");
var utility = require("utility");
var record = args.record;
Ti.API.info("record " + JSON.stringify(record));

$.activityIndicator.show();
try{
	
	if(args.type =="userpost"){
		var mediaurl;
		if(record.user_post_url != undefined)
			mediaurl = record.user_post_url;
		else if(record.user_post_data != undefined)
			mediaurl = record.user_post_data;
				
		if(record.user_post_type == "image"){
				utility.cacheMedia({
				    media: mediaurl,
				    callback:function(filepath){
				    	$.activityIndicator.hide();
				    	$.postReview.remove($.activityIndicator);
    					Ti.API.info("callback  " + filepath);
				    	$.eventImg.image = filepath;
				    	$.isDownloaded = true;
				    }
				}); 	
				
		}else{
			utility.cacheMedia({
			    media: mediaurl,
			    callback:function(filepath){
			    	//$.activityIndicator.hide();
			    	//$.postReview.remove($.activityIndicator);
			    	Ti.API.info("callback  " + filepath);
			    	$.videoPlayer.url = filepath;
			    	$.isDownloaded = true;
			    }
			}); 
			
		}
		
		var likes = (record.like_count == 0?"":record.like_count);
		likes = utility.intToString(likes);
		$.likeCount.text =likes;
		
	
		var dt =  new Date(record.created_at);
		$.dateLbl.text =moment(dt).format("llll");
	}else{
		
				
		if(record.post_type == "image"){
			$.eventImg.image = record.post_data;
		}else{
			$.videoPlayer.url = record.post_data;
		}
		
		var likes = (record.like_count == 0?"":record.like_count);
		likes = utility.intToString(likes);
		$.likeCount.text =likes;
		
		
		var dt =  new Date(record.created_at);
		$.dateLbl.text =moment(dt).format("llll");
	}
	
	var rate =0;
	if(record.tempo_user_rank != undefined) 
		rate =  Math.floor(record.tempo_user_rank);
	$.rating.text =(rate>999?999:rate);	
}catch(ex){
	Ti.API.error("exception " + ex.toString());
	
}

function closeMe(e){
	$.postReview.close();
};


function deleteRecord(){
	try{

		if(Titanium.Network.online == false){
			utility.customAlert("Your device is not online. Please check connectivity.", "Connection");
			return;
		}
	
	    Alloy.Globals.loading.show(' ', false);
		
		var httpparams = {
				data:{
					postid:record.user_post_id
				}
	
		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("deleteuserpost",httpparams,function(data){
	 		try{
				Alloy.Globals.loading.hide();
				if($.myCallback != undefined) $.myCallback();
				$.postReview.close();
			}catch(ex){
				Alloy.Globals.displayError("deleteuserpost exception " + ex.toString());
			}
	 	});
		 
	}catch(ex){
		Alloy.Globals.displayError("deleteuserpost " + JSON.stringify(ex));
	}			

}

$.commentView.addEventListener("click",function(e){
	try{
		var wind=Alloy.createController('userPostCommentView',{record:record,eventRecord:undefined,type:"friendPost"}).getView();
		wind.open();
		
	}catch(ex){
		Alloy.Globals.displayError("commentView " + JSON.stringify(ex));
	}	
});

$.deleteItem.addEventListener("click",function(e){
	
	var dialog = Ti.UI.createAlertDialog({
	    	No: 1,
	    	buttonNames: ['Yes', 'No'],
	   	 	message: 'Are you sure you want to delete this post?',
	    	title: 'Delete'
	  });
	  dialog.addEventListener('click', function(e){
	 	if(e.index == 0){  
	 		if(record.user_post_notification_id != undefined){
				deleteNotificationRecord();
			}else{
				deleteRecord();
			}
	   	}
	  });
	  dialog.show();

});

function deleteNotificationRecord(){
	try{

		if(Titanium.Network.online == false){
			utility.customAlert("Your device is not online. Please check connectivity.", "Connection");
			return;
		}
	
	    Alloy.Globals.loading.show(' ', false);
		
		var httpparams = {
				data:{
					user_post_notification_id:record.user_post_notification_id
				}
	
		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("deletepostNotification",httpparams,function(data){
	 		try{
				Alloy.Globals.loading.hide();
				if($.myCallback != undefined) $.myCallback();
				$.postReview.close();
			}catch(ex){
				Alloy.Globals.displayError("deletepostNotification exception " + ex.toString());
			}
	 	});
		 
	}catch(ex){
		Alloy.Globals.displayError("deletepostNotification " + JSON.stringify(ex));
	}			

}
