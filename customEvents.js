/**
* Custom events v1.2.5 (2016-06-28)
*
* (c) 2012-2016 Black Label
*
* License: Creative Commons Attribution (CC)
*/

/* global Highcharts window document module:true */
(function (factory) {
	if (typeof module === 'object' && module.exports) {
		module.exports = factory;
	} else {
		factory(Highcharts);
	}
}(function (HC) {
	/* global Highcharts :true */

	'use strict';

	var UNDEFINED,
		each = HC.each,
		protoTick = HC.Tick.prototype,
		protoAxis = HC.Axis.prototype,
		protoChart = HC.Chart.prototype,
		protoLegend = HC.Legend.prototype,
		protoSeries = HC.Series.prototype,
		protoColumn = HC.seriesTypes.column && HC.seriesTypes.column.prototype,
		protoBar = HC.seriesTypes.bar && HC.seriesTypes.bar.prototype,
		protoPie = HC.seriesTypes.pie && HC.seriesTypes.pie.prototype,
		protoBubble = HC.seriesTypes.bubble && HC.seriesTypes.bubble.prototype,
		protoPlotBands = HC.PlotLineOrBand && HC.PlotLineOrBand.prototype,
		protoFlags = HC.seriesTypes.flags && HC.seriesTypes.flags.prototype,
		seriesAnimate = protoSeries.animate,
		columnAnimate = protoColumn.animate,
		barAnimate = protoBar.animate,
		pieAnimate = protoPie.animate;

	function noop() { return false; }

	//	Highcharts functions
	function isArray(obj) {
		return Object.prototype.toString.call(obj) === '[object Array]';
	}

	//	reanimate
	var reanimate = HC.Chart.prototype.reAnimate = function () {
		
		var chart = this;
		
		each(chart.series, function (s) {
			var animation = s.options.animation,
				clipBox = s.clipBox || chart.clipBox,
				sharedClipKey = ['_sharedClip', animation.duration, animation.easing, clipBox.height].join(','),
				clipRect = chart[sharedClipKey],
				markerClipRect = chart[sharedClipKey + 'm'];
		
			if (!clipRect) { // HC < 4.0.0
				chart.redraw();
				return false;
			}
		
			if (clipRect) {
				clipRect.attr({
					width: 0
				});
			}
			if (markerClipRect) {
				markerClipRect.attr({
					width: 0
				});
			}

			switch (s.type) {
				case 'pie':
					s.animate = pieAnimate;
					break;
				case 'column':
					s.animate = columnAnimate;
					break;
				case 'bar':
					s.animate = barAnimate;
					break;
				default:
					s.animate = seriesAnimate;
					break;
			}
			
			s.animate(true);
			s.isDirty = true;

			return false;
		});

		chart.redraw();

		return false;
	};

	//	reseting all events, fired by Highcharts
	HC.Chart.prototype.callbacks.push(function (chart) {
		var resetAxisEvents = chart.customEvent.resetAxisEvents,
			forExport = chart.renderer.forExport,
			series = chart.series,
			serLen = series.length,
			xAxis = chart.xAxis,
			yAxis = chart.yAxis,
			i = 0;

		if (forExport) {	//	skip custom events when chart is exported
			return false;
		}

		resetAxisEvents(xAxis, 'xAxis', chart);
		resetAxisEvents(yAxis, 'yAxis', chart);

		for (; i < serLen; i++) {
			series[i].update({
				animation: {
					enabled: true
				},
				customEvents: {
					series: series[i].options.events,
					point: series[i].options.point.events
				},
				events: {
					click: noop
				},
				point: {
					events: {
						click: noop
					}
				}
			}, false);
		}

		chart.xAxis[0].isDirty = true;
		reanimate.call(chart);

		return false;
	});

	//	custom event body
	var customEvent = HC.Chart.prototype.customEvent = function (obj, proto) {
		customEvent.add = function (elem, events) {

			for (var key in events) {
				if (key) {
					(function (val) {
						if (events.hasOwnProperty(val) && elem) {

							if ((!elem[val] || elem[val] === UNDEFINED) && elem.element) {

								HC.addEvent(elem.element, val, function (e) {
								
									if (obj.textStr) { //	labels
										obj.value = obj.textStr;
									}
									
									events[val].call(obj, e);

									return false;
								});
							}

							elem[val] = function() {
								return true;
							};
						}
					})(key);
				}

			}
		};

		HC.Chart.prototype.customEvent.resetAxisEvents = function (axis, type, chart) {
			var axisLength = axis.length,
				userOptions = chart.userOptions,
				i = 0,
				j = 0,
				redraw = false,
				plotBandsLength, plotLinesLength, plotLines, plotBands, cAxis, t;

			for (; i < axisLength; i++) {

				if (type) {
					cAxis = HC.splat(userOptions[type]);
					plotLines = cAxis[i] && cAxis[i].plotLines;
					plotBands = cAxis[i] && cAxis[i].plotBands;
				}

				if (plotLines !== UNDEFINED) {
					plotLinesLength = plotLines.length;

					for (j = 0; j < plotLinesLength; j++) {
						t = plotLines[j].events;
						if (t) {
							plotLines[j].customEvents = t;
							plotLines[j].events = null;
						}
					}

					redraw = true;
				}

				if (plotBands !== UNDEFINED) {
					plotBandsLength = plotBands.length;

					for (j = 0; j < plotBandsLength; j++) {
						t = plotBands[j].events;
						if (t) {
							plotBands[j].customEvents = t;
							plotBands[j].events = null;
						}
					}

					redraw = true;
				}

				if (redraw) {
					axis[i].update({
						plotLines: plotLines,
						plotBands: plotBands
					}, false);
				}
			}
		};


		HC.wrap(obj, proto, function (proceed) {
			var events,
				element,
				eventsPoint,
				elementPoint,
				parent,
				op,
				len,
				i,
				j;

			//	call default actions
			var ob = proceed.apply(this, Array.prototype.slice.call(arguments, 1));

			//	switch on object
			switch (proto) {
				case 'addLabel':
					parent = this.parent;
					eventsPoint = this.axis.options.labels.events;
					elementPoint = [this.label];

					if (parent) {
						var step = this; //	current label

						while (step) {
							if (isArray(step)) {
								len = step.length;

								for (i = 0; i < len; i++) {
									elementPoint.push(step[i].label);
								}
							} else {
								elementPoint.push(step.label);
							}

							step = step.parent;
						}

					}

					break;
				case 'setTitle':
					events = this.options.title.events;
					element = this.title;
					break;
				case 'drawDataLabels':
					events = this.dataLabelsGroup ? this.options.dataLabels.events : null;
					element = this.dataLabelsGroup ? this.dataLabelsGroup : null;
					break;
				case 'render':
					if (this.axisTitle) {
						events = this.options.title.events;
						element = this.axisTitle;
					}
				
					if (this.options.value || this.options.from) {
						events = this.options.customEvents;
						element = this.svgElem;
					}

					if (this.options.stackLabels && this.options.stackLabels.enabled) {
						events = this.options.stackLabels.events;
						element = this.stackTotalGroup;
						eventsPoint = this.options.stackLabels.events;
						elementPoint = this.stacks;
					}

					break;
				case 'drawPoints':
					op = this.options;
					events = op.customEvents ? op.customEvents.series : op;
					element = this.group;
					eventsPoint = op.customEvents ? op.customEvents.point : op.point.events;
					elementPoint = this.points;
					break;
				case 'renderItem':
					events = this.options.itemEvents;
					element = this.group;
					break;
				default:
					return false;
			}


			if (events || eventsPoint) {

				if (eventsPoint) {
					len = elementPoint.length;
					j = 0;

					for (; j < len; j++) {
						var elemPoint = HC.pick(elementPoint[j].graphic, elementPoint[j]);

						if (elemPoint && elemPoint !== UNDEFINED) {
							customEvent.add(elemPoint, eventsPoint, elementPoint[j]);
						}
					}
				}

				customEvent.add(element, events, this);
			}

			return ob;
		});
	};
	//	labels
	customEvent(protoTick, 'addLabel');

	//	axis / title
	customEvent(protoAxis, 'render');

	//	series events & point events
	customEvent(protoSeries, 'drawPoints');

	//	datalabels events
	customEvent(protoSeries, 'drawDataLabels');

	//	title events
	customEvent(protoChart, 'setTitle');

	//	legend items
	customEvent(protoLegend, 'renderItem');

	//	plotbands + plotlines
	if (protoPlotBands) {
		customEvent(protoPlotBands, 'render');
	}

	//	bubble charts
	if (protoBubble) {
		customEvent(protoBubble, 'drawPoints');
		customEvent(protoBubble, 'drawDataLabels');
	}

	//	column chart
	if (protoColumn) {
		customEvent(protoColumn, 'drawDataLabels');
		customEvent(protoColumn, 'drawPoints');
	}

	if (protoPie) {
		customEvent(protoPie, 'drawDataLabels');
		customEvent(protoPie, 'drawPoints');
	}

	if (protoFlags) {
		customEvent(protoFlags, 'drawDataLabels');
		customEvent(protoFlags, 'drawPoints');
	}

}));