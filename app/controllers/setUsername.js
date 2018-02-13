// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var utility = require("utility");
$.usernameTxt.value = Alloy.Globals.userInfo.username;
$.navigation.backBtn.addEventListener("click",function(e){
	$.setUsername.close();
});
$.setUsername.addEventListener("click",function(e){
	$.usernameTxt.blur();
});

$.continueBtn.addEventListener("click",function(e){
	verifyUsername();
});
function verifyUsername(){
	try{
		if(Titanium.Network.online == false){
			utility.customAlert("Your device is not online. Please check connectivity.", "Connection");
			return;
		}
	
	    if($.usernameTxt.value==""){
			utility.customAlert('Please enter the username','Signup');
	    	return;
	    }
	    
	    var usernameRegex = /^[a-zA-Z0-9]+$/;;
		if (!usernameRegex.test($.usernameTxt.value)) {
			utility.customAlert('Please enter username with characters and numbers','Signup');
			return;
		}
	    var username = $.usernameTxt.value;
	    username = username.trim();
	    if(username.indexOf(" ")>=0){
			utility.customAlert('username cannot have space','Signup');
	    	return;
	    }
		Alloy.Globals.loading.show(' ', false);
		
		
		var httpparams = {
			data:{'username':username}

		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("verifyUsername",httpparams,myCallback);
		 
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
		Alloy.Globals.userInfo.username = $.usernameTxt.value;
		
		var wind=Alloy.createController('setBirthday').getView();
		wind.open();
		Alloy.Globals.Screens.setBirthday =wind;
	}catch(ex){
		Alloy.Globals.displayError("myCallback exception " + ex.toString());
	}
}