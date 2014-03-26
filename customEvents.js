/**
 * Custom events v1.0.1 (2013-12-09)
 *
 * (c) 2012-2013 Black Label
 *
 * License: Creative Commons Attribution (CC)
 */
 
(function(HC){
/*jshint expr:true, boss:true */

                //reseting all events, fired by Highcharts
                HC.Chart.prototype.callbacks.push(function (chart) {
                    var i = 0,
                        series = chart.series,
                        serLen = series.length;

                    for(;i<serLen;i++) {
                        series[i].update({
                            customEvents: {
                                series: series[i].options.events,
                                point: series[i].options.point.events
                            },
                            events:{
                                click: null
                            },
                            point:{
                                events:{
                                    click: null
                                }
                            }
                        });
                    }
                });

                //custom event body
                var customEvent = HC.Chart.prototype.customEvent = function (obj, proto)  {
                    customEvent.add = function (elem, events, obj) {
                        for (var key in events) {
                            
                            (function(key) {
                                if (events.hasOwnProperty(key)) {
                                    elem.on(key, function(e) {
                                        events[key].call(obj,e);
                                    });
                                }
                            })(key)
                            
                        }
                    };

                    HC.wrap(obj, proto, function (proceed) {
                        var events,
                            element,
                            eventsPoint,
                            elementPoint,
                            op;

                        //call default actions
                        proceed.apply(this, Array.prototype.slice.call(arguments, 1));

                        //switch on object
                        switch (proto) {
                            case 'addLabel':
                                events = this.axis.options.labels.events;
                                element = this.label;
                                break;
                            case 'setTitle':
                                events = this.options.title.events;
                                element = this.title;
                                break;
                            case 'drawDataLabels':
                                events = this.dataLabelsGroup ? this.options.dataLabels.events : null;
                                element = this.dataLabelsGroup ? this.dataLabelsGroup : null;
                                break;
                            case 'drawPoints':
                                op = this.options;
                                events = op.customEvents ? op.customEvents.series : op,
                                element = this.group;
                                eventsPoint = op.customEvents ? op.customEvents.point : op.point.events;
                                elementPoint = this.points;
                                break;
                            case 'renderItem':
                                events = this.options.itemEvents;
                                element = this.group;
                                break;
                        }

                        if (events || eventsPoint) {
                        
                            if (eventsPoint) {
                                var len = elementPoint.length
                                    j = 0;

                                for (; j < len; j++) {
                                    var elemPoint = elementPoint[j].graphic;
                                    
                                    if(elementPoint[j].y) {
                                        customEvent.add(elemPoint, eventsPoint, elementPoint[j]);
                                    }
                                }
                            }

                            customEvent.add(element, events, this);
                        }
                    });
                };


                //labels 
                customEvent(HC.Tick.prototype, 'addLabel');

                //series events & point events
                customEvent(HC.Series.prototype, 'drawPoints');
                customEvent(HC.seriesTypes.column.prototype, 'drawPoints');
                customEvent(HC.seriesTypes.pie.prototype, 'drawPoints');

                //datalabels events
                customEvent(HC.Series.prototype, 'drawDataLabels');
                customEvent(HC.seriesTypes.column.prototype, 'drawDataLabels');
                customEvent(HC.seriesTypes.pie.prototype, 'drawDataLabels');

                //title events
                customEvent(HC.Chart.prototype, 'setTitle');

                //legend items
                customEvent(HC.Legend.prototype, 'renderItem');

        
})(Highcharts);