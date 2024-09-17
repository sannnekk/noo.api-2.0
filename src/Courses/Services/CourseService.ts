import { UserRepository } from '@modules/Users/Data/UserRepository'
import { NotFoundError } from '@modules/Core/Errors/NotFoundError'
import { UnknownError } from '@modules/Core/Errors/UnknownError'
import { Pagination } from '@modules/Core/Data/Pagination'
import TypeORM from 'typeorm'
import { User } from '@modules/Users/Data/User'
import { AssignedWork } from '@modules/AssignedWorks/Data/AssignedWork'
import { AssignedWorkRepository } from '@modules/AssignedWorks/Data/AssignedWorkRepository'
import { CourseCreationDTO } from '../DTO/CourseCreationDTO'
import { CourseMaterialRepository } from '../Data/CourseMaterialRepository'
import { CourseModel } from '../Data/CourseModel'
import { Course } from '../Data/Course'
import { CourseRepository } from '../Data/CourseRepository'
import { CourseUpdateDTO } from '../DTO/CourseUpdateDTO'
import { CourseChapter } from '../Data/Relations/CourseChapter'
import { CourseChapterModel } from '../Data/Relations/CourseChapterModel'
import { CourseIsEmptyError } from '../Errors/CourseIsEmptyError'
import { WorkRepository } from '@modules/Works/Data/WorkRepository'
import { WorkIsFromAnotherSubjectError } from '../Errors/WorkIsFromAnotherSubjectError'
import { CourseAssignmentRepository } from '../Data/CourseAssignmentRepository'
import { CourseAssignmentModel } from '../Data/Relations/CourseAssignmentModel'

export class CourseService {
  private readonly courseRepository: CourseRepository

  private readonly courseAssignmentRepository: CourseAssignmentRepository

  private readonly materialRepository: CourseMaterialRepository

  private readonly userRepository: UserRepository

  private readonly assignedWorkRepository: AssignedWorkRepository

  private readonly workRepository: WorkRepository

  constructor() {
    this.courseRepository = new CourseRepository()
    this.courseAssignmentRepository = new CourseAssignmentRepository()
    this.userRepository = new UserRepository()
    this.materialRepository = new CourseMaterialRepository()
    this.assignedWorkRepository = new AssignedWorkRepository()
    this.workRepository = new WorkRepository()
  }

  public async get(pagination?: Pagination) {
    return this.courseRepository.search(undefined, pagination, ['author'])
  }

  public async getStudentCourseAssignments(
    studentId: User['id'],
    pagination: Pagination
  ) {
    return this.courseAssignmentRepository.search(
      {
        student: {
          id: studentId,
        },
      },
      pagination,
      ['course', 'assigner', 'course.author']
    )
  }

  public async getBySlug(slug: string, role: User['role']): Promise<Course> {
    const condition = {
      slug,
      chapters:
        role === 'student'
          ? {
              isActive: true,
              materials: {
                isActive: true,
              },
            }
          : undefined,
    }

    const relations = [
      'chapters.materials.work',
      'author',
      'chapters.materials.poll',
    ]

    if (role === 'teacher' || role === 'admin') {
      relations.push('studentAssignments')
    }

    const course = await this.courseRepository.findOne(
      condition,
      relations as any,
      undefined,
      { relationLoadStrategy: 'query' }
    )

    if (!course) {
      const courseExists = await this.courseRepository.findOne({ slug })

      if (!courseExists) {
        throw new NotFoundError('Курс не найден')
      } else {
        throw new CourseIsEmptyError()
      }
    }

    return course
  }

  public async archive(assignmentId: string, studentId: User['id']) {
    const assignment = await this.courseAssignmentRepository.findOne({
      id: assignmentId,
      student: { id: studentId },
    })

    if (!assignment) {
      throw new NotFoundError('Курс не найден')
    }

    assignment.isArchived = true

    await this.courseAssignmentRepository.update(assignment)
  }

  public async unarchive(assignmentId: string, studentId: User['id']) {
    const assignment = await this.courseAssignmentRepository.findOne({
      id: assignmentId,
      student: { id: studentId },
    })

    if (!assignment) {
      throw new NotFoundError('Курс не найден')
    }

    assignment.isArchived = false

    await this.courseAssignmentRepository.update(assignment)
  }

  public async getAssignedWorkToMaterial(
    materialSlug: string,
    userId: User['id']
  ): Promise<AssignedWork | null> {
    const assignedWork = await this.assignedWorkRepository.findOne({
      student: {
        id: userId,
      },
      work: {
        materials: {
          slug: materialSlug,
        },
      },
    })

    return assignedWork
  }

  public async update(
    id: Course['id'],
    course: CourseUpdateDTO
  ): Promise<void> {
    const foundCourse = await this.courseRepository.findOne({ id })

    if (!foundCourse) {
      throw new NotFoundError('Курс не найден')
    }

    const newCourse = new CourseModel({ ...foundCourse, ...course })

    await this.courseRepository.update(newCourse)
  }

  public async addStudents(
    courseSlug: string,
    studentIds: User['id'][],
    assignerId: User['id']
  ) {
    const existingAssignments = await this.courseAssignmentRepository.findAll({
      course: {
        slug: courseSlug,
      },
      student: { id: TypeORM.In(studentIds) },
    })

    const studentIdsToAdd = studentIds.filter((studentId) => {
      return !existingAssignments.some(
        (assignment) => assignment.studentId === studentId
      )
    })

    if (studentIdsToAdd.length === 0) {
      return
    }

    const course = await this.courseRepository.findOne({ slug: courseSlug })

    if (!course) {
      throw new NotFoundError('Курс не найден')
    }

    const assignments = studentIdsToAdd.map((studentId) => {
      return new CourseAssignmentModel({
        student: { id: studentId } as User,
        course: { id: course.id } as Course,
        assigner: { id: assignerId } as User,
      })
    })

    await this.courseAssignmentRepository.createMany(assignments)
  }

  public async addStudentsViaEmails(
    courseSlug: string,
    studentEmails: User['email'][],
    assignerId: User['id']
  ) {
    const userIds = await this.userRepository.getIdsFromEmails(studentEmails, {
      role: 'student',
    })

    // Add students if they are not already in the course
    await this.addStudents(courseSlug, userIds, assignerId)
  }

  public async removeStudents(courseSlug: string, studentIds: User['id'][]) {
    const course = await this.courseRepository.findOne({ slug: courseSlug })

    if (!course) {
      throw new NotFoundError('Курс не найден')
    }

    await this.courseAssignmentRepository.deleteWhere({
      course: { id: course.id },
      student: { id: TypeORM.In(studentIds) },
    })
  }

  public async removeStudentsViaEmails(
    courseSlug: string,
    studentEmails: User['email'][]
  ) {
    const userIds = await this.userRepository.getIdsFromEmails(studentEmails, {
      role: 'student',
    })

    await this.removeStudents(courseSlug, userIds)
  }

  public async assignWorkToMaterial(
    materialSlug: string,
    workId: string,
    solveDeadline?: Date,
    checkDeadline?: Date
  ) {
    const material = await this.materialRepository.findOne(
      {
        slug: materialSlug,
        chapter: {
          id: TypeORM.Not(TypeORM.IsNull()),
          course: { id: TypeORM.Not(TypeORM.IsNull()) },
        },
      },
      ['chapter.course']
    )

    const work = await this.workRepository.findOne({
      id: workId,
    })

    if (!work) {
      throw new NotFoundError('Работа не найдена')
    }

    if (!material) {
      throw new NotFoundError('Материал не найден')
    }

    if (material.chapter?.course?.subjectId !== work.subjectId) {
      throw new WorkIsFromAnotherSubjectError()
    }

    material.work = { id: workId } as any
    material.workId = workId
    material.workSolveDeadline = solveDeadline
    material.workCheckDeadline = checkDeadline

    await this.materialRepository.update(material)
  }

  public async create(
    courseDTO: CourseCreationDTO,
    authorId: Course['authorId']
  ): Promise<void> {
    const author = await this.userRepository.findOne({ id: authorId })

    if (!author) {
      throw new NotFoundError('Пользователь не найден')
    }

    const course = new CourseModel(courseDTO)

    try {
      await this.courseRepository.create(course)
    } catch (error) {
      throw new UnknownError()
    }
  }

  public async createChapter(
    courseSlug: Course['slug'],
    chapter: CourseChapter
  ) {
    const course = await this.courseRepository.findOne({ slug: courseSlug }, [
      'chapters',
    ])

    if (!course) {
      throw new NotFoundError()
    }

    course.chapters!.push(new CourseChapterModel(chapter))

    await this.courseRepository.update(course)
  }

  public async delete(id: Course['id']): Promise<void> {
    const course = await this.courseRepository.findOne({
      id,
    })

    if (!course) {
      throw new NotFoundError()
    }

    await this.courseRepository.delete(id)
  }
}
