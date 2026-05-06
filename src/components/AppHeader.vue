<script setup lang="ts">
defineProps<{
  activeDataset: string
  datasetKeys: string[]
}>()

const emit = defineEmits<{
  (e: 'switch', key: string): void
}>()
</script>

<template>
  <header class="text-center mb-4">
    <h1 class="text-2xl text-gray-900 m-0">ICFx Ergebnis-Übersicht</h1>
    <div class="flex gap-2 justify-center mt-3">
      <button
        v-for="key in datasetKeys"
        :key="key"
        :class="[
          'px-3 py-1.5 border-[1.5px] rounded-lg cursor-pointer text-sm transition-all',
          activeDataset === key
            ? 'bg-indigo-600 text-white border-indigo-600'
            : 'bg-white border-gray-300 text-gray-500 hover:border-indigo-500 hover:text-indigo-600',
        ]"
        @click="emit('switch', key)"
      >
        {{ key }}
      </button>
    </div>
  </header>
</template>
