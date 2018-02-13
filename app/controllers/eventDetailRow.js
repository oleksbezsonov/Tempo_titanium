var args = $.args;
$.isDownloaded = false;

$.activityIndicator.show();
try{
	var utility = require("utility");
	
	var eventRecord = args.eventRecord;
	var record = args.record;
	Ti.API.info("record " + JSON.stringify(record));
	Ti.API.info("eventRecord " + JSON.stringify(eventRecord));

	if(record.mediaType == "image"){
			utility.cacheMedia({
			    media: record.postData,
			    callback:function(filepath){
			    	$.activityIndicator.hide();
				    $.imageRecord.remove($.activityIndicator);
				    	
			    	Ti.API.info("callback  " + filepath);
			    	$.eventImg.image = filepath;
			    	$.isDownloaded = true;
			    	
					setTimeout(function(){
						if($.myCallback != undefined)
							$.myCallback(false,args.myIndex);
					},2000);
					
			    }
			}); 	
			
	}else{
		utility.cacheMedia({
		    media: record.postData,
		    callback:function(filepath){
		    	$.activityIndicator.hide();
				$.videoRecord.remove($.activityIndicator);
		    	Ti.API.info("callback  " + filepath);
		    	$.videoPlayer.url = filepath;
		    	$.isDownloaded = true;
		    }
		}); 
		
	}
	var likes = utility.intToString(record.likeCount);
	likes = (likes == 0?"":likes);
	
	$.likeCount.text =likes;
	
	var rate  =  Math.floor(eventRecord.event_rating);
	$.rating.text =(rate>999?999:rate);

	if(record.isUserLiked){
		$.likeBtn.image = "images/like.png";
	}else{
		$.likeBtn.image = "images/heartWhite.png";
	}
	
}catch(ex){
	Ti.API.error("exception " + ex.toString());
	
}
$.startPlayback = function(){
	try{
	$.videoPlayer.play();
	$.videoPlayer.autoplay = false;
	$.videoPlayer.mediaControlStyle = Titanium.Media.VIDEO_CONTROL_NONE;
	}catch(ex){
		Ti.API.error("startPlayback " + ex.toString());
	}
};

function likeUnlike(){
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
					eventid:eventRecord.event_id,
					event_post_id:record.eventPostId,
					islike:(record.isUserLiked==1?0:1)
				}
	
		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("updateeventmedialike",httpparams,function(data){
	 		try{
				Alloy.Globals.loading.hide();
				var response = JSON.parse(data);
				record.isUserLiked = !record.isUserLiked;
				if(response.success == 1){
					if(record.isUserLiked){
						$.likeBtn.image = "images/like.png";
					}else{
			 			$.likeBtn.image = "images/heartWhite.png";
					}
					var likes = utility.intToString(record.like_count);
					likes = (likes == 0?"":likes);
					$.likeCount.text = likes;
				}
				
		
			}catch(ex){
				Alloy.Globals.displayError("updateeventmedialike exception " + ex.toString());
			}
	 	});
		 
	}catch(ex){
		Alloy.Globals.displayError("updateeventmedialike " + JSON.stringify(ex));
	}			

}
if(record.mediaType == "video"){
	$.videoPlayer.addEventListener("complete",function(e){
		setTimeout(function(){
			if($.myCallback != undefined)
				$.myCallback(false,args.myIndex);
		},1000);
		
	});
}

$.closePlayback = function(){
	if(record.mediaType == "video"){
		$.videoPlayer.stop();
		Ti.API.error("*******Media stopped *******");
	}
};
