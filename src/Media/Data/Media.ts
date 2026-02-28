import { BaseModel } from '@modules/Core/Data/Model'

export interface Media extends BaseModel {
  name?: string
  src: string
  mimeType: 'image/jpeg' | 'image/png' | 'application/pdf'
  order: number
}
