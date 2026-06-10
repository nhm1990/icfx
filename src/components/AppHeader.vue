<script setup lang="ts">
defineProps<{
  activeDataset: string
  datasetKeys: string[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'switch', key: string): void
}>()
</script>

<template>
  <header class="text-center mb-4">
    <h1 class="text-2xl text-gray-900 m-0">ICFx Ergebnis-Übersicht</h1>
    <div class="flex gap-2 justify-center mt-3 flex-wrap">
      <span v-if="loading && datasetKeys.length === 0" class="text-gray-400 text-sm py-1.5">
        Lade Varianten…
      </span>
      <button
        v-for="key in datasetKeys"
        :key="key"
        :disabled="loading"
        :class="[
          'px-3 py-1.5 border-[1.5px] rounded-lg text-sm transition-all',
          activeDataset === key
            ? 'bg-indigo-600 text-white border-indigo-600'
            : 'bg-white border-gray-300 text-gray-500 hover:border-indigo-500 hover:text-indigo-600',
          loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
        ]"
        @click="emit('switch', key)"
      >
        {{ key }}
      </button>
    </div>
  </header>
</template>
