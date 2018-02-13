// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var utility = require("utility");

$.emailTxt.value = Alloy.Globals.userInfo.email;

$.navigation.backBtn.addEventListener("click",function(e){
	$.setEmail.close();
});

$.setEmail.addEventListener("click",function(e){
	$.emailTxt.blur();
});
$.skip.addEventListener("click",function(e){
	Alloy.Globals.userInfo.email = "";
	var wind=Alloy.createController('setPhoneNumber').getView();
	wind.open();
	Alloy.Globals.Screens.setPhoneNumber =wind;
});



$.continueBtn.addEventListener("click",function(e){
	verifyEmail();
});
function verifyEmail(){
	try{
		if(Titanium.Network.online == false){
			utility.customAlert("Your device is not online. Please check connectivity.", "Connection");
			return;
		}
	
	    if($.emailTxt.value==""){
			utility.customAlert('Please enter email address','Signup');
	    	return;
	    }
	   
		Alloy.Globals.loading.show(' ', false);
		
		
		var httpparams = {
			data:{'email':$.emailTxt.value}

		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("verifyUserEmail",httpparams,myCallback);
		 
	}catch(ex){
		Alloy.Globals.displayError("verifyUsername " + JSON.stringify(ex));
	}			
	
}
function myCallback(data){
	try{
		Alloy.Globals.loading.hide();
		var response = JSON.parse(data);
		
		if(response.success == 1){
			utility.customAlert(response.message,"Login");
			return;
		}

	    Alloy.Globals.userInfo.email = $.emailTxt.value;
	    
		var wind=Alloy.createController('setPhoneNumber').getView();
		wind.open();
		Alloy.Globals.Screens.setPhoneNumber =wind;
	}catch(ex){
		Alloy.Globals.displayError("myCallback exception " + ex.toString());
	}
}
