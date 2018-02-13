// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var utility = require("utility");

var moment = require("alloy/moment");

$.dobTxt.value = Alloy.Globals.userInfo.dob;

$.navigation.backBtn.addEventListener("click",function(e){
	$.setBirthday.close();
});

$.continueBirthday.addEventListener("click",function(e){
	if($.dobTxt.value == ""){
		utility.customAlert("Enter your desired username", "Signup");
		return;
	}
	var wind=Alloy.createController('setPassword').getView();
	wind.open();
	Alloy.Globals.Screens.setPassword =wind;
});

function showDoBPicker(){
	try{

	// Date Picker example.
	// Set minimum date to 1900.
	var minDate = new Date(new Date().setYear(1900));
	// Set minimum date to today - 18 years.
	var maxDate = new Date(new Date().setYear(new Date().getFullYear()-18));
	var defaultValue = maxDate;
	var maxSelectedDate = new Date(new Date().setYear(new Date().getFullYear()-18));
	var overlay = Alloy.createWidget('danielhanold.pickerWidget', {
	  id: 'myDatePicker',
	  outerView: $.setBirthday,
	  hideNavBar: false,
	  type: 'date-picker',
	  pickerParams: {
	    minDate: minDate,
	    maxDate: maxDate,
	    value: defaultValue,
	    maxSelectedDate: maxSelectedDate,
	    maxSelectedDateErrorMessage: 'You must be at least 18 years old.'
	  },
	  onDone: function(e) {
	  	if (!e.cancel) {
		    Ti.API.info("e" + JSON.stringify(e));
		    var datetext = moment(e.data.unixMilliseconds).format("YYYY-MM-DD");
		    $.dobTxt.value = datetext;
		    Alloy.Globals.userInfo.dob = $.dobTxt.value;
		    Alloy.Globals.userInfo.dobval = e.data.unixMilliseconds;
		 }  
	  },
	});
	}catch(ex){
		Ti.API.error("showDOBPicker " + JSON.stringify(ex));
	}
}
