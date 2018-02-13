var args = $.args;
var record = args.record;
var utility = require("utility");
try{
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
	if(record.event_name != undefined)
		$.eventTitleLbl.text = record.event_name;
	
	$.eventRowView.addEventListener("click",function(e){
		$.isSelected.isChecked = !$.isSelected.isChecked;
		if($.isSelected.isChecked){
			$.isSelected.image="images/imageEventChecked.png";
		}else{
			$.isSelected.image="images/imageEvent.png";
		}
		$.myCallback(record,$.isSelected.isChecked);
	});
	if(record.isSelected){
		$.isSelected.image="images/imageEventChecked.png";
	}else{
		$.isSelected.image="images/imageEvent.png";
	}
	

}catch(ex){
	Ti.API.error("exception eventrow view " + ex.toString());
}
