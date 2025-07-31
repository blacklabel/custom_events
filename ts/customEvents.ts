import Highcharts, { Chart, SVGElement, SVGAttributes } from 'highcharts';

/**
* Custom events v4.0.0 (2025-07-30)
*
* (c) 2012-2025 Black Label
*
* License: Creative Commons Attribution (CC)
*/

/**
 * @namespace customEvents
 **/


type ElementEvents = {
	click?: (e: Event | PointerEvent) => void;
	dblclick?: (e: Event | PointerEvent) => void;
	contextmenu?: (e: Event | PointerEvent) => void;
	mouseover?: (e: Event | PointerEvent) => void;
	mouseout?: (e: Event | PointerEvent) => void;
	mousedown?: (e: Event | PointerEvent) => void;
	mousemove?: (e: Event | PointerEvent) => void;
};


export default function ObjectEventsPlugin(H: typeof Highcharts) {
	/**
	 * Binds DOM events to a Highcharts SVGElement safely,
	 * avoiding duplicate bindings.
	 *
	 * @param el The Highcharts SVGElement
	 * @param handlers An object mapping event names to callbacks
	 */
	function bindElementEvents(el: Highcharts.SVGElement | undefined, handlers?: ElementEvents) {
		if (!el || !handlers) return;

		Object.entries(handlers).forEach(([eventName, handler]) => {
			if (handler) {
				// Avoid double binding
				if (!(el as any)._eventBound) (el as any)._eventBound = {};
				if (!(el as any)._eventBound[eventName]) {
					H.addEvent(el.element, eventName, handler as any);
					(el as any)._eventBound[eventName] = true;
				}
			}
		});
	}

	H.addEvent(H.Chart, "load", function (this: Chart) {
		const chart = this;

		console.log(chart);

		// Title / Subtitle
		bindElementEvents(chart.title, chart.options.title?.events);
		bindElementEvents(chart.subtitle, chart.options.subtitle?.events);

		// Axes
		chart.axes.forEach(axis => {
			// TypeScript fix: axis.options.title may not have 'events' property in its type.
			// We need to safely access 'events' only if it exists, using type assertion or type guard.

			bindElementEvents(axis.axisTitle, axis.options.title?.events);

			// If you want to enable labelGroup events, you may need to extend the type for axis.options.labels as well:
			bindElementEvents(axis.labelGroup, axis.options.labels?.events);

			// For crosshair events, similar type assertion is needed:
			// if (axis.cross && axis.options.crosshair) {
			//   const crosshairOptions = axis.options.crosshair as { events?: ElementEvents };
			//   if (crosshairOptions.events) {
			//     bindElementEvents(axis.cross, crosshairOptions.events);
			//   }
			// }
			//});
			// }

			// axis.plotLinesAndBands?.forEach(plb => {
			//   bindElementEvents(plb.svgElem, plb.options.events);
			//   bindElementEvents(plb.label, plb.options.label?.events);
			// });
		});

		// Series
		  chart.series.forEach(series => {
			bindElementEvents(series.group, series.options.events);
			series.points.forEach(point => {
			  if (point.graphic) bindElementEvents(point.graphic, point.options?.events); // TODO: check if this is correct
			  //if (point.dataLabel) bindElementEvents(point.dataLabel, series.options.dataLabels?.events);
			});
		  });

		  // Legend is now enabled 
		  //bindElementEvents(chart.legend?.group, chart.options.legend?.events as ElementEvents);
	});
}


