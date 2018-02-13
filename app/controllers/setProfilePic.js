// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

$.navigation.rightBtn.visible =true;

$.navigation.backBtn.addEventListener("click",function(e){
	$.setProfilePic.close();
});
$.navigation.rightBtn.addEventListener("click",function(e){
	closeMe();
});

$.continueProfile.addEventListener("click",function(e){
	if($.userAvatarImg.isMedia)
		uploadAvatar($.userAvatarImg.image);
	else
		closeMe();
});

function uploadImage(){
	var captureMedia = require("captureMedia");
	captureMedia.showPhotoOption(setMedia);
	
}
var setMedia = function(response){
	Ti.API.info("setMedia response " + JSON.stringify(response));
	
	if(response.action == 'image'){
		$.userAvatarImg.image = response.media;
		$.userAvatarImg.isMedia = true;
	}else if(response.action == 'cancel'){
		$.userAvatarImg.image = undefined;
		$.userAvatarImg.isMedia = false;
	}
};
function closeMe(){
	var wind=Alloy.createController('letsStartView').getView();
	wind.open();
	
	Alloy.Globals.Screens.letsStartView = wind;
}
function uploadAvatar(media){
		try{
		if(Titanium.Network.online == false){
			utility.customAlert("Your device is not online. Please check connectivity.", "Connection");
			return;
		}
		Alloy.Globals.loading.show(' ', false);
		var userInfo = Ti.App.Properties.getObject("user",{});
		var httpparams = {
			'userid':userInfo.user_id,
			'avatar': media
		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.updateMedia("uploadAvatar",httpparams,myCallback);
		 
	}catch(ex){
		Alloy.Globals.displayError("uploadAvatar " + JSON.stringify(ex));
	}finally{
		
	}	
}

function myCallback(data){
	try{
		Alloy.Globals.loading.hide();
		var response = JSON.parse(data);
		
		if(response.success != 1){
			utility.customAlert(response.message,"Signup");
			return;
		}
		
		closeMe();
	}catch(ex){
		Alloy.Globals.displayError("uploadAvatar exception " + ex.toString());
	}
}