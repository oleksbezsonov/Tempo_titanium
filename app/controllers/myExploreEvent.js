// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

$.backEvent.addEventListener("click",function(e){
	$.myExploreEvent.close();
}); 

$.viewComment.addEventListener("click",function(e){
	var bkImg = $.eventCurrentImg.image;
	var wind=Alloy.createController('commentView',{'bkgrndImg':bkImg }).getView();
	wind.open();
}); 

 