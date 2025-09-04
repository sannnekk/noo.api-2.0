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
import { CourseMaterialReactionRepository } from '../Data/CourseMaterialReactionRepository'
import { UnauthorizedError } from '@modules/Core/Errors/UnauthorizedError'

export class CourseService {
  private readonly courseRepository: CourseRepository

  private readonly courseAssignmentRepository: CourseAssignmentRepository

  private readonly materialRepository: CourseMaterialRepository

  private readonly materialReactionRepository: CourseMaterialReactionRepository

  private readonly userRepository: UserRepository

  private readonly assignedWorkRepository: AssignedWorkRepository

  private readonly workRepository: WorkRepository

  constructor() {
    this.courseRepository = new CourseRepository()
    this.courseAssignmentRepository = new CourseAssignmentRepository()
    this.userRepository = new UserRepository()
    this.materialRepository = new CourseMaterialRepository()
    this.materialReactionRepository = new CourseMaterialReactionRepository()
    this.assignedWorkRepository = new AssignedWorkRepository()
    this.workRepository = new WorkRepository()
  }

  public async get(pagination: Pagination) {
    return this.courseRepository.search(undefined, pagination)
  }

  public async getOwn(pagination: Pagination, userId: User['id']) {
    return this.courseRepository.search(
      {
        editors: {
          id: userId,
        },
      },
      pagination
    )
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
      ['course', 'course.images', 'assigner', 'course.subject']
    )
  }

  public async getBySlug(
    slug: string,
    userId: User['id'],
    role: User['role']
  ): Promise<Course> {
    const course = await this.courseRepository.findOne(
      { slug },
      [
        'chapters',
        'chapters.materials',
        'chapters.materials.work',
        'chapters.materials.files',
        'chapters.materials.videos',
        'chapters.chapters.materials',
        'chapters.chapters.materials.work',
        'chapters.chapters.materials.files',
        'chapters.chapters.materials.videos',
      ],
      /* {
        chapters: {
          order: 'ASC',
          materials: {
            order: 'ASC',
            files: {
              order: 'ASC',
            },
          },
        },
      }, */
      undefined,
      {
        relationLoadStrategy: 'query',
      }
    )

    if (!course) {
      throw new NotFoundError('Курс не найден')
    }

    if ((course.chapters || []).length === 0) {
      throw new CourseIsEmptyError()
    }

    if (role === 'student') {
      const courseAssignment = await this.courseAssignmentRepository.findOne({
        student: { id: userId },
        course: { id: course.id },
      })

      if (!courseAssignment) {
        throw new UnauthorizedError('Вы не записаны на этот курс')
      }
    }

    course.authors = await this.getCourseAuthors(course.id)

    if (role === 'teacher' || role === 'admin') {
      course.studentCount = await this.courseAssignmentRepository.count({
        course: { id: course.id },
      })

      course.editors = await this.courseRepository.getEditors(course.id)
    }

    if (role === 'student') {
      await this.addMyReactionToMaterials(course, userId)
    }

    return course
  }

  public async getCourseAuthors(courseId: Course['id']) {
    return this.courseRepository.getAuthors(courseId)
  }

  public async getStudentListWithAssignments(
    courseId: string,
    pagination: Pagination
  ) {
    return this.userRepository.getStudentsWithAssignments(courseId, pagination)
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

  public async unpin(assignmentId: string, userId: string) {
    const assignment = await this.courseAssignmentRepository.findOne({
      id: assignmentId,
      student: { id: userId },
    })

    if (!assignment) {
      throw new NotFoundError('Курс не найден')
    }

    assignment.isPinned = false

    await this.courseAssignmentRepository.update(assignment)
  }

  public async pin(assignmentId: string, userId: string) {
    const assignment = await this.courseAssignmentRepository.findOne({
      id: assignmentId,
      student: { id: userId },
    })

    if (!assignment) {
      throw new NotFoundError('Курс не найден')
    }

    assignment.isPinned = true

    await this.courseAssignmentRepository.update(assignment)
  }

  public async toggleReaction(
    materialId: string,
    userId: User['id'],
    reaction: string
  ) {
    const material = await this.materialRepository.findOne({
      id: materialId,
    })

    if (!material) {
      throw new NotFoundError('Материал не найден')
    }

    await this.materialReactionRepository.toggleReaction(
      materialId,
      userId,
      reaction as any
    )
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

    await this.courseRepository.updateCourse(id, newCourse)
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
    const work = await this.workRepository.findOne({
      id: workId,
    })

    if (!work) {
      throw new NotFoundError('Работа не найдена')
    }

    const material = await this.materialRepository.findOne(
      [
        {
          slug: materialSlug,
          chapter: {
            course: {
              id: TypeORM.Not(TypeORM.IsNull()),
            },
          },
        },
        {
          slug: materialSlug,
          chapter: {
            parentChapter: {
              course: {
                id: TypeORM.Not(TypeORM.IsNull()),
              },
            },
          },
        },
      ],
      ['chapter.course', 'chapter.parentChapter.course']
    )

    if (!material) {
      throw new NotFoundError('Материал не найден')
    }

    if (
      material.chapter?.course?.subjectId !== work.subjectId &&
      material.chapter?.parentChapter?.course?.subjectId !== work.subjectId
    ) {
      throw new WorkIsFromAnotherSubjectError()
    }

    material.work = { id: workId } as any
    material.workId = workId
    material.workSolveDeadline = solveDeadline || null
    material.workCheckDeadline = checkDeadline || null

    await this.materialRepository.update(material)
  }

  public async unassignWorkFromMaterial(materialSlug: string) {
    const material = await this.materialRepository.findOne({
      slug: materialSlug,
    })

    if (!material) {
      throw new NotFoundError('Материал не найден')
    }

    material.work = null
    material.workSolveDeadline = null
    material.workCheckDeadline = null

    await this.materialRepository.update(material)
  }

  public async create(
    courseDTO: CourseCreationDTO,
    authorId: User['id']
  ): Promise<void> {
    const author = await this.userRepository.findOne({ id: authorId })

    if (!author) {
      throw new NotFoundError('Пользователь не найден')
    }

    const course = new CourseModel(courseDTO)

    course.authors = [author]

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

  private async addMyReactionToMaterials(course: Course, userId: User['id']) {
    if (!course.chapters) {
      return
    }

    const materials = course
      .chapters!.map((chapter) => {
        const foundMaterials = chapter.materials || []

        if (chapter.chapters?.length) {
          return [
            ...foundMaterials,
            ...chapter.chapters
              .map((subChapter) => subChapter.materials)
              .flat(),
          ]
        }

        return chapter.materials
      })
      .flat()

    const reactions = await this.materialReactionRepository.getMyReactions(
      userId,
      materials.filter(Boolean).map((material) => material!.id)
    )

    materials.forEach((material) => {
      if (material) {
        const reaction = reactions.find(
          ({ materialId }) => materialId === material.id
        )

        if (reaction) {
          material.myReaction = reaction.reaction
        }
      }
    })
  }
}
