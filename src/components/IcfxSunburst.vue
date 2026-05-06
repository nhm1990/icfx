<script setup lang="ts">
import { ref, computed, toRef } from 'vue'
import { useSunburstNavigation } from '../composables/useSunburstNavigation'
import { useSunburstLayout, type RingArc } from '../composables/useSunburstLayout'
import { useResponsiveSize } from '../composables/useResponsiveSize'
import SunburstSectionNav from './SunburstSectionNav.vue'
import SunburstDepthNav from './SunburstDepthNav.vue'
import SunburstDiagram from './SunburstDiagram.vue'
import SunburstLegend from './SunburstLegend.vue'
import SunburstDetailPanel from './SunburstDetailPanel.vue'
import type { IcfNode } from '../types'

const props = defineProps<{ sections: IcfNode[] }>()
const emit = defineEmits<{ (e: 'select-question', question: IcfNode): void }>()

const sectionsRef = toRef(props, 'sections')

// State
const containerRef = ref<HTMLElement | null>(null)
const hoveredSegment = ref<string | null>(null)
const selectedNode = ref<IcfNode | null>(null)

// Composables
const { size } = useResponsiveSize(containerRef)
const isMobile = computed(() => size.value < 400)

const {
  focusedSectionIdx,
  focusedDepth,
  activeSection,
  canZoomIn,
  canZoomOut,
  depthLevels,
  zoomIn,
  zoomOut,
  nextSection,
  prevSection,
  selectSection,
  onTouchStart,
  onTouchEnd,
} = useSunburstNavigation(sectionsRef)

const {
  center,
  sectionIndicatorR,
  outermostRadius,
  focusedArcs,
  peekArcs,
  labelArcs,
  arcPath,
  iconPos,
} = useSunburstLayout(size, focusedDepth, depthLevels, activeSection)

// Filtered labels (skip bottom area to avoid legend overlap)
const visibleLabels = computed(() =>
  labelArcs.value.filter((a) => a.midAngle < 2.6 || a.midAngle > 3.7)
)

// Handlers
const onArcClick = (arc: RingArc) => {
  selectedNode.value = arc.node
  emit('select-question', arc.node)
}
</script>

<template>
  <div
    ref="containerRef"
    class="flex flex-col items-center gap-3 w-full max-w-[1200px] mx-auto p-4 touch-pan-y max-sm:p-2"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
  >
    <SunburstSectionNav
      :sections="sections"
      :focused-section-idx="focusedSectionIdx"
      @prev="prevSection"
      @next="nextSection"
      @select="selectSection"
    />

    <SunburstDepthNav
      v-if="depthLevels > 2"
      :focused-depth="focusedDepth"
      :can-zoom-in="canZoomIn"
      :can-zoom-out="canZoomOut"
      @zoom-in="zoomIn"
      @zoom-out="zoomOut"
    />

    <!-- Main content: side-by-side on desktop -->
    <div class="flex flex-col items-center gap-4 w-full lg:flex-row lg:items-center lg:gap-8">
      <!-- Diagram column -->
      <div class="flex flex-col items-center gap-3 shrink-0">
        <SunburstDiagram
          :size="size"
          :center="center"
          :sections="sections"
          :focused-section-idx="focusedSectionIdx"
          :focused-depth="focusedDepth"
          :section-indicator-r="sectionIndicatorR"
          :outermost-radius="outermostRadius"
          :focused-arcs="focusedArcs"
          :peek-arcs="peekArcs"
          :visible-labels="visibleLabels"
          :is-mobile="isMobile"
          :hovered-segment="hoveredSegment"
          :arc-path="arcPath"
          :icon-pos="iconPos"
          @select-section="selectSection"
          @arc-click="onArcClick"
          @hover="hoveredSegment = $event"
        />

        <!-- Depth hint -->
        <p v-if="depthLevels > 2" class="text-[0.7rem] text-gray-400 m-0">
          {{ depthLevels }} Tiefenebenen · Fokus auf Ebene {{ focusedDepth + 1 }}–{{
            focusedDepth + 2
          }}
        </p>

        <SunburstLegend />
      </div>

      <!-- Detail column -->
      <div class="w-full min-w-0 lg:flex-1 lg:min-w-[280px]">
        <SunburstDetailPanel :node="selectedNode" @close="selectedNode = null" />
      </div>
    </div>
  </div>
</template>
