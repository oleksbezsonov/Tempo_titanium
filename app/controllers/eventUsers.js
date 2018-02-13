// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var utility = require("utility");
var selectedUsers = args.users;
var allUserRecords;
Ti.API.info("selectedUsers " + JSON.stringify(selectedUsers));
$.centrTitle.text = args.title;
$.rightTitle.text = "Done";

setTimeout(getUsers,100);

if(args.showAll == false){
	$.tableViewRecords.setHeaderView(Ti.UI.createView({
		height:0
	}));	
}
$.back.addEventListener("click",function(e){
	$.eventUsers.close();
});   

$.rightTitle.addEventListener("click",function(e){
	$.eventUsers.close();
	$.myCallback(selectedUsers);
});  

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
					userid:userInfo.user_id
					
				}
	
		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("getMyFollows",httpparams,getUsersCallback);
		 
	}catch(ex){
		Alloy.Globals.displayError("searchUser " + JSON.stringify(ex));
	}			
	
}

function getUsersCallback(data){
	try{
		Alloy.Globals.loading.hide();
		var response = JSON.parse(data);
		
		if(response.success != 1){
			utility.customAlert(response.message,"Login");
			return;
		}
		var records = response.myFollowers;
		allUserRecords = records;
		var size = records.length;
		$.tableViewRecords.setData([]);
		for(var i=0;i<size;i++){
			var item = records[i];
			if(item.user_id in selectedUsers)
				item.isSelected = true;
			var row = createUserRow(item);
			row.record = item;
			$.tableViewRecords.appendRow(row);
		}
		
	}catch(ex){
		Alloy.Globals.displayError("searchUser exception " + ex.toString());
	}
}

function createUserRow(item){
	var row = Alloy.createController('eventUserRow',{record:item});
	row.myCallback = function(record,isSelected){
		if(isSelected == false){
			if(record.user_id in selectedUsers) delete selectedUsers[record.user_id];
		}else if(isSelected){
			selectedUsers[record.user_id] = record;
		}
		Ti.API.info("selectedUsers " + JSON.stringify(selectedUsers));
	};
	var rowView = row.getView();
	rowView.record = item;	
	return rowView;
}

//radio button  on/off actions
var setButtonOn = function(source) {
    source.backgroundColor = '#328bd1';
    source.title='\u2713';
    source.value = true;
   
};

var setButtonOff = function(source) {
    source.backgroundColor = '#f1f1f1';
    source.title='';
    source.value = false;
};

$.radioBtn.addEventListener('click', function(e) {
    if(e.source.value == true) {
        setButtonOff($.radioBtn);
    } else {
        setButtonOn($.radioBtn);
    }
	 selectUnselectUsers(e.source.value);
});

function selectUnselectUsers(isSelected){
	try{

		var records = allUserRecords;

		var size = records.length;
		$.tableViewRecords.setData([]);
		for(var i=0;i<size;i++){
			var item = records[i];
			item.isSelected = isSelected;
			
			var row = createUserRow(item);
			row.record = item;
			$.tableViewRecords.appendRow(row);
			
			if(isSelected == false){
				if(item.user_id in selectedUsers) delete selectedUsers[item.user_id];
			}else if(isSelected){
				selectedUsers[item.user_id] = item;
			}
		}
		Ti.API.info("selectedUsers " + JSON.stringify(selectedUsers));
	}catch(ex){
		Alloy.Globals.displayError("selectUnselectUsers exception " + ex.toString());
	}

}