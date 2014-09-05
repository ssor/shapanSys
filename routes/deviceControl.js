
/*
 * GET home page.
 */
var timeFormater 	   = require('./timeFormat').getCurrentTimeCombining;
var _ = require("underscore");
var dgram = require("dgram");
var SerialPort = require("trivial-port");
var shell = require('shelljs');

// var serialPortName = '/dev/ttyUSB0';
// var serialPortName = '/dev/ttyACM0';
// var serialPortName = '/dev/tty.usbmodem1421';
// var serialPortName = '/dev/cu.usbmodem1421';

exports.prepareSerialPortList = prepareSerialPortList;
exports.startSerialPortListening = startSerialPortListening;
exports.getAllUSBDevices = _getAllUSBDevices;

function prepareSerialPortList(){
	_.each(_getAllUSBDevices(), function(_portName){
		if(_.findWhere(serialPortList, {portName: _portName}) == null){
			serialPortList.push({portName: _portName, port: null, data: '', added: false, flag: null, handlers: []});
		}
	});	
}

function startSerialPortListening(_serialPortList, _handler){
	// console.dir(_serialPortList);
	_.each(_serialPortList, function(_serialPort){
		if(!_.contains(_serialPort.handlers, _handler)){
			_serialPort.handlers.push(_handler);
		}
		// _serialPort.handler = _handler;
		if(_serialPort.port == null){
			// if(_serialPort.portName == '/dev/cu.wch ch341 USB=>RS232 14260') return;
			// if(_serialPort.portName == '/dev/cu.wch ch341 USB=>RS232 14250') return;
			// if(_serialPort.portName == '/dev/cu.usbmodem142141') return;
			// if(_serialPort.portName == '/dev/cu.usbmodem14271') return;
			_startSinglePort(_serialPort);
		}
	});



	// console.log('startSerialPortListening ok'.info);
}
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
function _startSinglePort(_serialPort){
	// return;
	console.log('_startSinglePort =>'.info);
	console.dir(_serialPort);
	_serialPort.port = new SerialPort({serialPort:_serialPort.portName, baudRate: 9600});
	_serialPort.port.initialize(function(error){
		console.log('error'.error);
		console.dir(error);
	});

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
		var msges = _parseMultyCmds(_serialPort.data);
		if(_.size(_serialPort.handlers) > 0){
			_.each(msges, function(_msg){
				_.each(_serialPort.handlers, function(_handler){
					_handler(_msg, _serialPort);
				})
			});
		}

	    var lastIndex = _serialPort.data.lastIndexOf(']');
	    if(lastIndex >= 0){
		    console.log(('data to trip =>  ' + _serialPort.data).data);
		    _serialPort.data = _serialPort.data.substr(lastIndex + 1);
	    }
	});	




	// return;

	return;

}
function _getAllUSBDevices(){
	var portsFindInSys = _.union(shell.ls('/dev/cu.usbmodem*'), shell.ls('/dev/cu.*USB*'));//mac
	// var portsFindInSys = _.union(shell.ls('/dev/ttyUSB*'), shell.ls('/dev/ttyACM*'));//linux
	console.log('发现连接有以下设备：'.info);
	// portsFindInSys.push('/dev/cu.Bluetooth-Incoming-Port');
	console.dir(portsFindInSys);
	return portsFindInSys;
}

function _getNewMsg(_raw){
	var len = _raw.length;
	var timeStamp = timeFormater();
	return {flag: _raw.substr(1, 6), state: _raw.substr(8, len - 8 - 1), time: timeStamp.formated, stamp: timeStamp.stamp};
}
function _parseMultyCmds(_rawData){
    var matches = _rawData.match(/\[btn[0-9]{3},\w{1,3}\]/g);
    var msges = _.map(matches, function(_match){
    	console.log(_match.info);
    	var msg = _getNewMsg(_match);
    	console.log((''+ msg).data);
    	return msg;
    });
    return msges;
}


