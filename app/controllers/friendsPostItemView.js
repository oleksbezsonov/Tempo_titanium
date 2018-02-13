// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var moment = require("alloy/moment");

var record = args.record;

if(args.rowIndex == 0){
	$.friendsPostItemView.left = 1;
}else{
	$.friendsPostItemView.left = 3;
}
try{
	if(record.user_avatar != undefined && record.user_avatar != ""
	 && record.user_avatar.indexOf("http")>=0 && record.user_avatar.indexOf(" ") == -1){
		$.avatarImg.image = record.user_avatar;
	}

	$.username.text = record.user_name;

	if(record.post_created_at != undefined){
		var dt =  new Date(record.post_created_at);
		$.timeago.text =moment(dt).fromNow();
	}
	if(record.status == "unread"){
		$.borderView.borderColor = "#33bdea";
	}else{
		$.borderView.borderColor = "transparent";
	}
}catch(ex){
	Ti.API.error("error setting record " + ex.toString());
}