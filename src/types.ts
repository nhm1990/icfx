export interface IcfNode {
  id: string
  type: 'section' | 'question' | 'icf' | 'subquestion'
  label: string
  icon?: string
  options: string[]
  children: IcfNode[]
  selectedIdx?: number | null
  question?: string
  helpText?: string
  icfCode?: string
  reference?: string
  answerOrder?: string
}

export interface DemoData {
  exportedAt: string
  variants: {
    original: {
      id: string
      label: string
      nodes: IcfNode[]
    }
  }
}
