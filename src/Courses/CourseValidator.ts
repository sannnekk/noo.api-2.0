import { ErrorConverter } from '@modules/Core/Request/ValidatorDecorator'
import { Validator } from '@modules/Core/Request/Validator'
import { z } from 'zod'
import { User } from '@modules/Users/Data/User'
import { DeltaScheme } from '@modules/Core/Schemas/DeltaScheme'
import { MediaScheme } from '@modules/Media/MediaScheme'
import { AssignWorkOptions } from './DTO/AssignWorkOptions'
import { CourseCreationDTO } from './DTO/CourseCreationDTO'
import { CourseUpdateDTO } from './DTO/CourseUpdateDTO'

@ErrorConverter()
export class CourseValidator extends Validator {
  public readonly materialScheme = z.object({
    id: z.string().ulid().optional(),
    name: z
      .string()
      .min(1, { message: 'Название материала слишком короткое' })
      .max(255, {
        message: 'Название материала не может быть длиннее 255 символов',
      }),
    order: z.number(),
    description: z.string().nullable().optional(),
    content: DeltaScheme,
    files: z.array(MediaScheme),
  })

  public readonly chapterScheme = z.object({
    id: z.string().ulid().optional(),
    name: z
      .string()
      .min(1, { message: 'Название главы слишком короткое' })
      .max(255, {
        message: 'Название главы не может быть длиннее 255 символов',
      }),
    order: z.number(),
    materials: z.array(this.materialScheme),
  })

  public readonly courseScheme = z.object({
    id: z.string().ulid().optional(),
    name: z
      .string()
      .min(1, { message: 'Название курса слишком короткое' })
      .max(255, {
        message: 'Название курса не может быть длиннее 255 символов',
      }),
    description: z
      .string()
      .max(255, {
        message: 'Описание курса не может быть длиннее 255 символов',
      })
      .optional(),
    images: z.array(MediaScheme),
    chapters: z.array(this.chapterScheme),
  })

  public readonly stidentIdsScheme = z.object({
    studentIds: z.array(z.string().ulid()),
  })

  public readonly assignWorkOptionsScheme = z.object({
    checkDeadline: z.date().optional(),
    solveDeadline: z.date().optional(),
  })

  public parseCreation(course: unknown): CourseCreationDTO {
    return this.parse<CourseCreationDTO>(course, this.courseScheme)
  }

  public parseUpdate(course: unknown): CourseUpdateDTO {
    return this.parse<CourseUpdateDTO>(course, this.courseScheme)
  }

  public parseStudentIds(body: unknown): { studentIds: User['id'][] } {
    return this.parse<{ studentIds: User['id'][] }>(body, this.stidentIdsScheme)
  }

  public parseAssignWorkOptions(data: unknown): AssignWorkOptions {
    return this.parse<AssignWorkOptions>(data, this.assignWorkOptionsScheme)
  }
}
