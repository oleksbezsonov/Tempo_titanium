// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var utility = require("utility");
$.back.addEventListener("click",function(e){
	$.settings.close();
}); 

$.tableViewRecords.addEventListener("click",function(e){
	Ti.API.info("e.index " + e.index);
	if(e.index == 1){
		var wind=Alloy.createController('editProfile').getView();
		wind.open();
	}else if(e.index == 4){
		utility.openURL(Alloy.CFG.LINK_URL + '/otherlinks/termsservices.html',"Tempo");		
	}else if(e.index == 5){
		utility.openURL(Alloy.CFG.LINK_URL + '/otherlinks/privacy.html',"Tempo");		
	}else if(e.index == 7){
		utility.openURL('https://www.facebook.com/tempoeventsapp/',"Tempo");
	}else if(e.index == 8){
		utility.openURL('https://twitter.com/tempoeventsapp',"Tempo");
	}else if(e.index == 9){
		utility.openURL('https://www.instagram.com/tempoeventsapp/',"Tempo");
	}
	
}); 

$.switchNotify.addEventListener("change",function(e){
	var httphelper = require("HttpHelper");
	httphelper.updateNotificationFlag($.switchNotify.value,function(){
		
	});
}); 
$.logoutBtn.addEventListener("click",function(e){
	var dialog = Ti.UI.createAlertDialog({
	    	No: 1,
	    	buttonNames: ['Yes', 'No'],
	   	 	message: 'Are you sure to logout ?',
	    	title: 'Logout'
	  });
	  dialog.addEventListener('click', function(e){
	 	if(e.index == 0){  
	 		logout();
	   	}
	  });
	  dialog.show();	

}); 

function logout(){
	Alloy.Globals.loading.show(' ', true);
	var httphelper = require("HttpHelper");
	httphelper.removeDevice(function(){
		Alloy.Globals.loading.hide();
		Ti.App.Properties.removeProperty("user");
		Alloy.Globals.Screens.homeScreen.close();
		Alloy.Globals.Screens.homeScreen = undefined;
		var wind = Alloy.createController('loginScreen').getView();
		wind.open();
		Alloy.Globals.Screens.loginScreen =wind;
	});
}
