
/*
 * GET users listing.
 */
Date.prototype.format = function(format)  
{  
	/* 
	* format="yyyy-MM-dd hh:mm:ss"; 
	*/  
	var o = {  
	"M+" : this.getMonth() + 1,  
	"d+" : this.getDate(),  
	"h+" : this.getHours(),  
	"m+" : this.getMinutes(),  
	"s+" : this.getSeconds(),  
	"q+" : Math.floor((this.getMonth() + 3) / 3),  
	"S" : this.getMilliseconds()  
	}  
	if (/(y+)/.test(format))  
	{  
		format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4  
	- RegExp.$1.length));  
	}  
	  
	for (var k in o)  
	{  
		if (new RegExp("(" + k + ")").test(format))  
	{  
		format = format.replace(RegExp.$1, RegExp.$1.length == 1  
		? o[k]  
		: ("00" + o[k]).substr(("" + o[k]).length));  
	}  
	}  
	return format;  
}  

exports.getCurrentTime = function(){
	var time = new Date();  
	return time.format('yyyy-MM-dd hh:mm:ss');
};
exports.getCurrentTimeCombining = function(){
	var time = new Date();  
	return {formated: time.format('yyyy-MM-dd hh:mm:ss'), stamp: time.getTime()}
	// return time.format('yyyy-MM-dd hh:mm:ss');
}



