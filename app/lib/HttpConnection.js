var HttpConnection = {};
var TIMEOUT = 90000;  // in milliseconds;		
function createHTTClient(callback,progressCallback){	
		var callbackFunction = callback;
		var progressCallbackFunction =progressCallback;

		var httpClient = Titanium.Network.createHTTPClient({
	     // function called when the response data is available
	     onload : function(e) {
	     	var responsedata = httpClient.responseText;
	     	var str = 'url= '+ httpClient.location+ ' onload code ' + e.code + " success " + e.success;
	       	str +="\n responsedata " + responsedata;
	      	Alloy.Globals.displayLog(str);
			callbackFunction(responsedata);
	     },
	     // function called when an error occurs, including a timeout
	     onerror : function(e) {
		      var responsedata = httpClient.responseText;
		      var str = 'url= '+ httpClient.location+ ' onerror code ' + e.code + " success " + e.success;
		      str +="\n responsedata " + responsedata;
		      Alloy.Globals.displayLog(str);
		      	
	         
	      	 if(e.code == 401){
	      	 	 callbackFunction(responsedata);
	      	 	 return;
	      	 }
	         var result = new Object();
			 result.success = false;
			 result.message = e.error;
			 result.errorType = e.code;
			 result.httpError = true;
	         callbackFunction(JSON.stringify(result));
	     },
	     onsendstream :function(e) {
		 	if(progressCallbackFunction != undefined){
		 		progressCallbackFunction(e);
		 	}
			//Alloy.Globals.displayLog('ONSENDSTREAM - PROGRESS: ' + JSON.stringify(e));
		},
	     timeout : TIMEOUT  // in milliseconds
	 }); 
	 
	 return httpClient;
}

HttpConnection.callPostAPI = function(apiName, params,callback){
	var httpClient = createHTTClient(callback);
 	var apiurl =  Alloy.CFG.API_URL + apiName;
 try{
 	Alloy.Globals.displayLog(' URL ' + apiurl + ' params ' + JSON.stringify(params));
 	httpClient.open('POST',apiurl);
 	httpClient.setRequestHeader("Content-Type", "application/json");
 	httpClient.send(params);
	}catch(ex){
		Alloy.Globals.displayError(apiurl  + JSON.stringify(ex));
	}	
 };
HttpConnection.callGetAPI = function(apiName, params,callback){

	var httpClient = createHTTClient(callback);
 	var apiurl =  Alloy.CFG.API_URL + apiName;
 	try{
 	Alloy.Globals.displayLog(' URL ' + apiurl + ' params ' + JSON.stringify(params));

 	httpClient.open('GET',apiurl);
 	httpClient.setRequestHeader("Content-Type", "application/json");
 	httpClient.send(params);
	}catch(ex){
		Alloy.Globals.displayError(apiurl  + JSON.stringify(ex));
	}	
 }; 
  
 HttpConnection.updateMedia = function(apiName,params,callback,progresscallback){
 	var httpClient = createHTTClient(callback,progresscallback);
 	var apiurl = Alloy.CFG.API_URL + apiName;
 	
 	Alloy.Globals.displayLog(' URL ' + apiurl + ' params ' + JSON.stringify(params));

 	httpClient.open('POST',apiurl);
 	httpClient.setRequestHeader("enctype", "multipart/form-data");
 	httpClient.send(params);

 };  
module.exports = HttpConnection;

