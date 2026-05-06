<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { sectionColors } from '../utils/colors'
import { isIconUrl, normalizeIcon, severityLabel } from '../utils/sunburst'
import type { RingArc } from '../composables/useSunburstLayout'
import type { IcfNode } from '../types'

defineProps<{
  size: number
  center: number
  sections: IcfNode[]
  focusedSectionIdx: number
  focusedDepth: number
  sectionIndicatorR: { inner: number; outer: number }
  outermostRadius: number
  focusedArcs: RingArc[]
  peekArcs: RingArc[]
  visibleLabels: RingArc[]
  isMobile: boolean
  hoveredSegment: string | null
  arcPath: (innerR: number, outerR: number, startAngle: number, endAngle: number) => string
  iconPos: (midAngle: number, radius: number) => { x: number; y: number }
}>()

const emit = defineEmits<{
  (e: 'select-section', index: number): void
  (e: 'arc-click', arc: RingArc): void
  (e: 'hover', id: string | null): void
}>()
</script>

<template>
  <svg
    :width="size"
    :height="size"
    :viewBox="`0 0 ${size} ${size}`"
    class="cursor-default overflow-visible mb-2"
  >
    <g :transform="`translate(${center}, ${center})`">
      <!-- Section indicator ring -->
      <path
        v-for="(s, i) in sections"
        :key="'sec-' + s.id"
        :d="
          arcPath(
            sectionIndicatorR.inner,
            sectionIndicatorR.outer,
            (i / sections.length) * Math.PI * 2,
            ((i + 1) / sections.length) * Math.PI * 2
          )
        "
        :fill="sectionColors[i % sectionColors.length]"
        :opacity="i === focusedSectionIdx ? 1 : 0.3"
        class="cursor-pointer transition-opacity duration-300 hover:!opacity-80"
        @click="emit('select-section', i)"
      />

      <!-- Peek arcs (blurred) -->
      <g
        class="pointer-events-none transition-all duration-400"
        :style="{ opacity: 0.35, filter: 'blur(3px)' }"
      >
        <path
          v-for="arc in peekArcs"
          :key="'peek-' + arc.node.id + '-' + arc.depth"
          :d="arcPath(arc.innerR, arc.outerR, arc.startAngle, arc.endAngle)"
          :fill="arc.color"
          class="stroke-white"
          style="stroke-width: 0.5"
        />
      </g>

      <!-- Focused arcs (interactive) -->
      <g
        v-for="arc in focusedArcs"
        :key="'arc-' + arc.node.id + '-' + arc.depth"
        class="cursor-pointer"
        @mouseenter="emit('hover', arc.node.id + '-' + arc.depth)"
        @mouseleave="emit('hover', null)"
        @click="emit('arc-click', arc)"
      >
        <path
          :d="arcPath(arc.innerR, arc.outerR, arc.startAngle, arc.endAngle)"
          :fill="hoveredSegment === arc.node.id + '-' + arc.depth ? arc.hoverColor : arc.color"
          class="cursor-pointer transition-[fill] duration-150 stroke-white hover:brightness-90"
          style="stroke-width: 1.5"
        >
          <title>
            {{ arc.node.label }}: {{ severityLabel(arc.node.selectedIdx, arc.node.options) }}
          </title>
        </path>

        <!-- Icon -->
        <foreignObject
          v-if="
            arc.node.icon &&
            arc.depth >= focusedDepth &&
            arc.depth < focusedDepth + 2 &&
            arc.endAngle - arc.startAngle > 0.18
          "
          :x="iconPos(arc.midAngle, (arc.innerR + arc.outerR) / 2).x - size * 0.02"
          :y="iconPos(arc.midAngle, (arc.innerR + arc.outerR) / 2).y - size * 0.02"
          :width="size * 0.04"
          :height="size * 0.04"
          class="pointer-events-none overflow-visible"
        >
          <img
            v-if="isIconUrl(arc.node.icon)"
            :src="arc.node.icon"
            class="w-full h-full object-contain brightness-0 invert drop-shadow-sm"
          />
          <Icon
            v-else
            :icon="normalizeIcon(arc.node.icon)"
            class="w-full h-full text-white/90 drop-shadow-sm"
          />
        </foreignObject>
      </g>

      <!-- Labels (outside outermost ring) -->
      <g v-if="!isMobile">
        <text
          v-for="arc in visibleLabels"
          :key="'lbl-' + arc.node.id"
          :x="iconPos(arc.midAngle, outermostRadius + size * 0.03).x"
          :y="iconPos(arc.midAngle, outermostRadius + size * 0.03).y"
          :text-anchor="
            arc.midAngle > Math.PI
              ? 'end'
              : arc.midAngle < 0.1 || arc.midAngle > Math.PI * 2 - 0.1
                ? 'middle'
                : 'start'
          "
          :transform="`rotate(${arc.midAngle * (180 / Math.PI) - 90}, ${iconPos(arc.midAngle, outermostRadius + size * 0.03).x}, ${iconPos(arc.midAngle, outermostRadius + size * 0.03).y}) rotate(${arc.midAngle > Math.PI ? 180 : 0}, ${iconPos(arc.midAngle, outermostRadius + size * 0.03).x}, ${iconPos(arc.midAngle, outermostRadius + size * 0.03).y})`"
          class="text-[0.55rem] fill-gray-700 font-medium pointer-events-auto cursor-pointer [paint-order:stroke] [stroke:white] [stroke-width:3px] [stroke-linejoin:round] hover:fill-gray-900 hover:font-bold"
          @click="emit('arc-click', arc)"
        >
          {{ arc.node.label }}
        </text>
      </g>
    </g>
  </svg>
</template>
