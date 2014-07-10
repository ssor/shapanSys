
/**
 * Module dependencies.
 */

serialPortList = [];
processSettings = [];

deviceConfig = '/deviceConfig';
addProcessIndex = '/addProcessIndex';

var colors = require('colors');

colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});
var EventProxy = require('eventproxy');
ep = new EventProxy();
var Q                  = require('q');
var Datastore          = require('nedb');
var deviceConfigDB      = new Datastore({ filename: 'deviceConfig.db', autoload: true });
deviceConfigDBFind = Q.nbind(deviceConfigDB.find, deviceConfigDB);
deviceConfigDBRemove = Q.nbind(deviceConfigDB.remove, deviceConfigDB);
deviceConfigDBInsert = Q.nbind(deviceConfigDB.insert, deviceConfigDB);
deviceConfigDBUpdate = Q.nbind(deviceConfigDB.update, deviceConfigDB);


var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var wsServer = require('./routes/wsServer');

var app = express();

var server = wsServer.startWebSocketServer(app);


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/deviceConfig', routes.deviceConfig);
app.get('/processConfigIndex', routes.processConfigIndex);
app.get('/addProcessIndex', routes.addProcessIndex);
app.post('/addProcessInfo', routes.addProcessInfo);
app.post('/deleteProcessConfig', routes.deleteProcessConfig);
app.get('/resetDeviceConfig', routes.resetDeviceConfig);
app.get('/orderSimulation', routes.orderSimulation);
app.get('/processList', routes.processList);
// app.get('/configButtons', routes.configButtons);
// app.get('/configButtonOK', routes.configButtonOK);

app.get('/users', user.list);

server.listen(app.get('port'), function(){
  console.log('ShaPan server listening on port ' + app.get('port'));
});
