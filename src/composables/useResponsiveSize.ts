import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export const useResponsiveSize = (containerRef: Ref<HTMLElement | null>, maxSize = 650) => {
  const size = ref(500)

  const updateSize = () => {
    if (containerRef.value) {
      size.value = Math.min(containerRef.value.clientWidth, maxSize)
    }
  }

  onMounted(() => {
    updateSize()
    window.addEventListener('resize', updateSize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateSize)
  })

  return { size }
}
