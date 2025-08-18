//TODO: Use this file in customEvents.ts
const DEFAULT_HC_POINT_EVENTS = new Set([
    'click', 'mouseover', 'mouseout', 'mouseOver', 'mouseOut',
    'select', 'unselect', 'remove', 'update',
    'dragStart', 'drag', 'drop'
]);

export function filterCustomOnlyEvents(
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
