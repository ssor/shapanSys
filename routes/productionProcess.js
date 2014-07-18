
/*
 * GET home page.
 */
var timeFormater 	   = require('./timeFormat').getCurrentTimeCombining;
var _ = require("underscore");
var deviceControl = require('./deviceControl');


exports.updateProcessState = _updateProcessState;


var bTotalProcessRunning = false;
var totalProcessStartTime = '';
var totalProcessStartStamp = 0;
var totalProcessStopTime = '';
var totalProcessStopStamp = 0;
/*
	设定
	===============
	* 一个总的生产过程(totalProcess)可能包含多个生产循环(process), 每个生产循环通过多个环节(section)来实现(自定义配置)
	* 生产循环中，各个环节是线性的，之后的环节必须在之前的环节完成后才能进行
	* 每个生产循环以第一个环节的开始作为循环的开始标识, 以最后一个环节的结束作为循环的结束标识

	逻辑规则
	===============
	* 以 000 按钮标识总生产过程，在开始之前和结束之后，任何数据无效
	* 以第一环节的开始作为一个生产循环的开始，以最后一个环节的结束作为生产循环的结束
	* 如果一个环节在循环结束的时候没有结束时间，将其使用时间设为0
	* 如果一个环节没有开始（包括只发送了关闭状态信息），将其占用时间设为0
	* 一个循环开始时，初始化该循环的所有环节信息

*/
var processRecords = [];//生产循环列表
var sectionSettings = [];//生产环节信息设定
// sectionSettings.push({flag: 'btn000', processName: 'Total Process', timeConsumed: 0, startStamp: 0, endStamp: 0, startTime: '', endTime: ''});
// sectionSettings.push({flag: 'btn001', processName: 'Section1', timeConsumed: 0, startStamp: 0, endStamp: 0, startTime: '', endTime: '', lastSection: false});
// sectionSettings.push({flag: 'btn002', processName: 'Section2', timeConsumed: 0, startStamp: 0, endStamp: 0, startTime: '', endTime: '', lastSection: true});

sectionDBFind({}).then(_initialProcessTemp);


exports.processList = function(req, res){
	console.dir(sections);
	var list = _.map(sections, function(_process){
		if(_process.deviceID.length <= 0) _process.deviceID = "未关联";
		return _process;
	})
	res.send(JSON.stringify({data: list}));
}
exports.addProcessInfo = function(req, res){
	var body = req.body;
	var index = parseInt(body.index);
	console.dir(body);
	// console.dir(_.findWhere(sections, {index: index}));

	var b = index > 0 && _.findWhere(sections, {index: index}) == null;
	if(b == false){
		res.send(JSON.stringify({code: 1, message: '流程编号不能小于1，并且不能和现有流程的编号相同！'}));
		return;
	}
	b = body.deviceID != null && body.deviceID.length > 0 && body.deviceID.length <= 6;
	if(b == false){
		res.send(JSON.stringify({code: 1, message: '尚未与设备绑定！'}));
		return;
	}
	//todo 不能重复绑定
	b = _.findWhere(sections, {deviceID: body.deviceID}) == null && body.deviceID != "btn000";
	if(b == false){
		res.send(JSON.stringify({code: 1, message: '设备重复使用！'}));
		return;
	}
	body.note = (body.note == null)? '':body.note;
	var newP = {index: index, name: body.name, note: body.note, deviceID: body.deviceID};
	sectionDBInsert(newP).then(function(){
		// sections.push(newP);//to db
		// console.dir(sections);
		_initialProcessTemp();//流传环节发生变化，重新初始化
		//todo  删除之前的历史记录

		res.send(JSON.stringify({code: 0}));
	}).catch(function(error){
		console.log(('error < sectionDBInsert: ' + error.message).error);
		res.send(JSON.stringify({code: 1, message: '系统异常！'}));
	})
}
exports.deleteProcessConfig = function(req, res){
	console.dir(req.body);
	var index = req.body.index;
	sectionDBRemove({index: parseInt(index)}).then(function(_num){
		console.log('deleteProcessConfig => ' + _num + ' process deleted');
		// sections = _.filter(sections, function(_process){return _process.index != index});
		_initialProcessTemp();
		//todo  删除之前的历史记录

		res.send(JSON.stringify({code: 0}));
	}).catch(function(error){
		console.log(('error < sectionDBRemove: ' + error.message).error);
		res.send(JSON.stringify({code: 1, message: '系统异常！'}));
	})
}
exports.addProcessIndex = function(req, res){
	scanAllDevices(addProcessIndex);
	res.render('addProcessIndex');
}
exports.processConfigIndex = function(req, res){
	scanAllDevices(processConfigIndex);
	res.render('processConfigIndex');
}
exports.runningIndex = function(req, res){
	_startRunningProcess();
	res.render('runningIndex');
}
function _startRunningProcess(){
	deviceControl.prepareSerialPortList();
	deviceControl.startSerialPortListening(serialPortList, _updateProcessState);
}
function scanAllDevices(_url){
	deviceControl.prepareSerialPortList();
	deviceControl.startSerialPortListening(serialPortList, function(_msg, _port){
		var serialPort = _.findWhere(serialPortList, {portName: _port.portName});
		if(serialPort == null){
			console.log('sys error!!'.error);
		}else{
			serialPort.flag = _msg.flag;
			console.log(('监测到按钮 ' + _msg.flag + ' 被触发').info);
			ep.emit('broadcastInfo', {btnName: _msg.flag, state:_msg.state, url: _url});
		}		
	});
}



function _initialProcessTemp(_sections){
	//添加默认的000按钮作为总流程按钮
	var btn000 = _.findWhere(_sections, {deviceID: 'btn000'});
	if(btn000 == null){
		var process000 = {index: 0, name: '总流程', note: '生产全流程', deviceID: 'btn000'}; 
		sectionDBInsert(process000).then(function(){
			_sections.push(process000);

			sections = _.sortBy(_sections, function(_section){return _section.index});
			_initialSectionSettings(sections);

		}).catch(function(error){
			console.log(('sys error : ' + error.message).error);
		})
	}else{
		sections = _.sortBy(_sections, function(_section){return _section.index});
		console.log('sections => '.data);
		console.dir(sections);
		_initialSectionSettings(sections);
	}	
}
function _initialSectionSettings(_sections){
	sectionSettings = _.map(_sections, function(_section){
		return {index: _section.index, deviceID: _section.deviceID, name: _section.name, timeConsumed: 0, startStamp: 0, endStamp: 0, startTime: '', endTime: '', lastSection: false, firstSection: false};
	});
	var maxIndexSection = _.max(sectionSettings, function(_p){return _p.index;});
	if(maxIndexSection != null && maxIndexSection.index > 0){
		_.findWhere(sectionSettings, {index: maxIndexSection.index}).lastSection = true;
	}
	var minIndexSection = _.min(sectionSettings, function(_s){return _s.index;});
	if(minIndexSection != null && minIndexSection.index > 0){
		_.findWhere(sectionSettings, {index: minIndexSection.index}).firstSection = true;
	}
	console.log('sectionSettings =>'.data);
	console.dir(sectionSettings);
}
//传入信息，开始处理
function _updateProcessState(_msg){
	if(_msg.flag == 'btn000'){
		if(_msg.state == 'on'){
			_resetTotalProcessInfo();
			_setTotalProcessStartInfo();
		}else if(_msg.state == 'off'){
			if(!_checkProcessStartNormally()){
				_resetTotalProcessInfo();
				return;
			}
			_setTotalProcessStopInfo();

			console.log(('整个流程 from ' + totalProcessStartTime + ' to ' + totalProcessStopTime).info);
			console.log(('共耗时 ' + (totalProcessStopStamp - totalProcessStartStamp)/1000 + ' 秒').info);
		}
		return; 
	}else{
		if(_checkProcessStartNormally() == false) return;//流程没有开始
	}

	var sectionSetting = _.findWhere(sectionSettings, {deviceID: _msg.flag});
	if(sectionSetting != null){
		if(_msg.state == 'on'){
			sectionSetting.startStamp = _msg.stamp;
			sectionSetting.startTime = _msg.time;
			console.log((sectionSetting.name + ' 开始于 ' + sectionSetting.startTime).info);
		}else if(_msg.state == 'off'){
			if(sectionSetting.startStamp <= 0) return;//直接从开始状态进入的
			sectionSetting.endStamp = _msg.stamp;
			sectionSetting.endTime = _msg.time;
			sectionSetting.timeConsumed = sectionSetting.endStamp - sectionSetting.startStamp;
			console.log((sectionSetting.name + ' from ' + sectionSetting.startTime + ' to ' + sectionSetting.endTime).info);
			console.log(('共耗时 ' + sectionSetting.timeConsumed/1000 + ' 秒').info);

			if(sectionSetting.lastSection == true){
				console.log('A plan complted!!'.info);
				ep.emit('productionPlanComplted');
			}
		}
	}
	// console.dir(sectionSetting);
}
function _resetTotalProcessInfo(){
	bTotalProcessRunning = false;
	totalProcessStartTime = '';
	totalProcessStartStamp = 0;
	totalProcessStopTime = '';
	totalProcessStopStamp = 0;	
}
function _setTotalProcessStartInfo(){
	bTotalProcessRunning = true;
	var time = timeFormater();
	totalProcessStartStamp = time.stamp;
	totalProcessStartTime = time.formated;	
	console.log(('生产流程开始  ' + totalProcessStartTime).info);
}
function _setTotalProcessStopInfo(){
	bTotalProcessRunning = false;
	var time = timeFormater();
	totalProcessStopStamp = time.stamp;
	totalProcessStopTime = time.formated;	
}
// 是否按照正常流程开始
function _checkProcessStartNormally(){
	if(bTotalProcessRunning == false || totalProcessStartStamp <= 0){
		return false;
	}
	return true;
}





