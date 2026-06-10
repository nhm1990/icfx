export const isIconUrl = (icon: string | undefined): boolean => {
  if (!icon) return false
  return icon.startsWith('http://') || icon.startsWith('https://') || icon.startsWith('data:')
}

/** Specific Iconify icons for individual ICF codes (d-codes). */
const ICF_CODE_ICONS: Record<string, string> = {
  // Lernen & Wissensanwendung (d1)
  d155: 'mdi:school-outline',
  d160: 'mdi:target',
  d175: 'mdi:lightbulb-on-outline',
  // Kommunikation (d3)
  d310: 'mdi:ear-hearing',
  d325: 'mdi:book-open-variant',
  d350: 'mdi:forum-outline',
  d355: 'mdi:account-voice',
  // Mobilität (d4)
  d415: 'mdi:human-handsup',
  d450: 'mdi:walk',
  d455: 'mdi:run',
  d460: 'mdi:map-marker-path',
  // Selbstversorgung (d5)
  d510: 'mdi:shower-head',
  d520: 'mdi:toothbrush',
  d530: 'mdi:toilet',
  d540: 'mdi:tshirt-crew-outline',
  // Häusliches Leben (d6)
  d620: 'mdi:cart-outline',
  d630: 'mdi:silverware-fork-knife',
  d640: 'mdi:broom',
  d650: 'mdi:hammer-screwdriver',
  d660: 'mdi:hand-heart-outline',
  // Interpersonelle Interaktionen (d7)
  d720: 'mdi:handshake-outline',
  d730: 'mdi:account-question-outline',
  d740: 'mdi:tie',
  d750: 'mdi:account-multiple-outline',
  d770: 'mdi:heart-outline',
  // Bedeutende Lebensbereiche (d8)
  d820: 'mdi:school',
  d825: 'mdi:book-education-outline',
  d830: 'mdi:certificate-outline',
  d840: 'mdi:briefcase-search-outline',
  d845: 'mdi:briefcase-check-outline',
  d850: 'mdi:briefcase-outline',
  d855: 'mdi:hand-heart',
  d860: 'mdi:cash',
  d865: 'mdi:bank-outline',
  d870: 'mdi:piggy-bank-outline',
  // Gemeinschafts- & soziales Leben (d9)
  d910: 'mdi:account-group',
  d920: 'mdi:gamepad-variant-outline',
  d930: 'mdi:hands-pray',
  d950: 'mdi:vote-outline',
}

/** Fallback icons per ICF chapter (first digit of the d-code). */
const ICF_CHAPTER_ICONS: Record<string, string> = {
  '1': 'mdi:brain',
  '2': 'mdi:clipboard-list-outline',
  '3': 'mdi:chat-outline',
  '4': 'mdi:walk',
  '5': 'mdi:shower',
  '6': 'mdi:home-outline',
  '7': 'mdi:account-group-outline',
  '8': 'mdi:briefcase-outline',
  '9': 'mdi:earth',
}

const iconForIcfCode = (code: string): string => {
  return ICF_CODE_ICONS[code] ?? ICF_CHAPTER_ICONS[code[1]] ?? 'mdi:medical-bag'
}

export const normalizeIcon = (icon: string | undefined): string => {
  if (!icon) return 'mdi:help-circle-outline'
  if (icon.startsWith('icf:')) return iconForIcfCode(icon.slice(4))
  return icon
}

export const severityLabel = (idx: number | null | undefined, options: string[]): string => {
  if (idx == null) return 'Nicht beantwortet'
  return options[idx] || 'Unbekannt'
}

export const DEPTH_LABELS = ['Fragen', 'ICF-Items', 'Detail-Items', 'Sub-Details'] as const
