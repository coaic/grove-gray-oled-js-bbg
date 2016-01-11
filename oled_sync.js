"use strict";
var i2c = require('i2c-bus'),
    async = require('async')
    Promise = require('promise');

var Oled = function(opts) {
  
  this.BasicFont=[[0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00],
                  [0x00,0x00,0x5F,0x00,0x00,0x00,0x00,0x00],
                  [0x00,0x00,0x07,0x00,0x07,0x00,0x00,0x00],
                  [0x00,0x14,0x7F,0x14,0x7F,0x14,0x00,0x00],
                  [0x00,0x24,0x2A,0x7F,0x2A,0x12,0x00,0x00],
                  [0x00,0x23,0x13,0x08,0x64,0x62,0x00,0x00],
                  [0x00,0x36,0x49,0x55,0x22,0x50,0x00,0x00],
                  [0x00,0x00,0x05,0x03,0x00,0x00,0x00,0x00],
                  [0x00,0x1C,0x22,0x41,0x00,0x00,0x00,0x00],
                  [0x00,0x41,0x22,0x1C,0x00,0x00,0x00,0x00],
                  [0x00,0x08,0x2A,0x1C,0x2A,0x08,0x00,0x00],
                  [0x00,0x08,0x08,0x3E,0x08,0x08,0x00,0x00],
                  [0x00,0xA0,0x60,0x00,0x00,0x00,0x00,0x00],
                  [0x00,0x08,0x08,0x08,0x08,0x08,0x00,0x00],
                  [0x00,0x60,0x60,0x00,0x00,0x00,0x00,0x00],
                  [0x00,0x20,0x10,0x08,0x04,0x02,0x00,0x00],
                  [0x00,0x3E,0x51,0x49,0x45,0x3E,0x00,0x00],
                  [0x00,0x00,0x42,0x7F,0x40,0x00,0x00,0x00],
                  [0x00,0x62,0x51,0x49,0x49,0x46,0x00,0x00],
                  [0x00,0x22,0x41,0x49,0x49,0x36,0x00,0x00],
                  [0x00,0x18,0x14,0x12,0x7F,0x10,0x00,0x00],
                  [0x00,0x27,0x45,0x45,0x45,0x39,0x00,0x00],
                  [0x00,0x3C,0x4A,0x49,0x49,0x30,0x00,0x00],
                  [0x00,0x01,0x71,0x09,0x05,0x03,0x00,0x00],
                  [0x00,0x36,0x49,0x49,0x49,0x36,0x00,0x00],
                  [0x00,0x06,0x49,0x49,0x29,0x1E,0x00,0x00],
                  [0x00,0x00,0x36,0x36,0x00,0x00,0x00,0x00],
                  [0x00,0x00,0xAC,0x6C,0x00,0x00,0x00,0x00],
                  [0x00,0x08,0x14,0x22,0x41,0x00,0x00,0x00],
                  [0x00,0x14,0x14,0x14,0x14,0x14,0x00,0x00],
                  [0x00,0x41,0x22,0x14,0x08,0x00,0x00,0x00],
                  [0x00,0x02,0x01,0x51,0x09,0x06,0x00,0x00],
                  [0x00,0x32,0x49,0x79,0x41,0x3E,0x00,0x00],
                  [0x00,0x7E,0x09,0x09,0x09,0x7E,0x00,0x00],
                  [0x00,0x7F,0x49,0x49,0x49,0x36,0x00,0x00],
                  [0x00,0x3E,0x41,0x41,0x41,0x22,0x00,0x00],
                  [0x00,0x7F,0x41,0x41,0x22,0x1C,0x00,0x00],
                  [0x00,0x7F,0x49,0x49,0x49,0x41,0x00,0x00],
                  [0x00,0x7F,0x09,0x09,0x09,0x01,0x00,0x00],
                  [0x00,0x3E,0x41,0x41,0x51,0x72,0x00,0x00],
                  [0x00,0x7F,0x08,0x08,0x08,0x7F,0x00,0x00],
                  [0x00,0x41,0x7F,0x41,0x00,0x00,0x00,0x00],
                  [0x00,0x20,0x40,0x41,0x3F,0x01,0x00,0x00],
                  [0x00,0x7F,0x08,0x14,0x22,0x41,0x00,0x00],
                  [0x00,0x7F,0x40,0x40,0x40,0x40,0x00,0x00],
                  [0x00,0x7F,0x02,0x0C,0x02,0x7F,0x00,0x00],
                  [0x00,0x7F,0x04,0x08,0x10,0x7F,0x00,0x00],
                  [0x00,0x3E,0x41,0x41,0x41,0x3E,0x00,0x00],
                  [0x00,0x7F,0x09,0x09,0x09,0x06,0x00,0x00],
                  [0x00,0x3E,0x41,0x51,0x21,0x5E,0x00,0x00],
                  [0x00,0x7F,0x09,0x19,0x29,0x46,0x00,0x00],
                  [0x00,0x26,0x49,0x49,0x49,0x32,0x00,0x00],
                  [0x00,0x01,0x01,0x7F,0x01,0x01,0x00,0x00],
                  [0x00,0x3F,0x40,0x40,0x40,0x3F,0x00,0x00],
                  [0x00,0x1F,0x20,0x40,0x20,0x1F,0x00,0x00],
                  [0x00,0x3F,0x40,0x38,0x40,0x3F,0x00,0x00],
                  [0x00,0x63,0x14,0x08,0x14,0x63,0x00,0x00],
                  [0x00,0x03,0x04,0x78,0x04,0x03,0x00,0x00],
                  [0x00,0x61,0x51,0x49,0x45,0x43,0x00,0x00],
                  [0x00,0x7F,0x41,0x41,0x00,0x00,0x00,0x00],
                  [0x00,0x02,0x04,0x08,0x10,0x20,0x00,0x00],
                  [0x00,0x41,0x41,0x7F,0x00,0x00,0x00,0x00],
                  [0x00,0x04,0x02,0x01,0x02,0x04,0x00,0x00],
                  [0x00,0x80,0x80,0x80,0x80,0x80,0x00,0x00],
                  [0x00,0x01,0x02,0x04,0x00,0x00,0x00,0x00],
                  [0x00,0x20,0x54,0x54,0x54,0x78,0x00,0x00],
                  [0x00,0x7F,0x48,0x44,0x44,0x38,0x00,0x00],
                  [0x00,0x38,0x44,0x44,0x28,0x00,0x00,0x00],
                  [0x00,0x38,0x44,0x44,0x48,0x7F,0x00,0x00],
                  [0x00,0x38,0x54,0x54,0x54,0x18,0x00,0x00],
                  [0x00,0x08,0x7E,0x09,0x02,0x00,0x00,0x00],
                  [0x00,0x18,0xA4,0xA4,0xA4,0x7C,0x00,0x00],
                  [0x00,0x7F,0x08,0x04,0x04,0x78,0x00,0x00],
                  [0x00,0x00,0x7D,0x00,0x00,0x00,0x00,0x00],
                  [0x00,0x80,0x84,0x7D,0x00,0x00,0x00,0x00],
                  [0x00,0x7F,0x10,0x28,0x44,0x00,0x00,0x00],
                  [0x00,0x41,0x7F,0x40,0x00,0x00,0x00,0x00],
                  [0x00,0x7C,0x04,0x18,0x04,0x78,0x00,0x00],
                  [0x00,0x7C,0x08,0x04,0x7C,0x00,0x00,0x00],
                  [0x00,0x38,0x44,0x44,0x38,0x00,0x00,0x00],
                  [0x00,0xFC,0x24,0x24,0x18,0x00,0x00,0x00],
                  [0x00,0x18,0x24,0x24,0xFC,0x00,0x00,0x00],
                  [0x00,0x00,0x7C,0x08,0x04,0x00,0x00,0x00],
                  [0x00,0x48,0x54,0x54,0x24,0x00,0x00,0x00],
                  [0x00,0x04,0x7F,0x44,0x00,0x00,0x00,0x00],
                  [0x00,0x3C,0x40,0x40,0x7C,0x00,0x00,0x00],
                  [0x00,0x1C,0x20,0x40,0x20,0x1C,0x00,0x00],
                  [0x00,0x3C,0x40,0x30,0x40,0x3C,0x00,0x00],
                  [0x00,0x44,0x28,0x10,0x28,0x44,0x00,0x00],
                  [0x00,0x1C,0xA0,0xA0,0x7C,0x00,0x00,0x00],
                  [0x00,0x44,0x64,0x54,0x4C,0x44,0x00,0x00],
                  [0x00,0x08,0x36,0x41,0x00,0x00,0x00,0x00],
                  [0x00,0x00,0x7F,0x00,0x00,0x00,0x00,0x00],
                  [0x00,0x41,0x36,0x08,0x00,0x00,0x00,0x00],
                  [0x00,0x02,0x01,0x01,0x02,0x01,0x00,0x00],
                  [0x00,0x02,0x05,0x05,0x02,0x00,0x00,0x00]];

  this.HEIGHT = opts.height || 64;
  this.WIDTH = opts.width || 128;
  this.ADDRESS = opts.address || 0x3C;
  this.PROTOCOL = 'I2C';
  
  this.BUS0 = 0,
  this.BUS1 = 1,
  this.BUS2 = 2,

  this.i2c1,

  // create command
  this.SETCOMMANDLOCK = 0xFD;
  this.RESETPROTECTION = 0x12;
  this.DISPLAY_OFF = 0xAE;
  this.DISPLAY_ON = 0xAF;
  this.SET_DISPLAY_CLOCK_DIV = 0xD5;
  this.SET_MULTIPLEX = 0xA8;
  this.SET_DISPLAY_OFFSET = 0xA2;
  this.SET_START_LINE = 0xA1;
  this.VCOMH = 0x08;
  this.SET_VCOMH = 0xBE;
  this.SET_SECOND_PRECHARGE = 0xB6;
  this.SET_ENABLE_SECOND_PRECHARGE = 0xD5;
  this.INTERNAL_VSL = 0x62;
  this.POINT_86_VCC = 0x07;
  this.CHARGE_PUMP = 0x8D;
  this.EXTERNAL_VCC = false;
  this.MEMORY_MODE = 0x20;
  this.SEG_REMAP = 0xA0; 
  this.COM_SCAN_DEC = 0xC8;
  this.COM_SCAN_INC = 0xC0;
  this.SET_COM_PINS = 0xDA;
  this.SET_CONTRAST = 0x81;
  this.SET_PRECHARGE_VOLTAGE = 0xBC;
  this.SET_VCOM_DETECT = 0xDB;
  this.SET_VDD_INTERNAL = 0xAB;
  this.SET_PHASE_LENGTH = 0xB1;
  this.SET_DISPLAY_CLOCK_DIVIDE_RATIO = 0xB3;
  this.SET_LINEAR_LUT = 0xB9;
  // this.DISPLAY_ALL_ON_RESUME = 0xA4;
  this.NORMAL_DISPLAY = 0xA4;
  this.COLUMN_ADDR = 0x15;
  this.ROW_ADDR = 0x75;
  this.INVERT_DISPLAY = 0xA7;
  this.ACTIVATE_SCROLL = 0x2F;
  this.DEACTIVATE_SCROLL = 0x2E;
  this.SET_VERTICAL_SCROLL_AREA = 0xA3;
  this.RIGHT_HORIZONTAL_SCROLL = 0x26;
  this.LEFT_HORIZONTAL_SCROLL = 0x27;
  this.VERTICAL_AND_RIGHT_HORIZONTAL_SCROLL = 0x29;
  this.VERTICAL_AND_LEFT_HORIZONTAL_SCROLL = 0x2A;

  this.cursor_x = 0;
  this.cursor_y = 0;

  // new blank buffer
  this.buffer = new Buffer((this.WIDTH * this.HEIGHT) / 8);
  this.buffer.fill(0x00);

  this.dirtyBytes = [];

  var config = {
    '128x32': {
      'multiplex': 0x1F,
      'compins': 0x02,
      'coloffset': 0
    },
    '128x64': {
      'multiplex': 0x5F,
      'compins': 0x12,
      'coloffset': 0
    },
    '96x16': {
      'multiplex': 0xA8,
      'compins': 0x2,
      'coloffset': 0,
    }
  };

  // Setup i2c
  console.log('this.ADDRESS: ' + this.ADDRESS);
  // this.wire = new i2c(this.ADDRESS, {device: '/dev/i2c-0'}); // point to your i2c address, debug provides REPL interface

  var screenSize = this.WIDTH + 'x' + this.HEIGHT;
  this.screenConfig = config[screenSize];

}

// Oled.prototype.init = function (cb) {
Oled.prototype.init = function () {
  var me = this;
  me._initialise();
}

Oled.prototype._sendData = function (buffer, bufferLen, callback) {
  var count = 0,
      me = this;
  
  async.whilst(
    function() { 
      return count < bufferLen 
    },
    function(cb) {
      me.i2c1.sendByte(me.ADDRESS, buffer[count], function() { 
        count++;
        cb(null, count);
      });
    },
    function(err, n) {
      callback(err, n);
    });
}

Oled.prototype._sendDataByte = function (byte, callback) {
  console.log("..........cmd: " + this.ADDRESS.toString(16) + "; byte: " + byte.toString(16));
  this.i2c1.sendByte(this.ADDRESS, byte, function(err, bytesWritten, buffer) {
            if (err) {
                console.log("I2C Error sending data byte: error: " + err);
                callback(err, "fail");
            } else {
                callback(err, "success");
            }
        });
}

Oled.prototype._sendCommand = function (cmd, trace) {
    var me = this;
    if (trace)
      console.log("..........cmd: " + cmd.toString(16));
    me.i2c1.sendByteSync(me.ADDRESS, cmd);
}

Oled.prototype._setDisplayModeNormal = function (trace) {
    this._sendCommand(this.NORMAL_DISPLAY, trace);
}

Oled.prototype.setDisplayModeNormal = function(trace) {
  var me = this;

  me._setDisplayModeNormal(trace);
}

Oled.prototype._setDisplayModeAllOn = function (trace) {
    this._sendCommand(0xA5, trace);
}

Oled.prototype._setDisplayModeAllOff = function (trace) {
    this._sendCommand(0xA6, trace);
}

Oled.prototype._setDisplayModeInverse = function (trace) {
    this._sendCommand(this.INVERT_DISPLAY, trace);
}

Oled.prototype._setEnableScroll = function (on, trace) {
    if (on)
        this._sendCommand(this.ACTIVATE_SCROLL, trace);
    else
        this._sendCommand(this.DEACTIVATE_SCROLL, trace);
}

Oled.prototype._setEnableDisplay = function (on, trace) {
    if (on) 
        this._sendCommand(this.DISPLAY_ON, trace);
    else
        this._sendCommand(this.DISPLAY_OFF, trace);    
}

Oled.prototype._initialise = function(trace) {

  // sequence of bytes to initialise with
  // var initSeq = [
  //   this.DISPLAY_OFF,
  //   this.SET_DISPLAY_CLOCK_DIV, 0x80,
  //   this.SET_MULTIPLEX, this.screenConfig.multiplex, // set the last value dynamically based on screen size requirement
  //   this.SET_DISPLAY_OFFSET, 0x00, // sets offset pro to 0
  //   this.SET_START_LINE,
  //   this.CHARGE_PUMP, 0x14, // charge pump val
  //   this.MEMORY_MODE, 0x00, // 0x0 act like ks0108
  //   this.SEG_REMAP, // screen orientation
  //   this.COM_SCAN_DEC, // screen orientation change to INC to flip
  //   this.SET_COM_PINS, this.screenConfig.compins, // com pins val sets dynamically to match each screen size requirement
  //   this.SET_CONTRAST, 0x8F, // contrast val
  //   this.SET_PRECHARGE, 0xF1, // precharge val
  //   this.SET_VCOM_DETECT, 0x40, // vcom detect
  //   this.DISPLAY_ALL_ON_RESUME,
  //   this.NORMAL_DISPLAY,
  //   this.DISPLAY_ON
  // ];

  // var i, initSeqLen = initSeq.length;

  // // write init seq commands
  // for (i = 0; i < initSeqLen; i ++) {
  //   this._transfer('cmd', initSeq[i]);
  // }
  var me = this;
  me.i2c1 = i2c.open(me.BUS1);
  me._sendCommand(me.SETCOMMANDLOCK, true);
  me._sendCommand(me.RESETPROTECTION, true);
  me._setEnableDisplay(false, true);
  me._sendCommand(me.SET_MULTIPLEX, true);
  me._sendCommand(me.screenConfig['multiplex'], true);
  me._sendCommand(me.SET_START_LINE, true);
  me._sendCommand(0x00, true);
  me._sendCommand(me.SET_DISPLAY_OFFSET, true);
  me._sendCommand(0x60, true);
  me._sendCommand(me.SEG_REMAP, true);
  me._sendCommand(0x46, true);
  me._sendCommand(me.SET_VDD_INTERNAL, true);
  me._sendCommand(0x01, true);
  me._sendCommand(me.SET_CONTRAST, true);
  me._sendCommand(0x53, true);
  me._sendCommand(me.SET_PHASE_LENGTH, true);
  me._sendCommand(0x51, true);
  me._sendCommand(me.SET_DISPLAY_CLOCK_DIVIDE_RATIO, true);
  me._sendCommand(0x01, true);
  me._sendCommand(me.SET_LINEAR_LUT, true);
  me._sendCommand(me.SET_PRECHARGE_VOLTAGE, true);
  me._sendCommand(me.VCOMH, true);
  me._sendCommand(me.SET_VCOMH, true);
  me._sendCommand(me.POINT_86_VCC , true);
  me._sendCommand(me.SET_SECOND_PRECHARGE, true);
  me._sendCommand(0x01, true);
  me._sendCommand(me.SET_ENABLE_SECOND_PRECHARGE, true);
  me._sendCommand(me.INTERNAL_VSL, true);
  me._setDisplayModeNormal(true);
  me._setEnableScroll(false, true);
  me._setEnableDisplay(true, true);
}

// // writes both commands and data buffers to this device
// Oled.prototype._transfer = function(type, val, fn) {
//   var control;
//   if (type === 'data') {
//     control = 0x40;
//   } else if (type === 'cmd') {
//     control = 0x00;
//   } else {
//     return;
//   }

//   // send control and actual val
//   // this.board.io.i2cWrite(this.ADDRESS, [control, val]);
//   this.wire.writeByte(control, function(err) {
//     this.wire.writeByte(val, function(err) {
//       fn();
//     });
//   });
// }

// // read a byte from the oled
// Oled.prototype._readI2C = function(fn) {
//   this.wire.readByte(function(err, data) {
//     // result is single byte
//     fn(data);
//   });
// }

// // sometimes the oled gets a bit busy with lots of bytes.
// // Read the response byte to see if this is the case
// Oled.prototype._waitUntilReady = function(callback) {
//   var done,
//       oled = this;

//   function tick(callback) {
//     oled._readI2C(function(byte) {
//       // read the busy byte in the response
//       busy = byte >> 7 & 1;
//       if (!busy) {
//         // if not busy, it's ready for callback
//         callback();
//       } else {
//         console.log('I\'m busy!');
//         setTimeout(tick, 0);
//       }
//     });
//   };

//   setTimeout(tick(callback), 0);
// }

// Oled.prototype._waitCallbackComplete = function(tasks, callback) {
//   var done,
//       busy = true,
//       oled = this;
      
//   function tick(callback) {
//     tasks
//     if (!busy) {
      
//     } else {
//       console.log("....Waiting for callback");
//     }
// }

// set starting position of a text string on the oled
Oled.prototype.setCursor = function(x, y) {
  this.cursor_x = x;
  this.cursor_y = y;
}

// write text to the oled
Oled.prototype.writeString = function(font, size, string, color, wrap, sync) {
  var immed = (typeof sync === 'undefined') ? true : sync;
  var wordArr = string.split(' '),
      len = wordArr.length,
      // start x offset at cursor pos
      offset = this.cursor_x,
      padding = 0, letspace = 1, leading = 2;

  // loop through words
  for (var w = 0; w < len; w += 1) {
    // put the word space back in
    wordArr[w] += ' ';
    var stringArr = wordArr[w].split(''),
        slen = stringArr.length,
        compare = (font.width * size * slen) + (size * (len -1));

    // wrap words if necessary
    if (wrap && len > 1 && (offset >= (this.WIDTH - compare)) ) {
      offset = 1;
      this.cursor_y += (font.height * size) + size + leading;
      this.setCursor(offset, this.cursor_y);
    }

    // loop through the array of each char to draw
    for (var i = 0; i < slen; i += 1) {
      // look up the position of the char, pull out the buffer slice
      var charBuf = this._findCharBuf(font, stringArr[i]);
      // read the bits in the bytes that make up the char
      var charBytes = this._readCharBytes(charBuf);
      // draw the entire character
      this._drawChar(charBytes, size, false);

      // calc new x position for the next char, add a touch of padding too if it's a non space char
      padding = (stringArr[i] === ' ') ? 0 : size + letspace;
      offset += (font.width * size) + padding;

      // wrap letters if necessary
      if (wrap && (offset >= (this.WIDTH - font.width - letspace))) {
        offset = 1;
        this.cursor_y += (font.height * size) + size + leading;
      }
      // set the 'cursor' for the next char to be drawn, then loop again for next char
      this.setCursor(offset, this.cursor_y);
    }
  }
  if (immed) {
    this._updateDirtyBytes(this.dirtyBytes);
  }
}

// draw an individual character to the screen
Oled.prototype._drawChar = function(byteArray, size, sync) {
  // take your positions...
  var x = this.cursor_x,
      y = this.cursor_y;

  // loop through the byte array containing the hexes for the char
  for (var i = 0; i < byteArray.length; i += 1) {
    for (var j = 0; j < 8; j += 1) {
      // pull color out
      var color = byteArray[i][j],
          xpos, ypos;
      // standard font size
      if (size === 1) {
        xpos = x + i;
        ypos = y + j;
        this._drawPixel([xpos, ypos, color], false);
      } else {
        // MATH! Calculating pixel size multiplier to primitively scale the font
        xpos = x + (i * size);
        ypos = y + (j * size);
        this.fillRect(xpos, ypos, size, size, color, false);
      }
    }
  }
}

// get character bytes from the supplied font object in order to send to framebuffer
Oled.prototype._readCharBytes = function(byteArray) {
  var bitArr = [],
      bitCharArr = [];
  // loop through each byte supplied for a char
  for (var i = 0; i < byteArray.length; i += 1) {
    // set current byte
    var byte = byteArray[i];
    // read each byte
    for (var j = 0; j < 8; j += 1) {
      // shift bits right until all are read
      var bit = byte >> j & 1;
      bitArr.push(bit);
    }
    // push to array containing flattened bit sequence
    bitCharArr.push(bitArr);
    // clear bits for next byte
    bitArr = [];
  }
  return bitCharArr;
}

// find where the character exists within the font object
Oled.prototype._findCharBuf = function(font, c) {
  // use the lookup array as a ref to find where the current char bytes start
  var cBufPos = font.lookup.indexOf(c) * font.width;
  // slice just the current char's bytes out of the fontData array and return
  var cBuf = font.fontData.slice(cBufPos, cBufPos + font.width);
  return cBuf;
}

// send the entire framebuffer to the oled
Oled.prototype._update = function(callback) {
  // // wait for oled to be ready
  // this._waitUntilReady(function() {
  //   // set the start and endbyte locations for oled display update
  //   var displaySeq = [
  //     this.COLUMN_ADDR,
  //     this.screenConfig.coloffset,
  //     this.screenConfig.coloffset + this.WIDTH - 1, // column start and end address
  //     this.PAGE_ADDR, 0, (this.HEIGHT / 8) - 1 // page start and end address
  //   ];

  //   var displaySeqLen = displaySeq.length,
  //       bufferLen = this.buffer.length,
  //       i, v;

  //   // send intro seq
  //   for (i = 0; i < displaySeqLen; i += 1) {
  //     this._transfer('cmd', displaySeq[i]);
  //   }

  //   // write buffer data
  //   for (v = 0; v < bufferLen; v += 1) {
  //     this._transfer('data', this.buffer[v]);
  //   }

  // }.bind(this));
  var me = this;
  async.series([
      function(cb) {
        me._sendCommand(me.COLUMN_ADDR, new Buffer([ me.screenConfig.coloffset, me.screenConfig.coloffset + me.WIDTH - 1 ]), function(err, results) {
            if (err)
              cb(err, "COLUMN_ADDR: " + err + " - " + results);
            else
              cb(err, "COLUMN_ADDR: " + results);
          }); 
      },
      function(cb) {
        me._sendData(me.buffer, me.buffer.length, function(err, results) {
            if (err)
              cb(err, "_sendData: " + err + " - " + results);
            else
              cb(err, "_sendData: " + results);
          }); 
      }
    ], function(err, results) {
          callback(err, results);
  });
}

// send dim display command to oled
Oled.prototype.dimDisplay = function(bool) {
  var contrast;

  if (bool) {
    contrast = 0; // Dimmed display
  } else {
    contrast = 0xCF; // Bright display
  }

  this._transfer('cmd', this.SET_CONTRAST);
  this._transfer('cmd', contrast);
}

// turn oled off
Oled.prototype.turnOffDisplay = function() {
  this._transfer('cmd', this.DISPLAY_OFF);
}

// turn oled on
Oled.prototype.turnOnDisplay = function() {
  this._transfer('cmd', this.DISPLAY_ON);
}

Oled.prototype.clearDisplay = function(sync) {
  var me = this,
    promise = new Promise(function(resolve, reject) {
      async.series([
          function(cb) {
            me._setRowAndColumn([ 0x00, 0x5F ], [ 0x08, 0x37 ], function(err, results) {
              if (err)
                cb(err, "_setRowAndColumn: " + err + " - " + results);
              else
                cb(err, "_setRowAndColumn: " + results);
            });
          },
          function(cb) {
            add in code to write zeroes directly to Graffics RAM
          },
          function(cb) {
            me._setDisplayModeNormal(function(err, results) {
              if (err)
                cb(err, "_setDisplayModeNormal: " + err + " - " + results);
              else
                cb(err, "_setDisplayModeNormal: " + results);
            });
          },
          function(cb) {
            me._sendCommand(me.SEG_REMAP, new Buffer([ 0x42 ]), function(err, results) {  // set remap horizontal mode
              if (err)
                cb(err, "SEG_REMAP: " + err + " - " + results);
              else
                cb(err, "SEG_REMAP: " + results);
            });
          }                    
        ],  function(err, results) {
              if (err)
                reject(new Error("Oled clearDisplay failed: " + err + "; results: " + results));
              else
                resolve(results);
            }
        );
    });
      
  return promise;
}

// clear all pixels currently on the display
Oled.prototype._clearDisplay = function(sync, callback) {
  var immed = (typeof sync === 'undefined') ? true : sync;
  // write off pixels
  //this.buffer.fill(0x00);
  for (var i = 0; i < this.buffer.length; i += 1) {
    if (this.buffer[i] !== 0x00) {
      this.buffer[i] = 0x00;
      if (this.dirtyBytes.indexOf(i) === -1) {
        this.dirtyBytes.push(i);
      }
    }
  }
  if (immed) {
    this._updateDirtyBytes(this.dirtyBytes, callback);
  }
}

// invert pixels on oled
Oled.prototype.invertDisplay = function(bool) {
  if (bool) {
    this._transfer('cmd', this.INVERT_DISPLAY); // inverted
  } else {
    this._transfer('cmd', this.NORMAL_DISPLAY); // non inverted
  }
}

Oled.prototype._setRowAndColumn = function(row, col, callback) {
  var me = this;
  
  async.series([
      function(cb) {
        me._sendCommand(me.ROW_ADDR, new Buffer(row), function(err, results) {  // set start and end row address
          if (err)
            cb(err, "ROW_ADDR: " + err + " - " + results);
          else
            cb(err, "ROW_ADDR: " + results);
        });            
      },
      function(cb) {
        me._sendCommand(me.COLUMN_ADDR, new Buffer(col), function(err, results) {  // set start and end column address
          if (err)
            cb(err, "COLUMN_ADDR: " + err + " - " + results);
          else
            cb(err, "COLUMN_ADDR: " + results);
        });
      }
    ], function(err, results) {
          callback(err, results);
  });
}

Oled.prototype.drawBitmap = function(pixels, sync) {
  var me = this,
    promise = new Promise(function(resolve, reject) {
      me._drawBitmap(pixels, sync, function(err, results) {
        if (err)
          reject(new Error("Oled drawBitmap failed: " + err + "; results: " + results));
        else
          resolve(results);
      });
    });

  return promise;
}

// draw an image pixel array on the screen
Oled.prototype._drawBitmap = function(pixels, sync, callback) {
  var immed = (typeof sync === 'undefined') ? true : sync;
  var x, y,
      pixelArray = [];

  for (var i = 0; i < pixels.length; i++) {
    x = Math.floor(i % this.WIDTH);
    y = Math.floor(i / this.WIDTH);

    this._drawPixel([x, y, pixels[i]], false);
  }

  if (immed) {
    this._updateDirtyBytes(this.dirtyBytes, callback);
  }
}

// draw one or many pixels on oled
Oled.prototype._drawPixel = function(pixels, sync) {
  var immed = (typeof sync === 'undefined') ? true : sync;

  // handle lazy single pixel case
  if (typeof pixels[0] !== 'object') pixels = [pixels];

  pixels.forEach(function(el) {
    // return if the pixel is out of range
    var x = el[0], y = el[1], color = el[2];
    if (x > this.WIDTH || y > this.HEIGHT) return;

    // thanks, Martin Richards.
    // I wanna can this, this tool is for devs who get 0 indexes
    //x -= 1; y -=1;
    var byte = 0,
        row = Math.floor(y / 8),
        rowShift = 0x01 << (y - 8 * row);

    // is the pixel on the first row of the page?
    (row == 0) ? byte = x : byte = x + (this.WIDTH * row);

    // colors! Well, monochrome.
    if (color === 'BLACK' || color === 0) {
      this.buffer[byte] &= ~rowShift;
    }
    if (color === 'WHITE' || color > 0) {
      this.buffer[byte] |= rowShift;
    }

    // push byte to dirty if not already there
    if (this.dirtyBytes.indexOf(byte) === -1) {
      this.dirtyBytes.push(byte);
    }

  }, this);

  if (immed) {
    this._updateDirtyBytes(this.dirtyBytes);
  }
}

// looks at dirty bytes, and sends the updated bytes to the display
Oled.prototype._updateDirtyBytes = function(byteArray, callback) {
  var blen = byteArray.length, i,
      displaySeq = [],
      byte, row, col,
      me = this;
      
  if (arguments.length != 2) 
    throw new Error("Callback argument not provided");

  // this.update(callback);
  // return;
  if (blen == 0) {
    me.dirtyBytes = [];
    callback(null, "success 0");
    return;
  }
  // check to see if this will even save time
  if (blen > (me.buffer.length / 7)) {
    // just call regular update at this stage, saves on bytes sent
    me._update(callback);
    // now that all bytes are synced, reset dirty state
    me.dirtyBytes = [];

  } else {

    // // iterate through dirty bytes
    // for (var i = 0; i < blen; i += 1) {

    //   var byte = byteArray[i];
    //   var page = Math.floor(byte / this.WIDTH);
    //   var col = Math.floor(byte % this.WIDTH);

    //   var displaySeq = [
    //     this.COLUMN_ADDR, col, col, // column start and end address
    //     this.PAGE_ADDR, page, page // page start and end address
    //   ];

    //   var displaySeqLen = displaySeq.length, v;

    //   // send intro seq
    //   for (v = 0; v < displaySeqLen; v += 1) {
    //     this._transfer('cmd', displaySeq[v]);
    //   }
    //   // send byte, then move on to next byte
    //   this._transfer('data', this.buffer[byte]);
    //   this.buffer[byte];
    // iterate through dirty bytes
    i = 0;
    byte = byteArray[i];
    row = Math.floor(byte / me.WIDTH);
    col = Math.floor(byte % me.WIDTH) + 8;

    async.whilst(
      function() {
        return i < blen;
      },
      function(cbWhilst) {
        async.series([
          function(cb) {
            me._setRowAndColumn([ row, row ], [ col, col ], function(err, results) {
              if (err)
                cb(err, "_setRowAndColumn: " + err + " - " + results);
              else
                cb(err, "_setRowAndColumn: " + results);
            }); 
          },
          function(cb) {
            me._sendDataByte(me.buffer[byte], function(err, results) {
              if (err)
                cb(err, "_sendDataByte: " + err + " - " + results);
              else
                cb(err, "_sendDataByte: " + results);
            }); 
          }
        ], function(err, results) {
             if (err)
               cbWhilst(err, results);
             else {
               i++;
               if (i < blen) {
                 byte = byteArray[i];
                 row = Math.floor(byte / me.WIDTH);
                 col = Math.floor(byte % me.WIDTH) + 8;
               }
               cbWhilst(null, results);
             }
        });
      },
      function(err, results) {
        // now that all bytes are synced, reset dirty state
        me.dirtyBytes = [];
        callback(err, results);
      });
  }
}

// using Bresenham's line algorithm
Oled.prototype.drawLine = function(x0, y0, x1, y1, color, sync) {
  var immed = (typeof sync === 'undefined') ? true : sync;

  var dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1,
      dy = Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1,
      err = (dx > dy ? dx : -dy) / 2;

  while (true) {
    this._drawPixel([x0, y0, color], false);

    if (x0 === x1 && y0 === y1) break;

    var e2 = err;

    if (e2 > -dx) {err -= dy; x0 += sx;}
    if (e2 < dy) {err += dx; y0 += sy;}
  }

  if (immed) {
    this._updateDirtyBytes(this.dirtyBytes);
  }
}

// draw a filled rectangle on the oled
Oled.prototype.fillRect = function(x, y, w, h, color, sync) {
  var immed = (typeof sync === 'undefined') ? true : sync;
  // one iteration for each column of the rectangle
  for (var i = x; i < x + w; i += 1) {
    // draws a vert line
    this.drawLine(i, y, i, y+h-1, color, false);
  }
  if (immed) {
    this._updateDirtyBytes(this.dirtyBytes);
  }
}

// activate scrolling for rows start through stop
Oled.prototype.startScroll = function(dir, start, stop) {
  var scrollHeader,
      cmdSeq = [];

  switch (dir) {
    case 'right':
      cmdSeq.push(this.RIGHT_HORIZONTAL_SCROLL); break;
    case 'left':
      cmdSeq.push(this.LEFT_HORIZONTAL_SCROLL); break;
    // TODO: left diag and right diag not working yet
    case 'left diagonal':
      cmdSeq.push(
        this.SET_VERTICAL_SCROLL_AREA, 0x00,
        this.VERTICAL_AND_LEFT_HORIZONTAL_SCROLL,
        this.HEIGHT
      );
      break;
    // TODO: left diag and right diag not working yet
    case 'right diagonal':
      cmdSeq.push(
        this.SET_VERTICAL_SCROLL_AREA, 0x00,
        this.VERTICAL_AND_RIGHT_HORIZONTAL_SCROLL,
        this.HEIGHT
      );
      break;
  }

  this._waitUntilReady(function() {
    cmdSeq.push(
      0x00, start,
      0x00, stop,
      // TODO: these need to change when diagonal
      0x00, 0xFF,
      this.ACTIVATE_SCROLL
    );

    var i, cmdSeqLen = cmdSeq.length;

    for (i = 0; i < cmdSeqLen; i += 1) {
      this._transfer('cmd', cmdSeq[i]);
    }
  }.bind(this));
}

// stop scrolling display contents
Oled.prototype.stopScroll = function() {
  this._transfer('cmd', this.DEACTIVATE_SCROLL); // stahp
}

module.exports = Oled;
