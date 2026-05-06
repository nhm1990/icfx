import { computed, type Ref } from 'vue'
import { arc as d3Arc } from 'd3-shape'
import { severityColor, severityColorDark } from '../utils/colors'
import type { IcfNode } from '../types'

export interface RingArc {
  node: IcfNode
  depth: number
  startAngle: number
  endAngle: number
  midAngle: number
  innerR: number
  outerR: number
  state: 'focused' | 'peek' | 'hidden'
  color: string
  hoverColor: string
  parent?: IcfNode
}

interface RingRadii {
  inner: number
  outer: number
  depth: number
  state: 'focused' | 'peek' | 'hidden'
}

export const useSunburstLayout = (
  size: Ref<number>,
  focusedDepth: Ref<number>,
  depthLevels: Ref<number>,
  activeSection: Ref<IcfNode | undefined>
) => {
  const center = computed(() => size.value / 2)

  const sectionIndicatorR = computed(() => ({
    inner: size.value * 0.04,
    outer: size.value * 0.09,
  }))

  const ringRadii = computed<RingRadii[]>(() => {
    const totalLevels = depthLevels.value
    const startR = size.value * 0.11
    const endR = size.value * 0.47
    const totalSpace = endR - startR
    const gap = size.value * 0.015
    const focusedWidth = totalSpace * 0.38
    const peekWidth = totalSpace * 0.12

    const radii: RingRadii[] = []
    let currentR = startR

    for (let d = 0; d < totalLevels; d++) {
      const isFocused = d >= focusedDepth.value && d < focusedDepth.value + 2
      const isPeek = d === focusedDepth.value + 2 || d === focusedDepth.value - 1
      const state: RingRadii['state'] = isFocused ? 'focused' : isPeek ? 'peek' : 'hidden'

      const width = isFocused ? focusedWidth : isPeek ? peekWidth : 0

      if (width > 0) {
        radii.push({ inner: currentR, outer: currentR + width, depth: d, state })
        currentR += width + gap
      } else {
        radii.push({ inner: 0, outer: 0, depth: d, state })
      }
    }
    return radii
  })

  const outermostRadius = computed(() => {
    const visible = ringRadii.value.filter((r) => r.outer > 0)
    return visible.length > 0 ? visible[visible.length - 1].outer : size.value * 0.4
  })

  const ringArcs = computed<RingArc[]>(() => {
    const section = activeSection.value
    if (!section) return []

    const arcs: RingArc[] = []
    const gap = 0.025
    const fullAngle = Math.PI * 2

    const layoutLevel = (
      nodes: IcfNode[],
      depth: number,
      parentStartAngle: number,
      parentEndAngle: number,
      parent?: IcfNode
    ) => {
      if (nodes.length === 0) return
      const radii = ringRadii.value[depth]
      const availableAngle = parentEndAngle - parentStartAngle
      const nodeAngle = availableAngle / nodes.length

      nodes.forEach((node, idx) => {
        const startAngle = parentStartAngle + idx * nodeAngle + gap / 2
        const endAngle = parentStartAngle + (idx + 1) * nodeAngle - gap / 2
        const midAngle = (startAngle + endAngle) / 2

        if (radii && radii.state !== 'hidden') {
          arcs.push({
            node,
            depth,
            startAngle,
            endAngle,
            midAngle,
            innerR: radii.inner,
            outerR: radii.outer,
            state: radii.state,
            color: severityColor(node.selectedIdx, node.options?.length || 5),
            hoverColor: severityColorDark(node.selectedIdx, node.options?.length || 5),
            parent,
          })
        }

        if (node.children && node.children.length > 0) {
          layoutLevel(node.children, depth + 1, startAngle, endAngle, node)
        }
      })
    }

    layoutLevel(section.children || [], 0, 0, fullAngle)
    return arcs
  })

  const focusedArcs = computed(() => ringArcs.value.filter((a) => a.state === 'focused'))
  const peekArcs = computed(() => ringArcs.value.filter((a) => a.state === 'peek'))
  const labelArcs = computed(() => focusedArcs.value.filter((a) => a.depth === focusedDepth.value))

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
      .padAngle(0.008)
      .cornerRadius(2)
    return generator(null as any) || ''
  }

  const iconPos = (midAngle: number, radius: number) => ({
    x: Math.sin(midAngle) * radius,
    y: -Math.cos(midAngle) * radius,
  })

  return {
    center,
    sectionIndicatorR,
    ringRadii,
    outermostRadius,
    ringArcs,
    focusedArcs,
    peekArcs,
    labelArcs,
    arcPath,
    iconPos,
  }
}
