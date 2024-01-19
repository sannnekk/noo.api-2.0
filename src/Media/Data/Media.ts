import { BaseModel } from '@core'

export interface Media extends BaseModel {
	src: string
	mimeType: 'image/jpeg' | 'image/png' | 'application/pdf'
}
