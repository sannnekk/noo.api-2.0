import { Repository } from '@modules/Core/Data/Repository'
import type { CourseChapter } from './Relations/CourseChapter'
import { CourseChapterModel } from './Relations/CourseChapterModel'

export class CourseChapterRepository extends Repository<CourseChapter> {
  constructor() {
    super(CourseChapterModel)
  }
}
