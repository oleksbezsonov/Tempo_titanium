// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var record = args.record;

$.nameLbl.text = record.first_name + " " + record.last_name;
$.usernameLbl.text = record.user_name;

$.followBtn.text = record.association_type;
var dw= Ti.Platform.displayCaps.platformWidth;
Ti.API.info("dw " + dw);
if(dw>=400){
	$.nameLbl.width = "44%";
}
if(record.association_type==0){
	$.followBtn.text= "Follow";
}else if(record.association_type.toLowerCase()=="follow"){
	$.followBtn.opacity="0.5";
	$.followBtn.text= "Unfollow";
}

if(record.user_avatar != undefined && record.user_avatar != ""
 && record.user_avatar.indexOf("http")>=0 && record.user_avatar.indexOf(" ") == -1){
	$.userAvatarImg.image = record.user_avatar;
}
