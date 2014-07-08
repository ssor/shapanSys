
/*
 * GET home page.
 */
var timeFormater 	   = require('./timeFormat').getCurrentTimeCombining;
var _ = require("underscore");

var TimerID4OrderPublish;
var count737 = 10;
var count767 = 5;
var count777 = 7;
var orderCount = 6;
var productCountList = [{name: '737', count: count737}, {name: '767', count: count767}, {name: '777', count: count777}];
var orders;


ep.tail('startOrderSimulation', _productOrderList);
ep.tail('orderHandled', _publishOrder);

function _productOrderList(){
	var splitedCountArray = _.map(productCountList, function(_productCount){
		var ordersCount = _splitProductCount(_productCount.count, orderCount, []);
		// console.dir(ordersCount);
		return {ordersCount: ordersCount, name: _productCount.name};
	});
	if(checkZeroExists(splitedCountArray) == true){
		console.log('order ok!!'.info);
		console.dir(splitedCountArray);
		var orders = _.map(splitedCountArray, _transformToOrderList);
		/*
		[ [ { name: '737', quantity: 1 },
		    { name: '737', quantity: 2 },
		    { name: '737', quantity: 4 },
		    { name: '737', quantity: 3 },
		    { name: '737', quantity: 0 } ],
		  [ { name: '767', quantity: 0 },
		    { name: '767', quantity: 2 },
		    { name: '767', quantity: 0 },
		    { name: '767', quantity: 1 },
		    { name: '767', quantity: 2 } ],
		  [ { name: '777', quantity: 2 },
		    { name: '777', quantity: 3 },
		    { name: '777', quantity: 1 },
		    { name: '777', quantity: 0 },
		    { name: '777', quantity: 1 } ] ]
	    */
		var size = _.size(orders);
		var combinedOrders = [];
		for(var i = 0; i < orderCount; i++){
			var order = [];
			for(var j = 0; j < size; j++){
				order.push(orders[j][i]);
			}
			combinedOrders.push(order);
		}
		console.dir((combinedOrders));

		// ep.emit('orderSimulationOK', splitedCountArray);
		_startOrderPublishSimulation(combinedOrders);
	}else{
		console.log('order should be return!!'.error);
		_productOrderList();
	}
}
function _transformToOrderList(_splitedCount){
	var name = _splitedCount.name;
	return _.map(_splitedCount.ordersCount, function(_quantity){
		return {name: name, quantity: _quantity};
	});
}

/*
[ [ { name: '737', quantity: 0 },
    { name: '767', quantity: 1 },
    { name: '777', quantity: 1 } ],
  [ { name: '737', quantity: 1 },
    { name: '767', quantity: 0 },
    { name: '777', quantity: 1 } ],
  [ { name: '737', quantity: 3 },
    { name: '767', quantity: 3 },
    { name: '777', quantity: 2 } ],
  [ { name: '737', quantity: 1 },
    { name: '767', quantity: 1 },
    { name: '777', quantity: 1 } ],
  [ { name: '737', quantity: 5 },
    { name: '767', quantity: 0 },
    { name: '777', quantity: 2 } ] ]
*/
function _startOrderPublishSimulation(_orderList){
	orders = _.map(_orderList, function(_order){
		return {orders: _order, published: false} ;
	});
	// TimerID4OrderPublish = setInterval(_publishOrder, 3000, orders);
	_publishOrder();
}
function _publishOrder(){
	var notYetPublishedOrder = _.findWhere(orders, {published: false});
	if(notYetPublishedOrder != null){
		console.log('New Order Coming in ...'.data);
		notYetPublishedOrder.published = true;
		console.dir(notYetPublishedOrder);
		/*
		{ orders: 
		   [ { name: '737', quantity: 7 },
		     { name: '767', quantity: 4 },
		     { name: '777', quantity: 0 } ],
		  published: true }
		*/
		ep.emit('newOrderComingIn', notYetPublishedOrder);//通知生产计划
	}else{
		console.log('All Order Published...'.data);
		// clearInterval(TimerID4OrderPublish);
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


