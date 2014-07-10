
var http = require('http');
var WebSocketServer = require('ws').Server;
var _ = require("underscore");
var querystring = require('querystring');
var url = require('url');

var server;
var wss;
var clients = [];

ep.tail('broadcastInfo', broadcastInfo);

function broadcastInfo(data){
	console.log('broadcastInfo =>'.data);
	console.log(data);
	_.chain(clients).where({url: data.url}).each(function(_client){
		var str = JSON.stringify(data);
        _client.ws.send(str);
	})
	// var filteredClients = _.where(clients, {url: data.url}).
	// _.each(clients, function(_client){
 //        if(_client.classID == data.classID){
	// 		var str = JSON.stringify([data.tucao]);
	// 		console.log('=> client: '+_client.classID + ' data: '+ str);
	//         _client.ws.send(str);
 //        }
	// 	// _client.send(JSON.stringify([data.tucao]));
	// });	
}
exports.startWebSocketServer = function(app){

	server = http.createServer(app);
	wss = new WebSocketServer({server : server});
	// console.log('wss ok =>'.data);
	wss.on('connection', function(ws){
	    console.log('new websocket connected'.info);
	    console.log('url: ' + ws.upgradeReq.url.data);// 
	    // var obj = url.parse(ws.upgradeReq.url, true);
	    if(ws.upgradeReq.url != null){
			clients.push({ws: ws, url: ws.upgradeReq.url});
	    	switch(ws.upgradeReq.url){
	    		case deviceConfig:
	    	// 		console.dir(serialPortList);
	    	// 		_.chain(serialPortList).where({added: true})
	    	// 		.each(function(_serialPort){
						// ep.emit('broadcastInfo', {flag: _serialPort.portNickName, btnName: _serialPort.flag, cmd: 'added', state: "on", url: deviceConfig});
	    	// 		});
		    		ep.emit('scanDeviceChange');
	    		break;
	    		case addProcessIndex:
	    			ep.emit('scanAllDevices');
	    		break;
	    	}
	    }else{
	    	console.log('error => startWebSocketServer: the url is not recognized!'.error)
	    	return;
	    }
	  //   if(obj != null && obj.query.hasOwnProperty('request') && obj.query.request != null){
		 //    console.log(('new request : ' + obj.query.request).data);
			// clients.push({ws: ws, classID: obj.query.user, url: ws.upgradeReq.url});
	  //   }
		
		// clients.push(ws);
		
	    // 连接成功后
		// ws.on('open', function(){
		//     console.log('ws open'.info);
		//   });
		
		ws.on('message', function(msg){
		    console.log('message => '+ msg);
		    // var objMsg  = JSON.parse(msg);

		  });
		
		ws.on('close', function(){
			console.log('ws close =>'.warn);
		    clients = _.filter(clients, function(_client){
		    	// return _client.ws != ws;
				return _client.url != ws.upgradeReq.url;
		    });
		    // var index = clients.indexOf(ws);
		    // if(index >= 0){
			    // clients.splice(index, 1);
			    // console.log('close =>'.warn);
		    // }
		  });
		  
		});	
	
	return server;
}




