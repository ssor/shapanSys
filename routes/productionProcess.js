
/*
 * GET home page.
 */
var timeFormater 	   = require('./timeFormat').getCurrentTimeCombining;
var _ = require("underscore");


exports.updateProcessState = _updateProcessState;


var bProductionProcessRunning = false;
var productionProcessStartTime = '';
var productionProcessStartStamp = 0;
var productionProcessStopTime = '';
var productionProcessStopStamp = 0;


//传入信息，开始处理
function _updateProcessState(_msg){
	if(_msg.flag == 'btn000'){
		if(_msg.state == 'on'){
			_resetProcessInfo();
			_setProcessStartInfo();
		}else if(_msg.state == 'off'){
			if(!_checkProcessStartNormally()){
				_resetProcessInfo();
				return;
			}
			_setProcessStopInfo();

			console.log(('整个流程 from ' + productionProcessStartTime + ' to ' + productionProcessStopTime).data);
			console.log(('共耗时 ' + (productionProcessStopStamp - productionProcessStartStamp)/1000 + ' 秒').data);
		}
		return; 
	}else{
		if(_checkProcessStartNormally() == false) return;//流程没有开始
	}
	var processSetting = _.findWhere(processSettings, {flag: _msg.flag});
	if(processSetting != null){
		if(_msg.state == 'on'){
			processSetting.startStamp = _msg.stamp;
			processSetting.startTime = _msg.time;
		}else if(_msg.state == 'off'){
			if(processSetting.startStamp <= 0) return;//直接从开始状态进入的
			processSetting.endStamp = _msg.stamp;
			processSetting.endTime = _msg.time;
			processSetting.timeConsumed = processSetting.endStamp - processSetting.startStamp;
			console.log((processSetting.processName + ' from ' + processSetting.startTime + ' to ' + processSetting.endTime).data);
			console.log(('共耗时 ' + processSetting.timeConsumed/1000 + ' 秒').data);

			if(processSetting.lastProcess == true){
				console.log('A plan complted!!'.info);
				ep.emit('productionPlanComplted');
			}
		}
	}
	// console.dir(processSetting);
}
function _resetProcessInfo(){
	bProductionProcessRunning = false;
	productionProcessStartTime = '';
	productionProcessStartStamp = 0;
	productionProcessStopTime = '';
	productionProcessStopStamp = 0;	
}
function _setProcessStartInfo(){
	bProductionProcessRunning = true;
	var time = timeFormater();
	productionProcessStartStamp = time.stamp;
	productionProcessStartTime = time.formated;	
}
function _setProcessStopInfo(){
	bProductionProcessRunning = false;
	var time = timeFormater();
	productionProcessStopStamp = time.stamp;
	productionProcessStopTime = time.formated;	
}
// 是否按照正常流程开始
function _checkProcessStartNormally(){
	if(bProductionProcessRunning == false || productionProcessStartStamp <= 0){
		return false;
	}
	return true;
}





