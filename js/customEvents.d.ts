import Highcharts from "highcharts";

// Plugin function
declare function HC_customEvents(H: typeof Highcharts): void;
export default HC_customEvents;

// ---- Highcharts augmentations ----
declare module "highcharts" {
    export let customEventsPluginLoaded: boolean;
  
    interface Options {
      events?: ElementEvents;
    }
  
    interface Axis {
      axisTitle: Highcharts.SVGElement;
      labelGroup: Highcharts.SVGElement;
      plotLinesAndBands?: PlotLineOrBand[];
      cross?: Highcharts.SVGElement;
      stacking?: {
        stackTotalGroup?: Highcharts.SVGElement;
        stacks?: Record<string, Record<string, { label: Highcharts.SVGElement }>>;
      },
      stackLabels?: {
        events?: ElementEvents;
      }
    }
  
    export interface customAxisLabel {
      element: Highcharts.SVGElement;
      axis: Highcharts.Axis;
      isFirst: boolean;
      isLast: boolean;
      chart: Highcharts.Chart;
      dateTimeLabelFormat: Highcharts.DateTimeLabelFormats;
      value: number;
      pos: number;
      _eventBound?: Record<string, boolean>;
    }
  
    interface Series {
      group: Highcharts.SVGElement;
      dataLabelsGroup: Highcharts.SVGElement;
    }
  
    interface Point {
      dataLabel: Highcharts.SVGLabel;
    }
  
    interface Chart {
      chartBackground: Highcharts.SVGElement;
      _customEventsBound?: BoundEvent[];
    }
  
    interface SVGElement {
      _eventBound?: Record<string, boolean>;
    }
  
    export interface SeriesPointOptions {
      events?: PointEventsOptions | ElementEvents;
    }
  
    interface SeriesOptions {
      /** Allow dataLabels on all series options */
      dataLabels?: Highcharts.DataLabelsOptionsObject | Highcharts.DataLabelsOptionsObject[];
      point?: SeriesPointOptions;
    }
  
    export interface ElementEvents {
      click?: (this: Highcharts.SVGElement, e: Event | PointerEvent) => void;
      dblclick?: (this: Highcharts.SVGElement, e: Event | PointerEvent) => void;
      contextmenu?: (this: Highcharts.SVGElement, e: Event | PointerEvent) => void;
      mouseover?: (this: Highcharts.SVGElement, e: Event | PointerEvent) => void;
      mouseout?: (this: Highcharts.SVGElement, e: Event | PointerEvent) => void;
      mousedown?: (this: Highcharts.SVGElement, e: Event | PointerEvent) => void;
      mousemove?: (this: Highcharts.SVGElement, e: Event | PointerEvent) => void;
    }
  
    export interface BoundEvent {
      element: Highcharts.SVGElement | Highcharts.HTMLElement;
      eventName: string;
      handler: (this: Highcharts.SVGElement, e: Event | PointerEvent) => void;
    }
  
    export interface PlotLineOrBand {
      label?: Highcharts.SVGElement;
      options?: {
        label?: {
          events?: ElementEvents;
        };
      };
    }
  
    export interface PlotOptions {
      label?: {
        events?: ElementEvents;
      };
    }
  
    export interface ZAxisOptions {
      crosshair?: Highcharts.AxisCrosshairOptions;
    }
  
    export interface AxisCrosshairOptions {
      events?: ElementEvents;
    }
  
    export interface YAxisStackLabelsOptions {
      events?: ElementEvents;
    }
  
    // Extend plot line/band label options to include events
    interface XAxisPlotBandsLabelOptions {
      events?: ElementEvents;
    }
  
    interface YAxisPlotBandsLabelOptions {
      events?: ElementEvents;
    }
  
    interface ZAxisPlotBandsLabelOptions {
      events?: ElementEvents;
    }
  
    interface XAxisPlotLinesLabelOptions {
      events?: ElementEvents;
    }
  
    interface YAxisPlotLinesLabelOptions {
      events?: ElementEvents;
    }
  
    interface ZAxisPlotLinesLabelOptions {
      events?: ElementEvents;
    }
  
    export interface TitleOptions {
      events?: ElementEvents;
    }
  
    export interface SubtitleOptions {
      events?: ElementEvents;
    }
  
    export interface XAxisTitleOptions {
      events?: ElementEvents;
    }
  
    export interface YAxisTitleOptions {
      events?: ElementEvents;
    }
  
    export interface ZAxisTitleOptions {
      events?: ElementEvents;
    }
  
    export interface XAxisLabelsOptions {
      events?: ElementEvents;
    }
  
    export interface YAxisLabelsOptions {
      events?: ElementEvents;
    }
  
    export interface ZAxisLabelsOptions {
      events?: ElementEvents;
    }
  }
  