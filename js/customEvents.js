/**
* Custom events v2.0.15 (2017-04-10)
*
* (c) 2012-2016 Black Label
*
* License: Creative Commons Attribution (CC)
*/

/* global Highcharts setTimeout clearTimeout module:true */
/* eslint no-loop-func: 0 */

/**
 * @namespace customEvents
 **/

(function (factory) {
	if (typeof module === 'object' && module.exports) {
		module.exports = factory;
	} else {
		factory(Highcharts);
	}
}(function (HC) {

	/* global Highcharts :true, window */

	'use strict';

	var UNDEFINED,
		DBLCLICK = 'dblclick',
		TOUCHSTART = 'touchstart',
		CLICK = 'click',
		each = HC.each,
		pick = HC.pick,
		wrap = HC.wrap,
		merge = HC.merge,
		addEvent = HC.addEvent,
		isTouchDevice = HC.isTouchDevice,
		isObject = HC.isObject,
		isNumber = HC.isNumber,
		defaultOptions = HC.getOptions().plotOptions,
		axisProto = HC.Axis && HC.Axis.prototype,
		plotLineOrBandProto = HC.PlotLineOrBand && HC.PlotLineOrBand.prototype,
		seriesTypes = HC.seriesTypes,
		seriesProto = HC.Series && HC.Series.prototype,
		customEvents,
		proto,
		methods;

	/**
	 * @memberof customEvents
	 * @returns {Boolean} true if object is array
	 **/
	function isArray(obj) {
		return Object.prototype.toString.call(obj) === '[object Array]';
	}

	/**
	 * WRAPPED FUNCTIONS
	 */

	// reset exis events
	if (plotLineOrBandProto) { // # condition for highmaps and custom builds
		wrap(plotLineOrBandProto, 'render', function (proceed) {
			var defaultEvents = this.options && this.options.events;
		
			// reset default events on plot lines or bands
			if (defaultEvents) {
				defaultEvents = false;
			}

			return proceed.apply(this, Array.prototype.slice.call(arguments, 1));
		});
	}
	if (seriesProto) { // # condition for highmaps and custom builds
		wrap(seriesProto, 'init', function (proceed, chart, options) {
			var chartOptions = chart.options,
				plotOptions = chartOptions.plotOptions,
				seriesOptions = chartOptions.plotOptions.series,
				userOptions = merge(seriesOptions, plotOptions[this.type], options),
				userOptionsEvents = userOptions && userOptions.events,
				userOptionsPointEvents = userOptions && userOptions.point && userOptions.point.events; // Fixed #70

			// reset default events on series and series point
			options.events = {};
			options.point = {
				events: {}
			};

			// Add support for legendItemClick
			if (userOptionsEvents) {
				options.events = {
					legendItemClick: userOptionsEvents && userOptionsEvents.legendItemClick
				};
			}

			// Add support for legendItemClick in pie chart
			if (userOptionsPointEvents) {
				options.point.events = {
					legendItemClick: userOptionsPointEvents && userOptionsPointEvents.legendItemClick
				};
			}

			// attach events to custom object, which is used in attach event
			options.customEvents = {
				series: userOptionsEvents,
				point: userOptionsPointEvents
			};

			// call default action
			proceed.apply(this, Array.prototype.slice.call(arguments, 1));

		});
	}

	HC.Chart.prototype.customEvent = {
		/**
		 * @description Example: [HC.Series, ['drawPoints', 'drawDataLabels']]
		 * @memberof customEvents
		 * @returns {Array} array of pairs: prototype, array of methods to wrap
		 **/
		getEventsProtoMethods: function () {
			return [
				[HC.Tick, ['addLabel']],
				[HC.Axis, ['render']],
				[HC.Axis, ['drawCrosshair']],
				[HC.Chart, ['setTitle']],
				[HC.Legend, ['renderItem']],
				[HC.PlotLineOrBand, ['render']],
				[HC.Series, ['drawPoints', 'drawDataLabels']],
				[seriesTypes.column, ['drawPoints', 'drawDataLabels']],
				[seriesTypes.bar, ['drawPoints', 'drawDataLabels']],
				[seriesTypes.pie, ['drawPoints', 'drawDataLabels']],
				[seriesTypes.bubble, ['drawPoints', 'drawDataLabels']],
				[seriesTypes.columnrange, ['drawPoints', 'drawDataLabels']],
				[seriesTypes.arearange, ['drawPoints', 'drawDataLabels']],
				[seriesTypes.areasplinerange, ['drawPoints', 'drawDataLabels']],
				[seriesTypes.errorbar, ['drawPoints', 'drawDataLabels']],
				[seriesTypes.boxplot, ['drawPoints', 'drawDataLabels']],
				[seriesTypes.flags, ['drawPoints', 'drawDataLabels']],
				[seriesTypes.heatmap, ['drawPoints', 'drawDataLabels']]
			];
		},
		/**
		 * @description Init method, based on getEventsProtoMethods() array. Iterates on array of prototypes and methods to wrap
		 * @memberof customEvents
		 **/
		init: function () {
			var eventsProtoMethods = this.getEventsProtoMethods(); // array of pairs [object, [methods]]

			each(eventsProtoMethods, function (protoMethod) {

				proto = protoMethod[0] && protoMethod[0].prototype;
				methods = protoMethod[1];

				if (proto) {
					each(methods, function (method) {
						customEvents.attach(proto, method);
					});
				}
			});
		},
		/**
		 * @description Wraps methods i.e drawPoints to extract SVG element and set an event by calling customEvents.add()
		 * @param {Object} proto Highcharts prototype i.e Highcharts.Series.prototype
		 * @param {Object} hcMethod name of wrapped method i.e drawPoints
		 * @memberof customEvents
		 **/
		attach: function (proto, hcMethod) {
			
			wrap(proto, hcMethod, function (proceed) {
				var eventElement = {
						events: UNDEFINED,
						element: UNDEFINED
					},
					proceedObject,
					len,
					j;

				//  call default actions
				proceedObject = proceed.apply(this, Array.prototype.slice.call(arguments, 1));

				//	call
				eventElement = customEvents.eventElement[hcMethod].call(this);

				//  stop, when events and SVG element do not exist
				if (!eventElement.events && !eventElement.eventsPoint) {
					return proceedObject;
				}
				
				if (eventElement.eventsPoint) { //

					len = eventElement.elementPoint.length;

					// attach events per each point
					for (j = 0; j < len; j++) {
						if (eventElement.elementPoint[j]) {
							var elemPoint = pick(eventElement.elementPoint[j].graphic, eventElement.elementPoint[j]);

							if (elemPoint && elemPoint !== UNDEFINED) {
								customEvents.add(elemPoint, eventElement.eventsPoint, eventElement.elementPoint[j], eventElement, true);
							}
						}
					}
				}

				// attach event to subtitle
				if (eventElement.eventsSubtitle) {
					customEvents.add(eventElement.elementSubtitle, eventElement.eventsSubtitle, eventElement, this);
				}

				// attach event to stackLabels
				if (eventElement.eventsStackLabel) {
					customEvents.add(eventElement.elementStackLabel, eventElement.eventsStackLabel, eventElement, this);
				}

				customEvents.add(eventElement.element, eventElement.events, eventElement, this);

				return proceedObject;

			});
		},
		/**
		 * @description adds event on a SVG element
		 * @param {Object} SVGelem graphic element
		 * @param {Object} events object with all events
		 * @param {Object} elemObj "this" object, which is available in the event
		 * @param {Object} series chart series
		 * @memberof customEvents
		 **/
		add: function (SVGelem, events, elemObj, eventElement, isPoint) {

//console.log(eventElement.eventObject, elemObj.eventObject);

			var eventObject = eventElement.eventObject || elemObj.eventObject, //	Fix series reference #89
				isSeries = elemObj.isSeries || eventElement.isSeries;


			// stop when SVG element does not exist
			if (!SVGelem || !SVGelem.element) {
				return false;
			}

			for (var action in events) {

				(function (event) {
					if (events.hasOwnProperty(event) && !SVGelem[event]) {
						if (isTouchDevice && event === DBLCLICK) { //  #30 - fallback for iPad
							
							var tapped = false;

							addEvent(SVGelem.element, TOUCHSTART, function (e) {
								
								e.stopPropagation();
								e.preventDefault();

								if (isSeries && !eventObject.directTouch) { // #93
									var chart = eventObject.chart,
										normalizedEvent = chart.pointer.normalize(e);

									elemObj = eventObject.searchPoint(normalizedEvent, eventObject.kdDimensions === 1) || elemObj; // #87 - wrong searchPoint for scatter series
									e.point = elemObj;	//	#89 point reference in mouse event
								}

								if ((eventObject && !isPoint) || (isNumber(eventObject.value))) { // #95 
									eventObject.value = elemObj.textStr;
									elemObj = eventObject;
								}

								if (elemObj && elemObj.textStr) { // labels
									elemObj.value = elemObj.textStr;
								}

								if (!tapped) {

									tapped = setTimeout(function () {
										tapped = null;
										events[CLICK].call(elemObj, e); //	call single click action
									}, 300);

								} else {
									clearTimeout(tapped);

									tapped = null;
									events[event].call(elemObj, e);

								}

								return false;

							});

						} else {

							addEvent(SVGelem.element, event, function (e) {
								
								e.stopPropagation();
								e.preventDefault();

								if (isSeries && !eventObject.directTouch) { // #93
									var chart = eventObject.chart,
										normalizedEvent = chart.pointer.normalize(e);

									elemObj = eventObject.searchPoint(normalizedEvent, eventObject.kdDimensions === 1) || elemObj; // #87 - wrong searchPoint for scatter series
									e.point = elemObj;	//	#89 point reference in mouse event

								}

								if ((eventObject && !isPoint) || (eventObject && isNumber(eventObject.value))) { // #95 wrong reference for axis labels
									eventObject.value = elemObj.textStr; // #95 wrong reference for axis labels
									elemObj = eventObject;
								}

								if (elemObj && elemObj.textStr) { // labels
									elemObj.value = elemObj.textStr;
								}

								events[event].call(elemObj, e);

								return false;
							});
						}

						SVGelem[event] = function () {
							return true;
						};
					}
				})(action);
			}
		},
		eventElement: {
			/**
			* @typedef {Object} eventElement
			**/
			/**
			 * @description Extracts SVG elements from points
			 * @property {Object} eventsPoint events for point
			 * @property {Array} elementPoint array of SVG point elements
			 * @property {Object} eventObject object kept in this on i.e click
			 * @return {Object} { events: object, element: object }
			 * @memberof customEvents
			 **/
			addLabel: function () {
				var parent = this.parent,
					axis = this.axis,
					axisOptions = axis.options,
					eventsPoint = axisOptions.labels && axisOptions.labels.events,
					elementPoint = [this.label],
					len, i;

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

				return {
					eventsPoint: eventsPoint,
					elementPoint: elementPoint,
					eventObject: {
						axis: axis,
						isFirst: this.isFirst,
						isLast: this.isLast,
						chart: axis.chart,
						dateTimeLabelFormat: axisOptions.dateTimeLabelFormats,
						value: this.pos
					}
				};
			},
			/**
			 * @description Extracts SVG elements from title and subtitle
			 * @property {Object} events events for title
			 * @property {Array} elementPoint title SVG element
			 * @property {Object} eventsSubtitle events for subtitle
			 * @property {Array} elementSubtitle subtitle SVG element
			 * @return {Object} {event: object, element: object, eventsSubtitle: object, elementSubtitle: object }
			 * @memberof customEvents
			 **/
			setTitle: function () {
				var events = this.options.title && this.options.title.events,
					element = this.title,
					eventsSubtitle = this.options.subtitle && this.options.subtitle.events,
					elementSubtitle = this.subtitle;

				return {
					events: events,
					element: element,
					eventsSubtitle: eventsSubtitle,
					elementSubtitle: elementSubtitle
				};
			},
			/**
			 * @description Extracts SVG elements from dataLabels
			 * @property {Object} events events for dataLabels
			 * @property {Array} element dataLabels SVG element
			 * @return {Object} { events: object, element: object }
			 * @memberof customEvents
			 **/
			drawDataLabels: function () {
				var dataLabelsGroup = this.dataLabelsGroup;

				return {
					events: dataLabelsGroup ? this.options.dataLabels.events : UNDEFINED,
					element: dataLabelsGroup ? this.dataLabelsGroup : UNDEFINED
				};
			},
			/**
			 * @description Extracts SVG elements from axis title and stackLabels
			 * @property {Object} events events for axis title
			 * @property {Array} element axis title SVG element
			 * @property {Object} eventsPoint events for stacklabels
			 * @property {Array} elementPoint stacklabels SVG element
			 * @property {Object} eventsStackLabel events for stacklabels
			 * @property {Array} elementStackLabel stacklabels group SVG element
			 * @return {Object} { events: object, element: object, eventsPoint: object, elementPoint: object, eventsStackLabel: object, elementStackLabel: object }
			 * @memberof customEvents
			 **/
			render: function () {
				var stackLabels = this.options.stackLabels,
					events,
					element,
					eventsPoint,
					elementPoint,
					eventsStackLabel,
					elementStackLabel;

				if (this.axisTitle) {
					events = this.options.title.events;
					element = this.axisTitle;
				}

				if (stackLabels && stackLabels.enabled) {
					eventsPoint = stackLabels.events;
					elementPoint = this.stacks;
					eventsStackLabel = stackLabels.events;
					elementStackLabel = this.stackTotalGroup;
				}

				return {
					events: events,
					element: element,
					eventsPoint: eventsPoint,
					elementPoint: elementPoint,
					eventsStackLabel: eventsStackLabel,
					elementStackLabel: elementStackLabel
				};
			},
			/**
			 * @description Extracts SVG elements from series and series points
			 * @property {Object} events events for series
			 * @property {Array} element series SVG element
			 * @property {Object} events events for series points
			 * @property {Array} element series points SVG element
			 * @return {Object} { events: object, element: object, eventsPoint: object, elementPoint: object }
			 * @memberof customEvents
			 **/
			drawPoints: function () {
				var op = this.options,
					type = this.type,
					events = op.customEvents ? op.customEvents.series : op.events,
					element = this.group,
					eventsPoint = op.customEvents ? op.customEvents.point : op.point.events,
					elementPoint;

				if (defaultOptions[type] && defaultOptions[type].marker && !this.bubblePadding) {
					elementPoint = [this.markerGroup]; //	get markers when enabled
				} else {
					elementPoint = this.points; //	extract points
				}


				if (!this.kdTree && !this.buildingKdTree) {
                    this.buildKDTree(); //	#86, missing reference to point on first mouseover
                }

				return {
					events: events,
					element: element,
					eventsPoint: eventsPoint,
					elementPoint: elementPoint,
					eventObject: this,
					isSeries: true
				};
			},
			/**
			 * @description Extracts SVG elements from legend item
			 * @property {Object} events events for legend item
			 * @property {Array} element legend item SVG element
			 * @return {Object} { events: object, element: object }
			 * @memberof customEvents
			 **/
			renderItem: function () {
				return {
					events: this.options.itemEvents,
					element: this.group
				};
			},
			/**
			 * @description Extracts SVG elements from crosshair
			 * @property {Object} events events for crosshair
			 * @property {Array} element crosshair SVG element
			 * @return {Object} { events: object, element: object }
			 * @memberof customEvents
			 **/
			drawCrosshair: function () {
				var crosshair = this.options.crosshair;

				return {
					events: crosshair && crosshair.events,
					element: this.cross
				};
			}
		}
	};

	customEvents = HC.Chart.prototype.customEvent;
	customEvents.init();

}));