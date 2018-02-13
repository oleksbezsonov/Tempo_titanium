// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var moment = require("alloy/moment");

var record = args.record;
//Ti.API.error("record " + JSON.stringify(record));
$.messageLbl.text = record.comment_text;

var dt = moment(record.created_at);
$.datetimeLbl.text = moment(dt).format('llll');


if(record.from_user_avatar!= undefined && record.from_user_avatar!= ""
 && record.from_user_avatar.indexOf("http")>=0 && record.from_user_avatar.indexOf(" ") == -1){
	$.avatarImg.image = record.from_user_avatar;
}