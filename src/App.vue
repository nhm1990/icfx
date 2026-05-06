<script setup lang="ts">
import { ref, computed } from 'vue'
import IcfxSunburst from './components/IcfxSunburst.vue'
import AppHeader from './components/AppHeader.vue'
import demodata3 from './demodata-3ebenen.json'
import demodata4 from './demodata-4ebenen.json'
import type { IcfNode, DemoData } from './types'

const datasets: Record<string, DemoData> = {
  '3 Ebenen': demodata3 as unknown as DemoData,
  '4 Ebenen': demodata4 as unknown as DemoData,
}
const datasetKeys = Object.keys(datasets)
const activeDataset = ref(datasetKeys[0])

const sections = computed(() => {
  const data = datasets[activeDataset.value]
  return data.variants.original.nodes.filter((n): n is IcfNode => n.type === 'section')
})

const onSelectQuestion = (q: IcfNode) => {
  console.log('Selected:', q.label, q)
}
</script>

<template>
  <div class="min-h-dvh bg-gray-50 flex flex-col items-center p-4">
    <AppHeader
      :active-dataset="activeDataset"
      :dataset-keys="datasetKeys"
      @switch="activeDataset = $event"
    />
    <IcfxSunburst :key="activeDataset" :sections="sections" @select-question="onSelectQuestion" />
  </div>
</template>
