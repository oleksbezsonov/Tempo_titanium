var args = $.args;
var utility = require("utility");
var record = args.record;
//Ti.API.info("record " + JSON.stringify(record));
$.isDownloaded = false;
$.activityIndicator.show();

try{
	if(record.user_post_type == "image"){
		utility.cacheMedia({
		    media: record.user_post_data,
		    callback:function(filepath){
	    		$.activityIndicator.hide();
			    $.imageRecord.remove($.activityIndicator);
			   
		    	Ti.API.info("url" + record.user_post_data + "\n callback  " + filepath);
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
		    media: record.user_post_data,
		    callback:function(filepath){
		    	$.activityIndicator.hide();
				$.videoRecord.remove($.activityIndicator);
		    	Ti.API.info("callback  " + filepath);
		    	$.videoPlayer.url = filepath;
		    	$.isDownloaded = true;
		    }
		}); 
		
	}
	var likes = (record.like_count == 0?"":record.like_count);
	likes = utility.intToString(likes);
	$.likeCount.text =likes;
	

	if(record.isUserLiked){
		$.likeBtn.image = "images/like.png";
	}else{
		$.likeBtn.image = "images/heartWhite.png";
	}

	var rate  =  Math.floor(record.tempo_user_rank);
	$.rating.text =(rate>999?999:rate);

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
					postid:record.user_post_id,
					islike:(record.isUserLiked==1?0:1)
				}
	
		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("updatepostmedialike",httpparams,function(data){
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
				Alloy.Globals.displayError("updatepostmedialike exception " + ex.toString());
			}
	 	});
		 
	}catch(ex){
		Alloy.Globals.displayError("updatepostmedialike " + JSON.stringify(ex));
	}			
	
}

if(record.user_post_type == "video"){
	$.videoPlayer.addEventListener("complete",function(e){
		if($.myCallback != undefined)
			$.myCallback(false,args.myIndex);
	});
	
}

$.closePlayback = function(){
	if(record.mediaType == "video"){
		$.videoPlayer.stop();
		Ti.API.error("*******Media stopped *******");
	}
};
