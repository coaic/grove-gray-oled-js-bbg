"use strict";
//
// Use Arduino CPP code as a model per: https://github.com/Seeed-Studio/OLED_Display_96X96
//
var i2c = require('i2c-bus'),
    async = require('async'),
    Promise = require('promise');

var Oled = function(opts) {

  this.HEIGHT = opts.height || 96; // This is OLED dimension, not GDRAM dimension of 128
  this.WIDTH = opts.width || 96;   // This is OLED dimension, not GDRAM dimension of 128
  this.ADDRESS = opts.address || 0x3C;
  this.PROTOCOL = 'I2C';
  
  this.BUS0 = 0;
  this.BUS1 = 1;
  this.BUS2 = 2;
  
  this.VERTICAL_MODE = 0;
  this.HORIZONTAL_MODE = 1;
  
  this.grayH = 0xF0;
  this.grayL = 0x0F;

  this.i2c1,
  this.Command_Mode = 0x80;
  this.Data_Mode = 0x40;
  this.VideoRAMSize = Math.floor(this.WIDTH / 2) * this.HEIGHT;

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
  this.RIGHT_HORIZONTAL_SCROLL = 0x27;
  this.LEFT_HORIZONTAL_SCROLL = 0x26;
  
  this.SCROLL_2FRAMES = 0x7;
  this.SCROLL_3FRAMES = 0x4;
  this.SCROLL_4FRAMES = 0x5;
  this.SCROLL_5FRAMES = 0x0;
  this.SCROLL_25FRAMES = 0x6;
  this.SCROLL_64FRAMES = 0x1;
  this.SCROLL_128FRAMES = 0x2;
  this.SCROLL_256FRAMES = 0x3;

  this.cursor_x = 0;
  this.cursor_y = 0;
  
  this.debugCmdLogEnable = false;
  this.debugDataLogEnable = false;
  this.debugScreenBufferLogEnable = false;

  // new blank buffer
  this.buffer = new Buffer(this.VideoRAMSize);
  this.buffer.fill(0x00);

  this.dirtyBytes = [];
  
  this.addressMode = this.VERTICAL_MODE;

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
    '96x96': {
      'multiplex': 0x5F,
      'compins': 0x12,
      'coloffset': 8
    },
    '96x16': {
      'multiplex': 0xA8,
      'compins': 0x2,
      'coloffset': 0,
    }
  };

  var screenSize = this.WIDTH + 'x' + this.HEIGHT;
  this.screenConfig = config[screenSize];

}

Oled.prototype.debugCmdLog = function(logLine) {
  if (this.debugCmdLogEnable) {
    console.log(logLine);
  }
} 

Oled.prototype.debugDataLog = function(logLine) {
  if (this.debugDataLogEnable) {
    console.log(logLine);
  }
} 

Oled.prototype.formatHexByte = function(byte) {
  return "0x" + (byte < 0x10 ? "0" : "") + byte.toString(16)
}

Oled.prototype.debugScreenBufferLog = function(buffer) {
  var i, j,
      logLine,
      padding,
      byte,
      len = buffer.length;
      
  if (this.debugScreenBufferLogEnable) {
    for (i = 0; i < len; i += 32) {
      if (i < 10) {
        padding = "   ";
      } else if (i < 100) {
        padding = "  ";
      } else if (i < 1000) {
        padding = " ";
      } else {
        padding = "";
      }
      logLine = padding + i.toString(10) + ": "
      for (j = i; j < (i + 32); j++) {
        byte = buffer[j]
        logLine += " 0x" + (byte < 16 ? "0" + byte.toString(16) : byte.toString(16));
      }
      console.log(logLine);
    }
  }
}

Oled.prototype._toPromise = function(fn, resolveDelay, args) {
  var me = this,
      promise;

  promise = new Promise(function(resolve, reject) {
    args.push(function(err, results) {
        if (err)
          reject(new Error("Oled promise reject: " + err + "; results: " + results));
        else {
          if (resolveDelay < 0) { 
            resolve(results);
          } else {
            setTimeout(function() { resolve(results); }, resolveDelay);
          }
        }
      });
      
    fn.apply(me, args)
  });
  return promise;
}

Oled.prototype.init = function () {
  return this._toPromise(this._initialise, 100, Array.prototype.slice.call(arguments));
}

Oled.prototype._sendData = function (buffer, bufferLen, callback) {
  var count = 0,
      me = this;
  
  async.whilst(
    function() { 
      return count < bufferLen 
    },
    function(cb) {
      me.i2c1.writeByte(me.ADDRESS, me.Data_Mode, buffer[count], function() { 
        count++;
        cb(null, count);
      });
    },
    function(err, n) {
      callback(err, n);
    });
}

Oled.prototype._sendDataByte = function (byte, callback) {
  this.debugDataLog(".................data: " + me.formatHexByte(me.ADDRESS) + "; byte: " + me.formatHexByte(byte));
  this.i2c1.writeByte(this.ADDRESS, this.Data_Mode, byte, function(err, bytesWritten, buffer) {
            if (err) {
                console.log("I2C Error sending data byte: error: " + err);
                callback(err, "fail");
            } else {
                callback(err, "success");
            }
        });
}

Oled.prototype._sendCommand = function (cmd, callback) {
    var buffer = cmd,
        count,
        bufferLen,
        callback,
        me = this;

    if (typeof callback !== 'function')
      throw new Error("Second argument must be a call back function");
    
    if (typeof cmd !== 'number')
      if ((typeof cmd !== 'object') && (typeof cmd['parent'] === 'undefined'))
        throw new Error("First argment must be 'number' or typeof 'object', ie, SlowBuffer");
    

    if (typeof cmd !== 'number') {
      count = 0;
      bufferLen = buffer.length;
      async.whilst(
        function() { 
          return count < bufferLen 
        },
        function(cb) {
          me.debugCmdLog("..........cmd: " + me.formatHexByte(buffer[count]));
          me.i2c1.writeByte(me.ADDRESS, me.Command_Mode, buffer[count], function() { 
            count++;
            cb(null, count);
          });
        },
        function(err, n) {
          callback(err, n);
        }
      );
    } else {
        me.debugCmdLog("..........cmd: " + me.formatHexByte(cmd));
        me.i2c1.writeByte(me.ADDRESS, me.Command_Mode, cmd, function(err, bytesWritten, buffer) {
            if (err) {
                console.log("I2C Error sending command: " + cmd + ", error: " + err);
                callback(err, "fail");
            } else {
                callback(err, "success");
            }
        });
    }
}

Oled.prototype._setContrastLevel = function (contrastLevel, cb) {
  this._sendCommand(new Buffer([ this.SET_CONTRAST, contrastLevel ]), cb);
}

Oled.prototype._setGrayLevel = function (grayLevel, cb) {
  this.grayH = (grayLevel << 4) & 0xF0;
  this.grayL = grayLevel & 0x0F;
  setTimeout(function() { cb(null, "success"); }, 0);
}

Oled.prototype._setHorizontalMode = function (callback) {
  var me = this;

  async.series([
    function(cb) {
      me._sendCommand(new Buffer([ me.SEG_REMAP, 0x42 ]), function(err, results) {
        if (err) {
          console.log("Oled _setHorizontalMode failed: " + err);
          cb(err, results);
        } else {
          me.addressMode = me.HORIZONTAL_MODE;
          cb(err, results);
        }
      });
    },
    function(cb) {
      me._setRowAndColumn([ 0x00, 0x5F ], [ 0x08, 0x37 ], function(err, results) {
        if (err) {
          console.log("Oled _setHorizontalMode failed: " + err);
          cb(err, results);
        } else {
          cb(err, results);
        }
      });
    }],
      function(err, results) {
        callback(err, results);
    });
}

Oled.prototype._setVerticalMode = function (cb) {
  var me = this;
  
  me._sendCommand(new Buffer([ me.SEG_REMAP, 0x46 ]), function(err, results) {
    if (err) {
      console.log("Oled _setHorizontalMode failed: " + err);
      cb(err, results);
    } else {
      me.addressMode = me.VERTICAL_MODE;
      cb(err, results);
    }
  });
}

Oled.prototype._setDisplayModeAllOn = function (cb) {
    this._sendCommand(0xA5, cb);
}

Oled.prototype._setDisplayModeAllOff = function (cb) {
    this._sendCommand(0xA6, cb);
}

Oled.prototype._setDisplayModeInverse = function (cb) {
    this._sendCommand(this.INVERT_DISPLAY, cb);
}

Oled.prototype._setEnableScroll = function (on, cb) {
    if (on)
        this._sendCommand(this.ACTIVATE_SCROLL, cb);
    else
        this._sendCommand(this.DEACTIVATE_SCROLL, cb);
}

Oled.prototype._setEnableDisplay = function (on, cb) {
    if (on) 
        this._sendCommand(this.DISPLAY_ON, cb);
    else
        this._sendCommand(this.DISPLAY_OFF, cb);    
}

Oled.prototype._initialise = function(callback) {
  var me = this;
    async.series([
      function(cb) {
          me.i2c1 = i2c.open(me.BUS1, function(err, results) {
            if (err) 
              cb(err, "open fail: " + err + " - " + results);
            else
              cb(err, "open success: " + results);
          });
      },
      function(cb) {
          me._sendCommand(me.SETCOMMANDLOCK, function(err, results) {   // Unlock OLED driver IC MCU interface from entering command. i.e: Accept commands
            if (err)
              cb(err, "SETCOMMANDLOCK: " + err + " - " + results);
            else
              cb(err, "SETCOMMANDLOCK: " + results);
          });
      },
      function(cb) {
          me._sendCommand(me.RESETPROTECTION, function(err, results) {
            if (err)
              cb(err, "RESETPROTECTION: " + err + " - " + results);
            else
              cb(err, "RESETPROTECTION: " + results);
          });
      },
      function(cb) {
          me._setEnableDisplay(false, function(err, results) {
            if (err)
              cb(err, "_setEnableDisplay: " + err + " - " + results);
            else
              cb(err, "_setEnableDisplay: " + results);
          });
      },
      function(cb) {
          me._sendCommand(new Buffer([ me.SET_MULTIPLEX, me.screenConfig['multiplex'] ]), function(err, results) {  // set multiplex ratio
            if (err)
              cb(err, "SET_MULTIPLEX: " + err + " - " + results);
            else
              cb(err, "SET_MULTIPLEX: " + results);
          });         
      },
      function(cb) {
          me._sendCommand(new Buffer([ me.SET_START_LINE, 0x00 ]), function(err, results) {  // set display start line
            if (err)
              cb(err, "SET_START_LINE: " + err + " - " + results);
            else
              cb(err, "SET_START_LINE: " + results);
          });                  
      },
      function(cb) {
          me._sendCommand(new Buffer([ me.SET_DISPLAY_OFFSET, 0x60 ]), function(err, results) {  // set display offset
            if (err)
              cb(err, "SET_DISPLAY_OFFSET: " + err + " - " + results);
            else
              cb(err, "SET_DISPLAY_OFFSET: " + results);
          });              
      },
      function(cb) {
          me._setVerticalMode(function(err, results) {  // set remap horizontal mode
            if (err)
              cb(err, "_setVerticalMode: " + err + " - " + results);
            else
              cb(err, "_setVerticalMode: " + results);
          });                      
      },
      function(cb) {
          me._sendCommand(new Buffer([ me.SET_VDD_INTERNAL, 0x01 ]), function(err, results) {  // set vdd internal
            if (err)
              cb(err, "SET_VDD_INTERNAL: " + err + " - " + results);
            else
              cb(err, "SET_VDD_INTERNAL: " + results);
          });                
      },
      function(cb) {
          me._dimDisplay(false,  function(err, results) {  // set contrast
            if (err)
              cb(err, "_dimDisplay: " + err + " - " + results);
            else
              cb(err, "_dimDisplay: " + results);
          });                   
      },
      function(cb) {
          me._sendCommand(new Buffer([ me.SET_PHASE_LENGTH, 0x51 ]), function(err, results) {  // set phase length
            if (err)
              cb(err, "SET_PHASE_LENGTH: " + err + " - " + results);
            else
              cb(err, "SET_PHASE_LENGTH: " + results);
          });                
      },
      function(cb) {
          me._sendCommand(new Buffer([ me.SET_DISPLAY_CLOCK_DIVIDE_RATIO, 0x01 ]), function(err, results) {  // set display clock divide ratio/oscillator frequency
            if (err)
              cb(err, "SET_DISPLAY_CLOCK_DIVIDE_RATIO: " + err + " - " + results);
            else
              cb(err, "SET_DISPLAY_CLOCK_DIVIDE_RATIO: " + results);
          });    
      },
      function(cb) {
          me._sendCommand(me.SET_LINEAR_LUT, function(err, results) {  // set linear gray scale
            if (err)
              cb(err, "SET_LINEAR_LUT: " + err + " - " + results);
            else
              cb(err, "SET_LINEAR_LUT: " + results);
          });                          
      },
      function(cb) {
          me._sendCommand(new Buffer([ me.SET_PRECHARGE_VOLTAGE, me.VCOMH ]), function(err, results) {  // set pre charge voltage to VCOMH
            if (err)
              cb(err, "SET_PRECHARGE_VOLTAGE: " + err + " - " + results);
            else
              cb(err, "SET_PRECHARGE_VOLTAGE: " + results);
          });          
      },
      function(cb) {
          me._sendCommand(new Buffer([ me.SET_VCOMH, me.POINT_86_VCC ]), function(err, results) {  // set VCOMh .86 x Vcc
            if (err)
              cb(err, "SET_VCOMH: " + err + " - " + results);
            else
              cb(err, "SET_VCOMH: " + results);
          });                
      },
      function(cb) {
          me._sendCommand(new Buffer([ me.SET_SECOND_PRECHARGE, 0x01 ]), function(err, results) {  // set second pre charge period
            if (err)
              cb(err, "SET_SECOND_PRECHARGE: " + err + " - " + results);
            else
              cb(err, "SET_SECOND_PRECHARGE: " + results);
          });            
      },
      function(cb) {
          me._sendCommand(new Buffer([ me.SET_ENABLE_SECOND_PRECHARGE, me.INTERNAL_VSL ]), function(err, results) {  // enable second pre charge and internal VSL
            if (err)
              cb(err, "SET_ENABLE_SECOND_PRECHARGE: " + err + " - " + results);
            else
              cb(err, "SET_ENABLE_SECOND_PRECHARGE: " + results);
          }); 
      },
  
      function(cb) {
          me._invertDisplay(false, function(err, results) {  
            if (err)
              cb(err, "_invertDisplay: " + err + " - " + results);
            else
              cb(err, "_invertDisplay: " + results);
          });
      },
      function(cb) {
          me._setEnableScroll(false, function(err, results) {  
            if (err)
              cb(err, "_setEnableScroll: " + err + " - " + results);
            else
              cb(err, "_setEnableScroll: " + results);
          });
      },
      function(cb) {
          me._setEnableDisplay(true, function(err, results) {  
            if (err)
              cb(err, "_setEnableDisplay: " + err + " - " + results);
            else
              cb(err, "_setEnableDisplay: " + results);
          });
      }
  ], function(err, results) {
        console.log('Oled I2C Address: ' + me.formatHexByte(me.ADDRESS));
        callback(err, results);
  });
}

// set starting position of a text string on the oled
Oled.prototype.setCursor = function(x, y) {
  this.cursor_x = x;
  this.cursor_y = y;
}

Oled.prototype.writeString = function(font, size, string, color, wrap, sync) {
  return this._toPromise(this._writeString, -1, Array.prototype.slice.call(arguments));
}

Oled.prototype.setEnableDisplay = function(on) {
  return this._toPromise(this._setEnableDisplay, -1, Array.prototype.slice.call(arguments));
}

// write text to the oled screen buffer
Oled.prototype._writeString = function(font, size, string, color, wrap, sync, callback) {
  var me = this,
      immed = (typeof sync === 'undefined') ? true : sync;
  var wordArr = string.split(' '),
      len = wordArr.length,
      // start x offset at cursor pos
      offset = me.cursor_x,
      padding = 0, letspace = 1, leading = 2;

  // loop through words
  for (var w = 0; w < len; w += 1) {
    // put the word space back in
    wordArr[w] += ' ';
    var stringArr = wordArr[w].split(''),
        slen = stringArr.length,
        compare = (font.width * size * slen) + (size * (len -1));

    // wrap words if necessary
    if (wrap && len > 1 && (offset >= (me.WIDTH - compare)) ) {
      offset = 1;
      me.cursor_y += (font.height * size) + size + leading;
      me.setCursor(offset, me.cursor_y);
    }

    // loop through the array of each char to draw
    for (var i = 0; i < slen; i += 1) {
      // look up the position of the char, pull out the buffer slice
      var charBuf = me._findCharBuf(font, stringArr[i]);
      // read the bits in the bytes that make up the char
      var charBytes = me._readCharBytes(charBuf);
      // draw the entire character
      me._drawChar(charBytes, size, color, false);

      // calc new x position for the next char, add a touch of padding too if it's a non space char
      padding = (stringArr[i] === ' ') ? 0 : size + letspace;
      offset += (font.width * size) + padding;

      // wrap letters if necessary
      if (wrap && (offset >= (me.WIDTH - font.width - letspace))) {
        offset = 1;
        me.cursor_y += (font.height * size) + size + leading;
      }
      // set the 'cursor' for the next char to be drawn, then loop again for next char
      me.setCursor(offset, me.cursor_y);
    }
  }
  if (immed) {
    me._updateDirtyBytes(this.dirtyBytes, callback);
  } else {
    setTimeout(function() { callback(null, "success"); }, 0);
  }
}

// draw an individual character to the screen
Oled.prototype._drawChar = function(byteArray, size, color, sync) {
  // take your positions...
  var x = this.cursor_x,
      y = this.cursor_y;
      
  if (size != 1)
    return;   // Don't try and scale character, just do nothing

  // loop through the byte array containing the hexes for the char
  for (var i = 0; i < byteArray.length; i += 1) {
    for (var j = 0; j < 8; j += 1) {
      // pull color out
      var color = byteArray[i][j],
          xpos, ypos;
      // standard font size
      xpos = x + i;
      ypos = y + j;
      this._drawPixel([xpos, ypos, color]);
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
  var me = this,
      localAddressMode = me.addressMode;
      
  me.debugScreenBufferLog(me.buffer);
  
  async.series([
      function(cb) {
        me._setHorizontalMode(function(err, results) {
            if (err)
              cb(err, "_setHorizontalMode: " + err + " - " + results);
            else
              cb(err, "_setHorizontalMode: " + results);
          }); 
      },
      function(cb) {
        me._sendData(me.buffer, me.buffer.length, function(err, results) {
            if (err)
              cb(err, "_sendData: " + err + " - " + results);
            else
              cb(err, "_sendData: " + results);
          }); 
      },
      function(cb) {
        if (localAddressMode == me.HORIZONTAL_MODE) {
          setTimeout(function() { cb(null, "success"); }, 0);
        } else {
          me._setVerticalMode(function(err, results) {
            if (err)
              cb(err, "_setVerticalMode: " + err + " - " + results);
            else
              cb(err, "_setVerticalMode: " + results);
          });
        }
      }
    ], function(err, results) {
          callback(err, results);
  });
}

Oled.prototype.update = function() {
  return this._toPromise(this._update, -1, Array.prototype.slice.call(arguments));
}

// send dim display command to oled
Oled.prototype._dimDisplay = function(dim, callback) {
  var contrast;

  if (dim) {
    contrast = 0; // Dimmed display
  } else {
    contrast = 0xff; // Bright display
  }
  this._setContrastLevel(contrast, callback);
}

Oled.prototype.dimDisplay = function(dim) {
  return this._toPromise(this._dimDisplay, -1, Array.prototype.slice.call(arguments));
}


// Clear OLED GRAM and screen buffer
//
Oled.prototype.clearDisplay = function(sync) {
  var me = this,
    promise = new Promise(function(resolve, reject) {
      async.series([
          function(cb) {
            me._setHorizontalMode(function(err, results) {
              if (err)
                cb(err, "_setRowAndColumn: " + err + " - " + results);
              else
                cb(err, "_setRowAndColumn: " + results);
            });
          },
          function(cb) {
            // Write zeroes to Graffics RAM and clear display buffer
            me.buffer.fill(0x00);
            me._sendData(me.buffer, me.buffer.length, cb);
          },
          function(cb) {
            me._invertDisplay(false, function(err, results) {
              if (err)
                cb(err, "_invertDisplay: " + err + " - " + results);
              else
                cb(err, "_invertDisplay: " + results);
            });
          },
          function(cb) {
            me._setVerticalMode(function(err, results) {  // set remap virtical mode
              if (err)
                cb(err, "_setVerticalMode: " + err + " - " + results);
              else
                cb(err, "_setVerticalMode: " + results);
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

// Clear screen buffer without update OLED GRAM
//
Oled.prototype.clearBuffer = function() {
  this.buffer.fill(0x00);
}

// invert pixels on oled
Oled.prototype._invertDisplay = function(invert, cb) {
  this._sendCommand(invert ? this.INVERT_DISPLAY : this.NORMAL_DISPLAY, cb);
}

Oled.prototype.invertDisplay = function(invert) {
  return this._toPromise(this._invertDisplay, -1, Array.prototype.slice.call(arguments));
}

Oled.prototype._setRowAndColumn = function(row, col, callback) {
  var me = this;
  
  async.series([
      function(cb) {
        me._sendCommand(new Buffer([me.ROW_ADDR, row[0], row[1]]), function(err, results) {  // set start and end row address
          if (err)
            cb(err, "ROW_ADDR: " + err + " - " + results);
          else
            cb(err, "ROW_ADDR: " + results);
        });            
      },
      function(cb) {
        me._sendCommand(new Buffer([me.COLUMN_ADDR, col[0], col[1]]), function(err, results) {  // set start and end column address
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
  return this._toPromise(this._drawBitmap, -1, Array.prototype.slice.call(arguments));
}

// Draw an image pixel array on the screen
Oled.prototype._drawBitmap = function(pixels, sync, callback) {
  var immed = (typeof sync === 'undefined') ? true : sync,
      i, j,
      pixel_index,
      buffer_index,
      chunk,
      cart,
      me = this;
  

  pixel_index = 0;
  for (i = 0; i < pixels.length; i++, pixel_index += 8) {
    chunk = pixels[i];
    for (j = 0; j < 8; j++) {
      if ((chunk << j) & 0x80) {
        cart = me._horizontalMode_index_to_x_y(pixel_index + j);
        me._drawPixel([cart.x, cart.y, me.grayL]);
      }
    }
  }

  if (immed) {
    me._updateDirtyBytes(me.dirtyBytes, callback);
  } else {
    setTimeout(function() { callback(null, "success"); }, 0);
  }

}

// Draw one or many pixels to oled screen buffer
//
Oled.prototype._drawPixel = function(pixels) {
  // handle lazy single pixel case
  //
  if (typeof pixels[0] !== 'object') pixels = [pixels];

  pixels.forEach(function(el) {
    // return if the pixel is out of range
    var x = el[0], y = el[1], color = el[2], buffer_index;
    if (x > this.WIDTH || y > this.HEIGHT || x < 0 || y < 0) 
      return;

    buffer_index = this._horizontalMode_x_y_to_index(x, y);
    if (x % 2) {
      this.buffer[buffer_index] |= color;
    } else {
      this.buffer[buffer_index] |= color << 4;
    }

    // push index to dirty if not already there
    if (this.dirtyBytes.indexOf(buffer_index) === -1) {
      this.dirtyBytes.push(buffer_index);
    }

  }, this);
}

Oled.prototype._horizontalModeRowAndColumn = function(index) {
  var row,
      col;

  col = Math.floor(index % (this.WIDTH / 2)) + 8;
  row = Math.floor(index / (this.HEIGHT / 2));
  return {row: row, col: col};
} 

Oled.prototype._horizontalMode_x_y_to_index = function(x, y) {
  return Math.floor(x / 2) + (y * Math.floor(this.WIDTH / 2));
}

Oled.prototype._horizontalMode_index_to_x_y = function(index) {
  var x, y;
  
  x = Math.floor(index % this.WIDTH);
  y = Math.floor(index / this.HEIGHT);
  return {x: x, y: y};
}

Oled.prototype._processDirtyBytes = function(byteArray, callback) {
  var blen = byteArray.length, i,
    byte, p,
    me = this,
    localAddressMode = me.addressMode;
    
    // // iterate through dirty bytes
    i = 0;
    byte = byteArray[i];
    p = me._horizontalModeRowAndColumn(byte)
    async.series([
      function(cb) {
        me._setHorizontalMode(function(err, results) {
            if (err)
              cb(err, "_setHorizontalMode: " + err + " - " + results);
            else
              cb(err, "_setHorizontalMode: " + results);
          }); 
      },
      function (cb) {
        async.whilst(
          function() {
            return i < blen;
          },
          function(cbWhilst) {
            async.series([
              function(cb) {
                me._setRowAndColumn([ p.row, p.row ], [ p.col, p.col ], function(err, results) {
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
                     p = me._horizontalModeRowAndColumn(byte);
                   }
                   cbWhilst(null, results);
                 }
            });
          },
          function(err, results) {
            // now that all bytes are synced, reset dirty state
            if (err) {
              cb(err, "_processDirtyBytes: " + err + " - " + results);
            } else {
              me.dirtyBytes = [];
              cb(err, "_processDirtyBytes" + results);
            }
          });
      },
      function(cb) {
        if (localAddressMode == me.HORIZONTAL_MODE) {
          setTimeout(function() { cb(null, "success"); }, 0);
        } else {
          me._setHorizontalMode(function(err, results) {
            if (err)
              cb(err, "_setVerticalMode: " + err + " - " + results);
            else
              cb(err, "_setVerticalMode: " + results);
          });
        }
      }
    ], function(err, results) {
          callback(err, results);
  });
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
    // Call regular update at this stage, saves on bytes sent
    me._update(callback);
  } else {
    me._processDirtyBytes(byteArray, callback);
  }
}

Oled.prototype.drawLine = function(x0, y0, x1, y1, color, sync) {
  return this._toPromise(this._drawLine, -1, Array.prototype.slice.call(arguments))
}

// using Bresenham's line algorithm
//
Oled.prototype._drawLine = function(x0, y0, x1, y1, color, sync, callback) {
  var me = this,
      immed = (typeof sync === 'undefined') ? true : sync;

  var dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1,
      dy = Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1,
      err = (dx > dy ? dx : -dy) / 2;

  while (true) {
    me._drawPixel([x0, y0, color]);

    if (x0 === x1 && y0 === y1) break;

    var e2 = err;

    if (e2 > -dx) {err -= dy; x0 += sx;}
    if (e2 < dy) {err += dx; y0 += sy;}
  }

  if (immed) {
    me._updateDirtyBytes(me.dirtyBytes, callback);
  } else {
    setTimeout(function() { 
      callback(null, "success"); }, 0);
  }
}

Oled.prototype.fillRect = function(x, y, w, h, color, sync) {
  return this._toPromise(this._fillRect, -1, Array.prototype.slice.call(arguments));
}

// draw a filled rectangle on the oled
Oled.prototype._fillRect = function(x, y, w, h, color, sync, callback) {
  var me = this,
      i,
      immed = (typeof sync === 'undefined') ? true : sync;

  i = x;
  async.whilst(
    function() { 
      return i < x + w; 
    },
    function(cb) {
      me._drawLine(i, y, i, y+h-1, color, false, function() { 
        i++;
        cb(null, i);
      });
    },
    function(err, n) {
      if (err) {
        callback(err, n);
      } else {
        if (immed) {
          me._updateDirtyBytes(me.dirtyBytes, callback);
        } else {
          setTimeout(function() { callback(null, "success"); }, 0);
        }
      }
    }
  );
}

Oled.prototype.startScroll = function(dir, rows, columns) {
  return this._toPromise(this._startScroll, -1, Array.prototype.slice.call(arguments));
}

// Activate scrolling for rows and columns
//
Oled.prototype._startScroll = function(dir, rows, columns, callback) {
  var me = this,
      scrollDirection = dir == 'right' ? this.RIGHT_HORIZONTAL_SCROLL : this.LEFT_HORIZONTAL_SCROLL,
      scrollSpeed = me.SCROLL_25FRAMES
      ;
  me._sendCommand(new Buffer([ scrollDirection, 0x00, rows[0], scrollSpeed, rows[1], Math.floor(columns[0] / 2) + 8, Math.floor(columns[1] / 2) + 8, 0x00, me.ACTIVATE_SCROLL]), callback);
}

Oled.prototype.stopScroll = function() {
  return this._toPromise(this._stopScroll, -1, Array.prototype.slice.call(arguments));
}

// Stop scrolling display contents
//
Oled.prototype._stopScroll = function(callback) {
  this._sendCommand(this.DEACTIVATE_SCROLL, callback);
}

module.exports = Oled;
