// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var utility = require("utility");

$.navigation.backBtn.addEventListener("click",function(e){
	$.forgotPassword.close();
});

$.forgotPassword.addEventListener("click",function(e){
	$.emailId.blur();
	$.phoneNumber.blur();
});


function forgotPassword(){
	try{
	    if($.emailId.value=="" || $.phoneNumber.value){
			utility.customAlert('Please enter Email or Phone number','Forgot Password');
	    	return;
	    }
	    Alloy.Globals.loading.show(' ', false);
		var value = ($.emailId.value==""?$.phoneNumber.value:$.emailId.value);
		var httpparams = {
				data:{
					emailOrPhone:value
				}
	
		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("forgotPassword",httpparams,myCallback);
	}catch(ex){
		Alloy.Globals.displayError("forgotPassword " + ex.toString());
	}	
}

function myCallback(data){
	try{
		Alloy.Globals.loading.hide();
		var response = JSON.parse(data);
		
		if(response.success != 1){
			utility.customAlert(response.message,"Forgot password");
			return;
		}
		utility.customAlert(response.message,"Forgot password");
		$.forgotPassword.close();
		
	}catch(ex){
		Alloy.Globals.displayError("forgotPassword exception " + ex.toString());
	}
}
