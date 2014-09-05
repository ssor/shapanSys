
/*
 * GET home page.
 */
var timeFormater = require('./timeFormat').getCurrentTimeCombining;
var _ = require("underscore");

require('./orderSimulation');
require('./productionPlan');
var deviceControl = require('./deviceControl');
var productionProcess = require('./productionProcess');

// ep.emit('startRunningProcess');

exports.index = function(req, res){
	// console.log('main =>'.error)
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
exports.getRandomSaying = function(req, res){
	var r = _.random(0, 14);
	var saying = _.findWhere(sayingsStore, {index: r});
	res.send(JSON.stringify(saying));
}

var sayingsStore = [
	{index: 0, author: '——詹姆斯·P·沃麦克(美国麻省理工学院商学院院长)', content: '没有精益，戴尔不可能超越IBM；没有精益，丰田不可能取代通用'},
	{index: 1, author: '——张瑞敏(海尔集团董事局主席)', content: '精益生产已经不仅仅是一个管理方法，更变成了一种企业文化'},
	{index: 2, author: '——杨绵绵(海尔集团总裁)', content: '现在不是用不用精益生产的问题，而是怎么彻底使用的问题'},
	{index: 3, author: '——梁昭贤(格兰仕总裁)', content: '学习丰田精益生产是格兰仕的必由之路'},
	{index: 4, author: '——大野耐一（丰田副社长）', content: '如果亨利·福特一世仍然在世的话，他必定会采取类似于丰田精益生产方式的管理模式'},
	{index: 5, author: '——程远（《中国青年报》汽车周刊主编、国务院国家突出贡献专家）', content: '丰田汽车公司在国际市场竞争中成功的秘诀之一，就是开创了一种全新的管理模式——精益生产方式'},
	{index: 6, author: '——齐二石（天津大学管理学院院长、教授）', content: '我们虚心地研究精益生产，最终的愿望是将来超越丰田生产模式，创造、振兴自己的CPS'},
	{index: 7, author: '——孟嗣宗（中国汽车工程学会汽车技术教育分会理事长）', content: '精益生产使得丰田汽车在全世界获得成功。从更高的意义上说，丰田生产方式代表了一种崇尚创新的企业文化和企业精神'},
	{index: 8, author: '——何光远(前机械工业部部长)', content: '不久的将来，中国将是精益的世界'},
	{index: 9, author: '——胡茂元(上汽股份总裁)', content: '你现在不用精益，将来您的竞争对手会提醒您使用精益，因为精益生产已经成为一种趋势'},
	{index: 10, author: '——谭旭光（潍柴股份董事长）', content: '推行精益管理，是中国制造业转变经济增长方式，参与全球化竞争的必然选择，是中国由“制造大国”发展成为“制造强国”的必经之路'},
	{index: 11, author: '——张进忠（慧润咨询项目总监）', content: '如果您现在使用了精益生产，您将领先于您所在的行业，您将成为该行业的冠军'},
	{index: 12, author: '——藤本隆宏（东京大学经济系教授）', content: '精益生产方式的最高层次就是“在为解决出现的问题而反复作业期间，没有发现问题会产生不安，大家都拼命地发现问题”'},
	{index: 13, author: '——Stephen J·Spear（哈佛商学院教授）', content: '丰田公司保持持续增长，支撑这一成长的生产模式，现在已经引起世界关注，世界各大公司都在不遗余力地对其进行研究和分析'},
	{index: 14, author: '——美国麻省理工学院“国际汽车计划组织(IMVP)', content: '西方的汽车制造商在汽车生产的各个阶段，均采用丰田生产方式中的精益化原理'}
];
/*function initialWisdomSayings(){
	sayingDBFind({}).then(function(_sayings){
		if(_.size(_sayings) <= 0){

		}
		sayingsStore = _sayings;
	})
}
*/
