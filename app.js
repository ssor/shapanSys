
/**
 * Module dependencies.
 */
eventOrderDeleted = 'orderDeleted';
eventNewOrderComingIn = 'newOrderComingIn';

serialPortList = [];
sectionSettings = [];
sections = [];//游戏流程的缓存
productTypeList = 
        [{index: 1, name: '型号一', totalCount: 0}, 
          {index: 2, name: '型号二', totalCount: 0}, 
          {index: 3, name: '型号三', totalCount: 0}];
deviceConfig = '/deviceConfig';
addProcessIndex = '/addProcessIndex';
processConfigIndex = '/processConfigIndex';
planConfigIndex = '/planConfigIndex';
barchartsIndex = '/barchartsIndex';
piechartsIndex = '/piechartsIndex';



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
Q                  = require('q');
var Datastore          = require('nedb');
var orderDB      = new Datastore({ filename: 'order.db', autoload: true });
orderDBFind = Q.nbind(orderDB.find, orderDB);
orderDBRemove = Q.nbind(orderDB.remove, orderDB);
orderDBInsert = Q.nbind(orderDB.insert, orderDB);
orderDBUpdate = Q.nbind(orderDB.update, orderDB);

var sectionDB      = new Datastore({ filename: 'section.db', autoload: true });
sectionDBFind = Q.nbind(sectionDB.find, sectionDB);
sectionDBRemove = Q.nbind(sectionDB.remove, sectionDB);
sectionDBInsert = Q.nbind(sectionDB.insert, sectionDB);
sectionDBUpdate = Q.nbind(sectionDB.update, sectionDB);

var planDB      = new Datastore({ filename: 'plans.db', autoload: true });
planDBFind = Q.nbind(planDB.find, planDB);
planDBRemove = Q.nbind(planDB.remove, planDB);
planDBInsert = Q.nbind(planDB.insert, planDB);
planDBUpdate = Q.nbind(planDB.update, planDB);




var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var wsServer = require('./routes/wsServer');
var productionProcess = require('./routes/productionProcess');
var orderSimulation = require('./routes/orderSimulation');
var productionPlan = require('./routes/productionPlan');
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
app.get('/barchartsIndex', routes.barchartsIndex);
app.get('/piechartsIndex', routes.piechartsIndex);
app.get('/productionData4BarChart', routes.productionData4BarChart);
app.get('/productionData4PieChart', routes.productionData4PieChart);
// app.get('')
// app.get('/deviceConfig', routes.deviceConfig);
// app.get('/getBindedDevices', routes.getBindedDevices);
// app.get('/resetDeviceConfig', routes.resetDeviceConfig);
app.get('/productTypeList', routes.productTypeList);

app.get('/processConfigIndex', productionProcess.processConfigIndex);
app.get('/addProcessIndex', productionProcess.addProcessIndex);
app.post('/addProcessInfo', productionProcess.addProcessInfo);
app.post('/deleteProcessConfig', productionProcess.deleteProcessConfig);
app.get('/processList', productionProcess.processList);
app.get('/runningIndex', productionProcess.runningIndex);



app.get('/orderConfigIndex', orderSimulation.orderConfigIndex);
app.get('/orderList', orderSimulation.orderList);
app.get('/orderAutoIndex', orderSimulation.orderAutoIndex);
app.post('/resetOrderSetting', orderSimulation.resetOrderSetting);
app.get('/addOrderIndex', orderSimulation.addOrderIndex);
app.post('/addOrder', orderSimulation.addOrder);
app.post('/deleteOrder', orderSimulation.deleteOrder);
// app.get('/configButtons', routes.configButtons);
// app.get('/configButtonOK', routes.configButtonOK);

app.get('/planConfigIndex', productionPlan.planConfigIndex);
app.get('/planList', productionPlan.planList);
app.get('/addPlanIndex', productionPlan.addPlanIndex);
app.post('/addPlan', productionPlan.addPlan);
app.post('/deletePlan', productionPlan.deletePlan);
app.get('/enableAutoPlan', productionPlan.enableAutoPlan);
app.post('/setMinProductionQuantity', productionPlan.setMinProductionQuantity);
app.get('/disableAutoPlan', productionPlan.disableAutoPlan);
app.get('/planAutoSettingIndex', productionPlan.planAutoSettingIndex);



server.listen(app.get('port'), function(){
  console.log('ShaPan server listening on port ' + app.get('port'));
});
