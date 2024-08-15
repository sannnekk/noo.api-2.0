import { ErrorConverter } from '@modules/Core/Request/ValidatorDecorator'
import { Validator } from '@modules/Core/Request/Validator'
import { z } from 'zod'
import { User } from '@modules/Users/Data/User'
import { AssignWorkOptions } from './DTO/AssignWorkOptions'
import { CourseCreationDTO } from './DTO/CourseCreationDTO'
import { CourseUpdateDTO } from './DTO/CourseUpdateDTO'
import { CourseChapter } from './Data/Relations/CourseChapter'
import { CourseScheme } from './Schemes/CourseScheme'
import { ChapterScheme } from './Schemes/ChapterScheme'
import { AssignWorkOptionsScheme } from './Schemes/AssignWorkOptionsScheme'
import { EmailScheme } from '@modules/Core/Schemes/EmailScheme'

@ErrorConverter()
export class CourseValidator extends Validator {
  public readonly studentIdsScheme = z.object({
    studentIds: z.array(z.string().ulid()),
  })

  public readonly studentEmailsScheme = z.object({
    emails: z.array(EmailScheme),
  })

  public parseCreation(course: unknown): CourseCreationDTO {
    return this.parse<CourseCreationDTO>(course, CourseScheme)
  }

  public parseChapterCreation(chapter: unknown): CourseChapter {
    return this.parse<CourseChapter>(chapter, ChapterScheme)
  }

  public parseUpdate(course: unknown): CourseUpdateDTO {
    return this.parse<CourseUpdateDTO>(course, CourseScheme)
  }

  public parseStudentIds(body: unknown): { studentIds: User['id'][] } {
    return this.parse<{ studentIds: User['id'][] }>(body, this.studentIdsScheme)
  }

  public parseEmails(body: unknown): { emails: string[] } {
    return this.parse<{ emails: string[] }>(body, this.studentEmailsScheme)
  }

  public parseAssignWorkOptions(data: unknown): AssignWorkOptions {
    return this.parse<AssignWorkOptions>(data, AssignWorkOptionsScheme)
  }
}
