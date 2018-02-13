// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var utility = require("utility");
var Twitter, twitterClient;
var twitterSuccessful = false;
function signUpBtn(){
	var wind=Alloy.createController('setName').getView();
	wind.open();
	Alloy.Globals.Screens.setName =wind;
}

$.loginBtn.addEventListener("click",function(e){
	signIn();
});

$.frgtPwd.addEventListener("click",function(e){
	var wind=Alloy.createController('forgotPassword').getView();
	wind.open();
});

$.loginScreen.addEventListener("click",function(e){
	$.passwordTxt.blur();
	$.usernameTxt.blur();
});

$.showPass.addEventListener("click",function(e){
	$.passwordTxt.passwordMask = ! $.passwordTxt.passwordMask ;
});
function signIn(){
	try{
		if(Titanium.Network.online == false){
			utility.customAlert("Your device is not online. Please check connectivity.", "Connection");
			return;
		}
	
	    if($.usernameTxt.value==""){
			utility.customAlert('Please enter the username','Login');
	    	return;
	    }
	    if($.passwordTxt.value==""){
			utility.customAlert('Please enter the password','Login');
	    	return;
	    }	
		Alloy.Globals.loading.show(' ', false);
		
		var aes = require("AESLib");
		
		var pass = aes.encrypt($.passwordTxt.value, Alloy.Globals.AES_PASSCODE, 128);
		
		//var dbpass = aes.decrypt('fgLEIQ6PHllU5bk2RCHjHA==', Alloy.Globals.AES_PASSCODE, 128);
		//alert(dbpass);
		
		//var dbpass = aes.decrypt(pass, Alloy.Globals.AES_PASSCODE, 128);
		//Ti.API.error(dbpass);
				//pass='mveRuYepkk6AP3l9I00ang==';
		var httpparams = {
			data:{
					'username':$.usernameTxt.value,
					'password':pass,
					'usertype':'tempo'
			}
		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("loginUser",httpparams,doLoginCallback);
		 
	}catch(ex){
		Alloy.Globals.displayError("signIn " + JSON.stringify(ex));
	}			
	
}
function doLoginCallback(data){
	try{
		Alloy.Globals.loading.hide();
		var response = JSON.parse(data);
		
		if(response.success != 1){
			utility.customAlert(response.message,"Login");
			return;
		}
		
		Ti.App.Properties.setObject("user",response.userInfo);
		
		var httphelper = require("HttpHelper");
		httphelper.addDevice();
		
		closeMe();
		
	}catch(ex){
		Alloy.Globals.displayError("loginCallback exception " + ex.toString());
	}
}

function loginTwitter(){	

    var accessTokenKey= Ti.App.Properties.getString('twitterAccessTokenKey'),
    accessTokenSecret = Ti.App.Properties.getString('twitterAccessTokenSecret');
	
	if(Twitter == undefined){
   		Twitter = require('twitter').Twitter;
   	}
   	if(twitterClient == undefined){
	    twitterClient = Twitter({
		  consumerKey: Alloy.CFG.consumerKey,
		  consumerSecret:  Alloy.CFG.consumerSecret,
	      accessTokenKey: accessTokenKey, 
	      accessTokenSecret: accessTokenSecret,
	      parentWindow:$.loginScreen
	    });
	    twitterClient.addEventListener('login', twitterLogin);
    	twitterClient.addEventListener('cancel', twitterCancel);
    }
   
    twitterClient.authorize();
};
function twitterCancel(e){
	
}
function twitterLogin(e){
    	 //Ti.API.info("param " + JSON.stringify(e));
      if (e.success) {
       	Ti.API.error("********twitter login called " + JSON.stringify(e));
         
         twitterClient.request("1.1/users/show.json",{user_id:e.twitterParam.user_id}, 'GET', function(pe) {
    		try{
    			if(twitterSuccessful == true){
    				return;
    			}
    			twitterSuccessful = true;
    			var profile = JSON.parse(pe.result.text);
    			Ti.API.info("pe " + JSON.stringify(profile));
    			//Ti.API.info("profile.name " + profile.name);
    			
    			Alloy.Globals.userInfo.name = profile.name;
    			Alloy.Globals.userInfo.fname = profile.name.split(" ")[0];
    			Alloy.Globals.userInfo.lname = profile.name.split(" ")[1];
    			Alloy.Globals.userInfo.location = profile.location;
    			Alloy.Globals.userInfo.twitteruser_id = profile.id;
         		Alloy.Globals.userInfo.screen_name = profile.screen_name;
         		Alloy.Globals.userInfo.profile_image_url = profile.profile_image_url;
         		
    			Ti.API.info("userinfo " + JSON.stringify(Alloy.Globals.userInfo));
    			
    			try{
	    			twitterClient.removeEventListener('login', twitterLogin);
	    			twitterClient.removeEventListener('cancel', twitterCancel);
	    			Twitter = undefined; twitterClient = undefined;
    			}catch(ex){
    				Ti.API.error("exception while twitter listener removal " + JSON.stringify(ex));
    			}
    			twitterRegister();
    			
	      	}catch(ex){
	      		Ti.API.error("users/show.json " + JSON.stringify(ex));
	      	}
    	 });
        
      } else {
        alert(e.error);
      }

}

function twitterRegister(){
	try{
		if(Titanium.Network.online == false){
			utility.customAlert("Your device is not online. Please check connectivity.", "Connection");
			return;
		}
		
		
		Alloy.Globals.loading.show(' ', false);
		
 		var httpparams = {
				data:{
					username:Alloy.Globals.userInfo.screen_name,
					firstname:Alloy.Globals.userInfo.fname,
					lastname:Alloy.Globals.userInfo.lname,
					email:Alloy.Globals.userInfo.email,
					usertype:'twitter',
					useruniqueid:Alloy.Globals.userInfo.twitteruser_id
				}
	
		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("registerUser",httpparams,myCallback);
		
		 
	}catch(ex){
		Alloy.Globals.displayError("registerUser " + JSON.stringify(ex));
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
		
		Ti.App.Properties.setObject("user",response.userinfo[0]);
		
		var firstTimeTwitter = Ti.App.Properties.getBool("firstTimeTwitter",false);
		if(firstTimeTwitter == false){
			Ti.App.Properties.setBool("firstTimeTwitter",true);
			var wind=Alloy.createController('letsStartView',{backbtn:false}).getView();
			wind.open();			
			Alloy.Globals.Screens.letsStartView = wind;
			$.loginScreen.close();
		}else{
			closeMe();
		}
		
		var httphelper = require("HttpHelper");
		httphelper.addDevice();
		
		
		
	}catch(ex){
		Alloy.Globals.displayError("registerUser exception " + ex.toString());
	}
}
function closeMe(){
	Alloy.Globals.registrationFlow();
	var wind=Alloy.createController('homeScreen').getView();
	wind.open();
	Alloy.Globals.Screens.homeScreen = wind;
	setTimeout(Alloy.Globals.downloadAllMedia,5000);
}