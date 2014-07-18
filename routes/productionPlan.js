
/*
 * GET home page.
 */
var timeFormater 	   = require('./timeFormat').getCurrentTimeCombining;
var _ = require("underscore");

var countEachProducingAction = 3;

var planStore = [];//计划列表
var inventories = [];//记录库存
var autoHandleNewOrder = true;

ep.tail(eventNewOrderComingIn, newOrderComingIn);
ep.tail(eventOrderDeleted, function(){
	//通知计划页面订单有变动
	ep.emit('broadcastInfo', {url: planConfigIndex, cmd: '', message: '订单被取消，请根据需要修改生产计划'});
})
planDBFind({}).then(function(_plans){
	planStore = _.sortBy(_plans, function(_plan){return _plan.index});
})
/*
ep.tail('productionPlanComplted', function(){
	console.dir(planStore);
	var plan = _.findWhere(planStore, {complted: false})
	if(plan != null){
		plan.complted = true;
		console.log((plan.name + ': ' + plan.quantity + ' complted').info);
	}else{
		console.log('no plan complted ,error '.error);
	}
})
*/
function newOrderComingIn(_newOrders){
	console.log('newOrderComingIn =>'.info);
	console.dir(_newOrders);
	if(autoHandleNewOrder == true){
		if(_.isArray(_newOrders)){
			if(_.size(_newOrders) > 0){
				return _handleNewOrder(_newOrders[0].data).then(function(){
					ep.emit('broadcastInfo', {url: planConfigIndex, cmd: 'reload', message: '有新订单已被自动处理'});
					return newOrderComingIn(_.rest(_newOrders));
				})
			}else{
				//如果自动处理，通知客户端刷新
				// return _handleNewOrder(_newOrder.data).then(function(){
				// 	ep.emit('broadcastInfo', {url: planConfigIndex, cmd: 'reload', message: '有新订单已被自动处理'});
				// })
			}
		}
	}else{
		//新订单没有被处理，通知客户端消息
		ep.emit('broadcastInfo', {url: planConfigIndex, cmd: '', message: '收到新订单尚未处理'});
	}
}


exports.planAutoSettingIndex = function(req, res){
	res.render('planAutoSettingIndex');
}
exports.planConfigIndex = function(req, res){
	res.render('planConfigIndex');
}
exports.planList = function(req, res){
	var list = _.map(planStore, function(_plan){
		return _.pick(_plan, "name", "quantity", "complted", "index");
	});

	var sums = _.chain(list)
				.groupBy(function(_plan){return _plan.name;})
				.values()
				.map(function(_planGroup){
					var sum = _.reduce(_planGroup, function(mem, _plan){return mem+_plan.quantity;}, 0);
					var name = _planGroup[0].name;
					return {name: name, quantity: sum, index: ''};
				})
				.value();
	
	console.dir(sums);
	list.push({name: '', quantity: '', index: '总计'});
	list = _.union(list, sums);
	console.dir(list);
	res.send(JSON.stringify({data: list}));
}
exports.addPlanIndex = function(req, res){
	res.render('addPlanIndex', {product1: '产品一', product2: '产品二', product3: "产品三"});
}
exports.addPlan = function(req, res){
	var body = req.body;
	console.dir(body);
	var product = _.findWhere(productTypeList, {index: parseInt(body.index)});
	if(product != null){
		_addNewPlanToStore(new ProductinoPlan(product.name, parseInt(body.quantity)));
		// _addNewPlanToStore({name: product.name, quantity: parseInt(body.quantity), complted: false});
		// var maxIndex = _.max(planStore, function(_plan){return _plan.index});
		// if(maxIndex == -Infinity || maxIndex == null){
		// 	planStore.push({name: product.name, quantity: parseInt(body.quantity), index: 1});
		// }else{
		// 	planStore.push({name: product.name, quantity: body.quantity, index: maxIndex.index + 1});
		// }
		res.send(JSON.stringify({code: 0}));
	}else{
		res.send(JSON.stringify({code: 1, message: '系统异常'}));
	}
}
exports.deletePlan = function(req, res){
	var body = req.body;
	console.dir(body);
	planDBRemove({index: parseInt(body.index)}).then(function(_num){
		if(_num <= 0) throw new Error('sys error');

		planStore = _.filter(planStore, function(_plan){return _plan.index != parseInt(body.index)});
		res.send(JSON.stringify({code: 0}));
	}).catch(function(error){
		console.log(error.message.error);
		res.send(JSON.stringify({code: 1, message: '系统异常'}));
	})
}
exports.enableAutoPlan = function(req, res){
	autoHandleNewOrder = true;
	res.send(JSON.stringify({code: 0}));
	// res.send(JSON.stringify({code: 1, message: 'test'}));
}
exports.setMinProductionQuantity = function(req, res){
	countEachProducingAction = parseInt(req.body.quantity);
	console.log(('setMinProductionQuantity = ' + countEachProducingAction).info);
	res.send(JSON.stringify({code: 0}));
}
exports.disableAutoPlan = function(req, res){
	autoHandleNewOrder = false;
	console.log('disableAutoPlan !!!'.info);
	res.send(JSON.stringify({code: 0}));
}
function ProductinoPlan(_name, _quantity){
	this.name = _name;
	this.quantity = _quantity;
	this.complted = false;
	this.index = -1;
}
/*
	{ orders: 
	   [ { name: '737', quantity: 7 },
	     { name: '767', quantity: 4 },
	     { name: '777', quantity: 0 } ],
	  published: true }
*/
function _handleNewOrder(_orders){
	console.log('_handleNewOrder =>'.info);
	console.dir(_orders);
	if(_.size(_orders) > 0){
		return doSpecifiedProductPlan(_orders[0]).then(function(){
			return _handleNewOrder(_.rest(_orders));
		})
	}
	// _.each(_orders, doSpecifiedProductPlan);

	console.log('生产计划列表 =>'.info);
	console.dir(planStore);

	// console.log('库存统计：');
	// _.each(inventories, function(_inventory){
	// 	console.log((_inventory.name + ' : ' + _inventory.quantity).data);
	// });

	// ep.emit('orderHandled');//通知订单已经处理完毕
}
function doSpecifiedProductPlan(_order){
		console.log('doSpecifiedProductPlan => '.info);
		console.dir(_order);
		//检查库存
		var inventory = _.findWhere(inventories, {name: _order.name});
		if(inventory == null){
			inventory = {name: _order.name, quantity: 0};
			inventories.push(inventory);			
		}

		if(_order.quantity <= inventory.quantity){
			inventory.quantity -= _order.quantity;
			return Q.fcall(function () {return;})
			// return;
		}else{
			_order.quantity -= inventory.quantity;
			inventory.quantity = 0;
		}

		//制作生产计划
		if(_order.quantity > 0){
			var newPlan = new ProductinoPlan(_order.name, countEachProducingAction);
			return _addNewPlanToStore(newPlan).then(function(){
				if(_order.quantity <= countEachProducingAction){
					// var newPlan = {name: _order.name, quantity: countEachProducingAction, complted: false};
					inventory.quantity = (countEachProducingAction - _order.quantity);
					return Q.fcall(function(){return;});
				}
				else{
					// _addNewPlanToStore({name: _order.name, quantity: countEachProducingAction, complted: false});
					return doSpecifiedProductPlan({name:_order.name, quantity: _order.quantity - countEachProducingAction});
				}				
			})
			// .catch(function(error){
			// 	console.log(error.message.error);
			// })
		}	
		// console.dir(planStore);
}

function _addNewPlanToStore(_newPlan){
	console.log('_addNewPlanToStore => '.debug);
	var maxIndexPlan = _.max(planStore, function(_plan){return _plan.index});
	if(maxIndexPlan == null || maxIndexPlan == -Infinity){
		_newPlan.index = 1;
	}else _newPlan.index = maxIndexPlan.index + 1;

	return planDBInsert(_newPlan).then(function(__newPlan){
		if(__newPlan == null) throw new Error('db error');
		console.log('new plan to db :'.data);
		console.dir(_newPlan);
		planStore.push(_newPlan);
		return Q.fcall(function(){return;});
	});
}







