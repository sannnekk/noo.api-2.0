import * as ULID from '@modules/Core/Data/Ulid'
import { DeltaContentType } from '@modules/Core/Data/DeltaContentType'
import { Work } from '@modules/Works/Data/Work'
import { Media } from '@modules/Media/Data/Media'
import { CourseChapter } from './CourseChapter'
import { Poll } from '@modules/Polls/Data/Poll'

export interface CourseMaterial {
  id: ULID.Ulid
  slug: string
  name: string
  description: string
  content: DeltaContentType
  order: number
  chapter?: CourseChapter
  work: Work | null
  workId?: string
  isWorkAvailable: boolean
  isPinned: boolean
  titleColor: string
  workSolveDeadline: Date | null
  workCheckDeadline: Date | null
  files: Media[]
  isActive: boolean
  poll?: Poll
  pollId?: Poll['id']
  myReaction?: string
  activateAt: Date | null
  createdAt: Date
  updatedAt: Date
}
