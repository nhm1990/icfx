import { scaleLinear } from 'd3-scale'
import { interpolateRgb } from 'd3-interpolate'

/**
 * Maps a severity index (0..maxIdx) to a color from green → yellow → red.
 * null/undefined → gray (unanswered)
 */
export function severityColor(
  selectedIdx: number | null | undefined,
  optionsCount: number
): string {
  if (selectedIdx == null || optionsCount <= 1) return '#e2e2e2' // unanswered/gray

  const t = selectedIdx / (optionsCount - 1) // 0..1

  const colorScale = scaleLinear<string>()
    .domain([0, 0.5, 1])
    .range(['#22c55e', '#eab308', '#ef4444']) // green → yellow → red
    .interpolate(interpolateRgb)

  return colorScale(t)
}

/**
 * Slightly darker version for hover/active states
 */
export function severityColorDark(
  selectedIdx: number | null | undefined,
  optionsCount: number
): string {
  if (selectedIdx == null || optionsCount <= 1) return '#c5c5c5'

  const t = selectedIdx / (optionsCount - 1)

  const colorScale = scaleLinear<string>()
    .domain([0, 0.5, 1])
    .range(['#16a34a', '#ca8a04', '#dc2626'])
    .interpolate(interpolateRgb)

  return colorScale(t)
}

/** Section-level hue for the ring label/border */
export const sectionColors = ['#6366f1', '#f59e0b', '#06b6d4', '#ec4899', '#8b5cf6']
