# Custom Events – Highcharts Module

[![npm version](https://img.shields.io/npm/v/highcharts-custom-events)](https://www.npmjs.com/package/highcharts-custom-events)
[![license](https://img.shields.io/github/license/blacklabel/custom_events)](./license.txt)

**Custom Events** extends Highcharts by allowing you to bind native DOM-like events (`click`, `dblclick`, `contextmenu`, etc.) directly to chart elements such as labels, titles, series, and crosshairs.

👉 [Live demo](https://blacklabel.github.io/custom_events/)  
👉 [GitHub repository](https://github.com/blacklabel/custom_events)

---

## Table of Contents
- [Getting Started](#getting-started)
  - [Compatibility](#compatibility)
  - [Installation](#installation)
- [Usage](#usage)
- [Available Events](#available-events)
- [Supported Elements](#supported-elements)
- [Development Setup](#development-setup)
- [Using the Plugin Locally in index.html](#using-the-plugin-locally-in-indexhtml)

---

## Getting Started

### Compatibility

| Custom Events Version | Highcharts Version |
| --------------------- | ------------------ |
| **4.0.0+**            | `>= 9.0.0`         |
| **3.x.x**             | `< 9.0.0`          |

---

## Installation

Install via NPM:

```bash
npm install highcharts highcharts-custom-events
# or
yarn add highcharts highcharts-custom-events
# or
pnpm add highcharts highcharts-custom-events
```

Then import and initialize:
```js
import Highcharts from "highcharts";
import HighchartsCustomEvents from "highcharts-custom-events";

HighchartsCustomEvents(Highcharts);
```

Or include via a <script> tag after loading Highcharts:
```js
<script src="https://code.highcharts.com/highcharts.js"></script>
<script src="https://blacklabel.github.io/custom_events/js/customEvents.js"></script>
```

---

## Usage

Attach events in the same way you would with Highcharts’ built-in event handlers:
```js
Highcharts.chart('container', {
  xAxis: {
    labels: {
        events: {
          click: function () {
            console.log('Click on xAxis label');
          },
          dblclick: function () {
            console.log('Double click on xAxis label');
          },
          contextmenu: function () {
            console.log('Right click on xAxis label');
          }
        }
    }    
  },
  crosshair: {
    enabled: true,
    events: {
      mouseover: function () {
        console.log('Mouse over crosshair');
      }
    }
  },
  series: [{
    data: [1, 2, 3, 4, 5]
  }]
});
```

---

## Available Events
| Event         | Description                              |
| ------------- | ---------------------------------------- |
| `click`       | Fires on click                           |
| `dblclick`    | Fires on double click (desktop & mobile) |
| `contextmenu` | Fires on right click                     |
| `mouseover`   | Fires when hovering over element         |
| `mouseout`    | Fires when leaving element               |
| `mousedown`   | Fires when mouse button pressed          |
| `mousemove`   | Fires when moving cursor over element    |

## Supported Elements
| Element       | Notes              |
| ------------- | ------------------ |
| `title`       | Chart title        |
| `subtitle`    | Chart subtitle     |
| `axis.labels` | Axis labels        |
| `axis.title`  | Axis title         |
| `plotLines`   | Including labels   |
| `plotBands`   | Including labels   |
| `point`       | Single data point  |
| `series`      | Entire series      |
| `legend`      | Legend items       |
| `dataLabels`  | Series data labels |
| `flags`       | Flags series       |
| `crosshair`   | Crosshairs         |


---

## Development Setup

If you want to work on this plugin locally:

1. Clone the repository
```bash
git clone https://github.com/blacklabel/custom_events.git
cd custom_events
```
2. Install dependencies
```bash
npm install
# or
yarn install
```
3. Start a local dev server
```bash
npm start
```
This will launch a local server (via http-server or similar) and open the demo page in your browser.

4. Build the plugin
```bash
npm run build
```
The compiled file will be available in the dist/ folder.

---
## Using the Plugin Locally in index.html
After building, include the plugin file after Highcharts in your index.html:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Highcharts Custom Events - Local Dev</title>
  <script src="https://code.highcharts.com/highcharts.js"></script>
  <script src="dist/custom_events.js"></script>
</head>
<body>
  <div id="container"></div>
  <script>
    Highcharts.chart('container', {
      series: [{
        data: [1, 2, 3, 4, 5]
      }]
    });
  </script>
</body>
</html>
```