// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var utility = require("utility");

$.webview.url = Alloy.CFG.LINK_URL + '/otherlinks/termsservices.html' ;

$.acceptBtn.addEventListener('click', function(e) {
	Ti.App.Properties.setBool("acceptedTerm",true);
	$.appWebview.close();
});

$.declineBtn.addEventListener('click', function(e) {
	Ti.App.Properties.setBool("acceptedTerm",false);
	Alloy.Globals.loading.show(' ', true);
	var httphelper = require("HttpHelper");
	httphelper.removeDevice(function(){
		Alloy.Globals.loading.hide();
		Ti.App.Properties.removeProperty("user");
		if(Alloy.Globals.Screens.homeScreen != undefined){
			Alloy.Globals.Screens.homeScreen.close();
			Alloy.Globals.Screens.homeScreen = undefined;
		}
		var wind = Alloy.createController('loginScreen').getView();
		wind.open();
		Alloy.Globals.Screens.loginScreen =wind;
	});
});