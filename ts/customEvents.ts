import Highcharts, { Chart, SVGElement, SVGAttributes } from 'highcharts';

/**
* Custom events v4.0.0 (2025-07-30)
*
* (c) 2012-2025 Black Label
* Created by: Dominik Chudy
*
* License: Creative Commons Attribution (CC)
*/

/**
 * @namespace customEvents
 * @description Plugin that adds custom event handling to Highcharts elements
 */

/**
 * Type definition for element event handlers
 * @typedef {Object} ElementEvents
 * @property {Function} [click] - Click event handler
 * @property {Function} [dblclick] - Double click event handler
 * @property {Function} [contextmenu] - Right click event handler
 * @property {Function} [mouseover] - Mouse over event handler
 * @property {Function} [mouseout] - Mouse out event handler
 * @property {Function} [mousedown] - Mouse down event handler
 * @property {Function} [mousemove] - Mouse move event handler
 */
type ElementEvents = {
	click?: (e: Event | PointerEvent) => void;
	dblclick?: (e: Event | PointerEvent) => void;
	contextmenu?: (e: Event | PointerEvent) => void;
	mouseover?: (e: Event | PointerEvent) => void;
	mouseout?: (e: Event | PointerEvent) => void;
	mousedown?: (e: Event | PointerEvent) => void;
	mousemove?: (e: Event | PointerEvent) => void;
};

/**
 * Interface for tracking bound events for cleanup
 */
interface BoundEvent {
	element: Highcharts.SVGElement;
	eventName: string;
	handler: Function;
}

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
	/**
	 * Binds DOM events to a Highcharts SVGElement safely,
	 * avoiding duplicate bindings and tracking for cleanup.
	 *
	 * @param {Highcharts.SVGElement | undefined} el - The Highcharts SVGElement to bind events to
	 * @param {ElementEvents} [handlers] - Object mapping event names to callback functions
	 * @param {BoundEvent[]} boundEvents - Array to track bound events for cleanup
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
	function bindElementEvents(el: Highcharts.SVGElement | undefined, handlers?: ElementEvents, boundEvents: BoundEvent[] = []) {
		if (!el || !handlers) return;

		Object.entries(handlers).forEach(([eventName, handler]) => {
			if (handler) {
				// Avoid double binding
				if (!(el as any)._eventBound) (el as any)._eventBound = {};
				if (!(el as any)._eventBound[eventName]) {
					H.addEvent(el.element, eventName, handler as any);
					(el as any)._eventBound[eventName] = true;
					
					// Track for cleanup
					boundEvents.push({
						element: el,
						eventName: eventName,
						handler: handler
					});
				}
			}
		});
	}

	/**
	 * Removes all bound events from a chart to prevent memory leaks
	 * 
	 * @param {BoundEvent[]} boundEvents - Array of bound events to remove
	 * @returns {void}
	 */
	function cleanupEvents(boundEvents: BoundEvent[]) {
		boundEvents.forEach(({ element, eventName, handler }) => {
			if (element && element.element) {
				H.removeEvent(element.element, eventName, handler as any);
				// Clear tracking
				if ((element as any)._eventBound) {
					delete (element as any)._eventBound[eventName];
				}
			}
		});
		boundEvents.length = 0; // Clear the array
	}

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
		if ((chart as any)._customEventsBound) {
			cleanupEvents((chart as any)._customEventsBound);
			delete (chart as any)._customEventsBound;
		}
	});

	/**
	 * Chart load event handler that binds custom events to chart elements
	 * 
	 * This function is called when a chart is loaded and sets up event bindings
	 * for titles, subtitles, axes, plot lines/bands, and data labels.
	 * 
	 * @param {Chart} this - The chart instance
	 * @returns {void}
	 */
	H.addEvent(H.Chart, "load", function (this: Chart) {
		const chart = this;
		
		// Initialize bound events tracking for this chart
		(chart as any)._customEventsBound = [];

		// Title / Subtitle
		bindElementEvents(chart.title, chart.options.title?.events, (chart as any)._customEventsBound);
		bindElementEvents(chart.subtitle, chart.options.subtitle?.events, (chart as any)._customEventsBound);

		// Axes
		chart.axes.forEach(axis => {
			// Axis Title
			bindElementEvents(axis.axisTitle, axis.options.title?.events, (chart as any)._customEventsBound);

			// Axis Labels
			bindElementEvents(axis.labelGroup, axis.options.labels?.events, (chart as any)._customEventsBound);

			// AxisPlotLines and PlotBands Labels
			if ((axis as any).plotLinesAndBands) {
				(axis as any).plotLinesAndBands.forEach((plb: any) => {
					if (plb.label) {
						bindElementEvents(plb.label, plb.options.label?.events, (chart as any)._customEventsBound);
					}
				});
			}
		});

		// Series DataLabels
		chart.series.forEach(series => {
			bindElementEvents(series.dataLabelsGroup, series.options.dataLabels?.events, (chart as any)._customEventsBound);
		});
	});
}