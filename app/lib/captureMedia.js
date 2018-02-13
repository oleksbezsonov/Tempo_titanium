var captureMedia = {};
var callBack;
captureMedia.showPhotoOption = function(myCallback){
	try{
	callBack = myCallback;	
	var option = ['Take Photo', 'Choose from Gallery', 'Cancel'];
	
	var opts = {
	  cancel: 2,
	  options: option,
	  selectedIndex: 2,
	  destructive: 0
	};
	var dialog = Ti.UI.createOptionDialog(opts);
	dialog.show();
	
	dialog.addEventListener('click',function(e){
		Ti.API.info(JSON.stringify(e));
	    if(e.index  == 0){
	    	fireUpTheCamera();	
	    }else if(e.index == 1){
	    	 openGallery();
	    }
	});
	}catch(ex){
		Ti.API.error("showPhotoOption " + JSON.stringify(ex));
	}
};

function fireUpTheCamera() {
	try{
	var photoOptions = {
		saveToPhotoGallery:true,
		allowEditing:true,
		mediaTypes:[Ti.Media.MEDIA_TYPE_PHOTO]
	};
	
	Titanium.Media.showCamera({
		options: photoOptions,
		success:processMedia,
		cancel:function()
		{	
			Ti.API.info("Cancelled");
			callBack({'media':undefined,action:'cancel'});
		},
		error:function(error)
		{	
			callBack({'media':undefined,action:'error',error:error});
		}
	});
	}catch(ex){
		Ti.API.error("fireUpTheCamera " + JSON.stringify(ex));
	}
}
function openGallery() {
	try{
		var photoOptions = {
			mediaTypes:[Ti.Media.MEDIA_TYPE_PHOTO]
		};
		
		Titanium.Media.openPhotoGallery({	
			options: photoOptions,
			allowEditing:true,
			success:processMedia,
			cancel:function()
			{
				callBack({'media':undefined,action:'cancel'});
			},
			error:function(error)
			{
				callBack({'media':undefined,action:'error',error:error});
			}
		});
	}catch(ex){
		Ti.API.error("openGallery " + JSON.stringify(ex));
	}
}

function processMedia(event){
	try{
		
		
		Ti.API.info(" width " + event.media.width + " height " + event.media.height);
			
		var image = event.media; 
		image = image.imageAsCompressed(0); 
		// set image view
		Ti.API.info('Our type was: '+event.mediaType);
		if(event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO)
		{
			callBack({'media':image,action:'image'});
		}
		else
		{
			callBack({'media':undefined,action:'video'});
		}		
	}catch(ex){
		Ti.API.error("processMedia " + JSON.stringify(ex));
	} 
}

module.exports = captureMedia;

