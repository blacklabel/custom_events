
# Custom events - Highcharts module

Go to project page to see this module in action: [http://blacklabel.github.io/custom_events/](http://blacklabel.github.io/custom_events/)


### Requirements

* Plugin requires the latest Highcharts (tested with 3.0.7)

### Installation

* Like any other Highcharts module (e.g. exporting), add `<script>` tag pointing to `custom_events.js` below Highcharts script tag.

* For NPM users:
```
var Highcharts = require('highcharts'),
    HighchartsCustomEvents = require('highcharts-custom-events')(Highcharts);
```

* For BOWER users:

```
bower install highcharts-custom-events
```

### Code

The latest code is available on github: [https://github.com/blacklabel/custom_events/](https://github.com/blacklabel/custom_events/)

### Usage and demos

It's quite simple and intuitive, just pass function as other events:

```
events: {
                        dblclick: function () {
                            $('#report').html('dbclick on xAxis label');
                        },
                        click: function () {
                            $('#report').html('click on xAxis label');
                        },
                        contextmenu: function () {
                            $('#report').html('context menu on xAxis label');
                        }
}
```

Crosshairs

```
crosshair: {
    enabled: true,
    events: {
                        dblclick: function () {
                            $('#report').html('dbclick on xAxis label');
                        },
                        click: function () {
                            $('#report').html('click on xAxis label');
                        },
                        contextmenu: function () {
                            $('#report').html('context menu on xAxis label');
                        }
    }
}
```

### Available events

* click
* double click (including mobile devices)
* right click (context menu)
* mouse over
* mouse out
* mouse down
* mouse move

### Elements

* title
* subtitle
* axis labels
* axis title
* plotLines
* plotBands, including labels
* point
* series
* legend
* datalabels
* flags
* crosshairs
