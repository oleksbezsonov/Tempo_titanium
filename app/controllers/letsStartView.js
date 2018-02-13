// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var utility = require("utility");

setTimeout(function(){
	var wind=Alloy.createController('appWebview').getView();
	wind.open();
},200);

if(args.backbtn == false){
	$.navigation.backBtn.visible = false;
}
setTimeout(getUsers,100);

$.navigation.rightBtn.addEventListener("click",function(e){
	closeMe();
});
$.navigation.backBtn.addEventListener("click",function(e){
	$.letsStartView.close();
});

$.continueBtn.addEventListener("click",function(e){
	closeMe();
});


function closeMe(){
	Alloy.Globals.registrationFlow();
	var wind=Alloy.createController('homeScreen').getView();
	wind.open();
	Alloy.Globals.Screens.homeScreen = wind;
}


$.searchTxt.addEventListener("return",function(e){
	getUsers($.searchTxt.value);
});
function updateRecord(record,action){
	try{
		var row;
		if(action=="update"){	
			row = createView(record);
		}
		var sections = $.tableViewRecords.data; // grab the array of sections
		var section = sections[0]; // use just the first section
		
		for(var x=0,y=section.rowCount;x < y;x++) {
			if(section.rows[x].record.user_id == record.user_id){
				if(action=="update"){		
					$.tableViewRecords.updateRow(x,row);	
				}else if(action=="delete"){
					$.tableViewRecords.deleteRow(x);
				}	
				break;
			}
		}

	}catch(ex){
		Ti.API.error("updateFeed exception " + ex.toString());
	}
}
function createView(item){
	var row = Alloy.createController("userRowView",{record:item}).getView();
	row.record = item;
	return row;
}
 
function getUsers(text){
	try{
		if(Titanium.Network.online == false){
			utility.customAlert("Your device is not online. Please check connectivity.", "Connection");
			return;
		}
		//if(text == undefined || text == null) text =" ";
	 
	    Alloy.Globals.loading.show(' ', false);
		
		var userInfo = Ti.App.Properties.getObject("user",{});
		Ti.API.info("userInfo" + JSON.stringify(userInfo));
		var httpparams = {
				data:{
					userid:userInfo.user_id,
					search:text,
					searchscope:2
				}
	 
		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("searchUser",httpparams,myCallback);
		 
	}catch(ex){
		Alloy.Globals.displayError("searchUser " + JSON.stringify(ex));
	}			
}

function myCallback(data){
	try{
		Alloy.Globals.loading.hide();
		var response = JSON.parse(data);
		
		if(response.success != 1){
			utility.customAlert(response.message,"Login");
			return;
		}
		var records = response.userinfo;
		var size = records.length;
		$.tableViewRecords.setData([]);
		for(var i=0;i<size;i++){
			var item = records[i];
			
			var row = createView(item);
			row.record = item;
			$.tableViewRecords.appendRow(row);
		}
	
	}catch(ex){
		Alloy.Globals.displayError("searchUser exception " + ex.toString());
	}
}

$.tableViewRecords.addEventListener('click',function(e){
	Ti.API.info("e.source.id  " + e.source.id);
	try{
		var selectedItem;
		
		if(OS_ANDROID){
			selectedItem =  e.row.record;	
		}else if(OS_IOS){
			selectedItem =  e.rowData.record;
		}
		Ti.API.info("selectedItem  " + JSON.stringify(selectedItem));
		
		if(e.source.id == "followBtn"){
			addFollow(selectedItem);
		}else if(e.source.id == "userAvatarImg"){
			var wind=Alloy.createController('profileView',{record:selectedItem,otherUser:true}).getView();
			wind.open();
		}
	}catch(ex){
		Ti.API.info("tableViewRecords click" + ex.toString());
	}			
});

function addFollow(record){
	try{
		if(record.association_type=="Requested") return;
		if(Titanium.Network.online == false){
			utility.customAlert("Your device is not online. Please check connectivity.", "Connection");
			return;
		}
	
	    Alloy.Globals.loading.show(' ', false);
		
		var userInfo = Ti.App.Properties.getObject("user",{});
		var httpparams = {
				data:{
					primaryuserid:userInfo.user_id,
					networkuserid:record.user_id,
					associationtype:(record.association_type==0? 'follow':'unfollow')
				}
	
		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("addFollow",httpparams,function(data){
	 		try{
				
				var response = JSON.parse(data);
				
				var httphelper = require("HttpHelper");
				// 0 -- Not following
				//Follow -- following
				//
				httphelper.changeFollowStatus(record.user_id,userInfo.user_id,function(rdata){
					Alloy.Globals.loading.hide();
					if(response.success == 1){
						if (record.association_type==0){
							record.association_type = "Follow";
						}else if (record.association_type.toLowerCase()=="follow"){
							record.association_type = 0;
						}
					
						updateRecord(record,'update');
					}
				});
				
				
		
			}catch(ex){
				Alloy.Globals.displayError("searchUser exception " + ex.toString());
			}
	 	});
		 
	}catch(ex){
		Alloy.Globals.displayError("addFollow " + JSON.stringify(ex));
	}			
	
}
