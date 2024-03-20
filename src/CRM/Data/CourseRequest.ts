import { BaseModel } from '@modules/Core/Data/Model'

export interface CourseRequest extends BaseModel {
	courseId: string
	email: string
}
