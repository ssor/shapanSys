require("should");
var _ = require("underscore");
// _.str = require('underscore.string');


var orders = [ [ { name: '产品一', quantity: 1 },
    { name: '产品二', quantity: 1 },
    { name: '产品三', quantity: 1 } ],
  [ { name: '产品一', quantity: 1 },
    { name: '产品二', quantity: 1 },
    { name: '产品三', quantity: 0 } ],
  [ { name: '产品一', quantity: 1 },
    { name: '产品二', quantity: 0 },
    { name: '产品三', quantity: 0 } ],
  [ { name: '产品一', quantity: 1 },
    { name: '产品二', quantity: 0 },
    { name: '产品三', quantity: 0 } ],
  [ { name: '产品一', quantity: 1 },
    { name: '产品二', quantity: 3 },
    { name: '产品三', quantity: 4 } ] ];

describe("Parse => ", function() {
    it("parse multi items ", function(){
        return;
        var list = _.map(orders, function(_order){
            var quantities = _.pluck(_order, "quantity");
            var line = {};
            for(var i = 0; i < 3; i++){
                switch(i){
                    case 0:
                        _.extend(line, {"quantity1": quantities[i]});
                    break;
                    case 1:
                        _.extend(line, {"quantity2": quantities[i]});
                    break;
                    case 2:
                        _.extend(line, {"quantity3": quantities[i]});
                    break;
                }
            }
            console.log(line);
            return line;
        })
        console.dir(list);
    });
    it('last ', function(){
        var last = _.last([]);
        console.dir(last);
    })
});

// function parseMultyCmds(_rawData, _temp){
//     if(_temp == null) _temp = '';

//     // console.log('raw=> ' + _rawData);
//     // console.log('temp=>' + _temp);
//     var indexOf55 = _rawData.indexOf('55');
//     // console.log('indexOf55 => ' + indexOf55);
//     if((indexOf55 + _temp.length) >= 36){
//         var left2Charactor = _rawData.substr(indexOf55-2, 2);
//         // console.log("left => " + left2Charactor);
//         if(left2Charactor != 'ff'){
//             // this is a end for item
//             var item = _rawData.substr(0, indexOf55 + 2);
//             // console.log('cmd => ' + _temp + item);
//             // testCmd(_temp + item);
//             parseSingleCmd(_temp + item);
//             var newRawData = _rawData.substr(indexOf55 + 2);
//             // console.log('newRawData => ' +newRawData);
//             parseMultyCmds(newRawData);
//         }else{
//             var sub = _rawData.substr(0, indexOf55 + 2);
//             // console.log('sub        => ' + sub);
//             _temp = _temp + sub;
//             // console.log('newTemp    => ' + _temp);
//             var newRawData = _rawData.substr(indexOf55 + 2);
//             // console.log('newRawData => ' +newRawData);
//             parseMultyCmds(newRawData, _temp);

//         }
//     }else if(indexOf55 >= 0){
//         var sub = _rawData.substr(0, indexOf55 + 2);
//         // console.log('sub        => ' + sub);
//         _temp = _temp + sub;
//         // console.log('newTemp    => ' + _temp);
//         var newRawData = _rawData.substr(indexOf55 + 2);
//         // console.log('newRawData => ' +newRawData);
//         parseMultyCmds(newRawData, _temp);
//     }
// }
function testCmd(_item){
    if(rawInfo1 == _item){
        console.log('rawInfo1 ok');
    }
    if(rawInfo2 == _item){
        console.log('rawInfo2 ok');
    }
    if(rawInfo3 == _item){
        console.log('rawInfo3 ok');
    }
    if(rawInfo4 == _item){
        console.log('rawInfo4 ok');
    }
    if(rawInfo5 == _item){
        console.log('rawInfo5 ok');
    }
}


