import React, { useMemo } from "react";

import _ from "underscore";
import type { NumberValue } from "d3-scale";

import { TextMeasurer } from "metabase/visualizations/shared/types/measure-text";
import { ChartTicksFormatters } from "metabase/visualizations/shared/types/format";
import { HoveredData } from "metabase/visualizations/shared/types/events";
import { RowChartView, RowChartViewProps } from "../RowChartView/RowChartView";
import { ChartGoal } from "../../types/settings";
import { ContinuousScaleType } from "../../types/scale";
import {
  getMaxYValuesCount,
  getChartMargin,
  getRowChartGoal,
} from "./utils/layout";
import { getXTicks } from "./utils/ticks";
import { RowChartTheme, Series, StackOffset } from "./types";
import { calculateNonStackedBars, calculateStackedBars } from "./utils/data";
import { addSideSpacingForTicksAndLabels } from "./utils/scale";

const MIN_BAR_HEIGHT = 24;

const defaultFormatter = (value: any) => String(value);

export interface RowChartProps<TDatum> {
  width: number;
  height: number;

  data: TDatum[];
  series: Series<TDatum>[];
  seriesColors: Record<string, string>;

  trimData?: (data: TDatum[], maxLength: number) => TDatum[];

  goal: ChartGoal | null;
  theme: RowChartTheme;
  stackOffset: StackOffset;
  shouldShowDataLabels?: boolean;

  yLabel?: string;
  xLabel?: string;

  tickFormatters?: ChartTicksFormatters;
  labelsFormatter?: (value: NumberValue) => string;
  measureText: TextMeasurer;

  xScaleType?: ContinuousScaleType;

  style?: React.CSSProperties;

  hoveredData?: HoveredData | null;
  onClick?: RowChartViewProps["onClick"];
  onHover?: RowChartViewProps["onHover"];
}

export const RowChart = <TDatum,>({
  width,
  height,

  data,
  trimData,
  series: multipleSeries,
  seriesColors,

  goal,
  theme,
  stackOffset,
  shouldShowDataLabels,

  xLabel,
  yLabel,

  tickFormatters = {
    xTickFormatter: defaultFormatter,
    yTickFormatter: defaultFormatter,
  },
  labelsFormatter = defaultFormatter,

  xScaleType = "linear",

  measureText,

  style,

  hoveredData,
  onClick,
  onHover,
}: RowChartProps<TDatum>) => {
  const maxYValues = useMemo(
    () =>
      getMaxYValuesCount(
        height,
        MIN_BAR_HEIGHT,
        stackOffset != null,
        multipleSeries.length,
      ),
    [height, multipleSeries.length, stackOffset],
  );

  const trimmedData = trimData?.(data, maxYValues) ?? data;

  const { xTickFormatter, yTickFormatter } = tickFormatters;

  const margin = useMemo(
    () =>
      getChartMargin(
        trimmedData,
        multipleSeries,
        yTickFormatter,
        theme.axis.ticks,
        theme.axis.label,
        goal != null,
        measureText,
        xLabel,
        yLabel,
      ),
    [
      trimmedData,
      multipleSeries,
      yTickFormatter,
      theme.axis.ticks,
      theme.axis.label,
      goal,
      measureText,
      xLabel,
      yLabel,
    ],
  );

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const additionalXValues = useMemo(
    () => (goal != null ? [goal.value ?? 0] : []),
    [goal],
  );

  const { xScale, yScale, xDomain, seriesData } = useMemo(
    () =>
      stackOffset != null
        ? calculateStackedBars<TDatum>({
            data: trimmedData,
            multipleSeries,
            additionalXValues,
            stackOffset,
            innerWidth,
            innerHeight,
            seriesColors,
            xScaleType,
          })
        : calculateNonStackedBars<TDatum>({
            data: trimmedData,
            multipleSeries,
            additionalXValues,
            innerWidth,
            innerHeight,
            seriesColors,
            xScaleType,
          }),
    [
      additionalXValues,
      innerHeight,
      innerWidth,
      multipleSeries,
      seriesColors,
      stackOffset,
      trimmedData,
      xScaleType,
    ],
  );

  const paddedXScale = useMemo(
    () =>
      addSideSpacingForTicksAndLabels(
        xScale,
        xDomain,
        measureText,
        theme.axis.ticks,
        xTickFormatter,
        theme.dataLabels,
        labelsFormatter,
        shouldShowDataLabels,
      ),
    [
      labelsFormatter,
      measureText,
      shouldShowDataLabels,
      theme.axis.ticks,
      theme.dataLabels,
      xDomain,
      xScale,
      xTickFormatter,
    ],
  );

  const xTicks = useMemo(
    () =>
      getXTicks(
        theme.axis.ticks,
        innerWidth,
        paddedXScale,
        xTickFormatter,
        measureText,
        xScaleType,
      ),
    [
      innerWidth,
      measureText,
      theme.axis.ticks,
      paddedXScale,
      xScaleType,
      xTickFormatter,
    ],
  );

  const rowChartGoal = useMemo(
    () => getRowChartGoal(goal, theme.goal, measureText, paddedXScale),
    [goal, measureText, theme.goal, paddedXScale],
  );

  return (
    <RowChartView
      style={style}
      isStacked={stackOffset != null}
      seriesData={seriesData}
      innerHeight={innerHeight}
      innerWidth={innerWidth}
      margin={margin}
      theme={theme}
      width={width}
      height={height}
      xScale={paddedXScale}
      yScale={yScale}
      goal={rowChartGoal}
      hoveredData={hoveredData}
      yTickFormatter={yTickFormatter}
      xTickFormatter={xTickFormatter}
      labelsFormatter={labelsFormatter}
      onClick={onClick}
      onHover={onHover}
      xTicks={xTicks}
      shouldShowDataLabels={shouldShowDataLabels}
      yLabel={yLabel}
      xLabel={xLabel}
    />
  );
};
