import { Repository } from '@modules/Core/Data/Repository'
import { CourseModel } from './CourseModel'
import type { Course } from './Course'
import type { User } from '@modules/Users/Data/User'
import { NotFoundError } from '@modules/Core/Errors/NotFoundError'
import { EntityManager } from 'typeorm'
import { CourseChapter } from './Relations/CourseChapter'
import { CourseChapterModel } from './Relations/CourseChapterModel'
import { CourseAssignmentModel } from './Relations/CourseAssignmentModel'

export class CourseRepository extends Repository<Course> {
  constructor() {
    super(CourseModel)
  }

  public async getAuthors(courseId: string): Promise<User[]> {
    return this.queryBuilder().relation('authors').of(courseId).loadMany()
  }

  public async getEditors(courseId: string): Promise<User[]> {
    return this.queryBuilder().relation('editors').of(courseId).loadMany()
  }

  /**
   * Get the ids of all public courses the student has no assignment for yet
   *
   * @param studentId The student to check the assignments of
   */
  public async getUnassignedPublicCourseIds(
    studentId: User['id']
  ): Promise<Course['id'][]> {
    const rows = await this.queryBuilder('course')
      .select('course.id', 'id')
      .leftJoin(
        CourseAssignmentModel,
        'assignment',
        'assignment.courseId = course.id AND assignment.studentId = :studentId',
        { studentId }
      )
      .where('course.isPublic = :isPublic', { isPublic: true })
      .andWhere('assignment.id IS NULL')
      .getRawMany<{ id: Course['id'] }>()

    return rows.map((row) => row.id)
  }

  public async updateCourse(id: Course['id'], course: Course) {
    const existingCourse = await this.findOne({ id })

    if (!existingCourse) {
      throw new NotFoundError('Курс не найден')
    }

    const newCourse = new CourseModel({ ...existingCourse, ...course })

    return this.repository.manager.transaction(async (manager) => {
      for (const chapter of newCourse.chapters ?? []) {
        chapter.course = { id: newCourse.id } as CourseModel
        await this.saveChapter(manager, chapter)
      }

      await manager.save(newCourse)
    })
  }

  private async saveChapter(
    manager: EntityManager,
    chapter: CourseChapter,
    depth = 0
  ) {
    if (depth > 3) {
      throw new Error('Слишком глубокая вложенность глав')
    }

    await manager.save(chapter)

    for (const nestedChapter of chapter.chapters ?? []) {
      ;(nestedChapter as CourseChapterModel).parentChapter = {
        id: chapter.id,
      } as CourseChapterModel
      ;(nestedChapter as CourseChapterModel).course = null!
      await this.saveChapter(manager, nestedChapter, depth + 1)
    }

    for (const material of chapter.materials ?? []) {
      material.chapter = { id: chapter.id } as CourseChapter
      await manager.save(material)
    }
  }
}
