import type { User } from '@modules/Users/Data/User'
import { BaseModel } from '@modules/Core/Data/Model'
import { CourseMaterial } from './CourseMaterial'

export type Reaction = 'thinking' | 'check'

export const Reactions: Reaction[] = ['thinking', 'check']

export interface CourseMaterialReaction extends BaseModel {
  material?: CourseMaterial
  materialId?: CourseMaterial['id']
  user?: User
  reaction: Reaction
}
