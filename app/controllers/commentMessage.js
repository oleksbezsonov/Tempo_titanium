// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var moment = require("alloy/moment");
var record = args.record;

$.username.text = record.comment_text.split(" ")[0];

if(record.user_post_type == "image") 
	$.img.image = record.user_post_url;
else
	$.videoPlayer.url = record.user_post_url;
	
var dt = moment(record.created_at);
$.postedOn.text = moment(dt).format('llll');
