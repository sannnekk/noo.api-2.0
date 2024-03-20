import { BaseModel } from '@modules/Core/Data/Model'

export interface Media extends BaseModel {
	src: string
	mimeType: 'image/jpeg' | 'image/png' | 'application/pdf'
}
