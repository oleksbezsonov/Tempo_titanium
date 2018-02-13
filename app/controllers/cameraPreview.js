// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var videoThumbnail;

if($.args.mediaType=="image"){
	if (Ti.Platform.model != 'Simulator'){
		$.imgView.backgroundImage = args.media;
	}
}else{
	$.videoPlayer.media = args.media;
	$.videoPlayer.addEventListener("click",function(e){
		// if($.videoPlayer.playbackState ){
			// $.videoPlayer.play();
		// }
	});
	getVideoThumbnail();
	
}
$.closeWin.addEventListener("click",function(e){
	$.cameraPreview.close();
});	
$.postBtn.addEventListener("click",function(e){
	Ti.API.info("args " + JSON.stringify(args));
	args.videoThumbnail = videoThumbnail;
	var wind=Alloy.createController('cameraPost',args).getView();
	wind.open();
	Alloy.Globals.Screens.cameraPost = wind;
});
function getVideoThumbnail(){
try{
	$.videoPlayer.requestThumbnailImagesAtTimes([4], Titanium.Media.VIDEO_TIME_OPTION_NEAREST_KEYFRAME, function(response) {
		try{
			Ti.API.info("Thumbnail callback called, success = " + response.success);
			if(response.success) {
				
				videoThumbnail = response.image;
				videoThumbnail = videoThumbnail.imageAsThumbnail( 200, 0, 0 );
			}
		}catch(ex){
			Ti.API.error("requestThumbnailImagesAtTimes " +ex);
		}	
	});

}catch(ex){
	Ti.API.error("processMedia " + JSON.stringify(ex));
	}
}