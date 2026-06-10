import { ref } from 'vue'
import type { IcfNode } from '../types'

const BASE_URL = 'https://qbuilder.renecol.org/php'

export const useQBuilder = () => {
  const variants = ref<string[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchVariants = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`${BASE_URL}/get_variants.php`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: { variants: string[] } = await res.json()
      variants.value = data.variants
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Fehler beim Laden der Varianten'
    } finally {
      loading.value = false
    }
  }

  const fetchVariant = async (name: string): Promise<IcfNode[] | null> => {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`${BASE_URL}/get_variant.php?name=${encodeURIComponent(name)}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: { variants: Record<string, { nodes: IcfNode[] }> } = await res.json()
      return data.variants[name]?.nodes ?? null
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Fehler beim Laden der Variante'
      return null
    } finally {
      loading.value = false
    }
  }

  return { variants, loading, error, fetchVariants, fetchVariant }
}
