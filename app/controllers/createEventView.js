// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var record = args.record;
var utility = require("utility");
var moment = require("alloy/moment");
var selectedVenue;
var selectedImage;
var selectedGuests = new Object();
var selectedHosts = new Object();
var newEventRecord;
var mediaChanged = false;

setTimeout(Alloy.Globals.getGeolocation,100);

if(record != undefined){
	setTimeout(loadEventInfo,100);
	$.centrTitle.text = "Update Event";
	$.rightTitle.text = "Update";
	$.deleteRow.height = Ti.UI.SIZE;
	$.deleteBtn.height = 40;
}else{
	$.deleteRow.height = 0;
	$.deleteBtn.height =0;
}
$.back.addEventListener("click",function(e){
	$.createEventView.close();
});


function loadEventInfo(){
	try{
		$.titleTxt.value = record.event_name;
		$.descTxt.value = record.event_description;
		var stdt =new Date(record.event_start_datetime);
		var enddt =new Date(record.event_end_datetime);
		
		
		$.startDateTxt.dateValue = Math.round(stdt.getTime());
		$.startDateTxt.value =  moment(stdt).format("llll");
	    
	    $.endDateTxt.dateValue = Math.round(enddt.getTime());
		$.endDateTxt.value =  moment(enddt).format("llll");
		
		var today = moment(new Date());
		var startDt = moment(stdt);
		var diff = startDt.diff(today);
		
		Ti.API.error("difff " + diff);
		if(diff<0){
			$.titleTxt.editable =false;
			$.descTxt.editable =false;
			$.startDateTxt.touchEnabled =false;
			$.endDateTxt.touchEnabled =false;
			$.addressTxt.editable =false;
			$.isPublic.touchEnabled =false;
			$.isGuestInviteAllowed.touchEnabled =false;
			$.guestList.touchEnabled =false;
			$.coHostList.touchEnabled =false;
			$.centrTitle.text = "View Event";
			$.rightTitle.text = "";
			$.rightTitle.touchEnabled =false;
			$.venueSet.touchEnabled =false;
			$.invitePpl.touchEnabled =false;
			$.addCohost.touchEnabled =false;
			$.camImg.touchEnabled =false;
		}
		selectedVenue =	{
				"street": record.event_venu,
				"city": record.event_city,
				"country": record.event_country,
				"address": record.event_address + ", " + record.event_city + ", " + record.event_state+ ", " + record.event_country+ ", " + record.event_zipcode,
				"zipcode": record.event_zipcode,
				"longitude": record.longitude,
				"latitude": record.latitude,
				"state": record.event_state
		};
		$.addressTxt.value = selectedVenue.address;
	    selectedImage = record.promotion_image1;
	    $.isPublic.value= (record.is_private == 1?false:true);
	    $.isGuestInviteAllowed.value= (record.guest_can_invite_friend ==1);
	    
	    var invitedGuests = record.invitedGuests ;
	    if((typeof invitedGuests) == "object"){
	    	for(var i=0;i<invitedGuests.length;i++){
	    		selectedGuests[invitedGuests[i].user_id] = invitedGuests[i];
	    	}
	    }
	    var cohost = record.cohost ;
	    if((typeof cohost) == "object"){
	    	for(var i=0;i<cohost.length;i++){
	    		selectedHosts[cohost[i].user_id] = cohost[i];
	    	}
	    }
	    $.guestList.text = getUserList(selectedGuests);
	    $.coHostList.text = getUserList(selectedHosts);
	    
	    Ti.API.info("selectedHosts " + JSON.stringify(selectedHosts));
	    Ti.API.info("selectedGuests " + JSON.stringify(selectedGuests));
	    
	  	$.camImg.image="images/icons8-camera.png";
	}catch(ex){
		Ti.API.error("exception " + ex.toString());
	}	    
}

function getUserList(users){
	var str="";
	if(users == undefined ) return str;
	for(var key in users) {
		var item = users[key];
		if(str !="") str+=", ";
		
		str+= item.first_name;
	}
	if(str == "undefined") str ="";
	return str;
}
$.venueSet.addEventListener("click",function(e){
	var ctrl=Alloy.createController('setVenue',{venue:selectedVenue});
	ctrl.myCallback = function(rec){
		selectedVenue = rec;
		Ti.API.info("selectedVenue " + JSON.stringify(selectedVenue));
		$.addressTxt.value = selectedVenue.address;
	};
	var wind = ctrl.getView();
	wind.open();
});

$.invitePpl.addEventListener("click",function(e){
	var ctrl=Alloy.createController('eventUsers',{title:"Invite Users",users:selectedGuests,showAll:true});
	ctrl.myCallback = function(users){
		selectedGuests = users;
		$.guestList.text = getUserList(selectedGuests);
	};
	var wind = ctrl.getView(); 
	wind.open();
});  

$.addCohost.addEventListener("click",function(e){
	var ctrl=Alloy.createController('eventUsers',{title:"Add CoHost",users:selectedHosts,showAll:false});
	ctrl.myCallback = function(users){
		selectedHosts = users;
		$.coHostList.text = getUserList(selectedHosts);
	};
	var wind = ctrl.getView();
	wind.open();
});

$.camImg.addEventListener("click",function(e){
	if(selectedImage == undefined){
		var captureMedia = require("captureMedia");
		captureMedia.showPhotoOption(function(response){
			Ti.API.info("setMedia response imageFullView " + JSON.stringify(response));	
			Ti.API.error("mediaChanged  " + mediaChanged);
			if(response.action == "image"){
				mediaChanged = true;
				selectedImage = response.media;
				$.camImg.image="images/icons8-camera.png" ;
			}else{
				 $.camImg.image="images/photoCamera.png" ;
			}
			Ti.API.error("mediaChanged  " + mediaChanged);
		});
	}else{
		var ctrl=Alloy.createController('imageFullView',{media:selectedImage});
		ctrl.myCallback = function(response){
			Ti.API.info("In else setMedia response imageFullView " + JSON.stringify(response));	
			Ti.API.error("In else mediaChanged  " + mediaChanged);
			if(response.action == "image"){
				mediaChanged = true;
				selectedImage = response.media;
				$.camImg.image="images/icons8-camera.png";
			}else{
				 $.camImg.image="images/photoCamera.png" ;
			}
			Ti.API.error("In else mediaChanged  " + mediaChanged);
		};
		var wind = ctrl.getView();
		wind.open();
	}
}); 
$.createEventView.addEventListener("click",function(e){
	$.titleTxt.blur();
	$.descTxt.blur();
	
});
function showDatePicker(ctrl){
	try{

	// Date Picker example.
	// Set minimum date to 1900.
	var minDate = new Date();
	
	// Set minimum date to today - 18 years.
	var maxDate = minDate.setYear(minDate.getYear()+1);
	var defaultValue = new Date();
	var maxSelectedDate = minDate.setYear(minDate.getYear()+1);
	var overlay = Alloy.createWidget('danielhanold.pickerWidget', {
	  id: 'myDatePicker',
	  outerView: $.createEventView,
	  hideNavBar: false,
	  type: 'date-time-picker',
	  pickerParams: {
	    minDate: minDate,
	    maxDate: maxDate,
	    value: defaultValue,
	    maxSelectedDate: maxSelectedDate,
	    maxSelectedDateErrorMessage: 'Event date should exceed more than a year'
	  },
	  onDone: function(e) {
	  	if (!e.cancel) {
		    Ti.API.info("e" + JSON.stringify(e));
		    var datetext = moment(e.data.unixMilliseconds).format("llll");
		    ctrl.source.value = datetext;
		    ctrl.source.dateValue = moment(e.data.unixMilliseconds);
		 }  
	  },
	});
	}catch(ex){
		Ti.API.error("showDOBPicker " + JSON.stringify(ex));
	}
}


function createEvent(){
	try{
		if(Titanium.Network.online == false){
			utility.customAlert("Your device is not online. Please check connectivity.", "Connection");
			return;
		}
	
	    if($.titleTxt.value==""){
			utility.customAlert('Please enter event name','Event');
	    	return;
	    }
	    if($.descTxt.value==""){
			utility.customAlert('Please enter event description','Event');
	    	return;
	    }
	    if($.startDateTxt.dateValue== undefined){
			utility.customAlert('Please select Event Start Date','Event');
	    	return;
	    }
	    if($.endDateTxt.dateValue== undefined){
			utility.customAlert('Please select Event End Date','Event');
	    	return;
	    }
	    if(selectedVenue == undefined){
			utility.customAlert('Please select Event Venue','Event');
	    	return;
	    }
	    if(selectedImage == undefined){
			utility.customAlert('Please select Event Image','Event');
	    	return;
	    }
	    var userInfo = Ti.App.Properties.getObject("user",{});
		Ti.API.info("userInfo" + JSON.stringify(userInfo));
		var evtStartDt = new Date($.startDateTxt.dateValue).toUTCString();
		var evtDateDt = new Date($.endDateTxt.dateValue).toUTCString();
		
		
		var httpparams = {
				data:{
					userid:userInfo.user_id,
					eventname : $.titleTxt.value,
					description : $.descTxt.value,
					category : "",
					startdatetime: evtStartDt,
					enddatetime: evtDateDt,
					ispublished : 1,
					isprivate : ($.isPublic.value?0:1),
					keywords : "",
					eventvenue : selectedVenue.street,
					address : selectedVenue.address,
					zipcode : selectedVenue.zipcode,
					city : selectedVenue.city,
					state : selectedVenue.state,
					country: selectedVenue.country,
					latitude: selectedVenue.latitude,
					longitude: selectedVenue.longitude,
					maxnoseat: 10000,
					perseatcoast: 50,
					eventstatus:'published',
					guestcaninvitefriend:($.isGuestInviteAllowed.value?1:0)

				}
	
		};
		if(record != undefined){
			httpparams.data.eventid = record.event_id;
		}
		Alloy.Globals.loading.show(' ', false);
		Ti.API.info("param " + JSON.stringify(httpparams));
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("createUpdateEvent",httpparams,myCallback);
		 
	}catch(ex){
		Alloy.Globals.displayError("createEvent " + JSON.stringify(ex));
	}			
	
}
function myCallback(data){
	try{
		Alloy.Globals.loading.hide();
		var response = JSON.parse(data);
		
		if(response.success != 1){
			utility.customAlert(response.message,"Create Event");
			return;
		}
		newEventRecord = response.message[0];
		
		Ti.API.error("upload media " + mediaChanged);
		if(mediaChanged == true){
			
			uploadEventImage(selectedImage);
		}else{
			inviteHosts();
		}
		
	}catch(ex){
		Alloy.Globals.displayError("createEvent exception " + ex.toString());
	}
}
function uploadEventImage(media){
		try{
		if(Titanium.Network.online == false){
			utility.customAlert("Your device is not online. Please check connectivity.", "Connection");
			return;
		}
		
		var eventid;
		if(record != undefined){
			eventid = record.event_id;
		}else{
			eventid = newEventRecord.event_id;
		}
		Alloy.Globals.loading.show(' ', false);
		var httpparams = {
			'event_id':eventid,
			'promotionalimages_1': media,
			'promotionalimages_2': "",
			'promotionalimages_3': ""
		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.updateMedia("uploadPromotionImages",httpparams,uploadCallback);
		 
	}catch(ex){
		Alloy.Globals.displayError("uploadTest " + JSON.stringify(ex));
	}finally{
		
	}	
}

function uploadCallback(data){
	try{
		Alloy.Globals.loading.hide();
		var response = JSON.parse(data);
		
		if(response.success != 1){
			utility.customAlert(response.message,"Login");
			return;
		}
		inviteHosts();
		
	}catch(ex){
		Alloy.Globals.displayError("uploadCallback exception " + ex.toString());
	}
}

function inviteHosts(){
	try{
		if(Titanium.Network.online == false){
			utility.customAlert("Your device is not online. Please check connectivity.", "Connection");
			return;
		}
	
		var users ="";
	    for(var key in selectedHosts){
	    	if(users != "") users+= ",";
	    	users+= key;
	    }
	    
	    if(users=="") {
	    	inviteGuests();
	    	return;
	    }
	    var userInfo = Ti.App.Properties.getObject("user",{});
		
		var eventid;
		if(record != undefined){
			eventid = record.event_id;
		}else{
			eventid = newEventRecord.event_id;
		}
		
		var httpparams = {
				data:{
					eventid:eventid,
					userid:users
				}
		};
		
		Alloy.Globals.loading.show(' ', false);
		Ti.API.info("param " + JSON.stringify(httpparams));
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("addHost",httpparams,function(data){
	 		Alloy.Globals.loading.hide();
	 		inviteGuests();
	 	});
		 
	}catch(ex){
		Alloy.Globals.displayError("addHost " + JSON.stringify(ex));
	}	
}

function inviteGuests(){
	try{
		if(Titanium.Network.online == false){
			utility.customAlert("Your device is not online. Please check connectivity.", "Connection");
			return;
		}
	
		var users ="";
	    for(var key in selectedGuests){
	    	if(users != "") users+= ",";
	    	users+= key;
	    }
	    
	    if(users=="") {
	    	completed();
	    };
	    var userInfo = Ti.App.Properties.getObject("user",{});
		var eventid;
		if(record != undefined){
			eventid = record.event_id;
		}else{
			eventid = newEventRecord.event_id;
		}
		var httpparams = {
				data:{
					eventid:eventid,
					invitedfrom:userInfo.user_id,
					invitedto:users
				}
		};
		
		Alloy.Globals.loading.show(' ', false);
		Ti.API.info("param " + JSON.stringify(httpparams));
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("inviteToEvent",httpparams,function(data){
	 		Alloy.Globals.loading.hide();
	 		completed();
		
	 	}); 
	}catch(ex){
		Alloy.Globals.displayError("inviteToEvent " + JSON.stringify(ex));
	}			
	
}

function completed(){
	alert("Event created successfully");
	$.createEventView.close();
	Ti.App.fireEvent("refreshFeed");
}
$.deleteBtn.addEventListener("click",function(){
	var dialog = Ti.UI.createAlertDialog({
		No : 1,
		buttonNames : ['Yes', 'No'],
		message : 'Are you sure you want to delete this event ?',
		title : 'Delete'
	});
	dialog.addEventListener('click', function(e) {
		if (e.index == 0) {
			deleteEvent();

		}
	});
	dialog.show();
});
function deleteEvent(){
	try{
		if(Titanium.Network.online == false){
			utility.customAlert("Your device is not online. Please check connectivity.", "Connection");
			return;
		}
	
		
		var httpparams = {
				data:{
					eventid:record.event_id
				}
		};
		
		Alloy.Globals.loading.show(' ', false);
		Ti.API.info("param " + JSON.stringify(httpparams));
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("deleteevent",httpparams,function(data){
	 		Alloy.Globals.loading.hide();
	 		alert("Event deleted successfully");
			$.createEventView.close();
			Ti.App.fireEvent("refreshFeed");
	 		
	 	}); 
	}catch(ex){
		Alloy.Globals.displayError("deleteEvent " + JSON.stringify(ex));
	}			
	
}
