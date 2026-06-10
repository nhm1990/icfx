<script setup lang="ts">
import { ref, onMounted } from 'vue'
import IcfxSunburst from './components/IcfxSunburst.vue'
import IcfxSunburstV2 from './components/IcfxSunburstV2.vue'
import AppHeader from './components/AppHeader.vue'
import { useQBuilder } from './composables/useQBuilder'
import type { IcfNode } from './types'

const { variants, loading, error, fetchVariants, fetchVariant } = useQBuilder()
const activeVariant = ref<string | null>(null)
const sections = ref<IcfNode[]>([])

type Design = 'original' | 'neu'
const design = ref<Design>('neu')
const designs: { key: Design; label: string }[] = [
  { key: 'original', label: 'Variante A · Original' },
  { key: 'neu', label: 'Variante B · Neu' },
]

const switchVariant = async (name: string) => {
  activeVariant.value = name
  const nodes = await fetchVariant(name)
  if (nodes) {
    sections.value = nodes.filter((n): n is IcfNode => n.type === 'section')
  }
}

// Forces a re-render of the active diagram after ratings change.
const mockNonce = ref(0)

const walkNodes = (nodes: IcfNode[], fn: (n: IcfNode) => void) => {
  for (const n of nodes) {
    fn(n)
    if (n.children?.length) walkNodes(n.children, fn)
  }
}

const mockRatings = () => {
  walkNodes(sections.value, (n) => {
    if (n.options && n.options.length > 1) {
      n.selectedIdx = Math.floor(Math.random() * n.options.length)
    }
  })
  mockNonce.value++
}

const clearRatings = () => {
  walkNodes(sections.value, (n) => {
    n.selectedIdx = null
  })
  mockNonce.value++
}

onMounted(async () => {
  await fetchVariants()
  if (variants.value.length > 0) {
    await switchVariant(variants.value[0])
  }
})

const onSelectQuestion = (q: IcfNode) => {
  console.log('Selected:', q.label, q)
}
</script>

<template>
  <div class="min-h-dvh bg-gray-50 flex flex-col items-center p-4">
    <AppHeader
      :active-dataset="activeVariant ?? ''"
      :dataset-keys="variants"
      :loading="loading"
      @switch="switchVariant"
    />

    <!-- Design comparison switcher -->
    <div class="flex gap-2 justify-center mb-4 p-1 bg-gray-200/70 rounded-xl">
      <button
        v-for="d in designs"
        :key="d.key"
        :class="[
          'px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer',
          design === d.key
            ? 'bg-white text-indigo-700 shadow-sm'
            : 'bg-transparent text-gray-500 hover:text-gray-700',
        ]"
        @click="design = d.key"
      >
        {{ d.label }}
      </button>
    </div>

    <!-- Mock data tools (dev/demo only) -->
    <div class="flex gap-2 justify-center mb-4">
      <button
        class="px-4 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 transition-colors cursor-pointer"
        @click="mockRatings"
      >
        Mock Ratings
      </button>
      <button
        class="px-4 py-1.5 rounded-lg text-sm font-medium bg-white text-gray-600 border border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer"
        @click="clearRatings"
      >
        Zurücksetzen
      </button>
    </div>

    <p v-if="error" class="text-red-600 text-sm mt-4">{{ error }}</p>
    <p v-else-if="loading && sections.length === 0" class="text-gray-400 text-sm mt-8">
      Lade Daten…
    </p>
    <template v-else-if="sections.length > 0">
      <IcfxSunburst
        v-if="design === 'original'"
        :key="'orig-' + activeVariant + '-' + mockNonce"
        :sections="sections"
        @select-question="onSelectQuestion"
      />
      <IcfxSunburstV2
        v-else
        :key="'v2-' + activeVariant + '-' + mockNonce"
        :sections="sections"
        @select-question="onSelectQuestion"
      />
    </template>
  </div>
</template>
