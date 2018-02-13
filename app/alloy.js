// The contents of this file will be executed before any of
// your view controllers are ever executed, including the index.
// You have access to all functionality on the `Alloy` namespace.
//
// This is a great place to do any initialization for your app
// or create any global variables/functions that you'd like to
// make available throughout your app. You can easily make things
// accessible globally by attaching them to the `Alloy.Globals`
// object. For example:
//
// Alloy.Globals.someGlobalFunction = function(){};


// added during app creation. this will automatically login to
// ACS for your application and then fire an event (see below)
// when connected or errored. if you do not use ACS in your
// application as a client, you should remove this block

// var dw= Ti.Platform.displayCaps.platformWidth;
// Alloy.Globals.imageHeight=dw*(0.44);

var moment = require("alloy/moment");

Alloy.Globals.AES_PASSCODE = 'sdwnmt';
Alloy.Globals.userInfo ={};
Alloy.Globals.loading = Alloy.createWidget("nl.fokkezb.loading");
Alloy.Globals.Screens ={};
Alloy.Globals.MY_ADDRESS = Ti.App.Properties.getObject("myLocation",{});
Alloy.Globals.Map = require("ti.map");
Alloy.Globals.isInForeground = false;

Alloy.Globals.displayLog = function(msg){
	var str = moment().format("HH:MM:SS") + " | " + msg;
	Ti.API.info(str);
};
Alloy.Globals.displayError = function(msg){
	var str = moment().format("HH:MM:SS") + " | " + msg;
	Ti.API.error(str);
};

Alloy.Globals.showMessageTimeout = function(customMessage,interval){
        // window container
        indWin = Titanium.UI.createWindow();
 
        //  view
        var indView = Titanium.UI.createView({height:50,width:250,borderRadius:10,backgroundColor:'black',opacity:.7});
 
        indWin.add(indView);
 
        // message
        var message = Titanium.UI.createLabel({
            text: customMessage && typeof(customMessage!=='undefined') ? customMessage : L('please_wait'),
            color:'white',width:'auto',height:'auto',textAlign:'center',
            font:{fontFamily:'Helvetica Neue', fontSize:14,fontWeight:'bold'}});
 
        indView.add(message);
        indWin.open();
 
        interval = interval ? interval : 3000;
        setTimeout(function(){
            indWin.close({opacity:0,duration:1000});
        },interval);
    };

Alloy.Globals.closeCameraFlow = function(){
	try{
		if(Alloy.Globals.Screens.cameraPreview != undefined){
			Alloy.Globals.Screens.cameraPreview.close();
			Alloy.Globals.Screens.cameraPreview = undefined;	
		}
		if(Alloy.Globals.Screens.cameraPost != undefined){
			Alloy.Globals.Screens.cameraPost.close();
			Alloy.Globals.Screens.cameraPost = undefined;	
		}
		
	}catch(ex){
		
	}	
};		
Alloy.Globals.registrationFlow = function(){
	try{
		
		
		if(Alloy.Globals.Screens.loginScreen != undefined){
			Alloy.Globals.Screens.loginScreen.close();
			Alloy.Globals.Screens.loginScreen = undefined;	
		}
		if(Alloy.Globals.Screens.setName != undefined){
			Alloy.Globals.Screens.setName.close();
			Alloy.Globals.Screens.setName = undefined;	
		}
		if(Alloy.Globals.Screens.setPassword != undefined){
			Alloy.Globals.Screens.setPassword.close();
			Alloy.Globals.Screens.setPassword = undefined;	
		}
		if(Alloy.Globals.Screens.setEmail != undefined){
			Alloy.Globals.Screens.setEmail.close();
			Alloy.Globals.Screens.setEmail = undefined;	
		}
		if(Alloy.Globals.Screens.setBirthday != undefined){
			Alloy.Globals.Screens.setBirthday.close();
			Alloy.Globals.Screens.setBirthday = undefined;	
		}
		if(Alloy.Globals.Screens.setUsername != undefined){
			Alloy.Globals.Screens.setUsername.close();
			Alloy.Globals.Screens.setUsername = undefined;	
		}
		if(Alloy.Globals.Screens.setPhoneNumber != undefined){
			Alloy.Globals.Screens.setPhoneNumber.close();
			Alloy.Globals.Screens.setPhoneNumber = undefined;	
		}
		if(Alloy.Globals.Screens.enterConfirmCode != undefined){
			Alloy.Globals.Screens.enterConfirmCode.close();
			Alloy.Globals.Screens.enterConfirmCode = undefined;	
		}
		if(Alloy.Globals.Screens.setProfilePic != undefined){
			Alloy.Globals.Screens.setProfilePic.close();
			Alloy.Globals.Screens.setProfilePic = undefined;	
		}
		if(Alloy.Globals.Screens.letsStartView != undefined){
			Alloy.Globals.Screens.letsStartView.close();
			Alloy.Globals.Screens.letsStartView = undefined;	
		}
	}catch(ex){
		
	}	
};

Alloy.Globals.GeoLocationService = require('GeoLocationService');
Alloy.Globals.GeoLocationService.init();

Alloy.Globals.getGeolocation = function(callBack){
	
	try{
		Alloy.Globals.GeoLocationService.getCurrentLocation(function(coords){
			try{
				Ti.API.info("received geo response");
				Titanium.App.Properties.setDouble('longitude',coords.longitude);
				Titanium.App.Properties.setDouble('latitude',coords.latitude);
				
				Ti.API.info("You are at: "+coords.longitude+"\n"+coords.latitude+ " ");
				
				
				Alloy.Globals.getLocationAddress(callBack);
			}catch(e1){
				Ti.API.error(" getCurrentPosition  " +  e1);
			}
		});
	}catch(e){
		Ti.API.error(" getGeolocation  " +  e);
		
	}
};

Alloy.Globals.getLocationAddress = function(callBack){

	try{
		var longitude = Titanium.App.Properties.getDouble('longitude');
		var latitude = Titanium.App.Properties.getDouble('latitude');
				
		Alloy.Globals.GeoLocationService.reverseGeocoder(latitude,longitude,function(response){
			try{
				Ti.API.info("received geo response " + JSON.stringify(response));
				
				Alloy.Globals.MY_ADDRESS = response.places[0];
				
				Ti.App.Properties.setObject("myLocation",Alloy.Globals.MY_ADDRESS);
				
				if(callBack!=undefined){
					callBack(response);
				}
			}catch(e1){
				Ti.API.error(" getLocationAddress  " +  e1);
			}
		});
	}catch(e){
		Ti.API.error(" getLocationAddress  " +  e);
		
	}
};
Ti.App.addEventListener("pause",function(e){
	Ti.API.info("app goes to background");
	Ti.Media.hideCamera();
});

Alloy.Globals.onesignal = require('com.williamrijksen.onesignal');

Alloy.Globals.onesignal.promptForPushNotificationsWithUserResponse(function(obj) {
        Ti.API.info("oneSignal " + JSON.stringify(obj));
        
       Alloy.Globals.onesignal.idsAvailable(function(e) {
       	try{
	        //pushToken will be nil if the user did not accept push notifications
	        Ti.API.info("idsAvailable " + JSON.stringify(e));
	        Ti.App.Properties.setString("device_token",e.pushToken);
	        Ti.App.Properties.setString("one_signal_userid",e.userId);
	        var httphelper = require("HttpHelper");
	        httphelper.addDevice();
	       }catch(ex){
	       	Ti.API.error(ex);
	       }
	        
	    });
});

    
Alloy.Globals.onesignal.addEventListener('notificationReceived', function(evt) {
    Ti.API.info(' ***** Received! ' + JSON.stringify(evt));
});


// Background fetch

var interval =2*60*60;
Ti.App.iOS.setMinimumBackgroundFetchInterval(Ti.App.iOS.BACKGROUNDFETCHINTERVAL_MIN);
// Monitor this event for a signal from iOS to fetch data
Ti.API.info("setup background fetch");
Ti.App.iOS.addEventListener('backgroundfetch', function(e){
    // Initiate a download operation
    Ti.API.info("*********** Check for download available*******");
    var userInfo = Ti.App.Properties.getObject("user",undefined);
	Ti.API.info("userInfo " + JSON.stringify(userInfo));

	if(userInfo != undefined){
		var httpclient = require("HttpHelper");
    	httpclient.getLatestFeed();
   }
    // Put the application back to sleep
    Ti.API.info("backgroundfetch called");
    Ti.App.iOS.endBackgroundHandler(e.handlerId);
});

// setTimeout(function(){
	// var userInfo = Ti.App.Properties.getObject("user",undefined);
	// Ti.API.info("userInfo " + JSON.stringify(userInfo));
// 
	// if(userInfo != undefined){
		// var httpclient = require("HttpHelper");
    	// httpclient.getLatestFeed();
   // }
//    
// },10000);

Ti.App.addEventListener("resume",function(){
	setTimeout(Alloy.Globals.getGeolocation,100);
});


Alloy.Globals.downloadAllMedia = function(){
	try{
		// Initiate a download operation
	    Ti.API.info("*********** Check for download available*******");
	    var userInfo = Ti.App.Properties.getObject("user",undefined);
		Ti.API.info("userInfo " + JSON.stringify(userInfo));
	
		if(userInfo != undefined){
			var httpclient = require("HttpHelper");
	    	httpclient.getLatestFeed(true);
	   }
	}catch(ex){
		Ti.API.error("downloadMedia " + ex.toString());
	}
};

setTimeout(Alloy.Globals.downloadAllMedia,10000);

Ti.App.addEventListener("resume",function(){
	setTimeout(Alloy.Globals.downloadAllMedia,10000);
});

