// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var record = args.record;

Ti.API.error("******* set selected " + record.isSelected);
if(record != undefined){
	//radio button  on/off actions
	var setButtonOn = function(source) {
	    source.backgroundColor = '#328bd1';
	    source.title='\u2713';
	    source.value = true;
	};
	
	var setButtonOff = function(source) {
	    source.backgroundColor = '#f1f1f1';
	    source.title='';
	    source.value = false;
	};
	
	$.radioBtn.addEventListener('click', function(e) {
	
	    if(e.source.value == true) {
	        setButtonOff($.radioBtn);
	    } else {
	        setButtonOn($.radioBtn);
	    }
	    $.myCallback(record,e.source.value);
	});
	
	$.nameLbl.text = record.first_name + " " + record.last_name;
	
	try{
		
		if(record.user_avatar != undefined && record.user_avatar != ""
		 && record.user_avatar.indexOf("http")>=0 && record.user_avatar.indexOf(" ") == -1){
			$.userAvatarImg.image = record.user_avatar;
		}
		if(record.isSelected == true){
			setButtonOn($.radioBtn);
			Ti.API.error("******* set selected");
		}
	}catch(ex){
		Ti.API.error("error setting image " + ex.toString());
	}
}	