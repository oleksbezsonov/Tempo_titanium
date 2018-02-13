// // Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var currentTab;
Alloy.Globals.tabGroup = $.tabGroup;
Alloy.Globals.FEEDS_TAB = $.feedsTab;
Alloy.Globals.CAPTURE_TAB = $.captureTab;
Alloy.Globals.EVENTS_TAB = $.eventsTab;
Alloy.Globals.PROFILE_TAB = $.profileTab;

Alloy.Globals.tabGroup.setActiveTab($.feedsTab);
currentTab = $.feedsTab;

setTimeout(function(){
	if(Ti.App.Properties.getBool("acceptedTerm",false) == false){
		var wind=Alloy.createController('appWebview').getView();
		wind.open();
	}
},200);
function tabSelected(e){
	if(currentTab.id != "profileTab" && Alloy.Globals.tabGroup.activeTab.id =="profileTab" ){
		$.profileView.refresh();
	}
	currentTab = Alloy.Globals.tabGroup.activeTab;	
}

$.captureTab.addEventListener("selected",function(e){
	if (Ti.Platform.model === 'Simulator'){
		var view=Alloy.createController('cameraView').getView();
		$.captureWin.add(view);
	}else{
		Ti.API.info(" *********$.captureTab  selected******");
		if(Alloy.Globals.Screens.cameraView != undefined){
			Ti.API.info("is Camera Open " + Alloy.Globals.Screens.cameraView.isCameraOpen);
		}
		
		//$.captureWin.hide();
		if(Alloy.Globals.Screens.cameraView == undefined ||
			Alloy.Globals.Screens.cameraView.isCameraOpen == false){
			showCameraView();
		}
		
		
		
	}
});

function showCameraView(){
	if(Alloy.Globals.Screens.cameraView == undefined){
		Alloy.Globals.Screens.cameraView = Alloy.createController('cameraView2');
	}
	Ti.API.info(" *********showCameraView called******");
	Alloy.Globals.Screens.cameraView.launchCamera();
}
$.feedsTab.addEventListener("selected",function(e){
	//Ti.App.fireEvent("refreshFeed");
});
// $.tabGroup.addEventListener("swipe",function(e){
	// Ti.API.info(" ********* Swipe******");
	// if(e.direction=="up"){
		// showCameraView();
	// }
// });

