// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var moment = require("alloy/moment");
var utility = require("utility");
var record = args.record;
$.activityIndicator.show();
if(record.promotion_image1 != undefined && record.promotion_image1 != ""){
	utility.cacheMedia({
		    media: record.promotion_image1,
		    callback:function(filepath){
		    	$.activityIndicator.hide();
    			$.mediaView.remove($.activityIndicator);
		    	Ti.API.info("callback  " + filepath);
		    	$.eventImage.image = filepath;
		    }
		}); 		
}
var rate  =  Math.floor(record.event_rating);
$.eventRatingLbl.text =(rate>999?999:rate);
$.eventTitleLbl.text = record.event_name;

try{
	if(record.event_start_datetime != undefined){
		var dt =  new Date(record.event_start_datetime);
		$.eventDateLbl.text =moment(dt).format("llll");
	}
}catch(ex){
	Ti.API.error("error setting feed record " + ex.toString());
}

