// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var utility = require("utility");
var address;
Alloy.Globals.getLocationAddress(function(response){
	Ti.API.info("response " + JSON.stringify(response));
	try{
		if(response.error == false){
			address = response.places[0];
		}
		if(address == undefined || address == null){
			address ={
				address:"",
				city:"",
				state:"",
				country:"",
				zipcode:""
			};
		}
	}catch(ex){
		Ti.API.error("ex " + ex.toString());
	}
});

$.phoneTxt.value = Alloy.Globals.userInfo.phoneno;

$.navigation.backBtn.addEventListener("click",function(e){
	$.setPhoneNumber.close();
});

$.setPhoneNumber.addEventListener("click",function(e){
	$.phoneTxt.blur();
});
$.skip.addEventListener("click",function(e){
	Alloy.Globals.userInfo.phoneno = "";
	register(true);
});


$.confirmNumber.addEventListener("click",function(e){
	register(false);
});

function register(skipPhone){
	try{
		if(Titanium.Network.online == false){
			utility.customAlert("Your device is not online. Please check connectivity.", "Connection");
			return;
		}
	
	    if(skipPhone == false ){
	    	if($.phoneTxt.value==""){
				utility.customAlert('Please enter the phone number','Signup');
		    	return;
		    }
			if($.phoneTxt.value.length<10){
				utility.customAlert('Please enter valid phone number','Signup');
		    	return;
		    }
	    }
	    
	    if(skipPhone == true){
	    	Alloy.Globals.userInfo.phoneno = "";
	    	if(Alloy.Globals.userInfo.phoneno == "" && Alloy.Globals.userInfo.email==""){
	    		utility.customAlert('Please enter phone number or email addres to signup','Signup');
	    		return;
	    	}
	    	
	    }else{
	    	Alloy.Globals.userInfo.phoneno = $.phoneTxt.value;
	    }
		Alloy.Globals.loading.show(' ', false);

		if(address == undefined || address == null){
			address ={
				address:"",
				city:"",
				state:"",
				country:"",
				zipcode:""
			};
		}
				
		pass=Alloy.Globals.userInfo.password; 
		var dob = Alloy.Globals.userInfo.dob;
		var httpparams = {
				data:{
					username:Alloy.Globals.userInfo.username,
					firstname:Alloy.Globals.userInfo.firstname,
					lastname:Alloy.Globals.userInfo.lastname,
					password:pass,
					email:Alloy.Globals.userInfo.email,
					phone:Alloy.Globals.userInfo.phoneno,
					dob:dob,
					gender:'',
					address:address.address,
					city:address.city,
					state:address.state,
					country:address.country,
					zipcode:address.zipcode,
					usertype:'tempo'
				}
	
		};
	 	var httpClient = require("HttpConnection");
	 	httpClient.callPostAPI("registerUser",httpparams,myCallback);
		 
	}catch(ex){
		Alloy.Globals.displayError("registerUser " + JSON.stringify(ex));
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
		
		Ti.App.Properties.setObject("user",response.userinfo[0]);
		
		var httphelper = require("HttpHelper");
		httphelper.addDevice();
			
		var wind=Alloy.createController('enterConfirmCode').getView();
		wind.open();
		Alloy.Globals.Screens.enterConfirmCode =wind;
		
		setTimeout(Alloy.Globals.downloadAllMedia,5000);
	}catch(ex){
		Alloy.Globals.displayError("registerUser exception " + ex.toString());
	}
}

