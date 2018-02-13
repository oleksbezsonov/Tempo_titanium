var args = $.args;
var records = args.record;

for(var i=0;i<records.length;i++){
	var row = Alloy.createController("friendsPostItemView",{record:records[i],rowIndex:i}).getView();
	row.record = records[i];
	$.friendsPostRow.add(row);
}

