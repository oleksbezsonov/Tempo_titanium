// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var record = args.record;
var moment = require("alloy/moment");

if(args.type == "friendPost"){
	$.chatText.text = record.comment_data;
	var dt = new Date(record.created_at);
	$.chatTimestamp.text ="Sent " + moment(dt).format('LT');

}else{
	$.chatText.text = record.comment_data;
	var dt = new Date(record.created_at);
	$.chatTimestamp.text ="Sent " + moment(dt).format('LT');

}
