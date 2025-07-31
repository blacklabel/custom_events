import Highcharts from "highcharts";

declare module "highcharts" {
  interface LegendEventsOptions {
    events?: ElementEvents;     
  }

  interface Axis {
	  axisTitle: Highcharts.SVGElement;
	  labelGroup: Highcharts.SVGElement;
	}

  interface Series {
    group: Highcharts.SVGElement;
  }

  interface Point {
    dataLabel: Highcharts.SVGElement;
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

  export interface CrosshairOptions {
    events?: ElementEvents;
  }

  export interface SeriesOptionsType {
    events?: ElementEvents;
    dataLabels?: (DataLabelsOptions & { events?: ElementEvents });
  }

  export interface PlotLineOrBandOptions {
    events?: ElementEvents;
    label?: (PlotLineOrBandLabelOptions & { events?: ElementEvents });
  }

  export interface FlagsSeriesOptions {
    events?: ElementEvents;
  }
}
