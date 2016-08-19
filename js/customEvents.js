/**
* Custom events v1.4.2 (2016-08-19)
*
* (c) 2012-2016 Black Label
*
* License: Creative Commons Attribution (CC)
*/

/* global Highcharts setTimeout clearTimeout module:true */
/* eslint no-loop-func: 0 */

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
		DBLCLICK = 'dblclick',
		COLUMN = 'column',
		MAP = 'map',
		TOUCHSTART = 'touchstart',
		CLICK = 'click',
		each = HC.each,
		pick = HC.pick,
		wrap = HC.wrap,
		protoTick = HC.Tick.prototype,
		protoAxis = HC.Axis.prototype,
		protoChart = HC.Chart.prototype,
		protoLegend = HC.Legend.prototype,
		protoSeries = HC.Series.prototype,
		protoColumn = HC.seriesTypes.column && HC.seriesTypes.column.prototype,
		protoBar = HC.seriesTypes.bar && HC.seriesTypes.bar.prototype,
		protoPie = HC.seriesTypes.pie && HC.seriesTypes.pie.prototype,
		protoBubble = HC.seriesTypes.bubble && HC.seriesTypes.bubble.prototype,
		protoColumnRange = HC.seriesTypes.columnrange && HC.seriesTypes.columnrange.prototype,
		protoAreaRange = HC.seriesTypes.arearange && HC.seriesTypes.arearange.prototype,
		protoAreaSplineRange = HC.seriesTypes.areasplinerange && HC.seriesTypes.areasplinerange.prototype,
		protoErrorbar = HC.seriesTypes.errorbar && HC.seriesTypes.errorbar.prototype,
		protoBoxplot = HC.seriesTypes.boxplot && HC.seriesTypes.boxplot.prototype,
		protoPlotBands = HC.PlotLineOrBand && HC.PlotLineOrBand.prototype,
		protoFlags = HC.seriesTypes.flags && HC.seriesTypes.flags.prototype,
		seriesAnimate = protoSeries && protoSeries.animate,
		columnAnimate = protoColumn && protoColumn.animate,
		barAnimate = protoBar && protoBar.animate,
		pieAnimate = protoPie && protoPie.animate,
		defaultOptions = HC.getOptions().plotOptions;

	function noop() { return false; }

	//  Highcharts functions
	function isArray(obj) {
		return Object.prototype.toString.call(obj) === '[object Array]';
	}

	//  reanimate
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

	//  reseting all events, fired by Highcharts
	HC.Chart.prototype.callbacks.push(function (chart) {
		var resetAxisEvents = chart.customEvent.resetAxisEvents,
			forExport = chart.renderer.forExport,
			series = chart.series,
			serLen = series.length,
			xAxis = chart.xAxis,
			yAxis = chart.yAxis,
			i;

		if (forExport) {    //  skip custom events when chart is exported
			return false;
		}

		resetAxisEvents(xAxis, 'xAxis', chart);
		resetAxisEvents(yAxis, 'yAxis', chart);

		for (i = 0; i < serLen; i++) {
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

	//  custom event body
	var customEvent = HC.Chart.prototype.customEvent = function (obj, proto) {
		customEvent.add = function (elem, events, elemObj, series) {

			for (var key in events) {
				if (key) {

					(function (val) {
						if (events.hasOwnProperty(val) && elem) {

							if ((!elem[val] || elem[val] === UNDEFINED) && elem.element) {

								if ((val === DBLCLICK)) { //  #30

									var tapped = false;

									HC.addEvent(elem.element, TOUCHSTART, function (e) {

										if (!tapped) {

											tapped = setTimeout(function () {
												tapped = null;
												events[CLICK].call(elemObj, e); //	call single click action
											}, 300);

										} else {
											clearTimeout(tapped);

											tapped = null;

											events[val].call(elemObj, e);

										}

										return false;
									});

								}

								HC.addEvent(elem.element, val, function (e) {
			
									if (elemObj && elemObj.textStr) { //   labels
										elemObj.value = elemObj.textStr;
									}

									if (series && defaultOptions[series.type] && defaultOptions[series.type].marker) {

										var chart = series.chart, 
											normalizedEvent = chart.pointer.normalize(e),
											i;

										elemObj = series.searchPoint(normalizedEvent, true);
										
									}

									events[val].call(elemObj, e);

									return false;
								});
							}

							elem[val] = function () {
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
				redraw = false,
				plotBandsLength, plotLinesLength, plotLines, plotBands, cAxis, t, i, j;

			for (i = 0; i < axisLength; i++) {

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

		//  #50
		wrap(HC.Chart.prototype, 'renderSeries', function () {
			var chart = this,
				series = chart.series,
				forExport = chart.renderer.forExport,
				type;
			
			each(series, function (serie) {
				serie.translate();

				type = (serie.type !== COLUMN) && (serie.type !== MAP) && (forExport === UNDEFINED); // #51

				if (type) {
					serie.customClipPath = serie.chart.renderer.clipRect({
						x: 0,
						y: 0,
						width: 0,
						height: chart.plotTop + chart.plotHeight
					});
				}
				serie.render();
				
				if (type) {
					serie.markerGroup.clip(serie.customClipPath);
					serie.group.clip(serie.customClipPath);
				}
			
			});
		});
  
		wrap(HC.Series.prototype, 'redraw', function () {
			var series = this,
				chart = series.chart,
				wasDirty = series.isDirty || series.isDirtyData,
				group = series.group,
				xAxis = series.xAxis,
				yAxis = series.yAxis,
				type = (series.type !== COLUMN) && (series.type !== MAP);
			
			// reposition on resize
			if (group) {
				if (chart.inverted) {
					group.attr({
						width: chart.plotWidth,
						height: chart.plotHeight
					});
				}
  
				group.animate({
					translateX: pick(xAxis && xAxis.left, chart.plotLeft),
					translateY: pick(yAxis && yAxis.top, chart.plotTop)
				});
			}
  
			series.translate();
  
			if (type) {
				series.customClipPath = series.chart.renderer.clipRect({
					x: 0,
					y: 0,
					width: 0,
					height: chart.plotTop + chart.plotHeight
				});
			}
  
			series.render();
			
			if (type) {
				series.markerGroup.clip(series.customClipPath);
				series.group.clip(series.customClipPath);
			}
			
			if (wasDirty) { // #3945 recalculate the kdtree when dirty
				delete this.kdTree; // #3868 recalculate the kdtree with dirty data
			}
		});

		wrap(HC.Chart.prototype, 'redraw', function (proceed) {
			
			proceed.apply(this, Array.prototype.slice.call(arguments, 1));
			
			var chart = this,
				serie = this.series,
				duration = HC.getOptions().plotOptions.line.animation.duration,
				type;
			
			each(serie, function (s) {
				type = s.type !== COLUMN && s.type !== MAP;

				if (type) {
					s.customClipPath.animate({
						width: chart.plotLeft + chart.plotWidth
					}, {
						duration: duration
					});
				}
			});
		});

		wrap(obj, proto, function (proceed) {
			var events,
				element,
				eventsPoint,
				elementPoint,
				eventsSubtitle,
				elementSubtitle,
				parent,
				type,
				op,
				len,
				i,
				j;

			//  call default actions
			var ob = proceed.apply(this, Array.prototype.slice.call(arguments, 1));

			//  switch on object
			switch (proto) {
				case 'addLabel':
					parent = this.parent;
					eventsPoint = this.axis.options.labels.events;
					elementPoint = [this.label];

					if (parent) {
						var step = this; // current label

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
					events = this.options.title && this.options.title.events;
					element = this.title;
					eventsSubtitle = this.options.subtitle && this.options.subtitle.events;
					elementSubtitle = this.subtitle;
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
					type = this.type;
					events = op.events;
					element = this.group;
					eventsPoint = op.customEvents ? op.customEvents.point : op.point.events;

					if (defaultOptions[type] && defaultOptions[type].marker) {
						elementPoint = [this.markerGroup];
					} else {
						elementPoint = this.points;
					}

					break;
				case 'renderItem':
					events = this.options.itemEvents;
					element = this.group;
					break;
				default:
					events = element = UNDEFINED;
					return false;
			}


			if ((events !== UNDEFINED) || (eventsPoint !== UNDEFINED)) {
				
				if (eventsPoint) {

					len = elementPoint.length;

					for (j = 0; j < len; j++) {
						var elemPoint = HC.pick(elementPoint[j].graphic, elementPoint[j]);

						if (elemPoint && elemPoint !== UNDEFINED) { 
							customEvent.add(elemPoint, eventsPoint, elementPoint[j], this);
						}
					}
				}

				if (eventsSubtitle) {
					customEvent.add(elementSubtitle, eventsSubtitle, this);
				}

				customEvent.add(element, events, this);
			}

			return ob;
		});
	};
	//  labels
	customEvent(protoTick, 'addLabel');

	//  axis / title
	customEvent(protoAxis, 'render');

	//  series events & point events
	customEvent(protoSeries, 'drawPoints');

	//  datalabels events
	customEvent(protoSeries, 'drawDataLabels');

	//  title events
	customEvent(protoChart, 'setTitle');

	//  legend items
	customEvent(protoLegend, 'renderItem');

	//  plotbands + plotlines
	if (protoPlotBands) {
		customEvent(protoPlotBands, 'render');
	}

	//  bubble charts
	if (protoBubble) {
		customEvent(protoBubble, 'drawPoints');
		customEvent(protoBubble, 'drawDataLabels');
	}

	//  column chart
	if (protoColumn) {
		customEvent(protoColumn, 'drawDataLabels');
		customEvent(protoColumn, 'drawPoints');
	}

	//  pie chart
	if (protoPie) {
		customEvent(protoPie, 'drawDataLabels');
		customEvent(protoPie, 'drawPoints');
	}

	//	columnrange
	if (protoColumnRange) {
		customEvent(protoColumnRange, 'drawDataLabels');
		customEvent(protoColumnRange, 'drawPoints');
	}

	//	arearange
	if (protoAreaRange) {
		customEvent(protoAreaRange, 'drawDataLabels');
		customEvent(protoAreaRange, 'drawPoints');
	}

	//	areasplinerange
	if (protoAreaSplineRange) {
		customEvent(protoAreaSplineRange, 'drawDataLabels');
		customEvent(protoAreaSplineRange, 'drawPoints');
	}

	//	errorbar
	if (protoErrorbar) {
		customEvent(protoErrorbar, 'drawDataLabels');
		customEvent(protoErrorbar, 'drawPoints');
	}

	//	boxplot
	if (protoBoxplot) {
		customEvent(protoBoxplot, 'drawDataLabels');
		customEvent(protoBoxplot, 'drawPoints');
	}

	//  flags
	if (protoFlags) {
		customEvent(protoFlags, 'drawDataLabels');
		customEvent(protoFlags, 'drawPoints');
	}

}));