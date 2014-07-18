
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
var orders = [];

orderDBFind({}).then(function(_orders){
	orders = _.sortBy(_orders, function(_order){ return _order.index; });
});

exports.orderList = function(req,res){
	// [{quantity1: 0, quantity2: 0, quantity3: 0}]
    var list = _.map(orders, function(_order){
        var quantities = _.pluck(_order.data, "quantity");
        var line = {index: _order.index};
        for(var i = 0; i < 3; i++){
            switch(i){
                case 0:
                    _.extend(line, {"quantity1": quantities[i]});
                break;
                case 1:
                    _.extend(line, {"quantity2": quantities[i]});
                break;
                case 2:
                    _.extend(line, {"quantity3": quantities[i]});
                break;
            }
        }
        console.log(line);
        return line;
    })
    // [ { index: 1, quantity1: 1, quantity2: 1, quantity3: 1 } ]
	console.dir(list);
	var quantity1Sum = _.chain(list).pluck("quantity1").reduce(function(mem, num){return mem + num;}, 0).value();
	var quantity2Sum = _.chain(list).pluck("quantity2").reduce(function(mem, num){return mem + num;}, 0).value();
	var quantity3Sum = _.chain(list).pluck("quantity3").reduce(function(mem, num){return mem + num;}, 0).value();
	list.push({index: '总计', quantity1: quantity1Sum, quantity2: quantity2Sum, quantity3: quantity3Sum});
	res.send(JSON.stringify({data: list}));
}
exports.orderConfigIndex = function(req, res){

	// ep.emit('startOrderSimulation');
	res.render('orderConfigIndex', {product1: '产品一', product2: '产品二', product3: "产品三"});
}
exports.orderAutoIndex = function(req, res){
	res.render('orderAutoIndex');
}
exports.addOrderIndex = function(req, res){
	res.render('addOrderIndex', {product1: '产品一', product2: '产品二', product3: "产品三"});
}
exports.deleteOrder = function(req, res){
	console.log('deleteOrder => '.data);
	console.dir(req.body);
	var index = parseInt(req.body.index);
	orderDBRemove({index: index}).then(function(_num){
		if(_num > 0){
			orders = _.filter(orders, function(_order){return _order.index != index});
			console.dir(orders);
			ep.emit(eventOrderDeleted);//通知计划做出更改
			res.send(JSON.stringify({code: 0}));
		}else{
			throw new Error('db error');
		}
	}).catch(function(error){
		console.log(error.message.error);
		res.send(JSON.stringify({code: 1, message: '系统异常！'}));
	})
}
exports.addOrder = function(req,res){
	console.log('addOrder => '.data);
	console.dir(req.body);
	var order = req.body.order;
	var newOrderData = _.map(order, function(_partial){
		var productInfo = _.findWhere(productTypeList, {index: parseInt(_partial.index)});
		if(productInfo != null){
			return {name: productInfo.name, quantity: parseInt(_partial.quantity)};
		}else return null;
	})
	newOrderData = _.without(newOrderData, null);
	var newOrder = {data: newOrderData};
	var maxIndexOrder = _.max(orders, function(_order){return _order.index});
	// console.log('maxIndexOrder => ');
	// console.dir(maxIndexOrder);
	if(maxIndexOrder == null || maxIndexOrder == -Infinity){
		newOrder.index = 1;
	}else{
		newOrder.index = maxIndexOrder.index + 1;
	}
	console.dir(newOrder);
	orderDBInsert(newOrder).then(function(_newOrder){
		if(_newOrder == null) throw new Error('db error');
		orders.push(newOrder);
		console.dir(orders);
		ep.emit(eventNewOrderComingIn, [newOrder]);
		res.send(JSON.stringify({code: 0}));
	}).catch(function(error){
		console.log(error.message.error);
		res.send(JSON.stringify({code: 1, message: '系统异常！'}));
	})

}
exports.resetOrderSetting = function(req, res){
	// console.dir(req.body);
	var quantitySettings = req.body.quantitySettings;
	orderCount = parseInt(req.body.orderQuantity);
	_.each(quantitySettings, function(_setting){
		var productInfo = _.findWhere(productTypeList, {index: parseInt(_setting.index)});
		if(productInfo != null){
			productInfo.totalCount = parseInt(_setting.quantity);
		}
	})
	// console.dir(productTypeList);
	orderDBRemove({}, {multi: true}).then(function(_num){
		orders =  _productOrderList();
		ep.emit('orderDeleted');//通知计划做出更改
		return orderDBInsert(orders).then(function(_newOrders){
			ep.emit(eventNewOrderComingIn, orders);
			res.send(JSON.stringify({code: 0}));
		})
	}).catch(function(error){
		console.log(error.message.error);
		orders = [];
		res.send(JSON.stringify({code: 1, message: '系统异常！'}));
	})
}
// ep.tail('startOrderSimulation', _productOrderList);
// ep.tail('orderHandled', _publishOrder);

function _productOrderList(){
	var splitedCountArray = _.map(productTypeList, function(_productCount){
		var ordersCount = _splitProductCount(_productCount.totalCount, orderCount, []);
		// console.dir(ordersCount);
		return {ordersCount: ordersCount, name: _productCount.name};
	});
	if(checkZeroExists(splitedCountArray) == true){
		console.log('order ok!!'.info);
		console.dir(splitedCountArray);
		var ordersSingleProduct = _.map(splitedCountArray, _transformToOrderList);
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
		var size = _.size(ordersSingleProduct);
		var combinedOrders = [];
		for(var i = 0; i < orderCount; i++){
			var order = {data: [], index: (i+1)};
			for(var j = 0; j < size; j++){
				order.data.push(ordersSingleProduct[j][i]);
				// order.index = i + 1;
			}
			combinedOrders.push(order);
		}
		console.dir((combinedOrders));
		return combinedOrders;
		// ep.emit('orderSimulationOK', splitedCountArray);
		// _startOrderPublishSimulation(combinedOrders);
	}else{
		console.log('order should be return!!'.error);
		return _productOrderList();
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


