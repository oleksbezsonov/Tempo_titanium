// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var moment = require("alloy/moment");
var utility = require("utility");

var mediaChanged = false;

$.editProfile.addEventListener("click",function(){
	$.fname.blur();
	$.lname.blur();

	$.email.blur();
	$.phnNumber.blur();
});

var userInfo = Ti.App.Properties.getObject("user",{});
Ti.API.info("userInfo " + JSON.stringify(userInfo));

$.userAvatarImg.image = userInfo.user_avatar;
$.fname.value = userInfo.first_name;
$.lname.value = userInfo.last_name;
$.email.value = userInfo.user_email;
$.gender.text = (userInfo.user_gender==""?"Not specified":userInfo.user_gender);
$.phnNumber.value = userInfo.user_phone;

var dateval = new Date(userInfo.user_dob).getTime();
$.dobTxt.value = moment(userInfo.user_dob).format("YYYY-MM-DD");
$.dobTxt.dobval = dateval;

function showGenderPicker(){
	try{
	
	Alloy.createWidget('danielhanold.pickerWidget', {
	  id: 'mySingleColumn',
	  outerView: $.editProfile,
	  hideNavBar: false,
	  type: 'single-column',
	  selectedValues: [20],
	  pickerValues: [{"Male": 'Male', "Female": 'Female'}],
	  onDone: function(e) {
	    if (!e.cancel) {
		    Ti.API.info("e" + JSON.stringify(e));
		    $.gender.text = e.data[0].value;
		}
	  },
	});	

	}catch(ex){
		Ti.API.error("showGenderPicker " + JSON.stringify(ex));
	}
}
function showDoBPicker(){
	try{

	// Date Picker example.
	// Set minimum date to 1900.
	var minDate = new Date(new Date().setYear(1900));
	// Set minimum date to today - 18 years.
	var maxDate = new Date(new Date().setYear(new Date().getYear()-18));
	var defaultValue = maxDate;
	var maxSelectedDate = new Date(new Date().setYear(new Date().getYear()-18));
	var overlay = Alloy.createWidget('danielhanold.pickerWidget', {
	  id: 'myDatePicker',
	  outerView: $.editProfile,
	  hideNavBar: false,
	  type: 'date-picker',
	  pickerParams: {
	    minDate: minDate,
	    maxDate: maxDate,
	    value: defaultValue,
	    maxSelectedDate: maxSelectedDate,
	    maxSelectedDateErrorMessage: 'You must be at least 18 years old.'
	  },
	  onDone: function(e) {
	  	if (!e.cancel) {
		    Ti.API.info("e" + JSON.stringify(e));
		    var datetext = moment(e.data.unixMilliseconds).format("YYYY-MM-DD");
		    $.dobTxt.value = datetext;
		    $.dobTxt.dobval = e.data.unixMilliseconds;
 
		 }  
	  },
	});
	}catch(ex){
		Ti.API.error("showDOBPicker " + JSON.stringify(ex));
	}
}
function uploadImage(){
	var captureMedia = require("captureMedia");
	captureMedia.showPhotoOption(setMedia);
	
}
var setMedia = function(response){
	Ti.API.info("setMedia response " + JSON.stringify(response));
	
	if(response.action == 'image'){
		$.userAvatarImg.image = response.media;
		$.userAvatarImg.isMedia = true;
		mediaChanged = true;
	}
};

 $.back.addEventListener("click",function(e){
	$.editProfile.close();
});



function updateProfile(){
	try{
		if(Titanium.Network.online == false){
			utility.customAlert("Your device is not online. Please check connectivity.", "Connection");
			return;
		}
	
		if($.fname.value==""){
			utility.customAlert('Please enter your firstname','Profile');
	    	return;
	    }
	    if($.lname.value==""){
			utility.customAlert('Please enter your lastname','Profile');
	    	return;
	    }
	     if($.email.value==""){
			utility.customAlert('Please enter your email','Profile');
	    	return;
	    }
	    if($.phnNumber.value==""){
			utility.customAlert('Please enter the phone number','Profile');
	    	return;
	    }
		if($.phnNumber.value.length<10){
			utility.customAlert('Please enter valid phone number','Profile');
	    	return;
	    }
		Alloy.Globals.loading.show(' ', false);

		var dob = $.dobTxt.value;

		var httpparams = {
				data:{
					userid:userInfo.user_id, 
					firstname:$.fname.value,
					lastname:$.lname.value,
					email:$.email.value,
					phone:$.phnNumber.value,
					dob:dob,
					gender:$.gender.text
				}
	
		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("editProfile",httpparams,myCallback);
		 
	}catch(ex){
		Alloy.Globals.displayError("editProfile " + JSON.stringify(ex));
	}			
	
}
function myCallback(data){
	try{
		Alloy.Globals.loading.hide();
		var response = JSON.parse(data);
		
		if(response.success != 1){
			utility.customAlert(response.message,"Login");
			return;
		}
		if(mediaChanged == true){
			uploadAvatar();
		}else{
			Ti.App.fireEvent("refreshProfile");
			$.editProfile.close();
		}
		Ti.App.Properties.setObject("user",response.userinfo[0]);
		
	}catch(ex){
		Alloy.Globals.displayError("registerUser exception " + ex.toString());
	}
}

function uploadAvatar(){
		try{
		if(Titanium.Network.online == false){
			utility.customAlert("Your device is not online. Please check connectivity.", "Connection");
			return;
		}
		Alloy.Globals.loading.show(' ', false);
		var userInfo = Ti.App.Properties.getObject("user",{});
		var httpparams = {
			'userid':userInfo.user_id,
			'avatar': $.userAvatarImg.image
		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.updateMedia("uploadAvatar",httpparams,uploadAvatarCallback);
		 
	}catch(ex){
		Alloy.Globals.displayError("uploadAvatar " + JSON.stringify(ex));
	}finally{
		
	}	
}

function uploadAvatarCallback(data){
	try{
		Alloy.Globals.loading.hide();
		var response = JSON.parse(data);
		if(response.success == 1){
			var userInfo = Ti.App.Properties.getObject("user",{});
			userInfo.user_avatar = response.imagepath;
			Ti.App.Properties.setObject("user",userInfo);
		}
		
		Ti.App.fireEvent("refreshProfile");
		
		$.editProfile.close();
	}catch(ex){
		Alloy.Globals.displayError("uploadAvatar exception " + ex.toString());
	}
}