import { BaseModel } from '@modules/Core/Data/Model'

export interface VideoChapter extends BaseModel {
  title: string
  description: string | null
  timestamp: number
}
