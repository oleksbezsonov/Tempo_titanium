// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var utility = require("utility");

var aes = require("AESLib");
if(Alloy.Globals.userInfo.password  != undefined){
	var pass = aes.decrypt(Alloy.Globals.userInfo.password , Alloy.Globals.AES_PASSCODE, 128);
	$.passwordTxt.value = pass;
}

		
$.navigation.backBtn.addEventListener("click",function(e){
	$.setPassword.close();
});

$.confirmPass.addEventListener("click",function(e){
	if($.passwordTxt.value == ""){
		utility.customAlert("Enter your desired password", "Signup");
		return;
	}else{
		var pass = aes.encrypt($.passwordTxt.value, Alloy.Globals.AES_PASSCODE, 128);
		Alloy.Globals.userInfo.password = pass;
	}
	var wind=Alloy.createController('setEmail').getView();
	wind.open();
	Alloy.Globals.Screens.setEmail =wind;
});

$.setPassword.addEventListener("click",function(e){
	$.passwordTxt.blur();
});

$.showPass.addEventListener("click",function(e){
	$.passwordTxt.passwordMask = ! $.passwordTxt.passwordMask ;
});
