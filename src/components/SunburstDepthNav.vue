<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { DEPTH_LABELS } from '../utils/sunburst'

defineProps<{
  focusedDepth: number
  canZoomIn: boolean
  canZoomOut: boolean
}>()

const emit = defineEmits<{
  (e: 'zoom-in'): void
  (e: 'zoom-out'): void
}>()
</script>

<template>
  <div class="flex items-center gap-3 px-3 py-1 bg-gray-100 rounded-full max-sm:gap-2 max-sm:px-2">
    <button
      :disabled="!canZoomOut"
      class="w-8 h-8 rounded-full border-[1.5px] border-indigo-500 bg-transparent text-indigo-500 text-lg cursor-pointer flex items-center justify-center transition-all hover:enabled:bg-indigo-500 hover:enabled:text-white disabled:opacity-30 disabled:cursor-not-allowed disabled:border-gray-400 disabled:text-gray-400"
      aria-label="Zoom out"
      @click="emit('zoom-out')"
    >
      <Icon icon="mdi:magnify-minus" />
    </button>
    <span class="text-xs text-gray-600 font-medium">
      {{ DEPTH_LABELS[focusedDepth] || `Ebene ${focusedDepth + 1}` }}
      &amp;
      {{ DEPTH_LABELS[focusedDepth + 1] || `Ebene ${focusedDepth + 2}` }}
    </span>
    <button
      :disabled="!canZoomIn"
      class="w-8 h-8 rounded-full border-[1.5px] border-indigo-500 bg-transparent text-indigo-500 text-lg cursor-pointer flex items-center justify-center transition-all hover:enabled:bg-indigo-500 hover:enabled:text-white disabled:opacity-30 disabled:cursor-not-allowed disabled:border-gray-400 disabled:text-gray-400"
      aria-label="Zoom in"
      @click="emit('zoom-in')"
    >
      <Icon icon="mdi:magnify-plus" />
    </button>
  </div>
</template>
