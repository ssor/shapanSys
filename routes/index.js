
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
// var serialPortName = '/dev/ttyUSB0';
// var serialPortName = '/dev/ttyACM0';
// var serialPortName = '/dev/tty.usbmodem1421';
// var serialPortName = '/dev/cu.usbmodem1421';
// var destIP = '';
// var destIP = '192.168.48.109';
// var destPort = 10000;
// var destPort = 5301;
// var data = '';
// var port = null;


exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};
exports.orderSimulation = function(req, res){
	ep.emit('startOrderSimulation');
	res.render('index', { title: 'Express' });
}

// exports.parseSingleCmd = parseSingleCmd;
// exports.parseMultyCmds = parseMultyCmds;

processSettings.push({flag: 'btn000', processName: 'Total Process', timeConsumed: 0, startStamp: 0, endStamp: 0, startTime: '', endTime: ''});
processSettings.push({flag: 'btn001', processName: 'Section1', timeConsumed: 0, startStamp: 0, endStamp: 0, startTime: '', endTime: ''});
processSettings.push({flag: 'btn002', processName: 'Section2', timeConsumed: 0, startStamp: 0, endStamp: 0, startTime: '', endTime: ''});


// var portsInSys = shell.ls('/dev/cu.usbmodem*');//mac
var portsInSys = _.union(shell.ls('/dev/ttyUSB*'), shell.ls('/dev/ttyACM*'));//linux
console.dir(portsInSys);
_.each(portsInSys, function(_portName){
	serialPortList.push({portName: _portName, port: null, data: ''});
})
// ep.tail('epc', function(_epc){
// 	var client = dgram.createSocket("udp4");
// 	console.log(('will copy to '+ destIP + ':'+destPort).data);
// 	var msg = '['+ flag + ',' + _epc + ']';
// 	client.send(msg, 0, msg.length, destPort, destIP, function(err, bytes) {
// 	  client.close();
// 	});
// });
ep.tail('startRead', handleInput);
process.on('exit', function(){
	console.log('exit ...');
});
read('input something: ');
start();

setInterval(checkReaderState, 5000);

function start(){
	_.each(serialPortList, _startSinglePort);

	// console.log('initialized serialPort ' + serialPortName + ' ...');
	// var checkState = ['AA', '02', '00', '55'];
	// var startInventory = ['AA', '03', '11', '03', '55'];
	// var array = [];
	// for(var i = 0; i < startInventory.length; i++){
	// 	array[i] = parseInt(startInventory[i], 16);
	// }
	// console.log(array);	
	// var buffer = new Buffer(array);
	// console.log(buffer);
	// port.write(buffer);	
}
function _startSinglePort(_serialPort){
		if(_serialPort.port != null) return;
		_serialPort.port = new SerialPort({serialPort:_serialPort.portName, baudRate: 9600});
		_serialPort.port.initialize();
		_serialPort.port.on('error', function(){
			console.log('reader error'.error);
			_serialPort.port = null;
		});
		_serialPort.port.on('close', function(){
			console.log('reader close'.error);
			_serialPort.port = null;
		});	
		_serialPort.port.on("data", function(chunk) {
		    // console.log("Incoming:", chunk);
		    var tempData = chunk.toString('ascii');//if chunk is transfered from string
		    // var tempData = chunk.toString('hex');
		    _serialPort.data += tempData;
			var msges = parseMultyCmds(_serialPort.data);
			_.each(msges, _updateProcessState);
		    // console.dir(matches);
		    var lastIndex = _serialPort.data.lastIndexOf(']');
		    if(lastIndex >= 0){
			    _serialPort.data = _serialPort.data.substr(lastIndex + 1);
			    // console.log('after =>  ' + data);
		    }
		    // data = parseMultyCmds(data);
		});			
}
function _updateProcessState(_msg){
	var processSetting = _.findWhere(processSettings, {flag: _msg.flag});
	if(processSetting != null){
		if(_msg.state == 'on'){
			processSetting.startStamp = _msg.stamp;
			processSetting.startTime = _msg.time;
		}else if(_msg.state == 'off'){
			processSetting.endStamp = _msg.stamp;
			processSetting.endTime = _msg.time;
			processSetting.timeConsumed = processSetting.endStamp - processSetting.startStamp;
			console.log(processSetting.processName + ' from ' + processSetting.startTime + ' to ' + processSetting.endTime);
			console.log('共耗时 ' + processSetting.timeConsumed/1000 + ' 秒');
		}
	}
	// console.dir(processSetting);
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
function checkReaderState(){
	_.each(serialPortList, _startSinglePort);
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


function parseSingleCmd(_cmd){
    // console.log('=> ' + _cmd);
    //clear ff
    _cmd = _cmd.replace(/ffff/g, 'ff');
    // console.log('=> ' + _cmd);

    _cmd = _cmd.replace(/ffaa/g, 'aa');
    // console.log('=> ' + _cmd);

    _cmd = _cmd.replace(/ff55/g, '55');
    console.log('=> ' + _cmd);

    // standard cmd string 
    // if(_cmd.length == 38)
    {
    	console.log('_cmd.indexOf(aa) = ' + _cmd.indexOf('aa'));
    	console.log('_cmd.lastIndexOf(55) = ' + _cmd.lastIndexOf('55'));
    	console.log('_cmd.length = ' + _cmd.length);
    		
        if((_cmd.indexOf('aa') == 0) && (_cmd.lastIndexOf('55') == (_cmd.length -2))){
            var epc = _cmd.substr(12, _cmd.length - 14);
            console.log(epc);
            ep.emit('epc', epc);
            return epc;
        }
    }
    return null;
}
