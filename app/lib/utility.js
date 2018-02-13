var utility = {};

utility.customAlert = function(message,title){
	var popuptitle="DJU";
	if(title !="" && title != undefined && title != null){
		popuptitle = title;
	}
	Ti.UI.createAlertDialog({
	    message: message,
	    ok: 'Ok',
	    title: popuptitle
	}).show();
};

utility.isMediaExists = function(args){
	try{	
		if (OS_IOS && args.cacheHires && hires) {
			args.media = args.cacheHires;
			args.hires = true;
		}
		var saveFile = true,savedFile;
		if (!args.media || (OS_IOS && _.isString(args.media) && !Ti.Platform.canOpenURL(args.media))) {
			delete args.media;
			saveFile = false;
	
		} else if (!args.cacheNot) {
		
			if (!args.cacheName) {
				
				if (_.isString(args.media)) {
					args.cacheName = args.media;
				
				} else if (args.media.nativePath) {
					args.cacheName = args.media.nativePath;
				
				} else {
					throw new Error('For non-file blobs you need to set a cacheName manually.');
				}
			}
			
			args.cacheName = Ti.Utils.md5HexDigest(args.cacheName);
			
			if (args.hires) {
				args.cacheName = args.cacheName + '@2x';
			}
	
			if (!args.cacheExtension) {
				
				// from http://stackoverflow.com/a/680982/292947
				var re = /(?:\.([^.]+))?$/;
				var ext = re.exec(args.media)[1];
				
				args.cacheExtension = ext ? ext : '';
			}
			savedFile = Ti.Filesystem.getFile(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory).nativePath, args.cacheName + '.' + args.cacheExtension);
			//Ti.API.error (savedFile.exists() + " savedFile.nativePath " + savedFile.nativePath);
			return savedFile.exists();
			
		}
	
	}catch(ex){
		Ti.API.error("isMediaExists exception " + ex.toString());
	}
	return false;
};

utility.cacheMedia = function(args){
	try{
	Ti.API.info("****** cacheMedia****** " +JSON.stringify(args));
	
	if (OS_IOS && args.cacheHires && hires) {
		args.media = args.cacheHires;
		args.hires = true;
	}
	var saveFile = true,savedFile;
	if (!args.media || (OS_IOS && _.isString(args.media) && !Ti.Platform.canOpenURL(args.media))) {
		delete args.media;
		saveFile = false;

	} else if (!args.cacheNot) {
	
		if (!args.cacheName) {
			
			if (_.isString(args.media)) {
				args.cacheName = args.media;
			
			} else if (args.media.nativePath) {
				args.cacheName = args.media.nativePath;
			
			} else {
				throw new Error('For non-file blobs you need to set a cacheName manually.');
			}
		}
		Ti.API.info("args.cacheName before "  +args.cacheName);
		args.cacheName = Ti.Utils.md5HexDigest(args.cacheName);
			Ti.API.info("args.cacheName after "  +args.cacheName);
		if (args.hires) {
			args.cacheName = args.cacheName + '@2x';
		}

		if (!args.cacheExtension) {
			
			// from http://stackoverflow.com/a/680982/292947
			var re = /(?:\.([^.]+))?$/;
			var ext = re.exec(args.media)[1];
			
			args.cacheExtension = ext ? ext : '';
		}

		savedFile = Ti.Filesystem.getFile(Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory).nativePath, args.cacheName + '.' + args.cacheExtension);
		
		
		
		if (savedFile.exists()) {
			args.media = savedFile;		
			saveFile = false;
			args.callback(savedFile.nativePath);
		}
		Ti.API.error (savedFile.exists()+ " saveFile " + saveFile + " savedFile.nativePath " + savedFile.nativePath );
	}
	
	
	if (saveFile === true) {	
		if(args.mediaData == undefined){	
			setTimeout(function(){
					var xhr = Ti.Network.createHTTPClient();
					
					xhr.onload = function() {
						if (xhr.status == 200) {
							savedFile.write(xhr.responseData);
							Ti.API.error(savedFile.exists() + " file downloaded " + savedFile.nativePath);
							args.callback(savedFile.nativePath);
						};
					};
					Ti.API.error ("downloading " +args.cacheName);
					xhr.open('GET', args.media);
					xhr.send();
			},1000);
		}else{
			Ti.API.error("saving from background process");
			savedFile.write(args.mediaData);
			args.callback(savedFile.nativePath);
		}	
	}
	}catch(ex){
		Ti.API.error("cacheMedia exception " + ex.toString());
	}
};

utility.compressImage = function(image){
    var actualHeight = image.height;
    var actualWidth = image.width;
    var maxHeight = 600.0;
    var maxWidth = 800.0;
    var imgRatio = actualWidth/actualHeight;
    var maxRatio = maxWidth/maxHeight;
    var compressionQuality = 0.5;//50 percent compression

    if (actualHeight > maxHeight || actualWidth > maxWidth) {
        if(imgRatio < maxRatio){
            //adjust width according to maxHeight
            imgRatio = maxHeight / actualHeight;
            actualWidth = imgRatio * actualWidth;
            actualHeight = maxHeight;
        }
        else if(imgRatio > maxRatio){
            //adjust height according to maxWidth
            imgRatio = maxWidth / actualWidth;
            actualHeight = imgRatio * actualHeight;
            actualWidth = maxWidth;
        }else{
            actualHeight = maxHeight;
            actualWidth = maxWidth;
        }
    }
	
	var resized = image.imageAsResized( actualWidth, actualHeight ) ;
	var compressed = resized.imageAsCompressed( compressionQuality );
   

    return compressed;
};

utility.formatUsPhone = function(phone) {

    var phoneTest = new RegExp(/^((\+1)|1)? ?\(?(\d{3})\)?[ .-]?(\d{3})[ .-]?(\d{4})( ?(ext\.? ?|x)(\d*))?$/);

    phone = phone.trim();
    var results = phoneTest.exec(phone);
    if (results !== null && results.length > 8) {

        return "(" + results[3] + ") " + results[4] + "-" + results[5] + (typeof results[8] !== "undefined" ? " x" + results[8] : "");

    }
    else {
         return phone;
    }
};

String.indexOfAny = function (s, arr, begin) {
   var minIndex = -1;
   for (var i = 0; i < arr.length; i++) {
       var index = s.indexOf(arr[i], begin);
       if (index != -1) {
           if (minIndex == -1 || index < minIndex) {
               minIndex = index;
           }
       }
   }
   return (minIndex);
};
 
String.splitByAny = function (s, arr) {
    var parts = [];
 
    var index;
    do {
        index = String.indexOfAny(s, arr);
        if (index != -1) {
            parts.push(s.substr(0, index));
            s = s.substr(index + 1);
        } else {
            parts.push(s);
        }
    } while (index != -1);
 
    return (parts);
};
 
utility.parseAddress = function(address) {
    var obj = {
        address: "",
        city: "",
        province: "",
        postalCode: "",
        country: ""
    };
    
    if(!address) {
        return (obj);
    }
    
    var parts = address.split(',');
    for(var i = 0; i < parts.length; i++) {
        parts[i] = parts[i].trim();
    }
    var i = parts.length - 1;
    
    var fnIsPostalCode = function(value) {
        return (/^\d+$/.test(value));
    };
    
    var fnParsePostalCode = function(value) {
        var subParts = String.splitByAny(value, [' ', '-']);
        for(var j = 0; j < subParts.length; j++) {
              if (fnIsPostalCode(subParts[j].trim())) {
                  obj.postalCode = subParts[j].trim();
                  if(j > 0) {
                      return (subParts[j-1]);
                      break;
                  }
              }
        }
        
        return(value);
    };
    
    if(i >= 0) {
        if(fnIsPostalCode(parts[i])) {obj.postalCode = parts[i]; i--;}
        var part = fnParsePostalCode(parts[i]);
        if(part) {
            obj.country = part;
        }
        i--;
    }
    
    if(i >= 0) {
        if(fnIsPostalCode(parts[i])) {obj.postalCode = parts[i]; i--;}
        var part = fnParsePostalCode(parts[i]);
        if(part) {
            obj.province = part;
        }
        i--;
    }
    
    if(i >= 0) {
        if(fnIsPostalCode(parts[i])) {obj.postalCode = parts[i]; i--;}
        var part = fnParsePostalCode(parts[i]);
        if(part) {
            obj.city = part;
        }
        i--;
    }
    
    if(i >= 0) {
        parts = parts.slice(0, i + 1);
        obj.address = parts.join(', ');
    }
    
    return(obj);
};

utility.getRandomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

utility.intToString = function(value) {
	
 	var newValue = value;
 	Ti.API.error("******* intToString value " + value);
    if (value >= 1000) {
        var suffixes = ["", "k", "m", "b","t"];
        var suffixNum = Math.floor( (""+value).length/3 );
        var shortValue = '';
        for (var precision = 2; precision >= 1; precision--) {
            shortValue = parseFloat( (suffixNum != 0 ? (value / Math.pow(1000,suffixNum) ) : value).toPrecision(precision));
            var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g,'');
            if (dotLessShortValue.length <= 2) { break; }
        }
        if (shortValue % 1 != 0)  shortNum = shortValue.toFixed(1);
        newValue = shortValue+suffixes[suffixNum];
    }
    return newValue;
};

utility.openURL = function( url, title){
	var dialog = require("ti.safaridialog");
	if(dialog.isSupported()){
	  dialog.open({
	    url: url,
	    title:title
	  });
	}
};
module.exports = utility;

