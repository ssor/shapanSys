
/*
 * GET home page.
 */
var timeFormater = require('./timeFormat').getCurrentTimeCombining;
var _ = require("underscore");

require('./orderSimulation');
require('./productionPlan');
var productionProcess = require('./productionProcess');
var deviceControl = require('./deviceControl');


exports.index = function(req, res){
  res.render('main');
};
exports.barchartsIndex = function(req, res){
	res.render('barchartsIndex', {categories: ['环节一', '环节二', '环节三']});
}
exports.piechartsIndex = function(req, res){
	res.render('piechartsIndex', {categories: ['环节一', '环节二', '环节三']});

}
exports.productionData4BarChart = function(req, res){
	var data = {};
	data.columns = ['生产批次1'];
	// data.categories = ['环节一', '环节二', '环节三'];
	// console.dir(sectionSettings);
	data.categories = _.without(_.map(sectionSettings, function(_section){return _section.index == 0? null : _section.name}), null);
	_.times(_.size(data.categories), function(){data.columns.push(0)});
	// console.dir(data.categories);
	res.send(JSON.stringify(data));
}
exports.productionData4PieChart = function(req, res){
	var data = {};
	data.columns = _.without(_.map(sectionSettings, function(_section){return _section.index == 0? null : [_section.name, 1]}), null);
	console.dir(data.columns);
	res.send(JSON.stringify(data));
}
exports.productTypeList = function(req, res){
	res.send(JSON.stringify(productTypeList));
}
// exports.deviceConfig = function(req, res){
// 	scanDeviceChange();
//   res.render('deviceConfig');
// }
// exports.getBindedDevices = function(req, res){
// 	var list = _.map(processes, function(_process){
// 		return _process.deviceID;
// 	});
// 	res.send(JSON.stringify(list));
// }
// exports.resetDeviceConfig = function(req, res){
// 	clearAddedDevices();
// 	res.send('ok');
// }




/*
	processDBFind({}).then(function(_configs){
		if(_.size(_configs) > 0){
			_.each(_configs, function(_config){
				serialPortList.push({portName: _config.portName, port: null, data: '', added: true, flag: null});
			})
		}
	})
	var processes =[{
					      index: 1,
					      name: "预制环节",
					      deviceID: "",
					      note: "$320,800"
					    },
					    {
					      index: 2,
					      name: "地盘加工",
					      deviceID: "",
					      note: "三个步骤"
					    }];

	*/			    

// ep.tail('scanDeviceChange', scanDeviceChange);
// ep.tail('scanAllDevices', scanAllDevices);


// start();
// setInterval(checkReaderState, 5000);
/*
//根据各个流程绑定的设备ID，查看设备是否都能连通
function scanDeviceChange(){
	console.log('按动按钮，将设备接入到系统中'.info);	

	_.each(deviceControl.getAllUSBDevices(), function(_portName){
		if(_.findWhere(serialPortList, {portName: _portName}) == null){
			serialPortList.push({portName: _portName, port: null, data: '', added: false, flag: null});
		}
	});
	deviceControl.startSerialPortListening(serialPortList, function(_msg, _port){
		console.log(('监测到按钮 ' + _msg.flag + ' 被触发').info);
		ep.emit('broadcastInfo', {flag: _msg.flag, state:_msg.state, url: deviceConfig});
	});	
}
*/
/*
//传入信息，开始处理
function _configButtonMsgHandler(_msg, _port){
	console.log('_configButtonMsgHandler => ' + _msg);
	var serialPort = _.findWhere(serialPortList, {portName: _port.portName});
	if(serialPort == null){
		console.log('sys error!!'.error);
	}else{
		if(serialPort.added == false){
			console.log(('监测到按钮 ' + _msg.flag + '(' + _port.portName + ') , 将被加入到系统设备中').info);
			serialPort.added = true;
			serialPort.flag = _msg.flag;
			ep.emit('broadcastInfo', {flag: _port.portNickName, btnName: _msg.flag, cmd: 'added', state:_msg.state, url: deviceConfig});
		}else{
			console.log(('监测到按钮 ' + _msg.flag + '(' + _port.portName + ') 被触发').info);
			ep.emit('broadcastInfo', {flag: _port.portNickName, btnName: _msg.flag, cmd: 'repeat', state:_msg.state, url: deviceConfig});
		}
	}
}
//开始配置系统相关按钮
function configButtons(){

}
//设备监测完毕，对不属于本系统的设备解除端口占用
function configButtonOK(){
	_.each(serialPortList, function(_serialPort){
		if(_serialPort.added == false){
			console.log(('将关闭串口 ' + _serialPort.portName).warn);
			_serialPort.port.close();
			_serialPort.port = null;
		}
	})
}
function clearAddedDevices(){
	_.each(serialPortList, function(_serialPort){
		_serialPort.added = false;
		_serialPort.flag = null;
	})
	deviceConfigDBRemove({}, {multi: true}).then(function(_num){
		console.log(_num + ' record(s) deleted!!!'.info);
	})
	// console.log('clearAddedDevices =>');
	// console.dir(serialPortList);
}

function checkReaderState(){
	_.each(serialPortList, function(_serialPort){
		if(_serialPort.added == true){
			if(_serialPort.port != null) return;
			_startSinglePort(_serialPort);
		}
	});
}
*/

/*
function handleInput(_input){
	// console.log(_input);
	if(_input == "123\n"){
		// console.log('try to exit');
		process.exit(1);
	}else{
		// console.log('wrong secret');
	}
	// read('', handleInput);
}

function read(prompt, callback) {
    // process.stdout.write(prompt + ':');
    // process.stdin.resume();
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', function(chunk) {
        // process.stdin.pause();
        // callback(chunk);
        ep.emit('startRead', chunk);
    });
}
*/

