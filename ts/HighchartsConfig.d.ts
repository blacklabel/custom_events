import Highcharts from "highcharts";

declare module "highcharts" {
  interface Axis {
	  axisTitle: Highcharts.SVGElement;
	  labelGroup: Highcharts.SVGElement;
	  plotLinesAndBands?: PlotLineOrBand[];
	  cross?: Highcharts.SVGElement;
    stacking?: {
      stackTotalGroup?: Highcharts.SVGElement;
    },
    stackLabels?: {
      events?: ElementEvents;
    }
	}

  interface Series {
    group: Highcharts.SVGElement;
    dataLabelsGroup: Highcharts.SVGElement;
  }

  interface Chart {
    _customEventsBound?: BoundEvent[];
  }

  interface SVGElement {
    _eventBound?: Record<string, boolean>;
  }

  interface SeriesOptions {
    /** Allow dataLabels on all series options */
    dataLabels?: Highcharts.DataLabelsOptionsObject | Highcharts.DataLabelsOptionsObject[];
  }

  export interface ElementEvents {
    click?: (e: Event | PointerEvent) => void;
    dblclick?: (e: Event | PointerEvent) => void;
    contextmenu?: (e: Event | PointerEvent) => void;
    mouseover?: (e: Event | PointerEvent) => void;
    mouseout?: (e: Event | PointerEvent) => void;
    mousedown?: (e: Event | PointerEvent) => void;
    mousemove?: (e: Event | PointerEvent) => void;
  }

  export interface BoundEvent {
    element: Highcharts.SVGElement;
    eventName: string;
    handler: (e: Event | PointerEvent) => void;
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
