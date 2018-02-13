// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var utility = require("utility");
var fields = [$.txt1,$.txt2,$.txt3,$.txt4,$.txt5,$.txt6];
$.confirmCode.text = "Verify";

var strMsg = "Enter the code we sent to your ";

if(Alloy.Globals.userInfo.phoneno != "" && Alloy.Globals.userInfo.email!=""){
	strMsg+= " email " +Alloy.Globals.userInfo.email + " and phone +1" + utility.formatUsPhone(Alloy.Globals.userInfo.phoneno) +" via SMS";		
}else if (Alloy.Globals.userInfo.email!=""){
	strMsg+= " email " +Alloy.Globals.userInfo.email;
}else if (Alloy.Globals.userInfo.phoneno!=""){
	strMsg+= " phone +1" + utility.formatUsPhone(Alloy.Globals.userInfo.phoneno) +" via SMS";		
}
$.lblText.text = strMsg;

$.navigation.backBtn.addEventListener("click",function(e){
	$.enterConfirmCode.close();
});

$.confirmCode.addEventListener("click",function(e){
	confirmCode();
	
});
$.enterConfirmCode.addEventListener("click",function(e){
	$.txt1.blur();
	$.txt2.blur();
	$.txt3.blur();
	$.txt4.blur();
	$.txt5.blur();
	$.txt6.blur();
});
function moveFocus(e){
	Ti.API.info("moveFocus " + e.source.idx);
	var idx = e.source.idx;
	if(idx<5){
		fields[idx+1].focus();
	}else{
		 e.source.blur();
	}
}
function clearField(e){
	e.source.value ="";
}

function confirmCode(){
	try{
		if(Titanium.Network.online == false){
			utility.customAlert("Your device is not online. Please check connectivity.", "Connection");
			return;
		}
		var code = $.txt1.value  + $.txt2.value + $.txt3.value + $.txt4.value + $.txt5.value + $.txt6.value ;
	    if(code==""){
			utility.customAlert('Please enter the confiration code','Signup');
	    	return;
	    }
	   
		Alloy.Globals.loading.show(' ', false);
		
		var userInfo = Ti.App.Properties.getObject("user",{});
		
		var httpparams = {
				data:{
					userid: userInfo.user_id,
					otp:code
				}
	
		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("verifyCode",httpparams,myCallback);
		 
	}catch(ex){
		Alloy.Globals.displayError("confirmCode " + JSON.stringify(ex));
	}			
	
}
function myCallback(data){
	try{
		Alloy.Globals.loading.hide();
		var response = JSON.parse(data);
		
		if(response.success != 1){
			utility.customAlert("Invalid code","Signup");
			return;
		}
		
		var wind=Alloy.createController('setProfilePic').getView();
		wind.open();
		Alloy.Globals.Screens.SetProfilePic =wind;
	}catch(ex){
		Alloy.Globals.displayError("confirmCode exception " + ex.toString());
	}
}