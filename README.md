<script src="http://code.jquery.com/jquery-1.9.1.min.js"></script>
<script src="http://code.highcharts.com/highcharts.js"></script>
<script src="./customEvents.js"></script>

# Custom events - Highcharts module

Go to project page to see this module in action: [http://blacklabel.github.io/custom_events/](http://blacklabel.github.io/custom_events/)


<div id="chart" style="height: 500px"></div>
<h2>Events</h2>
<div id="report"></div>
<script>
window.chart = new Highcharts.Chart({
            chart:{
                renderTo: 'chart'
            },
            title: {
                events: {
                    dblclick: function () {
                        $('#report').html('dbclick on title');
                    },
                    click: function () {
                        $('#report').html('click on title');
                    },
                    contextmenu: function () {
                        $('#report').html('context menu on title ');
                    }
                }
            },
            yAxis: [{
                plotLines: [{
                    color: '#FF0000',
                    width: 10,
                    value: 70,
                    events: {
                        dblclick: function () {
                            $('#report').html('dbclick on plotline');
                        },
                        click: function () {
                            $('#report').html('click on plotline');
                        },
                        contextmenu: function () {
                            $('#report').html('context menu on plotline');
                        }
                    }
                }],
                plotBands: [{ // mark the weekend
                    color: '#FCFFC5',
                    from: 100,
                    to: 200,
                    events: {
                        dblclick: function () {
                            $('#report').html('dbclick on plotband');
                        },
                        click: function () {
                            $('#report').html('click on plotband');
                        },
                        contextmenu: function () {
                            $('#report').html('context menu on plotband');
                        }
                    }
                }],
                labels: {
                    events: {
                        dblclick: function () {
                            $('#report').html('dbclick on yAxis label');
                        },
                        click: function () {
                            $('#report').html('click on yAxis label');
                        },
                        contextmenu: function () {
                            $('#report').html('context menu on yAxis label');
                        }
                    }
                }
            }, {
                opposite: true,
                linkedTo: 0,
                labels: {
                    events: {
                        dblclick: function () {
                            $('#report').html('dbclick on yAxis label');
                        },
                        click: function () {
                            $('#report').html('click yAxis label');
                        },
                        contextmenu: function () {
                            $('#report').html('context menu yAXIS 2');
                        }
                    }
                }
            }],
            xAxis: {
                labels: {
                    rotation: -45,
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
            },
            plotOptions: {
                series: {
                    dataLabels:{
                        enabled:true,
                        events:{
                            dblclick: function () {
                                $('#report').html('dbclick on datalabel');
                            },
                            click: function () {
                                $('#report').html('click on datalabel');
                            },
                            contextmenu: function () {
                                $('#report').html('context menu on datalabel');
                            }
                        }
                    },
                    events: {
                        dblclick: function () {
                            $('#report').html('dbclick on serie');
                        },
                        click: function () {
                            $('#report').html('click on serie');
                        },
                        contextmenu: function () {
                            $('#report').html('context menu on serie');
                        }
                    },
                    point: {
                        events: {
                            dblclick: function () {
                                $('#report').html('dbclick on serie point');
                            },
                            click: function () {
                                $('#report').html('click on serie point');
                            },
                            contextmenu: function () {
                                $('#report').html('context menu on serie point');
                            }
                        }
                    }
                }
            },
            legend: {
                itemEvents: {
                    dblclick: function () {
                        $('#report').html('dbclick on legend item');
                    },
                    click: function () {
                        $('#report').html('click on legend item');
                    },
                    contextmenu: function () {
                        $('#report').html('context menu on legend item ');
                    }
                }
            },
            series: [{
                data: [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135,43]
            },{
                type:'column',
                data: [50,16,21,11,22,12]
            }]

        });
</script>

### Requirements

* Plugin requires the latest Highcharts (tested with 3.0.7)

### Installation

* Like any other Highcharts module (e.g. exporting), add `<script>` tag pointing to `custom_events.js` below Highcharts script tag.

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
### Available events

* click
* double click
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

### Demo

Demos are available at project's github page: [http://blacklabel.github.io/custom_events/](http://blacklabel.github.io/custom_events/)
