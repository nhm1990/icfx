import { ref, computed, type Ref } from 'vue'
import type { IcfNode } from '../types'

export interface NavigationState {
  focusedSectionIdx: Ref<number>
  focusedDepth: Ref<number>
  activeSection: Ref<IcfNode | undefined>
  canZoomIn: Ref<boolean>
  canZoomOut: Ref<boolean>
  depthLevels: Ref<number>
}

export interface NavigationActions {
  zoomIn: () => void
  zoomOut: () => void
  nextSection: () => void
  prevSection: () => void
  selectSection: (idx: number) => void
  onTouchStart: (e: TouchEvent) => void
  onTouchEnd: (e: TouchEvent) => void
}

const getMaxDepth = (node: IcfNode, current = 0): number => {
  if (!node.children || node.children.length === 0) return current
  return Math.max(...node.children.map((c) => getMaxDepth(c, current + 1)))
}

export const useSunburstNavigation = (
  sections: Ref<IcfNode[]>
): NavigationState & NavigationActions => {
  const focusedSectionIdx = ref(0)
  const focusedDepth = ref(0)

  let touchStartX = 0
  let touchStartY = 0

  const activeSection = computed(() => sections.value[focusedSectionIdx.value])

  const maxDepth = computed(() => {
    if (!activeSection.value) return 1
    return getMaxDepth(activeSection.value)
  })

  const depthLevels = computed(() => maxDepth.value)
  const canZoomIn = computed(() => focusedDepth.value + 2 < depthLevels.value)
  const canZoomOut = computed(() => focusedDepth.value > 0)

  const zoomIn = () => {
    if (canZoomIn.value) focusedDepth.value++
  }

  const zoomOut = () => {
    if (canZoomOut.value) focusedDepth.value--
  }

  const nextSection = () => {
    focusedSectionIdx.value = (focusedSectionIdx.value + 1) % sections.value.length
    focusedDepth.value = 0
  }

  const prevSection = () => {
    focusedSectionIdx.value =
      (focusedSectionIdx.value - 1 + sections.value.length) % sections.value.length
    focusedDepth.value = 0
  }

  const selectSection = (idx: number) => {
    focusedSectionIdx.value = idx
    focusedDepth.value = 0
  }

  const onTouchStart = (e: TouchEvent) => {
    touchStartX = e.touches[0].clientX
    touchStartY = e.touches[0].clientY
  }

  const onTouchEnd = (e: TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX
    const dy = e.changedTouches[0].clientY - touchStartY
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) nextSection()
      else prevSection()
    }
  }

  return {
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
  }
}
