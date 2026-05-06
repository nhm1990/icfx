export const isIconUrl = (icon: string | undefined): boolean => {
  if (!icon) return false
  return icon.startsWith('http://') || icon.startsWith('https://') || icon.startsWith('data:')
}

export const normalizeIcon = (icon: string | undefined): string => {
  if (!icon) return 'mdi:help-circle-outline'
  if (icon.startsWith('icf:')) return 'mdi:medical-bag'
  return icon
}

export const severityLabel = (idx: number | null | undefined, options: string[]): string => {
  if (idx == null) return 'Nicht beantwortet'
  return options[idx] || 'Unbekannt'
}

export const DEPTH_LABELS = ['Fragen', 'ICF-Items', 'Detail-Items', 'Sub-Details'] as const
