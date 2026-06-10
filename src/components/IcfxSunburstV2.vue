<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useResponsiveSize } from '../composables/useResponsiveSize'
import { useSunburstFullLayout, type FullArc } from '../composables/useSunburstFullLayout'
import { isIconUrl, normalizeIcon, severityLabel } from '../utils/sunburst'
import { severityColor } from '../utils/colors'
import SunburstLegend from './SunburstLegend.vue'
import SunburstDetailPanel from './SunburstDetailPanel.vue'
import type { IcfNode } from '../types'

const props = defineProps<{ sections: IcfNode[] }>()
const emit = defineEmits<{ (e: 'select-question', question: IcfNode): void }>()

const containerRef = ref<HTMLElement | null>(null)
const { size } = useResponsiveSize(containerRef)

const activeSectionIdx = ref(0)
const activeSection = computed(() => props.sections[activeSectionIdx.value])

const hoveredId = ref<string | null>(null)
const selectedNode = ref<IcfNode | null>(null)

const { center, holeR, depthLevels, arcs, innerArcs, arcPath, iconPos } = useSunburstFullLayout(
  size,
  activeSection
)

const hoveredArc = computed(() => arcs.value.find((a) => arcId(a) === hoveredId.value) ?? null)

// Node shown in the centre: hover wins, otherwise the active selection.
const centerNode = computed(() => hoveredArc.value?.node ?? selectedNode.value)

const arcId = (a: FullArc) => `${a.node.id}-${a.depth}`

const arcMidR = (a: FullArc) => (a.innerR + a.outerR) / 2

// Icon size that fits inside a given segment (limited by ring band + arc width).
const ICON_MIN_PX = 13
const arcIconSize = (a: FullArc) => {
  const band = a.outerR - a.innerR
  const chord = (a.endAngle - a.startAngle) * arcMidR(a)
  return Math.min(band * 0.62, chord * 0.72)
}
const showIcon = (a: FullArc) => arcIconSize(a) >= ICON_MIN_PX
const isUnanswered = (a: FullArc) => a.node.selectedIdx == null

const selectSection = (idx: number) => {
  activeSectionIdx.value = idx
  selectedNode.value = null
  hoveredId.value = null
}

const onArcClick = (arc: FullArc) => {
  selectedNode.value = arc.node
  emit('select-question', arc.node)
}

const selectLegendItem = (node: IcfNode) => {
  selectedNode.value = node
  emit('select-question', node)
}
</script>

<template>
  <div
    ref="containerRef"
    class="flex flex-col items-center gap-4 w-full max-w-[1200px] mx-auto p-4 max-sm:p-2"
  >
    <!-- Section toggle (e.g. Individuelle Behinderung / Umweltfaktoren) -->
    <div v-if="sections.length > 1" class="flex flex-wrap gap-2 justify-center" role="tablist">
      <button
        v-for="(s, i) in sections"
        :key="s.id"
        role="tab"
        :aria-selected="i === activeSectionIdx"
        :class="[
          'px-4 py-2 rounded-full border-[1.5px] text-sm font-medium transition-all cursor-pointer',
          i === activeSectionIdx
            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
            : 'bg-white border-gray-300 text-gray-600 hover:border-indigo-500 hover:text-indigo-600',
        ]"
        @click="selectSection(i)"
      >
        {{ s.label }}
      </button>
    </div>

    <div class="flex flex-col items-center gap-5 w-full lg:flex-row lg:items-start lg:gap-8">
      <!-- Diagram (sticky + vertically centred on desktop for easy comparison) -->
      <div
        class="flex flex-col items-center gap-3 shrink-0 lg:sticky lg:top-4 lg:self-start lg:h-[calc(100dvh-2rem)] lg:justify-center"
      >
        <svg
          :width="size"
          :height="size"
          :viewBox="`0 0 ${size} ${size}`"
          class="overflow-visible"
          role="img"
          :aria-label="`Sunburst-Diagramm: ${activeSection?.label}`"
        >
          <g :transform="`translate(${center}, ${center})`">
            <!-- Segments -->
            <g
              v-for="arc in arcs"
              :key="arcId(arc)"
              class="cursor-pointer"
              @mouseenter="hoveredId = arcId(arc)"
              @mouseleave="hoveredId = null"
              @click="onArcClick(arc)"
            >
              <path
                :d="arcPath(arc.innerR, arc.outerR, arc.startAngle, arc.endAngle)"
                :fill="hoveredId === arcId(arc) ? arc.hoverColor : arc.color"
                class="stroke-white transition-[fill] duration-150 hover:brightness-95"
                :style="{ strokeWidth: arc.depth === 0 ? 2 : 1.25 }"
              >
                <title>
                  {{ arc.node.label }}: {{ severityLabel(arc.node.selectedIdx, arc.node.options) }}
                </title>
              </path>

              <!-- Icon (every segment that is wide enough) -->
              <foreignObject
                v-if="showIcon(arc)"
                :x="iconPos(arc.midAngle, arcMidR(arc)).x - arcIconSize(arc) / 2"
                :y="iconPos(arc.midAngle, arcMidR(arc)).y - arcIconSize(arc) / 2"
                :width="arcIconSize(arc)"
                :height="arcIconSize(arc)"
                class="pointer-events-none overflow-visible"
              >
                <div class="w-full h-full flex items-center justify-center">
                  <img
                    v-if="isIconUrl(arc.node.icon)"
                    :src="arc.node.icon"
                    :class="[
                      'w-full h-full object-contain drop-shadow',
                      isUnanswered(arc) ? 'brightness-0 opacity-60' : 'brightness-0 invert',
                    ]"
                  />
                  <Icon
                    v-else
                    :icon="normalizeIcon(arc.node.icon)"
                    :class="[
                      'w-full h-full drop-shadow',
                      isUnanswered(arc) ? 'text-gray-600' : 'text-white',
                    ]"
                  />
                </div>
              </foreignObject>
            </g>

            <!-- Centre display -->
            <circle :r="holeR" class="fill-white stroke-gray-200" style="stroke-width: 1.5" />
            <foreignObject
              :x="-holeR"
              :y="-holeR"
              :width="holeR * 2"
              :height="holeR * 2"
              class="pointer-events-none"
            >
              <div class="w-full h-full flex flex-col items-center justify-center text-center px-3">
                <template v-if="centerNode">
                  <span
                    class="w-3.5 h-3.5 rounded-full mb-1.5 shrink-0"
                    :style="{
                      background: severityColor(
                        centerNode.selectedIdx,
                        centerNode.options?.length || 5
                      ),
                    }"
                  ></span>
                  <span
                    class="font-bold text-gray-900 leading-tight text-[0.95rem] max-sm:text-[0.8rem]"
                  >
                    {{ centerNode.label }}
                  </span>
                  <span class="text-gray-500 text-[0.78rem] mt-1 max-sm:text-[0.7rem]">
                    {{ severityLabel(centerNode.selectedIdx, centerNode.options) }}
                  </span>
                </template>
                <template v-else>
                  <span
                    class="font-bold text-gray-800 leading-tight text-[0.95rem] max-sm:text-[0.8rem]"
                  >
                    {{ activeSection?.label }}
                  </span>
                  <span class="text-gray-400 text-[0.72rem] mt-1">{{ depthLevels }} Ebenen</span>
                </template>
              </div>
            </foreignObject>
          </g>
        </svg>

        <SunburstLegend />
      </div>

      <!-- Right column: accessible question list + detail -->
      <div class="w-full min-w-0 lg:flex-1 lg:min-w-[300px] flex flex-col gap-4">
        <!-- Always-visible, screen-reader friendly list (solves mobile labels) -->
        <ul class="flex flex-col gap-1.5 m-0 p-0 list-none">
          <li v-for="arc in innerArcs" :key="'leg-' + arc.node.id">
            <button
              class="w-full flex items-center gap-2.5 text-left px-3 py-2 rounded-lg border border-gray-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/40 transition-colors cursor-pointer"
              :class="{ 'border-indigo-500 bg-indigo-50/60': selectedNode?.id === arc.node.id }"
              @mouseenter="hoveredId = arcId(arc)"
              @mouseleave="hoveredId = null"
              @click="selectLegendItem(arc.node)"
            >
              <span class="w-3 h-3 rounded-full shrink-0" :style="{ background: arc.color }"></span>
              <Icon
                v-if="arc.node.icon && !isIconUrl(arc.node.icon)"
                :icon="normalizeIcon(arc.node.icon)"
                class="text-base text-gray-500 shrink-0"
              />
              <img
                v-else-if="arc.node.icon"
                :src="arc.node.icon"
                class="w-4 h-4 object-contain shrink-0"
              />
              <span class="font-medium text-sm text-gray-800 flex-1 min-w-0">{{
                arc.node.label
              }}</span>
              <span class="text-xs text-gray-400 shrink-0 max-sm:hidden">
                {{ severityLabel(arc.node.selectedIdx, arc.node.options) }}
              </span>
            </button>
          </li>
        </ul>

        <SunburstDetailPanel :node="selectedNode" @close="selectedNode = null" />
      </div>
    </div>
  </div>
</template>
