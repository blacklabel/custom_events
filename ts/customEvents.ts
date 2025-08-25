import type Highcharts from 'highcharts';
import type { Chart, YAxisOptions } from 'highcharts';
import "./HighchartsConfig";


const DEFAULT_HC_POINT_EVENTS = new Set([
	'click', 'mouseover', 'mouseout', 'mouseOver', 'mouseOut',
	'select', 'unselect', 'remove', 'update',
	'dragStart', 'drag', 'drop'
]);

function filterCustomOnlyEvents(
	events: Record<string, Highcharts.EventCallbackFunction<Highcharts.SVGElement>>,
	defaultEvents: Set<string> = DEFAULT_HC_POINT_EVENTS
): Record<string, Highcharts.EventCallbackFunction<Highcharts.SVGElement>> {
	const result: Record<string, Highcharts.EventCallbackFunction<Highcharts.SVGElement>> = {};
	for (const [name, handler] of Object.entries(events)) {
		if (!defaultEvents.has(name)) {
			result[name] = handler;
		}
	}
	return result;
}

/**
 * @namespace customEvents
 * @description Plugin that adds custom event handling to Highcharts elements
 */

/**
 * Highcharts Custom Events Plugin
 * 
 * This plugin extends Highcharts to support custom events on various chart elements
 * including titles, axis elements, plot lines/bands, and data labels.
 * 
 * @param {typeof Highcharts} H - The Highcharts library instance
 * @returns {void}
 * 
 * @example
 * ```javascript
 * import ObjectEventsPlugin from './customEvents';
 * ObjectEventsPlugin(Highcharts);
 * ```
 */
export default function ObjectEventsPlugin(H: typeof Highcharts) {
	// This is a global flag to prevent the plugin from being loaded more than once
	if (H.customEventsPluginLoaded) {
		return;
	} else {
		H.customEventsPluginLoaded = true;
	}

	/**
	 * Binds DOM events to a Highcharts SVGElement safely,
	 * avoiding duplicate bindings and tracking for cleanup.
	 *
	 * @param {Highcharts.SVGElement} el - The Highcharts SVGElement to bind events to
	 * @param {Highcharts.ElementEvents} [handlers] - Object mapping event names to 
	 * callback functions
	 * @param {Highcharts.BoundEvent[]} boundEvents - Array to track bound events for cleanup
	 * @returns {void}
	 * 
	 * @example
	 * ```javascript
	 * bindElementEvents(chart.title, {
	 *   click: function(e) { console.log('Title clicked!'); },
	 *   mouseover: function(e) { console.log('Title hovered!'); }
	 * }, boundEvents);
	 * ```
	 */

	function bindElementEvents(
		el: Highcharts.SVGElement,
		handlers: Highcharts.ElementEvents,
		boundEvents: Highcharts.BoundEvent[]
	) {
		// Safety check for JS callers bypassing TS type checks
		if (!el || !handlers || !boundEvents) return;

		Object.entries(handlers).forEach(([eventName, handler]) => {
			if (handler) {
				// Avoid double binding
				el._eventBound ??= {};
				if (!el._eventBound[eventName] && !el.element[`on${eventName}`]) {
					H.addEvent(el.element, eventName, handler as EventListener);
					el._eventBound[eventName] = true;

					// Track for cleanup
					boundEvents.push({
						element: el,
						eventName: eventName,
						handler: handler
					});
				}
			}
		});

		// Mobile support
		if (handlers.click && !el._eventBound?.touchstart) {
			const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

			if (isTouchDevice) {
				H.addEvent(el.element, 'touchstart', handlers.click as EventListener);
				el._eventBound.touchstart = true;

				boundEvents.push({
					element: el,
					eventName: 'touchstart',
					handler: handlers.click
				});
			}
		}
	}

	/**
	 * Removes all bound events from a chart to prevent memory leaks
	 * 
	 * @param {Highcharts.BoundEvent[]} boundEvents - Array of bound events to remove
	 * @returns {void}
	 */
	function cleanupEvents(boundEvents: Highcharts.BoundEvent[]) {
		boundEvents.forEach(({ element, eventName, handler }) => {
			if (element && element.element) {
				H.removeEvent(element.element, eventName, handler as EventListener);
				// Clear tracking
				if (element._eventBound) {
					delete element._eventBound[eventName];
				}
			}
		});
		boundEvents.length = 0; // Clear the array
	}

	/**
	 * Binds events to all chart elements (used on load and redraw)
	 * 
	 * @param {Chart} chart - The chart instance
	 * @returns {void}
	 */
	function bindChartEvents(chart: Chart) {
		// Initialize bound events tracking for this chart if not exists
		chart._customEventsBound ??= [];

		const chartEvents = chart.options.chart?.events;

		// Filter out events that Highcharts already handle
		const customOnlyEvents = filterCustomOnlyEvents(
			chartEvents as Record<string, Highcharts.EventCallbackFunction<Highcharts.SVGElement>>
		);

		// Chart background events
		if (chart.chartBackground) {
			bindElementEvents(
				chart.chartBackground,
				customOnlyEvents,
				chart._customEventsBound
			);
		}

		// Title / Subtitle
		if (chart.title) {
			bindElementEvents(
				chart.title,
				chart.options.title?.events,
				chart._customEventsBound
			);
		}
		if (chart.subtitle) {
			bindElementEvents(
				chart.subtitle,
				chart.options.subtitle?.events,
				chart._customEventsBound
			);
		}

		// Legend
		if (chart.legend?.group) {
			bindElementEvents(
				chart.legend.group,
				chart.options.legend?.events as Highcharts.ElementEvents,
				chart._customEventsBound
			);
		}

		// Axes
		chart.axes.forEach(axis => {
			// Axis Title
			bindElementEvents(
				axis.axisTitle,
				axis.options.title?.events,
				chart._customEventsBound
			);

			// Axis Labels
			bindElementEvents(
				axis.labelGroup,
				axis.options.labels?.events,
				chart._customEventsBound
			);

			// AxisPlotLines and PlotBands Labels
			if (axis.plotLinesAndBands) {
				axis.plotLinesAndBands.forEach((plb: Highcharts.PlotLineOrBand) => {
					if (plb.label) {
						bindElementEvents(
							plb.label,
							plb.options?.label?.events,
							chart._customEventsBound
						);
					}
				});
			}

			// Y Axis Stack Labels
			if (axis.coll === 'yAxis' && axis.stacking?.stackTotalGroup) {
				bindElementEvents(
					axis.stacking.stackTotalGroup,
					(axis.options as YAxisOptions).stackLabels?.events,
					chart._customEventsBound
				);
			}

		});

		// Series Events
		chart.series.forEach(series => {
			const seriesEvents = series.options.events;

			// Filter out events that Highcharts already handle
			const customOnlyEvents = filterCustomOnlyEvents(
				seriesEvents as Record<
					string, 
					Highcharts.EventCallbackFunction<Highcharts.SVGElement>
				>
			);

			if (series.group) {
				if (Object.keys(customOnlyEvents).length > 0) {
					bindElementEvents(
						series.group,
						customOnlyEvents,
						chart._customEventsBound
					);
				}
			}

			// Series DataLabels Events
			if (series.dataLabelsGroup) {
				bindElementEvents(
					series.dataLabelsGroup,
					series.options.dataLabels?.events,
					chart._customEventsBound
				);
			}

			// Point Events
			series.data.forEach(point => {
				// �� POINT EVENTS: Only add non-default events
				if (point.graphic && series.options.point?.events) {
					const pointEvents = series.options.point.events;

					// Filter out events that Highcharts already handle
					const customOnlyEvents = filterCustomOnlyEvents(
						pointEvents
					);

					if (Object.keys(customOnlyEvents).length > 0) {
						bindElementEvents(
							point.graphic,
							customOnlyEvents,
							chart._customEventsBound
						);
					}

				}
			});
		});
	}

	/**
	 * Unified lifecycle handler for chart load and redraw events
	 * 
	 * This function handles both initial load and redraw scenarios by cleaning up
	 * existing events and rebinding to all elements (including new ones).
	 * 
	 * @param {Chart} this - The chart instance
	 * @returns {void}
	 */
	const lifecycleHandler = function (this: Chart) {
		if (this._customEventsBound) {
			cleanupEvents(this._customEventsBound);
		}
		bindChartEvents(this);
	};

	H.addEvent(H.Chart, "load", lifecycleHandler);
	H.addEvent(H.Chart, "redraw", lifecycleHandler);

	/**
	 * Chart destroy event handler that cleans up all bound events
	 * 
	 * This function is called when a chart is destroyed to prevent memory leaks
	 * by removing all custom event listeners.
	 * 
	 * @param {Chart} this - The chart instance
	 * @returns {void}
	 */
	H.addEvent(H.Chart, "destroy", function (this: Chart) {
		const chart = this;

		// Clean up all bound events
		if (chart._customEventsBound) {
			cleanupEvents(chart._customEventsBound);
			delete chart._customEventsBound;
		}
	});

	/**
	 * Wrap Axis.addPlotBand and Axis.addPlotLine to bind events to new plot bands/lines
	 * 
	 * This ensures that dynamically added plot bands and lines get event bindings.
	 */
	if (H.Axis && H.Axis.prototype) {
		// Wrap addPlotBand
		H.wrap(
			H.Axis.prototype,
			'addPlotBand',
			function (
				this: Highcharts.Axis,
				proceed: Function,
				options: Highcharts.AxisPlotBandsOptions
			) {
				const result: Highcharts.PlotLineOrBand = proceed.apply(
					this,
					Array.prototype.slice.call(arguments, 1)
				);

				// Bind events to the new plot band if it has a label
				if (result && result.label && this.chart) {
					bindElementEvents(
						result.label,
						options.label?.events,
						this.chart._customEventsBound
					);
				}

				return result;
			});

		// Wrap addPlotLine
		H.wrap(
			H.Axis.prototype,
			'addPlotLine',
			function (
				this: Highcharts.Axis,
				proceed: Function,
				options: Highcharts.AxisPlotBandsOptions
			) {
				const result: Highcharts.PlotLineOrBand = proceed.apply(
					this,
					Array.prototype.slice.call(arguments, 1)
				);

				// Bind events to the new plot line if it has a label
				if (result && result.label && this.chart) {
					bindElementEvents(
						result.label,
						options.label?.events,
						this.chart._customEventsBound
					);
				}

				return result;
			});

		H.addEvent(H.Axis, "afterDrawCrosshair", function (this: Highcharts.Axis) {
			if (this.cross && this.crosshair && this.chart?._customEventsBound) {
				this.cross?.css({ 'pointer-events': 'auto' });
				bindElementEvents(
					this.cross,
					(this.crosshair as Highcharts.AxisCrosshairOptions).events,
					this.chart._customEventsBound
				);
			}
		});
	}
}