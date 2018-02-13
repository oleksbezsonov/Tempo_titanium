setTimeout(Alloy.Globals.getGeolocation,100);

var userInfo = Ti.App.Properties.getObject("user",undefined);
Ti.API.info("userInfo " + JSON.stringify(userInfo));

if(userInfo == undefined){
	var wind = Alloy.createController('loginScreen').getView();
	wind.open();
	Alloy.Globals.Screens.loginScreen =wind;
}else{
	var wind = Alloy.createController('homeScreen').getView(); //homeScreen //letsStartView
	wind.open();
	Alloy.Globals.Screens.homeScreen =wind;
}
