import { NotFoundError } from '@modules/Core/Errors/NotFoundError'
import { Pagination } from '@modules/Core/Data/Pagination'
import { UnauthorizedError } from '@modules/Core/Errors/UnauthorizedError'
import { User } from '@modules/Users/Data/User'
import { UserRepository } from '@modules/Users/Data/UserRepository'
import { WorkRepository } from '@modules/Works/Data/WorkRepository'
import { Work } from '@modules/Works/Data/Work'
import { CalenderService } from '@modules/Calender/Services/CalenderService'
import { CourseMaterial } from '@modules/Courses/Data/Relations/CourseMaterial'
import { CourseMaterialRepository } from '@modules/Courses/Data/CourseMaterialRepository'
import { AssignedWorkRepository } from '../Data/AssignedWorkRepository'
import { AssignedWork } from '../Data/AssignedWork'
import { AssignedWorkModel } from '../Data/AssignedWorkModel'
import { WorkAlreadySolvedError } from '../Errors/WorkAlreadySolvedError'
import { WorkAlreadyCheckedError } from '../Errors/WorkAlreadyCheckedError'
import { WorkIsNotSolvedYetError } from '../Errors/WorkIsNotSolvedYetError'
import { WorkAlreadyAssignedToThisMentorError } from '../Errors/WorkAlreadyAssignedToThisMentorError'
import { WorkAlreadyAssignedToEnoughMentorsError } from '../Errors/WorkAlreadyAssignedToEnoughMentorsError'
import { SolveDeadlineNotSetError } from '../Errors/SolveDeadlineNotSetError'
import { CheckDeadlineNotSetError } from '../Errors/CheckDeadlineNotSetError'
import { AssignedWorkComment } from '../Data/Relations/AssignedWorkComment'
import { DeadlineAlreadyShiftedError } from '../Errors/DeadlineAlreadyShiftedError'
import { TaskService } from './TaskService'
import { AssignedWorkCommentRepository } from '../Data/AssignedWorkCommentRepository'
import { AssignedWorkAnswerRepository } from '../Data/AssignedWorkAnswerRepository'
import { RemakeOptions } from '../DTO/RemakeOptions'
import { CreateOptions } from '../DTO/CreateOptions'
import { SolveOptions } from '../DTO/SolveOptions'
import { CheckOptions } from '../DTO/CheckOptions'
import { SaveOptions } from '../DTO/SaveOptions'
import Dates from '@modules/Core/Utils/date'
import { AssignedWorkOptions } from '../AssignedWorkOptions'
import TypeORM, { FindOptionsWhere } from 'typeorm'
import { UserService } from '@modules/Users/Services/UserService'

export class AssignedWorkService {
  private readonly taskService: TaskService

  private readonly assignedWorkRepository: AssignedWorkRepository

  private readonly materialRepository: CourseMaterialRepository

  private readonly workRepository: WorkRepository

  private readonly userRepository: UserRepository

  private readonly userService: UserService

  private readonly answerRepository: AssignedWorkAnswerRepository

  private readonly commentRepository: AssignedWorkCommentRepository

  private readonly calenderService: CalenderService

  constructor() {
    this.taskService = new TaskService()
    this.assignedWorkRepository = new AssignedWorkRepository()
    this.materialRepository = new CourseMaterialRepository()
    this.workRepository = new WorkRepository()
    this.userRepository = new UserRepository()
    this.answerRepository = new AssignedWorkAnswerRepository()
    this.commentRepository = new AssignedWorkCommentRepository()
    this.calenderService = new CalenderService()
    this.userService = new UserService()
  }

  public async getWorks(
    userId: User['id'],
    userRole?: User['role'],
    pagination?: Pagination
  ) {
    if (!userRole) {
      const user = await this.userRepository.findOne({ id: userId })

      if (!user) {
        throw new NotFoundError('Пользователь не найден')
      }

      userRole = user.role
    }

    // TODO: modify the conditions to load all assigned mentors instead of just one
    const conditions: FindOptionsWhere<AssignedWork> =
      userRole == 'student'
        ? { student: { id: userId } }
        : { mentors: { id: userId } }

    const relations = ['work', 'student', 'mentors'] as const

    const { entities, meta } = await this.assignedWorkRepository.search(
      conditions,
      pagination,
      relations
    )

    for (const work of entities) {
      if (work.isNewAttempt && work.work) {
        work.work.name = `🔁 ${work.work.name}`
      }
    }

    return { entities, meta }
  }

  public async getWorkById(id: AssignedWork['id'], role: User['role']) {
    const assignedWork = await this.assignedWorkRepository.findOne(
      { id },
      ['mentors', 'student', 'work.tasks'],
      {
        work: {
          tasks: {
            order: 'ASC',
          },
        },
      }
    )

    if (!assignedWork) {
      throw new NotFoundError()
    }

    assignedWork.answers = []
    assignedWork.comments = []

    this.excludeTasks(assignedWork)

    if (assignedWork.isNewAttempt) {
      assignedWork.work.name = `🔁 (Пересдача) ${assignedWork.work.name}`
    }

    if (assignedWork.solveStatus !== 'not-started') {
      const answers = await this.answerRepository.findAll({
        assignedWork: { id: assignedWork.id } as AssignedWork,
      })

      assignedWork.answers = answers
    }

    if (
      (assignedWork.checkStatus === 'in-progress' && role === 'mentor') ||
      (assignedWork.checkStatus === 'not-checked' && role === 'mentor') ||
      assignedWork.checkStatus === 'checked-in-deadline' ||
      assignedWork.checkStatus === 'checked-after-deadline' ||
      assignedWork.checkStatus === 'checked-automatically'
    ) {
      const comments = await this.commentRepository.findAll({
        assignedWork: { id: assignedWork.id } as AssignedWork,
      })

      assignedWork.comments = comments
    }

    return assignedWork
  }

  public async createWork(
    options: CreateOptions,
    taskIdsToExclude: string[] = []
  ) {
    const work = await this.workRepository.findOne(
      {
        id: options.workId,
      },
      ['tasks', 'subject']
    )

    const student = await this.userRepository.findOne(
      {
        id: options.studentId,
      },
      ['mentorAssignmentsAsStudent']
    )

    if (!work) {
      throw new NotFoundError('Работа не найдена')
    }

    if (!student) {
      throw new NotFoundError('Ученик не найден')
    }

    const mentor = await this.userService.getMentor(student, work.subject!.id)

    if (!mentor) {
      throw new NotFoundError('У ученика нет куратора по данному предмету')
    }

    const assignedWork = new AssignedWorkModel()

    assignedWork.work = { id: work.id } as Work
    assignedWork.student = { id: student.id } as User
    assignedWork.mentors = [{ id: mentor.id } as User]
    assignedWork.excludedTaskIds = taskIdsToExclude
    assignedWork.maxScore = this.getMaxScore(work.tasks, taskIdsToExclude)
    assignedWork.solveStatus = 'not-started'
    assignedWork.checkStatus = 'not-checked'
    assignedWork.isNewAttempt = options.isNewAttempt || false
    assignedWork.solveDeadlineAt = options.solveDeadlineAt
    assignedWork.checkDeadlineAt = options.checkDeadlineAt

    const createdWork = await this.assignedWorkRepository.create(assignedWork)

    work.tasks = []

    createdWork.student = student
    createdWork.mentors = [mentor]
    createdWork.work = work

    if (assignedWork.solveDeadlineAt) {
      await this.calenderService.createSolveDeadlineEvent(createdWork)
    }

    if (assignedWork.checkDeadlineAt) {
      await this.calenderService.createCheckDeadlineEvent(createdWork)
    }

    return createdWork
  }

  public async remakeWork(
    assignedWorkId: AssignedWork['id'],
    studentId: User['id'],
    options: RemakeOptions
  ) {
    const assignedWork = await this.getAssignedWork(assignedWorkId, ['work'])

    if (!assignedWork) {
      throw new NotFoundError('Работа не найдена')
    }

    if (!assignedWork.work) {
      throw new NotFoundError('Работа не найдена. Возможно, она была удалена')
    }

    if (assignedWork.studentId !== studentId) {
      throw new UnauthorizedError('Вы не можете пересдать чужую работу')
    }

    const rightTaskIds: string[] = assignedWork.excludedTaskIds

    if (options.onlyFalse) {
      const comments = await this.commentRepository.findAll(
        {
          assignedWork: { id: assignedWork.id } as AssignedWork,
        },
        ['task']
      )

      const newExcludes = comments
        .filter((comment) => comment.task?.highestScore === comment.score)
        .map((comment) => comment.task?.id)
        .filter(Boolean) as string[]

      rightTaskIds.push(...newExcludes)
    }

    await this.createWork(
      {
        workId: assignedWork.work.id,
        studentId,
        isNewAttempt: true,
      } as CreateOptions,
      rightTaskIds
    )
  }

  public async getOrCreateWork(
    materialSlug: CourseMaterial['slug'],
    studentId: AssignedWork['studentId']
  ): Promise<{ link: string }> {
    const material = await this.materialRepository.findOne(
      {
        slug: materialSlug,
        chapter: { course: { id: TypeORM.Not(TypeORM.IsNull()) } },
      },
      ['work']
    )

    if (!material) {
      throw new NotFoundError('Материал не найден')
    }

    const workId = material.work?.id

    if (!workId) {
      throw new NotFoundError('У этого материала нет работы')
    }

    const assignedWork = await this.assignedWorkRepository.findOne({
      work: { id: workId },
      student: { id: studentId },
    })

    if (assignedWork) {
      switch (assignedWork.solveStatus) {
        case 'in-progress':
          return { link: `/assigned-works/${assignedWork.id}/solve` }
        case 'made-in-deadline':
          return { link: `/assigned-works/${assignedWork.id}/read` }
        case 'made-after-deadline':
          return { link: `/assigned-works/${assignedWork.id}/read` }
        case 'not-started':
        default:
          return { link: `/assigned-works/${assignedWork.id}/solve` }
      }
    }

    const createdWork = await this.createWork({
      studentId,
      workId,
      checkDeadlineAt: material.workCheckDeadline,
      solveDeadlineAt: material.workSolveDeadline,
    } as CreateOptions)

    return { link: `/assigned-works/${createdWork.id}/solve` }
  }

  public async solveWork(
    assignedWorkId: AssignedWork['id'],
    solveOptions: SolveOptions,
    studentId: User['id']
  ) {
    const foundWork = await this.getAssignedWork(assignedWorkId, [
      'work',
      'work.tasks' as any,
      'student',
    ])

    if (!foundWork) {
      throw new NotFoundError()
    }

    if (foundWork.studentId !== studentId) {
      throw new UnauthorizedError('Вы не можете решить чужую работу')
    }

    if (
      foundWork.solveStatus === 'made-in-deadline' ||
      foundWork.solveStatus === 'made-after-deadline'
    ) {
      throw new WorkAlreadySolvedError()
    }

    if (
      foundWork.solveDeadlineAt &&
      Dates.isInPast(foundWork.solveDeadlineAt)
    ) {
      foundWork.solveStatus = 'made-after-deadline'
    } else {
      foundWork.solveStatus = 'made-in-deadline'
    }

    foundWork.solvedAt = Dates.now()
    foundWork.answers = solveOptions.answers
    foundWork.comments = this.taskService.automatedCheck(
      foundWork.work.tasks,
      solveOptions.answers
    )

    if (foundWork.work.tasks.every((task) => task.type !== 'text')) {
      foundWork.checkStatus = 'checked-automatically'
      foundWork.checkedAt = Dates.now()
      foundWork.score = this.getScore(foundWork.comments)
    }

    await this.assignedWorkRepository.update(foundWork)

    await this.calenderService.createWorkMadeEvent(foundWork)
  }

  public async checkWork(
    assignedWorkId: AssignedWork['id'],
    checkOptions: CheckOptions,
    checkerId: User['id']
  ) {
    const foundWork = await this.getAssignedWork(assignedWorkId, [
      'work',
      'mentors',
      'student',
    ])

    if (!foundWork) {
      throw new NotFoundError()
    }

    if (!foundWork.mentors!.some((mentor) => mentor.id === checkerId)) {
      throw new UnauthorizedError(
        'Вы не можете проверить эту работу, так как не являетесь куратором этой работы'
      )
    }

    if (
      [
        'checked-in-deadline',
        'checked-after-deadline',
        'checked-automatically',
      ].includes(foundWork.checkStatus)
    ) {
      throw new WorkAlreadyCheckedError()
    }

    if (['not-started', 'in-progress'].includes(foundWork.solveStatus)) {
      throw new WorkIsNotSolvedYetError()
    }

    if (
      foundWork.checkDeadlineAt &&
      Dates.isInPast(foundWork.checkDeadlineAt)
    ) {
      foundWork.checkStatus = 'checked-after-deadline'
    } else {
      foundWork.checkStatus = 'checked-in-deadline'
    }

    foundWork.answers = checkOptions.answers || []
    foundWork.comments = checkOptions.comments || []
    foundWork.checkedAt = Dates.now()
    foundWork.score = this.getScore(foundWork.comments)

    await this.assignedWorkRepository.update(foundWork)
    await this.calenderService.createWorkCheckedEvent(foundWork)
  }

  public async saveProgress(
    assignedWorkId: AssignedWork['id'],
    saveOptions: SaveOptions,
    role: User['role']
  ) {
    const foundWork = await this.getAssignedWork(assignedWorkId)

    if (!foundWork) {
      throw new NotFoundError()
    }

    if (role == 'student') {
      if (
        foundWork.solveStatus === 'made-in-deadline' ||
        foundWork.solveStatus === 'made-after-deadline'
      ) {
        throw new WorkAlreadySolvedError()
      }

      foundWork.solveStatus = 'in-progress'
    } else if (role == 'mentor') {
      if (
        foundWork.checkStatus === 'checked-in-deadline' ||
        foundWork.checkStatus === 'checked-after-deadline' ||
        foundWork.checkStatus === 'checked-automatically'
      ) {
        throw new WorkAlreadyCheckedError()
      }

      if (
        foundWork.solveStatus === 'not-started' ||
        foundWork.solveStatus === 'in-progress'
      ) {
        throw new WorkIsNotSolvedYetError()
      }

      foundWork.checkStatus = 'in-progress'
    }

    foundWork.answers = saveOptions.answers
    foundWork.comments = saveOptions.comments || []

    await this.assignedWorkRepository.update(foundWork)
  }

  public async archiveWork(id: AssignedWork['id']) {
    const foundWork = await this.getAssignedWork(id)

    if (!foundWork) {
      throw new NotFoundError()
    }

    foundWork.isArchived = true

    await this.assignedWorkRepository.update(foundWork)
  }

  public async unarchiveWork(id: AssignedWork['id']) {
    const foundWork = await this.getAssignedWork(id)

    if (!foundWork) {
      throw new NotFoundError()
    }

    foundWork.isArchived = false

    await this.assignedWorkRepository.update(foundWork)
  }

  public async transferWorkToAnotherMentor(
    workId: AssignedWork['id'],
    mentorId: AssignedWork['mentorIds'][0],
    currentMentorId: User['id']
  ) {
    const foundWork = await this.getAssignedWork(workId)

    if (!foundWork) {
      throw new NotFoundError()
    }

    if (foundWork.mentorIds.includes(mentorId)) {
      throw new WorkAlreadyAssignedToThisMentorError()
    }

    if (foundWork.mentorIds.length >= 2) {
      throw new WorkAlreadyAssignedToEnoughMentorsError()
    }

    const mentor = await this.userRepository.findOne({
      id: currentMentorId,
      role: 'mentor',
    })

    const newMentor = await this.userRepository.findOne({
      id: mentorId,
      role: 'mentor',
    })

    if (!mentor || !newMentor) {
      throw new NotFoundError('Куратор не найден')
    }

    foundWork.mentors = [mentor, newMentor]

    await this.assignedWorkRepository.update(foundWork)
  }

  public async replaceMentor(
    workId: AssignedWork['id'],
    newMentorentorId: User['id']
  ) {
    const assignedWork = await this.assignedWorkRepository.findOne(
      {
        id: workId as any,
      },
      ['work.subject']
    )

    if (!assignedWork) {
      throw new NotFoundError()
    }

    const newMentor = await this.userRepository.findOne({
      id: newMentorentorId,
      role: 'mentor',
    })

    if (!newMentor) {
      throw new NotFoundError('Куратор не найден')
    }

    assignedWork.mentors = [newMentor]

    await this.assignedWorkRepository.update(assignedWork)
  }

  public async shiftDeadline(
    id: AssignedWork['id'],
    role: Exclude<User['role'], 'teacher' | 'admin'>,
    userId: User['id']
  ) {
    const work = await this.getAssignedWork(id, ['mentors'])

    const days: number = AssignedWorkOptions.deadlineShift
    const mentorAlsoDays: number = AssignedWorkOptions.mentorDeadlineAlsoShift

    if (role == 'student') {
      if (work.studentId !== userId) {
        throw new UnauthorizedError()
      }

      if (!work.solveDeadlineAt) {
        throw new SolveDeadlineNotSetError()
      }

      if (work.solveDeadlineShifted) {
        throw new DeadlineAlreadyShiftedError()
      }

      if (
        work.solveStatus === 'made-in-deadline' ||
        work.solveStatus === 'made-after-deadline'
      ) {
        throw new WorkAlreadySolvedError()
      }

      work.solveDeadlineAt = Dates.addDays(work.solveDeadlineAt, days)
      work.solveDeadlineShifted = true

      // also shift mentors deadline
      if (work.checkDeadlineAt) {
        work.checkDeadlineAt = Dates.addDays(
          work.checkDeadlineAt,
          mentorAlsoDays
        )
      }

      await this.calenderService.updateDeadlineFromWork(
        work,
        'student-deadline'
      )
    } else {
      if (!work.mentors!.some((mentor) => mentor.id === userId)) {
        throw new UnauthorizedError()
      }

      if (!work.checkDeadlineAt) {
        throw new CheckDeadlineNotSetError()
      }

      if (work.checkDeadlineShifted) {
        throw new DeadlineAlreadyShiftedError()
      }

      if (
        work.checkStatus === 'checked-in-deadline' ||
        work.checkStatus === 'checked-after-deadline' ||
        work.checkStatus === 'checked-automatically'
      ) {
        throw new WorkAlreadyCheckedError()
      }

      work.checkDeadlineAt = Dates.addDays(work.checkDeadlineAt, days)
      work.checkDeadlineShifted = true

      await this.calenderService.updateDeadlineFromWork(work, 'mentor-deadline')
    }

    await this.assignedWorkRepository.update(work)
  }

  public async deleteWork(id: AssignedWork['id'], mentorId: User['id']) {
    const foundWork = await this.assignedWorkRepository.findOne({ id })

    if (!foundWork) {
      throw new NotFoundError()
    }

    if (!foundWork.mentors!.some((mentor) => mentor.id === mentorId)) {
      throw new UnauthorizedError()
    }

    await this.assignedWorkRepository.delete(id)
  }

  private async getAssignedWork(
    id: AssignedWork['id'],
    relations: (keyof AssignedWork)[] = []
  ) {
    const assignedWork = await this.assignedWorkRepository.findOne(
      { id },
      relations
    )

    if (!assignedWork) {
      throw new NotFoundError('Работа не найдена')
    }

    this.excludeTasks(assignedWork)

    return assignedWork
  }

  private excludeTasks(assignedWork: AssignedWork) {
    const tasksToExclude = assignedWork.excludedTaskIds

    if (tasksToExclude.length && assignedWork?.work?.tasks) {
      assignedWork.work.tasks = assignedWork.work.tasks.filter(
        (task) => !tasksToExclude.includes(task.id)
      )
    }
  }

  private getMaxScore(
    tasks: AssignedWork['work']['tasks'],
    excludedTaskIds: string[] = []
  ) {
    const filteredTasks = tasks.filter(
      (task) => !excludedTaskIds.includes(task.id)
    )

    return filteredTasks.reduce((acc, task) => acc + task.highestScore, 0)
  }

  private getScore(comments: AssignedWorkComment[]) {
    return comments.reduce((acc, comment) => acc + comment.score, 0)
  }
}
