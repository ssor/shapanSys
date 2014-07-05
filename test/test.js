require("should");
var _ = require("underscore");
// _.str = require('underscore.string');
var index = require('../routes/index');

var rawInfo1 = "aa1111003000300833B2DDD906C00101010155";
var rawInfo2 = "aa1111003000300833B2DDD906C00101ffaa0255";
var rawInfo3 = "aa1111003000300833B2DDD9ffffC0ffff01ffaa0255";
var rawInfo4 = "aa1111003000300833B2DDD906C00101ff550355";
var rawInfo5 = "aa1111003000300833B2DDD906C0010101ff5555";
var rawInfo6      = "aa111";
var longRawInfo = rawInfo1 + rawInfo2 + rawInfo3 + rawInfo4 + rawInfo5 + rawInfo6;
                 


describe("Parse => ", function() {
    it("This parse an item", function() {
        // return;
        var epc = index.parseSingleCmd(rawInfo1);
        console.log('epc => ' + epc);
        (epc == '300833B2DDD906C001010101').should.be.true;

        var epc = index.parseSingleCmd(rawInfo2);
        console.log('epc => ' + epc);
        (epc == '300833B2DDD906C00101aa02').should.be.true;

        var epc = index.parseSingleCmd(rawInfo3);
        console.log('epc => ' + epc);
        (epc == '300833B2DDD9ffC0ff01aa02').should.be.true;

        var epc = index.parseSingleCmd(rawInfo4);
        console.log('epc => ' + epc);
        (epc == '300833B2DDD906C001015503').should.be.true;

        var epc = index.parseSingleCmd(rawInfo5);
        console.log('epc => ' + epc);
        (epc == '300833B2DDD906C001010155').should.be.true;
    });

    it("parse multi items ", function(){
        var re = index.parseMultyCmds(longRawInfo);

        console.log('lag => ' + re);
        // console.log(r);
        (re == rawInfo6).should.be.true;
    });
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


