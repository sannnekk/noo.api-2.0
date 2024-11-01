import { Plot } from '../Types/Plot'

export interface Statistics {
  sections: {
    name: string
    description: string
    entries: {
      name: string
      description?: string
      value: number
      percentage?: number
      subEntries?: {
        name: string
        description?: string
        value: number
        percentage?: number
      }[]
    }[]
    plots: (Plot | Plot[])[]
  }[]
}
