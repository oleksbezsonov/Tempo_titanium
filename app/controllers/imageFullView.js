// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var media = args.media;

$.img.image = media;

$.closeBtn.addEventListener('click',closeMe);
function closeMe(){
	$.imageFullView.close();
}
$.doneBtn.addEventListener("click",function(e){
	if($.myCallback != undefined){
		$.myCallback({'media':media,'action':'image'});
	}
	$.imageFullView.close();
});  

$.cameraBtn.addEventListener("click",function(e){
	var captureMedia = require("captureMedia");
	captureMedia.showPhotoOption(function(response){
		Ti.API.info("setMedia response imageFullView " + JSON.stringify(response));	
		if(response.action == 'image'){
			$.img.image = response.media;
			media = response.media;
		}
	});
});  

 