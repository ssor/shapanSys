
/*
 * GET home page.
 */
var timeFormater 	   = require('./timeFormat').getCurrentTimeCombining;
var _ = require("underscore");

var count737 = 10;
var count767 = 5;
var count777 = 7;
var orderCount = 5;
var productCountList = [{name: '737', count: count737}, {name: '767', count: count767}, {name: '777', count: count777}];

ep.tail('startOrderSimulation', _startOrderSimulation);

function _startOrderSimulation(){
	var ordersCountArray = _.map(productCountList, function(_productCount){
		var ordersCount = _splitProductCount(_productCount.count, orderCount, []);
		// console.dir(ordersCount);
		return {ordersCount: ordersCount, name: _productCount.name};
	});
	console.dir(ordersCountArray);
	if(checkZeroExists(ordersCountArray) == true){
		console.log('order ok!!');
		ep.emit('orderSimulationOK', ordersCountArray);
	}else{
		console.log('order should be return!!'.error);
		_startOrderSimulation();
	}
}
// [ { ordersCount: [ 1, 1, 0, 2, 6 ], name: '737' },
//   { ordersCount: [ 0, 1, 2, 1, 1 ], name: '767' },
//   { ordersCount: [ 1, 2, 0, 2, 2 ], name: '777' } ]
// 数组里面的每个数组的对应位置的数字之和不能为0
function checkZeroExists(_list){
	var bOk = true;
	var size = _list.length;
	var length = _list[0].ordersCount.length;
	for(var j = 0; j<length; j++){
		var sum = 0;
		for(var i=0; i< size; i++){
			sum += _list[i].ordersCount[j]
		}
		if(sum == 0){
			bOk = false;
			break;		
		}
	}
	return bOk;
}
function _splitProductCount(_totalCount, _splitCount, _array){
	if(_splitCount <= 1){
		_array.push(_totalCount);
		return _array;
	} 
	var ceil = Math.ceil(_totalCount/_splitCount) + _totalCount % _splitCount;
	var max = (ceil < _totalCount) ? ceil:_totalCount;
	var newR = _.random(0, max);
	_array.push(newR);
	return _splitProductCount(_totalCount - newR, _splitCount - 1, _array);
}


