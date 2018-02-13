// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var records = args.record;

for(var i=0;i<records.length;i++){
	var row = Alloy.createController("seeMoreRowItemView",{record:records[i],rowIndex:i}).getView();
	row.record = records[i];
	$.seeMoreRow.add(row);
}

