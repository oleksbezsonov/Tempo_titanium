// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var timer;
var TiCamera = require('ti.cameraview');
var camera;
$.isCameraOpen = false;

Ti.App.addEventListener("pause",onPause);
	    	
$.btnFlash.addEventListener("click", function(){
	if(camera.flashMode == TiCamera.FLASH_MODE_ON){
		camera.flashMode = TiCamera.FLASH_MODE_OFF;
	}else{
		camera.flashMode = TiCamera.FLASH_MODE_ON;
	}
});

var switchcamera = function(){
	
	if(camera.cameraType == TiCamera.CAMERA_TYPE_REAR){
		Ti.API.info("inside 1 ******");
		camera.setCameraType(TiCamera.CAMERA_TYPE_FRONT);
	}else{
		Ti.API.info("inside 2 ******");
		camera.setCameraType(TiCamera.CAMERA_TYPE_REAR);
	}
};

$.cameraView2.addEventListener("doubletap",function(e){
	Ti.API.info("doubletap");
	switchcamera();
	
});
$.cameraView2.addEventListener("click",function(e){
	Ti.API.info("click");
	
	
});
$.btnCameraType.addEventListener("click", switchcamera);


$.btnCancel.addEventListener("click", function(){
	Ti.API.info("close camera");
	camera.dismiss();
	$.isCameraOpen = false;
	Alloy.Globals.tabGroup.setActiveTab(Alloy.Globals.FEEDS_TAB);
});


$.btnCircle.addEventListener("click", function(){
	Ti.API.info("**********btnCircle click**********");
	$.videoLengthView.visible = false;
	$.btnCircle.mode == 1;
	camera.captureImage();
});
$.btnCircle.addEventListener("longpress", function(){
	$.btnCircle.mode=2;
	$.btnCircle.dorecording = true;
	camera.startVideoRecording();
	
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
	camera.stopVideoRecording();
	$.btnCircle.dorecording = false;
	updateTicker(true);
	$.box.visible = false;
};

function reset(){
	$.btnCircle.dorecording = false;
	$.videoLengthView.visible = false;
	$.btnCircle.mode == 1;
	$.box.visible = false;
	if(timer != undefined)
		clearInterval(timer);
	
}
$.launchCamera = function(){
	try{
		reset();
		camera = TiCamera.createCamera({
	       saveToPhotoGallery:false,
	       torchMode:TiCamera.TORCH_MODE_OFF,
	       flashMode:TiCamera.FLASH_MODE_OFF,
	       cameraType:TiCamera.CAMERA_TYPE_REAR,
	       showControl:false,
	
	        success: function(event)
	         {
	         	
	         	Ti.API.error("success " + JSON.stringify(event));
	         	Ti.API.error("event.filepath " + event.filepath);
	         	
	         	if(event.mediaType == "video"){
	         		//var savedFile = Ti.Filesystem.getFile(event.filepath);
					//event.mediaData = savedFile.read();
	         		var wind=Alloy.createController('cameraPreview',{media:event.filepath,mediaType:'video'}).getView();
					wind.open();
					Alloy.Globals.Screens.cameraPreview = wind;
 					
					
	         		//processiOSVideo(event.mediaData);
					
				}else{
					
					var newImage = event.media;
	     			if(camera.cameraType== TiCamera.CAMERA_TYPE_FRONT){
						var flipimage = require('Ti.Image.Flip');
						newImage = flipimage.horizontalFlip({
							image: event.media
						});
					}
					newImage = newImage.imageAsCompressed(0.5); 
					var wind=Alloy.createController('cameraPreview',{media:newImage,mediaType:'image'}).getView();
					wind.open();
					Alloy.Globals.Screens.cameraPreview = wind;
				}
				closeCamera();
	          }
	        });
	       	
	       
	    camera.open();
	    camera.add($.cameraView2);

	    $.isCameraOpen = true;
	}catch(ex){
		Ti.API.error("launch camera " + ex.toString());
	}
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
		    quality: 2,
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

function onPause(){
	try{
		Ti.API.info("onPause called ");
		closeCamera();
	}catch(ex){
		Ti.API.error("onPause " + ex.toString());
	}
}

function closeCamera(){
	Ti.API.info("*********closeCamera called ");
	camera.dismiss();	
	$.isCameraOpen = false;
};
