
/*
 * GET home page.
 */
var timeFormater 	   = require('./timeFormat').getCurrentTimeCombining;
var _ = require("underscore");

var countEachProducingAction = 5;

var planStore = [];//计划列表
var inventories = [];//记录库存
ep.tail('newOrderComingIn', _handleNewOrder);
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
/*
{ orders: 
   [ { name: '737', quantity: 7 },
     { name: '767', quantity: 4 },
     { name: '777', quantity: 0 } ],
  published: true }
*/
function _handleNewOrder(_newOrder){
	_.each(_newOrder.orders, doSpecifiedProductPlan);

	console.log('生产计划列表 =>'.info);
	console.dir(planStore);

	console.log('库存统计：');
	_.each(inventories, function(_inventory){
		console.log((_inventory.name + ' : ' + _inventory.quantity).data);
	});

	ep.emit('orderHandled');//通知订单已经处理完毕
}
function doSpecifiedProductPlan(_order){
		//检查库存
		var inventory = _.findWhere(inventories, {name: _order.name});
		if(inventory == null){
			inventory = {name: _order.name, quantity: 0};
			inventories.push(inventory);			
		}

		if(_order.quantity <= inventory.quantity){
			inventory.quantity -= _order.quantity;
			return;
		}else{
			_order.quantity -= inventory.quantity;
			inventory.quantity = 0;
		}

		//制作生产计划
		if(_order.quantity > 0){
			if(_order.quantity <= countEachProducingAction){
				planStore.push({name: _order.name, quantity: countEachProducingAction, complted: false});
				inventory.quantity = (countEachProducingAction - _order.quantity);
			}
			else{
				planStore.push({name: _order.name, quantity: countEachProducingAction, complted: false});
				doSpecifiedProductPlan({name:_order.name, quantity: _order.quantity - countEachProducingAction});
			}
		}	
}

