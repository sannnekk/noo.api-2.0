export interface ChangelogItem {
  version: string
  date: string
  changes: {
    type: 'fix' | 'impr' | 'test' | 'build' | 'refc' | 'feat'
    description: string
  }[]
}
