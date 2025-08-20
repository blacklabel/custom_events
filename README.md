# Custom Events – Highcharts Module

[![npm version](https://img.shields.io/npm/v/highcharts-custom-events)](https://www.npmjs.com/package/highcharts-custom-events)
[![license](https://img.shields.io/github/license/blacklabel/custom_events)](./LICENSE)

**Custom Events** extends Highcharts by allowing you to bind native DOM-like events (`click`, `dblclick`, `contextmenu`, etc.) directly to chart elements such as labels, titles, series, and crosshairs.

👉 [Live demo](https://blacklabel.github.io/custom_events/)  
👉 [GitHub repository](https://github.com/blacklabel/custom_events)

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
