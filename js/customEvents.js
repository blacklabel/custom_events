/**
----
*
* Custom Events v4.0.1 (2025-09-18)
*
* (c) 2012-2025 Black Label
*
* License: Creative Commons Attribution (CC)
*/
(function (factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory;
  } else {
    factory(Highcharts);
  }
}(function (Highcharts) {

const DEFAULT_HC_POINT_EVENTS = new Set([
    'click', 'mouseover', 'mouseout', 'mouseOver', 'mouseOut',
    'select', 'unselect', 'remove', 'update',
    'dragStart', 'drag', 'drop'
]);
function filterCustomOnlyEvents(events, defaultEvents = DEFAULT_HC_POINT_EVENTS) {
    const result = {};
    // Handle null/undefined events
    if (!events) {
        return result;
    }
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
 * 
 * ObjectEventsPlugin(Highcharts);
 * ```
 */
function ObjectEventsPlugin(H) {
    // This is a global flag to prevent the plugin from being loaded more than once
    if (H.customEventsPluginLoaded) {
        return;
    }
    else {
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
    function bindElementEvents(el, handlers, boundEvents) {
        var _a;
        // Safety check for JS callers bypassing TS type checks
        if (!el || !handlers || !boundEvents)
            return;
        Object.entries(handlers).forEach(([eventName, handler]) => {
            var _a;
            if (handler) {
                // Avoid double binding
                (_a = el._eventBound) !== null && _a !== void 0 ? _a : (el._eventBound = {});
                if (!el._eventBound[eventName] && !el.element[`on${eventName}`]) {
                    // Create a wrapper function that preserves the Highcharts SVGElement as 'this'
                    const wrappedHandler = function (event) {
                        // Call the original handler with the Highcharts SVGElement as 'this'
                        return handler.call(el, event);
                    };
                    const targetElement = 'axis' in el ? el.element.element : el.element;
                    H.addEvent(targetElement, eventName, wrappedHandler);
                    el._eventBound[eventName] = true;
                    // Track for cleanup
                    boundEvents.push({
                        element: targetElement,
                        eventName: eventName,
                        handler: wrappedHandler
                    });
                }
            }
        });
        // Mobile support
        if (handlers.click && !((_a = el._eventBound) === null || _a === void 0 ? void 0 : _a.touchstart)) {
            const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            if (isTouchDevice) {
                // Wrapper for touchstart to preserve SVGElement 'this'
                const wrappedTouchHandler = function (event) {
                    // Call the original click handler with the Highcharts SVGElement as 'this'
                    return handlers.click.call(el, event);
                };
                const targetElement = 'axis' in el ? el.element.element : el.element;
                H.addEvent(targetElement, 'touchstart', wrappedTouchHandler);
                el._eventBound.touchstart = true;
                // Track for cleanup
                boundEvents.push({
                    element: targetElement,
                    eventName: 'touchstart',
                    handler: wrappedTouchHandler
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
    function cleanupEvents(boundEvents) {
        boundEvents.forEach(({ element, eventName, handler }) => {
            if (element && element.element) {
                H.removeEvent(element.element, eventName, handler);
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
    function bindChartEvents(chart) {
        var _a, _b, _c, _d, _e, _f;
        // Initialize bound events tracking for this chart if not exists
        (_a = chart._customEventsBound) !== null && _a !== void 0 ? _a : (chart._customEventsBound = []);
        const chartEvents = (_b = chart.options.chart) === null || _b === void 0 ? void 0 : _b.events;
        // Filter out events that Highcharts already handle
        const customOnlyEvents = filterCustomOnlyEvents(chartEvents);
        // Chart background events
        if (chart.chartBackground) {
            bindElementEvents(chart.chartBackground, customOnlyEvents, chart._customEventsBound);
        }
        // Title / Subtitle
        if (chart.title) {
            bindElementEvents(chart.title, (_c = chart.options.title) === null || _c === void 0 ? void 0 : _c.events, chart._customEventsBound);
        }
        if (chart.subtitle) {
            bindElementEvents(chart.subtitle, (_d = chart.options.subtitle) === null || _d === void 0 ? void 0 : _d.events, chart._customEventsBound);
        }
        // Legend
        if ((_e = chart.legend) === null || _e === void 0 ? void 0 : _e.group) {
            bindElementEvents(chart.legend.group, (_f = chart.options.legend) === null || _f === void 0 ? void 0 : _f.events, chart._customEventsBound);
        }
        // Axes
        chart.axes.forEach(axis => {
            var _a, _b;
            if (axis.options.visible) {
                if (axis.axisTitle) {
                    // Axis Title
                    bindElementEvents(axis.axisTitle, (_a = axis.options.title) === null || _a === void 0 ? void 0 : _a.events, chart._customEventsBound);
                }
                // Axis Labels
                if (axis.ticks && axis.tickPositions) {
                    const tickPositions = axis.tickPositions;
                    tickPositions.forEach(pos => {
                        var _a, _b;
                        const tick = axis.ticks[pos];
                        if (tick && ((_a = tick.label) === null || _a === void 0 ? void 0 : _a.element)) {
                            const customAxisLabelObject = {
                                element: tick.label,
                                axis: axis,
                                isFirst: tick.isFirst,
                                isLast: tick.isLast,
                                chart: axis.chart,
                                dateTimeLabelFormat: axis.options.dateTimeLabelFormats,
                                value: tick.pos,
                                pos: tick.pos
                            };
                            bindElementEvents(customAxisLabelObject, (_b = axis.options.labels) === null || _b === void 0 ? void 0 : _b.events, chart._customEventsBound);
                        }
                    });
                }
                // AxisPlotLines and PlotBands Labels
                if (axis.plotLinesAndBands) {
                    axis.plotLinesAndBands.forEach((plb) => {
                        var _a, _b;
                        if (plb.label) {
                            bindElementEvents(plb.label, (_b = (_a = plb.options) === null || _a === void 0 ? void 0 : _a.label) === null || _b === void 0 ? void 0 : _b.events, chart._customEventsBound);
                        }
                    });
                }
                // Y Axis Stack Labels
                if (axis.coll === 'yAxis' && ((_b = axis.stacking) === null || _b === void 0 ? void 0 : _b.stackTotalGroup)) {
                    const allStacks = axis.stacking.stacks;
                    Object.keys(allStacks).forEach(stackKey => {
                        const stacks = allStacks[stackKey];
                        Object.keys(stacks).forEach(xValue => {
                            var _a, _b;
                            const stack = stacks[xValue];
                            if ((_a = stack.label) === null || _a === void 0 ? void 0 : _a.element) {
                                bindElementEvents(stack.label, (_b = axis.options.stackLabels) === null || _b === void 0 ? void 0 : _b.events, chart._customEventsBound);
                            }
                        });
                    });
                }
            }
        });
        // Series Events
        chart.series.forEach(series => {
            var _a;
            const seriesEvents = series.options.events;
            // Filter out events that Highcharts already handle
            const customOnlyEvents = filterCustomOnlyEvents(seriesEvents);
            if (series.group) {
                if (Object.keys(customOnlyEvents).length > 0) {
                    bindElementEvents(series.group, customOnlyEvents, chart._customEventsBound);
                }
            }
            // Series DataLabels Events
            if (series.dataLabelsGroup) {
                bindElementEvents(series.dataLabelsGroup, (_a = series.options.dataLabels) === null || _a === void 0 ? void 0 : _a.events, chart._customEventsBound);
            }
            // Point Events
            series.data.forEach(point => {
                var _a;
                // �� POINT EVENTS: Only add non-default events
                if (point.graphic && ((_a = series.options.point) === null || _a === void 0 ? void 0 : _a.events)) {
                    const pointEvents = series.options.point.events;
                    // Filter out events that Highcharts already handle
                    const customOnlyEvents = filterCustomOnlyEvents(pointEvents);
                    if (Object.keys(customOnlyEvents).length > 0) {
                        bindElementEvents(point.graphic, customOnlyEvents, chart._customEventsBound);
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
    const lifecycleHandler = function () {
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
    H.addEvent(H.Chart, "destroy", function () {
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
        H.wrap(H.Axis.prototype, 'addPlotBand', function (proceed, options) {
            var _a;
            const result = proceed.apply(this, Array.prototype.slice.call(arguments, 1));
            // Bind events to the new plot band if it has a label
            if (result && result.label && this.chart) {
                bindElementEvents(result.label, (_a = options.label) === null || _a === void 0 ? void 0 : _a.events, this.chart._customEventsBound);
            }
            return result;
        });
        // Wrap addPlotLine
        H.wrap(H.Axis.prototype, 'addPlotLine', function (proceed, options) {
            var _a;
            const result = proceed.apply(this, Array.prototype.slice.call(arguments, 1));
            // Bind events to the new plot line if it has a label
            if (result && result.label && this.chart) {
                bindElementEvents(result.label, (_a = options.label) === null || _a === void 0 ? void 0 : _a.events, this.chart._customEventsBound);
            }
            return result;
        });
        H.addEvent(H.Axis, "afterDrawCrosshair", function () {
            var _a, _b;
            if (this.cross && this.crosshair && ((_a = this.chart) === null || _a === void 0 ? void 0 : _a._customEventsBound)) {
                (_b = this.cross) === null || _b === void 0 ? void 0 : _b.css({ 'pointer-events': 'auto' });
                bindElementEvents(this.cross, this.crosshair.events, this.chart._customEventsBound);
            }
        });
    }
}

ObjectEventsPlugin(Highcharts);
}));