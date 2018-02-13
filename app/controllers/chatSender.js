var args = $.args;

var record = args.record;
var moment = require("alloy/moment");

if(args.type == "friendPost"){
	$.chatText.text = record.comment_data;
	var dt = new Date(record.created_at);
	$.chatTimestamp.text ="Sent " + moment(dt).format('LT');
	
	$.userName.text = record.commented_byname;

}else{
	$.chatText.text = record.comment_data;
	var dt = new Date(record.created_at);
	$.chatTimestamp.text ="Sent " + moment(dt).format('LT');
	
	$.userName.text = record.commented_byname;
}
