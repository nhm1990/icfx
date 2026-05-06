<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { severityColor } from '../utils/colors'
import { isIconUrl, normalizeIcon, severityLabel } from '../utils/sunburst'
import type { IcfNode } from '../types'

defineProps<{
  node: IcfNode | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <Transition name="slide">
    <div
      v-if="node"
      class="w-full bg-white border border-gray-200 rounded-xl p-5 shadow-md max-sm:p-3"
    >
      <!-- Header -->
      <div class="flex justify-between items-start mb-3">
        <div class="flex items-center gap-2">
          <Icon
            v-if="node.icon && !isIconUrl(node.icon)"
            :icon="normalizeIcon(node.icon)"
            class="text-xl text-indigo-500"
          />
          <img
            v-else-if="node.icon && isIconUrl(node.icon)"
            :src="node.icon"
            class="w-5 h-5 object-contain"
          />
          <h3 class="m-0 text-lg text-gray-900">{{ node.label }}</h3>
          <span
            v-if="node.icfCode"
            class="text-[0.65rem] text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded font-mono"
          >
            {{ node.icfCode }}
          </span>
        </div>
        <button
          class="bg-transparent border-none text-xl cursor-pointer text-gray-400 p-1 hover:text-gray-700"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>

      <!-- Question -->
      <p v-if="node.question" class="text-gray-600 mb-3 text-sm">
        {{ node.question }}
      </p>

      <!-- Answer -->
      <div
        class="bg-gray-50 px-3 py-2 rounded-lg mb-4 text-sm"
        :style="{
          borderLeft: `4px solid ${severityColor(node.selectedIdx, node.options?.length || 5)}`,
        }"
      >
        <strong>Antwort:</strong>
        {{ severityLabel(node.selectedIdx, node.options) }}
      </div>

      <!-- Children -->
      <div v-if="node.children?.length" class="flex flex-col gap-2">
        <div
          v-for="child in node.children"
          :key="child.id"
          class="border-l-[3px] border-gray-200 pl-3"
        >
          <div class="flex items-center gap-2">
            <span
              class="w-2.5 h-2.5 rounded-full shrink-0"
              :style="{
                background: severityColor(child.selectedIdx, child.options?.length || 5),
              }"
            ></span>
            <Icon
              v-if="child.icon && !isIconUrl(child.icon)"
              :icon="normalizeIcon(child.icon)"
              class="text-base text-gray-500"
            />
            <span class="font-medium text-sm text-gray-700">{{ child.label }}</span>
            <span v-if="child.icfCode" class="text-[0.7rem] text-gray-400 font-mono">
              {{ child.icfCode }}
            </span>
          </div>
          <p class="mt-0.5 text-xs text-gray-500">
            {{ severityLabel(child.selectedIdx, child.options) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Placeholder -->
    <div
      v-else
      class="hidden lg:flex flex-col items-center justify-center py-12 px-6 text-gray-400 text-center border-2 border-dashed border-gray-200 rounded-xl gap-3"
    >
      <Icon icon="mdi:cursor-default-click-outline" class="text-4xl opacity-50" />
      <p class="m-0 text-sm">Klicken Sie auf ein Segment, um Details zu sehen</p>
    </div>
  </Transition>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
