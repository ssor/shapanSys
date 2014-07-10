
/*
 * GET home page.
 */
var timeFormater 	   = require('./timeFormat').getCurrentTimeCombining;
var _ = require("underscore");
var dgram = require("dgram");
var SerialPort = require("trivial-port");
var shell = require('shelljs');

require('./orderSimulation');
require('./productionPlan');
var productionProcess = require('./productionProcess');
// var serialPortName = '/dev/ttyUSB0';
// var serialPortName = '/dev/ttyACM0';
// var serialPortName = '/dev/tty.usbmodem1421';
// var serialPortName = '/dev/cu.usbmodem1421';


exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};
exports.deviceConfig = function(req, res){
  res.render('deviceConfig');

}
exports.resetDeviceConfig = function(req, res){
	clearAddedDevices();
	res.send('ok');
}
exports.orderSimulation = function(req, res){
	configButtons();
	var addedSerialPortList = _.filter(serialPortList, function(_serialPort){
		return true;
		return _serialPort.added == true;
	})
	startSerialPortListening(addedSerialPortList, productionProcess.updateProcessState);
	ep.emit('startOrderSimulation');
	res.render('index', { title: 'Express' });
}
exports.processConfigIndex = function(req, res){
	res.render('processConfigIndex');
}

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
exports.processList = function(req, res){
	var list = _.map(processes, function(_process){
		if(_process.deviceID.length <= 0) _process.deviceID = "未关联";
		return _process;
	})
	res.send(JSON.stringify({data: list}));
}
exports.addProcessInfo = function(req, res){
	var body = req.body;
	var index = parseInt(body.index);
	console.dir(body);
	// console.dir(_.findWhere(processes, {index: index}));

	var b = index > 0 && _.findWhere(processes, {index: index}) == null;
	if(b == false){
		res.send(JSON.stringify({code: 1, message: '流程编号不能小于1，并且不能和现有流程的编号相同！'}));
		return;
	}
	b = body.deviceID = null && body.deviceID.length > 0;
	if(b == false){
		res.send(JSON.stringify({code: 1, message: '尚未与设备绑定！'}));
		return;
	}
	body.note = (body.note == null)? '':body.note;
	processes.push({index: index, name: body.name, note: body.note, deviceID: body.deviceID});//to db
	console.dir(processes);
	res.send(JSON.stringify({code: 0}));
}
exports.deleteProcessConfig = function(req, res){
	console.dir(req.body);
	var index = req.body.index;
	processes = _.filter(processes, function(_process){return _process.index != index});// to db
	console.dir(processes);
	res.send(JSON.stringify({code: 0}));
}
exports.addProcessIndex = function(req, res){
	res.render('addProcessIndex');
}
deviceConfigDBFind({}).then(function(_configs){
	if(_.size(_configs) > 0){
		_.each(_configs, function(_config){
			serialPortList.push({portName: _config.portName, portNickName: _config.portNickName, port: null, data: '', added: true, flag: null});
		})
	}
})
ep.tail('scanDeviceChange', scanDeviceChange);
ep.tail('scanAllDevices', scanAllDevices);

processSettings.push({flag: 'btn000', processName: 'Total Process', timeConsumed: 0, startStamp: 0, endStamp: 0, startTime: '', endTime: ''});
processSettings.push({flag: 'btn001', processName: 'Section1', timeConsumed: 0, startStamp: 0, endStamp: 0, startTime: '', endTime: '', lastProcess: false});
processSettings.push({flag: 'btn002', processName: 'Section2', timeConsumed: 0, startStamp: 0, endStamp: 0, startTime: '', endTime: '', lastProcess: true});

// start();
// setInterval(checkReaderState, 5000);

//监测串口有没有变化，如果有变化，说明设备发生了变化
function scanDeviceChange(){
	return;
	var _portsFindInSys = getAllUSBDevices();
	var b = _.every(serialPortList, function(_serialPort){
		return _.contains(_portsFindInSys, _serialPort.portName) == true;
	});
	if(b == false){
		ep.emit('broadcastInfo', {url: deviceConfig, type: 'deviceChanged'});
	}
	configButtons()
}
function scanAllDevices(){
	_.each(getAllUSBDevices(), function(_portName){
		if(_.findWhere(serialPortList, {portName: _portName}) == null){
			serialPortList.push({portName: _portName, port: null, data: '', added: false, flag: null});
		}
	});
	startSerialPortListening(serialPortList, function(_msg, _port){
		var serialPort = _.findWhere(serialPortList, {portName: _port.portName});
		if(serialPort == null){
			console.log('sys error!!'.error);
		}else{
			serialPort.flag = _msg.flag;
			console.log(('监测到按钮 ' + _msg.flag + ' 被触发').info);
			ep.emit('broadcastInfo', {btnName: _msg.flag, state:_msg.state, url: addProcessIndex});
		}		
	});
}
//开始配置系统相关按钮
function configButtons(){
	console.log('按动按钮，将设备接入到系统中'.info);	

	_.each(getAllUSBDevices(), function(_portName){
		if(_.findWhere(serialPortList, {portName: _portName}) == null){
			serialPortList.push({portName: _portName, port: null, data: '', added: false, flag: null});
		}
	});
	startSerialPortListening(serialPortList, _configButtonMsgHandler);
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
			var portNickName = _port.portName.replace(/\/dev\/cu\./g, '').replace(/\s/g, '_').replace(/=>/g, '_');
			serialPort.portNickName = portNickName;
			deviceConfigDBInsert({portName: _port.portName, portNickName: portNickName});
			ep.emit('broadcastInfo', {flag: _port.portNickName, btnName: _msg.flag, cmd: 'added', state:_msg.state, url: deviceConfig});
		}else{
			console.log(('监测到按钮 ' + _msg.flag + '(' + _port.portName + ') 被触发').info);
			ep.emit('broadcastInfo', {flag: _port.portNickName, btnName: _msg.flag, cmd: 'repeat', state:_msg.state, url: deviceConfig});
		}
	}
}
function startSerialPortListening(_serialPortList, _handler){
	_.each(_serialPortList, function(_serialPort){
		_serialPort.handler = _handler;
		if(_serialPort.port == null){
			_startSinglePort(_serialPort);
		}
	});

/*
	console.log('initialized serialPort ' + serialPortName + ' ...');
	var checkState = ['AA', '02', '00', '55'];
	var startInventory = ['AA', '03', '11', '03', '55'];
	var array = [];
	for(var i = 0; i < startInventory.length; i++){
		array[i] = parseInt(startInventory[i], 16);
	}
	console.log(array);	
	var buffer = new Buffer(array);
	console.log(buffer);
	port.write(buffer);	
*/
}
function _startSinglePort(_serialPort){
	_serialPort.port = new SerialPort({serialPort:_serialPort.portName, baudRate: 9600});
	_serialPort.port.initialize();

	_serialPort.port.on('error', function(){
		console.log('reader error'.error);
		_serialPort.port = null;
	});

	_serialPort.port.on('close', function(){
		console.log('reader close'.warn);
		_serialPort.port = null;
	});	

	_serialPort.port.on("data", function(chunk) {
	    // console.log("Incoming:", chunk);
	    var tempData = chunk.toString('ascii');//if chunk is transfered from string
	    _serialPort.data += tempData;
	    // console.log('Incoming :');
	    // console.log(_serialPort.data);
		var msges = parseMultyCmds(_serialPort.data);
		if(_serialPort.handler != null){
			_.each(msges, function(_msg){
				_serialPort.handler(_msg, _serialPort);
			});
		}
	    var lastIndex = _serialPort.data.lastIndexOf(']');
	    if(lastIndex >= 0){
		    console.log(('data to trip =>  ' + _serialPort.data).data);
		    _serialPort.data = _serialPort.data.substr(lastIndex + 1);
	    }
	});	

}
function getAllUSBDevices(){
	var portsFindInSys = _.union(shell.ls('/dev/cu.usbmodem*'), shell.ls('/dev/cu.*USB*'));//mac
	// var portsFindInSys = _.union(shell.ls('/dev/ttyUSB*'), shell.ls('/dev/ttyACM*'));//linux
	console.log('发现连接有以下设备：'.info);
	console.dir(portsFindInSys);
	return portsFindInSys;
}


function getNewMsg(_raw){
	var len = _raw.length;
	var timeStamp = timeFormater();
	return {flag: _raw.substr(1, 6), state: _raw.substr(8, len - 8 - 1), time: timeStamp.formated, stamp: timeStamp.stamp};
}
function parseMultyCmds(_rawData){
    var matches = _rawData.match(/\[btn[0-9]{3},\w{1,3}\]/g);
    var msges = _.map(matches, function(_match){
    	console.log(_match.info);
    	var msg = getNewMsg(_match);
    	console.dir(msg);
    	return msg;
    });
    return msges;
}
function checkReaderState(){
	_.each(serialPortList, function(_serialPort){
		if(_serialPort.added == true){
			if(_serialPort.port != null) return;
			_startSinglePort(_serialPort);
		}
	});
}

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

