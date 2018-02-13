// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args; 
var record = args.record;
var moment = require("alloy/moment");
var utility = require("utility");
var keyboardHeight=0;
var timer, initialLoadComplete = false;
var isInProcess = false;
var offset = 0;
var users = new Object();

Ti.API.error("args " + JSON.stringify(args));

var effects = [
    Ti.UI.iOS.BLUR_EFFECT_STYLE_EXTRA_LIGHT,
    Ti.UI.iOS.BLUR_EFFECT_STYLE_LIGHT,
    Ti.UI.iOS.BLUR_EFFECT_STYLE_DARK
];
$.imgBlur.backgroundImage = args.bkgrndImg ;
$.imgBlur.setEffect(effects[1]);
var userInfo = Ti.App.Properties.getObject("user",{});

setTimeout(function(){
	getListMessage();		
	initialSetup();

},100);

function initialSetup(){
	Ti.App.addEventListener("keyboardframechanged", adjustScreenView);
}

function adjustScreenView(e){
	keyboardHeight= e.keyboardFrame.height;
};

function loadSampleChat(){
	
	var msg = "Lorem ipsum dolor sit amet, consect adipiscing elit, ut labore et dolore magna aliqua.";
	var chatRec = Alloy.createController('chatReceiver',{'chatText':msg}).getView();
	$.tableViewRecords.appendRow(chatRec);
	
	var msg = "Duis aute irure dolor in reprehenderit";
	var chatSender = Alloy.createController('chatSender',{'chatText':msg}).getView();
	$.tableViewRecords.appendRow(chatSender);
	
	var msg = "Such an awesome party!...";
	var chatRec = Alloy.createController('chatReceiver',{'chatText':msg}).getView();
	$.tableViewRecords.appendRow(chatRec);
	
	var msg = "Absolutely 😄";
	var chatSender = Alloy.createController('chatSender',{'chatText':msg}).getView();
	$.tableViewRecords.appendRow(chatSender);
	
	moveFocusToLast();
}

function getListMessage(){
		try{
		if(Titanium.Network.online == false){
			utility.customAlert("Your device is not online. Please check connectivity.", "Connection");
			return;
		}
		//if(offset==0)
		//	Alloy.Globals.loading.show(' ', false);
		
		
		var httpparams = {
				data:{
				userid:userInfo.user_id,
			 	postid: record.user_post_id,
			 	offset: offset
			}
		};
		
		if(isInProcess == true){
			 return;
			 Ti.API.error("Previous call is in process");	
		}
		isInProcess = true;
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("getPostComments",httpparams,getListMessageCallback);
		 
	}catch(ex){
		Alloy.Globals.displayError("getPostComments " + JSON.stringify(ex));
	}finally{
		
	}	
}

function getListMessageCallback(data){
	try{
		Alloy.Globals.loading.hide();
		var response = JSON.parse(data);
		
		if(response.success == 1){
			var records = response.comments;
			var size = records.length;
			Alloy.Globals.displayLog("size " + size);
	
			for(var i=0;i<size;i++){
				var item = records[i];
				var chatView;
				if(item.commented_by == userInfo.user_id){
					chatView = Alloy.createController('chatReceiver',{record:item,type:args.type}).getView();
				}else {
					chatView = Alloy.createController('chatSender',{record:item,type:args.type}).getView();
					if(item.commented_byname != undefined)
						users[item.commented_byname.trim()] = item.commented_byname.trim();
				}
				$.tableViewRecords.appendRow(chatView);
			}
			if(size > 0){
				offset = records[size-1].userpost_comment_id;
				moveFocusToLast();
			}		
		}
		
		var count=0,userText="";
		for(key in users){
			count++;
			if(count<=4){
				if(userText !="") userText+=", ";
			userText+= key;
			}
		}
		var otherTxt = "";
		if(count>4){
			otherTxt= "& " + (count-4) + " Others";
		}
		$.usersList.text = userText ;
		$.otherText.text = otherTxt;
		//Start timer to refresh in every 3 sec
		if(initialLoadComplete == false){
			initialLoadComplete = true;
			timer = setInterval(getListMessage,3000);
			
			
		}	
		
	}catch(ex){
		Alloy.Globals.displayError("getListMessageCallback exception " + ex.toString());
	}finally{
		isInProcess = false;
	}
}
$.backCmt.addEventListener("click",function(e){
	Ti.App.removeEventListener("pause",onPause);
	Ti.App.removeEventListener("resume",onResume);
	$.userPostCommentView.close();
});  
$.userPostCommentView.addEventListener("close", function(e){
	clearInterval(timer);
	Ti.App.removeEventListener("keyboardframechanged", adjustScreenView);
});
$.textChat.addEventListener("focus", function(e){
	try{
		$.sendBox.bottom=keyboardHeight;
		var keyboardHPer = (keyboardHeight/Ti.Platform.displayCaps.platformHeight)*100;
		Ti.API.info("keyboardHPer " + keyboardHPer);
		Ti.API.info("keyboardHeight " + keyboardHeight);
		Ti.API.info("(78-keyboardHPer) " + (78-keyboardHPer));
		var str = ""+(78-keyboardHPer)+ "%";
		
		Ti.API.info("str " + str); 
		Ti.API.info("$.tableViewRecords.height " + $.tableViewRecords.height); 
		$.tableViewRecords.height = str;
		moveFocusToLast();
	}catch(ex){
		Ti.API.error("focus " + ex.toString());
	}

});

$.textChat.addEventListener("blur", function(e){
	try{
		$.sendBox.bottom=2;
		$.tableViewRecords.height="78%";
	}catch(ex){
		Ti.API.error("blur " + ex.toString());
	}	
});

$.userPostCommentView.addEventListener("click",function(e){
	$.textChat.blur();
});

function moveFocusToLast(){
	setTimeout(function(){
		try{
			if($.tableViewRecords.data != undefined){
				var noRows = $.tableViewRecords.data[0].rowCount;
				//Alloy.Globals.displayLog("noRows " + noRows);
				$.tableViewRecords.scrollToIndex(noRows-1);
			}
		}catch(ex){
			Alloy.Globals.displayError("moveFocusToLast " + JSON.stringify(ex));
		}
		
	},200);
}

function submitMessage(e){
	if($.textChat.value == "") return;
	postMessage($.textChat.value);
	$.textChat.value = "";
	$.textChat.height = Ti.UI.SIZE;
	
}
function postMessage(text){
	var msg =text;
	if(text == "") return;	
	addComments(msg);
}

function addComments(text){
	try{
		
		var userInfo = Ti.App.Properties.getObject("user",{});
		var httpparams = {
				data:{
					userid:userInfo.user_id,
					commentdata:text,
					postid:record.user_post_id
				}
	
		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("addCommentToPost",httpparams,function(data){
	 		try{
				Alloy.Globals.loading.hide();
				var response = JSON.parse(data);
				
			}catch(ex){
				Alloy.Globals.displayError("updateeventmedialike exception " + ex.toString());
			}
	 	});
		 
	}catch(ex){
		Alloy.Globals.displayError("addComments " + JSON.stringify(ex));
	}		
}

function onPause(){
	Ti.API.info("onPause called ");
	if(timer != undefined){
		Ti.API.info("onPause called timer stopped");
		clearInterval(timer);
		timer = undefined;
	}
}
function onResume(){
	Ti.API.info("onResume called");
	if(initialLoadComplete == true){
		Ti.API.info("onResume called timer started");
		timer = setInterval(getListMessage,3000);
	}	
}
Ti.App.addEventListener("pause",onPause);
Ti.App.addEventListener("resume",onResume);