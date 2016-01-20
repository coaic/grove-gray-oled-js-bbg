"use strict";
var 
    Promise = require('promise'),
    async = require('async'),
    res = require("./res"),
    OledFont = require('oled-font-5x7'),
    OLED = require("../oled");

Date.prototype.format = function(fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, // 
        "d+": this.getDate(), //
        "h+": this.getHours(), //
        "m+": this.getMinutes(), //
        "s+": this.getSeconds(), //
        "q+": Math.floor((this.getMonth() + 3) / 3), //
        "S": this.getMilliseconds() //
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}


// wiringPiSetup();
var screen = new OLED({
    width: 96,
    height: 96,
    // canvas: res.splash,
    fps: 0
    });
    // }),
    // ct = screen.getContext("2d");

function processPromise(promise, cb) {
    setTimeout(function() {
        promise
            .then(function(results) { cb(null, results); })
            .catch(function(err) { cb(err, "promise rejected"); }); }, 0);
}

// setInterval(function() {
// //setTimeout(function() {
// 	var now = new Date;
//     ct.clear();
// 	ct.font = "04b03 16pt",
//     ct.fillText(now.format("yyyy-MM-dd"), 0, 40);
// 	ct.font = "04b03b 24pt",
// 	//ct.font = "bmkitchen 20pt",
//     //ct.fillText(now.format("hh:mm:ss"), 0, 64);
//     //ct.fillText("00:00:00", 0, 64);
//     //ct.fillText("00:00", 0, 64);
// 	//ct.font = "04b03b 64pt",
//     ct.fillText(now.format("hh:mm:ss"), 0, 64, 128);
//     screen.display();
// }, 1000);

// screenCleared = new Promise(function(resolve, reject) {
//     screen.init(function() {
//     	var now = new Date;
//     //     ct.clear();
//     // 	ct.font = "Courier 16pt",
//     //     ct.fillText(now.format("yyyy-MM-dd"), 0, 40);
//     // 	ct.font = "04b03b 24pt",
//     //     ct.fillText(now.format("hh:mm:ss"), 0, 64, 128);
//         screen.clearDisplay(true, function(err, results) {
//             console.log(".....frame buffer cleared");
//             if (err)
//                 reject(err);
//             else
//                 resolve(results);
//         });
//         return;
//         screen.writeString("Courier 16pt", 16, now.format("yyyy-MM-dd"), true, true)
//         screen.display();
//     });
// });

async.series([
    function(cb) {
        processPromise(screen.init(), cb);
    },
    function(cb) {
        console.log(".....clear screen");
        processPromise(screen.clearDisplay(true), cb);
    },
    function(cb) {
        console.log(".....draw bitmap of Seeed logo")
        processPromise(screen.drawBitmap(res.splash, true), cb);
    },
    function(cb) {
        setTimeout(function() {
            cb(null, "complete");
            }, 1000);
    },
    function(cb) {
        console.log(".....clear screen");
        processPromise(screen.clearDisplay(true), cb);
    },
    function(cb) {
        console.log(".....display arbitrary text");
        screen.setCursor(1, 1);
        processPromise(screen.writeString(OledFont, 1, 'Cats and dogs are really cool animals, you know.', 1, true, true), cb);
    },
    function(cb) {
        screen.setCursor(1, 50);
        processPromise(screen.writeString(OledFont, 1, 'Next screen should display orthogonal lines', 1, true, true), cb);
    },
    function(cb) {
        setTimeout(function() {
            cb(null, "complete");
            }, 1000);
    },
    function(cb) {
        console.log(".....draw diagonal lines");
        screen.clearBuffer();
        processPromise(screen.drawLine(0, 0, 95, 95, 1, true), cb);
    },
    function(cb) {
        processPromise(screen.drawLine(0, 95, 95, 0, 1, true), cb);
    },
    function(cb) {
        setTimeout(function() {
            cb(null, "complete");
            }, 1000);
    },
    function(cb) {
        console.log(".....draw two overlapping filled rectangles, followed by two non overlapping filled rectangles");
        screen.clearBuffer();
        processPromise(screen.fillRect(5, 10, 20, 30, 1, false), cb);
    },    
    function(cb) {
        processPromise(screen.fillRect(15, 30, 30, 20, 1, false), cb);
    },
        function(cb) {
        processPromise(screen.fillRect(60, 30, 20, 25, 1, false), cb);
    },
        function(cb) {
        processPromise(screen.fillRect(40, 60, 15, 30, 1, true), cb);
    }    
    ],
    function(err, results) {
        if (err) {
            console.trace("async.series failed " + err);
        } else {
            console.log("All promises completed..... ");
        }
        
    }
);
return;

// ['exit', 'SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'].forEach(function(element, index, array) {
//     process.on(element, function() {
//         // screen.off();
//         console.log("....Clock exiting on Signal");
//         process.exit(1);
//     });
// });
