<script setup lang="ts">
import type { IcfNode } from '../types'

defineProps<{
  sections: IcfNode[]
  focusedSectionIdx: number
}>()

const emit = defineEmits<{
  (e: 'prev'): void
  (e: 'next'): void
  (e: 'select', index: number): void
}>()
</script>

<template>
  <!-- Arrow nav for 3+ sections -->
  <div v-if="sections.length > 2" class="flex items-center gap-4">
    <button
      class="w-10 h-10 rounded-full border-2 border-indigo-500 bg-transparent text-indigo-500 text-2xl cursor-pointer flex items-center justify-center transition-all hover:bg-indigo-500 hover:text-white"
      aria-label="Vorherige Section"
      @click="emit('prev')"
    >
      ‹
    </button>
    <span
      class="font-semibold text-base text-gray-700 min-w-40 text-center max-sm:min-w-0 max-sm:text-sm"
    >
      {{ sections[focusedSectionIdx].label }}
    </span>
    <button
      class="w-10 h-10 rounded-full border-2 border-indigo-500 bg-transparent text-indigo-500 text-2xl cursor-pointer flex items-center justify-center transition-all hover:bg-indigo-500 hover:text-white"
      aria-label="Nächste Section"
      @click="emit('next')"
    >
      ›
    </button>
  </div>

  <!-- Tab nav for 1–2 sections -->
  <div v-else class="flex gap-2">
    <button
      v-for="(s, i) in sections"
      :key="s.id"
      :class="[
        'px-4 py-1.5 border-[1.5px] rounded-full cursor-pointer text-sm transition-all',
        i === focusedSectionIdx
          ? 'bg-indigo-500 text-white border-indigo-500'
          : 'bg-white border-gray-200 text-gray-500',
      ]"
      @click="emit('select', i)"
    >
      {{ s.label }}
    </button>
  </div>
</template>
