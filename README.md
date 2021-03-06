![‘npm version’](http://img.shields.io/npm/v/oled-js.svg?style=flat) ![‘downloads over month’](http://img.shields.io/npm/dm/oled-js.svg?style=flat)

Grove Gray OLED JS Beaglebone Green
========================

![oled-seeed](https://camo.githubusercontent.com/327eb3533a61060ef0b001c2b81e3c031e16d61d/687474703a2f2f7777772e736565656473747564696f2e636f6d2f77696b692f696d616765732f392f39302f4f6c6564313238313238312e6a7067)

## What is this?

A NodeJS driver for I2C/SPI compatible 4-bit gray OLED screens; to be used on the Beaglebone Green! Currently Works with  96 x 96 sized 4-bit gray scale screens, of the SSD1327 OLED/PLED Controller (read the [datasheet here](http://www.seeedstudio.com/wiki/File:SSD1327_datasheet.pdf)).

This is based on [OLED JS Pi](https://github.com/kd7yva/oled-js-pi) and the Blog Post and code by Suz Hinton - [Read her blog post about how OLED screens work](http://meow.noopkat.com/oled-js/)!

The code has been refactored from [OLED JS Pi](https://github.com/kd7yva/oled-js-pi) to use [i2c-bus](https://github.com/fivdi/i2c-bus) in asynchronous mode with support from [async](https://github.com/caolan/async). Methods that may not complete immediately return a [promise](https://github.com/then/promise) for acting on in the future.

OLED screens are really cool - now you can control them with JavaScript!

## Install

If you haven't already, install [NodeJS](http://nodejs.org/).

`npm install grove-gray-oled-js-bbg`

## I2C screens
Hook up I2C compatible Grove Gray OLED  to the Beaglebone Green. Pins: SDL and SCL

### I2C example

```javascript
var oled = require('grove-gray-oled-js-bbg');

var opts = {
  width: 96,
  height: 96,
  address: 0x3C
};

var oled = new oled(opts);

// do cool oled things here

```

### Wait, how do I find out the I2C address of my OLED screen?
Check your screen's documentation...

## Available methods

### clearDisplay
Fills the screen buffer and GRAM with 'off' pixels (0x00). Bool argument specifies whether screen updates immediately with result.

Usage:
```javascript
promise = oled.clearDisplay(true|false);
```

### dimDisplay
Lowers the contrast on the display. This method takes one argument, a boolean. True for dimming, false to restore normal contrast.

Usage:
```javascript
promise = oled.dimDisplay(true|false);
```

### invertDisplay
Inverts the pixels on the display. Black becomes white, white becomes black. This method takes one argument, a boolean. True for inverted state, false to restore normal pixel colors.

Usage:
```javascript
promise = oled.invertDisplay(true|false);
```

### setEnableDisplay
Turns the display on or off.

Usage:
```javascript
promise = oled.setEnableDisplay(true|false);
```

### drawPixel
Draws a pixel at a specified position on the display. This method takes one argument: a multi-dimensional array containing either one or more sets of pixels.

Each pixel needs an x position, a y position, and a color. Colors can be specified as either 0 for 'off' or black, and 1 or 255 for 'on' or white.

Usage:
```javascript
// draws 4 white pixels total
// format: [x, y, color]
oled.drawPixel([
	[128, 1, 1],
	[128, 32, 1],
	[128, 16, 1],
	[64, 16, 1]
]);
```

### drawLine
Draws a one pixel wide line.

Arguments:
+ int **x0, y0** - start location of line
+ int **x1, y1** - end location of line
+ int **color** - can be specified as either 0 for 'off' or black, and 1 or 255 for 'on' or white.

Bool as last argument specifies whether screen updates immediately with result.

Usage:
```javascript
// args: (x0, y0, x1, y1, color, sync)
promise = oled.drawLine(1, 1, 128, 32, 1, true);
```

### fillRect
Draws a filled rectangle.

Arguments:
+ int **x0, y0** - top left corner of rectangle
+ int **x1, y1** - bottom right corner of rectangle
+ int **color** - can be specified as either 0 for 'off' or black, and 1 or 255 for 'on' or white.

Bool as last argument specifies whether screen updates immediately with result.

Usage:
```javascript
// args: (x0, y0, x1, y1, color, sync)
promise = oled.fillRect(1, 1, 10, 20, 1, true);
```

### drawBitmap
Draws a bitmap using raw pixel data returned from an image parser. The image sourced must be monochrome, and indexed to only 2 colors. Resize the bitmap to your screen dimensions first. Using an image editor or ImageMagick might be required.

Bool as last argument specifies whether screen updates immediately with result.

Tip: use a NodeJS image parser to get the pixel data, such as [pngparse](https://www.npmjs.org/package/pngparse). A demonstration of using this is below.


Example usage:
```
npm install pngparse
```

```javascript
var pngparse = require('pngparse');

pngparse.parseFile('indexed_file.png', function(err, image) {
	promise = oled.drawBitmap(image.data, true);
});
```

This method is provided as a primitive convenience. A better way to display images is to use NodeJS package [png-to-lcd](https://www.npmjs.org/package/png-to-lcd) instead. It's just as easy to use as drawBitmap, but is compatible with all image depths (lazy is good!). It will also auto-dither if you choose. You should still resize your image to your screen dimensions. This alternative method is covered below:

```
npm install png-to-lcd
```

```javascript
var pngtolcd = require('png-to-lcd');

pngtolcd('nyan-cat.png', true, function(err, bitmap) {
  oled.drawBitmap(bitmap, false).then(oled.update());
});
```

### startScroll
Scrolls the current display either left or right.
Arguments:
+ string **direction** - direction of scrolling. 'left' or 'right'
+ [int, int] **row** - start row and stop row of scrolling area
+ [int, int] **column** - start column and stop column of scrolling area

Usage:
```javascript
// args: (direction, start, stop)
oled.startscroll('left', [20, 60], [30, 80]); // this will scroll an area of 40 pixels by 50 pixels
```

### stopScroll
Stops all current scrolling behaviour.

Usage:
```javascript
promise = oled.stopScroll();
```

### setCursor
Sets the x and y position of 'cursor', when about to write text. This effectively helps tell the display where to start typing when writeString() method is called.

Call setCursor just before writeString().

Usage:
```javascript
// sets cursor to x = 1, y = 1
oled.setCursor(1, 1);
```

### writeString
Writes a string of text to the display.  
Call setCursor() just before, if you need to set starting text position.

Arguments:
+ obj **font** - font object in JSON format (see note below on sourcing a font)
+ int **size** - font size, as multiplier. Eg. 2 would double size, 3 would triple etc.
+ string **text** - the actual text you want to show on the display.
+ int **color** - color of text. Can be specified as either 0 for 'off' or black, and 1 or 255 for 'on' or white.
+ bool **wrapping** - true applies word wrapping at the screen limit, false for no wrapping. If a long string without spaces is supplied as the text, just letter wrapping will apply instead.

Bool as last argument specifies whether screen updates immediately with result.

Before all of this text can happen, you need to load a font buffer for use. A good font to start with is NodeJS package [oled-font-5x7](https://www.npmjs.org/package/oled-font-5x7).

Usage:
```
npm install oled-font-5x7
```

```javascript
var font = require('oled-font-5x7');

// sets cursor to x = 1, y = 1
oled.setCursor(1, 1);
promise = oled.writeString(font, 1, 'Cats and dogs are really cool animals, you know.', 1, true);
```

### update
Sends the entire buffer in its current state to the oled display, effectively syncing the two. This method generally does not need to be called, unless you're messing around with the framebuffer manually before you're ready to sync with the display. It's also needed if you're choosing not to draw on the screen immediately with the built in methods.

Usage:
```javascript
promise = oled.update();
```
