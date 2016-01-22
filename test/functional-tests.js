"use strict";
var 
    Promise = require('promise'),
    async = require('async'),
    res = require("./res"),
    OledFont = require('oled-font-5x7'),
    OLED = require("../oled"),
//
// Create screen management object
//
    screen = new OLED({
    width: 96,
    height: 96,
    address: 0x3C,
    // canvas: res.splash,
    fps: 0
    });

function processPromise(promise, cb) {
    setTimeout(function() {
        promise
            .then(function(results) { cb(null, results); })
            .catch(function(err) { cb(err, "promise rejected"); }); }, 0);
}

async.series([
    function(cb) {
        processPromise(screen.init(), cb);
    },
    function(cb) {
        console.log(".....clear screen");
        processPromise(screen.clearDisplay(true), cb);
    },
        function(cb) {
        console.log(".....dim OLED display");
        processPromise(screen.dimDisplay(true), cb);
    },
    function(cb) {
        console.log(".....draw bitmap of Seeed logo")
        processPromise(screen.drawBitmap(res.splash, true), cb);
    },
        function(cb) {
        console.log(".....undim OLED display");
        processPromise(screen.dimDisplay(false), cb);
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
        setTimeout(function() { cb(null, "complete"); }, 1000);
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
    },
    function(cb) {
        console.log(".....turn OLED display off for 10 seconds");
        processPromise(screen.setEnableDisplay(false), cb);
    },
    function(cb) {
        setTimeout(function() { cb(null, "complete"); }, 10000);
    },
    function(cb) {
        console.log(".....turn OLED display on");
        processPromise(screen.setEnableDisplay(true), cb);
    },
    function(cb) {
        console.log(".....dim OLED display for 10 seconds");
        processPromise(screen.dimDisplay(true), cb);
    },
    function(cb) {
        setTimeout(function() { cb(null, "complete"); }, 10000);
    },
    function(cb) {
        console.log(".....undim OLED display");
        processPromise(screen.dimDisplay(false), cb);
    },
    function(cb) {
        console.log(".....invert OLED display for 10 seconds");
        processPromise(screen.invertDisplay(true), cb);
    },
    function(cb) {
        setTimeout(function() { cb(null, "complete"); }, 10000);
    },
    function(cb) {
        console.log(".....uninvert OLED display");
        processPromise(screen.invertDisplay(false), cb);
    },
    function(cb) {
        console.log(".....start horizontal scroll right");
        processPromise(screen.startScroll('right', [20, 60], [30, 80]), cb);
    },
    function(cb) {
        console.log(".....display scrolling for 30 seconds");
        setTimeout(function() { cb(null, "complete"); }, 30000);
    },
    function(cb) {
        console.log(".....stop horizontal scroll");
        processPromise(screen.stopScroll(), cb);
    },
    function(cb) {
        console.log(".....draw rectangles to screen buffer without updating GRAM");
        screen.clearBuffer();
        processPromise(screen.fillRect(10, 10, 39, 25, 1, false), cb);
    },
    function(cb) {
        processPromise(screen.fillRect(40, 60, 15, 30, 1, false), cb);
    },
    function(cb) {
        console.log(".....sync screen buffer to GRAM");
        processPromise(screen.update(), cb);
    },
    function(cb) {
        setTimeout(function() { cb(null, "complete"); }, 10000);
    },
    function(cb) {
        console.log(".....turn off display");
        processPromise(screen.setEnableDisplay(false), cb);
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
