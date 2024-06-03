import { BaseModel } from '@modules/Core/Data/Model'
import { Media } from '@modules/Media/Data/Media'
import { User } from '@modules/Users/Data/User'
import { PollQuestion } from './PollQuestion'
import { Poll } from '../Poll'

export interface PollAnswer extends BaseModel {
	questionId: string
	questionType: PollQuestion['type']
	user?: User
	userId: string
	// answer types
	text?: string
	number?: number
	date?: Date
	files?: Media[] | undefined
	choices?: string[]
	rating?: number
	poll?: Poll
}
