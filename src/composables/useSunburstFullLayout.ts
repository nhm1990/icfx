import { computed, type Ref } from 'vue'
import { arc as d3Arc } from 'd3-shape'
import { severityColor, severityColorDark } from '../utils/colors'
import type { IcfNode } from '../types'

export interface FullArc {
  node: IcfNode
  depth: number
  startAngle: number
  endAngle: number
  midAngle: number
  innerR: number
  outerR: number
  color: string
  hoverColor: string
  parent?: IcfNode
}

const getMaxDepth = (nodes: IcfNode[], current = 1): number => {
  let max = current
  for (const n of nodes) {
    if (n.children?.length) max = Math.max(max, getMaxDepth(n.children, current + 1))
  }
  return max
}

const polar = (angle: number, r: number) => ({
  x: Math.sin(angle) * r,
  y: -Math.cos(angle) * r,
})

/**
 * Full-circle sunburst layout where one section fills the whole circle.
 * The section's direct children (questions) form the innermost ring,
 * every nested level adds another concentric ring — no zoom/focus.
 */
export const useSunburstFullLayout = (size: Ref<number>, section: Ref<IcfNode | undefined>) => {
  const center = computed(() => size.value / 2)
  const holeR = computed(() => size.value * 0.18)
  const outerR = computed(() => size.value * 0.46)

  const depthLevels = computed(() => {
    const s = section.value
    if (!s?.children?.length) return 1
    return getMaxDepth(s.children)
  })

  // The innermost ring is given extra weight so its labels have room.
  const ringBounds = computed(() => {
    const levels = depthLevels.value
    const innerWeight = 1.6
    const totalWeight = innerWeight + (levels - 1)
    const span = outerR.value - holeR.value
    const unit = span / totalWeight

    const bounds: { inner: number; outer: number }[] = []
    let r = holeR.value
    for (let d = 0; d < levels; d++) {
      const w = d === 0 ? unit * innerWeight : unit
      bounds.push({ inner: r, outer: r + w })
      r += w
    }
    return bounds
  })

  const arcs = computed<FullArc[]>(() => {
    const s = section.value
    if (!s?.children?.length) return []
    const result: FullArc[] = []
    const gap = 0.006

    const layout = (nodes: IcfNode[], depth: number, a0: number, a1: number, parent?: IcfNode) => {
      const span = a1 - a0
      const each = span / nodes.length
      const ring = ringBounds.value[depth]
      if (!ring) return

      nodes.forEach((node, i) => {
        const startAngle = a0 + i * each + gap / 2
        const endAngle = a0 + (i + 1) * each - gap / 2
        const midAngle = (startAngle + endAngle) / 2
        result.push({
          node,
          depth,
          startAngle,
          endAngle,
          midAngle,
          innerR: ring.inner,
          outerR: ring.outer,
          color: severityColor(node.selectedIdx, node.options?.length || 5),
          hoverColor: severityColorDark(node.selectedIdx, node.options?.length || 5),
          parent,
        })
        if (node.children?.length) {
          layout(node.children, depth + 1, startAngle, endAngle, node)
        }
      })
    }

    layout(s.children, 0, 0, Math.PI * 2)
    return result
  })

  const innerArcs = computed(() => arcs.value.filter((a) => a.depth === 0))

  const arcPath = (
    innerRadius: number,
    outerRadius: number,
    startAngle: number,
    endAngle: number
  ): string => {
    const generator = d3Arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(startAngle)
      .endAngle(endAngle)
      .padAngle(0.006)
      .cornerRadius(3)
    return generator(null as never) || ''
  }

  /**
   * Curved baseline path for a label, flipped on the lower half so text
   * never appears upside-down.
   */
  const labelArcPath = (radius: number, startAngle: number, endAngle: number): string => {
    const mid = (startAngle + endAngle) / 2
    const upper = mid < Math.PI / 2 || mid > (3 * Math.PI) / 2
    const p0 = polar(upper ? startAngle : endAngle, radius)
    const p1 = polar(upper ? endAngle : startAngle, radius)
    const sweep = upper ? 1 : 0
    return `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} A ${radius.toFixed(2)} ${radius.toFixed(2)} 0 0 ${sweep} ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`
  }

  const iconPos = (midAngle: number, radius: number) => polar(midAngle, radius)

  return {
    center,
    holeR,
    outerR,
    depthLevels,
    ringBounds,
    arcs,
    innerArcs,
    arcPath,
    labelArcPath,
    iconPos,
  }
}
