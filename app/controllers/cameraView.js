// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var utility = require("utility");

//var cameraOverlayView = $.overlayview;
var timer;


$.btnFlash.addEventListener("click", function(){
	if(Ti.Media.cameraFlashMode == Ti.Media.CAMERA_FLASH_ON){
		Ti.Media.cameraFlashMode = Ti.Media.CAMERA_FLASH_OFF;
	}else{
		Ti.Media.cameraFlashMode = Ti.Media.CAMERA_FLASH_ON;
	}
	//btnFlash.title = "Flash " + (Ti.Media.cameraFlashMode == Ti.Media.CAMERA_FLASH_ON? "On":"Off");
});
 
var switchcamera = function(){
	
	if(Ti.Media.camera==Titanium.Media.CAMERA_FRONT){
		Ti.API.info("inside 1 ******");
		Ti.Media.switchCamera(Ti.Media.CAMERA_REAR);
	}else{
		Ti.API.info("inside 2 ******");
		Ti.Media.switchCamera(Ti.Media.CAMERA_FRONT);
	}
};

$.mainView.addEventListener("doubletap",function(e){
	Ti.API.info("doubletap");
	switchcamera();
	
});
$.btnCameraType.addEventListener("click", switchcamera);


$.btnCancel.addEventListener("click", function(){
	Ti.API.info("close camera");
	Ti.Media.hideCamera();
	Alloy.Globals.tabGroup.setActiveTab(Alloy.Globals.FEEDS_TAB);
});


$.btnCircle.addEventListener("click", function(){
	Ti.API.info("**********btnCircle click**********");
	$.videoLengthView.visible = false;
	$.btnCircle.mode == 1;
	Ti.Media.takePicture();
});
$.btnCircle.addEventListener("longpress", function(){
	$.btnCircle.mode=2;
	$.btnCircle.dorecording = true;
	Ti.Media.startVideoCapture();
	
	$.videoLengthView.visible = true;
	timer = setInterval(updateTicker,1000);
	$.videoLength.time = 0;

	$.box.visible = true;
  	var matrix = Ti.UI.create2DMatrix();
  // matrix = matrix.opacity(180);
  	matrix = matrix.scale(1.25, 1.25);
  	var a = Ti.UI.createAnimation({
    transform : matrix,
    duration : 800,
    autoreverse : true,
    repeat : 20
  });
  $.box.animate(a);
  
	Ti.API.info("**********started video recording**********");
	
	setTimeout(function(){
		stopRecording();
	},10000);
});
 
$.btnCircle.addEventListener("touchend", function(){
	Ti.API.info("**********STOP video recording********** " + $.btnCircle.dorecording );
	if($.btnCircle.dorecording == true){
		Ti.API.info("**********STOPED**********");
		stopRecording();
	}
	$.buttonView.borderColor = "transparent";
});

function updateTicker(stop){
	if(stop){ 
		$.videoLength.time = 0;
		clearInterval(timer);
	}else{
		$.videoLength.time++;
	}
	var val = $.videoLength.time;
	val = (val<10?"0"+ val:val);
	$.videoLength.text = "00:" + val; 
}
function stopRecording(){
	Ti.Media.stopVideoCapture();
	$.btnCircle.dorecording = false;
	updateTicker(true);
	$.box.visible = false;
};


$.launchCamera = function(){
	 Ti.API.info("called launch camera");
	var size = $.cameraView.size;
	Ti.API.info("size.width " +size.width);
	Ti.API.info("size.height " +size.height);
	var platformWidth= Ti.Platform.displayCaps.platformWidth;
	var platformHeight = Ti.Platform.displayCaps.platformHeight;
	
	var cameraAspectRatio = (4.0 / 3.0);
	var cameraImageHeight = platformWidth * cameraAspectRatio;
	
	var scale = platformHeight / cameraImageHeight;
	
	Ti.API.info(platformWidth + "  platformWidth platformHeight  " + platformHeight);
	Ti.API.info("scale " + scale);
	var transvalues ={
		anchorPoint:{ x: 0.0, y:  (platformHeight - cameraImageHeight) / 2.0 },
		scale:scale
	};
	var trans =  Ti.UI.create2DMatrix(transvalues);
	
	// trans.anchorPoint = { x: 5, y: 5 };
	//Ti.Media.appMusicPlayer.volume=1.0;
	Ti.Media.audioSessionCategory = Ti.Media.AUDIO_SESSION_CATEGORY_PLAY_AND_RECORD;
	Titanium.Media.showCamera({
		//mediaTypes : [Ti.Media.MEDIA_TYPE_VIDEO, Ti.Media.MEDIA_TYPE_PHOTO],
		mediaTypes: [Titanium.Media.MEDIA_TYPE_VIDEO],
		videoMaximumDuration:10000,
		videoQuality:Titanium.Media.QUALITY_MEDIUM,
		saveToPhotoGallery:false,
		autorotate:false,
		overlay:$.cameraView,
		showControls:false,	// don't show system controls
		autohide:true, // tell the system not to auto-hide and we'll do it ourself
		transform: trans, // forces the camera to not be zoomed in
		allowEditing:false,
		success : function(event) {
			Ti.API.info("event.mediaType  " + event.mediaType );
			if(event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO) {
				image = event.media;
				//image = image.imageAsCompressed(0.0); 
				img = utility.compressImage(image);
				var flipimage = require('Ti.Image.Flip');
				var newImage = flipimage.horizontalFlip({
					image: img
				});

				var wind=Alloy.createController('cameraPreview',{media:newImage,mediaType:'image'}).getView();
				wind.open();
				Alloy.Globals.Screens.cameraPreview = wind;
			}else{
				processiOSVideo(event.media);
			
				//showVideo(event.media);	
			}

			$.btnCircle.mode == 0;
	
		},
		cancel : function() {
			
		},
		error : function(error) {
			
		},
	});
	
	
	Ti.Media.addEventListener('volume', function(e) {
	//	alert("cicked");
	    $.btnCircle.fireEvent("click"); 
	});
	
	
};

function processiOSVideo(vidmedia){
	try{
		
		
		var trimmer = require('ti.ios.trim');
		
     	var timestamp = (new Date()).getTime();
  	 	var filename = Titanium.Filesystem.tempDirectory + timestamp + 'videofile.mov';
	  	var movieFile = Titanium.Filesystem.getFile(filename);
        
        Ti.API.info("movieFile " + movieFile.exists() + "  " + movieFile.nativePath);
               
        movieFile.write(vidmedia);
        movieFile.setRemoteBackup(false);
 		trimmer.trimVideo({
		    input: movieFile.resolve(),
		    quality: 1,
		    success: function(e) {
		        Ti.API.info('SUCCESS:');
		        Ti.API.info('path to trimmed file: '+ e.videoURL);
		        
		        Ti.API.info(" e.videoURL " + e.videoURL);
		       
		      	videoURL = e.videoURL;
		      	
		      	if(movieFile.exists()){
		      		movieFile.deleteFile();
					Ti.API.info(movieFile.nativePath+ " file deleted");
		      	}
		      	var wind=Alloy.createController('cameraPreview',{media:videoURL,mediaType:'video'}).getView();
				wind.open();
				Alloy.Globals.Screens.cameraPreview = wind;
		    },
		    error: function(e) {
		        Ti.API.error('ERROR:');
		        Ti.API.info(JSON.stringify(e));
		    }
		});
		
		
	}catch(ex){
		Ti.API.error("processiOSVideo " +ex);
	}
		
}