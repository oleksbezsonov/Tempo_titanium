// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var utility = require("utility");

setTimeout(Alloy.Globals.getGeolocation,100);

$.firstnameTxt.value = Alloy.Globals.userInfo.firstname;
$.lastnameTxt.value = Alloy.Globals.userInfo.lastname;
$.navigation.backBtn.addEventListener("click",function(e){
	$.setName.close();
});

$.acceptBtn.addEventListener("click",function(e){
	if(validate())
	{
		Alloy.Globals.userInfo.firstname = $.firstnameTxt.value;
		Alloy.Globals.userInfo.lastname = $.lastnameTxt.value;
		var wind=Alloy.createController('setUsername').getView();
		wind.open();
		Alloy.Globals.Screens.setUsername =wind;
	}
});
$.setName.addEventListener("click",function(e){
	$.firstnameTxt.blur();
	$.lastnameTxt.blur();
});
function validate(){
	try{

	    if($.firstnameTxt.value==""){
			utility.customAlert('Please enter the firstname','Signup');
	    	return false;
	    }
	    if($.lastnameTxt.value==""){
			utility.customAlert('Please enter the lastname','Signup');
	    	return false;
	    }	
		
		return true; 
	}catch(ex){
		Alloy.Globals.displayError("validate " + JSON.stringify(ex));
	}			
	
}

