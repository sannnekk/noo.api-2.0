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
  chapterId: string
  chapter?: CourseChapter
  work?: Work
  workId?: string
  workSolveDeadline?: Date
  workCheckDeadline?: Date
  files: Media[]
  isActive: boolean
  poll?: Poll
  pollId?: Poll['id']
  createdAt: Date
  updatedAt: Date
}
