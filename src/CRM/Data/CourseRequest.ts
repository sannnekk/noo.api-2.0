import { BaseModel } from '@core'

export interface CourseRequest extends BaseModel {
	courseId: string
	email: string
}
